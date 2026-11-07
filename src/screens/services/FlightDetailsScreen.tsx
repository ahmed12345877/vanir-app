import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
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
  Luggage,
  Info,
  Plane,
  CheckCircle2,
  Users,
  ShieldCheck,
  Plus,
  Minus,
  Sparkles,
} from 'lucide-react-native';
import Svg, { Path, Polygon } from 'react-native-svg';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
import { AirlineLogo } from '../../components/AirlineLogos';
type FlightDetailsRoute = RouteProp<RootStackParamList, 'FlightDetails'>;

export function FlightDetailsScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<FlightDetailsRoute>();
  const insets = useSafeAreaInsets();

  // Params with defaults matching design screenshot
  const flightId = route.params?.flightId ?? 'DL-2261';
  const airline = route.params?.airline ?? 'Delta';
  const flightNumber = route.params?.flightNumber ?? 'DI-2261';
  const origin = route.params?.origin ?? 'John F. Kennedy';
  const originCode = route.params?.originCode ?? 'JFK';
  const destination = route.params?.destination ?? 'Los Angeles';
  const destinationCode = route.params?.destinationCode ?? 'LAX';
  const departureTime = route.params?.departureTime ?? '10:30 PM';
  const arrivalTime = route.params?.arrivalTime ?? '02:00 AM';
  const duration = route.params?.duration ?? '5h 30m';
  const pricePerPerson = route.params?.pricePerPerson ?? 312;

  // Passenger Count (default to 2 adults matching the $624.00 screenshot calculation)
  const [passengers, setPassengers] = useState(route.params?.passengers ?? 2);
  const [extraBaggage, setExtraBaggage] = useState(false);

  // Calculations
  const baseFare = pricePerPerson * passengers;
  const taxesAndFees = Math.round(baseFare * 0.09935); // matches $62.00 on $624.00
  const baggageCost = extraBaggage ? 45 * passengers : 0;
  const total = baseFare + taxesAndFees + baggageCost;

  const handleContinue = () => {
    navigation.navigate('SeatSelection', {
      flightId,
      airline,
      airlineCode: route.params?.airlineCode,
      flightNumber,
      origin,
      originCode,
      destination,
      destinationCode,
      departureTime,
      arrivalTime,
      duration,
      passengers,
      basePrice: baseFare,
      totalPrice: total,
      selectedSeats: ['A2', 'B2'],
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
        <Text style={styles.headerTitle}>Flight Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 + insets.bottom }]}
      >
        {/* Main Flight Card */}
        <View style={styles.flightCard}>
          {/* Airline Header */}
          <View style={styles.airlineHeaderRow}>
            <View style={styles.airlineBrandRow}>
              <View style={styles.logoBadge}>
                <AirlineLogo airline={airline} size={28} />
              </View>
              <View style={styles.airlineTextCol}>
                <Text style={styles.airlineName}>{airline}</Text>
                <Text style={styles.cabinClass}>Economy</Text>
              </View>
            </View>

            <View style={styles.priceBadgeCol}>
              <Text style={styles.perPersonPrice}>${pricePerPerson}</Text>
              <Text style={styles.perPersonSub}>Per Person</Text>
            </View>
          </View>

          {/* Route Flight Path */}
          <View style={styles.routeContainer}>
            {/* Origin */}
            <View style={styles.routePointLeft}>
              <Text style={styles.airportName} numberOfLines={1}>{origin}</Text>
              <Text style={styles.airportCode}>{originCode}</Text>
              <Text style={styles.timeText}>{departureTime}</Text>
            </View>

            {/* Flight Path Indicator */}
            <View style={styles.flightPathCenter}>
              <Text style={styles.durationText}>{duration}</Text>
              <View style={styles.flightDottedLine}>
                <View style={styles.dotLeft} />
                <View style={styles.lineMiddle} />
                <View style={styles.planeCircle}>
                  <View style={{ transform: [{ rotate: '45deg' }], alignItems: 'center', justifyContent: 'center' }}>
                    <Plane color="#D4AF37" size={16} fill="#D4AF37" strokeWidth={2.2} />
                  </View>
                </View>
                <View style={styles.lineMiddle} />
                <View style={styles.dotRight} />
              </View>
            </View>

            {/* Destination */}
            <View style={styles.routePointRight}>
              <Text style={styles.airportName} numberOfLines={1}>{destination}</Text>
              <Text style={styles.airportCode}>{destinationCode}</Text>
              <Text style={styles.timeText}>{arrivalTime}</Text>
            </View>
          </View>
        </View>

        {/* Passenger Stepper */}
        <View style={styles.stepperCard}>
          <View style={styles.stepperInfo}>
            <View style={styles.stepperIconBox}>
              <Users color="#D4AF37" size={20} />
            </View>
            <View>
              <Text style={styles.stepperTitle}>Travelers</Text>
              <Text style={styles.stepperSub}>{passengers} {passengers === 1 ? 'Adult' : 'Adults'}</Text>
            </View>
          </View>

          <View style={styles.stepperControls}>
            <Pressable
              style={[styles.stepBtn, passengers <= 1 && styles.stepBtnDisabled]}
              onPress={() => passengers > 1 && setPassengers(p => p - 1)}
              disabled={passengers <= 1}
            >
              <Minus color={passengers <= 1 ? '#64748B' : '#FFFFFF'} size={18} strokeWidth={2.2} />
            </Pressable>
            <Text style={styles.stepCountText}>{passengers}</Text>
            <Pressable
              style={[styles.stepBtn, passengers >= 8 && styles.stepBtnDisabled]}
              onPress={() => passengers < 8 && setPassengers(p => p + 1)}
              disabled={passengers >= 8}
            >
              <Plus color={passengers >= 8 ? '#64748B' : '#FFFFFF'} size={18} strokeWidth={2.2} />
            </Pressable>
          </View>
        </View>

        {/* Baggage Section */}
        <View style={styles.infoSectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionIconRow}>
              <Luggage color="#D4AF37" size={18} />
              <Text style={styles.sectionHeaderTitle}>Baggage</Text>
            </View>
            <Text style={styles.baggageCounter}>({passengers})</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoRowLabel}>Carry-on</Text>
            <Text style={styles.infoRowValue}>7 kg Included</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoRowLabel}>Checked</Text>
            <Text style={styles.infoRowValue}>25 kg Included</Text>
          </View>

          {/* Optional Extra Baggage Toggle */}
          <Pressable
            style={[styles.extraBaggageBtn, extraBaggage && styles.extraBaggageBtnActive]}
            onPress={() => setExtraBaggage(!extraBaggage)}
          >
            <View style={styles.extraBaggageLeft}>
              <View style={[styles.checkbox, extraBaggage && styles.checkboxActive]}>
                {extraBaggage && <CheckCircle2 color="#FFFFFF" size={14} />}
              </View>
              <Text style={styles.extraBaggageText}>Add Extra +10 kg Baggage</Text>
            </View>
            <Text style={styles.extraBaggagePrice}>+$45 / passenger</Text>
          </Pressable>
        </View>

        {/* Fare Rules Section */}
        <View style={styles.infoSectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionIconRow}>
              <Info color="#D4AF37" size={18} />
              <Text style={styles.sectionHeaderTitle}>Fare Rules</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoRowLabel}>Cancellation</Text>
            <Text style={styles.ruleNonRefundable}>Non-refundable</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoRowLabel}>Date Change</Text>
            <Text style={styles.infoRowValue}>$75.00 fee</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoRowLabel}>Seat Selection</Text>
            <Text style={styles.ruleIncluded}>Included</Text>
          </View>
        </View>

        {/* Price Breakdown */}
        <View style={styles.priceBreakdownCard}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Base fare ({passengers} {passengers === 1 ? 'adult' : 'adults'})</Text>
            <Text style={styles.priceValue}>${baseFare.toFixed(2)}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Taxes & fees</Text>
            <Text style={styles.priceValue}>${taxesAndFees.toFixed(2)}</Text>
          </View>

          {extraBaggage && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Extra Baggage ({passengers}x)</Text>
              <Text style={styles.priceValue}>${baggageCost.toFixed(2)}</Text>
            </View>
          )}

          <View style={styles.priceDivider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Action */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          style={({ pressed }) => [styles.continueBtn, pressed && styles.btnPressed]}
          onPress={handleContinue}
        >
          <Text style={styles.continueBtnText}>Continue</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#FAF9F6',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
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
  topBtnPressed: {
    backgroundColor: 'rgba(212, 175, 55, 0.22)',
    borderColor: '#D4AF37',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1917',
    letterSpacing: -0.3,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  flightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  airlineHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(28, 25, 23, 0.08)',
  },
  airlineBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  airlineTextCol: {
    gap: 2,
  },
  airlineName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1917',
  },
  cabinClass: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  priceBadgeCol: {
    alignItems: 'flex-end',
  },
  perPersonPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#D4AF37',
  },
  perPersonSub: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 18,
  },
  routePointLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  routePointRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  airportName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 4,
  },
  airportCode: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.5,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1917',
    marginTop: 4,
  },
  flightPathCenter: {
    alignItems: 'center',
    paddingHorizontal: 8,
    width: 120,
  },
  durationText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
  },
  flightDottedLine: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  dotLeft: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D4AF37',
  },
  dotRight: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D4AF37',
  },
  lineMiddle: {
    flex: 1,
    height: 1.5,
    backgroundColor: 'rgba(212, 175, 55, 0.4)',
  },
  planeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  stepperCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  stepperInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1917',
  },
  stepperSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FAF9F6',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDisabled: {
    opacity: 0.35,
  },
  stepCountText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1917',
    minWidth: 18,
    textAlign: 'center',
  },
  infoSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1917',
  },
  baggageCounter: {
    fontSize: 13,
    color: '#D4AF37',
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoRowLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  infoRowValue: {
    fontSize: 14,
    color: '#1C1917',
    fontWeight: '600',
  },
  ruleNonRefundable: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  ruleIncluded: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  extraBaggageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF9F6',
    padding: 12,
    borderRadius: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  extraBaggageBtnActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderColor: '#D4AF37',
  },
  extraBaggageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#64748B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  extraBaggageText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1917',
  },
  extraBaggagePrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D4AF37',
  },
  priceBreakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 14,
    color: '#1C1917',
    fontWeight: '600',
  },
  priceDivider: {
    height: 1,
    backgroundColor: 'rgba(28, 25, 23, 0.08)',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1917',
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#D4AF37',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 14,
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
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
