import { create } from 'zustand';
import { User } from '@/types';
import { mockUser } from '@/data';

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  hasSeenOnboarding: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setHasSeenOnboarding: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  user: null,
  hasSeenOnboarding: false,
  login: async (_email: string, _password: string) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    set({ isLoggedIn: true, user: mockUser });
  },
  logout: () => {
    set({ isLoggedIn: false, user: null });
  },
  setHasSeenOnboarding: (value: boolean) => {
    set({ hasSeenOnboarding: value });
  },
}));
