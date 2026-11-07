import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Sparkles, Send, Bot, Compass, Eye, ShieldCheck } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';

type AIMode = 'concierge' | 'planner' | 'vision';

interface ModeConfig {
  id: AIMode;
  label: string;
  icon: string;
  greeting: string;
}

const MODES: ModeConfig[] = [
  {
    id: 'concierge',
    label: '24/7 Concierge',
    icon: '◈',
    greeting: 'Welcome to VANIR Concierge. How may I orchestrate your luxury travel plans today?',
  },
  {
    id: 'planner',
    label: 'Trip Planner',
    icon: '◉',
    greeting: 'Welcome to Bespoke Trip Planning. Tell me your dream destination and travel party, and I will craft an exclusive itinerary.',
  },
  {
    id: 'vision',
    label: 'Vision & Concierge',
    icon: '◎',
    greeting: 'Welcome to VIP Vision Studio. Inquire about private island retreats, superyacht berths, and landmark access.',
  },
];

const QUICK_PROMPTS = [
  'Plan 7-day Egypt luxury journey',
  'Reserve suite at Burj Al Arab Dubai',
  'Private jet charter London to Paris',
  'Book Aman Tokyo penthouse suite',
  'Charter superyacht on the Bosphorus',
  'Clifftop ocean villa in Bali',
];

interface ChatMsg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

export function AIStudioScreen() {
  const insets = useSafeAreaInsets();
  const [activeMode, setActiveMode] = useState<AIMode>('concierge');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: 'init',
      role: 'assistant',
      content: MODES[0].greeting,
      time: '10:00 AM',
    },
  ]);

  const switchMode = (mode: AIMode) => {
    setActiveMode(mode);
    const selected = MODES.find(m => m.id === mode)!;
    setMessages([
      {
        id: `mode_${Date.now()}`,
        role: 'assistant',
        content: selected.greeting,
        time: 'Just now',
      },
    ]);
  };

  const handleSend = (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMessage: ChatMsg = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: text.trim(),
      time: 'Just now',
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    setTimeout(() => {
      let reply = '';
      const lower = text.toLowerCase();
      if (lower.includes('egypt') || lower.includes('cairo')) {
        reply = 'For Egypt, I recommend a Royal Suite at The Nile Ritz-Carlton overlooking Tahrir and the Nile, followed by a private stay at Marriott Mena House with direct views of the Pyramids. We can arrange private after-hours access to the Grand Egyptian Museum and a VIP helicopter transfer.';
      } else if (lower.includes('dubai')) {
        reply = 'In Dubai, our guests highest rated residence is the Royal Duplex Suite at Burj Al Arab or the Sky Villas at Atlantis The Royal. Both include dedicated 24/7 royal butler service, chauffeured Rolls-Royce Phantom transfers, and private beach cabana privileges.';
      } else if (lower.includes('paris')) {
        reply = 'In Paris, I recommend the Duc de Crillon Suite at Hôtel de Crillon on Place de la Concorde, or Four Seasons Hotel George V for unparalleled haute couture floral artistry and three Michelin-starred dining experiences.';
      } else if (lower.includes('london')) {
        reply = 'In London, nothing surpasses the historic elegance of The Ritz London in Mayfair or a River Suite at The Savoy. We can seamlessly arrange private Heathrow Windsor VIP suite arrival and Bentley Continental transfers.';
      } else {
        reply = `Thank you for your inquiry regarding "${text}". As your VANIR VIP Concierge, I can confirm bespoke private jet routes, five-star hotel reservations with guaranteed complimentary upgrades, and private security escorts. Would you like me to prepare a tailored reservation schedule?`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: `ast_${Date.now()}`,
          role: 'assistant',
          content: reply,
          time: 'Just now',
        },
      ]);
      setIsTyping(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, 800);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <View style={styles.aiIconBadge}>
              <Sparkles color="#D4AF37" size={18} />
            </View>
            <View>
              <Text style={styles.headerTitle}>VANIR AI STUDIO</Text>
              <Text style={styles.headerSubtitle}>Ultra-Luxury Travel Intelligence</Text>
            </View>
          </View>

          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>ONLINE</Text>
          </View>
        </View>

        {/* Mode switcher */}
        <View style={styles.modeSwitcher}>
          {MODES.map(m => (
            <Pressable
              key={m.id}
              onPress={() => switchMode(m.id)}
              style={[styles.modeTab, activeMode === m.id && styles.modeTabActive]}
            >
              <Text style={[styles.modeIcon, activeMode === m.id && styles.modeIconActive]}>
                {m.icon}
              </Text>
              <Text style={[styles.modeLabel, activeMode === m.id && styles.modeLabelActive]}>
                {m.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={[styles.messageList, { paddingBottom: 20 }]}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(m => (
            <View
              key={m.id}
              style={[
                styles.bubbleRow,
                m.role === 'user' ? styles.bubbleRowUser : styles.bubbleRowAI,
              ]}
            >
              {m.role === 'assistant' && (
                <View style={styles.aiAvatar}>
                  <Bot color="#D4AF37" size={16} />
                </View>
              )}
              <View
                style={[
                  styles.bubble,
                  m.role === 'user' ? styles.bubbleUser : styles.bubbleAI,
                ]}
              >
                <Text
                  style={[
                    styles.bubbleText,
                    m.role === 'user' ? styles.bubbleTextUser : styles.bubbleTextAI,
                  ]}
                >
                  {m.content}
                </Text>
                <Text style={[styles.bubbleTime, m.role === 'user' && { color: '#1C1917' }]}>
                  {m.time}
                </Text>
              </View>
            </View>
          ))}

          {isTyping && (
            <View style={styles.bubbleRow}>
              <View style={styles.aiAvatar}>
                <Bot color="#D4AF37" size={16} />
              </View>
              <View style={styles.typingBubble}>
                <Text style={styles.typingText}>VANIR Intelligence is responding...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick prompts */}
        {messages.filter(m => m.role === 'user').length === 0 && (
          <View style={styles.quickSection}>
            <Text style={styles.quickTitle}>CURATED EXPEDITIONS</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickPromptsRow}
            >
              {QUICK_PROMPTS.map(p => (
                <Pressable
                  key={p}
                  style={styles.quickPromptChip}
                  onPress={() => handleSend(p)}
                >
                  <Sparkles color="#D4AF37" size={12} />
                  <Text style={styles.quickPromptText}>{p}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Safe-Area Compliant Input Bar (Above Mobile Navigation Icons) */}
        <View style={[styles.inputBar, { paddingBottom: 14 }]}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask your luxury AI concierge..."
              placeholderTextColor="#94A3B8"
              multiline
              maxLength={800}
            />
          </View>

          <Pressable
            onPress={() => handleSend(inputText)}
            disabled={!inputText.trim() || isTyping}
            style={[styles.sendBtn, (!inputText.trim() || isTyping) && styles.sendBtnDisabled]}
          >
            <Send color={!inputText.trim() ? '#64748B' : '#1C1917'} size={18} strokeWidth={2.2} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAF9F6' },
  flex: { flex: 1 },
  header: {
    backgroundColor: '#FAF9F6',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
    paddingBottom: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 1.5,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  statusText: { fontSize: 10, color: '#10B981', fontWeight: '800', letterSpacing: 1 },
  modeSwitcher: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginTop: 4,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(28, 25, 23, 0.1)',
  },
  modeTabActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  modeIcon: { fontSize: 14, color: '#64748B' },
  modeIconActive: { color: '#1C1917' },
  modeLabel: { fontSize: 11, color: '#64748B', fontWeight: '700' },
  modeLabelActive: { color: '#1C1917' },
  messageList: {
    padding: 16,
    gap: 16,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bubbleRowUser: {
    justifyContent: 'flex-end',
  },
  bubbleRowAI: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bubbleUser: {
    backgroundColor: '#D4AF37',
    borderBottomRightRadius: 4,
  },
  bubbleAI: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 22,
  },
  bubbleTextUser: {
    color: '#1C1917',
    fontWeight: '600',
  },
  bubbleTextAI: {
    color: '#1C1917',
    fontWeight: '400',
  },
  bubbleTime: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  typingText: {
    color: '#64748B',
    fontSize: 12,
  },
  quickSection: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  quickTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  quickPromptsRow: {
    gap: 8,
  },
  quickPromptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  quickPromptText: { fontSize: 12, color: '#1C1917', fontWeight: '700' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.2)',
    gap: 10,
    backgroundColor: '#FAF9F6',
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    maxHeight: 100,
  },
  input: {
    color: '#1C1917',
    fontSize: 14,
    minHeight: 36,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#E2E8F0',
  },
});
