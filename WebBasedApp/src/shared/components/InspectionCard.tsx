import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AppCard } from './AppCard';
import { StatusBadge } from './StatusBadge';
import { typography, colors, spacing } from '../../core/theme';
import { InspectionSummary } from '../../features/inspections/models/InspectionModels';

interface InspectionCardProps {
  inspection: InspectionSummary;
  onViewDetails: (id: string) => void;
}

export const InspectionCard: React.FC<InspectionCardProps> = ({ inspection, onViewDetails }) => {
  return (
    <AppCard style={styles.card}>
      {/* Top row: Case ID & Status Badge */}
      <View style={styles.headerRow}>
        <View style={styles.caseIdBadge}>
          <Text style={styles.caseIdText}>CASE #{inspection.applicationId}</Text>
        </View>
        <StatusBadge status={inspection.status} size="small" />
      </View>
      
      {/* Business Name */}
      <Text style={styles.businessName} numberOfLines={1}>
        {inspection.businessName || 'Business Verification'}
      </Text>
      
      {/* Instrument Spec Badge */}
      <View style={styles.instrumentRow}>
        <View style={styles.instrumentPill}>
          <Text style={styles.instrumentPillText}>⚖️  {inspection.instrumentName}</Text>
        </View>
        {inspection.instrumentModel ? (
          <Text style={styles.modelText} numberOfLines={1}>
            Mod: {inspection.instrumentModel}
          </Text>
        ) : null}
      </View>

      {/* Meta Row: Time & Location */}
      <View style={styles.metaContainer}>
        <View style={styles.metaRow}>
          <Text style={styles.metaIcon}>🕒</Text>
          <Text style={styles.metaText}>
            {inspection.scheduledDate ? `${inspection.scheduledDate} • ` : ''}{inspection.scheduledTime}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaIcon}>📍</Text>
          <Text style={styles.metaText} numberOfLines={1}>{inspection.location}</Text>
        </View>
      </View>
      
      {/* Bottom Action */}
      <TouchableOpacity 
        style={styles.actionButton} 
        onPress={() => onViewDetails(inspection.id)}
        activeOpacity={0.7}
      >
        <Text style={styles.actionText}>Inspect Application</Text>
        <Text style={styles.actionArrow}>→</Text>
      </TouchableOpacity>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  caseIdBadge: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C7D9ED',
  },
  caseIdText: {
    ...typography.badge,
    color: colors.primary,
    fontWeight: '800',
  },
  businessName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  instrumentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  instrumentPill: {
    backgroundColor: colors.surfaceVariant,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  instrumentPillText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  modelText: {
    ...typography.bodySmall,
    color: colors.text.muted,
    flex: 1,
  },
  metaContainer: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    marginBottom: 12,
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  metaText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C7D9ED',
  },
  actionText: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontWeight: '700',
    marginRight: 6,
  },
  actionArrow: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '700',
  },
});
