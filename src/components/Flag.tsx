import React, { memo, useMemo } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { FLAG_SVGS } from '../data/flagSvgs';

/**
 * Hand-drawn extras for common destinations that are not part of the supplied
 * Flagpack set. Same 32x24 (4:3) geometry as the generated flags.
 */
const wrap = (inner: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 4 32 24">${inner}</svg>`;
const EXTRA_FLAGS: Record<string, string> = {
  NL: wrap(
    '<path fill="#AE1C28" d="M0 4h32v8H0z"/><path fill="#fff" d="M0 12h32v8H0z"/><path fill="#21468B" d="M0 20h32v8H0z"/>',
  ),
  RU: wrap(
    '<path fill="#fff" d="M0 4h32v8H0z"/><path fill="#0039A6" d="M0 12h32v8H0z"/><path fill="#D52B1E" d="M0 20h32v8H0z"/>',
  ),
  PL: wrap('<path fill="#fff" d="M0 4h32v12H0z"/><path fill="#DC143C" d="M0 16h32v12H0z"/>'),
  TH: wrap(
    '<path fill="#A51931" d="M0 4h32v24H0z"/><path fill="#F4F5F8" d="M0 8.0h32v16H0z"/><path fill="#2D2A4A" d="M0 12h32v8H0z"/>',
  ),
  QA: wrap(
    '<path fill="#8D1B3D" d="M0 4h32v24H0z"/><path fill="#fff" d="M0 4h9l5 1.7-5 1.7 5 1.7-5 1.7 5 1.7-5 1.7 5 1.7-5 1.7 5 1.7-5 1.7 5 1.7-5 1.7 5 1.7-5 1.7L9 28H0z"/>',
  ),
  OM: wrap(
    '<path fill="#fff" d="M0 4h32v8H0z"/><path fill="#DB161B" d="M0 12h32v8H0z"/><path fill="#008000" d="M0 20h32v8H0z"/><path fill="#DB161B" d="M0 4h9v24H0z"/>',
  ),
  MA: wrap(
    '<path fill="#C1272D" d="M0 4h32v24H0z"/><path stroke="#006233" stroke-width="1.6" d="M16 10.5l2.2 6.8-5.8-4.2h7.2l-5.8 4.2z"/>',
  ),
  SG: wrap(
    '<path fill="#fff" d="M0 4h32v12H0z"/><path fill="#EF3340" d="M0 4h32v12H0z"/><path fill="#fff" d="M0 16h32v12H0z"/><circle cx="7" cy="10" r="3.6" fill="#fff"/><circle cx="8.4" cy="10" r="3.2" fill="#EF3340"/>',
  ),
};

/** Convert an emoji flag (🇪🇬) to its ISO-3166 alpha-2 code ("EG"). */
export function emojiToIso(emoji?: string): string | undefined {
  if (!emoji) return undefined;
  const cps = Array.from(emoji).map(c => c.codePointAt(0) || 0);
  const ri = cps.filter(cp => cp >= 0x1f1e6 && cp <= 0x1f1ff);
  if (ri.length < 2) return undefined;
  return String.fromCharCode(ri[0] - 0x1f1e6 + 65, ri[1] - 0x1f1e6 + 65);
}

interface FlagProps {
  /** Emoji flag string, e.g. "🇪🇬" */
  emoji?: string;
  /** ISO alpha-2 code, e.g. "EG" (wins over emoji) */
  code?: string;
  /** Flag width in px (height is width * 0.75). Default 26. */
  size?: number;
  rounded?: number;
  style?: StyleProp<ViewStyle>;
}

function FlagComponent({ emoji, code, size = 26, rounded = 4, style }: FlagProps) {
  const iso = (code || emojiToIso(emoji) || '').toUpperCase();
  const xml = useMemo(() => FLAG_SVGS[iso] || EXTRA_FLAGS[iso], [iso]);
  const height = Math.round(size * 0.75);

  return (
    <View
      style={[
        styles.box,
        { width: size, height, borderRadius: rounded },
        style,
      ]}
    >
      {xml ? (
        <SvgXml xml={xml} width={size} height={height} />
      ) : emoji && emojiToIso(emoji) ? (
        <Text style={{ fontSize: height * 0.9, lineHeight: height + 2 }}>{emoji}</Text>
      ) : (
        <Text style={{ fontSize: height * 0.7, color: '#D4AF37' }}>🌐</Text>
      )}
    </View>
  );
}

export const Flag = memo(FlagComponent);

const styles = StyleSheet.create({
  box: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(15,30,54,0.18)',
  },
});
