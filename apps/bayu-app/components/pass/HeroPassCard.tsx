import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';

interface Props {
  level: number;
  points: number;
  nextLevelPoints: number;
  districtsVisited: number;
  totalDistricts: number;
  badgesEarned: number;
  totalBadges: number;
  tripsCompleted: number;
}

export const HeroPassCard: React.FC<Props> = ({
  level,
  points,
  nextLevelPoints,
  districtsVisited,
  totalDistricts,
  badgesEarned,
  totalBadges,
  tripsCompleted,
}) => {
  const percent = Math.min(100, (points / nextLevelPoints) * 100);
  const fillProgress = useSharedValue(0);

  useEffect(() => {
    fillProgress.value = withDelay(
      200,
      withTiming(percent, { duration: 1400, easing: Easing.out(Easing.cubic) }),
    );
  }, [percent, fillProgress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fillProgress.value}%` as any,
  }));

  return (
    <LinearGradient colors={[...Colors.gradients.memberCard]} style={styles.card} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      {/* Card pattern overlay */}
      <View style={styles.pattern} />

      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <View style={styles.brandIcon}>
            <Ionicons name="ribbon" size={18} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.eyebrow}>SABAH TRAVEL PASS</Text>
            <Text style={styles.brandName}>Bayu Elite</Text>
          </View>
        </View>
        <View style={styles.levelBadge}>
          <Text style={styles.levelNum}>{level}</Text>
          <Text style={styles.levelLabel}>LVL</Text>
        </View>
      </View>

      <View style={styles.pointsBlock}>
        <Text style={styles.pointsLabel}>Travel Points</Text>
        <View style={styles.pointsRow}>
          <Text style={styles.pointsValue}>{points.toLocaleString()}</Text>
          <Text style={styles.pointsNext}>/ {nextLevelPoints.toLocaleString()} to Level {level + 1}</Text>
        </View>

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, fillStyle]}>
            <LinearGradient
              colors={['#F7B731', '#FDE68A'] as const}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{districtsVisited}/{totalDistricts}</Text>
          <Text style={styles.statLabel}>Districts</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{badgesEarned}/{totalBadges}</Text>
          <Text style={styles.statLabel}>Badges</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{tripsCompleted}</Text>
          <Text style={styles.statLabel}>Trips</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.base,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  pattern: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemiBold,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1.2,
  },
  brandName: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.headingBold,
    color: '#FFFFFF',
    marginTop: -2,
  },

  levelBadge: {
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: 'rgba(247,183,49,0.25)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(247,183,49,0.5)',
  },
  levelNum: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.fonts.headingBold,
    color: '#FDE68A',
    lineHeight: Typography.sizes.xl * 1.1,
  },
  levelLabel: {
    fontSize: 9,
    fontFamily: Typography.fonts.bodySemiBold,
    color: '#FDE68A',
    letterSpacing: 1,
  },

  pointsBlock: { marginTop: Spacing.sm },
  pointsLabel: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodyMedium,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  pointsRow: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.sm, marginTop: 4 },
  pointsValue: {
    fontSize: Typography.sizes['2xl'],
    fontFamily: Typography.fonts.headingBold,
    color: '#FFFFFF',
  },
  pointsNext: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: 'rgba(255,255,255,0.75)',
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xs,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.headingBold,
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  statDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.2)' },
});
