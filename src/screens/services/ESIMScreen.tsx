import React, { useState } from 'react';
import {
  FlatList,
  Modal,
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
  Wifi,
  Check,
  Search,
  Zap,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  ArrowRight,
} from 'lucide-react-native';
import { LuxuryPressable, StaggeredFadeInUp } from '../../components/LuxuryMicroInteractions';
import { GlobalEsimIcon } from '../../components/LuxuryNavIcons';
import { Flag } from '../../components/Flag';
import { MASTER_COUNTRIES, isoToFlag } from '../../data/allCountries';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface CountryItem {
  id: string;
  name: string;
  flag: string;
  region: string;
  popular?: boolean;
}

const COUNTRIES: CountryItem[] = [
  { id: 'global', name: 'Global (180+ Countries)', flag: '🌐', region: 'Global High-Speed', popular: true },
  { id: 'ae', name: 'United Arab Emirates', flag: '🇦🇪', region: 'Middle East', popular: true },
  { id: 'sa', name: 'Saudi Arabia', flag: '🇸🇦', region: 'Middle East', popular: true },
  { id: 'eg', name: 'Egypt', flag: '🇪🇬', region: 'Middle East', popular: true },
  { id: 'qa', name: 'Qatar', flag: '🇶🇦', region: 'Middle East' },
  { id: 'kw', name: 'Kuwait', flag: '🇰🇼', region: 'Middle East' },
  { id: 'bh', name: 'Bahrain', flag: '🇧🇭', region: 'Middle East' },
  { id: 'om', name: 'Oman', flag: '🇴🇲', region: 'Middle East' },
  { id: 'tr', name: 'Turkey', flag: '🇹🇷', region: 'Europe / Middle East', popular: true },
  { id: 'us', name: 'United States', flag: '🇺🇸', region: 'North America', popular: true },
  { id: 'gb', name: 'United Kingdom', flag: '🇬🇧', region: 'Europe', popular: true },
  { id: 'fr', name: 'France', flag: '🇫🇷', region: 'Europe', popular: true },
  { id: 'de', name: 'Germany', flag: '🇩🇪', region: 'Europe' },
  { id: 'it', name: 'Italy', flag: '🇮🇹', region: 'Europe', popular: true },
  { id: 'es', name: 'Spain', flag: '🇪🇸', region: 'Europe' },
  { id: 'ch', name: 'Switzerland', flag: '🇨🇭', region: 'Europe', popular: true },
  { id: 'jp', name: 'Japan', flag: '🇯🇵', region: 'East Asia', popular: true },
  { id: 'sg', name: 'Singapore', flag: '🇸🇬', region: 'East Asia' },
  { id: 'th', name: 'Thailand', flag: '🇹🇭', region: 'Southeast Asia' },
  { id: 'my', name: 'Malaysia', flag: '🇲🇾', region: 'Southeast Asia' },
  { id: 'id', name: 'Indonesia', flag: '🇮🇩', region: 'Southeast Asia' },
  { id: 'ca', name: 'Canada', flag: '🇨🇦', region: 'North America' },
  { id: 'au', name: 'Australia', flag: '🇦🇺', region: 'Oceania' },
  { id: 'gr', name: 'Greece', flag: '🇬🇷', region: 'Europe' },
  { id: 'nl', name: 'Netherlands', flag: '🇳🇱', region: 'Europe' },
  { id: 'at', name: 'Austria', flag: '🇦🇹', region: 'Europe' },
];

// Append every sovereign country in the world
const EXTRA_ESIM_COUNTRIES: CountryItem[] = MASTER_COUNTRIES
  .filter(mc => !COUNTRIES.some(c => c.id.toLowerCase() === mc.iso.toLowerCase()))
  .map(mc => ({
    id: mc.iso.toLowerCase(),
    name: `${mc.en} (${mc.ar})`,
    flag: isoToFlag(mc.iso),
    region:
      mc.continent === 'arab'
        ? 'Middle East'
        : mc.continent === 'europe'
        ? 'Europe'
        : mc.continent === 'americas'
        ? 'Americas'
        : mc.continent === 'asia'
        ? 'Asia'
        : mc.continent === 'africa'
        ? 'Africa'
        : 'Oceania',
  }));

COUNTRIES.push(...EXTRA_ESIM_COUNTRIES);

interface ESIMPackage {
  id: string;
  data: string;
  validity: string;
  price: string;
  badge?: string;
  pricePerDay: string;
}

const PACKAGES: ESIMPackage[] = [
  { id: 'p1', data: '1 GB', validity: '7 Days', price: '$4.99', pricePerDay: '$0.71/day' },
  { id: 'p2', data: '3 GB', validity: '15 Days', price: '$9.99', pricePerDay: '$0.66/day' },
  { id: 'p3', data: '5 GB', validity: '30 Days', price: '$14.99', pricePerDay: '$0.50/day', badge: 'Most Popular' },
  { id: 'p4', data: '10 GB', validity: '30 Days', price: '$22.99', pricePerDay: '$0.76/day', badge: 'Best Value' },
  { id: 'p5', data: '20 GB', validity: '30 Days', price: '$34.99', pricePerDay: '$1.16/day' },
  { id: 'p6', data: 'Unlimited', validity: '15 Days', price: '$49.99', pricePerDay: '$3.33/day', badge: 'VIP Choice' },
];

export function ESIMScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryItem>(COUNTRIES[0]);
  const [selectedPackage, setSelectedPackage] = useState<ESIMPackage>(PACKAGES[2]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const filteredCountries = COUNTRIES.filter(
    c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.region.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCheckout = () => {
    navigation.navigate('Booking', {
      type: 'esim',
      id: `esim-${selectedCountry.id}-${selectedPackage.id}`,
      itemName: `Global eSIM: ${selectedCountry.name} (${selectedPackage.data} / ${selectedPackage.validity})`,
      price: selectedPackage.price,
    });
  };

  /**
   * High-end typography price renderer to completely eliminate decimal clipping
   * and create an ultra-luxury visual hierarchy.
   */
  const renderPrice = (priceStr: string, isSelected: boolean) => {
    const match = priceStr.match(/^(\D*)(\d+)(?:\.(\d+))?$/);
    if (match) {
      const currency = match[1] || '$';
      const whole = match[2];
      const decimal = match[3] ?? '00';
      return (
        <View style={styles.priceContainer}>
          <Text style={[styles.priceCurrency, isSelected && styles.priceCurrencySelected]}>{currency}</Text>
          <Text style={[styles.priceWhole, isSelected && styles.priceWholeSelected]}>{whole}</Text>
          <Text style={[styles.priceDecimal, isSelected && styles.priceDecimalSelected]}>.{decimal}</Text>
        </View>
      );
    }
    return <Text style={[styles.priceFallback, isSelected && styles.priceFallbackSelected]}>{priceStr}</Text>;
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

      {/* Luxury Minimalist Header */}
      <View style={styles.header}>
        <LuxuryPressable
          style={({ pressed }) => [
            styles.backBtn,
            pressed && styles.topBtnPressed,
          ]}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ChevronLeft color="#1C1917" size={24} strokeWidth={2} />
        </LuxuryPressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>GLOBAL eSIM</Text>
          <Text style={styles.headerSub}>Instant 5G/4G Data in 180+ Countries</Text>
        </View>

        <View style={styles.headerRightIconWrapper}>
          <GlobalEsimIcon color="#D4AF37" size={20} strokeWidth={1.8} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 + insets.bottom }]}
      >
        {/* Country Selector Trigger */}
        <StaggeredFadeInUp index={0}>
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>SELECT DESTINATION</Text>
              <Text style={styles.sectionSubCount}>180+ COUNTRIES</Text>
            </View>

            <LuxuryPressable
              style={styles.countryTrigger}
              onPress={() => setShowCountryPicker(true)}
            >
              <View style={styles.countryTriggerLeft}>
                <Flag emoji={selectedCountry.flag} size={28} />
                <View>
                  <Text style={styles.countryName}>{selectedCountry.name}</Text>
                  <Text style={styles.countryRegion}>{selectedCountry.region} • High-Speed Roaming</Text>
                </View>
              </View>
              <View style={styles.changeBtn}>
                <Text style={styles.changeBtnText}>Change</Text>
                <ChevronRight color="#D4AF37" size={14} strokeWidth={2} />
              </View>
            </LuxuryPressable>
          </View>
        </StaggeredFadeInUp>

        {/* Popular Quick Countries */}
        <StaggeredFadeInUp index={1}>
          <View style={styles.quickCountriesRow}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickCountriesScroll}
            >
              {COUNTRIES.filter(c => c.popular).map(c => {
                const isSelected = selectedCountry.id === c.id;
                return (
                  <LuxuryPressable
                    key={c.id}
                    style={[styles.quickCountryChip, isSelected && styles.quickCountryChipActive]}
                    onPress={() => setSelectedCountry(c)}
                  >
                    <Flag emoji={c.flag} size={20} />
                    <Text style={[styles.quickCountryName, isSelected && styles.quickCountryNameActive]}>
                      {c.id.toUpperCase()}
                    </Text>
                  </LuxuryPressable>
                );
              })}
            </ScrollView>
          </View>
        </StaggeredFadeInUp>

        {/* Package Selector */}
        <StaggeredFadeInUp index={2}>
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>CHOOSE YOUR DATA PACKAGE</Text>
              <Text style={styles.sectionSubCount}>PREPAID • NO EXPIRY SURPRISES</Text>
            </View>

            <View style={styles.packagesGrid}>
              {PACKAGES.map(pkg => {
                const isSelected = selectedPackage.id === pkg.id;
                return (
                  <LuxuryPressable
                    key={pkg.id}
                    style={[styles.packageCard, isSelected && styles.packageCardSelected]}
                    onPress={() => setSelectedPackage(pkg)}
                  >
                    {pkg.badge && (
                      <View
                        style={[
                          styles.packageBadge,
                          pkg.badge === 'Most Popular' ? styles.badgeMostPopular : styles.badgeBestValue,
                        ]}
                      >
                        <Text
                          style={[
                            styles.packageBadgeText,
                            pkg.badge === 'Most Popular' ? styles.badgeTextMostPopular : styles.badgeTextBestValue,
                          ]}
                        >
                          {pkg.badge.toUpperCase()}
                        </Text>
                      </View>
                    )}

                    <View style={styles.packageTopRow}>
                      <View style={styles.packageDataContainer}>
                        <Text style={styles.packageData}>{pkg.data}</Text>
                        <Text style={styles.packageValidity}>{pkg.validity} High-Speed</Text>
                      </View>

                      <View style={styles.packagePriceCol}>
                        {renderPrice(pkg.price, isSelected)}
                        <Text style={styles.packagePerDay}>{pkg.pricePerDay}</Text>
                      </View>
                    </View>

                    <View style={styles.packageDivider} />

                    <View style={styles.packageBottomRow}>
                      <View style={styles.packagePerksRow}>
                        <Wifi color={isSelected ? '#D4AF37' : '#64748B'} size={13} strokeWidth={1.8} />
                        <Text style={styles.packagePerksText}>5G / LTE Speed</Text>
                        <Text style={styles.packagePerksDot}>•</Text>
                        <Zap color={isSelected ? '#D4AF37' : '#64748B'} size={13} strokeWidth={1.8} />
                        <Text style={styles.packagePerksText}>Instant QR</Text>
                      </View>

                      <View style={[styles.radio, isSelected && styles.radioActive]}>
                        {isSelected && <Check color="#1C1917" size={11} strokeWidth={2.5} />}
                      </View>
                    </View>
                  </LuxuryPressable>
                );
              })}
            </View>
          </View>
        </StaggeredFadeInUp>

        {/* Feature Highlights */}
        <StaggeredFadeInUp index={3}>
          <View style={styles.featuresCard}>
            <Text style={styles.featuresTitle}>INCLUDED WITH YOUR VIP eSIM</Text>

            <View style={styles.featureItem}>
              <View style={styles.featureIconCircle}>
                <Zap color="#D4AF37" size={16} strokeWidth={1.6} />
              </View>
              <View style={styles.featureTextWrapper}>
                <Text style={styles.featureName}>Instant Digital Activation</Text>
                <Text style={styles.featureDesc}>QR Code delivered to your VIP inbox within 60 seconds</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconCircle}>
                <Wifi color="#D4AF37" size={16} strokeWidth={1.8} />
              </View>
              <View style={styles.featureTextWrapper}>
                <Text style={styles.featureName}>Unthrottled 5G / 4G LTE Speed</Text>
                <Text style={styles.featureDesc}>Connected directly with premier tier-1 global telecommunications</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconCircle}>
                <Smartphone color="#D4AF37" size={16} strokeWidth={1.8} />
              </View>
              <View style={styles.featureTextWrapper}>
                <Text style={styles.featureName}>Personal Hotspot & Tethering Enabled</Text>
                <Text style={styles.featureDesc}>Share high-speed internet seamlessly with laptops and companion devices</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconCircle}>
                <ShieldCheck color="#D4AF37" size={16} strokeWidth={1.8} />
              </View>
              <View style={styles.featureTextWrapper}>
                <Text style={styles.featureName}>24/7 Priority Concierge Support</Text>
                <Text style={styles.featureDesc}>Dedicated VIP assistance for setup, device compatibility, and roaming</Text>
              </View>
            </View>
          </View>
        </StaggeredFadeInUp>

        {/* 3-Step Setup Guide */}
        <StaggeredFadeInUp index={4}>
          <View style={styles.stepsCard}>
            <Text style={styles.stepsTitle}>HOW IT WORKS</Text>
            <View style={styles.stepsRow}>
              <View style={styles.stepItem}>
                <View style={styles.stepNumberCircle}>
                  <Text style={styles.stepNumber}>1</Text>
                </View>
                <Text style={styles.stepItemTitle}>Purchase</Text>
                <Text style={styles.stepItemDesc}>Select plan & receive QR</Text>
              </View>
              <View style={styles.stepConnector} />
              <View style={styles.stepItem}>
                <View style={styles.stepNumberCircle}>
                  <Text style={styles.stepNumber}>2</Text>
                </View>
                <Text style={styles.stepItemTitle}>Scan QR</Text>
                <Text style={styles.stepItemDesc}>Open camera & add eSIM</Text>
              </View>
              <View style={styles.stepConnector} />
              <View style={styles.stepItem}>
                <View style={styles.stepNumberCircle}>
                  <Text style={styles.stepNumber}>3</Text>
                </View>
                <Text style={styles.stepItemTitle}>Connect</Text>
                <Text style={styles.stepItemDesc}>Online upon arrival</Text>
              </View>
            </View>
          </View>
        </StaggeredFadeInUp>
      </ScrollView>

      {/* Sticky Bottom Bar with Solid Deep Navy Luxury Button */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <View style={styles.bottomBarLeft}>
          <Text style={styles.summaryLabel}>SELECTED VIP PLAN</Text>
          <Text style={styles.summaryPlan} numberOfLines={1}>
            {selectedCountry.flag} {selectedPackage.data} •{' '}
            <Text style={styles.summaryPlanGold}>{selectedPackage.price}</Text>
          </Text>
          <Text style={styles.summarySub}>{selectedPackage.validity} • {selectedCountry.name}</Text>
        </View>

        <LuxuryPressable style={styles.checkoutBtn} onPress={handleCheckout}>
          <Text style={styles.checkoutBtnText}>BUY & ACTIVATE NOW</Text>
          <ArrowRight color="#1C1917" size={16} strokeWidth={2.4} />
        </LuxuryPressable>
      </View>

      {/* Country Selection Modal */}
      <Modal visible={showCountryPicker} animationType="slide" transparent>
        <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom']}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Select Destination</Text>
                <Text style={styles.modalSub}>180+ global countries and regions</Text>
              </View>
              <LuxuryPressable style={styles.modalCloseBtn} onPress={() => setShowCountryPicker(false)}>
                <Text style={styles.modalCloseText}>DONE</Text>
              </LuxuryPressable>
            </View>

            <View style={styles.searchBar}>
              <Search color="#64748B" size={17} strokeWidth={1.8} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search country or region (e.g. UAE, France)..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <FlatList
              data={filteredCountries}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = selectedCountry.id === item.id;
                return (
                  <LuxuryPressable
                    style={[styles.modalCountryItem, isSelected && styles.modalCountryItemSelected]}
                    onPress={() => {
                      setSelectedCountry(item);
                      setShowCountryPicker(false);
                      setSearchQuery('');
                    }}
                  >
                    <Flag emoji={item.flag} size={28} />
                    <View style={styles.modalCountryInfo}>
                      <Text style={[styles.modalCountryName, isSelected && styles.modalCountryNameSelected]}>
                        {item.name}
                      </Text>
                      <Text style={styles.modalCountryRegion}>{item.region}</Text>
                    </View>
                    {isSelected && <Check color="#D4AF37" size={18} strokeWidth={2.4} />}
                  </LuxuryPressable>
                );
              }}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  scrollContent: {
    paddingTop: 8,
  },
  // Containerless Luxury Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FAF9F6',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
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
  backBtnContainerless: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 1.2,
  },
  headerSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  headerRightIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  // Sections
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sectionSubCount: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  // Destination Trigger Card
  countryTrigger: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  countryTriggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  countryFlag: {
    fontSize: 30,
  },
  countryName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1917',
  },
  countryRegion: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  changeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
  },
  changeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D4AF37',
    letterSpacing: 0.3,
  },
  // Quick Country Chips
  quickCountriesRow: {
    marginTop: 12,
  },
  quickCountriesScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  quickCountryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
  },
  quickCountryChipActive: {
    borderColor: '#D4AF37',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
  },
  quickCountryFlag: {
    fontSize: 15,
  },
  quickCountryName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  quickCountryNameActive: {
    color: '#1C1917',
    fontWeight: '800',
  },
  // Package Cards
  packagesGrid: {
    gap: 12,
  },
  packageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  packageCardSelected: {
    borderColor: '#D4AF37',
    backgroundColor: '#FAF9F6',
    shadowColor: '#D4AF37',
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  // Premium Minimalist Badges
  packageBadge: {
    position: 'absolute',
    top: -9,
    right: 16,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  badgeMostPopular: {
    backgroundColor: '#FAF9F6',
    borderColor: '#D4AF37',
  },
  badgeTextMostPopular: {
    color: '#D4AF37',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 1,
  },
  badgeBestValue: {
    backgroundColor: '#FAF9F6',
    borderColor: '#D4AF37',
  },
  badgeTextBestValue: {
    color: '#D4AF37',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 1,
  },
  packageBadgeText: {
    textTransform: 'uppercase',
  },
  packageTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  packageDataContainer: {
    flex: 1,
  },
  packageData: {
    fontSize: 19,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: -0.3,
  },
  packageValidity: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  packagePriceCol: {
    alignItems: 'flex-end',
  },
  // Precise Decimal Typography
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 1,
  },
  priceCurrency: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D4AF37',
    marginTop: 2,
    marginRight: 1,
  },
  priceCurrencySelected: {
    color: '#D4AF37',
  },
  priceWhole: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1C1917',
    lineHeight: 26,
    letterSpacing: -0.5,
  },
  priceWholeSelected: {
    color: '#1C1917',
  },
  priceDecimal: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#D4AF37',
    marginTop: 2,
    lineHeight: 18,
  },
  priceDecimalSelected: {
    color: '#D4AF37',
  },
  priceFallback: {
    fontSize: 18,
    fontWeight: '800',
    color: '#D4AF37',
  },
  priceFallbackSelected: {
    color: '#D4AF37',
  },
  packagePerDay: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  packageDivider: {
    height: 1,
    backgroundColor: 'rgba(28, 25, 23, 0.08)',
    marginVertical: 12,
  },
  packageBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packagePerksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  packagePerksText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  packagePerksDot: {
    fontSize: 11,
    color: '#64748B',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#64748B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  // Features Included Card
  featuresCard: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    gap: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  featuresTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTextWrapper: {
    flex: 1,
  },
  featureName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1917',
  },
  featureDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
    lineHeight: 15,
  },
  // 3-Step Setup Guide
  stepsCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  stepsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FAF9F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  stepNumber: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '800',
  },
  stepItemTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1917',
    textAlign: 'center',
  },
  stepItemDesc: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 13,
  },
  stepConnector: {
    width: 20,
    height: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
    marginBottom: 20,
  },
  // Bottom Sticky Bar & Luxury Action Button
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.2,
    borderTopColor: 'rgba(212, 175, 55, 0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
  },
  bottomBarLeft: {
    flex: 1,
    paddingRight: 12,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  summaryPlan: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1917',
    marginTop: 2,
  },
  summaryPlanGold: {
    color: '#D4AF37',
    fontWeight: '800',
  },
  summarySub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  checkoutBtn: {
    backgroundColor: '#D4AF37',
    borderWidth: 1,
    borderColor: '#D4AF37',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  checkoutBtnText: {
    color: '#1C1917',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  // Country Selection Modal
  modalSafe: {
    flex: 1,
    backgroundColor: 'rgba(28, 25, 23, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FAF9F6',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.35)',
    maxHeight: '85%',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.5,
  },
  modalSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  modalCloseText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 44,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1C1917',
  },
  modalCountryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(28, 25, 23, 0.08)',
  },
  modalCountryItemSelected: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  modalCountryFlag: {
    fontSize: 26,
  },
  modalCountryInfo: {
    flex: 1,
  },
  modalCountryName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1C1917',
  },
  modalCountryNameSelected: {
    color: '#D4AF37',
    fontWeight: '800',
  },
  modalCountryRegion: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
});
