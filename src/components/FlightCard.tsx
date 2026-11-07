import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PremiumBadge } from './PremiumBadge';
import { AirlineLogo } from './AirlineLogos';
import { Plane } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { borderRadius, shadow, spacing } from '../theme/spacing';
import { formatEnglishNumber } from '../lib/formatters';

export interface FlightCardData {
  id: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  price: number;
  currency: string;
  cabinClass: string;
  badges: Array<{ label: string; variant: 'gold' | 'success' | 'info' | 'warning' }>;
}

interface FlightCardProps {
  data: FlightCardData;
  onPress: (id: string) => void;
}

export function FlightCard({ data, onPress }: FlightCardProps) {
  return (
    <Pressable onPress={() => onPress(data.id)} style={styles.wrapper}>
      {({ pressed }) => (
        <View style={[styles.card, pressed && styles.cardPressed, shadow.cardLight]}>
          {/* Header row */}
          <View style={styles.header}>
            <View style={styles.airlineBlock}>
              <AirlineLogo airline={data.airline} iata={data.airlineCode} size={36} />
              <View>
                <Text style={styles.airlineName}>{data.airline}</Text>
                <Text style={styles.flightNumber}>{data.flightNumber}</Text>
              </View>
            </View>
            <View style={styles.cabinBadge}>
              <Text style={styles.cabinText}>{data.cabinClass}</Text>
            </View>
          </View>

          {/* Flight route */}
          <View style={styles.routeRow}>
            <View style={styles.portBlock}>
              <Text style={styles.time}>{data.departureTime}</Text>
              <Text style={styles.portCode}>{data.originCode}</Text>
              <Text style={styles.portCity} numberOfLines={1}>{data.origin}</Text>
            </View>

            <View style={styles.durationBlock}>
              <Text style={styles.duration}>{data.duration}</Text>
              <View style={styles.flightLine}>
                <View style={styles.flightLineDot} />
                <View style={styles.flightLineDash} />
                <View style={{ transform: [{ rotate: '45deg' }] }}>
                  <Plane color={colors.primary} size={15} strokeWidth={2.2} />
                </View>
                <View style={styles.flightLineDash} />
                <View style={styles.flightLineDot} />
              </View>
              <Text style={data.stops === 0 ? styles.stopsDirect : styles.stops}>
                {data.stops === 0 ? 'Direct' : `${data.stops} stop${data.stops > 1 ? 's' : ''}`}
              </Text>
            </View>

            <View style={[styles.portBlock, styles.portBlockRight]}>
              <Text style={styles.time}>{data.arrivalTime}</Text>
              <Text style={styles.portCode}>{data.destinationCode}</Text>
              <Text style={styles.portCity} numberOfLines={1}>{data.destination}</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.badgesRow}>
              {data.badges.map(b => (
                <PremiumBadge key={b.label} label={b.label} variant={b.variant} />
              ))}
            </View>
            <View style={styles.priceBlock}>
              <Text style={styles.priceFrom}>from</Text>
              <Text style={styles.price}>
                {data.currency}{formatEnglishNumber(data.price)}
              </Text>
            </View>
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing[3] },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: spacing[4],
    gap: spacing[4],
  },
  cardPressed: { opacity: 0.93 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  airlineBlock: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  airlineLogoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  airlineLogoText: { fontSize: 11, fontWeight: '700', color: colors.primary, letterSpacing: 0.5 },
  airlineName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  flightNumber: { fontSize: 11, color: colors.textMuted },
  cabinBadge: {
    backgroundColor: colors.primaryMuted,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  cabinText: { fontSize: 10, fontWeight: '700', color: colors.primary, letterSpacing: 0.5, textTransform: 'uppercase' },
  routeRow: { flexDirection: 'row', alignItems: 'center' },
  portBlock: { flex: 1, gap: 2 },
  portBlockRight: { alignItems: 'flex-end' },
  time: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  portCode: { fontSize: 13, fontWeight: '700', color: colors.primary, letterSpacing: 1 },
  portCity: { fontSize: 11, color: colors.textMuted },
  durationBlock: { flex: 1, alignItems: 'center', gap: 4 },
  duration: { fontSize: 11, color: colors.textSecondary, letterSpacing: 0.5 },
  flightLine: { flexDirection: 'row', alignItems: 'center', gap: 2, width: '100%' },
  flightLineDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.primaryBorder },
  flightLineDash: { flex: 1, height: 1, backgroundColor: colors.primaryBorder },
  planeIcon: { color: colors.primary, fontSize: 12 },
  stops: { fontSize: 10, color: colors.textMuted },
  stopsDirect: { fontSize: 10, color: colors.success },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], flex: 1 },
  priceBlock: { alignItems: 'flex-end', gap: 0 },
  priceFrom: { fontSize: 10, color: colors.textMuted },
  price: { fontSize: 20, fontWeight: '700', color: colors.primary },
});
