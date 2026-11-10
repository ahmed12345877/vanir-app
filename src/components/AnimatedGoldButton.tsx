import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';

interface AnimatedGoldButtonProps {
  onPress: () => void;
  title: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
  disabled?: boolean;
  accessibilityLabel?: string;
}

export function AnimatedGoldButton({
  onPress,
  title,
  style,
  textStyle,
  icon,
  disabled = false,
  accessibilityLabel,
}: AnimatedGoldButtonProps) {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Continuous smooth luxury gold border breathing & shimmering animation
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();

    return () => loop.stop();
  }, [pulseAnim]);

  // Interpolate animated border color between royal gold and bright champagne gold
  const borderColor = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#D4AF37', '#FFF0A6', '#C59A27'],
  });

  const shadowOpacity = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.35, 0.75, 0.35],
  });

  const borderWidth = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1.6, 2.2, 1.6],
  });

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          transform: [{ scale: scaleAnim }],
          shadowOpacity,
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityLabel={accessibilityLabel || title}
        style={styles.pressable}
      >
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              borderColor,
              borderWidth,
            },
            style,
          ]}
        >
          {icon}
          <Text style={[styles.titleText, textStyle]}>{title}</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 6,
  },
  pressable: {
    width: '100%',
  },
  buttonContainer: {
    width: '100%',
    backgroundColor: '#0A0A0A',
    borderRadius: 28,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});
