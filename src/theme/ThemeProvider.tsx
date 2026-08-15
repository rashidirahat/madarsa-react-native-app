import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ColorSchemeName, useColorScheme } from 'react-native';

import { DARK_COLORS, LIGHT_COLORS } from './colors';
import { Theme, ThemeColors, ThemeMode } from './types';

const STORAGE_KEY = '@madarsa/theme-mode';

interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  colors: ThemeColors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveIsDark(mode: ThemeMode, system: ColorSchemeName): boolean {
  if (mode === 'system') {
    return system === 'dark';
  }
  return mode === 'dark';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setModeState(stored);
        }
      })
      .catch(() => {
        // Ignore — fall back to system.
      })
      .finally(() => setHydrated(true));
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {
      // Ignore persistence failures.
    });
  }, []);

  const isDark = resolveIsDark(mode, systemScheme);

  const value = useMemo<ThemeContextValue>(() => {
    const colors = isDark ? DARK_COLORS : LIGHT_COLORS;
    return {
      theme: { mode, isDark, colors },
      mode,
      setMode,
      colors,
      isDark,
    };
  }, [mode, isDark, setMode]);

  if (!hydrated) {
    return null;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
