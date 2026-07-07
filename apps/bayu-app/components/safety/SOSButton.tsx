import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';

interface Props {
  number?: string;
}

export const SOSButton: React.FC<Props> = ({ number = '999' }) => {
  const pulse1 = useSharedValue(0);
  const pulse2 = useSharedValue(0);

  useEffect(() => {
    pulse1.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.out(Easing.ease) }), -1, false);
    pulse2.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.out(Easing.ease) }), -1, false);
  }, [pulse1, pulse2]);

  const ring1 = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse1.value * 0.6 }],
    opacity: 1 - pulse1.value,
  }));
  const ring2 = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse2.value * 0.9 }],
    opacity: 0.6 * (1 - pulse2.value),
  }));

  const handlePress = () => {
    Alert.alert(
      'Emergency Call',
      `Dial ${number} now?\n\nUse only for genuine emergencies.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: `Call ${number}`, style: 'destructive', onPress: () => Linking.openURL(`tel:${number}`) },
      ],
    );
  };

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.ring, ring2]} />
      <Animated.View style={[styles.ring, ring1]} />
      <TouchableOpacity activeOpacity={0.85} style={styles.button} onPress={handlePress}>
        <Ionicons name="call" size={36} color="#FFFFFF" />
        <Text style={styles.sosText}>SOS</Text>
        <Text style={styles.number}>{number}</Text>
      </TouchableOpacity>
    </View>
  );
};

const SIZE = 160;

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', justifyContent: 'center', width: SIZE * 1.6, height: SIZE * 1.25, alignSelf: 'center' },
  ring: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: Colors.error,
    opacity: 0.3,
  },
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.error,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },
  sosText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontFamily: Typography.fonts.headingBold,
    letterSpacing: 4,
    marginTop: Spacing.xs,
  },
  number: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.body,
    marginTop: -2,
  },
});
