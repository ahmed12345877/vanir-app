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
import {
  X,
  Wifi,
  Waves,
  Sparkles,
  Utensils,
  Bell,
  Wind,
  Maximize2,
  Wine,
  ShieldCheck,
  Clock,
  Check,
  AlertCircle,
  ArrowRight,
  User,
  Bed,
} from 'lucide-react-native';
import { LiveRoomOffer } from '../services/hotelSearchApi';
import { LuxuryPressable } from './LuxuryMicroInteractions';

interface HotelRoomDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  room: LiveRoomOffer | null;
  hotelName: string;
  hotelCity?: string;
  nights: number;
  checkInDate: string;
  checkOutDate: string;
  onHoldAndBook: (room: LiveRoomOffer) => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// 1.5px clean line art icon resolver for amenities
function renderAmenityIcon(iconName: string) {
  switch (iconName) {
    case 'wifi':
      return <Wifi color="#1C1917" size={18} strokeWidth={1.5} />;
    case 'pool':
      return <Waves color="#1C1917" size={18} strokeWidth={1.5} />;
    case 'spa':
      return <Sparkles color="#1C1917" size={18} strokeWidth={1.5} />;
    case 'dining':
      return <Utensils color="#1C1917" size={18} strokeWidth={1.5} />;
    case 'butler':
      return <Bell color="#1C1917" size={18} strokeWidth={1.5} />;
    case 'ac':
      return <Wind color="#1C1917" size={18} strokeWidth={1.5} />;
    case 'balcony':
      return <Maximize2 color="#1C1917" size={18} strokeWidth={1.5} />;
    case 'bar':
      return <Wine color="#1C1917" size={18} strokeWidth={1.5} />;
    default:
      return <Sparkles color="#1C1917" size={18} strokeWidth={1.5} />;
  }
}

export function HotelRoomDrawer({
  isOpen,
  onClose,
  room,
  hotelName,
  hotelCity,
  nights,
  checkInDate,
  checkOutDate,
  onHoldAndBook,
}: HotelRoomDrawerProps) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 380,
          // Cubic-bezier(0.16, 1, 0.3, 1) standard luxury deceleration curve
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 280,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen, slideAnim, backdropAnim]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setActiveImageIndex(0);
    }
  }, [isOpen, room?.id]);

  if (!room) return null;

  const roomImages =
    room.images && room.images.length > 0
      ? room.images.filter(Boolean)
      : ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1000&q=80'];

  const activeRoomImage = roomImages[activeImageIndex] || roomImages[0];

  return (
    <Modal visible={isOpen} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        {/* Animated VIP Slide-Up Sheet */}
        <Animated.View
          style={[
            styles.drawerSheet,
            {
              transform: [{ translateY: slideAnim }],
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          {/* Header Drag Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.dragHandle} />
          </View>

          {/* Top Bar with Title and Close Button */}
          <View style={styles.topBar}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.topBarTitle} numberOfLines={1}>
                {room.title}
              </Text>
              <Text style={styles.topBarSubtitle} numberOfLines={1}>
                {hotelName} {hotelCity ? `• ${hotelCity}` : ''}
              </Text>
            </View>

            <LuxuryPressable style={styles.closeBtn} onPress={onClose}>
              <X color="#1C1917" size={18} strokeWidth={2} />
            </LuxuryPressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Room Image Hero */}
            <View style={styles.imageContainer}>
              <Image source={{ uri: activeRoomImage }} style={styles.roomImage} resizeMode="cover" />
              
              {/* Exact Room Inventory Badge */}
              <View style={styles.inventoryPill}>
                <AlertCircle color="#D4AF37" size={12} strokeWidth={2} />
                <Text style={styles.inventoryText}>
                  Only {room.inventoryCount} suite{room.inventoryCount > 1 ? 's' : ''} left in stock
                </Text>
              </View>

              {roomImages.length > 1 && (
                <View style={styles.photoCountBadge}>
                  <Text style={styles.photoCountText}>
                    {activeImageIndex + 1} / {roomImages.length}
                  </Text>
                </View>
              )}
            </View>

            {/* Room Images Thumbnails Carousel */}
            {roomImages.length > 1 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbnailsRow}
              >
                {roomImages.map((imgUri, idx) => {
                  const isActive = idx === activeImageIndex;
                  return (
                    <Pressable
                      key={idx}
                      style={[
                        styles.thumbBox,
                        isActive && styles.thumbBoxActive,
                      ]}
                      onPress={() => setActiveImageIndex(idx)}
                    >
                      <Image source={{ uri: imgUri }} style={styles.thumbImage} resizeMode="cover" />
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}

            {/* Room Core Specs Row */}
            <View style={styles.specsRow}>
              <View style={styles.specItem}>
                <Bed color="#1C1917" size={16} strokeWidth={1.5} />
                <Text style={styles.specLabel}>{room.bedType}</Text>
              </View>
              <View style={styles.specDivider} />
              <View style={styles.specItem}>
                <Maximize2 color="#1C1917" size={15} strokeWidth={1.5} />
                <Text style={styles.specLabel}>{room.areaM2} m²</Text>
              </View>
              <View style={styles.specDivider} />
              <View style={styles.specItem}>
                <User color="#1C1917" size={16} strokeWidth={1.5} />
                <Text style={styles.specLabel}>Up to {room.maxOccupancy} Guests</Text>
              </View>
            </View>

            {/* Live Cancellation Policy Banner */}
            <View style={styles.cancellationCard}>
              <View style={styles.cancellationHeader}>
                <ShieldCheck color="#D4AF37" size={16} strokeWidth={1.8} />
                <Text style={styles.cancellationTitle}>
                  {room.cancellationPolicy.type}
                </Text>
              </View>
              <Text style={styles.cancellationDesc}>
                {room.cancellationPolicy.description}
              </Text>
            </View>

            {/* Meal Plan Included */}
            <View style={styles.mealCard}>
              <View style={styles.mealHeader}>
                <Check color="#D4AF37" size={15} strokeWidth={2.4} />
                <Text style={styles.mealTitle}>Included with this suite</Text>
              </View>
              <Text style={styles.mealDesc}>{room.mealPlan}</Text>
            </View>

            {/* Live Amenities Data - Clean 1.5px Line Art Icons */}
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>SUITE AMENITIES & SERVICES</Text>
              <View style={styles.amenitiesGrid}>
                {room.amenities.map(amenity => (
                  <View key={amenity.id} style={styles.amenityRow}>
                    <View style={styles.amenityIconFrame}>
                      {renderAmenityIcon(amenity.iconName)}
                    </View>
                    <Text style={styles.amenityLabel}>{amenity.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* VIP Privileges */}
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>VANIR ROYAL PRIVILEGES</Text>
              <View style={styles.privilegesList}>
                {room.privileges.map((p, idx) => (
                  <View key={idx} style={styles.privilegeItem}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.privilegeText}>{p}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Live Pricing Breakdown */}
            <View style={styles.pricingCard}>
              <Text style={styles.pricingHeader}>
                PRICE SUMMARY ({Math.max(1, nights)} NIGHT{nights > 1 ? 'S' : ''} • {checkInDate} → {checkOutDate})
              </Text>

              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>
                  ${room.dynamicPricePerNight} × {Math.max(1, nights)} night{nights > 1 ? 's' : ''}
                </Text>
                <Text style={styles.priceVal}>${room.dynamicPricePerNight * Math.max(1, nights)}</Text>
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Taxes, Royal Tourism & Port Fees</Text>
                <Text style={styles.priceVal}>${room.taxesAndFees}</Text>
              </View>

              <View style={styles.priceDivider} />

              <View style={styles.priceRowTotal}>
                <View>
                  <Text style={styles.totalLabel}>Total Dynamic Price</Text>
                  <Text style={styles.totalSub}>All fees & concierge included</Text>
                </View>
                <Text style={styles.totalVal}>
                  ${room.dynamicPricePerNight * Math.max(1, nights) + (room.taxesAndFees || 0)}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Sticky Bottom Room Hold & Checkout Action Bar */}
          <View style={styles.bottomBar}>
            <View style={styles.bottomBarLeft}>
              <Text style={styles.bottomPriceUnit}>TOTAL FOR {Math.max(1, nights)} NIGHTS</Text>
              <Text style={styles.bottomPriceVal}>
                ${room.dynamicPricePerNight * Math.max(1, nights) + (room.taxesAndFees || 0)}
              </Text>
            </View>

            <LuxuryPressable
              style={styles.holdCtaBtn}
              onPress={() =>
                onHoldAndBook({
                  ...room,
                  totalPrice: room.dynamicPricePerNight * Math.max(1, nights) + (room.taxesAndFees || 0),
                })
              }
            >
              <View style={styles.holdBtnContent}>
                <Clock color="#1C1917" size={16} strokeWidth={2.2} />
                <Text style={styles.holdBtnText}>Hold for 10 Min & Book</Text>
                <ArrowRight color="#1C1917" size={16} strokeWidth={2.4} />
              </View>
            </LuxuryPressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(28, 25, 23, 0.65)',
  },
  drawerSheet: {
    backgroundColor: '#FAF9F6',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    maxHeight: SCREEN_HEIGHT * 0.88,
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 24,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(212, 175, 55, 0.45)',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.3,
  },
  topBarSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  imageContainer: {
    height: 200,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  roomImage: {
    width: '100%',
    height: '100%',
  },
  inventoryPill: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1C1917',
    borderWidth: 1,
    borderColor: '#D4AF37',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  inventoryText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FAF9F6',
    letterSpacing: 0.4,
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
    borderColor: '#D4AF37',
  },
  photoCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D4AF37',
  },
  thumbnailsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 2,
  },
  thumbBox: {
    width: 58,
    height: 58,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(28, 25, 23, 0.15)',
    backgroundColor: '#FAF9F6',
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
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  specLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1917',
  },
  specDivider: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
  },
  cancellationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    gap: 6,
  },
  cancellationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cancellationTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.3,
  },
  cancellationDesc: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 17,
  },
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    gap: 4,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mealTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.4,
  },
  mealDesc: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amenityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '48%',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  amenityIconFrame: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amenityLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1917',
    flex: 1,
  },
  privilegesList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    gap: 8,
  },
  privilegeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D4AF37',
  },
  privilegeText: {
    fontSize: 12,
    color: '#334155',
    flex: 1,
  },
  pricingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    gap: 10,
  },
  pricingHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 1,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12.5,
    color: '#64748B',
  },
  priceVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1917',
  },
  priceDivider: {
    height: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    marginVertical: 4,
  },
  priceRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1917',
  },
  totalSub: {
    fontSize: 10.5,
    color: '#64748B',
  },
  totalVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#D4AF37',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.25)',
    gap: 12,
  },
  bottomBarLeft: {
    minWidth: 90,
  },
  bottomPriceUnit: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  bottomPriceVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#D4AF37',
  },
  holdCtaBtn: {
    flex: 1,
    backgroundColor: '#D4AF37',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  holdBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  holdBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.3,
  },
});
