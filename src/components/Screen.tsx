import React, { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, Text, View, I18nManager } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

type ScreenProps = PropsWithChildren<{
  title?: string;
  subtitle?: string;
}>;

export function Screen({ children, title, subtitle }: ScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 88 + insets.bottom }]}>
        {title ? (
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        ) : null}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function SectionCard({ children }: PropsWithChildren) {
  return <View style={styles.card}>{children}</View>;
}

export const screenStyles = StyleSheet.create({
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  body: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  label: {
    color: colors.primarySoft,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 6,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  row: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  header: {
    gap: 6,
    alignItems: I18nManager.isRTL ? 'flex-end' : 'flex-start',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 10,
    alignItems: I18nManager.isRTL ? 'flex-end' : 'flex-start',
  },
});
