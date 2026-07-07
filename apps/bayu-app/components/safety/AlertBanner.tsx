import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { SafetyAlert } from '@/types';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { LiveDot } from '@/components/gov/widgets';

interface Props {
  alerts: SafetyAlert[];
  onPress?: (alert: SafetyAlert) => void;
}

const severityBg: Record<string, string> = {
  info: '#E0F4FE',
  warning: '#FEF4DB',
  danger: '#FEE2E0',
};

const severityColors: Record<string, string> = {
  info: Colors.info,
  warning: Colors.warning,
  danger: Colors.error,
};

const typeIcon: Record<string, string> = {
  tide: 'water',
  weather: 'cloud',
  trail: 'trail-sign',
  wildlife: 'paw',
};

export const AlertBanner: React.FC<Props> = ({ alerts, onPress }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (alerts.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % alerts.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [alerts.length]);

  if (!alerts.length) return null;
  const current = alerts[index];
  const tint = severityColors[current.severity];

  return (
    <TouchableOpacity activeOpacity={0.92} onPress={() => onPress?.(current)}>
      <Animated.View
        key={current.id}
        entering={FadeInDown.duration(320)}
        exiting={FadeOutUp.duration(240)}
        style={[styles.banner, { backgroundColor: severityBg[current.severity] }]}
      >
        <View style={[styles.iconWrap, { backgroundColor: tint + '22' }]}>
          <Ionicons name={typeIcon[current.type] as any} size={20} color={tint} />
        </View>
        <View style={styles.content}>
          <View style={styles.topRow}>
            <LiveDot color={tint} size={6} />
            <Text style={[styles.severityLabel, { color: tint }]}>
              {current.severity.toUpperCase()} · {current.location}
            </Text>
          </View>
          <Text style={styles.title} numberOfLines={1}>{current.title}</Text>
          <Text style={styles.message} numberOfLines={2}>{current.message}</Text>
        </View>
        <View style={styles.dots}>
          {alerts.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && { backgroundColor: tint, width: 12 }]} />
          ))}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1, gap: 3 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  severityLabel: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemiBold,
    letterSpacing: 0.6,
  },
  title: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.fonts.heading,
    color: Colors.text,
  },
  message: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.sm * 1.4,
  },
  dots: { position: 'absolute', bottom: Spacing.xs, right: Spacing.md, flexDirection: 'row', gap: 3 },
  dot: { width: 5, height: 5, borderRadius: 5, backgroundColor: 'rgba(0,0,0,0.15)' },
});
