import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { SplashScreen } from '../../features/splash/SplashScreen';
import { LoginScreen } from '../../features/auth/LoginScreen';
import { AppTabNavigator } from './AppTabNavigator';
import { InspectionDetailsScreen } from '../../features/inspections/InspectionDetailsScreen';
import { InspectionChecklistScreen } from '../../features/inspections/InspectionChecklistScreen';
import { InspectionMeasurementsScreen } from '../../features/inspections/InspectionMeasurementsScreen';
import { InspectionReviewScreen } from '../../features/inspections/InspectionReviewScreen';
import { CameraScreen } from '../../features/camera/CameraScreen';
import { AIVerificationScreen } from '../../features/ai-verification/AIVerificationScreen';
import { RegisterInstrumentScreen } from '../../features/registration/RegisterInstrumentScreen';
import { LMOAssistantScreen } from '../../features/assistant/LMOAssistantScreen';
import { colors } from '../theme';
import { useAuth } from '../../features/auth/context/AuthContext';
import * as Notifications from 'expo-notifications';
import { notificationService } from '../notifications/NotificationService';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { isAuthenticated, restoreSession } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      await restoreSession();
      if (isMounted) {
        setIsInitializing(false);
      }
    };
    initAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    try {
      const subscription = Notifications.addNotificationResponseReceivedListener(response => {
        const navData = notificationService.extractNavigationData(response);
        if (!navData?.inspectionId) return;

        const nav = navigationRef.current;
        if (!nav?.isReady()) return;

        nav.navigate('InspectionReview', { inspectionId: navData.inspectionId });
      });

      return () => {
        try {
          subscription?.remove();
        } catch {}
      };
    } catch (e) {
      console.warn('[RootNavigator] Could not attach notification response listener:', e);
    }
  }, []);

  if (isInitializing) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { 
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.text.inverse,
          headerTitleStyle: {
            fontSize: 17,
            fontWeight: '700',
            color: colors.text.inverse,
          },
        }}
      >
        {isAuthenticated ? (
          <Stack.Group>
            <Stack.Screen
              name="AppShell"
              component={AppTabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="InspectionDetails"
              component={InspectionDetailsScreen}
              options={{ title: 'Inspection Details' }}
            />
            <Stack.Screen
              name="InspectionChecklist"
              component={InspectionChecklistScreen}
              options={{ title: 'Inspection Checklist' }}
            />
            <Stack.Screen
              name="InspectionMeasurements"
              component={InspectionMeasurementsScreen}
              options={{ title: 'Measurement Readings' }}
            />
            <Stack.Screen
              name="InspectionReview"
              component={InspectionReviewScreen}
              options={{ title: 'Review Inspection' }}
            />
            <Stack.Screen
              name="Camera"
              component={CameraScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AIVerification"
              component={AIVerificationScreen}
              options={{ title: 'AI Verification' }}
            />
            <Stack.Screen
              name="RegisterInstrument"
              component={RegisterInstrumentScreen}
              options={{ title: 'Register Instrument' }}
            />
            <Stack.Screen
              name="LMOAssistant"
              component={LMOAssistantScreen}
              options={{ title: 'AI Advisor' }}
            />
          </Stack.Group>
        ) : (
          <Stack.Group screenOptions={{ headerShown: false }}>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
            />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
