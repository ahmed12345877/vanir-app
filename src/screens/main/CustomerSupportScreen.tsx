import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  Headphones,
  Phone,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  Coins,
  ChevronRight,
  X,
  MessageCircle,
  ExternalLink,
} from 'lucide-react-native';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function CustomerSupportScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const [showGuaranteeModal, setShowGuaranteeModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showVoipModal, setShowVoipModal] = useState(false);

  const handleStartChat = () => {
    // Direct navigate to 24/7 AI VIP Concierge
    navigation.navigate('AIConcierge');
  };

  const handlePhoneCall = (phoneNumber: string) => {
    setShowCallModal(false);
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      Alert.alert('Calling Unavailable', `Please dial directly: ${phoneNumber}`);
    });
  };

  const handleEmergencyCall = () => {
    setShowEmergencyModal(false);
    Linking.openURL('tel:+97180082647').catch(() => {
      Alert.alert('Emergency Dispatch', 'Please call +971 800 82647 or contact local emergency services.');
    });
  };

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
          <ArrowLeft color="#1C1917" size={24} strokeWidth={2.2} />
        </Pressable>
        <Text style={styles.headerTitle}>Customer Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 3 Top Action Cards */}
        <View style={styles.actionCardsGroup}>
          {/* Card 1: Chat with Us */}
          <Pressable
            style={({ pressed }) => [
              styles.actionCard,
              pressed && styles.actionCardPressed,
            ]}
            onPress={handleStartChat}
          >
            <View style={styles.actionCardContent}>
              <View style={styles.actionIconCircle}>
                <Headphones color="#D4AF37" size={22} strokeWidth={2.2} />
              </View>
              <View style={styles.actionCardTextCol}>
                <Text style={styles.actionCardTitle}>Chat with Us</Text>
                <Text style={styles.actionCardSubtitle}>
                  Instant 24/7 AI Concierge & Live Agent
                </Text>
              </View>
            </View>
            <ChevronRight color="#D4AF37" size={18} strokeWidth={2} />
          </Pressable>

          {/* Card 2: Call Us */}
          <Pressable
            style={({ pressed }) => [
              styles.actionCard,
              pressed && styles.actionCardPressed,
            ]}
            onPress={() => setShowCallModal(true)}
          >
            <View style={styles.actionCardContent}>
              <View style={styles.actionIconCircle}>
                <Phone color="#D4AF37" size={22} strokeWidth={2.2} />
              </View>
              <View style={styles.actionCardTextCol}>
                <Text style={styles.actionCardTitle}>Call Us</Text>
                <Text style={styles.actionCardSubtitle}>
                  Toll-free global VIP phone lines
                </Text>
              </View>
            </View>
            <ChevronRight color="#D4AF37" size={18} strokeWidth={2} />
          </Pressable>

          {/* Card 3: Emergency Assistance */}
          <Pressable
            style={({ pressed }) => [
              styles.actionCard,
              pressed && styles.actionCardPressed,
            ]}
            onPress={() => setShowEmergencyModal(true)}
          >
            <View style={styles.actionCardContent}>
              <View style={[styles.actionIconCircle, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
                <ShieldAlert color="#EF4444" size={22} strokeWidth={2.2} />
              </View>
              <View style={styles.actionCardTextCol}>
                <Text style={styles.actionCardTitle}>Emergency Assistance</Text>
                <Text style={styles.actionCardSubtitle}>
                  Priority SOS for ongoing bookings & travel
                </Text>
              </View>
            </View>
            <View style={styles.sosBadge}>
              <Text style={styles.sosBadgeText}>SOS</Text>
            </View>
          </Pressable>
        </View>

        {/* Peace of Mind Guarantee Banner */}
        <View style={styles.guaranteeBanner}>
          <View style={styles.guaranteeHeader}>
            <View style={styles.guaranteeIconBox}>
              <ShieldCheck color="#D4AF37" size={24} strokeWidth={2.4} />
            </View>
            <Text style={styles.guaranteeTitle}>
              Travel with Peace of Mind with our Trusted Support
            </Text>
          </View>
          <Text style={styles.guaranteeDesc}>
            Thanks to the VANIR comprehensive guarantee, your reservation is fully protected against unexpected travel disruptions, flight schedule changes, or accommodation issues.
          </Text>
          <Pressable
            style={styles.learnMoreBtn}
            onPress={() => setShowGuaranteeModal(true)}
          >
            <Text style={styles.learnMoreText}>Learn More</Text>
            <ChevronRight color="#D4AF37" size={14} strokeWidth={2.4} />
          </Pressable>
        </View>

        {/* Service You Can Rely On Section */}
        <View style={styles.serviceSection}>
          <Text style={styles.serviceSectionHeader}>Service You Can Rely On</Text>

          {/* Item 1 */}
          <View style={styles.serviceRow}>
            <View style={styles.serviceIconContainer}>
              <CheckCircle2 color="#D4AF37" size={22} strokeWidth={2.4} />
            </View>
            <View style={styles.serviceTextContainer}>
              <Text style={styles.serviceItemTitle}>Travel with Peace of Mind</Text>
              <Text style={styles.serviceItemDesc}>
                Our service guarantee means our dedicated senior concierges are always on standby to support and protect your travel plans at every step.
              </Text>
            </View>
          </View>

          {/* Item 2 */}
          <View style={styles.serviceRow}>
            <View style={styles.serviceIconContainer}>
              <PhoneCall color="#D4AF37" size={22} strokeWidth={2.4} />
            </View>
            <View style={styles.serviceTextContainer}>
              <Text style={styles.serviceItemTitle}>Free In-App Internet Calls</Text>
              <Text style={styles.serviceItemDesc}>
                Traveling abroad and need to reach our global dispatch? Connect instantly with high-definition voice over internet without international roaming charges.
              </Text>
              <Pressable
                style={styles.subLearnMoreBtn}
                onPress={() => setShowVoipModal(true)}
              >
                <Text style={styles.subLearnMoreText}>Learn More</Text>
                <ChevronRight color="#D4AF37" size={13} strokeWidth={2} />
              </Pressable>
            </View>
          </View>

          {/* Item 3 */}
          <View style={styles.serviceRow}>
            <View style={styles.serviceIconContainer}>
              <Coins color="#D4AF37" size={22} strokeWidth={2.4} />
            </View>
            <View style={styles.serviceTextContainer}>
              <Text style={styles.serviceItemTitle}>Your Journeys Deserve Rewards</Text>
              <Text style={styles.serviceItemDesc}>
                Earn Vanir elite tier points and credits on every flight, hotel suite, luxury yacht, and reservation without restrictions on how to spend them.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal: Call Options */}
      <Modal
        visible={showCallModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCallModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Global VIP Phone Support</Text>
              <Pressable onPress={() => setShowCallModal(false)} style={styles.modalCloseBtn}>
                <X color="#94A3B8" size={20} strokeWidth={2.2} />
              </Pressable>
            </View>
            <Text style={styles.modalSub}>Select your preferred region for toll-free priority assistance:</Text>

            <Pressable
              style={styles.callOptionRow}
              onPress={() => handlePhoneCall('+97180082647')}
            >
              <View>
                <Text style={styles.callRegion}>🇦🇪 United Arab Emirates & GCC</Text>
                <Text style={styles.callNumber}>+971 800 82647 (Toll-Free)</Text>
              </View>
              <Phone color="#D4AF37" size={20} />
            </Pressable>

            <Pressable
              style={styles.callOptionRow}
              onPress={() => handlePhoneCall('+442079460912')}
            >
              <View>
                <Text style={styles.callRegion}>🇬🇧 United Kingdom & Europe</Text>
                <Text style={styles.callNumber}>+44 20 7946 0912</Text>
              </View>
              <Phone color="#D4AF37" size={20} />
            </Pressable>

            <Pressable
              style={styles.callOptionRow}
              onPress={() => handlePhoneCall('+18005550199')}
            >
              <View>
                <Text style={styles.callRegion}>🇺🇸 United States & Americas</Text>
                <Text style={styles.callNumber}>+1 (800) 555-0199</Text>
              </View>
              <Phone color="#D4AF37" size={20} />
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal: Emergency Assistance */}
      <Modal
        visible={showEmergencyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEmergencyModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ShieldAlert color="#EF4444" size={24} />
                <Text style={[styles.modalTitle, { color: '#EF4444' }]}>24/7 Priority Emergency</Text>
              </View>
              <Pressable onPress={() => setShowEmergencyModal(false)} style={styles.modalCloseBtn}>
                <X color="#64748B" size={20} />
              </Pressable>
            </View>
            <Text style={styles.modalSub}>
              This emergency channel connects directly to our senior crisis management team for immediate flight rebooking, emergency medical evacuation, or urgent consular assistance.
            </Text>

            <Pressable
              style={[styles.callOptionRow, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}
              onPress={handleEmergencyCall}
            >
              <View>
                <Text style={[styles.callRegion, { color: '#B91C1C' }]}>Immediate Dispatch Line</Text>
                <Text style={[styles.callNumber, { color: '#991B1B' }]}>+971 800 82647 (Instant Connect)</Text>
              </View>
              <PhoneCall color="#DC2626" size={22} />
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal: Guarantee Details */}
      <Modal
        visible={showGuaranteeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGuaranteeModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>VANIR Comprehensive Guarantee</Text>
              <Pressable onPress={() => setShowGuaranteeModal(false)} style={styles.modalCloseBtn}>
                <X color="#64748B" size={20} />
              </Pressable>
            </View>
            <Text style={styles.guaranteeModalBody}>
              • Full Booking Protection: 100% refund or instant re-accommodation if a property or airline fails to honor your confirmed itinerary.{'\n\n'}
              • No Surprise Fees: All prices shown include taxes, resort fees, and concierge management charges.{'\n\n'}
              • Direct Private Escalation: Access to senior duty managers 24 hours a day, 365 days a year.{'\n\n'}
              • Flexible Re-scheduling: Enjoy complimentary modifications on eligible VIP suite and private jet packages.
            </Text>
          </View>
        </View>
      </Modal>

      {/* Modal: Free Internet Calls */}
      <Modal
        visible={showVoipModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowVoipModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Free In-App Internet Calls</Text>
              <Pressable onPress={() => setShowVoipModal(false)} style={styles.modalCloseBtn}>
                <X color="#64748B" size={20} />
              </Pressable>
            </View>
            <Text style={styles.guaranteeModalBody}>
              • Works anywhere globally over Wi-Fi or cellular data.{'\n\n'}
              • Connects directly to your dedicated Vanir concierge manager without international phone charges.{'\n\n'}
              • HD audio with automatic noise reduction so you can speak clearly even from crowded airports or transit hubs.
            </Text>
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
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  actionCardsGroup: {
    gap: 12,
    marginBottom: 20,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  actionCardPressed: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  actionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCardTextCol: {
    flex: 1,
  },
  actionCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1917',
  },
  actionCardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  sosBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  sosBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  guaranteeBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  guaranteeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  guaranteeIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guaranteeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1917',
    flex: 1,
    lineHeight: 22,
  },
  guaranteeDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 12,
  },
  learnMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  learnMoreText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D4AF37',
  },
  serviceSection: {
    gap: 18,
  },
  serviceSectionHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1917',
    marginBottom: 4,
  },
  serviceRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  serviceIconContainer: {
    marginTop: 2,
  },
  serviceTextContainer: {
    flex: 1,
  },
  serviceItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1917',
    marginBottom: 4,
  },
  serviceItemDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
  },
  subLearnMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 6,
  },
  subLearnMoreText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D4AF37',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
    borderColor: '#D4AF37',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1C1917',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalSub: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 16,
  },
  callOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
  },
  callRegion: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1917',
  },
  callNumber: {
    fontSize: 13,
    color: '#D4AF37',
    fontWeight: '600',
    marginTop: 2,
  },
  guaranteeModalBody: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
  },
});
