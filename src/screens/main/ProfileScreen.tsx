import React, { useState, useCallback, useEffect } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { LuxuryPressable } from '../../components/LuxuryMicroInteractions';
import {
  PRESET_AVATARS,
  AVATAR_STORAGE_KEY,
  PROFILE_STORAGE_KEY,
} from './UserProfileScreen';
import auth from '@react-native-firebase/auth';
import { useTranslation } from 'react-i18next';
import {
  SUPPORTED_LANGUAGES,
  setAppLanguage,
  type AppLanguage,
  LANGUAGE_STORAGE_KEY,
} from '../../lib/i18n';
import { RealQRCode } from '../../components/RealQRCode';
import { Vanir3DIcon } from '../../components/Vanir3DIcon';
import {
  Settings,
  QrCode,
  ChevronRight,
  Crown,
  Bed,
  Car,
  Ticket,
  Coins,
  Briefcase,
  Luggage,
  FileEdit,
  Heart,
  CreditCard,
  UserCheck,
  Headphones,
  Globe,
  Info,
  Star,
  Shield,
  LogOut,
  X,
  Check,
  Plane,
  Building,
  Camera,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import {
  getLiveUserProfile,
  subscribeLiveUserProfile,
  type LiveUserProfile,
} from '../../services/firestore';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { signOut, user } = useAuth();
  const { t, i18n } = useTranslation();

  // Dynamic live profile state synced with Firestore / Admin Dashboard
  const [liveProfile, setLiveProfile] = useState<LiveUserProfile | null>(null);

  // App Language State
  const [currentLanguage, setCurrentLanguage] = useState<AppLanguage>(
    ((i18n.language && ['en', 'ar', 'fr', 'ru'].includes(i18n.language)) ? i18n.language : 'en') as AppLanguage
  );

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (saved && (saved === 'en' || saved === 'ar' || saved === 'fr' || saved === 'ru')) {
          setCurrentLanguage(saved as AppLanguage);
        }
      } catch {}
    })();
  }, []);

  const handleSelectLanguage = async (code: AppLanguage) => {
    try {
      setCurrentLanguage(code);
      await setAppLanguage(code);
    } catch (err) {
      console.warn('Failed to switch language:', err);
    }
  };

  // Modals state
  const [showQrModal, setShowQrModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [showAwaitingTravelModal, setShowAwaitingTravelModal] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [ratedSuccess, setRatedSuccess] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [distanceUnit, setDistanceUnit] = useState<'km' | 'mi'>('km');
  const [currency, setCurrency] = useState('AED');

  // User Avatar & Profile State
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarPresetSource, setAvatarPresetSource] = useState<any>(null);
  const [displayName, setDisplayName] = useState<string>('Vanir Member');

  const loadUserData = useCallback(async () => {
    try {
      const savedAvatar = await AsyncStorage.getItem(AVATAR_STORAGE_KEY);
      if (savedAvatar) {
        const parsed = JSON.parse(savedAvatar);
        if (parsed.type === 'custom' && parsed.uri) {
          setAvatarUri(parsed.uri);
          setAvatarPresetSource(null);
        } else if (parsed.type === 'preset' && parsed.id) {
          const match = PRESET_AVATARS.find(p => p.id === parsed.id);
          if (match) {
            setAvatarPresetSource(match.source);
            setAvatarUri(null);
          }
        }
      } else {
        setAvatarPresetSource(require('../../assets/images/egyptian_royal_queen.jpg'));
      }

      const savedProfile = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      if (savedProfile) {
        const p = JSON.parse(savedProfile);
        if (p.displayName) {
          setDisplayName(p.displayName);
        }
      } else {
        const u = user as any;
        if (u?.name) {
          setDisplayName(u.name);
        }
      }
    } catch {
      // Fallback
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [loadUserData])
  );

  const currentUserId = (user as any)?.id || (user as any)?.uid || 'default_vip_user';

  useEffect(() => {
    getLiveUserProfile(currentUserId).then(p => {
      if (p) setLiveProfile(p);
    });

    const unsubscribe = subscribeLiveUserProfile(currentUserId, p => {
      if (p) setLiveProfile(p);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your VIP account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            navigation.navigate('Login');
          },
        },
      ]
    );
  };

  const handleRateSubmit = () => {
    setRatedSuccess(true);
    setTimeout(() => {
      setShowRatingModal(false);
      setRatedSuccess(false);
      Alert.alert('Thank You!', 'Your 5-star VIP review has been submitted to the Vanir Concierge team.');
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

      {/* Top Utility Bar */}
      <View style={styles.topBar}>
        <LuxuryPressable
          style={({ pressed }: { pressed: boolean }) => [
            styles.iconBtn,
            pressed && styles.topBtnPressed,
          ]}
          onPress={() => navigation.navigate('PrivacySecurity')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Privacy and Settings"
        >
          <Settings color="#D4AF37" size={20} strokeWidth={1.8} />
        </LuxuryPressable>

        <View style={styles.topBarCenter}>
          <Text style={styles.topBarTitle}>{t('screens.profile.title', 'VIP Concierge').toUpperCase()}</Text>
          <Text style={styles.topBarSub}>VANIR PRIVATE CLIENT</Text>
        </View>

        <LuxuryPressable
          style={({ pressed }: { pressed: boolean }) => [
            styles.iconBtn,
            pressed && styles.topBtnPressed,
          ]}
          onPress={() => setShowQrModal(true)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="QR Pass"
        >
          <QrCode color="#D4AF37" size={20} strokeWidth={1.8} />
        </LuxuryPressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1 & 2: Premium VIP Card (Header): Luxury Metal / Dark Glass Credit Card */}
        <LuxuryPressable
          style={styles.metalCreditCardContainer}
          onPress={() => {
            if (!auth().currentUser) {
              navigation.navigate('Login');
            } else {
              navigation.navigate('UserProfile');
            }
          }}
        >
          <LinearGradient
            colors={['#FFFFFF', '#FAF7F0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.metalCreditCard}
          >
            {/* Card Top Row: EMV Chip / Brand + Royal Tier Badge */}
            <View style={styles.cardTopRow}>
              <View style={styles.cardBrandGroup}>
                <View style={styles.emvChip}>
                  <View style={styles.emvChipLine} />
                  <View style={styles.emvChipLineH} />
                </View>
                <Text style={styles.cardBrandText}>VANIR ROYAL CLUB</Text>
              </View>

              <View style={styles.royalTierBadge}>
                <Crown color="#D4AF37" size={11} strokeWidth={2.4} />
                <Text style={styles.royalTierBadgeText}>
                  {(liveProfile?.tier || 'ROYAL TIER').toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Card Middle Row: User Avatar & Display Name */}
            <View style={styles.cardMiddleRow}>
              <View style={styles.cardAvatarCircle}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.cardAvatarImg} resizeMode="cover" />
                ) : avatarPresetSource ? (
                  <Image source={avatarPresetSource} style={styles.cardAvatarImg} resizeMode="cover" />
                ) : (
                  <Text style={styles.cardAvatarFallback}>
                    {auth().currentUser ? (displayName.charAt(0) || 'V') : 'G'}
                  </Text>
                )}
                <View style={[styles.cardAvatarDot, !auth().currentUser && { backgroundColor: '#94A3B8' }]} />
              </View>

              <View style={styles.cardUserCol}>
                <Text style={styles.cardUserName}>
                  {auth().currentUser
                    ? (liveProfile?.displayName || displayName || auth().currentUser?.displayName || 'VIP Member')
                    : 'Guest User'}
                </Text>
                <Text style={styles.cardUserSub}>
                  {auth().currentUser
                    ? (auth().currentUser?.email || 'Verified VIP Account')
                    : 'Not signed in'}
                </Text>
                <Text style={styles.cardMemberId}>
                  {auth().currentUser
                    ? (liveProfile?.memberId || `MEMBER NO. VN-${auth().currentUser?.uid.substring(0, 6).toUpperCase()}`)
                    : 'GUEST ACCESS'}
                </Text>
              </View>
            </View>

            {/* Card Bottom Row: Manage Account Action & Verified Pill */}
            <View style={styles.cardBottomRow}>
              <View style={styles.cardActionRow}>
                <Text style={styles.cardActionText}>
                  {auth().currentUser ? 'Manage Profile & Credentials' : 'Sign in to access VIP privileges'}
                </Text>
                <ChevronRight color="#D4AF37" size={13} strokeWidth={2.4} />
              </View>

              <View style={[styles.cardVerifiedPill, !auth().currentUser && { borderColor: '#94A3B8' }]}>
                <Shield color={auth().currentUser ? '#D4AF37' : '#94A3B8'} size={11} strokeWidth={2.2} />
                <Text style={[styles.cardVerifiedText, !auth().currentUser && { color: '#64748B' }]}>
                  {auth().currentUser ? 'VERIFIED VIP' : 'GUEST'}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </LuxuryPressable>

        {/* Horizontal Tier & Perks Carousel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.perksScroll}
        >
          {/* Perk 1: Royal Tier Privileges */}
          <View style={styles.perkCard}>
            <View style={styles.perkIconRow}>
              <Vanir3DIcon name="fasttrack" size={34} />
              <Text style={styles.perkBadgeTitle}>Royal Tier Privileges</Text>
            </View>
            <Text style={styles.perkSubtitle}>Guaranteed priority fleet & luxury suite allocation</Text>
          </View>

          {/* Perk 2: 10% Hotel Discount */}
          <View style={styles.perkCard}>
            <View style={styles.perkIconRow}>
              <Vanir3DIcon name="hotels" size={34} />
              <Text style={styles.perkBadgeTitle}>10% Off Suites</Text>
            </View>
            <Text style={styles.perkSubtitle}>Automatic ultra-luxury suite privileges at checkout</Text>
          </View>

          {/* Perk 3: Free Chauffeur */}
          <View style={styles.perkCard}>
            <View style={styles.perkIconRow}>
              <Vanir3DIcon name="cars" size={34} />
              <Text style={styles.perkBadgeTitle}>{t('screens.profile.airportChauffeur', 'Airport Chauffeur')}</Text>
            </View>
            <Text style={styles.perkSubtitle}>{t('screens.profile.chauffeurSub', 'Complimentary tarmac limousine terminal escort')}</Text>
          </View>
        </ScrollView>

        {/* Loyalty Wallet / Vanir Coins Bar */}
        <LuxuryPressable
          style={styles.walletBar}
          onPress={() => setShowWalletModal(true)}
        >
          <View style={styles.walletColLeft}>
            <View style={styles.coinsIconRow}>
              <Coins color="#D4AF37" size={17} strokeWidth={2} />
              <Text style={styles.walletAmount}>
                {liveProfile?.walletBalance !== undefined
                  ? `${liveProfile.walletBalance.toLocaleString()} AED ≈ ${(liveProfile.coins ?? Math.round(liveProfile.walletBalance / 10)).toLocaleString()} Coins`
                  : '15,000 AED ≈ 1,500 Coins'}
              </Text>
            </View>
            <Text style={styles.walletSubText}>Redeem Vanir Coins on private aviation and suites</Text>
          </View>

          <View style={styles.walletDivider} />

          <View style={styles.walletColRight}>
            <View style={styles.coinsIconRow}>
              <Ticket color="#D4AF37" size={17} strokeWidth={2} />
              <Text style={styles.voucherCount}>1 VIP Voucher</Text>
            </View>
            <Text style={styles.walletSubText}>15% Welcome Journey Discount</Text>
          </View>
        </LuxuryPressable>

        {/* 2 Big Action Cards (All Bookings & Awaiting Travel) */}
        <View style={styles.twoActionCardsRow}>
          <LuxuryPressable
            style={styles.twoActionCard}
            onPress={() => setShowBookingsModal(true)}
          >
            <Vanir3DIcon name="noc" size={48} style={{ marginBottom: 8 }} />
            <Text style={styles.bigActionTitle}>{t('screens.profile.allBookings', 'All Bookings')}</Text>
            <Text style={styles.bigActionSub}>{t('screens.profile.reviewHistory', 'Review travel history')}</Text>
          </LuxuryPressable>

          <LuxuryPressable
            style={styles.twoActionCard}
            onPress={() => setShowAwaitingTravelModal(true)}
          >
            <Vanir3DIcon name="itinerary" size={48} style={{ marginBottom: 8 }} />
            <Text style={styles.bigActionTitle}>{t('screens.profile.awaitingTravel', 'Awaiting Travel')}</Text>
            <Text style={styles.bigActionSub}>{t('screens.profile.upcomingItineraries', 'Upcoming itineraries')}</Text>
          </LuxuryPressable>
        </View>

        {/* 3: Profile Menu Grid (Image 5): Standardized 6 Icon Buttons */}
        <View style={styles.gridCard}>
          {/* Row 1 */}
          <View style={styles.gridRow}>
            {/* 1: Awaiting Review */}
            <LuxuryPressable
              style={styles.gridItem}
              onPress={() => navigation.navigate('Reviews')}
            >
              <View style={styles.gridIconCircle}>
                <FileEdit color="#D4AF37" size={20} strokeWidth={1.8} />
              </View>
              <Text style={styles.gridItemLabel}>{t('screens.profile.awaitingReview', 'Awaiting Review')}</Text>
            </LuxuryPressable>

            {/* 2: Favorites */}
            <LuxuryPressable
              style={styles.gridItem}
              onPress={() => setShowFavoritesModal(true)}
            >
              <View style={styles.gridIconCircle}>
                <Heart color="#D4AF37" size={20} strokeWidth={1.8} />
              </View>
              <Text style={styles.gridItemLabel}>{t('screens.profile.favorites', 'Favorites')}</Text>
            </LuxuryPressable>

            {/* 3: My Cards */}
            <LuxuryPressable
              style={styles.gridItem}
              onPress={() => navigation.navigate('PaymentMethods')}
            >
              <View style={styles.gridIconCircle}>
                <CreditCard color="#D4AF37" size={20} strokeWidth={1.8} />
              </View>
              <Text style={styles.gridItemLabel}>{t('screens.profile.myCards', 'My Cards')}</Text>
            </LuxuryPressable>
          </View>

          <View style={styles.gridDivider} />

          {/* Row 2 */}
          <View style={styles.gridRow}>
            {/* 4: Frequent Travelers */}
            <LuxuryPressable
              style={styles.gridItem}
              onPress={() => navigation.navigate('TravelPreferences')}
            >
              <View style={styles.gridIconCircle}>
                <UserCheck color="#D4AF37" size={20} strokeWidth={1.8} />
              </View>
              <Text style={styles.gridItemLabel}>{t('screens.profile.frequentTravelers', 'Frequent Travelers')}</Text>
            </LuxuryPressable>

            {/* 5: Customer Support */}
            <LuxuryPressable
              style={styles.gridItem}
              onPress={() => navigation.navigate('CustomerSupport')}
            >
              <View style={styles.gridIconCircle}>
                <Headphones color="#D4AF37" size={20} strokeWidth={1.8} />
              </View>
              <Text style={styles.gridItemLabel}>{t('screens.profile.support', 'Customer Support')}</Text>
            </LuxuryPressable>

            {/* 6: Preferences & Unit */}
            <LuxuryPressable
              style={styles.gridItem}
              onPress={() => setShowUnitModal(true)}
            >
              <View style={styles.gridIconCircle}>
                <Globe color="#D4AF37" size={20} strokeWidth={1.8} />
              </View>
              <Text style={styles.gridItemLabel}>{t('screens.profile.preferences', 'Preferences')}</Text>
            </LuxuryPressable>
          </View>
        </View>

        {/* 4: List Settings Refinement: Clean flat action list with elegant line separators */}
        <View style={styles.menuListFlat}>
          {/* Row 0: Vanir VIP Gallery */}
          <LuxuryPressable
            style={styles.menuRowFlat}
            onPress={() => navigation.navigate('Gallery')}
          >
            <View style={styles.menuRowLeft}>
              <Camera color="#D4AF37" size={19} strokeWidth={1.8} />
              <Text style={styles.menuRowTitle}>{t('screens.profile.gallery', 'Vanir VIP Photo Gallery')}</Text>
            </View>
            <ChevronRight color="#D4AF37" size={16} strokeWidth={2} />
          </LuxuryPressable>

          <View style={styles.flatLineSeparator} />

          {/* Row 1: About VANIR */}
          <LuxuryPressable
            style={styles.menuRowFlat}
            onPress={() => navigation.navigate('About')}
          >
            <View style={styles.menuRowLeft}>
              <Info color="#D4AF37" size={19} strokeWidth={1.8} />
              <Text style={styles.menuRowTitle}>{t('screens.profile.aboutSection', 'About VANIR Concierge')}</Text>
            </View>
            <ChevronRight color="#D4AF37" size={16} strokeWidth={2} />
          </LuxuryPressable>

          <View style={styles.flatLineSeparator} />

          {/* Row 2: Rate This App */}
          <LuxuryPressable
            style={styles.menuRowFlat}
            onPress={() => setShowRatingModal(true)}
          >
            <View style={styles.menuRowLeft}>
              <Star color="#D4AF37" size={19} strokeWidth={1.8} />
              <Text style={styles.menuRowTitle}>{t('screens.profile.rateApp', 'Rate This App')}</Text>
            </View>
            <ChevronRight color="#D4AF37" size={16} strokeWidth={2} />
          </LuxuryPressable>

          <View style={styles.flatLineSeparator} />

          {/* Row 3: Terms, Privacy & Security */}
          <LuxuryPressable
            style={styles.menuRowFlat}
            onPress={() => navigation.navigate('PrivacySecurity')}
          >
            <View style={styles.menuRowLeft}>
              <Shield color="#D4AF37" size={19} strokeWidth={1.8} />
              <Text style={styles.menuRowTitle}>{t('screens.profile.terms', 'Terms, Privacy & Security')}</Text>
            </View>
            <ChevronRight color="#D4AF37" size={16} strokeWidth={2} />
          </LuxuryPressable>

          <View style={styles.flatLineSeparator} />

          {/* Row 4: Sign Out (Premium Muted Crimson / Burgundy Wine) */}
          <LuxuryPressable style={styles.menuRowFlat} onPress={handleSignOut}>
            <View style={styles.menuRowLeft}>
              <LogOut color="#8B1E2D" size={19} strokeWidth={1.6} />
              <Text style={styles.signOutTitle}>{t('screens.profile.signOut', 'Sign Out')}</Text>
            </View>
            <ChevronRight color="#8B1E2D" size={16} strokeWidth={1.8} />
          </LuxuryPressable>
        </View>
      </ScrollView>

      {/* Modal 1: Digital VIP Member Pass & QR Code */}
      <Modal
        visible={showQrModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQrModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>VIP Digital Member Card</Text>
              <Pressable onPress={() => setShowQrModal(false)} style={styles.modalCloseBtn}>
                <X color="#64748B" size={20} />
              </Pressable>
            </View>

            <LinearGradient
              colors={['#FFFFFF', '#FAF7F0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.digitalCard}
            >
              <View style={styles.digitalCardTop}>
                <Text style={styles.digitalCardBrand}>VANIR</Text>
                <View style={styles.royalTierBadge}>
                  <Crown color="#D4AF37" size={10} strokeWidth={2.4} />
                  <Text style={styles.royalTierBadgeText}>ROYAL TIER</Text>
                </View>
              </View>
              <Text style={styles.digitalCardName}>{displayName}</Text>
              <Text style={styles.digitalCardId}>
                MEMBER NO. {auth().currentUser?.uid ? `VN-${auth().currentUser?.uid.substring(0, 6).toUpperCase()}` : 'VN-0042'}
              </Text>
            </LinearGradient>

            <View style={styles.qrContainer}>
              <RealQRCode
                value={`https://vanir.vip/vip/member/${auth().currentUser?.uid || 'VIP-MEMBER-777'}`}
                size={145}
                color="#1C1917"
                backgroundColor="#FFFFFF"
              />
              <Text style={styles.qrInstruction}>
                Scan at airport VIP lounges, five-star partner desks, and concierge docks.
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal 2: Vanir Coins & Wallet */}
      <Modal
        visible={showWalletModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWalletModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Vanir Rewards & Vouchers</Text>
              <Pressable onPress={() => setShowWalletModal(false)} style={styles.modalCloseBtn}>
                <X color="#64748B" size={20} />
              </Pressable>
            </View>

            <View style={styles.walletModalCard}>
              <Coins color="#F59E0B" size={32} />
              <Text style={styles.walletModalAmount}>0 Vanir Coins</Text>
              <Text style={styles.walletModalDesc}>
                Earn 5 coins for every 100 AED spent on hotels, flights, and yachts. Redeemable as instant discounts on checkout.
              </Text>
            </View>

            <View style={styles.voucherItem}>
              <View style={styles.voucherLeft}>
                <Text style={styles.voucherTitle}>VANIR-WELCOME-15</Text>
                <Text style={styles.voucherSub}>15% Off Your Next Hotel or Flight Booking</Text>
              </View>
              <View style={styles.voucherActivePill}>
                <Text style={styles.voucherActiveText}>ACTIVE</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal 3: All Bookings */}
      <Modal
        visible={showBookingsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBookingsModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>My VIP Reservations</Text>
              <Pressable onPress={() => setShowBookingsModal(false)} style={styles.modalCloseBtn}>
                <X color="#64748B" size={20} />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 340 }}>
              <View style={styles.bookingCard}>
                <View style={styles.bookingCardHeader}>
                  <Plane color="#D4AF37" size={18} />
                  <Text style={styles.bookingCardType}>Emirates First Class (DXB ➔ LHR)</Text>
                </View>
                <Text style={styles.bookingCardDate}>Flight EK003 • Nov 20, 2026 • Suite 1A</Text>
                <View style={styles.statusConfirmed}>
                  <Check color="#16A34A" size={14} />
                  <Text style={styles.statusConfirmedText}>CONFIRMED</Text>
                </View>
              </View>

              <View style={styles.bookingCard}>
                <View style={styles.bookingCardHeader}>
                  <Building color="#B45309" size={18} />
                  <Text style={styles.bookingCardType}>Burj Al Arab Jumeirah</Text>
                </View>
                <Text style={styles.bookingCardDate}>Deluxe Marina Suite • 3 Nights</Text>
                <View style={styles.statusConfirmed}>
                  <Check color="#16A34A" size={14} />
                  <Text style={styles.statusConfirmedText}>CONFIRMED</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal 4: Awaiting Travel */}
      <Modal
        visible={showAwaitingTravelModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAwaitingTravelModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Awaiting Travel</Text>
              <Pressable onPress={() => setShowAwaitingTravelModal(false)} style={styles.modalCloseBtn}>
                <X color="#64748B" size={20} />
              </Pressable>
            </View>

            <View style={styles.awaitingCard}>
              <Luggage color="#D97706" size={28} />
              <Text style={styles.awaitingTitle}>Upcoming Dubai to London Journey</Text>
              <Text style={styles.awaitingDates}>Nov 20, 2026 – Dec 05, 2026</Text>
              <Text style={styles.awaitingDetail}>
                Your private airport chauffeur and priority immigration fast-track have been scheduled with flight EK003.
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal 5: Favorites */}
      <Modal
        visible={showFavoritesModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFavoritesModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>My Wishlist & Favorites</Text>
              <Pressable onPress={() => setShowFavoritesModal(false)} style={styles.modalCloseBtn}>
                <X color="#64748B" size={20} />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 300 }}>
              <View style={styles.favItemRow}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=400&q=80' }}
                  style={styles.favThumb}
                />
                <View style={styles.favItemInfo}>
                  <Text style={styles.favItemTitle}>Burj Al Arab Jumeirah</Text>
                  <Text style={styles.favItemPrice}>From $1,950 / night</Text>
                </View>
              </View>

              <View style={styles.favItemRow}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1541971875076-8f970d573be6?w=400&q=80' }}
                  style={styles.favThumb}
                />
                <View style={styles.favItemInfo}>
                  <Text style={styles.favItemTitle}>The Ritz London</Text>
                  <Text style={styles.favItemPrice}>From £1,150 / night</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal 6: Rate This App */}
      <Modal
        visible={showRatingModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRatingModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Rate VANIR Concierge</Text>
              <Pressable onPress={() => setShowRatingModal(false)} style={styles.modalCloseBtn}>
                <X color="#64748B" size={20} />
              </Pressable>
            </View>

            <Text style={styles.ratingSub}>
              How would you rate your VIP luxury experience with VANIR?
            </Text>

            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(starNum => (
                <Pressable
                  key={starNum}
                  onPress={() => setSelectedRating(starNum)}
                  style={styles.starBtn}
                >
                  <Star
                    color={starNum <= selectedRating ? '#F59E0B' : '#CBD5E1'}
                    fill={starNum <= selectedRating ? '#F59E0B' : 'transparent'}
                    size={32}
                  />
                </Pressable>
              ))}
            </View>

            <Pressable style={styles.submitRatingBtn} onPress={handleRateSubmit}>
              <Text style={styles.submitRatingText}>
                {ratedSuccess ? 'Submitting...' : 'Submit 5-Star Rating'}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal 7: Preferences (Language, Distance unit & Currency) */}
      <Modal
        visible={showUnitModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUnitModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>{t('screens.profile.preferences', 'App Preferences')}</Text>
              <Pressable onPress={() => setShowUnitModal(false)} style={styles.modalCloseBtn}>
                <X color="#64748B" size={20} />
              </Pressable>
            </View>

            {/* Language Selector (4 Languages: EN, AR, FR, RU) */}
            <Text style={styles.prefLabel}>{t('screens.profile.language', 'App Language')}</Text>
            <View style={styles.langGrid}>
              {SUPPORTED_LANGUAGES.map(lang => {
                const isSelected = currentLanguage === lang.code;
                return (
                  <Pressable
                    key={lang.code}
                    style={[styles.langCard, isSelected && styles.langCardActive]}
                    onPress={() => handleSelectLanguage(lang.code)}
                  >
                    <Text style={styles.langFlag}>{lang.flag}</Text>
                    <View style={styles.langInfo}>
                      <Text style={[styles.langNativeName, isSelected && styles.langNativeNameActive]}>
                        {lang.nativeName}
                      </Text>
                      <Text style={styles.langSubName}>{lang.name}</Text>
                    </View>
                    {isSelected ? (
                      <View style={styles.langCheckBadge}>
                        <Check color="#D4AF37" size={13} strokeWidth={3} />
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.prefLabel, { marginTop: 18 }]}>
              {t('screens.profile.distanceUnit', 'Preferred Distance Unit')}
            </Text>
            <View style={styles.unitRow}>
              {(['km', 'mi'] as const).map(u => (
                <Pressable
                  key={u}
                  style={[styles.unitBtn, distanceUnit === u && styles.unitBtnActive]}
                  onPress={() => setDistanceUnit(u)}
                >
                  <Text style={[styles.unitText, distanceUnit === u && styles.unitTextActive]}>
                    {u.toUpperCase()} ({u === 'km' ? 'Kilometers' : 'Miles'})
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.prefLabel, { marginTop: 16 }]}>
              {t('screens.profile.displayCurrency', 'Display Currency')}
            </Text>
            <View style={styles.unitRow}>
              {['AED', 'USD', 'EUR', 'GBP'].map(curr => (
                <Pressable
                  key={curr}
                  style={[styles.unitBtn, currency === curr && styles.unitBtnActive]}
                  onPress={() => setCurrency(curr)}
                >
                  <Text style={[styles.unitText, currency === curr && styles.unitTextActive]}>
                    {curr}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              style={[styles.submitRatingBtn, { marginTop: 22 }]}
              onPress={() => setShowUnitModal(false)}
            >
              <Text style={styles.submitRatingText}>{t('screens.profile.done', 'Done')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  topBar: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FAF9F6',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarCenter: {
    alignItems: 'center',
  },
  topBarTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 1.2,
  },
  topBarSub: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  iconBtn: {
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
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
    gap: 16,
  },
  /* ── 1 & 2: Luxury Metal / Dark Glass Credit Card ── */
  metalCreditCardContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.45)',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 6,
  },
  metalCreditCard: {
    padding: 18,
    borderRadius: 20,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardBrandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emvChip: {
    width: 30,
    height: 22,
    borderRadius: 5,
    backgroundColor: '#D4AF37',
    position: 'relative',
    overflow: 'hidden',
  },
  emvChipLine: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: '#8F7520',
  },
  emvChipLineH: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 14,
    width: 1.5,
    backgroundColor: '#8F7520',
  },
  cardBrandText: {
    color: '#1C1917',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  royalTierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(212, 175, 55, 0.16)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 6,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 2,
  },
  royalTierBadgeText: {
    color: '#D4AF37',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  cardMiddleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  cardAvatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    backgroundColor: '#FAF9F6',
    overflow: 'hidden',
    position: 'relative',
  },
  cardAvatarImg: {
    width: '100%',
    height: '100%',
  },
  cardAvatarFallback: {
    color: '#D4AF37',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 52,
  },
  cardAvatarDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cardUserCol: {
    flex: 1,
  },
  cardUserName: {
    color: '#1C1917',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  cardUserSub: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  cardMemberId: {
    color: '#D4AF37',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.2)',
    paddingTop: 12,
  },
  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardActionText: {
    color: '#1C1917',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  cardVerifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(212, 175, 55, 0.14)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  cardVerifiedText: {
    color: '#D4AF37',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  /* ── Perks Carousel ── */
  perksScroll: {
    gap: 12,
    paddingRight: 16,
  },
  perkCard: {
    width: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  perkIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  perkIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  perkBadgeTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1C1917',
  },
  perkSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },
  /* ── Loyalty Wallet ── */
  walletBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  walletColLeft: {
    flex: 1,
  },
  walletColRight: {
    flex: 1,
    paddingLeft: 16,
  },
  walletDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
  },
  coinsIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  walletAmount: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1C1917',
  },
  voucherCount: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1C1917',
  },
  walletSubText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  /* ── 2 Big Action Cards ── */
  twoActionCardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  twoActionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  bigActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  bigActionTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#1C1917',
  },
  bigActionSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  /* ── 3: Profile Menu Grid (Standardized 6 Icon Buttons) ── */
  gridCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  gridItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  gridIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },
  gridItemLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#1C1917',
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  gridDivider: {
    height: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    marginVertical: 8,
    marginHorizontal: 8,
  },
  /* ── 4: List Settings Refinement (Flat layout with elegant line separators) ── */
  menuListFlat: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    overflow: 'hidden',
  },
  menuRowFlat: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuRowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1917',
    letterSpacing: 0.2,
  },
  flatLineSeparator: {
    height: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    marginHorizontal: 16,
  },
  signOutTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
    letterSpacing: 0.3,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    backgroundColor: '#FAF9F6',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1C1917',
  },
  modalCloseBtn: {
    padding: 4,
  },
  digitalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#D4AF37',
    marginBottom: 16,
  },
  digitalCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  digitalCardBrand: {
    fontSize: 18,
    fontWeight: '900',
    color: '#D4AF37',
    letterSpacing: 2,
  },
  digitalCardTier: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 1,
  },
  digitalCardName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1917',
  },
  digitalCardId: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  qrInstruction: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 18,
  },
  walletModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  walletModalAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: '#D4AF37',
    marginTop: 8,
  },
  walletModalDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  voucherItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    backgroundColor: '#FFFFFF',
  },
  voucherLeft: {
    flex: 1,
  },
  voucherTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1917',
  },
  voucherSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  voucherActivePill: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  voucherActiveText: {
    color: '#1C1917',
    fontSize: 10,
    fontWeight: '800',
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    marginBottom: 10,
  },
  bookingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  bookingCardType: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1917',
  },
  bookingCardDate: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  statusConfirmed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 0.8,
    borderColor: '#16A34A',
  },
  statusConfirmedText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#16A34A',
  },
  awaitingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  awaitingTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#D4AF37',
    marginTop: 8,
    textAlign: 'center',
  },
  awaitingDates: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1917',
    marginTop: 4,
  },
  awaitingDetail: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  favItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.15)',
  },
  favThumb: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  favItemInfo: {
    flex: 1,
  },
  favItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1917',
  },
  favItemPrice: {
    fontSize: 12,
    color: '#D4AF37',
    marginTop: 2,
  },
  ratingSub: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 14,
  },
  starBtn: {
    padding: 4,
  },
  submitRatingBtn: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  submitRatingText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1917',
  },
  prefLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1917',
    marginBottom: 8,
  },
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  langCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FAF9F6',
    borderWidth: 1.2,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  langCardActive: {
    backgroundColor: '#FFFDF5',
    borderColor: '#D4AF37',
    borderWidth: 1.8,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  langFlag: {
    fontSize: 22,
  },
  langInfo: {
    flex: 1,
  },
  langNativeName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1917',
  },
  langNativeNameActive: {
    color: '#B45309',
    fontWeight: '800',
  },
  langSubName: {
    fontSize: 10,
    color: '#78716C',
    marginTop: 1,
  },
  langCheckBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FAF7EE',
    borderWidth: 1,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitRow: {
    flexDirection: 'row',
    gap: 8,
  },
  unitBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  unitBtnActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderColor: '#D4AF37',
  },
  unitText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  unitTextActive: {
    color: '#1C1917',
    fontWeight: '800',
  },
});
