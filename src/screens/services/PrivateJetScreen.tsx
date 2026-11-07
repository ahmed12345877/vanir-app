import React, { useState, useMemo, useEffect } from 'react';
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import firestore from '@react-native-firebase/firestore';
import { useCatalogStore } from '../../context/CatalogStore';
import LinearGradient from 'react-native-linear-gradient';
import { VipDatePickerModal } from '../../components/VipDatePickerModal';
import {
  ChevronLeft,
  Calendar,
  Users,
  Plane,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Crown,
  Check,
  Clock,
  Wifi,
  Wine,
  Car,
  Eye,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';

interface AircraftFleetItem {
  id: string;
  name: string;
  category: string;
  pax: string;
  range: string;
  speed: string;
  rate: string;
  tag: string;
  localImage: any;
  description: string;
  images?: string[];
}

const FLEET_DATA: AircraftFleetItem[] = [
  {
    id: 'g650er',
    name: 'Gulfstream G650ER',
    category: 'Ultra Long Range Flagship',
    pax: '16 VIP Seats',
    range: '7,500 nm (Transatlantic Non-Stop)',
    speed: 'Mach 0.925',
    rate: '$16,800/hr',
    tag: 'Flagship Jet',
    localImage: require('../../assets/images/services/luxury_private_jet_flight.jpg'),
    description: 'Iconic ultra-long-range luxury jet capable of flying non-stop from Cairo or Dubai to London, New York, or Tokyo. Features 16 handcrafted leather club seats and private master stateroom.',
  },
  {
    id: 'global7500',
    name: 'Bombardier Global 7500',
    category: 'Four-Zone Executive Suite',
    pax: '19 VIP Seats',
    range: '7,700 nm (Intercontinental)',
    speed: 'Mach 0.90',
    rate: '$18,500/hr',
    tag: 'Royal Palace',
    localImage: require('../../assets/images/services/private_jet_gold.jpg'),
    description: 'The world’s largest and longest-range purpose-built business jet. Four true living spaces including a permanent private bedroom, en-suite stand-up shower, and full gourmet kitchen.',
  },
  {
    id: 'g550cabin',
    name: 'Gulfstream Presidential Lounge',
    category: 'Handcrafted Bespoke Interior',
    pax: '14–16 VIP Guests',
    range: '6,750 nm (Worldwide Access)',
    speed: 'Mach 0.885',
    rate: 'Included In Charter',
    tag: 'VIP Salon',
    localImage: require('../../assets/images/services/private_jet_interior.jpg'),
    description: 'Exclusive cabin lounge with panoramic oval windows, low cabin pressurization for zero fatigue, handcrafted leather divan, crystal champagne flutes, and bespoke Michelin in-flight catering.',
  },
  {
    id: 'falcon8x',
    name: 'Dassault Falcon 8X',
    category: 'Tri-Jet Performance & Safety',
    pax: '14 VIP Seats',
    range: '6,450 nm (Tri-Engine Range)',
    speed: 'Mach 0.90',
    rate: '$14,500/hr',
    tag: 'Tri-Jet Speed',
    localImage: require('../../assets/images/services/luxury_flight_sunset.jpg'),
    description: 'Three ultra-quiet turbofan engines for unparalleled peace of mind over oceans. Special steep-approach certification for landing directly at Aspen, London City, and St. Moritz.',
  },
];

const POPULAR_AIRPORTS = [
  { code: 'CAI', city: 'Cairo', name: 'Cairo Intl' },
  { code: 'LON', city: 'London', name: 'Heathrow / Luton VIP' },
  { code: 'DXB', city: 'Dubai', name: 'Al Maktoum VIP' },
  { code: 'PAR', city: 'Paris', name: 'Le Bourget' },
  { code: 'RUH', city: 'Riyadh', name: 'King Khalid VIP' },
  { code: 'NYC', city: 'New York', name: 'Teterboro VIP' },
  { code: 'GVA', city: 'Geneva', name: 'Geneva Cointrin' },
];

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function PrivateJetScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const [selectedFleetId, setSelectedFleetId] = useState('1');
  const [departure, setDeparture] = useState('CAI - Cairo International');
  const [arrival, setArrival] = useState('LON - London Luton / Heathrow');
  const [date, setDate] = useState('Tomorrow • Flexible Departure');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [passengers, setPassengers] = useState(4);
  const [tripType, setTripType] = useState<'oneway' | 'round' | 'multileg'>('oneway');
  const [selectedInclusions, setSelectedInclusions] = useState<string[]>([
    'tarmac',
    'fbo',
    'dining',
    'wifi',
  ]);

  const { itemsByCategory, fetchCategory } = useCatalogStore();
  const liveJets = itemsByCategory.jets ?? [];
  const [firestoreJets, setFirestoreJets] = useState<AircraftFleetItem[]>([]);

  // Direct Firestore real-time listener for uploaded aircraft & photos
  useEffect(() => {
    fetchCategory('jets', { force: true }).catch(() => {});
    try {
      const unsub = firestore()
        .collection('jets')
        .onSnapshot(
          snapshot => {
            if (snapshot && !snapshot.empty) {
              const items: AircraftFleetItem[] = [];
              snapshot.forEach(doc => {
                const d = doc.data();
                if (d.status !== 'draft') {
                  const imgs: string[] = Array.isArray(d.images)
                    ? d.images.map((img: any) => (typeof img === 'string' ? img : img?.url || '')).filter(Boolean)
                    : [];
                  const primaryImg = imgs[0] || d.image || d.primaryImage || '';
                  const catLabel =
                    d.category === 'ultra_long_range'
                      ? 'Ultra Long Range Flagship'
                      : d.category === 'heavy'
                      ? 'Heavy Executive Jet'
                      : d.category === 'super_midsize'
                      ? 'Super Midsize'
                      : (d.category || 'VIP Private Jet');

                  items.push({
                    id: doc.id,
                    name: d.name || 'VIP Private Jet',
                    category: catLabel,
                    pax: d.guestCapacity ? `${d.guestCapacity} VIP Seats` : (d.pax || '16 VIP Seats'),
                    range: d.flightRange ? `${Number(d.flightRange).toLocaleString('en-US')} nm Range` : (d.range || '7,500 nm Range'),
                    speed: d.speed || 'Mach 0.90',
                    rate: typeof d.hourlyRate === 'number'
                      ? `$${Number(d.hourlyRate).toLocaleString('en-US')}/hr`
                      : (d.price ? `${d.price}/hr` : '$16,500/hr'),
                    tag: d.badge || 'VIP Flagship',
                    localImage: primaryImg ? { uri: primaryImg } : require('../../assets/images/services/luxury_private_jet_flight.jpg'),
                    description: d.description || 'Exclusive VIP Private Aviation with Ka-band satellite Wi-Fi and Michelin dining.',
                    images: imgs.length > 0 ? imgs : (primaryImg ? [primaryImg] : []),
                  });
                }
              });
              if (items.length > 0) {
                setFirestoreJets(items);
              }
            }
          },
          err => console.log('PrivateJetScreen firestore error:', err)
        );
      return () => unsub();
    } catch (e) {
      console.log('Error setting up firestore jets listener:', e);
    }
  }, [fetchCategory]);

  const fleetList = useMemo<AircraftFleetItem[]>(() => {
    if (firestoreJets.length > 0) {
      return firestoreJets;
    }
    if (liveJets.length > 0) {
      return liveJets.map(j => {
        const anyJ = j as any;
        return {
          id: j.id,
          name: j.name,
          category: (anyJ.category === 'ultra_long_range' ? 'Ultra Long Range Flagship' : (j.tag1 || j.subtitle || 'VIP Heavy Jet')),
          pax: anyJ.guestCapacity ? `${anyJ.guestCapacity} VIP Seats` : (j.tag1 || '16 VIP Seats'),
          range: anyJ.flightRange ? `${Number(anyJ.flightRange).toLocaleString('en-US')} nm Range` : (j.tag2 || '7,500 nm Range'),
          speed: 'Mach 0.90',
          rate: j.price ? `${j.price}/hr` : '$16,500/hr',
          tag: j.badge || 'Flagship Jet',
          localImage: j.image ? { uri: j.image } : require('../../assets/images/services/luxury_private_jet_flight.jpg'),
          description: j.description || 'Exclusive VIP Private Aviation with Ka-band satellite Wi-Fi and Michelin dining.',
          images: j.images || (j.image ? [j.image] : []),
        };
      });
    }
    return FLEET_DATA;
  }, [firestoreJets, liveJets]);

  // Keep active jet selected accurately
  useEffect(() => {
    if (fleetList.length > 0 && !fleetList.some(j => j.id === selectedFleetId)) {
      setSelectedFleetId(fleetList[0].id);
    }
  }, [fleetList, selectedFleetId]);

  const activeJet = fleetList.find(j => j.id === selectedFleetId) || fleetList[0];

  const openJetDetails = (jet: AircraftFleetItem) => {
    (navigation as any).navigate('JetDetails', {
      jetId: jet.id,
      jetName: jet.name,
      category: jet.category,
      range: jet.range,
      speed: jet.speed,
      pax: jet.pax,
      price: jet.rate,
      description: jet.description,
      image: (jet as any).image || (jet as any).images?.[0],
      images: (jet as any).images,
    });
  };

  const toggleInclusion = (key: string) => {
    setSelectedInclusions(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleAirportSelect = (code: string, city: string) => {
    if (!departure || departure.includes('Select')) {
      setDeparture(`${code} - ${city}`);
    } else if (!arrival || arrival.includes('Select')) {
      setArrival(`${code} - ${city}`);
    } else {
      setArrival(`${code} - ${city}`);
    }
  };

  const handleSubmit = () => {
    const rawRate = activeJet?.rate ? String(activeJet.rate).replace(/[^0-9.]/g, '') : '';
    const numericPrice = parseFloat(rawRate) || 16800;
    const cleanDate = /^\d{4}-\d{1,2}-\d{1,2}$/.test(date)
      ? date
      : (() => {
          const d = new Date();
          d.setDate(d.getDate() + 2);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        })();

    navigation.navigate('Booking', {
      type: 'jet',
      bookingType: 'jet',
      visaDocType: 'jet',
      id: `jet-${activeJet.id}`,
      itemName: `${activeJet.name} Charter (${departure} ➔ ${arrival})`,
      price: numericPrice,
      startDate: cleanDate,
      endDate: cleanDate,
      guestsCount: passengers,
      origin: departure,
      destination: arrival,
    } as any);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Pressable
            style={({ pressed }) => [
              styles.backBtn,
              pressed && styles.topBtnPressed,
            ]}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft color="#1C1917" size={20} strokeWidth={2.5} />
          </Pressable>

          <View style={styles.headerTitleBox}>
            <Text style={styles.headerBrand}>VANIR PRIVATE AVIATION</Text>
            <Text style={styles.headerTagline}>GULFSTREAM & BOMBARDIER VIP FLEET</Text>
          </View>

          <View style={styles.logoBadge}>
            <Image
              source={require('../../assets/vanir_round_logo.png')}
              style={styles.logoImg}
              resizeMode="cover"
            />
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
      >
        {/* Fleet Showcase Section Header */}
        <View style={styles.sectionHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Crown color="#D4AF37" size={18} strokeWidth={2.2} />
            <Text style={styles.sectionTitle}>CURATED EXECUTIVE FLEET</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Worldwide On-Demand Availability</Text>
        </View>

        {/* Horizontal Fleet Carousel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.fleetScroll}
        >
          {fleetList.map(jet => {
            const isSelected = selectedFleetId === jet.id;
            const photoCount = jet.images?.length || 1;
            return (
              <Pressable
                key={jet.id}
                style={[styles.fleetCard, isSelected && styles.fleetCardActive]}
                onPress={() => setSelectedFleetId(jet.id)}
              >
                <Pressable onPress={() => openJetDetails(jet)} style={styles.fleetImageBox}>
                  <Image source={jet.localImage} style={styles.fleetImage} resizeMode="cover" />
                  <View style={styles.fleetBadge}>
                    <Text style={styles.fleetBadgeText}>{jet.tag}</Text>
                  </View>
                  <View style={styles.photoCountBadge}>
                    <Eye color="#FFFFFF" size={11} strokeWidth={2.5} />
                    <Text style={styles.photoCountBadgeText}>{photoCount} Photos</Text>
                  </View>
                  {isSelected && (
                    <View style={styles.selectedCheckBadge}>
                      <Check color="#FFFFFF" size={14} strokeWidth={3} />
                    </View>
                  )}
                </Pressable>

                <View style={styles.fleetInfo}>
                  <Text style={styles.fleetName}>{jet.name}</Text>
                  <Text style={styles.fleetCategory}>{jet.category}</Text>

                  <View style={styles.fleetSpecsRow}>
                    <View style={styles.specItem}>
                      <Users color="#64748B" size={12} />
                      <Text style={styles.specText}>{jet.pax}</Text>
                    </View>
                    <View style={styles.specItem}>
                      <Clock color="#64748B" size={12} />
                      <Text style={styles.specText}>{jet.speed}</Text>
                    </View>
                  </View>

                  <View style={styles.fleetFooter}>
                    <Text style={styles.fleetRate}>{jet.rate}</Text>
                    <Pressable
                      style={styles.detailsMiniBtn}
                      onPress={() => openJetDetails(jet)}
                    >
                      <Eye color="#D4AF37" size={12} strokeWidth={2.4} />
                      <Text style={styles.detailsMiniBtnText}>View Specs</Text>
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Active Jet Highlight Box with Photo Gallery Strip */}
        <Pressable
          style={styles.activeJetCard}
          onPress={() => openJetDetails(activeJet)}
        >
          <View style={styles.activeJetHeader}>
            <View>
              <Text style={styles.activeJetTitle}>{activeJet.name}</Text>
              <Text style={styles.activeJetRange}>Range: {activeJet.range}</Text>
            </View>
            <View style={styles.activeRateBox}>
              <Text style={styles.activeRateText}>{activeJet.rate}</Text>
            </View>
          </View>
          <Text style={styles.activeJetDesc}>{activeJet.description}</Text>

          {/* Uploaded Photos Strip Preview */}
          {activeJet.images && activeJet.images.length > 0 && (
            <View style={styles.previewStripContainer}>
              <View style={styles.previewStripHeader}>
                <Text style={styles.previewStripTitle}>Official Aircraft Gallery ({activeJet.images.length} Photos)</Text>
                <Text style={styles.previewStripSub}>Tap any photo to view full specifications</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbScroll}>
                {activeJet.images.map((imgUri, idx) => (
                  <Pressable
                    key={idx}
                    style={styles.thumbBox}
                    onPress={() => openJetDetails(activeJet)}
                  >
                    <Image source={{ uri: imgUri }} style={styles.thumbImg} resizeMode="cover" />
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </Pressable>

        {/* Trip Type Selector */}
        <View style={styles.tripTypeRow}>
          {[
            { id: 'oneway', label: 'One Way' },
            { id: 'round', label: 'Round Trip' },
            { id: 'multileg', label: 'Multi-Leg VIP' },
          ].map(t => {
            const active = tripType === t.id;
            return (
              <Pressable
                key={t.id}
                style={[styles.tripTypeBtn, active && styles.tripTypeBtnActive]}
                onPress={() => setTripType(t.id as any)}
              >
                <Text style={[styles.tripTypeText, active && styles.tripTypeTextActive]}>
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Flight Route Section */}
        <View style={styles.routeCard}>
          <View style={styles.routeCol}>
            <Text style={styles.routeLabel}>DEPARTURE (ORIGIN)</Text>
            <TextInput
              style={styles.routeInput}
              value={departure}
              onChangeText={setDeparture}
              placeholder="Origin airport or city"
              placeholderTextColor="#64748B"
            />
          </View>

          <View style={styles.routeArrowBox}>
            <ArrowRight color="#D4AF37" size={20} strokeWidth={2.5} />
          </View>

          <View style={styles.routeCol}>
            <Text style={styles.routeLabel}>ARRIVAL (DESTINATION)</Text>
            <TextInput
              style={styles.routeInput}
              value={arrival}
              onChangeText={setArrival}
              placeholder="Destination airport or city"
              placeholderTextColor="#64748B"
            />
          </View>
        </View>

        {/* Quick Airport Suggestions */}
        <View style={styles.quickAirportsSection}>
          <Text style={styles.quickAirportsTitle}>POPULAR PRIVATE JET HUBS:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickAirportsScroll}>
            {POPULAR_AIRPORTS.map(a => (
              <Pressable
                key={a.code}
                style={styles.airportChip}
                onPress={() => handleAirportSelect(a.code, a.city)}
              >
                <Text style={styles.airportChipCode}>{a.code}</Text>
                <Text style={styles.airportChipCity}>{a.city}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Charter Details Card */}
        <View style={styles.formCard}>
          <Pressable style={styles.formRow} onPress={() => setShowDatePicker(true)}>
            <Calendar color="#D4AF37" size={20} strokeWidth={2} />
            <View style={{ flex: 1 }}>
              <Text style={styles.formLabel}>FLIGHT DATE & TIMING</Text>
              <Text style={[styles.formInput, { paddingTop: 6, color: '#1C1917', fontWeight: '600' }]}>
                {date || 'Select flight date'}
              </Text>
            </View>
            <View style={{ paddingHorizontal: 10, paddingVertical: 4, backgroundColor: 'rgba(212, 175, 55, 0.12)', borderRadius: 6 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#D4AF37' }}>PICK DATE</Text>
            </View>
          </Pressable>

          {/* Quick Schedule Presets */}
          <View style={{ flexDirection: 'row', gap: 6, marginHorizontal: 16, marginBottom: 12 }}>
            {[
              { label: 'Today', offset: 0 },
              { label: 'Tomorrow', offset: 1 },
              { label: 'This Weekend', offset: 3 },
              { label: 'Next Week', offset: 7 },
            ].map(item => (
              <Pressable
                key={item.label}
                style={{
                  flex: 1,
                  paddingVertical: 7,
                  backgroundColor: '#FFFFFF',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                  alignItems: 'center',
                }}
                onPress={() => {
                  const d = new Date();
                  d.setDate(d.getDate() + item.offset);
                  const y = d.getFullYear();
                  const m = String(d.getMonth() + 1).padStart(2, '0');
                  const day = String(d.getDate()).padStart(2, '0');
                  setDate(`${item.label} • ${y}-${m}-${day} (Flexible Departure)`);
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#1C1917' }}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.formDivider} />

          <View style={styles.formRow}>
            <Users color="#D4AF37" size={20} strokeWidth={2} />
            <View style={{ flex: 1 }}>
              <Text style={styles.formLabel}>NUMBER OF PASSENGERS</Text>
              <Text style={styles.formSub}>Full private aircraft manifest</Text>
            </View>
            <View style={styles.counterRow}>
              <Pressable
                style={styles.counterBtn}
                onPress={() => setPassengers(Math.max(1, passengers - 1))}
              >
                <Text style={styles.counterBtnText}>−</Text>
              </Pressable>
              <Text style={styles.counterValue}>{passengers}</Text>
              <Pressable
                style={styles.counterBtn}
                onPress={() => setPassengers(passengers + 1)}
              >
                <Text style={styles.counterBtnText}>+</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* VIP Inclusions Checklist */}
        <View style={styles.inclusionsCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Sparkles color="#D4AF37" size={16} />
            <Text style={styles.inclusionsTitle}>BESPOKE VIP CHARTER PRIVILEGES</Text>
          </View>

          {[
            {
              key: 'tarmac',
              icon: Car,
              title: 'Direct Tarmac VIP Limousine Escort',
              desc: 'Chauffeur drives right up to aircraft steps with zero wait.',
            },
            {
              key: 'fbo',
              icon: ShieldCheck,
              title: 'Private FBO VIP Terminal & Fast-Track Customs',
              desc: 'Private passport control in luxury lounge without public queues.',
            },
            {
              key: 'dining',
              icon: Wine,
              title: 'Michelin-Starred In-Flight Catering & Champagne',
              desc: 'Curated dining menu tailored to your personal dietary wishes.',
            },
            {
              key: 'wifi',
              icon: Wifi,
              title: 'High-Speed Ka-Band Satellite Internet',
              desc: 'Uninterrupted 4K video conferencing and high-speed streaming.',
            },
          ].map(inc => {
            const checked = selectedInclusions.includes(inc.key);
            const Icon = inc.icon;
            return (
              <Pressable
                key={inc.key}
                style={[styles.inclusionRow, checked && styles.inclusionRowActive]}
                onPress={() => toggleInclusion(inc.key)}
              >
                <View style={[styles.inclusionCheck, checked && styles.inclusionCheckActive]}>
                  {checked && <Check color="#1C1917" size={14} strokeWidth={3} />}
                </View>
                <Icon color={checked ? '#D4AF37' : '#94A3B8'} size={20} strokeWidth={2} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inclusionTitle, checked && styles.inclusionTitleActive]}>
                    {inc.title}
                  </Text>
                  <Text style={styles.inclusionDesc}>{inc.desc}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Submit Action */}
        <Pressable style={styles.submitBtn} onPress={handleSubmit}>
          <LinearGradient
            colors={['#D4AF37', '#AA820A']}
            style={styles.submitGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Plane color="#1C1917" size={20} strokeWidth={2.5} />
            <Text style={styles.submitText}>REQUEST PRIVATE CHARTER</Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>

      <VipDatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelectDate={selectedDate => setDate(`${selectedDate} (Flexible VIP Departure)`)}
        title="Select Private Jet Flight Date"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAF9F6' },

  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.25)',
    backgroundColor: '#FAF9F6',
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerTitleBox: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerBrand: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1C1917',
    letterSpacing: 1.5,
  },
  headerTagline: {
    fontSize: 9,
    fontWeight: '700',
    color: '#D4AF37',
    letterSpacing: 1.2,
    marginTop: 2,
  },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    backgroundColor: '#FFFFFF',
  },
  logoImg: {
    width: '100%',
    height: '100%',
  },

  scroll: {
    padding: 18,
    gap: 16,
  },

  sectionHeaderRow: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1C1917',
    letterSpacing: 1.5,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },

  fleetScroll: {
    gap: 14,
    paddingVertical: 4,
  },
  fleetCard: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  fleetCardActive: {
    borderColor: '#D4AF37',
    backgroundColor: '#FFFFFF',
  },
  fleetImageBox: {
    height: 160,
    width: '100%',
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  fleetImage: {
    width: '100%',
    height: '100%',
  },
  fleetBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  fleetBadgeText: {
    color: '#1C1917',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  selectedCheckBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fleetInfo: {
    padding: 14,
    gap: 8,
  },
  fleetName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1917',
  },
  fleetCategory: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  fleetSpecsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  fleetFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(28, 25, 23, 0.08)',
  },
  fleetRate: {
    fontSize: 14,
    fontWeight: '900',
    color: '#D4AF37',
  },
  photoCountBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  photoCountBadgeText: {
    color: '#1C1917',
    fontSize: 10,
    fontWeight: '700',
  },
  detailsMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  detailsMiniBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1C1917',
  },
  selectBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FAF9F6',
  },
  selectBtnActive: {
    backgroundColor: '#D4AF37',
  },
  selectBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  selectBtnTextActive: {
    color: '#1C1917',
  },

  activeJetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  activeJetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  activeJetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1917',
  },
  activeJetRange: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '700',
    marginTop: 2,
  },
  activeRateBox: {
    backgroundColor: '#FAF9F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  activeRateText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#D4AF37',
  },
  activeJetDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  previewStripContainer: {
    marginVertical: 4,
    gap: 6,
  },
  previewStripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewStripTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1C1917',
  },
  previewStripSub: {
    fontSize: 10,
    color: '#64748B',
  },
  thumbScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  thumbBox: {
    width: 76,
    height: 52,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
  },
  viewSpecsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF9F6',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 4,
  },
  viewSpecsBtnTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1917',
  },
  viewSpecsBtnSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },

  tripTypeRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  tripTypeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  tripTypeBtnActive: {
    backgroundColor: '#D4AF37',
  },
  tripTypeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  tripTypeTextActive: {
    color: '#1C1917',
  },

  routeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  routeCol: {
    gap: 4,
  },
  routeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1.2,
  },
  routeInput: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1917',
    backgroundColor: '#FAF9F6',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(28, 25, 23, 0.12)',
  },
  routeArrowBox: {
    alignSelf: 'center',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FAF9F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },

  quickAirportsSection: {
    gap: 6,
  },
  quickAirportsTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1.2,
  },
  quickAirportsScroll: {
    gap: 8,
  },
  airportChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  airportChipCode: {
    fontSize: 12,
    fontWeight: '900',
    color: '#D4AF37',
  },
  airportChipCity: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1C1917',
  },

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  formLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
  },
  formInput: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1917',
    marginTop: 4,
    padding: 0,
  },
  formSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  formDivider: {
    height: 1,
    backgroundColor: 'rgba(28, 25, 23, 0.08)',
    marginHorizontal: 16,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  counterBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FAF9F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  counterBtnText: {
    color: '#1C1917',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  counterValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1C1917',
    minWidth: 20,
    textAlign: 'center',
  },

  inclusionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inclusionsTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1C1917',
    letterSpacing: 1.2,
  },
  inclusionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(28, 25, 23, 0.06)',
    gap: 10,
  },
  inclusionRowActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  inclusionCheck: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#64748B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inclusionCheckActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  inclusionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  inclusionTitleActive: {
    color: '#1C1917',
  },
  inclusionDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },

  submitBtn: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
    marginTop: 6,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  submitText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1C1917',
    letterSpacing: 1.5,
  },
});
