import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { useAppStore } from '@/store';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { FloatingIBayuButton } from '@/components/FloatingIBayuButton';

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

const tabConfig: { name: string; icon: string; label: string }[] = [
  { name: 'home', icon: 'home', label: 'Home' },
  { name: 'explore', icon: 'compass', label: 'Explore' },
  { name: 'ibayu', icon: 'chatbubble-ellipses', label: 'iBayu' },
  { name: 'bookings', icon: 'briefcase', label: 'Bookings' },
  { name: 'discover', icon: 'map', label: 'Discover' },
  { name: 'profile', icon: 'person', label: 'Profile' },
];

function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const notificationCount = useAppStore((s) => s.notificationCount);
  const bottomPadding = Math.max(insets.bottom, 12);

  return (
    <View style={[styles.tabBarOuter, { paddingBottom: bottomPadding }]}>
      <View style={styles.tabBarContainer}>
        <View style={styles.blurWrap}>
          <BlurView intensity={80} tint="light" style={styles.blurView}>
            <View style={styles.tabBarInner}>
              {state.routes.map((route, index) => {
              const isFocused = state.index === index;
              const config = tabConfig[index];
              if (!config) return null;

              const onPress = () => {
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name, route.params);
                }
              };

              const onLongPress = () => {
                navigation.emit({ type: 'tabLongPress', target: route.key });
              };

              const color = isFocused ? Colors.primary : Colors.textTertiary;

              return (
                <TouchableOpacity
                  key={route.key}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  style={styles.tabItem}
                  activeOpacity={0.7}
                >
                  <View>
                    <Ionicons name={config.icon as any} size={22} color={color} />
                    {config.name === 'bookings' && <TabBarBadge count={notificationCount} />}
                  </View>
                  <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{config.label}</Text>
                </TouchableOpacity>
              );
            })}
            </View>
          </BlurView>
        </View>
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <>
      <Tabs
        tabBar={(props) => <FloatingTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="home" />
        <Tabs.Screen name="explore" />
        <Tabs.Screen name="ibayu" />
        <Tabs.Screen name="bookings" />
        <Tabs.Screen name="discover" />
        <Tabs.Screen name="profile" />
      </Tabs>
      <FloatingIBayuButton />
    </>
  );
}

const styles = StyleSheet.create({
  tabBarOuter: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    pointerEvents: 'box-none',
  },
  tabBarContainer: {
    borderRadius: 28,
    ...Platform.select({
      ios: {
        shadowColor: '#002B7F',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  blurWrap: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  blurView: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
  },
  tabBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: Typography.fonts.bodyMedium,
    color: Colors.textTertiary,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontFamily: Typography.fonts.bodySemiBold,
  },
});
