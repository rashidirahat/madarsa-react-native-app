export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  textPrimary: string;
  textSecondary: string;
  brand: string;
  brandSoft: string;
  accent: string;
  accentSoft: string;
  border: string;
  input: string;
  placeholder: string;
  danger: string;
  dangerSoft: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  onBrand: string;
  onAccent: string;
  disabled: string;
  overlay: string;
  tabBar: string;
}

export interface Theme {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
}
