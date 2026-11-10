import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import firestore from '@react-native-firebase/firestore';
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ChevronLeft,
  Heart,
  MapPin,
  Star,
  Image as ImageIcon,
  ChevronRight,
  Share2,
  Waves,
  Sparkles,
  Utensils,
  Bell,
  Wifi,
  Car,
  ShieldCheck,
  Check,
  Building,
  Crown,
  Compass,
  Clock,
  ArrowRight,
  AlertCircle,
  Calendar,
  Users,
} from 'lucide-react-native';
import { CURATED_LUXURY_HOTELS } from '../../services/catalogApi';
import { useCatalogStore } from '../../context/CatalogStore';
import {
  fetchLiveHotelDetails,
  createRoomHold,
  LiveHotelProperty,
  LiveRoomOffer,
} from '../../services/hotelSearchApi';
import { HotelRoomDrawer } from '../../components/HotelRoomDrawer';
import { VipDatePickerModal } from '../../components/VipDatePickerModal';
import { HotelMapView } from '../../components/HotelMapView';
import { HotelPhotoGalleryModal } from '../../components/HotelPhotoGalleryModal';
import { getHotelGallery } from '../../services/hotelGalleryBank';
import { resolveAuthenticHotelBank } from '../../services/authenticHotelPhotoBanks';
import { isUnsplashOrGeneric, sanitizePhotoList } from '../../services/urlSanitizer';
import { LuxuryPressable } from '../../components/LuxuryMicroInteractions';
import { AnimatedGoldButton } from '../../components/AnimatedGoldButton';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function getFutureYmd(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function diffNights(startStr: string, endStr: string): number {
  const m1 = startStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const m2 = endStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!m1 || !m2) return 4;
  const t1 = new Date(Number(m1[1]), Number(m1[2]) - 1, Number(m1[3])).getTime();
  const t2 = new Date(Number(m2[1]), Number(m2[2]) - 1, Number(m2[3])).getTime();
  const d = Math.round((t2 - t1) / 86400000);
  return d > 0 ? d : 1;
}

const PHOTO_LABELS = [
  'Facade & Royal Architecture',
  'Imperial Master Suite',
  'Infinity Pool & Horizon Views',
  'Fine Dining & Holistic Spa',
];


const AMENITIES = [
  { id: '1', label: 'Beachfront Access', icon: Waves },
  { id: '2', label: 'Infinity Heated Pool', icon: Waves },
  { id: '3', label: 'Royal Holistic Spa', icon: Sparkles },
  { id: '4', label: 'Michelin Fine Dining', icon: Utensils },
  { id: '5', label: '24/7 VIP Butler', icon: Bell },
  { id: '6', label: 'Encrypted Fiber WiFi', icon: Wifi },
  { id: '7', label: 'Valet Limousine', icon: Car },
];

export function HotelDetailsScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'HotelDetails'>>();
  const insets = useSafeAreaInsets();
  const routeAny = (route.params || {}) as any;

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [isRoomDrawerOpen, setIsRoomDrawerOpen] = useState(false);
  const [drawerRoom, setDrawerRoom] = useState<LiveRoomOffer | null>(null);

  const [isGalleryModalVisible, setIsGalleryModalVisible] = useState(false);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const suitesSectionY = useRef<number>(600);

  const [checkInDate, setCheckInDate] = useState<string>(() => routeAny.checkInDate || getFutureYmd(3));
  const [checkOutDate, setCheckOutDate] = useState<string>(() => routeAny.checkOutDate || getFutureYmd(7));
  const [guestsCount, setGuestsCount] = useState<number>(() => Number(routeAny.guestsCount) || 2);
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);

  const computedNights = useMemo(
    () => diffNights(checkInDate, checkOutDate),
    [checkInDate, checkOutDate],
  );

  // Live hotel state from Amadeus / EPS Live Engine
  const [liveProperty, setLiveProperty] = useState<LiveHotelProperty | null>(null);
  const [isLoadingLive, setIsLoadingLive] = useState(true);

  const { itemsByCategory } = useCatalogStore();
  const catalogHotels = itemsByCategory.hotels ?? [];

  const rawParams = (route.params || {}) as any;
  const hotelId =
    rawParams.hotelId ||
    rawParams.hotel?.id ||
    rawParams.id ||
    rawParams.hotel_id ||
    'hotel-dubai-movenpick-creek';

  // Load live hotel details with dynamic pricing and live room inventory
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoadingLive(true);
      try {
        const prop = await fetchLiveHotelDetails(hotelId, {
          destination: 'all',
          checkInDate,
          checkOutDate,
          adults: guestsCount,
          children: 0,
          rooms: 1,
        });

        if (isMounted && prop) {
          setLiveProperty(prop);
          if (prop.rooms && prop.rooms.length > 0) {
            setSelectedRoomId(prev => prev || prop.rooms[0].id);
          }
        }
      } catch (err) {
        console.warn('[HotelDetails] Live fetch error:', err);
      } finally {
        if (isMounted) setIsLoadingLive(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [hotelId, checkInDate, checkOutDate, guestsCount]);

  // Real-time Firestore doc listener for Admin updates
  const [liveDoc, setLiveDoc] = useState<any>(null);
  useEffect(() => {
    if (!hotelId) return;
    try {
      const unsub = firestore().collection('hotels').doc(hotelId).onSnapshot(
        docSnap => {
          if (docSnap && docSnap.exists()) {
            setLiveDoc(docSnap.data());
          }
        },
        () => {}
      );
      return () => unsub();
    } catch {}
  }, [hotelId]);

  // Lookup in CURATED_LUXURY_HOTELS by ID or by name matching
  const curatedHotel = useMemo(() => {
    const rawId = (hotelId || '').toLowerCase();
    const rawName = (rawParams.hotelName || rawParams.hotel?.name || '').toLowerCase();
    return (
      CURATED_LUXURY_HOTELS.find(h => h.id.toLowerCase() === rawId) ||
      CURATED_LUXURY_HOTELS.find(h =>
        (rawName && h.name.toLowerCase().includes(rawName)) ||
        (rawName && rawName.includes(h.name.toLowerCase()))
      ) ||
      (rawId.includes('movenpick')
        ? CURATED_LUXURY_HOTELS.find(h => h.id === 'hotel-dubai-movenpick-creek')
        : rawId.includes('radisson')
        ? CURATED_LUXURY_HOTELS.find(h => h.id === 'hotel-dubai-radisson-deira')
        : rawId.includes('sunrise')
        ? CURATED_LUXURY_HOTELS.find(h => h.id === 'hotel-sharm-sunrise-diamond')
        : rawId.includes('mena') || rawId.includes('marriott')
        ? CURATED_LUXURY_HOTELS.find(h => h.id === 'hotel-giza-menahouse')
        : rawId.includes('ritz') || rawId === 'f6'
        ? CURATED_LUXURY_HOTELS.find(h => h.id === 'hotel-cairo-ritz')
        : rawId.includes('burj') || rawId === 'f2'
        ? CURATED_LUXURY_HOTELS.find(h => h.id === 'hotel-dubai-burjalarab')
        : rawId.includes('address') || rawId.includes('apt') || rawId === 'f3'
        ? CURATED_LUXURY_HOTELS.find(h => h.id === 'apt-address-downtown-1')
        : null)
    );
  }, [hotelId, rawParams.hotelName, rawParams.hotel?.name]);

  const hotelName =
    rawParams.hotelName ||
    rawParams.hotel?.name ||
    rawParams.name ||
    liveDoc?.propertyName ||
    liveDoc?.name ||
    curatedHotel?.name ||
    liveProperty?.name ||
    'Mövenpick Dubai Creek';

  const hotelLocation =
    rawParams.location ||
    rawParams.hotel?.location ||
    liveDoc?.cityDestination ||
    liveDoc?.subtitle ||
    curatedHotel?.subtitle ||
    (liveProperty ? `${liveProperty.city}, ${liveProperty.country}` : 'Dubai, UAE');

  const hotelPrice =
    rawParams.price ||
    (rawParams.hotel?.price ? `$${rawParams.hotel.price}` : null) ||
    (curatedHotel?.price ? (curatedHotel.price.includes('/nt') ? curatedHotel.price : `${curatedHotel.price}/nt`) : null) ||
    (liveProperty?.lowestPricePerNight ? `$${liveProperty.lowestPricePerNight}` : null) ||
    (typeof liveDoc?.nightlyRate === 'number' ? `$${liveDoc.nightlyRate}` : null) ||
    'EGP 5,751';

  const hotelRating =
    typeof rawParams.rating === 'number'
      ? rawParams.rating
      : typeof rawParams.hotel?.rating === 'number'
      ? rawParams.hotel.rating
      : (curatedHotel?.rating ||
        liveProperty?.guestRating ||
        (typeof liveDoc?.rating === 'number' ? liveDoc.rating : 9.3));

  const photosList: string[] = useMemo(() => {
    // 1. Direct authentic photo bank resolver
    const directBank = resolveAuthenticHotelBank(hotelId, hotelName);
    if (directBank.length > 0) {
      return directBank;
    }

    // 2. Curated luxury hotel photos from master catalog
    if (curatedHotel?.images && Array.isArray(curatedHotel.images) && curatedHotel.images.length > 0) {
      const clean = sanitizePhotoList(curatedHotel.images);
      if (clean.length > 0) return clean;
    }

    // 3. Explicit images from route params (guarantee no Unsplash)
    const rawImages = rawParams.images || (rawParams.hotel?.images ? rawParams.hotel.images : null);
    if (Array.isArray(rawImages) && rawImages.length > 0) {
      const clean = sanitizePhotoList(rawImages);
      if (clean.length > 0) return clean;
    }

    // 4. Real-time Firestore document images if authentic
    if (liveDoc?.images && Array.isArray(liveDoc.images) && liveDoc.images.length > 0) {
      const clean = sanitizePhotoList(liveDoc.images);
      if (clean.length > 0) return clean;
    }

    // 5. Live property images from Amadeus
    if (liveProperty?.images && liveProperty.images.length > 0) {
      const clean = sanitizePhotoList(liveProperty.images);
      if (clean.length > 0) return clean;
    }

    // 6. Single cover image from params if authentic
    const singleCover = rawParams.image || rawParams.hotel?.imageUrl;
    if (singleCover && !isUnsplashOrGeneric(singleCover)) {
      return [singleCover];
    }

    if (curatedHotel?.image && !isUnsplashOrGeneric(curatedHotel.image)) {
      return [curatedHotel.image];
    }

    return [];
  }, [hotelId, hotelName, curatedHotel, rawParams, liveDoc, liveProperty]);

  // Guaranteed categorized luxury photos per hotel across all countries
  const gallery = useMemo(() => {
    return getHotelGallery(hotelId, hotelName, hotelLocation, photosList);
  }, [hotelId, hotelName, hotelLocation, photosList]);

  const activePhoto =
    gallery.all[selectedPhotoIndex]?.url ??
    photosList[selectedPhotoIndex] ??
    photosList[0] ??
    curatedHotel?.image ??
    '';

  const descriptionText =
    liveDoc?.description ||
    curatedHotel?.description ||
    liveProperty?.description ||
    rawParams.description ||
    rawParams.hotel?.description ||
    `Luxurious Accommodations The ${hotelName} offers a wide variety of rooms, including the exclusive Family Suite concept, providing separate spaces for parents and children. All guest rooms are equipped with modern amenities for a comfortable stay. Gourmet Dining Options Indulge in a culinary journey at the hotel's 5 à-la-carte restaurants, open buffet restaurant, and various bars. From beachside dining at the Oriental Restaurant to Italian and international cuisine, there's something to satisfy every palate. Relaxation and Recreation Unwind at the spa, stay active at the fitness center, or explore private swimming pools, aqua retreats, and bespoke concierge experiences. Book now for an unforgettable stay at ${hotelName} and experience the pinnacle of luxury and hospitality.`;

  const hotelCoordinates = useMemo(() => {
    const rawId = (hotelId || '').toLowerCase();
    const rawName = (hotelName || '').toLowerCase();
    const rawLoc = (hotelLocation || '').toLowerCase();

    if (rawId.includes('movenpick') || rawName.includes('movenpick')) {
      return { latitude: 25.2638, longitude: 55.3093 };
    }
    if (rawId.includes('radisson') || rawName.includes('radisson')) {
      return { latitude: 25.2655, longitude: 55.3115 };
    }
    if (rawId.includes('sunrise') || rawName.includes('sunrise') || rawLoc.includes('sharm')) {
      return { latitude: 27.8686, longitude: 34.3098 };
    }
    if (rawId.includes('burj') || rawName.includes('burj al arab')) {
      return { latitude: 25.1412, longitude: 55.1852 };
    }
    if (rawId.includes('atlantis')) {
      return { latitude: 25.1384, longitude: 55.1278 };
    }
    if (rawLoc.includes('cairo') || rawName.includes('ritz') || rawId.includes('nile')) {
      return { latitude: 30.0469, longitude: 31.2336 };
    }
    if (rawLoc.includes('giza') || rawName.includes('mena')) {
      return { latitude: 29.9861, longitude: 31.1342 };
    }
    if (rawLoc.includes('paris') || rawName.includes('crillon')) {
      return { latitude: 48.8674, longitude: 2.3218 };
    }
    if (rawLoc.includes('london') || rawName.includes('ritz london')) {
      return { latitude: 51.5071, longitude: -0.1416 };
    }
    if (rawLoc.includes('santorini') || rawName.includes('canaves') || rawName.includes('grace')) {
      return { latitude: 36.4623, longitude: 25.3753 };
    }
    if (rawLoc.includes('istanbul') || rawName.includes('ciragan')) {
      return { latitude: 41.0428, longitude: 29.0163 };
    }
    return { latitude: 25.2638, longitude: 55.3093 };
  }, [hotelId, hotelName, hotelLocation]);

  const ratingWord = useMemo(() => {
    if (hotelRating >= 9.0) return 'Wonderful';
    if (hotelRating >= 8.0) return 'Excellent';
    return 'Very Good';
  }, [hotelRating]);

  const reviewCount = useMemo(() => {
    if (hotelRating >= 9.5) return '10,435';
    if (hotelRating >= 9.0) return '8,515';
    if (hotelRating >= 8.5) return '7,853';
    return '6,420';
  }, [hotelRating]);

  const handleShare = async () => {
    try {
      await Share.share({
        title: hotelName,
        message: `${hotelName}\n${hotelLocation}\nVerified 5-Star Hotel on Vanir.\nhttps://vanir.app/hotel/${hotelId}`,
      });
    } catch {}
  };

  // Live rooms from API
  const roomsList = useMemo(() => {
    if (liveProperty?.rooms && liveProperty.rooms.length > 0) {
      return liveProperty.rooms;
    }
    return [
      {
        id: 'r1',
        roomTypeId: 'deluxe_suite',
        title: 'Superior Palm View King Suite',
        subtitle: 'King Bed • 65 m² • Private Balcony & Sea View',
        bedType: '1 Imperial King Bed',
        areaM2: 65,
        maxOccupancy: 3,
        inventoryCount: 3,
        basePricePerNight: 850,
        dynamicPricePerNight: 850,
        totalPrice: 3400,
        taxesAndFees: 170,
        currency: 'USD',
        status: 'available' as const,
        cancellationPolicy: {
          type: 'Free Cancellation' as const,
          deadlineDate: 'Nov 18, 2026',
          description: 'Free cancellation until 48 hours before check-in. 100% refundable.',
        },
        mealPlan: 'Breakfast & VIP Butler Included',
        privileges: ['Private check-in', 'Complimentary minibar', 'Aromatherapy turndown'],
        amenities: [
          { id: '1', label: 'Wi-Fi 6', iconName: 'wifi' as const },
          { id: '2', label: 'Infinity Pool', iconName: 'pool' as const },
          { id: '3', label: 'Royal Spa', iconName: 'spa' as const },
          { id: '4', label: '24/7 Butler', iconName: 'butler' as const },
        ],
        images: photosList,
      },
    ];
  }, [liveProperty, photosList]);

  const selectedRoomObj = useMemo(() => {
    return roomsList.find(r => r.id === selectedRoomId) || roomsList[0];
  }, [roomsList, selectedRoomId]);

  // Open Room Details Drawer
  const handleOpenRoomDrawer = (room: LiveRoomOffer) => {
    setDrawerRoom(room);
    setIsRoomDrawerOpen(true);
  };

  // Hold & Book Handler
  const handleHoldAndBookRoom = async (room: LiveRoomOffer) => {
    setIsRoomDrawerOpen(false);
    const dynamicTotal =
      room.dynamicPricePerNight * computedNights + (room.taxesAndFees || 0);
    const finalPrice = room.totalPrice || dynamicTotal;

    const baseParams = {
      type: 'hotel' as const,
      id: hotelId,
      itemName: `${hotelName} - ${room.title}`,
      price: finalPrice,
      startDate: checkInDate,
      endDate: checkOutDate,
      nights: computedNights,
      guestsCount,
      roomTitle: room.title,
      roomType: room.title,
      hotelName,
      destination: hotelLocation,
    };

    try {
      const hold = await createRoomHold(
        hotelId,
        room.id,
        room.title,
        hotelName,
        finalPrice,
        room.currency,
      );

      navigation.navigate('Booking', {
        ...baseParams,
        holdId: hold.holdId,
        holdExpiresAt: hold.expiresAt,
      } as any);
    } catch {
      navigation.navigate('Booking', baseParams as any);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 + insets.bottom }}
      >
        {/* Top Hero Image Area */}
        <View style={styles.heroWrapper}>
          <Pressable
            style={{ width: '100%', height: '100%' }}
            onPress={() => setIsGalleryModalVisible(true)}
            accessibilityLabel="Tap to open full photo gallery"
          >
            <Image source={{ uri: activePhoto }} style={styles.heroImage} resizeMode="cover" />
          </Pressable>

          {/* Top Floating Controls */}
          <View style={[styles.heroHeader, { paddingTop: Math.max(insets.top, 16) }]}>
            <LuxuryPressable
              style={styles.circleBtn}
              onPress={() => navigation.goBack()}
              accessibilityLabel="Back"
            >
              <ChevronLeft color="#1C1917" size={22} strokeWidth={2.4} />
            </LuxuryPressable>

            <View style={{ flex: 1 }} />

            <View style={styles.topRightActions}>
              <LuxuryPressable
                style={styles.circleBtn}
                onPress={handleShare}
                accessibilityLabel="Share Hotel"
              >
                <Share2 color="#1C1917" size={18} strokeWidth={2.2} />
              </LuxuryPressable>

              <LuxuryPressable
                style={styles.circleBtn}
                onPress={() => setIsFavorite(prev => !prev)}
                accessibilityLabel="Favorite Hotel"
              >
                <Heart
                  color={isFavorite ? '#EF4444' : '#1C1917'}
                  fill={isFavorite ? '#EF4444' : 'transparent'}
                  size={18}
                  strokeWidth={2}
                />
              </LuxuryPressable>
            </View>
          </View>

          {/* Floating Left and Right Navigation Arrows */}
          {gallery.all.length > 1 && (
            <>
              <LuxuryPressable
                style={styles.heroArrowLeft}
                onPress={() => setSelectedPhotoIndex(prev => (prev === 0 ? gallery.all.length - 1 : prev - 1))}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityLabel="Previous Hotel Photo"
              >
                <ChevronLeft color="#FFFFFF" size={20} strokeWidth={2.6} />
              </LuxuryPressable>

              <LuxuryPressable
                style={styles.heroArrowRight}
                onPress={() => setSelectedPhotoIndex(prev => (prev + 1) % gallery.all.length)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityLabel="Next Hotel Photo"
              >
                <ChevronRight color="#FFFFFF" size={20} strokeWidth={2.6} />
              </LuxuryPressable>
            </>
          )}

          {/* Floating Bottom Left: Photo Counter Badge (e.g. 1/58 or 1/176) */}
          <View style={styles.floatingCounterBadge}>
            <Text style={styles.floatingCounterText}>
              {selectedPhotoIndex + 1}/{gallery.totalCount}
            </Text>
          </View>

          {/* Floating Bottom Right: "View photos" Pill Button */}
          <Pressable
            style={styles.viewPhotosPill}
            onPress={() => setIsGalleryModalVisible(true)}
            accessibilityLabel="View all hotel photos"
          >
            <Text style={styles.viewPhotosPillText}>View photos</Text>
            <ImageIcon color="#1C1917" size={16} strokeWidth={2.2} />
          </Pressable>
        </View>

        {/* Content Sheet (Pure Off-White Canvas) */}
        <View style={styles.content}>
          {/* Hotel Name */}
          <Text style={styles.hotelTitle}>{hotelName}</Text>

          {/* Location row with pin */}
          <View style={styles.locationRow}>
            <MapPin color="#D4AF37" size={15} strokeWidth={2.2} />
            <Text style={styles.locationText}>{hotelLocation}</Text>
          </View>

          {/* 5-star rating */}
          <View style={styles.starsRow}>
            <View style={styles.starsIcons}>
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} color="#F59E0B" fill="#F59E0B" size={13} />
              ))}
            </View>
            <Text style={styles.starsText}>5-star hotel</Text>
          </View>

          {/* Luxury Score Pill (Black with Gold Border) */}
          <View style={styles.luxuryScorePill}>
            <Text style={styles.luxuryScoreVal}>{hotelRating.toFixed(1)}</Text>
            <Text style={styles.luxuryScoreWord}> {ratingWord}</Text>
            <Text style={styles.luxuryScoreDot}> · </Text>
            <Text style={styles.luxuryScoreReviews}>{reviewCount} reviews</Text>
          </View>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* LOCATION & INTERACTIVE MAP SECTION */}
          {/* ───────────────────────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <HotelMapView
              hotelName={hotelName}
              address={hotelLocation}
              latitude={hotelCoordinates.latitude}
              longitude={hotelCoordinates.longitude}
              height={190}
            />
          </View>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* ABOUT THE HOTEL SECTION */}
          {/* ───────────────────────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About the Hotel</Text>
            <Text
              style={styles.aboutParagraph}
              numberOfLines={isAboutExpanded ? undefined : 5}
            >
              {descriptionText}
            </Text>
            <Pressable
              onPress={() => setIsAboutExpanded(prev => !prev)}
              style={styles.showMoreToggleBtn}
            >
              <Text style={styles.showMoreToggleText}>
                {isAboutExpanded ? 'Show less' : 'Show more'}
              </Text>
            </Pressable>
          </View>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* HIGHLIGHTS SECTION */}
          {/* ───────────────────────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Highlights</Text>
            <View style={styles.highlightsWrap}>
              <View style={styles.highlightChip}>
                <Waves color="#D4AF37" size={14} strokeWidth={2} />
                <Text style={styles.highlightChipText}>Swimming Pools & Private Beach</Text>
              </View>
              <View style={styles.highlightChip}>
                <Utensils color="#D4AF37" size={14} strokeWidth={2} />
                <Text style={styles.highlightChipText}>5 Gourmet À-la-carte Dining</Text>
              </View>
              <View style={styles.highlightChip}>
                <Sparkles color="#D4AF37" size={14} strokeWidth={2} />
                <Text style={styles.highlightChipText}>Holistic Wellness Spa & Hammam</Text>
              </View>
              <View style={styles.highlightChip}>
                <Crown color="#D4AF37" size={14} strokeWidth={2} />
                <Text style={styles.highlightChipText}>Royal Presidential Suites</Text>
              </View>
              <View style={styles.highlightChip}>
                <Bell color="#D4AF37" size={14} strokeWidth={2} />
                <Text style={styles.highlightChipText}>24/7 Dedicated Butler Service</Text>
              </View>
            </View>
          </View>

          {/* Amenities & VIP Services */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hotel Amenities & VIP Services</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.amenitiesScroll}>
              {AMENITIES.map(amenity => {
                const IconComponent = amenity.icon;
                return (
                  <View key={amenity.id} style={styles.amenityItem}>
                    <View style={styles.amenityIconFrame}>
                      <IconComponent color="#1C1917" size={20} strokeWidth={1.5} />
                    </View>
                    <Text style={styles.amenityLabel}>{amenity.label}</Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* STAY DATES & GUESTS INTERACTIVE SELECTOR */}
          {/* ───────────────────────────────────────────────────────────── */}
          <View style={styles.section}>
            <View style={styles.roomSectionHeader}>
              <Text style={styles.sectionTitle}>Stay Dates & Guests</Text>
              <Text style={[styles.roomSectionHint, { color: '#D4AF37', fontWeight: '800' }]}>
                {computedNights} Night{computedNights > 1 ? 's' : ''} • {guestsCount} Guest{guestsCount > 1 ? 's' : ''}
              </Text>
            </View>

            <View style={[styles.descriptionCard, { gap: 12 }]}>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Pressable
                  style={{
                    flex: 1,
                    backgroundColor: '#FAF9F6',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: 'rgba(212,175,55,0.35)',
                    padding: 10,
                    gap: 4,
                  }}
                  onPress={() => setShowCheckInPicker(true)}
                >
                  <Text style={{ fontSize: 10, fontWeight: '800', color: '#64748B', letterSpacing: 0.5 }}>
                    CHECK-IN DATE
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Calendar color="#D4AF37" size={14} strokeWidth={2} />
                    <Text style={{ fontSize: 13, fontWeight: '800', color: '#1C1917' }}>{checkInDate}</Text>
                  </View>
                </Pressable>

                <Pressable
                  style={{
                    flex: 1,
                    backgroundColor: '#FAF9F6',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: 'rgba(212,175,55,0.35)',
                    padding: 10,
                    gap: 4,
                  }}
                  onPress={() => setShowCheckOutPicker(true)}
                >
                  <Text style={{ fontSize: 10, fontWeight: '800', color: '#64748B', letterSpacing: 0.5 }}>
                    CHECK-OUT DATE
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Calendar color="#D4AF37" size={14} strokeWidth={2} />
                    <Text style={{ fontSize: 13, fontWeight: '800', color: '#1C1917' }}>{checkOutDate}</Text>
                  </View>
                </Pressable>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 6,
                  borderTopWidth: 1,
                  borderTopColor: 'rgba(212,175,55,0.18)',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Users color="#D4AF37" size={16} strokeWidth={2} />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#1C1917' }}>VIP Guests</Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Pressable
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      backgroundColor: '#FAF9F6',
                      borderWidth: 1,
                      borderColor: '#D4AF37',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onPress={() => setGuestsCount(g => Math.max(1, g - 1))}
                  >
                    <Text style={{ fontSize: 16, fontWeight: '800', color: '#1C1917' }}>−</Text>
                  </Pressable>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: '#1C1917', minWidth: 18, textAlign: 'center' }}>
                    {guestsCount}
                  </Text>
                  <Pressable
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      backgroundColor: '#FAF9F6',
                      borderWidth: 1,
                      borderColor: '#D4AF37',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onPress={() => setGuestsCount(g => Math.min(12, g + 1))}
                  >
                    <Text style={{ fontSize: 16, fontWeight: '800', color: '#1C1917' }}>+</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* SELECT YOUR SUITE (Live Dynamic Rooms from API) */}
          {/* ───────────────────────────────────────────────────────────── */}
          <View style={styles.section}>
            <View style={styles.roomSectionHeader}>
              <Text style={styles.sectionTitle}>Select Your Suite</Text>
              <Text style={styles.roomSectionHint}>Tap any suite to inspect live amenities drawer</Text>
            </View>

            <View style={styles.roomsList}>
              {roomsList.map(room => {
                const isSelected = selectedRoomId === room.id;
                return (
                  <LuxuryPressable
                    key={room.id}
                    style={[styles.roomCard, isSelected && styles.roomCardSelected]}
                    onPress={() => {
                      setSelectedRoomId(room.id);
                      handleOpenRoomDrawer(room);
                    }}
                  >
                    <View style={styles.roomHeaderRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.roomTitle}>{room.title}</Text>
                        <Text style={styles.roomDesc}>{room.subtitle}</Text>
                      </View>

                      {/* Remaining Inventory Counter */}
                      <View style={styles.roomInventoryBadge}>
                        <AlertCircle color="#D4AF37" size={11} strokeWidth={2} />
                        <Text style={styles.roomInventoryText}>
                          {room.inventoryCount} left
                        </Text>
                      </View>
                    </View>

                    {/* Cancellation & Meal Row */}
                    <View style={styles.cancellationTagRow}>
                      <ShieldCheck color="#16A34A" size={13} strokeWidth={2} />
                      <Text style={styles.cancellationTagText}>
                        {room.cancellationPolicy.type} • {room.mealPlan}
                      </Text>
                    </View>

                    <View style={styles.roomFooter}>
                      <View style={styles.inspectDrawerPill}>
                        <Text style={styles.inspectDrawerText}>VIP Drawer</Text>
                        <ChevronRight color="#1C1917" size={13} strokeWidth={2.4} />
                      </View>

                      <Text style={styles.roomPrice}>
                        ${room.dynamicPricePerNight}
                        <Text style={styles.roomPriceUnit}>/night</Text>
                      </Text>
                    </View>
                  </LuxuryPressable>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions (Luxury Black & Animated Gold Border) */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <AnimatedGoldButton
          title={`${hotelPrice} — View rates`}
          onPress={() => {
            if (selectedRoomObj) {
              handleOpenRoomDrawer(selectedRoomObj);
            }
          }}
          accessibilityLabel="View Hotel Rates"
        />
      </View>

      {/* Full-Screen Categorized 40+ to 60+ Photo Gallery Modal */}
      <HotelPhotoGalleryModal
        visible={isGalleryModalVisible}
        gallery={gallery}
        initialIndex={selectedPhotoIndex}
        onClose={() => setIsGalleryModalVisible(false)}
      />

      {/* Room Details VIP Slide-Up Drawer */}
      <HotelRoomDrawer
        isOpen={isRoomDrawerOpen}
        onClose={() => setIsRoomDrawerOpen(false)}
        room={drawerRoom}
        hotelName={hotelName}
        hotelCity={hotelLocation}
        nights={computedNights}
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
        onHoldAndBook={handleHoldAndBookRoom}
      />

      <VipDatePickerModal
        visible={showCheckInPicker}
        initialDate={checkInDate}
        title="Select Check-In Date"
        onClose={() => setShowCheckInPicker(false)}
        onSelectDate={selected => {
          setCheckInDate(selected);
          if (selected >= checkOutDate) {
            const m = selected.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
            if (m) {
              const dt = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + 2);
              setCheckOutDate(
                `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`,
              );
            }
          }
        }}
      />

      <VipDatePickerModal
        visible={showCheckOutPicker}
        initialDate={checkOutDate}
        title="Select Check-Out Date"
        onClose={() => setShowCheckOutPicker(false)}
        onSelectDate={selected => {
          if (selected <= checkInDate) {
            const m = checkInDate.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
            if (m) {
              const dt = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + 1);
              setCheckOutDate(
                `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`,
              );
            }
          } else {
            setCheckOutDate(selected);
          }
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
    position: 'relative',
    height: 380,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  topBrandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  topBrandText: {
    color: '#D4AF37',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroArrowLeft: {
    position: 'absolute',
    left: 14,
    top: '46%',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
    zIndex: 20,
  },
  heroArrowRight: {
    position: 'absolute',
    right: 14,
    top: '46%',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
    zIndex: 20,
  },
  thumbnailsRow: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  thumbnail: {
    flex: 1,
    height: 58,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  thumbnailActive: {
    borderColor: '#D4AF37',
    transform: [{ scale: 1.04 }],
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
  },
  activeCheck: {
    position: 'absolute',
    top: 3,
    right: 3,
    backgroundColor: '#D4AF37',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Content Canvas (Off-White)
  content: {
    backgroundColor: '#FAF9F6',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -18,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.3)',
    paddingTop: 24,
    gap: 20,
  },
  titlePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  titleCol: {
    flex: 1,
    gap: 6,
  },
  hotelTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1C1917',
    lineHeight: 28,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  priceCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#D4AF37',
  },
  priceUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  luxuryRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  luxuryRatingScore: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1917',
  },
  luxuryRatingDivider: {
    fontSize: 12,
    color: '#CBD5E1',
  },
  luxuryRatingLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 0.8,
  },
  liveEngineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    gap: 8,
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  liveEngineText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.5,
    flex: 1,
  },
  galleryCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  galleryIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryCalloutText: {
    flex: 1,
    gap: 2,
  },
  galleryCalloutTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1C1917',
  },
  galleryCalloutSub: {
    fontSize: 11,
    color: '#64748B',
  },
  section: {
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.4,
  },
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    gap: 14,
  },
  descriptionParagraph: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
  },
  highlightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  highlightPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  highlightText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1C1917',
  },
  amenitiesScroll: {
    gap: 10,
  },
  amenityItem: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
    minWidth: 100,
  },
  amenityIconFrame: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amenityLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1C1917',
    textAlign: 'center',
  },
  roomSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  roomSectionHint: {
    fontSize: 10.5,
    color: '#64748B',
  },
  roomsList: {
    gap: 12,
  },
  roomCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    padding: 16,
    gap: 10,
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  roomCardSelected: {
    borderColor: '#D4AF37',
    borderWidth: 1.5,
    backgroundColor: '#FFFDF7',
  },
  roomHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  roomTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1917',
  },
  roomDesc: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  roomInventoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  roomInventoryText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#1C1917',
  },
  cancellationTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cancellationTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16A34A',
  },
  roomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.15)',
  },
  inspectDrawerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  inspectDrawerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1C1917',
  },
  roomPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: '#D4AF37',
  },
  roomPriceUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  // Sticky Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomRatesCtaBtn: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  bottomRatesCtaText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  floatingCounterBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(28, 25, 23, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  floatingCounterText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  viewPhotosPill: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  viewPhotosPillText: {
    color: '#1C1917',
    fontSize: 13,
    fontWeight: '700',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  starsIcons: {
    flexDirection: 'row',
    gap: 2,
  },
  starsText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  luxuryScorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#0A0A0A',
    borderWidth: 1.2,
    borderColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 2,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  luxuryScoreVal: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#D4AF37',
  },
  luxuryScoreWord: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  luxuryScoreDot: {
    fontSize: 13,
    color: 'rgba(212, 175, 55, 0.7)',
  },
  luxuryScoreReviews: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  aboutParagraph: {
    fontSize: 13.5,
    color: '#475569',
    lineHeight: 22,
  },
  showMoreToggleBtn: {
    marginTop: 6,
  },
  showMoreToggleText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#D4AF37',
  },
  highlightsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  highlightChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  highlightChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1917',
  },
  bottomPriceCol: {
    minWidth: 100,
  },
  bottomPriceLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  bottomPriceVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#D4AF37',
  },
  bottomPriceUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  bookNowBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#D4AF37',
    borderRadius: 14,
    paddingVertical: 14,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bookNowBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.3,
  },
});
