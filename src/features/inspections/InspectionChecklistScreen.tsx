import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../core/navigation/types';
import { colors, typography, spacing } from '../../core/theme';
import { ScreenWrapper, AppCard, PrimaryButton, SecondaryButton, AppTextField } from '../../shared/components';
import { 
  getDefaultChecklist, 
  InspectionChecklistItem, 
  ChecklistStatus
} from './models/InspectionFormModels';
import { repository } from '../../core/storage/database/InspectionLocalRepository';

type ChecklistRouteProp = RouteProp<RootStackParamList, 'InspectionChecklist'>;
type ChecklistNavProp = NativeStackNavigationProp<RootStackParamList, 'InspectionChecklist'>;

export const InspectionChecklistScreen = () => {
  const route = useRoute<ChecklistRouteProp>();
  const navigation = useNavigation<ChecklistNavProp>();
  const { inspectionId } = route.params;

  const [checklist, setChecklist] = useState<InspectionChecklistItem[]>(getDefaultChecklist());
  const [observations, setObservations] = useState('');
  const [remarks, setRemarks] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  
  // Track photoUri, initialized from DB later
  const [photoUri, setPhotoUri] = useState<string | undefined>();

  // Load data from DB on mount
  React.useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const data = await repository.getInspection(inspectionId);
      if (isMounted && data) {
        if (data.checklist && data.checklist.length > 0) setChecklist(data.checklist);
        setObservations(data.observations || '');
        setRemarks(data.remarks || '');
        if (data.photoUri) setPhotoUri(data.photoUri);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [inspectionId]);

  // When returning from Camera, the repository photo might be updated
  // Actually, wait, the camera might set params. Let's still listen to params or reload from DB.
  React.useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const data = await repository.getInspection(inspectionId);
      if (isMounted && data?.photoUri) {
        setPhotoUri(data.photoUri);
      }
    };
    // Re-fetch when focusing screen (if using useFocusEffect) or simply rely on state.
    // For now, let's keep it simple. We'll poll or reload here if needed, but saving onChange covers most.
  }, [inspectionId]);

  const handleStatusChange = async (id: string, status: ChecklistStatus) => {
    const updated = checklist.map((item) => item.id === id ? { ...item, status } : item);
    setChecklist(updated);
    await repository.updateChecklist(inspectionId, updated);
  };

  const handleObservationsChange = async (text: string) => {
    setObservations(text);
    await repository.updateObservations(inspectionId, text, remarks);
  };

  const handleRemarksChange = async (text: string) => {
    setRemarks(text);
    await repository.updateObservations(inspectionId, observations, text);
  };

  const handleContinue = async () => {
    const hasUnchecked = checklist.some(item => item.status === 'NOT_CHECKED');
    if (hasUnchecked || !photoUri) {
      setShowErrors(true);
      if (!photoUri) {
        Alert.alert('Incomplete', 'Please capture an inspection photo before proceeding.');
      } else {
        Alert.alert('Incomplete', 'Please verify all checklist items before proceeding.');
      }
      return;
    }

    // Ensure final save
    await repository.updateChecklist(inspectionId, checklist);
    await repository.updateObservations(inspectionId, observations, remarks);

    navigation.navigate('InspectionMeasurements', { inspectionId });
  };

  const renderChecklistToggle = (item: InspectionChecklistItem) => {
    const isError = showErrors && item.status === 'NOT_CHECKED';

    return (
      <View key={item.id} style={styles.checklistItem}>
        <Text style={[styles.checklistLabel, isError && styles.errorText]}>{item.label}</Text>
        
        <View style={styles.toggleRow}>
          <TouchableOpacity 
            style={[styles.toggleButton, item.status === 'PASS' && styles.passActive]}
            onPress={() => handleStatusChange(item.id, 'PASS')}
            accessibilityLabel={`${item.label} Pass`}
          >
            <Text style={[styles.toggleText, item.status === 'PASS' && styles.activeText]}>Pass</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.toggleButton, item.status === 'FAIL' && styles.failActive]}
            onPress={() => handleStatusChange(item.id, 'FAIL')}
            accessibilityLabel={`${item.label} Fail`}
          >
            <Text style={[styles.toggleText, item.status === 'FAIL' && styles.activeText]}>Fail</Text>
          </TouchableOpacity>
        </View>
        {isError && <Text style={styles.errorHint}>This item is required</Text>}
      </View>
    );
  };

  return (
    <ScreenWrapper>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Inspection Checklist</Text>
        <Text style={styles.subtitle}>Application: {inspectionId}</Text>
        
        <AppCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Verification Items</Text>
          {checklist.map(renderChecklistToggle)}
        </AppCard>

        <AppCard style={[styles.sectionCard, showErrors && !photoUri && styles.errorCard]}>
          <Text style={styles.sectionTitle}>Photo Evidence</Text>
          {photoUri ? (
            <View>
              <Text style={styles.successText}>✓ Inspection photo captured</Text>
              <View style={styles.photoActions}>
                <SecondaryButton 
                  title="Retake Photo" 
                  onPress={() => navigation.navigate('Camera', { inspectionId })} 
                />
              </View>
            </View>
          ) : (
            <View>
              <Text style={styles.checklistLabel}>A clear photograph of the instrument is required.</Text>
              <PrimaryButton 
                title="Capture Photo" 
                onPress={() => navigation.navigate('Camera', { inspectionId })} 
              />
              {showErrors && <Text style={styles.errorHint}>Photo evidence is required</Text>}
            </View>
          )}
        </AppCard>

        <AppCard style={styles.sectionCard}>
          <AppTextField
            label="Officer Observations"
            placeholder="Enter observations..."
            value={observations}
            onChangeText={handleObservationsChange}
            multiline
            numberOfLines={4}
          />
        </AppCard>

        <AppCard style={styles.sectionCard}>
          <AppTextField
            label="Additional Remarks (Optional)"
            placeholder="Enter remarks..."
            value={remarks}
            onChangeText={handleRemarksChange}
            multiline
            numberOfLines={3}
          />
        </AppCard>

        <View style={styles.footer}>
          <PrimaryButton title="Continue to Measurements" onPress={handleContinue} />
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
  sectionCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.xs,
  },
  checklistItem: {
    marginBottom: spacing.lg,
  },
  checklistLabel: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  passActive: {
    backgroundColor: colors.status.success,
    borderColor: colors.status.success,
  },
  failActive: {
    backgroundColor: colors.status.error,
    borderColor: colors.status.error,
  },
  toggleText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  activeText: {
    color: colors.text.inverse,
  },
  errorText: {
    color: colors.status.error,
  },
  errorHint: {
    ...typography.bodySmall,
    color: colors.status.error,
    marginTop: spacing.xs,
  },
  footer: {
    marginTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  photoActions: {
    marginTop: spacing.md,
  },
  successText: {
    ...typography.bodyLarge,
    color: colors.status.success,
    fontWeight: '600',
  },
  errorCard: {
    borderColor: colors.status.error,
    borderWidth: 1,
  },
});
