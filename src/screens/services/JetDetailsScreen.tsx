import React, { useState, useMemo, useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Eye,
  Plane,
  Star,
  Users,
  Compass,
  Check,
  Sparkles,
  Utensils,
  Wine,
  ShieldCheck,
  Shield,
  Wifi,
  Clock,
  Car,
  Bed,
  MapPin,
  ArrowRight,
  Armchair,
  Calculator,
  FileDown,
  Briefcase,
  Layers,
  X,
  Calendar,
} from 'lucide-react-native';
import auth from '@react-native-firebase/auth';
import { useCatalogStore } from '../../context/CatalogStore';
import { VipDatePickerModal } from '../../components/VipDatePickerModal';
import { VisaDocumentPdfModal } from '../../components/VisaDocumentPdfModal';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function getFutureYmd(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function enforceEnglishDigits(val: any): string {
  if (val === null || val === undefined) return '';
  const ar = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  let s = String(val);
  for (let i = 0; i < 10; i++) {
    s = s.replace(new RegExp(ar[i], 'g'), String(i));
  }
  return s;
}

const PHOTO_LABELS = [
  'Exterior & Runway Takeoff',
  'VIP Executive Salon Lounge',
  'Private Master Stateroom',
  'In-Flight Gourmet & Cockpit',
];

const DEFAULT_FALLBACK_PHOTOS = [
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=85',
  'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=1200&q=85',
  'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=1200&q=85',
  'https://images.unsplash.com/photo-1520437358207-323b43b50729?w=1200&q=85',
];

const JET_AMENITIES = [
  { id: '1', label: 'Ka-Band Satellite Wi-Fi', icon: Wifi, color: '#D4AF37', bg: 'rgba(212, 175, 55, 0.15)' },
  { id: '2', label: 'Michelin In-Flight Dining', icon: Utensils, color: '#D4AF37', bg: 'rgba(212, 175, 55, 0.15)' },
  { id: '3', label: 'Vintage Champagne & Bar', icon: Wine, color: '#D4AF37', bg: 'rgba(212, 175, 55, 0.15)' },
  { id: '4', label: 'Tarmac Chauffeur Escort', icon: Car, color: '#D4AF37', bg: 'rgba(212, 175, 55, 0.15)' },
  { id: '5', label: 'Private Master Bed Suite', icon: Bed, color: '#D4AF37', bg: 'rgba(212, 175, 55, 0.15)' },
  { id: '6', label: 'ARGUS Platinum Safety', icon: ShieldCheck, color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' },
  { id: '7', label: 'Pet-Friendly Royal Cabin', icon: Sparkles, color: '#D4AF37', bg: 'rgba(212, 175, 55, 0.15)' },
];

const POPULAR_ROUTES = [
  {
    id: 'r1',
    from: 'Cairo (CAI)',
    to: 'London Luton VIP (LTN)',
    duration: '5 Hours 15 Mins',
    estPrice: '$48,000',
    numericPrice: 48000,
    popular: true,
  },
  {
    id: 'r2',
    from: 'Dubai Al Maktoum (DWC)',
    to: 'Paris Le Bourget (LBG)',
    duration: '6 Hours 45 Mins',
    estPrice: '$62,000',
    numericPrice: 62000,
    popular: false,
  },
  {
    id: 'r3',
    from: 'Riyadh Private (RUH)',
    to: 'Nice Côte d’Azur (NCE)',
    duration: '5 Hours 50 Mins',
    estPrice: '$55,000',
    numericPrice: 55000,
    popular: false,
  },
];

export function JetDetailsScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'JetDetails'>>();
  const insets = useSafeAreaInsets();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState('r1');
  const [charterDate, setCharterDate] = useState(() => getFutureYmd(3));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showJetPdfModal, setShowJetPdfModal] = useState(false);
  const { itemsByCategory } = useCatalogStore();
  const liveJets = itemsByCategory.jets ?? [];

  const foundJet = useMemo(() => {
    return liveJets.find(
      j =>
        (route.params?.jetId && j.id === route.params.jetId) ||
        (route.params?.jetName && j.name === route.params.jetName)
    );
  }, [liveJets, route.params?.jetId, route.params?.jetName]);

  // Real-time Firestore document listener for instant updates from Admin
  const [liveDoc, setLiveDoc] = useState<any>(null);
  useEffect(() => {
    const targetId = route.params?.jetId || foundJet?.id;
    if (!targetId) return;
    try {
      const unsub = firestore().collection('jets').doc(targetId).onSnapshot(
        docSnap => {
          if (docSnap && docSnap.exists()) {
            setLiveDoc(docSnap.data());
          }
        },
        () => {}
      );
      return () => unsub();
    } catch {}
  }, [route.params?.jetId, foundJet?.id]);

  const jetName = liveDoc?.name || foundJet?.name || route.params?.jetName || 'Bombardier Global 7500';
  const jetCategory = liveDoc?.category
    ? `${String(liveDoc.category).replace('_', ' ').toUpperCase()} • Flagship`
    : (foundJet?.tag1 || route.params?.category || 'Ultra Long Range Flagship');
  const jetTailNumber = enforceEnglishDigits(liveDoc?.tailNumber || route.params?.tailNumber || 'N7500-VIP');
  const jetPrice = enforceEnglishDigits(
    typeof liveDoc?.hourlyRate === 'number'
      ? `$${Number(liveDoc.hourlyRate).toLocaleString('en-US')}/hr`
      : (foundJet?.price || route.params?.price || '$18,500/hr')
  );
  const baseSeed = (jetName.length * 7 + (liveDoc?.flightRange || 5000)) % 10;
  const dynamicRating = typeof liveDoc?.rating === 'number'
    ? liveDoc.rating
    : (4.4 + (baseSeed * 0.05));
  const jetRating = Math.min(Math.max(dynamicRating, 4.1), 4.98);

  const jetRange = enforceEnglishDigits(
    liveDoc?.flightRange
      ? `${Number(liveDoc.flightRange).toLocaleString('en-US')} nm Range`
      : (route.params?.range || foundJet?.tag1 || '7,700 nm Intercontinental')
  );
  const jetCapacity = enforceEnglishDigits(
    liveDoc?.guestCapacity
      ? `${liveDoc.guestCapacity} VIP Seats`
      : (route.params?.pax || '19 VIP Seats')
  );
  const jetSpeed = route.params?.speed || 'Mach 0.925 (610 mph)';

  // Genuine Photos from Firestore (liveDoc) -> CatalogStore -> route.params -> Fallback
  const photosList = useMemo<string[]>(() => {
    // 1. Direct real-time Firestore document if available
    if (liveDoc?.images && Array.isArray(liveDoc.images) && liveDoc.images.length > 0) {
      const list = liveDoc.images.map((img: any) => (typeof img === 'string' ? img : img?.url)).filter(Boolean) as string[];
      if (list.length > 0) return list;
    }
    // 2. Found from live CatalogStore
    if (foundJet?.images && foundJet.images.length > 0) {
      return foundJet.images;
    }
    // 3. Passed from route.params
    if (route.params?.images && route.params.images.length > 0) {
      return route.params.images;
    }
    if (route.params?.image) {
      return [route.params.image, ...DEFAULT_FALLBACK_PHOTOS.slice(1, 4)];
    }
    return DEFAULT_FALLBACK_PHOTOS;
  }, [liveDoc, foundJet, route.params?.images, route.params?.image]);

  const activePhoto = photosList[selectedPhotoIndex] ?? photosList[0];

  const descriptionText = useMemo(() => {
    if (liveDoc?.description && liveDoc.description.length > 20) {
      return liveDoc.description;
    }
    if (foundJet?.description && foundYachtSafeDesc(foundJet)) {
      return foundJet.description!;
    }
    if (route.params?.description && route.params.description.length > 20) {
      return route.params.description;
    }
    return 'The undisputed pinnacle of business aviation. Featuring four distinct living zones, a permanent master suite with a full-size bed, stand-up en-suite shower, dedicated flight attendants, and bespoke Michelin-starred in-flight catering.';
  }, [liveDoc, foundJet, route.params?.description]);

  function foundYachtSafeDesc(item: any): boolean {
    return Boolean(item?.description && item.description.length > 20);
  }

  // JetVIP Interactive Tabs & Calculator
  const [activePhotoCategory, setActivePhotoCategory] = useState<'all' | 'exterior' | 'interior' | 'layout'>('all');
  const [showCostCalculator, setShowCostCalculator] = useState(false);
  const [calcHours, setCalcHours] = useState(3);
  const [calcPax, setCalcPax] = useState(4);

  const numericHourlyRate = useMemo(() => {
    if (typeof liveDoc?.hourlyRate === 'number') return liveDoc.hourlyRate;
    const digits = String(jetPrice).replace(/[^0-9]/g, '');
    return digits ? parseInt(digits, 10) : 16500;
  }, [liveDoc?.hourlyRate, jetPrice]);

  const estimatedTripTotal = useMemo(() => {
    const flightCost = calcHours * numericHourlyRate;
    const handling = Math.round(flightCost * 0.08);
    return flightCost + handling;
  }, [calcHours, numericHourlyRate]);

  const chosenRouteObj = useMemo(
    () => POPULAR_ROUTES.find(r => r.id === selectedRoute) || POPULAR_ROUTES[0],
    [selectedRoute],
  );

  const handleBookNow = (useCalculatorEstimate = false) => {
    const finalPrice = useCalculatorEstimate
      ? estimatedTripTotal
      : chosenRouteObj?.numericPrice || estimatedTripTotal || numericHourlyRate;

    navigation.navigate('Booking', {
      type: 'jet',
      bookingType: 'jet',
      visaDocType: 'jet',
      id: route.params?.jetId ?? foundJet?.id ?? 'jet-flagship',
      itemName: `${jetName} (${jetTailNumber}) • ${chosenRouteObj.from} ➔ ${chosenRouteObj.to}`,
      price: finalPrice,
      startDate: charterDate,
      endDate: charterDate,
      guestsCount: calcPax,
      origin: chosenRouteObj.from,
      destination: chosenRouteObj.to,
    } as any);
  };

  // Scores & Dynamic Popularity Indicator (Moving Pointer on Gradient Line)
  const popularityScore = enforceEnglishDigits(jetRating.toFixed(1));
  const pointerPercent = Math.min(Math.max(((jetRating - 1) / 4.0) * 100, 15), 92);

  const reliabilityScore = enforceEnglishDigits(liveDoc?.reliabilityScore ?? (jetRating >= 4.8 ? 96 : 91));
  const comfortScore = enforceEnglishDigits(liveDoc?.comfortScore ?? (jetCapacity.includes('19') ? 95 : 88));

  // Identity Table items
  const sellerName = liveDoc?.seller || 'Luxwing Ltd • VANIR Partner';
  const modelName = liveDoc?.model || jetName;
  const producerName = useMemo(() => {
    if (liveDoc?.producer) return liveDoc.producer;
    if (jetName.toLowerCase().includes('falcon')) return 'Dassault Aviation';
    if (jetName.toLowerCase().includes('global')) return 'Bombardier Aviation';
    if (jetName.toLowerCase().includes('gulfstream')) return 'Gulfstream Aerospace';
    return 'Embraer Executive';
  }, [liveDoc?.producer, jetName]);
  const homebaseAirport = liveDoc?.homebase || 'Cairo VIP (CAI) • Dubai (DWC)';
  const yearBuilt = enforceEnglishDigits(liveDoc?.yearBuilt || liveDoc?.yom || '2024');
  const serialNumber = enforceEnglishDigits(liveDoc?.serialNumber || liveDoc?.msn || 'MSN-50500446');
  const luggageCapacity = enforceEnglishDigits(liveDoc?.luggageCapacity || '5.5 cub.m (195 cu.ft)');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}>
        {/* Top Hero Image Area - Clean & Unobstructed */}
        <View style={styles.heroWrapper}>
          <Image source={{ uri: activePhoto }} style={styles.heroImage} resizeMode="cover" />

          {/* Top Floating Controls */}
          <View style={[styles.heroHeader, { paddingTop: Math.max(insets.top, 16) }]}>
            <Pressable
              style={({ pressed }) => [
                styles.circleBtn,
                pressed && styles.topBtnPressed,
              ]}
              onPress={() => navigation.goBack()}
            >
              <ChevronLeft color="#1C1917" size={22} strokeWidth={2.5} />
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.circleBtn,
                pressed && styles.topBtnPressed,
              ]}
              onPress={() => setIsFavorite(prev => !prev)}
            >
              <Heart
                color={isFavorite ? '#EF4444' : '#1C1917'}
                fill={isFavorite ? '#EF4444' : 'transparent'}
                size={20}
                strokeWidth={2}
              />
            </Pressable>
          </View>

          {/* Left Navigation Arrow */}
          {photosList.length > 1 && (
            <Pressable
              style={styles.heroNavArrowLeft}
              onPress={() => setSelectedPhotoIndex(prev => (prev - 1 + photosList.length) % photosList.length)}
            >
              <ChevronLeft color="#FFFFFF" size={24} strokeWidth={2.8} />
            </Pressable>
          )}

          {/* Right Navigation Arrow */}
          {photosList.length > 1 && (
            <Pressable
              style={styles.heroNavArrowRight}
              onPress={() => setSelectedPhotoIndex(prev => (prev + 1) % photosList.length)}
            >
              <ChevronRight color="#FFFFFF" size={24} strokeWidth={2.8} />
            </Pressable>
          )}

          {/* Clean Minimalist Photo Counter Pill (Bottom-Right Corner) */}
          <View style={styles.photoCounterBadge}>
            <Text style={styles.photoCounterBadgeText}>
              {selectedPhotoIndex + 1} / {photosList.length}
            </Text>
          </View>
        </View>

        {/* Top Category Filter Bar & Action CTAs (Calculate Cost & Download PDF) */}
        <View style={styles.topFilterBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topTabsScroll}>
            <Pressable
              style={[styles.topTabBtn, activePhotoCategory === 'all' && styles.topTabBtnActive]}
              onPress={() => setActivePhotoCategory('all')}
            >
              <Text style={[styles.topTabBtnText, activePhotoCategory === 'all' && styles.topTabBtnTextActive]}>
                All photos ({photosList.length})
              </Text>
            </Pressable>

            <Pressable
              style={[styles.topTabBtn, activePhotoCategory === 'exterior' && styles.topTabBtnActive]}
              onPress={() => {
                setActivePhotoCategory('exterior');
                setSelectedPhotoIndex(0);
              }}
            >
              <Text style={[styles.topTabBtnText, activePhotoCategory === 'exterior' && styles.topTabBtnTextActive]}>
                Exterior
              </Text>
            </Pressable>

            <Pressable
              style={[styles.topTabBtn, activePhotoCategory === 'interior' && styles.topTabBtnActive]}
              onPress={() => {
                setActivePhotoCategory('interior');
                if (photosList.length > 1) setSelectedPhotoIndex(1);
              }}
            >
              <Text style={[styles.topTabBtnText, activePhotoCategory === 'interior' && styles.topTabBtnTextActive]}>
                Interior
              </Text>
            </Pressable>

            <Pressable
              style={[styles.topTabBtn, activePhotoCategory === 'layout' && styles.topTabBtnActive]}
              onPress={() => {
                setActivePhotoCategory('layout');
                if (photosList.length > 2) setSelectedPhotoIndex(photosList.length - 1);
              }}
            >
              <Text style={[styles.topTabBtnText, activePhotoCategory === 'layout' && styles.topTabBtnTextActive]}>
                Cabin layout
              </Text>
            </Pressable>

            {/* Calculate Flight Cost CTA (Vibrant Green Button in Screenshot) */}
            <Pressable
              style={styles.calcCostPill}
              onPress={() => setShowCostCalculator(true)}
            >
              <Calculator color="#FFFFFF" size={14} strokeWidth={2.4} />
              <Text style={styles.calcCostPillText}>Calculate flight cost</Text>
            </Pressable>

            {/* Download PDF Specs Button */}
            <Pressable
              style={styles.downloadPdfPill}
              onPress={() => setShowJetPdfModal(true)}
            >
              <FileDown color="#1C1917" size={14} strokeWidth={2.4} />
              <Text style={styles.downloadPdfPillText}>Download PDF</Text>
            </Pressable>
          </ScrollView>
        </View>

        {/* Content Container */}
        <View style={styles.contentCard}>
          {/* Main Title & Rating */}
          <View style={styles.titleRow}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <View style={styles.categoryPill}>
                <Plane color="#C9A84C" size={13} strokeWidth={2.4} />
                <Text style={styles.categoryPillText}>{jetCategory}</Text>
              </View>
              <Text style={styles.titleText}>{jetName}</Text>
              <View style={styles.locationRow}>
                <Text style={styles.tailNumberText}>Tail Number: {jetTailNumber}</Text>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.icaoText}>VIP FBO Worldwide Access</Text>
              </View>
            </View>

            <View style={styles.ratingBox}>
              <View style={styles.ratingNumberRow}>
                <Star color="#F59E0B" fill="#F59E0B" size={16} />
                <Text style={styles.ratingNumber}>{jetRating.toFixed(1)}</Text>
              </View>
              <Text style={styles.reviewsCount}>Royal Fleet</Text>
            </View>
          </View>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* 🛡️ JETVIP OFFICIAL AIRCRAFT SCORE & POPULARITY SECTION */}
          {/* ───────────────────────────────────────────────────────────── */}
          <View style={styles.jetVipScoreCard}>
            {/* Top Metrics Row: Reliability & Comfort */}
            <View style={styles.scoreTopRow}>
              {/* Reliability */}
              <View style={styles.scoreMetricCol}>
                <View style={styles.metricHeaderRow}>
                  <Shield color="#D4AF37" size={17} strokeWidth={2.4} />
                  <Text style={styles.metricTitle}>Above-average reliability</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${reliabilityScore}%` as any }]}>
                    <Text style={styles.progressText}>{reliabilityScore}/100</Text>
                  </View>
                </View>
                <Pressable onPress={() => Alert.alert('Reliability Index 🛡️', 'Rated 99.8% dispatch reliability by ARGUS Platinum & EASA fleet standards.')}>
                  <Text style={styles.metricLinkText}>How is reliability calculated?</Text>
                </Pressable>
              </View>

              {/* Comfort */}
              <View style={styles.scoreMetricCol}>
                <View style={styles.metricHeaderRow}>
                  <Armchair color="#D4AF37" size={17} strokeWidth={2.4} />
                  <Text style={styles.metricTitle}>Average comfort</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${comfortScore}%` as any }]}>
                    <Text style={styles.progressText}>{comfortScore}/100</Text>
                  </View>
                </View>
                <Pressable onPress={() => Alert.alert('Comfort Index 🛋️', 'Evaluated based on low cabin pressure altitude, master suites, and acoustic insulation.')}>
                  <Text style={styles.metricLinkText}>How is comfort calculated?</Text>
                </Pressable>
              </View>
            </View>

            {/* Popularity Row with the Moving Indicator on the Gradient Line */}
            <View style={styles.popularityRow}>
              <Text style={styles.popularityTitle}>Popularity</Text>
              <View style={styles.popularityTrackContainer}>
                <View style={styles.popularityGradientLine}>
                  <LinearGradient
                    colors={['#EF4444', '#F97316', '#FBBF24', '#84CC16', '#10B981']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                </View>
                <View
                  style={[
                    styles.popularityPointerCircle,
                    { left: `${pointerPercent}%` }
                  ]}
                >
                  <Text style={styles.popularityPointerText}>{popularityScore}</Text>
                </View>
              </View>
            </View>

            {/* Identity Table & Manufacturer Logo */}
            <View style={styles.identityTable}>
              <View style={styles.identityRowsCol}>
                <View style={styles.identityRow}>
                  <Text style={styles.identityLabel}>Seller</Text>
                  <Text style={styles.identityValueLink}>{sellerName}</Text>
                </View>
                <View style={styles.identityRow}>
                  <Text style={styles.identityLabel}>Model</Text>
                  <Text style={styles.identityValueLink}>{modelName}</Text>
                </View>
                <View style={styles.identityRow}>
                  <Text style={styles.identityLabel}>Producer</Text>
                  <Text style={styles.identityValueLink}>{producerName}</Text>
                </View>
                <View style={styles.identityRow}>
                  <Text style={styles.identityLabel}>Category</Text>
                  <Text style={styles.identityValueLink}>{jetCategory}</Text>
                </View>
                <View style={styles.identityRow}>
                  <Text style={styles.identityLabel}>Homebase</Text>
                  <Text style={styles.identityValueLink}>{homebaseAirport}</Text>
                </View>
              </View>

              {/* Manufacturer Emblem */}
              <View style={styles.producerBadgeBox}>
                <Plane color="#D4AF37" size={26} strokeWidth={2.4} />
                <Text style={styles.producerBadgeName}>{producerName.toUpperCase()}</Text>
                <Text style={styles.producerBadgeSub}>CERTIFIED VIP</Text>
              </View>
            </View>

            {/* Technical Specs Gray Box (YOM, Passengers, MSN, Luggage) */}
            <View style={styles.techSpecsCard}>
              <View style={styles.techSpecCol}>
                <Text style={styles.techSpecLabel}>Year built (YOM)</Text>
                <Text style={styles.techSpecVal}>{yearBuilt}</Text>
              </View>
              <View style={styles.techSpecCol}>
                <Text style={styles.techSpecLabel}>Passengers</Text>
                <Text style={styles.techSpecVal}>{jetCapacity}</Text>
              </View>
              <View style={styles.techSpecCol}>
                <Text style={styles.techSpecLabel}>Serial number (MSN)</Text>
                <Text style={styles.techSpecVal}>{serialNumber}</Text>
              </View>
              <View style={styles.techSpecCol}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={styles.techSpecLabel}>Luggage</Text>
                  <Briefcase color="#64748B" size={11} />
                </View>
                <Text style={styles.techSpecVal}>{luggageCapacity}</Text>
              </View>
            </View>
          </View>

          {/* Safety & Accreditation Banner */}
          <View style={styles.safetyCard}>
            <ShieldCheck color="#10B981" size={20} strokeWidth={2.4} />
            <View style={{ flex: 1 }}>
              <Text style={styles.safetyTitle}>ARGUS Platinum & Wyvern Wingman Certified</Text>
              <Text style={styles.safetyDesc}>
                Operated under strict FAA Part 135 & EASA air operator certificates with dual-captain flight crews and zero-incident safety track record.
              </Text>
            </View>
          </View>

          {/* Aircraft Specifications Grid */}
          <View style={styles.sectionDivider} />
          <Text style={styles.sectionTitle}>Aircraft Specifications</Text>
          <View style={styles.specsGrid}>
            <View style={styles.specBox}>
              <View style={styles.specIconBox}>
                <Compass color="#D4AF37" size={18} strokeWidth={2.2} />
              </View>
              <Text style={styles.specLabel}>Max Range</Text>
              <Text style={styles.specValue}>{jetRange}</Text>
            </View>

            <View style={styles.specBox}>
              <View style={styles.specIconBox}>
                <Clock color="#C9A84C" size={18} strokeWidth={2.2} />
              </View>
              <Text style={styles.specLabel}>Cruising Speed</Text>
              <Text style={styles.specValue}>{jetSpeed}</Text>
            </View>

            <View style={styles.specBox}>
              <View style={styles.specIconBox}>
                <Users color="#10B981" size={18} strokeWidth={2.2} />
              </View>
              <Text style={styles.specLabel}>Passenger Capacity</Text>
              <Text style={styles.specValue}>{jetCapacity}</Text>
            </View>

            <View style={styles.specBox}>
              <View style={styles.specIconBox}>
                <Bed color="#8B5CF6" size={18} strokeWidth={2.2} />
              </View>
              <Text style={styles.specLabel}>Berthable Staterooms</Text>
              <Text style={styles.specValue}>2 Master Double Beds</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.sectionDivider} />
          <Text style={styles.sectionTitle}>Aircraft & Cabin Overview</Text>
          <Text style={styles.descriptionText}>{descriptionText}</Text>

          {/* VIP Aviation Amenities */}
          <View style={styles.sectionDivider} />
          <Text style={styles.sectionTitle}>Bespoke In-Flight Privileges</Text>
          <View style={styles.amenitiesWrap}>
            {JET_AMENITIES.map(am => {
              const Icon = am.icon;
              return (
                <View key={am.id} style={styles.amenityChip}>
                  <View style={[styles.amenityIconCircle, { backgroundColor: am.bg }]}>
                    <Icon color={am.color} size={16} strokeWidth={2.2} />
                  </View>
                  <Text style={styles.amenityText}>{am.label}</Text>
                </View>
              );
            })}
          </View>

          {/* Popular Curated Charter Routes */}
          <View style={styles.sectionDivider} />

          {/* Interactive Charter Departure Date Selector */}
          <Pressable
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#FAF9F6',
              borderRadius: 14,
              borderWidth: 1,
              borderColor: 'rgba(212, 175, 55, 0.35)',
              paddingHorizontal: 14,
              paddingVertical: 12,
              marginBottom: 14,
            }}
            onPress={() => setShowDatePicker(true)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Calendar color="#D4AF37" size={16} strokeWidth={2.2} />
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#1C1917' }}>
                Charter Departure Date
              </Text>
            </View>
            <Text style={{ fontSize: 13.5, fontWeight: '900', color: '#D4AF37' }}>
              {charterDate}
            </Text>
          </Pressable>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={styles.sectionTitle}>Curated Private Jet Routes</Text>
            <Text style={styles.sectionSub}>All-Inclusive Rates</Text>
          </View>

          {POPULAR_ROUTES.map(r => {
            const isSelected = selectedRoute === r.id;
            return (
              <Pressable
                key={r.id}
                onPress={() => setSelectedRoute(r.id)}
                style={[styles.routeCard, isSelected && styles.routeCardActive]}
              >
                <View style={{ flex: 1, marginRight: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
                    <Text style={styles.routeAirport}>{r.from}</Text>
                    <ArrowRight color="#D4AF37" size={14} strokeWidth={2.5} />
                    <Text style={styles.routeAirport}>{r.to}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Clock color="#64748B" size={13} />
                    <Text style={styles.routeDuration}>{r.duration}</Text>
                  </View>
                </View>

                <View style={{ alignItems: 'flex-end', flexShrink: 0, minWidth: 88 }}>
                  <Text style={styles.routePrice}>{enforceEnglishDigits(r.estPrice)}</Text>
                  <Text style={styles.routePricePer}>Estimated Charter</Text>
                </View>
              </Pressable>
            );
          })}

          {/* VIP Concierge Assistance */}
          <View style={styles.conciergeCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Sparkles color="#D4AF37" size={18} strokeWidth={2.2} />
              <Text style={styles.conciergeTitle}>Dedicated 24/7 Aviation Officer</Text>
            </View>
            <Text style={styles.conciergeDesc}>
              Custom catering, overflight permits, confidential passenger manifests, and ramp car permits are seamlessly coordinated by our operations team within 2 hours of booking.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.bottomPriceCol}>
          <Text style={styles.bottomPriceLabel}>Selected Route Charter</Text>
          <Text style={styles.bottomPriceValue}>{chosenRouteObj?.estPrice || jetPrice}</Text>
        </View>

        <Pressable
          style={styles.bookBtn}
          onPress={() => handleBookNow(false)}
        >
          <Plane color="#1C1917" size={18} strokeWidth={2.4} />
          <Text style={styles.bookBtnText}>Reserve Private Jet</Text>
        </Pressable>
      </View>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 🧮 CALCULATE FLIGHT COST INTERACTIVE MODAL */}
      {/* ───────────────────────────────────────────────────────────── */}
      <Modal
        visible={showCostCalculator}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCostCalculator(false)}
      >
        <View style={styles.calcModalOverlay}>
          <View style={styles.calcModalContent}>
            <View style={styles.calcModalHeader}>
              <View>
                <Text style={styles.calcModalTitle}>Calculate Flight Cost ✈️</Text>
                <Text style={styles.calcModalSub}>{jetName} • {jetPrice}</Text>
              </View>
              <Pressable style={styles.calcModalClose} onPress={() => setShowCostCalculator(false)}>
                <X color="#64748B" size={20} strokeWidth={2.5} />
              </Pressable>
            </View>

            {/* Flight Hours Stepper */}
            <View style={styles.calcFieldBox}>
              <Text style={styles.calcFieldLabel}>ESTIMATED FLIGHT DURATION</Text>
              <View style={styles.stepperRow}>
                {[1, 2, 3, 5, 8].map(h => (
                  <Pressable
                    key={h}
                    style={[styles.stepperPill, calcHours === h && styles.stepperPillActive]}
                    onPress={() => setCalcHours(h)}
                  >
                    <Text style={[styles.stepperPillText, calcHours === h && styles.stepperPillTextActive]}>
                      {h} Hours
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Passengers Stepper */}
            <View style={styles.calcFieldBox}>
              <Text style={styles.calcFieldLabel}>VIP PASSENGERS</Text>
              <View style={styles.stepperRow}>
                {[2, 4, 8, 12, 16].map(p => (
                  <Pressable
                    key={p}
                    style={[styles.stepperPill, calcPax === p && styles.stepperPillActive]}
                    onPress={() => setCalcPax(p)}
                  >
                    <Text style={[styles.stepperPillText, calcPax === p && styles.stepperPillTextActive]}>
                      {p} Guests
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Live Breakdown */}
            <View style={styles.calcBreakdownCard}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Hourly Aircraft Rate</Text>
                <Text style={styles.breakdownVal}>${enforceEnglishDigits(Number(numericHourlyRate).toLocaleString('en-US'))} / hr</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Flight Hours ({enforceEnglishDigits(calcHours)} hrs)</Text>
                <Text style={styles.breakdownVal}>${enforceEnglishDigits(Number(calcHours * numericHourlyRate).toLocaleString('en-US'))}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>VIP FBO Ramp & Landing Fees</Text>
                <Text style={styles.breakdownVal}>${enforceEnglishDigits(Number(Math.round(calcHours * numericHourlyRate * 0.08)).toLocaleString('en-US'))}</Text>
              </View>
              <View style={[styles.breakdownRow, styles.breakdownTotalRow]}>
                <Text style={styles.breakdownTotalLabel}>Estimated Total</Text>
                <Text style={styles.breakdownTotalVal}>${enforceEnglishDigits(Number(estimatedTripTotal).toLocaleString('en-US'))}</Text>
              </View>
            </View>

            <Pressable
              style={styles.calcConfirmBtn}
              onPress={() => {
                setShowCostCalculator(false);
                handleBookNow(true);
              }}
            >
              <Text style={styles.calcConfirmBtnText}>Dispatch Charter With This Estimate</Text>
              <ArrowRight color="#1C1917" size={16} strokeWidth={2.5} />
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Interactive Charter Date Picker */}
      <VipDatePickerModal
        visible={showDatePicker}
        initialDate={charterDate}
        title="Select Private Jet Charter Date"
        onClose={() => setShowDatePicker(false)}
        onSelectDate={setCharterDate}
      />

      {/* Official Aircraft Charter Dossier & Stamped Quote PDF */}
      <VisaDocumentPdfModal
        visible={showJetPdfModal}
        onClose={() => setShowJetPdfModal(false)}
        docType="jet"
        data={{
          referenceNumber: `VN-JET-${jetTailNumber.replace(/[^A-Z0-9]/gi, '').slice(0, 6) || '7500'}`,
          clientName: auth().currentUser?.displayName || 'VIP Principal Passenger',
          email: auth().currentUser?.email || 'aviation@vanirgroup.com',
          vehicleOrVesselName: `${jetName} • Tail ${jetTailNumber} (${producerName})`,
          flightOrigin: chosenRouteObj?.from || homebaseAirport,
          flightDestination: chosenRouteObj?.to || 'London Luton VIP (LTN)',
          flightDepartureDate: charterDate,
          passengersCount: calcPax,
          aircraftRange: jetRange,
          aircraftSpeed: jetSpeed,
          durationLabel: chosenRouteObj?.duration || `${calcHours} Flight Hours`,
          totalAmountPaid: chosenRouteObj?.numericPrice || estimatedTripTotal,
          packageName: `${jetCategory} • MSN ${serialNumber}`,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  heroWrapper: {
    width: '100%',
    height: 380,
    position: 'relative',
    backgroundColor: '#FAF9F6',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  circleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  topBtnPressed: {
    backgroundColor: 'rgba(212, 175, 55, 0.22)',
    borderColor: '#D4AF37',
  },
  heroNavArrowLeft: {
    position: 'absolute',
    left: 12,
    top: '48%',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(28, 25, 23, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  heroNavArrowRight: {
    position: 'absolute',
    right: 12,
    top: '48%',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(28, 25, 23, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  photoCounterBadge: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    backgroundColor: 'rgba(28, 25, 23, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  photoCounterBadgeText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  contentCard: {
    backgroundColor: '#FAF9F6',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.25)',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 0.3,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1C1917',
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tailNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D4AF37',
  },
  dot: {
    fontSize: 13,
    color: '#64748B',
  },
  icaoText: {
    fontSize: 13,
    color: '#64748B',
  },
  ratingBox: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  ratingNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#D4AF37',
  },
  reviewsCount: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  safetyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 14,
    padding: 12,
    marginTop: 18,
  },
  safetyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
    marginBottom: 3,
  },
  safetyDesc: {
    fontSize: 11,
    color: '#166534',
    lineHeight: 16,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(28, 25, 23, 0.08)',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1917',
    marginBottom: 12,
  },
  sectionSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D4AF37',
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  specBox: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  specIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFDF9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  specLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2,
  },
  specValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1917',
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#334155',
  },
  amenitiesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  amenityIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amenityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1917',
  },
  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    marginBottom: 10,
  },
  routeCardActive: {
    borderColor: '#D4AF37',
    backgroundColor: '#FFFDF9',
  },
  routeAirport: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1917',
  },
  routeDuration: {
    fontSize: 12,
    color: '#64748B',
  },
  routePrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#D4AF37',
  },
  routePricePer: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  conciergeCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  conciergeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D4AF37',
  },
  conciergeDesc: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 16,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.25)',
    elevation: 8,
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  bottomPriceCol: {
    flex: 1,
  },
  bottomPriceLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  bottomPriceValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#D4AF37',
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#D4AF37',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  bookBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1917',
  },

  /* Top Category Tabs & Action Buttons (Calculate Cost & Download PDF) */
  topFilterBar: {
    backgroundColor: '#FAF9F6',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
  },
  topTabsScroll: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  topTabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  topTabBtnActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  topTabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  topTabBtnTextActive: {
    color: '#1C1917',
    fontWeight: '800',
  },
  calcCostPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#D4AF37',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#D4AF37',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  calcCostPillText: {
    color: '#1C1917',
    fontSize: 12,
    fontWeight: '800',
  },
  downloadPdfPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  downloadPdfPillText: {
    color: '#1C1917',
    fontSize: 12,
    fontWeight: '700',
  },

  /* ───────────────────────────────────────────────────────────── */
  /* 🛡️ JETVIP OFFICIAL AIRCRAFT SCORE & POPULARITY CARD */
  /* ───────────────────────────────────────────────────────────── */
  jetVipScoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 16,
  },
  scoreTopRow: {
    flexDirection: 'row',
    gap: 14,
  },
  scoreMetricCol: {
    flex: 1,
    gap: 6,
  },
  metricHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1C1917',
  },
  progressTrack: {
    width: '100%',
    height: 18,
    backgroundColor: '#E2E8F0',
    borderRadius: 9,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    color: '#1C1917',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  metricLinkText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#D4AF37',
  },

  /* Popularity with the dynamic moving indicator on the gradient line */
  popularityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  popularityTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1917',
    minWidth: 74,
  },
  popularityTrackContainer: {
    flex: 1,
    height: 36,
    justifyContent: 'center',
    position: 'relative',
  },
  popularityGradientLine: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  popularityPointerCircle: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  popularityPointerText: {
    color: '#1C1917',
    fontSize: 12,
    fontWeight: '900',
  },

  /* Identity Table */
  identityTable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(28, 25, 23, 0.08)',
  },
  identityRowsCol: {
    flex: 1,
    gap: 6,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  identityLabel: {
    width: 75,
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  identityValueLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D4AF37',
    flex: 1,
  },
  producerBadgeBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    minWidth: 105,
    gap: 4,
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  producerBadgeName: {
    fontSize: 10,
    fontWeight: '900',
    color: '#1C1917',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  producerBadgeSub: {
    fontSize: 9,
    color: '#D4AF37',
    fontWeight: '800',
  },

  /* Technical Specs Light Box (YOM, Passengers, MSN, Luggage) */
  techSpecsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    justifyContent: 'space-between',
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  techSpecCol: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 2,
    gap: 4,
  },
  techSpecLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
    textAlign: 'center',
  },
  techSpecVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1C1917',
    textAlign: 'center',
  },

  /* ───────────────────────────────────────────────────────────── */
  /* 🧮 CALCULATE FLIGHT COST MODAL STYLES */
  /* ───────────────────────────────────────────────────────────── */
  calcModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 25, 23, 0.65)',
    justifyContent: 'flex-end',
  },
  calcModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 16,
    maxHeight: '85%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.3)',
  },
  calcModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(28, 25, 23, 0.08)',
  },
  calcModalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1C1917',
  },
  calcModalSub: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '700',
    marginTop: 2,
  },
  calcModalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  calcFieldBox: {
    gap: 8,
  },
  calcFieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1.2,
  },
  stepperRow: {
    flexDirection: 'row',
    gap: 8,
  },
  stepperPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    alignItems: 'center',
  },
  stepperPillActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  stepperPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  stepperPillTextActive: {
    color: '#1C1917',
    fontWeight: '800',
  },
  calcBreakdownCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    gap: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  breakdownVal: {
    fontSize: 12,
    color: '#1C1917',
    fontWeight: '700',
  },
  breakdownTotalRow: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(28, 25, 23, 0.08)',
    marginTop: 4,
  },
  breakdownTotalLabel: {
    fontSize: 14,
    color: '#1C1917',
    fontWeight: '900',
  },
  breakdownTotalVal: {
    fontSize: 18,
    color: '#D4AF37',
    fontWeight: '900',
  },
  calcConfirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#D4AF37',
    borderRadius: 16,
    paddingVertical: 14,
    shadowColor: '#D4AF37',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  calcConfirmBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1917',
  },
});
