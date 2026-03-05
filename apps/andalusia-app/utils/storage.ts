import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  ONBOARDING: 'has_seen_onboarding',
  AUTH_TOKEN: 'auth_token',
  USER: 'user_data',
  THEME: 'app_theme',
  LANGUAGE: 'app_language',
} as const;

export const storage = {
  getOnboardingStatus: async (): Promise<boolean> => {
    const value = await AsyncStorage.getItem(KEYS.ONBOARDING);
    return value === 'true';
  },
  setOnboardingStatus: async (seen: boolean): Promise<void> => {
    await AsyncStorage.setItem(KEYS.ONBOARDING, String(seen));
  },
  getTheme: async (): Promise<string | null> => {
    return AsyncStorage.getItem(KEYS.THEME);
  },
  setTheme: async (theme: string): Promise<void> => {
    await AsyncStorage.setItem(KEYS.THEME, theme);
  },
  getLanguage: async (): Promise<string | null> => {
    return AsyncStorage.getItem(KEYS.LANGUAGE);
  },
  setLanguage: async (lang: string): Promise<void> => {
    await AsyncStorage.setItem(KEYS.LANGUAGE, lang);
  },
  clear: async (): Promise<void> => {
    await AsyncStorage.clear();
  },
};
