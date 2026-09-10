import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, ActivityIndicator, StatusBar } from 'react-native';
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
  const targetInspectionId = route.params?.inspectionId || 'INSP-2023-001';
  const onPhotoCaptured = route.params?.onPhotoCaptured;
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
        <View style={styles.permissionCard}>
          <Text style={styles.permissionIcon}>📷</Text>
          <Text style={styles.permissionTitle}>Field Camera Access Required</Text>
          <Text style={styles.message}>
            Legal Metrology regulations require high-resolution photographic evidence of serial number plates and seal integrity.
          </Text>
          <PrimaryButton title="Grant Camera Permission" onPress={requestPermission} />
          <View style={{ height: spacing.sm }} />
          <SecondaryButton title="Cancel & Return" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  // 2. Capture Photo
  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
      });
      if (photo && photo.uri) {
        setCapturedImageUri(photo.uri);
      }
    } catch (error) {
      console.error('Failed to capture photo:', error);
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
        if (onPhotoCaptured) {
          onPhotoCaptured(capturedImageUri);
          navigation.goBack();
          return;
        }
        await repository.savePhoto(targetInspectionId, capturedImageUri);
        navigation.navigate('InspectionChecklist', { inspectionId: targetInspectionId });
      } catch (e) {
        console.error('Failed to save photo:', e);
      }
    }
  };

  // Preview Mode
  if (capturedImageUri) {
    return (
      <SafeAreaView style={styles.previewContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0B132B" />
        <View style={styles.previewHeader}>
          <View style={styles.previewTag}>
            <Text style={styles.previewTagText}>CASE: #{targetInspectionId.slice(-6).toUpperCase()}</Text>
          </View>
          <Text style={styles.previewTitle}>Evidence Quality Check</Text>
          <Text style={styles.previewSubtitle}>
            Verify serial number, verification mark, and lead seal are legible and in focus.
          </Text>
        </View>

        <View style={styles.imageWrapper}>
          <Image source={{ uri: capturedImageUri }} style={styles.previewImage} />
          <View style={styles.watermarkTag}>
            <Text style={styles.watermarkText}>LEGAL METROLOGY DEPT • FIELD EVIDENCE RECORD</Text>
          </View>
        </View>

        <View style={styles.previewControls}>
          <SecondaryButton 
            title="Retake Photo" 
            onPress={handleRetake} 
            style={styles.retakeBtn}
          />
          <View style={{ width: spacing.md }} />
          <View style={styles.flex1}>
            <PrimaryButton 
              title="Confirm & Attach Evidence" 
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
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Viewfinder Header */}
      <View style={styles.overlayHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>✕ Cancel</Text>
        </TouchableOpacity>
        <View style={styles.caseBadge}>
          <Text style={styles.caseBadgeText}>CASE #{targetInspectionId.slice(-6).toUpperCase()}</Text>
        </View>
      </View>

      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        {/* Reticle Target Overlay */}
        <View style={styles.reticleContainer}>
          <View style={styles.reticleFrame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
            
            <View style={styles.reticleLabelBox}>
              <Text style={styles.reticleLabel}>ALIGN SERIAL PLATE & SEAL IN FRAME</Text>
            </View>
          </View>
        </View>

        {/* Bottom Shutter Controls */}
        <View style={styles.cameraControls}>
          <Text style={styles.guidanceNotice}>Hold device steady in good lighting</Text>
          <View style={styles.shutterRow}>
            <View style={{ width: 60 }} />
            {isCapturing ? (
              <View style={styles.captureButtonOuter}>
                <ActivityIndicator size="large" color="#ffffff" />
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.captureButtonOuter} 
                onPress={handleCapture}
                accessibilityLabel="Capture Photo Evidence"
                activeOpacity={0.8}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.flipButton}
              onPress={() => setFacing(current => current === 'back' ? 'front' : 'back')}
            >
              <Text style={styles.flipText}>🔄</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#0A1128',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  permissionCard: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
  },
  permissionIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  permissionTitle: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    ...typography.bodyMedium,
    textAlign: 'center',
    marginBottom: spacing.xl,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },
  overlayHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  backText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '700',
  },
  caseBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  caseBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  reticleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  reticleFrame: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: 320,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#00E5FF',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3.5,
    borderLeftWidth: 3.5,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3.5,
    borderRightWidth: 3.5,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3.5,
    borderLeftWidth: 3.5,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3.5,
    borderRightWidth: 3.5,
    borderBottomRightRadius: 4,
  },
  reticleLabelBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  reticleLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00E5FF',
    letterSpacing: 0.8,
  },
  cameraControls: {
    paddingBottom: spacing.xxl,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingTop: spacing.md,
  },
  guidanceNotice: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing.md,
    fontWeight: '500',
  },
  shutterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: spacing.xl,
  },
  captureButtonOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  captureButtonInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#ffffff',
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipText: {
    fontSize: 22,
  },
  previewHeader: {
    padding: spacing.md,
    paddingTop: spacing.lg,
    backgroundColor: '#0F3A66',
  },
  previewTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 6,
  },
  previewTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  previewTitle: {
    ...typography.h2,
    color: '#ffffff',
  },
  previewSubtitle: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    lineHeight: 18,
  },
  imageWrapper: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000000',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  watermarkTag: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  watermarkText: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  previewControls: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: '#0F3A66',
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  retakeBtn: {
    minWidth: 110,
  },
  flex1: {
    flex: 1,
  },
});

