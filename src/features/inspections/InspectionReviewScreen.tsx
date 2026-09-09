import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, Image,
  TouchableOpacity, TextInput, ActivityIndicator,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../core/navigation/types';
import { colors, typography, spacing } from '../../core/theme';
import { ScreenWrapper, AppCard, PrimaryButton, SecondaryButton } from '../../shared/components';
import { inspectionService } from './services/inspectionService';
import { repository } from '../../core/storage/database/InspectionLocalRepository';
import { aiVerificationService } from './services/AiVerificationService';
import { inspectionSubmissionService } from './services/InspectionSubmissionService';
import { useNetworkStatus } from '../../core/network/useNetworkStatus';
import { InspectionSummary } from './models/InspectionModels';
import { InspectionFormData } from './models/InspectionFormModels';
import { AIVerificationResult } from './models/AIVerificationModels';
import { OfficerDecision, InspectionDecisionRecord, InspectionSubmissionPayload } from './models/OfficerDecisionModels';
import { AppError } from '../../core/errors/AppError';

type ReviewRouteProp = RouteProp<RootStackParamList, 'InspectionReview'>;
type ReviewNavProp = NativeStackNavigationProp<RootStackParamList>;

type ViewMode = 'REVIEW' | 'CONFIRM';

const DECISION_OPTIONS: { value: OfficerDecision; label: string; color: string }[] = [
  { value: 'VERIFIED', label: '✓  Verified', color: '#1a7a4a' },
  { value: 'REJECTED', label: '✕  Rejected', color: '#c0392b' },
  { value: 'NEEDS_FOLLOW_UP', label: '⚠  Needs Follow-up', color: '#c47f17' },
];

export const InspectionReviewScreen = () => {
  const route = useRoute<ReviewRouteProp>();
  const navigation = useNavigation<ReviewNavProp>();
  const { inspectionId } = route.params;

  const [inspection, setInspection] = useState<InspectionSummary | null>(null);
  const [formData, setFormData] = useState<InspectionFormData | null>(null);
  const [aiResult, setAiResult] = useState<AIVerificationResult | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isOffline } = useNetworkStatus();

  // Phase 10: decision state
  const [selectedDecision, setSelectedDecision] = useState<OfficerDecision | undefined>(undefined);
  const [decisionRemarks, setDecisionRemarks] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('REVIEW');
  const [isAlreadyCompleted, setIsAlreadyCompleted] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await inspectionService.getInspectionById(inspectionId);
      setInspection(data);

      const localData = await repository.getInspection(inspectionId);
      setFormData(localData);

      if (localData?.aiResult) {
        setAiResult(localData.aiResult);
      }

      if (localData?.decision) {
        setSelectedDecision(localData.decision);
        setDecisionRemarks(localData.decisionRemarks ?? '');
        setIsAlreadyCompleted(true);
      }
    } catch (err: unknown) {
      if (err instanceof AppError) {
        setError(err.userMessage);
      } else {
        setError('An unexpected error occurred while loading inspection details.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [inspectionId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── AI comparison ─────────────────────────────────────────────────────────
  const handleRunAiComparison = async () => {
    if (isOffline) {
      Alert.alert('Offline', 'AI comparison requires network connectivity. You can continue the inspection without it.');
      return;
    }
    if (!formData?.photoUri) {
      Alert.alert('Missing Image', 'Capture the officer inspection photo before running AI comparison.');
      return;
    }
    const refPhoto = formData.referencePhotoUri || 'dummy-reference-uri';
    setIsVerifying(true);
    try {
      const result = await aiVerificationService.verifyImages(refPhoto, formData.photoUri, inspectionId);
      setAiResult(result);
      await repository.saveAiVerificationResult(result);
    } catch (err) {
      Alert.alert('Error', 'AI comparison could not be completed. You can continue the inspection.');
    } finally {
      setIsVerifying(false);
    }
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = (): string | null => {
    if (!formData) return 'Inspection data could not be loaded.';
    if (!formData.photoUri) return 'Officer evidence photo is required before completing.';
    if (!formData.checklist || formData.checklist.length === 0) return 'Checklist must be completed.';
    if (!formData.measurements || formData.measurements.length === 0) return 'Measurement readings are required.';
    if (!selectedDecision) return 'Please select a Final Inspection Decision before continuing.';
    return null;
  };

  const handleProceedToConfirm = () => {
    const validationError = validate();
    if (validationError) {
      Alert.alert('Incomplete Inspection', validationError);
      return;
    }
    setViewMode('CONFIRM');
  };

  // ── Final completion ──────────────────────────────────────────────────────
  const handleConfirmAndComplete = async () => {
    if (!formData || !inspection || !selectedDecision) return;
    setIsSaving(true);
    try {
      const now = new Date().toISOString();

      const decisionRecord: InspectionDecisionRecord = {
        inspectionId,
        decision: selectedDecision,
        decisionRemarks: decisionRemarks.trim() || undefined,
        completedAt: now,
      };

      const payload: InspectionSubmissionPayload = {
        inspectionId,
        applicationId: inspection.applicationId,
        officerId: inspection.assignedOfficerId ?? '',
        scheduledDate: inspection.scheduledDate,
        scheduledTime: inspection.scheduledTime,
        assignedOfficerId: inspection.assignedOfficerId,
        businessName: inspection.businessName,
        instrumentName: inspection.instrumentName,
        instrumentModel: inspection.instrumentModel,
        location: inspection.location,
        checklist: formData.checklist,
        measurements: formData.measurements ?? [],
        observations: formData.observations,
        remarks: formData.remarks,
        officerPhotoUri: formData.photoUri,
        referencePhotoUri: formData.referencePhotoUri,
        aiVerificationResult: aiResult
          ? {
              status: aiResult.status,
              confidence: aiResult.confidence,
              findings: aiResult.findings,
              processingStatus: aiResult.processingStatus,
            }
          : undefined,
        decision: selectedDecision,
        decisionRemarks: decisionRemarks.trim() || undefined,
        completedAt: now,
        localUpdatedAt: now,
        clientId: `${inspectionId}-${now}`,
      };

      await repository.saveDecision(decisionRecord, payload);

      // Attempt backend submission (will return BACKEND_NOT_CONFIGURED right now)
      await inspectionSubmissionService.submitInspection(payload, isOffline);

      setIsAlreadyCompleted(true);
      setFormData(prev => prev ? { ...prev, decision: selectedDecision, decisionRemarks: decisionRemarks.trim() || undefined, completedAt: now, localSyncStatus: 'PENDING' } : prev);
      setViewMode('REVIEW');

      Alert.alert(
        'Inspection Saved Locally',
        'The inspection has been completed and saved to your device.\n\nStatus: Pending synchronisation — the inspection will be submitted when backend connectivity is available.',
        [{ text: 'Return to Dashboard', onPress: () => navigation.navigate('AppShell') }]
      );
    } catch (e) {
      Alert.alert('Error', 'Failed to save the final decision. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Render helpers ─────────────────────────────────────────────────────────
  const renderChecklistSummary = () => {
    if (!formData?.checklist) return null;
    const passed = formData.checklist.filter(i => i.status === 'PASS');
    const failed = formData.checklist.filter(i => i.status === 'FAIL');
    const unchecked = formData.checklist.filter(i => i.status === 'NOT_CHECKED');

    return (
      <View>
        {passed.length > 0 && (
          <View style={styles.summaryGroup}>
            <Text style={styles.groupHeader}>Passed / Verified:</Text>
            {passed.map(item => (
              <Text key={item.id} style={styles.checkItemText}>✓ {item.label}</Text>
            ))}
          </View>
        )}
        {failed.length > 0 && (
          <View style={styles.summaryGroup}>
            <Text style={styles.groupHeader}>Failed / Not Verified:</Text>
            {failed.map(item => (
              <Text key={item.id} style={[styles.checkItemText, styles.failedText]}>✕ {item.label}</Text>
            ))}
          </View>
        )}
        {unchecked.length > 0 && (
          <View style={styles.summaryGroup}>
            <Text style={[styles.groupHeader, styles.warningText]}>Not Checked ({unchecked.length}):</Text>
            {unchecked.map(item => (
              <Text key={item.id} style={[styles.checkItemText, styles.warningText]}>— {item.label}</Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderMeasurementsSummary = () => {
    if (!formData?.measurements?.length) {
      return <Text style={styles.textBlock}>No measurements recorded.</Text>;
    }
    return formData.measurements.map(m => (
      <View key={m.id} style={styles.measurementRow}>
        <View style={styles.measurementHeader}>
          <Text style={styles.measurementLabel}>{m.label}</Text>
          <Text style={styles.measurementValue}>{m.value} {m.unit}</Text>
        </View>
        {m.note ? <Text style={styles.measurementNote}>{m.note}</Text> : null}
      </View>
    ));
  };

  const renderAISection = () => {
    if (!formData) return null;
    return (
      <AppCard style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>AI Photo Verification</Text>
        <Text style={styles.disclaimerText}>
          AI comparison is an assistive tool. Final inspection decisions remain with the Legal Metrology Officer.
        </Text>
        <View style={styles.photoComparisonContainer}>
          <View style={styles.photoBox}>
            <Text style={styles.photoLabel}>Reference Image</Text>
            {formData.referencePhotoUri ? (
              <Image source={{ uri: formData.referencePhotoUri }} style={styles.compareImage} />
            ) : (
              <View style={styles.placeholderBox}>
                <Text style={styles.placeholderText}>Customer reference image unavailable</Text>
              </View>
            )}
          </View>
          <View style={{ width: spacing.md }} />
          <View style={styles.photoBox}>
            <Text style={styles.photoLabel}>Officer Image</Text>
            {formData.photoUri ? (
              <Image source={{ uri: formData.photoUri }} style={styles.compareImage} />
            ) : (
              <View style={styles.placeholderBox}>
                <Text style={styles.placeholderText}>No photo captured</Text>
              </View>
            )}
          </View>
        </View>

        {aiResult ? (
          <View style={styles.aiResultContainer}>
            <View style={styles.row}>
              <Text style={styles.label}>AI Status:</Text>
              <Text style={styles.value}>{aiResult.status}</Text>
            </View>
            {aiResult.confidence !== undefined && (
              <View style={styles.row}>
                <Text style={styles.label}>Confidence:</Text>
                <Text style={styles.value}>{aiResult.confidence}%</Text>
              </View>
            )}
            <View style={styles.row}>
              <Text style={styles.label}>Findings:</Text>
              <Text style={styles.value}>{aiResult.findings ?? 'None'}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.aiActionContainer}>
            <PrimaryButton
              title={isVerifying ? 'Comparing…' : 'Run AI Comparison'}
              onPress={handleRunAiComparison}
              disabled={isVerifying}
            />
          </View>
        )}
      </AppCard>
    );
  };

  const renderDecisionSection = () => {
    if (isAlreadyCompleted && formData?.decision) {
      // Read-only view for already-completed inspections
      const opted = DECISION_OPTIONS.find(d => d.value === formData.decision);
      return (
        <AppCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Final Decision</Text>
          <View style={[styles.decisionBadge, { backgroundColor: opted?.color ?? colors.primary }]}>
            <Text style={styles.decisionBadgeText}>{opted?.label ?? formData.decision}</Text>
          </View>
          {formData.decisionRemarks ? (
            <Text style={[styles.textBlock, { marginTop: spacing.sm }]}>{formData.decisionRemarks}</Text>
          ) : null}
          <View style={[styles.row, { marginTop: spacing.sm }]}>
            <Text style={styles.label}>Completed:</Text>
            <Text style={styles.value}>{formData.completedAt ?? '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Sync status:</Text>
            <Text style={styles.value}>⏳ Pending synchronisation</Text>
          </View>
        </AppCard>
      );
    }

    return (
      <AppCard style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Final Inspection Decision</Text>
        <Text style={styles.disclaimerText}>
          Select the outcome based on all findings. This decision is yours as the Legal Metrology Officer.
        </Text>

        {DECISION_OPTIONS.map(opt => {
          const isSelected = selectedDecision === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.decisionOption,
                isSelected && { borderColor: opt.color, backgroundColor: opt.color + '18' },
              ]}
              onPress={() => setSelectedDecision(opt.value)}
              activeOpacity={0.75}
            >
              <View style={[styles.decisionRadio, isSelected && { backgroundColor: opt.color, borderColor: opt.color }]}>
                {isSelected && <View style={styles.decisionRadioInner} />}
              </View>
              <Text style={[styles.decisionOptionText, isSelected && { color: opt.color, fontWeight: '700' }]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        <Text style={[styles.label, { marginTop: spacing.md, marginBottom: spacing.xs }]}>
          Decision Remarks (optional)
        </Text>
        <TextInput
          style={styles.remarksInput}
          multiline
          numberOfLines={3}
          placeholder="Add any final notes or context for this decision…"
          placeholderTextColor={colors.text.secondary}
          value={decisionRemarks}
          onChangeText={setDecisionRemarks}
        />
      </AppCard>
    );
  };

  // ── CONFIRM VIEW ──────────────────────────────────────────────────────────
  if (viewMode === 'CONFIRM') {
    const opted = DECISION_OPTIONS.find(d => d.value === selectedDecision);
    return (
      <ScreenWrapper>
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <Text style={styles.title}>Confirm Inspection Decision</Text>
          <Text style={styles.subtitle}>
            Please verify all information is correct before completing this inspection. This action cannot be undone without resetting the sync queue.
          </Text>

          <AppCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Selected Decision</Text>
            <View style={[styles.decisionBadge, { backgroundColor: opted?.color ?? colors.primary }]}>
              <Text style={styles.decisionBadgeText}>{opted?.label ?? selectedDecision}</Text>
            </View>
            {decisionRemarks.trim() ? (
              <Text style={[styles.textBlock, { marginTop: spacing.sm }]}>{decisionRemarks}</Text>
            ) : null}
          </AppCard>

          {inspection && (
            <AppCard style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Assignment</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Application:</Text>
                <Text style={styles.value}>{inspection.applicationId}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Business:</Text>
                <Text style={styles.value}>{inspection.businessName ?? 'N/A'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Instrument:</Text>
                <Text style={styles.value}>{inspection.instrumentName}</Text>
              </View>
            </AppCard>
          )}

          <AppCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Checklist Summary</Text>
            {renderChecklistSummary()}
          </AppCard>

          <AppCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Measurements</Text>
            {renderMeasurementsSummary()}
          </AppCard>

          {aiResult && (
            <AppCard style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>AI Verification Result</Text>
              <Text style={styles.disclaimerText}>Advisory only — not a legal determination.</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Status:</Text>
                <Text style={styles.value}>{aiResult.status}</Text>
              </View>
              {aiResult.findings ? (
                <View style={styles.row}>
                  <Text style={styles.label}>Findings:</Text>
                  <Text style={styles.value}>{aiResult.findings}</Text>
                </View>
              ) : null}
            </AppCard>
          )}

          <View style={styles.footer}>
            <SecondaryButton title="Back & Edit" onPress={() => setViewMode('REVIEW')} />
            <View style={{ height: spacing.md }} />
            {isSaving ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              <PrimaryButton title="Confirm & Complete Inspection" onPress={handleConfirmAndComplete} />
            )}
          </View>
        </ScrollView>
      </ScreenWrapper>
    );
  }

  // ── REVIEW VIEW ───────────────────────────────────────────────────────────
  if (error && !inspection) {
    return (
      <ScreenWrapper hasError={true} errorMessage={error}>
        <View style={styles.centerContainer}>
          <PrimaryButton title="Retry" onPress={loadData} />
          <SecondaryButton title="Go Back" onPress={() => navigation.goBack()} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper isLoading={isLoading}>
      {inspection && formData && (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <Text style={styles.title}>Review Inspection</Text>
          <Text style={styles.subtitle}>Review all findings then record your decision.</Text>

          {/* Assignment */}
          <AppCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Assignment</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Application ID:</Text>
              <Text style={styles.value}>{inspection.applicationId}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Business:</Text>
              <Text style={styles.value}>{inspection.businessName ?? 'N/A'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Instrument:</Text>
              <Text style={styles.value}>{inspection.instrumentName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Scheduled:</Text>
              <Text style={styles.value}>{inspection.scheduledDate} {inspection.scheduledTime}</Text>
            </View>
          </AppCard>

          {/* Checklist */}
          <AppCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Checklist Findings</Text>
            {renderChecklistSummary()}
          </AppCard>

          {/* Photo evidence */}
          {formData.photoUri && (
            <AppCard style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Photo Evidence</Text>
              <Image source={{ uri: formData.photoUri }} style={styles.previewImage} />
            </AppCard>
          )}

          {/* Measurements */}
          <AppCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Measurement Readings</Text>
            {renderMeasurementsSummary()}
          </AppCard>

          {/* AI */}
          {renderAISection()}

          {/* Observations */}
          <AppCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Observations</Text>
            <Text style={styles.textBlock}>{formData.observations || 'None'}</Text>
          </AppCard>

          {/* Remarks */}
          <AppCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Remarks</Text>
            <Text style={styles.textBlock}>{formData.remarks || 'None'}</Text>
          </AppCard>

          {/* Final decision */}
          {renderDecisionSection()}

          {/* Footer */}
          <View style={styles.footer}>
            <SecondaryButton title="Back & Edit" onPress={() => navigation.goBack()} />
            <View style={{ height: spacing.md }} />
            {!isAlreadyCompleted && (
              <PrimaryButton title="Proceed to Confirmation →" onPress={handleProceedToConfirm} />
            )}
          </View>
        </ScrollView>
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg },
  centerContainer: { padding: spacing.xl, gap: spacing.md },
  title: { ...typography.h1, color: colors.primary, marginBottom: spacing.xs },
  subtitle: { ...typography.bodyMedium, color: colors.text.secondary, marginBottom: spacing.xl },
  sectionCard: { marginBottom: spacing.md },
  sectionTitle: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.xs,
  },
  row: { flexDirection: 'row', marginBottom: spacing.xs },
  label: { ...typography.bodyMedium, color: colors.text.secondary, width: 110 },
  value: { ...typography.bodyMedium, color: colors.text.primary, flex: 1, fontWeight: '500' },
  summaryGroup: { marginBottom: spacing.md },
  groupHeader: { ...typography.bodyMedium, color: colors.text.secondary, fontWeight: 'bold', marginBottom: spacing.xs },
  checkItemText: { ...typography.bodyLarge, color: colors.text.primary, marginBottom: spacing.xs },
  failedText: { color: colors.status.error },
  warningText: { color: '#c47f17' },
  textBlock: { ...typography.bodyMedium, color: colors.text.primary },
  previewImage: {
    width: '100%', height: 200, resizeMode: 'contain',
    borderRadius: 8, marginTop: spacing.sm, backgroundColor: '#f0f0f0',
  },
  photoComparisonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  photoBox: { flex: 1 },
  photoLabel: { ...typography.bodyMedium, color: colors.text.secondary, marginBottom: spacing.xs, textAlign: 'center' },
  compareImage: { width: '100%', height: 120, resizeMode: 'cover', borderRadius: 8, backgroundColor: '#f0f0f0' },
  placeholderBox: {
    width: '100%', height: 120, borderRadius: 8, backgroundColor: '#f0f0f0',
    justifyContent: 'center', alignItems: 'center', padding: spacing.xs,
  },
  placeholderText: { ...typography.bodySmall, color: colors.text.secondary, textAlign: 'center' },
  disclaimerText: { ...typography.bodySmall, color: colors.text.secondary, fontStyle: 'italic', marginBottom: spacing.sm },
  aiActionContainer: { marginTop: spacing.lg },
  aiResultContainer: {
    marginTop: spacing.lg, padding: spacing.md,
    backgroundColor: colors.background, borderRadius: 8, borderWidth: 1, borderColor: colors.border,
  },
  measurementRow: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  measurementHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  measurementLabel: { ...typography.bodyLarge, color: colors.text.primary, flex: 1 },
  measurementValue: { ...typography.h3, color: colors.primary, fontWeight: '600', marginLeft: spacing.sm },
  measurementNote: { ...typography.bodyMedium, color: colors.text.secondary, fontStyle: 'italic' },
  // Decision
  decisionOption: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 2, borderColor: colors.border, borderRadius: 10,
    padding: spacing.md, marginBottom: spacing.sm,
  },
  decisionRadio: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 2,
    borderColor: colors.text.secondary, marginRight: spacing.md,
    justifyContent: 'center', alignItems: 'center',
  },
  decisionRadioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff' },
  decisionOptionText: { ...typography.bodyLarge, color: colors.text.primary, flex: 1 },
  decisionBadge: {
    borderRadius: 8, paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md, alignSelf: 'flex-start',
  },
  decisionBadgeText: { ...typography.bodyLarge, color: '#ffffff', fontWeight: '700' },
  remarksInput: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 8,
    padding: spacing.md, minHeight: 80, textAlignVertical: 'top',
    ...typography.bodyMedium, color: colors.text.primary,
  },
  footer: { marginTop: spacing.lg, paddingBottom: spacing.xxl },
});
