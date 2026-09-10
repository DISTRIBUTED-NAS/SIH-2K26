import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../../core/theme';

export const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ScaleGuard</Text>
      <Text style={styles.subtitle}>LMO Officer App</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  title: {
    ...typography.h1,
    color: colors.text.inverse,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.bodyLarge,
    color: colors.text.inverse,
  },
});
