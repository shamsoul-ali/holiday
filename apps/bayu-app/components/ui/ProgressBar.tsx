import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { BorderRadius } from '@/constants/spacing';

interface ProgressBarProps {
  progress: number; // 0-1
  color?: string;
  height?: number;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, color = Colors.primary, height = 6, style }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(`${Math.min(progress, 1) * 100}%`, { duration: 300 }),
  }));

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }, style]}>
      <Animated.View style={[styles.fill, { backgroundColor: color, borderRadius: height / 2 }, animatedStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  track: { width: '100%', backgroundColor: Colors.surfaceSecondary, overflow: 'hidden' },
  fill: { height: '100%' },
});
