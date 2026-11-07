import React, { useState } from 'react';
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
  ArrowLeft,
  ChevronLeft,
  FileText,
  Lock,
  Shield,
  ShieldCheck,
} from 'lucide-react-native';

type TabType = 'terms' | 'privacy' | 'security';

export function PrivacySecurityScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('security');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

      {/* Top Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.backBtn,
            pressed && styles.topBtnPressed,
          ]}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ArrowLeft color="#1C1917" size={22} strokeWidth={2.2} />
        </Pressable>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Sub Header with Circular Back Button */}
        <View style={styles.subHeaderRow}>
          <Pressable
            style={({ pressed }) => [
              styles.circularBackBtn,
              pressed && styles.topBtnPressed,
            ]}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft color="#1C1917" size={20} strokeWidth={2.5} />
          </Pressable>
          <Text style={styles.subHeaderTitle}>Privacy & Security</Text>
        </View>

        {/* 3-Segmented Control Tabs: [Terms] [Privacy] [Security] */}
        <View style={styles.tabsRow}>
          {/* Tab 1: Terms */}
          <Pressable
            style={[styles.tabBtn, activeTab === 'terms' && styles.tabBtnActive]}
            onPress={() => setActiveTab('terms')}
          >
            <FileText
              color={activeTab === 'terms' ? '#1C1917' : '#94A3B8'}
              size={16}
              strokeWidth={2}
            />
            <Text
              style={[
                styles.tabBtnText,
                activeTab === 'terms' && styles.tabBtnTextActive,
              ]}
            >
              Terms
            </Text>
          </Pressable>

          {/* Tab 2: Privacy */}
          <Pressable
            style={[styles.tabBtn, activeTab === 'privacy' && styles.tabBtnActive]}
            onPress={() => setActiveTab('privacy')}
          >
            <Lock
              color={activeTab === 'privacy' ? '#1C1917' : '#94A3B8'}
              size={16}
              strokeWidth={2}
            />
            <Text
              style={[
                styles.tabBtnText,
                activeTab === 'privacy' && styles.tabBtnTextActive,
              ]}
            >
              Privacy
            </Text>
          </Pressable>

          {/* Tab 3: Security */}
          <Pressable
            style={[
              styles.tabBtn,
              activeTab === 'security' && styles.tabBtnActive,
            ]}
            onPress={() => setActiveTab('security')}
          >
            <Shield
              color={activeTab === 'security' ? '#1C1917' : '#94A3B8'}
              size={16}
              strokeWidth={2}
            />
            <Text
              style={[
                styles.tabBtnText,
                activeTab === 'security' && styles.tabBtnTextActive,
              ]}
            >
              Security
            </Text>
          </Pressable>
        </View>

        {/* Tab Content Card */}
        {activeTab === 'security' && (
          <View style={styles.contentCard}>
            <Text style={styles.sectionHeading}>Data Security</Text>
            <Text style={styles.sectionSubtitle}>Secure Travel Protection</Text>

            <Text style={styles.paragraph}>
              Vanir Group implements enterprise-grade physical, technical, and administrative security measures to protect your digital assets.
            </Text>

            <Text style={styles.subHeading}>End-to-End Encryption</Text>
            <Text style={styles.paragraph}>
              All transmissions containing personal information, passport data, or credit credentials are fully encrypted using standard Transport Layer Security (TLS/SSL) mechanisms.
            </Text>

            <Text style={styles.subHeading}>Payment Compliance</Text>
            <Text style={styles.paragraph}>
              All transactions processed via Apple Pay or credit cards comply with PCI-DSS guidelines to protect against fraudulent activities.
            </Text>

            <Text style={styles.subHeading}>Authentication Checks</Text>
            <Text style={styles.paragraph}>
              We verify device logins and session states. Inactive sessions are automatically logged out to prevent unauthorized terminal access.
            </Text>
          </View>
        )}

        {activeTab === 'privacy' && (
          <View style={styles.contentCard}>
            <Text style={styles.sectionHeading}>Privacy Policy</Text>
            <Text style={styles.sectionSubtitle}>Global Data Protection & Confidentiality</Text>

            <Text style={styles.paragraph}>
              Your privacy is of paramount importance to VANIR. We collect only the information necessary to provide seamless VIP concierge, private flight, and luxury accommodation services.
            </Text>

            <Text style={styles.subHeading}>Information We Collect</Text>
            <Text style={styles.paragraph}>
              We collect your name, contact information, passport and visa documents for travel facilitation, and transaction data necessary for booking fulfillment.
            </Text>

            <Text style={styles.subHeading}>How Your Data Is Used</Text>
            <Text style={styles.paragraph}>
              Your information is exclusively utilized to verify travel credentials with official government authorities, airlines, and 5-star properties. We never monetize or sell personal records.
            </Text>

            <Text style={styles.subHeading}>Your Data Rights</Text>
            <Text style={styles.paragraph}>
              In accordance with GDPR and international data standards, you possess the right to inspect, export, or permanently delete your stored profile records at any time.
            </Text>
          </View>
        )}

        {activeTab === 'terms' && (
          <View style={styles.contentCard}>
            <Text style={styles.sectionHeading}>Terms of Service</Text>
            <Text style={styles.sectionSubtitle}>VIP Membership & Booking Agreement</Text>

            <Text style={styles.paragraph}>
              By accessing the VANIR platform, you agree to comply with our elite concierge guidelines and reservations framework.
            </Text>

            <Text style={styles.subHeading}>Reservations & Confirmation</Text>
            <Text style={styles.paragraph}>
              All flight, hotel suite, and yacht reservations are subject to supplier verification. Confirmation is transmitted instantly upon successful digital authentication.
            </Text>

            <Text style={styles.subHeading}>Cancellation & Modifications</Text>
            <Text style={styles.paragraph}>
              VIP members benefit from flexible cancellation windows up to 24 hours prior to departure for private aviation, and 48 hours for luxury hotel suites.
            </Text>

            <Text style={styles.subHeading}>Limitation of Liability</Text>
            <Text style={styles.paragraph}>
              VANIR acts as an exclusive bespoke concierge coordinator connecting members with accredited commercial carriers and hospitality operators globally.
            </Text>
          </View>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
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
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  topBtnPressed: {
    backgroundColor: 'rgba(212, 175, 55, 0.22)',
    borderColor: '#D4AF37',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1917',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  circularBackBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  subHeaderTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1917',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(28, 25, 23, 0.1)',
  },
  tabBtnActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#1C1917',
    fontWeight: '800',
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeading: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1C1917',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: 16,
  },
  subHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1917',
    marginTop: 18,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
  },
});
