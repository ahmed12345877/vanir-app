import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Alert,
  BackHandler,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  FlatList,
  Linking,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Globe,
  Calendar,
  Check,
  CheckCircle2,
  ShieldCheck,
  Plane,
  Building,
  Building2,
  Briefcase,
  Layers,
  Sparkles,
  Package,
  BookOpen,
  Compass,
  Landmark,
  Wifi,
  CreditCard,
  Lock,
  Mail,
  Phone,
  User,
  RefreshCw,
  FileDown,
  X,
  ExternalLink,
  Clock,
  ArrowRight,
  ArrowUpDown,
  Search,
  Info,
  Umbrella,
  FileCheck2,
  HelpCircle,
  MapPin,
  IdCard,
  FolderOpen,
  ChevronDown,
  Star,
  Bed,
} from 'lucide-react-native';
import { formatEnglishNumber } from '../../lib/formatters';
import { LuxuryPressable } from '../../components/LuxuryMicroInteractions';
import {
  CommercialFlightIcon,
  HotelResortIcon,
  GlobalEsimIcon,
  FastTrackIcon,
  LuxuryTourIcon,
  OfficesIcon,
  VisaServiceIcon,
} from '../../components/LuxuryNavIcons';
import { Vanir3DIcon } from '../../components/Vanir3DIcon';
import { Flag } from '../../components/Flag';
import { VisaDocumentPdfModal, type VisaDocType } from '../../components/VisaDocumentPdfModal';
import { VipFlexibleDatePickerModal } from '../../components/VipFlexibleDatePickerModal';
import { getLocalBookingsHistory } from '../../services/paymentGateway';
import {
  WORLD_COUNTRIES,
  AIRPORT_OPTIONS,
  LUXURY_HOTELS_OPTIONS,
  EMBASSIES_DIRECTORY,
  computeVisaRule,
  type CountryOption,
  type AirportOption,
  type HotelOption,
} from '../../data/visaWorldData';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

import { useWindowDimensions } from 'react-native';

const GRID_GAP = 8;

export type VisaSubView =
  | 'grid'
  | 'search'
  | 'packages'
  | 'insurance'
  | 'noc'
  | 'flight'
  | 'hotel'
  | 'itinerary'
  | 'embassies'
  | 'orders';

export function VisaScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const currentUser = auth().currentUser;
  const { width: screenWidth } = useWindowDimensions();

  // Dynamic calculation guaranteed to never collapse on any Android screen
  const tileWidth = useMemo(() => {
    const available = Math.max(screenWidth, 320) - 32; // 16px screen padding on each side
    return Math.floor((available - 16) / 3); // 8px between 3 columns
  }, [screenWidth]);

  // Active View Tab State
  const [activeView, setActiveView] = useState<VisaSubView>('grid');

  // ── 1. HARDWARE BACK BUTTON HANDLER ───────────────────────────────────────
  // CRITICAL FIX: If inside any sub-view, go back to 'grid' first! Never exit the screen!
  useEffect(() => {
    const onBackPress = () => {
      if (activeView !== 'grid') {
        setActiveView('grid');
        return true; // handled, do not pop navigation
      }
      return false; // let react navigation pop screen
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [activeView]);

  // Back Button in Header
  const handleBack = () => {
    if (activeView !== 'grid') {
      setActiveView('grid');
    } else {
      navigation.goBack();
    }
  };

  // ── 2. SEARCH & ELIGIBILITY TOOL STATE (All World Countries) ───────────────
  const [selectedNationality, setSelectedNationality] = useState<CountryOption>(
    WORLD_COUNTRIES.find(c => c.id === 'eg') || WORLD_COUNTRIES[0]
  );
  const [selectedResidence, setSelectedResidence] = useState<CountryOption>(
    WORLD_COUNTRIES.find(c => c.id === 'eg') || WORLD_COUNTRIES[0]
  );
  const [selectedDestination, setSelectedDestination] = useState<CountryOption>(
    WORLD_COUNTRIES.find(c => c.id === 'fr') || WORLD_COUNTRIES[22]
  );
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Search Modals State
  const [showNatModal, setShowNatModal] = useState(false);
  const [showResModal, setShowResModal] = useState(false);
  const [showDestModal, setShowDestModal] = useState(false);
  const [countryFilterText, setCountryFilterText] = useState('');
  const [selectedContinentFilter, setSelectedContinentFilter] = useState<string>('all');

  const filteredCountries = useMemo(() => {
    return WORLD_COUNTRIES.filter(c => {
      const matchRegion = selectedContinentFilter === 'all' || c.continent === selectedContinentFilter;
      const q = countryFilterText.trim().toLowerCase();
      const matchText =
        !q ||
        c.nameAr.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q);
      return matchRegion && matchText;
    });
  }, [countryFilterText, selectedContinentFilter]);

  const activeVisaRule = useMemo(() => {
    return computeVisaRule(selectedNationality, selectedDestination);
  }, [selectedNationality, selectedDestination]);

  // ── 3. EMBASSY FLIGHT RESERVATION STATE ────────────────────────────────────
  const [flightTripType, setFlightTripType] = useState<'round' | 'oneway'>('round');
  const [flightOriginAirport, setFlightOriginAirport] = useState<AirportOption>(AIRPORT_OPTIONS[0]); // CAI
  const [flightDestAirport, setFlightDestAirport] = useState<AirportOption>(AIRPORT_OPTIONS[14]); // CDG
  const [flightDepartDate, setFlightDepartDate] = useState('2026-11-20');
  const [flightReturnDate, setFlightReturnDate] = useState('2026-11-30');
  const [flightPassengers, setFlightPassengers] = useState(1);
  const [flightClass, setFlightClass] = useState<'Economy' | 'Business' | 'First'>('Economy');

  const [showOriginModal, setShowOriginModal] = useState(false);
  const [showDestAirportModal, setShowDestAirportModal] = useState(false);
  const [airportSearchText, setAirportSearchText] = useState('');

  const filteredAirports = useMemo(() => {
    const q = airportSearchText.trim().toLowerCase();
    if (!q) return AIRPORT_OPTIONS;
    return AIRPORT_OPTIONS.filter(
      a =>
        a.cityAr.toLowerCase().includes(q) ||
        a.cityEn.toLowerCase().includes(q) ||
        a.countryAr.toLowerCase().includes(q) ||
        a.airportName.toLowerCase().includes(q) ||
        a.code.toLowerCase().includes(q)
    );
  }, [airportSearchText]);

  const handleSwapAirports = () => {
    const temp = flightOriginAirport;
    setFlightOriginAirport(flightDestAirport);
    setFlightDestAirport(temp);
  };

  // Shared Applicant Identity across Consular Forms
  const [travelerFullName, setTravelerFullName] = useState(currentUser?.displayName || '');
  const [travelerPassport, setTravelerPassport] = useState('');

  // Embassy Flight Carrier Choice
  const EMBASSY_AIRLINES = useMemo(
    () => [
      { code: 'EK', name: 'Emirates', flightNo: 'EK 924' },
      { code: 'QR', name: 'Qatar Airways', flightNo: 'QR 1302' },
      { code: 'MS', name: 'EgyptAir', flightNo: 'MS 799' },
      { code: 'SV', name: 'Saudia', flightNo: 'SV 308' },
      { code: 'TK', name: 'Turkish Airlines', flightNo: 'TK 691' },
      { code: 'LH', name: 'Lufthansa', flightNo: 'LH 583' },
      { code: 'AF', name: 'Air France', flightNo: 'AF 503' },
      { code: 'BA', name: 'British Airways', flightNo: 'BA 155' },
      { code: 'EY', name: 'Etihad Airways', flightNo: 'EY 654' },
    ],
    [],
  );
  const [selectedFlightAirline, setSelectedFlightAirline] = useState(EMBASSY_AIRLINES[0]);

  // ── 4. CONFIRMED HOTEL RESERVATION STATE ───────────────────────────────────
  const [selectedHotel, setSelectedHotel] = useState<HotelOption>(LUXURY_HOTELS_OPTIONS[0]);
  const [useCustomHotel, setUseCustomHotel] = useState(false);
  const [customHotelName, setCustomHotelName] = useState('');
  const [customHotelCity, setCustomHotelCity] = useState('Paris, France');
  const [selectedRoomType, setSelectedRoomType] = useState<string>(LUXURY_HOTELS_OPTIONS[0].roomTypes[0]);
  const [hotelCheckInDate, setHotelCheckInDate] = useState('2026-11-20');
  const [hotelCheckOutDate, setHotelCheckOutDate] = useState('2026-11-30');
  const [hotelGuestsCount, setHotelGuestsCount] = useState(1);
  const [showHotelPickerModal, setShowHotelPickerModal] = useState(false);

  const hotelNights = useMemo(() => {
    try {
      const start = new Date(hotelCheckInDate).getTime();
      const end = new Date(hotelCheckOutDate).getTime();
      const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 1;
    } catch {
      return 1;
    }
  }, [hotelCheckInDate, hotelCheckOutDate]);

  // ── 5. WORK VERIFICATION / NOC LETTER STATE ─────────────────────────────────
  const [nocFullName, setNocFullName] = useState(currentUser?.displayName || '');
  const [nocPassportNumber, setNocPassportNumber] = useState('');
  const [nocJobTitle, setNocJobTitle] = useState('');
  const [nocCompany, setNocCompany] = useState('');
  const [nocSalary, setNocSalary] = useState('');
  const [nocCurrency, setNocCurrency] = useState('USD');
  const [nocManagerName, setNocManagerName] = useState('');
  const [nocManagerContact, setNocManagerContact] = useState('');
  const [nocStartDate, setNocStartDate] = useState('2021-01-15');
  const [nocTargetEmbassy, setNocTargetEmbassy] = useState('The Embassy of France (Schengen Visa Section)');
  const [showEmbassySelectorModal, setShowEmbassySelectorModal] = useState(false);

  // ── 6. TRAVEL INSURANCE STATE ──────────────────────────────────────────────
  const [insuranceDest, setInsuranceDest] = useState('European Schengen Area (29 States)');
  const [insuranceStartDate, setInsuranceStartDate] = useState('2026-11-20');
  const [insuranceDob, setInsuranceDob] = useState('1990-05-15');
  const [insuranceDurationDays, setInsuranceDurationDays] = useState(14);
  const [selectedProvider, setSelectedProvider] = useState<
    'AXA Schengen' | 'Allianz' | 'WorldTrips' | 'TRAWICK' | 'IMG'
  >('AXA Schengen');
  const [showInsuranceDestModal, setShowInsuranceDestModal] = useState(false);

  const computedInsuranceEndDate = useMemo(() => {
    try {
      const d = new Date(insuranceStartDate);
      if (isNaN(d.getTime())) return insuranceStartDate;
      d.setDate(d.getDate() + insuranceDurationDays);
      return d.toISOString().split('T')[0];
    } catch {
      return insuranceStartDate;
    }
  }, [insuranceStartDate, insuranceDurationDays]);

  // ── 6B. INTERACTIVE TOURISM ITINERARY STATE ────────────────────────────────
  const [itineraryDestination, setItineraryDestination] = useState('Paris & Nice, France');
  const [itineraryStartDate, setItineraryStartDate] = useState('2026-11-20');
  const [itineraryEndDate, setItineraryEndDate] = useState('2026-11-27');
  const [itineraryHotelName, setItineraryHotelName] = useState(LUXURY_HOTELS_OPTIONS[0].name);

  const generatedItineraryDays = useMemo(() => {
    const startMs = new Date(itineraryStartDate).getTime();
    const endMs = new Date(itineraryEndDate).getTime();
    const rawDays = Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24)) + 1;
    const totalDays = Math.min(10, Math.max(3, isNaN(rawDays) ? 5 : rawDays));
    const templates = [
      {
        title: `Arrival in ${itineraryDestination} & Hotel Check-in`,
        activities: `Arrival at International Airport, private transfer to ${itineraryHotelName}, check-in formalities & evening orientation walk in the historic center.`,
      },
      {
        title: `Cultural Landmarks & National Museums Tour`,
        activities: `Guided morning visit to iconic monuments, architectural landmarks, national art museums, and curated local heritage lunch.`,
      },
      {
        title: `Panoramic City Excursion & Old Quarter`,
        activities: `Full-day sightseeing across historic boulevards, waterfront promenade, botanical gardens, and traditional shopping arcades.`,
      },
      {
        title: `Regional Day Trip & Scenic Countryside`,
        activities: `Day excursion to surrounding cultural heritage sites, panoramic viewpoints, and authentic culinary tasting experience.`,
      },
      {
        title: `Gastronomy, Luxury Boulevards & River Cruise`,
        activities: `Leisurely morning at local cafés, flagship shopping district visit, and sunset sightseeing cruise.`,
      },
    ];
    return Array.from({ length: totalDays }).map((_, idx) => {
      if (idx === totalDays - 1) {
        return {
          dayNumber: idx + 1,
          title: `Hotel Check-out & Return International Departure`,
          activities: `Breakfast at ${itineraryHotelName}, check-out formalities, transfer to International Airport 3 hours prior to scheduled return flight.`,
          hotelStay: 'International Return Flight',
        };
      }
      const tpl = templates[idx % templates.length];
      return {
        dayNumber: idx + 1,
        title: tpl.title,
        activities: tpl.activities,
        hotelStay: itineraryHotelName || selectedHotel.name,
      };
    });
  }, [itineraryDestination, itineraryStartDate, itineraryEndDate, itineraryHotelName, selectedHotel.name]);

  // ── 7. GENERIC DATE PICKER CONTROLLER ──────────────────────────────────────
  type VisaDateTarget =
    | 'flightDepart'
    | 'flightReturn'
    | 'hotelCheckIn'
    | 'hotelCheckOut'
    | 'insStart'
    | 'insDob'
    | 'nocStart'
    | 'itinStart'
    | 'itinEnd';

  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState<VisaDateTarget>('flightDepart');
  const [datePickerMode, setDatePickerMode] = useState<'calendar' | 'past' | 'dob' | 'future'>('calendar');
  const [datePickerTitle, setDatePickerTitle] = useState('Select Date');
  const [datePickerInitialDate, setDatePickerInitialDate] = useState('2026-11-20');

  const openDatePicker = (
    target: VisaDateTarget,
    title: string,
    mode: 'calendar' | 'past' | 'dob' | 'future',
    initial: string,
  ) => {
    setDatePickerTarget(target);
    setDatePickerTitle(title);
    setDatePickerMode(mode);
    setDatePickerInitialDate(initial);
    setDatePickerVisible(true);
  };

  const handleDateSelected = (dateStr: string) => {
    switch (datePickerTarget) {
      case 'flightDepart':
        setFlightDepartDate(dateStr);
        break;
      case 'flightReturn':
        setFlightReturnDate(dateStr);
        break;
      case 'hotelCheckIn':
        setHotelCheckInDate(dateStr);
        break;
      case 'hotelCheckOut':
        setHotelCheckOutDate(dateStr);
        break;
      case 'insStart':
        setInsuranceStartDate(dateStr);
        break;
      case 'insDob':
        setInsuranceDob(dateStr);
        break;
      case 'nocStart':
        setNocStartDate(dateStr);
        break;
      case 'itinStart':
        setItineraryStartDate(dateStr);
        break;
      case 'itinEnd':
        setItineraryEndDate(dateStr);
        break;
    }
  };

  // ── 8. EMBASSIES DIRECTORY SEARCH ──────────────────────────────────────────
  const [embassySearchText, setEmbassySearchText] = useState('');
  const filteredEmbassies = useMemo(() => {
    const q = embassySearchText.trim().toLowerCase();
    if (!q) return EMBASSIES_DIRECTORY;
    return EMBASSIES_DIRECTORY.filter(
      e =>
        e.country.toLowerCase().includes(q) ||
        e.centerName.toLowerCase().includes(q) ||
        e.address.toLowerCase().includes(q)
    );
  }, [embassySearchText]);

  // ── 9. ORDERS MANAGEMENT STATE ─────────────────────────────────────────────
  const [ordersSearch, setOrdersSearch] = useState('');
  const [ordersFilter, setOrdersFilter] = useState<'all' | 'insurance' | 'packages' | 'noc' | 'flight' | 'hotel'>('all');
  const [myOrdersList, setMyOrdersList] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Sync Orders from Local Storage + Cloud Firestore
  useEffect(() => {
    if (activeView === 'orders') {
      setIsLoadingOrders(true);
      let isMounted = true;

      const mergeOrders = async (cloudDocs: any[]) => {
        const localRecords = await getLocalBookingsHistory();
        const combinedMap = new Map<string, any>();

        for (const loc of localRecords) {
          const bType = (loc.bookingType || '').toLowerCase();
          if (
            bType.includes('visa') ||
            bType.includes('insurance') ||
            bType.includes('noc') ||
            bType.includes('flight') ||
            bType.includes('hotel') ||
            bType.includes('itinerary')
          ) {
            combinedMap.set(loc.confirmationCode || loc.id, {
              id: loc.id,
              title: loc.itemName || 'Certified Consular Document',
              status: 'Confirmed & Complete',
              serviceType: loc.bookingType,
              guestName: loc.guestName,
              guestEmail: loc.guestEmail,
              guestPhone: loc.guestPhone,
              passportNumber: loc.passportNumber,
              startDate: loc.startDate,
              endDate: loc.endDate,
              guestsCount: loc.guestsCount,
              amount: loc.amount,
              confirmationCode: loc.confirmationCode,
              transactionId: loc.transactionId,
              paymentSummaryLabel: loc.paymentSummaryLabel,
              metadata: loc.metadata || {},
              createdAt: loc.createdAt,
              details: {
                referenceNumber: loc.confirmationCode || loc.id,
                fee: `$${loc.amount || 0}`,
              },
            });
          }
        }

        for (const d of cloudDocs) {
          const key = d.confirmationCode || d.id;
          if (!combinedMap.has(key)) {
            combinedMap.set(key, d);
          }
        }

        if (isMounted) {
          setMyOrdersList(Array.from(combinedMap.values()));
          setIsLoadingOrders(false);
        }
      };

      const unsubscribe = firestore()
        .collection('bookings')
        .orderBy('createdAt', 'desc')
        .limit(30)
        .onSnapshot(
          snapshot => {
            const list: any[] = [];
            snapshot?.forEach(doc => {
              const d = doc.data();
              const bType = (d.bookingType || '').toLowerCase();
              if (
                bType.includes('visa') ||
                bType.includes('insurance') ||
                bType.includes('noc') ||
                bType.includes('flight') ||
                bType.includes('hotel') ||
                bType.includes('itinerary')
              ) {
                list.push({
                  id: doc.id,
                  title: d.itemName || 'Certified Consular Document',
                  status: d.status === 'confirmed' ? 'Confirmed & Complete' : 'In Review',
                  serviceType: d.bookingType,
                  guestName: d.guestName,
                  guestEmail: d.guestEmail,
                  guestPhone: d.guestPhone,
                  passportNumber: d.passportNumber,
                  startDate: d.startDate,
                  endDate: d.endDate,
                  guestsCount: d.guestsCount,
                  amount: d.amount,
                  confirmationCode: d.confirmationCode,
                  transactionId: d.transactionId,
                  paymentSummaryLabel: d.paymentSummaryLabel,
                  metadata: d.metadata || {},
                  createdAt: d.createdAt,
                  details: {
                    referenceNumber: d.confirmationCode || doc.id,
                    fee: `$${d.amount || 0}`,
                  },
                });
              }
            });
            mergeOrders(list);
          },
          err => {
            console.warn('[VisaScreen] Orders listener fallback:', err);
            mergeOrders([]);
          },
        );
      return () => {
        isMounted = false;
        unsubscribe();
      };
    }
  }, [activeView]);

  // ── 10. PDF VIEWER MODAL (Used for orders review) ──────────────────────────
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [pdfDocType, setPdfDocType] = useState<VisaDocType>('insurance');
  const [pdfData, setPdfData] = useState<any>({ clientName: '' });

  const openOrderPdf = (order: any) => {
    const meta = order.metadata || {};
    const sType = (meta.visaDocType || order.serviceType || order.type || '').toLowerCase();
    let type: VisaDocType = 'package';
    if (sType.includes('insurance')) type = 'insurance';
    else if (sType.includes('noc')) type = 'noc';
    else if (sType.includes('flight')) type = 'flight';
    else if (sType.includes('hotel')) type = 'hotel';
    else if (sType.includes('itinerary')) type = 'itinerary';

    setPdfDocType(type);
    setPdfData({
      ...meta,
      referenceNumber: order.details?.referenceNumber || order.confirmationCode || order.id,
      issueDate: order.createdAt?.toDate
        ? order.createdAt.toDate().toLocaleDateString('en-GB')
        : typeof order.createdAt === 'string'
        ? new Date(order.createdAt).toLocaleDateString('en-GB')
        : undefined,
      clientName:
        meta.clientName ||
        order.guestName ||
        order.clientName ||
        currentUser?.displayName ||
        'VIP Client',
      passportNumber:
        meta.passportNumber || order.passportNumber || travelerPassport || 'VERIFIED ON FILE',
      email: order.guestEmail || currentUser?.email,
      phone: order.guestPhone,
      checkInDate: meta.checkInDate || order.startDate,
      checkOutDate: meta.checkOutDate || order.endDate,
      guestsCount: meta.guestsCount || order.guestsCount,
      destinationCountry: meta.destinationCountry || order.destination || 'Schengen & International',
      paymentMethod: order.paymentSummaryLabel,
      transactionId: order.transactionId,
      totalAmountPaid: order.amount || 49,
    });
    setPdfModalVisible(true);
  };

  // Direct checkout navigation with 100% of form metadata preserved
  const handleProceedToBooking = (
    item: { type: string; itemName: string; price: number },
    extraParams?: Record<string, any>,
  ) => {
    navigation.navigate('Booking', {
      type: item.type,
      bookingType: item.type,
      itemName: item.itemName,
      price: item.price,
      guestName: travelerFullName.trim() || nocFullName.trim() || currentUser?.displayName || '',
      passportNumber: travelerPassport.trim() || nocPassportNumber.trim() || '',
      ...extraParams,
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

      {/* ── LUXURY HEADER ────────────────────────────────────────── */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.headerBtn} hitSlop={12}>
          <ChevronLeft color="#1C1917" size={24} strokeWidth={2.4} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {activeView === 'grid' && 'Visa & Consular Services'}
            {activeView === 'search' && 'Visa Requirements Check'}
            {activeView === 'packages' && 'Curated Visa Packages'}
            {activeView === 'insurance' && 'Certified Travel Medical Insurance'}
            {activeView === 'noc' && 'Corporate Employment NOC Letter'}
            {activeView === 'flight' && 'Embassy Flight Itinerary (GDS)'}
            {activeView === 'hotel' && 'Confirmed Hotel Voucher'}
            {activeView === 'itinerary' && 'Detailed Tourist Travel Itinerary'}
            {activeView === 'embassies' && 'Global Embassies & Consular Directory'}
            {activeView === 'orders' && 'My Consular Bookings & Documents'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {activeView === 'grid' ? 'VANIR Diplomatic & Consular Desk' : '100% Consular Certified Worldwide'}
          </Text>
        </View>

        <Pressable
          onPress={() => setActiveView(activeView === 'orders' ? 'grid' : 'orders')}
          style={[styles.headerBtn, activeView === 'orders' && styles.headerBtnActive]}
          hitSlop={12}
        >
          <Clock color={activeView === 'orders' ? '#D4AF37' : '#1C1917'} size={20} strokeWidth={2.2} />
        </Pressable>
      </View>

      {/* ── BREADCRUMB BAR (Fast return to Grid) ────────────────── */}
      {activeView !== 'grid' && (
        <View style={styles.breadcrumbBar}>
          <Pressable onPress={() => setActiveView('grid')} style={styles.breadcrumbItem}>
            <Text style={styles.breadcrumbTextActive}>Services Home</Text>
          </Pressable>
          <ChevronRight color="#94A3B8" size={14} />
          <Text style={styles.breadcrumbTextCurrent} numberOfLines={1}>
            {activeView === 'search' && 'Requirements'}
            {activeView === 'packages' && 'Packages'}
            {activeView === 'insurance' && 'Insurance'}
            {activeView === 'noc' && 'NOC Letter'}
            {activeView === 'flight' && 'Flight GDS'}
            {activeView === 'hotel' && 'Hotel Voucher'}
            {activeView === 'itinerary' && 'Itinerary'}
            {activeView === 'embassies' && 'Embassies'}
            {activeView === 'orders' && 'My Bookings'}
          </Text>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
      >
        {/* ========================================================================= */}
        {/* VIEW 1: 3x3 LUXURY SERVICES TILES GRID (Matching Image 5) */}
        {/* ========================================================================= */}
        {activeView === 'grid' && (
          <View style={styles.gridSectionContainer}>
            <View style={styles.gridHeroCard}>
              <View style={styles.gridHeroBadgeRow}>
                <ShieldCheck color="#D4AF37" size={16} />
                <Text style={styles.gridHeroBadgeText}>100% Consular Certified Worldwide</Text>
              </View>
              <Text style={styles.gridHeroTitle}>Global Diplomatic & Consular Desk</Text>
              <Text style={styles.gridHeroSub}>
                Everything required for your visa application: embassy reservations, certified insurance, and employment NOC letters.
              </Text>
            </View>

            {/* 3x3 Grid */}
            <View style={styles.luxuryGrid}>
              {/* Tile 1: Visas */}
              <Pressable
                style={({ pressed }) => [styles.gridTile, { width: tileWidth }, pressed && styles.gridTilePressed]}
                onPress={() => setActiveView('search')}
              >
                <Vanir3DIcon name="visa" size={48} style={{ marginBottom: 8 }} />
                <Text style={styles.gridTileTitle} numberOfLines={1}>Visas</Text>
                <Text style={styles.gridTileDesc} numberOfLines={2}>Eligibility & Requirements</Text>
              </Pressable>

              {/* Tile 2: Global eSIM */}
              <Pressable
                style={({ pressed }) => [styles.gridTile, { width: tileWidth }, pressed && styles.gridTilePressed]}
                onPress={() => navigation.navigate('ESIM')}
              >
                <Vanir3DIcon name="esim" size={48} style={{ marginBottom: 8 }} />
                <Text style={styles.gridTileTitle} numberOfLines={1}>Global eSIM</Text>
                <Text style={styles.gridTileDesc} numberOfLines={2}>Global 5G Roaming Plans</Text>
              </Pressable>

              {/* Tile 3: Insurance (Pure Gold Theme) */}
              <Pressable
                style={({ pressed }) => [styles.gridTile, { width: tileWidth }, pressed && styles.gridTilePressed]}
                onPress={() => setActiveView('insurance')}
              >
                <Vanir3DIcon name="insurance" size={48} style={{ marginBottom: 8 }} />
                <Text style={styles.gridTileTitle} numberOfLines={1}>Insurance</Text>
                <Text style={styles.gridTileDesc} numberOfLines={2}>Certified $50,000 Worldwide</Text>
              </Pressable>

              {/* Tile 4: Flight Itinerary (GDS) */}
              <Pressable
                style={({ pressed }) => [styles.gridTile, { width: tileWidth }, pressed && styles.gridTilePressed]}
                onPress={() => setActiveView('flight')}
              >
                <Vanir3DIcon name="jets" size={48} style={{ marginBottom: 8 }} />
                <Text style={styles.gridTileTitle} numberOfLines={1}>Flight GDS</Text>
                <Text style={styles.gridTileDesc} numberOfLines={2}>Verified PNR for Embassies</Text>
              </Pressable>

              {/* Tile 5: Hotel Voucher (Pure Gold Theme) */}
              <Pressable
                style={({ pressed }) => [styles.gridTile, { width: tileWidth }, pressed && styles.gridTilePressed]}
                onPress={() => setActiveView('hotel')}
              >
                <Vanir3DIcon name="hotels" size={48} style={{ marginBottom: 8 }} />
                <Text style={styles.gridTileTitle} numberOfLines={1}>Hotel Voucher</Text>
                <Text style={styles.gridTileDesc} numberOfLines={2}>Confirmed Embassy Stay Voucher</Text>
              </Pressable>

              {/* Tile 6: NOC Letter */}
              <Pressable
                style={({ pressed }) => [styles.gridTile, { width: tileWidth }, pressed && styles.gridTilePressed]}
                onPress={() => setActiveView('noc')}
              >
                <Vanir3DIcon name="noc" size={48} style={{ marginBottom: 8 }} />
                <Text style={styles.gridTileTitle} numberOfLines={1}>NOC Letter</Text>
                <Text style={styles.gridTileDesc} numberOfLines={2}>Official English NOC Certificate</Text>
              </Pressable>

              {/* Tile 7: Visa Packages */}
              <Pressable
                style={({ pressed }) => [styles.gridTile, { width: tileWidth }, pressed && styles.gridTilePressed]}
                onPress={() => setActiveView('packages')}
              >
                <Vanir3DIcon name="packages" size={48} style={{ marginBottom: 8 }} />
                <Text style={styles.gridTileTitle} numberOfLines={1}>Visa Packages</Text>
                <Text style={styles.gridTileDesc} numberOfLines={2}>Silver • Gold • VIP</Text>
              </Pressable>

              {/* Tile 8: Itinerary */}
              <Pressable
                style={({ pressed }) => [styles.gridTile, { width: tileWidth }, pressed && styles.gridTilePressed]}
                onPress={() => setActiveView('itinerary')}
              >
                <Vanir3DIcon name="itinerary" size={48} style={{ marginBottom: 8 }} />
                <Text style={styles.gridTileTitle} numberOfLines={1}>Itinerary</Text>
                <Text style={styles.gridTileDesc} numberOfLines={2}>Detailed Daily Travel Plan</Text>
              </Pressable>

              {/* Tile 9: Embassies */}
              <Pressable
                style={({ pressed }) => [styles.gridTile, { width: tileWidth }, pressed && styles.gridTilePressed]}
                onPress={() => setActiveView('embassies')}
              >
                <Vanir3DIcon name="offices" size={48} style={{ marginBottom: 8 }} />
                <Text style={styles.gridTileTitle} numberOfLines={1}>Embassies</Text>
                <Text style={styles.gridTileDesc} numberOfLines={2}>VFS, TLS & BLS Appointments</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: VISA ELIGIBILITY SEARCH (All World Countries) */}
        {/* ========================================================================= */}
        {activeView === 'search' && (
          <View style={styles.searchViewContainer}>
            <View style={styles.searchHeroBox}>
              <Text style={styles.searchHeroTitle}>Your Global Travel Starts Here</Text>
              <Text style={styles.searchHeroSub}>
                Select your nationality, residence, and destination across world countries to retrieve exact visa requirements.
              </Text>
            </View>

            {/* Selectors Card */}
            <View style={styles.formCard}>
              {/* Field 1: Nationality */}
              <Text style={styles.fieldLabel}>Nationality</Text>
              <Pressable style={styles.selectorBtn} onPress={() => setShowNatModal(true)}>
                <Flag emoji={selectedNationality.flag} size={30} />
                <Text style={styles.selectorText}>{selectedNationality.nameEn} ({selectedNationality.code})</Text>
                <ChevronDown color="#64748B" size={18} />
              </Pressable>

              {/* Field 2: Residence */}
              <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Country of Residence</Text>
              <Pressable style={styles.selectorBtn} onPress={() => setShowResModal(true)}>
                <Flag emoji={selectedResidence.flag} size={30} />
                <Text style={styles.selectorText}>{selectedResidence.nameEn} ({selectedResidence.code})</Text>
                <ChevronDown color="#64748B" size={18} />
              </Pressable>

              {/* Field 3: Destination */}
              <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Destination Country</Text>
              <Pressable style={styles.selectorBtn} onPress={() => setShowDestModal(true)}>
                <Flag emoji={selectedDestination.flag} size={30} />
                <Text style={styles.selectorText}>{selectedDestination.nameEn} ({selectedDestination.code})</Text>
                <ChevronDown color="#64748B" size={18} />
              </Pressable>

              {/* Action Button */}
              <LuxuryPressable
                style={styles.primaryActionBtn}
                onPress={() => setShowSearchResults(true)}
              >
                <Text style={styles.primaryActionBtnText}>Search Visa Requirements</Text>
              </LuxuryPressable>
            </View>

            {/* Search Result Breakdown Card */}
            {showSearchResults && (
              <View style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.resultTitle}>{activeVisaRule.visaType}</Text>
                    <Text style={styles.resultSub}>Destination: {selectedDestination.flag} {selectedDestination.nameEn}</Text>
                  </View>
                  <View style={[
                    styles.resultStatusBadge,
                    activeVisaRule.status === 'free' ? styles.statusBadgeGreen :
                    activeVisaRule.status === 'evisa' ? styles.statusBadgeBlue : styles.statusBadgeGold
                  ]}>
                    <Text style={styles.resultStatusText}>
                      {activeVisaRule.status === 'free' ? 'Visa-Free' :
                       activeVisaRule.status === 'evisa' ? 'Instant eVisa' : 'Visa Required'}
                    </Text>
                  </View>
                </View>

                {/* Metrics Row */}
                <View style={styles.resultMetricsRow}>
                  <View style={styles.resultMetricCol}>
                    <Text style={styles.metricLabel}>Processing Time</Text>
                    <Text style={styles.metricVal}>{activeVisaRule.duration}</Text>
                  </View>
                  <View style={styles.resultMetricCol}>
                    <Text style={styles.metricLabel}>Consular Fees</Text>
                    <Text style={styles.metricVal}>{activeVisaRule.fee}</Text>
                  </View>
                  <View style={styles.resultMetricCol}>
                    <Text style={styles.metricLabel}>Stay Validity</Text>
                    <Text style={styles.metricVal}>{activeVisaRule.validity}</Text>
                  </View>
                </View>

                {/* Requirements Checklist */}
                <View style={styles.requirementsBox}>
                  <Text style={styles.requirementsHeader}>Mandatory Application Documents:</Text>
                  {activeVisaRule.requirements.map((req, idx) => (
                    <View key={idx} style={styles.reqRow}>
                      <CheckCircle2 color="#059669" size={16} />
                      <Text style={styles.reqText}>{req}</Text>
                    </View>
                  ))}
                </View>

                {/* Direct Order Package CTA */}
                <LuxuryPressable
                  style={styles.packageOrderBtn}
                  onPress={() => setActiveView('packages')}
                >
                  <Text style={styles.packageOrderBtnText}>Prepare Full Dossier via Our Packages</Text>
                  <ArrowRight color="#1C1917" size={17} />
                </LuxuryPressable>
              </View>
            )}

            {/* How It Works Guide */}
            <View style={styles.guideCard}>
              <Text style={styles.guideTitle}>How Does the Consular Visa Desk Work?</Text>
              <View style={styles.guideStepRow}>
                <View style={styles.guideStepNumber}><Text style={styles.guideStepNumText}>1</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.guideStepHeader}>Select Country & Destination</Text>
                  <Text style={styles.guideStepDesc}>Choose your nationality and residence to reveal active consular requirements.</Text>
                </View>
              </View>
              <View style={styles.guideStepRow}>
                <View style={styles.guideStepNumber}><Text style={styles.guideStepNumText}>2</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.guideStepHeader}>Complete Embassy Requirements</Text>
                  <Text style={styles.guideStepDesc}>Generate flight reservation, hotel voucher, insurance, and NOC letter in one click.</Text>
                </View>
              </View>
              <View style={styles.guideStepRow}>
                <View style={styles.guideStepNumber}><Text style={styles.guideStepNumText}>3</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.guideStepHeader}>Receive Visa & Travel Confidently</Text>
                  <Text style={styles.guideStepDesc}>Our specialists review your dossier and schedule biometrics to maximize approval rates.</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: VISA PACKAGES */}
        {/* ========================================================================= */}
        {activeView === 'packages' && (
          <View style={styles.packagesViewContainer}>
            <Text style={styles.packagesMainTitle}>Curated Visa Packages</Text>
            <Text style={styles.packagesMainSub}>
              Select the ideal package for our consular team to prepare your complete dossier and appointments.
            </Text>

            {/* Silver Package */}
            <View style={styles.packageCard}>
              <View style={styles.packageHeader}>
                <Text style={styles.packageTier}>Silver Package (Essential)</Text>
                <Text style={styles.packagePrice}>$29</Text>
              </View>
              <View style={styles.packageFeaturesList}>
                <View style={styles.pkgRow}><Check color="#10B981" size={16} /><Text style={styles.pkgText}>Official document verification & auditing</Text></View>
                <View style={styles.pkgRow}><Check color="#10B981" size={16} /><Text style={styles.pkgText}>Online consular application form completion</Text></View>
                <View style={styles.pkgRow}><Check color="#10B981" size={16} /><Text style={styles.pkgText}>Verified biometric appointment booking (VFS/TLS/BLS)</Text></View>
              </View>
              <LuxuryPressable
                style={styles.packageBtn}
                onPress={() =>
                  handleProceedToBooking(
                    { type: 'visa-package-silver', itemName: 'Silver Consular Visa Package', price: 29 },
                    {
                      visaDocType: 'package',
                      packageTier: 'Silver Consular',
                      destinationCountry: `${selectedDestination.nameEn} (${selectedDestination.code})`,
                      nationality: selectedNationality.nameEn,
                    },
                  )
                }
              >
                <Text style={styles.packageBtnText}>Apply Now ($29)</Text>
              </LuxuryPressable>
            </View>

            {/* Gold Package */}
            <View style={[styles.packageCard, styles.packageCardPopular]}>
              <View style={styles.popularBadge}><Text style={styles.popularBadgeText}>MOST POPULAR & COMPLETE</Text></View>
              <View style={styles.packageHeader}>
                <Text style={styles.packageTier}>Gold Comprehensive Visa Package</Text>
                <Text style={styles.packagePrice}>$49</Text>
              </View>
              <View style={styles.packageFeaturesList}>
                <View style={styles.pkgRow}><Check color="#D4AF37" size={16} /><Text style={styles.pkgText}>All Silver Package privileges included</Text></View>
                <View style={styles.pkgRow}><Check color="#D4AF37" size={16} /><Text style={styles.pkgText}>Confirmed Flight Itinerary with live GDS PNR</Text></View>
                <View style={styles.pkgRow}><Check color="#D4AF37" size={16} /><Text style={styles.pkgText}>Confirmed Hotel Voucher covering entire stay</Text></View>
                <View style={styles.pkgRow}><Check color="#D4AF37" size={16} /><Text style={styles.pkgText}>Official day-by-day tourist travel itinerary</Text></View>
              </View>
              <LuxuryPressable
                style={[styles.packageBtn, styles.packageBtnGold]}
                onPress={() =>
                  handleProceedToBooking(
                    { type: 'visa-package-gold', itemName: 'Gold Comprehensive Visa Package', price: 49 },
                    {
                      visaDocType: 'package',
                      packageTier: 'Gold Comprehensive',
                      destinationCountry: `${selectedDestination.nameEn} (${selectedDestination.code})`,
                      nationality: selectedNationality.nameEn,
                    },
                  )
                }
              >
                <Text style={styles.packageBtnGoldText}>Apply Now ($49)</Text>
              </LuxuryPressable>
            </View>

            {/* Platinum Package */}
            <View style={styles.packageCard}>
              <View style={styles.packageHeader}>
                <Text style={styles.packageTier}>Platinum VIP All-Inclusive Package</Text>
                <Text style={styles.packagePrice}>$89</Text>
              </View>
              <View style={styles.packageFeaturesList}>
                <View style={styles.pkgRow}><Check color="#10B981" size={16} /><Text style={styles.pkgText}>All Silver & Gold privileges included</Text></View>
                <View style={styles.pkgRow}><Check color="#10B981" size={16} /><Text style={styles.pkgText}>Complimentary Schengen-compliant international insurance</Text></View>
                <View style={styles.pkgRow}><Check color="#10B981" size={16} /><Text style={styles.pkgText}>Official corporate HR employment NOC certificate</Text></View>
                <View style={styles.pkgRow}><Check color="#10B981" size={16} /><Text style={styles.pkgText}>Dedicated VIP consular concierge & top priority dispatch</Text></View>
              </View>
              <LuxuryPressable
                style={styles.packageBtn}
                onPress={() =>
                  handleProceedToBooking(
                    { type: 'visa-package-platinum', itemName: 'Platinum VIP All-Inclusive Visa Package', price: 89 },
                    {
                      visaDocType: 'package',
                      packageTier: 'VIP Diplomatic Platinum',
                      destinationCountry: `${selectedDestination.nameEn} (${selectedDestination.code})`,
                      nationality: selectedNationality.nameEn,
                    },
                  )
                }
              >
                <Text style={styles.packageBtnText}>Apply Now ($89)</Text>
              </LuxuryPressable>
            </View>
          </View>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: TRAVEL INSURANCE (Interactive Dates, Providers & Applicant) */}
        {/* ========================================================================= */}
        {activeView === 'insurance' && (
          <View style={styles.insuranceViewContainer}>
            <View style={styles.insuranceHeroBox}>
              <Text style={styles.insuranceHeroTitle}>Certified Travel Medical Insurance</Text>
              <Text style={styles.insuranceHeroSub}>
                Certified international travel medical insurance covering €50,000 / $50,000 compliant with EU Regulation EC 810/2009 with official corporate seal.
              </Text>
            </View>

            {/* Form Card */}
            <View style={styles.formCard}>
              {/* Insured Full Name */}
              <Text style={styles.fieldLabel}>Insured Traveler Full Name (as in Passport)</Text>
              <TextInput
                style={styles.inputField}
                value={travelerFullName}
                onChangeText={setTravelerFullName}
                placeholder="e.g. AHMED HASSAN AL-MANSOURI"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
              />

              {/* Passport Number */}
              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Passport Number (Passport Number)</Text>
              <TextInput
                style={styles.inputField}
                value={travelerPassport}
                onChangeText={setTravelerPassport}
                placeholder="e.g. A28910472"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
              />

              {/* Destination */}
              <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Coverage Destination & Territory</Text>
              <Pressable style={styles.selectorBtn} onPress={() => setShowInsuranceDestModal(true)}>
                <MapPin color="#D4AF37" size={18} />
                <Text style={styles.selectorText}>{insuranceDest}</Text>
                <ChevronDown color="#64748B" size={18} />
              </Pressable>

              {/* Start Date */}
              <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Coverage Start Date (Start Date)</Text>
              <Pressable
                style={styles.selectorBtn}
                onPress={() => openDatePicker('insStart', 'Select Insurance Start Date', 'calendar', insuranceStartDate)}
              >
                <Calendar color="#D4AF37" size={18} />
                <Text style={styles.selectorText}>
                  {insuranceStartDate} ➔ {computedInsuranceEndDate}
                </Text>
                <Text style={styles.pickerActionHint}>Change Date</Text>
              </Pressable>

              {/* Date of Birth */}
              <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Date of Birth</Text>
              <Pressable
                style={styles.selectorBtn}
                onPress={() => openDatePicker('insDob', 'Select Date of Birth', 'dob', insuranceDob)}
              >
                <User color="#D4AF37" size={18} />
                <Text style={styles.selectorText}>{insuranceDob}</Text>
                <Text style={styles.pickerActionHint}>Change Date</Text>
              </Pressable>

              {/* Duration Pills */}
              <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Coverage Duration</Text>
              <View style={styles.durationPillsRow}>
                {[7, 14, 30, 90].map(days => (
                  <Pressable
                    key={days}
                    style={[styles.durationPill, insuranceDurationDays === days && styles.durationPillActive]}
                    onPress={() => setInsuranceDurationDays(days)}
                  >
                    <Text style={[styles.durationPillText, insuranceDurationDays === days && styles.durationPillTextActive]}>
                      {days} Days ({days === 7 ? '$15' : days === 14 ? '$25' : days === 30 ? '$39' : '$75'})
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Underwriters Choice (5 Official International Insurers) */}
              <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Accredited Global Insurance Provider (Official Brand & Seal)</Text>
              <View style={[styles.providersChoiceRow, { flexWrap: 'wrap' }]}>
                {(['AXA Schengen', 'Allianz', 'WorldTrips', 'TRAWICK', 'IMG'] as const).map(p => (
                  <Pressable
                    key={p}
                    style={[
                      styles.providerChoiceBtn,
                      { minWidth: '30%', marginBottom: 6 },
                      selectedProvider === p && styles.providerChoiceBtnActive,
                    ]}
                    onPress={() => setSelectedProvider(p)}
                  >
                    <Text style={[styles.providerChoiceText, selectedProvider === p && styles.providerChoiceTextActive]}>
                      {p}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Primary Action Button */}
              <LuxuryPressable
                style={styles.primaryActionBtn}
                onPress={() => {
                  const cost =
                    insuranceDurationDays === 7 ? 15 : insuranceDurationDays === 14 ? 25 : insuranceDurationDays === 30 ? 39 : 75;
                  handleProceedToBooking(
                    {
                      type: 'travel-insurance',
                      itemName: `Certified Travel Insurance Policy (${selectedProvider} - ${insuranceDurationDays} Days)`,
                      price: cost,
                    },
                    {
                      visaDocType: 'insurance',
                      startDate: insuranceStartDate,
                      endDate: computedInsuranceEndDate,
                      insuranceProvider: selectedProvider,
                      insuranceCoverageAmount: '€50,000 / $55,000 (Zero Deductible)',
                      insuranceStartDate,
                      insuranceEndDate: computedInsuranceEndDate,
                      insuranceDurationDays,
                      dob: insuranceDob,
                      destinationCountry: insuranceDest,
                    },
                  );
                }}
              >
                <Text style={styles.primaryActionBtnText}>Issue Certified Insurance Policy</Text>
              </LuxuryPressable>
            </View>
          </View>
        )}

        {/* ========================================================================= */}
        {/* VIEW 5: EMBASSY FLIGHT RESERVATION (With Carrier, Country & Airport Pickers) */}
        {/* ========================================================================= */}
        {activeView === 'flight' && (
          <View style={styles.flightViewContainer}>
            <View style={styles.flightHeroBox}>
              <Text style={styles.flightHeroTitle}>Embassy Flight Itinerary (GDS PNR)</Text>
              <Text style={styles.flightHeroSub}>
                Obtain an official verifiable flight itinerary with live PNR, operating airline branding, and IATA accreditation.
              </Text>
            </View>

            {/* Flight Search Card */}
            <View style={styles.formCard}>
              {/* Passenger Full Name & Passport */}
              <Text style={styles.fieldLabel}>Passenger Full Name (as in Passport)</Text>
              <TextInput
                style={styles.inputField}
                value={travelerFullName}
                onChangeText={setTravelerFullName}
                placeholder="e.g. AHMED HASSAN AL-MANSOURI"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
              />

              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Passport Number (Passport Number)</Text>
              <TextInput
                style={styles.inputField}
                value={travelerPassport}
                onChangeText={setTravelerPassport}
                placeholder="e.g. A28910472"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
              />

              {/* Trip Type Toggle */}
              <View style={[styles.tripTypeRow, { marginTop: 14 }]}>
                <Pressable
                  style={[styles.tripTypeBtn, flightTripType === 'round' && styles.tripTypeBtnActive]}
                  onPress={() => setFlightTripType('round')}
                >
                  <Text style={[styles.tripTypeText, flightTripType === 'round' && styles.tripTypeTextActive]}>Roundtrip</Text>
                </Pressable>
                <Pressable
                  style={[styles.tripTypeBtn, flightTripType === 'oneway' && styles.tripTypeBtnActive]}
                  onPress={() => setFlightTripType('oneway')}
                >
                  <Text style={[styles.tripTypeText, flightTripType === 'oneway' && styles.tripTypeTextActive]}>One Way</Text>
                </Pressable>
              </View>

              {/* Airline Carrier Selector */}
              <Text style={[styles.fieldLabel, { marginBottom: 8 }]}>Preferred Operating Airline</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingBottom: 12 }}
              >
                {EMBASSY_AIRLINES.map(air => {
                  const isAirActive = selectedFlightAirline.code === air.code;
                  return (
                    <Pressable
                      key={air.code}
                      style={[
                        styles.classChip,
                        { paddingHorizontal: 14, paddingVertical: 9 },
                        isAirActive && styles.classChipActive,
                      ]}
                      onPress={() => setSelectedFlightAirline(air)}
                    >
                      <Text style={[styles.classChipText, isAirActive && styles.classChipTextActive]}>
                        {air.name} ({air.code})
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Route: Origin & Destination with Swap */}
              <View style={styles.airportRowContainer}>
                {/* Origin */}
                <Pressable style={styles.airportSelectBox} onPress={() => setShowOriginModal(true)}>
                  <Text style={styles.airportLabel}>Departure Airport</Text>
                  <View style={styles.airportValRow}>
                    <Flag emoji={flightOriginAirport.flag} size={36} />
                    <Text style={styles.airportCode}>{flightOriginAirport.code}</Text>
                  </View>
                  <Text style={styles.airportCity} numberOfLines={1}>{flightOriginAirport.cityAr}</Text>
                </Pressable>

                {/* Swap Button */}
                <Pressable style={styles.swapBtn} onPress={handleSwapAirports} hitSlop={10}>
                  <ArrowUpDown color="#1C1917" size={18} strokeWidth={2.4} />
                </Pressable>

                {/* Destination */}
                <Pressable style={styles.airportSelectBox} onPress={() => setShowDestAirportModal(true)}>
                  <Text style={styles.airportLabel}>Arrival Airport</Text>
                  <View style={styles.airportValRow}>
                    <Flag emoji={flightDestAirport.flag} size={36} />
                    <Text style={styles.airportCode}>{flightDestAirport.code}</Text>
                  </View>
                  <Text style={styles.airportCity} numberOfLines={1}>{flightDestAirport.cityAr}</Text>
                </Pressable>
              </View>

              {/* Travel Dates Picker */}
              <View style={styles.datesRowContainer}>
                {/* Departure Date */}
                <Pressable
                  style={styles.dateColBox}
                  onPress={() => openDatePicker('flightDepart', 'Select Departure Date', 'calendar', flightDepartDate)}
                >
                  <Text style={styles.dateColLabel}>Departure Date</Text>
                  <View style={styles.dateValRow}>
                    <Calendar color="#D4AF37" size={16} />
                    <Text style={styles.dateValText}>{flightDepartDate}</Text>
                  </View>
                </Pressable>

                {/* Return Date if Round Trip */}
                {flightTripType === 'round' && (
                  <Pressable
                    style={styles.dateColBox}
                    onPress={() => openDatePicker('flightReturn', 'Select Return Date', 'calendar', flightReturnDate)}
                  >
                    <Text style={styles.dateColLabel}>Return Date</Text>
                    <View style={styles.dateValRow}>
                      <Calendar color="#D4AF37" size={16} />
                      <Text style={styles.dateValText}>{flightReturnDate}</Text>
                    </View>
                  </Pressable>
                )}
              </View>

              {/* Passengers & Cabin Class */}
              <View style={styles.flightClassRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Number of Passengers</Text>
                  <View style={styles.stepperBox}>
                    <Pressable
                      style={styles.stepBtn}
                      onPress={() => setFlightPassengers(Math.max(1, flightPassengers - 1))}
                    >
                      <Text style={styles.stepBtnText}>-</Text>
                    </Pressable>
                    <Text style={styles.stepValText}>{flightPassengers} {flightPassengers === 1 ? "Passenger" : "Passengers"}</Text>
                    <Pressable
                      style={styles.stepBtn}
                      onPress={() => setFlightPassengers(Math.min(9, flightPassengers + 1))}
                    >
                      <Text style={styles.stepBtnText}>+</Text>
                    </Pressable>
                  </View>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Consular Cabin Class</Text>
                  <View style={styles.classChipsRow}>
                    {(['Economy', 'Business'] as const).map(cls => (
                      <Pressable
                        key={cls}
                        style={[styles.classChip, flightClass === cls && styles.classChipActive]}
                        onPress={() => setFlightClass(cls)}
                      >
                        <Text style={[styles.classChipText, flightClass === cls && styles.classChipTextActive]}>
                          {cls === 'Economy' ? 'Economy Flexible' : 'Business Class'}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>

              {/* Primary Booking Action */}
              <LuxuryPressable
                style={styles.primaryActionBtn}
                onPress={() => {
                  const totalCost = 25 * flightPassengers;
                  handleProceedToBooking(
                    {
                      type: 'visa-flight',
                      itemName: `Flight Reservation - ${selectedFlightAirline.name} (${flightOriginAirport.code} ➔ ${flightDestAirport.code})`,
                      price: totalCost,
                    },
                    {
                      visaDocType: 'flight',
                      startDate: flightDepartDate,
                      endDate: flightTripType === 'round' ? flightReturnDate : flightDepartDate,
                      guestsCount: flightPassengers,
                      flightTripType,
                      flightAirline: selectedFlightAirline.name,
                      flightAirlineCode: selectedFlightAirline.code,
                      flightNumber: selectedFlightAirline.flightNo,
                      flightOrigin: `${flightOriginAirport.cityEn} - ${flightOriginAirport.airportName}`,
                      flightOriginCode: flightOriginAirport.code,
                      flightDestination: `${flightDestAirport.cityEn} - ${flightDestAirport.airportName}`,
                      flightDestinationCode: flightDestAirport.code,
                      flightDepartureDate: flightDepartDate,
                      flightReturnDate: flightTripType === 'round' ? flightReturnDate : '',
                      destinationCountry: flightDestAirport.cityEn,
                    },
                  );
                }}
              >
                <Text style={styles.primaryActionBtnText}>
                  Issue Flight Reservation - {selectedFlightAirline.name} (${25 * flightPassengers})
                </Text>
              </LuxuryPressable>
            </View>
          </View>
        )}

        {/* ========================================================================= */}
        {/* VIEW 6: CONFIRMED HOTEL RESERVATION (Curated Luxury + Custom Hotel Input) */}
        {/* ========================================================================= */}
        {activeView === 'hotel' && (
          <View style={styles.hotelViewContainer}>
            <View style={styles.hotelHeroBox}>
              <Text style={styles.hotelHeroTitle}>Confirmed Hotel Voucher for Embassies</Text>
              <Text style={styles.hotelHeroSub}>
                Official Proof of Accommodation with authentic hotel branding, CRS confirmation code, and concierge stamp.
              </Text>
            </View>

            {/* Hotel Booking Form Card */}
            <View style={styles.formCard}>
              {/* Guest Name & Passport */}
              <Text style={styles.fieldLabel}>Primary Guest Full Name (as in Passport)</Text>
              <TextInput
                style={styles.inputField}
                value={travelerFullName}
                onChangeText={setTravelerFullName}
                placeholder="e.g. AHMED HASSAN AL-MANSOURI"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
              />

              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Passport Number (Passport Number)</Text>
              <TextInput
                style={styles.inputField}
                value={travelerPassport}
                onChangeText={setTravelerPassport}
                placeholder="e.g. A28910472"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
              />

              {/* Toggle: Curated 5-Star Hotels vs Custom Hotel Name */}
              <View style={[styles.tripTypeRow, { marginTop: 14 }]}>
                <Pressable
                  style={[styles.tripTypeBtn, !useCustomHotel && styles.tripTypeBtnActive]}
                  onPress={() => setUseCustomHotel(false)}
                >
                  <Text style={[styles.tripTypeText, !useCustomHotel && styles.tripTypeTextActive]}>
                    Curated 5-Star Luxury Hotels
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.tripTypeBtn, useCustomHotel && styles.tripTypeBtnActive]}
                  onPress={() => setUseCustomHotel(true)}
                >
                  <Text style={[styles.tripTypeText, useCustomHotel && styles.tripTypeTextActive]}>
                    Enter Custom Hotel Manually
                  </Text>
                </Pressable>
              </View>

              {!useCustomHotel ? (
                <>
                  <Text style={styles.fieldLabel}>Selected Luxury Hotel</Text>
                  <Pressable style={styles.selectorBtn} onPress={() => setShowHotelPickerModal(true)}>
                    <Building2 color="#D4AF37" size={18} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.selectorText}>{selectedHotel.name}</Text>
                      <Text style={styles.selectorSubText}>
                        {selectedHotel.city}, {selectedHotel.country} ★★★★★
                      </Text>
                    </View>
                    <ChevronDown color="#64748B" size={18} />
                  </Pressable>
                </>
              ) : (
                <>
                  <Text style={styles.fieldLabel}>Hotel / Property Name</Text>
                  <TextInput
                    style={styles.inputField}
                    value={customHotelName}
                    onChangeText={setCustomHotelName}
                    placeholder="e.g. Four Seasons Hotel George V / Marriott Opera"
                    placeholderTextColor="#94A3B8"
                  />
                  <Text style={[styles.fieldLabel, { marginTop: 12 }]}>City, Country & Property Address</Text>
                  <TextInput
                    style={styles.inputField}
                    value={customHotelCity}
                    onChangeText={setCustomHotelCity}
                    placeholder="e.g. 31 Avenue George V, Paris, France"
                    placeholderTextColor="#94A3B8"
                  />
                </>
              )}

              {/* Room Type Selector */}
              <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Room / Suite Type</Text>
              <View style={styles.roomTypesCol}>
                {(useCustomHotel
                  ? ['Deluxe King Room (Breakfast Included)', 'Executive Diplomatic Suite', 'Twin Superior Room']
                  : selectedHotel.roomTypes
                ).map(rt => (
                  <Pressable
                    key={rt}
                    style={[styles.roomTypePill, selectedRoomType === rt && styles.roomTypePillActive]}
                    onPress={() => setSelectedRoomType(rt)}
                  >
                    <Bed color={selectedRoomType === rt ? '#1C1917' : '#64748B'} size={16} />
                    <Text style={[styles.roomTypeText, selectedRoomType === rt && styles.roomTypeTextActive]}>
                      {rt}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Check-in / Check-out Dates Picker */}
              <View style={styles.datesRowContainer}>
                {/* Check In */}
                <Pressable
                  style={styles.dateColBox}
                  onPress={() => openDatePicker('hotelCheckIn', 'Select Check-in Date', 'calendar', hotelCheckInDate)}
                >
                  <Text style={styles.dateColLabel}>Arrival Date (Check-in)</Text>
                  <View style={styles.dateValRow}>
                    <Calendar color="#D4AF37" size={16} />
                    <Text style={styles.dateValText}>{hotelCheckInDate}</Text>
                  </View>
                </Pressable>

                {/* Check Out */}
                <Pressable
                  style={styles.dateColBox}
                  onPress={() => openDatePicker('hotelCheckOut', 'Select Check-out Date', 'calendar', hotelCheckOutDate)}
                >
                  <Text style={styles.dateColLabel}>Departure Date (Check-out)</Text>
                  <View style={styles.dateValRow}>
                    <Calendar color="#D4AF37" size={16} />
                    <Text style={styles.dateValText}>{hotelCheckOutDate}</Text>
                  </View>
                </Pressable>
              </View>

              {/* Nights Summary Banner */}
              <View style={styles.hotelNightsBanner}>
                <Text style={styles.hotelNightsText}>Duration of Stay: {hotelNights} Nights (Daily Breakfast Included)</Text>
                <Text style={styles.hotelNightsSub}>Fully prepaid & guaranteed for visa submission with official hotel seal</Text>
              </View>

              {/* Guests Count */}
              <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Number of Guests</Text>
              <View style={styles.guestsPillsRow}>
                {[1, 2, 3, 4].map(g => (
                  <Pressable
                    key={g}
                    style={[styles.guestPill, hotelGuestsCount === g && styles.guestPillActive]}
                    onPress={() => setHotelGuestsCount(g)}
                  >
                    <Text style={[styles.guestPillText, hotelGuestsCount === g && styles.guestPillTextActive]}>
                      {g} {g === 1 ? 'Adult' : 'Adults'}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Primary Booking Button */}
              <LuxuryPressable
                style={styles.primaryActionBtn}
                onPress={() => {
                  const chosenHotelName = useCustomHotel
                    ? customHotelName.trim()
                    : selectedHotel.name;
                  if (!chosenHotelName) {
                    Alert.alert('Hotel Name Required', 'Please enter a hotel name or select one from the list.');
                    return;
                  }
                  const chosenAddress = useCustomHotel
                    ? customHotelCity.trim() || 'Central Diplomatic District'
                    : `${selectedHotel.address}, ${selectedHotel.city}, ${selectedHotel.country}`;
                  const chosenCity = useCustomHotel
                    ? customHotelCity.trim()
                    : `${selectedHotel.city}, ${selectedHotel.country}`;

                  handleProceedToBooking(
                    {
                      type: 'visa-hotel',
                      itemName: `Confirmed Hotel Voucher (${chosenHotelName} - ${hotelNights} Nights)`,
                      price: 25,
                    },
                    {
                      visaDocType: 'hotel',
                      hotelName: chosenHotelName,
                      hotelAddress: chosenAddress,
                      destinationCity: chosenCity,
                      destinationCountry: chosenCity,
                      roomType: selectedRoomType,
                      startDate: hotelCheckInDate,
                      endDate: hotelCheckOutDate,
                      checkInDate: hotelCheckInDate,
                      checkOutDate: hotelCheckOutDate,
                      nights: hotelNights,
                      guestsCount: hotelGuestsCount,
                    },
                  );
                }}
              >
                <Text style={styles.primaryActionBtnText}>Issue Confirmed Hotel Voucher ($25)</Text>
              </LuxuryPressable>
            </View>
          </View>
        )}

        {/* ========================================================================= */}
        {/* VIEW 7: WORK VERIFICATION / NOC LETTER (Interactive Date Selectors) */}
        {/* ========================================================================= */}
        {activeView === 'noc' && (
          <View style={styles.nocViewContainer}>
            <View style={styles.nocHeroBox}>
              <Text style={styles.nocHeroTitle}>Corporate Employment NOC Letter</Text>
              <Text style={styles.nocHeroSub}>
                Official employment verification certificate on corporate letterhead with HR seal, commercial registry number, and executive signature.
              </Text>
            </View>

            {/* Form */}
            <View style={styles.formCard}>
              {/* Full Name */}
              <Text style={styles.fieldLabel}>Full Legal Name (as in Passport)</Text>
              <TextInput
                style={styles.inputField}
                value={nocFullName}
                onChangeText={setNocFullName}
                placeholder="e.g. Alexander John Wright"
                placeholderTextColor="#94A3B8"
              />

              {/* Passport Number */}
              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Passport Number (Passport Number)</Text>
              <TextInput
                style={styles.inputField}
                value={nocPassportNumber}
                onChangeText={setNocPassportNumber}
                placeholder="e.g. A19827364"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
              />

              {/* Job Title */}
              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Official Job Title</Text>
              <TextInput
                style={styles.inputField}
                value={nocJobTitle}
                onChangeText={setNocJobTitle}
                placeholder="e.g. Senior Managing Consultant"
                placeholderTextColor="#94A3B8"
              />

              {/* Company Name */}
              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Employer / Company Name</Text>
              <TextInput
                style={styles.inputField}
                value={nocCompany}
                onChangeText={setNocCompany}
                placeholder="e.g. Al-Mansoor International Holding"
                placeholderTextColor="#94A3B8"
              />

              {/* Salary & Currency */}
              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Monthly Net Salary & Currency</Text>
              <View style={styles.salaryInputRow}>
                <TextInput
                  style={[styles.inputField, { flex: 1 }]}
                  value={nocSalary}
                  onChangeText={setNocSalary}
                  placeholder="5500"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                />
                <View style={styles.currencyPills}>
                  {['USD', 'EUR', 'SAR', 'AED', 'EGP'].map(c => (
                    <Pressable
                      key={c}
                      style={[styles.currPill, nocCurrency === c && styles.currPillActive]}
                      onPress={() => setNocCurrency(c)}
                    >
                      <Text style={[styles.currPillText, nocCurrency === c && styles.currPillTextActive]}>{c}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Employment Start Date */}
              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Employment Start Date</Text>
              <Pressable
                style={styles.selectorBtn}
                onPress={() => openDatePicker('nocStart', 'Select Employment Start Date', 'past', nocStartDate)}
              >
                <Calendar color="#D4AF37" size={18} />
                <Text style={styles.selectorText}>{nocStartDate}</Text>
                <Text style={styles.pickerActionHint}>Select Date</Text>
              </Pressable>

              {/* Manager Name */}
              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Direct Manager Full Name</Text>
              <TextInput
                style={styles.inputField}
                value={nocManagerName}
                onChangeText={setNocManagerName}
                placeholder="Dr. Tariq Al-Hashimi (HR Director)"
                placeholderTextColor="#94A3B8"
              />

              {/* Manager Contact */}
              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Manager Contact (Phone / Email)</Text>
              <TextInput
                style={styles.inputField}
                value={nocManagerContact}
                onChangeText={setNocManagerContact}
                placeholder="+971 4 812 9900 / hr@company.com"
                placeholderTextColor="#94A3B8"
              />

              {/* Destination Embassy */}
              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Addressed Embassy / Consulate</Text>
              <TextInput
                style={styles.inputField}
                value={nocTargetEmbassy}
                onChangeText={setNocTargetEmbassy}
                placeholder="The Embassy of France / Consular Section"
                placeholderTextColor="#94A3B8"
              />

              {/* Primary Action Button */}
              <LuxuryPressable
                style={styles.primaryActionBtn}
                onPress={() => {
                  if (!nocFullName.trim() || !nocPassportNumber.trim() || !nocCompany.trim()) {
                    Alert.alert('Required Fields Missing', 'Please enter your name, passport number, and company name to issue the letter.');
                    return;
                  }
                  handleProceedToBooking(
                    {
                      type: 'noc-letter',
                      itemName: `Official Employment NOC Letter (${nocCompany.trim()})`,
                      price: 15,
                    },
                    {
                      visaDocType: 'noc',
                      guestName: nocFullName.trim(),
                      passportNumber: nocPassportNumber.trim(),
                      jobTitle: nocJobTitle.trim() || 'Senior Executive Specialist',
                      companyName: nocCompany.trim(),
                      monthlySalary: nocSalary.trim() || '4,800',
                      salaryCurrency: nocCurrency,
                      managerName: nocManagerName.trim() || 'Director of Human Resources',
                      managerContact: nocManagerContact.trim() || 'hr@corporate-verify.com',
                      employmentStartDate: nocStartDate,
                      embassyName: nocTargetEmbassy.trim() || 'Consular Visa Section',
                      destinationCountry: nocTargetEmbassy.trim(),
                    },
                  );
                }}
              >
                <Text style={styles.primaryActionBtnText}>Generate Official NOC Letter ($15)</Text>
              </LuxuryPressable>
            </View>
          </View>
        )}

        {/* ========================================================================= */}
        {/* VIEW 8: INTERACTIVE TOURISM ITINERARY */}
        {/* ========================================================================= */}
        {activeView === 'itinerary' && (
          <View style={styles.itineraryViewContainer}>
            <View style={styles.itineraryHeroBox}>
              <Text style={styles.itineraryHeroTitle}>Certified Tourist Travel Itinerary</Text>
              <Text style={styles.itineraryHeroSub}>
                Official day-by-day travel itinerary with dates, luxury hotels, and landmarks stamped with the consular seal.
              </Text>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.fieldLabel}>Passenger Full Name (as in Passport)</Text>
              <TextInput
                style={styles.inputField}
                value={travelerFullName}
                onChangeText={setTravelerFullName}
                placeholder="e.g. AHMED HASSAN AL-MANSOURI"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
              />

              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Passport Number (Passport Number)</Text>
              <TextInput
                style={styles.inputField}
                value={travelerPassport}
                onChangeText={setTravelerPassport}
                placeholder="e.g. A28910472"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
              />

              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Destination City & Country</Text>
              <TextInput
                style={styles.inputField}
                value={itineraryDestination}
                onChangeText={setItineraryDestination}
                placeholder="e.g. Paris & Nice, France"
                placeholderTextColor="#94A3B8"
              />

              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Hotel Name in Schedule</Text>
              <TextInput
                style={styles.inputField}
                value={itineraryHotelName}
                onChangeText={setItineraryHotelName}
                placeholder="e.g. Four Seasons Hotel George V Paris"
                placeholderTextColor="#94A3B8"
              />

              {/* Travel Dates Picker */}
              <View style={styles.datesRowContainer}>
                <Pressable
                  style={styles.dateColBox}
                  onPress={() => openDatePicker('itinStart', 'Select Departure Date', 'calendar', itineraryStartDate)}
                >
                  <Text style={styles.dateColLabel}>Arrival Date</Text>
                  <View style={styles.dateValRow}>
                    <Calendar color="#D4AF37" size={16} />
                    <Text style={styles.dateValText}>{itineraryStartDate}</Text>
                  </View>
                </Pressable>

                <Pressable
                  style={styles.dateColBox}
                  onPress={() => openDatePicker('itinEnd', 'Select Return Date', 'calendar', itineraryEndDate)}
                >
                  <Text style={styles.dateColLabel}>Departure Date</Text>
                  <View style={styles.dateValRow}>
                    <Calendar color="#D4AF37" size={16} />
                    <Text style={styles.dateValText}>{itineraryEndDate}</Text>
                  </View>
                </Pressable>
              </View>

              <Text style={[styles.fieldLabel, { marginTop: 14, marginBottom: 8 }]}>
                Daily Schedule Itinerary ({generatedItineraryDays.length} Days):
              </Text>
              {generatedItineraryDays.slice(0, 4).map(d => (
                <View key={d.dayNumber} style={styles.itinerarySampleDay}>
                  <Text style={styles.dayBadge}>
                    Day {d.dayNumber}: {d.title}
                  </Text>
                  <Text style={styles.dayText}>{d.activities}</Text>
                </View>
              ))}

              <LuxuryPressable
                style={styles.primaryActionBtn}
                onPress={() => {
                  handleProceedToBooking(
                    {
                      type: 'visa-itinerary',
                      itemName: `Consular Daily Itinerary (${itineraryDestination} - ${generatedItineraryDays.length} Days)`,
                      price: 15,
                    },
                    {
                      visaDocType: 'itinerary',
                      startDate: itineraryStartDate,
                      endDate: itineraryEndDate,
                      checkInDate: itineraryStartDate,
                      checkOutDate: itineraryEndDate,
                      hotelName: itineraryHotelName,
                      destinationCountry: itineraryDestination,
                      destinationCity: itineraryDestination,
                      itineraryDays: generatedItineraryDays,
                    },
                  );
                }}
              >
                <Text style={styles.primaryActionBtnText}>Generate Custom Attested Itinerary ($15)</Text>
              </LuxuryPressable>
            </View>
          </View>
        )}

        {/* ========================================================================= */}
        {/* VIEW 9: EXTENDED EMBASSIES DIRECTORY (16+ Centers) */}
        {/* ========================================================================= */}
        {activeView === 'embassies' && (
          <View style={styles.embassiesViewContainer}>
            <View style={styles.embassiesHeroBox}>
              <Text style={styles.embassiesHeroTitle}>Global Embassies & Visa Application Centers</Text>
              <Text style={styles.embassiesHeroSub}>
                Official contacts, locations, and direct appointment links for VFS Global, TLScontact, and BLS International.
              </Text>
            </View>

            {/* Search Box */}
            <View style={styles.searchBarBox}>
              <Search color="#64748B" size={18} />
              <TextInput
                style={styles.searchBarInput}
                value={embassySearchText}
                onChangeText={setEmbassySearchText}
                placeholder="Search country or visa center..."
                placeholderTextColor="#94A3B8"
              />
            </View>

            {filteredEmbassies.map(emb => (
              <View key={emb.id} style={styles.embassyCard}>
                <View style={styles.embassyHeader}>
                  <Flag emoji={emb.flag} size={36} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.embassyCountry}>{emb.country}</Text>
                    <Text style={styles.embassyCenter}>{emb.centerName}</Text>
                  </View>
                </View>

                <View style={styles.embassyDetails}>
                  <View style={styles.embassyRow}>
                    <MapPin color="#64748B" size={16} />
                    <Text style={styles.embassyText} numberOfLines={2}>{emb.address}</Text>
                  </View>
                  <View style={styles.embassyRow}>
                    <Clock color="#64748B" size={16} />
                    <Text style={styles.embassyText}>{emb.workingHours}</Text>
                  </View>
                  <View style={styles.embassyRow}>
                    <Phone color="#64748B" size={16} />
                    <Text style={styles.embassyText}>{emb.phone}</Text>
                  </View>
                </View>

                <Pressable
                  style={styles.embassyLinkBtn}
                  onPress={() => Linking.openURL(emb.appointmentUrl).catch(() => undefined)}
                >
                  <Text style={styles.embassyLinkText}>Book Official Biometric Appointment</Text>
                  <ExternalLink color="#D4AF37" size={15} />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* ========================================================================= */}
        {/* VIEW 10: MY ORDERS (Image 10) */}
        {/* ========================================================================= */}
        {activeView === 'orders' && (
          <View style={styles.ordersViewContainer}>
            {/* Search Input */}
            <View style={styles.searchBarBox}>
              <Search color="#64748B" size={18} />
              <TextInput
                style={styles.searchBarInput}
                value={ordersSearch}
                onChangeText={setOrdersSearch}
                placeholder="Search Order ID..."
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* Filter Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.ordersTabsScroll}>
              {[
                { id: 'all', label: 'All' },
                { id: 'insurance', label: 'Insurance' },
                { id: 'packages', label: 'Visa Packages' },
                { id: 'noc', label: 'NOC Letter' },
                { id: 'flight', label: 'Flight' },
                { id: 'hotel', label: 'Hotels' },
              ].map(tab => (
                <Pressable
                  key={tab.id}
                  style={[styles.ordersTabPill, ordersFilter === tab.id && styles.ordersTabPillActive]}
                  onPress={() => setOrdersFilter(tab.id as any)}
                >
                  <Text style={[styles.ordersTabText, ordersFilter === tab.id && styles.ordersTabTextActive]}>
                    {tab.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Loading or Empty State / Orders List */}
            {isLoadingOrders ? (
              <View style={styles.ordersLoadingBox}>
                <ActivityIndicator color="#D4AF37" size="large" />
                <Text style={styles.ordersLoadingText}>Syncing consular bookings…</Text>
              </View>
            ) : myOrdersList.length === 0 ? (
              <View style={styles.ordersEmptyCard}>
                <View style={styles.ordersEmptyGraphicBox}>
                  <Landmark color="#94A3B8" size={54} strokeWidth={1.5} />
                  <Compass color="#D4AF37" size={32} style={{ position: 'absolute', top: 0, right: 10 }} />
                </View>
                <Text style={styles.ordersEmptyTitle}>No bookings recorded yet</Text>
                <Text style={styles.ordersEmptySub}>
                  The world is vast and waiting. Explore visas and luxury services to plan your next journey.
                </Text>
                <LuxuryPressable style={styles.ordersCreateNewBtn} onPress={() => setActiveView('grid')}>
                  <Text style={styles.ordersCreateNewBtnText}>Create New Booking</Text>
                </LuxuryPressable>
              </View>
            ) : (
              <View style={styles.ordersListBox}>
                {myOrdersList.map(order => (
                  <View key={order.id} style={styles.orderItemCard}>
                    <View style={styles.orderItemHeader}>
                      <Text style={styles.orderItemTitle}>{order.title || 'Consular Document'}</Text>
                      <View style={styles.orderStatusPill}>
                        <Text style={styles.orderStatusText}>{order.status || 'Confirmed'}</Text>
                      </View>
                    </View>
                    <Text style={styles.orderItemRef}>Booking Reference: {order.details?.referenceNumber || order.id}</Text>
                    {order.details?.fee && (
                      <Text style={styles.orderItemPrice}>Total Paid: {order.details.fee}</Text>
                    )}

                    {/* Review PDF Button for this completed order */}
                    <LuxuryPressable style={styles.orderPdfBtn} onPress={() => openOrderPdf(order)}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <FileDown color="#1C1917" size={15} strokeWidth={2.2} />
                        <Text style={styles.orderPdfBtnText}>View & Download Official PDF</Text>
                      </View>
                    </LuxuryPressable>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* ── MODAL: WORLD COUNTRIES SELECTOR (Nationality / Residence / Destination) */}
      <Modal visible={showNatModal || showResModal || showDestModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheetContainer}>
            <View style={styles.modalSheetHeader}>
              <Text style={styles.modalSheetTitle}>
                {showNatModal ? 'Select Nationality' : showResModal ? 'Select Country of Residence' : 'Select Destination Country'}
              </Text>
              <Pressable
                onPress={() => {
                  setShowNatModal(false);
                  setShowResModal(false);
                  setShowDestModal(false);
                  setCountryFilterText('');
                }}
                hitSlop={12}
              >
                <X color="#64748B" size={20} />
              </Pressable>
            </View>

            {/* Search Input in Country Selector */}
            <View style={styles.modalSearchBox}>
              <Search color="#64748B" size={18} />
              <TextInput
                style={styles.modalSearchInput}
                value={countryFilterText}
                onChangeText={setCountryFilterText}
                placeholder="Search country name..."
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* Region Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.regionFilterScroll}>
              {[
                { id: 'all', label: 'All Countries' },
                { id: 'arab', label: 'Middle East & GCC' },
                { id: 'europe', label: 'Europe & Schengen' },
                { id: 'americas', label: 'Americas' },
                { id: 'asia', label: 'Asia' },
                { id: 'africa', label: 'Africa' },
                { id: 'oceania', label: 'Oceania' },
              ].map(tab => (
                <Pressable
                  key={tab.id}
                  style={[styles.regionChip, selectedContinentFilter === tab.id && styles.regionChipActive]}
                  onPress={() => setSelectedContinentFilter(tab.id)}
                >
                  <Text style={[styles.regionChipText, selectedContinentFilter === tab.id && styles.regionChipTextActive]}>
                    {tab.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Country List */}
            <FlatList
              data={filteredCountries}
              keyExtractor={c => c.id}
              style={{ maxHeight: 380 }}
              showsVerticalScrollIndicator={false}
              initialNumToRender={14}
              maxToRenderPerBatch={14}
              windowSize={7}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item: c }) => {
                const isSelected = showNatModal
                  ? selectedNationality.id === c.id
                  : showResModal
                  ? selectedResidence.id === c.id
                  : selectedDestination.id === c.id;
                return (
                  <Pressable
                    style={[styles.modalItemRow, isSelected && styles.modalItemRowActive]}
                    onPress={() => {
                      if (showNatModal) setSelectedNationality(c);
                      else if (showResModal) setSelectedResidence(c);
                      else setSelectedDestination(c);
                      setShowNatModal(false);
                      setShowResModal(false);
                      setShowDestModal(false);
                      setCountryFilterText('');
                    }}
                  >
                    <Flag emoji={c.flag} size={34} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalItemText}>{c.nameEn}</Text>
                      <Text style={styles.modalItemSub}>{c.code}</Text>
                    </View>
                    {isSelected && <Check color="#D4AF37" size={18} strokeWidth={2.5} />}
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>

      {/* ── MODAL: AIRPORT SELECTOR (Origin & Destination) ────────────────── */}
      <Modal visible={showOriginModal || showDestAirportModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheetContainer}>
            <View style={styles.modalSheetHeader}>
              <Text style={styles.modalSheetTitle}>
                {showOriginModal ? 'Select Departure Airport' : 'Select Arrival Airport'}
              </Text>
              <Pressable
                onPress={() => {
                  setShowOriginModal(false);
                  setShowDestAirportModal(false);
                  setAirportSearchText('');
                }}
                hitSlop={12}
              >
                <X color="#64748B" size={20} />
              </Pressable>
            </View>

            <View style={styles.modalSearchBox}>
              <Search color="#64748B" size={18} />
              <TextInput
                style={styles.modalSearchInput}
                value={airportSearchText}
                onChangeText={setAirportSearchText}
                placeholder="Search city or airport code (CAI, DXB, CDG)..."
                placeholderTextColor="#94A3B8"
              />
            </View>

            <FlatList
              data={filteredAirports}
              keyExtractor={apt => apt.code}
              style={{ maxHeight: 380 }}
              showsVerticalScrollIndicator={false}
              initialNumToRender={14}
              maxToRenderPerBatch={14}
              windowSize={7}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item: apt }) => (
                <Pressable
                  style={styles.modalItemRow}
                  onPress={() => {
                    if (showOriginModal) setFlightOriginAirport(apt);
                    else setFlightDestAirport(apt);
                    setShowOriginModal(false);
                    setShowDestAirportModal(false);
                    setAirportSearchText('');
                  }}
                >
                  <Flag emoji={apt.flag} size={34} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalItemText}>{apt.cityAr} ({apt.cityEn})</Text>
                    <Text style={styles.modalItemSub}>{apt.countryAr} • {apt.airportName}</Text>
                  </View>
                  <View style={styles.airportCodeBadge}>
                    <Text style={styles.airportCodeBadgeText}>{apt.code}</Text>
                  </View>
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* ── MODAL: HOTEL SELECTOR ────────────────────────────────────────── */}
      <Modal visible={showHotelPickerModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheetContainer}>
            <View style={styles.modalSheetHeader}>
              <Text style={styles.modalSheetTitle}>Select Confirmed Hotel</Text>
              <Pressable onPress={() => setShowHotelPickerModal(false)} hitSlop={12}>
                <X color="#64748B" size={20} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              {LUXURY_HOTELS_OPTIONS.map(htl => (
                <Pressable
                  key={htl.id}
                  style={[styles.modalItemRow, selectedHotel.id === htl.id && styles.modalItemRowActive]}
                  onPress={() => {
                    setSelectedHotel(htl);
                    setSelectedRoomType(htl.roomTypes[0]);
                    setShowHotelPickerModal(false);
                  }}
                >
                  <Building2 color="#D4AF37" size={22} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalItemText}>{htl.name}</Text>
                    <Text style={styles.modalItemSub}>{htl.city}, {htl.country} • {htl.address}</Text>
                    <View style={styles.hotelStarsRow}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} color="#D4AF37" fill="#D4AF37" size={12} />
                      ))}
                      <Text style={styles.hotelBadgeText}>{htl.badge}</Text>
                    </View>
                  </View>
                  {selectedHotel.id === htl.id && <Check color="#D4AF37" size={18} strokeWidth={2.5} />}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── MODAL: INSURANCE DESTINATION SELECTOR ────────────────────────── */}
      <Modal visible={showInsuranceDestModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheetContainer}>
            <View style={styles.modalSheetHeader}>
              <Text style={styles.modalSheetTitle}>Select Insurance Coverage Area</Text>
              <Pressable onPress={() => setShowInsuranceDestModal(false)} hitSlop={12}>
                <X color="#64748B" size={20} />
              </Pressable>
            </View>

            {[
              'European Schengen Area (29 States)',
              'United Kingdom',
              'USA & Canada',
              'Worldwide Coverage',
              'GCC & Middle East',
            ].map(dest => (
              <Pressable
                key={dest}
                style={[styles.modalItemRow, insuranceDest === dest && styles.modalItemRowActive]}
                onPress={() => {
                  setInsuranceDest(dest);
                  setShowInsuranceDestModal(false);
                }}
              >
                <MapPin color="#D4AF37" size={18} />
                <Text style={[styles.modalItemText, { flex: 1 }]}>{dest}</Text>
                {insuranceDest === dest && <Check color="#D4AF37" size={18} strokeWidth={2.5} />}
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      {/* ── INTERACTIVE DATE PICKER MODAL (No typing!) ──────────────────── */}
      <VipFlexibleDatePickerModal
        visible={datePickerVisible}
        onClose={() => setDatePickerVisible(false)}
        onSelectDate={handleDateSelected}
        initialDate={datePickerInitialDate}
        title={datePickerTitle}
        mode={datePickerMode}
        minYear={datePickerMode === 'dob' ? 1945 : datePickerMode === 'past' ? 1990 : 2024}
        maxYear={datePickerMode === 'dob' ? 2015 : datePickerMode === 'past' ? 2026 : 2030}
      />

      {/* ── ORDER PDF DOCUMENT VIEWER ───────────────────────────────────── */}
      <VisaDocumentPdfModal
        visible={pdfModalVisible}
        onClose={() => setPdfModalVisible(false)}
        docType={pdfDocType}
        data={pdfData}
      />
    </SafeAreaView>
  );
}

// ── LUXURY STYLESHEET ────────────────────────────────────────────────────────
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtnActive: {
    backgroundColor: '#1C1917',
    borderColor: '#D4AF37',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  breadcrumbBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 6,
  },
  breadcrumbItem: {
    paddingVertical: 2,
  },
  breadcrumbTextActive: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#D4AF37',
  },
  breadcrumbTextCurrent: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1C1917',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },

  // 3x3 Grid Styles
  gridSectionContainer: {
    gap: 16,
  },
  gridHeroCard: {
    backgroundColor: '#1C1917',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.2,
    borderColor: '#D4AF37',
  },
  gridHeroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  gridHeroBadgeText: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  gridHeroTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  gridHeroSub: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 18,
    marginTop: 4,
  },
  luxuryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  gridTile: {
    minHeight: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  gridTilePressed: {
    opacity: 0.88,
    transform: [{ scale: 0.96 }],
  },
  gridTileIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gridTileIconBoxHighlight: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  gridTileIconBoxHighlightGold: {
    backgroundColor: '#FEF3C7',
    borderColor: '#D4AF37',
  },
  gridTileTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1C1917',
    textAlign: 'center',
  },
  gridTileDesc: {
    fontSize: 9.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 13,
  },

  // Search & General Form Styles
  searchViewContainer: {
    gap: 16,
  },
  searchHeroBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchHeroTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1C1917',
    textAlign: 'center',
  },
  searchHeroSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1917',
    marginBottom: 6,
  },
  selectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF9F6',
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
  },
  selectorFlag: {
    fontSize: 14,
  },
  selectorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1917',
  },
  selectorSubText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  pickerActionHint: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D4AF37',
  },
  inputField: {
    backgroundColor: '#FAF9F6',
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1917',
  },
  primaryActionBtn: {
    backgroundColor: '#1C1917',
    borderRadius: 16,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    borderWidth: 1.2,
    borderColor: '#D4AF37',
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  // Search Results Breakdown
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    gap: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1C1917',
  },
  resultSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  resultStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeGreen: { backgroundColor: '#DCFCE7' },
  statusBadgeBlue: { backgroundColor: '#DBEAFE' },
  statusBadgeGold: { backgroundColor: '#FEF3C7' },
  resultStatusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1C1917',
  },
  resultMetricsRow: {
    flexDirection: 'row',
    backgroundColor: '#FAF9F6',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  resultMetricCol: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  metricVal: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#1C1917',
    marginTop: 2,
    textAlign: 'center',
  },
  requirementsBox: {
    backgroundColor: '#FAF9F6',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  requirementsHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1C1917',
  },
  reqRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  reqText: {
    flex: 1,
    fontSize: 11.5,
    color: '#334155',
    lineHeight: 16,
  },
  packageOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4AF37',
    borderRadius: 14,
    paddingVertical: 12,
    gap: 8,
  },
  packageOrderBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1917',
  },

  // Guide Card
  guideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1917',
  },
  guideStepRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  guideStepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#1C1917',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideStepNumText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '800',
  },
  guideStepHeader: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1C1917',
  },
  guideStepDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
    marginTop: 2,
  },

  // Packages View Styles
  packagesViewContainer: {
    gap: 14,
  },
  packagesMainTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1C1917',
    textAlign: 'center',
  },
  packagesMainSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: -8,
  },
  packageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  packageCardPopular: {
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  popularBadge: {
    backgroundColor: '#D4AF37',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: -6,
  },
  popularBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#1C1917',
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packageTier: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1917',
  },
  packagePrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#D4AF37',
  },
  packageFeaturesList: {
    gap: 6,
  },
  pkgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pkgText: {
    fontSize: 12,
    color: '#334155',
  },
  packageBtn: {
    backgroundColor: '#1C1917',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  packageBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  packageBtnGold: {
    backgroundColor: '#D4AF37',
  },
  packageBtnGoldText: {
    color: '#1C1917',
    fontSize: 13,
    fontWeight: '800',
  },

  // Flight Reservation Styles
  flightViewContainer: {
    gap: 16,
  },
  flightHeroBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  flightHeroTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1C1917',
    textAlign: 'center',
  },
  flightHeroSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
  },
  tripTypeRow: {
    flexDirection: 'row',
    backgroundColor: '#FAF9F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
  },
  tripTypeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  tripTypeBtnActive: {
    backgroundColor: '#1C1917',
  },
  tripTypeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  tripTypeTextActive: {
    color: '#FFFFFF',
  },
  airportRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  airportSelectBox: {
    flex: 1,
    backgroundColor: '#FAF9F6',
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    padding: 12,
  },
  airportLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  airportValRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 4,
  },
  airportFlag: {
    fontSize: 14,
  },
  airportCode: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1C1917',
    letterSpacing: 1,
  },
  airportCity: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
  },
  swapBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    elevation: 2,
  },
  datesRowContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  dateColBox: {
    flex: 1,
    backgroundColor: '#FAF9F6',
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    padding: 12,
  },
  dateColLabel: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
  },
  dateValRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  dateValText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1C1917',
  },
  flightClassRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
  },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF9F6',
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 4,
    justifyContent: 'space-between',
  },
  stepBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1917',
  },
  stepValText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#1C1917',
  },
  classChipsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  classChip: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#FAF9F6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  classChipActive: {
    backgroundColor: '#1C1917',
    borderColor: '#D4AF37',
  },
  classChipText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
  },
  classChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // Hotel View Styles
  hotelViewContainer: {
    gap: 16,
  },
  hotelHeroBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  hotelHeroTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1C1917',
    textAlign: 'center',
  },
  hotelHeroSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
  },
  roomTypesCol: {
    gap: 8,
  },
  roomTypePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  roomTypePillActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#D4AF37',
  },
  roomTypeText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  roomTypeTextActive: {
    color: '#1C1917',
    fontWeight: '800',
  },
  hotelNightsBanner: {
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    marginVertical: 4,
  },
  hotelNightsText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1C1917',
  },
  hotelNightsSub: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
  },
  guestsPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  guestPill: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#FAF9F6',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  guestPillActive: {
    backgroundColor: '#1C1917',
    borderColor: '#D4AF37',
  },
  guestPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  guestPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // Insurance View Styles
  insuranceViewContainer: {
    gap: 16,
  },
  insuranceHeroBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  insuranceHeroTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1C1917',
    textAlign: 'center',
  },
  insuranceHeroSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
  },
  durationPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationPill: {
    width: '48%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  durationPillActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#1D4ED8',
  },
  durationPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  durationPillTextActive: {
    color: '#1D4ED8',
    fontWeight: '800',
  },
  providersChoiceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  providerChoiceBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  providerChoiceBtnActive: {
    backgroundColor: '#1C1917',
    borderColor: '#D4AF37',
  },
  providerChoiceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  providerChoiceTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // NOC View Styles
  nocViewContainer: {
    gap: 16,
  },
  nocHeroBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  nocHeroTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1C1917',
    textAlign: 'center',
  },
  nocHeroSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
  },
  salaryInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currencyPills: {
    flexDirection: 'row',
    gap: 4,
  },
  currPill: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  currPillActive: {
    backgroundColor: '#1C1917',
    borderColor: '#D4AF37',
  },
  currPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
  },
  currPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // Itinerary View Styles
  itineraryViewContainer: {
    gap: 16,
  },
  itineraryHeroBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itineraryHeroTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1C1917',
    textAlign: 'center',
  },
  itineraryHeroSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
  },
  itinerarySampleDay: {
    backgroundColor: '#FAF9F6',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    gap: 4,
  },
  dayBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D4AF37',
  },
  dayText: {
    fontSize: 11.5,
    color: '#334155',
    lineHeight: 16,
  },

  // Embassies Directory Styles
  embassiesViewContainer: {
    gap: 14,
  },
  embassiesHeroBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  embassiesHeroTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1C1917',
    textAlign: 'center',
  },
  embassiesHeroSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
  },
  searchBarBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 10,
  },
  searchBarInput: {
    flex: 1,
    fontSize: 13,
    color: '#1C1917',
  },
  embassyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  embassyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  embassyFlag: {
    fontSize: 14,
  },
  embassyCountry: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1917',
  },
  embassyCenter: {
    fontSize: 12,
    color: '#1D4ED8',
    fontWeight: '700',
    marginTop: 2,
  },
  embassyDetails: {
    gap: 6,
    backgroundColor: '#FAF9F6',
    borderRadius: 10,
    padding: 10,
  },
  embassyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  embassyText: {
    fontSize: 11.5,
    color: '#475569',
    flex: 1,
  },
  embassyLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
  },
  embassyLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1917',
  },

  // Orders View Styles
  ordersViewContainer: {
    gap: 14,
  },
  ordersTabsScroll: {
    flexDirection: 'row',
  },
  ordersTabPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ordersTabPillActive: {
    backgroundColor: '#1C1917',
    borderColor: '#D4AF37',
  },
  ordersTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  ordersTabTextActive: {
    color: '#FFFFFF',
  },
  ordersLoadingBox: {
    paddingVertical: 50,
    alignItems: 'center',
    gap: 12,
  },
  ordersLoadingText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  ordersEmptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
    marginTop: 10,
  },
  ordersEmptyGraphicBox: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FAF9F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  ordersEmptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1917',
    textAlign: 'center',
  },
  ordersEmptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: '90%',
  },
  ordersCreateNewBtn: {
    backgroundColor: '#1C1917',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  ordersCreateNewBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  ordersListBox: {
    gap: 10,
  },
  orderItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  orderItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderItemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1917',
  },
  orderStatusPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  orderStatusText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#166534',
  },
  orderItemRef: {
    fontSize: 11.5,
    color: '#64748B',
  },
  orderItemPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D4AF37',
  },
  orderPdfBtn: {
    backgroundColor: '#FAF9F6',
    borderWidth: 1.2,
    borderColor: '#D4AF37',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  orderPdfBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1C1917',
  },

  // Modal Sheet Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  modalSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalSheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1917',
  },
  modalSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF9F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    marginVertical: 12,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 13,
    color: '#1C1917',
  },
  regionFilterScroll: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  regionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FAF9F6',
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  regionChipActive: {
    backgroundColor: '#1C1917',
    borderColor: '#D4AF37',
  },
  regionChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  regionChipTextActive: {
    color: '#FFFFFF',
  },
  modalItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    gap: 12,
  },
  modalItemRowActive: {
    backgroundColor: '#FAF9F6',
  },
  modalItemFlag: {
    fontSize: 14,
  },
  modalItemText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1C1917',
  },
  modalItemSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  airportCodeBadge: {
    backgroundColor: '#1C1917',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  airportCodeBadgeText: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  hotelStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  hotelBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#D4AF37',
    marginLeft: 6,
  },
});
