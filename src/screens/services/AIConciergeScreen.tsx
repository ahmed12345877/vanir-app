import React, { useCallback, useRef, useState } from 'react';
import {
  Image,
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
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { ChevronLeft, Sparkles, Send, Bot, ShieldCheck } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';

type Message = { id: string; role: 'user' | 'assistant'; content: string; time?: string };

const QUICK_PROMPTS = [
  'Plan a 7-day luxury itinerary in Cairo & Giza',
  'Best 5-star suites in Dubai with Burj Khalifa view',
  'Private jet charter from London to Paris',
  'Top luxury boutique hotels in Tokyo & Kyoto',
  'Charter a superyacht on the Bosphorus in Istanbul',
  'Exclusive clifftop pool villas in Bali',
];

const SYSTEM_PROMPT =
  "You are the exclusive AI VIP Concierge for 'VANIR Group', an ultra-luxury international travel and private aviation house. Your persona is refined, articulate, sophisticated, and tailored for high-net-worth individuals, royalty, and executive travelers. Recommend five-star properties (Four Seasons, Ritz-Carlton, Aman, Rosewood), private jets (Gulfstream, Bombardier), and private superyachts. Keep replies polished, well-spaced, and easy to read.";

const ENDPOINT = 'https://models.github.ai/inference/chat/completions';
const MODEL = 'openai/gpt-4o';

let msgId = 0;

async function fetchAIReply(history: Message[], userText: string): Promise<string> {
  const token = process.env.EXPO_PUBLIC_GITHUB_TOKEN;
  if (!token) {
    // Elegant fallback simulation when offline or token unconfigured
    await new Promise(r => setTimeout(r, 900));
    const lower = userText.toLowerCase();
    if (lower.includes('cairo') || lower.includes('egypt') || lower.includes('giza')) {
      return "For an unforgettable Egyptian journey, I recommend a Royal Suite at The Nile Ritz-Carlton overlooking Tahrir and the Nile, followed by a private stay at Marriott Mena House with direct views of the Pyramids. We can arrange private after-hours access to the Grand Egyptian Museum and a VIP helicopter transfer.";
    }
    if (lower.includes('dubai')) {
      return "In Dubai, our guests' highest rated residence is the Royal Duplex Suite at Burj Al Arab or the Sky Villas at Atlantis The Royal. Both include dedicated 24/7 royal butler service, chauffeured Rolls-Royce Phantom transfers, and private beach cabana privileges.";
    }
    if (lower.includes('paris') || lower.includes('france')) {
      return "In Paris, I recommend the Duc de Crillon Suite at Hôtel de Crillon on Place de la Concorde, or Four Seasons Hotel George V for unparalleled haute couture floral artistry and three Michelin-starred dining experiences.";
    }
    if (lower.includes('london') || lower.includes('england')) {
      return "In London, nothing surpasses the historic elegance of The Ritz London in Mayfair or a River Suite at The Savoy. We can seamlessly arrange private Heathrow Windsor VIP suite arrival and Bentley Continental transfers.";
    }
    if (lower.includes('tokyo') || lower.includes('asia') || lower.includes('bali')) {
      return "In East Asia, Aman Tokyo offers an extraordinary minimalist sanctuary overlooking Mount Fuji, while Bulgari Resort Bali provides private clifftop infinity villas in Uluwatu with private funicular beach access.";
    }
    return `Thank you for your inquiry regarding "${userText}". As your VANIR VIP Concierge, I can confirm bespoke private jet routes, five-star hotel reservations with guaranteed complimentary upgrades, and private security escorts. Would you like me to prepare a tailored reservation schedule?`;
  }

  const apiMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: userText },
  ];

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: 512,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`API error (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
  };

  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Empty response from AI assistant');
  }
  return content.trim();
}

export function AIConciergeScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content:
        'Welcome to VANIR AI VIP Concierge.\n\nI am your dedicated 24/7 personal travel architect. I can curate bespoke itineraries, secure five-star private suites, arrange Gulfstream private aviation, charter superyachts, and manage every detail of your journey.\n\nHow may I elevate your travel experience today?',
      time: '10:00 AM',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isTyping) return;

      const userMsg: Message = {
        id: String(++msgId),
        role: 'user',
        content: text.trim(),
        time: 'Just now',
      };

      setMessages(prev => [...prev, userMsg]);
      setInput('');
      setIsTyping(true);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

      try {
        const reply = await fetchAIReply(
          messages.filter(m => !(m.role === 'assistant' && m.id === '0')),
          text.trim(),
        );
        setMessages(prev => [
          ...prev,
          { id: String(++msgId), role: 'assistant', content: reply, time: 'Just now' },
        ]);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Unable to connect to the network.';
        setMessages(prev => [
          ...prev,
          {
            id: String(++msgId),
            role: 'assistant',
            content: `I apologize for the interruption. ${errMsg}\n\nPlease try again or contact your dedicated human concierge directly.`,
            time: 'Just now',
          },
        ]);
      } finally {
        setIsTyping(false);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      }
    },
    [isTyping, messages],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

      {/* Header */}
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

        <View style={styles.headerCenter}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Sparkles color="#D4AF37" size={17} strokeWidth={2} />
            <Text style={styles.headerTitle}>VANIR AI VIP CONCIERGE</Text>
          </View>
          <Text style={styles.headerSub}>Royal Intelligence • 24/7 Dedicated</Text>
        </View>

        <View style={{ width: 40, height: 40, borderRadius: 20, overflow: 'hidden', borderWidth: 1.5, borderColor: '#D4AF37', backgroundColor: '#FFFFFF' }}>
          <Image
            source={require('../../assets/vanir_round_logo.png')}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages Feed */}
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={[styles.messageList, { paddingBottom: 20 }]}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(msg => (
            <View
              key={msg.id}
              style={[
                styles.bubbleRow,
                msg.role === 'user' ? styles.bubbleRowUser : styles.bubbleRowAI,
              ]}
            >
              {msg.role === 'assistant' && (
                <View style={[styles.aiAvatar, { overflow: 'hidden', borderWidth: 1, borderColor: '#D4AF37', backgroundColor: '#1C1917' }]}>
                  <Image
                    source={require('../../assets/vanir_round_logo.png')}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                </View>
              )}
              <View
                style={[
                  styles.bubble,
                  msg.role === 'user' ? styles.bubbleUser : styles.bubbleAI,
                ]}
              >
                <Text
                  style={[
                    styles.bubbleText,
                    msg.role === 'user' ? styles.bubbleTextUser : styles.bubbleTextAI,
                  ]}
                >
                  {msg.content}
                </Text>
                {msg.time && (
                  <Text style={[styles.bubbleTime, msg.role === 'user' && { color: '#1C1917' }]}>
                    {msg.time}
                  </Text>
                )}
              </View>
            </View>
          ))}

          {isTyping && (
            <View style={styles.bubbleRow}>
              <View style={styles.aiAvatar}>
                <Bot color="#38BDF8" size={16} strokeWidth={2} />
              </View>
              <View style={styles.typingBubble}>
                <View style={styles.typingDot} />
                <View style={[styles.typingDot, { opacity: 0.6 }]} />
                <View style={[styles.typingDot, { opacity: 0.3 }]} />
                <Text style={styles.typingText}>Crafting itinerary...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick Prompts (when fresh) */}
        {messages.length <= 2 && (
          <View style={styles.quickSection}>
            <Text style={styles.quickSectionTitle}>SUGGESTED LUXURY INQUIRIES</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickRow}
            >
              {QUICK_PROMPTS.map(p => (
                <Pressable
                  key={p}
                  style={styles.quickChip}
                  onPress={() => sendMessage(p)}
                >
                  <Sparkles color="#38BDF8" size={12} />
                  <Text style={styles.quickChipText}>{p}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Safe-Area Compliant Input Bar (CRITICAL FIX: Above Mobile Navigation Icons) */}
        <View style={[styles.inputBar, { paddingBottom: 14 }]}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Ask your VIP Concierge anything..."
              placeholderTextColor="#94A3B8"
              multiline
              maxLength={800}
            />
          </View>

          <Pressable
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
          >
            <Send color={!input.trim() ? '#64748B' : '#1C1917'} size={18} strokeWidth={2.2} />
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1C1917',
    letterSpacing: 1.5,
  },
  headerSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  onlineText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 1,
  },
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
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D4AF37',
  },
  typingText: {
    color: '#64748B',
    fontSize: 12,
    marginLeft: 6,
  },
  quickSection: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  quickSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  quickRow: {
    gap: 8,
  },
  quickChip: {
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
  quickChipText: {
    color: '#1C1917',
    fontSize: 12,
    fontWeight: '700',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#FAF9F6',
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.2)',
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
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
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  sendBtnDisabled: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
});
