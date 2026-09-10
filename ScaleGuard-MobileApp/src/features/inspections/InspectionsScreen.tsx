import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../core/navigation/types';
import { colors, typography, spacing } from '../../core/theme';
import { ScreenWrapper, InspectionCard, PrimaryButton } from '../../shared/components';
import { inspectionService } from './services/inspectionService';
import { InspectionSummary } from './models/InspectionModels';
import { AppError } from '../../core/errors/AppError';

type InspectionsScreenNavProp = NativeStackNavigationProp<RootStackParamList>;
type FilterType = 'TODAY' | 'UPCOMING' | 'PAST';

export const InspectionsScreen = () => {
  const navigation = useNavigation<InspectionsScreenNavProp>();

  const [inspections, setInspections] = useState<InspectionSummary[]>([]);
  const [filter, setFilter] = useState<FilterType>('TODAY');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (currentFilter: FilterType, refreshing = false) => {
    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsInitialLoading(true);
    }
    setError(null);

    try {
      const data = await inspectionService.getAssignedInspections(currentFilter);
      setInspections(data);
    } catch (err: unknown) {
      if (err instanceof AppError) {
        setError(err.userMessage);
      } else {
        setError('Unable to load assigned inspection list.');
      }
    } finally {
      setIsInitialLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(filter);
  }, [filter, loadData]);

  const handleViewDetails = (id: string) => {
    navigation.navigate('InspectionDetails', { inspectionId: id });
  };

  const renderFilterBar = () => {
    const filters: { label: string; value: FilterType; icon: string }[] = [
      { label: 'Today', value: 'TODAY', icon: '📍' },
      { label: 'Upcoming', value: 'UPCOMING', icon: '🗓️' },
      { label: 'Past', value: 'PAST', icon: '📁' },
    ];

    return (
      <View style={styles.filterSection}>
        <View style={styles.filterBar}>
          {filters.map((f) => {
            const isActive = filter === f.value;
            return (
              <TouchableOpacity
                key={f.value}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setFilter(f.value)}
                disabled={isInitialLoading}
                activeOpacity={0.75}
              >
                <Text style={styles.filterIcon}>{f.icon}</Text>
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.headerCountRow}>
          <Text style={styles.headerCountText}>
            SHOWING {inspections.length} {filter} VERIFICATION {inspections.length === 1 ? 'CASE' : 'CASES'}
          </Text>
        </View>
      </View>
    );
  };

  const renderEmptyComponent = () => {
    if (isInitialLoading || error) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyTitle}>No Assigned Cases</Text>
        <Text style={styles.emptySubtitle}>
          There are no field verification applications listed under {filter.toLowerCase()} schedule.
        </Text>
      </View>
    );
  };

  if (error && inspections.length === 0) {
    return (
      <ScreenWrapper hasError={true} errorMessage={error}>
        <View style={styles.retryContainer}>
          <PrimaryButton title="Retry Loading Cases" onPress={() => loadData(filter)} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper isLoading={isInitialLoading && !isRefreshing}>
      <View style={styles.container}>
        {renderFilterBar()}
        
        <FlatList
          data={inspections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <InspectionCard inspection={item} onViewDetails={handleViewDetails} />
          )}
          ListEmptyComponent={renderEmptyComponent}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => loadData(filter, true)}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterSection: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingTop: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  filterBar: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  filterChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  filterText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: '700',
  },
  filterTextActive: {
    color: colors.text.inverse,
  },
  headerCountRow: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  headerCountText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.text.muted,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  listContent: {
    padding: spacing.md,
    flexGrow: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  emptyIcon: {
    fontSize: 36,
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
