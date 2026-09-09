import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '../../features/dashboard/DashboardScreen';
import { InspectionsScreen } from '../../features/inspections/InspectionsScreen';
import { HistoryScreen } from '../../features/history/HistoryScreen';
import { ProfileScreen } from '../../features/profile/ProfileScreen';
import { AppTabParamList } from './types';
import { colors } from '../theme';

const Tab = createBottomTabNavigator<AppTabParamList>();

export const AppTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.text.inverse,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.secondary,
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Inspections" component={InspectionsScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
