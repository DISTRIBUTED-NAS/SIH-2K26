import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { ScreenWrapper, AppTextField, PrimaryButton, AppCard } from '../../shared/components';
import { colors, typography, spacing } from '../../core/theme';
import { useAuth } from './context/AuthContext';
import { AppError } from '../../core/errors/AppError';

export const LoginScreen = () => {
  const { login, isLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');

  const validate = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setFormError('');

    if (!email) {
      setEmailError('Please enter your officer email address.');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid department email address.');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Please enter your security password.');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    
    try {
      await login({ email, password });
    } catch (error: unknown) {
      if (error instanceof AppError) {
        setFormError(error.userMessage);
      } else {
        const err = error as { message?: string };
        setFormError(err.message || 'Authentication failed. Please verify credentials.');
      }
    }
  };

  const handleFillDemo = () => {
    setEmail('officer@lmo.gov.in');
    setPassword('Password@123');
    setEmailError('');
    setPasswordError('');
    setFormError('');
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView 
        style={styles.flex} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Government Official Top Banner */}
          <View style={styles.govBanner}>
            <Text style={styles.nationalEmblem}>🏛️</Text>
            <Text style={styles.govText}>GOVERNMENT FIELD OPERATIONS</Text>
            <Text style={styles.deptText}>LEGAL METROLOGY DEPARTMENT</Text>
            <View style={styles.goldDivider} />
          </View>

          {/* Main Card */}
          <AppCard style={styles.cardContainer}>
            <View style={styles.cardHeader}>
              <View style={styles.badgePill}>
                <Text style={styles.badgePillText}>LMO OFFICER PORTAL</Text>
              </View>
              <Text style={styles.portalTitle}>ScaleGuard Terminal</Text>
              <Text style={styles.portalSubtitle}>
                Enter your authorized credentials to access assigned field inspections
              </Text>
            </View>

            {!!formError && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.formErrorText}>{formError}</Text>
              </View>
            )}

            <AppTextField
              label="Officer Email / ID"
              placeholder="e.g. officer@lmo.gov.in"
              value={email}
              onChangeText={setEmail}
              error={emailError}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />

            <AppTextField
              label="Security Password"
              placeholder="Enter your security password"
              value={password}
              onChangeText={setPassword}
              error={passwordError}
              secureTextEntry
              editable={!isLoading}
            />

            <PrimaryButton
              title={isLoading ? "Verifying Credentials..." : "Sign In to Field Terminal"}
              onPress={handleLogin}
              isLoading={isLoading}
              style={styles.loginButton}
            />

            {/* Quick Fill Demo Button for Evaluators */}
            <TouchableOpacity 
              style={styles.demoFillButton} 
              onPress={handleFillDemo}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text style={styles.demoFillText}>Fill Official Test Credentials</Text>
            </TouchableOpacity>
          </AppCard>

          {/* Legal / Security Footer */}
          <View style={styles.securityFooter}>
            <Text style={styles.securityIcon}>🔒</Text>
            <Text style={styles.securityText}>
              Statutory verification terminal governed under Legal Metrology Act, 2009. Unauthorized access is prohibited.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  govBanner: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  nationalEmblem: {
    fontSize: 40,
    marginBottom: 6,
  },
  govText: {
    ...typography.caption,
    color: colors.secondary,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  deptText: {
    ...typography.h2,
    fontSize: 17,
    color: colors.primary,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  goldDivider: {
    width: 60,
    height: 3,
    backgroundColor: colors.secondary,
    borderRadius: 2,
    marginTop: 8,
  },
  cardContainer: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  badgePill: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C7D9ED',
    marginBottom: 8,
  },
  badgePillText: {
    ...typography.badge,
    color: colors.primary,
    fontWeight: '800',
    fontSize: 10,
  },
  portalTitle: {
    ...typography.h1,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  portalSubtitle: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.errorBg,
    borderColor: colors.status.errorBorder,
    borderWidth: 1,
    padding: spacing.sm + 2,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  errorIcon: {
    marginRight: 8,
    fontSize: 16,
  },
  formErrorText: {
    ...typography.bodySmall,
    color: colors.status.error,
    fontWeight: '600',
    flex: 1,
  },
  loginButton: {
    marginTop: spacing.sm,
  },
  demoFillButton: {
    marginTop: spacing.md,
    alignItems: 'center',
    paddingVertical: 8,
  },
  demoFillText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  securityFooter: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.sm,
    opacity: 0.8,
  },
  securityIcon: {
    fontSize: 13,
    marginRight: 8,
    marginTop: 2,
  },
  securityText: {
    ...typography.bodySmall,
    fontSize: 11,
    color: colors.text.muted,
    flex: 1,
    lineHeight: 16,
  },
});
