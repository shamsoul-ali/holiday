import { create } from 'zustand';
import { JemaahProfile } from '@/types';
import { mockUser } from '@/data';

interface AuthState {
  isLoggedIn: boolean;
  user: JemaahProfile | null;
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
