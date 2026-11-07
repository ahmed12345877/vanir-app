import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface AnimatedSplashScreenProps {
  backgroundColor?: string;
  onAnimationComplete: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * World-Class Cinematic Splash Screen for Vanir VIP Luxury
 * Pure, pristine brand presentation with no lines crossing the logo.
 */
export function AnimatedSplashScreen({
  backgroundColor = '#1C1917',
  onAnimationComplete,
}: AnimatedSplashScreenProps) {
  // Animation drivers
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0.92)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const haloScale = useRef(new Animated.Value(0.9)).current;
  const haloOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleTranslateY = useRef(new Animated.Value(8)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Smooth Entrance Sequence
    const entranceTimeline = Animated.parallel([
      Animated.timing(logoScale, {
        toValue: 1.0,
        duration: 900,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1.0,
        duration: 800,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }),
      Animated.timing(haloScale, {
        toValue: 1.1,
        duration: 1000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(haloOpacity, {
        toValue: 0.45,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(200),
        Animated.parallel([
          Animated.timing(subtitleOpacity, {
            toValue: 1.0,
            duration: 700,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(subtitleTranslateY, {
            toValue: 0,
            duration: 700,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]);

    // 2. Subtle pulse loop
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    entranceTimeline.start(() => {
      pulseLoop.start();
    });

    // 3. Fast, fluid cross-fade transition
    const exitTimer = setTimeout(() => {
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 400,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          pulseLoop.stop();
          onAnimationComplete();
        }
      });
    }, 1200);

    return () => {
      clearTimeout(exitTimer);
      pulseLoop.stop();
    };
  }, [
    containerOpacity,
    haloOpacity,
    haloScale,
    logoOpacity,
    logoScale,
    onAnimationComplete,
    pulseAnim,
    subtitleOpacity,
    subtitleTranslateY,
  ]);

  const interpolatedHaloScale = Animated.add(
    haloScale,
    pulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.04],
    }),
  );

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor,
          opacity: containerOpacity,
        },
      ]}
      pointerEvents="none"
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Atmospheric Ambient Gold Glow Halo behind Logo */}
      <Animated.View
        style={[
          styles.glowHalo,
          {
            opacity: haloOpacity,
            transform: [{ scale: interpolatedHaloScale }],
          },
        ]}
      />

      {/* Clean, Pristine Circular Vanir Luxury Brand Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <Image
          source={require('../assets/vanir_round_logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Brand Title and VIP Prestige Subtitle */}
      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: subtitleOpacity,
            transform: [{ translateY: subtitleTranslateY }],
          },
        ]}
      >
        <Text style={styles.brandTitle}>VANIR</Text>
        <Text style={styles.brandSubtitle}>VIP LUXURY CONCIERGE</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 99999,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1917', // Luxury Deep Navy
  },
  glowHalo: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(212, 175, 55, 0.12)', // Subtle Matte Gold aura
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 12,
  },
  logoContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 16,
  },
  logoImage: {
    width: 190,
    height: 190,
    borderRadius: 95,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 24,
    gap: 6,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#D4AF37', // Matte Gold
    letterSpacing: 8,
    textAlign: 'center',
    fontFamily: 'Playfair Display',
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 4,
    textAlign: 'center',
  },
});
