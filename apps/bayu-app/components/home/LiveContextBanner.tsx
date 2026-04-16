import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';

interface Notification {
  id: string;
  icon: string;
  title: string;
  body: string;
  tint: string;
  emoji: string;
}

const rotation: Notification[] = [
  {
    id: 'n1',
    icon: 'water',
    title: 'Tide window open · Semporna',
    body: 'Optimal visibility until 3pm — best time for Sipadan diving',
    tint: Colors.ocean,
    emoji: '🌊',
  },
  {
    id: 'n2',
    icon: 'sunny',
    title: 'Weather just cleared · Kundasang',
    body: 'Kinabalu summit visible now. Next 2 days: 70% clear',
    tint: Colors.sunset,
    emoji: '☀️',
  },
  {
    id: 'n3',
    icon: 'paw',
    title: 'Pygmy elephant herd spotted',
    body: 'Sukau village reports herd 3km upstream right now',
    tint: Colors.secondary,
    emoji: '🐘',
  },
  {
    id: 'n4',
    icon: 'flash',
    title: 'Flash deal · 30% off Mabul dive',
    body: 'Last-minute openings for this weekend — 4 spots left',
    tint: Colors.error,
    emoji: '⚡',
  },
];

export const LiveContextBanner: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % rotation.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  if (dismissed) return null;
  const item = rotation[index];

  return (
    <Animated.View
      key={item.id}
      entering={FadeInUp.duration(400)}
      exiting={FadeOutUp.duration(300)}
      style={[styles.wrap, { borderLeftColor: item.tint }]}
    >
      <Text style={styles.emoji}>{item.emoji}</Text>
      <View style={{ flex: 1 }}>
        <View style={styles.headerRow}>
          <Text style={styles.appLabel}>BAYU · NOW</Text>
          <Text style={styles.liveDot}>●</Text>
        </View>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.body} numberOfLines={1}>{item.body}</Text>
      </View>
      <TouchableOpacity onPress={() => setDismissed(true)} style={styles.dismiss}>
        <Ionicons name="close" size={14} color={Colors.textTertiary} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    ...Shadows.md,
  },
  emoji: { fontSize: 28 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  appLabel: {
    fontSize: 9,
    fontFamily: Typography.fonts.bodySemiBold,
    color: Colors.textTertiary,
    letterSpacing: 1,
  },
  liveDot: { color: Colors.error, fontSize: 8 },
  title: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.heading,
    color: Colors.text,
    marginTop: 1,
  },
  body: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  dismiss: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
