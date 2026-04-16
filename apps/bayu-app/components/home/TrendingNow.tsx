import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';
import { LiveDot } from '@/components/gov/widgets';

type TrendingItem =
  | { type: 'booking'; flag: string; name: string; place: string; pkg: string; minsAgo: number }
  | { type: 'viewing'; icon: string; count: number; place: string }
  | { type: 'low-stock'; icon: string; count: number; pkg: string }
  | { type: 'surge'; icon: string; place: string; pct: number }
  | { type: 'hot'; icon: string; pkg: string; booked: number };

const TRENDING: TrendingItem[] = [
  { type: 'booking', flag: '🇲🇾', name: 'Ahmad K.', place: 'Kuala Lumpur', pkg: 'Sipadan 3D2N Dive', minsAgo: 1 },
  { type: 'viewing', icon: '👀', count: 12, place: 'Mt. Kinabalu Climb' },
  { type: 'low-stock', icon: '⚡', count: 2, pkg: 'Luxury Sipadan Resort' },
  { type: 'booking', flag: '🇸🇬', name: 'Mei Ling C.', place: 'Singapore', pkg: 'Mt Kinabalu Climb', minsAgo: 3 },
  { type: 'surge', icon: '📈', place: 'Semporna', pct: 34 },
  { type: 'hot', icon: '🔥', pkg: 'Sandakan Wildlife 4D', booked: 47 },
  { type: 'booking', flag: '🇰🇷', name: 'Ji-ho P.', place: 'Seoul', pkg: 'Mabul Island Dive', minsAgo: 8 },
  { type: 'viewing', icon: '👀', count: 28, place: 'Tunku Abdul Rahman Marine Park' },
  { type: 'booking', flag: '🇨🇳', name: 'Wei Chen', place: 'Beijing', pkg: 'KK City Break', minsAgo: 6 },
  { type: 'low-stock', icon: '⚡', count: 4, pkg: 'Kinabatangan River Safari' },
];

function describe(item: TrendingItem): { emoji: string; text: string; highlight?: string } {
  switch (item.type) {
    case 'booking':
      return {
        emoji: item.flag,
        text: `${item.name} from ${item.place} just booked ${item.pkg}`,
        highlight: `${item.minsAgo}m ago`,
      };
    case 'viewing':
      return {
        emoji: item.icon,
        text: `${item.count} people viewing ${item.place} right now`,
      };
    case 'low-stock':
      return {
        emoji: item.icon,
        text: `Only ${item.count} ${item.pkg} packages left!`,
      };
    case 'surge':
      return {
        emoji: item.icon,
        text: `${item.place} bookings up ${item.pct}% this week`,
      };
    case 'hot':
      return {
        emoji: item.icon,
        text: `${item.pkg} booked ${item.booked}× in last 24h`,
      };
  }
}

export const TrendingNow: React.FC = () => {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % TRENDING.length), 2800);
    return () => clearInterval(id);
  }, []);

  const item = TRENDING[idx];
  const d = describe(item);

  return (
    <LinearGradient
      colors={Colors.gradients.oceanDepth}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.livePill}>
        <LiveDot color="#FF5A5F" size={7} />
      </View>

      <View style={styles.messageWrap}>
        <Animated.View
          key={idx}
          entering={FadeInDown.duration(420)}
          exiting={FadeOutUp.duration(320)}
          style={styles.messageRow}
        >
          <Text style={styles.emoji}>{d.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.message} numberOfLines={2}>
              {d.text}
            </Text>
            {d.highlight && <Text style={styles.highlight}>{d.highlight}</Text>}
          </View>
        </Animated.View>
      </View>

      <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.5)" />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.base,
    marginTop: -Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    ...Shadows.md,
    minHeight: 52,
  },
  livePill: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  messageWrap: { flex: 1, overflow: 'hidden' },
  messageRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  emoji: { fontSize: 22 },
  message: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemiBold,
    color: '#FFFFFF',
    lineHeight: 16,
  },
  highlight: {
    fontSize: 10,
    fontFamily: Typography.fonts.bodyMedium,
    color: '#F7B731',
    marginTop: 1,
  },
});
