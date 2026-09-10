import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert, ScrollView } from 'react-native';
import { colors, typography, spacing } from '../../core/theme';
import { ScreenWrapper, PrimaryButton, SecondaryButton, AppCard } from '../../shared/components';
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

  const confirmLogout = () => {
    Alert.alert(
      'Sign Out of Terminal',
      'Are you sure you want to end your current duty session? Unsynced inspections stored locally will be preserved on this terminal.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout }
      ]
    );
  };

  const renderPermissionStatus = () => {
    if (permissionStatus === 'granted') {
      return (
        <View style={styles.permissionRow}>
          <View style={styles.permissionIconBox}>
            <Text style={styles.permissionIcon}>🔔</Text>
          </View>
          <View style={styles.permissionInfo}>
            <Text style={styles.permissionLabel}>Statutory Inspection Reminders</Text>
            <Text style={styles.permissionSub}>Scheduled alerts dispatched 30m prior</Text>
          </View>
          <View style={styles.enabledBadge}>
            <Text style={styles.enabledBadgeText}>ACTIVE</Text>
          </View>
        </View>
      );
    }
    if (permissionStatus === 'denied') {
      return (
        <View>
          <View style={styles.permissionRow}>
            <View style={[styles.permissionIconBox, { backgroundColor: 'rgba(220, 38, 38, 0.1)' }]}>
              <Text style={styles.permissionIcon}>🔕</Text>
            </View>
            <View style={styles.permissionInfo}>
              <Text style={styles.permissionLabel}>Statutory Inspection Reminders</Text>
              <Text style={[styles.permissionSub, { color: colors.status.error }]}>System alerts blocked</Text>
            </View>
            <View style={styles.disabledBadge}>
              <Text style={styles.disabledBadgeText}>OFF</Text>
            </View>
          </View>
          <Text style={styles.permissionHint}>
            Alerts for scheduled field appointments are silenced. Enable notifications in device system settings.
          </Text>
          <TouchableOpacity style={styles.openSettingsButton} onPress={handleOpenSettings}>
            <Text style={styles.openSettingsText}>Configure Device Settings →</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View>
        <View style={styles.permissionRow}>
          <View style={styles.permissionIconBox}>
            <Text style={styles.permissionIcon}>🔔</Text>
          </View>
          <View style={styles.permissionInfo}>
            <Text style={styles.permissionLabel}>Statutory Inspection Reminders</Text>
            <Text style={styles.permissionSub}>Configuration pending</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.openSettingsButton} onPress={handleRequestPermission}>
          <Text style={styles.openSettingsText}>Grant Notification Permissions</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScreenWrapper>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Department Banner */}
        <View style={styles.govBanner}>
          <View style={styles.govPill}>
            <Text style={styles.govPillText}>GOVERNMENT OF INDIA • LEGAL METROLOGY DIVISION</Text>
          </View>
          <Text style={styles.screenTitle}>Officer Credential</Text>
          <Text style={styles.screenSubtitle}>
            Statutory Field Inspector Service Docket & Secure Terminal Management
          </Text>
        </View>

        {/* Officer Official Service Card */}
        <AppCard style={styles.officerCard}>
          <View style={styles.officerCardTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(user?.fullName?.[0] ?? 'O').toUpperCase()}</Text>
            </View>
            <View style={styles.officerDetails}>
              <View style={styles.activeStatusPill}>
                <View style={styles.statusDot} />
                <Text style={styles.activeStatusText}>ON ACTIVE SERVICE</Text>
              </View>
              <Text style={styles.name}>{user?.fullName || 'Legal Metrology Officer'}</Text>
              <Text style={styles.cadreText}>Inspector Cadre • Gr. II</Text>
              <Text style={styles.badgeNumber}>BADGE: LMO-INSP-{user?.id ? user.id.slice(-6).toUpperCase() : '774921'}</Text>
            </View>
          </View>

          <View style={styles.dossierDivider} />

          <View style={styles.dossierRow}>
            <Text style={styles.dossierKey}>Official Email:</Text>
            <Text style={styles.dossierVal}>{user?.email || 'officer@metrology.gov.in'}</Text>
          </View>
          <View style={styles.dossierRow}>
            <Text style={styles.dossierKey}>Jurisdiction Zone:</Text>
            <Text style={styles.dossierVal}>Central Metrology Zone 4</Text>
          </View>
          <View style={styles.dossierRow}>
            <Text style={styles.dossierKey}>Enforcement Act:</Text>
            <Text style={styles.dossierVal}>Legal Metrology Act, 2009</Text>
          </View>
        </AppCard>

        {/* Notification Settings Card */}
        <AppCard style={styles.settingsCard}>
          <View style={styles.settingsHeader}>
            <Text style={styles.settingsIcon}>⚙</Text>
            <View style={styles.settingsTitleCol}>
              <Text style={styles.settingsSectionTitle}>Alerts & Operational Dispatch</Text>
              <Text style={styles.settingsSectionSub}>Field schedule automated notifications</Text>
            </View>
          </View>
          {renderPermissionStatus()}
        </AppCard>

        {/* Terminal Diagnostic Information */}
        <AppCard style={styles.terminalCard}>
          <View style={styles.settingsHeader}>
            <Text style={styles.settingsIcon}>📱</Text>
            <View style={styles.settingsTitleCol}>
              <Text style={styles.settingsSectionTitle}>Terminal Diagnostics</Text>
              <Text style={styles.settingsSectionSub}>Encrypted hardware & database state</Text>
            </View>
          </View>

          <View style={styles.diagRow}>
            <Text style={styles.diagKey}>Storage Engine:</Text>
            <Text style={styles.diagVal}>SQLite 3.45 (Local Secure Store)</Text>
          </View>
          <View style={styles.diagRow}>
            <Text style={styles.diagKey}>Encryption Standard:</Text>
            <Text style={styles.diagVal}>AES-256 Field Envelope</Text>
          </View>
          <View style={styles.diagRow}>
            <Text style={styles.diagKey}>Terminal Build:</Text>
            <Text style={styles.diagVal}>ScaleGuard v2.4.0 (SIH-2K26)</Text>
          </View>
          <View style={styles.diagRow}>
            <Text style={styles.diagKey}>Cloud Gateway:</Text>
            <Text style={styles.diagVal}>api.metrology.nic.in [Online]</Text>
          </View>
        </AppCard>

        {/* Logout / Termination Button */}
        <View style={styles.logoutContainer}>
          <SecondaryButton
            title="End Shift / Sign Out Terminal"
            onPress={confirmLogout}
            style={styles.logoutBtn}
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl + 20,
  },
  govBanner: {
    marginBottom: spacing.md,
  },
  govPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(15, 58, 102, 0.08)',
    borderColor: 'rgba(15, 58, 102, 0.2)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 6,
  },
  govPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.6,
  },
  screenTitle: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: '700',
  },
  screenSubtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: 2,
    lineHeight: 18,
  },
  officerCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  officerCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
  },
  officerDetails: {
    flex: 1,
  },
  activeStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.status.success,
    marginRight: 5,
  },
  activeStatusText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.status.success,
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  cadreText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '600',
    marginTop: 1,
  },
  badgeNumber: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.6,
    marginTop: 2,
  },
  dossierDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },
  dossierRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  dossierKey: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    width: 120,
    fontWeight: '600',
  },
  dossierVal: {
    ...typography.bodySmall,
    color: colors.text.primary,
    flex: 1,
    fontWeight: '600',
  },
  settingsCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  terminalCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingsIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  settingsTitleCol: {
    flex: 1,
  },
  settingsSectionTitle: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.primary,
  },
  settingsSectionSub: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  permissionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 58, 102, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  permissionIcon: {
    fontSize: 18,
  },
  permissionInfo: {
    flex: 1,
  },
  permissionLabel: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    fontWeight: '700',
  },
  permissionSub: {
    fontSize: 11,
    color: colors.status.success,
    fontWeight: '600',
  },
  enabledBadge: {
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  enabledBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.status.success,
    letterSpacing: 0.5,
  },
  disabledBadge: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  disabledBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.status.error,
    letterSpacing: 0.5,
  },
  permissionHint: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  openSettingsButton: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  openSettingsText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '700',
  },
  diagRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  diagKey: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    width: 130,
    fontWeight: '600',
  },
  diagVal: {
    ...typography.bodySmall,
    color: colors.text.primary,
    flex: 1,
    fontWeight: '600',
  },
  logoutContainer: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  logoutBtn: {
    borderColor: colors.status.error,
  },
});

