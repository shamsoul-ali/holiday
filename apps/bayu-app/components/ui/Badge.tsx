import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { BorderRadius, Spacing } from '@/constants/spacing';

interface BadgeProps {
  label: string;
  color?: string;
  textColor?: string;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, color = Colors.primary, textColor = '#FFFFFF', size = 'sm', style }) => {
  return (
    <View style={[styles.base, styles[size], { backgroundColor: color }, style]}>
      <Text style={[styles.text, styles[`text_${size}`], { color: textColor }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: { borderRadius: BorderRadius.full, alignSelf: 'flex-start' },
  sm: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs },
  md: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  text: { fontFamily: Typography.fonts.bodySemiBold },
  text_sm: { fontSize: Typography.sizes.xs },
  text_md: { fontSize: Typography.sizes.sm },
});
