import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Archive,
  ArrowLeft,
  ChevronRight,
  MessageSquare,
  Search,
  Send,
  Settings,
  Sparkles,
  X,
} from 'lucide-react-native';
import { BespokeLifestyleIcon } from '../../components/BespokeLifestyleIcons';
import type { RootStackParamList } from '../../navigation/types';

const { width } = Dimensions.get('window');

interface PastConversation {
  id: string;
  hostName: string;
  role: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  avatarColor: string;
}

const SAMPLE_PAST_CONVERSATIONS: PastConversation[] = [
  {
    id: 'conv-concierge',
    hostName: 'Vanir Royal Concierge',
    role: 'VIP Butler & Aviation Desk',
    lastMessage: 'Your private helicopter transfer to Burj Al Arab is confirmed.',
    time: 'Yesterday',
    unread: false,
    avatarColor: '#C5A059',
  },
  {
    id: 'conv-ayman',
    hostName: 'Ayman Dakroury',
    role: 'Heritage Photographer · Cairo',
    lastMessage: 'Looking forward to meeting you at the Great Pyramids panorama at sunset.',
    time: '2 days ago',
    unread: false,
    avatarColor: '#EA580C',
  },
  {
    id: 'conv-andrea',
    hostName: 'Capt. Andrea Rossi',
    role: 'Mediterranean Superyacht Master',
    lastMessage: 'The 50m Benetti superyacht is prepped for your Amalfi coast cruise.',
    time: 'Last week',
    unread: false,
    avatarColor: '#0284C7',
  },
];

export function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [pastConversationsVisible, setPastConversationsVisible] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);

  const handleStartNow = () => {
    navigation.navigate('MainTabs', { screen: 'Explore' } as any);
  };

  const handleSendFeedback = () => {
    if (!feedbackText.trim()) {
      Alert.alert('Notice', 'Please write your thoughts or suggestions before submitting.');
      return;
    }
    Alert.alert('Thank You', 'Your feedback has been sent directly to the Vanir Royal Concierge desk.');
    setFeedbackText('');
    setFeedbackModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* ── Top App Bar (Luxury English Layout) ── */}
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>Messages</Text>

        <View style={styles.topActionsRight}>
          <Pressable
            style={styles.iconCircleBtn}
            onPress={() => setShowSearchInput(prev => !prev)}
            accessibilityLabel="Search Messages"
          >
            <Search size={19} color="#1C1917" strokeWidth={2} />
          </Pressable>

          <Pressable
            style={styles.iconCircleBtn}
            onPress={() => setSettingsModalVisible(true)}
            accessibilityLabel="Messaging Settings"
          >
            <Settings size={19} color="#1C1917" strokeWidth={2} />
          </Pressable>
        </View>
      </View>

      {/* Expandable Search Input */}
      {showSearchInput && (
        <View style={styles.searchBarBox}>
          <Search size={16} color="#78716C" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations or hosts..."
            placeholderTextColor="#A8A29E"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <X size={16} color="#78716C" />
            </Pressable>
          )}
        </View>
      )}

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Central Hero: 3D Bespoke Vanir Royal Gold Graphic ── */}
        <View style={styles.emptyStateBox}>
          <View style={styles.graphicWrapper}>
            <View style={styles.goldHaloGlow} />
            <BespokeLifestyleIcon name="messages" size={96} />
          </View>

          {/* Heading & Subtitle in English */}
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptySubtitle}>
            Start planning a luxury stay, private aviation flight, or bespoke service to connect with your royal concierge and verified hosts here.
          </Text>

          {/* Luxury Action Button (Deep Obsidian & Gold) */}
          <Pressable
            style={({ pressed }) => [
              styles.startNowBtn,
              pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
            ]}
            onPress={handleStartNow}
          >
            <Sparkles size={16} color="#D4AF37" strokeWidth={2.2} />
            <Text style={styles.startNowText}>Explore Experiences</Text>
          </Pressable>
        </View>

        {/* ── Bottom Chevron Row: Past Conversations ── */}
        <Pressable
          style={({ pressed }) => [
            styles.pastConversationsRow,
            pressed && { backgroundColor: 'rgba(0,0,0,0.03)' },
          ]}
          onPress={() => setPastConversationsVisible(true)}
        >
          <View style={styles.pastConversationsLeft}>
            <View style={styles.archiveSmallIconBox}>
              <Archive size={17} color="#C5A059" strokeWidth={2} />
            </View>
            <Text style={styles.pastConversationsText}>Past Conversations</Text>
          </View>
          <ChevronRight size={20} color="#78716C" strokeWidth={2} />
        </Pressable>
      </ScrollView>

      {/* ═══════════════════════════════════════════════════════════════════════
          BOTTOM SHEET MODAL: Messaging Settings (100% English & Luxury Icons)
         ═══════════════════════════════════════════════════════════════════════ */}
      <Modal
        visible={settingsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <Pressable
          style={styles.sheetBackdrop}
          onPress={() => setSettingsModalVisible(false)}
        >
          <Pressable
            style={[
              styles.bottomSheetCard,
              { paddingBottom: Math.max(insets.bottom + 20, 32) },
            ]}
            onPress={e => e.stopPropagation()}
          >
            {/* Sheet Header: Title on Left, Close on Right */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Messaging Settings</Text>
              <Pressable
                style={styles.sheetCloseBtn}
                onPress={() => setSettingsModalVisible(false)}
              >
                <X size={20} color="#1C1917" strokeWidth={2.2} />
              </Pressable>
            </View>

            {/* Option 1: Past Conversations */}
            <Pressable
              style={({ pressed }) => [
                styles.sheetOptionRow,
                pressed && { backgroundColor: 'rgba(0,0,0,0.03)' },
              ]}
              onPress={() => {
                setSettingsModalVisible(false);
                setPastConversationsVisible(true);
              }}
            >
              <View style={styles.sheetOptionLeft}>
                <View style={styles.sheetIconBox}>
                  <Archive size={20} color="#C5A059" strokeWidth={2} />
                </View>
                <View>
                  <Text style={styles.sheetOptionLabel}>Past Conversations</Text>
                  <Text style={styles.sheetOptionSub}>Review archived dialogues & concierge requests</Text>
                </View>
              </View>
              <ChevronRight size={18} color="#A8A29E" strokeWidth={2} />
            </Pressable>

            {/* Option 2: Send Feedback */}
            <Pressable
              style={({ pressed }) => [
                styles.sheetOptionRow,
                pressed && { backgroundColor: 'rgba(0,0,0,0.03)' },
              ]}
              onPress={() => {
                setSettingsModalVisible(false);
                setFeedbackModalVisible(true);
              }}
            >
              <View style={styles.sheetOptionLeft}>
                <View style={styles.sheetIconBox}>
                  <Send size={19} color="#C5A059" strokeWidth={2} />
                </View>
                <View>
                  <Text style={styles.sheetOptionLabel}>Send Feedback</Text>
                  <Text style={styles.sheetOptionSub}>Share suggestions directly with Vanir management</Text>
                </View>
              </View>
              <ChevronRight size={18} color="#A8A29E" strokeWidth={2} />
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ═══════════════════════════════════════════════════════════════════════
          MODAL: Past Conversations List
         ═══════════════════════════════════════════════════════════════════════ */}
      <Modal
        visible={pastConversationsVisible}
        animationType="slide"
        onRequestClose={() => setPastConversationsVisible(false)}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.modalHeader}>
            <Pressable
              style={styles.iconCircleBtn}
              onPress={() => setPastConversationsVisible(false)}
            >
              <ArrowLeft size={20} color="#1C1917" strokeWidth={2} />
            </Pressable>
            <Text style={styles.modalHeaderTitle}>Past Conversations</Text>
            <View style={{ width: 38 }} />
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 18, paddingBottom: insets.bottom + 40 }}
          >
            {SAMPLE_PAST_CONVERSATIONS.map(conv => (
              <Pressable
                key={conv.id}
                style={styles.conversationCard}
                onPress={() => {
                  Alert.alert(
                    conv.hostName,
                    `Connecting with ${conv.hostName} via the Vanir Concierge Network.`
                  );
                }}
              >
                <View
                  style={[
                    styles.avatarBadge,
                    { backgroundColor: conv.avatarColor },
                  ]}
                >
                  <Text style={styles.avatarText}>
                    {conv.hostName.charAt(0)}
                  </Text>
                </View>

                <View style={{ flex: 1, marginLeft: 14 }}>
                  <View style={styles.convHeaderRow}>
                    <Text style={styles.convHostName}>{conv.hostName}</Text>
                    <Text style={styles.convTime}>{conv.time}</Text>
                  </View>
                  <Text style={styles.convRole}>{conv.role}</Text>
                  <Text style={styles.convLastMessage} numberOfLines={2}>
                    {conv.lastMessage}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ═══════════════════════════════════════════════════════════════════════
          MODAL: Send Feedback
         ═══════════════════════════════════════════════════════════════════════ */}
      <Modal
        visible={feedbackModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFeedbackModalVisible(false)}
      >
        <Pressable
          style={styles.sheetBackdrop}
          onPress={() => setFeedbackModalVisible(false)}
        >
          <Pressable
            style={[styles.feedbackCard, { marginBottom: insets.bottom + 20 }]}
            onPress={e => e.stopPropagation()}
          >
            <View style={styles.feedbackHeader}>
              <Text style={styles.feedbackTitle}>Send Feedback</Text>
              <Pressable onPress={() => setFeedbackModalVisible(false)}>
                <X size={20} color="#78716C" />
              </Pressable>
            </View>

            <Text style={styles.feedbackDesc}>
              Tell us how we can improve your luxury travel, private aviation, or concierge messaging experience in the Vanir app.
            </Text>

            <TextInput
              style={styles.feedbackInput}
              multiline
              numberOfLines={4}
              placeholder="Write your feedback or suggestions here..."
              placeholderTextColor="#A8A29E"
              value={feedbackText}
              onChangeText={setFeedbackText}
            />

            <View style={styles.feedbackBtnRow}>
              <Pressable
                style={styles.feedbackCancelBtn}
                onPress={() => setFeedbackModalVisible(false)}
              >
                <Text style={styles.feedbackCancelText}>Cancel</Text>
              </Pressable>

              <Pressable style={styles.feedbackSubmitBtn} onPress={handleSendFeedback}>
                <Text style={styles.feedbackSubmitText}>Submit Feedback</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0D1626',
    letterSpacing: -0.4,
  },
  topActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F4',
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBarBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F5F5F4',
    borderRadius: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14.5,
    color: '#1C1917',
    padding: 0,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 36,
  },
  emptyStateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  graphicWrapper: {
    width: 120,
    height: 120,
    marginBottom: 26,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goldHaloGlow: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0D1626',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14.5,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
    marginBottom: 28,
  },
  startNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D1626',
    borderWidth: 1.5,
    borderColor: '#C5A059',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 24,
    gap: 10,
    shadowColor: '#C5A059',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  startNowText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F9ECC7',
    letterSpacing: 0.3,
  },
  pastConversationsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  pastConversationsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  archiveSmallIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FAF7F0',
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pastConversationsText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#1C1917',
  },

  /* Bottom Sheet Styles */
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(13, 22, 38, 0.55)',
    justifyContent: 'flex-end',
  },
  bottomSheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 18,
    paddingHorizontal: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 18,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 8,
  },
  sheetCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0D1626',
    letterSpacing: -0.2,
  },
  sheetOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F4',
  },
  sheetOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  sheetOptionLabel: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#1C1917',
  },
  sheetOptionSub: {
    fontSize: 12.5,
    color: '#78716C',
    marginTop: 2,
  },
  sheetIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FAF7F0',
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Past Conversations Modal */
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F4',
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0D1626',
  },
  conversationCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  avatarBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  convHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  convHostName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1917',
  },
  convTime: {
    fontSize: 12,
    color: '#78716C',
  },
  convRole: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C5A059',
    marginBottom: 6,
  },
  convLastMessage: {
    fontSize: 13.5,
    color: '#4B5563',
    lineHeight: 18,
  },

  /* Send Feedback Modal */
  feedbackCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 20,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0D1626',
  },
  feedbackDesc: {
    fontSize: 13.5,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  feedbackInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    fontSize: 14,
    color: '#1C1917',
    textAlignVertical: 'top',
    height: 100,
    marginBottom: 20,
  },
  feedbackBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  feedbackCancelBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  feedbackCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  feedbackSubmitBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#0D1626',
    borderWidth: 1,
    borderColor: '#C5A059',
  },
  feedbackSubmitText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F9ECC7',
  },
});
