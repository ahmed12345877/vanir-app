import React, { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { ChevronLeft, Car, MapPin, Calendar, Clock, ArrowRight } from 'lucide-react-native';
import { VipDatePickerModal } from '../../components/VipDatePickerModal';
import { colors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';

const VEHICLE_CLASSES = [
  { id: 'sedan', label: 'Executive Sedan', eg: 'Mercedes S-Class, BMW 7', price: '$120/hr', hourlyRate: 120 },
  { id: 'suv', label: 'Luxury SUV', eg: 'Range Rover, Cadillac Escalade', price: '$160/hr', hourlyRate: 160 },
  { id: 'van', label: 'VIP Van', eg: 'Mercedes V-Class, Sprinter', price: '$180/hr', hourlyRate: 180 },
  { id: 'stretch', label: 'Stretch Limousine', eg: 'Lincoln, Chrysler 300', price: '$250/hr', hourlyRate: 250 },
  { id: 'supercar', label: 'Supercar & Flagship', eg: 'Rolls-Royce, Bentley, Lamborghini', price: '$500/hr', hourlyRate: 500 },
];

const DURATION_OPTIONS = [
  { id: 'transfer', label: 'Direct Transfer', hours: 2 },
  { id: '4h', label: '4 Hours', hours: 4 },
  { id: '8h', label: '8 Hours', hours: 8 },
  { id: '12h', label: 'Full Day (12h)', hours: 12 },
];

export function LimousineScreen() {
  const navigation = useNavigation<any>();
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState('14:00');
  const [selectedClass, setSelectedClass] = useState('sedan');
  const [selectedDuration, setSelectedDuration] = useState('transfer');
  const [notes, setNotes] = useState('');

  const chosenVehicle = VEHICLE_CLASSES.find(v => v.id === selectedClass) || VEHICLE_CLASSES[0];
  const chosenDuration = DURATION_OPTIONS.find(d => d.id === selectedDuration) || DURATION_OPTIONS[0];
  const computedTotal = chosenVehicle.hourlyRate * chosenDuration.hours;

  const handleSubmit = () => {
    if (!pickup.trim()) {
      Alert.alert('Required Information', 'Please specify the pick-up location.');
      return;
    }
    if (!dropoff.trim()) {
      Alert.alert('Required Information', 'Please specify the drop-off destination.');
      return;
    }

    navigation.navigate('Booking', {
      type: 'limousine',
      bookingType: 'limousine',
      visaDocType: 'limousine',
      id: `limo-${chosenVehicle.id}`,
      itemName: `${chosenVehicle.label} (${chosenDuration.label}) • ${pickup.trim()} ➔ ${dropoff.trim()}`,
      price: computedTotal,
      startDate: date,
      endDate: date,
      guestsCount: 2,
      origin: pickup.trim(),
      destination: dropoff.trim(),
      specialRequests: notes.trim(),
      serviceTime: time.trim() || '14:00',
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Pressable
            style={({ pressed }) => [
              styles.backBtn,
              pressed && styles.topBtnPressed,
            ]}
            onPress={() => navigation.goBack()}
            hitSlop={12}
          >
            <ChevronLeft color="#1C1917" size={20} strokeWidth={2.4} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>VANIR LIMOUSINE</Text>
          </View>
          <View style={{ width: 38, height: 38, borderRadius: 19, overflow: 'hidden', borderWidth: 1.5, borderColor: '#D4AF37', backgroundColor: '#FFFFFF' }}>
            <Image
              source={require('../../assets/vanir_round_logo.png')}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </View>
        </View>
        <Text style={styles.headerSub}>Elite ground transportation & chauffeur service</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Route */}
        <View style={styles.formCard}>
          <View style={styles.fieldRow}>
            <MapPin color="#D4AF37" size={18} strokeWidth={1.8} />
            <View style={styles.fieldInner}>
              <Text style={styles.fieldLabel}>PICK-UP LOCATION</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="Airport, hotel, or address"
                placeholderTextColor="#94A3B8"
                value={pickup}
                onChangeText={setPickup}
              />
            </View>
          </View>
          <View style={styles.fieldDivider} />
          <View style={styles.fieldRow}>
            <MapPin color="#D4AF37" size={18} strokeWidth={1.8} />
            <View style={styles.fieldInner}>
              <Text style={styles.fieldLabel}>DROP-OFF LOCATION</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="Destination address"
                placeholderTextColor="#94A3B8"
                value={dropoff}
                onChangeText={setDropoff}
              />
            </View>
          </View>
        </View>

        {/* Date & Time */}
        <View style={styles.rowCards}>
          <Pressable
            style={[styles.smallCard, styles.grow]}
            onPress={() => setShowDatePicker(true)}
          >
            <Calendar color="#D4AF37" size={16} strokeWidth={1.8} />
            <Text style={styles.fieldLabel}>PICKUP DATE</Text>
            <Text style={[styles.fieldInput, { paddingTop: 2 }]}>
              {date || 'Select Date'}
            </Text>
          </Pressable>
          <View style={[styles.smallCard, styles.grow]}>
            <Clock color="#D4AF37" size={16} strokeWidth={1.8} />
            <Text style={styles.fieldLabel}>PICKUP TIME</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="14:00"
              placeholderTextColor="#94A3B8"
              value={time}
              onChangeText={setTime}
            />
          </View>
        </View>

        {/* Duration Selector */}
        <View style={styles.formCard}>
          <Text style={styles.sectionLabel}>SERVICE DURATION</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {DURATION_OPTIONS.map(opt => {
              const isSelected = selectedDuration === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => setSelectedDuration(opt.id)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: isSelected ? '#D4AF37' : 'rgba(212,175,55,0.25)',
                    backgroundColor: isSelected ? 'rgba(212,175,55,0.16)' : '#FAF9F6',
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '800', color: '#1C1917' }}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Vehicle class */}
        <View style={styles.formCard}>
          <Text style={styles.sectionLabel}>SELECT VEHICLE CLASS</Text>
          {VEHICLE_CLASSES.map(vc => (
            <Pressable
              key={vc.id}
              style={[styles.vehicleRow, selectedClass === vc.id && styles.vehicleRowActive]}
              onPress={() => setSelectedClass(vc.id)}>
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleLabel}>{vc.label}</Text>
                <Text style={styles.vehicleEg}>{vc.eg}</Text>
              </View>
              <Text style={styles.vehiclePrice}>{vc.price}</Text>
            </Pressable>
          ))}
        </View>

        {/* Notes */}
        <View style={styles.formCard}>
          <Text style={styles.sectionLabel}>ADDITIONAL NOTES</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Flight number, special requirements, number of passengers..."
            placeholderTextColor="#94A3B8"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.submitBtn,
            { flexDirection: 'row', justifyContent: 'center', gap: 10 },
            pressed && styles.btnPressed,
          ]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitText}>
            PROCEED TO PAYMENT • ${computedTotal}
          </Text>
          <ArrowRight color="#1C1917" size={18} strokeWidth={2.5} />
        </Pressable>

        <View style={styles.bottomPad} />
      </ScrollView>

      <VipDatePickerModal
        visible={showDatePicker}
        initialDate={date}
        title="Select Limousine Transfer Date"
        onClose={() => setShowDatePicker(false)}
        onSelectDate={setDate}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAF9F6' },
  header: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[3],
    paddingBottom: spacing[4],
    gap: spacing[2],
    backgroundColor: '#FAF9F6',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.25)',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
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
  headerText: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#1C1917', letterSpacing: 2 },
  headerSub: { fontSize: 13, color: '#64748B', letterSpacing: 0.3 },
  scroll: { padding: spacing[5], gap: spacing[4] },

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    padding: spacing[4],
    gap: spacing[3],
    shadowColor: '#1C1917',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionLabel: { fontSize: 10, color: '#64748B', fontWeight: '700', letterSpacing: 1.5 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  fieldInner: { flex: 1 },
  fieldLabel: { fontSize: 10, color: '#64748B', fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  fieldInput: { fontSize: 14, color: '#1C1917', fontWeight: '600', padding: 0 },
  fieldDivider: { height: 1, backgroundColor: 'rgba(28, 25, 23, 0.08)' },

  rowCards: { flexDirection: 'row', gap: spacing[3] },
  grow: { flex: 1 },
  smallCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    padding: spacing[4],
    gap: 4,
    shadowColor: '#1C1917',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    backgroundColor: '#FFFFFF',
  },
  vehicleRowActive: { borderColor: '#D4AF37', backgroundColor: 'rgba(212, 175, 55, 0.12)' },
  vehicleInfo: { flex: 1 },
  vehicleLabel: { fontSize: 14, fontWeight: '700', color: '#1C1917' },
  vehicleEg: { fontSize: 10, color: '#64748B', marginTop: 2 },
  vehiclePrice: { fontSize: 11, fontWeight: '700', color: '#D4AF37' },

  textArea: {
    color: '#1C1917',
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    padding: 0,
  },

  submitBtn: {
    backgroundColor: '#D4AF37',
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    alignItems: 'center',
    shadowColor: '#D4AF37',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 3,
  },
  btnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  submitText: { fontSize: 15, fontWeight: '800', color: '#1C1917', letterSpacing: 1.5 },
  bottomPad: { height: 60 },
});
