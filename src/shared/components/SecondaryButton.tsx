import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, typography, spacing } from '../../core/theme';

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({ 
  title, onPress, isLoading = false, disabled = false 
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, (disabled || isLoading) && styles.disabled]}
      onPress={onPress}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'transparent',
    borderColor: colors.primary,
    borderWidth: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    ...typography.bodyLarge,
    fontWeight: 'bold',
    color: colors.primary,
  },
});
