import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
  TextInput, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../core/navigation/types';
import { colors, typography, spacing } from '../../core/theme';
import { repository } from '../../core/storage/database/InspectionLocalRepository';
import { InspectionHistoryItem } from './models/InspectionHistoryModels';
import { OfficerDecision } from '../inspections/models/OfficerDecisionModels';
import { HistoryCard } from './HistoryCard';

type HistoryNavProp = NativeStackNavigationProp<RootStackParamList>;

type FilterOption = 'ALL' | OfficerDecision | 'PENDING_SYNC';

const FILTERS: { key: FilterOption; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'VERIFIED', label: 'Verified' },
  { key: 'REJECTED', label: 'Rejected' },
  { key: 'NEEDS_FOLLOW_UP', label: 'Follow-up' },
  { key: 'PENDING_SYNC', label: 'Pending Sync' },
];

export const HistoryScreen = () => {
  const navigation = useNavigation<HistoryNavProp>();

  const [history, setHistory] = useState<InspectionHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterOption>('ALL');

  // ── Data loading ────────────────────────────────────────────────────────
  const loadHistory = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    try {
      const data = await repository.getInspectionHistory();
      setHistory(data);
    } catch (e) {
      console.error('[HistoryScreen] Failed to load history:', e);
      setError('Unable to load inspection history.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Reload whenever the tab gains focus (e.g. after completing an inspection)
  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  // ── Filtering + searching (local, no DB writes) ─────────────────────────
  const filteredHistory = useMemo(() => {
    let items = history;

    // Filter by decision / sync
    if (activeFilter !== 'ALL') {
      if (activeFilter === 'PENDING_SYNC') {
        items = items.filter(i => i.syncStatus !== 'SYNCED');
      } else {
        items = items.filter(i => i.decision === activeFilter);
      }
    }

    // Search by applicationId, businessName, instrumentName, instrumentModel
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i =>
        i.applicationId.toLowerCase().includes(q) ||
        (i.businessName?.toLowerCase().includes(q) ?? false) ||
        i.instrumentName.toLowerCase().includes(q) ||
        (i.instrumentModel?.toLowerCase().includes(q) ?? false)
      );
    }

    return items;
  }, [history, activeFilter, searchQuery]);

  // ── Navigation ──────────────────────────────────────────────────────────
  const handleOpenItem = (inspectionId: string) => {
    navigation.navigate('InspectionReview', { inspectionId });
  };

  // ── Render helpers ───────────────────────────────────────────────────────
  const renderEmptyState = () => {
    if (isLoading) return null;
    if (filteredHistory.length === 0 && searchQuery.trim().length > 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>No results</Text>
          <Text style={styles.emptySubtitle}>No inspections match your search.</Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyTitle}>No inspection history yet.</Text>
        <Text style={styles.emptySubtitle}>
          Completed inspections will appear here.
        </Text>
      </View>
    );
  };

  const renderFilterBar = () => (
    <View style={styles.filterBar}>
      {FILTERS.map(f => (
        <TouchableOpacity
          key={f.key}
          style={[styles.filterChip, activeFilter === f.key && styles.filterChipActive]}
          onPress={() => setActiveFilter(f.key)}
          activeOpacity={0.75}
        >
          <Text style={[styles.filterChipText, activeFilter === f.key && styles.filterChipTextActive]}>
            {f.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // ── Error state ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => loadHistory()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Loading state ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading history…</Text>
      </View>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Inspection History</Text>
        <Text style={styles.subtitle}>Previously completed inspections</Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by ID, business, or instrument…"
          placeholderTextColor={colors.text.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {/* Filter chips */}
      {renderFilterBar()}

      {/* Count */}
      <Text style={styles.countLabel}>
        {filteredHistory.length} inspection{filteredHistory.length !== 1 ? 's' : ''}
      </Text>

      {/* List */}
      <FlatList
        data={filteredHistory}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <HistoryCard item={item} onPress={handleOpenItem} />
        )}
        contentContainerStyle={[
          styles.listContent,
          filteredHistory.length === 0 && styles.emptyListContent,
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadHistory(true)}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  searchRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  countLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  errorIcon: {
    fontSize: 40,
  },
  errorText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
    marginTop: spacing.sm,
  },
  retryText: {
    ...typography.bodyMedium,
    color: '#ffffff',
    fontWeight: '700',
  },
});
