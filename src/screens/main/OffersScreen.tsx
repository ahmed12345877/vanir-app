import React, { useEffect, useState } from 'react';
import {
  Alert,
  Clipboard,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft,
  Tag,
  Copy,
  Check,
  Percent,
  Clock,
  ArrowRight,
} from 'lucide-react-native';
import type { RootStackParamList } from '../../navigation/types';
import {
  getLiveOffers,
  subscribeLiveOffers,
  type LiveOfferItem,
} from '../../services/firestore';
import { LuxuryPressable } from '../../components/LuxuryMicroInteractions';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function OffersScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [offers, setOffers] = useState<LiveOfferItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    getLiveOffers().then(setOffers);
    const unsub = subscribeLiveOffers(items => {
      if (items && items.length > 0) {
        setOffers(items);
      }
    });
    return () => unsub();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    const items = await getLiveOffers();
    setOffers(items);
    setRefreshing(false);
  };

  const handleCopyCode = (code: string) => {
    Clipboard.setString(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
    Alert.alert(t('screens.offers.copied', 'COPIED'), `Code "${code}" copied to clipboard! You can apply it during booking.`);
  };

  const handleBookWithOffer = (offer: LiveOfferItem) => {
    if (offer.target.toLowerCase().includes('yacht') || offer.target.includes('يخت')) {
      navigation.navigate('Yacht');
    } else if (offer.target.toLowerCase().includes('jet') || offer.target.includes('طيران')) {
      navigation.navigate('PrivateJet');
    } else {
      navigation.navigate('HotelSearch');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={12}
            style={styles.backBtn}
          >
            <ChevronLeft color="#D4AF37" size={24} />
          </Pressable>

          <View style={styles.headerTitles}>
            <View style={styles.goldBadgeRow}>
              <Tag color="#D4AF37" size={12} />
              <Text style={styles.goldBadgeText}>{t('portals.offersBadge', 'PROMO DEALS')}</Text>
            </View>
            <Text style={styles.headerTitle}>{t('screens.offers.title', 'Exclusive Offers & Privileges')}</Text>
          </View>
        </View>
      </View>

      {/* Offers list */}
      <FlatList
        data={offers}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContainer, { paddingBottom: insets.bottom + 32 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />
        }
        renderItem={({ item }) => {
          const isCopied = copiedCode === item.code;
          return (
            <View style={styles.offerCard}>
              {item.image ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
                  <LinearGradient
                    colors={['transparent', 'rgba(255, 255, 255, 0.4)', '#FFFFFF']}
                    style={styles.imageGradient}
                  />
                  <View style={styles.discountBadge}>
                    <Percent color="#1C1917" size={13} strokeWidth={2.5} />
                    <Text style={styles.discountBadgeText}>{item.discount}</Text>
                  </View>
                </View>
              ) : null}

              <View style={styles.cardBody}>
                <View style={styles.targetRow}>
                  <View style={styles.targetPill}>
                    <Text style={styles.targetPillText}>{item.target}</Text>
                  </View>
                  <View style={styles.validityRow}>
                    <Clock color="#78716C" size={12} />
                    <Text style={styles.validityText}>{t('screens.offers.validUntil', 'Valid until')} {item.validUntil}</Text>
                  </View>
                </View>

                <Text style={styles.offerTitle}>{item.title}</Text>
                {item.description ? (
                  <Text style={styles.offerDesc}>{item.description}</Text>
                ) : null}

                {/* Promo Code Box */}
                <View style={styles.promoCodeBox}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.promoLabel}>{t('screens.offers.codeLabel', 'PROMOTIONAL VOUCHER CODE')}</Text>
                    <Text style={styles.promoCodeText}>{item.code}</Text>
                  </View>

                  <Pressable
                    onPress={() => handleCopyCode(item.code)}
                    style={[styles.copyBtn, isCopied && styles.copyBtnActive]}
                  >
                    {isCopied ? (
                      <>
                        <Check color="#10B981" size={15} strokeWidth={2.5} />
                        <Text style={[styles.copyBtnText, { color: '#10B981' }]}>{t('screens.offers.copied', 'COPIED')}</Text>
                      </>
                    ) : (
                      <>
                        <Copy color="#D4AF37" size={15} strokeWidth={2.2} />
                        <Text style={styles.copyBtnText}>{t('screens.offers.copyCode', 'COPY CODE')}</Text>
                      </>
                    )}
                  </Pressable>
                </View>

                {/* Action button */}
                <LuxuryPressable
                  onPress={() => handleBookWithOffer(item)}
                  style={styles.bookBtn}
                >
                  <Text style={styles.bookBtnText}>{t('screens.offers.redeem', 'Redeem Offer & Book Now')}</Text>
                  <ArrowRight color="#1C1917" size={16} strokeWidth={2.2} />
                </LuxuryPressable>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  header: {
    paddingHorizontal: 20,
    backgroundColor: '#FAF9F6',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
    paddingBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitles: {
    flex: 1,
  },
  goldBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  goldBadgeText: {
    color: '#D4AF37',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  headerTitle: {
    color: '#1C1917',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  listContainer: {
    padding: 20,
    gap: 20,
  },
  offerCard: {
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 3,
  },
  imageContainer: {
    height: 180,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  discountBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: '#D4AF37',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  discountBadgeText: {
    color: '#1C1917',
    fontSize: 13,
    fontWeight: '800',
  },
  cardBody: {
    padding: 18,
    gap: 12,
  },
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  targetPill: {
    backgroundColor: '#FAF7EE',
    borderWidth: 1,
    borderColor: '#D4AF37',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  targetPillText: {
    color: '#B45309',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  validityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  validityText: {
    color: '#78716C',
    fontSize: 11,
    fontWeight: '600',
  },
  offerTitle: {
    color: '#1C1917',
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 24,
  },
  offerDesc: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 20,
  },
  promoCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFDF5',
    borderWidth: 1.2,
    borderStyle: 'dashed',
    borderColor: 'rgba(212, 175, 55, 0.45)',
    borderRadius: 14,
    padding: 12,
  },
  promoLabel: {
    color: '#78716C',
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  promoCodeText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAF7EE',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  copyBtnActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  copyBtnText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '800',
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#D4AF37',
    height: 48,
    borderRadius: 14,
    marginTop: 4,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  bookBtnText: {
    color: '#1C1917',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
