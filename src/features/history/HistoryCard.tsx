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

const DECISION_COLORS: Record<OfficerDecision, string> = {
  VERIFIED: '#1a7a4a',
  REJECTED: '#c0392b',
  NEEDS_FOLLOW_UP: '#c47f17',
};

const DECISION_LABELS: Record<OfficerDecision, string> = {
  VERIFIED: 'Verified',
  REJECTED: 'Rejected',
  NEEDS_FOLLOW_UP: 'Needs Follow-up',
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
  const decisionColor = item.decision ? DECISION_COLORS[item.decision as OfficerDecision] : colors.text.secondary;
  const decisionLabel = item.decision ? DECISION_LABELS[item.decision as OfficerDecision] : 'No Decision';

  const syncLabel =
    item.syncStatus === 'SYNCED' ? '✓ Synced' : '⏳ Pending synchronisation';
  const syncColor =
    item.syncStatus === 'SYNCED' ? colors.status.success : colors.status.warning;

  return (
    <TouchableOpacity onPress={() => onPress(item.id)} activeOpacity={0.8}>
      <AppCard style={styles.card}>
        {/* Header: App ID + Decision badge */}
        <View style={styles.headerRow}>
          <Text style={styles.appId}>#{item.applicationId}</Text>
          <View style={[styles.decisionBadge, { backgroundColor: decisionColor }]}>
            <Text style={styles.decisionBadgeText}>{decisionLabel}</Text>
          </View>
        </View>

        {/* Business & instrument */}
        {item.businessName ? (
          <Text style={styles.business}>{item.businessName}</Text>
        ) : null}
        <Text style={styles.instrument}>{item.instrumentName}</Text>
        {item.instrumentModel ? (
          <Text style={styles.instrumentModel}>{item.instrumentModel}</Text>
        ) : null}

        {/* Footer: date + sync */}
        <View style={styles.footerRow}>
          <Text style={styles.date}>
            🗓 {formatDate(item.completedAt)}
          </Text>
          <Text style={[styles.syncStatus, { color: syncColor }]}>
            {syncLabel}
          </Text>
        </View>
      </AppCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  appId: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  decisionBadge: {
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
  },
  decisionBadgeText: {
    ...typography.bodySmall,
    color: '#ffffff',
    fontWeight: '700',
  },
  business: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  instrument: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  instrumentModel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.xs,
  },
  date: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  syncStatus: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
});
