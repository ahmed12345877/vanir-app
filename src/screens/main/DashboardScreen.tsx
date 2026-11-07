import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  Anchor,
  Bell,
  Building2,
  Car,
  ChevronRight,
  Clock,
  CreditCard,
  FileText,
  Globe,
  MapPin,
  Plane,
  Settings,
  Shield,
  Star,
  TrendingUp,
  Wifi,
} from 'lucide-react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { PharaohAvatar } from '../../components/PharaohAvatar';
import {
  VisaDocumentPdfModal,
  type VisaDocType,
} from '../../components/VisaDocumentPdfModal';
import {
  FlightTicketPdfModal,
  type FlightTicketPdfModalProps,
} from '../../components/FlightTicketPdfModal';
import { getLocalBookingsHistory } from '../../services/paymentGateway';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type DashboardItineraryItem = {
  id: string;
  confirmationCode: string;
  destination: string;
  type: string;
  date: string;
  amountLabel?: string;
  status: string;
  statusColor: string;
  icon: typeof Plane;
  iconColor: string;
  docType: VisaDocType;
  isIataFlight?: boolean;
  flightTicketPayload?: FlightTicketPdfModalProps['booking'];
  visaDocPayload?: React.ComponentProps<typeof VisaDocumentPdfModal>['data'];
};

function inferVisaDocType(rawType?: string, metaDocType?: string): VisaDocType {
  if (metaDocType) return metaDocType as VisaDocType;
  const t = (rawType || '').toLowerCase();
  if (t.includes('hotel')) return 'hotel';
  if (t.includes('apart') || t.includes('resid')) return 'apartment';
  if (t.includes('jet') || t.includes('aviation')) return 'jet';
  if (t.includes('yacht') || t.includes('maritime')) return 'yacht';
  if (t.includes('limo')) return 'limousine';
  if (t.includes('car') || t.includes('chauffeur') || t.includes('fleet')) return 'car';
  if (t.includes('airport') || t.includes('vip meet') || t.includes('tarmac')) return 'airport';
  if (t.includes('esim') || t.includes('roaming')) return 'esim';
  if (t.includes('insur')) return 'insurance';
  if (t.includes('noc')) return 'noc';
  if (t.includes('tour') || t.includes('day')) return 'tour';
  if (t.includes('flight')) return 'flight';
  return 'package';
}

function resolveDocIcon(docType: VisaDocType): { icon: typeof Plane; color: string } {
  switch (docType) {
    case 'flight':
    case 'jet':
    case 'airport':
      return { icon: Plane, color: '#38BDF8' };
    case 'hotel':
    case 'apartment':
      return { icon: Building2, color: '#D4AF37' };
    case 'yacht':
      return { icon: Anchor, color: '#0EA5E9' };
    case 'car':
    case 'limousine':
      return { icon: Car, color: '#D4AF37' };
    case 'esim':
      return { icon: Wifi, color: '#10B981' };
    default:
      return { icon: Globe, color: '#D4AF37' };
  }
}

const SAMPLE_TRIPS: DashboardItineraryItem[] = [
  {
    id: 'sample-jet-1',
    confirmationCode: 'VNR-750892',
    destination: 'Dubai, United Arab Emirates',
    type: 'Private Jet Charter (Bombardier Global 7500)',
    date: 'Upcoming Charter • VIP FBO Terminal',
    amountLabel: '$45,000',
    status: 'Confirmed',
    statusColor: '#10B981',
    icon: Plane,
    iconColor: '#38BDF8',
    docType: 'jet',
    visaDocPayload: {
      referenceNumber: 'VNR-750892',
      clientName: 'VIP Elite Member',
      vehicleOrVesselName: 'Bombardier Global 7500 (Tail VP-VNR)',
      pickupLocation: 'Cairo International VIP FBO (CAI)',
      dropoffLocation: 'Dubai Al Maktoum Executive Terminal (DWC)',
      checkInDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      checkOutDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      guestsCount: 6,
      aircraftRange: '7,700 NM',
      aircraftSpeed: 'Mach 0.925',
      totalAmountPaid: 45000,
      paymentMethod: 'VISA INFINITE •••• 4242',
      transactionId: 'TXN-VNR-JET7500',
    },
  },
  {
    id: 'sample-hotel-2',
    confirmationCode: 'VNR-419305',
    destination: 'Four Seasons Resort Dubai at Jumeirah Beach',
    type: 'Royal Presidential Suite • 4 Nights',
    date: 'Confirmed Luxury Stay',
    amountLabel: '$6,800',
    status: 'Confirmed',
    statusColor: '#D4AF37',
    icon: Building2,
    iconColor: '#D4AF37',
    docType: 'hotel',
    visaDocPayload: {
      referenceNumber: 'VNR-419305',
      clientName: 'VIP Elite Member',
      hotelName: 'Four Seasons Resort Dubai at Jumeirah Beach',
      destinationCity: 'Dubai, UAE',
      roomType: 'Royal Presidential Suite with Breakfast',
      checkInDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
      checkOutDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      nights: 4,
      guestsCount: 2,
      totalAmountPaid: 6800,
      paymentMethod: 'MASTERCARD WORLD ELITE •••• 8891',
      transactionId: 'TXN-VNR-FS4193',
    },
  },
];

function mapStoredRecordToDashboardItem(rec: any): DashboardItineraryItem {
  const meta = rec.metadata || {};
  const conf = rec.confirmationCode || rec.bookingId || rec.id || 'VNR-901244';
  const docType = inferVisaDocType(rec.bookingType, meta.visaDocType);
  const { icon, color } = resolveDocIcon(docType);
  const startDate = rec.startDate || rec.pickupDate || '';
  const endDate = rec.endDate || '';
  const dateDisplay =
    startDate && endDate && startDate !== endDate
      ? `${startDate} → ${endDate}`
      : startDate || 'Flexible VIP Schedule';
  const numAmount = Number(rec.amount ?? rec.totalAmount ?? 0);

  if (rec.bookingType === 'Flight Ticket' || meta.flightNumber) {
    const originRaw = String(meta.flightOrigin || 'Cairo (CAI)');
    const destRaw = String(meta.flightDestination || 'Dubai (DXB)');
    const originCodeMatch = originRaw.match(/\(([A-Z]{3})\)/);
    const destCodeMatch = destRaw.match(/\(([A-Z]{3})\)/);
    return {
      id: conf,
      confirmationCode: conf,
      destination: rec.itemName || `${originRaw} → ${destRaw}`,
      type: `IATA e-Ticket • Ref: ${conf}`,
      date: dateDisplay,
      amountLabel: numAmount > 0 ? `$${numAmount.toLocaleString('en-US')}` : undefined,
      status: 'Issued',
      statusColor: '#10B981',
      icon: Plane,
      iconColor: '#38BDF8',
      docType: 'flight',
      isIataFlight: true,
      flightTicketPayload: {
        bookingId: conf,
        pnr: conf.replace(/[^A-Z0-9]/gi, '').slice(-6).toUpperCase(),
        eTicketNumber: `176-${Math.abs(conf.split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 2481093847))}`,
        airline: meta.flightAirline || 'Emirates',
        airlineCode: meta.airlineCode || 'EK',
        flightNumber: meta.flightNumber || 'EK 924',
        origin: originRaw,
        originCode: originCodeMatch ? originCodeMatch[1] : 'CAI',
        destination: destRaw,
        destinationCode: destCodeMatch ? destCodeMatch[1] : 'DXB',
        departureDate: meta.flightDepartureDate || startDate,
        returnDate: meta.flightReturnDate || undefined,
        departureTime: '10:30 PM',
        arrivalTime: '02:15 AM',
        duration: '3h 45m',
        cabinClass: meta.cabinClass || 'First Class Suite',
        selectedSeats: Array.isArray(meta.selectedSeats) ? meta.selectedSeats : ['01A'],
        basePrice: meta.basePrice || Math.round(numAmount * 0.86),
        taxes: meta.taxes || Math.round(numAmount * 0.14),
        totalPrice: numAmount,
        paymentMethod: rec.paymentSummaryLabel || 'VERIFIED CARD',
        transactionId: rec.transactionId || `TXN-${conf}`,
        passenger: {
          fullName: rec.guestName || 'VIP Passenger',
          passportNumber: rec.passportNumber || 'A28910472',
          email: rec.guestEmail || '',
          phone: rec.guestPhone || '',
          nationality: rec.nationality || 'International',
        },
      },
    };
  }

  return {
    id: conf,
    confirmationCode: conf,
    destination: rec.itemName || meta.hotelName || meta.vehicleOrVesselName || 'Luxury VIP Reservation',
    type: `${rec.bookingType || 'VIP Concierge'} • Ref: ${conf}`,
    date: dateDisplay,
    amountLabel: numAmount > 0 ? `$${numAmount.toLocaleString('en-US')}` : undefined,
    status: rec.paymentStatus === 'invoice_issued' ? 'Reserved' : 'Confirmed',
    statusColor: '#10B981',
    icon,
    iconColor: color,
    docType,
    visaDocPayload: {
      referenceNumber: conf,
      clientName: rec.guestName || 'VIP Elite Member',
      email: rec.guestEmail || '',
      phone: rec.guestPhone || '',
      passportNumber: rec.passportNumber || undefined,
      destinationCity: meta.destinationCity || meta.dropoffLocation || '',
      destinationCountry: meta.destinationCountry || '',
      hotelName: meta.hotelName || (docType === 'hotel' || docType === 'apartment' ? rec.itemName : undefined),
      roomType: meta.roomType || 'VIP Executive Suite',
      checkInDate: startDate,
      checkOutDate: endDate || startDate,
      nights: meta.nights || 1,
      guestsCount: rec.guestsCount || 2,
      insuranceProvider: meta.insuranceProvider,
      insuranceCoverageAmount: meta.insuranceCoverageAmount,
      insuranceStartDate: startDate,
      insuranceEndDate: endDate || startDate,
      vehicleOrVesselName: meta.vehicleOrVesselName || rec.carName || rec.itemName,
      pickupLocation: meta.pickupLocation || rec.pickupLocation,
      dropoffLocation: meta.dropoffLocation || rec.dropoffLocation,
      durationLabel: meta.durationLabel || rec.duration,
      packageName: meta.packageName || rec.packageName || rec.itemName,
      esimDataPlan: meta.esimDataPlan,
      aircraftRange: meta.aircraftRange,
      aircraftSpeed: meta.aircraftSpeed,
      totalAmountPaid: numAmount,
      paymentMethod: rec.paymentSummaryLabel || 'VIP Verified Payment',
      transactionId: rec.transactionId || `TXN-${conf}`,
      specialRequests: rec.specialRequests || '',
    },
  };
}

export function DashboardScreen() {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<Nav>();
  const [itineraries, setItineraries] = useState<DashboardItineraryItem[]>(SAMPLE_TRIPS);
  const [realBookingsCount, setRealBookingsCount] = useState(0);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const [selectedDocItem, setSelectedDocItem] = useState<DashboardItineraryItem | null>(null);
  const [selectedFlightTicket, setSelectedFlightTicket] = useState<
    FlightTicketPdfModalProps['booking'] | null
  >(null);

  const displayName = user
    ? (user as { name?: string; email?: string }).name ?? 'VIP Member'
    : 'VIP Member';
  const displayEmail = user ? (user as { email?: string }).email ?? '' : 'vip.guest@vanir.luxury';

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        setLoadingBookings(true);
        const byCode = new Map<string, DashboardItineraryItem>();

        try {
          const localList = await getLocalBookingsHistory();
          for (const rec of localList) {
            const mapped = mapStoredRecordToDashboardItem(rec);
            byCode.set(mapped.confirmationCode, mapped);
          }
        } catch {
          // Ignore local read error
        }

        const fbUser = auth().currentUser;
        if (fbUser?.uid) {
          try {
            const snap = await firestore()
              .collection('bookings')
              .where('userId', '==', fbUser.uid)
              .limit(20)
              .get();
            snap.docs.forEach(d => {
              const data = d.data();
              const mapped = mapStoredRecordToDashboardItem({ id: d.id, ...data });
              if (!byCode.has(mapped.confirmationCode)) {
                byCode.set(mapped.confirmationCode, mapped);
              }
            });
          } catch {
            // Ignore Firestore read error if offline
          }

          try {
            const fSnap = await firestore()
              .collection('flight_bookings')
              .where('userUid', '==', fbUser.uid)
              .limit(15)
              .get();
            fSnap.docs.forEach(d => {
              const fb = d.data() as any;
              const code = fb.pnr || fb.bookingId || d.id;
              if (!byCode.has(code) && fb.flight) {
                byCode.set(code, {
                  id: d.id,
                  confirmationCode: code,
                  destination: `${fb.flight.airlineName || 'Flight'} (${fb.flight.flightNumber || ''}) • ${fb.flight.originCode} → ${fb.flight.destinationCode}`,
                  type: `IATA e-Ticket • PNR: ${fb.pnr || code}`,
                  date: fb.issuedAt ? String(fb.issuedAt).split('T')[0] : 'Confirmed Flight',
                  amountLabel: fb.totalPaid ? `$${Number(fb.totalPaid).toLocaleString('en-US')}` : undefined,
                  status: 'Issued',
                  statusColor: '#10B981',
                  icon: Plane,
                  iconColor: '#38BDF8',
                  docType: 'flight',
                  isIataFlight: true,
                  flightTicketPayload: {
                    bookingId: fb.bookingId || d.id,
                    pnr: fb.pnr || code,
                    eTicketNumber: fb.eTicketNumber || '176-2394810293',
                    barcodeData: fb.barcodeData,
                    airline: fb.flight.airlineName || 'Emirates',
                    airlineCode: fb.flight.airlineCode || 'EK',
                    flightNumber: fb.flight.flightNumber || 'EK 924',
                    aircraft: fb.flight.aircraft,
                    origin: fb.flight.originName || 'Cairo',
                    originCode: fb.flight.originCode || 'CAI',
                    destination: fb.flight.destinationName || 'Dubai',
                    destinationCode: fb.flight.destinationCode || 'DXB',
                    departureTime: fb.flight.departureTime || '10:30 PM',
                    arrivalTime: fb.flight.arrivalTime || '02:00 AM',
                    duration: fb.flight.duration || '3h 30m',
                    gate: fb.flight.gate || 'A-12',
                    cabinClass: fb.flight.cabinClass || 'First Class Suite',
                    selectedSeats: fb.selectedSeats || ['01A'],
                    basePrice: fb.flight.basePrice,
                    taxes: fb.flight.taxes,
                    totalPrice: fb.totalPaid,
                    passenger: {
                      fullName: fb.passenger?.fullName || displayName,
                      passportNumber: fb.passenger?.passportNumber || 'A28910472',
                      nationality: fb.passenger?.nationality || 'International',
                      email: fb.passenger?.email || displayEmail,
                      phone: fb.passenger?.phone || '',
                    },
                  },
                });
              }
            });
          } catch {
            // Ignore offline flight_bookings error
          }
        }

        if (active) {
          const merged = Array.from(byCode.values());
          setRealBookingsCount(merged.length);
          setItineraries(merged.length > 0 ? merged : SAMPLE_TRIPS);
          setLoadingBookings(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [displayEmail, displayName]),
  );

  const stats = [
    { label: 'Countries\nVisited', value: '18', icon: Globe, color: '#38BDF8' },
    {
      label: 'Confirmed\nBookings',
      value: String(34 + realBookingsCount),
      icon: Plane,
      color: '#D4AF37',
    },
    {
      label: 'Air Miles\nAccumulated',
      value: '142K',
      icon: TrendingUp,
      color: '#A855F7',
    },
    { label: 'VIP Rating\nAverage', value: '4.9', icon: Star, color: '#F59E0B' },
  ] as const;

  const handleOpenItineraryPdf = (trip: DashboardItineraryItem) => {
    if (trip.isIataFlight && trip.flightTicketPayload) {
      setSelectedFlightTicket(trip.flightTicketPayload);
      return;
    }
    setSelectedDocItem(trip);
  };

  const SETTINGS_LINKS = [
    {
      label: 'Travel Preferences',
      icon: Settings,
      onPress: () => navigation.navigate('TravelPreferences'),
    },
    {
      label: 'Payment Methods',
      icon: CreditCard,
      onPress: () => navigation.navigate('PaymentMethods'),
    },
    {
      label: 'Notifications',
      icon: Bell,
      onPress: () => navigation.navigate('DashboardNotifications'),
    },
    {
      label: 'Privacy & Security',
      icon: Shield,
      onPress: () => navigation.navigate('PrivacySecurity'),
    },
  ] as const;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

      <View style={styles.topBar}>
        <Text style={styles.headerTitle}>VIP DASHBOARD</Text>
        <View style={styles.topBarActions}>
          <Pressable
            style={({ pressed }) => [
              styles.iconBtn,
              pressed && styles.topBtnPressed,
            ]}
            onPress={() => navigation.navigate('DashboardNotifications')}
          >
            <Bell color="#1C1917" size={20} strokeWidth={1.8} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <LinearGradient
          colors={['#FFFFFF', '#FAF9F6']}
          style={styles.profileCard}
        >
          <PharaohAvatar size={64} borderWidth={2} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            {displayEmail ? (
              <Text style={styles.profileEmail}>{displayEmail}</Text>
            ) : null}
            <View style={styles.memberBadge}>
              <Text style={styles.memberBadgeText}>VIP ELITE MEMBER</Text>
            </View>
          </View>
          <Pressable
            style={styles.editProfileBtn}
            onPress={() => navigation.navigate('UserProfile')}
          >
            <Text style={styles.editProfileText}>Edit</Text>
          </Pressable>
        </LinearGradient>

        <View style={styles.statsGrid}>
          {stats.map(stat => {
            const Icon = stat.icon;
            return (
              <View key={stat.label} style={styles.statCard}>
                <Icon color={stat.color} size={18} strokeWidth={1.8} />
                <Text style={[styles.statValue, { color: stat.color }]}>
                  {stat.value}
                </Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              {realBookingsCount > 0
                ? `YOUR OFFICIAL BOOKINGS & PDFS (${realBookingsCount})`
                : 'ACTIVE ITINERARIES (TAP FOR STAMPED PDF)'}
            </Text>
            {loadingBookings ? (
              <ActivityIndicator size="small" color="#D4AF37" />
            ) : null}
          </View>

          {itineraries.map(trip => {
            const Icon = trip.icon;
            return (
              <Pressable
                key={trip.id}
                style={styles.tripCard}
                onPress={() => handleOpenItineraryPdf(trip)}
              >
                <View style={styles.tripIconCircle}>
                  <Icon color={trip.iconColor} size={20} strokeWidth={1.8} />
                </View>
                <View style={styles.tripInfo}>
                  <Text style={styles.tripDest} numberOfLines={1}>
                    {trip.destination}
                  </Text>
                  <Text style={styles.tripType} numberOfLines={1}>
                    {trip.type}
                    {trip.amountLabel ? ` • ${trip.amountLabel}` : ''}
                  </Text>
                  <View style={styles.tripDateRow}>
                    <Clock
                      color="#64748B"
                      size={12}
                      strokeWidth={1.8}
                    />
                    <Text style={styles.tripDate}>{trip.date}</Text>
                  </View>
                </View>
                <View style={styles.tripRight}>
                  <View
                    style={[
                      styles.tripStatusBadge,
                      {
                        backgroundColor: `${trip.statusColor}22`,
                        borderColor: `${trip.statusColor}55`,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tripStatusText,
                        { color: trip.statusColor },
                      ]}
                    >
                      {trip.status}
                    </Text>
                  </View>
                  <View style={styles.pdfMiniPill}>
                    <FileText color="#1C1917" size={11} strokeWidth={2.2} />
                    <Text style={styles.pdfMiniPillText}>PDF</Text>
                    <ChevronRight
                      color="#1C1917"
                      size={12}
                      strokeWidth={2.2}
                    />
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RECENT DESTINATIONS</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.destRow}
          >
            {[
              'Cairo, Egypt',
              'Dubai, UAE',
              'London, UK',
              'Paris, France',
              'Tokyo, Japan',
              'Maldives',
            ].map(dest => (
              <View key={dest} style={styles.destChip}>
                <MapPin color="#D4AF37" size={13} strokeWidth={1.8} />
                <Text style={styles.destText}>{dest}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.settingsBlock}>
          {SETTINGS_LINKS.map(item => {
            const Icon = item.icon;
            return (
              <Pressable
                key={item.label}
                style={styles.settingsRow}
                onPress={item.onPress}
              >
                <View style={styles.settingsIconWrap}>
                  <Icon color="#94A3B8" size={16} strokeWidth={1.8} />
                </View>
                <Text style={styles.settingsLabel}>{item.label}</Text>
                <ChevronRight
                  color="#64748B"
                  size={16}
                  strokeWidth={1.8}
                />
              </Pressable>
            );
          })}
        </View>

        <Pressable style={styles.signOutBtn} onPress={signOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>

        <View style={styles.bottomPad} />
      </ScrollView>

      {selectedDocItem && selectedDocItem.visaDocPayload ? (
        <VisaDocumentPdfModal
          visible={!!selectedDocItem}
          onClose={() => setSelectedDocItem(null)}
          docType={selectedDocItem.docType}
          data={{
            ...selectedDocItem.visaDocPayload,
            clientName:
              selectedDocItem.visaDocPayload.clientName === 'VIP Elite Member'
                ? displayName
                : selectedDocItem.visaDocPayload.clientName,
          }}
        />
      ) : null}

      {selectedFlightTicket ? (
        <FlightTicketPdfModal
          visible={!!selectedFlightTicket}
          onClose={() => setSelectedFlightTicket(null)}
          booking={selectedFlightTicket}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAF9F6' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FAF9F6',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1C1917',
    letterSpacing: 2,
  },
  topBarActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  scroll: {
    padding: 16,
    gap: 16,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  profileInfo: {
    flex: 1,
    gap: 3,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1C1917',
  },
  profileEmail: {
    fontSize: 12,
    color: '#64748B',
  },
  memberBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#D4AF37',
    marginTop: 4,
  },
  memberBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#1C1917',
    letterSpacing: 1,
  },
  editProfileBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  editProfileText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1917',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    padding: 14,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  section: {
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1C1917',
    letterSpacing: 1.5,
  },
  tripCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  tripIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripInfo: {
    flex: 1,
    gap: 2,
  },
  tripDest: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1917',
  },
  tripType: {
    fontSize: 12,
    color: '#64748B',
  },
  tripDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  tripDate: {
    fontSize: 11,
    color: '#64748B',
  },
  tripRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  tripStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  tripStatusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  pdfMiniPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  pdfMiniPillText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#1C1917',
    letterSpacing: 0.5,
  },
  destRow: {
    gap: 8,
  },
  destChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  destText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1917',
  },
  settingsBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(28, 25, 23, 0.08)',
    gap: 12,
  },
  settingsIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1917',
  },
  signOutBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    alignItems: 'center',
    marginTop: 4,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#EF4444',
  },
  bottomPad: {
    height: 40,
  },
});
