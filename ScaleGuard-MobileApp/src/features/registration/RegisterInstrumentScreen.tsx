import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper, AppTextField, PrimaryButton, SecondaryButton, AppCard } from '../../shared/components';
import { colors, spacing, typography } from '../../core/theme';
import { repository } from '../../core/storage/database/InspectionLocalRepository';
import { useAuth } from '../auth/context/AuthContext';

export const RegisterInstrumentScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [instrumentName, setInstrumentName] = useState('');
  const [instrumentModel, setInstrumentModel] = useState('');
  const [capacity, setCapacity] = useState('');
  const [businessName, setBusinessName] = useState(user?.fullName ? `${user.fullName}'s Business` : 'Ravi Traders');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [generatedRegId, setGeneratedRegId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Helper to generate Registration ID (4-5 letters + random 5-digit number)
  const generateRegistrationId = (name: string) => {
    const cleanName = name.trim().replace(/[^a-zA-Z]/g, '').toUpperCase();
    const prefix = cleanName.length >= 4 ? cleanName.substring(0, 5) : (cleanName + 'SCALE').substring(0, 5);
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    return `${prefix}-${randomNum}`;
  };

  const handleNameChange = (text: string) => {
    setInstrumentName(text);
    if (text.length >= 2) {
      setGeneratedRegId(generateRegistrationId(text));
    } else {
      setGeneratedRegId('');
    }
  };

  const handleTakePhoto = () => {
    // Navigate to Camera screen
    navigation.navigate('Camera', {
      onPhotoCaptured: (uri: string) => {
        setPhotoUri(uri);
      },
    });
  };

  const handleRegister = async () => {
    if (!instrumentName.trim()) {
      Alert.alert('Validation Error', 'Please enter the instrument name.');
      return;
    }
    if (!photoUri) {
      Alert.alert('Validation Error', 'Please capture/upload an official photograph of the instrument.');
      return;
    }

    const regId = generatedRegId || generateRegistrationId(instrumentName);

    setIsLoading(true);
    try {
      await repository.registerInstrument({
        registrationId: regId,
        userId: user?.id || 'USER001',
        businessName,
        instrumentName,
        instrumentModel,
        capacity,
        registeredImageUri: photoUri,
      });

      Alert.alert(
        'Registration Successful! 🎉',
        `Your instrument has been registered with Registration ID:\n\n${regId}\n\nThis ID is now stored and will be verified by LMO officers.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setInstrumentName('');
              setInstrumentModel('');
              setCapacity('');
              setPhotoUri(null);
              setGeneratedRegId('');
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Unable to register instrument.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerBadge}>NEW PRODUCT REGISTRATION</Text>
          <Text style={styles.title}>Register Weighing Scale</Text>
          <Text style={styles.subtitle}>
            Register a new weighing instrument. A unique Registration ID will be generated and mapped to your photo.
          </Text>
        </View>

        <AppCard style={styles.card}>
          <AppTextField
            label="Instrument / Product Name"
            placeholder="e.g. Digital Counter Scale"
            value={instrumentName}
            onChangeText={handleNameChange}
          />

          <AppTextField
            label="Model Number / Series"
            placeholder="e.g. CAS ER-Plus 30Kg"
            value={instrumentModel}
            onChangeText={setInstrumentModel}
          />

          <AppTextField
            label="Max Capacity / Range"
            placeholder="e.g. 30 kg / 5g accuracy"
            value={capacity}
            onChangeText={setCapacity}
          />

          <AppTextField
            label="Business / Enterprise Name"
            placeholder="e.g. Sri Balaji Traders"
            value={businessName}
            onChangeText={setBusinessName}
          />

          {/* Generated Registration ID Box */}
          {!!generatedRegId && (
            <View style={styles.regIdBox}>
              <Text style={styles.regIdLabel}>Auto-Generated Registration ID:</Text>
              <Text style={styles.regIdValue}>{generatedRegId}</Text>
              <Text style={styles.regIdHint}>
                This ID will be printed on the scale and detected via OCR during LMO inspection.
              </Text>
            </View>
          )}

          {/* Photo Capture Section */}
          <Text style={styles.sectionLabel}>Official Product Photograph *</Text>
          {photoUri ? (
            <View style={styles.photoPreviewContainer}>
              <Image source={{ uri: photoUri }} style={styles.photoPreview} />
              <TouchableOpacity style={styles.retakeButton} onPress={handleTakePhoto}>
                <Text style={styles.retakeText}>📷 Retake Photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.photoUploadBox} onPress={handleTakePhoto}>
              <Text style={styles.cameraIcon}>📸</Text>
              <Text style={styles.photoUploadTitle}>Capture Official Photo</Text>
              <Text style={styles.photoUploadSubtitle}>
                Ensure the scale and Registration ID label are clearly visible
              </Text>
            </TouchableOpacity>
          )}

          <PrimaryButton
            title={isLoading ? 'Registering Instrument...' : 'Complete Product Registration'}
            onPress={handleRegister}
            isLoading={isLoading}
            style={styles.submitButton}
          />
        </AppCard>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  headerContainer: {
    marginBottom: spacing.md,
  },
  headerBadge: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
  },
  card: {
    padding: spacing.md,
  },
  regIdBox: {
    backgroundColor: colors.surfaceVariant || '#f0f4f8',
    padding: spacing.md,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    marginBottom: spacing.md,
  },
  regIdLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  regIdValue: {
    ...typography.h2,
    color: colors.primary,
    letterSpacing: 1.5,
    marginVertical: spacing.xs,
  },
  regIdHint: {
    ...typography.caption,
    color: colors.text.muted || '#666',
  },
  sectionLabel: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  photoUploadBox: {
    borderWidth: 2,
    borderColor: colors.border || '#ccc',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    backgroundColor: '#FAFBFD',
    marginBottom: spacing.lg,
  },
  cameraIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  photoUploadTitle: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '600',
  },
  photoUploadSubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 2,
  },
  photoPreviewContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: spacing.xs,
  },
  retakeButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  retakeText: {
    ...typography.bodyMedium,
    color: '#FFF',
    fontWeight: '600',
  },
  submitButton: {
    marginTop: spacing.md,
  },
});
