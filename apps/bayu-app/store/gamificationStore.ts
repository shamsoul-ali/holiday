import { create } from 'zustand';
import { TravelBadge } from '@/types';
import { travelBadges, travelPassStats } from '@/data';

interface GamificationState {
  badges: TravelBadge[];
  stats: typeof travelPassStats;
  earnBadge: (id: string) => void;
}

export const useGamificationStore = create<GamificationState>((set) => ({
  badges: travelBadges,
  stats: travelPassStats,
  earnBadge: (id) =>
    set((s) => ({
      badges: s.badges.map((b) => (b.id === id ? { ...b, earned: true } : b)),
      stats: { ...s.stats, badgesEarned: s.stats.badgesEarned + 1 },
    })),
}));
