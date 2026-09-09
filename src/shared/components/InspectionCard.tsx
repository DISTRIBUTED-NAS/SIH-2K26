import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppCard } from './AppCard';
import { StatusBadge } from './StatusBadge';
import { SecondaryButton } from './SecondaryButton';
import { typography, colors, spacing } from '../../core/theme';
import { InspectionSummary } from '../../features/inspections/models/InspectionModels';

interface InspectionCardProps {
  inspection: InspectionSummary;
  onViewDetails: (id: string) => void;
}

export const InspectionCard: React.FC<InspectionCardProps> = ({ inspection, onViewDetails }) => {
  return (
    <AppCard style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.time}>{inspection.scheduledTime}</Text>
        <StatusBadge status={inspection.status} />
      </View>
      
      <Text style={styles.applicationId}>Application #{inspection.applicationId}</Text>
      <Text style={styles.instrumentName}>{inspection.instrumentName}</Text>
      <Text style={styles.location}>📍 {inspection.location}</Text>
      
      <View style={styles.footerRow}>
        <SecondaryButton 
          title="View Details" 
          onPress={() => onViewDetails(inspection.id)} 
        />
      </View>
    </AppCard>
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
    marginBottom: spacing.sm,
  },
  time: {
    ...typography.h2,
    color: colors.text.primary,
  },
  applicationId: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  instrumentName: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  location: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  footerRow: {
    marginTop: spacing.sm,
  },
});
