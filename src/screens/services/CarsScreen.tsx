import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ActivityIndicator,
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {
  ChevronLeft,
  Users,
  Briefcase,
  Star,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Award,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  CheckCircle2,
  X,
  Car as CarIcon,
  Check,
  FileText,
  CreditCard,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCatalogStore } from '../../context/CatalogStore';
import { VipDetailDrawer, type VipDrawerItem } from '../../components/VipDetailDrawer';
import { VipDatePickerModal } from '../../components/VipDatePickerModal';
import { VisaDocumentPdfModal } from '../../components/VisaDocumentPdfModal';
import { formatWesternPrice } from '../../utils/pricingUtils';
import { LuxuryPressable } from '../../components/LuxuryMicroInteractions';
import { LOCAL_BOOKINGS_STORAGE_KEY } from '../../services/savedCardsStore';
import { getLocalBookingsHistory, type StoredBookingRecord } from '../../services/paymentGateway';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface CarItem {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  seats: number;
  luggage: number;
  rating: number;
  pricePerDay: string;
  hourlyRate: string;
  image: string;
  images?: string[];
  features: string[];
  chauffeurDetail?: string;
  badge?: string;
}

const CARS: CarItem[] = [
  {
    id: 'c-amg-gt',
    name: 'Mercedes-AMG GT 63 S 4-Door',
    subtitle: 'Handcrafted 4.0L Bi-Turbo V8 • 630 HP • VIP Chauffeur',
    category: 'AMG Supercar Sedan',
    seats: 4,
    luggage: 3,
    rating: 5.0,
    pricePerDay: '$800',
    hourlyRate: '$160/hr',
    badge: 'AMG Performance',
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=1200&q=85',
    images: [
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=1200&q=85',
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1000&q=80',
    ],
    features: [
      'Handcrafted 4.0L V8 Biturbo producing 630 HP',
      'AMG Performance Nappa Leather Executive Seating',
      'Burmester High-End 3D Surround Audio System',
      'Dedicated Performance-Trained VIP Chauffeur',
    ],
    chauffeurDetail:
      'Performance & security-certified driver trained in evasive driving and diplomatic protocol. Discreet, uniformed, and multilingual.',
  },
  {
    id: 'c-maybach',
    name: 'Mercedes-Maybach S 680',
    subtitle: 'First-Class Executive Rear Lounge • V12 Twin-Turbo',
    category: 'First Class Sedan',
    seats: 4,
    luggage: 3,
    rating: 5.0,
    pricePerDay: '$650',
    hourlyRate: '$130/hr',
    badge: 'Royal Lounge',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1000&q=80',
      'https://images.unsplash.com/photo-1622353219448-46a482b6c165?w=1000&q=80',
    ],
    features: [
      'Executive Reclining Rear First-Class Suites',
      'Silver-Plated Champagne Flutes & Refrigerator',
      'Burmester 4D Surround Sound with Acoustic Glass',
      'Discreet Security-Cleared Private Chauffeur',
    ],
    chauffeurDetail:
      'Executive chauffeur with over 10 years experience serving diplomats and royal families. Flight tracking and tarmac meet & greet included.',
  },
  {
    id: 'c-rr-ghost',
    name: 'Rolls-Royce Ghost Extended',
    subtitle: 'Starlight Fiber-Optic Ceiling • Champagne Cooler',
    category: 'Prestige Chauffeur',
    seats: 4,
    luggage: 4,
    rating: 5.0,
    pricePerDay: '$1,200',
    hourlyRate: '$220/hr',
    badge: 'Flagship Luxury',
    image: 'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=1000&q=80',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&q=80',
    ],
    features: [
      'Handcrafted Starlight Fiber-Optic Headliner',
      'Whisper-Quiet Architecture of Luxury Cabin',
      'Effortless Automatic Closing Coach Doors',
      'Dedicated Royal Chauffeur in Bespoke Attire',
    ],
    chauffeurDetail:
      'Senior executive chauffeur with Rolls-Royce White Glove certification. Fluent in English, Arabic, and French.',
  },
  {
    id: 'c-cullinan',
    name: 'Rolls-Royce Cullinan Series II',
    subtitle: 'All-Terrain Luxury SUV • Viewing Suite Module',
    category: 'Ultra-Luxury SUV',
    seats: 4,
    luggage: 4,
    rating: 5.0,
    pricePerDay: '$1,400',
    hourlyRate: '$250/hr',
    badge: 'Supreme SUV',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1000&q=80',
      'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=1000&q=80',
    ],
    features: [
      '6.75L Twin-Turbocharged V12 Engine',
      'Deployable Leather Viewing Suite in Tailgate',
      'Bespoke Audio System with 18 Speakers',
      'High-Clearance All-Terrain Air Suspension',
    ],
    chauffeurDetail:
      'Expert all-terrain and city VIP chauffeur. Experienced with high-profile delegations and cross-country expeditions.',
  },
  {
    id: 'c-bentayga',
    name: 'Bentley Bentayga EWB Azure',
    subtitle: 'Extended Wheelbase Airline Seat Specification',
    category: 'Prestige SUV',
    seats: 4,
    luggage: 4,
    rating: 4.9,
    pricePerDay: '$950',
    hourlyRate: '$180/hr',
    badge: 'Extended Comfort',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&q=80',
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1000&q=80',
    ],
    features: [
      'Airline Seat with Auto Climate Sensing & Postural Adjustment',
      'Power Close Rear Doors & Diamond Quilted Leather',
      'Naim for Bentley 1,780W Premium Sound System',
      'Bentley Dynamic Ride 48V Electronic Active Roll Control',
    ],
    chauffeurDetail:
      'Certified luxury chauffeur specializing in executive airport transfers and intercity travel with 24/7 flight monitoring.',
  },
  {
    id: 'c-range-rover',
    name: 'Range Rover SV Autobiography LWB',
    subtitle: 'Executive Class Comfort-Plus Rear Console',
    category: 'Executive SUV',
    seats: 4,
    luggage: 5,
    rating: 4.9,
    pricePerDay: '$750',
    hourlyRate: '$140/hr',
    badge: 'British Luxury',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1000&q=80',
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=1200&q=85',
    ],
    features: [
      'Hot Stone Massage Executive Rear Seating',
      'Electrically Deployable Club Tables & Fridge',
      'Active Noise Cancellation in Headrests',
      'Four-Wheel Steering for Superior Agility',
    ],
    chauffeurDetail:
      'Uniformed professional chauffeur trained in executive security, route optimization, and discrete VIP protocol.',
  },
];

const CHAUFFEUR_PACKAGES = [
  { id: 'transfer', name: 'Airport VIP Meet & Transfer', hours: 'Direct', priceMultiplier: 0.45 },
  { id: 'half_day', name: 'Executive Half-Day (4 Hours)', hours: '4 Hours', priceMultiplier: 0.65 },
  { id: 'full_day', name: 'Full-Day VIP Chauffeur (12 Hours)', hours: '12 Hours', priceMultiplier: 1.0 },
  { id: 'multi_day', name: '24-Hour Presidential Escort', hours: '24 Hours', priceMultiplier: 1.5 },
];

export function CarsScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedDrawerItem, setSelectedDrawerItem] = useState<VipDrawerItem | null>(null);

  // In-App Car Booking Modal State
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [bookingCar, setBookingCar] = useState<CarItem | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState('full_day');
  const [guestName, setGuestName] = useState(
    () => auth().currentUser?.displayName || 'VIP Chauffeur Guest',
  );
  const [guestPhone, setGuestPhone] = useState('+971 50 123 4567');
  const [guestEmail, setGuestEmail] = useState(
    () => auth().currentUser?.email || 'vip@vanirgroup.com',
  );
  const [pickupLocation, setPickupLocation] = useState('Dubai International Airport (DXB) VIP Terminal');
  const [dropoffLocation, setDropoffLocation] = useState('Burj Al Arab Suite / Private Residence');
  const [pickupDate, setPickupDate] = useState(
    () => new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
  );
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [specialRequests, setSpecialRequests] = useState('Chilled champagne, English-speaking executive chauffeur.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');

  const { itemsByCategory, fetchCategory } = useCatalogStore();
  const liveLimos = itemsByCategory.limousines;

  useEffect(() => {
    fetchCategory('limousines').catch(() => undefined);
    const curr = auth().currentUser;
    if (curr) {
      if (curr.displayName) setGuestName(curr.displayName);
      if (curr.email) setGuestEmail(curr.email);
    }
  }, [fetchCategory]);

  const carsList = useMemo<CarItem[]>(() => {
    if (liveLimos && liveLimos.length > 0) {
      const mapped = liveLimos.map((item: any) => {
        const fallback = CARS.find(c => c.name.toLowerCase() === item.name.toLowerCase()) || CARS[0];
        return {
          id: item.id,
          name: item.name,
          subtitle: item.description || fallback.subtitle,
          category: item.category || fallback.category,
          seats: item.capacity || fallback.seats,
          luggage: item.luggage || fallback.luggage,
          rating: item.rating || fallback.rating,
          pricePerDay: item.pricePerDay || item.price || fallback.pricePerDay,
          hourlyRate: item.hourlyRate || fallback.hourlyRate,
          image: item.image || fallback.image,
          images: item.images && item.images.length > 0 ? item.images : fallback.images,
          features: item.features && item.features.length > 0 ? item.features : fallback.features,
          chauffeurDetail: fallback.chauffeurDetail,
          badge: fallback.badge,
        };
      });

      if (!mapped.some(m => m.name.toLowerCase().includes('amg'))) {
        return [CARS[0], ...mapped];
      }
      return mapped;
    }
    return CARS;
  }, [liveLimos]);

  const handleCardPress = (car: CarItem) => {
    const { amount, period } = formatWesternPrice(car.pricePerDay, 'day');
    setSelectedDrawerItem({
      id: car.id,
      title: car.name,
      subtitle: car.subtitle,
      category: car.category,
      badge: car.badge || 'VIP CHAUFFEUR',
      image: car.image,
      images: car.images,
      price: amount,
      pricePer: period,
      rating: car.rating,
      specs: [
        { label: 'Seats', value: `${car.seats} Passengers` },
        { label: 'Luggage', value: `${car.luggage} Cases` },
        { label: 'Chauffeur', value: 'Security Trained' },
        { label: 'Rate', value: car.hourlyRate },
      ],
      privileges: car.features,
      chauffeurOrButlerInfo: {
        role: 'Uniformed Private VIP Chauffeur',
        detail:
          car.chauffeurDetail ||
          'Dedicated executive driver adhering to diplomatic confidentiality, continuous flight tracking, and tarmac greeting protocol.',
        badge: 'SECURITY CLEARED',
      },
      ctaText: 'Reserve Private Chauffeur',
    });
    setDrawerVisible(true);
  };

  const handleOpenBooking = (car: CarItem) => {
    setBookingCar(car);
    setBookingConfirmed(false);
    setConfirmationCode('');
    setBookingModalVisible(true);
  };

  const handleDrawerBook = useCallback((drawerItem: VipDrawerItem) => {
    const car = carsList.find(c => c.id === drawerItem.id) || carsList[0];
    setDrawerVisible(false);
    handleOpenBooking(car);
  }, [carsList]);

  // Calculate dynamic booking total
  const selectedPkg = CHAUFFEUR_PACKAGES.find(p => p.id === selectedPackageId) || CHAUFFEUR_PACKAGES[2];
  const baseNumPrice = bookingCar ? parseFloat(bookingCar.pricePerDay.replace(/[^0-9.]/g, '')) || 800 : 800;
  const calculatedTotal = Math.round(baseNumPrice * selectedPkg.priceMultiplier);

  const handleProceedToCheckout = () => {
    const carName = bookingCar?.name || 'Mercedes-AMG GT 63 S';
    setBookingModalVisible(false);
    navigation.navigate('Booking', {
      type: 'car',
      visaDocType: 'car',
      id: bookingCar?.id || 'car-vip',
      itemName: `${carName} — ${selectedPkg.name}`,
      bookingType: 'VIP Chauffeur & Fleet',
      price: calculatedTotal,
      startDate: pickupDate,
      endDate: pickupDate,
      guestsCount: bookingCar?.seats || 4,
      origin: pickupLocation.trim(),
      destination: dropoffLocation.trim(),
      durationLabel: selectedPkg.hours,
      vehicleOrVesselName: carName,
      image: bookingCar?.image,
      specialRequests: specialRequests.trim(),
    });
  };

  const handleConfirmBooking = async () => {
    if (!guestName.trim()) {
      Alert.alert('Required Information', 'Please provide guest full name.');
      return;
    }
    if (!guestPhone.trim()) {
      Alert.alert('Required Information', 'Please provide phone number for driver coordination.');
      return;
    }

    setIsSubmitting(true);
    const ref = `VN-CAR-${Math.floor(100000 + Math.random() * 900000)}`;
    const user = auth().currentUser;
    const createdAtIso = new Date().toISOString();
    const carName = bookingCar?.name || 'Mercedes-AMG GT 63 S';

    const metadata = {
      visaDocType: 'car',
      vehicleOrVesselName: carName,
      pickupLocation: pickupLocation.trim(),
      dropoffLocation: dropoffLocation.trim(),
      durationLabel: selectedPkg.hours,
      packageName: selectedPkg.name,
    };

    try {
      const bookingPayload = {
        bookingId: ref,
        confirmationCode: ref,
        bookingType: 'limousine',
        itemName: `${carName} — ${selectedPkg.name}`,
        carId: bookingCar?.id || 'car-vip',
        carName,
        carCategory: bookingCar?.category || 'AMG Supercar Sedan',
        packageId: selectedPkg.id,
        packageName: selectedPkg.name,
        duration: selectedPkg.hours,
        guestName: guestName.trim(),
        guestPhone: guestPhone.trim(),
        guestEmail: guestEmail.trim(),
        pickupLocation: pickupLocation.trim(),
        dropoffLocation: dropoffLocation.trim(),
        pickupDate,
        startDate: pickupDate,
        endDate: pickupDate,
        guestsCount: bookingCar?.seats || 4,
        specialRequests: specialRequests.trim(),
        amount: calculatedTotal,
        totalAmount: calculatedTotal,
        currency: 'USD',
        status: 'confirmed',
        paymentStatus: 'invoice_issued',
        paymentSummaryLabel: 'VIP CHAUFFEUR DISPATCH HOLD',
        metadata,
        userId: user?.uid || 'guest',
        userEmail: user?.email || guestEmail.trim(),
        createdAt: createdAtIso,
      };

      await firestore().collection('bookings').doc(ref).set(bookingPayload);
    } catch (err: any) {
      console.warn('Car booking error:', err);
    }

    try {
      const existing = await getLocalBookingsHistory();
      const record: StoredBookingRecord = {
        id: ref,
        confirmationCode: ref,
        transactionId: `HOLD-${ref}`,
        paymentSummaryLabel: 'VIP CHAUFFEUR DISPATCH HOLD',
        amount: calculatedTotal,
        currency: 'USD',
        itemName: `${carName} — ${selectedPkg.name}`,
        bookingType: 'VIP Chauffeur & Fleet',
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim(),
        guestPhone: guestPhone.trim(),
        startDate: pickupDate,
        endDate: pickupDate,
        guestsCount: bookingCar?.seats || 4,
        specialRequests: specialRequests.trim(),
        metadata,
        status: 'confirmed',
        createdAt: createdAtIso,
      };
      await AsyncStorage.setItem(
        LOCAL_BOOKINGS_STORAGE_KEY,
        JSON.stringify([record, ...existing.slice(0, 49)]),
      );
    } catch {
      // Ignore storage error
    }

    setConfirmationCode(ref);
    setBookingConfirmed(true);
    setIsSubmitting(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

      {/* Luxury Off-White Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Back"
        >
          <ChevronLeft color="#1C1917" size={22} strokeWidth={2.4} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Limousine & Fleet</Text>
          <Text style={styles.headerSub}>Bespoke Chauffeur & Exotic Supercars</Text>
        </View>

        <View style={styles.brandLogoBox}>
          <Image
            source={require('../../assets/vanir_round_logo.png')}
            style={styles.brandLogo}
            resizeMode="cover"
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 + insets.bottom }}
      >
        <View style={styles.feedContainer}>
          {carsList.map(car => {
            const { amount, period } = formatWesternPrice(car.pricePerDay, 'day');

            return (
              <View
                key={car.id}
                style={styles.luxuryCard}
              >
                {/* Upper Image Section */}
                <View style={styles.cardImageContainer}>
                  <Image
                    source={{ uri: car.image }}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />

                  {/* Top Overlay Badges (Category only, zero numbers over photo) */}
                  <View style={styles.topBadgeRow}>
                    <View style={styles.categoryBadge}>
                      <Sparkles color="#D4AF37" size={12} strokeWidth={1.5} />
                      <Text style={styles.categoryBadgeText}>
                        {(car.badge || car.category).toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Lower White Editorial Panel */}
                <View style={styles.cardContentPanel}>
                  {/* Vehicle Title & Subtitle */}
                  <Text style={styles.carName} numberOfLines={1}>
                    {car.name}
                  </Text>
                  <Text style={styles.carSubtitle} numberOfLines={1}>
                    {car.subtitle}
                  </Text>

                  {/* Minimalist Specs Row */}
                  <View style={styles.microSpecsRow}>
                    <View style={styles.microSpecItem}>
                      <Star color="#D4AF37" fill="#D4AF37" size={12} />
                      <Text style={styles.microSpecText}>{car.rating.toFixed(1)}</Text>
                    </View>
                    <View style={styles.specDot} />
                    <View style={styles.microSpecItem}>
                      <Users color="#D4AF37" size={13} strokeWidth={1.8} />
                      <Text style={styles.microSpecText}>{car.seats} Seats</Text>
                    </View>
                    <View style={styles.specDot} />
                    <View style={styles.microSpecItem}>
                      <Briefcase color="#D4AF37" size={13} strokeWidth={2} />
                      <Text style={styles.microSpecText}>{car.luggage} Bags</Text>
                    </View>
                    <View style={styles.specDot} />
                    <View style={styles.microSpecItem}>
                      <ShieldCheck color="#D4AF37" size={13} strokeWidth={2} />
                      <Text style={styles.microSpecText}>VIP Chauffeur</Text>
                    </View>
                  </View>

                  {/* Price & Action Buttons Row */}
                  <View style={styles.priceActionRow}>
                    <View style={styles.priceBlock}>
                      <Text style={styles.priceValue}>{amount}</Text>
                      <Text style={styles.pricePeriod}>{period}</Text>
                    </View>

                    <View style={styles.actionsGroup}>
                      <LuxuryPressable
                        style={styles.detailsBtn}
                        onPress={() => handleCardPress(car)}
                      >
                        <Text style={styles.detailsBtnText}>Details</Text>
                      </LuxuryPressable>

                      <LuxuryPressable
                        style={styles.bookBtn}
                        onPress={() => handleOpenBooking(car)}
                      >
                        <Text style={styles.bookBtnText}>Book Now</Text>
                        <ArrowRight color="#1C1917" size={12} strokeWidth={2.4} />
                      </LuxuryPressable>
                    </View>
                  </View>
                </View>
              </View>
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

      {/* ========================================================================= */}
      {/* FULL INTERACTIVE IN-APP CAR BOOKING MODAL */}
      {/* ========================================================================= */}
      <Modal
        visible={bookingModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setBookingModalVisible(false)}
      >
        <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom']}>
          <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>Reserve VIP Vehicle</Text>
              <Text style={styles.modalSub}>
                {bookingCar?.name || 'Exclusive Chauffeur Reservation'}
              </Text>
            </View>
            <Pressable
              style={styles.modalCloseBtn}
              onPress={() => setBookingModalVisible(false)}
            >
              <X color="#1C1917" size={20} strokeWidth={2.2} />
            </Pressable>
          </View>

          {bookingConfirmed ? (
            /* Booking Confirmation Success State */
            <View style={styles.successContainer}>
              <View style={styles.successIconBox}>
                <CheckCircle2 color="#D4AF37" size={56} strokeWidth={2} />
              </View>
              <Text style={styles.successTitle}>Reservation Dispatched</Text>
              <Text style={styles.successDesc}>
                Your chauffeur booking for {bookingCar?.name} is confirmed and recorded.
              </Text>

              <View style={styles.successRefBox}>
                <Text style={styles.successRefLabel}>BOOKING REFERENCE</Text>
                <Text style={styles.successRefCode}>{confirmationCode}</Text>
                <Text style={styles.successRefMeta}>
                  {selectedPkg.name} • {pickupDate}
                </Text>
              </View>

              <View style={styles.successInfoCard}>
                <View style={styles.infoRow}>
                  <MapPin color="#D4AF37" size={16} />
                  <Text style={styles.infoRowText}>Pickup: {pickupLocation}</Text>
                </View>
                <View style={styles.infoRow}>
                  <User color="#D4AF37" size={16} />
                  <Text style={styles.infoRowText}>Guest: {guestName}</Text>
                </View>
                <View style={styles.infoRow}>
                  <ShieldCheck color="#D4AF37" size={16} />
                  <Text style={styles.infoRowText}>Chauffeur protocol: Security Cleared VIP</Text>
                </View>
              </View>

              <LuxuryPressable
                style={styles.pdfBtn}
                onPress={() => setPdfModalVisible(true)}
              >
                <FileText color="#1C1917" size={18} strokeWidth={2.2} />
                <Text style={styles.pdfBtnText}>
                  View & Print Stamped Chauffeur Contract (PDF)
                </Text>
              </LuxuryPressable>

              <LuxuryPressable
                style={styles.doneBtn}
                onPress={() => setBookingModalVisible(false)}
              >
                <Text style={styles.doneBtnText}>Return to Fleet</Text>
              </LuxuryPressable>
            </View>
          ) : (
            /* Booking Form */
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScroll}
            >
              {/* Selected Car Highlight */}
              {bookingCar && (
                <View style={styles.carSelectedHeaderCard}>
                  <Image source={{ uri: bookingCar.image }} style={styles.modalCarThumb} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.modalCarName}>{bookingCar.name}</Text>
                    <Text style={styles.modalCarRate}>{bookingCar.pricePerDay}/day • VIP Protocol</Text>
                  </View>
                </View>
              )}

              {/* Package Duration Selector */}
              <Text style={styles.inputSectionTitle}>SELECT ITINERARY PACKAGE</Text>
              <View style={styles.packageList}>
                {CHAUFFEUR_PACKAGES.map(pkg => {
                  const isSelected = selectedPackageId === pkg.id;
                  const pkgPrice = Math.round(baseNumPrice * pkg.priceMultiplier);
                  return (
                    <Pressable
                      key={pkg.id}
                      style={[
                        styles.packageCard,
                        isSelected && styles.packageCardSelected,
                      ]}
                      onPress={() => setSelectedPackageId(pkg.id)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.pkgName, isSelected && styles.pkgNameSelected]}>
                          {pkg.name}
                        </Text>
                        <Text style={styles.pkgHours}>{pkg.hours} with dedicated chauffeur</Text>
                      </View>
                      <Text style={[styles.pkgPrice, isSelected && styles.pkgPriceSelected]}>
                        ${pkgPrice}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Guest & Trip Details */}
              <Text style={[styles.inputSectionTitle, { marginTop: 20 }]}>PRIMARY GUEST & TRIP DETAILS</Text>

              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>FULL NAME</Text>
                <TextInput
                  style={styles.textInput}
                  value={guestName}
                  onChangeText={setGuestName}
                  placeholder="Guest Name"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>EMAIL FOR OFFICIAL CONTRACT</Text>
                <TextInput
                  style={styles.textInput}
                  value={guestEmail}
                  onChangeText={setGuestEmail}
                  placeholder="vip@vanirgroup.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputBox, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>PHONE</Text>
                  <TextInput
                    style={styles.textInput}
                    value={guestPhone}
                    onChangeText={setGuestPhone}
                    placeholder="+971 50 ..."
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                  />
                </View>
                <View style={[styles.inputBox, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>PICKUP DATE</Text>
                  <Pressable
                    style={styles.datePickerTrigger}
                    onPress={() => setDateModalVisible(true)}
                  >
                    <Calendar color="#D4AF37" size={15} strokeWidth={2} />
                    <Text style={styles.datePickerText}>{pickupDate}</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>PICKUP LOCATION</Text>
                <TextInput
                  style={styles.textInput}
                  value={pickupLocation}
                  onChangeText={setPickupLocation}
                  placeholder="Airport, Hotel, or Residence"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>DROP-OFF DESTINATION</Text>
                <TextInput
                  style={styles.textInput}
                  value={dropoffLocation}
                  onChangeText={setDropoffLocation}
                  placeholder="Destination Address"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>SPECIAL PROTOCOL & REQUESTS (OPTIONAL)</Text>
                <TextInput
                  style={[styles.textInput, { height: 60 }]}
                  value={specialRequests}
                  onChangeText={setSpecialRequests}
                  placeholder="Security escort, luggage assistance, refreshments..."
                  placeholderTextColor="#94A3B8"
                  multiline
                />
              </View>

              {/* Price Summary & Submit */}
              <View style={styles.summaryBox}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Package Rate ({selectedPkg.hours}):</Text>
                  <Text style={styles.summaryVal}>${calculatedTotal}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>VIP Chauffeur & Fuel:</Text>
                  <Text style={styles.summaryValGold}>INCLUDED</Text>
                </View>
                <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 8, marginTop: 4 }]}>
                  <Text style={styles.summaryTotalLabel}>Total Reservation:</Text>
                  <Text style={styles.summaryTotalVal}>${calculatedTotal}</Text>
                </View>
              </View>

              <LuxuryPressable
                style={styles.confirmSubmitBtn}
                onPress={handleProceedToCheckout}
              >
                <CreditCard color="#1C1917" size={16} strokeWidth={2.3} />
                <Text style={styles.confirmSubmitText}>
                  Pay & Issue Official Contract (${calculatedTotal})
                </Text>
                <ArrowRight color="#1C1917" size={16} strokeWidth={2.4} />
              </LuxuryPressable>

              <LuxuryPressable
                style={styles.secondaryHoldBtn}
                onPress={handleConfirmBooking}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#D4AF37" />
                ) : (
                  <Text style={styles.secondaryHoldText}>
                    Quick Dispatch Hold & Provisional Voucher
                  </Text>
                )}
              </LuxuryPressable>
            </ScrollView>
          )}

          <VipDatePickerModal
            visible={dateModalVisible}
            initialDate={pickupDate}
            title="Select Chauffeur Pickup Date"
            onClose={() => setDateModalVisible(false)}
            onSelectDate={d => {
              setPickupDate(d);
              setDateModalVisible(false);
            }}
          />

          <VisaDocumentPdfModal
            visible={pdfModalVisible}
            onClose={() => setPdfModalVisible(false)}
            docType="car"
            data={{
              referenceNumber: confirmationCode || 'VN-CAR-PROVISIONAL',
              clientName: guestName || 'VIP Chauffeur Guest',
              email: guestEmail,
              phone: guestPhone,
              vehicleOrVesselName: bookingCar?.name || 'Mercedes-AMG GT 63 S',
              packageName: selectedPkg.name,
              durationLabel: selectedPkg.hours,
              pickupLocation,
              dropoffLocation,
              checkInDate: pickupDate,
              checkOutDate: pickupDate,
              guestsCount: bookingCar?.seats || 4,
              totalAmountPaid: calculatedTotal,
              paymentMethod: 'VIP Chauffeur Dispatch Authorization',
              transactionId: `HOLD-${confirmationCode || 'CAR'}`,
              specialRequests,
            }}
          />
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
  feedContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
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
    shadowOpacity: 0.1,
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
  carName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.2,
  },
  carSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
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
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailsBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  detailsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1917',
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7.5,
    borderRadius: 12,
    backgroundColor: '#D4AF37',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  bookBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1C1917',
  },

  /* In-App Booking Modal Styles */
  modalSafe: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
    backgroundColor: '#FAF9F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1917',
  },
  modalSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    padding: 20,
    paddingBottom: 40,
  },
  carSelectedHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    marginBottom: 20,
  },
  modalCarThumb: {
    width: 65,
    height: 50,
    borderRadius: 10,
  },
  modalCarName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1917',
  },
  modalCarRate: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '700',
    marginTop: 2,
  },
  inputSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  packageList: {
    gap: 8,
    marginBottom: 10,
  },
  packageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  packageCardSelected: {
    borderColor: '#D4AF37',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
  },
  pkgName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1917',
  },
  pkgNameSelected: {
    color: '#1C1917',
    fontWeight: '800',
  },
  pkgHours: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  pkgPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1917',
  },
  pkgPriceSelected: {
    color: '#D4AF37',
    fontSize: 15,
  },
  inputBox: {
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
  },
  inputLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 5,
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1C1917',
    fontWeight: '600',
  },
  summaryBox: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    marginTop: 14,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  summaryVal: {
    fontSize: 12,
    color: '#1C1917',
    fontWeight: '700',
  },
  summaryValGold: {
    fontSize: 11,
    color: '#D4AF37',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  summaryTotalLabel: {
    fontSize: 14,
    color: '#1C1917',
    fontWeight: '800',
  },
  summaryTotalVal: {
    fontSize: 18,
    color: '#1C1917',
    fontWeight: '900',
  },
  confirmSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4AF37',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmSubmitText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1917',
  },

  /* Success State */
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  successIconBox: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1C1917',
  },
  successDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  successRefBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginVertical: 18,
  },
  successRefLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 1,
  },
  successRefCode: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1C1917',
    marginVertical: 4,
    letterSpacing: 1.5,
  },
  successRefMeta: {
    fontSize: 11,
    color: '#64748B',
  },
  successInfoCard: {
    width: '100%',
    backgroundColor: '#FAF9F6',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoRowText: {
    fontSize: 12,
    color: '#1C1917',
    fontWeight: '600',
    flex: 1,
  },
  doneBtn: {
    width: '100%',
    backgroundColor: '#1C1917',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  pdfBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#D4AF37',
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 3,
  },
  pdfBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1917',
  },
  datePickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.5)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10.5,
  },
  datePickerText: {
    fontSize: 13,
    color: '#1C1917',
    fontWeight: '700',
  },
  secondaryHoldBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#1C1917',
    paddingVertical: 13,
    borderRadius: 14,
    marginTop: 10,
  },
  secondaryHoldText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1917',
  },
});
