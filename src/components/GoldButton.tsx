import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../theme/colors';
import { borderRadius, shadow, spacing } from '../theme/spacing';

type Variant = 'solid' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface GoldButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export function GoldButton({
  label,
  onPress,
  variant = 'solid',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  icon,
}: GoldButtonProps) {
  const sizeStyles = sizes[size];
  const isDisabled = disabled || loading;

  if (variant === 'solid') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={[styles.pressable, fullWidth && styles.fullWidth, style]}>
        {({ pressed }) => (
          <LinearGradient
            colors={
              isDisabled
                ? [colors.surfaceAlt, colors.surfaceElevated]
                : pressed
                ? [colors.primaryDark, colors.primaryDark]
                : [colors.primary, colors.primaryDark]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.solidBase, sizeStyles.container, shadow.goldGlow]}>
            {loading ? (
              <ActivityIndicator color={colors.textOnGold} size="small" />
            ) : (
              <View style={styles.inner}>
                {icon && <View style={styles.iconWrap}>{icon}</View>}
                <Text
                  style={[
                    styles.solidLabel,
                    sizeStyles.label,
                    isDisabled && styles.disabledLabel,
                  ]}>
                  {label}
                </Text>
              </View>
            )}
          </LinearGradient>
        )}
      </Pressable>
    );
  }

  if (variant === 'outline') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={[styles.pressable, fullWidth && styles.fullWidth, style]}>
        {({ pressed }) => (
          <View
            style={[
              styles.outlineBase,
              sizeStyles.container,
              pressed && styles.outlinePressed,
              isDisabled && styles.outlineDisabled,
            ]}>
            {loading ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <View style={styles.inner}>
                {icon && <View style={styles.iconWrap}>{icon}</View>}
                <Text
                  style={[
                    styles.outlineLabel,
                    sizeStyles.label,
                    isDisabled && styles.disabledLabel,
                  ]}>
                  {label}
                </Text>
              </View>
            )}
          </View>
        )}
      </Pressable>
    );
  }

  // ghost
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.pressable, fullWidth && styles.fullWidth, style]}>
      {({ pressed }) => (
        <View style={[styles.ghostBase, sizeStyles.container, pressed && styles.ghostPressed]}>
          {loading ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <View style={styles.inner}>
              {icon && <View style={styles.iconWrap}>{icon}</View>}
              <Text
                style={[
                  styles.outlineLabel,
                  sizeStyles.label,
                  isDisabled && styles.disabledLabel,
                ]}>
                {label}
              </Text>
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}

const sizes = {
  sm: StyleSheet.create({
    container: { paddingVertical: spacing[2], paddingHorizontal: spacing[4] },
    label: { fontSize: 12, letterSpacing: 1.5 },
  }),
  md: StyleSheet.create({
    container: { paddingVertical: spacing[3], paddingHorizontal: spacing[6] },
    label: { fontSize: 14, letterSpacing: 1.8 },
  }),
  lg: StyleSheet.create({
    container: { paddingVertical: spacing[4], paddingHorizontal: spacing[8] },
    label: { fontSize: 15, letterSpacing: 2 },
  }),
};

const styles = StyleSheet.create({
  pressable: { alignSelf: 'flex-start' },
  fullWidth: { alignSelf: 'stretch' },
  inner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[2] },
  iconWrap: { marginRight: -spacing[1] },
  // Solid
  solidBase: { borderRadius: borderRadius.xl, alignItems: 'center', justifyContent: 'center' },
  solidLabel: { color: colors.textOnGold, fontWeight: '700', textTransform: 'uppercase' },
  // Outline
  outlineBase: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.primaryBorderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlinePressed: { backgroundColor: colors.primaryMuted },
  outlineDisabled: { borderColor: colors.border },
  outlineLabel: { color: colors.primary, fontWeight: '700', textTransform: 'uppercase' },
  // Ghost
  ghostBase: { borderRadius: borderRadius.xl, alignItems: 'center', justifyContent: 'center' },
  ghostPressed: { backgroundColor: colors.primaryGlow },
  // Disabled
  disabledLabel: { color: colors.textMuted },
});
