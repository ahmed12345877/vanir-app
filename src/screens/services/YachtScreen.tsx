import React, { useState, useEffect, useMemo } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ChevronLeft,
  Anchor,
  Users,
  Ruler,
  Star,
  MapPin,
  Sparkles,
  Waves,
  ArrowRight,
  ShieldCheck,
  Check,
  Eye,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';
import { useCatalogStore } from '../../context/CatalogStore';
import { formatWesternPrice } from '../../utils/pricingUtils';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface YachtItem {
  id: string;
  name: string;
  tag: string;
  location: string;
  rating: number;
  length: string;
  guests: number;
  cabins: number;
  crew: number;
  hourlyRate: string;
  dailyRate: string;
  image: string;
  images?: string[];
  description?: string;
  amenities: string[];
}

const YACHTS: YachtItem[] = [
  {
    id: 'y1',
    name: 'Majesty 120 Superyacht',
    tag: 'Superyachts',
    location: 'Dubai Marina, UAE',
    rating: 4.9,
    length: '37m / 121ft',
    guests: 12,
    cabins: 5,
    crew: 7,
    hourlyRate: '$1,500',
    dailyRate: '$18,000',
    image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80',
    amenities: ['Private Chef & Crew', 'Sundeck Jacuzzi', 'Jet Skis & SeaBobs', 'Beach Club Lounge'],
  },
  {
    id: 'y2',
    name: 'Azimut Grande 27M',
    tag: 'Exclusive Charter',
    location: 'Palm Jumeirah, Dubai',
    rating: 4.95,
    length: '27m / 88ft',
    guests: 10,
    cabins: 5,
    crew: 4,
    hourlyRate: '$1,200',
    dailyRate: '$14,500',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
    amenities: ['Carbon-fiber Superstructure', 'Full Wet Bar', 'Flybridge Dining', 'High-end Audio'],
  },
  {
    id: 'y3',
    name: 'Sunseeker 116 Yacht',
    tag: 'Red Sea Explorer',
    location: 'Red Sea, Sharm El Sheikh',
    rating: 4.88,
    length: '35m / 116ft',
    guests: 10,
    cabins: 5,
    crew: 6,
    hourlyRate: '$1,800',
    dailyRate: '$21,000',
    image: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&q=80',
    amenities: ['Diving Equipment', 'Foredeck Jacuzzi', 'Zero-Speed Stabilizers', 'Tender Boat'],
  },
  {
    id: 'y4',
    name: 'Benetti Oasis 40M',
    tag: 'Ultra Luxury',
    location: 'Mediterranean / Alexandria',
    rating: 5.0,
    length: '40m / 133ft',
    guests: 12,
    cabins: 6,
    crew: 9,
    hourlyRate: '$2,500',
    dailyRate: '$30,000',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
    amenities: ['Infinity Deck Pool', 'Wellness & Gym Suite', 'Master Stateroom Terrace', 'Michelin Chef'],
  },
];

export function YachtScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { itemsByCategory, fetchCategory } = useCatalogStore();
  const liveYachts = itemsByCategory.yachts ?? [];

  useEffect(() => {
    fetchCategory('yachts', { force: true }).catch(() => {});
  }, [fetchCategory]);

  const yachtsList = useMemo<YachtItem[]>(() => {
    if (liveYachts.length > 0) {
      return liveYachts.map(y => ({
        id: y.id,
        name: y.name,
        tag: y.badge || 'Superyacht',
        location: y.subtitle || 'Dubai Marina & Mediterranean',
        rating: typeof y.rating === 'number' ? y.rating : 4.95,
        length: y.tag1 || '45m / 148ft',
        guests: 12,
        cabins: 5,
        crew: 8,
        hourlyRate: formatWesternPrice(y.price, 'hr').amount,
        dailyRate: formatWesternPrice(y.price, 'day').amount,
        image: y.image || 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80',
        images: y.images && y.images.length > 0 ? y.images : (y.image ? [y.image] : []),
        description: y.description,
        amenities: ['Jacuzzi Deck', 'Michelin Trained Chef', 'Water Sports & Jet Skis', 'Master VIP Stateroom'],
      }));
    }
    return YACHTS;
  }, [liveYachts]);

  const handleViewYacht = (yacht: YachtItem) => {
    navigation.navigate('YachtDetails', {
      yachtId: yacht.id,
      yachtName: yacht.name,
      location: yacht.location,
      price: yacht.dailyRate || yacht.hourlyRate,
      image: yacht.image,
      images: yacht.images && yacht.images.length > 0 ? yacht.images : [yacht.image],
      description: yacht.description,
      rating: yacht.rating,
      length: yacht.length,
      guests: yacht.guests,
      cabins: yacht.cabins,
      crew: yacht.crew,
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.backBtn,
            pressed && styles.topBtnPressed,
          ]}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft color="#1C1917" size={22} strokeWidth={2.5} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Superyachts</Text>
          <Text style={styles.headerSub}>Exclusive private charters worldwide</Text>
        </View>
        <View style={{ width: 38, height: 38, borderRadius: 19, overflow: 'hidden', borderWidth: 1.5, borderColor: '#D4AF37', backgroundColor: '#FFFFFF' }}>
          <Image
            source={require('../../assets/vanir_round_logo.png')}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}>
        <View style={styles.list}>
          {yachtsList.map(yacht => (
            <Pressable
              key={yacht.id}
              style={styles.yachtCard}
              onPress={() => handleViewYacht(yacht)}
            >
              {/* Image Box */}
              <View style={styles.imageBox}>
                <Image source={{ uri: yacht.image }} style={styles.image} resizeMode="cover" />

                {/* Top Tag Badge */}
                <View style={styles.tagBadge}>
                  <Text style={styles.tagBadgeText}>{yacht.tag}</Text>
                </View>

                {/* Rating Badge */}
                <View style={styles.ratingBadge}>
                  <Star color="#D4AF37" fill="#D4AF37" size={13} />
                  <Text style={styles.ratingText}>
                    {typeof yacht.rating === 'number' ? yacht.rating.toFixed(1) : yacht.rating}
                  </Text>
                </View>

                {/* Floating Price Pill */}
                <View style={styles.pricePill}>
                  <Text style={styles.priceText}>{formatWesternPrice(yacht.hourlyRate, 'hr').amount}</Text>
                  <Text style={styles.pricePeriod}>/hr</Text>
                </View>
              </View>

              {/* Card Info Body */}
              <View style={styles.cardBody}>
                <Text style={styles.yachtName}>{yacht.name}</Text>
                <View style={styles.locationRow}>
                  <MapPin color="#D4AF37" size={14} strokeWidth={2} />
                  <Text style={styles.locationText}>{yacht.location}</Text>
                </View>

                {/* Specs Row */}
                <View style={styles.specsRow}>
                  <View style={styles.specChip}>
                    <Ruler color="#D4AF37" size={14} strokeWidth={2} />
                    <Text style={styles.specText}>{yacht.length}</Text>
                  </View>
                  <View style={styles.specChip}>
                    <Users color="#D4AF37" size={14} strokeWidth={2} />
                    <Text style={styles.specText}>{yacht.guests} Guests</Text>
                  </View>
                  <View style={styles.specChip}>
                    <ShieldCheck color="#D4AF37" size={14} strokeWidth={2} />
                    <Text style={styles.specText}>{yacht.crew} Crew</Text>
                  </View>
                </View>

                {/* Amenities Highlights */}
                <View style={styles.amenitiesRow}>
                  {yacht.amenities.map((am, i) => (
                    <View key={i} style={styles.amenityBadge}>
                      <Check color="#D4AF37" size={12} strokeWidth={3} />
                      <Text style={styles.amenityText}>{am}</Text>
                    </View>
                  ))}
                </View>

                {/* View Details Button */}
                <Pressable style={styles.bookBtn} onPress={() => handleViewYacht(yacht)}>
                  <Eye color="#1C1917" size={16} strokeWidth={2.4} />
                  <Text style={styles.bookBtnText}>View Vessel Details</Text>
                  <ArrowRight color="#1C1917" size={16} strokeWidth={2.5} />
                </Pressable>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FAF9F6',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.25)',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBtnPressed: {
    backgroundColor: 'rgba(212, 175, 55, 0.22)',
    borderColor: '#D4AF37',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1917',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  headerRightBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: 20,
    gap: 20,
  },
  yachtCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  imageBox: {
    width: '100%',
    height: 220,
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  tagBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  tagBadgeText: {
    color: '#1C1917',
    fontSize: 12,
    fontWeight: '700',
  },
  ratingBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1C1917',
  },
  pricePill: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#D4AF37',
  },
  pricePeriod: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  cardBody: {
    padding: 18,
  },
  yachtName: {
    fontSize: 19,
    fontWeight: '800',
    color: '#1C1917',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 13,
    color: '#64748B',
  },
  specsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  specChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  specText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  amenityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  amenityText: {
    fontSize: 11,
    color: '#1C1917',
    fontWeight: '600',
  },
  bookBtn: {
    backgroundColor: '#D4AF37',
    borderRadius: 18,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  bookBtnText: {
    color: '#1C1917',
    fontSize: 15,
    fontWeight: '800',
  },
});
