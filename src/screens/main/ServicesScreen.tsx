import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  RefreshControl,
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
import { useTranslation } from 'react-i18next';
import {
  CommercialFlightIcon,
  PrivateJetIcon,
  HotelApartmentsIcon,
  HotelResortIcon,
  SuperyachtIcon,
  LimousineIcon,
  VipGalleryIcon,
  LuxuryTourIcon,
  LuxuryMagazineIcon,
  GlobalEsimIcon,
  VisaServiceIcon,
  FastTrackIcon,
  AiConciergeIcon,
  OfficesIcon,
  NavSearchIcon,
} from '../../components/LuxuryNavIcons';
import { Vanir3DIcon } from '../../components/Vanir3DIcon';
import { InteractiveServicesSection } from '../../components/InteractiveServicesSection';
import {
  ChevronRight,
  Search,
  SlidersHorizontal,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  X,
} from 'lucide-react-native';
import { LuxuryPressable } from '../../components/LuxuryMicroInteractions';
import type { RootStackParamList } from '../../navigation/types';
import {
  getLiveAppControls,
  subscribeLiveAppControls,
  type ServiceControls,
} from '../../services/firestore';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export type ServiceCategoryKey = 'all' | 'aviation' | 'stays' | 'fleet' | 'concierge' | 'utilities';

export interface ServiceCardItem {
  id: string;
  category: ServiceCategoryKey;
  icon: React.ComponentType<any>;
  title: string;
  subtitle: string;
  badge?: string;
  route: keyof RootStackParamList;
  controlKey?: keyof ServiceControls;
}

export const ALL_SERVICES: ServiceCardItem[] = [
  // 1. Aviation & Air Escapes
  {
    id: 'flights',
    category: 'aviation',
    icon: CommercialFlightIcon,
    title: 'Commercial & VIP Flights',
    subtitle: 'First class suites & commercial airline booking worldwide',
    badge: 'FIRST CLASS',
    route: 'FlightBooking',
    controlKey: 'flights',
  },
  {
    id: 'private_jet',
    category: 'aviation',
    icon: PrivateJetIcon,
    title: 'Private Aviation & Jets',
    subtitle: 'Ultra long-range Gulfstream & Bombardier private charter',
    badge: 'VIP CHARTER',
    route: 'PrivateJet',
    controlKey: 'private_jet',
  },
  {
    id: 'fasttrack',
    category: 'aviation',
    icon: FastTrackIcon,
    title: 'Airport Fast-Track & Lounges',
    subtitle: 'VIP meet & assist, tarmac escort & private customs lounge',
    badge: 'AIRPORT VIP',
    route: 'Airport',
    controlKey: 'fasttrack',
  },

  // 2. Luxury Stays & Residences
  {
    id: 'hotels',
    category: 'stays',
    icon: HotelResortIcon,
    title: 'Luxury Hotels & Resorts',
    subtitle: '5-star world-class beachfront villas, palaces & royal suites',
    badge: '5-STAR PALACES',
    route: 'HotelBooking',
    controlKey: 'hotels',
  },
  {
    id: 'apartments',
    category: 'stays',
    icon: HotelApartmentsIcon,
    title: 'Hotel Apartments & Penthouses',
    subtitle: 'Luxury serviced private residences & extended skyline penthouses',
    badge: 'RESIDENCES',
    route: 'HotelApartments',
    controlKey: 'apartments',
  },

  // 3. Superyachts & Executive Fleet
  {
    id: 'yachts',
    category: 'fleet',
    icon: SuperyachtIcon,
    title: 'Luxury Superyachts',
    subtitle: 'Private mega-yacht charters, marine escapes & island cruising',
    badge: 'MEGA YACHTS',
    route: 'Yacht',
    controlKey: 'yachts',
  },
  {
    id: 'cars',
    category: 'fleet',
    icon: LimousineIcon,
    title: 'Limousine & Executive Fleet',
    subtitle: 'Uniformed chauffeur, Rolls-Royce, Maybach & armored sedans',
    badge: 'CHAUFFEUR',
    route: 'Cars',
    controlKey: 'cars',
  },

  // 4. Curated Expeditions & VIP Concierge
  {
    id: 'tours',
    category: 'concierge',
    icon: LuxuryTourIcon,
    title: 'Luxury Tours & Expeditions',
    subtitle: 'Curated royal expeditions, desert oases & bespoke day trips',
    badge: 'CURATED',
    route: 'Tours',
    controlKey: 'tours',
  },
  {
    id: 'ai',
    category: 'concierge',
    icon: AiConciergeIcon,
    title: 'AI 24/7 Travel Concierge',
    subtitle: 'Intelligent multi-lingual travel curation & immediate reservations',
    badge: '24/7 AI AGENT',
    route: 'AIConcierge',
    controlKey: 'ai_concierge',
  },
  {
    id: 'gallery',
    category: 'concierge',
    icon: VipGalleryIcon,
    title: 'VIP Fleet & Residence Showcase',
    subtitle: 'Cinematic editorial gallery of private jets, yachts & suites',
    badge: 'EDITORIAL',
    route: 'Gallery',
    controlKey: 'gallery',
  },
  {
    id: 'blog',
    category: 'concierge',
    icon: LuxuryMagazineIcon,
    title: 'Vanir Luxury Magazine & Blog',
    subtitle: 'Editorial insider stories, destination guides & secret retreats',
    badge: 'MAGAZINE',
    route: 'Blog',
    controlKey: 'blog',
  },
  {
    id: 'destinations',
    category: 'concierge',
    icon: LuxuryTourIcon,
    title: 'World Destinations & Cities',
    subtitle: 'Explore European, Greek, Turkish & Gulf destinations and top palaces',
    badge: 'GLOBAL GUIDE',
    route: 'Destinations',
  },
  {
    id: 'offers',
    category: 'concierge',
    icon: LuxuryMagazineIcon,
    title: 'Exclusive Offers & Promo Codes',
    subtitle: 'Special seasonal privileges, private jet vouchers & luxury discounts',
    badge: 'VIP DEALS',
    route: 'Offers',
  },

  // 5. Global Travel Utilities
  {
    id: 'esim',
    category: 'utilities',
    icon: GlobalEsimIcon,
    title: 'Global High-Speed eSIM',
    subtitle: 'Instant international 5G connectivity for 180+ countries',
    badge: '180+ NATIONS',
    route: 'ESIM',
    controlKey: 'esim',
  },
  {
    id: 'visa',
    category: 'utilities',
    icon: VisaServiceIcon,
    title: 'VIP Visa Services & Guidance',
    subtitle: 'Diplomatic & expedited tourist visa processing worldwide',
    badge: 'EXPEDITED',
    route: 'Visa',
    controlKey: 'visa',
  },
  {
    id: 'offices',
    category: 'utilities',
    icon: OfficesIcon,
    title: 'Global VIP Offices & Diplomatic Network',
    subtitle: 'Direct private concierge offices across London, Dubai & Cairo',
    badge: 'WORLDWIDE',
    route: 'Offices',
    controlKey: 'offices',
  },
];

const CATEGORY_TABS: { key: ServiceCategoryKey; label: string; count: number }[] = [
  { key: 'all', label: 'All Services', count: 14 },
  { key: 'aviation', label: 'Aviation', count: 3 },
  { key: 'stays', label: 'Luxury Stays', count: 2 },
  { key: 'fleet', label: 'Marine & Fleet', count: 2 },
  { key: 'concierge', label: 'VIP Concierge', count: 4 },
  { key: 'utilities', label: 'Travel Utilities', count: 3 },
];

const SECTION_HEADERS: Record<ServiceCategoryKey, { title: string; subtitle: string }> = {
  all: {
    title: 'COMPLETE PRIVATE PORTFOLIO',
    subtitle: 'All 14 bespoke VIP travel & concierge solutions',
  },
  aviation: {
    title: 'AVIATION & AIR ESCAPES',
    subtitle: 'First class commercial lines, private jet charters & fast-track lounges',
  },
  stays: {
    title: 'LUXURY STAYS & RESIDENCES',
    subtitle: '5-star palaces, private beachfront villas & serviced penthouses',
  },
  fleet: {
    title: 'SUPERYACHTS & CHAUFFEUR FLEET',
    subtitle: 'Luxury marine yachts, executive sedans & armored VIP limousines',
  },
  concierge: {
    title: 'CURATED EXPEDITIONS & VIP CONCIERGE',
    subtitle: '24/7 AI travel designer, bespoke tours, editorial magazine & gallery',
  },
  utilities: {
    title: 'GLOBAL TRAVEL UTILITIES',
    subtitle: 'Worldwide 5G eSIM connectivity, expedited visas & private offices',
  },
};

export function ServicesScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [controls, setControls] = useState<ServiceControls | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ServiceCategoryKey>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categoryTabs = useMemo(() => [
    { key: 'all' as ServiceCategoryKey, label: t('screens.services.all', 'All Services'), count: 14 },
    { key: 'aviation' as ServiceCategoryKey, label: t('screens.services.aviation', 'Private Aviation'), count: 3 },
    { key: 'stays' as ServiceCategoryKey, label: t('screens.services.stays', 'Palaces & Hotels'), count: 2 },
    { key: 'fleet' as ServiceCategoryKey, label: t('screens.services.fleet', 'Yachts & Fleet'), count: 2 },
    { key: 'concierge' as ServiceCategoryKey, label: t('screens.services.concierge', 'VIP Concierge'), count: 4 },
    { key: 'utilities' as ServiceCategoryKey, label: t('screens.services.utilities', 'Travel Utilities'), count: 3 },
  ], [t]);

  useEffect(() => {
    getLiveAppControls().then(ctrl => {
      if (ctrl) setControls(ctrl);
    });

    const unsubscribe = subscribeLiveAppControls(ctrl => {
      if (ctrl) setControls(ctrl);
    });

    return () => unsubscribe();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const ctrl = await getLiveAppControls();
      if (ctrl) setControls(ctrl);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Filter services by category and search query
  const filteredServices = useMemo(() => {
    let list = ALL_SERVICES;
    if (activeCategory !== 'all') {
      list = list.filter(s => s.category === activeCategory);
    }
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        s =>
          s.title.toLowerCase().includes(q) ||
          s.subtitle.toLowerCase().includes(q) ||
          (s.badge && s.badge.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [activeCategory, searchQuery]);

  const handleServicePress = (service: ServiceCardItem) => {
    const isExplicitlyDisabled =
      controls &&
      service.controlKey &&
      controls[service.controlKey] === false;

    if (isExplicitlyDisabled) {
      Alert.alert(
        'Concierge Schedule Update',
        'This service is undergoing live concierge catalog updates. Please select another service or contact your 24/7 dedicated advisor.',
      );
      return;
    }

    navigation.navigate(service.route as any);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerTextCol}>
            <View style={styles.kickerRow}>
              <View style={styles.livePulseDot} />
              <Text style={styles.kickerText}>{t('screens.services.kicker', 'VIP BESPOKE CONCIERGE')}</Text>
            </View>
            <Text style={styles.headerTitle}>
              VANIR <Text style={styles.headerTitleGold}>{t('categories.all', 'SERVICES').toUpperCase()}</Text>
            </Text>
            <Text style={styles.headerSub} numberOfLines={1}>
              {t('screens.services.subtitle', '14 Bespoke VIP Travel Solutions')}
            </Text>
          </View>

          <View style={styles.logoBadgeContainer}>
            <Image
              source={require('../../assets/vanir_round_logo.png')}
              style={styles.logoBadgeImg}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Emergency / Notice Broadcast Banner from Admin Dashboard */}
        {controls?.emergency_notice && controls.emergency_notice.trim().length > 0 && (
          <View style={styles.noticeBanner}>
            <AlertTriangle color="#D4AF37" size={16} strokeWidth={2.2} />
            <Text style={styles.noticeText} numberOfLines={2}>
              {controls.emergency_notice}
            </Text>
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <NavSearchIcon color="#C5A059" size={18} strokeWidth={1.5} />
          <TextInput
            placeholder={t('screens.services.searchPlaceholder', 'Search private aviation, superyachts, suites, eSIM...')}
            placeholderTextColor="#78716C"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <LuxuryPressable onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X color="#64748B" size={16} strokeWidth={2} />
            </LuxuryPressable>
          )}
        </View>

        {/* Category Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryChipsScroll}
        >
          {categoryTabs.map(tab => {
            const isActive = activeCategory === tab.key;
            return (
              <LuxuryPressable
                key={tab.key}
                onPress={() => setActiveCategory(tab.key)}
                style={[styles.categoryChip, isActive && styles.categoryChipActive]}
              >
                <Text style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}>
                  {tab.label}
                </Text>
                <View style={[styles.chipCountPill, isActive && styles.chipCountPillActive]}>
                  <Text style={[styles.chipCountText, isActive && styles.chipCountTextActive]}>
                    {tab.count}
                  </Text>
                </View>
              </LuxuryPressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Services List Scroll */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 + insets.bottom }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#D4AF37"
            colors={['#D4AF37', '#B45309']}
          />
        }
      >
        {/* Interactive On-Demand Lifestyle Services & Car Rental Promo */}
        {activeCategory === 'all' && searchQuery.trim().length === 0 && (
          <View style={{ marginHorizontal: -16 }}>
            <InteractiveServicesSection navigation={navigation} compactMode={true} />
          </View>
        )}

        {/* Section Header Description */}
        <View style={styles.sectionMetaHeader}>
          <Text style={styles.sectionKicker}>{SECTION_HEADERS[activeCategory].title}</Text>
          <Text style={styles.sectionSubtitle}>{SECTION_HEADERS[activeCategory].subtitle}</Text>
        </View>

        {/* Filtered Services Cards */}
        <View style={styles.servicesGrid}>
          {filteredServices.map(service => {
            const Icon = service.icon;
            const isExplicitlyDisabled =
              controls &&
              service.controlKey &&
              controls[service.controlKey] === false;

            return (
              <LuxuryPressable
                key={service.id}
                style={[
                  styles.serviceCard,
                  isExplicitlyDisabled && styles.serviceCardDisabled,
                ]}
                onPress={() => handleServicePress(service)}
                accessibilityRole="button"
                accessibilityLabel={service.title}
              >
                {/* 3D Dark Navy Squircle Luxury Icon */}
                <Vanir3DIcon name={service.id} size={54} />

                {/* Text Content */}
                <View style={styles.cardContentCol}>
                  <View style={styles.titleRow}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {service.title}
                    </Text>

                    {/* Badge Pill */}
                    {isExplicitlyDisabled ? (
                      <View style={styles.pausedBadge}>
                        <Text style={styles.pausedBadgeText}>PAUSED</Text>
                      </View>
                    ) : service.badge ? (
                      <View style={styles.statusPill}>
                        <Text style={styles.statusPillText}>{service.badge}</Text>
                      </View>
                    ) : null}
                  </View>

                  <Text style={styles.cardSubtitle} numberOfLines={2}>
                    {isExplicitlyDisabled
                      ? 'Service temporarily undergoing live schedule optimization.'
                      : service.subtitle}
                  </Text>

                  {/* Active Live Link Indicator */}
                  <View style={styles.cardFooterRow}>
                    <View style={styles.liveIndicatorRow}>
                      <View
                        style={[
                          styles.dotLive,
                          isExplicitlyDisabled && { backgroundColor: '#EF4444' },
                        ]}
                      />
                      <Text style={styles.liveIndicatorText}>
                        {isExplicitlyDisabled
                          ? t('screens.services.maintenanceUpdate', 'Maintenance Update')
                          : t('screens.services.liveConciergeActive', 'Live Concierge Active')}
                      </Text>
                    </View>

                    <View style={styles.arrowRow}>
                      <Text style={styles.accessText}>{t('screens.services.access', 'Access')}</Text>
                      <ChevronRight color="#D4AF37" size={14} strokeWidth={2.4} />
                    </View>
                  </View>
                </View>
              </LuxuryPressable>
            );
          })}

          {filteredServices.length === 0 && (
            <View style={styles.emptyResultsBox}>
              <Sparkles color="#D4AF37" size={28} strokeWidth={1.8} />
              <Text style={styles.emptyTitle}>{t('screens.services.noServicesFound', 'NO SERVICES FOUND')}</Text>
              <Text style={styles.emptySub}>
                {t('screens.services.noServicesSub', 'No private client services match your search inquiry.')}
              </Text>
            </View>
          )}
        </View>

        {/* Global Concierge Assurance Box */}
        <View style={styles.assuranceBox}>
          <ShieldCheck color="#D4AF37" size={20} strokeWidth={2} />
          <View style={{ flex: 1 }}>
            <Text style={styles.assuranceTitle}>{t('screens.services.assuranceTitle', 'VANIR PRIVATE CLIENT GUARANTEE')}</Text>
            <Text style={styles.assuranceDesc}>
              {t('screens.services.assuranceDesc', 'Every service reservation is backed by dedicated human concierge dispatch, 24/7 priority operations, and direct management via our official admin control hub.')}
            </Text>
          </View>
        </View>
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
    backgroundColor: '#FAF9F6',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerTextCol: {
    flex: 1,
    paddingRight: 14,
    justifyContent: 'center',
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  kickerText: {
    color: '#D4AF37',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1C1917',
    letterSpacing: 1,
  },
  headerTitleGold: {
    color: '#D4AF37',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    letterSpacing: 0.2,
    fontWeight: '500',
  },
  logoBadgeContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    backgroundColor: '#FFFFFF',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  logoBadgeImg: {
    width: '100%',
    height: '100%',
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  noticeText: {
    flex: 1,
    color: '#1C1917',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#1C1917',
    padding: 0,
  },
  categoryChipsScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  categoryChipActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.4,
  },
  categoryChipTextActive: {
    color: '#1C1917',
    fontWeight: '800',
  },
  chipCountPill: {
    backgroundColor: '#FAF9F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  chipCountPillActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
  },
  chipCountText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  chipCountTextActive: {
    color: '#1C1917',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 14,
  },
  sectionMetaHeader: {
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  sectionKicker: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.6,
  },
  sectionSubtitle: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  servicesGrid: {
    gap: 12,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    padding: 14,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  serviceCardDisabled: {
    opacity: 0.6,
    backgroundColor: '#F8FAFC',
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FAF7F0',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContentCol: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  cardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.1,
  },
  statusPill: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 0.8,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    flexShrink: 0,
  },
  statusPillText: {
    color: '#D4AF37',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  pausedBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 0.8,
    borderColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pausedBadgeText: {
    color: '#EF4444',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    fontWeight: '500',
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 0.6,
    borderTopColor: 'rgba(212, 175, 55, 0.15)',
  },
  liveIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dotLive: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  liveIndicatorText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.3,
  },
  arrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  accessText: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  emptyResultsBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  emptyTitle: {
    color: '#1C1917',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  emptySub: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  assuranceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    marginTop: 6,
  },
  assuranceTitle: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  assuranceDesc: {
    color: '#64748B',
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
  },
});
