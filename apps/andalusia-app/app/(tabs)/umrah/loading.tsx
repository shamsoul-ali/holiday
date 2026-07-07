import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { useUmrahStore } from '@/store';

export default function LoadingScreen() {
  const { generationMessage } = useUmrahStore();

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="moon" size={48} color={Colors.primary} />
      </View>
      <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: Spacing.xl }} />
      <Text style={styles.title}>Andalusia AI sedang menyediakan pakej anda...</Text>
      <Animated.Text entering={FadeIn} exiting={FadeOut} style={styles.message} key={generationMessage}>
        {generationMessage}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: Spacing['2xl'] },
  iconContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.primary + '15', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.heading, color: Colors.text, textAlign: 'center', marginBottom: Spacing.md },
  message: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.body, color: Colors.primary, textAlign: 'center' },
});
