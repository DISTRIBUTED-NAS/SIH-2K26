import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TextInput, TouchableOpacity } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../core/navigation/types';
import { colors, typography, spacing } from '../../core/theme';
import { ScreenWrapper, AppCard, PrimaryButton, SecondaryButton, StepProgressIndicator } from '../../shared/components';
import { 
  getMockMeasurementDefinitions, 
  MeasurementDefinition, 
  MeasurementReading
} from './models/InspectionFormModels';
import { repository } from '../../core/storage/database/InspectionLocalRepository';

type MeasurementsRouteProp = RouteProp<RootStackParamList, 'InspectionMeasurements'>;
type MeasurementsNavProp = NativeStackNavigationProp<RootStackParamList, 'InspectionMeasurements'>;

interface ReadingState {
  id: string;
  value: string;
  note: string;
}

export const InspectionMeasurementsScreen = () => {
  const route = useRoute<MeasurementsRouteProp>();
  const navigation = useNavigation<MeasurementsNavProp>();
  const { inspectionId } = route.params;

  const [definitions, setDefinitions] = useState<MeasurementDefinition[]>([]);
  const [readings, setReadings] = useState<Record<string, ReadingState>>({});
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const defs = getMockMeasurementDefinitions();
    setDefinitions(defs);

    const load = async () => {
      const data = await repository.getInspection(inspectionId);
      if (isMounted && data) {
        const initialReadings: Record<string, ReadingState> = {};
        defs.forEach(def => {
          const existing = data.measurements?.find(m => m.id === def.id);
          initialReadings[def.id] = {
            id: def.id,
            value: existing ? existing.value.toString() : '',
            note: existing?.note || '',
          };
        });
        setReadings(initialReadings);
      }
    };
    
    load();
    return () => { isMounted = false; };
  }, [inspectionId]);

  const handleValueChange = (id: string, text: string) => {
    const sanitized = text.replace(/[^0-9.]/g, '');
    const parts = sanitized.split('.');
    let finalValue = sanitized;
    if (parts.length > 2) {
      finalValue = parts[0] + '.' + parts.slice(1).join('');
    }

    setReadings(prev => ({
      ...prev,
      [id]: { ...prev[id], value: finalValue }
    }));
  };

  const handleNoteChange = (id: string, text: string) => {
    setReadings(prev => ({
      ...prev,
      [id]: { ...prev[id], note: text }
    }));
  };

  const completedCount = definitions.filter(d => {
    const s = readings[d.id];
    return s && s.value.trim() !== '' && !isNaN(parseFloat(s.value));
  }).length;

  const handleContinue = () => {
    setShowErrors(true);

    const finalizedMeasurements: MeasurementReading[] = [];
    let hasError = false;

    for (const def of definitions) {
      const state = readings[def.id];
      const numValue = parseFloat(state.value);
      
      const isInvalid = def.required && (state.value.trim() === '' || isNaN(numValue));
      
      if (isInvalid) {
        hasError = true;
      }

      if (!isNaN(numValue) || state.value.trim() !== '') {
        finalizedMeasurements.push({
          id: def.id,
          label: def.label,
          value: isNaN(numValue) ? 0 : numValue,
          unit: def.unit,
          note: state.note.trim() || undefined,
        });
      }
    }

    if (hasError) {
      Alert.alert(
        'Required Readings Missing', 
        'Please enter valid numeric verification readings for all required verification test points.'
      );
      return;
    }

    repository.saveMeasurements(inspectionId, finalizedMeasurements)
      .then(() => {
        navigation.navigate('InspectionReview', { inspectionId });
      })
      .catch((e) => console.error('Failed to save measurements:', e));
  };

  const renderMeasurementBlock = (def: MeasurementDefinition, index: number) => {
    const state = readings[def.id];
    if (!state) return null;

    const isFilled = state.value.trim() !== '' && !isNaN(parseFloat(state.value));
    const isInvalid = showErrors && def.required && (!state.value.trim() || isNaN(parseFloat(state.value)));

    return (
      <AppCard 
        key={def.id} 
        style={[
          styles.measureCard, 
          isFilled && styles.measureCardCompleted,
          isInvalid && styles.measureCardError
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.indexTag}>
            <Text style={styles.indexTagText}>TP-{index + 1}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.measureLabel}>
              {def.label} {def.required && <Text style={styles.requiredMark}>*</Text>}
            </Text>
            <Text style={styles.measureSubtext}>
              {def.required ? 'Mandatory verification standard test' : 'Supplementary tolerance measurement'}
            </Text>
          </View>
          {isFilled ? (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedBadgeText}>✓ RECORDED</Text>
            </View>
          ) : (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>PENDING</Text>
            </View>
          )}
        </View>

        <View style={styles.inputContainer}>
          <View style={[styles.inputBox, isInvalid && styles.inputBoxError, isFilled && styles.inputBoxSuccess]}>
            <Text style={styles.currencyPrefix}>⚖</Text>
            <TextInput
              style={styles.numericInput}
              value={state.value}
              onChangeText={(text) => handleValueChange(def.id, text)}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.text.secondary}
              accessibilityLabel={`${def.label} input`}
            />
            <View style={styles.unitPill}>
              <Text style={styles.unitPillText}>{def.unit}</Text>
            </View>
          </View>
        </View>

        {isInvalid && (
          <View style={styles.errorNoticeRow}>
            <Text style={styles.errorNoticeIcon}>⚠</Text>
            <Text style={styles.errorNoticeText}>Official verification reading required</Text>
          </View>
        )}

        <View style={styles.noteBox}>
          <TextInput
            style={styles.noteInput}
            value={state.note}
            onChangeText={(text) => handleNoteChange(def.id, text)}
            placeholder="Field observation notes, ambient temperature, calibration state (optional)..."
            placeholderTextColor={colors.text.secondary}
            multiline
          />
        </View>
      </AppCard>
    );
  };

  return (
    <ScreenWrapper>
      <StepProgressIndicator currentStep="MEASUREMENTS" />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Government Verification Protocol Header */}
        <View style={styles.headerSection}>
          <View style={styles.govPill}>
            <Text style={styles.govPillText}>SCHEDULE IX • METROLOGY STANDARDS</Text>
          </View>
          <Text style={styles.screenTitle}>Verification Readings</Text>
          <Text style={styles.screenSubtitle}>
            Execute standard test procedures using certified reference standard weights and record direct instrument readings.
          </Text>
          
          <View style={styles.summaryBar}>
            <View style={styles.summaryBarItem}>
              <Text style={styles.summaryValue}>{definitions.length}</Text>
              <Text style={styles.summaryLabel}>Total Tests</Text>
            </View>
            <View style={styles.summaryBarDivider} />
            <View style={styles.summaryBarItem}>
              <Text style={[styles.summaryValue, { color: colors.status.success }]}>{completedCount}</Text>
              <Text style={styles.summaryLabel}>Recorded</Text>
            </View>
            <View style={styles.summaryBarDivider} />
            <View style={styles.summaryBarItem}>
              <Text style={[styles.summaryValue, { color: definitions.length - completedCount > 0 ? colors.accent : colors.text.secondary }]}>
                {definitions.length - completedCount}
              </Text>
              <Text style={styles.summaryLabel}>Remaining</Text>
            </View>
          </View>
        </View>

        {/* Measurement Cards */}
        {definitions.map(renderMeasurementBlock)}

        {/* Action Buttons */}
        <View style={styles.footer}>
          <SecondaryButton 
            title="← Back to Checklist" 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          />
          <PrimaryButton 
            title="Continue to Final Review →" 
            onPress={handleContinue} 
            style={styles.continueButton}
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl + 20,
  },
  headerSection: {
    marginBottom: spacing.md,
  },
  govPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(15, 58, 102, 0.08)',
    borderColor: 'rgba(15, 58, 102, 0.2)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 6,
  },
  govPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.6,
  },
  screenTitle: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: '700',
  },
  screenSubtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: 4,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  summaryBarItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  summaryBarDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  measureCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  measureCardCompleted: {
    borderColor: 'rgba(46, 125, 50, 0.4)',
    backgroundColor: '#FAFDF9',
  },
  measureCardError: {
    borderColor: colors.status.error,
    backgroundColor: '#FFF8F8',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  indexTag: {
    backgroundColor: colors.primary,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 10,
  },
  indexTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.surface,
  },
  headerInfo: {
    flex: 1,
  },
  measureLabel: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.text.primary,
  },
  requiredMark: {
    color: colors.status.error,
    fontWeight: '700',
  },
  measureSubtext: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
  },
  verifiedBadge: {
    backgroundColor: 'rgba(46, 125, 50, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.status.success,
    letterSpacing: 0.5,
  },
  pendingBadge: {
    backgroundColor: 'rgba(100, 116, 139, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  pendingBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text.secondary,
    letterSpacing: 0.5,
  },
  inputContainer: {
    marginBottom: spacing.sm,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 52,
  },
  inputBoxSuccess: {
    borderColor: colors.status.success,
  },
  inputBoxError: {
    borderColor: colors.status.error,
    backgroundColor: '#FFF0F0',
  },
  currencyPrefix: {
    fontSize: 16,
    color: colors.text.secondary,
    marginRight: 8,
  },
  numericInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    paddingVertical: 0,
  },
  unitPill: {
    backgroundColor: 'rgba(15, 58, 102, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  unitPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  errorNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  errorNoticeIcon: {
    fontSize: 12,
    color: colors.status.error,
    marginRight: 4,
  },
  errorNoticeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.status.error,
  },
  noteBox: {
    marginTop: 4,
  },
  noteInput: {
    ...typography.bodySmall,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: colors.background,
    color: colors.text.primary,
    minHeight: 46,
    textAlignVertical: 'top',
  },
  footer: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  backButton: {
    marginBottom: spacing.sm,
  },
  continueButton: {},
});

