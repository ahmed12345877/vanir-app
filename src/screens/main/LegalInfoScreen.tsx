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
import {
  Building,
  ChevronLeft,
  CreditCard,
  FileBadge,
  FileText,
  Globe,
  Scale,
  Shield,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';

type InfoBlock = {
  icon: typeof Building;
  title: string;
  body: string;
};

const INFO_BLOCKS: InfoBlock[] = [
  {
    icon: Building,
    title: 'Company Information',
    body: 'Trade Name: Vanir Group Inc.\nBusiness Activity: Luxury VIP Aviation & Lifestyle Concierge\nWebsite: vanirgroup.com\nEmail: concierge@vanirgroup.com',
  },
  {
    icon: FileText,
    title: 'Legal Disclaimer',
    body: 'Vanir Group services are curated with the utmost diligence on a best-effort basis. We partner with licensed, certified operators worldwide. Our liability is strictly limited to the value of the booked service where permitted by international maritime and aviation law.',
  },
  {
    icon: Shield,
    title: 'Regulatory & Aviation Compliance',
    body: 'We operate under strict compliance frameworks in partnership with FAA, EASA, and GCAA certified charter carriers. We maintain internal protocols safeguarding data privacy, anti-fraud verifications, and cross-border customs adherence.',
  },
  {
    icon: Globe,
    title: 'Geographic Coverage & Global Network',
    body: 'Vanir Group serves high-net-worth clients across Europe, the Middle East, the Americas, and Asia-Pacific through vetted luxury partners and regional concierge hubs.',
  },
  {
    icon: Shield,
    title: 'Client Protection & Privacy Guarantee',
    body: 'Members are entitled to transparent itinerary agreements, dedicated 24/7 incident handling, and clear cancellation policies specified on each bespoke charter contract.',
  },
  {
    icon: CreditCard,
    title: 'Payments & Financial Processing',
    body: 'Payments are processed through bank-grade PCI-DSS Level 1 compliant gateways. Vanir Group does not store unencrypted card security codes, employing tokenized verification across all digital transactions.',
  },
  {
    icon: Scale,
    title: 'Dispute Resolution & Concierge Care',
    body: 'Any operational dispute is managed swiftly through your assigned human concierge manager with immediate priority escalation under international arbitration standards.',
  },
  {
    icon: FileBadge,
    title: 'Intellectual Property & Licenses',
    body: 'The Vanir brand, mobile platform, trademarks, and media assets are the exclusive intellectual property of Vanir Group Inc. All rights reserved.',
  },
];

export function LegalInfoScreen() {
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
          <Text style={styles.headerTitle}>LEGAL INFORMATION</Text>
          <Text style={styles.headerSubtitle}>Governance & Trust Standards</Text>
        </View>
        <View style={styles.headerIconWrap}>
          <Scale color="#D4AF37" size={18} strokeWidth={2} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.brandBadge}>
          <Text style={styles.brandName}>VANIR GROUP</Text>
          <Text style={styles.brandTagline}>
            International Luxury Aviation & Concierge Framework
          </Text>
          <Text style={styles.metaText}>Edition · 2025</Text>
        </View>

        {INFO_BLOCKS.map(block => {
          const Icon = block.icon;
          return (
            <View key={block.title} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIconWrap}>
                  <Icon color="#38BDF8" size={18} strokeWidth={2} />
                </View>
                <Text style={styles.cardTitle}>{block.title}</Text>
              </View>
              <View style={styles.cardDivider} />
              <Text style={styles.cardBody}>{block.body}</Text>
            </View>
          );
        })}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2025 Vanir Group Inc. All rights reserved.
          </Text>
          <Text style={styles.footerSub}>REDEFINING ULTRA-LUXURY TRAVEL</Text>
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
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1917',
    flex: 1,
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
  footer: {
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 12,
  },
  footerText: {
    fontSize: 12,
    color: '#64748B',
  },
  footerSub: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 2,
  },
  bottomPad: {
    height: 40,
  },
});
