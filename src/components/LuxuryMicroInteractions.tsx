import React, { useRef, useEffect } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
  Platform,
} from 'react-native';

/**
 * The Luxury Ease:
 * Cinematic cubic-bezier curve (0.16, 1, 0.3, 1) as strictly specified.
 */
export const LUXURY_EASE = Easing.bezier(0.16, 1, 0.3, 1);

/**
 * 1. Staggered Entry:
 * Asynchronous Fade-in Up transition for main landing components and cards on page load.
 * Each element transitions up by 15px with a delay of 50ms between each sequential card.
 * Total duration: 600ms (0.6s) with LUXURY_EASE.
 */
export interface StaggeredFadeInUpProps {
  index?: number;
  delayStep?: number; // default 50ms
  distance?: number; // default 15px
  duration?: number; // default 600ms
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export function StaggeredFadeInUp({
  index = 0,
  delayStep = 50,
  distance = 15,
  duration = 600,
  style,
  children,
}: StaggeredFadeInUpProps) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration,
      delay: Math.max(0, index * delayStep),
      easing: LUXURY_EASE,
      useNativeDriver: true,
    }).start();
  }, [anim, index, delayStep, duration]);

  const opacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [distance, 0],
  });

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/**
 * 2. Tactile Feedback (Luxury Pressable):
 * When a user taps or holds any navigation icon or action card, apply a subtle scale
 * animation (transform: scale(0.98)) accompanied by a soft, premium depth shadow adjustment.
 */
export interface LuxuryPressableProps extends Omit<PressableProps, 'style'> {
  scaleTo?: number; // default 0.98
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
  children: React.ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function LuxuryPressable({
  scaleTo = 0.98,
  style,
  children,
  onPressIn,
  onPressOut,
  ...props
}: LuxuryPressableProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = (event: any) => {
    Animated.timing(scaleAnim, {
      toValue: scaleTo,
      duration: 160,
      easing: LUXURY_EASE,
      useNativeDriver: true,
    }).start();
    onPressIn?.(event);
  };

  const handlePressOut = (event: any) => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 260,
      easing: LUXURY_EASE,
      useNativeDriver: true,
    }).start();
    onPressOut?.(event);
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        style as any,
        { transform: [{ scale: scaleAnim }] },
      ]}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
}

/**
 * Elite Luxury Typography Constants
 * Section headers: 24px bold
 * Card titles: 18px medium-bold
 * Secondary captions, locations & labels: 12-14px with #6B7280 contrast
 */
export const luxuryTypography = {
  headerSerif: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'serif',
  }),
  bodySans: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'System',
  }),
  colors: {
    primaryText: '#0F172A',
    secondaryText: '#6B7280',
    brandNavy: '#1C1917',
    goldAccent: '#D4AF37',
    borderMuted: '#E5E7EB',
    bgCard: '#FFFFFF',
  },
  scale: {
    sectionHeader: 24,
    cardTitle: 18,
    priceFigure: 20,
    body: 14,
    caption: 12,
  },
};
