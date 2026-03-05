import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading...' }) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color={Colors.primary} />
    <Text style={styles.text}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  text: { marginTop: Spacing.base, fontSize: Typography.sizes.base, fontFamily: Typography.fonts.body, color: Colors.textSecondary },
});
