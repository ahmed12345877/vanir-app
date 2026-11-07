import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
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
  Info,
  Check,
  ShieldCheck,
} from 'lucide-react-native';
import Svg, { Path, Polygon, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type SeatSelectionRoute = RouteProp<RootStackParamList, 'SeatSelection'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SeatConfig {
  id: string; // e.g., 'A1'
  row: number;
  col: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  status: 'available' | 'unavailable';
}

// Initial seat map layout closely matching Screenshot 4
const SEAT_ROWS: SeatConfig[][] = [
  // Row 1
  [
    { id: 'A1', row: 1, col: 'A', status: 'available' },
    { id: 'B1', row: 1, col: 'B', status: 'available' },
    { id: 'C1', row: 1, col: 'C', status: 'available' },
    { id: 'D1', row: 1, col: 'D', status: 'available' },
    { id: 'E1', row: 1, col: 'E', status: 'available' },
    { id: 'F1', row: 1, col: 'F', status: 'available' },
  ],
  // Row 2 (A2 & B2 are Selected in the Behance mockup)
  [
    { id: 'A2', row: 2, col: 'A', status: 'available' },
    { id: 'B2', row: 2, col: 'B', status: 'available' },
    { id: 'C2', row: 2, col: 'C', status: 'available' },
    { id: 'D2', row: 2, col: 'D', status: 'unavailable' },
    { id: 'E2', row: 2, col: 'E', status: 'unavailable' },
    { id: 'F2', row: 2, col: 'F', status: 'available' },
  ],
  // Row 3
  [
    { id: 'A3', row: 3, col: 'A', status: 'unavailable' },
    { id: 'B3', row: 3, col: 'B', status: 'available' },
    { id: 'C3', row: 3, col: 'C', status: 'unavailable' },
    { id: 'D3', row: 3, col: 'D', status: 'available' },
    { id: 'E3', row: 3, col: 'E', status: 'available' },
    { id: 'F3', row: 3, col: 'F', status: 'unavailable' },
  ],
  // Row 4
  [
    { id: 'A4', row: 4, col: 'A', status: 'available' },
    { id: 'B4', row: 4, col: 'B', status: 'available' },
    { id: 'C4', row: 4, col: 'C', status: 'available' },
    { id: 'D4', row: 4, col: 'D', status: 'unavailable' },
    { id: 'E4', row: 4, col: 'E', status: 'available' },
    { id: 'F4', row: 4, col: 'F', status: 'available' },
  ],
  // Row 5
  [
    { id: 'A5', row: 5, col: 'A', status: 'unavailable' },
    { id: 'B5', row: 5, col: 'B', status: 'unavailable' },
    { id: 'C5', row: 5, col: 'C', status: 'available' },
    { id: 'D5', row: 5, col: 'D', status: 'available' },
    { id: 'E5', row: 5, col: 'E', status: 'available' },
    { id: 'F5', row: 5, col: 'F', status: 'available' },
  ],
  // Row 6
  [
    { id: 'A6', row: 6, col: 'A', status: 'available' },
    { id: 'B6', row: 6, col: 'B', status: 'available' },
    { id: 'C6', row: 6, col: 'C', status: 'available' },
    { id: 'D6', row: 6, col: 'D', status: 'unavailable' },
    { id: 'E6', row: 6, col: 'E', status: 'unavailable' },
    { id: 'F6', row: 6, col: 'F', status: 'unavailable' },
  ],
  // Row 7
  [
    { id: 'A7', row: 7, col: 'A', status: 'available' },
    { id: 'B7', row: 7, col: 'B', status: 'available' },
    { id: 'C7', row: 7, col: 'C', status: 'unavailable' },
    { id: 'D7', row: 7, col: 'D', status: 'available' },
    { id: 'E7', row: 7, col: 'E', status: 'available' },
    { id: 'F7', row: 7, col: 'F', status: 'available' },
  ],
  // Row 8
  [
    { id: 'A8', row: 8, col: 'A', status: 'unavailable' },
    { id: 'B8', row: 8, col: 'B', status: 'available' },
    { id: 'C8', row: 8, col: 'C', status: 'available' },
    { id: 'D8', row: 8, col: 'D', status: 'available' },
    { id: 'E8', row: 8, col: 'E', status: 'available' },
    { id: 'F8', row: 8, col: 'F', status: 'unavailable' },
  ],
];

/**
 * Airplane Cockpit Nose Vector
 */
function AirplaneNose() {
  return (
    <View style={styles.airplaneNoseContainer}>
      <Svg width={240} height={130} viewBox="0 0 240 130" fill="none">
        <Defs>
          <LinearGradient id="fuselageGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <Stop offset="50%" stopColor="#FAF9F6" stopOpacity="0.6" />
            <Stop offset="100%" stopColor="#FAF9F6" stopOpacity="0.2" />
          </LinearGradient>
          <LinearGradient id="cockpitGlass" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#D4AF37" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#1C1917" />
          </LinearGradient>
        </Defs>

        {/* Nose Dome */}
        <Path
          d="M30 130 C30 40, 70 8, 120 8 C170 8, 210 40, 210 130"
          stroke="rgba(212, 175, 55, 0.35)"
          strokeWidth="2.5"
          fill="url(#fuselageGrad)"
        />

        {/* Cockpit Windows */}
        {/* Leftmost Window */}
        <Polygon points="74,80 84,65 96,68 88,85" fill="url(#cockpitGlass)" />
        {/* Mid-Left Window */}
        <Polygon points="93,86 100,69 112,71 106,89" fill="url(#cockpitGlass)" />
        {/* Mid-Right Window */}
        <Polygon points="114,89 120,71 132,69 127,86" fill="url(#cockpitGlass)" />
        {/* Rightmost Window */}
        <Polygon points="134,85 144,68 156,65 146,80" fill="url(#cockpitGlass)" />
      </Svg>
    </View>
  );
}

/**
 * Modern Airplane Seat Component
 */
function AirplaneSeat({
  id,
  status,
  isSelected,
  onPress,
}: {
  id: string;
  status: 'available' | 'unavailable';
  isSelected: boolean;
  onPress: () => void;
}) {
  let bgColor = '#FFFFFF'; // Available Luxury Off-White
  let borderColor = 'rgba(212, 175, 55, 0.35)';

  if (isSelected) {
    bgColor = '#D4AF37'; // Selected Matte Gold
    borderColor = '#D4AF37';
  } else if (status === 'unavailable') {
    bgColor = 'rgba(28, 25, 23, 0.08)'; // Unavailable Muted
    borderColor = 'rgba(28, 25, 23, 0.12)';
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.seatTouch,
        pressed && status === 'available' && { transform: [{ scale: 0.94 }] },
      ]}
      onPress={onPress}
      hitSlop={4}
    >
      <View style={[styles.seatOuter, { backgroundColor: bgColor, borderColor }]}>
        {/* Headrest Cushion */}
        <View style={[styles.seatHeadrest, isSelected && { backgroundColor: 'rgba(28, 25, 23, 0.25)' }]} />
        {/* Seat Cushion Line */}
        <View style={[styles.seatCushion, isSelected && { backgroundColor: 'rgba(28, 25, 23, 0.15)' }]} />
      </View>
    </Pressable>
  );
}

export function SeatSelectionScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<SeatSelectionRoute>();
  const insets = useSafeAreaInsets();

  const passengersCount = route.params?.passengers ?? 2;
  const flightNumber = route.params?.flightNumber ?? 'DI-2261';
  const originCode = route.params?.originCode ?? 'JFK';
  const destinationCode = route.params?.destinationCode ?? 'LAX';

  // Default selected seats to A2 & B2 matching Image 4
  const [selectedSeats, setSelectedSeats] = useState<string[]>(
    route.params?.selectedSeats ?? ['A2', 'B2']
  );

  const toggleSeat = (seatId: string, status: 'available' | 'unavailable') => {
    if (status === 'unavailable') {
      Alert.alert(
        'Seat Occupied',
        `Seat ${seatId} has already been reserved by another passenger. Please select an available blue seat.`
      );
      return;
    }

    if (selectedSeats.includes(seatId)) {
      // Deselect
      setSelectedSeats(prev => prev.filter(s => s !== seatId));
    } else {
      // Limit to passenger count or alert
      if (selectedSeats.length >= passengersCount) {
        Alert.alert(
          'Maximum Seats Reached',
          `You have selected ${passengersCount} seats for ${passengersCount} travelers. To change, tap a selected orange seat first to deselect it.`
        );
        return;
      }
      setSelectedSeats(prev => [...prev, seatId]);
    }
  };

  const handleSaveAndContinue = () => {
    if (selectedSeats.length === 0) {
      Alert.alert('Select Seats', 'Please select at least 1 seat before continuing.');
      return;
    }

    navigation.navigate('PassengerDetails', {
      ...route.params,
      selectedSeats,
    });
  };

  // Formatted seat label (e.g., "A2 & B2")
  const seatDisplayLabel =
    selectedSeats.length === 0
      ? 'None'
      : selectedSeats.length === 1
      ? selectedSeats[0]
      : selectedSeats.join(' & ');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.topBtnPressed]}
          onPress={() => navigation.goBack()}
          hitSlop={12}
        >
          <ChevronLeft color="#1C1917" size={22} strokeWidth={2.4} />
        </Pressable>

        <Text style={styles.headerTitle}>Select Seat</Text>

        {/* Step Indicator */}
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>1</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 + insets.bottom }]}
      >
        {/* Legend Bar */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: '#D4AF37', borderColor: '#D4AF37' }]} />
            <Text style={styles.legendText}>Selected</Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: '#FFFFFF', borderColor: '#D4AF37' }]} />
            <Text style={styles.legendText}>Available</Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: 'rgba(28, 25, 23, 0.08)', borderColor: 'rgba(28, 25, 23, 0.15)' }]} />
            <Text style={styles.legendText}>Unavailable</Text>
          </View>
        </View>

        {/* Airplane Cabin Wrapper */}
        <View style={styles.cabinWrapper}>
          {/* Cockpit Nose Graphic */}
          <AirplaneNose />

          {/* Floating Selected Seat Pill Badge */}
          <View style={styles.yourSeatBadge}>
            <Text style={styles.yourSeatLabel}>Your Seat</Text>
            <Text style={styles.yourSeatValue}>{seatDisplayLabel}</Text>
          </View>

          {/* Seat Column Labels */}
          <View style={styles.columnHeadersRow}>
            {/* Left 3 seats */}
            <View style={styles.colGroupLeft}>
              <Text style={styles.colLabel}>A</Text>
              <Text style={styles.colLabel}>B</Text>
              <Text style={styles.colLabel}>C</Text>
            </View>

            {/* Aisle */}
            <View style={styles.aisleSpace} />

            {/* Right 3 seats */}
            <View style={styles.colGroupRight}>
              <Text style={styles.colLabel}>D</Text>
              <Text style={styles.colLabel}>E</Text>
              <Text style={styles.colLabel}>F</Text>
            </View>
          </View>

          {/* Rows of Seats */}
          <View style={styles.seatsGrid}>
            {SEAT_ROWS.map((rowSeats, rowIndex) => {
              const rowNumber = rowIndex + 1;
              const leftSeats = rowSeats.slice(0, 3);
              const rightSeats = rowSeats.slice(3, 6);

              return (
                <View key={`row-${rowNumber}`} style={styles.seatRow}>
                  {/* Left 3 seats */}
                  <View style={styles.seatGroup}>
                    {leftSeats.map(seat => (
                      <AirplaneSeat
                        key={seat.id}
                        id={seat.id}
                        status={seat.status}
                        isSelected={selectedSeats.includes(seat.id)}
                        onPress={() => toggleSeat(seat.id, seat.status)}
                      />
                    ))}
                  </View>

                  {/* Aisle with Row Number */}
                  <View style={styles.aisleCol}>
                    <Text style={styles.rowNumberText}>{rowNumber}</Text>
                  </View>

                  {/* Right 3 seats */}
                  <View style={styles.seatGroup}>
                    {rightSeats.map(seat => (
                      <AirplaneSeat
                        key={seat.id}
                        id={seat.id}
                        status={seat.status}
                        isSelected={selectedSeats.includes(seat.id)}
                        onPress={() => toggleSeat(seat.id, seat.status)}
                      />
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA Button */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          style={({ pressed }) => [styles.continueBtn, pressed && styles.btnPressed]}
          onPress={handleSaveAndContinue}
        >
          <Text style={styles.continueBtnText}>Save & Continue</Text>
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
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  stepBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D4AF37',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    alignItems: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 22,
    paddingVertical: 12,
    marginBottom: 8,
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
    borderWidth: 1,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  cabinWrapper: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    paddingTop: 10,
    paddingBottom: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  airplaneNoseContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -8,
    marginBottom: 10,
  },
  yourSeatBadge: {
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    minWidth: 130,
  },
  yourSeatLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
  },
  yourSeatValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#D4AF37',
    marginTop: 1,
  },
  columnHeadersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 10,
  },
  colGroupLeft: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: 130,
  },
  colGroupRight: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: 130,
  },
  aisleSpace: {
    width: 32,
  },
  colLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    width: 36,
    textAlign: 'center',
  },
  seatsGrid: {
    width: '100%',
    gap: 8,
  },
  seatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatGroup: {
    flexDirection: 'row',
    gap: 8,
    width: 130,
    justifyContent: 'center',
  },
  aisleCol: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  seatTouch: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatOuter: {
    width: 34,
    height: 38,
    borderRadius: 8,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  seatHeadrest: {
    width: 22,
    height: 8,
    borderRadius: 3,
    backgroundColor: 'rgba(212, 175, 55, 0.25)',
  },
  seatCushion: {
    width: 26,
    height: 14,
    borderRadius: 4,
    backgroundColor: 'rgba(28, 25, 23, 0.05)',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FAF9F6',
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
