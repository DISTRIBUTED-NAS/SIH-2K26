import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../core/navigation/types';
import { colors, typography, spacing } from '../../core/theme';
import { 
  ScreenWrapper, 
  AppCard, 
  PrimaryButton, 
  SecondaryButton, 
  AppTextField,
  StepProgressIndicator 
} from '../../shared/components';
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
  const [photoUri, setPhotoUri] = useState<string | undefined>();

  useEffect(() => {
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
        Alert.alert('Evidence Required', 'Please capture official photo evidence of the weighing instrument before proceeding.');
      } else {
        Alert.alert('Verification Incomplete', 'Please assess all statutory checklist items (Pass or Fail) before proceeding.');
      }
      return;
    }

    await repository.updateChecklist(inspectionId, checklist);
    await repository.updateObservations(inspectionId, observations, remarks);

    navigation.navigate('InspectionMeasurements', { inspectionId });
  };

  const passedCount = checklist.filter(c => c.status === 'PASS').length;
  const totalCount = checklist.length;

  const renderChecklistToggle = (item: InspectionChecklistItem) => {
    const isError = showErrors && item.status === 'NOT_CHECKED';

    return (
      <View key={item.id} style={[styles.checklistItem, isError && styles.checklistItemError]}>
        <View style={styles.itemHeader}>
          <Text style={styles.checklistLabel}>{item.label}</Text>
          {item.status === 'PASS' && (
            <View style={styles.statusPillPass}>
              <Text style={styles.statusPillTextPass}>VERIFIED</Text>
            </View>
          )}
          {item.status === 'FAIL' && (
            <View style={styles.statusPillFail}>
              <Text style={styles.statusPillTextFail}>NON-COMPLIANT</Text>
            </View>
          )}
        </View>
        
        <View style={styles.toggleRow}>
          <TouchableOpacity 
            style={[
              styles.toggleButton, 
              item.status === 'PASS' && styles.passActive
            ]}
            onPress={() => handleStatusChange(item.id, 'PASS')}
            activeOpacity={0.75}
          >
            <Text style={[styles.toggleIcon, item.status === 'PASS' && styles.activeIcon]}>✓</Text>
            <Text style={[styles.toggleText, item.status === 'PASS' && styles.activeText]}>Pass / Compliant</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.toggleButton, 
              item.status === 'FAIL' && styles.failActive
            ]}
            onPress={() => handleStatusChange(item.id, 'FAIL')}
            activeOpacity={0.75}
          >
            <Text style={[styles.toggleIcon, item.status === 'FAIL' && styles.activeIcon]}>✕</Text>
            <Text style={[styles.toggleText, item.status === 'FAIL' && styles.activeText]}>Defect / Fail</Text>
          </TouchableOpacity>
        </View>

        {isError && (
          <Text style={styles.errorHint}>⚠ Assessment required under Legal Metrology Rules</Text>
        )}
      </View>
    );
  };

  return (
    <ScreenWrapper>
      <View style={styles.outerContainer}>
        {/* Step Progress */}
        <StepProgressIndicator currentStep="CHECKLIST" />

        <ScrollView 
          style={styles.container} 
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Section Summary Banner */}
          <View style={styles.summaryBanner}>
            <View style={styles.summaryTextGroup}>
              <Text style={styles.summaryTitle}>Statutory Verification Checklist</Text>
              <Text style={styles.summarySub}>Application #{inspectionId}</Text>
            </View>
            <View style={styles.counterBadge}>
              <Text style={styles.counterBadgeText}>{passedCount}/{totalCount} PASS</Text>
            </View>
          </View>
          
          {/* Checklist Card */}
          <AppCard style={styles.sectionCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.sectionTitle}>PHYSICAL & LEGAL PARAMETERS</Text>
              <Text style={styles.sectionBadge}>Mandatory</Text>
            </View>
            {checklist.map(renderChecklistToggle)}
          </AppCard>

          {/* Photo Evidence Card */}
          <AppCard style={[styles.sectionCard, showErrors && !photoUri && styles.errorCard]}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.sectionTitle}>PHOTO EVIDENCE COLLECTION</Text>
              <Text style={styles.sectionBadge}>Photo Tag</Text>
            </View>
            {photoUri ? (
              <View style={styles.photoContainer}>
                <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                <View style={styles.photoDetails}>
                  <View style={styles.photoVerifiedBadge}>
                    <Text style={styles.photoVerifiedText}>✓ Photo Captured & Stored</Text>
                  </View>
                  <SecondaryButton 
                    title="Retake Inspection Photo" 
                    onPress={() => navigation.navigate('Camera', { inspectionId })} 
                    style={styles.retakeBtn}
                  />
                </View>
              </View>
            ) : (
              <View style={styles.noPhotoContainer}>
                <Text style={styles.noPhotoDesc}>
                  Capture high-resolution photographic evidence of the weighing instrument scale, stamping plate, and serial stamp.
                </Text>
                <PrimaryButton 
                  title="📷  Launch Field Camera" 
                  onPress={() => navigation.navigate('Camera', { inspectionId })} 
                />
                {showErrors && <Text style={styles.errorHint}>⚠ Photographic evidence is legally mandatory</Text>}
              </View>
            )}
          </AppCard>

          {/* Observations & Remarks */}
          <AppCard style={styles.sectionCard}>
            <AppTextField
              label="Official Field Observations"
              placeholder="Record instrument condition, seal status, leveling..."
              value={observations}
              onChangeText={handleObservationsChange}
              multiline
              numberOfLines={3}
            />
          </AppCard>

          <AppCard style={styles.sectionCard}>
            <AppTextField
              label="Additional Remarks (Optional)"
              placeholder="Any special remarks or compliance notes for the trader..."
              value={remarks}
              onChangeText={handleRemarksChange}
              multiline
              numberOfLines={2}
            />
          </AppCard>
        </ScrollView>

        {/* Sticky Action Footer */}
        <View style={styles.stickyFooter}>
          <PrimaryButton 
            title="Proceed to Measurement Readings →" 
            onPress={handleContinue} 
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 24,
  },
  summaryBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryTextGroup: {
    flex: 1,
  },
  summaryTitle: {
    ...typography.h2,
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 2,
  },
  summarySub: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  counterBadge: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C7D9ED',
  },
  counterBadgeText: {
    ...typography.badge,
    color: colors.primary,
    fontWeight: '800',
  },
  sectionCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingBottom: 8,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  sectionBadge: {
    ...typography.badge,
    fontSize: 9,
    color: colors.secondary,
    backgroundColor: colors.secondaryLight,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  checklistItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  checklistItemError: {
    backgroundColor: '#FFF8F8',
    padding: 8,
    borderRadius: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  checklistLabel: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  statusPillPass: {
    backgroundColor: colors.status.successBg,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.status.successBorder,
  },
  statusPillTextPass: {
    ...typography.badge,
    fontSize: 9,
    color: colors.status.success,
  },
  statusPillFail: {
    backgroundColor: colors.status.errorBg,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.status.errorBorder,
  },
  statusPillTextFail: {
    ...typography.badge,
    fontSize: 9,
    color: colors.status.error,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  passActive: {
    backgroundColor: colors.status.successBg,
    borderColor: colors.status.success,
  },
  failActive: {
    backgroundColor: colors.status.errorBg,
    borderColor: colors.status.error,
  },
  toggleIcon: {
    fontSize: 13,
    fontWeight: '800',
    marginRight: 6,
    color: colors.text.muted,
  },
  activeIcon: {
    color: colors.text.primary,
  },
  toggleText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: '700',
  },
  activeText: {
    color: colors.text.primary,
    fontWeight: '800',
  },
  errorHint: {
    ...typography.bodySmall,
    fontSize: 11,
    color: colors.status.error,
    marginTop: 6,
    fontWeight: '600',
  },
  errorCard: {
    borderColor: colors.status.error,
    borderWidth: 1.5,
  },
  photoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoPreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 12,
  },
  photoDetails: {
    flex: 1,
  },
  photoVerifiedBadge: {
    backgroundColor: colors.status.successBg,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  photoVerifiedText: {
    ...typography.bodySmall,
    fontSize: 11,
    color: colors.status.success,
    fontWeight: '700',
  },
  retakeBtn: {
    minHeight: 38,
    paddingVertical: 6,
  },
  noPhotoContainer: {
    gap: 12,
  },
  noPhotoDesc: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  stickyFooter: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
