import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Reward } from '@/types';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';

interface Props {
  rewards: Reward[];
  userPoints: number;
  redeemed: string[];
  onRedeem: (rewardId: string) => void;
}

const categoryColors: Record<string, readonly [string, string]> = {
  discount: ['#F7B731', '#FDE68A'] as const,
  pass: ['#096DBB', '#2EAFE8'] as const,
  upgrade: ['#7C3AED', '#A78BFA'] as const,
  credit: ['#059669', '#10B981'] as const,
};

export const RewardsGrid: React.FC<Props> = ({ rewards, userPoints, redeemed, onRedeem }) => (
  <View style={styles.grid}>
    {rewards.map((r) => {
      const canAfford = userPoints >= r.pointsCost;
      const isRedeemed = redeemed.includes(r.id);
      const gradient = categoryColors[r.category];
      return (
        <View key={r.id} style={styles.cell}>
          <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.top}>
            <View style={styles.iconBubble}>
              <Ionicons name={r.icon as any} size={22} color="#FFFFFF" />
            </View>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryText}>{r.category.toUpperCase()}</Text>
            </View>
          </LinearGradient>

          <View style={styles.body}>
            <Text style={styles.title} numberOfLines={2}>{r.title}</Text>
            <Text style={styles.partner} numberOfLines={1}>{r.partnerName}</Text>
            <Text style={styles.value} numberOfLines={1}>{r.valueLabel}</Text>

            <View style={styles.footer}>
              <View style={styles.pointsRow}>
                <Ionicons name="sparkles" size={12} color={Colors.sunset} />
                <Text style={styles.pointsText}>{r.pointsCost.toLocaleString()}</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.redeemBtn,
                  isRedeemed && styles.redeemBtnDone,
                  !canAfford && !isRedeemed && styles.redeemBtnDisabled,
                ]}
                onPress={() => onRedeem(r.id)}
                disabled={isRedeemed || !canAfford}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.redeemText,
                    isRedeemed && styles.redeemTextDone,
                    !canAfford && !isRedeemed && styles.redeemTextDisabled,
                  ]}
                >
                  {isRedeemed ? '✓ Redeemed' : canAfford ? 'Redeem' : 'Not enough'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.expiry}>{r.expiresLabel}</Text>
          </View>
        </View>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  cell: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  top: {
    height: 70,
    padding: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: BorderRadius.full,
  },
  categoryText: {
    fontSize: 9,
    fontFamily: Typography.fonts.bodySemiBold,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },

  body: { padding: Spacing.sm, gap: 3 },
  title: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.heading,
    color: Colors.text,
    minHeight: 36,
  },
  partner: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
  },
  value: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemiBold,
    color: Colors.secondary,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  pointsRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  pointsText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.headingBold,
    color: Colors.sunset,
  },
  redeemBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  redeemBtnDone: { backgroundColor: Colors.success + '20' },
  redeemBtnDisabled: { backgroundColor: Colors.borderLight },
  redeemText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemiBold,
    color: '#FFFFFF',
  },
  redeemTextDone: { color: Colors.success },
  redeemTextDisabled: { color: Colors.textTertiary },

  expiry: {
    fontSize: 10,
    fontFamily: Typography.fonts.body,
    color: Colors.textTertiary,
    marginTop: 2,
  },
});
