import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { PremiumBadge } from './PremiumBadge';
import { colors } from '../theme/colors';
import { borderRadius, shadow, spacing } from '../theme/spacing';
import { formatEnglishNumber } from '../lib/formatters';

export interface PropertyCardData {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
  pricePerNight: number;
  currency: string;
  rating: number;
  reviewCount: number;
  badges: Array<{ label: string; variant: 'gold' | 'success' | 'info' | 'warning' }>;
  category: 'hotel' | 'villa' | 'resort' | 'penthouse';
}

interface PropertyCardProps {
  data: PropertyCardData;
  onPress: (id: string) => void;
}

export function PropertyCard({ data, onPress }: PropertyCardProps) {
  return (
    <Pressable onPress={() => onPress(data.id)} style={styles.wrapper}>
      {({ pressed }) => (
        <View style={[styles.card, pressed && styles.cardPressed, shadow.card]}>
          {/* Hero image */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: data.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
            {/* Gradient overlay */}
            <LinearGradient
              colors={['transparent', colors.overlay]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.imageGradient}
            />
            {/* Category pill */}
            <View style={styles.categoryPill}>
              <Text style={styles.categoryText}>{data.category.toUpperCase()}</Text>
            </View>
            {/* Rating overlay */}
            <View style={styles.ratingOverlay}>
              <Text style={styles.ratingStar}>★</Text>
              <Text style={styles.ratingValue}>{data.rating.toFixed(1)}</Text>
              <Text style={styles.ratingCount}>({data.reviewCount})</Text>
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.nameRow}>
              <View style={styles.nameBlock}>
                <Text style={styles.name} numberOfLines={1}>
                  {data.name}
                </Text>
                <Text style={styles.location}>📍 {data.location}</Text>
              </View>
              <View style={styles.priceBlock}>
                <Text style={styles.priceLabel}>from</Text>
                <Text style={styles.price}>
                  {data.currency}{formatEnglishNumber(data.pricePerNight)}
                </Text>
                <Text style={styles.priceUnit}>/night</Text>
              </View>
            </View>

            {/* Badges */}
            {data.badges.length > 0 && (
              <View style={styles.badgesRow}>
                {data.badges.map(b => (
                  <PremiumBadge key={b.label} label={b.label} variant={b.variant} />
                ))}
              </View>
            )}
          </View>

          {/* Bottom gold accent line */}
          <View style={styles.accentLine} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing[4] },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
  },
  cardPressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  imageContainer: {
    height: 220,
    backgroundColor: colors.surfaceAlt,
    position: 'relative',
  },
  image: { width: '100%', height: '100%' },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  categoryPill: {
    position: 'absolute',
    top: spacing[3],
    left: spacing[3],
    backgroundColor: colors.glass,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  categoryText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1.5,
  },
  ratingOverlay: {
    position: 'absolute',
    bottom: spacing[3],
    right: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.overlay,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  ratingStar: { color: colors.primary, fontSize: 11 },
  ratingValue: { color: colors.textPrimary, fontSize: 12, fontWeight: '700' },
  ratingCount: { color: colors.textMuted, fontSize: 11 },
  content: { padding: spacing[4], gap: spacing[3] },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  nameBlock: { flex: 1, gap: 4, marginRight: spacing[3] },
  name: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, letterSpacing: 0.2 },
  location: { fontSize: 12, color: colors.textMuted },
  priceBlock: { alignItems: 'flex-end', gap: 1 },
  priceLabel: { fontSize: 10, color: colors.textMuted, letterSpacing: 0.5 },
  price: { fontSize: 22, fontWeight: '700', color: colors.primary },
  priceUnit: { fontSize: 11, color: colors.textMuted },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  accentLine: {
    height: 2,
    backgroundColor: colors.primaryBorder,
    marginHorizontal: spacing[4],
    marginBottom: spacing[2],
    borderRadius: borderRadius.full,
  },
});
