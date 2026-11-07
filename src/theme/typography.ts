import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const fontFamily = {
  serif: 'Georgia',
  sansSerif: 'System',
  mono: 'Courier New',
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 34,
  '4xl': 40,
  display: 48,
} as const;

export const lineHeight = {
  tight: 1.2,
  snug: 1.35,
  normal: 1.5,
  relaxed: 1.65,
} as const;

export const textStyles = StyleSheet.create({
  displayGold: {
    fontFamily: fontFamily.serif,
    fontSize: fontSize.display,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 3,
  },
  heading1: {
    fontSize: fontSize['3xl'],
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  heading2: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.3,
  },
  heading3: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },
  subheading: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.1,
  },
  body: {
    fontSize: fontSize.base,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: fontSize.base * lineHeight.normal,
  },
  bodySmall: {
    fontSize: fontSize.sm,
    fontWeight: '400',
    color: colors.textMuted,
    lineHeight: fontSize.sm * lineHeight.relaxed,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  goldLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primaryLight,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  price: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  priceSmall: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  caption: {
    fontSize: fontSize.xs,
    fontWeight: '400',
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
  buttonText: {
    fontSize: fontSize.base,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
