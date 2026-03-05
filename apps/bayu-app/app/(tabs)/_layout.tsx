import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { useAppStore } from '@/store';
import { View, Text, StyleSheet } from 'react-native';

function TabBarBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <View style={badgeStyles.badge}>
      <Text style={badgeStyles.text}>{count}</Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  badge: { position: 'absolute', top: -4, right: -8, backgroundColor: Colors.error, borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  text: { color: '#fff', fontSize: 10, fontFamily: Typography.fonts.bodySemiBold },
});

export default function TabLayout() {
  const notificationCount = useAppStore((s) => s.notificationCount);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: { fontFamily: Typography.fonts.bodyMedium, fontSize: 11 },
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopColor: Colors.borderLight,
          height: 85,
          paddingBottom: 28,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => <Ionicons name="compass" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ibayu"
        options={{
          title: 'iBayu',
          tabBarIcon: ({ color, size }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primary + '15', marginBottom: 4 }}>
              <Ionicons name="sparkles" size={size} color={color} />
            </View>
          ),
          tabBarLabelStyle: { fontFamily: Typography.fonts.headingBold, fontSize: 11 },
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="briefcase" size={size} color={color} />
              <TabBarBadge count={notificationCount} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, size }) => <Ionicons name="map" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
