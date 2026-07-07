import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';
import { TravelBadge } from '@/types';
import { useGamificationStore } from '@/store';
import { HeroPassCard } from '@/components/pass/HeroPassCard';
import { BadgeGrid } from '@/components/pass/BadgeGrid';
import { BadgeDetailModal } from '@/components/pass/BadgeDetailModal';
import { QuestList } from '@/components/pass/QuestList';
import { RewardsGrid } from '@/components/pass/RewardsGrid';

export default function TravelPassScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { badges, stats, quests, leaderboard, rewards, redeemedRewards, earnBadge, redeemReward } = useGamificationStore();
  const [selectedBadge, setSelectedBadge] = useState<TravelBadge | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const openBadge = (b: TravelBadge) => {
    setSelectedBadge(b);
    setModalVisible(true);
  };

  const handleRedeem = (id: string) => {
    const reward = rewards.find((r) => r.id === id);
    if (!reward) return;
    Alert.alert(
      'Redeem Reward?',
      `Spend ${reward.pointsCost.toLocaleString()} points for "${reward.title}"?${reward.category === 'credit' ? '\n\nThis will credit your Bayu wallet instantly.' : ''}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Redeem',
          onPress: () => {
            const res = redeemReward(id);
            if (res.ok) {
              Alert.alert('Success! 🎉', `You've redeemed "${reward.title}". Check your Rewards Wallet for the voucher.`);
            } else {
              Alert.alert('Oops', res.reason || 'Could not redeem this reward.');
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[...Colors.gradients.oceanDepth]} style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>MY TRAVEL PASS</Text>
            <Text style={styles.title}>Sabah Pass</Text>
          </View>
          <View style={styles.backBtn}>
            <Ionicons name="ribbon" size={20} color="#FFFFFF" />
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero card */}
        <Animated.View entering={FadeInDown.delay(80).duration(500)} style={styles.section}>
          <HeroPassCard
            level={stats.level}
            points={stats.points}
            nextLevelPoints={stats.nextLevelPoints}
            districtsVisited={stats.districtsVisited}
            totalDistricts={stats.totalDistricts}
            badgesEarned={stats.badgesEarned}
            totalBadges={stats.totalBadges}
            tripsCompleted={stats.tripsCompleted}
          />
        </Animated.View>

        {/* Districts checklist */}
        <Animated.View entering={FadeInDown.delay(140).duration(500)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Sabah Districts</Text>
              <Text style={styles.sectionHint}>Visit all 7 to unlock Sabah Insider badge</Text>
            </View>
            <Text style={styles.counter}>{stats.districtsVisited}/{stats.totalDistricts}</Text>
          </View>
          <View style={styles.districtGrid}>
            {stats.allDistricts.map((d) => {
              const visited = stats.visitedDistricts.includes(d);
              return (
                <View key={d} style={[styles.districtChip, visited && styles.districtVisited]}>
                  <Ionicons
                    name={visited ? 'checkmark-circle' : 'ellipse-outline'}
                    size={14}
                    color={visited ? Colors.success : Colors.textTertiary}
                  />
                  <Text style={[styles.districtName, visited && styles.districtNameVisited]}>{d}</Text>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* Active quests */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Active Quests</Text>
              <Text style={styles.sectionHint}>Earn bonus points on your trip</Text>
            </View>
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
          <QuestList quests={quests} />
        </Animated.View>

        {/* Badge collection */}
        <Animated.View entering={FadeInDown.delay(260).duration(500)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Badge Collection</Text>
              <Text style={styles.sectionHint}>Tap any badge to see how to unlock</Text>
            </View>
            <Text style={styles.counter}>{stats.badgesEarned}/{stats.totalBadges}</Text>
          </View>
          <BadgeGrid badges={badges} onBadgePress={openBadge} />
        </Animated.View>

        {/* Leaderboard */}
        <Animated.View entering={FadeInDown.delay(320).duration(500)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Sabah Leaderboard</Text>
              <Text style={styles.sectionHint}>This month · Global</Text>
            </View>
          </View>
          <View style={styles.leaderboard}>
            {leaderboard.map((u, i) => {
              const rank = i + 1;
              const rankColor = rank === 1 ? Colors.sunset : rank === 2 ? '#9CA3AF' : rank === 3 ? '#B45309' : Colors.textTertiary;
              return (
                <View key={u.id} style={[styles.lbRow, u.isYou && styles.lbRowYou]}>
                  <View style={[styles.rankChip, rank <= 3 && { backgroundColor: rankColor + '20', borderColor: rankColor }]}>
                    <Text style={[styles.rankNum, { color: rankColor }]}>{rank}</Text>
                  </View>
                  <View style={[styles.avatar, { backgroundColor: `hsl(${u.avatarHue}, 65%, 55%)` }]}>
                    <Text style={styles.avatarText}>{u.name.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.lbName, u.isYou && styles.lbNameYou]}>{u.name}</Text>
                    <Text style={styles.lbMeta}>Lv{u.level} · {u.districts} districts</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.lbPoints, u.isYou && { color: Colors.primary }]}>
                      {u.points.toLocaleString()}
                    </Text>
                    <Text style={styles.lbPointsLabel}>pts</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* Rewards */}
        <Animated.View entering={FadeInDown.delay(380).duration(500)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Redeem Rewards</Text>
              <Text style={styles.sectionHint}>Use your points for real perks</Text>
            </View>
            <View style={styles.balancePill}>
              <Ionicons name="sparkles" size={12} color={Colors.sunset} />
              <Text style={styles.balanceText}>{stats.points.toLocaleString()} pts</Text>
            </View>
          </View>
          <RewardsGrid
            rewards={rewards}
            userPoints={stats.points}
            redeemed={redeemedRewards}
            onRedeem={handleRedeem}
          />
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <BadgeDetailModal
        visible={modalVisible}
        badge={selectedBadge}
        onClose={() => setModalVisible(false)}
        onEarn={earnBadge}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.lg,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemiBold,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 1.5,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.fonts.headingBold,
    color: '#FFFFFF',
    marginTop: 2,
  },

  content: { padding: Spacing.base, paddingTop: Spacing.base, gap: Spacing.lg },
  section: { gap: Spacing.sm },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.heading,
    color: Colors.text,
  },
  sectionHint: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  counter: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.fonts.headingBold,
    color: Colors.primary,
  },

  districtGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  districtChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  districtVisited: {
    backgroundColor: Colors.success + '10',
    borderColor: Colors.success + '40',
  },
  districtName: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodyMedium,
    color: Colors.textSecondary,
  },
  districtNameVisited: { color: Colors.success },

  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    backgroundColor: Colors.error + '15',
    borderRadius: BorderRadius.full,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.error },
  liveText: {
    fontSize: 9,
    fontFamily: Typography.fonts.bodySemiBold,
    color: Colors.error,
    letterSpacing: 0.8,
  },

  leaderboard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  lbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  lbRowYou: {
    backgroundColor: Colors.primary + '10',
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  rankChip: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNum: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.headingBold,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.headingBold,
  },
  lbName: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.fonts.heading,
    color: Colors.text,
  },
  lbNameYou: { color: Colors.primary },
  lbMeta: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  lbPoints: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.fonts.headingBold,
    color: Colors.text,
  },
  lbPointsLabel: {
    fontSize: 9,
    fontFamily: Typography.fonts.body,
    color: Colors.textTertiary,
  },

  balancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: Colors.sunset + '15',
    borderRadius: BorderRadius.full,
  },
  balanceText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemiBold,
    color: Colors.sunset,
  },
});
