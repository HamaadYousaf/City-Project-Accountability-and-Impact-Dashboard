import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="projectselection"
        options={{
          title: 'Projects (Test)',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="createreport"
        options={{
          title: 'Create Report',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="viewreports"
        options={{
          title: 'View Reports',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Projects (Final)",
          tabBarLabel: "Projects (Final)",
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
