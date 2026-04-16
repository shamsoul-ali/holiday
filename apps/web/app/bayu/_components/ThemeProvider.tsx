'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
  mounted: boolean;
}

const Ctx = createContext<ThemeCtx>({
  theme: 'dark',
  toggle: () => {},
  setTheme: () => {},
  mounted: false,
});

const STORAGE_KEY = 'bayu-theme';

export function useTheme() {
  return useContext(Ctx);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Default to dark so SSR + pre-hydration match the old look.
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY)) as Theme | null;
    if (stored === 'light' || stored === 'dark') setThemeState(stored);
    setMounted(true);
  }, []);

  function setTheme(next: Theme) {
    setThemeState(next);
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, next);
  }

  function toggle() {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }

  // Apply the class to the nearest .bayu-root element. We do this via the wrapper below.
  return (
    <Ctx.Provider value={{ theme, toggle, setTheme, mounted }}>
      <div className={`bayu-root ${theme === 'dark' ? 'dark' : ''}`}>{children}</div>
    </Ctx.Provider>
  );
}
