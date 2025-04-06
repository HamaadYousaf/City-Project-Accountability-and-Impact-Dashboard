import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (!userData) {
          setIsAuthenticated(false);
          setIsAdmin(false);
          return;
        }
        const { role } = JSON.parse(userData);
        setIsAuthenticated(true);
        setIsAdmin(role === 'admin');
      } catch (error) {
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    };

    checkAuth();
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelPosition: 'below-icon',
        tabBarIconStyle: { display: 'none' },
        tabBarStyle: {
          height: 60,
          paddingBottom: 0,
          justifyContent: 'center',
        },
        tabBarLabelStyle: {
          marginBottom: 0,
          marginTop: 0,
          fontSize: 14,
          textAlign: 'center',
          width: '100%',
          paddingHorizontal: 0,
          paddingVertical: 5,
          flex: 1,
          lineHeight: 35,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Login",
          tabBarLabel: "Login",
        }}
      />
      <Tabs.Screen
        name="projectselection"
        options={{
          title: 'Projects',
          tabBarLabel: 'Projects',
          href: isAuthenticated ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="usermanagement"
        options={{
          title: 'Users',
          tabBarLabel: 'Users',
          href: (isAuthenticated && isAdmin) ? undefined : null,
        }}
      />
    </Tabs>
  );
}
