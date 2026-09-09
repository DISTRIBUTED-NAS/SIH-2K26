import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '../../features/dashboard/DashboardScreen';
import { InspectionsScreen } from '../../features/inspections/InspectionsScreen';
import { HistoryScreen } from '../../features/history/HistoryScreen';
import { ProfileScreen } from '../../features/profile/ProfileScreen';
import { AppTabParamList } from './types';
import { colors, typography } from '../theme';

const Tab = createBottomTabNavigator<AppTabParamList>();

interface TabIconProps {
  icon: string;
  label: string;
  focused: boolean;
}

const TabIcon: React.FC<TabIconProps> = ({ icon, label, focused }) => {
  return (
    <View style={styles.iconWrapper}>
      <Text style={[styles.iconText, focused && styles.iconTextFocused]}>{icon}</Text>
      <Text style={[styles.labelText, focused && styles.labelTextFocused]}>{label}</Text>
    </View>
  );
};

export const AppTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { 
          backgroundColor: colors.primary,
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
        headerTintColor: colors.text.inverse,
        headerTitleStyle: {
          ...typography.h3,
          color: colors.text.inverse,
          fontWeight: '700',
        },
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingTop: 6,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          elevation: 8,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 1,
          shadowRadius: 6,
        },
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{
          headerTitle: 'Legal Metrology • Duty Portal',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🏛️" label="Duty" focused={focused} />
          ),
        }}
      />
      <Tab.Screen 
        name="Inspections" 
        component={InspectionsScreen} 
        options={{
          headerTitle: 'Assigned Field Cases',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📋" label="Cases" focused={focused} />
          ),
        }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen} 
        options={{
          headerTitle: 'Verification Archive',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📁" label="Archive" focused={focused} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          headerTitle: 'Officer Credentials',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="👤" label="Officer" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
  },
  iconText: {
    fontSize: 20,
    marginBottom: 2,
    opacity: 0.6,
  },
  iconTextFocused: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  labelText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.text.muted,
    fontWeight: '600',
  },
  labelTextFocused: {
    color: colors.primary,
    fontWeight: '800',
  },
});
