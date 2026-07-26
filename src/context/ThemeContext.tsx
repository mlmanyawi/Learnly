import React, { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { applyAccent, palettes } from '@/constants/theme';
import type { AccentId, Palette, ThemeMode } from '@/types';

interface ThemeContextValue {
  mode: ThemeMode;
  colors: Palette;
  accent: AccentId;
  setAccent: (accent: AccentId) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [accent, setAccent] = useState<AccentId>('signal');

  const colors = useMemo(() => applyAccent(palettes[mode], mode, accent), [accent, mode]);

  const value = useMemo(
    () => ({
      mode,
      colors,
      accent,
      setAccent,
      setMode,
      toggleMode: () => setMode((current) => (current === 'dark' ? 'light' : 'dark')),
    }),
    [accent, colors, mode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
}
