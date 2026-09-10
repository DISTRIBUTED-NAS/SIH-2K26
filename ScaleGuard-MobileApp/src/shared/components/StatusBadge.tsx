import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../core/theme';
import { InspectionStatus } from '../../features/inspections/models/InspectionModels';

interface StatusBadgeProps {
  status: InspectionStatus | 'CANCELLED' | 'VERIFIED' | 'NEEDS_FOLLOW_UP' | 'SYNCED' | 'READY_FOR_SUBMISSION' | string;
  size?: 'small' | 'medium';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'medium' }) => {
  const normalized = status.toUpperCase();

  const getStyle = () => {
    switch (normalized) {
      case 'COMPLETED':
      case 'VERIFIED':
      case 'SYNCED':
        return {
          bg: colors.status.successBg,
          border: colors.status.successBorder,
          text: colors.status.success,
          dot: colors.status.success,
          label: normalized === 'COMPLETED' ? 'COMPLETED' : normalized,
        };
      case 'IN_PROGRESS':
        return {
          bg: colors.status.infoBg,
          border: colors.status.infoBorder,
          text: colors.status.info,
          dot: colors.status.info,
          label: 'IN PROGRESS',
        };
      case 'PENDING':
      case 'FLAGGED':
      case 'READY_FOR_SUBMISSION':
        return {
          bg: colors.status.warningBg,
          border: colors.status.warningBorder,
          text: colors.status.warning,
          dot: colors.status.warning,
          label: normalized.replace(/_/g, ' '),
        };
      case 'NEEDS_FOLLOW_UP':
        return {
          bg: colors.status.warningBg,
          border: colors.status.warningBorder,
          text: colors.status.warning,
          dot: colors.status.warning,
          label: 'FOLLOW-UP',
        };
      case 'REJECTED':
      case 'CANCELLED':
        return {
          bg: colors.status.errorBg,
          border: colors.status.errorBorder,
          text: colors.status.error,
          dot: colors.status.error,
          label: normalized,
        };
      default:
        return {
          bg: colors.surfaceVariant,
          border: colors.border,
          text: colors.text.secondary,
          dot: colors.text.muted,
          label: normalized.replace(/_/g, ' '),
        };
    }
  };

  const current = getStyle();

  return (
    <View style={[
      styles.badge,
      { backgroundColor: current.bg, borderColor: current.border },
      size === 'small' && styles.badgeSmall,
    ]}>
      <View style={[styles.dot, { backgroundColor: current.dot }]} />
      <Text style={[
        styles.text,
        { color: current.text },
        size === 'small' && styles.textSmall,
      ]}>
        {current.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingVertical: 2,
    paddingHorizontal: spacing.xs + 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  text: {
    ...typography.badge,
    fontSize: 11,
  },
  textSmall: {
    fontSize: 10,
  },
});
