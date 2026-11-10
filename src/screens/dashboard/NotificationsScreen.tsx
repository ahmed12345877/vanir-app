import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {
  ChevronLeft,
  Bell,
  Tag,
  ShieldCheck,
  Plane,
  Building,
  CheckCheck,
  Sliders,
  Sparkles,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';

interface NotificationItem {
  id: string;
  type: 'booking' | 'offer' | 'travel' | 'security';
  title: string;
  description: string;
  time: string;
  timestampMs?: number;
  read: boolean;
}

function formatNotificationTime(timestamp: any): string {
  if (!timestamp) return 'Recent';
  try {
    let date: Date;
    if (typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else if (typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else if (typeof timestamp === 'string') {
      return timestamp;
    } else {
      return 'Recent';
    }

    const now = Date.now();
    const diffMin = Math.floor((now - date.getTime()) / (1000 * 60));
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'Recent';
  }
}

export function NotificationsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'feed' | 'settings'>('feed');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Settings State
  const [bookingAlerts, setBookingAlerts] = useState(true);
  const [exclusiveOffers, setExclusiveOffers] = useState(true);
  const [tripReminders, setTripReminders] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [conciergeUpdates, setConciergeUpdates] = useState(true);

  // Subscribe to real-time Firestore broadcast and personal notifications
  useEffect(() => {
    let unsubs: Array<() => void> = [];
    let broadcastItems: NotificationItem[] = [];
    let personalItems: NotificationItem[] = [];

    const updateCombined = () => {
      const map = new Map<string, NotificationItem>();
      [...personalItems, ...broadcastItems].forEach(item => {
        map.set(item.id, item);
      });
      const sorted = Array.from(map.values()).sort((a, b) => {
        return (b.timestampMs || 0) - (a.timestampMs || 0);
      });
      setNotifications(sorted);
      setIsLoading(false);
    };

    // 1. Subscribe to broadcast mobile_push_notifications sent from Admin Hub
    try {
      const unsubBroadcast = firestore()
        .collection('mobile_push_notifications')
        .orderBy('sentAt', 'desc')
        .limit(30)
        .onSnapshot(
          snapshot => {
            if (!snapshot || snapshot.empty) {
              broadcastItems = [];
              updateCombined();
              return;
            }
            broadcastItems = snapshot.docs.map(doc => {
              const data = doc.data();
              const sentAt = data.sentAt;
              let ms = 0;
              if (sentAt?.toMillis) ms = sentAt.toMillis();
              else if (sentAt?.seconds) ms = sentAt.seconds * 1000;
              else if (typeof sentAt === 'number') ms = sentAt;

              return {
                id: doc.id,
                type: 'offer',
                title: data.title || 'VANIR VIP Alert',
                description: data.body || '',
                time: formatNotificationTime(sentAt),
                timestampMs: ms,
                read: false,
              };
            });
            updateCombined();
          },
          err => {
            console.log('[NotificationsScreen] Broadcast subscription notice:', err);
            setIsLoading(false);
          },
        );
      unsubs.push(unsubBroadcast);
    } catch {
      setIsLoading(false);
    }

    // 2. Subscribe to user-specific notifications if signed in
    const user = auth().currentUser;
    if (user?.uid) {
      try {
        const unsubPersonal = firestore()
          .collection('users')
          .doc(user.uid)
          .collection('notifications')
          .orderBy('createdAt', 'desc')
          .limit(30)
          .onSnapshot(
            snapshot => {
              if (!snapshot || snapshot.empty) {
                personalItems = [];
                updateCombined();
                return;
              }
              personalItems = snapshot.docs.map(doc => {
                const data = doc.data();
                const createdAt = data.createdAt;
                let ms = 0;
                if (createdAt?.toMillis) ms = createdAt.toMillis();
                else if (createdAt?.seconds) ms = createdAt.seconds * 1000;
                else if (typeof createdAt === 'number') ms = createdAt;

                return {
                  id: doc.id,
                  type: data.type || 'booking',
                  title: data.title || 'VIP Concierge Alert',
                  description: data.description || data.body || '',
                  time: formatNotificationTime(createdAt),
                  timestampMs: ms,
                  read: !!data.read,
                };
              });
              updateCombined();
            },
            err => {
              console.log('[NotificationsScreen] Personal subscription notice:', err);
            },
          );
        unsubs.push(unsubPersonal);
      } catch {}
    }

    return () => {
      unsubs.forEach(u => u());
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    const user = auth().currentUser;
    if (user?.uid) {
      try {
        const batch = firestore().batch();
        const unreadDocs = await firestore()
          .collection('users')
          .doc(user.uid)
          .collection('notifications')
          .where('read', '==', false)
          .get();

        unreadDocs.forEach(doc => {
          batch.update(doc.ref, { read: true });
        });
        await batch.commit();
      } catch (err) {
        console.log('[NotificationsScreen] batch update error:', err);
      }
    }
  };

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'booking':
        return <Building color="#D4AF37" size={20} />;
      case 'offer':
        return <Tag color="#EA580C" size={20} />;
      case 'travel':
        return <Plane color="#16A34A" size={20} />;
      case 'security':
        return <ShieldCheck color="#6366F1" size={20} />;
      default:
        return <Bell color="#D4AF37" size={20} />;
    }
  };

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
          <Text style={styles.headerTitle}>VIP NOTIFICATIONS</Text>
          <Text style={styles.headerSub}>
            {unreadCount > 0 ? `${unreadCount} unread luxury updates` : 'All alerts up to date'}
          </Text>
        </View>

        {activeTab === 'feed' && unreadCount > 0 ? (
          <Pressable
            style={({ pressed }) => [
              styles.markReadBtn,
              pressed && styles.topBtnPressed,
            ]}
            onPress={markAllAsRead}
          >
            <CheckCheck color="#1C1917" size={20} strokeWidth={2} />
          </Pressable>
        ) : (
          <View style={styles.headerRightPlaceholder} />
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <Pressable
          style={[styles.tabBtn, activeTab === 'feed' && styles.tabBtnActive]}
          onPress={() => setActiveTab('feed')}
        >
          <Bell color={activeTab === 'feed' ? '#D4AF37' : '#94A3B8'} size={16} />
          <Text style={[styles.tabBtnText, activeTab === 'feed' && styles.tabBtnTextActive]}>
            Activity {unreadCount > 0 ? `(${unreadCount})` : ''}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tabBtn, activeTab === 'settings' && styles.tabBtnActive]}
          onPress={() => setActiveTab('settings')}
        >
          <Sliders color={activeTab === 'settings' ? '#D4AF37' : '#94A3B8'} size={16} />
          <Text style={[styles.tabBtnText, activeTab === 'settings' && styles.tabBtnTextActive]}>
            Alert Preferences
          </Text>
        </Pressable>
      </View>

      {activeTab === 'feed' ? (
        isLoading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color="#D4AF37" />
            <Text style={styles.loadingText}>Loading notifications...</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.listContainer,
              { paddingBottom: 40 + insets.bottom },
              notifications.length === 0 && styles.emptyListContainer,
            ]}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconWrapper}>
                  <Bell color="#D4AF37" size={32} strokeWidth={1.8} />
                </View>
                <Text style={styles.emptyTitle}>No Notifications Yet</Text>
                <Text style={styles.emptySubtitle}>
                  You will receive instant alerts here for your luxury flight reservations, hotel suite confirmations, and exclusive VIP privileges.
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <Pressable
                style={[styles.card, !item.read && styles.unreadCard]}
                onPress={() => {
                  setNotifications(prev =>
                    prev.map(n => (n.id === item.id ? { ...n, read: true } : n))
                  );
                  const user = auth().currentUser;
                  if (user?.uid && !item.id.startsWith('test-')) {
                    firestore()
                      .collection('users')
                      .doc(user.uid)
                      .collection('notifications')
                      .doc(item.id)
                      .update({ read: true })
                      .catch(() => {});
                  }
                }}
              >
                <View style={[styles.iconWrapper, { backgroundColor: item.read ? '#1E293B' : '#1C1917' }]}>
                  {getNotificationIcon(item.type)}
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.cardTopRow}>
                    <Text style={[styles.cardTitle, !item.read && styles.unreadTitle]}>{item.title}</Text>
                    {!item.read && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.cardDesc}>{item.description}</Text>
                  <Text style={styles.cardTime}>{item.time}</Text>
                </View>
              </Pressable>
            )}
          />
        )
      ) : (
        <View style={styles.settingsContainer}>
          <Text style={styles.settingsSectionTitle}>NOTIFICATION PREFERENCES</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingTextGroup}>
                <Text style={styles.settingLabel}>Booking & Itinerary Updates</Text>
                <Text style={styles.settingSub}>Instant alerts for hotel, jet, and yacht confirmations</Text>
              </View>
              <Switch
                value={bookingAlerts}
                onValueChange={setBookingAlerts}
                trackColor={{ false: '#334155', true: '#D4AF37' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingTextGroup}>
                <Text style={styles.settingLabel}>Elite Privileges & Exclusive Offers</Text>
                <Text style={styles.settingSub}>Invitations to private jet empty-legs and VIP suites</Text>
              </View>
              <Switch
                value={exclusiveOffers}
                onValueChange={setExclusiveOffers}
                trackColor={{ false: '#334155', true: '#D4AF37' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingTextGroup}>
                <Text style={styles.settingLabel}>Travel & Chauffeur Timelines</Text>
                <Text style={styles.settingSub}>Flight status, chauffeur arrival, and gate reminders</Text>
              </View>
              <Switch
                value={tripReminders}
                onValueChange={setTripReminders}
                trackColor={{ false: '#334155', true: '#D4AF37' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingTextGroup}>
                <Text style={styles.settingLabel}>Account Security & Payments</Text>
                <Text style={styles.settingSub}>Immediate notifications for billing and device logins</Text>
              </View>
              <Switch
                value={securityAlerts}
                onValueChange={setSecurityAlerts}
                trackColor={{ false: '#334155', true: '#D4AF37' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingTextGroup}>
                <Text style={styles.settingLabel}>Direct VIP Concierge Messages</Text>
                <Text style={styles.settingSub}>Real-time updates from your dedicated human architect</Text>
              </View>
              <Switch
                value={conciergeUpdates}
                onValueChange={setConciergeUpdates}
                trackColor={{ false: '#334155', true: '#D4AF37' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAF9F6' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FAF9F6',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  topBtnPressed: {
    opacity: 0.7,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 1.2,
  },
  headerSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  markReadBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerRightPlaceholder: {
    width: 40,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabBtnActive: {
    backgroundColor: '#1C1917',
    borderColor: '#1C1917',
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 12,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1C1917',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1C1917',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  unreadCard: {
    borderColor: 'rgba(212, 175, 55, 0.4)',
    backgroundColor: '#FCFAF4',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1917',
    flex: 1,
  },
  unreadTitle: {
    color: '#1C1917',
    fontWeight: '800',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D4AF37',
    marginLeft: 6,
  },
  cardDesc: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 6,
  },
  cardTime: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontWeight: '500',
  },
  settingsContainer: {
    paddingHorizontal: 16,
  },
  settingsSectionTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1.2,
    marginBottom: 10,
    marginTop: 6,
  },
  settingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  settingTextGroup: {
    flex: 1,
    paddingRight: 16,
  },
  settingLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1C1917',
    marginBottom: 2,
  },
  settingSub: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
});
