import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

// High-quality Pharaonic avatar — elegant Egyptian art in dark tones
const PHARAOH_IMAGE_URI =
  'https://images.unsplash.com/photo-1566438480900-0609be27a4be?w=200&q=80';

type Props = {
  size?: number;
  borderColor?: string;
  borderWidth?: number;
};

export function PharaohAvatar({
  size = 48,
  borderColor = colors.primaryBorderStrong,
  borderWidth = 2,
}: Props) {
  const [hasError, setHasError] = useState(false);
  const innerSize = size - borderWidth * 2;

  return (
    <View
      style={[
        styles.ring,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor,
          borderWidth,
          backgroundColor: colors.surfaceElevated,
        },
      ]}
    >
      {!hasError ? (
        <Image
          source={{ uri: PHARAOH_IMAGE_URI }}
          style={{
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
          }}
          onError={() => setHasError(true)}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
            },
          ]}
        >
          {/* Eye of Horus hieroglyph as graceful fallback */}
          <Text style={[styles.fallbackGlyph, { fontSize: size * 0.35 }]}>
            𓂀
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fallback: {
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackGlyph: {
    color: colors.primaryLight,
  },
});
