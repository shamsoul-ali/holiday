import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { BorderRadius, Spacing } from '@/constants/spacing';

interface GlassCardProps {
  children: React.ReactNode;
  intensity?: number;
  style?: ViewStyle;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, intensity = 50, style }) => {
  return (
    <View style={[styles.container, style]}>
      <BlurView intensity={intensity} tint="light" style={styles.blur}>
        {children}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { borderRadius: BorderRadius.lg, overflow: 'hidden' },
  blur: { padding: Spacing.base },
});
