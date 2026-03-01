import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';
import { BorderRadius, Shadows, Spacing } from '@/constants/spacing';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: number;
}

export const Card: React.FC<CardProps> = ({ children, style, variant = 'elevated', padding }) => {
  return (
    <View style={[styles.base, styles[variant], padding !== undefined && { padding }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    backgroundColor: Colors.background,
  },
  elevated: {
    ...Shadows.md,
  },
  outlined: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  flat: {
    backgroundColor: Colors.surface,
  },
});
