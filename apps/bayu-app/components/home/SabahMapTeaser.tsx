import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';
import { SabahMap } from '@/components/SabahMap';

export const SabahMapTeaser: React.FC = () => {
  const router = useRouter();

  return (
    <Animated.View entering={FadeInDown.delay(120).duration(500)} style={{ paddingHorizontal: Spacing.base, marginTop: Spacing.md }}>
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => router.push('/(tabs)/home/sabah-map' as any)}
        style={styles.card}
      >
        <LinearGradient colors={[...Colors.gradients.oceanDepth]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
          {/* Map preview — non-interactive mini version */}
          <View style={styles.mapWrap} pointerEvents="none">
            <SabahMap mode="occupancy" height={140} showAirports showIslands zoomable={false} />
          </View>

          <View style={styles.overlay}>
            <View style={styles.eyebrowRow}>
              <View style={styles.dot} />
              <Text style={styles.eyebrow}>SPATIAL INTELLIGENCE · LIVE</Text>
            </View>
            <Text style={styles.title}>Explore Sabah on the map</Text>
            <Text style={styles.subtitle}>
              26 districts · 5 airports · 40+ offshore islands
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>6</Text>
                <Text style={styles.statLabel}>Map layers</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>74%</Text>
                <Text style={styles.statLabel}>Avg occupancy</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>Live</Text>
                <Text style={styles.statLabel}>Crowd & safety</Text>
              </View>
              <View style={styles.cta}>
                <Ionicons name="arrow-forward" size={16} color="#002B7F" />
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: BorderRadius.xl, overflow: 'hidden', ...Shadows.lg },
  gradient: { padding: Spacing.base },
  mapWrap: {
    alignSelf: 'flex-end',
    width: 200,
    height: 140,
    opacity: 0.8,
    position: 'absolute',
    top: 0,
    right: -20,
  },
  overlay: {
    paddingTop: Spacing.sm,
  },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#F5362F' },
  eyebrow: {
    fontSize: 10,
    fontFamily: Typography.fonts.bodySemiBold,
    color: 'rgba(255,255,255,0.78)',
    letterSpacing: 1.4,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.headingBold,
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: 'rgba(255,255,255,0.82)',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  stat: { },
  statValue: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.fonts.headingBold,
    color: '#FDE68A',
  },
  statLabel: {
    fontSize: 9,
    fontFamily: Typography.fonts.body,
    color: 'rgba(255,255,255,0.72)',
    letterSpacing: 0.5,
  },
  statDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.15)' },
  cta: {
    marginLeft: 'auto',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
