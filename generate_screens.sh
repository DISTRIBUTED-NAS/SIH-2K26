#!/bin/bash
SCREENS=(
  "splash/SplashScreen"
  "dashboard/DashboardScreen"
  "inspections/InspectionsScreen"
  "inspections/InspectionDetailsScreen"
  "camera/CameraScreen"
  "ai-verification/AIVerificationScreen"
  "history/HistoryScreen"
  "profile/ProfileScreen"
  "auth/LoginScreen"
)

for SCREEN in "${SCREENS[@]}"; do
  DIR="src/features/$(dirname $SCREEN)"
  FILE="src/features/$SCREEN.tsx"
  NAME=$(basename $SCREEN)
  
  mkdir -p "$DIR"
  
  cat << INNER_EOF > "$FILE"
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../core/theme';

export const $NAME = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>$NAME (Placeholder)</Text>
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
INNER_EOF
done
