import { create } from 'zustand';

interface AppState {
  isFirstLaunch: boolean;
  theme: 'light' | 'dark';
  language: 'bm' | 'en';
  notificationCount: number;
  setFirstLaunch: (value: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (lang: 'bm' | 'en') => void;
  setNotificationCount: (count: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isFirstLaunch: true,
  theme: 'light',
  language: 'bm',
  notificationCount: 2,
  setFirstLaunch: (value) => set({ isFirstLaunch: value }),
  setTheme: (theme) => set({ theme }),
  setLanguage: (lang) => set({ language: lang }),
  setNotificationCount: (count) => set({ notificationCount: count }),
}));
