import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../core/theme';

import { InspectionStatus } from '../../features/inspections/models/InspectionModels';

interface StatusBadgeProps {
  status: InspectionStatus | 'CANCELLED';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'PENDING':
        return colors.status.warning;
      case 'IN_PROGRESS':
        return colors.status.info;
      case 'COMPLETED':
        return colors.status.success;
      case 'CANCELLED':
      case 'REJECTED':
        return colors.status.error;
      case 'FLAGGED':
        return colors.status.warning;
      default:
        return colors.text.secondary;
    }
  };

  return (
    <View style={[styles.badge, { backgroundColor: getStatusColor() }]}>
      <Text style={styles.text}>{status.replace('_', ' ')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.bodySmall,
    color: colors.text.inverse,
    fontWeight: 'bold',
  },
});
