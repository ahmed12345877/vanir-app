import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  FlatList,
  Modal,
  Platform,
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
  Armchair,
  ArrowLeftRight,
  ArrowRight,
  Calendar as CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  Compass,
  Crown,
  Luggage,
  MapPin,
  Plane,
  Plus,
  Minus,
  PhoneCall,
  Radio,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  X,
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { formatEnglishNumber } from '../../lib/formatters';
import {
  LuxuryPressable,
  StaggeredFadeInUp,
} from '../../components/LuxuryMicroInteractions';
import { SecurePaymentOverlay } from '../../components/SecurePaymentOverlay';
import {
  searchLiveFlights,
  fetchLiveSeatMap,
  LiveSeatMapResponse,
  LiveSeatDetail,
} from '../../services/flightSearchApi';
import { LiveFlightStatusTracker } from '../../components/LiveFlightStatusTracker';
import { AirlineLogo } from '../../components/AirlineLogos';
import { Flag } from '../../components/Flag';
import { MASTER_COUNTRIES, isoToFlag } from '../../data/allCountries';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export type TripType = 'oneway' | 'round' | 'multicity';
export type TravelClass = 'Economy' | 'Business' | 'First' | 'VIP Jet';

export interface FlightItem {
  id: string;
  offerId?: string;
  airline: string;
  airlineCode: string;
  airlineCountry: string;
  flightNumber: string;
  aircraft: string;
  origin: string;
  originCode: string;
  originCity: string;
  originTerminal?: string;
  destination: string;
  destinationCode: string;
  destinationCity: string;
  destinationTerminal?: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  cabinClass: 'First Class Suite' | 'Business Class' | 'Private Jet Charter' | 'Premium Economy';
  cabinBadge: string;
  price: number;
  basePrice?: number;
  taxes?: number;
  totalPrice?: number;
  currency: string;
  amenities: string[];
  baggage: string;
  meal: string;
  seatMapAvailable?: boolean;
  liveGateway?: string;
}

export interface AirportHub {
  code: string;
  city: string;
  name: string;
  country: string;
  flag: string;
  region: string;
  aliases?: string[];
}

export interface FlightLeg {
  id: string;
  origin: string;
  destination: string;
  date: string;
}

export const GLOBAL_AIRPORT_HUBS: AirportHub[] = [
  // Middle East & Gulf
  { code: 'DXB', city: 'Dubai', name: 'Dubai International Terminal 3 (Emirates)', country: 'UAE', flag: '🇦🇪', region: 'Middle East', aliases: ['دبي', 'الامارات', 'dubai', 'dxb', 'uae'] },
  { code: 'DOH', city: 'Doha', name: 'Hamad International (Qatar Airways Al Safwa)', country: 'Qatar', flag: '🇶🇦', region: 'Middle East', aliases: ['الدوحة', 'قطر', 'doha', 'doh', 'qatar'] },
  { code: 'CAI', city: 'Cairo', name: 'Cairo International VIP Terminal', country: 'Egypt', flag: '🇪🇬', region: 'Middle East', aliases: ['القاهرة', 'مصر', 'cairo', 'cai', 'egypt'] },
  { code: 'RUH', city: 'Riyadh', name: 'King Khalid International VIP Terminal', country: 'Saudi Arabia', flag: '🇸🇦', region: 'Middle East', aliases: ['الرياض', 'السعودية', 'riyadh', 'ruh', 'saudi', 'ksa'] },
  { code: 'JED', city: 'Jeddah', name: 'King Abdulaziz Royal VIP Terminal', country: 'Saudi Arabia', flag: '🇸🇦', region: 'Middle East', aliases: ['جدة', 'السعودية', 'jeddah', 'jed', 'saudi'] },
  { code: 'AUH', city: 'Abu Dhabi', name: 'Zayed International Terminal A', country: 'UAE', flag: '🇦🇪', region: 'Middle East', aliases: ['ابوظبي', 'أبوظبي', 'abu dhabi', 'auh'] },
  { code: 'DWC', city: 'Dubai VIP', name: 'Al Maktoum VIP Executive Terminal', country: 'UAE', flag: '🇦🇪', region: 'Middle East', aliases: ['دبي', 'المكتوم', 'dubai vip', 'dwc'] },
  { code: 'KWI', city: 'Kuwait City', name: 'Kuwait International VIP Terminal', country: 'Kuwait', flag: '🇰🇼', region: 'Middle East', aliases: ['الكويت', 'kuwait', 'kwi'] },
  { code: 'SSH', city: 'Sharm El Sheikh', name: 'Sharm El Sheikh International', country: 'Egypt', flag: '🇪🇬', region: 'Middle East', aliases: ['شرم الشيخ', 'مصر', 'sharm', 'ssh'] },

  // Europe & UK
  { code: 'LHR', city: 'London', name: 'London Heathrow Terminal 5 / Concorde Room', country: 'United Kingdom', flag: '🇬🇧', region: 'Europe', aliases: ['لندن', 'بريطانيا', 'london', 'lon', 'lhr', 'uk', 'heathrow'] },
  { code: 'CDG', city: 'Paris', name: 'Charles de Gaulle / Le Bourget VIP', country: 'France', flag: '🇫🇷', region: 'Europe', aliases: ['باريس', 'فرنسا', 'paris', 'par', 'cdg', 'france'] },
  { code: 'GVA', city: 'Geneva', name: 'Geneva Cointrin VIP Salon', country: 'Switzerland', flag: '🇨🇭', region: 'Europe', aliases: ['جنيف', 'سويسرا', 'geneva', 'gva', 'switzerland'] },
  { code: 'ZRH', city: 'Zurich', name: 'Zurich Airport First Lounge', country: 'Switzerland', flag: '🇨🇭', region: 'Europe', aliases: ['زيورخ', 'سويسرا', 'zurich', 'zrh'] },
  { code: 'FRA', city: 'Frankfurt', name: 'Frankfurt First Class Dedicated Terminal', country: 'Germany', flag: '🇩🇪', region: 'Europe', aliases: ['فرانكفورت', 'المانيا', 'frankfurt', 'fra', 'germany'] },
  { code: 'NCE', city: 'Nice', name: 'Nice Côte d’Azur VIP Private Aviation', country: 'France', flag: '🇫🇷', region: 'Europe', aliases: ['نيس', 'nice', 'nce'] },
  { code: 'MXP', city: 'Milan', name: 'Milan Malpensa VIP Terminal', country: 'Italy', flag: '🇮🇹', region: 'Europe', aliases: ['ميلانو', 'milan', 'mxp'] },
  { code: 'IST', city: 'Istanbul', name: 'Istanbul Grand Airport VIP Lounge', country: 'Turkey', flag: '🇹🇷', region: 'Europe', aliases: ['اسطنبول', 'تركيا', 'istanbul', 'ist'] },

  // Americas & Asia
  { code: 'JFK', city: 'New York', name: 'John F. Kennedy Terminal 1 / 4 Flagship', country: 'USA', flag: '🇺🇸', region: 'Americas', aliases: ['نيويورك', 'امريكا', 'new york', 'jfk', 'nyc'] },
  { code: 'LAX', city: 'Los Angeles', name: 'Los Angeles International PS Private Suite', country: 'USA', flag: '🇺🇸', region: 'Americas', aliases: ['لوس انجلوس', 'los angeles', 'lax'] },
  { code: 'MIA', city: 'Miami', name: 'Miami International Executive', country: 'USA', flag: '🇺🇸', region: 'Americas', aliases: ['ميامي', 'miami', 'mia'] },
  { code: 'HND', city: 'Tokyo', name: 'Tokyo Haneda International First Suite', country: 'Japan', flag: '🇯🇵', region: 'Asia', aliases: ['طوكيو', 'اليابان', 'tokyo', 'hnd'] },
  { code: 'SIN', city: 'Singapore', name: 'Singapore Changi The Private Room', country: 'Singapore', flag: '🇸🇬', region: 'Asia', aliases: ['سنغافورة', 'singapore', 'sin'] },
  { code: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi Royal Orchid First Terminal', country: 'Thailand', flag: '🇹🇭', region: 'Asia', aliases: ['بانكوك', 'bangkok', 'bkk'] },
];

// Augment with all world countries so every nation's airport is selectable
const EXTRA_WORLD_HUBS: AirportHub[] = MASTER_COUNTRIES
  .filter(mc => mc.iata && !GLOBAL_AIRPORT_HUBS.some(h => h.code.toUpperCase() === mc.iata.toUpperCase()))
  .map(mc => ({
    code: mc.iata,
    city: mc.cityEn || mc.en,
    name: `${mc.cityEn || mc.en} International Airport (${mc.iata})`,
    country: mc.en,
    flag: isoToFlag(mc.iso),
    region:
      mc.continent === 'arab'
        ? 'Middle East'
        : mc.continent === 'europe'
        ? 'Europe'
        : mc.continent === 'americas'
        ? 'Americas'
        : mc.continent === 'asia'
        ? 'Asia'
        : mc.continent === 'africa'
        ? 'Africa'
        : 'Oceania',
    aliases: [mc.ar, mc.cityAr, mc.en, mc.cityEn, mc.iata, mc.iso],
  }));

GLOBAL_AIRPORT_HUBS.push(...EXTRA_WORLD_HUBS);

/**
 * Generate luxury flights matching major carriers (Emirates, Qatar Airways, Saudia, BA, Vanir Jet)
 */
function generateLuxuryFlights(
  origCity: string,
  origCode: string,
  destCity: string,
  destCode: string,
  travelClass: TravelClass
): FlightItem[] {
  const oCity = origCity.split('(')[0].trim() || 'Cairo';
  const dCity = destCity.split('(')[0].trim() || 'Dubai';
  const oCode = origCode.toUpperCase();
  const dCode = destCode.toUpperCase();

  const multiplier = travelClass === 'First' ? 1.4 : travelClass === 'Business' ? 1 : travelClass === 'VIP Jet' ? 6.5 : 0.45;

  return [
    {
      id: `fl-ek-${oCode}-${dCode}`,
      airline: 'Emirates',
      airlineCode: 'EK',
      airlineCountry: '🇦🇪',
      flightNumber: `EK ${Math.floor(200 + Math.random() * 700)}`,
      aircraft: 'Airbus A380-800 Flagship Suite',
      origin: `${oCity} Intl (${oCode})`,
      originCode: oCode,
      originCity: oCity,
      destination: `${dCity} Intl (${dCode})`,
      destinationCode: dCode,
      destinationCity: dCity,
      departureTime: '08:45 AM',
      arrivalTime: '02:30 PM',
      duration: '5h 45m',
      stops: 0,
      cabinClass: 'First Class Suite',
      cabinBadge: 'Private Suite & Shower Spa',
      price: Math.round(3450 * multiplier),
      currency: '$',
      amenities: [
        'Private Sliding Door Suite',
        'Onboard Shower Spa',
        'Dom Pérignon Vintage 2013',
        'Chauffeur-drive VIP Service',
      ],
      baggage: '2 x 32 kg + 12 kg Cabin',
      meal: 'Royal Caviar & Multi-Course Fine Dining',
    },
    {
      id: `fl-qr-${oCode}-${dCode}`,
      airline: 'Qatar Airways',
      airlineCode: 'QR',
      airlineCountry: '🇶🇦',
      flightNumber: `QR ${Math.floor(1100 + Math.random() * 400)}`,
      aircraft: 'Boeing 777-300ER Qsuite',
      origin: `${oCity} (${oCode})`,
      originCode: oCode,
      originCity: oCity,
      destination: `${dCity} (${dCode})`,
      destinationCode: dCode,
      destinationCity: dCity,
      departureTime: '01:15 PM',
      arrivalTime: '07:20 PM',
      duration: '6h 05m',
      stops: 0,
      cabinClass: 'Business Class',
      cabinBadge: 'Qsuite Double Bed in Sky',
      price: Math.round(2680 * multiplier),
      currency: '$',
      amenities: [
        'Quad-Config Double Bed',
        'Oryx One 4,000+ Channels',
        'Diptyque Paris Amenity Kit',
        'Al Mourjan Business Lounge',
      ],
      baggage: '2 x 32 kg + 10 kg Cabin',
      meal: 'Dine on Demand Gourmet Menu',
    },
    {
      id: `fl-sv-${oCode}-${dCode}`,
      airline: 'Saudia',
      airlineCode: 'SV',
      airlineCountry: '🇸🇦',
      flightNumber: `SV ${Math.floor(300 + Math.random() * 500)}`,
      aircraft: 'Boeing 777-300 First Suite',
      origin: `${oCity} (${oCode})`,
      originCode: oCode,
      originCity: oCity,
      destination: `${dCity} (${dCode})`,
      destinationCode: dCode,
      destinationCity: dCity,
      departureTime: '04:30 PM',
      arrivalTime: '10:15 PM',
      duration: '5h 45m',
      stops: 0,
      cabinClass: 'First Class Suite',
      cabinBadge: 'Alfursan First Suite',
      price: Math.round(2950 * multiplier),
      currency: '$',
      amenities: [
        'Enclosed Private Suite',
        'Dedicated Onboard In-Flight Chef',
        'Arabic Cardamom Coffee & Dates',
        'Alfursan VIP Lounge Access',
      ],
      baggage: '2 x 32 kg + 12 kg Cabin',
      meal: 'Five-Star Customized Haute Cuisine',
    },
    {
      id: `fl-ba-${oCode}-${dCode}`,
      airline: 'British Airways',
      airlineCode: 'BA',
      airlineCountry: '🇬🇧',
      flightNumber: `BA ${Math.floor(100 + Math.random() * 200)}`,
      aircraft: 'Airbus A350-1000 Club Suite',
      origin: `${oCity} (${oCode})`,
      originCode: oCode,
      originCity: oCity,
      destination: `${dCity} (${dCode})`,
      destinationCode: dCode,
      destinationCity: dCity,
      departureTime: '11:40 AM',
      arrivalTime: '05:35 PM',
      duration: '5h 55m',
      stops: 0,
      cabinClass: 'Business Class',
      cabinBadge: 'Club Suite with Privacy Door',
      price: Math.round(2420 * multiplier),
      currency: '$',
      amenities: [
        'Direct Aisle Access Club Suite',
        'The White Company Bedding',
        'Concorde Room & Galleries Lounge',
        'High-Speed Wi-Fi Enabled',
      ],
      baggage: '2 x 32 kg + 10 kg Cabin',
      meal: 'British Farm-to-Table Curated Dining',
    },
    {
      id: `fl-vnr-${oCode}-${dCode}`,
      airline: 'VANIR Private Aviation',
      airlineCode: 'VNR',
      airlineCountry: '✈️',
      flightNumber: 'VNR 777 VIP',
      aircraft: 'Gulfstream G650ER Flagship',
      origin: `${oCity} Private FBO Terminal`,
      originCode: oCode,
      originCity: oCity,
      destination: `${dCity} Private VIP Gate`,
      destinationCode: dCode,
      destinationCity: dCity,
      departureTime: 'On-Demand Flexible',
      arrivalTime: 'Direct VIP Gate',
      duration: '4h 40m (Mach 0.925)',
      stops: 0,
      cabinClass: 'Private Jet Charter',
      cabinBadge: 'Ultra-Long Range Jet Charter',
      price: 24500,
      currency: '$',
      amenities: [
        '16 VIP Passenger Salon & Master Bed',
        'Tarmac Chauffeur Escort to Jet Steps',
        'Private FBO Customs (Zero Lines)',
        'Bespoke Caviar & Chilled Vintage Champagne',
      ],
      baggage: 'Unlimited Cargo Hold',
      meal: 'Michelin-Starred Tailored Dining',
    },
  ];
}

export function FlightBookingScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const mainScrollRef = useRef<ScrollView>(null);

  // 1. Trip Selector State
  const [tripType, setTripType] = useState<TripType>('round');
  const slideAnim = useRef(new Animated.Value(1)).current; // 0 = oneway, 1 = round, 2 = multicity

  // Route Locations
  const [origin, setOrigin] = useState('Cairo (CAI)');
  const [destination, setDestination] = useState('Dubai (DXB)');

  // Multi-City Legs State
  const [multiCityLegs, setMultiCityLegs] = useState<FlightLeg[]>([
    { id: 'leg-1', origin: 'Cairo (CAI)', destination: 'Dubai (DXB)', date: '2026-10-22' },
    { id: 'leg-2', origin: 'Dubai (DXB)', destination: 'London (LHR)', date: '2026-10-28' },
  ]);

  // 2. Dates State (Range for Round-Trip, Single for One-Way)
  const [departureDate, setDepartureDate] = useState('2026-10-22');
  const [returnDate, setReturnDate] = useState('2026-11-05');
  const [calendarMonth, setCalendarMonth] = useState(new Date(2026, 9, 1)); // Oct 2026

  // 3. Passenger & Class Selector State
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [travelClass, setTravelClass] = useState<TravelClass>('First');

  // Modals
  const [showAirportModal, setShowAirportModal] = useState(false);
  const [airportTarget, setAirportTarget] = useState<'origin' | 'destination' | { legIndex: number; field: 'orig' | 'dest' }>('origin');
  const [airportSearchQuery, setAirportSearchQuery] = useState('');

  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [tempRangeStart, setTempRangeStart] = useState<string | null>(departureDate);
  const [tempRangeEnd, setTempRangeEnd] = useState<string | null>(returnDate);

  const [showPassengerModal, setShowPassengerModal] = useState(false);

  // Search & Loading State
  const [isSearching, setIsSearching] = useState(false);
  const [flightsList, setFlightsList] = useState<FlightItem[]>(() =>
    generateLuxuryFlights('Cairo', 'CAI', 'Dubai', 'DXB', 'First')
  );
  const [selectedFilterTab, setSelectedFilterTab] = useState<string>('all');

  // Screen Mode: 'booking' vs 'tracker'
  const [activeScreenTab, setActiveScreenTab] = useState<'booking' | 'tracker'>('booking');
  const [trackingFlightNum, setTrackingFlightNum] = useState<string>('EK902');

  // Real-Time GDS Metadata & Error Handling States
  const [searchMetadata, setSearchMetadata] = useState<{
    searchedAt: string;
    searchId: string;
    provider: string;
  }>({
    searchedAt: 'Just now',
    searchId: 'duffel_live_init',
    provider: 'Duffel v2 / Amadeus Live GDS',
  });
  const [isEmptyResult, setIsEmptyResult] = useState(false);
  const [emptyMessage, setEmptyMessage] = useState<string>(
    'No active flights found for this exclusive route on the selected dates. Please consult your dedicated concierge.'
  );

  // Dynamic Live Seat Map Modal States
  const [showSeatMapModal, setShowSeatMapModal] = useState(false);
  const [isLoadingSeatMap, setIsLoadingSeatMap] = useState(false);
  const [selectedFlightForSeat, setSelectedFlightForSeat] = useState<FlightItem | null>(null);
  const [liveSeatMap, setLiveSeatMap] = useState<LiveSeatMapResponse | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<LiveSeatDetail | null>(null);

  // Animate Trip Selector Sliding Background
  const handleTripTypeChange = (type: TripType) => {
    setTripType(type);
    const targetIdx = type === 'oneway' ? 0 : type === 'round' ? 1 : 2;
    Animated.spring(slideAnim, {
      toValue: targetIdx,
      damping: 18,
      stiffness: 180,
      useNativeDriver: false,
    }).start();
  };

  const getCode = (str: string, fallback: string) => {
    const match = str.match(/\(([A-Z0-9]+)\)/);
    return match ? match[1] : fallback;
  };

  const getCity = (str: string, fallback: string) => {
    const clean = str.split('(')[0].trim();
    return clean || fallback;
  };

  // Swap Origin & Destination
  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  // Multi-City Leg Helpers
  const addLeg = () => {
    if (multiCityLegs.length >= 5) {
      Alert.alert('Maximum Legs', 'A maximum of 5 multi-city flight legs is permitted.');
      return;
    }
    const lastLeg = multiCityLegs[multiCityLegs.length - 1];
    setMultiCityLegs(prev => [
      ...prev,
      {
        id: `leg-${Date.now()}`,
        origin: lastLeg.destination,
        destination: 'New York (JFK)',
        date: '2026-11-04',
      },
    ]);
  };

  const removeLeg = (index: number) => {
    if (multiCityLegs.length <= 2) {
      Alert.alert('Minimum Legs', 'Multi-city itinerary requires at least 2 flight legs.');
      return;
    }
    setMultiCityLegs(prev => prev.filter((_, i) => i !== index));
  };

  // Autocomplete Filter
  const filteredAirports = useMemo(() => {
    if (!airportSearchQuery.trim()) return GLOBAL_AIRPORT_HUBS;
    const q = airportSearchQuery.toLowerCase().trim();
    return GLOBAL_AIRPORT_HUBS.filter(
      hub =>
        hub.code.toLowerCase().includes(q) ||
        hub.city.toLowerCase().includes(q) ||
        hub.name.toLowerCase().includes(q) ||
        hub.country.toLowerCase().includes(q) ||
        (hub.aliases && hub.aliases.some(a => a.toLowerCase().includes(q)))
    );
  }, [airportSearchQuery]);

  const handleSelectAirport = (hub: AirportHub) => {
    const formatted = `${hub.city} (${hub.code})`;
    if (airportTarget === 'origin') {
      setOrigin(formatted);
    } else if (airportTarget === 'destination') {
      setDestination(formatted);
    } else if (typeof airportTarget === 'object') {
      const { legIndex, field } = airportTarget;
      setMultiCityLegs(prev => {
        const copy = [...prev];
        if (field === 'orig') copy[legIndex].origin = formatted;
        else copy[legIndex].destination = formatted;
        return copy;
      });
    }
    setShowAirportModal(false);
  };

  // Luxury Calendar Days Generator
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun
    const adjustedFirstDay = (firstDayIndex + 6) % 7; // 0 is Mon

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Empty lead slots
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push({ dateStr: '', dayNum: 0, isCurrentMonth: false });
    }

    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = (month + 1).toString().padStart(2, '0');
      const dayStr = d.toString().padStart(2, '0');
      const dateStr = `${year}-${monthStr}-${dayStr}`;
      days.push({ dateStr, dayNum: d, isCurrentMonth: true });
    }

    return days;
  }, [calendarMonth]);

  const handleCalendarDayPress = (dateStr: string) => {
    if (!dateStr) return;

    if (tripType === 'oneway') {
      setTempRangeStart(dateStr);
      setTempRangeEnd(null);
      return;
    }

    // Round trip range selection
    if (!tempRangeStart || (tempRangeStart && tempRangeEnd)) {
      setTempRangeStart(dateStr);
      setTempRangeEnd(null);
    } else if (tempRangeStart && !tempRangeEnd) {
      if (dateStr >= tempRangeStart) {
        setTempRangeEnd(dateStr);
      } else {
        setTempRangeStart(dateStr);
        setTempRangeEnd(null);
      }
    }
  };

  const handleConfirmCalendar = () => {
    if (tempRangeStart) setDepartureDate(tempRangeStart);
    if (tempRangeEnd) setReturnDate(tempRangeEnd);
    setShowCalendarModal(false);
  };

  // 1. Live Query Execution (Duffel / Amadeus Real-Time API)
  const handlePerformSearch = async () => {
    setIsSearching(true);
    setIsEmptyResult(false);

    const origCode = getCode(origin, 'CAI');
    const destCode = getCode(destination, 'DXB');

    try {
      const response = await searchLiveFlights({
        tripType,
        originCode: origCode,
        destinationCode: destCode,
        departureDate,
        returnDate: tripType === 'round' ? returnDate : null,
        passengers: { adults, children, infants, total: adults + children + infants },
        travelClass,
        legs: tripType === 'multicity' ? multiCityLegs : undefined,
      });

      if (!response.success || !response.flights || response.flights.length === 0) {
        setFlightsList([]);
        setIsEmptyResult(true);
        setEmptyMessage(
          response.message ||
            'No active flights found for this exclusive route on the selected dates. Please consult your dedicated concierge.'
        );
      } else {
        setFlightsList(response.flights as FlightItem[]);
        setIsEmptyResult(false);
        setSearchMetadata({
          searchedAt: new Date(response.searchedAt).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          searchId: response.searchId,
          provider: response.provider || 'Duffel v2 / Amadeus Live GDS',
        });
      }
    } catch {
      setFlightsList([]);
      setIsEmptyResult(true);
      setEmptyMessage(
        'No active flights found for this exclusive route on the selected dates. Please consult your dedicated concierge.'
      );
    } finally {
      setIsSearching(false);
      // Smooth scroll to results
      setTimeout(() => {
        mainScrollRef.current?.scrollTo({ y: 560, animated: true });
      }, 150);
    }
  };

  // 2. Dynamic Live Seat Map Trigger
  const handleOpenSeatMap = async (flight: FlightItem) => {
    setSelectedFlightForSeat(flight);
    setSelectedSeat(null);
    setShowSeatMapModal(true);
    setIsLoadingSeatMap(true);

    try {
      const data = await fetchLiveSeatMap({
        flightId: flight.id,
        flightNumber: flight.flightNumber,
        aircraft: flight.aircraft,
        cabinClass: flight.cabinClass,
        originCode: flight.originCode,
        destinationCode: flight.destinationCode,
      });
      setLiveSeatMap(data);
    } catch (err) {
      console.warn('[SeatMap] Failed to fetch live seat map:', err);
    } finally {
      setIsLoadingSeatMap(false);
    }
  };

  const totalPassengers = adults + children + infants;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

      {/* Screen Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.backBtn,
            pressed && styles.topBtnPressed,
          ]}
          onPress={() => navigation.goBack()}
          hitSlop={12}
        >
          <ChevronLeft color="#1C1917" size={20} strokeWidth={2.2} />
        </Pressable>

        <View style={styles.headerTextCol}>
          <Text style={styles.headerTitle}>Commercial & VIP Flights</Text>
          <Text style={styles.headerSub}>Major Airline Alliances & Private Charters</Text>
        </View>

        <View style={styles.logoBadgeContainer}>
          <Image
            source={require('../../assets/vanir_round_logo.png')}
            style={styles.logoBadgeImg}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Top Segmented Mode Switcher: Flight Booking vs Live Radar Status Tracker */}
      <View style={styles.topModeBar}>
        <Pressable
          style={[styles.topModeBtn, activeScreenTab === 'booking' && styles.topModeBtnActive]}
          onPress={() => setActiveScreenTab('booking')}
        >
          <Plane
            color={activeScreenTab === 'booking' ? '#D4AF37' : '#64748B'}
            size={14}
            strokeWidth={2.4}
          />
          <Text
            style={[
              styles.topModeText,
              activeScreenTab === 'booking' && styles.topModeTextActive,
            ]}
          >
            Flight Search & Suites
          </Text>
        </Pressable>

        <Pressable
          style={[styles.topModeBtn, activeScreenTab === 'tracker' && styles.topModeBtnActive]}
          onPress={() => setActiveScreenTab('tracker')}
        >
          <View style={styles.liveRadarDotRow}>
            <View style={styles.livePulseDot} />
            <Radio
              color={activeScreenTab === 'tracker' ? '#D4AF37' : '#64748B'}
              size={14}
              strokeWidth={2.4}
            />
          </View>
          <Text
            style={[
              styles.topModeText,
              activeScreenTab === 'tracker' && styles.topModeTextActive,
            ]}
          >
            Live Radar Tracker
          </Text>
        </Pressable>
      </View>

      <ScrollView
        ref={mainScrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 + insets.bottom }]}
      >
        {activeScreenTab === 'tracker' ? (
          <View style={{ marginHorizontal: 18, marginTop: 12 }}>
            <LiveFlightStatusTracker initialFlightNumber={trackingFlightNum} />
          </View>
        ) : (
          <>
        {/* ========================================================================= */}
        {/* INTERACTIVE FLIGHT BOOKING ENGINE CONTAINER */}
        {/* ========================================================================= */}
        <View style={styles.engineCard}>
          {/* 1. Trip Selector: Segmented Control with Smooth Sliding Indicator */}
          <View style={styles.segmentedContainer}>
            <Animated.View
              style={[
                styles.slidingIndicator,
                {
                  left: slideAnim.interpolate({
                    inputRange: [0, 1, 2],
                    outputRange: ['0%', '33.33%', '66.66%'],
                  }),
                },
              ]}
            />
            <Pressable
              style={styles.segmentBtn}
              onPress={() => handleTripTypeChange('oneway')}
            >
              <Text
                style={[
                  styles.segmentText,
                  tripType === 'oneway' && styles.segmentTextActive,
                ]}
              >
                One-Way
              </Text>
            </Pressable>

            <Pressable
              style={styles.segmentBtn}
              onPress={() => handleTripTypeChange('round')}
            >
              <Text
                style={[
                  styles.segmentText,
                  tripType === 'round' && styles.segmentTextActive,
                ]}
              >
                Round-Trip
              </Text>
            </Pressable>

            <Pressable
              style={styles.segmentBtn}
              onPress={() => handleTripTypeChange('multicity')}
            >
              <Text
                style={[
                  styles.segmentText,
                  tripType === 'multicity' && styles.segmentTextActive,
                ]}
              >
                Multi-City
              </Text>
            </Pressable>
          </View>

          {/* 2. Standard One-Way & Round-Trip Route Inputs */}
          {tripType !== 'multicity' && (
            <View style={styles.locationContainer}>
              {/* FROM (Departure) */}
              <Pressable
                style={styles.locationInputBox}
                onPress={() => {
                  setAirportTarget('origin');
                  setAirportSearchQuery('');
                  setShowAirportModal(true);
                }}
              >
                <View style={styles.locationHeaderRow}>
                  <Text style={styles.locationLabel}>FROM</Text>
                  <Text style={styles.iataBadge}>{getCode(origin, 'CAI')}</Text>
                </View>
                <View style={styles.locationValRow}>
                  <Plane color="#D4AF37" size={16} strokeWidth={2} />
                  <Text style={styles.locationValText} numberOfLines={1}>
                    {origin}
                  </Text>
                </View>
              </Pressable>

              {/* Swap Button */}
              <LuxuryPressable style={styles.swapFloatingBtn} onPress={handleSwap}>
                <ArrowLeftRight color="#D4AF37" size={16} strokeWidth={2.4} />
              </LuxuryPressable>

              {/* TO (Destination) */}
              <Pressable
                style={styles.locationInputBox}
                onPress={() => {
                  setAirportTarget('destination');
                  setAirportSearchQuery('');
                  setShowAirportModal(true);
                }}
              >
                <View style={styles.locationHeaderRow}>
                  <Text style={styles.locationLabel}>TO</Text>
                  <Text style={styles.iataBadge}>{getCode(destination, 'DXB')}</Text>
                </View>
                <View style={styles.locationValRow}>
                  <MapPin color="#D4AF37" size={16} strokeWidth={2} />
                  <Text style={styles.locationValText} numberOfLines={1}>
                    {destination}
                  </Text>
                </View>
              </Pressable>
            </View>
          )}

          {/* Multi-City Legs Container */}
          {tripType === 'multicity' && (
            <View style={styles.multiCityWrapper}>
              {multiCityLegs.map((leg, index) => (
                <View key={leg.id} style={styles.legCard}>
                  <View style={styles.legHeaderRow}>
                    <Text style={styles.legTitle}>Flight Leg {index + 1}</Text>
                    {multiCityLegs.length > 2 && (
                      <Pressable onPress={() => removeLeg(index)} hitSlop={8}>
                        <Trash2 color="#EF4444" size={15} strokeWidth={2} />
                      </Pressable>
                    )}
                  </View>

                  <View style={styles.legRow}>
                    <Pressable
                      style={styles.legInput}
                      onPress={() => {
                        setAirportTarget({ legIndex: index, field: 'orig' });
                        setAirportSearchQuery('');
                        setShowAirportModal(true);
                      }}
                    >
                      <Text style={styles.locationLabel}>FROM</Text>
                      <Text style={styles.legValueText} numberOfLines={1}>
                        {leg.origin}
                      </Text>
                    </Pressable>

                    <ArrowRight color="#94A3B8" size={14} style={{ alignSelf: 'center' }} />

                    <Pressable
                      style={styles.legInput}
                      onPress={() => {
                        setAirportTarget({ legIndex: index, field: 'dest' });
                        setAirportSearchQuery('');
                        setShowAirportModal(true);
                      }}
                    >
                      <Text style={styles.locationLabel}>TO</Text>
                      <Text style={styles.legValueText} numberOfLines={1}>
                        {leg.destination}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ))}

              <LuxuryPressable style={styles.addLegBtn} onPress={addLeg}>
                <Plus color="#D4AF37" size={15} strokeWidth={2.5} />
                <Text style={styles.addLegText}>Add Another Flight Leg</Text>
              </LuxuryPressable>
            </View>
          )}

          {/* 3. Luxury Range Calendar & Passenger / Class Selector Row */}
          <View style={styles.metaRow}>
            {/* Range Calendar Trigger */}
            <Pressable
              style={styles.metaCol}
              onPress={() => {
                setTempRangeStart(departureDate);
                setTempRangeEnd(tripType === 'round' ? returnDate : null);
                setShowCalendarModal(true);
              }}
            >
              <Text style={styles.metaLabel}>
                {tripType === 'round' ? 'DATES (RANGE)' : 'DEPARTURE DATE'}
              </Text>
              <View style={styles.metaValRow}>
                <CalendarIcon color="#D4AF37" size={16} strokeWidth={2} />
                <Text style={styles.metaValText} numberOfLines={1}>
                  {tripType === 'round'
                    ? `${departureDate.slice(5)} ➔ ${returnDate.slice(5)}`
                    : departureDate}
                </Text>
              </View>
            </Pressable>

            {/* Passenger & Travel Class Selector Trigger */}
            <Pressable
              style={styles.metaCol}
              onPress={() => setShowPassengerModal(true)}
            >
              <Text style={styles.metaLabel}>PASSENGERS & CLASS</Text>
              <View style={styles.metaValRow}>
                <Users color="#D4AF37" size={16} strokeWidth={2} />
                <Text style={styles.metaValText} numberOfLines={1}>
                  {totalPassengers} Pax • {travelClass}
                </Text>
              </View>
            </Pressable>
          </View>

          {/* 4. The Prominent Global Search Button */}
          <LuxuryPressable
            style={[styles.globalSearchBtn, isSearching && styles.globalSearchBtnDisabled]}
            onPress={handlePerformSearch}
            disabled={isSearching}
          >
            {isSearching ? (
              <View style={styles.searchLoadingRow}>
                <ActivityIndicator color="#D4AF37" size="small" />
                <Text style={styles.globalSearchBtnText}>Querying VIP Airline Alliances…</Text>
              </View>
            ) : (
              <View style={styles.searchBtnRow}>
                <Plane color="#D4AF37" size={18} strokeWidth={2.4} />
                <Text style={styles.globalSearchBtnText}>Search Luxury Flights</Text>
                <ArrowRight color="#D4AF37" size={18} strokeWidth={2.2} />
              </View>
            )}
          </LuxuryPressable>
        </View>

        {/* Airline Alliances Accreditation Bar */}
        <View style={styles.accreditationBar}>
          <ShieldCheck color="#D4AF37" size={15} strokeWidth={2} />
          <Text style={styles.accreditationText}>
            Official IATA Accredited • Star Alliance • Oneworld • SkyTeam Suite Alliances
          </Text>
        </View>

        {/* Real-Time Live Feed Status Banner */}
        <View style={styles.liveFeedBanner}>
          <View style={styles.livePulseDot} />
          <Text style={styles.liveFeedText}>
            LIVE GDS FEED • {searchMetadata.provider} • CACHE INVALIDATED ({searchMetadata.searchedAt})
          </Text>
        </View>

        {/* Cabin Filter Tabs */}
        <View style={styles.cabinFilterSection}>
          <Text style={styles.cabinFilterTitle}>AVAILABLE FLIGHT RESULTS ({flightsList.length})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {[
              { id: 'all', label: `All Flights (${flightsList.length})` },
              { id: 'first', label: 'First Class Suites' },
              { id: 'business', label: 'Business & Qsuite' },
              { id: 'jet', label: 'Private Jet Fleet' },
            ].map(tab => {
              const active = selectedFilterTab === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => setSelectedFilterTab(tab.id)}
                >
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Graceful Error Handling & Empty Route Screen (Requirement 4) */}
        {isEmptyResult || flightsList.length === 0 ? (
          <View style={styles.emptyStateCard}>
            <View style={styles.emptyIconCircle}>
              <Compass color="#D4AF37" size={38} strokeWidth={1.8} />
            </View>
            <Text style={styles.emptyTitle}>Route Inquiries & Concierge</Text>
            <Text style={styles.emptyMessage}>
              {emptyMessage}
            </Text>

            <View style={styles.emptyActionsRow}>
              <LuxuryPressable
                style={styles.emptyConciergeBtn}
                onPress={() => navigation.navigate('AIConcierge')}
              >
                <PhoneCall color="#1C1917" size={14} strokeWidth={2.4} />
                <Text style={styles.emptyConciergeText}>Consult Dedicated Concierge</Text>
              </LuxuryPressable>

              <LuxuryPressable
                style={styles.emptyModifyBtn}
                onPress={() => {
                  mainScrollRef.current?.scrollTo({ y: 0, animated: true });
                }}
              >
                <RotateCcw color="#D4AF37" size={14} strokeWidth={2.2} />
                <Text style={styles.emptyModifyText}>Modify Route & Dates</Text>
              </LuxuryPressable>
            </View>
          </View>
        ) : null}

        {/* Flight Cards Listing */}
        <View style={styles.flightsListContainer}>
          {flightsList
            .filter(fl => {
              if (selectedFilterTab === 'first' && fl.cabinClass !== 'First Class Suite') return false;
              if (selectedFilterTab === 'business' && fl.cabinClass !== 'Business Class') return false;
              if (selectedFilterTab === 'jet' && fl.cabinClass !== 'Private Jet Charter') return false;
              return true;
            })
            .map((flight, idx) => (
              <StaggeredFadeInUp key={flight.id} index={idx} style={styles.flightCard}>
                {/* Airline & Flagship Aircraft Row */}
                <View style={styles.cardHeaderRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                    <AirlineLogo airline={flight.airline} size={36} />
                    <View style={styles.airlineBadgeCol}>
                      <Text style={styles.airlineName}>
                        {flight.airline}
                      </Text>
                      <Text style={styles.aircraftName}>{flight.aircraft}</Text>
                    </View>
                  </View>
                  <View style={styles.flightNumberBadge}>
                    <Text style={styles.flightNumberText}>{flight.flightNumber}</Text>
                  </View>
                </View>

                {/* Itinerary Timeline */}
                <View style={styles.timelineRow}>
                  {/* Origin */}
                  <View style={styles.timeCol}>
                    <Text style={styles.timeBig}>{flight.departureTime}</Text>
                    <Text style={styles.iataBig}>{flight.originCode}</Text>
                    <Text style={styles.cityNameText}>{flight.originCity}</Text>
                    {flight.originTerminal ? (
                      <Text style={styles.terminalSubText} numberOfLines={1}>{flight.originTerminal}</Text>
                    ) : null}
                  </View>

                  {/* Flight Route Path */}
                  <View style={styles.flightPathCol}>
                    <Text style={styles.durationText}>{flight.duration}</Text>
                    <View style={styles.flightLineRow}>
                      <View style={styles.flightLineDot} />
                      <View style={styles.flightLineDash} />
                      <View style={{ transform: [{ rotate: '45deg' }], marginHorizontal: 4, alignItems: 'center', justifyContent: 'center' }}>
                        <Plane color="#D4AF37" size={14} strokeWidth={2.4} fill="#D4AF37" />
                      </View>
                      <View style={styles.flightLineDash} />
                      <View style={styles.flightLineDot} />
                    </View>
                    <Text style={styles.nonstopBadge}>Non-Stop VIP</Text>
                  </View>

                  {/* Destination */}
                  <View style={[styles.timeCol, { alignItems: 'flex-end' }]}>
                    <Text style={styles.timeBig}>{flight.arrivalTime}</Text>
                    <Text style={styles.iataBig}>{flight.destinationCode}</Text>
                    <Text style={styles.cityNameText}>{flight.destinationCity}</Text>
                    {flight.destinationTerminal ? (
                      <Text style={styles.terminalSubText} numberOfLines={1}>{flight.destinationTerminal}</Text>
                    ) : null}
                  </View>
                </View>

                {/* Cabin Badge & Amenities Pills */}
                <View style={styles.amenitiesRow}>
                  <View style={styles.cabinClassPill}>
                    <Sparkles color="#D4AF37" size={12} strokeWidth={2.4} />
                    <Text style={styles.cabinClassPillText}>{flight.cabinBadge}</Text>
                  </View>
                  <View style={styles.baggagePill}>
                    <Luggage color="#64748B" size={12} />
                    <Text style={styles.baggageText}>{flight.baggage}</Text>
                  </View>
                </View>

                {/* Divider */}
                <View style={styles.cardDivider} />

                {/* Pricing & Booking Action */}
                <View style={styles.cardBottomRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rateLabel}>All-Inclusive VIP Fare</Text>
                    <Text style={styles.priceValue}>
                      ${formatEnglishNumber(flight.price)}
                      <Text style={styles.perPersonText}> / passenger</Text>
                    </Text>
                    {flight.basePrice && flight.taxes ? (
                      <Text style={styles.taxBreakdownSub}>
                        Base: ${formatEnglishNumber(flight.basePrice)} • Taxes: ${formatEnglishNumber(flight.taxes)}
                      </Text>
                    ) : null}
                  </View>

                  <View style={styles.cardActionsCol}>
                    <View style={styles.cardActionsSubRow}>
                      {/* Live Aircraft Seat Map Button (Requirement 3) */}
                      <LuxuryPressable
                        style={styles.seatMapActionBtn}
                        onPress={() => handleOpenSeatMap(flight)}
                      >
                        <Armchair color="#D4AF37" size={13} strokeWidth={2.4} />
                        <Text style={styles.seatMapActionText}>Live Seat Map</Text>
                      </LuxuryPressable>

                      {/* Live Radar Quick Action */}
                      <LuxuryPressable
                        style={styles.radarQuickBtn}
                        onPress={() => {
                          setTrackingFlightNum(flight.flightNumber.replace(/\s+/g, ''));
                          setActiveScreenTab('tracker');
                          mainScrollRef.current?.scrollTo({ y: 0, animated: true });
                        }}
                      >
                        <Radio color="#22C55E" size={12} strokeWidth={2.5} />
                        <Text style={styles.radarQuickText}>Track Radar</Text>
                      </LuxuryPressable>
                    </View>

                    {/* Book Flight CTA */}
                    <LuxuryPressable
                      style={styles.bookNowBtn}
                      onPress={() => handleOpenSeatMap(flight)}
                    >
                      <Text style={styles.bookNowText}>Book Flight</Text>
                      <ArrowRight color="#FFFFFF" size={13} strokeWidth={2.5} />
                    </LuxuryPressable>
                  </View>
                </View>
              </StaggeredFadeInUp>
            ))}
        </View>
        </>
        )}
      </ScrollView>

      {/* ========================================================================= */}
      {/* 1. SMART LOCATION AUTOCOMPLETE PICKER MODAL */}
      {/* ========================================================================= */}
      <Modal visible={showAirportModal} animationType="slide" transparent>
        <SafeAreaView style={styles.modalBackdrop}>
          <View style={styles.airportModalCard}>
            {/* Modal Header */}
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalTitle}>
                  Select {airportTarget === 'origin' ? 'Departure Airport' : 'Arrival Airport'}
                </Text>
                <Text style={styles.modalSub}>Global Luxury Hubs & Private FBO Terminals</Text>
              </View>
              <Pressable style={styles.closeBtn} onPress={() => setShowAirportModal(false)}>
                <X color="#FFFFFF" size={20} />
              </Pressable>
            </View>

            {/* Search Input Field */}
            <View style={styles.modalSearchBox}>
              <Search color="#94A3B8" size={18} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search by city, airport name, or 3-letter IATA (e.g. DXB, JFK)..."
                placeholderTextColor="#94A3B8"
                value={airportSearchQuery}
                onChangeText={setAirportSearchQuery}
                autoFocus
              />
              {airportSearchQuery.length > 0 && (
                <Pressable onPress={() => setAirportSearchQuery('')}>
                  <X color="#94A3B8" size={16} />
                </Pressable>
              )}
            </View>

            {/* Quick Hub Chips */}
            <View style={styles.quickHubsRow}>
              <Text style={styles.quickHubsLabel}>Top Hubs:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                {['DXB', 'LHR', 'CAI', 'DOH', 'JFK', 'CDG', 'HND', 'RUH'].map(code => (
                  <Pressable
                    key={code}
                    style={styles.quickHubPill}
                    onPress={() => {
                      const found = GLOBAL_AIRPORT_HUBS.find(h => h.code === code);
                      if (found) handleSelectAirport(found);
                    }}
                  >
                    <Text style={styles.quickHubText}>{code}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Autocomplete Results List (Virtualized FlatList with Flag SVG) */}
            <FlatList
              data={filteredAirports}
              keyExtractor={hub => hub.code}
              showsVerticalScrollIndicator={false}
              initialNumToRender={14}
              maxToRenderPerBatch={14}
              windowSize={7}
              keyboardShouldPersistTaps="handled"
              style={{ flex: 1, marginTop: 10 }}
              renderItem={({ item: hub }) => (
                <Pressable
                  style={styles.airportItemRow}
                  onPress={() => handleSelectAirport(hub)}
                >
                  <Flag emoji={hub.flag} size={30} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.airportCity}>{hub.city}, {hub.country}</Text>
                    <Text style={styles.airportFullName} numberOfLines={1}>{hub.name}</Text>
                  </View>
                  <View style={styles.airportIataBox}>
                    <Text style={styles.airportIataCode}>{hub.code}</Text>
                  </View>
                </Pressable>
              )}
            />
          </View>
        </SafeAreaView>
      </Modal>

      {/* ========================================================================= */}
      {/* 2. LUXURY RANGE CALENDAR BOTTOM SHEET MODAL */}
      {/* ========================================================================= */}
      <Modal visible={showCalendarModal} animationType="slide" transparent>
        <View style={styles.bottomSheetBackdrop}>
          <View style={[styles.calendarSheetCard, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
            {/* Handle bar */}
            <View style={styles.sheetHandle} />

            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalTitle}>Select Travel Dates</Text>
                <Text style={styles.modalSub}>
                  {tripType === 'round' ? 'Departure & Return Fluid Range Selection' : 'One-Way Departure Selection'}
                </Text>
              </View>
              <Pressable style={styles.closeBtn} onPress={() => setShowCalendarModal(false)}>
                <X color="#FFFFFF" size={20} />
              </Pressable>
            </View>

            {/* Range Summary Banner */}
            <View style={styles.rangeBanner}>
              <View style={styles.rangeBannerCol}>
                <Text style={styles.rangeBannerLabel}>DEPARTURE</Text>
                <Text style={styles.rangeBannerValue}>{tempRangeStart || 'Select Date'}</Text>
              </View>
              {tripType === 'round' && (
                <>
                  <ArrowRight color="#D4AF37" size={16} />
                  <View style={styles.rangeBannerCol}>
                    <Text style={styles.rangeBannerLabel}>RETURN</Text>
                    <Text style={styles.rangeBannerValue}>{tempRangeEnd || 'Select Date'}</Text>
                  </View>
                </>
              )}
            </View>

            {/* Month Header & Controls */}
            <View style={styles.monthHeaderRow}>
              <Pressable
                onPress={() =>
                  setCalendarMonth(
                    new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1)
                  )
                }
                style={styles.monthNavBtn}
              >
                <ChevronLeft color="#D4AF37" size={18} />
              </Pressable>

              <Text style={styles.monthTitle}>
                {calendarMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
              </Text>

              <Pressable
                onPress={() =>
                  setCalendarMonth(
                    new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)
                  )
                }
                style={styles.monthNavBtn}
              >
                <ChevronRight color="#D4AF37" size={18} />
              </Pressable>
            </View>

            {/* Day Names Row */}
            <View style={styles.weekDaysRow}>
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
                <Text key={d} style={styles.weekDayText}>
                  {d}
                </Text>
              ))}
            </View>

            {/* Days Grid with Range Highlight */}
            <View style={styles.daysGrid}>
              {calendarDays.map((item, idx) => {
                if (!item.isCurrentMonth) {
                  return <View key={`empty-${idx}`} style={styles.dayCell} />;
                }

                const isStart = tempRangeStart === item.dateStr;
                const isEnd = tempRangeEnd === item.dateStr;
                const isInRange =
                  tempRangeStart &&
                  tempRangeEnd &&
                  item.dateStr > tempRangeStart &&
                  item.dateStr < tempRangeEnd;

                return (
                  <Pressable
                    key={item.dateStr}
                    style={[
                      styles.dayCell,
                      isInRange && styles.dayCellInRange,
                      isStart && styles.dayCellStart,
                      isEnd && styles.dayCellEnd,
                    ]}
                    onPress={() => handleCalendarDayPress(item.dateStr)}
                  >
                    <View
                      style={[
                        styles.dayCircle,
                        (isStart || isEnd) && styles.dayCircleActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayNumText,
                          (isStart || isEnd) && styles.dayNumTextActive,
                          isInRange && styles.dayNumTextInRange,
                        ]}
                      >
                        {item.dayNum}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* Confirm Dates Button */}
            <LuxuryPressable style={styles.confirmDatesBtn} onPress={handleConfirmCalendar}>
              <Text style={styles.confirmDatesText}>Confirm Selected Dates</Text>
            </LuxuryPressable>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* 3. PASSENGERS & CLASS SELECTOR MODAL */}
      {/* ========================================================================= */}
      <Modal visible={showPassengerModal} animationType="slide" transparent>
        <View style={styles.bottomSheetBackdrop}>
          <View style={[styles.passengerSheetCard, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
            <View style={styles.sheetHandle} />

            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalTitle}>Passengers & Cabin Class</Text>
                <Text style={styles.modalSub}>Tailor your luxury seating preferences</Text>
              </View>
              <Pressable style={styles.closeBtn} onPress={() => setShowPassengerModal(false)}>
                <X color="#FFFFFF" size={20} />
              </Pressable>
            </View>

            {/* Cabin Class Selection */}
            <Text style={styles.inputSectionTitle}>SELECT TRAVEL CLASS</Text>
            <View style={styles.classGrid}>
              {(['Economy', 'Business', 'First', 'VIP Jet'] as TravelClass[]).map(cls => {
                const active = travelClass === cls;
                return (
                  <Pressable
                    key={cls}
                    style={[styles.classOptionBtn, active && styles.classOptionBtnActive]}
                    onPress={() => setTravelClass(cls)}
                  >
                    <Text style={[styles.classOptionText, active && styles.classOptionTextActive]}>
                      {cls}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Passenger Counts */}
            <Text style={[styles.inputSectionTitle, { marginTop: 18 }]}>PASSENGER COUNT</Text>

            {/* Adults */}
            <View style={styles.paxCounterRow}>
              <View>
                <Text style={styles.paxTypeTitle}>Adults</Text>
                <Text style={styles.paxTypeSub}>Age 12+ years</Text>
              </View>
              <View style={styles.vectorCounter}>
                <Pressable
                  style={[styles.vectorBtn, adults <= 1 && styles.vectorBtnDisabled]}
                  onPress={() => setAdults(Math.max(1, adults - 1))}
                  disabled={adults <= 1}
                >
                  <Minus color={adults <= 1 ? '#64748B' : '#D4AF37'} size={14} strokeWidth={2.4} />
                </Pressable>
                <Text style={styles.vectorCountText}>{adults}</Text>
                <Pressable
                  style={styles.vectorBtn}
                  onPress={() => setAdults(Math.min(9, adults + 1))}
                >
                  <Plus color="#D4AF37" size={14} strokeWidth={2.4} />
                </Pressable>
              </View>
            </View>

            {/* Children */}
            <View style={styles.paxCounterRow}>
              <View>
                <Text style={styles.paxTypeTitle}>Children</Text>
                <Text style={styles.paxTypeSub}>Age 2-11 years</Text>
              </View>
              <View style={styles.vectorCounter}>
                <Pressable
                  style={[styles.vectorBtn, children <= 0 && styles.vectorBtnDisabled]}
                  onPress={() => setChildren(Math.max(0, children - 1))}
                  disabled={children <= 0}
                >
                  <Minus color={children <= 0 ? '#64748B' : '#D4AF37'} size={14} strokeWidth={2.4} />
                </Pressable>
                <Text style={styles.vectorCountText}>{children}</Text>
                <Pressable
                  style={styles.vectorBtn}
                  onPress={() => setChildren(Math.min(8, children + 1))}
                >
                  <Plus color="#D4AF37" size={14} strokeWidth={2.4} />
                </Pressable>
              </View>
            </View>

            {/* Infants */}
            <View style={styles.paxCounterRow}>
              <View>
                <Text style={styles.paxTypeTitle}>Infants</Text>
                <Text style={styles.paxTypeSub}>Under 2 years (in lap)</Text>
              </View>
              <View style={styles.vectorCounter}>
                <Pressable
                  style={[styles.vectorBtn, infants <= 0 && styles.vectorBtnDisabled]}
                  onPress={() => setInfants(Math.max(0, infants - 1))}
                  disabled={infants <= 0}
                >
                  <Minus color={infants <= 0 ? '#64748B' : '#D4AF37'} size={14} strokeWidth={2.4} />
                </Pressable>
                <Text style={styles.vectorCountText}>{infants}</Text>
                <Pressable
                  style={styles.vectorBtn}
                  onPress={() => setInfants(Math.min(4, infants + 1))}
                >
                  <Plus color="#D4AF37" size={14} strokeWidth={2.4} />
                </Pressable>
              </View>
            </View>

            {/* Done Button */}
            <LuxuryPressable
              style={styles.confirmDatesBtn}
              onPress={() => setShowPassengerModal(false)}
            >
              <Text style={styles.confirmDatesText}>Done ({totalPassengers} Passengers)</Text>
            </LuxuryPressable>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* 4. DYNAMIC LIVE AIRCRAFT SEAT MAP MODAL (Requirement 3) */}
      {/* ========================================================================= */}
      <Modal visible={showSeatMapModal} animationType="slide" transparent>
        <SafeAreaView style={styles.modalBackdrop}>
          <View style={styles.seatModalCard}>
            {/* Modal Header */}
            <View style={styles.modalHeaderRow}>
              <View style={{ flex: 1 }}>
                <View style={styles.seatModalHeaderTop}>
                  <View style={styles.liveGdsPill}>
                    <View style={styles.livePulseDot} />
                    <Text style={styles.liveGdsPillText}>LIVE GDS SEAT INVENTORY</Text>
                  </View>
                  <Text style={styles.seatAircraftBadge}>{selectedFlightForSeat?.aircraft}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  {selectedFlightForSeat && <AirlineLogo airline={selectedFlightForSeat.airline} size={26} />}
                  <Text style={styles.modalTitle}>
                    {selectedFlightForSeat?.airline} {selectedFlightForSeat?.flightNumber}
                  </Text>
                </View>
                <Text style={styles.modalSub}>
                  {liveSeatMap?.deckName || 'VIP Suites Cabin'} • {liveSeatMap?.layout || '1-2-1 Direct Aisle Access'}
                </Text>
              </View>
              <Pressable style={styles.closeBtn} onPress={() => setShowSeatMapModal(false)}>
                <X color="#FFFFFF" size={20} />
              </Pressable>
            </View>

            {/* Loading State or Seat Grid */}
            {isLoadingSeatMap ? (
              <View style={styles.seatLoadingContainer}>
                <ActivityIndicator color="#D4AF37" size="large" />
                <Text style={styles.seatLoadingText}>
                  Querying Live Aircraft Configuration via Duffel API…
                </Text>
                <Text style={styles.seatLoadingSub}>
                  Verifying real-time cabin availability, lie-flat bed dimensions, and suite statuses
                </Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.seatScrollContent}>
                {/* Status Legend */}
                <View style={styles.seatLegendRow}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendBox, styles.seatAvailBox]} />
                    <Text style={styles.legendText}>Available ({liveSeatMap?.availableSeats ?? 0})</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendBox, styles.seatSelectedBox]} />
                    <Text style={styles.legendText}>Selected</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendBox, styles.seatOccupiedBox]} />
                    <Text style={styles.legendText}>Occupied ({liveSeatMap?.occupiedSeats ?? 0})</Text>
                  </View>
                </View>

                {/* Fuselage Nose Vector */}
                <View style={styles.fuselageNose}>
                  <View style={{ transform: [{ rotate: '-45deg' }], alignItems: 'center', justifyContent: 'center' }}>
                    <Plane color="#D4AF37" size={20} strokeWidth={2.4} fill="#D4AF37" />
                  </View>
                  <Text style={styles.fuselageNoseText}>COCKPIT / FORWARD SUITES</Text>
                </View>

                {/* Seat Grid Rows */}
                <View style={styles.seatGridContainer}>
                  {liveSeatMap?.rows.map(row => (
                    <View key={`row-${row.rowNumber}`} style={styles.seatRow}>
                      <View style={styles.rowNumberPill}>
                        <Text style={styles.rowNumberText}>{row.rowNumber}</Text>
                      </View>

                      <View style={styles.seatRowSeats}>
                        {row.seats.map(seat => {
                          const isSelected = selectedSeat?.id === seat.id;
                          const isOccupied = seat.status === 'occupied';

                          return (
                            <Pressable
                              key={seat.id}
                              disabled={isOccupied}
                              style={[
                                styles.seatPill,
                                isOccupied && styles.seatPillOccupied,
                                isSelected && styles.seatPillSelected,
                              ]}
                              onPress={() => setSelectedSeat(seat)}
                            >
                              <Armchair
                                color={isSelected ? '#1C1917' : isOccupied ? '#94A3B8' : '#D4AF37'}
                                size={14}
                                strokeWidth={isSelected ? 2.6 : 2}
                              />
                              <Text
                                style={[
                                  styles.seatPillId,
                                  isOccupied && styles.seatPillIdOccupied,
                                  isSelected && styles.seatPillIdSelected,
                                ]}
                              >
                                {seat.id}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                  ))}
                </View>

                {/* Selected Seat Details Banner */}
                {selectedSeat ? (
                  <View style={styles.selectedSeatCard}>
                    <View style={styles.selectedSeatHeader}>
                      <View style={styles.selectedSeatBadge}>
                        <Text style={styles.selectedSeatBadgeText}>SUITE {selectedSeat.id}</Text>
                      </View>
                      <Text style={styles.selectedSeatTypeName}>
                        {selectedSeat.type === 'window'
                          ? 'Window Panorama Suite'
                          : selectedSeat.type === 'suite'
                          ? 'Enclosed First Suite'
                          : 'Lie-Flat Suite'}
                      </Text>
                    </View>

                    <View style={styles.featuresList}>
                      {selectedSeat.features.map((feat, fIdx) => (
                        <View key={fIdx} style={styles.featureItemRow}>
                          <Check color="#D4AF37" size={13} strokeWidth={2.5} />
                          <Text style={styles.featureItemText}>{feat}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : (
                  <View style={styles.selectSeatHintBox}>
                    <Armchair color="#64748B" size={18} strokeWidth={1.8} />
                    <Text style={styles.selectSeatHintText}>
                      Tap any available suite to inspect lie-flat bed features & reserve
                    </Text>
                  </View>
                )}

                {/* Action Button: Confirm & Book */}
                <LuxuryPressable
                  style={[styles.confirmSeatBtn, !selectedSeat && styles.confirmSeatBtnDisabled]}
                  disabled={!selectedSeat}
                  onPress={() => {
                    setShowSeatMapModal(false);
                    if (selectedFlightForSeat) {
                      navigation.navigate('PassengerDetails', {
                        flightId: selectedFlightForSeat.id,
                        airline: selectedFlightForSeat.airline,
                        airlineCode: selectedFlightForSeat.airlineCode,
                        flightNumber: selectedFlightForSeat.flightNumber,
                        origin: selectedFlightForSeat.origin,
                        originCode: selectedFlightForSeat.originCode,
                        destination: selectedFlightForSeat.destination,
                        destinationCode: selectedFlightForSeat.destinationCode,
                        departureTime: selectedFlightForSeat.departureTime,
                        arrivalTime: selectedFlightForSeat.arrivalTime,
                        duration: selectedFlightForSeat.duration,
                        passengers: adults + children,
                        basePrice: selectedFlightForSeat.basePrice || selectedFlightForSeat.price,
                        totalPrice: selectedFlightForSeat.totalPrice || selectedFlightForSeat.price,
                        selectedSeats: selectedSeat ? [selectedSeat.id] : ['01A'],
                      });
                    }
                  }}
                >
                  <Text style={styles.confirmSeatBtnText}>
                    {selectedSeat
                      ? `Confirm Suite ${selectedSeat.id} & Proceed to Booking`
                      : 'Select a Suite to Proceed'}
                  </Text>
                  <ArrowRight color="#FFFFFF" size={16} strokeWidth={2.2} />
                </LuxuryPressable>
              </ScrollView>
            )}
          </View>
        </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
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
  headerTextCol: {
    flex: 1,
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.2,
  },
  headerSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  logoBadgeContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: '#D4AF37',
    backgroundColor: '#FFFFFF',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadgeImg: {
    width: '100%',
    height: '100%',
  },

  scrollContent: {
    paddingTop: 14,
  },

  // 1. Engine Card
  engineCard: {
    marginHorizontal: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },

  // Segmented Control
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: '#FAF9F6',
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
    position: 'relative',
    height: 44,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  slidingIndicator: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    width: '33.33%',
    backgroundColor: '#D4AF37',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  segmentText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#94A3B8',
  },
  segmentTextActive: {
    color: '#1C1917',
    fontWeight: '800',
  },

  // Location Route Inputs
  locationContainer: {
    gap: 10,
    position: 'relative',
    marginBottom: 14,
  },
  locationInputBox: {
    backgroundColor: '#FAF9F6',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  locationHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  iataBadge: {
    fontSize: 12,
    fontWeight: '900',
    color: '#D4AF37',
    letterSpacing: 1,
  },
  locationValRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationValText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1C1917',
    flex: 1,
  },
  swapFloatingBtn: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },

  // Multi-City Leg Cards
  multiCityWrapper: {
    gap: 10,
    marginBottom: 14,
  },
  legCard: {
    backgroundColor: '#FAF9F6',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  legHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  legTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1C1917',
  },
  legRow: {
    flexDirection: 'row',
    gap: 10,
  },
  legInput: {
    flex: 1,
  },
  legValueText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1917',
    marginTop: 2,
  },
  addLegBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    borderRadius: 10,
  },
  addLegText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#D4AF37',
  },

  // Meta Row (Dates & Passengers)
  metaRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  metaCol: {
    flex: 1,
    backgroundColor: '#FAF9F6',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  metaLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  metaValRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaValText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1917',
    flex: 1,
  },

  // The Global Search Button
  globalSearchBtn: {
    backgroundColor: '#D4AF37',
    borderRadius: 16,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  globalSearchBtnDisabled: {
    opacity: 0.75,
  },
  searchBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  globalSearchBtnText: {
    color: '#1C1917',
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },

  // Accreditation Bar
  accreditationBar: {
    marginHorizontal: 18,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  accreditationText: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
    flex: 1,
  },

  // Cabin Filter
  cabinFilterSection: {
    marginTop: 18,
    paddingHorizontal: 18,
  },
  cabinFilterTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  filterScroll: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  filterChipActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#1C1917',
    fontWeight: '800',
  },

  // Flight Cards
  flightsListContainer: {
    marginTop: 12,
    paddingHorizontal: 18,
    gap: 14,
  },
  flightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  airlineBadgeCol: {
    gap: 2,
  },
  airlineName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1917',
  },
  aircraftName: {
    fontSize: 11,
    color: '#64748B',
  },
  flightNumberBadge: {
    backgroundColor: '#FAF9F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 0.8,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  flightNumberText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 0.8,
  },

  // Timeline
  timelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  timeCol: {
    width: 80,
  },
  timeBig: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1C1917',
  },
  iataBig: {
    fontSize: 13,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 0.6,
    marginTop: 1,
  },
  cityNameText: {
    fontSize: 11,
    color: '#64748B',
  },
  flightPathCol: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  durationText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  flightLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
    gap: 4,
  },
  flightLineDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#D4AF37',
  },
  flightLineDash: {
    flex: 1,
    height: 1.5,
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
  },
  nonstopBadge: {
    fontSize: 9.5,
    color: '#10B981',
    fontWeight: '700',
    marginTop: 4,
  },

  // Amenities
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  cabinClassPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FAF9F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 0.8,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  cabinClassPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D4AF37',
  },
  baggagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF9F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  baggageText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },

  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(28, 25, 23, 0.08)',
    marginVertical: 12,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rateLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1C1917',
  },
  perPersonText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
  },
  bookNowBtn: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bookNowText: {
    color: '#1C1917',
    fontSize: 12.5,
    fontWeight: '800',
  },

  // Modals Styling
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(28, 25, 23, 0.45)',
  },
  airportModalCard: {
    flex: 1,
    marginTop: 40,
    backgroundColor: '#FAF9F6',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: '#D4AF37',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1C1917',
  },
  modalSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    paddingHorizontal: 14,
    height: 48,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#1C1917',
  },
  quickHubsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  quickHubsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  quickHubPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  quickHubText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D4AF37',
  },
  airportItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(28, 25, 23, 0.06)',
  },
  airportFlag: {
    fontSize: 22,
  },
  airportCity: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1917',
  },
  airportFullName: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  airportIataBox: {
    backgroundColor: '#FAF9F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  airportIataCode: {
    fontSize: 13,
    fontWeight: '900',
    color: '#D4AF37',
    letterSpacing: 0.8,
  },

  // Calendar Sheet
  bottomSheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(28, 25, 23, 0.45)',
    justifyContent: 'flex-end',
  },
  calendarSheetCard: {
    backgroundColor: '#FAF9F6',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderTopColor: '#D4AF37',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(28, 25, 23, 0.2)',
    alignSelf: 'center',
    marginBottom: 12,
  },
  rangeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
  },
  rangeBannerCol: {
    flex: 1,
  },
  rangeBannerLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#D4AF37',
    letterSpacing: 0.6,
  },
  rangeBannerValue: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1C1917',
    marginTop: 2,
  },
  monthHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  monthNavBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1917',
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  weekDayText: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: '#D4AF37',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellInRange: {
    backgroundColor: 'rgba(212, 175, 55, 0.16)', // Highly muted gold tint range highlight
  },
  dayCellStart: {
    backgroundColor: 'rgba(212, 175, 55, 0.16)',
    borderTopLeftRadius: 21,
    borderBottomLeftRadius: 21,
  },
  dayCellEnd: {
    backgroundColor: 'rgba(212, 175, 55, 0.16)',
    borderTopRightRadius: 21,
    borderBottomRightRadius: 21,
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleActive: {
    backgroundColor: '#D4AF37',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
  },
  dayNumText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1917',
  },
  dayNumTextActive: {
    color: '#1C1917',
    fontWeight: '800',
  },
  dayNumTextInRange: {
    color: '#D4AF37',
    fontWeight: '700',
  },
  confirmDatesBtn: {
    backgroundColor: '#D4AF37',
    borderRadius: 16,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  confirmDatesText: {
    color: '#1C1917',
    fontSize: 14,
    fontWeight: '800',
  },

  // Passenger Sheet
  passengerSheetCard: {
    backgroundColor: '#FAF9F6',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderTopColor: '#D4AF37',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  inputSectionTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  classGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  classOptionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  classOptionBtnActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  classOptionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  classOptionTextActive: {
    color: '#1C1917',
    fontWeight: '800',
  },
  paxCounterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(28, 25, 23, 0.08)',
  },
  paxTypeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1917',
  },
  paxTypeSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  vectorCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vectorBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  vectorBtnDisabled: {
    borderColor: 'rgba(28, 25, 23, 0.1)',
    backgroundColor: '#FAF9F6',
  },
  vectorCountText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1917',
    minWidth: 18,
    textAlign: 'center',
  },

  // Live Feed Banner (Requirement 2)
  liveFeedBanner: {
    marginHorizontal: 18,
    marginTop: 8,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#22C55E',
  },
  liveFeedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 0.8,
    flex: 1,
  },

  // Top Mode Segmented Bar
  topModeBar: {
    flexDirection: 'row',
    marginHorizontal: 18,
    marginTop: 10,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  topModeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 10,
    borderRadius: 11,
  },
  topModeBtnActive: {
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  topModeText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#64748B',
  },
  topModeTextActive: {
    color: '#1C1917',
    fontWeight: '800',
  },
  liveRadarDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  // Flight Card Extra Styles
  terminalSubText: {
    fontSize: 9.5,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
    maxWidth: 110,
  },
  taxBreakdownSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '500',
  },
  cardActionsCol: {
    gap: 6,
    alignItems: 'flex-end',
  },
  cardActionsSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  radarQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FAF9F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  radarQuickText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1C1917',
  },
  seatMapActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAF9F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  seatMapActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D4AF37',
  },

  // Graceful Empty State Screen (Requirement 4)
  emptyStateCard: {
    marginHorizontal: 18,
    marginTop: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  emptyActionsRow: {
    width: '100%',
    gap: 10,
  },
  emptyConciergeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#D4AF37',
    height: 48,
    borderRadius: 14,
    width: '100%',
  },
  emptyConciergeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.4,
  },
  emptyModifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    height: 46,
    borderRadius: 14,
    width: '100%',
  },
  emptyModifyText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1C1917',
    letterSpacing: 0.3,
  },

  // Dynamic Live Seat Map Modal (Requirement 3)
  seatModalCard: {
    backgroundColor: '#FAF9F6',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderTopColor: '#D4AF37',
    maxHeight: '92%',
    height: '90%',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  seatModalHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  liveGdsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FAF9F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  liveGdsPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 0.6,
  },
  seatAircraftBadge: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  seatLoadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  seatLoadingText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1917',
    textAlign: 'center',
    marginTop: 8,
  },
  seatLoadingSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 280,
  },
  seatScrollContent: {
    paddingBottom: 30,
    alignItems: 'center',
  },
  seatLegendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 12,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(28, 25, 23, 0.08)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendBox: {
    width: 14,
    height: 14,
    borderRadius: 4,
  },
  seatAvailBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  seatSelectedBox: {
    backgroundColor: '#D4AF37',
  },
  seatOccupiedBox: {
    backgroundColor: 'rgba(28, 25, 23, 0.15)',
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  fuselageNose: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    marginBottom: 14,
    gap: 4,
  },
  fuselageNoseText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1.2,
  },
  seatGridContainer: {
    width: '100%',
    gap: 10,
    paddingVertical: 6,
  },
  seatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
  },
  rowNumberPill: {
    width: 24,
    alignItems: 'center',
  },
  rowNumberText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D4AF37',
  },
  seatRowSeats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingLeft: 10,
  },
  seatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 54,
  },
  seatPillOccupied: {
    backgroundColor: 'rgba(28, 25, 23, 0.08)',
    borderColor: 'rgba(28, 25, 23, 0.1)',
    opacity: 0.55,
  },
  seatPillSelected: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  seatPillId: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1C1917',
  },
  seatPillIdOccupied: {
    color: '#94A3B8',
  },
  seatPillIdSelected: {
    color: '#1C1917',
  },
  selectedSeatCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.5)',
    padding: 16,
    marginTop: 18,
  },
  selectedSeatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  selectedSeatBadge: {
    backgroundColor: '#FAF9F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  selectedSeatBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#D4AF37',
    letterSpacing: 0.8,
  },
  selectedSeatTypeName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1C1917',
  },
  featuresList: {
    gap: 6,
  },
  featureItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureItemText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  selectSeatHintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FAF9F6',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    marginTop: 16,
  },
  selectSeatHintText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },
  confirmSeatBtn: {
    width: '100%',
    height: 52,
    backgroundColor: '#D4AF37',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D4AF37',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  confirmSeatBtnDisabled: {
    opacity: 0.5,
  },
  confirmSeatBtnText: {
    color: '#1C1917',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
