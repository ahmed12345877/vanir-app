import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path, Rect, G } from 'react-native-svg';
import { toQR } from 'toqr';

export interface RealQRCodeProps {
  /** Text or URL to encode in the QR matrix */
  value: string;
  /** Overall width and height in density-independent pixels */
  size?: number;
  /** Foreground module color */
  color?: string;
  /** Background tile color */
  backgroundColor?: string;
  /** Optional container style */
  style?: ViewStyle;
}

/**
 * Pure SVG scannable QR Code generator.
 * Encodes dynamic strings (user UIDs, URLs, LPA strings) into a standard ISO/IEC 18004
 * compliant matrix rendered with high performance via a single SVG path.
 */
export function RealQRCode({
  value,
  size = 140,
  color = '#1C1917',
  backgroundColor = '#FFFFFF',
  style,
}: RealQRCodeProps) {
  const { path, matrixSize } = useMemo(() => {
    if (!value || typeof value !== 'string') {
      return { path: '', matrixSize: 21 };
    }
    try {
      const qrData = toQR(value);
      const side = Math.round(Math.sqrt(qrData.length));
      let d = '';
      for (let y = 0; y < side; y++) {
        for (let x = 0; x < side; x++) {
          if (qrData[y * side + x]) {
            // Draw 1x1 module rectangle
            d += `M${x},${y}h1v1h-1z `;
          }
        }
      }
      return { path: d, matrixSize: side };
    } catch (e) {
      console.warn('[RealQRCode] Generation warning:', e);
      return { path: '', matrixSize: 21 };
    }
  }, [value]);

  return (
    <View style={[styles.container, { width: size, height: size, backgroundColor }, style]}>
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${matrixSize} ${matrixSize}`}
      >
        {path ? <Path d={path} fill={color} /> : null}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
