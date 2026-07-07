import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { TravelBadge } from '@/types';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';

interface Props {
  badges: TravelBadge[];
  onBadgePress: (badge: TravelBadge) => void;
}

export const BadgeGrid: React.FC<Props> = ({ badges, onBadgePress }) => {
  return (
    <View style={styles.grid}>
      {badges.map((badge) => (
        <TouchableOpacity
          key={badge.id}
          activeOpacity={0.85}
          onPress={() => onBadgePress(badge)}
          style={styles.cell}
        >
          {badge.earned ? (
            <View style={styles.earnedCell}>
              <Animated.View entering={FadeIn.duration(400)} style={styles.haloWrap}>
                <LinearGradient
                  colors={['#F7B731', '#FDE68A'] as const}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.halo}
                />
              </Animated.View>
              <View style={styles.iconWrap}>
                <LinearGradient
                  colors={['#F7B731', '#FDE68A'] as const}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.iconGradient}
                >
                  <Ionicons name={badge.icon as any} size={28} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <Text style={styles.earnedName} numberOfLines={2}>{badge.name}</Text>
              <View style={styles.earnedChip}>
                <Ionicons name="checkmark" size={9} color="#FFFFFF" />
                <Text style={styles.earnedChipText}>EARNED</Text>
              </View>
            </View>
          ) : (
            <View style={styles.lockedCell}>
              <View style={styles.lockedIconWrap}>
                <Ionicons name={badge.icon as any} size={28} color={Colors.textTertiary} />
                <View style={styles.lockOverlay}>
                  <Ionicons name="lock-closed" size={12} color={Colors.textTertiary} />
                </View>
              </View>
              <Text style={styles.lockedName} numberOfLines={2}>{badge.name}</Text>
              <Text style={styles.lockedRequirement} numberOfLines={1}>{badge.requirement}</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  cell: {
    width: '31%',
    aspectRatio: 0.95,
  },

  earnedCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.sm,
    backgroundColor: '#FEF7E0',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.sunset + '40',
    gap: 4,
    ...Shadows.sm,
  },
  haloWrap: {
    position: 'absolute',
    top: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    width: 66,
    height: 66,
    borderRadius: 33,
    opacity: 0.4,
  },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  iconGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  earnedName: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.heading,
    color: Colors.text,
    textAlign: 'center',
    minHeight: 26,
  },
  earnedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.sunset,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  earnedChipText: {
    fontSize: 8,
    fontFamily: Typography.fonts.bodySemiBold,
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },

  lockedCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  lockedIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
  },
  lockOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedName: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.heading,
    color: Colors.textSecondary,
    textAlign: 'center',
    minHeight: 26,
  },
  lockedRequirement: {
    fontSize: 9,
    fontFamily: Typography.fonts.body,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});
