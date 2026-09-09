import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../core/navigation/types';
import { colors, typography, spacing } from '../../core/theme';
import { PrimaryButton, SecondaryButton } from '../../shared/components';
import { repository } from '../../core/storage/database/InspectionLocalRepository';

type CameraNavProp = NativeStackNavigationProp<RootStackParamList, 'Camera'>;
type CameraRouteProp = RouteProp<RootStackParamList, 'Camera'>;

export const CameraScreen = () => {
  const navigation = useNavigation<CameraNavProp>();
  const route = useRoute<CameraRouteProp>();
  const { inspectionId } = route.params;
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const [facing, setFacing] = useState<CameraType>('back');
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // 1. Handle permissions
  if (!permission) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.message}>Camera access is required to capture inspection evidence.</Text>
        <PrimaryButton title="Grant Permission" onPress={requestPermission} />
        <View style={{ height: spacing.md }} />
        <SecondaryButton title="Go Back" onPress={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  // 2. Capture Photo
  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8, // Good balance of quality and size for field evidence
      });
      if (photo && photo.uri) {
        setCapturedImageUri(photo.uri);
      }
    } catch (error) {
      console.error('Failed to capture photo:', error);
      // In a real app we'd show an alert, but for now we just fail gracefully
    } finally {
      setIsCapturing(false);
    }
  };

  // 3. Actions for the captured photo
  const handleRetake = () => {
    setCapturedImageUri(null);
  };

  const handleUsePhoto = async () => {
    if (capturedImageUri) {
      try {
        await repository.savePhoto(inspectionId, capturedImageUri);
        navigation.navigate({
          name: 'InspectionChecklist',
          params: { inspectionId },
          merge: true,
        });
      } catch (e) {
        console.error('Failed to save photo:', e);
      }
    }
  };

  // Preview Mode
  if (capturedImageUri) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Photo Evidence</Text>
          <Text style={styles.headerSubtitle}>Is this photo clear enough?</Text>
        </View>

        <Image source={{ uri: capturedImageUri }} style={styles.previewImage} />

        <View style={styles.previewControls}>
          <SecondaryButton 
            title="Retake" 
            onPress={handleRetake} 
          />
          <View style={{ width: spacing.md }} />
          <View style={styles.flex1}>
            <PrimaryButton 
              title="Use Photo" 
              onPress={handleUsePhoto} 
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Camera Mode
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.overlayHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.guidanceText}>Position instrument in frame</Text>
      </View>

      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.cameraControls}>
          {isCapturing ? (
            <ActivityIndicator size="large" color="#ffffff" style={styles.captureButtonOuter} />
          ) : (
            <TouchableOpacity 
              style={styles.captureButtonOuter} 
              onPress={handleCapture}
              accessibilityLabel="Capture Photo"
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          )}
        </View>
      </CameraView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Black background for camera
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  message: {
    ...typography.bodyLarge,
    textAlign: 'center',
    marginBottom: spacing.xl,
    color: colors.text.primary,
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  backButton: {
    padding: spacing.xs,
  },
  backText: {
    ...typography.bodyLarge,
    color: '#fff',
    fontWeight: '600',
  },
  guidanceText: {
    ...typography.bodyMedium,
    color: '#fff',
    alignSelf: 'center',
    marginRight: spacing.xl, // offset the back button
  },
  cameraControls: {
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  captureButtonOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.primary,
  },
  headerSubtitle: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
  },
  previewImage: {
    flex: 1,
    resizeMode: 'contain',
    width: '100%',
  },
  previewControls: {
    flexDirection: 'row',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    paddingBottom: spacing.xxl,
  },
  flex1: {
    flex: 1,
  },
});
