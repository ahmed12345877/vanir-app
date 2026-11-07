import React, { useState, useMemo, useEffect, useCallback } from 'react';
import firestore from '@react-native-firebase/firestore';
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
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
import { LuxuryPressable } from '../../components/LuxuryMicroInteractions';
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

const DEFAULT_FALLBACK_PHOTOS = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&q=80',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1000&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1000&q=80',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1000&q=80',
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

  const hotelId = route.params?.hotelId || 'c-nile-ritz';

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
    const rawName = (route.params?.hotelName || '').toLowerCase();
    return (
      CURATED_LUXURY_HOTELS.find(h => h.id.toLowerCase() === rawId) ||
      CURATED_LUXURY_HOTELS.find(h =>
        (rawName && h.name.toLowerCase().includes(rawName)) ||
        (rawName && rawName.includes(h.name.toLowerCase()))
      ) ||
      (rawId.includes('mena') || rawId.includes('marriott')
        ? CURATED_LUXURY_HOTELS.find(h => h.id === 'hotel-giza-menahouse')
        : (rawId.includes('ritz') || rawId === 'f6')
        ? CURATED_LUXURY_HOTELS.find(h => h.id === 'hotel-cairo-ritz')
        : (rawId.includes('burj') || rawId === 'f2')
        ? CURATED_LUXURY_HOTELS.find(h => h.id === 'hotel-dubai-burjalarab')
        : (rawId.includes('address') || rawId.includes('apt') || rawId === 'f3')
        ? CURATED_LUXURY_HOTELS.find(h => h.id === 'apt-address-downtown-1')
        : null)
    );
  }, [hotelId, route.params?.hotelName]);

  const hotelName =
    route.params?.hotelName ||
    liveDoc?.propertyName ||
    liveDoc?.name ||
    curatedHotel?.name ||
    liveProperty?.name ||
    'The Nile Ritz-Carlton, Cairo';

  const hotelLocation =
    route.params?.location ||
    liveDoc?.cityDestination ||
    liveDoc?.subtitle ||
    curatedHotel?.subtitle ||
    (liveProperty ? `${liveProperty.city}, ${liveProperty.country}` : 'Cairo, Egypt');

  const hotelPrice =
    route.params?.price ||
    (curatedHotel?.price
      ? `${curatedHotel.price}/nt`
      : liveProperty?.lowestPricePerNight
      ? `$${liveProperty.lowestPricePerNight}`
      : typeof liveDoc?.nightlyRate === 'number'
      ? `$${liveDoc.nightlyRate}`
      : '$850');

  const hotelRating =
    typeof route.params?.rating === 'number'
      ? route.params.rating
      : (curatedHotel?.rating ||
        liveProperty?.guestRating ||
        (typeof liveDoc?.rating === 'number' ? liveDoc.rating : 4.98));

  const photosList: string[] = useMemo(() => {
    // 1. If explicit images array was provided for this specific hotel, use it first
    if (route.params?.images && Array.isArray(route.params.images) && route.params.images.length > 0) {
      return route.params.images.filter(Boolean);
    }
    // 2. Curated luxury hotel photos from master catalog (Marriott, Nile Ritz, Burj Al Arab, etc.)
    if (curatedHotel?.images && Array.isArray(curatedHotel.images) && curatedHotel.images.length > 0) {
      return curatedHotel.images;
    }
    // 3. Real-time Firestore document images if present
    if (liveDoc?.images && Array.isArray(liveDoc.images) && liveDoc.images.length > 0) {
      const list = liveDoc.images.map((img: any) => (typeof img === 'string' ? img : img?.url || '')).filter(Boolean);
      if (list.length > 0) return list;
    }
    // 4. Live property images from Amadeus if available
    if (liveProperty?.images && liveProperty.images.length > 0) {
      return liveProperty.images;
    }
    // 5. Single cover image from params
    if (route.params?.image) {
      return [route.params.image, ...DEFAULT_FALLBACK_PHOTOS.slice(1)];
    }
    return DEFAULT_FALLBACK_PHOTOS;
  }, [route.params?.images, route.params?.image, curatedHotel?.images, liveDoc?.images, liveProperty?.images]);

  const activePhoto = photosList[selectedPhotoIndex] ?? photosList[0] ?? DEFAULT_FALLBACK_PHOTOS[0];

  const descriptionText =
    liveDoc?.description ||
    curatedHotel?.description ||
    liveProperty?.description ||
    route.params?.description ||
    'Immerse in unparalleled luxury, panoramic city views, and dedicated butler service designed for royal dignitaries and discerning international travelers.';

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
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 + insets.bottom }}
      >
        {/* Top Hero Image Area */}
        <View style={styles.heroWrapper}>
          <Image source={{ uri: activePhoto }} style={styles.heroImage} resizeMode="cover" />

          {/* Top Floating Controls */}
          <View style={[styles.heroHeader, { paddingTop: Math.max(insets.top, 16) }]}>
            <LuxuryPressable style={styles.circleBtn} onPress={() => navigation.goBack()}>
              <ChevronLeft color="#1C1917" size={22} strokeWidth={2.4} />
            </LuxuryPressable>

            <View style={styles.topBrandPill}>
              <Sparkles color="#D4AF37" size={13} strokeWidth={2} />
              <Text style={styles.topBrandText}>VANIR ROYAL SELECTION</Text>
            </View>

            <LuxuryPressable
              style={styles.circleBtn}
              onPress={() => setIsFavorite(prev => !prev)}
            >
              <Heart
                color={isFavorite ? '#EF4444' : '#1C1917'}
                fill={isFavorite ? '#EF4444' : 'transparent'}
                size={18}
                strokeWidth={2}
              />
            </LuxuryPressable>
          </View>

          {/* Floating Left and Right Navigation Arrows */}
          {photosList.length > 1 && (
            <>
              <LuxuryPressable
                style={styles.heroArrowLeft}
                onPress={() => setSelectedPhotoIndex(prev => (prev === 0 ? photosList.length - 1 : prev - 1))}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityLabel="Previous Hotel Photo"
              >
                <ChevronLeft color="#1C1917" size={20} strokeWidth={2.6} />
              </LuxuryPressable>

              <LuxuryPressable
                style={styles.heroArrowRight}
                onPress={() => setSelectedPhotoIndex(prev => (prev + 1) % photosList.length)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityLabel="Next Hotel Photo"
              >
                <ChevronRight color="#1C1917" size={20} strokeWidth={2.6} />
              </LuxuryPressable>
            </>
          )}

          {/* 4 Thumbnails Carousel Overlay */}
          <View style={styles.thumbnailsRow}>
            {photosList.slice(0, 4).map((photoUrl, idx) => {
              const isSelected = selectedPhotoIndex === idx;
              return (
                <Pressable
                  key={idx}
                  onPress={() => setSelectedPhotoIndex(idx)}
                  style={[styles.thumbnail, isSelected && styles.thumbnailActive]}
                >
                  <Image source={{ uri: photoUrl }} style={styles.thumbnailImg} resizeMode="cover" />
                  {isSelected && (
                    <View style={styles.activeCheck}>
                      <Check color="#1C1917" size={10} strokeWidth={3} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Content Sheet (Pure Off-White Canvas) */}
        <View style={styles.content}>
          {/* Title and Price */}
          <View style={styles.titlePriceRow}>
            <View style={styles.titleCol}>
              <Text style={styles.hotelTitle}>{hotelName}</Text>
              <View style={styles.locationRow}>
                <MapPin color="#D4AF37" size={15} strokeWidth={2} />
                <Text style={styles.locationText}>{hotelLocation}</Text>
              </View>
            </View>

            <View style={styles.priceCol}>
              <Text style={styles.priceValue}>
                {hotelPrice}<Text style={styles.priceUnit}>/night</Text>
              </Text>
              <View style={styles.luxuryRatingRow}>
                <Star color="#D4AF37" fill="#D4AF37" size={13} strokeWidth={1.8} />
                <Text style={styles.luxuryRatingScore}>{hotelRating.toFixed(2)}</Text>
                <Text style={styles.luxuryRatingDivider}>•</Text>
                <Text style={styles.luxuryRatingLabel}>VERIFIED 5★</Text>
              </View>
            </View>
          </View>

          {/* Live Amadeus Real-Time Availability Banner */}
          <View style={styles.liveEngineBanner}>
            <View style={styles.livePulseDot} />
            <Text style={styles.liveEngineText}>
              AMADEUS LIVE • EXACT ROOM INVENTORY & CANCELLATION POLICIES ACTIVE
            </Text>
          </View>

          {/* 4-Photo Gallery Callout Banner */}
          <Pressable
            style={styles.galleryCallout}
            onPress={() => setSelectedPhotoIndex(prev => (prev + 1) % photosList.length)}
          >
            <View style={styles.galleryIconBox}>
              <ImageIcon color="#D4AF37" size={18} strokeWidth={1.8} />
            </View>
            <View style={styles.galleryCalloutText}>
              <Text style={styles.galleryCalloutTitle}>High-Definition 4-Photo Curated Gallery</Text>
              <Text style={styles.galleryCalloutSub}>
                Viewing: {PHOTO_LABELS[selectedPhotoIndex] ?? 'Photo ' + (selectedPhotoIndex + 1)} (Tap to cycle)
              </Text>
            </View>
            <ChevronRight color="#1C1917" size={18} strokeWidth={2} />
          </Pressable>

          {/* About This Luxury Property */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Building color="#D4AF37" size={18} strokeWidth={2} />
              <Text style={styles.sectionTitle}>About This Luxury Property</Text>
            </View>
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionParagraph}>{descriptionText}</Text>

              {/* Luxury Highlights Grid */}
              <View style={styles.highlightsGrid}>
                <View style={styles.highlightPill}>
                  <Crown color="#D4AF37" size={13} strokeWidth={2} />
                  <Text style={styles.highlightText}>Royal Presidential Suites</Text>
                </View>
                <View style={styles.highlightPill}>
                  <Compass color="#D4AF37" size={13} strokeWidth={2} />
                  <Text style={styles.highlightText}>Prime City Panorama</Text>
                </View>
                <View style={styles.highlightPill}>
                  <Utensils color="#D4AF37" size={13} strokeWidth={2} />
                  <Text style={styles.highlightText}>Michelin Dining</Text>
                </View>
                <View style={styles.highlightPill}>
                  <Bell color="#D4AF37" size={13} strokeWidth={2} />
                  <Text style={styles.highlightText}>24/7 Dedicated Butler</Text>
                </View>
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

      {/* Sticky Bottom Actions */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.bottomPriceCol}>
          <Text style={styles.bottomPriceLabel}>
            TOTAL ({computedNights} NIGHT{computedNights > 1 ? 'S' : ''})
          </Text>
          <Text style={styles.bottomPriceVal}>
            ${selectedRoomObj.dynamicPricePerNight * computedNights + (selectedRoomObj.taxesAndFees || 0)}
            <Text style={styles.bottomPriceUnit}> incl. tax</Text>
          </Text>
        </View>

        <LuxuryPressable
          style={styles.bookNowBtn}
          onPress={() => handleOpenRoomDrawer(selectedRoomObj)}
        >
          <Clock color="#1C1917" size={16} strokeWidth={2.2} />
          <Text style={styles.bookNowBtnText}>Reserve Suite</Text>
          <ArrowRight color="#1C1917" size={16} strokeWidth={2.4} />
        </LuxuryPressable>
      </View>

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
    borderTopColor: 'rgba(212, 175, 55, 0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    gap: 12,
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
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
