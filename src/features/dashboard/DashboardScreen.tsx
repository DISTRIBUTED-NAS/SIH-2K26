import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../core/navigation/types';
import { colors, typography, spacing } from '../../core/theme';
import { ScreenWrapper, SummaryCard, InspectionCard, PrimaryButton } from '../../shared/components';
import { useAuth } from '../auth/context/AuthContext';
import { inspectionService } from '../inspections/services/inspectionService';
import { DashboardSummary, InspectionSummary } from '../inspections/models/InspectionModels';
import { AppError } from '../../core/errors/AppError';

type DashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AppShell'>;

export const DashboardScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<DashboardNavigationProp>();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [inspections, setInspections] = useState<InspectionSummary[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (refreshing = false) => {
    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsInitialLoading(true);
    }
    setError(null);

    try {
      // Fetch both data sources in parallel
      const [summaryData, inspectionsData] = await Promise.all([
        inspectionService.getTodaySummary(),
        inspectionService.getTodayInspections(),
      ]);

      setSummary(summaryData);
      setInspections(inspectionsData);
    } catch (err: any) {
      if (err instanceof AppError) {
        setError(err.userMessage);
      } else {
        setError('An unexpected error occurred while loading your dashboard.');
      }
    } finally {
      setIsInitialLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleViewDetails = (id: string) => {
    navigation.navigate('InspectionDetails', { inspectionId: id });
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.brandText}>ScaleGuard</Text>
      <Text style={styles.greetingText}>Good Morning, {user?.fullName?.split(' ')[0] || 'Officer'} 👋</Text>
      
      <Text style={styles.sectionTitle}>Today's Work</Text>
      
      {summary && (
        <View style={styles.summaryGrid}>
          <SummaryCard title="Assigned" count={summary.assigned} />
          <SummaryCard title="Pending" count={summary.pending} />
          <SummaryCard title="In Progress" count={summary.inProgress} />
          <SummaryCard title="Completed" count={summary.completed} />
        </View>
      )}

      <Text style={styles.sectionTitle}>Today's Inspections</Text>
    </View>
  );

  const renderEmptyComponent = () => {
    if (isInitialLoading) return null; // Let ScreenWrapper handle initial load
    if (error) return null; // Error handled by ScreenWrapper or retry button

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No inspections scheduled</Text>
        <Text style={styles.emptySubtitle}>You currently have no inspections assigned for today.</Text>
      </View>
    );
  };

  // If there's an error during initial load, we show the Error state in ScreenWrapper.
  // But we want to allow retry.
  if (error && !summary) {
    return (
      <ScreenWrapper hasError={true} errorMessage={error}>
         <View style={styles.retryContainer}>
           <PrimaryButton title="Retry" onPress={() => loadData()} />
         </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper isLoading={isInitialLoading && !isRefreshing}>
      <FlatList
        data={inspections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <InspectionCard inspection={item} onViewDetails={handleViewDetails} />
          </View>
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadData(true)}
            colors={[colors.primary]} // Android
            tintColor={colors.primary} // iOS
          />
        }
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  headerContainer: {
    marginBottom: spacing.md,
  },
  brandText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  greetingText: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  cardWrapper: {
    // Allows FlatList to apply margin between cards without causing layout shift
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  retryContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  }
});
