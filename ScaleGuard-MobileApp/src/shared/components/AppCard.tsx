import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, spacing } from '../../core/theme';

interface AppCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'elevated' | 'outlined' | 'tonal';
}

export const AppCard: React.FC<AppCardProps> = ({ children, style, variant = 'elevated' }) => {
  return (
    <View style={[
      styles.card,
      variant === 'outlined' && styles.outlined,
      variant === 'tonal' && styles.tonal,
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  outlined: {
    elevation: 0,
    shadowOpacity: 0,
    borderColor: colors.border,
  },
  tonal: {
    backgroundColor: colors.surfaceVariant,
    borderColor: colors.borderLight,
    elevation: 0,
    shadowOpacity: 0,
  },
});
