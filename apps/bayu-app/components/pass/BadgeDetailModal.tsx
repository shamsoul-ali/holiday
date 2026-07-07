import React, { useRef, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ConfettiCannon from 'react-native-confetti-cannon';
import Animated, { FadeIn, SlideInDown, ZoomIn } from 'react-native-reanimated';
import { TravelBadge } from '@/types';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';
import { Button } from '@/components/ui';

const { width } = Dimensions.get('window');

interface Props {
  badge: TravelBadge | null;
  visible: boolean;
  onClose: () => void;
  onEarn: (id: string) => void;
}

export const BadgeDetailModal: React.FC<Props> = ({ badge, visible, onClose, onEarn }) => {
  const [justEarned, setJustEarned] = useState(false);
  const confetti = useRef<any>(null);

  if (!badge) return null;

  const handleEarn = () => {
    setJustEarned(true);
    onEarn(badge.id);
    setTimeout(() => confetti.current?.start(), 80);
    setTimeout(() => {
      setJustEarned(false);
      onClose();
    }, 2400);
  };

  const earned = badge.earned || justEarned;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(220)} style={styles.backdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />

        <Animated.View entering={SlideInDown.duration(320)} style={styles.sheet}>
          <View style={styles.handle} />

          {/* Badge illustration */}
          <Animated.View entering={ZoomIn.delay(100).duration(400)} style={styles.badgeWrap}>
            {earned ? (
              <>
                <View style={styles.halo} />
                <LinearGradient
                  colors={['#F7B731', '#FDE68A'] as const}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.iconGradient}
                >
                  <Ionicons name={badge.icon as any} size={56} color="#FFFFFF" />
                </LinearGradient>
              </>
            ) : (
              <View style={styles.iconLocked}>
                <Ionicons name={badge.icon as any} size={56} color={Colors.textTertiary} />
                <View style={styles.lockCorner}>
                  <Ionicons name="lock-closed" size={18} color={Colors.textTertiary} />
                </View>
              </View>
            )}
          </Animated.View>

          {earned && (
            <Animated.View entering={FadeIn.delay(200).duration(300)} style={styles.earnedPill}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.sunset} />
              <Text style={styles.earnedPillText}>
                {justEarned ? 'Just Earned!' : 'Earned'}
              </Text>
            </Animated.View>
          )}

          <Text style={styles.badgeName}>{badge.name}</Text>
          <Text style={styles.badgeDesc}>{badge.description}</Text>

          {/* Requirement card */}
          <View style={styles.reqCard}>
            <View style={styles.reqTopRow}>
              <Ionicons name="trophy-outline" size={16} color={Colors.primary} />
              <Text style={styles.reqLabel}>Unlock Requirement</Text>
            </View>
            <Text style={styles.reqText}>{badge.requirement}</Text>
            {badge.district && badge.district !== 'Multiple' && badge.district !== 'Any' && (
              <View style={styles.districtRow}>
                <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
                <Text style={styles.districtText}>{badge.district} District</Text>
              </View>
            )}
          </View>

          {/* Reward preview */}
          <View style={styles.rewardCard}>
            <View style={styles.rewardIcon}>
              <Ionicons name="gift-outline" size={18} color={Colors.sunset} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rewardLabel}>On earn</Text>
              <Text style={styles.rewardValue}>+250 Travel Points</Text>
            </View>
          </View>

          {!earned && (
            <Button
              title="Tap to Earn (demo)"
              onPress={handleEarn}
              size="lg"
              fullWidth
              icon={<Ionicons name="sparkles" size={16} color="#FFFFFF" />}
              style={{ marginTop: Spacing.base }}
            />
          )}

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </Animated.View>

        {/* Confetti burst */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <ConfettiCannon
            ref={confetti}
            count={120}
            origin={{ x: width / 2, y: 0 }}
            autoStart={false}
            fadeOut
            explosionSpeed={450}
            fallSpeed={2800}
            colors={['#F7B731', '#FDE68A', '#2EAFE8', '#059669', '#F5362F']}
          />
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10,22,40,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginBottom: Spacing.md,
  },
  badgeWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm, width: 120, height: 120 },
  halo: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: Colors.sunset + '30',
  },
  iconGradient: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
  },
  iconLocked: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockCorner: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  earnedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    backgroundColor: Colors.sunset + '15',
    borderRadius: BorderRadius.full,
  },
  earnedPillText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemiBold,
    color: Colors.sunset,
    letterSpacing: 0.5,
  },
  badgeName: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.fonts.headingBold,
    color: Colors.text,
    textAlign: 'center',
  },
  badgeDesc: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.sm * 1.5,
    marginBottom: Spacing.sm,
  },

  reqCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reqTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reqLabel: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemiBold,
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  reqText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.fonts.heading,
    color: Colors.text,
    marginTop: 4,
  },
  districtRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  districtText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodyMedium,
    color: Colors.textSecondary,
  },

  rewardCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.base,
    marginTop: Spacing.sm,
    backgroundColor: Colors.sunset + '10',
    borderRadius: BorderRadius.lg,
  },
  rewardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardLabel: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
  },
  rewardValue: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.fonts.heading,
    color: Colors.sunset,
  },

  closeBtn: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
