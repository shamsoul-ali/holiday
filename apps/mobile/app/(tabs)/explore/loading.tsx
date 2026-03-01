import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, FadeIn } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { useTripStore } from '@/store';

export default function LoadingScreen() {
  const router = useRouter();
  const { generateTrip, generationMessage } = useTripStore();
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    scale.value = withRepeat(withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }), -1, true);
    rotation.value = withRepeat(withTiming(360, { duration: 3000, easing: Easing.linear }), -1, false);

    const run = async () => {
      await generateTrip();
      router.replace('/(tabs)/explore/results');
    };
    run();
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const rotateStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.iconContainer, pulseStyle]}>
        <Animated.View style={rotateStyle}>
          <Ionicons name="sparkles" size={64} color={Colors.primary} />
        </Animated.View>
      </Animated.View>

      <Animated.Text entering={FadeIn} style={styles.title}>AI is planning your trip</Animated.Text>
      <Text style={styles.message}>{generationMessage || 'Initializing...'}</Text>

      <View style={styles.dots}>
        {[0, 1, 2].map((i) => (
          <Animated.View
            key={i}
            style={[styles.dot, { opacity: 0.3 + (i * 0.2) }]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background, padding: Spacing.xl },
  iconContainer: { width: 120, height: 120, borderRadius: 60, backgroundColor: Colors.primary + '15', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing['2xl'] },
  title: { fontSize: Typography.sizes.xl, fontFamily: Typography.fonts.headingBold, color: Colors.text, marginBottom: Spacing.sm },
  message: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.body, color: Colors.primary, marginBottom: Spacing['2xl'] },
  dots: { flexDirection: 'row', gap: Spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
});
