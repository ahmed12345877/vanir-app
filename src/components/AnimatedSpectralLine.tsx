import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export interface AnimatedSpectralLineProps {
  height?: number;
  style?: ViewStyle;
}

// Seamless cyclic spectral colors (starts and ends with #00E5FF so two adjacent strips tile with zero seam)
export const SPECTRAL_CYCLE_COLORS = [
  '#00E5FF', // Electric Cyan
  '#00E676', // Emerald Neon
  '#FFEA00', // Solar Gold
  '#FF6D00', // Vibrant Amber
  '#FF1744', // Crimson Rose
  '#D500F9', // Royal Magenta
  '#2979FF', // Electric Indigo
  '#00E5FF', // Seamless wrap back to Electric Cyan
];

const SCREEN_WIDTH = Dimensions.get('window').width;

/**
 * AnimatedSpectralLine
 * Renders a continuous, linear-flowing chromatic spectral rainbow bar
 * using two identical tiled LinearGradient strips and Easing.linear.
 */
export function AnimatedSpectralLine({ height = 3.5, style }: AnimatedSpectralLineProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animatedValue.setValue(0);
    const loop = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 2400,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      { resetBeforeIteration: true },
    );
    loop.start();
    return () => loop.stop();
  }, [animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -SCREEN_WIDTH],
  });

  return (
    <View style={[styles.container, { height }, style]} pointerEvents="none">
      <Animated.View
        style={[
          styles.gradientTrack,
          {
            width: SCREEN_WIDTH * 2,
            height,
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={SPECTRAL_CYCLE_COLORS}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ width: SCREEN_WIDTH, height }}
        />
        <LinearGradient
          colors={SPECTRAL_CYCLE_COLORS}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ width: SCREEN_WIDTH, height }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 2,
  },
  gradientTrack: {
    flexDirection: 'row',
  },
});

export default AnimatedSpectralLine;
