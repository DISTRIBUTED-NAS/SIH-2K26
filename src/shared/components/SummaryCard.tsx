import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppCard } from './AppCard';
import { typography, colors, spacing } from '../../core/theme';

interface SummaryCardProps {
  title: string;
  count: number;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, count }) => {
  return (
    <View style={styles.wrapper}>
      <AppCard style={styles.card}>
        <Text style={styles.count}>{count}</Text>
        <Text style={styles.title}>{title}</Text>
      </AppCard>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '48%', // Allow two cards side by side with gap
    marginBottom: spacing.md,
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  count: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
