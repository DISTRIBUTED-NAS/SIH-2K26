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
  { key: 'ALL', label: 'All Cases' },
  { key: 'VERIFIED', label: 'Verified' },
  { key: 'REJECTED', label: 'Rejected' },
  { key: 'NEEDS_FOLLOW_UP', label: 'Follow-up' },
  { key: 'PENDING_SYNC', label: 'Terminal Queue' },
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
      setError('Unable to load inspection history from terminal database.');
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

  // ── Metrics calculation ─────────────────────────────────────────────────
  const metrics = useMemo(() => {
    const verified = history.filter(i => i.decision === 'VERIFIED').length;
    const rejected = history.filter(i => i.decision === 'REJECTED').length;
    const pendingSync = history.filter(i => i.syncStatus !== 'SYNCED').length;
    return { total: history.length, verified, rejected, pendingSync };
  }, [history]);

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
          <Text style={styles.emptyTitle}>No matching records found</Text>
          <Text style={styles.emptySubtitle}>
            Try adjusting your search keywords or clearing active status filters.
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📂</Text>
        <Text style={styles.emptyTitle}>No Completed Case Dockets</Text>
        <Text style={styles.emptySubtitle}>
          Completed inspections recorded on this field terminal will be permanently archived and listed here.
        </Text>
      </View>
    );
  };

  const renderFilterBar = () => (
    <View style={styles.filterBar}>
      {FILTERS.map(f => {
        const isActive = activeFilter === f.key;
        let countBadge = 0;
        if (f.key === 'ALL') countBadge = history.length;
        else if (f.key === 'VERIFIED') countBadge = metrics.verified;
        else if (f.key === 'REJECTED') countBadge = metrics.rejected;
        else if (f.key === 'PENDING_SYNC') countBadge = metrics.pendingSync;
        else countBadge = history.filter(i => i.decision === f.key).length;

        return (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, isActive && styles.filterChipActive]}
            onPress={() => setActiveFilter(f.key)}
            activeOpacity={0.75}
          >
            <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
              {f.label}
            </Text>
            {countBadge > 0 && (
              <View style={[styles.chipCountBadge, isActive && styles.chipCountBadgeActive]}>
                <Text style={[styles.chipCountText, isActive && styles.chipCountTextActive]}>
                  {countBadge}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // ── Error state ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => loadHistory()}>
          <Text style={styles.retryText}>Reload Records</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Loading state ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Accessing Encrypted Terminal Archive…</Text>
      </View>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.govTag}>
          <Text style={styles.govTagText}>OFFICIAL AUDIT LEDGER • LEGAL METROLOGY</Text>
        </View>
        <Text style={styles.title}>Inspection Archive</Text>
        <Text style={styles.subtitle}>
          Permanent record of executed verification orders and field enforcement actions.
        </Text>

        {/* Metrics Summary Strip */}
        <View style={styles.metricsStrip}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{metrics.total}</Text>
            <Text style={styles.metricLabel}>Total</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={[styles.metricValue, { color: colors.status.success }]}>{metrics.verified}</Text>
            <Text style={styles.metricLabel}>Verified</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={[styles.metricValue, { color: colors.status.error }]}>{metrics.rejected}</Text>
            <Text style={styles.metricLabel}>Rejected</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={[styles.metricValue, { color: metrics.pendingSync > 0 ? colors.accent : colors.text.secondary }]}>
              {metrics.pendingSync}
            </Text>
            <Text style={styles.metricLabel}>Queued</Text>
          </View>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Case ID, Trader Name, or Model…"
          placeholderTextColor={colors.text.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter chips */}
      {renderFilterBar()}

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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  govTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(15, 58, 102, 0.08)',
    borderColor: 'rgba(15, 58, 102, 0.2)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 6,
  },
  govTagText: {
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
    marginTop: 2,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  metricsStrip: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
    color: colors.text.secondary,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    ...typography.bodySmall,
    color: colors.text.primary,
  },
  clearBtn: {
    padding: 6,
    marginLeft: 6,
  },
  clearBtnText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '700',
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 6,
    flexWrap: 'wrap',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  chipCountBadge: {
    backgroundColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginLeft: 6,
  },
  chipCountBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  chipCountText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  chipCountTextActive: {
    color: '#ffffff',
  },
  listContent: {
    padding: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl + 20,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 44,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
    fontWeight: '700',
  },
  emptySubtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
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
