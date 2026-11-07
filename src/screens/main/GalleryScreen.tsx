import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, Sparkles, Camera } from 'lucide-react-native';
import { EditorialFleetGallery } from '../../components/EditorialFleetGallery';
import { LuxuryPressable } from '../../components/LuxuryMicroInteractions';
import { getLiveGallery, subscribeLiveGallery, type LiveGalleryItem } from '../../services/firestore';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type GalleryRouteProp = RouteProp<RootStackParamList, 'Gallery'>;

// Defensive normalization helpers to ensure 100% fluent luxury English everywhere
function normalizeGalleryCategory(cat?: string): string {
  if (!cat) return 'Private Aviation';
  const c = cat.trim();
  if (c.includes('مرفوع') || c.includes('جهاز') || c.includes('نخبة') || c.toLowerCase().includes('upload')) return 'VIP Signature Collection';
  if (c.includes('فنادق') || c.includes('أجنحة') || c.toLowerCase().includes('hotel')) return 'Luxury Hotels';
  if (c.includes('ليموزين') || c.includes('سيارات') || c.toLowerCase().includes('fleet') || c.toLowerCase().includes('car')) return 'Executive Fleet';
  if (c.includes('طيران') || c.toLowerCase().includes('jet') || c.toLowerCase().includes('aviation')) return 'Private Aviation';
  if (c.includes('يخوت') || c.toLowerCase().includes('yacht')) return 'Superyachts';
  if (c.includes('وجهات') || c.toLowerCase().includes('destination')) return 'Exotic Destinations';
  return cat;
}

function normalizeGalleryTitle(title?: string): string {
  if (!title) return 'Vanir VIP Signature Showcase';
  const t = title.trim();
  if (t.includes('مالديف') || t.includes('فيلات')) return 'Maldives Overwater Private Villas & Lagoon Sanctuary';
  if (t.includes('رولز') || t.includes('فانتوم') || t.includes('أسطول')) return 'Rolls-Royce Phantom VIII Executive Chauffeur Fleet';
  if (t.includes('جولف') || t.includes('G650') || t.includes('بومباردييه') || t.includes('طائرة')) return 'Bombardier Global 7500 VIP Transcontinental Flagship';
  if (t.includes('يخت') || t.includes('ماجستي')) return 'Majesty 120 Superyacht Private Charter Escapade';
  if (t.includes('منصور') || t.includes('مراكش') || t.includes('فندق')) return 'Royal Mansour Marrakech Palace & Private Courtyards';
  if (t.includes('أهرامات') || t.includes('غروب')) return 'Giza Royal Pyramids Exclusive Sunset Panorama';
  if (t.includes('دبي') || t.includes('مارينا')) return 'Burj Al Arab & Dubai Royal Marina Panoramic Suites';
  return title;
}

// Curated 12 VIP Editorial Assets (Alternating showcase heroes and interior details)
const CURATED_GALLERY: LiveGalleryItem[] = [
  {
    id: 'g1',
    title: 'Bombardier Global 7500 VIP Transcontinental Flagship',
    category: 'Private Aviation',
    url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=85',
  },
  {
    id: 'g2',
    title: 'Global 7500 Master Stateroom & Executive En-Suite',
    category: 'Private Aviation',
    url: 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=1200&q=85',
  },
  {
    id: 'g3',
    title: 'Gulfstream G650ER Intercontinental Stateroom Interior',
    category: 'Private Aviation',
    url: 'https://images.unsplash.com/photo-1517404215738-15263e9f9178?w=1200&q=85',
  },
  {
    id: 'g4',
    title: 'Majesty 120 Superyacht Ocean Charter Escapade',
    category: 'Superyachts',
    url: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?w=1200&q=85',
  },
  {
    id: 'g5',
    title: 'Majesty 120 Sun Deck Jacuzzi & Azure Horizon Bar',
    category: 'Superyachts',
    url: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1200&q=85',
  },
  {
    id: 'g6',
    title: 'Superyacht Panoramic Master Saloon & Fine Dining',
    category: 'Superyachts',
    url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=85',
  },
  {
    id: 'g7',
    title: 'Rolls-Royce Phantom VIII Extended Chauffeur Limousine',
    category: 'Executive Fleet',
    url: 'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=1200&q=85',
  },
  {
    id: 'g7-range',
    title: 'Range Rover Autobiography VIP Chauffeur Fleet',
    category: 'Executive Fleet',
    url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200&q=85',
  },
  {
    id: 'g8',
    title: 'Phantom Starlight Headliner & Champagne Console',
    category: 'Executive Fleet',
    url: 'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=1200&q=85',
  },
  {
    id: 'g9-amg',
    title: 'Mercedes-AMG GT 63 S 4-Door Coupe High-Speed Fleet',
    category: 'Executive Fleet',
    url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1200&q=85',
  },
  {
    id: 'g9',
    title: 'Mercedes-Maybach S680 First-Class Executive Cabin',
    category: 'Executive Fleet',
    url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=85',
  },
  {
    id: 'g10',
    title: 'Maldives Overwater Presidential Lagoon Sanctuary',
    category: 'Luxury Hotels',
    url: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200&q=85',
  },
  {
    id: 'g11',
    title: 'The Nile Ritz-Carlton Royal Riverfront Master Suite',
    category: 'Luxury Hotels',
    url: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=1200&q=85',
  },
  {
    id: 'g12',
    title: 'Burj Al Arab & Dubai Royal Marina Panoramic Suites',
    category: 'Luxury Hotels',
    url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=85',
  },
];

const STANDARD_CATEGORIES = [
  'All',
  'Private Aviation',
  'Superyachts',
  'Luxury Hotels',
  'Executive Fleet',
  'Exotic Destinations',
];

export function GalleryScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<GalleryRouteProp>();
  const [items, setItems] = useState<LiveGalleryItem[]>(CURATED_GALLERY);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    route.params?.initialCategory || 'All'
  );
  const [refreshing, setRefreshing] = useState(false);

  const processItems = (raw: LiveGalleryItem[]) => {
    if (!raw || raw.length === 0) return CURATED_GALLERY;
    return raw.map(i => ({
      ...i,
      category: normalizeGalleryCategory(i.category),
      title: normalizeGalleryTitle(i.title),
    }));
  };

  useEffect(() => {
    getLiveGallery().then(data => {
      if (data && data.length > 0) {
        setItems(processItems(data));
      }
    });

    const unsubscribe = subscribeLiveGallery(data => {
      if (data && data.length > 0) {
        setItems(processItems(data));
      }
    });

    return () => unsubscribe();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await getLiveGallery();
      if (data && data.length > 0) {
        setItems(processItems(data));
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleBookingRedirect = (item: LiveGalleryItem) => {
    const cat = (item.category || '').toLowerCase();
    if (cat.includes('aviation') || cat.includes('jet')) {
      navigation.navigate('PrivateJet');
    } else if (cat.includes('yacht')) {
      navigation.navigate('Yacht');
    } else if (cat.includes('hotel')) {
      navigation.navigate('HotelBooking');
    } else if (cat.includes('car') || cat.includes('fleet')) {
      navigation.navigate('Cars');
    } else {
      navigation.navigate('Tours');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

      {/* Luxury Cinematic Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.backBtn,
            pressed && styles.topBtnPressed,
          ]}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <ChevronLeft color="#1C1917" size={24} strokeWidth={2.2} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>VANIR VIP MEDIA ARCHIVE</Text>
          <Text style={styles.headerSubtitle}>Cinematic Fleet & Stateroom Showcase</Text>
        </View>

        <View style={styles.headerRight}>
          <Camera color="#D4AF37" size={18} strokeWidth={1.8} />
        </View>
      </View>

      {/* Editorial Fleet Gallery Component */}
      <EditorialFleetGallery
        items={items}
        categories={STANDARD_CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onBookPress={handleBookingRedirect}
        refreshing={refreshing}
        onRefresh={onRefresh}
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: '#FAF9F6',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  topBtnPressed: {
    backgroundColor: 'rgba(212, 175, 55, 0.22)',
    borderColor: '#D4AF37',
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  headerTitle: {
    color: '#1C1917',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.6,
  },
  headerSubtitle: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  headerRight: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
