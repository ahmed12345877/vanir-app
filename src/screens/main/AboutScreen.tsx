import React from 'react';
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  Building,
  Car,
  ChevronLeft,
  FileText,
  Globe,
  Map,
  Navigation as NavigationIcon,
  ShieldCheck,
  Sparkles,
  Waves,
  Phone,
  Mail,
  ExternalLink,
  Crown,
  Heart,
} from 'lucide-react-native';

const SERVICES_OFFERED = [
  { icon: NavigationIcon, label: 'Private Jet Charters & Empty Legs' },
  { icon: Building, label: 'Luxury 5-Star Hotel & Presidential Suites' },
  { icon: Waves, label: 'Superyacht & Catamaran Rentals' },
  { icon: Car, label: 'Chauffeur Driven Limousines & Exotic Supercars' },
  { icon: Globe, label: 'Global High-Speed eSIM Data Roaming' },
  { icon: FileText, label: 'Express VIP Visa Processing Services' },
  { icon: ShieldCheck, label: 'Airport Fast-Track & Private Tarmac Transfers' },
  { icon: Map, label: 'Curated Expeditions & Bespoke Mountain Tours' },
  { icon: Sparkles, label: '24/7 Dedicated AI Travel Concierge' },
];

const WHY_CHOOSE_VANIR = [
  '15+ years of luxury hospitality and aviation excellence',
  '24/7 dedicated personal concierge support worldwide',
  'Exclusive direct alliances with top global carriers and five-star resorts',
  'Fully customized bespoke itineraries tailored to your unique lifestyle',
  'Bank-grade encrypted private transactions and data protection',
];

export function AboutScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleCallEgypt = () => {
    Linking.openURL('tel:+201123988882').catch(() => {});
  };

  const handleOpenWebsite = () => {
    Linking.openURL('https://vanirgroup.com').catch(() => {});
  };

  const handleEmailUs = () => {
    Linking.openURL('mailto:cairo@vanirgroup.com').catch(() => {});
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

      {/* Screen Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.backBtn,
            pressed && styles.topBtnPressed,
          ]}
          onPress={() => navigation.goBack()}
          hitSlop={12}
        >
          <ChevronLeft color="#1C1917" size={22} strokeWidth={2.4} />
        </Pressable>

        <Text style={styles.headerTitle}>About VANIR</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: 60 + insets.bottom }]}
      >
        {/* Hero Card with Perfectly Cropped Official Round Logo */}
        <View style={styles.heroCard}>
          <View style={styles.logoCircleContainer}>
            <Image
              source={require('../../assets/vanir_round_logo.png')}
              style={styles.heroLogo}
              resizeMode="cover"
            />
          </View>

          <Text style={styles.brandTitle}>VANIR GROUP</Text>
          
          {/* Official Slogan: We plan for happiness */}
          <View style={styles.sloganBadge}>
            <Heart color="#D4AF37" size={13} fill="#D4AF37" />
            <Text style={styles.sloganText}>We plan for happiness</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.heroDesc}>
            Vanir Group curates bespoke travel experiences for discerning global clientele. From private jet charters and five-star presidential suites to mega-yachts and 24/7 dedicated butler service, we plan for happiness into every single moment of your journey.
          </Text>
        </View>

        {/* Direct Contact & Support Info */}
        <View style={styles.contactCard}>
          <Text style={styles.contactCardTitle}>Direct VIP Communications</Text>
          
          {/* Egypt Direct Line */}
          <Pressable
            style={({ pressed }) => [styles.contactRow, pressed && styles.btnPressed]}
            onPress={handleCallEgypt}
          >
            <View style={styles.contactIconWrap}>
              <Phone color="#D4AF37" size={18} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Egypt Direct Hotline</Text>
              <Text style={styles.contactValue}>+201123988882</Text>
            </View>
            <View style={styles.callNowPill}>
              <Text style={styles.callNowText}>Call Now</Text>
            </View>
          </Pressable>

          <View style={styles.contactDivider} />

          {/* Official Website */}
          <Pressable
            style={({ pressed }) => [styles.contactRow, pressed && styles.btnPressed]}
            onPress={handleOpenWebsite}
          >
            <View style={styles.contactIconWrap}>
              <Globe color="#D4AF37" size={18} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Official Web Portal</Text>
              <Text style={styles.contactValue}>https://vanirgroup.com</Text>
            </View>
            <ExternalLink color="#94A3B8" size={16} />
          </Pressable>

          <View style={styles.contactDivider} />

          {/* Email */}
          <Pressable
            style={({ pressed }) => [styles.contactRow, pressed && styles.btnPressed]}
            onPress={handleEmailUs}
          >
            <View style={styles.contactIconWrap}>
              <Mail color="#D4AF37" size={18} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>VIP Concierge Email</Text>
              <Text style={styles.contactValue}>cairo@vanirgroup.com</Text>
            </View>
            <ExternalLink color="#94A3B8" size={16} />
          </Pressable>
        </View>

        {/* Curated Luxury Services */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Crown color="#D4AF37" size={20} />
            <Text style={styles.cardTitle}>Curated Luxury Services</Text>
          </View>

          <View style={styles.servicesList}>
            {SERVICES_OFFERED.map((svc, index) => {
              const Icon = svc.icon;
              return (
                <View key={index} style={styles.serviceRow}>
                  <View style={styles.serviceIconWrap}>
                    <Icon color="#D4AF37" size={16} />
                  </View>
                  <Text style={styles.serviceLabel}>{svc.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Why Choose VANIR */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Sparkles color="#D4AF37" size={20} />
            <Text style={styles.cardTitle}>The VANIR Distinction</Text>
          </View>

          <View style={styles.whyList}>
            {WHY_CHOOSE_VANIR.map((point, index) => (
              <View key={index} style={styles.pointRow}>
                <View style={styles.pointDot} />
                <Text style={styles.pointText}>{point}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Official Website Primary Button */}
        <Pressable
          style={({ pressed }) => [styles.websiteBtn, pressed && styles.btnPressed]}
          onPress={handleOpenWebsite}
        >
          <Globe color="#1C1917" size={18} />
          <Text style={styles.websiteBtnText}>Explore Portal (vanirgroup.com)</Text>
          <ExternalLink color="#1C1917" size={16} />
        </Pressable>
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
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  topBtnPressed: {
    backgroundColor: 'rgba(212, 175, 55, 0.22)',
    borderColor: '#D4AF37',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1917',
    letterSpacing: -0.3,
  },
  scroll: {
    padding: 20,
    gap: 16,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  logoCircleContainer: {
    width: 104,
    height: 104,
    borderRadius: 52,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#D4AF37',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  heroLogo: {
    width: 100,
    height: 100,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1C1917',
    letterSpacing: 2,
  },
  sloganBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  sloganText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D4AF37',
    marginTop: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    width: '60%',
    backgroundColor: 'rgba(28, 25, 23, 0.08)',
    marginVertical: 16,
  },
  heroDesc: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    textAlign: 'center',
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  contactCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1917',
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  contactIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1917',
    marginTop: 2,
  },
  callNowPill: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  callNowText: {
    color: '#1C1917',
    fontSize: 11,
    fontWeight: '800',
  },
  contactDivider: {
    height: 1,
    backgroundColor: 'rgba(28, 25, 23, 0.08)',
    marginVertical: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1917',
  },
  servicesList: {
    gap: 12,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  serviceIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
    flex: 1,
  },
  whyList: {
    gap: 10,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  pointDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D4AF37',
    marginTop: 6,
  },
  pointText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    flex: 1,
  },
  websiteBtn: {
    backgroundColor: '#D4AF37',
    borderRadius: 20,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  websiteBtnText: {
    color: '#1C1917',
    fontSize: 15,
    fontWeight: '800',
  },
});
