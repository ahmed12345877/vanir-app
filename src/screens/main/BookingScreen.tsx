import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { formatEnglishNumber } from '../../lib/formatters';
import {
  ChevronLeft,
  Calendar,
  Users,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Mail,
  User,
  ArrowRight,
  Clock,
  Check,
  Lock,
  ChevronRight,
  Copy,
  FileDown,
  Building2,
  Landmark,
  Plus,
  IdCard,
} from 'lucide-react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { RealQRCode } from '../../components/RealQRCode';
import { VisaDocumentPdfModal, type VisaDocType } from '../../components/VisaDocumentPdfModal';
import { VipDatePickerModal } from '../../components/VipDatePickerModal';
import {
  VisaMastercardLogo,
  PaypalLogo,
  GooglePayLogo,
  ApplePayLogo,
} from '../../components/PaymentLogos';
import {
  LuxuryPressable,
  StaggeredFadeInUp,
} from '../../components/LuxuryMicroInteractions';
import { SecurePaymentOverlay } from '../../components/SecurePaymentOverlay';
import {
  GooglePayModal,
  PayPalModal,
  ApplePayModal,
} from '../../components/PaymentWalletModals';
import {
  executePaymentGatewayHandshake,
  SupportedPaymentMethod,
  validateCardCvv,
  validateCardExpiry,
  validateCardNumberLuhn,
} from '../../services/paymentGateway';
import {
  detectCardBrand,
  evaluatePromoCode,
  formatCardNumberInput,
  formatExpiryInput,
  getSavedCards,
  SavedCardItem,
} from '../../services/savedCardsStore';
import { confirmRoomReservation } from '../../services/hotelSearchApi';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type BookingRoute = RouteProp<RootStackParamList, 'Booking'>;
type CheckoutStep = 'details' | 'addons' | 'payment';

export function BookingScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<BookingRoute>();
  const insets = useSafeAreaInsets();

  const params = (route.params || {}) as any;
  const itemName = params.itemName ?? 'The Nile Ritz-Carlton, Cairo - Deluxe Suite';
  const bookingType = String(params.type || params.bookingType || 'hotel');
  const holdIdParam = params.holdId;
  const holdExpiresAtParam = params.holdExpiresAt;
  const roomTitleParam = params.roomType || params.roomTitle;
  const hotelNameParam = params.hotelName;

  const isStayType = useMemo(() => {
    const t = bookingType.toLowerCase();
    return t === 'hotel' || t === 'visa-hotel' || t === 'apartment';
  }, [bookingType]);

  // Checkout Wizard Step
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('details');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Form State: Guest Details & Property Info
  const currentUser = auth().currentUser;
  const [guestName, setGuestName] = useState<string>(
    params.guestName || currentUser?.displayName || '',
  );
  const [guestEmail, setGuestEmail] = useState<string>(currentUser?.email || '');
  const [guestPhone, setGuestPhone] = useState<string>(currentUser?.phoneNumber || '');
  const [passportNumber, setPassportNumber] = useState<string>(params.passportNumber || '');
  const [hotelNameState, setHotelNameState] = useState<string>(
    hotelNameParam || (isStayType ? itemName.split(' - ')[0] : ''),
  );
  const [roomTypeState, setRoomTypeState] = useState<string>(
    roomTitleParam || 'Deluxe Executive Suite (Breakfast Included)',
  );
  const [startDate, setStartDate] = useState<string>(
    params.startDate || params.checkInDate || '2026-11-20',
  );
  const [endDate, setEndDate] = useState<string>(
    params.endDate || params.checkOutDate || '2026-11-24',
  );
  const [guestsCount, setGuestsCount] = useState<number>(Number(params.guestsCount) || 2);

  // Interactive Date Picker Modal State
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [dateModalTarget, setDateModalTarget] = useState<'start' | 'end'>('start');

  const computedNights = useMemo(() => {
    try {
      const s = new Date(startDate).getTime();
      const e = new Date(endDate).getTime();
      const diff = Math.ceil((e - s) / 86400000);
      return diff > 0 ? diff : Number(params.nights) || 1;
    } catch {
      return Number(params.nights) || 1;
    }
  }, [startDate, endDate, params.nights]);

  // Wallet Authorization Modals
  const [showGPayModal, setShowGPayModal] = useState(false);
  const [showPayPalModal, setShowPayPalModal] = useState(false);
  const [showApplePayModal, setShowApplePayModal] = useState(false);

  // 10-Minute Room Hold Countdown Timer
  const [holdSecondsRemaining, setHoldSecondsRemaining] = useState<number>(() => {
    if (holdExpiresAtParam) {
      const diff = Math.floor((holdExpiresAtParam - Date.now()) / 1000);
      return diff > 0 ? diff : 0;
    }
    return 600;
  });

  useEffect(() => {
    if (bookingType !== 'hotel' && !holdIdParam) return;
    const interval = setInterval(() => {
      setHoldSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [bookingType, holdIdParam]);

  const formatHoldTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Add-ons & Special Notes
  const [addTarmac, setAddTarmac] = useState(false);
  const [addButler, setAddButler] = useState(false);
  const [specialRequests, setSpecialRequests] = useState(params.specialRequests || '');

  // Promo Code State
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromoCode, setAppliedPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);

  // Payment & Saved Cards State
  const [paymentMethod, setPaymentMethod] = useState<
    'card' | 'paypal' | 'google_pay' | 'apple_pay' | 'bank_wire'
  >('card');
  const [savedCards, setSavedCards] = useState<SavedCardItem[]>([]);
  const [selectedSavedCardId, setSelectedSavedCardId] = useState<string | 'new'>('new');
  const [saveCardForFuture, setSaveCardForFuture] = useState(true);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getSavedCards().then(cards => {
        if (!active) return;
        setSavedCards(cards);
        if (cards.length > 0) {
          const def = cards.find(c => c.isDefault) || cards[0];
          setSelectedSavedCardId(prev =>
            prev === 'new' && !cardNumber ? def.id : prev,
          );
        }
      });
      return () => {
        active = false;
      };
    }, [cardNumber]),
  );

  const activeSavedCard =
    selectedSavedCardId !== 'new'
      ? savedCards.find(c => c.id === selectedSavedCardId) || null
      : null;
  const detectedCardBrand = detectCardBrand(cardNumber);

  // Submission & Handshake Verification
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [verifiedTxId, setVerifiedTxId] = useState('');
  const [verifiedPayLabel, setVerifiedPayLabel] = useState('');
  const [copiedLpa, setCopiedLpa] = useState(false);
  const [showVisaPdf, setShowVisaPdf] = useState(false);

  const computedVisaDocType: VisaDocType = useMemo(() => {
    if (params.visaDocType) return params.visaDocType as VisaDocType;
    const t = (bookingType || '').toLowerCase();
    if (t.includes('insurance')) return 'insurance';
    if (t.includes('noc')) return 'noc';
    if (t.includes('flight')) return 'flight';
    if (t.includes('apartment')) return 'apartment';
    if (t.includes('hotel')) return 'hotel';
    if (t.includes('itinerary')) return 'itinerary';
    if (t.includes('jet')) return 'jet';
    if (t.includes('yacht')) return 'yacht';
    if (t.includes('limo') || t.includes('chauffeur') || t.includes('transfer')) return 'limousine';
    if (t.includes('car')) return 'car';
    if (t.includes('airport') || t.includes('vip')) return 'airport';
    if (t.includes('esim')) return 'esim';
    if (t.includes('tour') || t.includes('daytrip')) return 'tour';
    return 'package';
  }, [bookingType, params.visaDocType]);

  // Dynamic Price Calculation
  const parsedPrice =
    typeof params.price === 'number'
      ? params.price
      : typeof params.price === 'string'
      ? parseFloat(params.price.replace(/[^0-9.]/g, ''))
      : null;

  const basePrice =
    parsedPrice && !isNaN(parsedPrice) && parsedPrice > 0
      ? parsedPrice
      : bookingType === 'esim'
      ? 24
      : bookingType.includes('limo') || bookingType.includes('car')
      ? 350
      : bookingType.includes('yacht')
      ? 950
      : bookingType.includes('jet')
      ? 5800
      : bookingType.includes('hotel') || bookingType.includes('apartment')
      ? 450
      : bookingType.includes('airport')
      ? 150
      : 850;

  const addonTotal = (addTarmac ? 250 : 0) + (addButler ? 300 : 0);
  const subtotal = basePrice + addonTotal;
  const taxes = Math.round(subtotal * 0.05);
  const grossTotal = subtotal + taxes;
  const total = Math.max(1, Math.round((grossTotal - promoDiscount) * 100) / 100);

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) {
      Alert.alert('Promo Code', 'Please enter a promo code first.');
      return;
    }
    const res = evaluatePromoCode(code, grossTotal);
    if (res.valid) {
      setPromoDiscount(res.discount);
      setAppliedPromoCode(res.code);
      Alert.alert(
        'Promo Applied!',
        `${res.label}\nDiscount of $${res.discount.toFixed(2)} applied to reservation total!`,
      );
    } else {
      Alert.alert(
        'Invalid Code',
        'Try one of our active codes: VIP2026, ROYAL10, VANIR20, or WELCOME50.',
      );
    }
  };

  // Header Back Button Logic across stages
  const handleBack = () => {
    if (currentStep === 'payment') {
      setCurrentStep('addons');
    } else if (currentStep === 'addons') {
      setCurrentStep('details');
    } else {
      navigation.goBack();
    }
  };

  // Build unified rich metadata object for both Firestore storage & Official PDF generation
  const resolvedPdfMetadata = useMemo(() => {
    const chosenHotel = hotelNameState.trim() || hotelNameParam || itemName;
    const chosenRoom = roomTypeState.trim() || roomTitleParam || 'Deluxe Executive Suite';
    return {
      visaDocType: computedVisaDocType,
      clientName: guestName.trim() || 'VIP Client',
      passportNumber: passportNumber.trim() || params.passportNumber || 'VERIFIED-ID',
      nationality: params.nationality || 'International',
      dob: params.dob,
      destinationCountry:
        params.destinationCountry || params.city || params.destination || 'International',
      destinationCity: params.destinationCity || params.city || params.destination || '',
      hotelName: chosenHotel,
      hotelAddress: params.hotelAddress || params.city || params.destination || '',
      roomType: chosenRoom,
      checkInDate: startDate,
      checkOutDate: endDate,
      nights: computedNights,
      guestsCount,
      insuranceProvider: params.insuranceProvider || 'AXA Schengen',
      insuranceCoverageAmount:
        params.insuranceCoverageAmount || '€50,000 / $55,000 (Zero Deductible)',
      insuranceStartDate: params.insuranceStartDate || startDate,
      insuranceEndDate: params.insuranceEndDate || endDate,
      insuranceDurationDays: params.insuranceDurationDays || computedNights,
      flightTripType: params.flightTripType || 'round',
      flightOrigin: params.flightOrigin || 'Cairo International Airport (CAI)',
      flightOriginCode: params.flightOriginCode || 'CAI',
      flightDestination: params.flightDestination || 'Paris Charles de Gaulle (CDG)',
      flightDestinationCode: params.flightDestinationCode || 'CDG',
      flightDepartureDate: params.flightDepartureDate || startDate,
      flightReturnDate: params.flightReturnDate || endDate,
      flightAirline: params.flightAirline || 'Emirates',
      flightAirlineCode: params.flightAirlineCode || 'EK',
      flightNumber: params.flightNumber || 'EK 924',
      jobTitle: params.jobTitle,
      companyName: params.companyName,
      monthlySalary: params.monthlySalary,
      salaryCurrency: params.salaryCurrency,
      managerName: params.managerName,
      managerContact: params.managerContact,
      employmentStartDate: params.employmentStartDate,
      embassyName: params.embassyName,
      itineraryDays: params.itineraryDays,
      packageName: isStayType ? `${chosenHotel} — ${chosenRoom}` : itemName,
      packageTier: params.packageTier || 'VIP Royal Tier',
    };
  }, [
    computedVisaDocType,
    guestName,
    passportNumber,
    params,
    hotelNameState,
    hotelNameParam,
    itemName,
    roomTypeState,
    roomTitleParam,
    startDate,
    endDate,
    computedNights,
    guestsCount,
    isStayType,
  ]);

  // Authentic Payment Processing Handshake & Confirmation
  const processConfirmedPayment = async (
    method: 'card' | 'paypal' | 'google_pay' | 'apple_pay' | 'bank_wire',
  ) => {
    setIsSubmitting(true);

    const gatewayMethod: SupportedPaymentMethod =
      method === 'card' && activeSavedCard ? 'saved_card' : method;

    try {
      const [result] = await Promise.all([
        executePaymentGatewayHandshake({
          amount: grossTotal,
          currency: 'USD',
          cardNumber: method === 'card' && !activeSavedCard ? cardNumber : '',
          cardExpiry:
            method === 'card'
              ? activeSavedCard
                ? activeSavedCard.expiry
                : cardExpiry
              : '',
          cardCvv: method === 'card' && !activeSavedCard ? cardCvv : '',
          cardHolder:
            method === 'card'
              ? activeSavedCard
                ? activeSavedCard.holderName
                : cardHolder.trim()
              : guestName.trim() || 'VIP Client',
          paymentMethod: gatewayMethod,
          savedCardId: activeSavedCard?.id,
          savedCardLast4: activeSavedCard?.last4,
          savedCardBrand: activeSavedCard?.brand,
          saveCardForFuture: method === 'card' && !activeSavedCard && saveCardForFuture,
          promoCode: appliedPromoCode || undefined,
          guest: {
            name: guestName.trim(),
            email: guestEmail.trim(),
            phone: guestPhone.trim(),
            passportNumber: passportNumber.trim() || params.passportNumber || '',
            nationality: params.nationality || '',
          },
          reservation: {
            itemName: isStayType && hotelNameState.trim()
              ? `${hotelNameState.trim()} — ${roomTypeState.trim()}`
              : itemName,
            bookingType,
            startDate,
            endDate,
            guestsCount,
            addTarmac,
            addButler,
            specialRequests,
            metadata: resolvedPdfMetadata,
          },
        }),
        new Promise(resolve => setTimeout(resolve, 1400)),
      ]);

      if (result && result.httpStatus === 200 && result.success === true && result.confirmationCode) {
        if (holdIdParam) {
          try {
            await confirmRoomReservation(
              holdIdParam,
              result.transactionId,
              result.httpStatus,
              { name: guestName.trim(), email: guestEmail.trim(), phone: guestPhone.trim() },
              {
                hotelId: String(params.id || params.hotelId || 'hotel-vip'),
                hotelName: hotelNameState.trim() || hotelNameParam || itemName,
                roomTitle: roomTypeState.trim() || roomTitleParam || itemName,
                checkInDate: startDate,
                checkOutDate: endDate,
                nights: computedNights,
                guestsCount,
                totalAmount: result.finalAmount || total,
              },
            );
          } catch (confirmErr) {
            console.warn('[BookingScreen] Room confirmation callback error:', confirmErr);
          }
        }

        if (bookingType === 'esim') {
          try {
            const lpaString = `LPA:1$smdp.vanir-telecom.com$${result.confirmationCode}`;
            const user = auth().currentUser;
            await firestore().collection('esim_profiles').doc(result.confirmationCode).set({
              code: result.confirmationCode,
              lpaCode: lpaString,
              smdpAddress: 'smdp.vanir-telecom.com',
              itemName,
              guestName: guestName.trim(),
              guestEmail: guestEmail.trim(),
              guestPhone: guestPhone.trim(),
              status: 'active',
              dataPlan: itemName,
              totalAmount: result.finalAmount || total,
              currency: 'USD',
              activatedAt: new Date().toISOString(),
              userId: user?.uid || null,
              userEmail: user?.email || guestEmail.trim(),
              paymentMethod: result.paymentSummaryLabel,
              transactionId: result.transactionId,
            });
          } catch (esimSaveErr) {
            console.warn('[BookingScreen] eSIM save error:', esimSaveErr);
          }
        }

        setConfirmationCode(result.confirmationCode);
        setVerifiedTxId(result.transactionId || `TX-${Date.now().toString(36).toUpperCase()}`);
        setVerifiedPayLabel(result.paymentSummaryLabel);
        setShowSuccessModal(true);
      } else {
        Alert.alert(
          'Payment Authorization Declined',
          'Gateway did not return an HTTP 200 verification response.',
        );
      }
    } catch (err: any) {
      Alert.alert(
        'Payment Error',
        err?.message || 'Unable to authorize payment. Please review card details and try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Primary Action Button Handler
  const handlePrimaryAction = async () => {
    if (currentStep === 'details') {
      if (!guestName.trim() || guestName.trim().length < 3) {
        Alert.alert(
          'Required Info',
          'Please enter the primary guest full name.',
        );
        return;
      }
      if (!guestEmail.trim() || !guestEmail.includes('@') || !guestEmail.includes('.')) {
        Alert.alert(
          'Required Info',
          'Please enter a valid email address.',
        );
        return;
      }
      if (!guestPhone.trim() || guestPhone.trim().length < 7) {
        Alert.alert(
          'Required Info',
          'Please enter a valid phone or WhatsApp number.',
        );
        return;
      }
      if (isStayType && !hotelNameState.trim()) {
        Alert.alert(
          'Hotel Name Required',
          'Please enter or confirm the hotel or property name.',
        );
        return;
      }
      setCurrentStep('addons');
      return;
    }

    if (currentStep === 'addons') {
      setCurrentStep('payment');
      return;
    }

    if (currentStep === 'payment') {
      if (paymentMethod === 'card') {
        if (activeSavedCard) {
          await processConfirmedPayment('card');
          return;
        }
        const cleanCard = cardNumber.replace(/\D/g, '');
        if (!cleanCard || cleanCard.length < 15 || !validateCardNumberLuhn(cleanCard)) {
          Alert.alert(
            'Invalid Card',
            'Please enter a valid 15 or 16-digit card number (Luhn verified).',
          );
          return;
        }
        if (!cardHolder.trim() || cardHolder.trim().length < 3) {
          Alert.alert(
            'Cardholder Required',
            'Please enter the cardholder name as printed on card.',
          );
          return;
        }
        if (!validateCardExpiry(cardExpiry)) {
          Alert.alert(
            'Invalid Expiry',
            'Card expiry date must be valid MM/YY.',
          );
          return;
        }
        if (!validateCardCvv(cardCvv)) {
          Alert.alert(
            'CVV Required',
            'Please enter a valid 3 or 4-digit CVV security code.',
          );
          return;
        }
        await processConfirmedPayment('card');
        return;
      }

      if (paymentMethod === 'bank_wire') {
        await processConfirmedPayment('bank_wire');
        return;
      }

      if (paymentMethod === 'google_pay') {
        setShowGPayModal(true);
        return;
      }

      if (paymentMethod === 'paypal') {
        setShowPayPalModal(true);
        return;
      }

      if (paymentMethod === 'apple_pay') {
        setShowApplePayModal(true);
        return;
      }
    }
  };

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
          onPress={handleBack}
        >
          <ChevronLeft color="#1C1917" size={20} strokeWidth={2.2} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Complete Reservation</Text>
          <Text style={styles.headerSub}>VANIR VIP Concierge Checkout</Text>
        </View>
        <View style={styles.headerRightBadge}>
          <ShieldCheck color="#D4AF37" size={18} strokeWidth={2} />
        </View>
      </View>

      {/* Stepped Breadcrumb / Stage Navigation */}
      <View style={styles.stepIndicatorContainer}>
        <Pressable
          style={[styles.stepItem, currentStep === 'details' && styles.stepItemActive]}
          onPress={() => setCurrentStep('details')}
        >
          <View
            style={[
              styles.stepNumberCircle,
              currentStep === 'details' && styles.stepNumberCircleActive,
              (currentStep === 'addons' || currentStep === 'payment') && styles.stepNumberCircleDone,
            ]}
          >
            {currentStep === 'addons' || currentStep === 'payment' ? (
              <Check color="#FFFFFF" size={12} strokeWidth={3} />
            ) : (
              <Text style={[styles.stepNumberText, currentStep === 'details' && styles.stepNumberTextActive]}>1</Text>
            )}
          </View>
          <Text style={[styles.stepLabel, currentStep === 'details' && styles.stepLabelActive]}>
            Guest Details
          </Text>
        </Pressable>

        <View style={styles.stepDivider} />

        <Pressable
          style={[styles.stepItem, currentStep === 'addons' && styles.stepItemActive]}
          onPress={() => setCurrentStep('addons')}
        >
          <View
            style={[
              styles.stepNumberCircle,
              currentStep === 'addons' && styles.stepNumberCircleActive,
              currentStep === 'payment' && styles.stepNumberCircleDone,
            ]}
          >
            {currentStep === 'payment' ? (
              <Check color="#FFFFFF" size={12} strokeWidth={3} />
            ) : (
              <Text style={[styles.stepNumberText, currentStep === 'addons' && styles.stepNumberTextActive]}>2</Text>
            )}
          </View>
          <Text style={[styles.stepLabel, currentStep === 'addons' && styles.stepLabelActive]}>
            VIP Add-ons
          </Text>
        </Pressable>

        <View style={styles.stepDivider} />

        <Pressable
          style={[styles.stepItem, currentStep === 'payment' && styles.stepItemActive]}
          onPress={() => setCurrentStep('payment')}
        >
          <View
            style={[
              styles.stepNumberCircle,
              currentStep === 'payment' && styles.stepNumberCircleActive,
            ]}
          >
            <Text style={[styles.stepNumberText, currentStep === 'payment' && styles.stepNumberTextActive]}>3</Text>
          </View>
          <Text style={[styles.stepLabel, currentStep === 'payment' && styles.stepLabelActive]}>
            Payment
          </Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 160 + insets.bottom }]}
      >
        {/* 10-Minute Room Hold Status Banner */}
        {(bookingType === 'hotel' || holdIdParam) && (
          <View style={styles.holdBanner}>
            <View style={styles.holdBannerLeft}>
              <Clock color="#D4AF37" size={17} strokeWidth={2.2} />
              <View style={{ flex: 1 }}>
                <Text style={styles.holdBannerTitle}>
                  STATUS: PENDING HOLD • {formatHoldTime(holdSecondsRemaining)}
                </Text>
                <Text style={styles.holdBannerSub}>
                  Room inventory held exclusively for 10 minutes. Confirmed upon verified HTTP 200 token.
                </Text>
              </View>
            </View>
            <View style={styles.holdPillBadge}>
              <Text style={styles.holdPillBadgeText}>10-MIN HOLD</Text>
            </View>
          </View>
        )}

        {/* Item Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.badgeRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>
                {bookingType === 'apartment' ? 'SERVICED RESIDENCE' : bookingType.toUpperCase()}
              </Text>
            </View>
            <View style={styles.verifiedRow}>
              <ShieldCheck color="#D4AF37" size={14} strokeWidth={2} />
              <Text style={styles.verifiedText}>Official Stamped Voucher</Text>
            </View>
          </View>

          <Text style={styles.itemName}>
            {isStayType && hotelNameState.trim() ? hotelNameState.trim() : itemName}
          </Text>
          <Text style={styles.itemRate}>
            {bookingType === 'apartment' ? 'Residence Rate: ' : 'Confirmed Rate: '}
            <Text style={styles.itemRateBold}>${formatEnglishNumber(basePrice)}</Text>
            {isStayType ? ` • ${computedNights} Night${computedNights > 1 ? 's' : ''}` : ''}
          </Text>
        </View>

        {/* ========================================================================= */}
        {/* SCREEN / STAGE 1: GUEST DETAILS & INTERACTIVE SCHEDULE */}
        {/* ========================================================================= */}
        {currentStep === 'details' && (
          <StaggeredFadeInUp index={0} style={styles.stageWrapper}>
            <View style={styles.formSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Primary Guest Details</Text>
                <Text style={styles.sectionStepBadge}>Step 1 of 3</Text>
              </View>

              {/* Full Name */}
              <View style={styles.minimalInputGroup}>
                <Text style={styles.minimalInputLabel}>FULL NAME (AS IN PASSPORT)</Text>
                <View
                  style={[
                    styles.minimalInputWrapper,
                    focusedField === 'guestName' && styles.minimalInputWrapperFocused,
                  ]}
                >
                  <User
                    color={focusedField === 'guestName' ? '#D4AF37' : '#94A3B8'}
                    size={18}
                    strokeWidth={1.8}
                  />
                  <TextInput
                    style={styles.minimalTextInput}
                    placeholder="e.g. AHMED HASSAN AL-MANSOURI"
                    placeholderTextColor="#94A3B8"
                    value={guestName}
                    onChangeText={setGuestName}
                    onFocus={() => setFocusedField('guestName')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>

              {/* Passport / National ID */}
              <View style={styles.minimalInputGroup}>
                <Text style={styles.minimalInputLabel}>PASSPORT / ID NUMBER (FOR OFFICIAL PDF)</Text>
                <View
                  style={[
                    styles.minimalInputWrapper,
                    focusedField === 'passportNumber' && styles.minimalInputWrapperFocused,
                  ]}
                >
                  <IdCard
                    color={focusedField === 'passportNumber' ? '#D4AF37' : '#94A3B8'}
                    size={18}
                    strokeWidth={1.8}
                  />
                  <TextInput
                    style={styles.minimalTextInput}
                    placeholder="e.g. A28910472"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="characters"
                    value={passportNumber}
                    onChangeText={setPassportNumber}
                    onFocus={() => setFocusedField('passportNumber')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>

              {/* Email Address */}
              <View style={styles.minimalInputGroup}>
                <Text style={styles.minimalInputLabel}>EMAIL ADDRESS (FOR INSTANT CONFIRMATION)</Text>
                <View
                  style={[
                    styles.minimalInputWrapper,
                    focusedField === 'guestEmail' && styles.minimalInputWrapperFocused,
                  ]}
                >
                  <Mail
                    color={focusedField === 'guestEmail' ? '#D4AF37' : '#94A3B8'}
                    size={18}
                    strokeWidth={1.8}
                  />
                  <TextInput
                    style={styles.minimalTextInput}
                    placeholder="vip@vanirgroup.com"
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={guestEmail}
                    onChangeText={setGuestEmail}
                    onFocus={() => setFocusedField('guestEmail')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>

              {/* Phone / WhatsApp */}
              <View style={styles.minimalInputGroup}>
                <Text style={styles.minimalInputLabel}>PHONE / WHATSAPP NUMBER</Text>
                <View
                  style={[
                    styles.minimalInputWrapper,
                    focusedField === 'guestPhone' && styles.minimalInputWrapperFocused,
                  ]}
                >
                  <Phone
                    color={focusedField === 'guestPhone' ? '#D4AF37' : '#94A3B8'}
                    size={18}
                    strokeWidth={1.8}
                  />
                  <TextInput
                    style={styles.minimalTextInput}
                    placeholder="+971 50 123 4567"
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                    value={guestPhone}
                    onChangeText={setGuestPhone}
                    onFocus={() => setFocusedField('guestPhone')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>
            </View>

            {/* Hotel / Property Specific Editable Fields */}
            {isStayType && (
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Hotel & Suite Selection</Text>

                <View style={[styles.minimalInputGroup, { marginTop: 12 }]}>
                  <Text style={styles.minimalInputLabel}>HOTEL / PROPERTY NAME</Text>
                  <View
                    style={[
                      styles.minimalInputWrapper,
                      focusedField === 'hotelName' && styles.minimalInputWrapperFocused,
                    ]}
                  >
                    <Building2 color="#D4AF37" size={18} strokeWidth={1.8} />
                    <TextInput
                      style={styles.minimalTextInput}
                      value={hotelNameState}
                      onChangeText={setHotelNameState}
                      placeholder="e.g. The Ritz-Carlton / Four Seasons / Burj Al Arab"
                      placeholderTextColor="#94A3B8"
                      onFocus={() => setFocusedField('hotelName')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>

                <View style={styles.minimalInputGroup}>
                  <Text style={styles.minimalInputLabel}>ROOM / SUITE CATEGORY</Text>
                  <View
                    style={[
                      styles.minimalInputWrapper,
                      focusedField === 'roomType' && styles.minimalInputWrapperFocused,
                    ]}
                  >
                    <CheckCircle2 color="#D4AF37" size={17} strokeWidth={1.8} />
                    <TextInput
                      style={styles.minimalTextInput}
                      value={roomTypeState}
                      onChangeText={setRoomTypeState}
                      placeholder="Deluxe King Suite (Breakfast Included)"
                      placeholderTextColor="#94A3B8"
                      onFocus={() => setFocusedField('roomType')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Schedule & Travelers (Interactive Calendar Date Pickers) */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Schedule & Travelers</Text>
                <Text style={styles.sectionStepBadge}>
                  {computedNights} {computedNights === 1 ? 'Day/Night' : 'Days/Nights'}
                </Text>
              </View>

              <View style={styles.datesRow}>
                <Pressable
                  style={{ flex: 1 }}
                  onPress={() => {
                    setDateModalTarget('start');
                    setDateModalVisible(true);
                  }}
                >
                  <Text style={styles.minimalInputLabel}>
                    {isStayType ? 'CHECK-IN DATE' : 'START DATE'}
                  </Text>
                  <View style={[styles.minimalInputWrapper, { borderBottomColor: '#D4AF37' }]}>
                    <Calendar color="#D4AF37" size={18} strokeWidth={2} />
                    <Text style={[styles.minimalTextInput, { fontWeight: '700', paddingTop: 10 }]}>
                      {startDate}
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  style={{ flex: 1 }}
                  onPress={() => {
                    setDateModalTarget('end');
                    setDateModalVisible(true);
                  }}
                >
                  <Text style={styles.minimalInputLabel}>
                    {isStayType ? 'CHECK-OUT DATE' : 'END DATE'}
                  </Text>
                  <View style={[styles.minimalInputWrapper, { borderBottomColor: '#D4AF37' }]}>
                    <Calendar color="#D4AF37" size={18} strokeWidth={2} />
                    <Text style={[styles.minimalTextInput, { fontWeight: '700', paddingTop: 10 }]}>
                      {endDate}
                    </Text>
                  </View>
                </Pressable>
              </View>

              <View style={[styles.minimalInputGroup, { marginTop: 18 }]}>
                <Text style={styles.minimalInputLabel}>NUMBER OF GUESTS / TRAVELERS</Text>
                <View style={styles.counterRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Users color="#64748B" size={18} strokeWidth={1.8} />
                    <Text style={styles.counterValue}>
                      {guestsCount} Adult{guestsCount > 1 ? 's' : ''}
                    </Text>
                  </View>
                  <View style={styles.counterActions}>
                    <Pressable
                      style={styles.counterBtn}
                      onPress={() => setGuestsCount((prev: number) => Math.max(1, prev - 1))}
                    >
                      <Text style={styles.counterBtnText}>−</Text>
                    </Pressable>
                    <Pressable
                      style={styles.counterBtn}
                      onPress={() => setGuestsCount((prev: number) => prev + 1)}
                    >
                      <Text style={styles.counterBtnText}>+</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          </StaggeredFadeInUp>
        )}

        {/* ========================================================================= */}
        {/* SCREEN / STAGE 2: SIGNATURE ADD-ONS & CONCIERGE NOTES */}
        {/* ========================================================================= */}
        {currentStep === 'addons' && (
          <StaggeredFadeInUp index={0} style={styles.stageWrapper}>
            <View style={styles.formSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>VANIR Signature Add-ons</Text>
                <Text style={styles.sectionStepBadge}>Step 2 of 3</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Elevate your journey with private tarmac escorts and dedicated concierge staff.
              </Text>

              {/* Add-on 1: VIP Tarmac Meet & Escort */}
              <Pressable
                style={[styles.addonCard, addTarmac && styles.addonCardActive]}
                onPress={() => setAddTarmac(prev => !prev)}
              >
                <View style={styles.addonLeft}>
                  <View style={[styles.luxuryCheckbox, addTarmac && styles.luxuryCheckboxActive]}>
                    {addTarmac && <Check color="#FFFFFF" size={12} strokeWidth={3} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.addonTitle, addTarmac && styles.addonTitleActive]}>
                      VIP Tarmac Meet & Escort
                    </Text>
                    <Text style={styles.addonSub}>
                      Luxury BMW 7-Series tarmac transfer directly from the airplane stairs.
                    </Text>
                  </View>
                </View>
                <Text style={[styles.addonPrice, addTarmac && styles.addonPriceActive]}>+$250</Text>
              </Pressable>

              {/* Add-on 2: Dedicated 24/7 Royal Butler */}
              <Pressable
                style={[styles.addonCard, addButler && styles.addonCardActive]}
                onPress={() => setAddButler(prev => !prev)}
              >
                <View style={styles.addonLeft}>
                  <View style={[styles.luxuryCheckbox, addButler && styles.luxuryCheckboxActive]}>
                    {addButler && <Check color="#FFFFFF" size={12} strokeWidth={3} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.addonTitle, addButler && styles.addonTitleActive]}>
                      Dedicated 24/7 Royal Butler
                    </Text>
                    <Text style={styles.addonSub}>
                      Private luggage unpacking, Michelin table reservations & bespoke personal service.
                    </Text>
                  </View>
                </View>
                <Text style={[styles.addonPrice, addButler && styles.addonPriceActive]}>+$300</Text>
              </Pressable>
            </View>

            {/* Special Concierge Requests */}
            <View style={styles.formSection}>
              <Text style={styles.minimalInputLabel}>SPECIAL DIETARY, FLIGHT, OR CONCIERGE NOTES</Text>
              <View
                style={[
                  styles.minimalTextAreaWrapper,
                  focusedField === 'specialRequests' && styles.minimalInputWrapperFocused,
                ]}
              >
                <TextInput
                  style={styles.minimalTextArea}
                  multiline
                  numberOfLines={3}
                  placeholder="e.g. Vintage Champagne on arrival, late check-out requested, private villa orientation..."
                  placeholderTextColor="#94A3B8"
                  value={specialRequests}
                  onChangeText={setSpecialRequests}
                  onFocus={() => setFocusedField('specialRequests')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>
          </StaggeredFadeInUp>
        )}

        {/* ========================================================================= */}
        {/* SCREEN / STAGE 3: PAYMENT METHOD, PROMO & SAVED CARDS */}
        {/* ========================================================================= */}
        {currentStep === 'payment' && (
          <StaggeredFadeInUp index={0} style={styles.stageWrapper}>
            {/* Promo Code Card */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Promo / Privilege Code</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 }}>
                <TextInput
                  style={{
                    flex: 1,
                    height: 44,
                    backgroundColor: '#FAF9F6',
                    borderWidth: 1,
                    borderColor: 'rgba(212, 175, 55, 0.35)',
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    fontSize: 13,
                    fontWeight: '700',
                    color: '#1C1917',
                  }}
                  value={promoInput}
                  onChangeText={setPromoInput}
                  placeholder="VIP2026 / ROYAL10 / WELCOME50"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="characters"
                />
                <Pressable
                  onPress={handleApplyPromo}
                  style={{
                    height: 44,
                    paddingHorizontal: 18,
                    borderRadius: 12,
                    backgroundColor: '#D4AF37',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#1C1917' }}>Apply</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.formSection}>
              <View style={styles.paymentSectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Select Payment Method</Text>
                  <Text style={styles.paymentSectionSub}>Bank-Grade 256-Bit SSL • Luhn Verified</Text>
                </View>
                <View style={styles.pciBadge}>
                  <ShieldCheck color="#D4AF37" size={14} strokeWidth={2} />
                  <Text style={styles.pciBadgeText}>PCI-DSS Level 1</Text>
                </View>
              </View>

              {/* Official Payment Badges Grid */}
              <View style={styles.paymentBadgesGrid}>
                {/* 1. Unified VISA & Mastercard */}
                <Pressable
                  style={[
                    styles.paymentCard,
                    styles.paymentCardFullWidth,
                    paymentMethod === 'card' && styles.paymentCardActive,
                  ]}
                  onPress={() => setPaymentMethod('card')}
                >
                  {paymentMethod === 'card' && (
                    <View style={styles.paymentCardCheck}>
                      <Check color="#FFFFFF" size={10} strokeWidth={3} />
                    </View>
                  )}
                  <View style={styles.paymentCardLogoBox}>
                    <VisaMastercardLogo width={100} height={24} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 6 }}>
                    <Text
                      style={[
                        styles.paymentCardLabel,
                        paymentMethod === 'card' && styles.paymentCardLabelActive,
                      ]}
                    >
                      Credit / Debit Card (Visa, Mastercard, Amex, Mada)
                    </Text>
                    <Text style={styles.paymentCardSubText}>Instant 3D-Secure Authorization</Text>
                  </View>
                </Pressable>

                {/* 2. Apple Pay */}
                <Pressable
                  style={[
                    styles.paymentCard,
                    paymentMethod === 'apple_pay' && styles.paymentCardActive,
                  ]}
                  onPress={() => setPaymentMethod('apple_pay')}
                >
                  {paymentMethod === 'apple_pay' && (
                    <View style={styles.paymentCardCheck}>
                      <Check color="#FFFFFF" size={10} strokeWidth={3} />
                    </View>
                  )}
                  <View style={styles.paymentCardLogoBox}>
                    <ApplePayLogo width={68} height={24} />
                  </View>
                  <Text
                    style={[
                      styles.paymentCardLabel,
                      paymentMethod === 'apple_pay' && styles.paymentCardLabelActive,
                    ]}
                  >
                    Apple Pay
                  </Text>
                </Pressable>

                {/* 3. Google Pay */}
                <Pressable
                  style={[
                    styles.paymentCard,
                    paymentMethod === 'google_pay' && styles.paymentCardActive,
                  ]}
                  onPress={() => setPaymentMethod('google_pay')}
                >
                  {paymentMethod === 'google_pay' && (
                    <View style={styles.paymentCardCheck}>
                      <Check color="#FFFFFF" size={10} strokeWidth={3} />
                    </View>
                  )}
                  <View style={styles.paymentCardLogoBox}>
                    <GooglePayLogo width={68} height={24} />
                  </View>
                  <Text
                    style={[
                      styles.paymentCardLabel,
                      paymentMethod === 'google_pay' && styles.paymentCardLabelActive,
                    ]}
                  >
                    Google Pay
                  </Text>
                </Pressable>

                {/* 4. PayPal */}
                <Pressable
                  style={[
                    styles.paymentCard,
                    paymentMethod === 'paypal' && styles.paymentCardActive,
                  ]}
                  onPress={() => setPaymentMethod('paypal')}
                >
                  {paymentMethod === 'paypal' && (
                    <View style={styles.paymentCardCheck}>
                      <Check color="#FFFFFF" size={10} strokeWidth={3} />
                    </View>
                  )}
                  <View style={styles.paymentCardLogoBox}>
                    <PaypalLogo width={80} height={22} />
                  </View>
                  <Text
                    style={[
                      styles.paymentCardLabel,
                      paymentMethod === 'paypal' && styles.paymentCardLabelActive,
                    ]}
                  >
                    PayPal VIP
                  </Text>
                </Pressable>

                {/* 5. Corporate IBAN Wire */}
                <Pressable
                  style={[
                    styles.paymentCard,
                    styles.paymentCardFullWidth,
                    paymentMethod === 'bank_wire' && styles.paymentCardActive,
                  ]}
                  onPress={() => setPaymentMethod('bank_wire')}
                >
                  {paymentMethod === 'bank_wire' && (
                    <View style={styles.paymentCardCheck}>
                      <Check color="#FFFFFF" size={10} strokeWidth={3} />
                    </View>
                  )}
                  <View style={[styles.paymentCardLogoBox, { width: 42 }]}>
                    <Landmark color="#1C1917" size={20} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 6 }}>
                    <Text
                      style={[
                        styles.paymentCardLabel,
                        { textAlign: 'left' },
                        paymentMethod === 'bank_wire' && styles.paymentCardLabelActive,
                      ]}
                    >
                      VIP Corporate IBAN Wire Transfer
                    </Text>
                    <Text style={styles.paymentCardSubText}>
                      Instant official stamped invoice & guaranteed reservation hold
                    </Text>
                  </View>
                </Pressable>
              </View>

              {/* Detailed Form for Card-based payments + Saved Cards */}
              {paymentMethod === 'card' && (
                <View style={styles.cardPaymentBox}>
                  {savedCards.length > 0 && (
                    <View style={{ gap: 8 }}>
                      <Text style={styles.minimalInputLabel}>SAVED CARDS</Text>
                      {savedCards.map(sc => {
                        const isSel = selectedSavedCardId === sc.id;
                        return (
                          <Pressable
                            key={sc.id}
                            onPress={() => setSelectedSavedCardId(sc.id)}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: 12,
                              borderRadius: 12,
                              backgroundColor: isSel ? '#FFFDF7' : '#FAF9F6',
                              borderWidth: 1.2,
                              borderColor: isSel ? '#D4AF37' : 'rgba(28,25,23,0.12)',
                            }}
                          >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                              <CreditCard color={isSel ? '#D4AF37' : '#1C1917'} size={18} />
                              <View>
                                <Text style={{ fontSize: 13, fontWeight: '800', color: '#1C1917' }}>
                                  {sc.brand} •••• {sc.last4}
                                </Text>
                                <Text style={{ fontSize: 11, color: '#64748B' }}>
                                  {sc.holderName} • Exp {sc.expiry}
                                </Text>
                              </View>
                            </View>
                            {isSel && <Check color="#D4AF37" size={18} strokeWidth={2.6} />}
                          </Pressable>
                        );
                      })}

                      <Pressable
                        onPress={() => setSelectedSavedCardId('new')}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: 11,
                          borderRadius: 12,
                          backgroundColor: selectedSavedCardId === 'new' ? '#FFFDF7' : '#FAF9F6',
                          borderWidth: 1.2,
                          borderColor:
                            selectedSavedCardId === 'new' ? '#D4AF37' : 'rgba(28,25,23,0.12)',
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                          <Plus
                            color={selectedSavedCardId === 'new' ? '#D4AF37' : '#1C1917'}
                            size={18}
                          />
                          <Text style={{ fontSize: 13, fontWeight: '700', color: '#1C1917' }}>
                            Use a New Card
                          </Text>
                        </View>
                        {selectedSavedCardId === 'new' && (
                          <Check color="#D4AF37" size={18} strokeWidth={2.6} />
                        )}
                      </Pressable>
                    </View>
                  )}

                  {selectedSavedCardId === 'new' && (
                    <>
                      {/* Digital VIP Card Preview */}
                      <View style={styles.digitalCard}>
                        <View style={styles.digitalCardTop}>
                          <View style={styles.cardChip}>
                            <View style={styles.cardChipLine} />
                            <View style={styles.cardChipLine} />
                          </View>
                          <Text style={styles.cardBrandBadge}>
                            {cardNumber.length >= 2
                              ? `${detectedCardBrand.toUpperCase()} WORLD ELITE`
                              : 'VISA & MASTERCARD WORLD ELITE'}
                          </Text>
                        </View>

                        <Text style={styles.digitalCardNumber}>
                          {cardNumber || '•••• •••• •••• ••••'}
                        </Text>

                        <View style={styles.digitalCardBottom}>
                          <View>
                            <Text style={styles.digitalCardLabel}>CARDHOLDER NAME</Text>
                            <Text style={styles.digitalCardValue}>{cardHolder || 'FULL NAME'}</Text>
                          </View>
                          <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.digitalCardLabel}>EXPIRES</Text>
                            <Text style={styles.digitalCardValue}>{cardExpiry || 'MM/YY'}</Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.cardInputsWrapper}>
                        {/* Card Number */}
                        <View style={styles.minimalInputGroup}>
                          <Text style={styles.minimalInputLabel}>CARD NUMBER</Text>
                          <View
                            style={[
                              styles.minimalInputWrapper,
                              focusedField === 'cardNumber' && styles.minimalInputWrapperFocused,
                            ]}
                          >
                            <CreditCard
                              color={focusedField === 'cardNumber' ? '#D4AF37' : '#94A3B8'}
                              size={18}
                              strokeWidth={1.8}
                            />
                            <TextInput
                              style={styles.minimalTextInput}
                              value={cardNumber}
                              onChangeText={t => setCardNumber(formatCardNumberInput(t))}
                              placeholder="4532 •••• •••• 7741"
                              placeholderTextColor="#94A3B8"
                              keyboardType="number-pad"
                              maxLength={23}
                              onFocus={() => setFocusedField('cardNumber')}
                              onBlur={() => setFocusedField(null)}
                            />
                          </View>
                        </View>

                        {/* Cardholder Name */}
                        <View style={styles.minimalInputGroup}>
                          <Text style={styles.minimalInputLabel}>CARDHOLDER NAME</Text>
                          <View
                            style={[
                              styles.minimalInputWrapper,
                              focusedField === 'cardHolder' && styles.minimalInputWrapperFocused,
                            ]}
                          >
                            <User
                              color={focusedField === 'cardHolder' ? '#D4AF37' : '#94A3B8'}
                              size={18}
                              strokeWidth={1.8}
                            />
                            <TextInput
                              style={styles.minimalTextInput}
                              value={cardHolder}
                              onChangeText={setCardHolder}
                              placeholder="e.g. AHMED AL MANSOURI"
                              placeholderTextColor="#94A3B8"
                              autoCapitalize="characters"
                              onFocus={() => setFocusedField('cardHolder')}
                              onBlur={() => setFocusedField(null)}
                            />
                          </View>
                        </View>

                        {/* Expiry and CVV Row */}
                        <View style={styles.cardRowInputs}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.minimalInputLabel}>EXPIRY DATE (MM/YY)</Text>
                            <View
                              style={[
                                styles.minimalInputWrapper,
                                focusedField === 'cardExpiry' && styles.minimalInputWrapperFocused,
                              ]}
                            >
                              <Calendar
                                color={focusedField === 'cardExpiry' ? '#D4AF37' : '#94A3B8'}
                                size={16}
                                strokeWidth={1.8}
                              />
                              <TextInput
                                style={styles.minimalTextInput}
                                value={cardExpiry}
                                onChangeText={t => setCardExpiry(formatExpiryInput(t))}
                                placeholder="08/29"
                                placeholderTextColor="#94A3B8"
                                keyboardType="number-pad"
                                maxLength={5}
                                onFocus={() => setFocusedField('cardExpiry')}
                                onBlur={() => setFocusedField(null)}
                              />
                            </View>
                          </View>

                          <View style={{ flex: 1 }}>
                            <Text style={styles.minimalInputLabel}>SECURITY CODE (CVV)</Text>
                            <View
                              style={[
                                styles.minimalInputWrapper,
                                focusedField === 'cardCvv' && styles.minimalInputWrapperFocused,
                              ]}
                            >
                              <ShieldCheck
                                color={focusedField === 'cardCvv' ? '#D4AF37' : '#94A3B8'}
                                size={16}
                                strokeWidth={1.8}
                              />
                              <TextInput
                                style={styles.minimalTextInput}
                                value={cardCvv}
                                onChangeText={t => setCardCvv(t.replace(/\D/g, '').slice(0, 4))}
                                placeholder="•••"
                                placeholderTextColor="#94A3B8"
                                keyboardType="number-pad"
                                secureTextEntry
                                maxLength={4}
                                onFocus={() => setFocusedField('cardCvv')}
                                onBlur={() => setFocusedField(null)}
                              />
                            </View>
                          </View>
                        </View>

                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingTop: 6,
                          }}
                        >
                          <Text style={{ fontSize: 12, fontWeight: '600', color: '#1C1917' }}>
                            Save card securely for future reservations
                          </Text>
                          <Switch
                            value={saveCardForFuture}
                            onValueChange={setSaveCardForFuture}
                            trackColor={{ false: '#CBD5E1', true: '#D4AF37' }}
                            thumbColor="#FFFFFF"
                          />
                        </View>

                        <View style={styles.sslBadge}>
                          <Lock color="#D4AF37" size={14} strokeWidth={2} />
                          <Text style={styles.sslBadgeText}>
                            Tokenized Bank Handshake • No plain card details stored on servers.
                          </Text>
                        </View>
                      </View>
                    </>
                  )}
                </View>
              )}

              {paymentMethod === 'bank_wire' && (
                <View style={styles.walletBox}>
                  <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#1C1917' }}>
                    Vanir Luxury Travel Services GmbH — Corporate Escrow
                  </Text>
                  <Text style={styles.walletDesc}>
                    IBAN: DE89 3704 0044 0532 0130 00 • SWIFT/BIC: COBADEFFXXX{'\n'}
                    Immediate guaranteed reservation hold & official voucher dispatch.
                  </Text>
                </View>
              )}

              {/* Wallet Direct Action Alternative */}
              {(paymentMethod === 'google_pay' ||
                paymentMethod === 'paypal' ||
                paymentMethod === 'apple_pay') && (
                <Pressable
                  style={styles.walletBox}
                  onPress={() => {
                    if (paymentMethod === 'google_pay') setShowGPayModal(true);
                    if (paymentMethod === 'paypal') setShowPayPalModal(true);
                    if (paymentMethod === 'apple_pay') setShowApplePayModal(true);
                  }}
                >
                  <View style={styles.walletHeader}>
                    {paymentMethod === 'apple_pay' && <ApplePayLogo width={74} height={24} />}
                    {paymentMethod === 'google_pay' && <GooglePayLogo width={74} height={24} />}
                    {paymentMethod === 'paypal' && <PaypalLogo width={84} height={24} />}
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedBadgeText}>Biometric Ready ✓</Text>
                    </View>
                  </View>
                  <Text style={styles.walletDesc}>
                    {paymentMethod === 'google_pay'
                      ? 'Pay with Google Pay virtual token & biometric fingerprint authentication.'
                      : paymentMethod === 'paypal'
                      ? 'Pay securely with PayPal Buyer Protection and zero conversion fees.'
                      : 'Fast, secure biometric authorization with Apple Pay Touch ID / Face ID.'}
                  </Text>
                  <View style={styles.walletActionRow}>
                    <Text style={styles.walletActionText}>
                      Tap to authorize with{' '}
                      {paymentMethod === 'google_pay'
                        ? 'Google Pay'
                        : paymentMethod === 'paypal'
                        ? 'PayPal'
                        : 'Apple Pay'}
                    </Text>
                    <ChevronRight color="#D4AF37" size={16} />
                  </View>
                </Pressable>
              )}
            </View>
          </StaggeredFadeInUp>
        )}

        {/* Price Breakdown Card */}
        <View style={styles.priceBreakdownCard}>
          <Text style={styles.breakdownTitle}>Price Breakdown (USD)</Text>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>
              {bookingType === 'apartment' ? 'Serviced Residence Accommodation' : 'Base Reservation'}
            </Text>
            <Text style={styles.breakdownValue}>${formatEnglishNumber(basePrice)}</Text>
          </View>
          {addonTotal > 0 && (
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Selected VIP Add-ons</Text>
              <Text style={styles.breakdownValue}>+${formatEnglishNumber(addonTotal)}</Text>
            </View>
          )}
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Estimated Taxes & Concierge Fee (5%)</Text>
            <Text style={styles.breakdownValue}>+${formatEnglishNumber(taxes)}</Text>
          </View>
          {promoDiscount > 0 && (
            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, { color: '#16A34A', fontWeight: '700' }]}>
                Promo Discount ({appliedPromoCode})
              </Text>
              <Text style={[styles.breakdownValue, { color: '#16A34A', fontWeight: '700' }]}>
                -${promoDiscount.toFixed(2)}
              </Text>
            </View>
          )}
          <View style={styles.breakdownDivider} />
          <View style={styles.breakdownRow}>
            <Text style={styles.totalLabel}>Total Due</Text>
            <Text style={styles.totalValue}>${formatEnglishNumber(total)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* ========================================================================= */}
      {/* STICKY BOTTOM TOTAL & DYNAMIC ACTION BUTTON BAR */}
      {/* ========================================================================= */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom + 14, 28) }]}>
        <View style={styles.bottomBarLeft}>
          <Text style={styles.barTotalLabel}>TOTAL AMOUNT</Text>
          <Text style={styles.barTotalValue}>${formatEnglishNumber(total)}</Text>
        </View>

        <LuxuryPressable
          style={[styles.primaryActionBtn, isSubmitting && styles.primaryActionBtnDisabled]}
          onPress={handlePrimaryAction}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <View style={styles.btnLoadingRow}>
              <ActivityIndicator color="#1C1917" size="small" />
              <Text style={styles.primaryActionBtnText}>Authorizing…</Text>
            </View>
          ) : (
            <View style={styles.btnRow}>
              <Text style={styles.primaryActionBtnText}>
                {currentStep === 'payment'
                  ? paymentMethod === 'google_pay'
                    ? `Pay $${formatEnglishNumber(total)} with Google Pay`
                    : paymentMethod === 'paypal'
                    ? `Pay $${formatEnglishNumber(total)} with PayPal`
                    : paymentMethod === 'apple_pay'
                    ? `Pay $${formatEnglishNumber(total)} with Apple Pay`
                    : paymentMethod === 'bank_wire'
                    ? `Issue IBAN Invoice ($${formatEnglishNumber(total)})`
                    : activeSavedCard
                    ? `Pay $${formatEnglishNumber(total)} (${activeSavedCard.brand} ••${activeSavedCard.last4})`
                    : `Pay $${formatEnglishNumber(total)} Securely`
                  : 'Proceed to Payment'}
              </Text>
              {currentStep === 'payment' ? (
                <Lock color="#1C1917" size={16} strokeWidth={2.2} />
              ) : (
                <ArrowRight color="#1C1917" size={17} strokeWidth={2.4} />
              )}
            </View>
          )}
        </LuxuryPressable>
      </View>

      {/* ========================================================================= */}
      {/* LUXURY RESERVATION / ESIM ACTIVATION CONFIRMED MODAL */}
      {/* ========================================================================= */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 20 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.successModalCard}>
              <View style={styles.successIconCircle}>
                <CheckCircle2 color="#D4AF37" size={44} strokeWidth={2} />
              </View>

              {bookingType === 'esim' ? (
                <>
                  <Text style={styles.successModalTitle}>eSIM Activated Successfully</Text>
                  <Text style={styles.successModalSub}>
                    High-speed international roaming profile provisioned. Ready for immediate installation.
                  </Text>

                  <View style={styles.esimQrContainer}>
                    <View style={styles.esimQrFrame}>
                      <RealQRCode
                        value={`LPA:1$smdp.vanir-telecom.com$${confirmationCode}`}
                        size={145}
                        color="#1C1917"
                        backgroundColor="#FFFFFF"
                      />
                    </View>
                    <Text style={styles.esimQrScanHint}>Scan QR Code with cellular settings</Text>
                  </View>

                  <View style={styles.esimCodeBox}>
                    <View style={styles.esimCodeRow}>
                      <Text style={styles.esimCodeLabel}>SM-DP+ ADDRESS</Text>
                      <Text style={styles.esimCodeVal}>smdp.vanir-telecom.com</Text>
                    </View>
                    <View style={[styles.esimCodeRow, { marginTop: 6 }]}>
                      <Text style={styles.esimCodeLabel}>ACTIVATION CODE (LPA)</Text>
                      <Text style={styles.esimLpaText} numberOfLines={1}>
                        {`LPA:1$smdp.vanir-telecom.com$${confirmationCode}`}
                      </Text>
                    </View>
                  </View>

                  <LuxuryPressable
                    style={styles.copyLpaBtn}
                    onPress={() => {
                      setCopiedLpa(true);
                      setTimeout(() => setCopiedLpa(false), 3000);
                      Alert.alert(
                        'Activation Code Copied',
                        `LPA:1$smdp.vanir-telecom.com$${confirmationCode}\n\nGo to Settings > Cellular > Add eSIM to install profile.`,
                      );
                    }}
                  >
                    {copiedLpa ? (
                      <>
                        <Check color="#1C1917" size={15} strokeWidth={2.4} />
                        <Text style={styles.copyLpaText}>Copied to Clipboard!</Text>
                      </>
                    ) : (
                      <>
                        <Copy color="#1C1917" size={15} strokeWidth={2.2} />
                        <Text style={styles.copyLpaText}>Copy Activation Code</Text>
                      </>
                    )}
                  </LuxuryPressable>

                  <LuxuryPressable
                    style={styles.pdfDownloadSuccessBtn}
                    onPress={() => setShowVisaPdf(true)}
                  >
                    <FileDown color="#1C1917" size={17} strokeWidth={2.2} />
                    <Text style={styles.pdfDownloadSuccessBtnText}>
                      Download Official Invoice & Voucher (PDF)
                    </Text>
                  </LuxuryPressable>
                </>
              ) : (
                <>
                  <Text style={styles.successModalTitle}>Reservation Confirmed</Text>
                  <Text style={styles.successModalSub}>
                    Payment verified & official stamped voucher issued by VANIR Concierge.
                  </Text>

                  <View style={styles.codeBox}>
                    <Text style={styles.codeLabel}>CONFIRMATION REFERENCE</Text>
                    <Text style={styles.codeValue}>{confirmationCode}</Text>
                    {verifiedTxId ? (
                      <Text style={styles.txIdText}>TX ID: {verifiedTxId}</Text>
                    ) : null}
                  </View>

                  <Text style={styles.successNote}>
                    Official stamped PDF document & receipt dispatched to:
                    {'\n'}
                    <Text style={{ fontWeight: '700', color: '#D4AF37' }}>{guestEmail}</Text>
                  </Text>

                  {/* Download / Print Official Document PDF Button */}
                  <LuxuryPressable
                    style={styles.pdfDownloadSuccessBtn}
                    onPress={() => setShowVisaPdf(true)}
                  >
                    <FileDown color="#1C1917" size={17} strokeWidth={2.2} />
                    <Text style={styles.pdfDownloadSuccessBtnText}>
                      Download Stamped Official Voucher (PDF)
                    </Text>
                  </LuxuryPressable>
                </>
              )}

              <LuxuryPressable
                style={styles.doneBtn}
                onPress={() => {
                  setShowSuccessModal(false);
                  navigation.navigate('MainTabs');
                }}
              >
                <Text style={styles.doneBtnText}>
                  {bookingType === 'esim' ? 'Done & Return' : 'Return to Experiences'}
                </Text>
              </LuxuryPressable>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Interactive Calendar Date Picker Modal */}
      <VipDatePickerModal
        visible={dateModalVisible}
        initialDate={dateModalTarget === 'start' ? startDate : endDate}
        title={dateModalTarget === 'start' ? 'Select Start / Check-In Date' : 'Select End / Check-Out Date'}
        onClose={() => setDateModalVisible(false)}
        onSelectDate={dStr => {
          if (dateModalTarget === 'start') {
            setStartDate(dStr);
          } else {
            setEndDate(dStr);
          }
        }}
      />

      {/* Luxury Secure Payment Processing Overlay */}
      <SecurePaymentOverlay
        visible={isSubmitting}
        amount={`$${formatEnglishNumber(total)}`}
      />

      {/* Interactive Wallet Modals */}
      <GooglePayModal
        visible={showGPayModal}
        onClose={() => setShowGPayModal(false)}
        onConfirm={async () => {
          setShowGPayModal(false);
          await processConfirmedPayment('google_pay');
        }}
        amount={total}
        userEmail={guestEmail || auth().currentUser?.email || 'vip@vanirgroup.com'}
        userName={guestName || auth().currentUser?.displayName || 'VIP Guest'}
        itemName={itemName}
      />

      <PayPalModal
        visible={showPayPalModal}
        onClose={() => setShowPayPalModal(false)}
        onConfirm={async () => {
          setShowPayPalModal(false);
          await processConfirmedPayment('paypal');
        }}
        amount={total}
        userEmail={guestEmail || auth().currentUser?.email || 'vip@vanirgroup.com'}
        userName={guestName || auth().currentUser?.displayName || 'VIP Guest'}
        itemName={itemName}
      />

      <ApplePayModal
        visible={showApplePayModal}
        onClose={() => setShowApplePayModal(false)}
        onConfirm={async () => {
          setShowApplePayModal(false);
          await processConfirmedPayment('apple_pay');
        }}
        amount={total}
        itemName={itemName}
      />

      {/* Official PDF Document & Stamped Certificate Modal */}
      <VisaDocumentPdfModal
        visible={showVisaPdf}
        onClose={() => setShowVisaPdf(false)}
        docType={computedVisaDocType}
        data={{
          ...resolvedPdfMetadata,
          referenceNumber: confirmationCode || `VNR-${Date.now().toString(36).toUpperCase()}`,
          email: guestEmail,
          phone: guestPhone,
          paymentMethod: verifiedPayLabel || undefined,
          transactionId: verifiedTxId || undefined,
          totalAmountPaid: total,
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
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.3,
  },
  headerSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  headerRightBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Stepped Breadcrumbs
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    opacity: 0.6,
  },
  stepItemActive: {
    opacity: 1,
  },
  stepNumberCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberCircleActive: {
    backgroundColor: '#FAF9F6',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
  },
  stepNumberCircleDone: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  stepNumberText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  stepNumberTextActive: {
    color: '#1C1917',
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  stepLabelActive: {
    color: '#1C1917',
    fontWeight: '800',
  },
  stepDivider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.25)',
    marginHorizontal: 8,
  },

  scrollContent: {
    paddingTop: 12,
  },
  stageWrapper: {
    width: '100%',
  },

  // 10-Minute Hold Status Banner
  holdBanner: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#D4AF37',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  holdBannerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  holdBannerTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.4,
  },
  holdBannerSub: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
  },
  holdPillBadge: {
    backgroundColor: '#1C1917',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  holdPillBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#D4AF37',
    letterSpacing: 0.6,
  },

  // Summary Card
  summaryCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    color: '#1C1917',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 11,
    color: '#D4AF37',
    fontWeight: '600',
  },
  itemName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1C1917',
    lineHeight: 22,
  },
  itemRate: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  itemRateBold: {
    fontWeight: '800',
    color: '#1C1917',
  },

  formSection: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.3,
  },
  sectionStepBadge: {
    fontSize: 11,
    color: '#D4AF37',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 14,
  },

  // Minimalist Inputs with bottom border
  minimalInputGroup: {
    marginBottom: 14,
  },
  minimalInputLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  minimalInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'transparent',
    borderBottomWidth: 1.2,
    borderBottomColor: 'rgba(28, 25, 23, 0.15)',
    height: 44,
    paddingHorizontal: 2,
  },
  minimalInputWrapperFocused: {
    borderBottomColor: '#D4AF37',
  },
  minimalTextInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1917',
    paddingVertical: 4,
  },
  datesRow: {
    flexDirection: 'row',
    gap: 16,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1.2,
    borderBottomColor: 'rgba(28, 25, 23, 0.15)',
    height: 48,
    paddingHorizontal: 2,
  },
  counterValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1917',
  },
  counterActions: {
    flexDirection: 'row',
    gap: 8,
  },
  counterBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1917',
  },

  // Add-ons
  addonCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  addonCardActive: {
    borderColor: '#D4AF37',
    borderWidth: 1.2,
    backgroundColor: '#FAF9F6',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  addonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  luxuryCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  luxuryCheckboxActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  addonTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1C1917',
  },
  addonTitleActive: {
    color: '#1C1917',
  },
  addonSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  addonPrice: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#64748B',
    marginLeft: 8,
  },
  addonPriceActive: {
    color: '#1C1917',
  },
  minimalTextAreaWrapper: {
    borderBottomWidth: 1.2,
    borderBottomColor: 'rgba(28, 25, 23, 0.15)',
    paddingHorizontal: 2,
    paddingVertical: 4,
  },
  minimalTextArea: {
    fontSize: 13,
    color: '#1C1917',
    textAlignVertical: 'top',
    height: 64,
  },

  // Payment Badges Grid
  paymentSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  paymentSectionSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  pciBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF9F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  pciBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1C1917',
  },
  paymentBadgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  paymentCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 74,
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  paymentCardFullWidth: {
    width: '100%',
    minHeight: 68,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 14,
    marginBottom: 2,
  },
  paymentCardActive: {
    borderColor: '#D4AF37',
    borderWidth: 1.5,
    backgroundColor: '#FAF9F6',
  },
  paymentCardCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentCardLogoBox: {
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  paymentCardLabelActive: {
    color: '#1C1917',
    fontWeight: '800',
  },
  paymentCardSubText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },

  // Card details
  cardPaymentBox: {
    marginTop: 14,
    gap: 14,
  },
  digitalCard: {
    backgroundColor: '#1C1917',
    borderRadius: 18,
    padding: 18,
    height: 175,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1.2,
    borderColor: '#D4AF37',
  },
  digitalCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardChip: {
    width: 34,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#D4AF37',
    padding: 3,
    justifyContent: 'space-around',
  },
  cardChipLine: {
    height: 2,
    backgroundColor: '#997B24',
    borderRadius: 1,
  },
  cardBrandBadge: {
    color: '#D4AF37',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  digitalCardNumber: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 2.5,
    fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }),
    marginVertical: 6,
  },
  digitalCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  digitalCardLabel: {
    color: '#94A3B8',
    fontSize: 8.5,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
  },
  digitalCardValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  cardInputsWrapper: {
    gap: 10,
  },
  cardRowInputs: {
    flexDirection: 'row',
    gap: 16,
  },
  sslBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FAF9F6',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    marginTop: 4,
  },
  sslBadgeText: {
    fontSize: 11,
    color: '#1C1917',
    fontWeight: '600',
    flex: 1,
  },

  walletBox: {
    marginTop: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    gap: 8,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  verifiedBadge: {
    backgroundColor: '#FAF9F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  verifiedBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#1C1917',
  },
  walletDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  walletActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  walletActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D4AF37',
  },

  // Price Breakdown
  priceBreakdownCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1917',
    marginBottom: 2,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 12.5,
    color: '#64748B',
  },
  breakdownValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1C1917',
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: 'rgba(28, 25, 23, 0.08)',
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1917',
  },
  totalValue: {
    fontSize: 19,
    fontWeight: '900',
    color: '#1C1917',
  },

  // Safe Sticky Bottom Bar with Perfect Flex Alignment
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FAF9F6',
    borderTopWidth: 1.2,
    borderTopColor: 'rgba(212, 175, 55, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
  },
  bottomBarLeft: {
    minWidth: 95,
    justifyContent: 'center',
  },
  barTotalLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  barTotalValue: {
    fontSize: 21,
    fontWeight: '900',
    color: '#1C1917',
    marginTop: 1,
  },
  primaryActionBtn: {
    flex: 1,
    backgroundColor: '#D4AF37',
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryActionBtnDisabled: {
    opacity: 0.7,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryActionBtnText: {
    color: '#1C1917',
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  // Redesigned Off-White / Royal Navy / Gold Reservation Confirmed Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(28, 25, 23, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1.2,
    borderColor: '#D4AF37',
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FAF9F6',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successModalTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#1C1917',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  successModalSub: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 19,
    paddingHorizontal: 8,
  },
  codeBox: {
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 22,
    alignItems: 'center',
    marginVertical: 16,
    width: '100%',
  },
  codeLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  codeValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1C1917',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  txIdText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
    fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }),
  },
  successNote: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  pdfDownloadSuccessBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF9F6',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    borderRadius: 18,
    height: 50,
    marginBottom: 10,
    gap: 8,
  },
  pdfDownloadSuccessBtnText: {
    color: '#1C1917',
    fontSize: 14,
    fontWeight: '800',
  },
  doneBtn: {
    width: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 18,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  doneBtnText: {
    color: '#1C1917',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  /* eSIM Activation Styles */
  esimQrContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  esimQrFrame: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#D4AF37',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  esimQrScanHint: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 6,
    fontWeight: '600',
  },
  esimCodeBox: {
    width: '100%',
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
  },
  esimCodeRow: {
    flexDirection: 'column',
    gap: 2,
  },
  esimCodeLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 0.8,
  },
  esimCodeVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1917',
  },
  esimLpaText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1C1917',
    fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }),
  },
  copyLpaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
    backgroundColor: '#D4AF37',
    paddingVertical: 11,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  copyLpaText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1C1917',
  },
  esimGuideBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    gap: 4,
  },
  esimGuideTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  esimGuideStep: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 16,
  },
});
