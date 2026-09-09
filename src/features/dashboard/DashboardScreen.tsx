import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../core/navigation/types';
import { colors, typography, spacing } from '../../core/theme';
import { ScreenWrapper, SummaryCard, InspectionCard, PrimaryButton } from '../../shared/components';
import { useAuth } from '../auth/context/AuthContext';
import { inspectionService } from '../inspections/services/inspectionService';
import { DashboardSummary, InspectionSummary } from '../inspections/models/InspectionModels';
import { AppError } from '../../core/errors/AppError';

type DashboardNavigationProp = NativeStackNavigationProp<RootStackParamList>;

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
      const [summaryData, inspectionsData] = await Promise.all([
        inspectionService.getTodaySummary(),
        inspectionService.getTodayInspections(),
      ]);

      setSummary(summaryData);
      setInspections(inspectionsData);
    } catch (err: unknown) {
      if (err instanceof AppError) {
        setError(err.userMessage);
      } else {
        setError('Unable to load field duty dashboard.');
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

  const handleNavigateTab = (tabName: 'Inspections' | 'History' | 'Profile') => {
    navigation.navigate('AppShell', { screen: tabName } as any);
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Officer Identity Card */}
      <View style={styles.officerCard}>
        <View style={styles.officerAvatar}>
          <Text style={styles.officerAvatarText}>👮</Text>
        </View>
        <View style={styles.officerDetails}>
          <View style={styles.badgeRow}>
            <Text style={styles.officerTitleText}>LEGAL METROLOGY OFFICER</Text>
            <View style={styles.dutyBadge}>
              <View style={styles.dutyDot} />
              <Text style={styles.dutyBadgeText}>ON FIELD DUTY</Text>
            </View>
          </View>
          <Text style={styles.officerName}>{user?.fullName || 'Field Officer'}</Text>
          <Text style={styles.officerJurisdiction}>
            ID: {user?.id || 'LMO-8842'} • Andhra Pradesh Circle
          </Text>
        </View>
      </View>

      {/* Quick Action Tiles */}
      <Text style={styles.sectionHeading}>FIELD QUICK ACTIONS</Text>
      <View style={styles.quickActionGrid}>
        <TouchableOpacity 
          style={styles.actionTile}
          onPress={() => handleNavigateTab('Inspections')}
          activeOpacity={0.75}
        >
          <Text style={styles.actionTileIcon}>📋</Text>
          <Text style={styles.actionTileTitle}>View Cases</Text>
          <Text style={styles.actionTileSub}>Assigned Tasks</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionTile}
          onPress={() => handleNavigateTab('History')}
          activeOpacity={0.75}
        >
          <Text style={styles.actionTileIcon}>🗂️</Text>
          <Text style={styles.actionTileTitle}>Archive</Text>
          <Text style={styles.actionTileSub}>Past Inspections</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionTile}
          onPress={() => handleNavigateTab('Profile')}
          activeOpacity={0.75}
        >
          <Text style={styles.actionTileIcon}>🔔</Text>
          <Text style={styles.actionTileTitle}>Reminders</Text>
          <Text style={styles.actionTileSub}>Alert Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionTile}
          onPress={() => loadData(true)}
          activeOpacity={0.75}
        >
          <Text style={styles.actionTileIcon}>🔄</Text>
          <Text style={styles.actionTileTitle}>Sync Data</Text>
          <Text style={styles.actionTileSub}>Refresh Queue</Text>
        </TouchableOpacity>
      </View>

      {/* Today's Workload Metrics */}
      <View style={styles.workloadHeaderRow}>
        <Text style={styles.sectionHeading}>TODAY'S VERIFICATION WORKLOAD</Text>
      </View>
      
      {summary && (
        <View style={styles.summaryGrid}>
          <SummaryCard title="Assigned" count={summary.assigned} variant="assigned" />
          <SummaryCard title="Pending" count={summary.pending} variant="pending" />
          <SummaryCard title="In Progress" count={summary.inProgress} variant="inProgress" />
          <SummaryCard title="Completed" count={summary.completed} variant="completed" />
        </View>
      )}

      {/* List Header */}
      <View style={styles.feedHeaderRow}>
        <Text style={styles.sectionHeading}>TODAY'S SCHEDULED CASES ({inspections.length})</Text>
      </View>
    </View>
  );

  const renderEmptyComponent = () => {
    if (isInitialLoading || error) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🗓️</Text>
        <Text style={styles.emptyTitle}>No Pending Inspections Today</Text>
        <Text style={styles.emptySubtitle}>
          All scheduled field cases for today have been attended to or none are currently assigned.
        </Text>
      </View>
    );
  };

  if (error && !summary) {
    return (
      <ScreenWrapper hasError={true} errorMessage={error}>
        <View style={styles.retryContainer}>
          <PrimaryButton title="Retry Loading Dashboard" onPress={() => loadData()} />
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
          <InspectionCard inspection={item} onViewDetails={handleViewDetails} />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadData(true)}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: spacing.md,
    flexGrow: 1,
  },
  headerContainer: {
    marginBottom: spacing.sm,
  },
  officerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  officerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  officerAvatarText: {
    fontSize: 24,
  },
  officerDetails: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  officerTitleText: {
    ...typography.badge,
    color: colors.secondary,
    letterSpacing: 0.8,
  },
  dutyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 163, 74, 0.25)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 999,
  },
  dutyDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#4ADE80',
    marginRight: 4,
  },
  dutyBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#DCFCE7',
    letterSpacing: 0.5,
  },
  officerName: {
    ...typography.h2,
    fontSize: 17,
    color: colors.text.inverse,
    marginBottom: 2,
  },
  officerJurisdiction: {
    ...typography.bodySmall,
    fontSize: 11,
    color: '#BFDBFE',
  },
  sectionHeading: {
    ...typography.caption,
    textTransform: 'uppercase',
    color: colors.text.secondary,
    letterSpacing: 0.8,
    marginBottom: 10,
    fontWeight: '700',
  },
  quickActionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  actionTile: {
    width: '23%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 1,
  },
  actionTileIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  actionTileTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
  },
  actionTileSub: {
    fontSize: 9,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: 2,
  },
  workloadHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  feedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: 4,
  },
  emptySubtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  retryContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
});
