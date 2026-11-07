import React, { PropsWithChildren } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { borderRadius, shadow, spacing } from '../theme/spacing';

interface GlassCardProps extends PropsWithChildren {
  style?: ViewStyle;
  elevated?: boolean;
  goldBorder?: boolean;
  activeBorder?: boolean;
  padding?: number;
  noPadding?: boolean;
}

export function GlassCard({
  children,
  style,
  elevated = false,
  goldBorder = false,
  activeBorder = false,
  padding,
  noPadding = false,
}: GlassCardProps) {
  const hasHighlight = activeBorder || goldBorder;

  return (
    <View
      style={[
        styles.card,
        elevated && styles.elevated,
        hasHighlight && styles.activeBorder,
        !noPadding && { padding: padding ?? spacing[4] },
        style,
      ]}>
      <View style={styles.topSheen} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glass,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
    ...shadow.card,
  },
  elevated: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.primaryBorder,
  },
  activeBorder: {
    borderColor: colors.primary,
  },
  topSheen: {
    position: 'absolute',
    top: 0,
    left: spacing[6],
    right: spacing[6],
    height: 1,
    backgroundColor: colors.glassSheen,
    borderRadius: borderRadius.full,
  },
});
