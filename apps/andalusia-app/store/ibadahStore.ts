import { create } from 'zustand';
import { PrayerTime, KursusModule, DuaEntry, UmrahChecklist } from '@/types';
import { makkahPrayerTimes, duas, umrahChecklists, kursusModules } from '@/data';

interface IbadahState {
  prayerTimes: PrayerTime[];
  kursusModules: KursusModule[];
  duas: DuaEntry[];
  checklists: UmrahChecklist[];
  favoriteDuas: string[];
  selectedCity: string;
  qiblaDirection: number;

  setCity: (city: string) => void;
  toggleFavoriteDua: (duaId: string) => void;
  toggleChecklistItem: (checklistId: string, itemId: string) => void;
  updateKursusProgress: (moduleId: string, progress: number) => void;
}

export const useIbadahStore = create<IbadahState>((set, get) => ({
  prayerTimes: makkahPrayerTimes,
  kursusModules,
  duas,
  checklists: umrahChecklists,
  favoriteDuas: [],
  selectedCity: 'Makkah',
  qiblaDirection: 292.5,

  setCity: (city) => set({ selectedCity: city }),

  toggleFavoriteDua: (duaId) => {
    const current = get().favoriteDuas;
    if (current.includes(duaId)) {
      set({ favoriteDuas: current.filter((id) => id !== duaId) });
    } else {
      set({ favoriteDuas: [...current, duaId] });
    }
  },

  toggleChecklistItem: (checklistId, itemId) => {
    set((s) => ({
      checklists: s.checklists.map((cl) =>
        cl.id === checklistId
          ? {
              ...cl,
              items: cl.items.map((item) =>
                item.id === itemId ? { ...item, checked: !item.checked } : item
              ),
            }
          : cl
      ),
    }));
  },

  updateKursusProgress: (moduleId, progress) => {
    set((s) => ({
      kursusModules: s.kursusModules.map((m) =>
        m.id === moduleId
          ? { ...m, progress, status: progress >= 1 ? 'completed' : 'in_progress' }
          : m
      ),
    }));
  },
}));
