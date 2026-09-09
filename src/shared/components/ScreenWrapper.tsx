import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../../core/theme';

interface ScreenWrapperProps {
  children: React.ReactNode;
  isLoading?: boolean;
  hasError?: boolean;
  errorMessage?: string;
  isEmpty?: boolean;
  emptyMessage?: string;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  isLoading,
  hasError,
  errorMessage,
  isEmpty,
  emptyMessage,
}) => {
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (hasError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{errorMessage || 'An error occurred'}</Text>
      </View>
    );
  }

  if (isEmpty) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>{emptyMessage || 'No data available'}</Text>
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
    padding: spacing.lg,
  },
  errorText: {
    ...typography.bodyLarge,
    color: colors.status.error,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
