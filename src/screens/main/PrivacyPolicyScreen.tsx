import React from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Globe, Building, Lock, Mail, ShieldCheck } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';

type PolicySection = {
  title: string;
  body: string;
};

const SECTIONS: PolicySection[] = [
  {
    title: 'Introduction & Commitment',
    body: 'Vanir Group Inc. is dedicated to protecting your privacy and ensuring confidentiality across all chartered itineraries. This Privacy Policy outlines how your personal and travel credentials are handled when utilizing Vanir applications and VIP concierge services.',
  },
  {
    title: 'Information We Collect',
    body: 'We collect membership identity records, flight manifests, passenger passport details for customs clearance, tokenized billing authorizations, and encrypted location data strictly necessary to coordinate private jet, yacht, and chauffeur transfers.',
  },
  {
    title: 'Purpose of Processing',
    body: 'Your information is processed exclusively to execute bespoke reservations, coordinate airport VIP protocol, comply with civil aviation mandates, prevent fraudulent transactions, and deliver customized luxury concierge experiences.',
  },
  {
    title: 'Zero Data Brokerage Guarantee',
    body: 'Vanir Group never sells, monetizes, or leases client personal data to advertisers. Information is disclosed solely to vetted partner carriers (air charter operators, luxury hotels, marine charters) required to fulfill your reserved itinerary.',
  },
  {
    title: 'Bank-Grade Security Architecture',
    body: 'We deploy multi-layered defensive security including end-to-end TLS 1.3 encryption in transit, AES-256 vault encryption at rest, role-based access restrictions, and continuous penetration monitoring.',
  },
  {
    title: 'Client Data Rights & Sovereignty',
    body: 'You retain the complete right to inspect, rectify, export, or request immediate permanent expungement of your personal travel records from our servers, subject only to mandatory international aviation safety retention statutes.',
  },
  {
    title: 'Policy Revisions',
    body: 'Any enhancements to our security framework will be communicated via in-app VIP notifications. Continued engagement with Vanir services indicates acceptance of current protective protocols.',
  },
];

const CONTACT_ITEMS = [
  { icon: Mail, label: 'Concierge Privacy Desk', value: 'privacy@vanirgroup.com' },
  { icon: Globe, label: 'Official Portal', value: 'vanirgroup.com/privacy-policy' },
  { icon: Building, label: 'Global Concierge Offices', value: 'Geneva • London • Dubai • New York' },
] as const;

export function PrivacyPolicyScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.backBtn,
            pressed && styles.topBtnPressed,
          ]}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft color="#1C1917" size={22} strokeWidth={2.2} />
        </Pressable>
        <View style={styles.headerTextGroup}>
          <Text style={styles.headerTitle}>PRIVACY POLICY</Text>
          <Text style={styles.headerSubtitle}>Confidentiality & Data Protection</Text>
        </View>
        <View style={styles.headerIconWrap}>
          <Lock color="#D4AF37" size={18} strokeWidth={2} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.brandBadge}>
          <Text style={styles.brandName}>VANIR GROUP</Text>
          <Text style={styles.brandTagline}>Confidentiality Befitting Royalty & Global Executives</Text>
          <Text style={styles.metaText}>Last Updated · 2025 Edition</Text>
        </View>

        {SECTIONS.map(section => (
          <View key={section.title} style={styles.card}>
            <Text style={styles.cardTitle}>{section.title}</Text>
            <View style={styles.cardDivider} />
            <Text style={styles.cardBody}>{section.body}</Text>
          </View>
        ))}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Global Privacy Office</Text>
          <View style={styles.cardDivider} />
          {CONTACT_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <View key={item.label} style={styles.contactRow}>
                <View style={styles.contactIconWrap}>
                  <Icon color="#38BDF8" size={16} strokeWidth={2} />
                </View>
                <View style={styles.contactTextGroup}>
                  <Text style={styles.contactLabel}>{item.label}</Text>
                  <Text style={styles.contactValue}>{item.value}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAF9F6' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FAF9F6',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBtnPressed: {
    backgroundColor: 'rgba(212, 175, 55, 0.22)',
    borderColor: '#D4AF37',
  },
  headerTextGroup: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1C1917',
    letterSpacing: 1.5,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  headerIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: 16,
    gap: 14,
  },
  brandBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    padding: 18,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  brandName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1C1917',
    letterSpacing: 4,
  },
  brandTagline: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  metaText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D4AF37',
    marginTop: 6,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    padding: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1917',
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(28, 25, 23, 0.08)',
  },
  cardBody: {
    fontSize: 13,
    lineHeight: 20,
    color: '#64748B',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  contactIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactTextGroup: {
    flex: 1,
    gap: 2,
  },
  contactLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  contactValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1917',
  },
  bottomPad: {
    height: 40,
  },
});
