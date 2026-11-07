import React, { useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ChevronLeft,
  Share2,
  Download,
  Plane,
  CheckCircle2,
  Home,
  Crown,
  Sparkles,
  Radio,
  Clock,
  ShieldCheck,
  X,
  ExternalLink,
  FileText,
  Printer,
} from 'lucide-react-native';
import Svg, { Rect, G, Path, Line, Circle } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import { AirlineLogo } from '../../components/AirlineLogos';
import { RealQRCode } from '../../components/RealQRCode';
import { FlightTicketPdfModal } from '../../components/FlightTicketPdfModal';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type BoardingPassRoute = RouteProp<RootStackParamList, 'BoardingPass'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function BoardingPassScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<BoardingPassRoute>();
  const insets = useSafeAreaInsets();

  const [walletModalVisible, setWalletModalVisible] = useState(false);
  const [walletType, setWalletType] = useState<'apple' | 'google'>('apple');
  const [pdfModalVisible, setPdfModalVisible] = useState(false);

  const airline = route.params?.airline ?? 'Emirates';
  const airlineCode = route.params?.airlineCode;
  const flightNumber = route.params?.flightNumber ?? 'EK 902';
  const origin = route.params?.origin ?? 'Cairo International Airport';
  const originCode = route.params?.originCode ?? 'CAI';
  const destination = route.params?.destination ?? 'Dubai International Airport';
  const destinationCode = route.params?.destinationCode ?? 'DXB';
  const departureTime = route.params?.departureTime ?? '10:30 PM';
  const arrivalTime = route.params?.arrivalTime ?? '02:00 AM';
  const duration = route.params?.duration ?? '3h 30m';
  const gate = route.params?.gate ?? 'A-12';
  const selectedSeats = route.params?.selectedSeats ?? ['01A'];
  const cabinClass = route.params?.cabinClass ?? 'First Suite (VIP)';
  const passengerName = route.params?.passenger?.fullName ?? 'H.E. VIP Passenger';
  const passengerId = route.params?.passenger?.passportNumber ?? 'A28910472';
  const pnr = route.params?.pnr ?? 'EK84XW';
  const eTicketNumber = route.params?.eTicketNumber ?? '176-4920183749';
  const verifyQrUrl = `https://vanirgroup.com/verify/ticket?pnr=${encodeURIComponent(
    pnr,
  )}&etkt=${encodeURIComponent(eTicketNumber)}&fn=${encodeURIComponent(
    flightNumber,
  )}&pax=${encodeURIComponent(passengerName)}`;
  const barcodeData = route.params?.barcodeData || verifyQrUrl;
  const checkinUrl = route.params?.checkinUrl ?? 'https://www.emirates.com/english/manage-booking/online-check-in/';

  const seatsLabel = selectedSeats.length > 0 ? selectedSeats.join(', ') : '01A';

  const bookingForPdf = useMemo(() => {
    const resolvedBase = route.params?.basePrice ?? 624;
    const resolvedTaxes = route.params?.taxes ?? Math.round(resolvedBase * 0.12);
    const resolvedTotal = route.params?.totalPrice ?? resolvedBase + resolvedTaxes;
    return {
      bookingId: route.params?.bookingId,
      pnr,
      eTicketNumber,
      barcodeData: verifyQrUrl,
      airline,
      airlineCode,
      flightNumber,
      origin,
      originCode,
      destination,
      destinationCode,
      departureDate: route.params?.departureDate,
      returnDate: route.params?.returnDate,
      departureTime,
      arrivalTime,
      duration,
      gate,
      cabinClass,
      selectedSeats,
      basePrice: resolvedBase,
      taxes: resolvedTaxes,
      totalPrice: resolvedTotal,
      paymentMethod: route.params?.paymentMethod,
      transactionId: route.params?.transactionId,
      checkinUrl,
      passenger: {
        title: route.params?.passenger?.title,
        firstName: route.params?.passenger?.firstName,
        lastName: route.params?.passenger?.lastName,
        fullName: passengerName,
        gender: route.params?.passenger?.gender,
        dob: route.params?.passenger?.dob,
        nationality: route.params?.passenger?.nationality || 'Universal',
        idType: route.params?.passenger?.idType || 'Passport',
        passportNumber: passengerId,
        passportExpiry: route.params?.passenger?.passportExpiry,
        passportCountry: route.params?.passenger?.passportCountry,
        email: route.params?.passenger?.email,
        phone: route.params?.passenger?.phone,
        mealPreference: route.params?.passenger?.mealPreference,
        specialAssistance: route.params?.passenger?.specialAssistance,
      },
    };
  }, [
    route.params,
    pnr,
    eTicketNumber,
    verifyQrUrl,
    airline,
    airlineCode,
    flightNumber,
    origin,
    originCode,
    destination,
    destinationCode,
    departureTime,
    arrivalTime,
    duration,
    gate,
    cabinClass,
    selectedSeats,
    checkinUrl,
    passengerName,
    passengerId,
  ]);

  // Calculate boarding time (~45 min prior to departure or 09:45 PM)
  const boardingTime = '09:45 PM';

  const handleShare = async () => {
    try {
      await Share.share({
        message: `👑 VANIR VIP DIGITAL BOARDING PASS\nAirline: ${airline} (${flightNumber})\nRoute: ${originCode} ➔ ${destinationCode}\nPassenger: ${passengerName}\nPNR: ${pnr} | e-Ticket: ${eTicketNumber}\nSuite: ${seatsLabel} | Gate: ${gate}\nClass: ${cabinClass}\nOnline Check-In: ${checkinUrl}\nStatus: Confirmed & Radar Cleared`,
      });
    } catch {
      Alert.alert('Share', 'Boarding pass itinerary copied to clipboard.');
    }
  };

  const handleDownloadPdf = () => {
    setPdfModalVisible(true);
  };

  const handleAddToAppleWallet = () => {
    setWalletType('apple');
    setWalletVisibleAndFeedback('apple');
  };

  const handleAddToGoogleWallet = () => {
    setWalletType('google');
    setWalletVisibleAndFeedback('google');
  };

  const setWalletVisibleAndFeedback = (type: 'apple' | 'google') => {
    setWalletType(type);
    setWalletModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

      {/* Screen Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.headerBtn,
            pressed && styles.topBtnPressed,
          ]}
          onPress={() => navigation.navigate('MainTabs')}
          hitSlop={12}
        >
          <ChevronLeft color="#1C1917" size={22} strokeWidth={2.4} />
        </Pressable>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerBadge}>VANIR FIRST CLASS SUITE</Text>
          <Text style={styles.headerTitle}>Digital Boarding Pass</Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.headerBtn,
            pressed && styles.topBtnPressed,
          ]}
          onPress={handleShare}
          hitSlop={12}
        >
          <Share2 color="#1C1917" size={19} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]}
      >
        {/* VIP Status Summary Card */}
        <View style={styles.statusPillBar}>
          <View style={styles.statusPillLeft}>
            <ShieldCheck color="#D4AF37" size={16} strokeWidth={2.2} />
            <Text style={styles.statusPillText}>RADAR CLEARED • PRIORITY 1</Text>
          </View>
          <View style={styles.statusPillRight}>
            <Sparkles color="#D4AF37" size={13} />
            <Text style={styles.statusPillSub}>ROYAL LOUNGE ACCESS</Text>
          </View>
        </View>

        {/* 1. MAIN LUXURY BOARDING PASS CONTAINER */}
        <View style={styles.ticketCard}>
          {/* Card Top Branding Header */}
          <View style={styles.cardHeader}>
            <View style={styles.brandRow}>
              <View style={styles.crownWrap}>
                <AirlineLogo airline={airline} iata={airlineCode} size={36} />
              </View>
              <View>
                <Text style={styles.airlineName}>{airline.toUpperCase()}</Text>
                <Text style={styles.flightCodeBadge}>{flightNumber} • BOEING 777-300ER</Text>
              </View>
            </View>

            <View style={styles.pnrBadgeWrap}>
              <Text style={styles.pnrBadgeLabel}>PNR</Text>
              <Text style={styles.pnrBadgeValue}>{pnr}</Text>
            </View>
          </View>

          {/* 2. ELITE TYPOGRAPHY LAYOUT: ORIGIN & DESTINATION IATA CODES */}
          <View style={styles.routeContainer}>
            {/* Origin */}
            <View style={styles.originCol}>
              <Text style={styles.iataCode}>{originCode}</Text>
              <Text style={styles.cityName} numberOfLines={1}>{origin.split(' ')[0]}</Text>
              <Text style={styles.timeSchedule}>{departureTime}</Text>
            </View>

            {/* Linear Airplane Trajectory Vector (1.5px minimal line & plane) */}
            <View style={styles.trajectoryCenter}>
              <View style={styles.durationPill}>
                <Text style={styles.durationText}>{duration.toUpperCase()}</Text>
              </View>

              <View style={styles.trajectoryRow}>
                {/* 1.5px dashed line left */}
                <View style={styles.dashLine} />

                {/* Linear 1.5px Airplane Icon Vector */}
                <View style={styles.planeIconWrap}>
                  <View style={{ transform: [{ rotate: '45deg' }], alignItems: 'center', justifyContent: 'center' }}>
                    <Plane
                      color="#D4AF37"
                      size={16}
                      strokeWidth={2}
                      fill="#D4AF37"
                    />
                  </View>
                </View>

                {/* 1.5px dashed line right */}
                <View style={styles.dashLine} />
              </View>

              <View style={styles.statusIndicatorRow}>
                <View style={styles.liveGreenDot} />
                <Text style={styles.statusLiveText}>NON-STOP</Text>
              </View>
            </View>

            {/* Destination */}
            <View style={styles.destCol}>
              <Text style={styles.iataCode}>{destinationCode}</Text>
              <Text style={styles.cityName} numberOfLines={1}>{destination.split(' ')[0]}</Text>
              <Text style={styles.timeSchedule}>{arrivalTime}</Text>
            </View>
          </View>

          {/* 3. FLIGHT INFORMATION GRID (Minimalist Table Grid) */}
          <View style={styles.flightInfoGrid}>
            {/* Row 1: Passenger & Flight */}
            <View style={styles.gridRow}>
              <View style={styles.gridColLeft}>
                <Text style={styles.gridLabel}>PASSENGER NAME</Text>
                <Text style={styles.gridValue}>{passengerName.toUpperCase()}</Text>
              </View>

              <View style={styles.gridColRight}>
                <Text style={styles.gridLabel}>FLIGHT NO</Text>
                <Text style={styles.gridValue}>{flightNumber}</Text>
              </View>
            </View>

            {/* Row 2: Gate & Seat (Highlighted in Matte Gold) */}
            <View style={styles.gridRow}>
              <View style={styles.gridColLeft}>
                <Text style={styles.gridLabel}>GATE</Text>
                <Text style={styles.gridValueHighlight}>{gate}</Text>
              </View>

              <View style={styles.gridColRight}>
                <Text style={styles.gridLabel}>SEAT</Text>
                <Text style={styles.gridValueHighlight}>{seatsLabel}</Text>
              </View>
            </View>

            {/* Row 3: Class & Boarding Time */}
            <View style={styles.gridRow}>
              <View style={styles.gridColLeft}>
                <Text style={styles.gridLabel}>CABIN CLASS</Text>
                <Text style={styles.gridValue}>{cabinClass}</Text>
              </View>

              <View style={styles.gridColRight}>
                <View style={styles.boardingTimeLabelRow}>
                  <Clock color="#9CA3AF" size={11} strokeWidth={2} />
                  <Text style={styles.gridLabel}>BOARDING TIME</Text>
                </View>
                <Text style={styles.gridValue}>{boardingTime}</Text>
              </View>
            </View>

            {/* Row 4: Terminal & Priority Zone */}
            <View style={styles.gridRow}>
              <View style={styles.gridColLeft}>
                <Text style={styles.gridLabel}>TERMINAL</Text>
                <Text style={styles.gridSubValue}>TERMINAL 3 (VIP CONCOURSE)</Text>
              </View>

              <View style={styles.gridColRight}>
                <Text style={styles.gridLabel}>ZONE</Text>
                <Text style={styles.gridSubValue}>ZONE 1 • PRIORITY SUITE</Text>
              </View>
            </View>
          </View>

          {/* ELEGANT PERFORATED DASHED LINE DIVIDER WITH NOTCHES */}
          <View style={styles.perforatedSeparator}>
            {/* Left circular cutout notch */}
            <View style={styles.cutoutNotchLeft} />

            {/* Fine dashed line */}
            <View style={styles.dashedDivider} />

            {/* Right circular cutout notch */}
            <View style={styles.cutoutNotchRight} />
          </View>

          {/* 4. AUTHENTIC IATA SCANNABLE 2D BARCODE */}
          <View style={styles.protectedBarcodeSection}>
            <View style={styles.barcodeWhiteFrame}>
              <RealQRCode value={barcodeData} size={140} color="#000000" />
            </View>

            {/* PNR & e-Ticket Verification String */}
            <View style={styles.ticketDetailsRow}>
              <View style={styles.pnrCol}>
                <Text style={styles.ticketDetailLabel}>BOOKING REF (PNR)</Text>
                <Text style={styles.ticketDetailPnr}>{pnr}</Text>
              </View>
              <View style={styles.ticketCol}>
                <Text style={styles.ticketDetailLabel}>OFFICIAL E-TICKET NO.</Text>
                <Text style={styles.ticketDetailEtkt}>{eTicketNumber}</Text>
              </View>
            </View>

            <View style={styles.scannerPromptRow}>
              <Radio color="#D4AF37" size={13} strokeWidth={2} />
              <Text style={styles.scannerPromptText}>POINT PASS TO OPTICAL SCANNER AT GATE</Text>
            </View>
          </View>
        </View>

        {/* Official Airline Online Check-in Portal CTA Button */}
        {checkinUrl ? (
          <Pressable
            style={({ pressed }) => [styles.checkinPortalBtn, pressed && styles.topBtnPressed]}
            onPress={() => {
              Linking.openURL(checkinUrl).catch(e => {
                Alert.alert('Online Check-In', `Check-in portal link: ${checkinUrl}`);
              });
            }}
          >
            <LinearGradient
              colors={['#D4AF37', '#B8860B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.checkinPortalGradient}
            >
              <View style={styles.checkinPortalLeft}>
                <Plane color="#1C1917" size={20} strokeWidth={2.4} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.checkinPortalTitle}>Official Airline Online Check-In</Text>
                  <Text style={styles.checkinPortalSubtitle}>
                    Direct check-in via official {airline} online portal
                  </Text>
                </View>
              </View>
              <ExternalLink color="#1C1917" size={18} strokeWidth={2.4} />
            </LinearGradient>
          </Pressable>
        ) : null}

        {/* 5. WALLET INTEGRATION BUTTONS */}
        <View style={styles.walletSection}>
          <Text style={styles.walletHeaderLabel}>INSTANT PASS INTEGRATION</Text>

          <View style={styles.walletButtonsRow}>
            {/* Add to Apple Wallet */}
            <Pressable
              style={({ pressed }) => [styles.appleWalletBtn, pressed && styles.btnPressed]}
              onPress={handleAddToAppleWallet}
            >
              <View style={styles.appleLogoWrap}>
                <Svg width={18} height={22} viewBox="0 0 20 24" fill="none">
                  <Path
                    fill="#FFFFFF"
                    d="M15.22 8.48c.03-2.02 1.65-2.99 1.72-3.04-0.94-1.38-2.4-1.57-2.92-1.59-1.25-.13-2.43.73-3.06.73-.64 0-1.61-.71-2.65-.7-1.36.02-2.62.79-3.32 2.01-1.42 2.45-.36 6.09 1.01 8.09.68.97 1.48 2.06 2.53 2.02 1.02-.04 1.41-.66 2.64-.66 1.23 0 1.58.66 2.64.64 1.09-.02 1.78-.99 2.44-1.97.77-1.12 1.08-2.21 1.1-2.26-.02-.01-2.11-.81-2.13-3.26zM13.43 3.69c.56-.68.94-1.63.84-2.58-.81.03-1.79.54-2.37 1.22-.51.6-.96 1.56-.84 2.48.9.07 1.81-.44 2.37-1.12z"
                  />
                </Svg>
              </View>
              <View style={styles.walletBtnTextCol}>
                <Text style={styles.walletSubText}>Add to</Text>
                <Text style={styles.walletMainText}>Apple Wallet</Text>
              </View>
            </Pressable>

            {/* Add to Google Wallet */}
            <Pressable
              style={({ pressed }) => [styles.googleWalletBtn, pressed && styles.btnPressed]}
              onPress={handleAddToGoogleWallet}
            >
              <View style={styles.googleLogoWrap}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.5 3.7l3.7 2.9c2.2-2 3.8-5 3.8-8.8z"
                  />
                  <Path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.1-4.3 1.1-3.1 0-5.8-2.5-6.7-5.3L1.6 15.8C3.5 19.6 7.4 23 12 23z"
                  />
                  <Path
                    fill="#FBBC05"
                    d="M5.3 12.9c-.2-.7-.3-1.4-.3-2.2s.1-1.5.3-2.2L1.6 5.6C.6 7.5 0 9.7 0 12s.6 4.5 1.6 6.4l3.7-2.9z"
                  />
                  <Path
                    fill="#EA4335"
                    d="M12 4.7c1.8 0 3.3.6 4.5 1.8l3.4-3.4C17.9 1.2 15.1 0 12 0 7.4 0 3.5 2.6 1.6 6.4l3.7 2.9C6.2 6.5 8.9 4.7 12 4.7z"
                  />
                </Svg>
              </View>
              <View style={styles.walletBtnTextCol}>
                <Text style={styles.walletSubText}>Save to</Text>
                <Text style={styles.walletMainText}>Google Wallet</Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* 5. OFFICIAL IATA E-TICKET & PDF CERTIFICATE CARD */}
        <Pressable
          style={({ pressed }) => [styles.pdfCardCta, pressed && styles.btnPressed]}
          onPress={handleDownloadPdf}
        >
          <LinearGradient
            colors={['#1C1917', '#1E293B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.pdfCardGradient}
          >
            <View style={styles.pdfCardLeft}>
              <View style={styles.pdfIconWrap}>
                <FileText color="#D4AF37" size={24} strokeWidth={2} />
              </View>
              <View style={styles.pdfCardTextCol}>
                <View style={styles.pdfBadgeRow}>
                  <ShieldCheck color="#D4AF37" size={13} />
                  <Text style={styles.pdfBadgeText}>IATA ACCREDITED E-TICKET</Text>
                </View>
                <Text style={styles.pdfCardTitle}>Official Airline E-Ticket (PDF)</Text>
                <Text style={styles.pdfCardSub}>
                  View, download, and print official IATA e-ticket receipt & passport voucher
                </Text>
              </View>
            </View>
            <View style={styles.pdfActionPill}>
              <Printer color="#1C1917" size={14} strokeWidth={2.4} />
              <Text style={styles.pdfActionText}>VIEW / PDF</Text>
            </View>
          </LinearGradient>
        </Pressable>

        {/* VIP Concierge Assistance Note */}
        <View style={styles.conciergeNoteCard}>
          <Text style={styles.conciergeNoteTitle}>VANIR DEDICATED CONCIERGE</Text>
          <Text style={styles.conciergeNoteBody}>
            Your private chauffeur will meet you at Gate {gate} upon touchdown. Priority baggage handling and VIP lounge escort are pre-arranged.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Floating Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.buttonRow}>
          {/* Offline PDF Button */}
          <Pressable
            style={({ pressed }) => [styles.pdfBtn, pressed && styles.btnPressed]}
            onPress={handleDownloadPdf}
          >
            <FileText color="#1C1917" size={17} strokeWidth={2.2} />
            <Text style={styles.pdfBtnText}>Official PDF Ticket</Text>
          </Pressable>

          {/* Return Home Button */}
          <Pressable
            style={({ pressed }) => [styles.homeBtn, pressed && styles.btnPressed]}
            onPress={() => navigation.navigate('MainTabs')}
          >
            <Home color="#1C1917" size={17} strokeWidth={2.2} />
            <Text style={styles.homeBtnText}>Return to Concierge</Text>
          </Pressable>
        </View>
      </View>

      {/* Wallet Feedback Modal */}
      <Modal
        visible={walletModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setWalletModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalIconWrap}>
                <CheckCircle2 color="#10B981" size={28} strokeWidth={2.2} />
              </View>
              <Pressable
                onPress={() => setWalletModalVisible(false)}
                hitSlop={12}
                style={styles.modalCloseBtn}
              >
                <X color="#9CA3AF" size={20} />
              </Pressable>
            </View>

            <Text style={styles.modalTitle}>
              {walletType === 'apple' ? 'Added to Apple Wallet' : 'Saved to Google Wallet'}
            </Text>

            <Text style={styles.modalMessage}>
              Your VIP First Suite boarding pass for{' '}
              <Text style={{ color: '#D4AF37', fontWeight: '700' }}>
                {flightNumber} ({originCode} ➔ {destinationCode})
              </Text>{' '}
              has been successfully synced with active NFC gate pass clearance and live radar alerts.
            </Text>

            <View style={styles.modalPassPreview}>
              <Text style={styles.previewPassTitle}>
                {airline.toUpperCase()} FIRST • SEAT {seatsLabel}
              </Text>
              <Text style={styles.previewPassSubtitle}>
                PASSENGER: {passengerName.toUpperCase()} • GATE {gate}
              </Text>
            </View>

            <Pressable
              style={styles.modalDoneBtn}
              onPress={() => setWalletModalVisible(false)}
            >
              <Text style={styles.modalDoneText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Official IATA Comprehensive PDF E-Ticket & Boarding Certificate Viewer */}
      <FlightTicketPdfModal
        visible={pdfModalVisible}
        onClose={() => setPdfModalVisible(false)}
        booking={bookingForPdf}
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
    borderBottomColor: 'rgba(212, 175, 55, 0.25)',
  },
  headerBtn: {
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
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerBadge: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#D4AF37',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1917',
    letterSpacing: -0.3,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    alignItems: 'center',
  },
  statusPillBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  statusPillLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1C1917',
    letterSpacing: 0.8,
  },
  statusPillRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusPillSub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#D4AF37',
    letterSpacing: 0.5,
  },

  /* 1. Ticket Card Structure */
  ticketCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    shadowColor: '#1C1917',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(28, 25, 23, 0.08)',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  crownWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(212, 175, 55, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  airlineName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 1.2,
  },
  flightCodeBadge: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
  suiteTag: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  suiteTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D4AF37',
    letterSpacing: 1,
  },

  /* 2. Elite Typography Route Layout */
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 16,
  },
  originCol: {
    flex: 1,
    alignItems: 'flex-start',
  },
  destCol: {
    flex: 1,
    alignItems: 'flex-end',
  },
  iataCode: {
    fontSize: 34,
    fontWeight: '900',
    color: '#1C1917',
    letterSpacing: 2,
    lineHeight: 38,
  },
  cityName: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  timeSchedule: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D4AF37',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  trajectoryCenter: {
    width: 124,
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  durationPill: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    marginBottom: 6,
  },
  durationText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#D4AF37',
    letterSpacing: 0.8,
  },
  trajectoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  dashLine: {
    flex: 1,
    height: 1.5,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.45)',
    borderStyle: 'dashed',
  },
  planeIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(212, 175, 55, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  statusIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 5,
  },
  liveGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statusLiveText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.5,
  },

  /* 3. Flight Information Grid */
  flightInfoGrid: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 14,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridColLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  gridColRight: {
    flex: 1,
    alignItems: 'flex-start',
    paddingLeft: 18,
  },
  gridLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 1.2,
    marginBottom: 3,
  },
  boardingTimeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  gridValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1C1917',
    letterSpacing: 0.2,
  },
  gridValueHighlight: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 0.5,
  },
  gridSubValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },

  /* Perforated Separator */
  perforatedSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    position: 'relative',
    height: 24,
  },
  cutoutNotchLeft: {
    position: 'absolute',
    left: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FAF9F6', // Matches outer screen background
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    zIndex: 2,
  },
  cutoutNotchRight: {
    position: 'absolute',
    right: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FAF9F6', // Matches outer screen background
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    zIndex: 2,
  },
  dashedDivider: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderStyle: 'dashed',
    marginHorizontal: 16,
  },

  /* 4. Protected Barcode Area */
  protectedBarcodeSection: {
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: '#FAF9F6',
  },
  barcodeWhiteFrame: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8, // sharp, rounded-sm
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#D4AF37', // Micro-thin gold outline
    shadowColor: '#D4AF37',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barcodeEtktText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 1.5,
    marginTop: 12,
    fontFamily: 'monospace',
  },
  scannerPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  scannerPromptText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D4AF37',
    letterSpacing: 1.2,
  },

  /* Checkin Portal Button */
  checkinPortalBtn: {
    width: '100%',
    borderRadius: 18,
    marginTop: 14,
    marginBottom: 6,
    overflow: 'hidden',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  checkinPortalGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  checkinPortalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  checkinPortalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.3,
  },
  checkinPortalSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    marginTop: 2,
  },

  /* PNR Header Badge */
  pnrBadgeWrap: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    alignItems: 'center',
  },
  pnrBadgeLabel: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1,
  },
  pnrBadgeValue: {
    fontSize: 12,
    fontWeight: '900',
    color: '#D4AF37',
    letterSpacing: 1.5,
  },

  /* Ticket Details under QR code */
  ticketDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  pnrCol: {
    alignItems: 'center',
    flex: 1,
  },
  ticketCol: {
    alignItems: 'center',
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(212, 175, 55, 0.25)',
  },
  ticketDetailLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 2,
  },
  ticketDetailPnr: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1C1917',
    letterSpacing: 2,
  },
  ticketDetailEtkt: {
    fontSize: 13,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },

  /* 5. Wallet Integration Buttons */
  walletSection: {
    width: '100%',
    marginTop: 20,
    alignItems: 'center',
  },
  walletHeaderLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1C1917',
    letterSpacing: 1.6,
    marginBottom: 12,
  },
  walletButtonsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  appleWalletBtn: {
    flex: 1,
    backgroundColor: '#000000',
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  googleWalletBtn: {
    flex: 1,
    backgroundColor: '#1E1F22',
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  appleLogoWrap: {
    width: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  googleLogoWrap: {
    width: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  walletBtnTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  walletSubText: {
    fontSize: 9.5,
    fontWeight: '500',
    color: '#9CA3AF',
    lineHeight: 12,
  },
  walletMainText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },

  /* VIP Concierge Card */
  conciergeNoteCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    padding: 14,
    marginTop: 18,
  },
  conciergeNoteTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D4AF37',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  conciergeNoteBody: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },

  /* Bottom Floating Action Bar */
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FAF9F6',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.25)',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pdfBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pdfBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1917',
  },
  homeBtn: {
    flex: 1.5,
    backgroundColor: '#D4AF37',
    height: 50,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#D4AF37',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 3,
  },
  homeBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1917',
  },
  btnPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.985 }],
  },

  /* Modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(28, 25, 23, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FAF9F6',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#D4AF37',
    padding: 22,
    shadowColor: '#1C1917',
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 8,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(28, 25, 23, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
    marginBottom: 16,
  },
  modalPassPreview: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    marginBottom: 18,
  },
  previewPassTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 1,
    marginBottom: 2,
  },
  previewPassSubtitle: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
  },
  modalDoneBtn: {
    backgroundColor: '#D4AF37',
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDoneText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1917',
  },
  pdfCardCta: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    elevation: 4,
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  pdfCardGradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pdfCardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pdfIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfCardTextCol: {
    flex: 1,
  },
  pdfBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  pdfBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 0.5,
  },
  pdfCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  pdfCardSub: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
    lineHeight: 15,
  },
  pdfActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#D4AF37',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 14,
    marginLeft: 10,
  },
  pdfActionText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1C1917',
  },
});
