import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  X,
  Sparkles,
  ShieldCheck,
  Star,
  Users,
  Briefcase,
  Clock,
  MapPin,
  ArrowRight,
  Award,
  Key,
} from 'lucide-react-native';
import { LuxuryPressable } from './LuxuryMicroInteractions';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Luxury cinematic cubic-bezier curve strictly aligned with 2026 brand guidelines
const LUXURY_CINEMATIC_EASE = Easing.bezier(0.16, 1, 0.3, 1);

export interface VipSpecItem {
  label: string;
  value: string;
}

export interface VipDrawerItem {
  id: string;
  title: string;
  subtitle?: string;
  category?: string;
  badge?: string;
  image: string;
  images?: string[];
  price?: string;
  pricePer?: string;
  rating?: number;
  specs?: VipSpecItem[];
  privileges: string[];
  chauffeurOrButlerInfo?: {
    role: string;
    detail: string;
    badge?: string;
  };
  afterHoursAccess?: string;
  ctaText?: string;
}

interface VipDetailDrawerProps {
  visible: boolean;
  item: VipDrawerItem | null;
  onClose: () => void;
  onBook?: (item: VipDrawerItem) => void;
}

export function VipDetailDrawer({
  visible,
  item,
  onClose,
  onBook,
}: VipDetailDrawerProps) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 320,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 450,
          easing: LUXURY_CINEMATIC_EASE,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 350,
          easing: Easing.in(LUXURY_CINEMATIC_EASE),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, backdropAnim]);

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  useEffect(() => {
    if (visible) {
      setActivePhotoIndex(0);
    }
  }, [visible, item?.id]);

  if (!visible && !item) {
    return null;
  }

  const currentItem = item;
  if (!currentItem) return null;

  const photosList: string[] = (currentItem.images && currentItem.images.length > 0)
    ? currentItem.images.filter(Boolean)
    : (currentItem.image ? [currentItem.image] : []);

  const activeImage = photosList[activePhotoIndex] || currentItem.image;

  const handleBook = () => {
    onClose();
    if (onBook) {
      setTimeout(() => onBook(currentItem), 280);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.75],
              }),
            },
          ]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        {/* Slide-Up Sheet Container */}
        <Animated.View
          style={[
            styles.sheetContainer,
            {
              transform: [{ translateY: slideAnim }],
              paddingBottom: Math.max(insets.bottom, 20),
            },
          ]}
        >
          {/* Frosted Border Accent */}
          <View style={styles.sheetHeaderHandle}>
            <View style={styles.dragBar} />
          </View>

          {/* Close Button Top-Right */}
          <Pressable
            style={({ pressed }) => [
              styles.closeBtn,
              pressed && { backgroundColor: 'rgba(212, 175, 55, 0.28)', borderColor: '#D4AF37' },
            ]}
            onPress={onClose}
            hitSlop={12}
            accessibilityLabel="Close VIP Drawer"
          >
            <X color="#1C1917" size={18} strokeWidth={2.4} />
          </Pressable>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            bounces={false}
          >
            {/* Tag & Badge */}
            <View style={styles.metaHeaderRow}>
              <View style={styles.vipBadge}>
                <Sparkles color="#D4AF37" size={12} strokeWidth={2.5} />
                <Text style={styles.vipBadgeText}>
                  {currentItem.badge ? currentItem.badge.toUpperCase() : 'VANIR BESPOKE VIP PRIVILEGE'}
                </Text>
              </View>

              {typeof currentItem.rating === 'number' && (
                <View style={styles.ratingPill}>
                  <Star color="#D4AF37" fill="#D4AF37" size={11} />
                  <Text style={styles.ratingText}>{currentItem.rating.toFixed(1)}</Text>
                </View>
              )}
            </View>

            {/* Title & Subtitle */}
            <Text style={styles.title}>{currentItem.title}</Text>
            {currentItem.subtitle ? (
              <View style={styles.subtitleRow}>
                <MapPin color="#D4AF37" size={13} strokeWidth={2} />
                <Text style={styles.subtitleText}>{currentItem.subtitle}</Text>
              </View>
            ) : null}

            {/* Immersive Preview Image & Dynamic Gallery */}
            {activeImage ? (
              <View style={styles.imageBox}>
                <Image
                  source={{ uri: activeImage }}
                  style={styles.image}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['transparent', 'rgba(10, 18, 30, 0.75)']}
                  style={styles.imageGradient}
                />
                {currentItem.category ? (
                  <View style={styles.categoryPill}>
                    <Text style={styles.categoryPillText}>{currentItem.category}</Text>
                  </View>
                ) : null}

                {photosList.length > 1 && (
                  <View style={styles.photoCountBadge}>
                    <Text style={styles.photoCountText}>
                      {activePhotoIndex + 1} / {photosList.length}
                    </Text>
                  </View>
                )}
              </View>
            ) : null}

            {/* Multiple Photos Thumbnails Carousel */}
            {photosList.length > 1 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbnailsRow}
              >
                {photosList.map((photoUri, pIdx) => {
                  const isActive = pIdx === activePhotoIndex;
                  return (
                    <Pressable
                      key={pIdx}
                      style={[
                        styles.thumbBox,
                        isActive && styles.thumbBoxActive,
                      ]}
                      onPress={() => setActivePhotoIndex(pIdx)}
                    >
                      <Image source={{ uri: photoUri }} style={styles.thumbImage} resizeMode="cover" />
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}

            {/* Minimal Specs Chips */}
            {currentItem.specs && currentItem.specs.length > 0 && (
              <View style={styles.specsRow}>
                {currentItem.specs.map((spec, i) => (
                  <View key={i} style={styles.specChip}>
                    <Text style={styles.specLabel}>{spec.label.toUpperCase()}</Text>
                    <Text style={styles.specValue}>{spec.value}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* VIP Bespoke Privileges & Inclusions */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeader}>
                <Award color="#D4AF37" size={15} strokeWidth={2} />
                <Text style={styles.sectionTitle}>BESPOKE PRIVILEGES & INCLUSIONS</Text>
              </View>

              <View style={styles.privilegesList}>
                {currentItem.privileges.map((itemText, idx) => (
                  <View key={idx} style={styles.privilegeItem}>
                    <View style={styles.bulletDot}>
                      <View style={styles.bulletInner} />
                    </View>
                    <Text style={styles.privilegeText}>{itemText}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Bespoke Chauffeur / Butler / Access Details */}
            {currentItem.chauffeurOrButlerInfo && (
              <View style={styles.chauffeurCard}>
                <View style={styles.chauffeurHeader}>
                  <ShieldCheck color="#D4AF37" size={18} strokeWidth={2} />
                  <Text style={styles.chauffeurRole}>
                    {currentItem.chauffeurOrButlerInfo.role}
                  </Text>
                  {currentItem.chauffeurOrButlerInfo.badge && (
                    <View style={styles.chauffeurBadge}>
                      <Text style={styles.chauffeurBadgeText}>
                        {currentItem.chauffeurOrButlerInfo.badge}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.chauffeurDetail}>
                  {currentItem.chauffeurOrButlerInfo.detail}
                </Text>
              </View>
            )}

            {/* After-Hours Gate Access Privilege */}
            {currentItem.afterHoursAccess && (
              <View style={styles.accessCard}>
                <Key color="#D4AF37" size={16} strokeWidth={2} />
                <Text style={styles.accessText}>{currentItem.afterHoursAccess}</Text>
              </View>
            )}
          </ScrollView>

          {/* Sticky Bottom Price & CTA */}
          <View style={styles.footerRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceMeta}>EXCLUSIVE VIP RATE</Text>
              <Text style={styles.priceValue}>
                {currentItem.price || '$800'}
                {currentItem.pricePer ? (
                  <Text style={styles.pricePer}> / {currentItem.pricePer.replace(/^\/?(per\s*)?/, '')}</Text>
                ) : (
                  <Text style={styles.pricePer}> / experience</Text>
                )}
              </Text>
            </View>

            <LuxuryPressable
              style={styles.bookBtn}
              onPress={handleBook}
              scaleTo={0.96}
            >
              <Text style={styles.bookBtnText}>
                {currentItem.ctaText || 'Reserve VIP Experience'}
              </Text>
              <ArrowRight color="#1C1917" size={16} strokeWidth={2.6} />
            </LuxuryPressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(28, 25, 23, 0.65)',
  },
  sheetContainer: {
    backgroundColor: '#FAF9F6',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1.5,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    maxHeight: SCREEN_HEIGHT * 0.88,
    minHeight: SCREEN_HEIGHT * 0.58,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 25,
  },
  sheetHeaderHandle: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragBar: {
    width: 44,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: '#D4AF37',
    opacity: 0.85,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 18,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingBottom: 24,
  },
  metaHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  vipBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 1.1,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1C1917',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.3,
    marginBottom: 6,
    lineHeight: 28,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  subtitleText: {
    fontSize: 13,
    color: '#64748B',
    flex: 1,
  },
  imageBox: {
    width: '100%',
    height: 190,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    marginBottom: 16,
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    ...StyleSheet.absoluteFill,
  },
  categoryPill: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#1C1917',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.5)',
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D4AF37',
    letterSpacing: 0.5,
  },
  photoCountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#1C1917',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.5)',
  },
  photoCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D4AF37',
  },
  thumbnailsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  thumbBox: {
    width: 58,
    height: 58,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(28, 25, 23, 0.15)',
    backgroundColor: '#FFFFFF',
  },
  thumbBoxActive: {
    borderColor: '#D4AF37',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  specsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  specChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    minWidth: '28%',
    flexGrow: 1,
  },
  specLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  specValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1917',
  },
  sectionBlock: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 1.1,
  },
  privilegesList: {
    gap: 9,
  },
  privilegeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bulletDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.2,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  bulletInner: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#D4AF37',
  },
  privilegeText: {
    fontSize: 13.5,
    color: '#334155',
    lineHeight: 19,
    flex: 1,
  },
  chauffeurCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  chauffeurHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  chauffeurRole: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.4,
    flex: 1,
  },
  chauffeurBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
  },
  chauffeurBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1C1917',
  },
  chauffeurDetail: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
  },
  accessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  accessText: {
    fontSize: 12.5,
    color: '#1C1917',
    fontWeight: '600',
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.25)',
    backgroundColor: '#FAF9F6',
  },
  priceContainer: {
    flex: 1,
    marginRight: 12,
  },
  priceMeta: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1C1917',
    letterSpacing: 0.2,
  },
  pricePer: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#D4AF37',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  bookBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.3,
  },
});
