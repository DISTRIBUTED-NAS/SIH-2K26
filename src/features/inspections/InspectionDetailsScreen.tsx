import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../core/navigation/types';
import { colors, typography, spacing } from '../../core/theme';
import { ScreenWrapper, StatusBadge, PrimaryButton, AppCard } from '../../shared/components';
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

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await inspectionService.getInspectionById(inspectionId);
      setInspection(data);
    } catch (err: any) {
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

  if (error && !inspection) {
    return (
      <ScreenWrapper hasError={true} errorMessage={error}>
        <View style={styles.retryContainer}>
          <PrimaryButton title="Retry" onPress={loadData} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper isLoading={isLoading}>
      {inspection && (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Inspection Details</Text>
            <StatusBadge status={inspection.status} />
          </View>
          
          <AppCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Application</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Application ID:</Text>
              <Text style={styles.value}>{inspection.applicationId}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Inspection ID:</Text>
              <Text style={styles.value}>{inspection.id}</Text>
            </View>
          </AppCard>

          <AppCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Business / Customer</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{inspection.businessName || 'N/A'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Location:</Text>
              <Text style={styles.value}>{inspection.location}</Text>
            </View>
          </AppCard>

          <AppCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Instrument Info</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Type:</Text>
              <Text style={styles.value}>{inspection.instrumentName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Model:</Text>
              <Text style={styles.value}>{inspection.instrumentModel || 'N/A'}</Text>
            </View>
          </AppCard>

          <AppCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Scheduling</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Date:</Text>
              <Text style={styles.value}>{inspection.scheduledDate}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Time:</Text>
              <Text style={styles.value}>{inspection.scheduledTime}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Assigned Officer:</Text>
              <Text style={styles.value}>{inspection.assignedOfficerId || 'Unassigned'}</Text>
            </View>
          </AppCard>

          {inspection.notes && (
            <AppCard style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={styles.notesText}>{inspection.notes}</Text>
            </AppCard>
          )}

          <View style={styles.actionContainer}>
            <PrimaryButton 
              title="Start Inspection" 
              onPress={async () => {
                if (!inspection) return;
                try {
                  await repository.startInspection(inspection);
                  navigation.navigate('InspectionChecklist', { inspectionId });
                } catch (e) {
                  console.error('Failed to start inspection', e);
                }
              }} 
            />
          </View>
        </ScrollView>
      )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
  },
  sectionCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    width: 130,
  },
  value: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    flex: 1,
    fontWeight: '500',
  },
  notesText: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actionContainer: {
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
  },
  retryContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
});
