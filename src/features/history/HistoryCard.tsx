import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AppCard } from '../../shared/components/AppCard';
import { colors, typography, spacing } from '../../core/theme';
import { InspectionHistoryItem } from './models/InspectionHistoryModels';
import { OfficerDecision } from '../inspections/models/OfficerDecisionModels';

interface HistoryCardProps {
  item: InspectionHistoryItem;
  onPress: (id: string) => void;
}

const DECISION_META: Record<OfficerDecision, { label: string; color: string; bg: string; icon: string }> = {
  VERIFIED: { 
    label: 'VERIFIED', 
    color: '#2E7D32', 
    bg: 'rgba(46, 125, 50, 0.12)', 
    icon: '✓' 
  },
  REJECTED: { 
    label: 'REJECTED', 
    color: '#C62828', 
    bg: 'rgba(198, 40, 40, 0.12)', 
    icon: '✕' 
  },
  NEEDS_FOLLOW_UP: { 
    label: 'FOLLOW-UP', 
    color: '#C67D0A', 
    bg: 'rgba(198, 125, 10, 0.12)', 
    icon: '⚠' 
  },
};

function formatDate(iso?: string): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export const HistoryCard: React.FC<HistoryCardProps> = ({ item, onPress }) => {
  const meta = item.decision ? DECISION_META[item.decision as OfficerDecision] : null;

  const isSynced = item.syncStatus === 'SYNCED';

  return (
    <TouchableOpacity onPress={() => onPress(item.id)} activeOpacity={0.8}>
      <AppCard style={styles.card}>
        {/* Header: App ID + Decision badge */}
        <View style={styles.headerRow}>
          <View style={styles.caseBadge}>
            <Text style={styles.appId}>CASE #{item.applicationId}</Text>
          </View>
          {meta ? (
            <View style={[styles.decisionBadge, { backgroundColor: meta.bg, borderColor: meta.color }]}>
              <Text style={[styles.decisionBadgeText, { color: meta.color }]}>
                {meta.icon} {meta.label}
              </Text>
            </View>
          ) : (
            <View style={[styles.decisionBadge, { backgroundColor: 'rgba(100, 116, 139, 0.12)' }]}>
              <Text style={[styles.decisionBadgeText, { color: colors.text.secondary }]}>PENDING</Text>
            </View>
          )}
        </View>

        {/* Business & Location */}
        {item.businessName ? (
          <Text style={styles.business} numberOfLines={1}>{item.businessName}</Text>
        ) : null}

        {/* Instrument */}
        <View style={styles.instrumentRow}>
          <Text style={styles.instrumentIcon}>⚖</Text>
          <Text style={styles.instrument} numberOfLines={1}>{item.instrumentName}</Text>
          {item.instrumentModel ? (
            <View style={styles.modelTag}>
              <Text style={styles.instrumentModel}>{item.instrumentModel}</Text>
            </View>
          ) : null}
        </View>

        {/* Footer: date + sync pill */}
        <View style={styles.footerRow}>
          <Text style={styles.date}>
            🗓 {formatDate(item.completedAt)}
          </Text>
          <View style={[styles.syncPill, isSynced ? styles.syncPillSynced : styles.syncPillQueue]}>
            <Text style={[styles.syncStatus, isSynced ? styles.syncTextSynced : styles.syncTextQueue]}>
              {isSynced ? '✓ Central Synced' : '⏳ Terminal Queue'}
            </Text>
          </View>
        </View>
      </AppCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  caseBadge: {
    backgroundColor: 'rgba(15, 58, 102, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  appId: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  decisionBadge: {
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  decisionBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  business: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: 4,
    fontWeight: '700',
  },
  instrumentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  instrumentIcon: {
    fontSize: 14,
    color: colors.text.secondary,
    marginRight: 6,
  },
  instrument: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    flex: 1,
  },
  modelTag: {
    backgroundColor: colors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    marginLeft: 6,
  },
  instrumentModel: {
    fontSize: 10,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  date: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  syncPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  syncPillSynced: {
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
  },
  syncPillQueue: {
    backgroundColor: 'rgba(198, 125, 10, 0.1)',
  },
  syncStatus: {
    fontSize: 10,
    fontWeight: '700',
  },
  syncTextSynced: {
    color: colors.status.success,
  },
  syncTextQueue: {
    color: colors.accent,
  },
});

