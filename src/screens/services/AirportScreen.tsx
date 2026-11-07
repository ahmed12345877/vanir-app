import React, { useState } from 'react';
import {
  Alert,
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
import { formatEnglishNumber } from '../../lib/formatters';
import {
  ChevronLeft,
  ShieldCheck,
  Plane,
  Sparkles,
  Users,
  Clock,
  Calendar,
  Building,
  Check,
  Car,
  Wine,
  ArrowRight,
  Luggage,
} from 'lucide-react-native';
import { VipDatePickerModal } from '../../components/VipDatePickerModal';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface AirportOption {
  code: string;
  name: string;
  city: string;
  country: string;
}

const POPULAR_AIRPORTS: AirportOption[] = [
  { code: 'CAI', name: 'Cairo International Airport', city: 'Cairo', country: 'Egypt' },
  { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'UAE' },
  { code: 'JED', name: 'King Abdulaziz International', city: 'Jeddah', country: 'Saudi Arabia' },
  { code: 'RUH', name: 'King Khalid International', city: 'Riyadh', country: 'Saudi Arabia' },
  { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'UK' },
  { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France' },
  { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey' },
];

interface VipTier {
  id: string;
  title: string;
  badge: string;
  price: number;
  icon: any;
  color: string;
  bgColor: string;
  features: string[];
}

const VIP_TIERS: VipTier[] = [
  {
    id: 'fast_track',
    title: 'VIP Meet & Assist (Fast-Track)',
    badge: 'Most Popular',
    price: 180,
    icon: ShieldCheck,
    color: '#D4AF37',
    bgColor: 'rgba(212, 175, 55, 0.12)',
    features: [
      'Personal Greeter at Aircraft Door',
      'Diplomatic & VIP Fast-Track Immigration',
      'Private Electric Buggy Through Terminal',
      'Priority Baggage Handling & Retrieval',
    ],
  },
  {
    id: 'lounge_spa',
    title: 'First Class Lounge & Spa',
    badge: 'Pure Relaxation',
    price: 120,
    icon: Wine,
    color: '#D4AF37',
    bgColor: 'rgba(212, 175, 55, 0.12)',
    features: [
      'Royal First Class Lounge Access',
      'Gourmet Buffet & Premium Refreshments 24/7',
      'Private Resting Suites & Spa Showers',
      'Ultra High-Speed Wi-Fi & Work Pods',
    ],
  },
  {
    id: 'tarmac_chauffeur',
    title: 'Tarmac Chauffeur Transfer',
    badge: 'Runway Transfer',
    price: 250,
    icon: Car,
    color: '#D4AF37',
    bgColor: 'rgba(212, 175, 55, 0.12)',
    features: [
      'Mercedes S-Class Waiting at Aircraft Stairs',
      'Direct Tarmac Transfer to VIP Lounge',
      'Skip Common Airport Buses Entirely',
      'Private Security & Escort Protocol',
    ],
  },
  {
    id: 'porter_baggage',
    title: 'Dedicated VIP Porter Service',
    badge: 'Total Comfort',
    price: 75,
    icon: Luggage,
    color: '#D4AF37',
    bgColor: 'rgba(212, 175, 55, 0.12)',
    features: [
      'Dedicated VIP Porter for All Luggage',
      'Immediate Retrieval from Carousel',
      'Direct Luggage Loading into Private Vehicle',
    ],
  },
  {
    id: 'royal_presidential',
    title: 'Royal Presidential Protocol',
    badge: 'Presidential Suite',
    price: 590,
    icon: Sparkles,
    color: '#D4AF37',
    bgColor: 'rgba(212, 175, 55, 0.12)',
    features: [
      'Access to Exclusive VIP Presidential Terminal',
      'Dedicated In-Lounge Passport Officer',
      'Runway Limousine + Private Chef Catering',
      'All-Inclusive Protocol for Family & Luggage',
    ],
  },
];

export function AirportScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const [selectedAirport, setSelectedAirport] = useState<AirportOption>(POPULAR_AIRPORTS[0]);
  const [flightType, setFlightType] = useState<'arrival' | 'departure'>('arrival');
  const [flightNumber, setFlightNumber] = useState('MS 777');
  const [terminal, setTerminal] = useState('Terminal 3');
  const [flightDate, setFlightDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [flightTime, setFlightTime] = useState('14:30');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [passengers, setPassengers] = useState(1);
  const [selectedTiers, setSelectedTiers] = useState<string[]>(['fast_track']);

  const toggleTier = (id: string) => {
    setSelectedTiers(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter(t => t !== id);
      }
      return [...prev, id];
    });
  };

  const totalPrice = selectedTiers.reduce((sum, tierId) => {
    const tier = VIP_TIERS.find(t => t.id === tierId);
    return sum + (tier ? tier.price * passengers : 0);
  }, 0);

  const handleBookService = () => {
    const chosenTiersNames = selectedTiers
      .map(id => VIP_TIERS.find(t => t.id === id)?.title)
      .filter(Boolean)
      .join(' + ');

    navigation.navigate('Booking', {
      type: 'airport',
      bookingType: 'airport',
      visaDocType: 'airport',
      id: selectedAirport.code,
      itemName: `${selectedAirport.code} Airport VIP (${chosenTiersNames}) • ${flightNumber}`,
      price: totalPrice,
      startDate: flightDate,
      endDate: flightDate,
      guestsCount: passengers,
      destination: `${selectedAirport.name} (${selectedAirport.code}) - ${terminal}`,
      flightNumber,
      terminal,
      flightTime,
      flightType,
    } as any);
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
          <ChevronLeft color="#1C1917" size={20} strokeWidth={2} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Airport VIP Fast-Track</Text>
          <Text style={styles.headerSub}>Expedited Airport Fast-Track & VIP Meet & Assist</Text>
        </View>

        <View style={styles.headerBadge}>
          <ShieldCheck color="#D4AF37" size={18} strokeWidth={1.5} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: 110 + insets.bottom }]}>
        {/* Flight Direction Toggle */}
        <View style={styles.directionSection}>
          <Pressable
            style={[styles.directionBtn, flightType === 'arrival' && styles.directionBtnActive]}
            onPress={() => setFlightType('arrival')}
          >
            <View style={{ transform: [{ rotate: '45deg' }], alignItems: 'center', justifyContent: 'center' }}>
              <Plane color={flightType === 'arrival' ? '#1C1917' : '#94A3B8'} size={17} strokeWidth={1.5} />
            </View>
            <Text style={[styles.directionBtnText, flightType === 'arrival' && styles.directionBtnTextActive]}>
              Arrival Flight
            </Text>
          </Pressable>

          <Pressable
            style={[styles.directionBtn, flightType === 'departure' && styles.directionBtnActive]}
            onPress={() => setFlightType('departure')}
          >
            <View style={{ transform: [{ rotate: '-45deg' }], alignItems: 'center', justifyContent: 'center' }}>
              <Plane color={flightType === 'departure' ? '#1C1917' : '#94A3B8'} size={17} strokeWidth={1.5} />
            </View>
            <Text style={[styles.directionBtnText, flightType === 'departure' && styles.directionBtnTextActive]}>
              Departure Flight
            </Text>
          </Pressable>
        </View>

        {/* Airport Selection Chips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select International Airport</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.airportsScroll}>
            {POPULAR_AIRPORTS.map(apt => (
              <Pressable
                key={apt.code}
                style={[styles.airportChip, selectedAirport.code === apt.code && styles.airportChipActive]}
                onPress={() => setSelectedAirport(apt)}
              >
                <Text style={[styles.airportCode, selectedAirport.code === apt.code && styles.airportCodeActive]}>
                  {apt.code}
                </Text>
                <Text style={[styles.airportCity, selectedAirport.code === apt.code && styles.airportCityActive]}>
                  {apt.city}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Flight Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Flight & Schedule Details</Text>

          <View style={styles.inputsRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Flight Number</Text>
              <TextInput
                style={styles.input}
                value={flightNumber}
                onChangeText={setFlightNumber}
                placeholder="e.g. EK 923"
                placeholderTextColor="#64748B"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Terminal</Text>
              <TextInput
                style={styles.input}
                value={terminal}
                onChangeText={setTerminal}
                placeholder="Terminal 3"
                placeholderTextColor="#64748B"
              />
            </View>
          </View>

          <View style={[styles.inputsRow, { marginTop: 12 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Flight Date</Text>
              <Pressable
                style={styles.inputIconWrapper}
                onPress={() => setShowDatePicker(true)}
              >
                <Calendar color="#D4AF37" size={16} strokeWidth={1.5} />
                <Text style={[styles.inputWithIcon, { paddingTop: 10, color: '#1C1917', fontWeight: '600' }]}>
                  {flightDate || 'Select Date'}
                </Text>
              </Pressable>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Estimated Time</Text>
              <View style={styles.inputIconWrapper}>
                <Clock color="#D4AF37" size={16} strokeWidth={1.5} />
                <TextInput
                  style={styles.inputWithIcon}
                  value={flightTime}
                  onChangeText={setFlightTime}
                  placeholder="HH:MM"
                  placeholderTextColor="#64748B"
                />
              </View>
            </View>
          </View>

          {/* Quick Date Shortcuts */}
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
            {[
              { label: 'Today', offset: 0 },
              { label: 'Tomorrow', offset: 1 },
              { label: 'In 3 Days', offset: 3 },
              { label: 'Custom Date', offset: -1 },
            ].map(item => (
              <Pressable
                key={item.label}
                style={{
                  flex: 1,
                  paddingVertical: 7,
                  backgroundColor: '#FFFFFF',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                  alignItems: 'center',
                }}
                onPress={() => {
                  if (item.offset === -1) {
                    setShowDatePicker(true);
                  } else {
                    const d = new Date();
                    d.setDate(d.getDate() + item.offset);
                    const y = d.getFullYear();
                    const m = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    setFlightDate(`${y}-${m}-${day}`);
                  }
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#1C1917' }}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Passenger Counter */}
          <View style={styles.passengersRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={styles.passengersTitle}>Number of VIP Travelers</Text>
              <Text style={styles.passengersSub}>Includes personal escort and luggage handling for all passengers</Text>
            </View>

            <View style={styles.counterBox}>
              <Pressable
                style={styles.counterBtn}
                onPress={() => setPassengers(p => Math.max(1, p - 1))}
              >
                <Text style={styles.counterBtnText}>−</Text>
              </Pressable>
              <Text style={styles.counterValue}>{passengers}</Text>
              <Pressable
                style={styles.counterBtn}
                onPress={() => setPassengers(p => p + 1)}
              >
                <Text style={styles.counterBtnText}>+</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* VIP Packages Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Desired VIP Services</Text>

          <View style={styles.tiersList}>
            {VIP_TIERS.map(tier => {
              const IconComp = tier.icon;
              const isSelected = selectedTiers.includes(tier.id);

              return (
                <Pressable
                  key={tier.id}
                  style={[styles.tierCard, isSelected && styles.tierCardActive]}
                  onPress={() => toggleTier(tier.id)}
                >
                  <View style={styles.tierHeader}>
                    <View style={styles.tierHeaderLeft}>
                      <View style={[styles.tierIconBox, { backgroundColor: tier.bgColor }]}>
                        <IconComp color={tier.color} size={20} strokeWidth={1.5} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.tierTitleBadgeRow}>
                          <Text style={styles.tierTitle}>{tier.title}</Text>
                          <View style={[styles.miniBadge, { backgroundColor: tier.bgColor }]}>
                            <Text style={[styles.miniBadgeText, { color: tier.color }]}>{tier.badge}</Text>
                          </View>
                        </View>
                        <Text style={styles.tierPrice}>${tier.price} <Text style={styles.tierPriceSub}>/ passenger</Text></Text>
                      </View>
                    </View>

                    <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                      {isSelected && <Check color="#1C1917" size={13} strokeWidth={2.5} />}
                    </View>
                  </View>

                  <View style={styles.tierFeatures}>
                    {tier.features.map((feat, fIdx) => (
                      <View key={fIdx} style={styles.featureItem}>
                        <Check color="#D4AF37" size={13} strokeWidth={1.5} />
                        <Text style={styles.featureText}>{feat}</Text>
                      </View>
                    ))}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Booking Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View>
          <Text style={styles.barLabel}>Total Cost ({passengers} traveler{passengers > 1 ? 's' : ''})</Text>
          <Text style={styles.barPrice}>${formatEnglishNumber(totalPrice)}</Text>
        </View>

        <Pressable style={styles.bookBtn} onPress={handleBookService}>
          <Text style={styles.bookBtnText}>Reserve Fast-Track</Text>
          <ArrowRight color="#1C1917" size={17} strokeWidth={2.5} />
        </Pressable>
      </View>

      <VipDatePickerModal
        visible={showDatePicker}
        initialDate={flightDate}
        onClose={() => setShowDatePicker(false)}
        onSelectDate={setFlightDate}
        title="Select Airport Service Date"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAF9F6' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FAF9F6',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.25)',
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
  topBtnPressed: {
    backgroundColor: 'rgba(212, 175, 55, 0.22)',
    borderColor: '#D4AF37',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.5,
  },
  headerSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  headerBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: 16,
    gap: 16,
  },
  directionSection: {
    flexDirection: 'row',
    gap: 12,
  },
  directionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  directionBtnActive: {
    borderColor: '#D4AF37',
    backgroundColor: '#D4AF37',
  },
  directionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  directionBtnTextActive: {
    color: '#1C1917',
    fontWeight: '800',
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  airportsScroll: {
    gap: 10,
  },
  airportChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    alignItems: 'center',
    minWidth: 90,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  airportChipActive: {
    borderColor: '#D4AF37',
    backgroundColor: '#D4AF37',
  },
  airportCode: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1917',
  },
  airportCodeActive: {
    color: '#1C1917',
  },
  airportCity: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  airportCityActive: {
    color: '#1C1917',
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.3,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(28, 25, 23, 0.12)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1C1917',
    fontWeight: '600',
  },
  inputIconWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(28, 25, 23, 0.12)',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputWithIcon: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1C1917',
    fontWeight: '600',
  },
  passengersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(28, 25, 23, 0.08)',
  },
  passengersTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1917',
  },
  passengersSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  counterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: 12,
    padding: 4,
    gap: 12,
  },
  counterBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1917',
  },
  counterValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1917',
    minWidth: 20,
    textAlign: 'center',
  },
  tiersList: {
    gap: 12,
  },
  tierCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  tierCardActive: {
    borderColor: '#D4AF37',
    borderWidth: 1.5,
    backgroundColor: '#FAF9F6',
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tierHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  tierIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    backgroundColor: '#FAF9F6',
  },
  tierTitleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  tierTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1917',
  },
  miniBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    backgroundColor: '#FAF9F6',
  },
  miniBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  tierPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#D4AF37',
    marginTop: 2,
  },
  tierPriceSub: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    borderColor: '#D4AF37',
    backgroundColor: '#D4AF37',
  },
  tierFeatures: {
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(28, 25, 23, 0.08)',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FAF9F6',
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
  barLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  barPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1C1917',
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#D4AF37',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  bookBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1917',
  },
});
