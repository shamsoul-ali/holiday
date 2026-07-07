import { create } from 'zustand';

interface AppState {
  isFirstLaunch: boolean;
  theme: 'light' | 'dark';
  notificationCount: number;
  setFirstLaunch: (value: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setNotificationCount: (count: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isFirstLaunch: true,
  theme: 'light',
  notificationCount: 2,
  setFirstLaunch: (value) => set({ isFirstLaunch: value }),
  setTheme: (theme) => set({ theme }),
  setNotificationCount: (count) => set({ notificationCount: count }),
}));
