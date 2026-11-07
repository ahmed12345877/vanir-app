import { buildThemeColors, oceanPearlTheme } from '../context/ThemeContext';

export const colors = buildThemeColors(oceanPearlTheme);

export type Color = keyof typeof colors;
