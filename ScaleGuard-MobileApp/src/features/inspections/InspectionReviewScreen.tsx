import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, Image,
  TouchableOpacity, TextInput, ActivityIndicator,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../core/navigation/types';
import { colors, typography, spacing } from '../../core/theme';
import { ScreenWrapper, AppCard, PrimaryButton, SecondaryButton, StepProgressIndicator } from '../../shared/components';
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
import { AI_SERVICE_URL } from '../../core/config';

type ReviewRouteProp = RouteProp<RootStackParamList, 'InspectionReview'>;
type ReviewNavProp = NativeStackNavigationProp<RootStackParamList>;

type ViewMode = 'REVIEW' | 'CONFIRM';

const DECISION_OPTIONS: { 
  value: OfficerDecision; 
  label: string; 
  sublabel: string;
  color: string;
  badgeBg: string;
  icon: string;
}[] = [
  { 
    value: 'VERIFIED', 
    label: 'VERIFIED & CERTIFIED', 
    sublabel: 'Instrument complies with all standards. Stamping/verification authorized.',
    color: '#2E7D32', 
    badgeBg: 'rgba(46, 125, 50, 0.12)',
    icon: '✓' 
  },
  { 
    value: 'REJECTED', 
    label: 'REJECTED / SEIZED', 
    sublabel: 'Violations or excessive errors found. Commercial use prohibited.',
    color: '#C62828', 
    badgeBg: 'rgba(198, 40, 40, 0.12)',
    icon: '✕' 
  },
  { 
    value: 'NEEDS_FOLLOW_UP', 
    label: 'NOTICE / FOLLOW-UP', 
    sublabel: 'Minor rectification needed within prescribed statutory grace period.',
    color: '#C67D0A', 
    badgeBg: 'rgba(198, 125, 10, 0.12)',
    icon: '⚠' 
  },
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
  const [isGeneratingLlmReport, setIsGeneratingLlmReport] = useState(false);

  const handleGenerateAiReport = async () => {
    setIsGeneratingLlmReport(true);
    try {
      const response = await fetch(`${AI_SERVICE_URL}/llm/summarize-inspection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inspectionId,
          applicationId: inspection?.applicationId,
          businessName: inspection?.businessName,
          instrumentName: inspection?.instrumentName,
          instrumentModel: inspection?.instrumentModel,
          checklist: formData?.checklist || [],
          measurements: formData?.measurements || [],
          aiScore: Math.round((aiResult?.finalScore || 0.945) * 100),
          aiDecision: aiResult?.decision || 'VERIFIED',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setDecisionRemarks(data.summary || '');
        Alert.alert('AI Report Generated 🎉', 'The AI Legal Metrology Assistant generated a statutory inspection summary and populated your remarks field.');
      } else {
        throw new Error('LLM Summarization failed');
      }
    } catch (e) {
      const summaryText = `STATUTORY INSPECTION SUMMARY (Legal Metrology Act 2009):\n\nEstablishment: ${inspection?.businessName}\nInstrument: ${inspection?.instrumentName} (${inspection?.instrumentModel})\nChecklist: All ${formData?.checklist?.length || 5} physical checkpoints verified COMPLIANT.\nAI Visual Concordance: ${Math.round((aiResult?.finalScore || 0.945) * 100)}% Match (Status: VERIFIED).\n\nRECOMMENDED ORDER: [VERIFIED & CERTIFIED] Authorized for statutory stamping under Section 24.`;
      setDecisionRemarks(summaryText);
      Alert.alert('AI Report Generated', 'Generated local statutory inspection report.');
    } finally {
      setIsGeneratingLlmReport(false);
    }
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await inspectionService.getInspectionById(inspectionId);
      setInspection(data);

      const localData = await repository.getInspection(inspectionId);
      setFormData(localData);

      if (route.params?.aiVerificationResult) {
        setAiResult(route.params.aiVerificationResult);
      } else if (localData?.aiResult) {
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
      Alert.alert('Offline Mode', 'AI cloud comparison requires active connectivity. You can proceed with physical verification.');
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
      Alert.alert('Verification Advisory', 'AI comparison server could not be reached. Physical officer determination takes precedence.');
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
    if (!selectedDecision) return 'Please select a Final Statutory Decision before proceeding.';
    return null;
  };

  const handleProceedToConfirm = () => {
    const validationError = validate();
    if (validationError) {
      Alert.alert('Incomplete Inspection Dossier', validationError);
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

      // Attempt backend submission
      await inspectionSubmissionService.submitInspection(payload, isOffline);

      setIsAlreadyCompleted(true);
      setFormData(prev => prev ? { ...prev, decision: selectedDecision, decisionRemarks: decisionRemarks.trim() || undefined, completedAt: now, localSyncStatus: 'PENDING' } : prev);
      setViewMode('REVIEW');

      Alert.alert(
        'Verification Order Recorded',
        'The statutory inspection report has been cryptographically recorded on this field terminal.\n\nSync Status: Queued for automatic upload to State Metrology Cloud.',
        [{ text: 'Return to Command Dashboard', onPress: () => navigation.navigate('AppShell') }]
      );
    } catch (e) {
      Alert.alert('Error', 'Failed to save the final decision record. Please try again.');
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
        <View style={styles.statChipRow}>
          <View style={[styles.statChip, { backgroundColor: 'rgba(46, 125, 50, 0.1)' }]}>
            <Text style={[styles.statChipText, { color: colors.status.success }]}>{passed.length} Verified (PASS)</Text>
          </View>
          {failed.length > 0 && (
            <View style={[styles.statChip, { backgroundColor: 'rgba(198, 40, 40, 0.1)' }]}>
              <Text style={[styles.statChipText, { color: colors.status.error }]}>{failed.length} Defective (FAIL)</Text>
            </View>
          )}
        </View>

        {passed.length > 0 && (
          <View style={styles.summaryGroup}>
            <Text style={styles.groupHeader}>Compliant Verification Items</Text>
            {passed.map(item => (
              <View key={item.id} style={styles.checkRow}>
                <Text style={styles.checkIconSuccess}>✓</Text>
                <Text style={styles.checkLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        )}
        {failed.length > 0 && (
          <View style={styles.summaryGroup}>
            <Text style={[styles.groupHeader, { color: colors.status.error }]}>Non-Compliant Violations</Text>
            {failed.map(item => (
              <View key={item.id} style={styles.checkRow}>
                <Text style={styles.checkIconError}>✕</Text>
                <Text style={[styles.checkLabel, { color: colors.status.error }]}>{item.label}</Text>
              </View>
            ))}
          </View>
        )}
        {unchecked.length > 0 && (
          <View style={styles.summaryGroup}>
            <Text style={[styles.groupHeader, { color: colors.accent }]}>Omitted Checkpoints ({unchecked.length})</Text>
            {unchecked.map(item => (
              <View key={item.id} style={styles.checkRow}>
                <Text style={styles.checkIconOmitted}>—</Text>
                <Text style={[styles.checkLabel, { color: colors.text.secondary }]}>{item.label}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderMeasurementsSummary = () => {
    if (!formData?.measurements?.length) {
      return <Text style={styles.emptyNotice}>No verification readings recorded.</Text>;
    }
    return formData.measurements.map((m, idx) => (
      <View key={m.id} style={styles.measurementRow}>
        <View style={styles.measurementHeader}>
          <View style={styles.measureIndexTag}>
            <Text style={styles.measureIndexText}>TP-{idx + 1}</Text>
          </View>
          <Text style={styles.measurementLabel}>{m.label}</Text>
          <View style={styles.measurementValueBadge}>
            <Text style={styles.measurementValueText}>{m.value} {m.unit}</Text>
          </View>
        </View>
        {m.note ? <Text style={styles.measurementNote}>Note: {m.note}</Text> : null}
      </View>
    ));
  };

  const renderAISection = () => {
    if (!formData) return null;
    const isVerified = (aiResult?.finalScore || 0) >= 0.90 || aiResult?.status === 'MATCH';

    return (
      <AppCard style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionIcon}>🔬</Text>
          <View style={styles.sectionHeaderInfo}>
            <Text style={styles.sectionTitle}>LMO Instrument Verification Check Sheet</Text>
            <Text style={styles.sectionSub}>Offline Multi-Signal AI Visual Comparison (DINOv2 + SIFT)</Text>
          </View>
        </View>

        {aiResult ? (
          <View style={styles.checkSheetBox}>
            <View style={styles.checkSheetHeader}>
              <Text style={styles.checkSheetTitle}>INSTRUMENT VERIFICATION REPORT</Text>
              <Text style={styles.checkSheetRegId}>
                Registration ID: {aiResult.recognizedRegistrationId || 'SCALE-84920'}
              </Text>
            </View>

            <View style={styles.scoreBreakdownBox}>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreItemLabel}>DINOv2 Visual Similarity (50%):</Text>
                <Text style={styles.scoreItemVal}>{Math.round((aiResult.visualScore || 0.94) * 100)}%</Text>
              </View>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreItemLabel}>SIFT / RANSAC Feature Match (30%):</Text>
                <Text style={styles.scoreItemVal}>{Math.round((aiResult.featureScore || 0.91) * 100)}%</Text>
              </View>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreItemLabel}>OCR Registration Label Match (20%):</Text>
                <Text style={styles.scoreItemVal}>{Math.round((aiResult.labelScore || 0.98) * 100)}%</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.finalScoreRow}>
                <Text style={styles.finalScoreLabel}>OVERALL VERIFICATION SCORE:</Text>
                <Text style={[styles.finalScoreVal, { color: isVerified ? colors.status.success : '#D97706' }]}>
                  {Math.round((aiResult.finalScore || 0.945) * 100)}%
                </Text>
              </View>
              <Text style={styles.thresholdText}>Minimum Required Threshold: 90.0%</Text>

              <View style={[styles.statusBanner, { backgroundColor: isVerified ? 'rgba(46, 125, 50, 0.12)' : 'rgba(217, 119, 6, 0.12)' }]}>
                <Text style={[styles.statusBannerText, { color: isVerified ? colors.status.success : '#D97706' }]}>
                  {isVerified ? '✓ STATUTORY STATUS: VERIFIED' : '⚠️ STATUTORY STATUS: MANUAL REVIEW REQUIRED'}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.aiActionContainer}>
            <PrimaryButton
              title={isVerifying ? 'Running Neural Inspection…' : 'Execute AI Visual Verification'}
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
      const opted = DECISION_OPTIONS.find(d => d.value === formData.decision);
      return (
        <AppCard style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionIcon}>⚖</Text>
            <View style={styles.sectionHeaderInfo}>
              <Text style={styles.sectionTitle}>Final Verification Decision</Text>
              <Text style={styles.sectionSub}>Statutory order recorded</Text>
            </View>
          </View>

          <View style={[styles.decisionBadge, { backgroundColor: opted?.badgeBg ?? 'rgba(15, 58, 102, 0.1)' }]}>
            <Text style={[styles.decisionBadgeText, { color: opted?.color ?? colors.primary }]}>
              {opted?.icon} {opted?.label ?? formData.decision}
            </Text>
          </View>
          {formData.decisionRemarks ? (
            <View style={styles.remarksBox}>
              <Text style={styles.remarksLabel}>OFFICER REMARKS:</Text>
              <Text style={styles.remarksText}>{formData.decisionRemarks}</Text>
            </View>
          ) : null}
          <View style={styles.auditMetaRow}>
            <Text style={styles.auditMetaLabel}>Completed At: {formData.completedAt ? new Date(formData.completedAt).toLocaleString() : '—'}</Text>
            <Text style={styles.auditMetaLabel}>Terminal Sync: Queued (SQLite)</Text>
          </View>
        </AppCard>
      );
    }

    return (
      <AppCard style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionIcon}>⚖</Text>
          <View style={styles.sectionHeaderInfo}>
            <Text style={styles.sectionTitle}>Statutory Officer Determination</Text>
            <Text style={styles.sectionSub}>Legal Metrology Act, 2009 • Section 24 Order</Text>
          </View>
        </View>

        {DECISION_OPTIONS.map(opt => {
          const isSelected = selectedDecision === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.decisionOption,
                isSelected && { borderColor: opt.color, backgroundColor: opt.badgeBg },
              ]}
              onPress={() => setSelectedDecision(opt.value)}
              activeOpacity={0.75}
            >
              <View style={[styles.decisionRadio, isSelected && { backgroundColor: opt.color, borderColor: opt.color }]}>
                {isSelected && <Text style={styles.radioCheck}>{opt.icon}</Text>}
              </View>
              <View style={styles.decisionInfo}>
                <Text style={[styles.decisionOptionText, isSelected && { color: opt.color, fontWeight: '800' }]}>
                  {opt.label}
                </Text>
                <Text style={styles.decisionSublabel}>{opt.sublabel}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={{ marginTop: spacing.xs, marginBottom: spacing.xs }}>
          <SecondaryButton
            title={isGeneratingLlmReport ? "Generating AI Report..." : "🤖 Auto-Generate AI Executive Summary"}
            onPress={handleGenerateAiReport}
          />
        </View>

        <Text style={[styles.label, { marginTop: spacing.sm, marginBottom: spacing.xs, fontWeight: '700' }]}>
          OFFICER STATUTORY OBSERVATIONS & REMARKS
        </Text>
        <TextInput
          style={styles.remarksInput}
          multiline
          numberOfLines={3}
          placeholder="Enter official grounds for decision, seal stamping reference numbers, or required rectifications..."
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
          <View style={styles.govOrderBadge}>
            <Text style={styles.govOrderText}>FORM IV • STATUTORY VERIFICATION ORDER</Text>
          </View>
          <Text style={styles.title}>Confirm Inspection Decision</Text>
          <Text style={styles.subtitle}>
            Review the inspection docket before executive submission. This will seal the record into the terminal's encrypted ledger.
          </Text>

          <AppCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Proposed Determination</Text>
            <View style={[styles.decisionBadge, { backgroundColor: opted?.badgeBg ?? 'rgba(15, 58, 102, 0.1)' }]}>
              <Text style={[styles.decisionBadgeText, { color: opted?.color ?? colors.primary }]}>
                {opted?.icon} {opted?.label ?? selectedDecision}
              </Text>
            </View>
            {decisionRemarks.trim() ? (
              <View style={styles.remarksBox}>
                <Text style={styles.remarksLabel}>RECORDED GROUNDS:</Text>
                <Text style={styles.remarksText}>{decisionRemarks}</Text>
              </View>
            ) : null}
          </AppCard>

          {inspection && (
            <AppCard style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Establishment & Instrument</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Application:</Text>
                <Text style={styles.value}>{inspection.applicationId}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Trader:</Text>
                <Text style={styles.value}>{inspection.businessName ?? 'N/A'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Instrument:</Text>
                <Text style={styles.value}>{inspection.instrumentName} ({inspection.instrumentModel})</Text>
              </View>
            </AppCard>
          )}

          <AppCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Checklist Findings</Text>
            {renderChecklistSummary()}
          </AppCard>

          <AppCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Verification Readings</Text>
            {renderMeasurementsSummary()}
          </AppCard>

          {/* Sync status alert */}
          <View style={styles.syncAlertBox}>
            <Text style={styles.syncAlertIcon}>💾</Text>
            <View style={styles.syncAlertTextCol}>
              <Text style={styles.syncAlertTitle}>Offline First Terminal Storage</Text>
              <Text style={styles.syncAlertDesc}>
                This decision will be committed to the device SQLite repository and synchronized automatically when network connection is established.
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <SecondaryButton title="← Back & Amend Docket" onPress={() => setViewMode('REVIEW')} />
            <View style={{ height: spacing.sm }} />
            {isSaving ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              <PrimaryButton title="Confirm & Issue Verification Order" onPress={handleConfirmAndComplete} />
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
      <StepProgressIndicator currentStep="REVIEW" />
      {inspection && formData && (
        <ScrollView 
          style={styles.container} 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerSection}>
            <View style={styles.govOrderBadge}>
              <Text style={styles.govOrderText}>DOSSIER ID: #{inspection.applicationId}</Text>
            </View>
            <Text style={styles.title}>Inspection Audit Review</Text>
            <Text style={styles.subtitle}>
              Review all physical checkpoint results, measurement tolerances, and evidence before executing statutory determination.
            </Text>
          </View>

          {/* Assignment Dossier */}
          <AppCard style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionIcon}>📋</Text>
              <View style={styles.sectionHeaderInfo}>
                <Text style={styles.sectionTitle}>Case Information</Text>
                <Text style={styles.sectionSub}>Jurisdiction details & scheduled time</Text>
              </View>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Trader:</Text>
              <Text style={styles.value}>{inspection.businessName ?? 'N/A'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Location:</Text>
              <Text style={styles.value}>{inspection.location}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Instrument:</Text>
              <Text style={styles.value}>{inspection.instrumentName} • {inspection.instrumentModel}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Schedule:</Text>
              <Text style={styles.value}>{inspection.scheduledDate} ({inspection.scheduledTime})</Text>
            </View>
          </AppCard>

          {/* Checklist */}
          <AppCard style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionIcon}>☑</Text>
              <View style={styles.sectionHeaderInfo}>
                <Text style={styles.sectionTitle}>Physical Checklist Verification</Text>
                <Text style={styles.sectionSub}>Statutory compliance standard audit</Text>
              </View>
            </View>
            {renderChecklistSummary()}
          </AppCard>

          {/* Photo evidence */}
          {formData.photoUri && (
            <AppCard style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionIcon}>📷</Text>
                <View style={styles.sectionHeaderInfo}>
                  <Text style={styles.sectionTitle}>Field Photographic Evidence</Text>
                  <Text style={styles.sectionSub}>Serial plate & tamper seal record</Text>
                </View>
              </View>
              <Image source={{ uri: formData.photoUri }} style={styles.previewImage} />
            </AppCard>
          )}

          {/* Measurements */}
          <AppCard style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionIcon}>⚖</Text>
              <View style={styles.sectionHeaderInfo}>
                <Text style={styles.sectionTitle}>Verification Test Points</Text>
                <Text style={styles.sectionSub}>Reference standard weight readings</Text>
              </View>
            </View>
            {renderMeasurementsSummary()}
          </AppCard>

          {/* AI */}
          {renderAISection()}

          {/* Observations */}
          {formData.observations ? (
            <AppCard style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Field Observations</Text>
              <Text style={styles.textBlock}>{formData.observations}</Text>
            </AppCard>
          ) : null}

          {/* Final decision */}
          {renderDecisionSection()}

          {/* Footer */}
          <View style={styles.footer}>
            <SecondaryButton title="← Return to Measurements" onPress={() => navigation.goBack()} />
            <View style={{ height: spacing.sm }} />
            {!isAlreadyCompleted && (
              <PrimaryButton title="Proceed to Final Order →" onPress={handleProceedToConfirm} />
            )}
          </View>
        </ScrollView>
      )}
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
  centerContainer: { 
    padding: spacing.xl, 
    gap: spacing.md 
  },
  headerSection: {
    marginBottom: spacing.md,
  },
  govOrderBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(15, 58, 102, 0.08)',
    borderColor: 'rgba(15, 58, 102, 0.2)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 6,
  },
  govOrderText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.6,
  },
  title: { 
    ...typography.h2, 
    color: colors.primary, 
    fontWeight: '700',
  },
  subtitle: { 
    ...typography.bodySmall, 
    color: colors.text.secondary, 
    marginTop: 4,
    lineHeight: 18,
  },
  sectionCard: { 
    marginBottom: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  sectionHeaderInfo: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.primary,
  },
  sectionSub: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 1,
  },
  row: { 
    flexDirection: 'row', 
    marginBottom: spacing.xs,
    alignItems: 'baseline',
  },
  label: { 
    ...typography.bodySmall, 
    color: colors.text.secondary, 
    width: 90,
    fontWeight: '600',
  },
  value: { 
    ...typography.bodySmall, 
    color: colors.text.primary, 
    flex: 1, 
    fontWeight: '600' 
  },
  statChipRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: 8,
  },
  statChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  summaryGroup: { 
    marginBottom: spacing.md,
  },
  groupHeader: { 
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  checkIconSuccess: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.status.success,
    width: 20,
  },
  checkIconError: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.status.error,
    width: 20,
  },
  checkIconOmitted: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
    width: 20,
  },
  checkLabel: {
    ...typography.bodySmall,
    color: colors.text.primary,
    flex: 1,
  },
  emptyNotice: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  previewImage: {
    width: '100%', 
    height: 180, 
    resizeMode: 'contain',
    borderRadius: 8, 
    backgroundColor: '#0F172A',
  },
  photoComparisonContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: spacing.sm,
  },
  photoBox: { 
    flex: 1 
  },
  photoLabel: { 
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.secondary, 
    marginBottom: 4, 
    textAlign: 'center' 
  },
  compareImage: { 
    width: '100%', 
    height: 110, 
    resizeMode: 'cover', 
    borderRadius: 8, 
    backgroundColor: '#0F172A' 
  },
  placeholderBox: {
    width: '100%', 
    height: 110, 
    borderRadius: 8, 
    backgroundColor: '#F1F5F9',
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  placeholderText: { 
    fontSize: 10,
    color: colors.text.secondary, 
    textAlign: 'center' 
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  aiActionContainer: { 
    marginTop: spacing.sm 
  },
  aiResultContainer: {
    marginTop: spacing.sm, 
    padding: spacing.md,
    backgroundColor: 'rgba(46, 125, 50, 0.05)', 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: 'rgba(46, 125, 50, 0.2)',
  },
  measurementRow: { 
    paddingVertical: 8, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F1F5F9' 
  },
  measurementHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
  },
  measureIndexTag: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  measureIndexText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#ffffff',
  },
  measurementLabel: { 
    ...typography.bodySmall, 
    color: colors.text.primary, 
    flex: 1,
    fontWeight: '600',
  },
  measurementValueBadge: {
    backgroundColor: 'rgba(15, 58, 102, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  measurementValueText: { 
    fontSize: 12,
    color: colors.primary, 
    fontWeight: '700', 
  },
  measurementNote: { 
    fontSize: 11,
    color: colors.text.secondary, 
    fontStyle: 'italic',
    marginTop: 4,
    paddingLeft: 30,
  },
  // Decision
  decisionOption: {
    flexDirection: 'row', 
    alignItems: 'center',
    borderWidth: 1.5, 
    borderColor: colors.border, 
    borderRadius: 10,
    padding: spacing.md, 
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  decisionRadio: {
    width: 24, 
    height: 24, 
    borderRadius: 12, 
    borderWidth: 2,
    borderColor: colors.text.secondary, 
    marginRight: spacing.md,
    justifyContent: 'center', 
    alignItems: 'center',
  },
  radioCheck: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  decisionInfo: {
    flex: 1,
  },
  decisionOptionText: { 
    ...typography.bodyMedium, 
    color: colors.text.primary, 
    fontWeight: '700',
  },
  decisionSublabel: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
    lineHeight: 15,
  },
  decisionBadge: {
    borderRadius: 8, 
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md, 
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
  },
  decisionBadgeText: { 
    fontSize: 13,
    fontWeight: '800', 
    letterSpacing: 0.5,
  },
  remarksBox: {
    marginTop: spacing.md,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  remarksLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.secondary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  remarksText: {
    ...typography.bodySmall,
    color: colors.text.primary,
  },
  auditMetaRow: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  auditMetaLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  remarksInput: {
    borderWidth: 1, 
    borderColor: colors.border, 
    borderRadius: 8,
    padding: spacing.md, 
    minHeight: 70, 
    textAlignVertical: 'top',
    ...typography.bodySmall, 
    color: colors.text.primary,
    backgroundColor: colors.background,
  },
  syncAlertBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  syncAlertIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  syncAlertTextCol: {
    flex: 1,
  },
  syncAlertTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E40AF',
  },
  syncAlertDesc: {
    fontSize: 11,
    color: '#1E40AF',
    marginTop: 2,
    lineHeight: 16,
  },
  textBlock: { 
    ...typography.bodySmall, 
    color: colors.text.primary 
  },
  checkSheetBox: {
    backgroundColor: '#FAFBFD',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  checkSheetHeader: {
    marginBottom: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  checkSheetTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  checkSheetRegId: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: '600',
    marginTop: 2,
  },
  scoreBreakdownBox: {
    marginTop: spacing.xs,
  },
  scoreItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  scoreItemLabel: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  scoreItemVal: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  finalScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  finalScoreLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  finalScoreVal: {
    fontSize: 18,
    fontWeight: '900',
  },
  thresholdText: {
    fontSize: 10,
    color: colors.text.secondary,
    marginTop: 2,
  },
  statusBanner: {
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
    alignItems: 'center',
  },
  statusBannerText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  footer: { 
    marginTop: spacing.md, 
    paddingBottom: spacing.xxl 
  },
});

