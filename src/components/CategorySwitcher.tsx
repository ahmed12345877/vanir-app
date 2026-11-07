import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Compass, Plane, Package, Sun } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';

export type BookingCategory = 'stays' | 'flights' | 'cars' | 'ai-studio';

interface Category {
  id: BookingCategory;
  label: string;
  icon: (color: string) => React.ReactNode;
}

const CATEGORIES: Category[] = [
  { id: 'stays', label: 'All', icon: (color) => <Compass color={color} size={16} strokeWidth={1.5} /> },
  { id: 'flights', label: 'Tours', icon: (color) => <Plane color={color} size={16} strokeWidth={1.5} /> },
  { id: 'cars', label: 'Packages', icon: (color) => <Package color={color} size={16} strokeWidth={1.5} /> },
  { id: 'ai-studio', label: 'Day Trips', icon: (color) => <Sun color={color} size={16} strokeWidth={1.5} /> },
];

interface CategorySwitcherProps {
  active: BookingCategory;
  onChange: (cat: BookingCategory) => void;
}

export function CategorySwitcher({ active, onChange }: CategorySwitcherProps) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {CATEGORIES.map(cat => {
          const isActive = cat.id === active;
          const color = isActive ? colors.textOnCyan : colors.textPrimary;
          return (
            <Pressable
              key={cat.id}
              onPress={() => onChange(cat.id)}
              style={[styles.tab, isActive ? styles.tabActive : styles.tabInactive]}>
              {cat.icon(color)}
              <Text style={[styles.label, isActive && styles.labelActive]}>{cat.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: spacing[2],
  },
  scrollContent: {
    paddingHorizontal: spacing[5],
    gap: spacing[2],
  },
  tab: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    alignItems: 'center',
    borderRadius: borderRadius.full,
    gap: spacing[1],
    minWidth: 80,
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: colors.cyan,
  },
  tabInactive: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: 0.3,
  },
  labelActive: {
    color: colors.textOnCyan,
  },
});
