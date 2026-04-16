import { create } from 'zustand';
import { TravelBadge, Quest, LeaderboardUser, Reward } from '@/types';
import { travelBadges, travelPassStats, quests, leaderboard, rewards } from '@/data';
import { useBookingStore } from './bookingStore';

interface GamificationState {
  badges: TravelBadge[];
  stats: typeof travelPassStats;
  quests: Quest[];
  leaderboard: LeaderboardUser[];
  rewards: Reward[];
  redeemedRewards: string[];
  earnBadge: (id: string) => void;
  redeemReward: (id: string) => { ok: boolean; reason?: string };
}

export const useGamificationStore = create<GamificationState>((set, get) => ({
  badges: travelBadges,
  stats: travelPassStats,
  quests,
  leaderboard,
  rewards,
  redeemedRewards: [],

  earnBadge: (id) =>
    set((s) => {
      const alreadyEarned = s.badges.find((b) => b.id === id)?.earned;
      if (alreadyEarned) return s;
      return {
        badges: s.badges.map((b) => (b.id === id ? { ...b, earned: true } : b)),
        stats: {
          ...s.stats,
          badgesEarned: s.stats.badgesEarned + 1,
          points: s.stats.points + 250,
        },
      };
    }),

  redeemReward: (id) => {
    const state = get();
    const reward = state.rewards.find((r) => r.id === id);
    if (!reward) return { ok: false, reason: 'Reward not found' };
    if (state.redeemedRewards.includes(id)) return { ok: false, reason: 'Already redeemed' };
    if (state.stats.points < reward.pointsCost) return { ok: false, reason: 'Not enough points' };

    set({
      stats: { ...state.stats, points: state.stats.points - reward.pointsCost },
      redeemedRewards: [...state.redeemedRewards, id],
    });

    // Credit wallet if it's a credit reward
    if (reward.category === 'credit') {
      // Parse value (e.g. "= RM50 wallet credit") — fall back to 50
      const match = reward.valueLabel.match(/RM(\d+)/);
      const amount = match ? parseInt(match[1], 10) : 50;
      useBookingStore.getState().topUpWallet(amount);
    }

    return { ok: true };
  },
}));
