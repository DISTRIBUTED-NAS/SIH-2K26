import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { colors, typography, spacing } from '../../core/theme';

interface AppTextFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export const AppTextField: React.FC<AppTextFieldProps> = ({
  label,
  error,
  style,
  ...rest
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor={colors.text.secondary}
        {...rest}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.bodyLarge,
    color: colors.text.primary,
    backgroundColor: colors.surface,
    minHeight: 48,
  },
  inputError: {
    borderColor: colors.status.error,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.status.error,
    marginTop: spacing.xs,
  },
});
