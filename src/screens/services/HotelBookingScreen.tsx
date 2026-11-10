import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Building,
  Star,
  X,
  Check,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Users,
  Plus,
  Minus,
  Clock,
  AlertCircle,
  Eye,
} from 'lucide-react-native';
import {
  searchLiveHotels,
  calculateNights,
  createRoomHold,
  LiveHotelProperty,
  LiveRoomOffer,
  HotelSearchResponse,
} from '../../services/hotelSearchApi';
import { HotelRoomDrawer } from '../../components/HotelRoomDrawer';
import { LuxuryPressable } from '../../components/LuxuryMicroInteractions';
import { formatWesternPrice } from '../../utils/pricingUtils';
import { Flag } from '../../components/Flag';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface DestinationOption {
  id: string;
  name: string;
  country: string;
  flag: string;
  tagline: string;
}

const DESTINATION_OPTIONS: DestinationOption[] = [
  { id: 'all', name: 'All Global Destinations', country: 'Worldwide', flag: '🌐', tagline: '180+ Luxury 5-Star Suites' },
  { id: 'cairo', name: 'Cairo & Nile Corniche', country: 'Egypt', flag: '🇪🇬', tagline: 'Palatial Nile riverfront sanctuaries' },
  { id: 'giza', name: 'Giza & The Pyramids', country: 'Egypt', flag: '🇪🇬', tagline: 'Historic royal vistas of the Pyramids' },
  { id: 'dubai', name: 'Dubai & Palm Jumeirah', country: 'UAE', flag: '🇦🇪', tagline: 'Ultra-luxury modern skyscraper palaces' },
  { id: 'london', name: 'London, Mayfair & Knightsbridge', country: 'United Kingdom', flag: '🇬🇧', tagline: 'Heritage luxury & royal suites' },
  { id: 'paris', name: 'Paris & Place Vendôme', country: 'France', flag: '🇫🇷', tagline: 'Haute couture retreats & Eiffel views' },
  { id: 'istanbul', name: 'Istanbul & Bosphorus Strait', country: 'Turkey', flag: '🇹🇷', tagline: 'Ottoman imperial seaside palaces' },
  { id: 'tokyo', name: 'Tokyo & Ginza District', country: 'Japan', flag: '🇯🇵', tagline: 'Serene contemporary penthouse suites' },
];

const HOTEL_TYPES = ['All Suites', '5-Star Hotels', 'Resorts', 'Villas'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function HotelBookingScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const resultsRef = useRef<View>(null);

  // 1. Destination state
  const [selectedDestination, setSelectedDestination] = useState<DestinationOption>(DESTINATION_OPTIONS[1]); // Default Cairo
  const [showDestModal, setShowDestModal] = useState(false);
  const [destSearchQuery, setDestSearchQuery] = useState('');

  // 2. Date Range state
  const [checkInDate, setCheckInDate] = useState<string>('2026-11-20');
  const [checkOutDate, setCheckOutDate] = useState<string>('2026-11-24');
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarTarget, setCalendarTarget] = useState<'checkIn' | 'checkOut'>('checkIn');
  const [calendarMonth, setCalendarMonth] = useState(new Date(2026, 10, 1)); // November 2026

  // 3. Guests & Rooms state (Advanced Popover Counter)
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [showGuestsModal, setShowGuestsModal] = useState(false);

  // 4. Property Type state
  const [selectedType, setSelectedType] = useState('All Suites');

  // 5. Live API Search State
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [liveResponse, setLiveResponse] = useState<HotelSearchResponse | null>(null);
  const [liveProperties, setLiveProperties] = useState<LiveHotelProperty[]>([]);
  const PAGE_SIZE = 6;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visibleProperties = useMemo(
    () => liveProperties.slice(0, visibleCount),
    [liveProperties, visibleCount]
  );

  // 6. Room Details VIP Drawer State
  const [isRoomDrawerOpen, setIsRoomDrawerOpen] = useState(false);
  const [drawerRoom, setDrawerRoom] = useState<LiveRoomOffer | null>(null);
  const [drawerHotel, setDrawerHotel] = useState<LiveHotelProperty | null>(null);

  // 7. Full-Screen Photo Modal State
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [activePhotoUrl, setActivePhotoUrl] = useState<string>('');
  const [activePhotoHotelName, setActivePhotoHotelName] = useState<string>('');

  const nightsCount = useMemo(() => {
    return calculateNights(checkInDate, checkOutDate);
  }, [checkInDate, checkOutDate]);

  // Execute Live API Fetch
  const searchSeqRef = useRef(0);
  const executeLiveSearch = useCallback(async () => {
    const seq = ++searchSeqRef.current;
    setIsLoadingLive(true);
    try {
      const result = await searchLiveHotels({
        destination: selectedDestination.id === 'all' ? '' : selectedDestination.id,
        checkInDate,
        checkOutDate,
        adults,
        children,
        rooms,
        propertyType: selectedType,
      });
      if (seq !== searchSeqRef.current) return;

      setLiveResponse(result);
      setVisibleCount(PAGE_SIZE);
      setLiveProperties(result.properties || []);
    } catch (err) {
      console.warn('[HotelEngine] Error fetching live hotels:', err);
    } finally {
      if (seq === searchSeqRef.current) setIsLoadingLive(false);
    }
  }, [selectedDestination, checkInDate, checkOutDate, adults, children, rooms, selectedType]);

  // Initial live search on mount
  useEffect(() => {
    executeLiveSearch();
  }, [executeLiveSearch]);

  // Format date helper (e.g. 2026-11-20 -> Nov 20, 2026)
  const formatDateDisplay = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const monthIdx = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const year = parts[0];
        const monthShort = MONTH_NAMES[monthIdx]?.substring(0, 3) || 'Nov';
        return `${monthShort} ${day}, ${year}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Calendar days grid computation
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let d = 1; d <= totalDaysInMonth; d++) {
      days.push(d);
    }
    return days;
  }, [calendarMonth]);

  const handleSelectCalendarDay = (day: number) => {
    const year = calendarMonth.getFullYear();
    const month = String(calendarMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const isoString = `${year}-${month}-${dayStr}`;

    if (calendarTarget === 'checkIn') {
      setCheckInDate(isoString);
      if (new Date(isoString) >= new Date(checkOutDate)) {
        const nextDate = new Date(year, calendarMonth.getMonth(), day + 3);
        const nextY = nextDate.getFullYear();
        const nextM = String(nextDate.getMonth() + 1).padStart(2, '0');
        const nextD = String(nextDate.getDate()).padStart(2, '0');
        setCheckOutDate(`${nextY}-${nextM}-${nextD}`);
      }
      setCalendarTarget('checkOut');
    } else {
      if (new Date(isoString) <= new Date(checkInDate)) {
        Alert.alert('Date Selection', 'Check-out date must be after check-in date.');
        return;
      }
      setCheckOutDate(isoString);
      setShowCalendarModal(false);
    }
  };

  // Apply Quick Date Presets
  const handleApplyPreset = (days: number) => {
    const now = new Date(2026, 10, 20); // 20 Nov 2026
    const y1 = now.getFullYear();
    const m1 = String(now.getMonth() + 1).padStart(2, '0');
    const d1 = String(now.getDate()).padStart(2, '0');
    setCheckInDate(`${y1}-${m1}-${d1}`);

    const out = new Date(2026, 10, 20 + days);
    const y2 = out.getFullYear();
    const m2 = String(out.getMonth() + 1).padStart(2, '0');
    const d2 = String(out.getDate()).padStart(2, '0');
    setCheckOutDate(`${y2}-${m2}-${d2}`);
    setShowCalendarModal(false);
  };

  // Open Room Drawer
  const handleOpenRoomDrawer = (hotel: LiveHotelProperty, room?: LiveRoomOffer) => {
    const chosenRoom = room || hotel.rooms[0];
    setDrawerHotel(hotel);
    setDrawerRoom(chosenRoom);
    setIsRoomDrawerOpen(true);
  };

  // 10-Minute Hold & Proceed to Checkout
  const handleHoldAndBookRoom = async (room: LiveRoomOffer) => {
    if (!drawerHotel) return;
    setIsRoomDrawerOpen(false);

    try {
      // 1. Create 10-minute Room Hold
      const hold = await createRoomHold(
        drawerHotel.id,
        room.id,
        room.title,
        drawerHotel.name,
        room.totalPrice,
        room.currency
      );

      // 2. Navigate to Checkout Screen with Hold details and verified price
      navigation.navigate('Booking', {
        type: 'hotel',
        id: drawerHotel.id,
        itemName: `${drawerHotel.name} - ${room.title}`,
        price: room.totalPrice,
        startDate: checkInDate,
        endDate: checkOutDate,
        guestsCount: adults + children,
        holdId: hold.holdId,
        holdExpiresAt: hold.expiresAt,
        roomTitle: room.title,
        roomType: room.title,
        hotelName: drawerHotel.name,
        destination: `${drawerHotel.city}, ${drawerHotel.country}`,
      } as any);
    } catch {
      navigation.navigate('Booking', {
        type: 'hotel',
        id: drawerHotel.id,
        itemName: `${drawerHotel.name} - ${room.title}`,
        price: room.totalPrice,
        startDate: checkInDate,
        endDate: checkOutDate,
        guestsCount: adults + children,
        roomTitle: room.title,
        roomType: room.title,
        hotelName: drawerHotel.name,
        destination: `${drawerHotel.city}, ${drawerHotel.country}`,
      } as any);
    }
  };

  // Navigate to Hotel Details
  const handleOpenHotelDetails = (hotel: LiveHotelProperty) => {
    (navigation as any).navigate('HotelDetails', {
      hotelId: hotel.id,
      hotelName: hotel.name,
      location: `${hotel.city}, ${hotel.country}`,
      price: `$${hotel.lowestPricePerNight}`,
      image: hotel.heroImage,
      images: hotel.images,
      description: hotel.description,
      rating: hotel.guestRating,
      checkInDate,
      checkOutDate,
      guestsCount: adults + children,
    });
  };

  const handleSearchSubmit = () => {
    executeLiveSearch();
    scrollViewRef.current?.scrollTo({ y: 440, animated: true });
  };

  // Filtered destination options
  const filteredDestinations = useMemo(() => {
    if (!destSearchQuery.trim()) return DESTINATION_OPTIONS;
    const q = destSearchQuery.toLowerCase();
    return DESTINATION_OPTIONS.filter(
      d => d.name.toLowerCase().includes(q) || d.country.toLowerCase().includes(q)
    );
  }, [destSearchQuery]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

      {/* Luxury Off-White Header */}
      <View style={styles.header}>
        <LuxuryPressable
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <ChevronLeft color="#1C1917" size={24} strokeWidth={2} />
        </LuxuryPressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>HOTEL BOOKING ENGINE</Text>
          <Text style={styles.headerSubtitle}>Real-Time 5-Star Suites & Resorts</Text>
        </View>

        <View style={styles.headerRightIconWrapper}>
          <Building color="#D4AF37" size={20} strokeWidth={1.8} />
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={200}
        removeClippedSubviews
        onScroll={e => {
          const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
          if (contentOffset.y + layoutMeasurement.height > contentSize.height - 900) {
            setVisibleCount(c => (c < liveProperties.length ? c + PAGE_SIZE : c));
          }
        }}
        contentContainerStyle={[styles.scroll, { paddingBottom: 60 + insets.bottom }]}
      >
        {/* Real-Time Live API Status Banner */}
        <View style={styles.liveApiStatusBanner}>
          <View style={styles.livePulseDot} />
          <Text style={styles.liveApiStatusText}>
            AMADEUS & EPS API CONNECTED • REAL-TIME RATES & INVENTORY
          </Text>
        </View>

        {/* Property Type Selector Pills */}
        <View style={styles.typeSelectorScrollWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeSelectorScroll}>
            {HOTEL_TYPES.map(type => {
              const isActive = selectedType === type;
              return (
                <LuxuryPressable
                  key={type}
                  style={[styles.typeButton, isActive && styles.activeTypeButton]}
                  onPress={() => {
                    setSelectedType(type);
                  }}
                >
                  <Text style={[styles.typeButtonText, isActive && styles.activeTypeButtonText]}>
                    {type}
                  </Text>
                </LuxuryPressable>
              );
            })}
          </ScrollView>
        </View>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* PREMIUM INTERACTIVE SEARCH DASHBOARD */}
        {/* ───────────────────────────────────────────────────────────── */}
        <View style={styles.searchDashboardContainer}>
          {/* 1. Destination Card */}
          <View style={styles.dashboardCard}>
            <View style={styles.cardHeaderRow}>
              <MapPin color="#D4AF37" size={15} strokeWidth={2} />
              <Text style={styles.sectionLabel}>DESTINATION OR LUXURY REGION</Text>
            </View>

            <LuxuryPressable
              style={styles.destTriggerBtn}
              onPress={() => setShowDestModal(true)}
            >
              <View style={styles.destTriggerLeft}>
                <Flag emoji={selectedDestination.flag} size={28} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.destMainText} numberOfLines={1}>{selectedDestination.name}</Text>
                  <Text style={styles.destSubText} numberOfLines={1}>{selectedDestination.tagline}</Text>
                </View>
              </View>

              <View style={styles.changeBtnPill}>
                <Text style={styles.changeBtnText}>Change</Text>
                <ChevronRight color="#1C1917" size={13} strokeWidth={2.4} />
              </View>
            </LuxuryPressable>

            {/* Quick Destination Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickDestScroll}>
              {DESTINATION_OPTIONS.map(opt => {
                const isSelected = selectedDestination.id === opt.id;
                return (
                  <LuxuryPressable
                    key={opt.id}
                    style={[styles.quickDestChip, isSelected && styles.quickDestChipActive]}
                    onPress={() => {
                      setSelectedDestination(opt);
                    }}
                  >
                    <Flag emoji={opt.flag} size={18} />
                    <Text style={[styles.quickDestChipText, isSelected && styles.quickDestChipTextActive]}>
                      {opt.country}
                    </Text>
                  </LuxuryPressable>
                );
              })}
            </ScrollView>
          </View>

          {/* 2. Dates & Nights Row */}
          <View style={styles.datesRow}>
            {/* Check-In Card */}
            <LuxuryPressable
              style={[styles.dateCard, styles.grow]}
              onPress={() => {
                setCalendarTarget('checkIn');
                setShowCalendarModal(true);
              }}
            >
              <View style={styles.cardHeaderRow}>
                <Calendar color="#D4AF37" size={14} strokeWidth={2} />
                <Text style={styles.dateLabel}>CHECK-IN</Text>
              </View>
              <Text style={styles.dateMainValue}>{formatDateDisplay(checkInDate)}</Text>
              <Text style={styles.dateSubValue}>From 3:00 PM</Text>
            </LuxuryPressable>

            {/* Nights Duration Pill */}
            <View style={styles.nightsBadgeContainer}>
              <View style={styles.nightsBadge}>
                <Text style={styles.nightsBadgeText}>{nightsCount}N</Text>
              </View>
            </View>

            {/* Check-Out Card */}
            <LuxuryPressable
              style={[styles.dateCard, styles.grow]}
              onPress={() => {
                setCalendarTarget('checkOut');
                setShowCalendarModal(true);
              }}
            >
              <View style={styles.cardHeaderRow}>
                <Calendar color="#D4AF37" size={14} strokeWidth={2} />
                <Text style={styles.dateLabel}>CHECK-OUT</Text>
              </View>
              <Text style={styles.dateMainValue}>{formatDateDisplay(checkOutDate)}</Text>
              <Text style={styles.dateSubValue}>Until 12:00 PM</Text>
            </LuxuryPressable>
          </View>

          {/* 3. Guests & Rooms Selector Card (Advanced Popover Counter) */}
          <LuxuryPressable
            style={styles.guestsCard}
            onPress={() => setShowGuestsModal(true)}
          >
            <View style={styles.cardHeaderRow}>
              <Users color="#D4AF37" size={15} strokeWidth={2} />
              <Text style={styles.sectionLabel}>GUESTS & SUITES CONFIGURATION</Text>
            </View>

            <View style={styles.guestsSummaryRow}>
              <View style={styles.guestsPillGroup}>
                <View style={styles.guestItemBadge}>
                  <Text style={styles.guestItemBadgeVal}>{adults}</Text>
                  <Text style={styles.guestItemBadgeLabel}>Adult{adults > 1 ? 's' : ''}</Text>
                </View>
                <Text style={styles.guestDot}>•</Text>
                <View style={styles.guestItemBadge}>
                  <Text style={styles.guestItemBadgeVal}>{children}</Text>
                  <Text style={styles.guestItemBadgeLabel}>Child{children > 1 ? 'ren' : ''}</Text>
                </View>
                <Text style={styles.guestDot}>•</Text>
                <View style={styles.guestItemBadge}>
                  <Text style={styles.guestItemBadgeVal}>{rooms}</Text>
                  <Text style={styles.guestItemBadgeLabel}>Suite{rooms > 1 ? 's' : ''}</Text>
                </View>
              </View>

              <View style={styles.editGuestsPill}>
                <Text style={styles.editGuestsText}>Configure</Text>
                <ChevronRight color="#1C1917" size={13} strokeWidth={2.4} />
              </View>
            </View>
          </LuxuryPressable>

          {/* Primary Search Action Button */}
          <LuxuryPressable
            style={styles.searchSubmitBtn}
            onPress={handleSearchSubmit}
          >
            {isLoadingLive ? (
              <ActivityIndicator color="#1C1917" size="small" />
            ) : (
              <>
                <Search color="#1C1917" size={18} strokeWidth={2.4} />
                <Text style={styles.searchSubmitBtnText}>
                  Query Real-Time Live Availability ({liveProperties.length})
                </Text>
              </>
            )}
          </LuxuryPressable>
        </View>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* LIVE HOTEL RESULTS FEED */}
        {/* ───────────────────────────────────────────────────────────── */}
        <View ref={resultsRef} style={styles.resultsContainer}>
          <View style={styles.resultsHeaderRow}>
            <View>
              <Text style={styles.resultsTitle}>LIVE HOTEL AVAILABILITY</Text>
              <Text style={styles.resultsSubtitle}>
                {liveProperties.length} verified 5-star properties in {selectedDestination.name}
              </Text>
            </View>
            <View style={styles.liveGatewayBadge}>
              <Sparkles color="#D4AF37" size={12} strokeWidth={2} />
              <Text style={styles.liveGatewayBadgeText}>AMADEUS LIVE</Text>
            </View>
          </View>

          {/* Hotel Cards List */}
          <View style={styles.hotelCardsList}>
            {visibleProperties.map(hotel => {
              const topRoom = hotel.rooms[0];
              const { amount, period } = formatWesternPrice(
                `$${hotel.lowestPricePerNight}`,
                'night'
              );

              return (
                <LuxuryPressable
                  key={hotel.id}
                  style={styles.fullBleedCard}
                  onPress={() => handleOpenRoomDrawer(hotel, topRoom)}
                  scaleTo={0.985}
                >
                  <Image
                    source={{ uri: hotel.heroImage }}
                    style={styles.fullBleedImage}
                    resizeMode="cover"
                  />

                  {/* Top Badges */}
                  <View style={styles.cardTopBadges}>
                    <View style={styles.heroBadge}>
                      <Sparkles color="#D4AF37" size={12} strokeWidth={1.5} />
                      <Text style={styles.heroBadgeText}>
                        {hotel.chain.toUpperCase()}
                      </Text>
                    </View>

                    {/* Live Inventory Counter */}
                    <View style={styles.inventoryCountBadge}>
                      <AlertCircle color="#FAF9F6" size={11} strokeWidth={2.2} />
                      <Text style={styles.inventoryCountText}>
                        {hotel.totalAvailableRooms} Suites Left
                      </Text>
                    </View>
                  </View>

                  {/* Bottom Frosted Glassmorphism Panel */}
                  <View style={styles.frostedPanel}>
                    <LinearGradient
                      colors={['transparent', 'rgba(28, 25, 23, 0.95)']}
                      style={StyleSheet.absoluteFill}
                    />

                    <View style={styles.panelContent}>
                      {/* Location & Rating */}
                      <View style={styles.panelMetaRow}>
                        <Star color="#D4AF37" fill="#D4AF37" size={12} />
                        <Text style={styles.ratingValueText}>
                          {hotel.guestRating.toFixed(2)}
                        </Text>
                        <Text style={styles.metaDot}>•</Text>
                        <MapPin color="#D4AF37" size={13} strokeWidth={1.5} />
                        <Text style={styles.locationText} numberOfLines={1}>
                          {hotel.city}, {hotel.country}
                        </Text>
                      </View>

                      {/* Hotel Name */}
                      <Text style={styles.hotelTitleText} numberOfLines={1}>
                        {hotel.name}
                      </Text>

                      {/* Dynamic Cancellation Policy Notice */}
                      <View style={styles.cancellationPill}>
                        <ShieldCheck color="#D4AF37" size={12} strokeWidth={2} />
                        <Text style={styles.cancellationPillText} numberOfLines={1}>
                          {hotel.cancellationSummary}
                        </Text>
                      </View>

                      {/* Price & Action Row */}
                      <View style={styles.priceActionRow}>
                        <View style={styles.priceCol}>
                          <Text style={styles.priceVal}>{amount}</Text>
                          <Text style={styles.pricePeriod}>{period}</Text>
                        </View>

                        <View style={styles.actionButtonsRow}>
                          <Pressable
                            style={styles.detailsBtn}
                            onPress={e => {
                              e.stopPropagation();
                              handleOpenHotelDetails(hotel);
                            }}
                          >
                            <Eye color="#FAF9F6" size={13} strokeWidth={2} />
                            <Text style={styles.detailsBtnText}>Details</Text>
                          </Pressable>

                          <View style={styles.bookDrawerBtn}>
                            <Text style={styles.bookDrawerBtnText}>Reserve</Text>
                            <ArrowRight color="#FFFFFF" size={13} strokeWidth={2.6} />
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                </LuxuryPressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. DESTINATION SELECTOR MODAL */}
      {/* ───────────────────────────────────────────────────────────── */}
      <Modal visible={showDestModal} animationType="slide" transparent>
        <SafeAreaView style={styles.modalBackdrop} edges={['top', 'bottom']}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Select Destination</Text>
                <Text style={styles.modalSubtitle}>Curated Global 5-Star Cities & Resorts</Text>
              </View>
              <LuxuryPressable style={styles.modalCloseBtn} onPress={() => setShowDestModal(false)}>
                <X color="#1C1917" size={20} strokeWidth={2} />
              </LuxuryPressable>
            </View>

            {/* Destination Search Input */}
            <View style={styles.modalSearchInputBox}>
              <Search color="#D4AF37" size={16} strokeWidth={2} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search city, country, or resort..."
                placeholderTextColor="#64748B"
                value={destSearchQuery}
                onChangeText={setDestSearchQuery}
              />
            </View>

            <FlatList
              data={filteredDestinations}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = selectedDestination.id === item.id;
                return (
                  <LuxuryPressable
                    style={[styles.destModalItem, isSelected && styles.destModalItemSelected]}
                    onPress={() => {
                      setSelectedDestination(item);
                      setShowDestModal(false);
                      setDestSearchQuery('');
                    }}
                  >
                    <Flag emoji={item.flag} size={28} />
                    <View style={styles.destModalItemInfo}>
                      <Text style={[styles.destModalItemName, isSelected && styles.destModalItemNameSelected]}>
                        {item.name}
                      </Text>
                      <Text style={styles.destModalItemTagline}>{item.tagline}</Text>
                    </View>
                    {isSelected && <Check color="#D4AF37" size={18} strokeWidth={2.4} />}
                  </LuxuryPressable>
                );
              }}
            />
          </View>
        </SafeAreaView>
      </Modal>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. DATE RANGE PICKER SHEET */}
      {/* ───────────────────────────────────────────────────────────── */}
      <Modal visible={showCalendarModal} animationType="slide" transparent>
        <SafeAreaView style={styles.modalBackdrop} edges={['top', 'bottom']}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {calendarTarget === 'checkIn' ? 'Select Check-In Date' : 'Select Check-Out Date'}
                </Text>
                <Text style={styles.modalSubtitle}>
                  Check-In: {formatDateDisplay(checkInDate)} • Check-Out: {formatDateDisplay(checkOutDate)}
                </Text>
              </View>
              <LuxuryPressable style={styles.modalCloseBtn} onPress={() => setShowCalendarModal(false)}>
                <X color="#1C1917" size={20} strokeWidth={2} />
              </LuxuryPressable>
            </View>

            {/* Quick Presets */}
            <View style={styles.quickPresetsRow}>
              <LuxuryPressable style={styles.quickPresetChip} onPress={() => handleApplyPreset(1)}>
                <Text style={styles.quickPresetText}>1 Night</Text>
              </LuxuryPressable>
              <LuxuryPressable style={styles.quickPresetChip} onPress={() => handleApplyPreset(3)}>
                <Text style={styles.quickPresetText}>3 Nights (Weekend)</Text>
              </LuxuryPressable>
              <LuxuryPressable style={styles.quickPresetChip} onPress={() => handleApplyPreset(5)}>
                <Text style={styles.quickPresetText}>5 Nights (Getaway)</Text>
              </LuxuryPressable>
              <LuxuryPressable style={styles.quickPresetChip} onPress={() => handleApplyPreset(7)}>
                <Text style={styles.quickPresetText}>7 Nights (VIP)</Text>
              </LuxuryPressable>
            </View>

            {/* Month & Year Navigation */}
            <View style={styles.monthNavRow}>
              <LuxuryPressable
                style={styles.monthNavBtn}
                onPress={() => {
                  setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
                }}
              >
                <ChevronLeft color="#1C1917" size={20} strokeWidth={2.2} />
              </LuxuryPressable>

              <Text style={styles.monthLabel}>
                {MONTH_NAMES[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
              </Text>

              <LuxuryPressable
                style={styles.monthNavBtn}
                onPress={() => {
                  setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
                }}
              >
                <ChevronRight color="#1C1917" size={20} strokeWidth={2.2} />
              </LuxuryPressable>
            </View>

            {/* Weekday headers */}
            <View style={styles.weekHeadersRow}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                <Text key={idx} style={styles.weekDayHeader}>
                  {day}
                </Text>
              ))}
            </View>

            {/* Calendar Days Grid */}
            <View style={styles.calendarGrid}>
              {calendarDays.map((d, index) => {
                if (d === null) {
                  return <View key={index} style={styles.calendarEmptyCell} />;
                }

                const y = calendarMonth.getFullYear();
                const m = String(calendarMonth.getMonth() + 1).padStart(2, '0');
                const dayStr = String(d).padStart(2, '0');
                const fullDate = `${y}-${m}-${dayStr}`;

                const isCheckIn = checkInDate === fullDate;
                const isCheckOut = checkOutDate === fullDate;
                const isInRange =
                  new Date(fullDate) > new Date(checkInDate) &&
                  new Date(fullDate) < new Date(checkOutDate);

                return (
                  <LuxuryPressable
                    key={index}
                    style={[
                      styles.calendarDayCell,
                      (isCheckIn || isCheckOut) && styles.calendarDaySelected,
                      isInRange && styles.calendarDayInRange,
                    ]}
                    onPress={() => handleSelectCalendarDay(d)}
                  >
                    <Text
                      style={[
                        styles.calendarDayText,
                        (isCheckIn || isCheckOut) && styles.calendarDayTextSelected,
                        isInRange && styles.calendarDayTextInRange,
                      ]}
                    >
                      {d}
                    </Text>
                  </LuxuryPressable>
                );
              })}
            </View>

            {/* Confirm Dates Button */}
            <LuxuryPressable
              style={styles.modalDoneBtn}
              onPress={() => {
                setShowCalendarModal(false);
              }}
            >
              <Text style={styles.modalDoneBtnText}>Confirm Dates ({nightsCount} Nights)</Text>
            </LuxuryPressable>
          </View>
        </SafeAreaView>
      </Modal>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. ADVANCED GUESTS & SUITES POPOVER SELECTOR (Micro + / -) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <Modal visible={showGuestsModal} animationType="slide" transparent>
        <SafeAreaView style={styles.modalBackdrop} edges={['top', 'bottom']}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Guests & Suites</Text>
                <Text style={styles.modalSubtitle}>Configure travelers and private suites count</Text>
              </View>
              <LuxuryPressable style={styles.modalCloseBtn} onPress={() => setShowGuestsModal(false)}>
                <X color="#1C1917" size={20} strokeWidth={2} />
              </LuxuryPressable>
            </View>

            <View style={styles.counterList}>
              {/* Adults Counter */}
              <View style={styles.counterRow}>
                <View>
                  <Text style={styles.counterTitle}>Adults</Text>
                  <Text style={styles.counterSubtitle}>Ages 18 and above</Text>
                </View>

                <View style={styles.counterControls}>
                  <LuxuryPressable
                    style={[styles.counterBtn, adults <= 1 && styles.counterBtnDisabled]}
                    onPress={() => setAdults(prev => Math.max(1, prev - 1))}
                    disabled={adults <= 1}
                  >
                    <Minus color={adults <= 1 ? '#CBD5E1' : '#1C1917'} size={16} strokeWidth={1.5} />
                  </LuxuryPressable>

                  <Text style={styles.counterValue}>{adults}</Text>

                  <LuxuryPressable
                    style={[styles.counterBtn, adults >= 6 && styles.counterBtnDisabled]}
                    onPress={() => setAdults(prev => Math.min(6, prev + 1))}
                    disabled={adults >= 6}
                  >
                    <Plus color={adults >= 6 ? '#CBD5E1' : '#1C1917'} size={16} strokeWidth={1.5} />
                  </LuxuryPressable>
                </View>
              </View>

              {/* Children Counter */}
              <View style={styles.counterRow}>
                <View>
                  <Text style={styles.counterTitle}>Children</Text>
                  <Text style={styles.counterSubtitle}>Ages 0 to 17</Text>
                </View>

                <View style={styles.counterControls}>
                  <LuxuryPressable
                    style={[styles.counterBtn, children <= 0 && styles.counterBtnDisabled]}
                    onPress={() => setChildren(prev => Math.max(0, prev - 1))}
                    disabled={children <= 0}
                  >
                    <Minus color={children <= 0 ? '#CBD5E1' : '#1C1917'} size={16} strokeWidth={1.5} />
                  </LuxuryPressable>

                  <Text style={styles.counterValue}>{children}</Text>

                  <LuxuryPressable
                    style={[styles.counterBtn, children >= 4 && styles.counterBtnDisabled]}
                    onPress={() => setChildren(prev => Math.min(4, prev + 1))}
                    disabled={children >= 4}
                  >
                    <Plus color={children >= 4 ? '#CBD5E1' : '#1C1917'} size={16} strokeWidth={1.5} />
                  </LuxuryPressable>
                </View>
              </View>

              {/* Suites / Rooms Counter */}
              <View style={styles.counterRow}>
                <View>
                  <Text style={styles.counterTitle}>Suites / Rooms</Text>
                  <Text style={styles.counterSubtitle}>Number of reserved private suites</Text>
                </View>

                <View style={styles.counterControls}>
                  <LuxuryPressable
                    style={[styles.counterBtn, rooms <= 1 && styles.counterBtnDisabled]}
                    onPress={() => setRooms(prev => Math.max(1, prev - 1))}
                    disabled={rooms <= 1}
                  >
                    <Minus color={rooms <= 1 ? '#CBD5E1' : '#1C1917'} size={16} strokeWidth={1.5} />
                  </LuxuryPressable>

                  <Text style={styles.counterValue}>{rooms}</Text>

                  <LuxuryPressable
                    style={[styles.counterBtn, rooms >= 4 && styles.counterBtnDisabled]}
                    onPress={() => setRooms(prev => Math.min(4, prev + 1))}
                    disabled={rooms >= 4}
                  >
                    <Plus color={rooms >= 4 ? '#CBD5E1' : '#1C1917'} size={16} strokeWidth={1.5} />
                  </LuxuryPressable>
                </View>
              </View>
            </View>

            {/* Apply Guests Button */}
            <LuxuryPressable
              style={styles.modalDoneBtn}
              onPress={() => {
                setShowGuestsModal(false);
              }}
            >
              <Text style={styles.modalDoneBtnText}>
                Apply ({adults} Adults, {children} Children, {rooms} Suites)
              </Text>
            </LuxuryPressable>
          </View>
        </SafeAreaView>
      </Modal>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. ROOM DETAILS VIP DRAWER (Animated Slide-Up Sheet) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <HotelRoomDrawer
        isOpen={isRoomDrawerOpen}
        onClose={() => setIsRoomDrawerOpen(false)}
        room={drawerRoom}
        hotelName={drawerHotel?.name || ''}
        hotelCity={drawerHotel?.city}
        nights={nightsCount}
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
        onHoldAndBook={handleHoldAndBookRoom}
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
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.8,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  headerRightIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 14,
  },
  liveApiStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 8,
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  liveApiStatusText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.8,
  },
  typeSelectorScrollWrapper: {
    marginHorizontal: -16,
  },
  typeSelectorScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  activeTypeButton: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  activeTypeButtonText: {
    color: '#1C1917',
    fontWeight: '800',
  },
  // Search Dashboard Container
  searchDashboardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    padding: 16,
    gap: 14,
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  dashboardCard: {
    gap: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 1,
  },
  destTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderRadius: 14,
    padding: 12,
  },
  destTriggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  destFlag: {
    fontSize: 22,
  },
  destMainText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1917',
  },
  destSubText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  changeBtnPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  changeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1C1917',
  },
  quickDestScroll: {
    gap: 8,
    paddingTop: 4,
  },
  quickDestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  quickDestChipActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  quickDestChipFlag: {
    fontSize: 14,
  },
  quickDestChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  quickDestChipTextActive: {
    color: '#1C1917',
    fontWeight: '800',
  },
  datesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  grow: {
    flex: 1,
  },
  dateCard: {
    backgroundColor: '#FAF9F6',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    padding: 12,
    gap: 4,
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.8,
  },
  dateMainValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1917',
  },
  dateSubValue: {
    fontSize: 10,
    color: '#64748B',
  },
  nightsBadgeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nightsBadge: {
    backgroundColor: '#1C1917',
    borderWidth: 1,
    borderColor: '#D4AF37',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
  },
  nightsBadgeText: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: '900',
  },
  guestsCard: {
    backgroundColor: '#FAF9F6',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    padding: 12,
    gap: 8,
  },
  guestsSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  guestsPillGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  guestItemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  guestItemBadgeVal: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#D4AF37',
  },
  guestItemBadgeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1917',
  },
  guestDot: {
    color: '#94A3B8',
    fontSize: 12,
  },
  editGuestsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  editGuestsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1C1917',
  },
  searchSubmitBtn: {
    backgroundColor: '#D4AF37',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  searchSubmitBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.3,
  },
  // Results Feed Section
  resultsContainer: {
    marginTop: 6,
    gap: 12,
  },
  resultsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 1,
  },
  resultsSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  liveGatewayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  liveGatewayBadgeText: {
    color: '#D4AF37',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  hotelCardsList: {
    gap: 18,
  },
  fullBleedCard: {
    width: '100%',
    height: 380,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  fullBleedImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardTopBadges: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 5,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(28, 25, 23, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  heroBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 0.8,
  },
  inventoryCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#1C1917',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  inventoryCountText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FAF9F6',
  },
  frostedPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 36,
  },
  panelContent: {
    gap: 6,
  },
  panelMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingValueText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FAF9F6',
  },
  metaDot: {
    color: 'rgba(212, 175, 55, 0.6)',
    fontSize: 12,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FAF9F6',
    flex: 1,
  },
  hotelTitleText: {
    fontSize: 19,
    fontWeight: '900',
    color: '#FAF9F6',
    letterSpacing: 0.3,
  },
  cancellationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 2,
  },
  cancellationPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#D4AF37',
  },
  priceActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  priceCol: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceVal: {
    fontSize: 22,
    fontWeight: '900',
    color: '#D4AF37',
  },
  pricePeriod: {
    fontSize: 11,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  detailsBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FAF9F6',
  },
  bookDrawerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#0A0A0A',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  bookDrawerBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  // Modal Common Styles (Off-White & Navy)
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(28, 25, 23, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FAF9F6',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    padding: 20,
    maxHeight: '85%',
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1917',
  },
  modalSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSearchInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 13,
    color: '#1C1917',
    padding: 0,
  },
  destModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  destModalItemSelected: {
    borderColor: '#D4AF37',
    backgroundColor: '#FFFDF7',
  },
  destModalItemFlag: {
    fontSize: 24,
  },
  destModalItemInfo: {
    flex: 1,
  },
  destModalItemName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1917',
  },
  destModalItemNameSelected: {
    color: '#D4AF37',
  },
  destModalItemTagline: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  quickPresetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickPresetChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  quickPresetText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1C1917',
  },
  monthNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  monthNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.5,
  },
  weekHeadersRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 4,
  },
  weekDayHeader: {
    width: 36,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  calendarEmptyCell: {
    width: 36,
    height: 36,
    marginVertical: 3,
  },
  calendarDayCell: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 3,
  },
  calendarDaySelected: {
    backgroundColor: '#D4AF37',
  },
  calendarDayInRange: {
    backgroundColor: 'rgba(212, 175, 55, 0.18)',
    borderRadius: 4,
  },
  calendarDayText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1C1917',
  },
  calendarDayTextSelected: {
    color: '#1C1917',
    fontWeight: '900',
  },
  calendarDayTextInRange: {
    color: '#1C1917',
    fontWeight: '700',
  },
  modalDoneBtn: {
    backgroundColor: '#D4AF37',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  modalDoneBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.4,
  },
  // Counter Rows for Guests Popover
  counterList: {
    gap: 16,
    paddingVertical: 8,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderRadius: 16,
    padding: 14,
  },
  counterTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1917',
  },
  counterSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  counterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnDisabled: {
    opacity: 0.4,
    borderColor: '#E2E8F0',
  },
  counterValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#D4AF37',
    minWidth: 20,
    textAlign: 'center',
  },
});
