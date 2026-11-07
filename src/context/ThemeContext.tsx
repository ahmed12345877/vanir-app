import React, { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

export type ThemeSeed = {
  primaryColor: string;
  backgroundColor: string;
  borderColor: string;
};

export const lightLuxuryTheme: ThemeSeed = {
  primaryColor: '#D4AF37',
  backgroundColor: '#FAF9F6',
  borderColor: 'rgba(212, 175, 55, 0.25)',
};

export const oceanPearlTheme: ThemeSeed = {
  primaryColor: '#D4AF37',
  backgroundColor: '#FAF9F6',
  borderColor: 'rgba(212, 175, 55, 0.25)',
};

export type ThemeColors = {
  background: string;
  backgroundDeep: string;
  surface: string;
  surfaceAlt: string;
  surfaceElevated: string;
  surfaceCard: string;
  overlay: string;
  primary: string;
  primaryLight: string;
  primarySoft: string;
  primaryDark: string;
  primaryMuted: string;
  primaryGlow: string;
  primaryBorder: string;
  primaryBorderStrong: string;
  cyan: string;
  cyanDark: string;
  cyanMuted: string;
  cyanBorder: string;
  cyanGlow: string;
  textOnCyan: string;
  accent: string;
  accentLight: string;
  accentMuted: string;
  accentBorder: string;
  purple: string;
  purpleMuted: string;
  purpleBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textGold: string;
  textOnGold: string;
  border: string;
  borderMid: string;
  borderStrong: string;
  success: string;
  successMuted: string;
  danger: string;
  dangerMuted: string;
  warning: string;
  warningMuted: string;
  glass: string;
  glassBorder: string;
  glassSheen: string;
  gradientAccentStart: string;
  gradientAccentEnd: string;
  gradientDarkStart: string;
  gradientDarkEnd: string;
  gradientCatalogHeader: string;
  gradientGoldStart: string;
  gradientGoldEnd: string;
  gradientCyanStart: string;
  gradientCyanEnd: string;
};

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean;
  const channels = full.match(/.{1,2}/g)?.map(channel => parseInt(channel, 16)) ?? [0, 0, 0];
  return [
    channels[0] ?? 0,
    channels[1] ?? 0,
    channels[2] ?? 0,
  ];
}

export function buildThemeColors(seed: ThemeSeed): ThemeColors {
  const { primaryColor, backgroundColor, borderColor } = seed;
  const isDark = backgroundColor.startsWith('#0') || backgroundColor.startsWith('#1');
  const [pr, pg, pb] = hexToRgb(primaryColor);

  if (!isDark) {
    return {
      background: backgroundColor,
      backgroundDeep: '#F5F5F0',
      surface: '#FFFFFF',
      surfaceAlt: '#FAF9F6',
      surfaceElevated: '#FFFFFF',
      surfaceCard: '#FFFFFF',
      overlay: 'rgba(28, 25, 23, 0.7)',
      primary: primaryColor,
      primaryLight: '#E8CA65',
      primarySoft: 'rgba(212, 175, 55, 0.12)',
      primaryDark: '#B89628',
      primaryMuted: `rgba(${pr},${pg},${pb},0.1)`,
      primaryGlow: `rgba(${pr},${pg},${pb},0.2)`,
      primaryBorder: `rgba(${pr},${pg},${pb},0.25)`,
      primaryBorderStrong: `rgba(${pr},${pg},${pb},0.5)`,
      cyan: '#1C1917',
      cyanDark: '#1C1917',
      cyanMuted: 'rgba(212, 175, 55, 0.12)',
      cyanBorder: 'rgba(212, 175, 55, 0.25)',
      cyanGlow: 'rgba(212, 175, 55, 0.15)',
      textOnCyan: '#FFFFFF',
      accent: '#D4AF37',
      accentLight: '#E8CA65',
      accentMuted: 'rgba(212, 175, 55, 0.1)',
      accentBorder: 'rgba(212, 175, 55, 0.25)',
      purple: '#1C1917',
      purpleMuted: 'rgba(212, 175, 55, 0.1)',
      purpleBorder: 'rgba(212, 175, 55, 0.25)',
      textPrimary: '#1C1917',
      textSecondary: '#44403C',
      textMuted: '#78716C',
      textGold: '#D4AF37',
      textOnGold: '#1C1917',
      border: borderColor,
      borderMid: 'rgba(212, 175, 55, 0.3)',
      borderStrong: 'rgba(212, 175, 55, 0.5)',
      success: '#16A34A',
      successMuted: '#DCFCE7',
      danger: '#DC2626',
      dangerMuted: '#FEE2E2',
      warning: '#EA580C',
      warningMuted: '#FFEDD5',
      glass: 'rgba(255, 255, 255, 0.95)',
      glassBorder: borderColor,
      glassSheen: '#FFFFFF',
      gradientAccentStart: primaryColor,
      gradientAccentEnd: '#B89628',
      gradientDarkStart: '#1C1917',
      gradientDarkEnd: '#292524',
      gradientCatalogHeader: '#FAF9F6',
      gradientGoldStart: '#D4AF37',
      gradientGoldEnd: '#B89628',
      gradientCyanStart: '#1C1917',
      gradientCyanEnd: '#292524',
    };
  }

  return {
    background: backgroundColor,
    backgroundDeep: '#0A1322',
    surface: '#132038',
    surfaceAlt: '#0E1726',
    surfaceElevated: '#162744',
    surfaceCard: 'rgba(212, 175, 55, 0.05)',
    overlay: 'rgba(10, 19, 34, 0.85)',
    primary: primaryColor,
    primaryLight: '#F3E5AB',
    primarySoft: primaryColor,
    primaryDark: '#B89628',
    primaryMuted: `rgba(${pr},${pg},${pb},0.15)`,
    primaryGlow: `rgba(${pr},${pg},${pb},0.2)`,
    primaryBorder: `rgba(${pr},${pg},${pb},0.3)`,
    primaryBorderStrong: `rgba(${pr},${pg},${pb},0.6)`,
    cyan: primaryColor,
    cyanDark: '#B89628',
    cyanMuted: `rgba(${pr},${pg},${pb},0.12)`,
    cyanBorder: `rgba(${pr},${pg},${pb},0.3)`,
    cyanGlow: `rgba(${pr},${pg},${pb},0.15)`,
    textOnCyan: '#1C1917',
    accent: '#D4AF37',
    accentLight: '#F3E5AB',
    accentMuted: 'rgba(212, 175, 55, 0.15)',
    accentBorder: 'rgba(212, 175, 55, 0.3)',
    purple: '#D4AF37',
    purpleMuted: 'rgba(212, 175, 55, 0.15)',
    purpleBorder: 'rgba(212, 175, 55, 0.3)',
    textPrimary: '#FFFFFF',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
    textGold: '#D4AF37',
    textOnGold: '#1C1917',
    border: borderColor,
    borderMid: `rgba(${pr},${pg},${pb},0.2)`,
    borderStrong: `rgba(${pr},${pg},${pb},0.35)`,
    success: '#10B981',
    successMuted: 'rgba(16, 185, 129, 0.15)',
    danger: '#EF4444',
    dangerMuted: 'rgba(239, 68, 68, 0.15)',
    warning: '#F59E0B',
    warningMuted: 'rgba(245, 158, 11, 0.15)',
    glass: 'rgba(19, 32, 56, 0.75)',
    glassBorder: borderColor,
    glassSheen: 'rgba(212, 175, 55, 0.1)',
    gradientAccentStart: primaryColor,
    gradientAccentEnd: '#B89628',
    gradientDarkStart: '#132038',
    gradientDarkEnd: backgroundColor,
    gradientCatalogHeader: '#1C1917',
    gradientGoldStart: primaryColor,
    gradientGoldEnd: '#B89628',
    gradientCyanStart: primaryColor,
    gradientCyanEnd: '#B89628',
  };
}

type ThemeContextValue = {
  seed: ThemeSeed;
  colors: ThemeColors;
  setThemeSeed: (seed: ThemeSeed) => void;
  patchThemeSeed: (patch: Partial<ThemeSeed>) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [seed, setSeed] = useState<ThemeSeed>(lightLuxuryTheme);
  const patchThemeSeed = useCallback((patch: Partial<ThemeSeed>) => {
    setSeed(current => ({ ...current, ...patch }));
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      seed,
      colors: buildThemeColors(seed),
      setThemeSeed: setSeed,
      patchThemeSeed,
    }),
    [patchThemeSeed, seed],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider.');
  }

  return context;
}
