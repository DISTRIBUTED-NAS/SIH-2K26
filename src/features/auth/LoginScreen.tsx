import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { ScreenWrapper, AppTextField, PrimaryButton } from '../../shared/components';
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
      setEmailError('Please enter your email.');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Please enter your password.');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    
    try {
      await login({ email, password });
      // Navigation is handled by RootNavigator reacting to AuthContext state
    } catch (error: any) {
      if (error instanceof AppError) {
        setFormError(error.userMessage);
      } else {
        setFormError(error.message || 'An unexpected error occurred.');
      }
    }
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.formContainer}>
          <Text style={styles.brand}>ScaleGuard</Text>
          <Text style={styles.subtitle}>LMO Officer Login</Text>

          {!!formError && (
            <Text style={styles.formErrorText}>{formError}</Text>
          )}

          <AppTextField
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            error={emailError}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />

          <AppTextField
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            error={passwordError}
            secureTextEntry
            editable={!isLoading}
          />

          <PrimaryButton
            title={isLoading ? "Logging in..." : "LOGIN"}
            onPress={handleLogin}
            isLoading={isLoading}
          />

          <TouchableOpacity style={styles.forgotPasswordButton} disabled={isLoading}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  brand: {
    ...typography.h1,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  formErrorText: {
    ...typography.bodyMedium,
    color: colors.status.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  forgotPasswordButton: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  forgotPasswordText: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontWeight: '600',
  },
});
