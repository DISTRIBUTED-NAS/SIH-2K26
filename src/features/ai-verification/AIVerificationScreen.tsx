import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../core/theme';

export const AIVerificationScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>AIVerificationScreen (Placeholder)</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  text: {
    ...typography.h2,
    color: colors.text.primary,
  },
});
