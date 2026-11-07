import React, { useState } from 'react';
import {
  Alert,
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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ChevronLeft,
  MoreVertical,
  User,
  Calendar,
  Globe,
  FileText,
  Hash,
  Mail,
  Phone,
  Check,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Plane,
  CircleAlert,
  Utensils,
  Award,
} from 'lucide-react-native';
import auth from '@react-native-firebase/auth';
import { VipFlexibleDatePickerModal } from '../../components/VipFlexibleDatePickerModal';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type PassengerDetailsRoute = RouteProp<RootStackParamList, 'PassengerDetails'>;

const TITLES = [
  { id: 'Mr.', labelEn: 'Mr.' },
  { id: 'Mrs.', labelEn: 'Mrs.' },
  { id: 'Ms.', labelEn: 'Ms.' },
  { id: 'Dr.', labelEn: 'Dr.' },
  { id: 'H.E.', labelEn: 'H.E.' },
  { id: 'Sheikh', labelEn: 'Sheikh' },
];

const GENDERS = [
  { id: 'Male', labelEn: 'Male' },
  { id: 'Female', labelEn: 'Female' },
];

const COUNTRIES = [
  { name: 'Egypt', flag: '🇪🇬' },
  { name: 'United Arab Emirates', flag: '🇦🇪' },
  { name: 'Saudi Arabia', flag: '🇸🇦' },
  { name: 'Kuwait', flag: '🇰🇼' },
  { name: 'Qatar', flag: '🇶🇦' },
  { name: 'Bahrain', flag: '🇧🇭' },
  { name: 'Oman', flag: '🇴🇲' },
  { name: 'United Kingdom', flag: '🇬🇧' },
  { name: 'United States', flag: '🇺🇸' },
  { name: 'France', flag: '🇫🇷' },
  { name: 'Germany', flag: '🇩🇪' },
  { name: 'Italy', flag: '🇮🇹' },
  { name: 'Switzerland', flag: '🇨🇭' },
  { name: 'Canada', flag: '🇨🇦' },
  { name: 'Turkey', flag: '🇹🇷' },
];

const ID_TYPES = [
  { id: 'Passport', label: 'International Passport' },
  { id: 'National ID', label: 'National ID Card' },
];

const MEALS = [
  { id: 'Standard Gourmet', label: 'Standard Gourmet Dining' },
  { id: 'Halal / Muslim Meal', label: 'Halal / Muslim Meal (MOML)' },
  { id: 'Vegetarian / Vegan', label: 'Vegetarian / Vegan (VGML)' },
  { id: 'Diabetic Meal', label: 'Diabetic Meal (DBML)' },
  { id: 'Low Sodium / Salt', label: 'Low Sodium Meal (LSML)' },
  { id: 'Gluten-Free', label: 'Gluten-Free Meal (GFML)' },
  { id: 'Kosher', label: 'Kosher Meal (KSML)' },
];

const ASSISTANCE = [
  { id: 'None', label: 'None / Standard Service' },
  { id: 'Wheelchair to Aircraft', label: 'Wheelchair to Aircraft Door (WCHC)' },
  { id: 'VIP Fast Track Escort', label: 'VIP Fast Track Escort' },
  { id: 'Infant Bassinet', label: 'Infant Bassinet' },
];

export function PassengerInfoScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<PassengerDetailsRoute>();
  const insets = useSafeAreaInsets();
  const currentUser = auth().currentUser;

  // Route parameters
  const flightNumber = route.params?.flightNumber ?? 'EK 902';
  const originCode = route.params?.originCode ?? 'CAI';
  const destinationCode = route.params?.destinationCode ?? 'DXB';
  const selectedSeats = route.params?.selectedSeats ?? ['01A'];
  const basePrice = route.params?.basePrice ?? 624;
  const totalPrice = route.params?.totalPrice ?? 686;
  const passengersCount = route.params?.passengers ?? 1;

  // 1. Identity Fields (Empty by default - no fake pass-through)
  const [title, setTitle] = useState('Mr.');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('');

  // 2. Travel Document Fields (Mandatory IATA requirements)
  const [idType, setIdType] = useState('Passport');
  const [passportNumber, setPassportNumber] = useState('');
  const [passportExpiry, setPassportExpiry] = useState('');
  const [passportCountry, setPassportCountry] = useState('Egypt');
  const [nationality, setNationality] = useState('Egypt');

  // 3. Contact Details
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState('');

  // 4. In-Flight Service Requests
  const [mealPreference, setMealPreference] = useState('Standard Gourmet');
  const [specialAssistance, setSpecialAssistance] = useState('None');

  // Validation errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Modals
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showNationalityModal, setShowNationalityModal] = useState(false);
  const [showPassportCountryModal, setShowPassportCountryModal] = useState(false);
  const [showIdTypeModal, setShowIdTypeModal] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);
  const [showAssistanceModal, setShowAssistanceModal] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [showExpiryPicker, setShowExpiryPicker] = useState(false);

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleContinueToPayment = () => {
    const newErrors: Record<string, string> = {};

    // 1. First Name
    if (!firstName.trim() || firstName.trim().length < 2) {
      newErrors.firstName = 'First name is required (min 2 characters)';
    }

    // 2. Last Name
    if (!lastName.trim() || lastName.trim().length < 2) {
      newErrors.lastName = 'Last name is required as shown in passport';
    }

    // 3. Date of Birth
    if (!dob.trim() || dob.trim().length < 8) {
      newErrors.dob = 'Date of birth is mandatory';
    }

    // 4. Gender
    if (!gender) {
      newErrors.gender = 'Please select gender';
    }

    // 5. Passport Number
    if (!passportNumber.trim() || passportNumber.trim().length < 6) {
      newErrors.passportNumber = 'Passport number is required (min 6 characters)';
    }

    // 6. Passport Expiry Date (mandatory per IATA)
    if (!passportExpiry.trim() || passportExpiry.trim().length < 8) {
      newErrors.passportExpiry = 'Passport expiry is mandatory (6 months validity)';
    }

    // 7. Passport Country
    if (!passportCountry) {
      newErrors.passportCountry = 'Issuing country is required';
    }

    // 8. Nationality
    if (!nationality) {
      newErrors.nationality = 'Nationality is required';
    }

    // 9. Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      newErrors.email = 'Valid email required for ticket delivery';
    }

    // 10. Phone
    const digitsOnly = phone.replace(/\D/g, '');
    if (!phone.trim() || digitsOnly.length < 7) {
      newErrors.phone = 'Valid phone number required for flight alerts';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Alert.alert(
        'Incomplete Information',
        'Please complete all required passenger details and travel document fields highlighted in red to proceed to payment.'
      );
      return;
    }

    const calculatedFullName = `${title} ${firstName.trim()} ${lastName.trim()}`.trim();
    const extraRoute = (route.params || {}) as any;

    (navigation as any).navigate('FlightPayment', {
      flightId: route.params?.flightId,
      airline: route.params?.airline,
      airlineCode: route.params?.airlineCode,
      flightNumber,
      origin: route.params?.origin,
      originCode,
      destination: route.params?.destination,
      destinationCode,
      departureTime: route.params?.departureTime,
      arrivalTime: route.params?.arrivalTime,
      duration: route.params?.duration,
      departureDate: extraRoute.departureDate,
      returnDate: extraRoute.returnDate,
      cabinClass: extraRoute.cabinClass,
      passengers: passengersCount,
      basePrice,
      taxes: Math.round(basePrice * 0.09935),
      totalPrice,
      selectedSeats,
      passenger: {
        title,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName: calculatedFullName,
        gender,
        dob: dob.trim(),
        nationality,
        idType,
        passportNumber: passportNumber.trim().toUpperCase(),
        passportExpiry: passportExpiry.trim(),
        passportCountry,
        email: email.trim(),
        phone: phone.trim(),
        mealPreference,
        specialAssistance,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

      {/* Screen Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.topBtnPressed]}
          onPress={() => navigation.goBack()}
          hitSlop={12}
        >
          <ChevronLeft color="#1C1917" size={22} strokeWidth={2.4} />
        </Pressable>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Passenger Details</Text>
          <Text style={styles.headerSub}>IATA Document & Travel Info</Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.menuBtn, pressed && styles.topBtnPressed]}
          onPress={() => setShowOptionsMenu(true)}
          hitSlop={12}
        >
          <MoreVertical color="#1C1917" size={20} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 + insets.bottom }]}
      >
        {/* Route Summary Pill */}
        <View style={styles.routePill}>
          <View style={styles.routePillLeft}>
            <Plane color="#D4AF37" size={16} />
            <Text style={styles.routePillText}>
              {originCode} ➔ {destinationCode} ({flightNumber})
            </Text>
          </View>
          <View style={styles.seatPill}>
            <Text style={styles.seatPillText}>
              Suite: {selectedSeats.join(', ')}
            </Text>
          </View>
        </View>

        {/* Security Requirement Banner */}
        <View style={styles.securityBanner}>
          <ShieldCheck color="#D4AF37" size={18} />
          <Text style={styles.securityBannerText}>
            IATA International Standard: Passenger information must strictly match the travel document / passport valid for at least 6 months.
          </Text>
        </View>

        {/* Section 1: Passenger Personal Identity */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>1. Passenger Identity</Text>
            <Text style={styles.cardTitleEn}>Personal Details</Text>
          </View>

          {/* Title / Salutation */}
          <Text style={styles.fieldLabel}>Title *</Text>
          <Pressable
            style={styles.dropdownBtn}
            onPress={() => setShowTitleModal(true)}
          >
            <View style={styles.dropdownLeft}>
              <Award color="#94A3B8" size={17} />
              <Text style={styles.dropdownValue}>{title}</Text>
            </View>
            <ChevronDown color="#94A3B8" size={16} />
          </Pressable>

          {/* First Name & Last Name Row */}
          <View style={styles.row}>
            {/* First Name */}
            <View style={styles.halfCol}>
              <Text style={styles.fieldLabel}>First Name *</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.firstName && styles.inputWrapperError,
                ]}
              >
                <User color={errors.firstName ? '#EF4444' : '#94A3B8'} size={16} />
                <TextInput
                  style={styles.textInput}
                  value={firstName}
                  onChangeText={val => {
                    setFirstName(val);
                    clearError('firstName');
                  }}
                  placeholder="e.g. Ahmed"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="words"
                />
              </View>
              {errors.firstName ? (
                <View style={styles.errorRow}>
                  <CircleAlert color="#EF4444" size={12} />
                  <Text style={styles.errorText}>{errors.firstName}</Text>
                </View>
              ) : null}
            </View>

            {/* Last Name */}
            <View style={styles.halfCol}>
              <Text style={styles.fieldLabel}>Last Name *</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.lastName && styles.inputWrapperError,
                ]}
              >
                <User color={errors.lastName ? '#EF4444' : '#94A3B8'} size={16} />
                <TextInput
                  style={styles.textInput}
                  value={lastName}
                  onChangeText={val => {
                    setLastName(val);
                    clearError('lastName');
                  }}
                  placeholder="e.g. Al Mansoori"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="words"
                />
              </View>
              {errors.lastName ? (
                <View style={styles.errorRow}>
                  <CircleAlert color="#EF4444" size={12} />
                  <Text style={styles.errorText}>{errors.lastName}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Gender & Date of Birth Row */}
          <View style={styles.row}>
            {/* Gender */}
            <View style={styles.halfCol}>
              <Text style={styles.fieldLabel}>Gender *</Text>
              <Pressable
                style={[
                  styles.dropdownBtn,
                  errors.gender && styles.inputWrapperError,
                ]}
                onPress={() => setShowGenderModal(true)}
              >
                <View style={styles.dropdownLeft}>
                  <Text style={styles.dropdownValue}>{gender}</Text>
                </View>
                <ChevronDown color="#94A3B8" size={16} />
              </Pressable>
              {errors.gender ? (
                <View style={styles.errorRow}>
                  <CircleAlert color="#EF4444" size={12} />
                  <Text style={styles.errorText}>{errors.gender}</Text>
                </View>
              ) : null}
            </View>

            {/* Date of Birth */}
            <View style={styles.halfCol}>
              <Text style={styles.fieldLabel}>Date of Birth *</Text>
              <Pressable
                style={[
                  styles.inputWrapper,
                  errors.dob && styles.inputWrapperError,
                ]}
                onPress={() => setShowDobPicker(true)}
              >
                <Calendar color={errors.dob ? '#EF4444' : '#D4AF37'} size={16} />
                <Text
                  style={[
                    styles.textInput,
                    { fontSize: 13, color: dob ? '#1C1917' : '#94A3B8' },
                  ]}
                  numberOfLines={1}
                >
                  {dob || 'Select Date'}
                </Text>
              </Pressable>
              {errors.dob ? (
                <View style={styles.errorRow}>
                  <CircleAlert color="#EF4444" size={12} />
                  <Text style={styles.errorText}>{errors.dob}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Nationality Dropdown */}
          <Text style={styles.fieldLabel}>Nationality *</Text>
          <Pressable
            style={[
              styles.dropdownBtn,
              errors.nationality && styles.inputWrapperError,
            ]}
            onPress={() => setShowNationalityModal(true)}
          >
            <View style={styles.dropdownLeft}>
              <Globe color="#94A3B8" size={18} />
              <Text style={styles.dropdownValue}>{nationality}</Text>
            </View>
            <ChevronDown color="#94A3B8" size={18} />
          </Pressable>
          {errors.nationality ? (
            <View style={styles.errorRow}>
              <CircleAlert color="#EF4444" size={12} />
              <Text style={styles.errorText}>{errors.nationality}</Text>
            </View>
          ) : null}
        </View>

        {/* Section 2: Passport & Travel Documents */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>2. Travel Document & Passport</Text>
            <Text style={styles.cardTitleEn}>Passport Credentials</Text>
          </View>

          {/* ID Type */}
          <Text style={styles.fieldLabel}>Document Type *</Text>
          <Pressable
            style={styles.dropdownBtn}
            onPress={() => setShowIdTypeModal(true)}
          >
            <View style={styles.dropdownLeft}>
              <FileText color="#94A3B8" size={17} />
              <Text style={styles.dropdownValue}>{idType}</Text>
            </View>
            <ChevronDown color="#94A3B8" size={16} />
          </Pressable>

          {/* Passport Number Input */}
          <Text style={styles.fieldLabel}>Passport Number *</Text>
          <View
            style={[
              styles.inputWrapper,
              errors.passportNumber && styles.inputWrapperError,
            ]}
          >
            <Hash color={errors.passportNumber ? '#EF4444' : '#94A3B8'} size={16} />
            <TextInput
              style={styles.textInput}
              value={passportNumber}
              onChangeText={val => {
                setPassportNumber(val);
                clearError('passportNumber');
              }}
              placeholder="e.g. A12345678"
              placeholderTextColor="#94A3B8"
              autoCapitalize="characters"
            />
          </View>
          {errors.passportNumber ? (
            <View style={styles.errorRow}>
              <CircleAlert color="#EF4444" size={12} />
              <Text style={styles.errorText}>{errors.passportNumber}</Text>
            </View>
          ) : null}

          {/* Passport Expiry & Issuing Country Row */}
          <View style={styles.row}>
            {/* Passport Expiry */}
            <View style={styles.halfCol}>
              <Text style={styles.fieldLabel}>Expiry Date *</Text>
              <Pressable
                style={[
                  styles.inputWrapper,
                  errors.passportExpiry && styles.inputWrapperError,
                ]}
                onPress={() => setShowExpiryPicker(true)}
              >
                <Calendar color={errors.passportExpiry ? '#EF4444' : '#D4AF37'} size={16} />
                <Text
                  style={[
                    styles.textInput,
                    { fontSize: 13, color: passportExpiry ? '#1C1917' : '#94A3B8' },
                  ]}
                  numberOfLines={1}
                >
                  {passportExpiry || 'Select Expiry'}
                </Text>
              </Pressable>
              {errors.passportExpiry ? (
                <View style={styles.errorRow}>
                  <CircleAlert color="#EF4444" size={12} />
                  <Text style={styles.errorText}>{errors.passportExpiry}</Text>
                </View>
              ) : null}
            </View>

            {/* Issuing Country */}
            <View style={styles.halfCol}>
              <Text style={styles.fieldLabel}>Issuing Country *</Text>
              <Pressable
                style={[
                  styles.dropdownBtn,
                  errors.passportCountry && styles.inputWrapperError,
                ]}
                onPress={() => setShowPassportCountryModal(true)}
              >
                <Text style={styles.dropdownValue} numberOfLines={1}>
                  {passportCountry}
                </Text>
                <ChevronDown color="#94A3B8" size={16} />
              </Pressable>
              {errors.passportCountry ? (
                <View style={styles.errorRow}>
                  <CircleAlert color="#EF4444" size={12} />
                  <Text style={styles.errorText}>{errors.passportCountry}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* Section 3: Contact & E-Ticket Notification */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>3. Contact & Ticket Delivery</Text>
            <Text style={styles.cardTitleEn}>Contact & Notifications</Text>
          </View>

          {/* Email Input */}
          <Text style={styles.fieldLabel}>Email Address *</Text>
          <View
            style={[
              styles.inputWrapper,
              errors.email && styles.inputWrapperError,
            ]}
          >
            <Mail color={errors.email ? '#EF4444' : '#94A3B8'} size={18} />
            <TextInput
              style={styles.textInput}
              value={email}
              onChangeText={val => {
                setEmail(val);
                clearError('email');
              }}
              placeholder="e.g. vip@vanir.luxury"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          {errors.email ? (
            <View style={styles.errorRow}>
              <CircleAlert color="#EF4444" size={12} />
              <Text style={styles.errorText}>{errors.email}</Text>
            </View>
          ) : null}

          {/* Phone Number Input */}
          <Text style={styles.fieldLabel}>Mobile Phone *</Text>
          <View
            style={[
              styles.inputWrapper,
              errors.phone && styles.inputWrapperError,
            ]}
          >
            <Phone color={errors.phone ? '#EF4444' : '#94A3B8'} size={18} />
            <TextInput
              style={styles.textInput}
              value={phone}
              onChangeText={val => {
                setPhone(val);
                clearError('phone');
              }}
              placeholder="+971 50 123 4567 / +20 10 1234 5678"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
            />
          </View>
          {errors.phone ? (
            <View style={styles.errorRow}>
              <CircleAlert color="#EF4444" size={12} />
              <Text style={styles.errorText}>{errors.phone}</Text>
            </View>
          ) : null}
        </View>

        {/* Section 4: In-Flight Preferences (IATA SSR) */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>4. In-Flight Preferences</Text>
            <Text style={styles.cardTitleEn}>In-Flight Services (SSR)</Text>
          </View>

          {/* Meal Preference */}
          <Text style={styles.fieldLabel}>Meal Preference</Text>
          <Pressable
            style={styles.dropdownBtn}
            onPress={() => setShowMealModal(true)}
          >
            <View style={styles.dropdownLeft}>
              <Utensils color="#94A3B8" size={17} />
              <Text style={styles.dropdownValue} numberOfLines={1}>{mealPreference}</Text>
            </View>
            <ChevronDown color="#94A3B8" size={16} />
          </Pressable>

          {/* Special Assistance */}
          <Text style={styles.fieldLabel}>Special Assistance</Text>
          <Pressable
            style={styles.dropdownBtn}
            onPress={() => setShowAssistanceModal(true)}
          >
            <View style={styles.dropdownLeft}>
              <Sparkles color="#94A3B8" size={17} />
              <Text style={styles.dropdownValue} numberOfLines={1}>{specialAssistance}</Text>
            </View>
            <ChevronDown color="#94A3B8" size={16} />
          </Pressable>
        </View>
      </ScrollView>

      {/* Floating Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          style={({ pressed }) => [styles.continueBtn, pressed && styles.btnPressed]}
          onPress={handleContinueToPayment}
        >
          <Text style={styles.continueBtnText}>Continue to Secure Payment</Text>
          <Text style={styles.continueBtnSub}>Proceed to official ticket issuance</Text>
        </Pressable>
      </View>

      {/* Title Selection Modal */}
      <Modal visible={showTitleModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowTitleModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Title</Text>
            {TITLES.map(t => (
              <Pressable
                key={t.id}
                style={[styles.modalOption, title === t.id && styles.modalOptionActive]}
                onPress={() => {
                  setTitle(t.id);
                  setShowTitleModal(false);
                }}
              >
                <Text style={[styles.modalOptionText, title === t.id && styles.modalOptionTextActive]}>
                  {t.labelEn}
                </Text>
                {title === t.id && <Check color="#D4AF37" size={18} strokeWidth={2.5} />}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Gender Selection Modal */}
      <Modal visible={showGenderModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowGenderModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Gender</Text>
            {GENDERS.map(g => (
              <Pressable
                key={g.id}
                style={[styles.modalOption, gender === g.id && styles.modalOptionActive]}
                onPress={() => {
                  setGender(g.id);
                  clearError('gender');
                  setShowGenderModal(false);
                }}
              >
                <Text style={[styles.modalOptionText, gender === g.id && styles.modalOptionTextActive]}>
                  {g.labelEn}
                </Text>
                {gender === g.id && <Check color="#D4AF37" size={18} strokeWidth={2.5} />}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Nationality Selection Modal */}
      <Modal visible={showNationalityModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowNationalityModal(false)}>
          <View style={[styles.modalContent, { maxHeight: '70%' }]}>
            <Text style={styles.modalTitle}>Select Nationality</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {COUNTRIES.map(n => (
                <Pressable
                  key={n.name}
                  style={[styles.modalOption, nationality === n.name && styles.modalOptionActive]}
                  onPress={() => {
                    setNationality(n.name);
                    clearError('nationality');
                    setShowNationalityModal(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>
                    {n.flag}  {n.name}
                  </Text>
                  {nationality === n.name && <Check color="#D4AF37" size={18} strokeWidth={2.5} />}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Passport Country Selection Modal */}
      <Modal visible={showPassportCountryModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowPassportCountryModal(false)}>
          <View style={[styles.modalContent, { maxHeight: '70%' }]}>
            <Text style={styles.modalTitle}>Passport Issuing Country</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {COUNTRIES.map(n => (
                <Pressable
                  key={`pass-${n.name}`}
                  style={[styles.modalOption, passportCountry === n.name && styles.modalOptionActive]}
                  onPress={() => {
                    setPassportCountry(n.name);
                    clearError('passportCountry');
                    setShowPassportCountryModal(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>
                    {n.flag}  {n.name}
                  </Text>
                  {passportCountry === n.name && <Check color="#D4AF37" size={18} strokeWidth={2.5} />}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* ID Type Selection Modal */}
      <Modal visible={showIdTypeModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowIdTypeModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Identification Type</Text>
            {ID_TYPES.map(type => (
              <Pressable
                key={type.id}
                style={[styles.modalOption, idType === type.id && styles.modalOptionActive]}
                onPress={() => {
                  setIdType(type.id);
                  setShowIdTypeModal(false);
                }}
              >
                <Text style={[styles.modalOptionText, idType === type.id && styles.modalOptionTextActive]}>
                  {type.label}
                </Text>
                {idType === type.id && <Check color="#D4AF37" size={18} strokeWidth={2.5} />}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Meal Selection Modal */}
      <Modal visible={showMealModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowMealModal(false)}>
          <View style={[styles.modalContent, { maxHeight: '65%' }]}>
            <Text style={styles.modalTitle}>In-Flight Meal</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {MEALS.map(meal => (
                <Pressable
                  key={meal.id}
                  style={[styles.modalOption, mealPreference === meal.id && styles.modalOptionActive]}
                  onPress={() => {
                    setMealPreference(meal.id);
                    setShowMealModal(false);
                  }}
                >
                  <Text style={[styles.modalOptionText, mealPreference === meal.id && styles.modalOptionTextActive]}>
                    {meal.label}
                  </Text>
                  {mealPreference === meal.id && <Check color="#D4AF37" size={18} strokeWidth={2.5} />}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Special Assistance Modal */}
      <Modal visible={showAssistanceModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowAssistanceModal(false)}>
          <View style={[styles.modalContent, { maxHeight: '65%' }]}>
            <Text style={styles.modalTitle}>Special Assistance</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {ASSISTANCE.map(item => (
                <Pressable
                  key={item.id}
                  style={[styles.modalOption, specialAssistance === item.id && styles.modalOptionActive]}
                  onPress={() => {
                    setSpecialAssistance(item.id);
                    setShowAssistanceModal(false);
                  }}
                >
                  <Text style={[styles.modalOptionText, specialAssistance === item.id && styles.modalOptionTextActive]}>
                    {item.label}
                  </Text>
                  {specialAssistance === item.id && <Check color="#D4AF37" size={18} strokeWidth={2.5} />}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Options Menu Modal */}
      <Modal visible={showOptionsMenu} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowOptionsMenu(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Passenger Options</Text>
            <Pressable
              style={styles.modalOption}
              onPress={() => {
                setFirstName('');
                setLastName('');
                setPassportNumber('');
                setPassportExpiry('');
                setEmail('');
                setPhone('');
                setDob('');
                setErrors({});
                setShowOptionsMenu(false);
              }}
            >
              <Text style={[styles.modalOptionText, { color: '#EF4444' }]}>
                Clear All Form Fields
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Interactive Date of Birth Picker */}
      <VipFlexibleDatePickerModal
        visible={showDobPicker}
        onClose={() => setShowDobPicker(false)}
        initialDate={dob || '1990-05-15'}
        mode="dob"
        minYear={1930}
        maxYear={new Date().getFullYear()}
        title="Date of Birth"
        onSelectDate={selected => {
          setDob(selected);
          clearError('dob');
        }}
      />

      {/* Interactive Passport Expiry Picker */}
      <VipFlexibleDatePickerModal
        visible={showExpiryPicker}
        onClose={() => setShowExpiryPicker(false)}
        initialDate={passportExpiry || '2031-10-20'}
        mode="future"
        minYear={new Date().getFullYear()}
        maxYear={2038}
        title="Passport Expiry Date"
        onSelectDate={selected => {
          setPassportExpiry(selected);
          clearError('passportExpiry');
        }}
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
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#FAF9F6',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: -0.2,
  },
  headerSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#B48E28',
    letterSpacing: 0.3,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  topBtnPressed: {
    backgroundColor: 'rgba(212, 175, 55, 0.22)',
    borderColor: '#D4AF37',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  routePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  routePillLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routePillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1917',
  },
  seatPill: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  seatPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1C1917',
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  securityBannerText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: '#1C1917',
    lineHeight: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(28, 25, 23, 0.06)',
    paddingBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1917',
  },
  cardTitleEn: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B48E28',
    textTransform: 'uppercase',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
    marginTop: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    gap: 10,
  },
  inputWrapperError: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.04)',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#1C1917',
    fontWeight: '600',
    paddingVertical: 0,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfCol: {
    flex: 1,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  dropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  dropdownValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1917',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.25)',
  },
  continueBtn: {
    backgroundColor: '#D4AF37',
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  continueBtnText: {
    color: '#1C1917',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  continueBtnSub: {
    color: '#1C1917',
    fontSize: 10,
    fontWeight: '700',
    opacity: 0.8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 25, 23, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FAF9F6',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1917',
    marginBottom: 14,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(28, 25, 23, 0.08)',
  },
  modalOptionActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  modalOptionText: {
    fontSize: 13,
    color: '#1C1917',
    fontWeight: '600',
  },
  modalOptionTextActive: {
    color: '#D4AF37',
    fontWeight: '800',
  },
});
