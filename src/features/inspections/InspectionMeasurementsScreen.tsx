import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TextInput } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../core/navigation/types';
import { colors, typography, spacing } from '../../core/theme';
import { ScreenWrapper, AppCard, PrimaryButton, SecondaryButton } from '../../shared/components';
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
  value: string; // Keep as string for TextInput, parse on save
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
    // Only allow numbers and one decimal point
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
          value: isNaN(numValue) ? 0 : numValue, // Fallback if invalid but not required, though UI limits to numbers
          unit: def.unit,
          note: state.note.trim() || undefined,
        });
      }
    }

    if (hasError) {
      Alert.alert('Incomplete', 'Please enter valid numbers for all required measurements.');
      return;
    }

    // Save directly to the repository instead of passing via formData
    repository.saveMeasurements(inspectionId, finalizedMeasurements)
      .then(() => {
        navigation.navigate('InspectionReview', { inspectionId });
      })
      .catch((e) => console.error('Failed to save measurements:', e));
  };

  const renderMeasurementBlock = (def: MeasurementDefinition) => {
    const state = readings[def.id];
    if (!state) return null;

    const isInvalid = showErrors && def.required && (state.value.trim() === '' || isNaN(parseFloat(state.value)));

    return (
      <AppCard key={def.id} style={[styles.card, isInvalid && styles.errorCard]}>
        <View style={styles.headerRow}>
          <Text style={styles.label}>
            {def.label} {def.required && <Text style={styles.requiredAsterisk}>*</Text>}
          </Text>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={[styles.numericInput, isInvalid && styles.errorInput]}
            value={state.value}
            onChangeText={(text) => handleValueChange(def.id, text)}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={colors.text.secondary}
            accessibilityLabel={`${def.label} input`}
          />
          <Text style={styles.unitText}>{def.unit}</Text>
        </View>

        {isInvalid && <Text style={styles.errorHint}>Valid numeric reading is required</Text>}

        <TextInput
          style={styles.noteInput}
          value={state.note}
          onChangeText={(text) => handleNoteChange(def.id, text)}
          placeholder="Optional note about this reading..."
          placeholderTextColor={colors.text.secondary}
          multiline
        />
      </AppCard>
    );
  };

  return (
    <ScreenWrapper>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Measurement Readings</Text>
        <Text style={styles.subtitle}>Enter the exact readings as displayed on the instrument.</Text>

        {definitions.map(renderMeasurementBlock)}

        <View style={styles.footer}>
          <SecondaryButton title="Go Back" onPress={() => navigation.goBack()} />
          <View style={{ height: spacing.md }} />
          <PrimaryButton title="Continue to Review" onPress={handleContinue} />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  card: {
    marginBottom: spacing.lg,
  },
  errorCard: {
    borderColor: colors.status.error,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.h3,
    color: colors.text.primary,
  },
  requiredAsterisk: {
    color: colors.status.error,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  numericInput: {
    ...typography.h2,
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    backgroundColor: colors.background,
    color: colors.text.primary,
  },
  errorInput: {
    borderColor: colors.status.error,
    backgroundColor: '#fff0f0',
  },
  unitText: {
    ...typography.h2,
    color: colors.text.secondary,
    marginLeft: spacing.md,
    minWidth: 40,
  },
  errorHint: {
    ...typography.bodySmall,
    color: colors.status.error,
    marginBottom: spacing.sm,
  },
  noteInput: {
    ...typography.bodyMedium,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    backgroundColor: colors.background,
    color: colors.text.primary,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  footer: {
    marginTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
});
