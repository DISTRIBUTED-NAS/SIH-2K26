import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { colors, typography, spacing } from '../../core/theme';

interface AppTextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  helperText?: string;
}

export const AppTextField: React.FC<AppTextFieldProps> = ({
  label,
  error,
  helperText,
  style,
  onFocus,
  onBlur,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, isFocused && styles.labelFocused, !!error && styles.labelError]}>
        {label}
      </Text>
      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          !!error && styles.inputError,
          style,
        ]}
        placeholderTextColor={colors.text.muted}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        {...rest}
      />
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.caption,
    textTransform: 'uppercase',
    color: colors.text.secondary,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  labelFocused: {
    color: colors.primary,
  },
  labelError: {
    color: colors.status.error,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 3,
    ...typography.bodyLarge,
    color: colors.text.primary,
    backgroundColor: colors.surface,
    minHeight: 50,
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  inputError: {
    borderColor: colors.status.error,
    backgroundColor: '#FFF8F8',
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.status.error,
    marginTop: 4,
  },
  helperText: {
    ...typography.bodySmall,
    color: colors.text.muted,
    marginTop: 4,
  },
});
