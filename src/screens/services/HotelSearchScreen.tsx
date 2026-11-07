import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
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
import {
  Search,
  ChevronLeft,
  MapPin,
  Calendar,
  Users,
  Star,
  ShieldCheck,
  ArrowRight,
  Clock,
  Sparkles,
  AlertCircle,
  Check,
  X,
} from 'lucide-react-native';
import {
  searchLiveHotels,
  createRoomHold,
  LiveHotelProperty,
  LiveRoomOffer,
} from '../../services/hotelSearchApi';
import { HotelRoomDrawer } from '../../components/HotelRoomDrawer';
import { VipDatePickerModal } from '../../components/VipDatePickerModal';
import { LuxuryPressable } from '../../components/LuxuryMicroInteractions';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const DESTINATIONS = [
  'All',
  'Europe',
  'Greece',
  'Turkey',
  'Athens',
  'Santorini',
  'Mykonos',
  'Istanbul',
  'Bodrum',
  'Cappadocia',
  'Antalya',
  'Paris',
  'Rome',
  'Milan',
  'Venice',
  'Barcelona',
  'Madrid',
  'Geneva',
  'Zurich',
  'Vienna',
  'Berlin',
  'Munich',
  'Amsterdam',
  'Prague',
  'Budapest',
  'London',
  'Riyadh',
  'Jeddah',
  'Dubai',
  'Doha',
  'Cairo',
  'New York',
  'Tokyo',
  'Bali',
  'Maldives',
];

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

export function HotelSearchScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const [destination, setDestination] = useState('All');
  const [hotelKeyword, setHotelKeyword] = useState('');
  const [checkInDate, setCheckInDate] = useState(() => getFutureYmd(3));
  const [checkOutDate, setCheckOutDate] = useState(() => getFutureYmd(7));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);

  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const [showGuestsModal, setShowGuestsModal] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [properties, setProperties] = useState<LiveHotelProperty[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<LiveHotelProperty | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<LiveRoomOffer | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const computedNights = useMemo(
    () => diffNights(checkInDate, checkOutDate),
    [checkInDate, checkOutDate],
  );

  const executeSearch = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await searchLiveHotels({
        destination: destination === 'All' ? 'all' : destination,
        checkInDate,
        checkOutDate,
        adults,
        children,
        rooms,
      });
      setProperties(response.properties || []);
    } catch (err) {
      console.warn('[HotelSearch] Search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [destination, checkInDate, checkOutDate, adults, children, rooms]);

  useEffect(() => {
    executeSearch();
  }, [executeSearch]);

  const displayedProperties = useMemo(() => {
    const q = hotelKeyword.trim().toLowerCase();
    if (!q) return properties;
    return properties.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.country.toLowerCase().includes(q) ||
        p.chain.toLowerCase().includes(q),
    );
  }, [properties, hotelKeyword]);

  const handleOpenRoomDrawer = (hotel: LiveHotelProperty, room?: LiveRoomOffer) => {
    setSelectedProperty(hotel);
    setSelectedRoom(room || hotel.rooms[0]);
    setIsDrawerOpen(true);
  };

  const handleHoldAndBook = async (room: LiveRoomOffer) => {
    if (!selectedProperty) return;
    setIsDrawerOpen(false);
    const dynamicTotal =
      room.dynamicPricePerNight * computedNights + (room.taxesAndFees || 0);
    const finalPrice = room.totalPrice || dynamicTotal;

    const baseParams = {
      type: 'hotel' as const,
      id: selectedProperty.id,
      itemName: `${selectedProperty.name} - ${room.title}`,
      price: finalPrice,
      startDate: checkInDate,
      endDate: checkOutDate,
      nights: computedNights,
      guestsCount: adults + children,
      roomTitle: room.title,
      roomType: room.title,
      hotelName: selectedProperty.name,
      destination: `${selectedProperty.city}, ${selectedProperty.country}`,
    };

    try {
      const hold = await createRoomHold(
        selectedProperty.id,
        room.id,
        room.title,
        selectedProperty.name,
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
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

      {/* Luxury Off-White Header */}
      <View style={styles.header}>
        <LuxuryPressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color="#1C1917" size={22} strokeWidth={2.4} />
        </LuxuryPressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>SEARCH & COMPARE HOTELS</Text>
          <Text style={styles.headerSubtitle}>Amadeus Live Gateway • Dynamic Rates</Text>
        </View>

        <View style={styles.headerRightBadge}>
          <Sparkles color="#D4AF37" size={16} strokeWidth={2} />
        </View>
      </View>

      {/* Live Interactive Search & Filter Config Bar */}
      <View style={styles.searchBarContainer}>
        {/* Keyword / Hotel Name Filter */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: 'rgba(212, 175, 55, 0.3)',
            paddingHorizontal: 12,
            height: 40,
            marginBottom: 8,
            gap: 8,
          }}
        >
          <Search color="#D4AF37" size={15} strokeWidth={2} />
          <TextInput
            style={{ flex: 1, fontSize: 13, fontWeight: '600', color: '#1C1917', paddingVertical: 0 }}
            value={hotelKeyword}
            onChangeText={setHotelKeyword}
            placeholder="Search hotel name, brand, or city..."
            placeholderTextColor="#94A3B8"
          />
          {hotelKeyword ? (
            <Pressable onPress={() => setHotelKeyword('')}>
              <X color="#64748B" size={15} />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.searchConfigRow}>
          <Pressable style={styles.configChip} onPress={() => setShowDestinationModal(true)}>
            <MapPin color="#D4AF37" size={13} strokeWidth={2} />
            <Text style={styles.configChipText}>{destination}</Text>
          </Pressable>
          <Pressable style={styles.configChip} onPress={() => setShowCheckInPicker(true)}>
            <Calendar color="#D4AF37" size={13} strokeWidth={2} />
            <Text style={styles.configChipText}>In: {checkInDate}</Text>
          </Pressable>
          <Pressable style={styles.configChip} onPress={() => setShowCheckOutPicker(true)}>
            <Calendar color="#D4AF37" size={13} strokeWidth={2} />
            <Text style={styles.configChipText}>Out: {checkOutDate} ({computedNights}N)</Text>
          </Pressable>
          <Pressable style={styles.configChip} onPress={() => setShowGuestsModal(true)}>
            <Users color="#D4AF37" size={13} strokeWidth={2} />
            <Text style={styles.configChipText}>
              {adults + children} Guests • {rooms} Suite{rooms > 1 ? 's' : ''}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Hotel Cards List */}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator color="#D4AF37" size="large" />
          <Text style={styles.loaderText}>Connecting to Amadeus Hospitality API…</Text>
        </View>
      ) : (
        <FlatList
          data={displayedProperties}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.listContainer, { paddingBottom: 60 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <LuxuryPressable
              style={styles.card}
              onPress={() => handleOpenRoomDrawer(item)}
              scaleTo={0.985}
            >
              <Image source={{ uri: item.heroImage }} style={styles.cardImage} resizeMode="cover" />

              <View style={styles.cardBadgesRow}>
                <View style={styles.chainBadge}>
                  <Text style={styles.chainBadgeText}>{item.chain.toUpperCase()}</Text>
                </View>
                <View style={styles.inventoryBadge}>
                  <AlertCircle color="#FAF9F6" size={11} strokeWidth={2.2} />
                  <Text style={styles.inventoryBadgeText}>{item.totalAvailableRooms} Left</Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.cardHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.locationRow}>
                      <MapPin color="#D4AF37" size={13} strokeWidth={1.8} />
                      <Text style={styles.locationText}>{item.city}, {item.country}</Text>
                    </View>
                  </View>

                  <View style={styles.ratingBadge}>
                    <Star color="#D4AF37" fill="#D4AF37" size={12} />
                    <Text style={styles.ratingText}>{item.guestRating.toFixed(2)}</Text>
                  </View>
                </View>

                {/* Cancellation Policy Banner */}
                <View style={styles.cancellationNotice}>
                  <ShieldCheck color="#16A34A" size={13} strokeWidth={2} />
                  <Text style={styles.cancellationText} numberOfLines={1}>
                    {item.cancellationSummary}
                  </Text>
                </View>

                {/* Footer Price & Action */}
                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.fromLabel}>RATES FROM</Text>
                    <Text style={styles.priceVal}>
                      ${item.lowestPricePerNight}
                      <Text style={styles.priceUnit}>/night</Text>
                    </Text>
                  </View>

                  <View style={styles.bookBtn}>
                    <Text style={styles.bookBtnText}>Select Suite</Text>
                    <ArrowRight color="#1C1917" size={13} strokeWidth={2.6} />
                  </View>
                </View>
              </View>
            </LuxuryPressable>
          )}
        />
      )}

      {/* Room Details VIP Drawer */}
      <HotelRoomDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        room={selectedRoom}
        hotelName={selectedProperty?.name || ''}
        hotelCity={selectedProperty?.city}
        nights={computedNights}
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
        onHoldAndBook={handleHoldAndBook}
      />

      {/* Check-In Date Picker */}
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

      {/* Check-Out Date Picker */}
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

      {/* Destination Selector Modal */}
      <Modal visible={showDestinationModal} transparent animationType="fade" onRequestClose={() => setShowDestinationModal(false)}>
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(28,25,23,0.55)', justifyContent: 'center', padding: 20 }}
          onPress={() => setShowDestinationModal(false)}
        >
          <View style={{ backgroundColor: '#FAF9F6', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: 'rgba(212,175,55,0.4)', maxHeight: '80%' }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#1C1917', marginBottom: 12, textAlign: 'center' }}>
              Select Destination City
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {DESTINATIONS.map(city => (
                <Pressable
                  key={city}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: 11,
                    paddingHorizontal: 10,
                    borderRadius: 10,
                    backgroundColor: destination === city ? 'rgba(212,175,55,0.16)' : 'transparent',
                  }}
                  onPress={() => {
                    setDestination(city);
                    setShowDestinationModal(false);
                  }}
                >
                  <Text style={{ fontSize: 13.5, fontWeight: '700', color: '#1C1917' }}>{city}</Text>
                  {destination === city && <Check color="#D4AF37" size={18} strokeWidth={2.5} />}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Guests & Suites Modal */}
      <Modal visible={showGuestsModal} transparent animationType="fade" onRequestClose={() => setShowGuestsModal(false)}>
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(28,25,23,0.55)', justifyContent: 'center', padding: 20 }}
          onPress={() => setShowGuestsModal(false)}
        >
          <Pressable style={{ backgroundColor: '#FAF9F6', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(212,175,55,0.4)', gap: 14 }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#1C1917', textAlign: 'center' }}>
              Guests & Suites
            </Text>
            {[
              { label: 'Adults', val: adults, setVal: setAdults, min: 1 },
              { label: 'Children', val: children, setVal: setChildren, min: 0 },
              { label: 'Suites / Rooms', val: rooms, setVal: setRooms, min: 1 },
            ].map(row => (
              <View key={row.label} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 13.5, fontWeight: '700', color: '#1C1917' }}>{row.label}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Pressable
                    style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D4AF37', alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => row.setVal(Math.max(row.min, row.val - 1))}
                  >
                    <Text style={{ fontSize: 16, fontWeight: '800', color: '#1C1917' }}>−</Text>
                  </Pressable>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: '#1C1917', minWidth: 18, textAlign: 'center' }}>{row.val}</Text>
                  <Pressable
                    style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D4AF37', alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => row.setVal(row.val + 1)}
                  >
                    <Text style={{ fontSize: 16, fontWeight: '800', color: '#1C1917' }}>+</Text>
                  </Pressable>
                </View>
              </View>
            ))}
            <Pressable
              style={{ backgroundColor: '#D4AF37', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 4 }}
              onPress={() => setShowGuestsModal(false)}
            >
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#1C1917' }}>Apply Selection</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
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
    letterSpacing: 0.6,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  headerRightBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBarContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FAF9F6',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.15)',
  },
  searchConfigRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  configChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  configChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1C1917',
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1917',
  },
  listContainer: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 200,
  },
  cardBadgesRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chainBadge: {
    backgroundColor: 'rgba(28, 25, 23, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chainBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 0.8,
  },
  inventoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1C1917',
    borderWidth: 1,
    borderColor: '#D4AF37',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  inventoryBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FAF9F6',
  },
  cardBody: {
    padding: 16,
    gap: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  locationText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1C1917',
  },
  cancellationNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(22, 163, 74, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  cancellationText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#15803D',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.15)',
  },
  fromLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  priceVal: {
    fontSize: 19,
    fontWeight: '900',
    color: '#D4AF37',
  },
  priceUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#D4AF37',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  bookBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1C1917',
  },
});
