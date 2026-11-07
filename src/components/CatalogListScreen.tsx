import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import {
  ChevronLeft,
  ArrowRight,
  Search,
  X,
  Star,
  MapPin,
  Sparkles,
  ShieldCheck,
  Building,
} from 'lucide-react-native';
import { borderRadius, spacing } from '../theme/spacing';
import type { RootStackParamList } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';
import { VipDetailDrawer, type VipDrawerItem } from './VipDetailDrawer';
import { formatWesternPrice } from '../utils/pricingUtils';
import { LuxuryPressable } from './LuxuryMicroInteractions';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export interface CatalogItem {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  images?: string[];
  tag1: string;
  tag2: string;
  price: string;
  pricePer: string;
  badge?: string;
  country?: string;
  description?: string;
  rating?: number;
}

interface CatalogListScreenProps {
  title: string;
  subtitle?: string;
  headerIcon: React.ReactElement;
  headerGradient: readonly [string, string, ...string[]];
  items: CatalogItem[];
  bookingType: string;
  layoutVariant?: 'bento' | 'fullbleed' | 'standard';
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  listHeaderComponent?: React.ReactElement | null;
  hideCountBadge?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchQuery?: string;
  onSearchChange?: (text: string) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function CatalogListScreen({
  title,
  subtitle,
  headerIcon,
  headerGradient,
  items,
  bookingType,
  layoutVariant,
  isLoading = false,
  errorMessage = null,
  onRetry,
  listHeaderComponent = null,
  hideCountBadge = false,
  showSearch = false,
  searchPlaceholder,
  searchQuery = '',
  onSearchChange,
  refreshing = false,
  onRefresh,
}: CatalogListScreenProps) {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedDrawerItem, setSelectedDrawerItem] = useState<VipDrawerItem | null>(null);

  const effectiveLayout: 'bento' | 'fullbleed' | 'standard' = 'fullbleed';

  const handleItemPress = useCallback((item: CatalogItem) => {
    if (bookingType === 'hotel') {
      navigation.navigate('HotelDetails', {
        hotelId: item.id,
        hotelName: item.name,
        location: item.subtitle,
        price: item.price,
        image: item.image,
        images: item.images && item.images.length > 0 ? item.images : [item.image],
        description: item.description,
        rating: item.rating,
        country: item.country,
      });
    } else if (bookingType === 'yacht') {
      navigation.navigate('YachtDetails', {
        yachtId: item.id,
        yachtName: item.name,
        location: item.subtitle,
        price: item.price,
        image: item.image,
        images: item.images && item.images.length > 0 ? item.images : [item.image],
        description: item.description,
        rating: item.rating,
        length: item.tag1,
      });
    } else if (bookingType === 'limousine' || bookingType === 'car') {
      navigation.navigate('CarDetails', {
        carId: item.id,
        carName: item.name,
        category: item.tag1,
        location: item.subtitle,
        price: item.price,
        image: item.image,
        images: item.images && item.images.length > 0 ? item.images : [item.image],
        description: item.description,
        rating: item.rating,
      });
    } else if (bookingType === 'private-jet' || bookingType === 'jet') {
      navigation.navigate('JetDetails', {
        jetId: item.id,
        jetName: item.name,
        category: item.tag1,
        range: item.tag2,
        price: item.price,
        image: item.image,
        images: item.images && item.images.length > 0 ? item.images : [item.image],
        description: item.description,
        rating: item.rating,
      });
    } else {
      navigation.navigate('Booking', {
        type: bookingType,
        id: item.id,
        itemName: item.name,
      });
    }
  }, [bookingType, navigation]);

  const handleOpenVipDrawer = useCallback((item: CatalogItem) => {
    const isHotel = bookingType === 'hotel';
    const fallbackPeriod = isHotel ? 'night' : bookingType === 'limousine' ? 'day' : 'experience';
    const { amount, period } = formatWesternPrice(item.price, fallbackPeriod as any);

    setSelectedDrawerItem({
      id: item.id,
      title: item.name,
      subtitle: item.subtitle,
      category: item.tag1,
      badge: item.badge || (isHotel ? 'VANIR FLAGSHIP PALACE' : 'VIP BESPOKE PRIVILEGE'),
      image: item.image,
      images: item.images,
      price: amount,
      pricePer: period,
      rating: item.rating || 5.0,
      specs: [
        { label: 'Classification', value: '5-Star Ultra Luxury' },
        { label: 'Location', value: item.tag1 || 'Prime District' },
        { label: 'Privilege', value: '24/7 Butler Service' },
        { label: 'Rating', value: `${item.rating ? item.rating.toFixed(2) : '5.00'} / 5.0` },
      ],
      privileges: [
        'Panoramic floor-to-ceiling vistas & private royal balconies',
        'Dedicated 24/7 private butler & white-glove concierge',
        'Complimentary private limousine airport transfers',
        'Priority reservations at signature Michelin & fine dining pavilions',
        item.description ? item.description.slice(0, 140) + '…' : 'Access to private heated pools and holistic spa suites',
      ],
      chauffeurOrButlerInfo: {
        role: isHotel ? 'Dedicated Head Concierge & Butler' : 'Security-Trained Private Chauffeur',
        detail: isHotel
          ? 'Personal butler assigned to your private suite for tailored packing, private dining curation, and confidential escort.'
          : 'Uniformed chauffeur ensuring seamless transfers with continuous flight tracking and VIP terminal escort.',
        badge: 'ROYAL ACCREDITED',
      },
      ctaText: isHotel ? 'Reserve Palace Suite' : 'Reserve VIP Experience',
    });
    setDrawerVisible(true);
  }, [bookingType]);

  const handleDrawerBook = useCallback((drawerItem: VipDrawerItem) => {
    const found = items.find(i => i.id === drawerItem.id);
    if (found) {
      handleItemPress(found);
    }
  }, [items, handleItemPress]);

  // Bento partition for hotels
  const heroItem = items[0];
  const secondaryItems = useMemo(() => items.slice(1), [items]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

      {/* Luxury Header */}
      <View style={styles.header}>
        <View style={styles.headerTopBar}>
          <Pressable
            style={({ pressed }) => [
              styles.backBtn,
              pressed && styles.topBtnPressed,
            ]}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Back"
          >
            <ChevronLeft color="#1C1917" size={20} strokeWidth={2.5} />
          </Pressable>
          <Image
            source={require('../assets/vanir_round_logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.headerContent}>
          <View style={styles.iconCircle}>{headerIcon}</View>
          <View style={styles.headerTextBlock}>
            <Text style={styles.headerTitle}>{title}</Text>
            {subtitle ? <Text style={styles.headerSub}>{subtitle}</Text> : null}
          </View>
        </View>

        {showSearch && onSearchChange && (
          <View style={styles.searchBarBox}>
            <Search color="#94A3B8" size={17} strokeWidth={2.2} />
            <TextInput
              style={styles.searchBarInput}
              placeholder={searchPlaceholder || 'Search curated options…'}
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={onSearchChange}
            />
            {searchQuery.length > 0 ? (
              <Pressable onPress={() => onSearchChange('')} hitSlop={10}>
                <X color="#94A3B8" size={16} />
              </Pressable>
            ) : null}
          </View>
        )}

        {!hideCountBadge && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{items.length} Curated Options</Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <View style={styles.stateBlock}>
          <ActivityIndicator color="#D4AF37" size="large" />
          <Text style={styles.stateText}>Loading curated options…</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.stateBlock}>
          <Text style={styles.stateText}>{errorMessage}</Text>
          <Pressable style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      ) : (effectiveLayout as string) === 'bento' && items.length > 0 ? (
        /* INTERACTIVE BENTO GRID LAYOUT */
        <FlatList
          data={[heroItem]}
          keyExtractor={item => item?.id || 'hero'}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: 110 + insets.bottom },
          ]}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#D4AF37"
                colors={['#D4AF37']}
              />
            ) : undefined
          }
          ListHeaderComponent={
            <>
              {listHeaderComponent}

              {/* 1. ASYMMETRICAL BENTO HERO CARD */}
              {heroItem && (() => {
                const { amount, period } = formatWesternPrice(heroItem.price, 'night');
                return (
                  <LuxuryPressable
                    style={styles.bentoHeroCard}
                    onPress={() => handleOpenVipDrawer(heroItem)}
                    scaleTo={0.985}
                  >
                    <View style={styles.cardImageContainer}>
                      <Image
                        source={{ uri: heroItem.image }}
                        style={styles.bentoHeroImage}
                        resizeMode="cover"
                      />

                      {/* Top Badges */}
                      <View style={styles.bentoHeroTopBadges}>
                        <View style={styles.heroBadge}>
                          <Sparkles color="#D4AF37" size={12} strokeWidth={2.4} />
                          <Text style={styles.heroBadgeText}>
                            {(heroItem.badge || 'VANIR FLAGSHIP PALACE').toUpperCase()}
                          </Text>
                        </View>

                        <View style={styles.ratingBadge}>
                          <Star color="#D4AF37" fill="#D4AF37" size={12} />
                          <Text style={styles.ratingText}>
                            {heroItem.rating ? heroItem.rating.toFixed(2) : '5.00'}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Bottom Information Panel */}
                    <View style={styles.bentoHeroPanel}>
                      <View style={styles.heroPanelContent}>
                        <View style={styles.heroLocationRow}>
                          <MapPin color="#D4AF37" size={13} strokeWidth={2} />
                          <Text style={styles.heroLocationText} numberOfLines={1}>
                            {heroItem.subtitle}
                          </Text>
                        </View>

                        <Text style={styles.heroHotelName} numberOfLines={1}>
                          {heroItem.name}
                        </Text>

                        {/* Micro Minimalist Specs */}
                        <View style={styles.microSpecsRow}>
                          <View style={styles.microSpecItem}>
                            <Sparkles color="#D4AF37" size={12} strokeWidth={2} />
                            <Text style={styles.microSpecText}>{heroItem.tag1 || '5-Star Luxury'}</Text>
                          </View>
                          <View style={styles.specDot} />
                          <View style={styles.microSpecItem}>
                            <ShieldCheck color="#D4AF37" size={12} strokeWidth={2} />
                            <Text style={styles.microSpecText}>{heroItem.tag2 || 'Butler Service'}</Text>
                          </View>
                        </View>

                        {/* Price & Action */}
                        <View style={styles.heroPriceActionRow}>
                          <View style={styles.priceBlock}>
                            <Text style={styles.priceValue}>{amount}</Text>
                            <Text style={styles.pricePeriod}>{period}</Text>
                          </View>

                          <View style={styles.explorePill}>
                            <Text style={styles.explorePillText}>VIP Drawer</Text>
                            <ArrowRight color="#1C1917" size={13} strokeWidth={2.6} />
                          </View>
                        </View>
                      </View>
                    </View>
                  </LuxuryPressable>
                );
              })()}

              {/* 2. BALANCED 2-COLUMN SIDE-BY-SIDE BENTO GRID */}
              {secondaryItems.length > 0 && (
                <View style={styles.secondaryGrid}>
                  {secondaryItems.map(item => {
                    const { amount, period } = formatWesternPrice(item.price, 'night');
                    return (
                      <LuxuryPressable
                        key={item.id}
                        style={styles.gridCard}
                        onPress={() => handleOpenVipDrawer(item)}
                        scaleTo={0.97}
                      >
                        <View style={styles.gridImageBox}>
                          <Image
                            source={{ uri: item.image }}
                            style={styles.gridImage}
                            resizeMode="cover"
                          />

                          <View style={styles.gridCityBadge}>
                            <Text style={styles.gridCityBadgeText}>
                              {(item.country || item.tag1 || 'SUITE').toUpperCase()}
                            </Text>
                          </View>

                          <View style={styles.gridRatingBadge}>
                            <Star color="#D4AF37" fill="#D4AF37" size={10} />
                            <Text style={styles.gridRatingText}>
                              {item.rating ? item.rating.toFixed(1) : '5.0'}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.gridBody}>
                          <Text style={styles.gridName} numberOfLines={2}>
                            {item.name}
                          </Text>

                          <View style={styles.gridSpecsRow}>
                            <Text style={styles.gridSpecsText} numberOfLines={1}>
                              {item.subtitle}
                            </Text>
                          </View>

                          <View style={styles.gridPriceRow}>
                            <Text style={styles.gridPriceVal}>{amount}</Text>
                            <Text style={styles.gridPricePeriod}>{period}</Text>
                          </View>
                        </View>
                      </LuxuryPressable>
                    );
                  })}
                </View>
              )}
            </>
          }
          renderItem={() => null}
        />
      ) : effectiveLayout === 'fullbleed' ? (
        /* FULL-BLEED IMMERSIVE CARDS */
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: 110 + insets.bottom },
          ]}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#D4AF37"
                colors={['#D4AF37']}
              />
            ) : undefined
          }
          ListHeaderComponent={listHeaderComponent}
          renderItem={({ item }) => {
            const isHotel = bookingType === 'hotel';
            const defaultPeriod = isHotel ? 'night' : bookingType === 'limousine' ? 'day' : 'day';
            const { amount, period } = formatWesternPrice(item.price, defaultPeriod as any);
            return (
              <LuxuryPressable
                style={styles.fullBleedCard}
                onPress={() => handleOpenVipDrawer(item)}
                scaleTo={0.985}
              >
                <View style={styles.cardImageContainer}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.fullBleedImage}
                    resizeMode="cover"
                  />

                  <View style={styles.bentoHeroTopBadges}>
                    <View style={styles.categoryBadge}>
                      <Sparkles color="#D4AF37" size={12} strokeWidth={1.5} />
                      <Text style={styles.categoryBadgeText}>
                        {(item.badge || item.tag1 || (isHotel ? 'VANIR PALACE' : 'VIP PORTFOLIO')).toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.frostedPanel}>
                  <View style={styles.heroPanelContent}>
                    {/* Location & Rating: "★ 4.96 • Cairo, Egypt" */}
                    <View style={styles.heroLocationRow}>
                      <Star color="#D4AF37" fill="#D4AF37" size={11} />
                      <Text style={styles.ratingValueText}>
                        {item.rating ? item.rating.toFixed(2) : '5.00'}
                      </Text>
                      <Text style={styles.metaDot}>•</Text>
                      <MapPin color="#D4AF37" size={12.5} strokeWidth={1.5} />
                      <Text style={styles.heroLocationText} numberOfLines={1}>
                        {item.subtitle || item.tag1 || 'Exclusive Vanir Portfolio'}
                      </Text>
                    </View>

                    <Text style={styles.fullBleedTitle} numberOfLines={1}>
                      {item.name}
                    </Text>

                    {/* Micro Minimalist Specs */}
                    <View style={styles.microSpecsRow}>
                      <View style={styles.microSpecItem}>
                        <Sparkles color="#D4AF37" size={12.5} strokeWidth={1.5} />
                        <Text style={styles.microSpecText}>{item.tag1 || '5-Star Luxury'}</Text>
                      </View>
                      <View style={styles.specDot} />
                      <View style={styles.microSpecItem}>
                        <ShieldCheck color="#D4AF37" size={12.5} strokeWidth={1.5} />
                        <Text style={styles.microSpecText}>{item.tag2 || 'Butler Service'}</Text>
                      </View>
                    </View>

                    <View style={styles.heroPriceActionRow}>
                      <View style={styles.priceBlock}>
                        <Text style={styles.priceValue}>{amount}</Text>
                        <Text style={styles.pricePeriod}>{period}</Text>
                      </View>

                      <View style={styles.explorePill}>
                        <Text style={styles.explorePillText}>VIP Drawer</Text>
                        <ArrowRight color="#1C1917" size={13} strokeWidth={2.6} />
                      </View>
                    </View>
                  </View>
                </View>
              </LuxuryPressable>
            );
          }}
        />
      ) : (
        /* STANDARD REFINED CARDS */
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: 110 + insets.bottom },
          ]}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#D4AF37"
                colors={['#D4AF37']}
              />
            ) : undefined
          }
          ListHeaderComponent={listHeaderComponent}
          renderItem={({ item }) => {
            const { amount, period } = formatWesternPrice(item.price, 'night');
            return (
              <Pressable
                style={styles.card}
                onPress={() => handleItemPress(item)}
              >
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(10,25,47,0.7)']}
                    style={styles.imageOverlay}
                  />
                  {item.badge && (
                    <View style={styles.badgeContainer}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  )}
                  <View style={styles.priceOverlay}>
                    <Text style={styles.priceText}>{amount}</Text>
                    <Text style={styles.pricePerText}>{period}</Text>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemSubtitle} numberOfLines={1}>
                    {item.subtitle}
                  </Text>
                  <View style={styles.tagsRow}>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>{item.tag1}</Text>
                    </View>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>{item.tag2}</Text>
                    </View>
                  </View>
                  <Pressable
                    style={styles.bookBtn}
                    onPress={() => handleItemPress(item)}
                  >
                    <LinearGradient
                      colors={['#D4AF37', '#B8860B']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.bookBtnGradient}
                    >
                      <Text style={styles.bookBtnText}>View Details & Book</Text>
                      <ArrowRight color="#1C1917" size={16} strokeWidth={2.5} />
                    </LinearGradient>
                  </Pressable>
                </View>
              </Pressable>
            );
          }}
        />
      )}

      {/* Expandable Animated VIP Drawer */}
      <VipDetailDrawer
        visible={drawerVisible}
        item={selectedDrawerItem}
        onClose={() => setDrawerVisible(false)}
        onBook={handleDrawerBook}
      />
    </SafeAreaView>
  );
}

function createStyles(themeColors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#FAF9F6' },

    header: {
      paddingTop: 12,
      paddingBottom: 14,
      paddingHorizontal: 16,
      backgroundColor: '#FAF9F6',
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(212, 175, 55, 0.25)',
      gap: 10,
    },
    headerTopBar: {
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
    headerLogo: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 1.5,
      borderColor: '#D4AF37',
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginTop: 2,
    },
    iconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: 'rgba(212, 175, 55, 0.3)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTextBlock: { flex: 1 },
    headerTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: '#1C1917',
      letterSpacing: 0.8,
    },
    headerSub: {
      fontSize: 12,
      color: '#64748B',
      marginTop: 2,
    },
    searchBarBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(212, 175, 55, 0.25)',
      paddingHorizontal: 12,
      height: 42,
      marginTop: 4,
      gap: 8,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 2,
    },
    searchBarInput: {
      flex: 1,
      fontSize: 13.5,
      fontWeight: '600',
      color: '#1C1917',
      padding: 0,
    },
    countBadge: {
      alignSelf: 'flex-start',
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: 'rgba(212, 175, 55, 0.3)',
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 4,
    },
    countText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#D4AF37',
      letterSpacing: 0.5,
    },

    stateBlock: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      paddingHorizontal: 24,
    },
    stateText: {
      color: '#64748B',
      fontSize: 14,
      textAlign: 'center',
    },
    retryButton: {
      borderRadius: 20,
      backgroundColor: '#D4AF37',
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    retryButtonText: {
      color: '#1C1917',
      fontWeight: '800',
      letterSpacing: 0.5,
    },

    scroll: {
      padding: 16,
      gap: 16,
    },

    /* BENTO GRID STYLES */
    bentoHeroCard: {
      width: '100%',
      borderRadius: 24,
      overflow: 'hidden',
      backgroundColor: '#FFFFFF',
      borderWidth: 1.2,
      borderColor: 'rgba(212, 175, 55, 0.35)',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 14,
      elevation: 4,
      marginBottom: 16,
    },
    cardImageContainer: {
      width: '100%',
      height: 220,
      position: 'relative',
      backgroundColor: '#F1F5F9',
    },
    bentoHeroImage: {
      width: '100%',
      height: '100%',
    },
    bentoHeroTopBadges: {
      position: 'absolute',
      top: 14,
      left: 14,
      right: 14,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 5,
    },
    heroBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 14,
      backgroundColor: 'rgba(255, 255, 255, 0.94)',
      borderWidth: 1,
      borderColor: 'rgba(212, 175, 55, 0.4)',
    },
    heroBadgeText: {
      fontSize: 10.5,
      fontWeight: '800',
      color: '#1C1917',
      letterSpacing: 0.8,
    },
    ratingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.94)',
      borderWidth: 1,
      borderColor: 'rgba(212, 175, 55, 0.35)',
    },
    ratingText: {
      fontSize: 12,
      fontWeight: '800',
      color: '#1C1917',
    },
    bentoHeroPanel: {
      backgroundColor: '#FFFFFF',
      overflow: 'hidden',
    },
    heroPanelContent: {
      padding: 16,
    },
    heroLocationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
    },
    ratingValueText: {
      fontSize: 12,
      fontWeight: '800',
      color: '#D4AF37',
    },
    metaDot: {
      fontSize: 12,
      color: '#64748B',
    },
    heroLocationText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#64748B',
      flex: 1,
    },
    heroHotelName: {
      fontSize: 18,
      fontWeight: '800',
      color: '#1C1917',
      letterSpacing: 0.2,
    },
    microSpecsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 8,
      paddingVertical: 4,
    },
    microSpecItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    microSpecText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#475569',
    },
    specDot: {
      width: 3.5,
      height: 3.5,
      borderRadius: 2,
      backgroundColor: 'rgba(212, 175, 55, 0.6)',
    },
    heroPriceActionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: 'rgba(28, 25, 23, 0.08)',
    },
    priceBlock: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 4,
    },
    priceValue: {
      fontSize: 22,
      fontWeight: '900',
      color: '#D4AF37',
      letterSpacing: 0.2,
    },
    pricePeriod: {
      fontSize: 13,
      fontWeight: '700',
      color: '#64748B',
    },
    explorePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 14,
      backgroundColor: '#D4AF37',
      shadowColor: '#D4AF37',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 3,
    },
    explorePillText: {
      fontSize: 12,
      fontWeight: '800',
      color: '#1C1917',
      letterSpacing: 0.3,
    },
    secondaryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: 14,
    },
    gridCard: {
      width: '48.5%',
      borderRadius: 18,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: 'rgba(212, 175, 55, 0.25)',
      overflow: 'hidden',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    gridImageBox: {
      width: '100%',
      height: 125,
      position: 'relative',
      backgroundColor: '#F1F5F9',
    },
    gridImage: {
      width: '100%',
      height: '100%',
    },
    gridCityBadge: {
      position: 'absolute',
      top: 8,
      left: 8,
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.92)',
      borderWidth: 1,
      borderColor: 'rgba(212, 175, 55, 0.35)',
    },
    gridCityBadgeText: {
      fontSize: 9.5,
      fontWeight: '800',
      color: '#1C1917',
      letterSpacing: 0.6,
    },
    gridRatingBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.92)',
    },
    gridRatingText: {
      fontSize: 10.5,
      fontWeight: '800',
      color: '#1C1917',
    },
    gridBody: {
      padding: 12,
    },
    gridName: {
      fontSize: 13.5,
      fontWeight: '700',
      color: '#1C1917',
      lineHeight: 18,
      height: 36,
    },
    gridSpecsRow: {
      marginTop: 4,
    },
    gridSpecsText: {
      fontSize: 11,
      color: '#64748B',
      fontWeight: '600',
    },
    gridPriceRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 3,
      marginTop: 8,
      paddingTop: 6,
      borderTopWidth: 1,
      borderTopColor: 'rgba(28, 25, 23, 0.08)',
    },
    gridPriceVal: {
      fontSize: 15,
      fontWeight: '900',
      color: '#D4AF37',
    },
    gridPricePeriod: {
      fontSize: 10.5,
      color: '#64748B',
      fontWeight: '600',
    },

    /* FULL BLEED STYLES */
    fullBleedCard: {
      width: '100%',
      borderRadius: 24,
      overflow: 'hidden',
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: 'rgba(212, 175, 55, 0.25)',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 14,
      elevation: 4,
    },
    fullBleedImage: {
      width: '100%',
      height: '100%',
    },
    categoryBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 14,
      backgroundColor: 'rgba(255, 255, 255, 0.94)',
      borderWidth: 1,
      borderColor: 'rgba(212, 175, 55, 0.4)',
    },
    categoryBadgeText: {
      fontSize: 10.5,
      fontWeight: '800',
      color: '#1C1917',
      letterSpacing: 0.8,
    },
    frostedPanel: {
      backgroundColor: '#FFFFFF',
      overflow: 'hidden',
    },
    fullBleedTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: '#1C1917',
      letterSpacing: 0.2,
    },
    fullBleedSub: {
      fontSize: 12.5,
      color: '#64748B',
      marginTop: 2,
    },

    /* STANDARD FALLBACK CARD STYLES */
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(212, 175, 55, 0.25)',
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    imageContainer: {
      height: 190,
      width: '100%',
    },
    image: { width: '100%', height: '100%' },
    imageOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '50%',
    },
    badgeContainer: {
      position: 'absolute',
      top: 12,
      left: 12,
      backgroundColor: '#D4AF37',
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#1C1917',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    priceOverlay: {
      position: 'absolute',
      bottom: 12,
      right: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.94)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(212, 175, 55, 0.3)',
      paddingHorizontal: 10,
      paddingVertical: 5,
      alignItems: 'flex-end',
    },
    priceText: {
      fontSize: 17,
      fontWeight: '900',
      color: '#D4AF37',
    },
    pricePerText: {
      fontSize: 10.5,
      color: '#64748B',
      marginTop: 1,
    },
    cardBody: {
      padding: 16,
      gap: 8,
    },
    itemName: {
      fontSize: 16,
      fontWeight: '700',
      color: '#1C1917',
      lineHeight: 22,
    },
    itemSubtitle: {
      fontSize: 12,
      color: '#64748B',
    },
    tagsRow: {
      flexDirection: 'row',
      gap: 8,
      flexWrap: 'wrap',
      marginTop: 2,
    },
    tag: {
      backgroundColor: '#FAF9F6',
      borderWidth: 1,
      borderColor: 'rgba(212, 175, 55, 0.25)',
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    tagText: {
      fontSize: 11,
      color: '#1C1917',
      fontWeight: '700',
    },
    bookBtn: {
      borderRadius: 16,
      marginTop: 6,
      overflow: 'hidden',
    },
    bookBtnGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
      borderRadius: 16,
    },
    bookBtnText: {
      fontSize: 14,
      fontWeight: '800',
      color: '#1C1917',
      letterSpacing: 0.5,
    },
  });
}
