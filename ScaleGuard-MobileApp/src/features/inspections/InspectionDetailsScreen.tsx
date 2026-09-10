import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../core/navigation/types';
import { colors, typography, spacing } from '../../core/theme';
import { ScreenWrapper, StatusBadge, PrimaryButton, AppCard, StepProgressIndicator } from '../../shared/components';
import { inspectionService } from './services/inspectionService';
import { repository } from '../../core/storage/database/InspectionLocalRepository';
import { InspectionSummary } from './models/InspectionModels';
import { AppError } from '../../core/errors/AppError';

type InspectionDetailsRouteProp = RouteProp<RootStackParamList, 'InspectionDetails'>;
type InspectionDetailsNavProp = NativeStackNavigationProp<RootStackParamList, 'InspectionDetails'>;

export const InspectionDetailsScreen = () => {
  const route = useRoute<InspectionDetailsRouteProp>();
  const navigation = useNavigation<InspectionDetailsNavProp>();
  const { inspectionId } = route.params;

  const [inspection, setInspection] = useState<InspectionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await inspectionService.getInspectionById(inspectionId);
      setInspection(data);
    } catch (err: unknown) {
      if (err instanceof AppError) {
        setError(err.userMessage);
      } else {
        setError('Unable to load official inspection dossier.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [inspectionId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStartInspection = async () => {
    if (!inspection) return;
    setIsStarting(true);
    try {
      await repository.startInspection(inspection);
      navigation.navigate('InspectionChecklist', { inspectionId });
    } catch (e) {
      console.error('Failed to start inspection', e);
    } finally {
      setIsStarting(false);
    }
  };

  if (error && !inspection) {
    return (
      <ScreenWrapper hasError={true} errorMessage={error}>
        <View style={styles.retryContainer}>
          <PrimaryButton title="Retry Loading Details" onPress={loadData} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper isLoading={isLoading}>
      {inspection && (
        <View style={styles.outerContainer}>
          {/* Progress Indicator */}
          <StepProgressIndicator currentStep="DETAILS" />

          <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header Status Card */}
            <View style={styles.dossierBanner}>
              <View style={styles.dossierBadge}>
                <Text style={styles.dossierBadgeText}>OFFICIAL DOSSIER</Text>
              </View>
              <Text style={styles.applicationHeading}>Application #{inspection.applicationId}</Text>
              <View style={styles.statusRow}>
                <StatusBadge status={inspection.status} />
                <Text style={styles.internalIdText}>ID: {inspection.id}</Text>
              </View>
            </View>

            {/* Applicant & Business Details */}
            <AppCard style={styles.sectionCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.sectionTitle}>BUSINESS & APPLICANT</Text>
                <Text style={styles.sectionTag}>Trader Profile</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Business Entity:</Text>
                <Text style={styles.valueBold}>{inspection.businessName || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Establishment Site:</Text>
                <Text style={styles.value}>{inspection.location}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Jurisdiction:</Text>
                <Text style={styles.value}>Zone 4 • Legal Metrology Circle</Text>
              </View>
            </AppCard>

            {/* Instrument Specifications */}
            <AppCard style={styles.sectionCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.sectionTitle}>INSTRUMENT SPECIFICATIONS</Text>
                <Text style={styles.sectionTag}>Verification Target</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Category / Type:</Text>
                <Text style={styles.valueBold}>⚖️  {inspection.instrumentName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Model / Series:</Text>
                <Text style={styles.value}>{inspection.instrumentModel || 'Standard Commercial'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Statutory Standard:</Text>
                <Text style={styles.value}>Class III Commercial Stamping</Text>
              </View>
            </AppCard>

            {/* Field Schedule & Assignment */}
            <AppCard style={styles.sectionCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.sectionTitle}>SCHEDULE & FIELD OFFICER</Text>
                <Text style={styles.sectionTag}>Roster Slot</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Scheduled Date:</Text>
                <Text style={styles.valueBold}>🗓️  {inspection.scheduledDate}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Reporting Time:</Text>
                <Text style={styles.valueBold}>🕒  {inspection.scheduledTime}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Assigned Officer:</Text>
                <Text style={styles.value}>{inspection.assignedOfficerId || 'LMO Field Officer'}</Text>
              </View>
            </AppCard>

            {/* Statutory Notes */}
            {inspection.notes && (
              <AppCard style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>OFFICER NOTES & STATUTORY INSTRUCTIONS</Text>
                <Text style={styles.notesText}>{inspection.notes}</Text>
              </AppCard>
            )}
          </ScrollView>

          {/* Bottom Sticky Action Bar */}
          <View style={styles.stickyFooter}>
            <PrimaryButton 
              title={isStarting ? "Initializing Stamping..." : "Start Field Inspection →"}
              onPress={handleStartInspection} 
              isLoading={isStarting}
            />
          </View>
        </View>
      )}
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
  dossierBanner: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  dossierBadge: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  dossierBadgeText: {
    ...typography.badge,
    fontSize: 10,
    color: colors.primary,
    fontWeight: '800',
  },
  applicationHeading: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  internalIdText: {
    ...typography.caption,
    color: colors.text.muted,
  },
  sectionCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingBottom: 6,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  sectionTag: {
    ...typography.badge,
    fontSize: 9,
    color: colors.secondary,
    backgroundColor: colors.secondaryLight,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 5,
  },
  label: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    width: '42%',
  },
  value: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'right',
  },
  valueBold: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.text.primary,
    flex: 1,
    textAlign: 'right',
  },
  notesText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    lineHeight: 20,
    backgroundColor: colors.surfaceVariant,
    padding: spacing.sm + 2,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary,
    marginTop: 6,
  },
  stickyFooter: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  retryContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
});
