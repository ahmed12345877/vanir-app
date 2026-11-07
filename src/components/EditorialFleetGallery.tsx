import React, { useState, useRef, useMemo } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { X, ArrowRight, ShieldCheck, Sparkles, Eye, Camera } from 'lucide-react-native';
import type { LiveGalleryItem } from '../services/firestore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Luxury cinematic cubic-bezier curve strictly aligned with brand guidelines
const LUXURY_CINEMATIC_EASE = Easing.bezier(0.16, 1, 0.3, 1);

export interface EditorialFleetGalleryProps {
  items: LiveGalleryItem[];
  categories?: string[];
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
  onBookPress?: (item: LiveGalleryItem) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  headerComponent?: React.ReactElement;
  footerComponent?: React.ReactElement;
  showCategoryFilters?: boolean;
  contentContainerStyle?: any;
}

interface MosaicGroup {
  id: string;
  hero?: LiveGalleryItem;
  staggered?: [LiveGalleryItem, LiveGalleryItem?];
}

/**
 * EditorialImageCard:
 * Handles fluid micro-zoom on press/tap:
 * Scales image smoothly to 1.03 over 0.8s cubic-bezier(0.16, 1, 0.3, 1).
 * Features bottom-heavy dark linear gradient overlay (rgba(0,0,0,0) to rgba(0,0,0,0.58)).
 * Features elegant, tracked uppercase typography in white at the bottom-left.
 * Features clean 8px border-radius and sharp geometric luxury edges.
 */
export function EditorialImageCard({
  item,
  isHero = false,
  height,
  onPress,
  style,
}: {
  item: LiveGalleryItem;
  isHero?: boolean;
  height: number;
  onPress: () => void;
  style?: any;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 1.03,
      duration: 800, // 0.8s as specified
      easing: LUXURY_CINEMATIC_EASE,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1.0,
      duration: 600,
      easing: LUXURY_CINEMATIC_EASE,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.cardContainer,
        { height },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={item.title}
    >
      {/* Zoomable Background Image */}
      <Animated.Image
        source={{ uri: item.url }}
        style={[
          StyleSheet.absoluteFill,
          styles.cardImage,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
        resizeMode="cover"
      />

      {/* Subtle bottom-heavy dark linear gradient overlay (rgba(0,0,0,0) to rgba(0,0,0,0.58)) */}
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.12)', 'rgba(0,0,0,0.6)']}
        locations={[0.2, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Top Asset Meta Pill */}
      <View style={styles.cardTopMeta}>
        <View style={styles.uhdTag}>
          <Camera color="#FFFFFF" size={10} strokeWidth={2} />
          <Text style={styles.uhdTagText}>{isHero ? 'SHOWCASE FLEET' : 'DETAIL'}</Text>
        </View>
      </View>

      {/* Bottom-left Immersive Typography */}
      <View style={styles.typographyOverlay}>
        <Text style={styles.kickerCategoryText}>
          {(() => {
            const raw = item.category || 'VIP FLEET';
            if (raw.includes('مرفوع') || raw.includes('جهاز') || raw.toLowerCase().includes('upload')) {
              return 'VIP SIGNATURE COLLECTION';
            }
            return raw.toUpperCase();
          })()}
        </Text>
        <Text
          style={[styles.fleetTitleText, isHero ? styles.heroTitleText : styles.staggeredTitleText]}
          numberOfLines={2}
        >
          {item.title.toUpperCase()}
        </Text>
      </View>
    </Pressable>
  );
}

export function EditorialFleetGallery({
  items,
  categories,
  selectedCategory = 'All',
  onSelectCategory,
  onBookPress,
  refreshing = false,
  onRefresh,
  headerComponent,
  footerComponent,
  showCategoryFilters = true,
  contentContainerStyle,
}: EditorialFleetGalleryProps) {
  // Lightbox State
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const lightboxListRef = useRef<FlatList>(null);

  // Filter items by category
  const filteredItems = useMemo(() => {
    if (!selectedCategory || selectedCategory === 'All') return items;
    return items.filter(i => i.category === selectedCategory);
  }, [items, selectedCategory]);

  // Transform flat list into asymmetric editorial mosaic groups
  // Repeating pattern:
  // [1 Full Width Hero] -> [2 Staggered Columns] -> [1 Full Width Hero] -> [2 Staggered Columns]
  const mosaicGroups = useMemo<MosaicGroup[]>(() => {
    const groups: MosaicGroup[] = [];
    let i = 0;
    let groupCount = 0;

    while (i < filteredItems.length) {
      if (groupCount % 2 === 0) {
        // Hero row (Takes 100% width for showcase fleets)
        groups.push({
          id: `hero-${filteredItems[i].id}-${groupCount}`,
          hero: filteredItems[i],
        });
        i += 1;
      } else {
        // Staggered two-column row (for interior detail shots)
        const first = filteredItems[i];
        const second = i + 1 < filteredItems.length ? filteredItems[i + 1] : undefined;
        groups.push({
          id: `staggered-${first.id}-${groupCount}`,
          staggered: [first, second],
        });
        i += second ? 2 : 1;
      }
      groupCount += 1;
    }

    return groups;
  }, [filteredItems]);

  const handleOpenLightbox = (item: LiveGalleryItem) => {
    const idx = filteredItems.findIndex(i => i.id === item.id);
    const targetIdx = idx >= 0 ? idx : 0;
    setActiveImageIndex(targetIdx);
    setLightboxVisible(true);
  };

  const handleCloseLightbox = () => {
    setLightboxVisible(false);
  };

  const currentLightboxItem = filteredItems[activeImageIndex] || filteredItems[0];

  return (
    <View style={styles.container}>
      {/* Category Filter Chips */}
      {showCategoryFilters && categories && categories.length > 0 && (
        <View style={styles.categoryScrollWrapper}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={c => c}
            contentContainerStyle={styles.categoryScroll}
            renderItem={({ item: category }) => {
              const isActive = selectedCategory === category;
              return (
                <Pressable
                  style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                  onPress={() => onSelectCategory?.(category)}
                >
                  <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                    {category}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>
      )}

      {/* Asymmetric Editorial Mosaic FlatList */}
      <FlatList
        data={mosaicGroups}
        keyExtractor={g => g.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.mosaicListContent, contentContainerStyle]}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#D4AF37"
              colors={['#D4AF37', '#1C1917']}
            />
          ) : undefined
        }
        ListHeaderComponent={headerComponent}
        ListFooterComponent={footerComponent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Sparkles color="#D4AF37" size={26} strokeWidth={1.8} />
            <Text style={styles.emptyTitle}>NO MEDIA ARCHIVE AVAILABLE</Text>
            <Text style={styles.emptySubtitle}>No fleet assets found in this selected category.</Text>
          </View>
        }
        renderItem={({ item: group, index: groupIndex }) => {
          // 1. Hero Showcase Row (100% Width)
          if (group.hero) {
            return (
              <View style={styles.heroRowWrapper}>
                <EditorialImageCard
                  item={group.hero}
                  isHero={true}
                  height={270}
                  onPress={() => handleOpenLightbox(group.hero!)}
                />
              </View>
            );
          }

          // 2. Staggered Two-Column Row (Detail Shots)
          if (group.staggered) {
            const [itemA, itemB] = group.staggered;
            // Alternating heights for a dynamic magazine editorial stagger
            const isAlternate = Math.floor(groupIndex / 2) % 2 === 1;
            const heightA = isAlternate ? 190 : 225;
            const heightB = isAlternate ? 225 : 190;

            return (
              <View style={styles.staggeredRow}>
                <View style={styles.staggeredCol}>
                  <EditorialImageCard
                    item={itemA}
                    isHero={false}
                    height={heightA}
                    onPress={() => handleOpenLightbox(itemA)}
                  />
                </View>

                {itemB ? (
                  <View style={styles.staggeredCol}>
                    <EditorialImageCard
                      item={itemB}
                      isHero={false}
                      height={heightB}
                      onPress={() => handleOpenLightbox(itemB)}
                    />
                  </View>
                ) : (
                  <View style={styles.staggeredCol} />
                )}
              </View>
            );
          }

          return null;
        }}
      />

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. PREMIUM FULL-SCREEN LIGHTBOX (#000000 PITCH-BLACK)          */}
      {/* ───────────────────────────────────────────────────────────── */}
      <Modal
        visible={lightboxVisible}
        transparent={false}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={handleCloseLightbox}
      >
        <View style={styles.lightboxBackdrop}>
          <StatusBar barStyle="light-content" backgroundColor="#000000" />

          {/* Lightbox Top Header Bar */}
          <SafeAreaView style={styles.lightboxTopSafe}>
            <View style={styles.lightboxTopBar}>
              {/* Minimalist Index Counter: e.g. 03 / 08 */}
              <View style={styles.lightboxIndexBadge}>
                <Text style={styles.lightboxIndexCurrent}>
                  {String(activeImageIndex + 1).padStart(2, '0')}
                </Text>
                <Text style={styles.lightboxIndexDivider}> / </Text>
                <Text style={styles.lightboxIndexTotal}>
                  {String(filteredItems.length).padStart(2, '0')}
                </Text>
              </View>

              {/* Minimalist Containerless Close Button */}
              <Pressable
                style={styles.lightboxCloseBtn}
                onPress={handleCloseLightbox}
                hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
                accessibilityRole="button"
                accessibilityLabel="Close Lightbox"
              >
                <X color="#FFFFFF" size={24} strokeWidth={1.5} />
              </Pressable>
            </View>
          </SafeAreaView>

          {/* Seamless Horizontal Swiping Gallery with Momentum Physics */}
          <FlatList
            ref={lightboxListRef}
            data={filteredItems}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            initialScrollIndex={activeImageIndex}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            onMomentumScrollEnd={e => {
              const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              if (newIndex >= 0 && newIndex < filteredItems.length) {
                setActiveImageIndex(newIndex);
              }
            }}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.lightboxSlideContainer}>
                <Image
                  source={{ uri: item.url }}
                  style={styles.lightboxImage}
                  resizeMode="contain"
                />
              </View>
            )}
          />

          {/* Lightbox Bottom Editorial Drawer & Concierge CTA */}
          <SafeAreaView style={styles.lightboxBottomSafe}>
            <View style={styles.lightboxBottomDrawer}>
              <View style={styles.lightboxTagRow}>
                <Text style={styles.lightboxCategoryText}>
                  {(currentLightboxItem?.category || 'VIP FLEET').toUpperCase()}
                </Text>
                <View style={styles.lightboxDotSeparator} />
                <View style={styles.verifiedBadgeRow}>
                  <ShieldCheck color="#10B981" size={13} strokeWidth={2} />
                  <Text style={styles.verifiedBadgeText}>VERIFIED FLEET ASSET</Text>
                </View>
              </View>

              <Text style={styles.lightboxAssetTitle} numberOfLines={2}>
                {currentLightboxItem?.title}
              </Text>

              {/* Concierge Booking / Inquiry Button */}
              <Pressable
                style={styles.lightboxCtaBtn}
                onPress={() => {
                  if (currentLightboxItem) {
                    handleCloseLightbox();
                    onBookPress?.(currentLightboxItem);
                  }
                }}
              >
                <Text style={styles.lightboxCtaText}>REQUEST CHARTER & FULL SPECIFICATIONS</Text>
                <ArrowRight color="#1C1917" size={15} strokeWidth={2.4} />
              </Pressable>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categoryScrollWrapper: {
    paddingVertical: 10,
    backgroundColor: '#1C1917',
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  categoryChipActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  categoryText: {
    color: '#1C1917',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  categoryTextActive: {
    color: '#1C1917',
    fontWeight: '800',
  },
  mosaicListContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 10, // 8px to 12px minimalist gaps as specified
  },
  heroRowWrapper: {
    width: '100%',
  },
  staggeredRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10, // 8px to 12px spacing between images
  },
  staggeredCol: {
    flex: 1,
  },
  cardContainer: {
    width: '100%',
    borderRadius: 8, // slight rounded corners (border-radius: 8px) as strictly requested
    overflow: 'hidden',
    backgroundColor: '#FAF9F6',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardTopMeta: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
  },
  uhdTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(28, 25, 23, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  uhdTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  typographyOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    zIndex: 2,
  },
  kickerCategoryText: {
    color: '#D4AF37', // Matte Luxury Gold
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.6, // Tracked uppercase typography
    marginBottom: 4,
  },
  fleetTitleText: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 1.4, // Elegant tracked uppercase typography
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  heroTitleText: {
    fontSize: 14,
    lineHeight: 19,
  },
  staggeredTitleText: {
    fontSize: 11,
    lineHeight: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyTitle: {
    color: '#1C1917',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  emptySubtitle: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  /* Full-Screen Pitch-Black Lightbox */
  lightboxBackdrop: {
    flex: 1,
    backgroundColor: '#000000', // Pure pitch-black background (#000000)
    justifyContent: 'space-between',
  },
  lightboxTopSafe: {
    backgroundColor: '#000000',
    zIndex: 10,
  },
  lightboxTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  lightboxIndexBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  lightboxIndexCurrent: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  lightboxIndexDivider: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '700',
  },
  lightboxIndexTotal: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
  lightboxCloseBtn: {
    padding: 6,
  },
  lightboxSlideContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.68,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxImage: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  lightboxBottomSafe: {
    backgroundColor: '#000000',
    zIndex: 10,
  },
  lightboxBottomDrawer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 8,
  },
  lightboxTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lightboxCategoryText: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.8,
  },
  lightboxDotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#64748B',
  },
  verifiedBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedBadgeText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  lightboxAssetTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1.2,
    lineHeight: 22,
    marginBottom: 8,
  },
  lightboxCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#D4AF37', // Matte Luxury Gold
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8, // Sleek 8px border-radius
  },
  lightboxCtaText: {
    color: '#1C1917', // Deep Navy
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
});
