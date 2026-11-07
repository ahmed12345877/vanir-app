import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft,
  MapPin,
  Clock,
  Star,
  Users,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  Key,
  Compass,
} from 'lucide-react-native';
import type { RootStackParamList } from '../../navigation/types';
import { getLiveTours, subscribeLiveTours, type TourItem } from '../../services/firestore';
import { VipDetailDrawer, type VipDrawerItem } from '../../components/VipDetailDrawer';
import { formatWesternPrice } from '../../utils/pricingUtils';
import { LuxuryPressable } from '../../components/LuxuryMicroInteractions';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type TourCategory = 'all' | 'day-trips' | 'packages' | 'cultural';

const FALLBACK_DEFAULT = 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c0e?w=800&q=80';

const TOURS: TourItem[] = [
  {
    id: 't1',
    name: 'Private VIP Giza Pyramids & Sphinx Expedition',
    location: 'Giza Plateau, Cairo, Egypt',
    duration: '6 Hours',
    rating: 4.98,
    reviews: 412,
    price: '$180',
    category: 'day-trips',
    image: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=1000&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c0e?w=800&q=80',
    badge: 'Exclusive Privilege',
    highlights: [
      'Exclusive After-Hours Gate Access to Giza Plateau',
      'Private Senior Egyptologist & Historian Escort',
      'Fine Dining 5-Course Lunch Facing the Great Pyramid',
      'Private Chauffeured Mercedes-Maybach Transfers',
    ],
  },
  {
    id: 't2',
    name: 'Royal Dubai Desert Safari & Oasis Gala',
    location: 'Dubai, United Arab Emirates',
    duration: '8 Hours',
    rating: 4.95,
    reviews: 620,
    price: '$290',
    category: 'day-trips',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1000&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    badge: 'Royal Desert Retreat',
    highlights: [
      'Private Range Rover Autobiography Dune Convoy',
      'Bespoke Silk Bedouin VIP Pavilion with Air Cooling',
      '5-Star Michelin Dining Under the Arabian Starlight',
      'Private Falconry & Oud Performance',
    ],
  },
  {
    id: 't3',
    name: 'Private Catamaran Sunset Cruise in Santorini',
    location: 'Santorini, Cyclades, Greece',
    duration: '5 Hours',
    rating: 4.99,
    reviews: 185,
    price: '$1,290',
    category: 'day-trips',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1000&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=80',
    badge: 'Aegean Signature',
    highlights: [
      'Dedicated Onboard Master Seafood Chef',
      'Private Volcanic Thermal Spring Swimming Stop',
      'Unrivaled Sunset Vista from Oia Bay with Dom Pérignon',
      'Helicopter or Mercedes Port Transfers',
    ],
  },
  {
    id: 't4',
    name: 'Parisian Haute Joaillerie & Royal Louvre Access',
    location: 'Paris, France',
    duration: '4 Days',
    rating: 4.97,
    reviews: 240,
    price: '$4,800',
    category: 'packages',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1000&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&q=80',
    badge: 'Curated Heritage',
    highlights: [
      '5-Star Presidential Suite on Place Vendôme',
      'Private After-Hours Guided Tour of the Louvre Crown Jewels',
      'Dedicated Uniformed Mercedes Chauffeur at Disposal',
      'Private Seine Cruise on Bespoke Mahogany Yacht',
    ],
  },
  {
    id: 't5',
    name: 'Luxor & Aswan Royal Pharaonic Nile Expedition',
    location: 'Luxor & Aswan, Egypt',
    duration: '5 Days',
    rating: 4.99,
    reviews: 310,
    price: '$2,850',
    category: 'packages',
    image: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=1000&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=800&q=80',
    badge: 'Imperial Journey',
    highlights: [
      'Ultra-Luxury Private Nile Steamer Dahabiya Suite',
      'Private Access to Queen Nefertari & Tutankhamun Tombs',
      'Sunrise Private Hot Air Balloon Flight Over Luxor Valley',
      'Private Egyptology Professor Dedicated to Your Party',
    ],
  },
  {
    id: 't6',
    name: 'Amalfi Coast & Capri by Helicopter & Superyacht',
    location: 'Amalfi Coast & Capri, Italy',
    duration: 'Full Day',
    rating: 4.96,
    reviews: 142,
    price: '$3,400',
    category: 'cultural',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1000&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
    badge: 'Aero & Nautical',
    highlights: [
      'Private Twin-Engine Helicopter Transfer from Naples',
      'Private 85ft Riva Yacht Charter around Faraglioni Rocks',
      'VIP Reserved Entry to the Blue Grotto at Low Tide',
      'Cliffside Michelin Dining Table at Da Paolino Capri',
    ],
  },
  {
    id: 't7',
    name: 'Royal Dubai & Emirates Grand Luxury Tour',
    location: 'Dubai, United Arab Emirates',
    duration: '5 Days',
    rating: 4.98,
    reviews: 388,
    price: '$3,900',
    category: 'packages',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1000&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    badge: 'Imperial Palace',
    highlights: [
      'Burj Al Arab Royal Suite Private Palace Accommodation',
      'Chauffeured Rolls-Royce Phantom at 24/7 Service',
      'Private Sunset Mega-Yacht Charter along Dubai Marina',
      'Helicopter Aerial Tour Over Palm Jumeirah & Burj Khalifa',
    ],
  },
  {
    id: 't8',
    name: 'Maldives Private Atolls Royal Overwater Sanctuary',
    location: 'Private Atolls, Maldives',
    duration: '7 Days',
    rating: 4.99,
    reviews: 215,
    price: '$7,800',
    category: 'packages',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1000&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80',
    badge: 'Sanctuary Retreat',
    highlights: [
      'Private Twin-Otter Seaplane VIP Terminal Transfers',
      'Overwater Sunset Villa with Private Cantilevered Pool',
      'Private Yacht Sunset Dolphin Safari & Coral Reef Dive',
      'Michelin Beach Dining Under the Equator Starlight',
    ],
  },
  {
    id: 't9',
    name: 'Monaco Grand Prix & Côte d’Azur Superyacht Experience',
    location: 'Monaco & French Riviera, Monaco / France',
    duration: '6 Days',
    rating: 4.97,
    reviews: 176,
    price: '$8,500',
    category: 'packages',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1000&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
    badge: 'Riviera Privilege',
    highlights: [
      'Hôtel de Paris Monte-Carlo Diamond Suite Harbor View',
      'Private 100ft Superyacht Charter along Nice, Cannes & St. Tropez',
      'Twin-Engine Helicopter Transfer from Nice Côte d’Azur',
      'VIP Reserved Private Salons at Casino de Monte-Carlo',
    ],
  },
  {
    id: 't10',
    name: 'Swiss Alps & Zurich Imperial Alpine Tour',
    location: 'Zurich & Swiss Alps, Switzerland',
    duration: '5 Days',
    rating: 4.99,
    reviews: 164,
    price: '$6,200',
    category: 'packages',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1000&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1491557345352-5929e343eb89?w=800&q=80',
    badge: 'Alpine Imperial',
    highlights: [
      'The Dolder Grand Zurich Lakefront Presidential Suite',
      'Glacier Express Excellence Class Panoramic Journey',
      'Private Helicopter Matterhorn Flyover with Glacier Champagne',
      'Private Chauffeur & Ski Concierge in Zermatt & St. Moritz',
    ],
  },
  {
    id: 't11',
    name: 'London Royal Heritage & Scottish Highlands Expedition',
    location: 'London & Edinburgh, United Kingdom',
    duration: '6 Days',
    rating: 4.96,
    reviews: 290,
    price: '$5,400',
    category: 'packages',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1000&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=800&q=80',
    badge: 'Crown Heritage',
    highlights: [
      'The Ritz London Royal Suite Accommodation',
      'Private After-Hours Tower of London Crown Jewels Tour',
      'Belmond Royal Scotsman Luxury Train Private Compartment',
      'Chauffeured Bentley Flying Spur at 24/7 Disposal',
    ],
  },
  {
    id: 't12',
    name: 'Aegean Odyssey: Athens Acropolis & Santorini Cliffside Luxury',
    location: 'Athens & Santorini, Greece',
    duration: '6 Days',
    rating: 4.99,
    reviews: 320,
    price: '$4,600',
    category: 'packages',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1000&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=80',
    badge: 'Aegean Crown',
    highlights: [
      'Hotel Grande Bretagne Acropolis View Royal Suite',
      'Private Sunrise Guided Acropolis & Parthenon Walk',
      'Private Twin-Engine Helicopter to Santorini Caldera',
      'Canaves Oia Cliffside Cave Villa with Sunset Infinity Pool',
    ],
  },
  {
    id: 't13',
    name: 'Bosphorus Sultans & Bodrum Riviera Grand Expedition',
    location: 'Istanbul & Bodrum, Turkey',
    duration: '5 Days',
    rating: 4.97,
    reviews: 245,
    price: '$3,800',
    category: 'packages',
    image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1000&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    badge: 'Ottoman Grandeur',
    highlights: [
      'Çırağan Palace Kempinski Bosphorus Palace Suite',
      'Private Sunset Yacht Charter with Master Chef Onboard',
      'Exclusive After-Hours Gate Access to Topkapi Palace & Hagia Sophia',
      'Private Flight to Mandarin Oriental Bodrum Beach Villa',
    ],
  },
  {
    id: 't14',
    name: 'Italian Grand Splendour: Rome, Florence & Venice',
    location: 'Rome, Milan & Venice, Italy',
    duration: '7 Days',
    rating: 4.98,
    reviews: 340,
    price: '$6,900',
    category: 'packages',
    image: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=1000&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=80',
    badge: 'Italian Masterpiece',
    highlights: [
      'Private Key Master VIP Access to Vatican Museums & Sistine Chapel',
      'Ferrari Spider Self-Drive Tour Through Val d’Orcia Tuscany',
      'Aman Venice Grand Canal Palazzo Suite Stay',
      'Private Mahogany Water Taxi & Midnight Gondola Serenades',
    ],
  },
];

const CATEGORIES: { id: TourCategory; label: string }[] = [
  { id: 'all', label: 'All Curated Tours' },
  { id: 'day-trips', label: 'Day Expeditions' },
  { id: 'packages', label: 'Multi-Day Packages' },
  { id: 'cultural', label: 'VIP Cultural Access' },
];

export function ToursScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'Tours'>>();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<TourCategory>(
    route.params?.initialCategory || 'all',
  );
  const [destinationFilter, setDestinationFilter] = useState<string | undefined>(
    route.params?.destinationQuery,
  );

  const categories = useMemo(() => [
    { id: 'all' as TourCategory, label: t('screens.tours.all', 'All Curated Tours') },
    { id: 'day-trips' as TourCategory, label: t('screens.tours.dayTrips', 'Day Expeditions') },
    { id: 'packages' as TourCategory, label: t('screens.tours.packages', 'Multi-Day Packages') },
    { id: 'cultural' as TourCategory, label: t('screens.tours.cultural', 'VIP Cultural Access') },
  ], [t]);

  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [toursList, setToursList] = useState<TourItem[]>(TOURS);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (route.params?.initialCategory) {
      setActiveCategory(route.params.initialCategory);
    }
    if (route.params?.destinationQuery) {
      setDestinationFilter(route.params.destinationQuery);
    }
  }, [route.params?.initialCategory, route.params?.destinationQuery]);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedDrawerItem, setSelectedDrawerItem] = useState<VipDrawerItem | null>(null);

  const mergeTours = useCallback((liveItems: TourItem[]): TourItem[] => {
    if (!liveItems || liveItems.length === 0) return TOURS;
    const merged = [...liveItems];
    TOURS.forEach(defaultTour => {
      if (!merged.some(m => m.id === defaultTour.id || m.name.toLowerCase() === defaultTour.name.toLowerCase())) {
        merged.push(defaultTour);
      }
    });
    return merged;
  }, []);

  useEffect(() => {
    getLiveTours().then(items => {
      setToursList(mergeTours(items));
    });

    const unsubscribe = subscribeLiveTours(items => {
      setToursList(mergeTours(items));
    });

    return () => unsubscribe();
  }, [mergeTours]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const items = await getLiveTours();
      setToursList(mergeTours(items));
    } finally {
      setRefreshing(false);
    }
  }, [mergeTours]);

  const filteredTours = useMemo(() => {
    let list = toursList;

    if (destinationFilter && destinationFilter.trim()) {
      const q = destinationFilter.trim().toLowerCase();
      const matched = list.filter(tour => {
        const hay = `${tour.name} ${tour.location} ${tour.badge || ''} ${(tour.highlights || []).join(' ')}`.toLowerCase();
        return (
          hay.includes(q) ||
          (q === 'luxor' && (hay.includes('egypt') || hay.includes('cairo') || hay.includes('giza') || hay.includes('nile') || hay.includes('luxor') || hay.includes('aswan'))) ||
          (q === 'dubai' && (hay.includes('dubai') || hay.includes('emirates') || hay.includes('uae'))) ||
          (q === 'maldives' && hay.includes('maldives')) ||
          (q === 'monaco' && (hay.includes('monaco') || hay.includes('riviera') || hay.includes('côte') || hay.includes('nice') || hay.includes('cannes'))) ||
          (q === 'switzerland' && (hay.includes('swiss') || hay.includes('switzerland') || hay.includes('zurich') || hay.includes('alps') || hay.includes('zermatt'))) ||
          (q === 'london' && (hay.includes('london') || hay.includes('uk') || hay.includes('united kingdom') || hay.includes('britain') || hay.includes('edinburgh'))) ||
          (q === 'santorini' && (hay.includes('santorini') || hay.includes('athens') || hay.includes('greece') || hay.includes('aegean'))) ||
          (q === 'istanbul' && (hay.includes('istanbul') || hay.includes('turkey') || hay.includes('bodrum') || hay.includes('bosphorus'))) ||
          (q === 'rome' && (hay.includes('rome') || hay.includes('italy') || hay.includes('amalfi') || hay.includes('venice') || hay.includes('florence'))) ||
          (q === 'paris' && (hay.includes('paris') || hay.includes('france') || hay.includes('louvre')))
        );
      });
      if (matched.length > 0) {
        list = matched;
      }
    }

    if (activeCategory === 'all') return list;
    const catFiltered = list.filter(t => t.category === activeCategory);
    return catFiltered.length > 0 ? catFiltered : list;
  }, [activeCategory, toursList, destinationFilter]);

  const handleBookTour = useCallback((tour: TourItem) => {
    const { amount } = formatWesternPrice(tour.price, 'tour');
    navigation.navigate('ServiceBooking', {
      serviceType: 'Tours & Expeditions',
      prefillItem: `${tour.name} (${tour.duration})`,
      price: amount,
    });
  }, [navigation]);

  const handleCardPress = (tour: TourItem) => {
    const { amount, period } = formatWesternPrice(tour.price, 'tour');
    setSelectedDrawerItem({
      id: tour.id,
      title: tour.name,
      subtitle: tour.location,
      category: tour.duration,
      badge: tour.badge || 'VIP EXPEDITION',
      image: failedImages[tour.id] ? tour.fallbackImage || tour.image : tour.image,
      images: tour.images && tour.images.length > 0 ? tour.images : [tour.image],
      price: amount,
      pricePer: period,
      rating: tour.rating,
      specs: [
        { label: 'Duration', value: tour.duration },
        { label: 'Exclusivity', value: 'Private Only' },
        { label: 'Guide', value: 'Senior Historian' },
        { label: 'Transport', value: 'Mercedes Fleet' },
      ],
      privileges: tour.highlights,
      chauffeurOrButlerInfo: {
        role: 'Dedicated Senior Expedition Leader',
        detail:
          'Private licensed historian and security liaison providing uninterrupted private access, confidential routing, and 5-star concierge coordination throughout.',
        badge: 'ROYAL ACCREDITED',
      },
      afterHoursAccess:
        'Guaranteed after-hours private gate clearance to monuments and archaeological sites without public crowds.',
      ctaText: 'Reserve VIP Expedition',
    });
    setDrawerVisible(true);
  };

  const handleDrawerBook = useCallback((drawerItem: VipDrawerItem) => {
    const tour = toursList.find(t => t.id === drawerItem.id) || toursList[0];
    handleBookTour(tour);
  }, [toursList, handleBookTour]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

      {/* Luxury Off-White Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs'))}
          accessibilityLabel="Back"
        >
          <ChevronLeft color="#D4AF37" size={22} strokeWidth={2.4} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t('screens.tours.title', 'Tours & Expeditions')}</Text>
          <Text style={styles.headerSub}>{t('screens.tours.subtitle', 'Curated Royal Journeys & Bespoke Day Trips')}</Text>
        </View>

        <View style={styles.brandLogoBox}>
          <Image
            source={require('../../assets/vanir_round_logo.png')}
            style={styles.brandLogo}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Filter Categories */}
      <View style={styles.categoriesRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {categories.map(cat => (
            <Pressable
              key={cat.id}
              style={[
                styles.categoryChip,
                activeCategory === cat.id && styles.categoryChipActive,
              ]}
              onPress={() => setActiveCategory(cat.id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === cat.id && styles.categoryTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Tours List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: 110 + insets.bottom },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#D4AF37"
          />
        }
      >
        {/* Active Destination Filter Banner */}
        {destinationFilter ? (
          <View style={styles.destinationBanner}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, flex: 1 }}>
              <Compass color="#D4AF37" size={17} strokeWidth={2.2} />
              <Text style={styles.destinationBannerTitle} numberOfLines={1}>
                {t('screens.tours.showingProgramsFor', 'Curated Programs for')}:{' '}
                <Text style={{ color: '#D4AF37', fontWeight: '800' }}>
                  {route.params?.destinationTitle || destinationFilter}
                </Text>
              </Text>
            </View>
            <Pressable
              onPress={() => setDestinationFilter(undefined)}
              style={styles.clearFilterBtn}
              hitSlop={8}
            >
              <Text style={styles.clearFilterBtnText}>
                {t('screens.tours.showAll', 'Show All ✕')}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {/* Featured Travel Plan Banner */}
        <LuxuryPressable
          style={styles.travelPlanBanner}
          onPress={() => navigation.navigate('TravelPlan')}
          scaleTo={0.98}
        >
          <View style={{ flex: 1, paddingRight: 10 }}>
            <View style={styles.bannerTagRow}>
              <Sparkles color="#D4AF37" size={14} />
              <Text style={styles.bannerTagText}>BESPOKE ROYAL ITINERARIES</Text>
            </View>
            <Text style={styles.bannerTitle}>
              {t('screens.tours.travelPlanTitle', 'Need a Bespoke Itinerary?')}
            </Text>
            <Text style={styles.bannerSub}>
              {t('screens.tours.travelPlanSub', 'Let our concierge craft your royal journey.')}
            </Text>
          </View>

          <View style={styles.bannerActionPill}>
            <Text style={styles.bannerActionText}>{t('screens.tours.travelPlanBtn', 'Plan My Trip')}</Text>
            <ArrowRight color="#1C1917" size={13} strokeWidth={2.6} />
          </View>
        </LuxuryPressable>

        {/* Full-Bleed Immersive Tour Cards */}
        <View style={styles.feedContainer}>
          {filteredTours.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Compass color="#D4AF37" size={42} strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>
                {t('screens.tours.emptyForDestination', 'No bespoke programs currently available for this specific query')}
              </Text>
              <Pressable
                style={styles.resetFilterBtn}
                onPress={() => {
                  setDestinationFilter(undefined);
                  setActiveCategory('all');
                }}
              >
                <Text style={styles.resetFilterText}>
                  {t('screens.tours.viewAllExpeditions', 'Explore All Expeditions')}
                </Text>
              </Pressable>
            </View>
          ) : (
            filteredTours.map(tour => {
            const imageSrc = failedImages[tour.id]
              ? tour.fallbackImage || FALLBACK_DEFAULT
              : tour.image;
            const { amount, period } = formatWesternPrice(tour.price, 'tour');

            return (
              <LuxuryPressable
                key={tour.id}
                style={styles.luxuryCard}
                onPress={() => handleCardPress(tour)}
                scaleTo={0.985}
              >
                {/* Upper Image Container */}
                <View style={styles.cardImageContainer}>
                  <Image
                    source={{ uri: imageSrc }}
                    style={styles.cardImage}
                    resizeMode="cover"
                    onError={() => {
                      setFailedImages(prev => ({ ...prev, [tour.id]: true }));
                    }}
                  />

                  {/* Top Overlay Badges */}
                  <View style={styles.topBadgeRow}>
                    <View style={styles.categoryBadge}>
                      <Sparkles color="#D4AF37" size={12} strokeWidth={1.5} />
                      <Text style={styles.categoryBadgeText}>
                        {(tour.badge || 'CURATED EXPEDITION').toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.ratingBadge}>
                      <Star color="#D4AF37" fill="#D4AF37" size={11} />
                      <Text style={styles.ratingText}>
                        {typeof tour.rating === 'number' ? tour.rating.toFixed(2) : '5.00'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Lower White Editorial Panel */}
                <View style={styles.cardContentPanel}>
                  {/* Location & Duration Metadata */}
                  <View style={styles.metaRow}>
                    <MapPin color="#D4AF37" size={12.5} strokeWidth={1.8} />
                    <Text style={styles.metaText} numberOfLines={1}>
                      {tour.location}
                    </Text>
                    <Text style={styles.metaDot}>•</Text>
                    <Clock color="#D4AF37" size={12.5} strokeWidth={1.8} />
                    <Text style={styles.metaText}>{tour.duration}</Text>
                  </View>

                  {/* Tour Title */}
                  <Text style={styles.tourTitle} numberOfLines={2}>
                    {tour.name}
                  </Text>

                  {/* Micro Minimalist Specs Row */}
                  <View style={styles.microSpecsRow}>
                    <View style={styles.microSpecItem}>
                      <Key color="#D4AF37" size={12} strokeWidth={1.8} />
                      <Text style={styles.microSpecText}>VIP Gate Access</Text>
                    </View>
                    <View style={styles.specDot} />
                    <View style={styles.microSpecItem}>
                      <Award color="#D4AF37" size={12} strokeWidth={1.8} />
                      <Text style={styles.microSpecText}>Senior Guide</Text>
                    </View>
                    <View style={styles.specDot} />
                    <View style={styles.microSpecItem}>
                      <Users color="#D4AF37" size={12} strokeWidth={1.8} />
                      <Text style={styles.microSpecText}>Private Group</Text>
                    </View>
                  </View>

                  {/* Lower Price & VIP Action Row */}
                  <View style={styles.priceActionRow}>
                    <View style={styles.priceBlock}>
                      <Text style={styles.priceValue}>{amount}</Text>
                      <Text style={styles.pricePeriod}>{period}</Text>
                    </View>

                    <View style={styles.explorePill}>
                      <Text style={styles.explorePillText}>VIP Experience</Text>
                      <ArrowRight color="#1C1917" size={13} strokeWidth={2.6} />
                    </View>
                  </View>
                </View>
              </LuxuryPressable>
            );
          }))}
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
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
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
    fontSize: 17,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.5,
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
  categoriesRow: {
    backgroundColor: '#FAF9F6',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.15)',
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  categoryChipActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  categoryTextActive: {
    color: '#1C1917',
    fontWeight: '800',
  },
  scroll: {
    paddingTop: 16,
  },
  travelPlanBanner: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 20,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  bannerTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  bannerTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 1.1,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1917',
  },
  bannerSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  bannerActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#D4AF37',
  },
  bannerActionText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1C1917',
  },
  feedContainer: {
    paddingHorizontal: 16,
    gap: 20,
  },
  luxuryCard: {
    width: '100%',
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  cardImageContainer: {
    width: '100%',
    height: 215,
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  cardImage: {
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
    backgroundColor: 'rgba(28, 25, 23, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  categoryBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 0.8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1C1917',
  },
  cardContentPanel: {
    padding: 16,
    backgroundColor: '#FFFFFF',
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
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  metaDot: {
    color: '#D4AF37',
    fontSize: 12,
  },
  tourTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.2,
    lineHeight: 22,
    marginTop: 2,
  },
  microSpecsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingVertical: 4,
  },
  microSpecItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FAF9F6',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.18)',
  },
  microSpecText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1C1917',
  },
  specDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#D4AF37',
  },
  priceActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  priceBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1C1917',
    letterSpacing: 0.2,
  },
  pricePeriod: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  explorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#D4AF37',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  explorePillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.3,
  },
  destinationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  destinationBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1917',
    flex: 1,
  },
  clearFilterBtn: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
    marginLeft: 8,
  },
  clearFilterBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1C1917',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1917',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
  resetFilterBtn: {
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#D4AF37',
  },
  resetFilterText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1C1917',
  },
});
