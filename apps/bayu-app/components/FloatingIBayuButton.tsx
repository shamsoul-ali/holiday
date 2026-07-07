import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';

export const FloatingIBayuButton: React.FC = () => {
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();

  // Hide on iBayu tab itself and modals/detail views that deserve full focus
  const hideOnSegments = ['ibayu', 'loading', 'payment', 'payment-success', 'alert', 'travel-pass'];
  const shouldHide = segments.some((s) => hideOnSegments.includes(s));

  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 1200, easing: Easing.in(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.25 }],
    opacity: (1 - pulse.value) * 0.6,
  }));

  if (shouldHide) return null;

  // Position above the floating tab bar
  const bottom = Math.max(insets.bottom, 12) + 76;

  return (
    <View style={[styles.wrapper, { bottom }]} pointerEvents="box-none">
      <Animated.View style={[styles.pulse, pulseStyle]} />
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push('/(tabs)/ibayu' as any)}
        style={styles.touch}
      >
        <LinearGradient
          colors={['#002B7F', '#096DBB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.btn}
        >
          <Ionicons name="sparkles" size={22} color="#FFFFFF" />
          <Text style={styles.label}>iBayu</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const SIZE = 56;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: 20,
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  pulse: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: Colors.primary,
  },
  touch: { width: SIZE, height: SIZE, borderRadius: SIZE / 2 },
  btn: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#002B7F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: Typography.fonts.bodySemiBold,
    marginTop: -2,
    letterSpacing: 0.3,
  },
});
