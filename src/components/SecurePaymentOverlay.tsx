import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Circle, Rect, Path, G, Polygon } from 'react-native-svg';
import { Lock, ShieldCheck } from 'lucide-react-native';

export interface SecurePaymentOverlayProps {
  visible: boolean;
  onComplete?: () => void;
  /** Optional custom amount displayed in the overlay */
  amount?: string | number;
}

const STATUS_MESSAGES = [
  'Authorizing secure anti-fraud protocols...',
  'Connecting to secure payment gateway...',
  'Authorizing 3D-Secure protocols...',
  'Securing your premium itinerary...',
  'Finalizing your luxury confirmation...',
];

export function SecurePaymentOverlay({
  visible,
  onComplete,
  amount,
}: SecurePaymentOverlayProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  // Spin Animation for Geometric Loader
  const spinValue = useRef(new Animated.Value(0)).current;
  const innerSpinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  // Text Fade & Slide Transition Animation
  const textOpacity = useRef(new Animated.Value(1)).current;
  const textTranslateY = useRef(new Animated.Value(0)).current;

  // Progress Bar Animation
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      setMessageIndex(0);
      spinValue.setValue(0);
      innerSpinValue.setValue(0);
      progressAnim.setValue(0);
      return;
    }

    // Outer spin
    const spinLoop = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 3200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spinLoop.start();

    // Counter-clockwise inner spin
    const innerSpinLoop = Animated.loop(
      Animated.timing(innerSpinValue, {
        toValue: 1,
        duration: 2200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    innerSpinLoop.start();

    // Pulse core
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.15,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    // Progress bar fill across ~6 seconds
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 6200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();

    // Dynamic text cycle every 2000ms (2 seconds)
    let currentIdx = 0;
    const interval = setInterval(() => {
      currentIdx += 1;
      if (currentIdx < STATUS_MESSAGES.length) {
        // Fade out
        Animated.parallel([
          Animated.timing(textOpacity, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.timing(textTranslateY, {
            toValue: -8,
            duration: 220,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setMessageIndex(currentIdx);
          textTranslateY.setValue(8);
          // Fade in
          Animated.parallel([
            Animated.timing(textOpacity, {
              toValue: 1,
              duration: 260,
              useNativeDriver: true,
            }),
            Animated.timing(textTranslateY, {
              toValue: 0,
              duration: 260,
              useNativeDriver: true,
            }),
          ]).start();
        });
      }
    }, 2000);

    return () => {
      clearInterval(interval);
      spinLoop.stop();
      innerSpinLoop.stop();
      pulseLoop.stop();
    };
  }, [visible, spinValue, innerSpinValue, pulseValue, textOpacity, textTranslateY, progressAnim]);

  if (!visible) return null;

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const innerSpin = innerSpinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['5%', '100%'],
  });

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        {/* Ambient Dark Gradient Layer */}
        <View style={styles.ambientGlow} />

        <View style={styles.cardContainer}>
          {/* Minimal Luxury Geometric Loader */}
          <View style={styles.loaderWrapper}>
            {/* Outer Spinning Geometric Ring */}
            <Animated.View style={[styles.geometricLayer, { transform: [{ rotate: spin }] }]}>
              <Svg width={96} height={96} viewBox="0 0 96 96">
                {/* Octagonal Outer Boundary */}
                <Polygon
                  points="28,4 68,4 92,28 92,68 68,92 28,92 4,68 4,28"
                  fill="none"
                  stroke="#D4AF37"
                  strokeWidth="1.5"
                  strokeOpacity="0.45"
                  strokeDasharray="8 4"
                />
                {/* 4 Corner Accents */}
                <Circle cx="28" cy="4" r="2.5" fill="#D4AF37" />
                <Circle cx="68" cy="4" r="2.5" fill="#D4AF37" />
                <Circle cx="92" cy="28" r="2.5" fill="#D4AF37" />
                <Circle cx="92" cy="68" r="2.5" fill="#D4AF37" />
                <Circle cx="68" cy="92" r="2.5" fill="#D4AF37" />
                <Circle cx="28" cy="92" r="2.5" fill="#D4AF37" />
                <Circle cx="4" cy="68" r="2.5" fill="#D4AF37" />
                <Circle cx="4" cy="28" r="2.5" fill="#D4AF37" />
              </Svg>
            </Animated.View>

            {/* Inner Counter-Spinning Square */}
            <Animated.View
              style={[styles.geometricLayer, { transform: [{ rotate: innerSpin }] }]}
            >
              <Svg width={64} height={64} viewBox="0 0 64 64">
                <Rect
                  x="12"
                  y="12"
                  width="40"
                  height="40"
                  fill="none"
                  stroke="#D4AF37"
                  strokeWidth="1.8"
                  strokeOpacity="0.8"
                  rx="4"
                />
                <Circle cx="32" cy="12" r="2" fill="#D4AF37" />
                <Circle cx="32" cy="52" r="2" fill="#D4AF37" />
                <Circle cx="12" cy="32" r="2" fill="#D4AF37" />
                <Circle cx="52" cy="32" r="2" fill="#D4AF37" />
              </Svg>
            </Animated.View>

            {/* Center Pulsing Security Diamond */}
            <Animated.View
              style={[
                styles.centerDiamond,
                { transform: [{ scale: pulseValue }, { rotate: '45deg' }] },
              ]}
            >
              <View style={styles.diamondInner}>
                <Lock color="#1C1917" size={14} strokeWidth={2.5} style={{ transform: [{ rotate: '-45deg' }] }} />
              </View>
            </Animated.View>
          </View>

          {/* Secure Transaction Header */}
          <View style={styles.badgeRow}>
            <ShieldCheck color="#D4AF37" size={14} strokeWidth={2.2} />
            <Text style={styles.kickerText}>SECURE TRANSACTION IN PROGRESS</Text>
          </View>

          {/* Dynamic Transitioning Text (Changes every 2s) */}
          <Animated.View
            style={[
              styles.textWrapper,
              {
                opacity: textOpacity,
                transform: [{ translateY: textTranslateY }],
              },
            ]}
          >
            <Text style={styles.statusMessage}>{STATUS_MESSAGES[messageIndex]}</Text>
          </Animated.View>

          {/* Amount Badge (if provided) */}
          {amount ? (
            <View style={styles.amountPill}>
              <Text style={styles.amountLabel}>Total Authorized:</Text>
              <Text style={styles.amountValue}>
                {typeof amount === 'number' ? `$${amount.toLocaleString('en-US')}` : amount}
              </Text>
            </View>
          ) : null}

          {/* Luxury Slim Progress Track */}
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
          </View>

          {/* Bank Security Certification Footer */}
          <View style={styles.securityFooter}>
            <Lock color="#94A3B8" size={12} strokeWidth={2} />
            <Text style={styles.securityFooterText}>
              256-Bit SSL Bank-Grade Encryption • PCI-DSS Level 1 Verified
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(28, 25, 23, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  ambientGlow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    filter: Platform.OS === 'web' ? 'blur(60px)' : undefined,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#0B1526',
    borderRadius: 24,
    borderWidth: 1.2,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 16,
  },
  loaderWrapper: {
    width: 104,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
    position: 'relative',
  },
  geometricLayer: {
    position: 'absolute',
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerDiamond: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 6,
  },
  diamondInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  kickerText: {
    color: '#D4AF37',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  textWrapper: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  statusMessage: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: 0.3,
  },
  amountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    marginTop: 14,
  },
  amountLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  amountValue: {
    fontSize: 12.5,
    color: '#D4AF37',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  progressTrack: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginTop: 22,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 2,
  },
  securityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 18,
    opacity: 0.75,
  },
  securityFooterText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
