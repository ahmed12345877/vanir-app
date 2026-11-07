import React from 'react';
import {
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
  ChevronLeft,
  Globe,
  Building,
  FileText,
  Mail,
  ShieldCheck,
  Scale,
} from 'lucide-react-native';

type TermsSection = {
  title: string;
  body: string;
};

const SECTIONS: TermsSection[] = [
  {
    title: '1. Acceptance of Terms',
    body: 'By accessing or utilizing the Vanir VIP concierge mobile application, digital platforms, or concierge advisory desks, you acknowledge and agree to be bound by these Terms of Service and all related international travel regulations.',
  },
  {
    title: '2. Scope of Luxury Concierge Services',
    body: 'Vanir Group acts as an exclusive bespoke concierge coordinator connecting registered members with certified third-party operators for private air charters, 5-star presidential hotel accommodations, marine yacht rentals, and diplomatic fast-track logistics.',
  },
  {
    title: '3. Booking Confirmations & Authorizations',
    body: 'All charter and suite itineraries are subject to operator availability and written confirmation. Accurate passenger identification and travel manifests must be provided in accordance with civil aviation authority mandates prior to flight departure.',
  },
  {
    title: '4. Cancellations, Modifications & Refunds',
    body: 'Cancellation terms and refund eligibility vary by charter class, aircraft type, and hotel partner policies as explicitly delineated in each individual booking agreement. Non-refundable fares cannot be refunded except where mandated by international carrier agreements.',
  },
  {
    title: '5. Limitation of Liability',
    body: 'Vanir Group exercises paramount due diligence when selecting licensed carrier partners. To the maximum extent permitted by applicable maritime and aviation treaties, Vanir Group shall not be liable for unforeseen delays caused by severe meteorological events or airport control holds.',
  },
  {
    title: '6. Member Conduct & Discretion',
    body: 'Vanir Group strictly observes and enforces client privacy, security, and mutual discretion. We reserve the unequivocal right to terminate membership access for any fraudulent activity or breach of air safety protocols.',
  },
  {
    title: '7. Governing Law & Jurisdiction',
    body: 'These terms are governed by and construed in accordance with international commercial law. Any disputes arising hereunder shall be subject to the exclusive jurisdiction of the competent courts in our primary operational hubs.',
  },
];

const CONTACT_ITEMS = [
  { icon: Mail, label: 'Legal Affairs', value: 'legal@vanirgroup.com' },
  { icon: Globe, label: 'Official Portal', value: 'vanirgroup.com/terms-of-service' },
  { icon: Building, label: 'Global Offices', value: 'Geneva • London • Dubai • New York' },
] as const;

export function TermsOfServiceScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

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

        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: 60 + insets.bottom }]}
      >
        {/* Brand Banner */}
        <View style={styles.brandBadge}>
          <Text style={styles.brandName}>VANIR GROUP</Text>
          <Text style={styles.brandTagline}>
            Ultra-Luxury Aviation & Lifestyle Concierge
          </Text>
          <View style={styles.effectivePill}>
            <Text style={styles.effectiveText}>Effective Date: October 2026</Text>
          </View>
        </View>

        {/* Terms Sections */}
        {SECTIONS.map((section, idx) => (
          <View key={idx} style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Scale color="#D4AF37" size={18} />
              <Text style={styles.cardTitle}>{section.title}</Text>
            </View>
            <View style={styles.cardDivider} />
            <Text style={styles.cardBody}>{section.body}</Text>
          </View>
        ))}

        {/* Contact Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <ShieldCheck color="#D4AF37" size={18} />
            <Text style={styles.cardTitle}>Legal Inquiries & Concierge Desk</Text>
          </View>
          <View style={styles.cardDivider} />

          <View style={styles.contactList}>
            {CONTACT_ITEMS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <View key={idx} style={styles.contactRow}>
                  <View style={styles.contactIconWrap}>
                    <Icon color="#D4AF37" size={16} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.contactLabel}>{item.label}</Text>
                    <Text style={styles.contactValue}>{item.value}</Text>
                  </View>
                </View>
              );
            })}
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
  brandBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  brandName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 2,
  },
  brandTagline: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D4AF37',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  effectivePill: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  effectiveText: {
    fontSize: 11,
    color: '#D4AF37',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
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
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1917',
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(28, 25, 23, 0.08)',
    marginVertical: 12,
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 22,
    color: '#334155',
  },
  contactList: {
    gap: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  contactValue: {
    fontSize: 13,
    color: '#1C1917',
    fontWeight: '600',
  },
});
