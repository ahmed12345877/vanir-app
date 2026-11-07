import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlightCard, FlightCardData } from '../../components/FlightCard';
import { PropertyCard, PropertyCardData } from '../../components/PropertyCard';

import { colors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'SearchResults'>;

type SortOption = 'recommended' | 'price_low' | 'price_high' | 'rating';

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'price_low', label: 'Price ↑' },
  { id: 'price_high', label: 'Price ↓' },
  { id: 'rating', label: 'Rating' },
];

const MOCK_RESULTS: PropertyCardData[] = [
  {
    id: '1',
    name: 'The Nile Ritz-Carlton',
    location: 'Cairo, Egypt',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    pricePerNight: 850,
    currency: '$',
    rating: 4.9,
    reviewCount: 312,
    badges: [
      { label: 'Fully Refundable', variant: 'success' },
      { label: 'VIP Access', variant: 'gold' },
    ],
    category: 'hotel',
  },
  {
    id: '2',
    name: 'Sofitel Legend Old Cataract',
    location: 'Aswan, Egypt',
    imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
    pricePerNight: 620,
    currency: '$',
    rating: 4.7,
    reviewCount: 198,
    badges: [{ label: 'Elite Member Price', variant: 'gold' }],
    category: 'resort',
  },
  {
    id: '3',
    name: 'Four Seasons Nile Plaza',
    location: 'Cairo, Egypt',
    imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
    pricePerNight: 740,
    currency: '$',
    rating: 4.8,
    reviewCount: 425,
    badges: [
      { label: 'Breakfast Included', variant: 'info' },
      { label: 'Fully Refundable', variant: 'success' },
    ],
    category: 'hotel',
  },
];

const MOCK_FLIGHTS: FlightCardData[] = [
  {
    id: 'f1',
    airline: 'Emirates',
    airlineCode: 'EK',
    flightNumber: 'EK 926',
    origin: 'Cairo',
    originCode: 'CAI',
    destination: 'Dubai',
    destinationCode: 'DXB',
    departureTime: '09:15',
    arrivalTime: '14:30',
    duration: '3h 15m',
    stops: 0,
    price: 1240,
    currency: '$',
    cabinClass: 'Business',
    badges: [{ label: 'Fully Refundable', variant: 'success' }],
  },
  {
    id: 'f2',
    airline: 'EgyptAir',
    airlineCode: 'MS',
    flightNumber: 'MS 667',
    origin: 'Cairo',
    originCode: 'CAI',
    destination: 'Dubai',
    destinationCode: 'DXB',
    departureTime: '14:20',
    arrivalTime: '19:45',
    duration: '3h 25m',
    stops: 0,
    price: 980,
    currency: '$',
    cabinClass: 'Business',
    badges: [{ label: 'Elite Fare', variant: 'gold' }],
  },
];

export function SearchResultsScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProps>();
  const params = route.params?.params;
  const [activeSort, setActiveSort] = useState<SortOption>('recommended');
  const isFlights = params?.category === 'flights';
  const resultsLabel = isFlights
    ? 'flights'
    : params?.category === 'tours'
      ? 'tours'
      : params?.category === 'packages'
        ? 'packages'
        : params?.category === 'daytrips'
          ? 'day trips'
          : 'properties';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {params?.destination || 'Search Results'}
          </Text>
          <Text style={styles.headerMeta}>
            {params?.checkIn && params?.checkOut
              ? `${params.checkIn} → ${params.checkOut} · ${params.guests} guest${params.guests !== 1 ? 's' : ''}`
              : isFlights
              ? `${params?.guests ?? 1} passenger${(params?.guests ?? 1) > 1 ? 's' : ''}`
              : ''}
          </Text>
        </View>
        <View style={styles.filterBtn}>
          <Text style={styles.filterIcon}>⊟</Text>
        </View>
      </View>

      {/* Results count */}
      <View style={styles.resultsBar}>
        <Text style={styles.resultsCount}>
          <Text style={styles.resultsNumber}>
            {isFlights ? MOCK_FLIGHTS.length : MOCK_RESULTS.length}
          </Text>{' '}
          {resultsLabel} found
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortRow}>
          {SORT_OPTIONS.map(opt => (
            <Pressable
              key={opt.id}
              onPress={() => setActiveSort(opt.id)}
              style={[styles.sortChip, activeSort === opt.id && styles.sortChipActive]}>
              <Text style={[styles.sortLabel, activeSort === opt.id && styles.sortLabelActive]}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Results list */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}>
        {isFlights
          ? MOCK_FLIGHTS.map(f => (
              <FlightCard
                key={f.id}
                data={f}
                onPress={() =>
                  navigation.navigate('FlightDetails', {
                    flightId: f.id,
                    airline: f.airline,
                    flightNumber: f.flightNumber,
                    origin: f.origin,
                    originCode: f.originCode,
                    destination: f.destination,
                    destinationCode: f.destinationCode,
                    departureTime: f.departureTime,
                    arrivalTime: f.arrivalTime,
                    duration: f.duration,
                    pricePerPerson: f.price,
                    passengers: 1,
                  })
                }
              />
            ))
          : MOCK_RESULTS.map(p => (
              <PropertyCard
                key={p.id}
                data={p}
                onPress={() =>
                  navigation.navigate('HotelDetails', {
                    hotelId: p.id,
                    hotelName: p.name,
                    location: p.location,
                    price: `$${p.pricePerNight}/nt`,
                    image: p.imageUrl,
                    images: [p.imageUrl],
                    rating: p.rating,
                  })
                }
              />
            ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing[3],
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { color: colors.textPrimary, fontSize: 18 },
  headerCenter: { flex: 1, gap: 2 },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  headerMeta: { fontSize: 11, color: colors.textMuted },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryMuted,
  },
  filterIcon: { color: colors.primary, fontSize: 16 },
  resultsBar: {
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing[2],
  },
  resultsCount: {
    fontSize: 13,
    color: colors.textSecondary,
    paddingHorizontal: spacing[5],
  },
  resultsNumber: { color: colors.primary, fontWeight: '700' },
  sortRow: {
    paddingHorizontal: spacing[5],
    gap: spacing[2],
  },
  sortChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortChipActive: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primaryBorder,
  },
  sortLabel: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },
  sortLabelActive: { color: colors.primary, fontWeight: '700' },
  list: {
    padding: spacing[5],
    paddingBottom: spacing[10],
  },
});
