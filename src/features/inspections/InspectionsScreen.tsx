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
    } catch (err: any) {
      if (err instanceof AppError) {
        setError(err.userMessage);
      } else {
        setError('An unexpected error occurred while loading inspections.');
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
    const filters: { label: string; value: FilterType }[] = [
      { label: 'Today', value: 'TODAY' },
      { label: 'Upcoming', value: 'UPCOMING' },
      { label: 'Past', value: 'PAST' },
    ];

    return (
      <View style={styles.filterBar}>
        {filters.map((f) => {
          const isActive = filter === f.value;
          return (
            <TouchableOpacity
              key={f.value}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setFilter(f.value)}
              disabled={isInitialLoading}
            >
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderEmptyComponent = () => {
    if (isInitialLoading) return null;
    if (error) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No inspections found</Text>
        <Text style={styles.emptySubtitle}>You have no assigned inspections for this category.</Text>
      </View>
    );
  };

  if (error && inspections.length === 0) {
    return (
      <ScreenWrapper hasError={true} errorMessage={error}>
        <View style={styles.retryContainer}>
          <PrimaryButton title="Retry" onPress={() => loadData(filter)} />
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
  },
  filterBar: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    justifyContent: 'space-around',
  },
  filterChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.background,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: colors.text.inverse,
  },
  listContent: {
    padding: spacing.lg,
    flexGrow: 1,
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
