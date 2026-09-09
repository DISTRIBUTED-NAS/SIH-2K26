import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../../core/theme';

interface ScreenWrapperProps {
  children: React.ReactNode;
  isLoading?: boolean;
  loadingMessage?: string;
  hasError?: boolean;
  errorMessage?: string;
  isEmpty?: boolean;
  emptyMessage?: string;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  isLoading,
  loadingMessage = 'Loading verification records...',
  hasError,
  errorMessage,
  isEmpty,
  emptyMessage,
}) => {
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{loadingMessage}</Text>
        </View>
      </View>
    );
  }

  if (hasError) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.statusBox}>
          <Text style={styles.statusIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>System Notice</Text>
          <Text style={styles.errorText}>{errorMessage || 'An unexpected operational error occurred.'}</Text>
        </View>
      </View>
    );
  }

  if (isEmpty) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.statusBox}>
          <Text style={styles.statusIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No Records Found</Text>
          <Text style={styles.emptyText}>{emptyMessage || 'No inspection records available.'}</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  loadingBox: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxl,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  loadingText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  statusBox: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: 14,
    alignItems: 'center',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  statusIcon: {
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  errorTitle: {
    ...typography.h2,
    color: colors.status.error,
    marginBottom: spacing.xs,
  },
  errorText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  emptyText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
