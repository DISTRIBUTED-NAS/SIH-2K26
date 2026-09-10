import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { typography, colors, spacing } from '../../core/theme';

interface SummaryCardProps {
  title: string;
  count: number;
  variant?: 'assigned' | 'pending' | 'inProgress' | 'completed';
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, count, variant }) => {
  const getAccent = () => {
    switch (variant || title.toLowerCase()) {
      case 'assigned':
        return { bar: colors.primary, countColor: colors.primary, bg: colors.surface };
      case 'pending':
        return { bar: colors.status.warning, countColor: colors.status.warning, bg: colors.surface };
      case 'in progress':
      case 'inprogress':
        return { bar: colors.status.info, countColor: colors.status.info, bg: colors.surface };
      case 'completed':
        return { bar: colors.status.success, countColor: colors.status.success, bg: colors.surface };
      default:
        return { bar: colors.primary, countColor: colors.primary, bg: colors.surface };
    }
  };

  const accent = getAccent();

  return (
    <View style={styles.wrapper}>
      <View style={[styles.card, { backgroundColor: accent.bg }]}>
        <View style={[styles.topBar, { backgroundColor: accent.bar }]} />
        <View style={styles.content}>
          <Text style={[styles.count, { color: accent.countColor }]}>{count}</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '48%',
    marginBottom: spacing.md,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  topBar: {
    height: 4,
    width: '100%',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  count: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  title: {
    ...typography.caption,
    textTransform: 'uppercase',
    color: colors.text.secondary,
    letterSpacing: 0.6,
    textAlign: 'center',
  },
});
