import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../core/theme';

export type InspectionStep = 'DETAILS' | 'CHECKLIST' | 'EVIDENCE' | 'MEASUREMENTS' | 'REVIEW';

interface StepProgressIndicatorProps {
  currentStep: InspectionStep;
}

const STEPS: { key: InspectionStep; label: string; number: number }[] = [
  { key: 'DETAILS', label: 'Details', number: 1 },
  { key: 'CHECKLIST', label: 'Checklist', number: 2 },
  { key: 'EVIDENCE', label: 'Evidence', number: 3 },
  { key: 'MEASUREMENTS', label: 'Readings', number: 4 },
  { key: 'REVIEW', label: 'Review', number: 5 },
];

export const StepProgressIndicator: React.FC<StepProgressIndicatorProps> = ({ currentStep }) => {
  const currentIndex = STEPS.findIndex(s => s.key === currentStep);

  return (
    <View style={styles.container}>
      <View style={styles.stepsRow}>
        {STEPS.map((step, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <React.Fragment key={step.key}>
              {/* Connector line */}
              {index > 0 && (
                <View
                  style={[
                    styles.connector,
                    isDone && styles.connectorDone,
                  ]}
                />
              )}

              {/* Step Circle & Label */}
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.circle,
                    isDone && styles.circleDone,
                    isCurrent && styles.circleCurrent,
                  ]}
                >
                  <Text
                    style={[
                      styles.circleText,
                      isDone && styles.circleTextDone,
                      isCurrent && styles.circleTextCurrent,
                    ]}
                  >
                    {isDone ? '✓' : step.number}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    isCurrent && styles.stepLabelCurrent,
                    isDone && styles.stepLabelDone,
                  ]}
                  numberOfLines={1}
                >
                  {step.label}
                </Text>
              </View>
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: colors.borderLight,
    marginHorizontal: 4,
    marginBottom: 16,
  },
  connectorDone: {
    backgroundColor: colors.status.success,
  },
  stepItem: {
    alignItems: 'center',
    width: 58,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  circleCurrent: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  circleDone: {
    backgroundColor: colors.status.success,
    borderColor: colors.status.success,
  },
  circleText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.muted,
  },
  circleTextCurrent: {
    color: colors.text.inverse,
  },
  circleTextDone: {
    color: colors.text.inverse,
  },
  stepLabel: {
    ...typography.badge,
    fontSize: 10,
    color: colors.text.muted,
    textAlign: 'center',
  },
  stepLabelCurrent: {
    color: colors.primary,
    fontWeight: '800',
  },
  stepLabelDone: {
    color: colors.status.success,
    fontWeight: '700',
  },
});
