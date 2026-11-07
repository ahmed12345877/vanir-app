import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface ArtDecoHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
}

export function ArtDecoHeader({ title, subtitle, centered = false }: ArtDecoHeaderProps) {
  return (
    <View style={[styles.container, centered && styles.centered]}>
      <Text style={[styles.title, centered && styles.textCenter]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, centered && styles.textCenter]}>{subtitle}</Text>
      )}
    </View>
  );
}

/** Compact version for section headings */
export function SectionHeading({ label }: { label: string }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[2],
  },
  centered: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  textCenter: {
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    textTransform: 'uppercase',
  },
});
