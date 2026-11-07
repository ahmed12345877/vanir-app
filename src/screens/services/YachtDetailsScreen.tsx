import React, { useState, useMemo, useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Eye,
  MapPin,
  Star,
  Anchor,
  Users,
  Ruler,
  Compass,
  Check,
  Waves,
  Sparkles,
  Utensils,
  Wine,
  ShieldCheck,
  Wifi,
  LifeBuoy,
  Calendar,
} from 'lucide-react-native';
import { useCatalogStore } from '../../context/CatalogStore';
import { VipDatePickerModal } from '../../components/VipDatePickerModal';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function getFutureYmd(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const PHOTO_LABELS = [
  'Main Deck & Ocean Vista',
  'Royal Master Stateroom',
  'Panoramic Sky Lounge',
  'Beach Club & Sun Deck',
];

const DEFAULT_FALLBACK_PHOTOS = [
  'https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?w=1200&q=85',
  'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1200&q=85',
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=85',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=85',
];

const YACHT_AMENITIES = [
  { id: '1', label: 'Jacuzzi on Deck', icon: Waves, color: '#D4AF37', bg: 'rgba(212, 175, 55, 0.15)' },
  { id: '2', label: 'Helipad Access', icon: Compass, color: '#D4AF37', bg: 'rgba(212, 175, 55, 0.15)' },
  { id: '3', label: 'Private Executive Chef', icon: Utensils, color: '#EA580C', bg: '#FFEDD5' },
  { id: '4', label: 'Champagne & Bar', icon: Wine, color: '#9333EA', bg: '#F3E8FF' },
  { id: '5', label: 'Jet Skis & Seabobs', icon: LifeBuoy, color: '#D4AF37', bg: 'rgba(212, 175, 55, 0.15)' },
  { id: '6', label: 'Satellite Wi-Fi', icon: Wifi, color: '#16A34A', bg: '#DCFCE7' },
  { id: '7', label: 'VIP Marine Security', icon: ShieldCheck, color: '#94A3B8', bg: 'rgba(255, 255, 255, 0.08)' },
];

const CHARTER_PACKAGES = [
  {
    id: 'c1',
    title: 'Sunset Champagne Cruise (4 Hours)',
    desc: 'Golden hour coastal cruising • Gourmet canapés • Open luxury bar',
    price: '$6,500',
    numericPrice: 6500,
    popular: true,
  },
  {
    id: 'c2',
    title: 'Full Day Island & Reef Charter (8 Hours)',
    desc: 'Private cove anchoring • Water sports • 4-course chef lunch',
    price: '$12,500',
    numericPrice: 12500,
    popular: false,
  },
  {
    id: 'c3',
    title: 'Weekend Royal Voyage (2 Days / 1 Night)',
    desc: 'Master suites overnight • 24/7 dedicated steward & captain crew',
    price: '$28,000',
    numericPrice: 28000,
    popular: false,
  },
];

export function YachtDetailsScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'YachtDetails'>>();
  const insets = useSafeAreaInsets();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState('c1');
  const [charterDate, setCharterDate] = useState(() => getFutureYmd(4));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [guestsCount, setGuestsCount] = useState(6);
  const { itemsByCategory } = useCatalogStore();
  const liveYachts = itemsByCategory.yachts ?? [];

  const foundYacht = useMemo(() => {
    return liveYachts.find(
      y =>
        (route.params?.yachtId && y.id === route.params.yachtId) ||
        (route.params?.yachtName && y.name === route.params.yachtName)
    );
  }, [liveYachts, route.params?.yachtId, route.params?.yachtName]);

  // Real-time Firestore document listener for instant updates from Admin
  const [liveDoc, setLiveDoc] = useState<any>(null);
  useEffect(() => {
    const targetId = route.params?.yachtId || foundYacht?.id;
    if (!targetId) return;
    try {
      const unsub = firestore().collection('yachts').doc(targetId).onSnapshot(
        docSnap => {
          if (docSnap && docSnap.exists()) {
            setLiveDoc(docSnap.data());
          }
        },
        () => {}
      );
      return () => unsub();
    } catch {}
  }, [route.params?.yachtId, foundYacht?.id]);

  const yachtName = liveDoc?.vesselName || liveDoc?.name || foundYacht?.name || route.params?.yachtName || 'Azure Empress Superyacht';
  const yachtLocation = liveDoc?.marinaLocation || liveDoc?.subtitle || foundYacht?.subtitle || route.params?.location || 'Dubai Marina & Arabian Gulf';
  const yachtPrice = typeof liveDoc?.dailyCharterRate === 'number'
    ? `$${Number(liveDoc.dailyCharterRate).toLocaleString('en-US')}`
    : typeof liveDoc?.dailyRate === 'number'
    ? `$${Number(liveDoc.dailyRate).toLocaleString('en-US')}`
    : (foundYacht?.price || route.params?.price || '$15,000');
  const yachtRating = typeof liveDoc?.rating === 'number' ? liveDoc.rating : (foundYacht?.rating || route.params?.rating || 4.98);
  const yachtLength = liveDoc?.lengthMeters ? `${liveDoc.lengthMeters}m Mega Yacht` : (foundYacht?.tag1 || route.params?.length || '50m / 164ft Mega Yacht');
  const yachtCrew = liveDoc?.crewSize ? `${liveDoc.crewSize} Dedicated Crew` : (route.params?.crew ? `${route.params.crew} Crew` : (foundYacht?.tag2 || '12 Dedicated Crew'));

  // Genuine Photos from Firestore (liveDoc) -> CatalogStore -> route.params -> Fallback
  const photosList = useMemo<string[]>(() => {
    // 1. Direct real-time Firestore document if available
    if (liveDoc?.images && Array.isArray(liveDoc.images) && liveDoc.images.length > 0) {
      const list = liveDoc.images.map((img: any) => (typeof img === 'string' ? img : img?.url)).filter(Boolean) as string[];
      if (list.length > 0) return list;
    }
    // 2. Found from live CatalogStore
    if (foundYacht?.images && foundYacht.images.length > 0) {
      return foundYacht.images;
    }
    // 3. Passed from route.params
    if (route.params?.images && route.params.images.length > 0) {
      return route.params.images;
    }
    if (route.params?.image) {
      return [route.params.image, ...DEFAULT_FALLBACK_PHOTOS.slice(1, 4)];
    }
    return DEFAULT_FALLBACK_PHOTOS;
  }, [liveDoc, foundYacht, route.params?.images, route.params?.image]);

  const activePhoto = photosList[selectedPhotoIndex] ?? photosList[0];

  const descriptionText = useMemo(() => {
    if (liveDoc?.description && liveDoc.description.length > 20) {
      return liveDoc.description;
    }
    if (foundYacht?.description && foundYacht.description.length > 20) {
      return foundYacht.description;
    }
    if (route.params?.description && route.params.description.length > 20) {
      return route.params.description;
    }
    return 'Experience absolute oceanic freedom aboard this custom-built luxury superyacht. Features expansive teak decks, Jacuzzi plunge pool, master suites with panoramic sea horizons, Michelin-trained executive chef, and an elite marine crew attending to your every wish.';
  }, [liveDoc, foundYacht, route.params?.description]);

  const handleBookNow = () => {
    const chosen = CHARTER_PACKAGES.find(p => p.id === selectedPackage);
    const parsedFallback = parseFloat(String(yachtPrice).replace(/[^0-9.]/g, '')) || 15000;
    const finalNumericPrice = chosen?.numericPrice ?? parsedFallback;

    navigation.navigate('Booking', {
      type: 'yacht',
      bookingType: 'yacht',
      visaDocType: 'yacht',
      id: route.params?.yachtId ?? foundYacht?.id ?? 'yacht-vip',
      itemName: `${yachtName} - ${chosen?.title ?? 'Private Charter'}`,
      price: finalNumericPrice,
      startDate: charterDate,
      endDate: charterDate,
      guestsCount,
      destination: yachtLocation,
    } as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 + insets.bottom }}>
        {/* Top Hero Image Area */}
        <View style={styles.heroWrapper}>
          <Image source={{ uri: activePhoto }} style={styles.heroImage} resizeMode="cover" />

          {/* Top Floating Controls */}
          <View style={[styles.heroHeader, { paddingTop: Math.max(insets.top, 16) }]}>
            <Pressable
              style={({ pressed }) => [
                styles.circleBtn,
                pressed && styles.topBtnPressed,
              ]}
              onPress={() => navigation.goBack()}
            >
              <ChevronLeft color="#1C1917" size={22} strokeWidth={2.5} />
            </Pressable>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Image
                source={require('../../assets/vanir_round_logo.png')}
                style={{ width: 30, height: 30, borderRadius: 15 }}
                resizeMode="contain"
              />
              <View style={styles.pillBadge}>
                <Text style={styles.pillBadgeText}>Superyacht VIP</Text>
              </View>
            </View>

            <Pressable
              style={styles.circleBtn}
              onPress={() => setIsFavorite(prev => !prev)}
            >
              <Heart
                color="#EF4444"
                fill={isFavorite ? '#EF4444' : 'transparent'}
                size={20}
                strokeWidth={2}
              />
            </Pressable>
          </View>

          {/* Floating Left and Right Navigation Arrows */}
          {photosList.length > 1 && (
            <>
              <Pressable
                style={styles.heroArrowLeft}
                onPress={() => setSelectedPhotoIndex(prev => (prev === 0 ? photosList.length - 1 : prev - 1))}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityLabel="Previous Yacht Photo"
              >
                <ChevronLeft color="#1C1917" size={20} strokeWidth={2.6} />
              </Pressable>

              <Pressable
                style={styles.heroArrowRight}
                onPress={() => setSelectedPhotoIndex(prev => (prev + 1) % photosList.length)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityLabel="Next Yacht Photo"
              >
                <ChevronRight color="#1C1917" size={20} strokeWidth={2.6} />
              </Pressable>
            </>
          )}

          {/* Tap to view / Active photo label badge (Clean, zero numbers over photo) */}
          <Pressable
            style={styles.tapBadge}
            onPress={() => setSelectedPhotoIndex(prev => (prev + 1) % photosList.length)}
          >
            <Eye color="#FFFFFF" size={14} strokeWidth={2} />
            <Text style={styles.tapBadgeText}>
              {PHOTO_LABELS[selectedPhotoIndex] ?? 'Superyacht Showcase'}
            </Text>
          </Pressable>

          {/* Authentic Photo Thumbnails Row */}
          <View style={styles.thumbnailsRow}>
            {photosList.map((photoUrl, idx) => {
              const isSelected = selectedPhotoIndex === idx;
              return (
                <Pressable
                  key={idx}
                  onPress={() => setSelectedPhotoIndex(idx)}
                  style={[styles.thumbnail, isSelected && styles.thumbnailActive]}
                >
                  <Image source={{ uri: photoUrl }} style={styles.thumbnailImg} resizeMode="cover" />
                  {isSelected && (
                    <View style={styles.activeCheck}>
                      <Check color="#FFFFFF" size={10} strokeWidth={3} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Content Sheet */}
        <View style={styles.content}>
          {/* Title and Price */}
          <View style={styles.titlePriceRow}>
            <View style={styles.titleCol}>
              <Text style={styles.yachtTitle}>{yachtName}</Text>
              <Pressable
                style={styles.locationRow}
                onPress={() => navigation.navigate('Discover')}
              >
                <MapPin color="#D4AF37" size={15} strokeWidth={2} />
                <Text style={styles.locationText}>{yachtLocation}</Text>
              </Pressable>
            </View>

            <View style={styles.priceCol}>
              <Text style={styles.priceValue}>
                {yachtPrice}<Text style={styles.priceUnit}>/day</Text>
              </Text>
              <View style={styles.luxuryRatingRow}>
                <Star color="#D4AF37" fill="#D4AF37" size={13} strokeWidth={1.8} />
                <Text style={styles.luxuryRatingScore}>{typeof yachtRating === 'number' ? yachtRating.toFixed(1) : yachtRating}</Text>
                <Text style={styles.luxuryRatingDivider}>•</Text>
                <Text style={styles.luxuryRatingLabel}>VERIFIED CHARTER</Text>
              </View>
            </View>
          </View>

          {/* Key Marine Specs Bar */}
          <View style={styles.specsBar}>
            <View style={styles.specItem}>
              <Ruler color="#C9A84C" size={18} />
              <Text style={styles.specValue}>{yachtLength}</Text>
              <Text style={styles.specLabel}>Vessel Size</Text>
            </View>
            <View style={styles.specDivider} />
            <View style={styles.specItem}>
              <Users color="#C9A84C" size={18} />
              <Text style={styles.specValue}>12 Guests</Text>
              <Text style={styles.specLabel}>Capacity</Text>
            </View>
            <View style={styles.specDivider} />
            <View style={styles.specItem}>
              <Anchor color="#C9A84C" size={18} />
              <Text style={styles.specValue}>{yachtCrew}</Text>
              <Text style={styles.specLabel}>VIP Crew</Text>
            </View>
          </View>

          {/* Description Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vessel Highlights & Experience</Text>
            <Text style={styles.descriptionText}>{descriptionText}</Text>
          </View>

          {/* Amenities Grid */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Exclusive Onboard Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {YACHT_AMENITIES.map(amenity => {
                const IconComponent = amenity.icon;
                return (
                  <View key={amenity.id} style={styles.amenityChip}>
                    <View style={[styles.amenityIconBox, { backgroundColor: amenity.bg }]}>
                      <IconComponent color={amenity.color} size={16} strokeWidth={2} />
                    </View>
                    <Text style={styles.amenityLabel}>{amenity.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Charter Schedule & VIP Guests */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Charter Date & Guests</Text>
            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                padding: 14,
                borderWidth: 1,
                borderColor: 'rgba(212, 175, 55, 0.3)',
                gap: 12,
                marginTop: 8,
              }}
            >
              <Pressable
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#FAF9F6',
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderWidth: 1,
                  borderColor: 'rgba(212, 175, 55, 0.3)',
                }}
                onPress={() => setShowDatePicker(true)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Calendar color="#D4AF37" size={16} strokeWidth={2} />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#1C1917' }}>
                    Voyage Date
                  </Text>
                </View>
                <Text style={{ fontSize: 13.5, fontWeight: '800', color: '#D4AF37' }}>
                  {charterDate}
                </Text>
              </Pressable>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Users color="#D4AF37" size={16} strokeWidth={2} />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#1C1917' }}>
                    Onboard VIP Guests
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Pressable
                    style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#FAF9F6', borderWidth: 1, borderColor: '#D4AF37', alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => setGuestsCount(g => Math.max(1, g - 1))}
                  >
                    <Text style={{ fontSize: 16, fontWeight: '800', color: '#1C1917' }}>−</Text>
                  </Pressable>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: '#1C1917', minWidth: 18, textAlign: 'center' }}>
                    {guestsCount}
                  </Text>
                  <Pressable
                    style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#FAF9F6', borderWidth: 1, borderColor: '#D4AF37', alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => setGuestsCount(g => Math.min(12, g + 1))}
                  >
                    <Text style={{ fontSize: 16, fontWeight: '800', color: '#1C1917' }}>+</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>

          {/* Charter Package Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Charter Package</Text>
            <Text style={styles.sectionSubtitle}>Tailored luxury cruise itineraries with full crew and catering</Text>

            <View style={{ gap: 12, marginTop: 12 }}>
              {CHARTER_PACKAGES.map(pkg => {
                const isChosen = selectedPackage === pkg.id;
                return (
                  <Pressable
                    key={pkg.id}
                    onPress={() => setSelectedPackage(pkg.id)}
                    style={[styles.packageCard, isChosen && styles.packageCardSelected]}
                  >
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={[styles.packageTitle, isChosen && styles.packageTitleSelected]}>
                          {pkg.title}
                        </Text>
                        {pkg.popular && (
                          <View style={styles.popularBadge}>
                            <Text style={styles.popularBadgeText}>TOP PICK</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.packageDesc}>{pkg.desc}</Text>
                    </View>

                    <View style={{ alignItems: 'flex-end', marginLeft: 10 }}>
                      <Text style={[styles.packagePrice, isChosen && styles.packagePriceSelected]}>
                        {pkg.price}
                      </Text>
                      <View style={[styles.radioCircle, isChosen && styles.radioCircleSelected]}>
                        {isChosen && <View style={styles.radioInner} />}
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.bottomPriceCol}>
          <Text style={styles.bottomPriceLabel}>Charter Rate</Text>
          <Text style={styles.bottomPriceValue}>
            {CHARTER_PACKAGES.find(p => p.id === selectedPackage)?.price ?? yachtPrice}
          </Text>
        </View>

        <Pressable style={styles.reserveBtn} onPress={handleBookNow}>
          <Anchor color="#1C1917" size={18} strokeWidth={2.5} />
          <Text style={styles.reserveBtnText}>Reserve Superyacht</Text>
        </Pressable>
      </View>

      <VipDatePickerModal
        visible={showDatePicker}
        initialDate={charterDate}
        title="Select Superyacht Charter Date"
        onClose={() => setShowDatePicker(false)}
        onSelectDate={setCharterDate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  heroWrapper: {
    position: 'relative',
    width: '100%',
    height: 380,
    backgroundColor: '#FAF9F6',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  circleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  topBtnPressed: {
    backgroundColor: 'rgba(212, 175, 55, 0.22)',
    borderColor: '#D4AF37',
  },
  pillBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.5)',
  },
  pillBadgeText: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tapBadge: {
    position: 'absolute',
    bottom: 74,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(28, 25, 23, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  tapBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  heroArrowLeft: {
    position: 'absolute',
    left: 14,
    top: '46%',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
    zIndex: 20,
  },
  heroArrowRight: {
    position: 'absolute',
    right: 14,
    top: '46%',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
    zIndex: 20,
  },
  thumbnailsRow: {
    position: 'absolute',
    bottom: 12,
    left: 20,
    right: 20,
    flexDirection: 'row',
    gap: 10,
  },
  thumbnail: {
    flex: 1,
    height: 52,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  thumbnailActive: {
    borderColor: '#D4AF37',
    transform: [{ scale: 1.05 }],
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
  },
  activeCheck: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: '#FAF9F6',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    paddingHorizontal: 20,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.25)',
  },
  titlePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(28, 25, 23, 0.08)',
  },
  titleCol: {
    flex: 1,
    marginRight: 12,
  },
  yachtTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: -0.3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  locationText: {
    color: '#64748B',
    fontSize: 13,
  },
  priceCol: {
    alignItems: 'flex-end',
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#D4AF37',
  },
  priceUnit: {
    fontSize: 12,
    fontWeight: '400',
    color: '#64748B',
  },
  luxuryRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },
  luxuryRatingScore: {
    color: '#D4AF37',
    fontWeight: '800',
    fontSize: 12.5,
  },
  luxuryRatingDivider: {
    color: 'rgba(28, 25, 23, 0.2)',
    fontSize: 12,
  },
  luxuryRatingLabel: {
    color: '#D4AF37',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  specsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginVertical: 18,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  specItem: {
    alignItems: 'center',
    flex: 1,
  },
  specValue: {
    color: '#1C1917',
    fontWeight: '700',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  specLabel: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  specDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(28, 25, 23, 0.08)',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1917',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 22,
    color: '#334155',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  amenityIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amenityLabel: {
    color: '#1C1917',
    fontSize: 12,
    fontWeight: '600',
  },
  packageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderRadius: 16,
    padding: 14,
  },
  packageCardSelected: {
    borderColor: '#D4AF37',
    backgroundColor: '#FFFDF9',
  },
  packageTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1917',
  },
  packageTitleSelected: {
    color: '#D4AF37',
  },
  popularBadge: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  popularBadgeText: {
    color: '#1C1917',
    fontSize: 9,
    fontWeight: '800',
  },
  packageDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 16,
  },
  packagePrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1917',
    marginBottom: 6,
  },
  packagePriceSelected: {
    color: '#D4AF37',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: 'rgba(28, 25, 23, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#D4AF37',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D4AF37',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.25)',
    paddingHorizontal: 20,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomPriceCol: {
    flex: 1,
  },
  bottomPriceLabel: {
    fontSize: 11,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bottomPriceValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#D4AF37',
  },
  reserveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#D4AF37',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  reserveBtnText: {
    color: '#1C1917',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
