import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../core/navigation/types';
import { colors, typography, spacing } from '../../core/theme';
import { ScreenWrapper, AppCard, PrimaryButton, SecondaryButton } from '../../shared/components';

type AIRouteProp = RouteProp<RootStackParamList, 'AIVerification'>;
type AINavProp = NativeStackNavigationProp<RootStackParamList, 'AIVerification'>;

export const AIVerificationScreen = () => {
  const route = useRoute<AIRouteProp>();
  const navigation = useNavigation<AINavProp>();
  const photoUri = route.params?.photoUri;

  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnalyzing(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ScreenWrapper>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>AUTOMATED FORENSIC METROLOGY</Text>
          </View>
          <Text style={styles.title}>AI Visual Verification</Text>
          <Text style={styles.subtitle}>
            Computer-vision model analysis against certified Weights & Measures type-approval database.
          </Text>
        </View>

        {/* Evidence Photo */}
        <AppCard style={styles.card}>
          <Text style={styles.cardTitle}>Inspected Instrument Evidence</Text>
          <View style={styles.imageContainer}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.evidenceImage} />
            ) : (
              <View style={styles.noImageBox}>
                <Text style={styles.noImageText}>No evidence photo provided</Text>
              </View>
            )}
            <View style={styles.scanOverlay}>
              <Text style={styles.scanText}>✓ CV MODEL v3.4.2 [EMBEDDED]</Text>
            </View>
          </View>
        </AppCard>

        {/* Analysis Status / Gauge */}
        <AppCard style={styles.card}>
          <Text style={styles.cardTitle}>Verification Analysis Report</Text>

          {isAnalyzing ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Running neural model comparison...</Text>
              <Text style={styles.loadingSubtext}>Extracting serial markings & seal tamper points</Text>
            </View>
          ) : (
            <View>
              <View style={styles.scoreRow}>
                <View style={styles.scoreCircle}>
                  <Text style={styles.scoreNumber}>96</Text>
                  <Text style={styles.scorePercent}>%</Text>
                </View>
                <View style={styles.scoreInfo}>
                  <Text style={styles.scoreStatus}>CONCORDANCE CONFIRMED</Text>
                  <Text style={styles.scoreDesc}>
                    High match confidence with certified manufacturer pattern specification.
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Checklist verification items */}
              <View style={styles.itemRow}>
                <Text style={styles.itemIcon}>✓</Text>
                <View style={styles.itemTextCol}>
                  <Text style={styles.itemLabel}>Serial Plate Legibility</Text>
                  <Text style={styles.itemSub}>OCR extracted with 99.1% fidelity</Text>
                </View>
                <Text style={styles.passTag}>PASS</Text>
              </View>

              <View style={styles.itemRow}>
                <Text style={styles.itemIcon}>✓</Text>
                <View style={styles.itemTextCol}>
                  <Text style={styles.itemLabel}>Seal Integrity & Wire Latch</Text>
                  <Text style={styles.itemSub}>No signs of physical incision or bypass</Text>
                </View>
                <Text style={styles.passTag}>INTACT</Text>
              </View>

              <View style={styles.itemRow}>
                <Text style={styles.itemIcon}>✓</Text>
                <View style={styles.itemTextCol}>
                  <Text style={styles.itemLabel}>Chassis Geometry Match</Text>
                  <Text style={styles.itemSub}>Class III benchmark tolerance within 0.4mm</Text>
                </View>
                <Text style={styles.passTag}>MATCH</Text>
              </View>

              <View style={styles.disclaimerBox}>
                <Text style={styles.disclaimerTitle}>STATUTORY NOTICE</Text>
                <Text style={styles.disclaimerBody}>
                  Computer-assisted verification is advisory only. The Legal Metrology Officer holds sole statutory authority under Section 24 of the Legal Metrology Act, 2009.
                </Text>
              </View>
            </View>
          )}
        </AppCard>

        {/* Navigation Action */}
        <View style={styles.footer}>
          <PrimaryButton 
            title="← Return to Inspection Dossier" 
            onPress={() => navigation.goBack()} 
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
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.md,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(15, 58, 102, 0.08)',
    borderColor: 'rgba(15, 58, 102, 0.2)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.6,
  },
  title: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: 4,
    lineHeight: 18,
  },
  card: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  imageContainer: {
    position: 'relative',
    height: 180,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
  },
  evidenceImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  noImageBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  scanOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  scanText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00E5FF',
    letterSpacing: 0.6,
  },
  loadingBox: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.primary,
    marginTop: spacing.md,
  },
  loadingSubtext: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 4,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  scoreCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(46, 125, 50, 0.12)',
    borderWidth: 2,
    borderColor: colors.status.success,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginRight: spacing.md,
  },
  scoreNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.status.success,
  },
  scorePercent: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.status.success,
    marginTop: 6,
  },
  scoreInfo: {
    flex: 1,
  },
  scoreStatus: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.status.success,
    letterSpacing: 0.5,
  },
  scoreDesc: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemIcon: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.status.success,
    marginRight: 10,
  },
  itemTextCol: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
  },
  itemSub: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  passTag: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.status.success,
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  disclaimerBox: {
    marginTop: spacing.md,
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1,
    borderRadius: 6,
    padding: spacing.sm,
  },
  disclaimerTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  disclaimerBody: {
    fontSize: 10,
    color: '#92400E',
    lineHeight: 15,
  },
  footer: {
    marginTop: spacing.sm,
  },
});

