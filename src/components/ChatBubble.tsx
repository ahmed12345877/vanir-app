import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <View style={styles.systemRow}>
        <View style={styles.systemDot} />
        <Text style={styles.systemText}>{message.content}</Text>
        <View style={styles.systemDot} />
      </View>
    );
  }

  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      <View style={[styles.bubbleWrapper, isUser && styles.bubbleWrapperUser]}>
        {isUser ? (
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.bubble, styles.bubbleUser]}>
            <Text style={styles.textUser}>{message.content}</Text>
          </LinearGradient>
        ) : (
          <View style={[styles.bubble, styles.bubbleAI]}>
            <Text style={styles.textAI}>{message.content}</Text>
          </View>
        )}
        <Text style={[styles.timestamp, isUser && styles.timestampUser]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
      {!isUser && (
        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={[colors.primaryDark, colors.primary]}
            style={styles.avatar}>
            <Text style={styles.avatarText}>✦</Text>
          </LinearGradient>
        </View>
      )}
    </View>
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** Typing indicator bubble for AI */
export function TypingBubble() {
  return (
    <View style={styles.row}>
      <View style={[styles.bubble, styles.bubbleAI, styles.typingBubble]}>
        <View style={styles.typingDots}>
          <View style={[styles.typingDot, styles.typingDot1]} />
          <View style={[styles.typingDot, styles.typingDot2]} />
          <View style={[styles.typingDot, styles.typingDot3]} />
        </View>
      </View>
      <View style={styles.avatarContainer}>
        <LinearGradient
          colors={[colors.primaryDark, colors.primary]}
          style={styles.avatar}>
          <Text style={styles.avatarText}>✦</Text>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-end',
    gap: spacing[2],
    marginBottom: spacing[3],
    paddingHorizontal: spacing[4],
  },
  rowUser: { flexDirection: 'row' },
  avatarContainer: { width: 32 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.textOnGold, fontSize: 14, fontWeight: '700' },
  bubbleWrapper: { flex: 1, maxWidth: '82%', gap: 3, alignItems: 'flex-end' },
  bubbleWrapperUser: { alignItems: 'flex-start' },
  bubble: {
    borderRadius: borderRadius.xl,
    padding: spacing[3],
    paddingHorizontal: spacing[4],
    maxWidth: '100%',
  },
  bubbleUser: {
    borderBottomLeftRadius: borderRadius.sm,
  },
  bubbleAI: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderBottomRightRadius: borderRadius.sm,
  },
  textUser: {
    color: colors.textOnGold,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    textAlign: 'right',
  },
  textAI: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'right',
  },
  timestamp: {
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
  timestampUser: { color: colors.textMuted },
  // System message
  systemRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[4],
    marginHorizontal: spacing[8],
  },
  systemDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primaryBorder,
  },
  systemText: {
    flex: 1,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  // Typing indicator
  typingBubble: { paddingVertical: spacing[3] },
  typingDots: { flexDirection: 'row', gap: 4, paddingHorizontal: spacing[2] },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary,
    opacity: 0.4,
  },
  typingDot1: { opacity: 0.8 },
  typingDot2: { opacity: 0.5 },
  typingDot3: { opacity: 0.3 },
});
