import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Linking } from 'react-native';
import { colors, typography, spacing } from '../../core/theme';
import { ScreenWrapper, PrimaryButton, AppCard } from '../../shared/components';
import { useAuth } from '../auth/context/AuthContext';
import { notificationService } from '../../core/notifications/NotificationService';
import { useFocusEffect } from '@react-navigation/native';

export const ProfileScreen = () => {
  const { user, logout, isLoading } = useAuth();
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');

  const checkPermission = useCallback(async () => {
    const status = await notificationService.getPermissionStatus();
    setPermissionStatus(status);
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkPermission();
    }, [checkPermission])
  );

  const handleRequestPermission = async () => {
    await notificationService.requestPermission();
    await checkPermission();
  };

  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  const renderPermissionStatus = () => {
    if (permissionStatus === 'granted') {
      return (
        <View style={styles.permissionRow}>
          <Text style={styles.permissionIcon}>🔔</Text>
          <View style={styles.permissionInfo}>
            <Text style={styles.permissionLabel}>Notifications</Text>
            <Text style={[styles.permissionValue, { color: colors.status.success }]}>Enabled</Text>
          </View>
        </View>
      );
    }
    if (permissionStatus === 'denied') {
      return (
        <View>
          <View style={styles.permissionRow}>
            <Text style={styles.permissionIcon}>🔕</Text>
            <View style={styles.permissionInfo}>
              <Text style={styles.permissionLabel}>Notifications</Text>
              <Text style={[styles.permissionValue, { color: colors.status.error }]}>Disabled</Text>
            </View>
          </View>
          <Text style={styles.permissionHint}>
            To receive inspection reminders, enable notifications in your device settings.
          </Text>
          <TouchableOpacity style={styles.openSettingsButton} onPress={handleOpenSettings}>
            <Text style={styles.openSettingsText}>Open Device Settings</Text>
          </TouchableOpacity>
        </View>
      );
    }
    // undetermined
    return (
      <View>
        <View style={styles.permissionRow}>
          <Text style={styles.permissionIcon}>🔔</Text>
          <View style={styles.permissionInfo}>
            <Text style={styles.permissionLabel}>Notifications</Text>
            <Text style={[styles.permissionValue, { color: colors.text.secondary }]}>Not yet configured</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.openSettingsButton} onPress={handleRequestPermission}>
          <Text style={styles.openSettingsText}>Enable Notifications</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Officer info */}
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user?.fullName?.[0] ?? 'O').toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{user?.fullName || 'Officer'}</Text>
          <Text style={styles.email}>{user?.email || 'No email provided'}</Text>
          <Text style={styles.role}>Role: {user?.role || 'Unknown'}</Text>
        </View>

        {/* Notification Settings */}
        <AppCard style={styles.settingsCard}>
          <Text style={styles.settingsSectionTitle}>Notification Settings</Text>
          {renderPermissionStatus()}
          <Text style={styles.notificationNote}>
            Inspection reminders are scheduled {'\u00b030'} minutes before the scheduled time.
            Reminders help you arrive prepared — they are not a legal requirement.
          </Text>
        </AppCard>

        {/* Logout */}
        <PrimaryButton
          title="LOGOUT"
          onPress={logout}
          isLoading={isLoading}
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'space-between',
  },
  userInfo: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    ...typography.h1,
    color: '#ffffff',
  },
  name: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  email: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  role: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontWeight: 'bold',
  },
  settingsCard: {
    marginVertical: spacing.lg,
  },
  settingsSectionTitle: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.xs,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  permissionIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  permissionInfo: {
    flex: 1,
  },
  permissionLabel: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    fontWeight: '600',
  },
  permissionValue: {
    ...typography.bodyMedium,
    fontWeight: '600',
  },
  permissionHint: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  openSettingsButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  openSettingsText: {
    ...typography.bodyMedium,
    color: '#ffffff',
    fontWeight: '700',
  },
  notificationNote: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginTop: spacing.md,
  },
});
