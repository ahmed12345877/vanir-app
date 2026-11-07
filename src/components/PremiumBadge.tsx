import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';

type BadgeVariant = 'gold' | 'success' | 'info' | 'warning';

interface PremiumBadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  gold: {
    bg: colors.primaryMuted,
    text: colors.primaryLight,
    border: colors.primaryBorder,
  },
  success: {
    bg: colors.successMuted,
    text: colors.success,
    border: 'rgba(63,185,143,0.3)',
  },
  info: {
    bg: 'rgba(100,160,255,0.1)',
    text: '#7eb3ff',
    border: 'rgba(100,160,255,0.25)',
  },
  warning: {
    bg: colors.warningMuted,
    text: colors.warning,
    border: 'rgba(136,146,176,0.35)',
  },
};

export function PremiumBadge({ label, variant = 'gold', style }: PremiumBadgeProps) {
  const vs = variantStyles[variant];
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: vs.bg, borderColor: vs.border },
        style,
      ]}>
      <Text style={[styles.label, { color: vs.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: borderRadius.full,
    borderWidth: 1,
    paddingHorizontal: spacing[2],
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
