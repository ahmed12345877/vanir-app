import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ChevronLeft,
  Bookmark,
  Search,
  Calendar,
  Bell,
  Star,
  ArrowRight,
  Filter,
  Check,
  MapPin,
  SlidersHorizontal,
} from 'lucide-react-native';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CATEGORIES = ['All', 'Hiking', 'Kayaking', 'Skiing', 'Climbing'];

interface MountainPackage {
  id: string;
  title: string;
  subtitle: string;
  dateBadge: string;
  image: string;
  price: string;
  rating: number;
}

const MOUNTAIN_PACKAGES: MountainPackage[] = [
  {
    id: 'mp-1',
    title: 'Trekking',
    subtitle: 'Tours + Hotel',
    dateBadge: '08 Jan',
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
    price: '$240',
    rating: 4.9,
  },
  {
    id: 'mp-2',
    title: 'Camping',
    subtitle: 'Tours + Hiking',
    dateBadge: '12 Jan',
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
    price: '$310',
    rating: 4.95,
  },
  {
    id: 'mp-3',
    title: 'Adventure',
    subtitle: 'Extreme Alpinism',
    dateBadge: '18 Jan',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    price: '$450',
    rating: 4.98,
  },
];

interface RecommendationItem {
  id: string;
  country: string;
  flag: string;
  title: string;
  rating: number;
  reviews: number;
  image: string;
  dates: string[];
  price: string;
}

const RECOMMENDATIONS: RecommendationItem[] = [
  {
    id: 'rec-1',
    country: 'BELGIUM',
    flag: '🇧🇪',
    title: 'The Sound Of Nature',
    rating: 4.92,
    reviews: 140,
    image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&q=80',
    dates: ['27/03 - 7/04', '7/04 - 17/04', '17/04 - 28/04'],
    price: '$686',
  },
  {
    id: 'rec-2',
    country: 'UZBEKISTAN',
    flag: '🇺🇿',
    title: 'Silk Road Oasis & Heritage',
    rating: 4.88,
    reviews: 95,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
    dates: ['05/05 - 15/05', '20/05 - 30/05'],
    price: '$590',
  },
  {
    id: 'rec-3',
    country: 'SWITZERLAND',
    flag: '🇨🇭',
    title: 'Matterhorn Alpine Glacier Expedition',
    rating: 4.98,
    reviews: 210,
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&q=80',
    dates: ['10/06 - 20/06', '22/06 - 02/07'],
    price: '$890',
  },
];

export function TravelPlanScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const [selectedCategory, setSelectedCategory] = useState('Hiking');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDates, setSelectedDates] = useState<{ [id: string]: string }>({
    'rec-1': '27/03 - 7/04',
    'rec-2': '05/05 - 15/05',
    'rec-3': '10/06 - 20/06',
  });

  const handleBookPackage = (pkg: MountainPackage) => {
    navigation.navigate('FlightDetails', {
      origin: 'New York (JFK)',
      originCode: 'JFK',
      destination: pkg.title === 'Trekking' ? 'Geneva (GVA)' : 'Zurich (ZRH)',
      destinationCode: pkg.title === 'Trekking' ? 'GVA' : 'ZRH',
      departureTime: '10:30 PM',
      arrivalTime: '02:00 AM',
      duration: '5h 30m',
      pricePerPerson: 312,
      passengers: 2,
    });
  };

  const handleSelectRecommendation = (rec: RecommendationItem) => {
    navigation.navigate('FlightDetails', {
      origin: 'John F. Kennedy',
      originCode: 'JFK',
      destination: rec.country === 'BELGIUM' ? 'Brussels (BRU)' : 'Tashkent (TAS)',
      destinationCode: rec.country === 'BELGIUM' ? 'BRU' : 'TAS',
      departureTime: '10:30 PM',
      arrivalTime: '02:00 AM',
      duration: '5h 30m',
      pricePerPerson: 312,
      passengers: 2,
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

      {/* Header (Screenshot 2 Top) */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.topBtnPressed]}
          onPress={() => navigation.goBack()}
          hitSlop={12}
        >
          <ChevronLeft color="#1C1917" size={22} strokeWidth={2.4} />
        </Pressable>

        <Text style={styles.headerTitle}>Travel Plan</Text>

        <View style={styles.headerActions}>
          <Pressable
            style={({ pressed }) => [
              styles.iconBtn,
              isBookmarked && styles.iconBtnActive,
              pressed && styles.topBtnPressed,
            ]}
            onPress={() => {
              setIsBookmarked(!isBookmarked);
              Alert.alert(
                !isBookmarked ? 'Saved to Bookmarks' : 'Removed from Bookmarks',
                !isBookmarked
                  ? 'Travel plan has been added to your favorites.'
                  : 'Travel plan removed from favorites.'
              );
            }}
            hitSlop={8}
          >
            <Bookmark
              color={isBookmarked ? '#D4AF37' : '#1C1917'}
              size={18}
              fill={isBookmarked ? '#D4AF37' : 'none'}
            />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.iconBtn, pressed && styles.topBtnPressed]}
            onPress={() => setShowSearch(!showSearch)}
            hitSlop={8}
          >
            <Search color="#1C1917" size={18} />
          </Pressable>
        </View>
      </View>

      {/* Expandable Search Input */}
      {showSearch && (
        <View style={styles.searchBarContainer}>
          <Search color="#D4AF37" size={18} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search destination, tour or package..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 + insets.bottom }]}
      >
        {/* Mountain Packages Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Mountain Packages</Text>
          <Pressable
            style={styles.filterChipBtn}
            onPress={() =>
              Alert.alert(
                'Filter & Sort',
                'Select filter options: Price low to high, Duration, or High altitude preference.'
              )
            }
          >
            <SlidersHorizontal color="#1C1917" size={16} />
            <Text style={styles.filterChipText}>Filter</Text>
          </Pressable>
        </View>

        {/* Category Pills Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map(cat => (
            <Pressable
              key={cat}
              style={[
                styles.categoryPill,
                selectedCategory === cat && styles.categoryPillActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryPillText,
                  selectedCategory === cat && styles.categoryPillTextActive,
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Horizontal Mountain Package Cards (Screenshot 2 Cards) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.packagesScroll}
        >
          {MOUNTAIN_PACKAGES.map(pkg => (
            <View key={pkg.id} style={styles.packageCard}>
              {/* Date Badge Top Right */}
              <View style={styles.dateBadge}>
                <Calendar color="#D4AF37" size={14} />
                <Text style={styles.dateBadgeText}>{pkg.dateBadge}</Text>
              </View>

              {/* Title & Subtitle */}
              <View style={styles.packageHeaderBox}>
                <Text style={styles.packageTitle}>{pkg.title}</Text>
                <Text style={styles.packageSubtitle}>{pkg.subtitle}</Text>
              </View>

              {/* Package Image */}
              <Image
                source={{ uri: pkg.image }}
                style={styles.packageImage}
                resizeMode="cover"
              />

              {/* Rating and Price */}
              <View style={styles.packageBottomRow}>
                <View style={styles.ratingBadge}>
                  <Star color="#F59E0B" size={14} fill="#F59E0B" />
                  <Text style={styles.ratingText}>{pkg.rating}</Text>
                </View>

                <Text style={styles.packagePriceText}>{pkg.price}</Text>
              </View>

              {/* Action Button: Book Now */}
              <Pressable
                style={({ pressed }) => [styles.bookNowBtn, pressed && styles.btnPressed]}
                onPress={() => handleBookPackage(pkg)}
              >
                <Text style={styles.bookNowBtnText}>Book Now</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>

        {/* Most Popular Recommendation Section Header (Screenshot 2 Lower) */}
        <View style={styles.recommendationHeaderRow}>
          <Text style={styles.sectionTitle}>Most Popular Recommendation</Text>
          <Pressable
            style={({ pressed }) => [styles.bellIconBtn, pressed && styles.topBtnPressed]}
            onPress={() =>
              Alert.alert('Notifications', 'You will receive price drop alerts for popular routes.')
            }
          >
            <Bell color="#1C1917" size={18} />
          </Pressable>
        </View>

        {/* Recommendation Cards List */}
        {RECOMMENDATIONS.map(rec => (
          <View key={rec.id} style={styles.recommendationCard}>
            {/* Top Image Banner with Overlay */}
            <View style={styles.recImageContainer}>
              <Image
                source={{ uri: rec.image }}
                style={styles.recImage}
                resizeMode="cover"
              />
              <View style={styles.recCountryBadge}>
                <Text style={styles.recCountryText}>
                  {rec.flag}  {rec.country}
                </Text>
              </View>
            </View>

            {/* Recommendation Content */}
            <View style={styles.recBody}>
              <View style={styles.recTitleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recTitle}>{rec.title}</Text>
                  <View style={styles.recMetaRow}>
                    <Star color="#F59E0B" size={14} fill="#F59E0B" />
                    <Text style={styles.recRating}>{rec.rating}</Text>
                    <Text style={styles.recReviews}>({rec.reviews} reviews)</Text>
                  </View>
                </View>

                {/* Arrow Button to initiate booking */}
                <Pressable
                  style={({ pressed }) => [styles.recArrowBtn, pressed && styles.btnPressed]}
                  onPress={() => handleSelectRecommendation(rec)}
                >
                  <ArrowRight color="#1C1917" size={18} strokeWidth={2.5} />
                </Pressable>
              </View>

              {/* Selectable Date Pills */}
              <View style={styles.datesRow}>
                {rec.dates.map(date => {
                  const isSelected = selectedDates[rec.id] === date;
                  return (
                    <Pressable
                      key={date}
                      style={[styles.datePill, isSelected && styles.datePillSelected]}
                      onPress={() =>
                        setSelectedDates(prev => ({ ...prev, [rec.id]: date }))
                      }
                    >
                      <Calendar
                        color={isSelected ? '#1C1917' : '#D4AF37'}
                        size={12}
                      />
                      <Text
                        style={[
                          styles.datePillText,
                          isSelected && styles.datePillTextSelected,
                        ]}
                      >
                        {date}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
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
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  iconBtnActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderColor: '#D4AF37',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    height: 46,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1C1917',
    fontWeight: '500',
  },
  scrollContent: {
    paddingTop: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.5,
  },
  filterChipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1C1917',
  },
  categoryScroll: {
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  categoryPill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  categoryPillActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  categoryPillTextActive: {
    color: '#1C1917',
    fontWeight: '800',
  },
  packagesScroll: {
    paddingHorizontal: 20,
    gap: 14,
    paddingBottom: 16,
  },
  packageCard: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 8,
  },
  dateBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D4AF37',
  },
  packageHeaderBox: {
    marginBottom: 10,
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1917',
  },
  packageSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  packageImage: {
    width: '100%',
    height: 110,
    borderRadius: 16,
    marginBottom: 10,
  },
  packageBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1917',
  },
  packagePriceText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#D4AF37',
  },
  bookNowBtn: {
    backgroundColor: '#D4AF37',
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookNowBtnText: {
    color: '#1C1917',
    fontSize: 13,
    fontWeight: '800',
  },
  recommendationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 14,
  },
  bellIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  recommendationCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  recImageContainer: {
    width: '100%',
    height: 140,
    position: 'relative',
    backgroundColor: '#FAF9F6',
  },
  recImage: {
    width: '100%',
    height: '100%',
  },
  recCountryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  recCountryText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.5,
  },
  recBody: {
    padding: 16,
  },
  recTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  recTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1917',
  },
  recMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  recRating: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1917',
  },
  recReviews: {
    fontSize: 12,
    color: '#64748B',
  },
  recArrowBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4AF37',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  datesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  datePillSelected: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  datePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  datePillTextSelected: {
    color: '#1C1917',
    fontWeight: '800',
  },
  btnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
});
