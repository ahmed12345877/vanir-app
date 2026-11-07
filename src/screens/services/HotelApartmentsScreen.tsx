import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import firestore from '@react-native-firebase/firestore';
import {
  ChevronLeft,
  MapPin,
  Star,
  Bed,
  Bath,
  Maximize2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
} from 'lucide-react-native';
import type { RootStackParamList } from '../../navigation/types';
import { VipDetailDrawer, type VipDrawerItem } from '../../components/VipDetailDrawer';
import { formatWesternPrice } from '../../utils/pricingUtils';
import { LuxuryPressable } from '../../components/LuxuryMicroInteractions';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type CityFilter = 'all' | 'dubai' | 'cairo' | 'london' | 'paris';
type StayType = 'daily' | 'monthly';

interface ApartmentItem {
  id: string;
  name: string;
  city: CityFilter;
  cityLabel: string;
  address: string;
  rating: number;
  reviews: number;
  bedrooms: number;
  bathrooms: number;
  areaM2: number;
  dailyRate: string;
  monthlyRate: string;
  image: string;
  images?: string[];
  tag: string;
  features: string[];
}

const APARTMENTS: ApartmentItem[] = [
  {
    id: 'apt2',
    name: 'Four Seasons Private Residences Nile Plaza',
    city: 'cairo',
    cityLabel: 'Cairo, Garden City',
    address: 'Garden City, Direct Nile Panorama',
    rating: 4.98,
    reviews: 215,
    bedrooms: 3,
    bathrooms: 4,
    areaM2: 240,
    dailyRate: '$850',
    monthlyRate: '$16,000',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1000&q=80',
    tag: 'Royal Nile Panorama',
    features: [
      'Floor-to-ceiling panoramic Nile balconies',
      'Personal 24/7 dedicated butler & concierge',
      'Private executive VIP lounge & spa access',
      'Diplomatic high-level security & soundproofing',
    ],
  },
  {
    id: 'apt1',
    name: 'The Address Downtown Luxury Residence',
    city: 'dubai',
    cityLabel: 'Dubai, Downtown',
    address: 'Downtown Dubai, Burj Khalifa View',
    rating: 4.96,
    reviews: 189,
    bedrooms: 2,
    bathrooms: 3,
    areaM2: 155,
    dailyRate: '$750',
    monthlyRate: '$14,500',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1000&q=80',
    tag: 'Burj Khalifa View',
    features: [
      'Fully-equipped Italian Valcucine kitchen',
      'Twice-daily VIP housekeeping & laundry service',
      'Private infinity pool & 24/7 fitness club access',
      'Valet parking & Mercedes S-Class on demand',
    ],
  },
  {
    id: 'apt3',
    name: 'Mayfair Royal Penthouse Suites',
    city: 'london',
    cityLabel: 'London, Mayfair',
    address: 'Park Lane, Mayfair, London',
    rating: 4.95,
    reviews: 142,
    bedrooms: 2,
    bathrooms: 2,
    areaM2: 180,
    dailyRate: '$1,200',
    monthlyRate: '$24,000',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000&q=80',
    tag: 'Royal Penthouse',
    features: [
      'Private wraparound terrace overlooking Hyde Park',
      'Bespoke British furnishings & heated marble floors',
      '24-Hour dedicated Royal concierge service',
      'Dedicated private elevator with biometric entry',
    ],
  },
  {
    id: 'apt4',
    name: 'Kempinski Royal Nile Residences',
    city: 'cairo',
    cityLabel: 'Cairo, Nile Corniche',
    address: 'Corniche El Nile, Downtown',
    rating: 4.91,
    reviews: 167,
    bedrooms: 1,
    bathrooms: 2,
    areaM2: 95,
    dailyRate: '$480',
    monthlyRate: '$9,500',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&q=80',
    tag: 'Executive Nile Suite',
    features: [
      'Grand master bedroom with private river terrace',
      'VIP laundry, dry cleaning & pressing service',
      '5-Star in-tower fine dining and room service',
      'Private airport limousine escort included',
    ],
  },
  {
    id: 'apt5',
    name: 'Bvlgari Marina Resort Residences',
    city: 'dubai',
    cityLabel: 'Dubai, Jumeirah Bay',
    address: 'Jumeira Bay Island, Dubai',
    rating: 5.0,
    reviews: 98,
    bedrooms: 3,
    bathrooms: 4,
    areaM2: 290,
    dailyRate: '$2,200',
    monthlyRate: '$45,000',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000&q=80',
    tag: 'Ultra-Luxury Villa',
    features: [
      'Private 40m yacht berth at your doorstep',
      'Cantilevered private plunge pool & Zen garden',
      'Private Italian master chef at your disposal',
      'Exclusive private sandy beach access',
    ],
  },
  {
    id: 'apt6',
    name: 'Avenue Montaigne Luxury Residence',
    city: 'paris',
    cityLabel: 'Paris, Champs-Élysées',
    address: 'Avenue Montaigne, 8th Arrondissement',
    rating: 4.97,
    reviews: 120,
    bedrooms: 2,
    bathrooms: 2,
    areaM2: 135,
    dailyRate: '$1,500',
    monthlyRate: '$28,000',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1000&q=80',
    tag: 'Haute Couture Living',
    features: [
      'Classic Haussmannian wrought-iron balcony with Eiffel view',
      'Designer interiors curated by Paris haute ateliers',
      'VIP reservations concierge for Michelin-starred restaurants',
      'Private temperature-controlled wine cellar',
    ],
  },
];

const CITIES: { id: CityFilter; label: string }[] = [
  { id: 'all', label: 'All Destinations' },
  { id: 'cairo', label: 'Cairo 🇪🇬' },
  { id: 'dubai', label: 'Dubai 🇦🇪' },
  { id: 'london', label: 'London 🇬🇧' },
  { id: 'paris', label: 'Paris 🇫🇷' },
];

export function HotelApartmentsScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'HotelApartments'>>();
  const insets = useSafeAreaInsets();
  const [activeCity, setActiveCity] = useState<CityFilter>('all');
  const [stayType, setStayType] = useState<StayType>('daily');

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedDrawerItem, setSelectedDrawerItem] = useState<VipDrawerItem | null>(null);
  const [liveApartments, setLiveApartments] = useState<ApartmentItem[]>([]);
  const openedInitialRef = useRef(false);

  useEffect(() => {
    try {
      const unsub = firestore()
        .collection('hotels')
        .onSnapshot(
          snap => {
            if (snap && !snap.empty) {
              const items: ApartmentItem[] = [];
              snap.forEach(doc => {
                const d = doc.data();
                if (!d) return;

                const propName = typeof d.propertyName === 'string' ? d.propertyName : typeof d.name === 'string' ? d.name : '';
                const suiteType = typeof d.suiteType === 'string' ? d.suiteType : '';
                const category = typeof d.category === 'string' ? d.category : '';
                const isApt =
                  d.status !== 'draft' &&
                  (category === 'apartments' ||
                    d.isApartment === true ||
                    suiteType.toLowerCase().includes('residence') ||
                    suiteType.toLowerCase().includes('apartment') ||
                    propName.toLowerCase().includes('residence') ||
                    propName.toLowerCase().includes('apartment'));

                if (isApt) {
                  const imagesList: string[] = Array.isArray(d.images)
                    ? d.images
                        .map((img: any) => (typeof img === 'string' ? img : img?.url || ''))
                        .filter(Boolean)
                    : [];
                  const primaryImage =
                    imagesList[0] ||
                    (typeof d.image === 'string' ? d.image : '') ||
                    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1000&q=80';
                  const cityLower = typeof d.cityDestination === 'string' ? d.cityDestination.toLowerCase() : '';
                  const matchedCity: CityFilter = cityLower.includes('dubai')
                    ? 'dubai'
                    : cityLower.includes('cairo')
                    ? 'cairo'
                    : cityLower.includes('london')
                    ? 'london'
                    : cityLower.includes('paris')
                    ? 'paris'
                    : 'all';

                  const parsedRating =
                    typeof d.rating === 'number' && !isNaN(d.rating)
                      ? d.rating
                      : typeof d.rating === 'string'
                      ? parseFloat(d.rating) || 4.96
                      : 4.96;

                  items.push({
                    id: doc.id,
                    name: propName || 'Luxury Serviced Residence',
                    city: matchedCity,
                    cityLabel: typeof d.cityDestination === 'string' ? d.cityDestination : 'VIP Residence',
                    address: typeof d.address === 'string' ? d.address : typeof d.subtitle === 'string' ? d.subtitle : 'City Center VIP',
                    rating: parsedRating,
                    reviews: typeof d.reviews === 'number' ? d.reviews : 120,
                    bedrooms: typeof d.bedrooms === 'number' ? d.bedrooms : 2,
                    bathrooms: typeof d.bathrooms === 'number' ? d.bathrooms : 2,
                    areaM2: typeof d.roomSizeSqm === 'number' ? d.roomSizeSqm : 180,
                    dailyRate: typeof d.nightlyRate === 'number' ? `$${d.nightlyRate}` : (typeof d.dailyRate === 'string' ? d.dailyRate : '$750'),
                    monthlyRate:
                      typeof d.monthlyRate === 'number'
                        ? `$${d.monthlyRate}`
                        : typeof d.monthlyRate === 'string'
                        ? d.monthlyRate
                        : `$${(typeof d.nightlyRate === 'number' ? d.nightlyRate * 22 : 14000).toLocaleString()}`,
                    image: primaryImage,
                    images: imagesList.length > 0 ? imagesList : [primaryImage],
                    tag: suiteType || (typeof d.badge === 'string' ? d.badge : 'VIP Residence'),
                    features:
                      Array.isArray(d.amenities) && d.amenities.length > 0
                        ? d.amenities.map(String)
                        : [
                            'Floor-to-ceiling panoramic views & private balcony',
                            'Dedicated 24/7 private butler & concierge service',
                            'Twice-daily VIP housekeeping & laundry service',
                            'Valet parking & private security protocol',
                          ],
                  });
                }
              });
              if (items.length > 0) {
                setLiveApartments(items);
              }
            }
          },
          () => {}
        );
      return () => unsub();
    } catch {}
  }, []);

  const allApartments = useMemo(() => {
    if (liveApartments.length === 0) return APARTMENTS;
    const map = new Map<string, ApartmentItem>();
    APARTMENTS.forEach(a => map.set(a.id, a));
    liveApartments.forEach(a => map.set(a.id, a));
    return Array.from(map.values());
  }, [liveApartments]);

  const filteredApartments = useMemo(() => {
    if (activeCity === 'all') return allApartments;
    return allApartments.filter(a => a.city === activeCity);
  }, [allApartments, activeCity]);

  const handleViewApt = useCallback((apt: ApartmentItem) => {
    if (!apt) return;
    const rawPrice = stayType === 'monthly' ? apt.monthlyRate : apt.dailyRate;
    navigation.navigate('Booking', {
      type: 'apartment',
      bookingType: 'apartment',
      itemName: apt.name || 'Luxury Serviced Residence',
      price: rawPrice,
      city: apt.cityLabel,
      image: apt.image,
      images: apt.images,
      apartmentId: apt.id,
      stayType: stayType,
    });
  }, [stayType, navigation]);

  const handleCardPress = (apt: ApartmentItem) => {
    if (!apt) return;
    const rawPrice = stayType === 'monthly' ? apt.monthlyRate : apt.dailyRate;
    const { amount, period } = formatWesternPrice(rawPrice, stayType === 'monthly' ? 'month' : 'night');
    setSelectedDrawerItem({
      id: apt.id,
      title: apt.name,
      subtitle: `${apt.cityLabel} • ${apt.address}`,
      category: apt.tag,
      badge: 'VIP RESIDENCE',
      image: apt.image,
      images: apt.images && apt.images.length > 0 ? apt.images : [apt.image],
      price: amount,
      pricePer: period,
      rating: apt.rating,
      specs: [
        { label: 'Bedrooms', value: `${apt.bedrooms} Suites` },
        { label: 'Bathrooms', value: `${apt.bathrooms} Marble Baths` },
        { label: 'Area', value: `${apt.areaM2} m²` },
        { label: 'Service', value: '24/7 Butler' },
      ],
      privileges: apt.features,
      chauffeurOrButlerInfo: {
        role: 'Dedicated Residential Private Butler',
        detail:
          'Private resident concierge and butler team handling daily housekeeping, bespoke in-suite dining, laundry, and round-the-clock security clearance.',
        badge: 'ROYAL SERVICE',
      },
      ctaText: 'Reserve Residence',
    });
    setDrawerVisible(true);
  };

  useEffect(() => {
    if (openedInitialRef.current) return;
    const targetId = route.params?.initialApartmentId || route.params?.apartmentId;
    if (targetId && allApartments.length > 0) {
      const found = allApartments.find(
        a =>
          a.id.toLowerCase() === targetId.toLowerCase() ||
          a.name.toLowerCase().includes(targetId.toLowerCase()) ||
          targetId.toLowerCase().includes(a.id.toLowerCase())
      );
      if (found) {
        openedInitialRef.current = true;
        handleCardPress(found);
      }
    }
  }, [route.params, allApartments]);

  const handleDrawerBook = useCallback((drawerItem: VipDrawerItem) => {
    const apt = allApartments.find(a => a.id === drawerItem.id) || allApartments[0];
    if (apt) {
      handleViewApt(apt);
    }
  }, [allApartments, handleViewApt]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

      {/* Luxury Dark Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.backBtn,
            pressed && styles.topBtnPressed,
          ]}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Back"
        >
          <ChevronLeft color="#1C1917" size={22} strokeWidth={2.4} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Hotel Apartments & Penthouses</Text>
          <Text style={styles.headerSub}>Serviced Luxury Private Residences</Text>
        </View>

        <View style={styles.brandLogoBox}>
          <Image
            source={require('../../assets/vanir_round_logo.png')}
            style={styles.brandLogo}
            resizeMode="cover"
            fadeDuration={0}
          />
        </View>
      </View>

      {/* Stay Type Toggle (Daily / Monthly) */}
      <View style={styles.stayTypeContainer}>
        <View style={styles.toggleCapsule}>
          <Pressable
            style={[styles.toggleBtn, stayType === 'daily' && styles.toggleBtnActive]}
            onPress={() => setStayType('daily')}
          >
            <Text style={[styles.toggleText, stayType === 'daily' && styles.toggleTextActive]}>
              Daily VIP Stay
            </Text>
          </Pressable>

          <Pressable
            style={[styles.toggleBtn, stayType === 'monthly' && styles.toggleBtnActive]}
            onPress={() => setStayType('monthly')}
          >
            <Text style={[styles.toggleText, stayType === 'monthly' && styles.toggleTextActive]}>
              Extended / Monthly
            </Text>
          </Pressable>
        </View>
      </View>

      {/* City Filters */}
      <View style={styles.citiesRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.citiesScroll}
        >
          {CITIES.map(c => (
            <Pressable
              key={c.id}
              style={[
                styles.cityChip,
                activeCity === c.id && styles.cityChipActive,
              ]}
              onPress={() => setActiveCity(c.id)}
            >
              <Text
                style={[
                  styles.cityChipText,
                  activeCity === c.id && styles.cityChipTextActive,
                ]}
              >
                {c.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Full-Width Luxury Residences Feed */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: 110 + insets.bottom },
        ]}
      >
        <View style={styles.feedContainer}>
          {filteredApartments.map(apt => {
            const rawPrice = stayType === 'monthly' ? apt.monthlyRate : apt.dailyRate;
            const { amount, period } = formatWesternPrice(rawPrice, stayType === 'monthly' ? 'month' : 'night');

            return (
              <LuxuryPressable
                key={apt.id}
                style={styles.fullBleedCard}
                onPress={() => handleCardPress(apt)}
                scaleTo={0.985}
              >
                <View style={styles.cardImageContainer}>
                  <Image
                    source={{ uri: apt.image }}
                    style={styles.fullBleedImage}
                    resizeMode="cover"
                    fadeDuration={0}
                  />

                  {/* Top Badge */}
                  <View style={styles.topBadgeRow}>
                    <View style={styles.categoryBadge}>
                      <Sparkles color="#D4AF37" size={12} strokeWidth={1.5} />
                      <Text style={styles.categoryBadgeText}>
                        {(apt.tag || 'VIP RESIDENCE').toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Bottom Information Panel */}
                <View style={styles.frostedPanel}>
                  <View style={styles.panelContent}>
                    {/* Location & Rating */}
                    <View style={styles.metaRow}>
                      <Star color="#D4AF37" fill="#D4AF37" size={11} />
                      <Text style={styles.ratingValueText}>{apt.rating.toFixed(1)}</Text>
                      <Text style={styles.metaDot}>•</Text>
                      <MapPin color="#D4AF37" size={12.5} strokeWidth={1.5} />
                      <Text style={styles.metaText} numberOfLines={1}>
                        {apt.cityLabel} • {apt.address}
                      </Text>
                    </View>

                    <Text style={styles.apartmentName} numberOfLines={1}>
                      {apt.name}
                    </Text>

                    {/* Micro Minimalist Specs */}
                    <View style={styles.microSpecsRow}>
                      <View style={styles.microSpecItem}>
                        <Bed color="#D4AF37" size={12.5} strokeWidth={1.5} />
                        <Text style={styles.microSpecText}>{apt.bedrooms} Suites</Text>
                      </View>
                      <View style={styles.specDot} />
                      <View style={styles.microSpecItem}>
                        <Bath color="#D4AF37" size={12.5} strokeWidth={1.5} />
                        <Text style={styles.microSpecText}>{apt.bathrooms} Baths</Text>
                      </View>
                      <View style={styles.specDot} />
                      <View style={styles.microSpecItem}>
                        <Maximize2 color="#D4AF37" size={12.5} strokeWidth={1.5} />
                        <Text style={styles.microSpecText}>{apt.areaM2} m²</Text>
                      </View>
                      <View style={styles.specDot} />
                      <View style={styles.microSpecItem}>
                        <Sparkles color="#D4AF37" size={12.5} strokeWidth={1.5} />
                        <Text style={styles.microSpecText}>24/7 Butler</Text>
                      </View>
                    </View>

                    {/* Price & Action */}
                    <View style={styles.priceActionRow}>
                      <View style={styles.priceBlock}>
                        <Text style={styles.priceValue}>{amount}</Text>
                        <Text style={styles.pricePeriod}>{period}</Text>
                      </View>

                      <View style={styles.explorePill}>
                        <Text style={styles.explorePillText}>Reserve Suite</Text>
                        <ArrowRight color="#1C1917" size={13} strokeWidth={2.6} />
                      </View>
                    </View>
                  </View>
                </View>
              </LuxuryPressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Expandable Animated VIP Drawer */}
      <VipDetailDrawer
        visible={drawerVisible}
        item={selectedDrawerItem}
        onClose={() => setDrawerVisible(false)}
        onBook={handleDrawerBook}
      />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.25)',
    backgroundColor: '#FAF9F6',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.4,
  },
  headerSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  brandLogoBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    backgroundColor: '#FFFFFF',
  },
  brandLogo: {
    width: '100%',
    height: '100%',
  },
  stayTypeContainer: {
    backgroundColor: '#FAF9F6',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  toggleCapsule: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 13,
  },
  toggleBtnActive: {
    backgroundColor: '#D4AF37',
  },
  toggleText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#64748B',
  },
  toggleTextActive: {
    color: '#1C1917',
    fontWeight: '800',
  },
  citiesRow: {
    backgroundColor: '#FAF9F6',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
  },
  citiesScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  cityChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  cityChipActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  cityChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  topBtnPressed: {
    backgroundColor: 'rgba(212, 175, 55, 0.22)',
    borderColor: '#D4AF37',
  },
  cityChipTextActive: {
    color: '#1C1917',
    fontWeight: '800',
  },
  scroll: {
    paddingTop: 16,
  },
  feedContainer: {
    paddingHorizontal: 16,
    gap: 20,
  },
  fullBleedCard: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: 'rgba(212, 175, 55, 0.28)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  cardImageContainer: {
    width: '100%',
    height: 220,
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  fullBleedImage: {
    width: '100%',
    height: '100%',
  },
  topBadgeRow: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 5,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  categoryBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.8,
  },
  frostedPanel: {
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  panelContent: {
    padding: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  ratingValueText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D4AF37',
  },
  metaDot: {
    fontSize: 12,
    color: '#64748B',
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    flex: 1,
  },
  apartmentName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.2,
  },
  microSpecsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingVertical: 6,
  },
  microSpecItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  microSpecText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  specDot: {
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: 'rgba(212, 175, 55, 0.6)',
  },
  priceActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(28, 25, 23, 0.08)',
  },
  priceBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#D4AF37',
    letterSpacing: 0.2,
  },
  pricePeriod: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  explorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#D4AF37',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  explorePillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.3,
  },
});
