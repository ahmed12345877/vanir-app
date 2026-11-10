import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
  Send,
  Radio,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';
import { usePushNotifications, triggerTestVipNotification } from '../../hooks/usePushNotifications';

interface NotificationItem {
  id: string;
  type: 'booking' | 'offer' | 'travel' | 'security';
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    type: 'booking',
    title: 'Hotel Suite Confirmed',
    description: 'Your reservation at Marriott Mena House, Giza Pyramids (Pyramid View Palace Suite) has been confirmed with VIP lounge access included.',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 'n2',
    type: 'offer',
    title: 'Private Aviation Privilege: 20% Credit',
    description: 'Receive a complimentary $500 hotel dining voucher when chartering a Bombardier Global 7500 to London or Paris this month.',
    time: 'Today, 11:30 AM',
    read: false,
  },
  {
    id: 'n3',
    type: 'travel',
    title: 'Your VIP Chauffeur is Assigned',
    description: 'A Rolls-Royce Phantom VIII chauffeur will await you at Cairo International Airport Terminal 3 for your private hotel transfer.',
    time: 'Yesterday, 08:15 PM',
    read: true,
  },
  {
    id: 'n4',
    type: 'booking',
    title: 'Global High-Speed eSIM Activated',
    description: 'Your 10GB Global Roaming Plan is now active. Enjoy seamless high-speed 5G connectivity across 180+ countries worldwide.',
    time: '2 days ago',
    read: true,
  },
  {
    id: 'n5',
    type: 'travel',
    title: 'Superyacht Majesty 120 Ready for Boarding',
    description: 'Your 120ft private superyacht, captain, and Michelin-trained onboard private chef are ready at Dubai Harbour Marina.',
    time: '3 days ago',
    read: true,
  },
  {
    id: 'n6',
    type: 'security',
    title: 'New VIP Device Sign-in Verified',
    description: 'Your account was successfully accessed from an authorized device. If this was not you, please contact your concierge immediately.',
    time: '1 week ago',
    read: true,
  },
];

export function NotificationsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'feed' | 'settings'>('feed');
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [isSendingTest, setIsSendingTest] = useState(false);

  const { fcmToken, permissionStatus, requestPermission } = usePushNotifications(true);

  // Settings State
  const [bookingAlerts, setBookingAlerts] = useState(true);
  const [exclusiveOffers, setExclusiveOffers] = useState(true);
  const [tripReminders, setTripReminders] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [conciergeUpdates, setConciergeUpdates] = useState(true);

  // Subscribe to real-time Firestore broadcast and personal notifications
  useEffect(() => {
    let unsubs: Array<() => void> = [];

    // 1. Subscribe to broadcast mobile_push_notifications sent from Admin Hub
    try {
      const unsubBroadcast = firestore()
        .collection('mobile_push_notifications')
        .orderBy('sentAt', 'desc')
        .limit(20)
        .onSnapshot(
          snapshot => {
            if (!snapshot || snapshot.empty) return;
            const broadcastList: NotificationItem[] = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                type: 'offer',
                title: data.title || 'VANIR VIP Alert',
                description: data.body || '',
                time: 'Recent',
                read: false,
              };
            });

            setNotifications(prev => {
              const liveIds = new Set(broadcastList.map(l => l.id));
              const remaining = prev.filter(p => !liveIds.has(p.id));
              return [...broadcastList, ...remaining];
            });
          },
          err => {
            console.log('[NotificationsScreen] Broadcast subscription notice:', err);
          },
        );
      unsubs.push(unsubBroadcast);
    } catch {}

    // 2. Subscribe to user-specific notifications if signed in
    const user = auth().currentUser;
    if (user?.uid) {
      try {
        const unsubPersonal = firestore()
          .collection('users')
          .doc(user.uid)
          .collection('notifications')
          .orderBy('createdAt', 'desc')
          .limit(25)
          .onSnapshot(
            snapshot => {
              if (!snapshot || snapshot.empty) return;
              const liveList: NotificationItem[] = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                  id: doc.id,
                  type: data.type || 'booking',
                  title: data.title || 'VIP Concierge Alert',
                  description: data.description || data.body || '',
                  time: data.time || 'Just now',
                  read: !!data.read,
                };
              });

              setNotifications(prev => {
                const liveIds = new Set(liveList.map(l => l.id));
                const remaining = prev.filter(p => !liveIds.has(p.id));
                return [...liveList, ...remaining];
              });
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

  const handleSendTestNotification = async () => {
    if (isSendingTest) return;
    setIsSendingTest(true);
    try {
      if (permissionStatus !== 'granted') {
        await requestPermission();
      }
      const res = await triggerTestVipNotification(
        '🔔 VANIR VIP: Private Jet Itinerary Confirmed',
        'Your Gulfstream G700 CAI → LON is confirmed. Chauffeur awaits at VIP Terminal 4.',
      );
      if (res.success) {
        // Prepend local test notification immediately
        const newNotif: NotificationItem = {
          id: `test-${Date.now()}`,
          type: 'travel',
          title: '🔔 VANIR VIP: Private Jet Itinerary Confirmed',
          description: 'Your Gulfstream G700 CAI → LON is confirmed. Chauffeur awaits at VIP Terminal 4.',
          time: 'Just now',
          read: false,
        };
        setNotifications(prev => [newNotif, ...prev]);
      }
    } finally {
      setIsSendingTest(false);
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

      {/* FCM Device Status Banner */}
      <View style={styles.fcmStatusBar}>
        <View style={styles.fcmStatusLeft}>
          <View
            style={[
              styles.fcmPulseDot,
              { backgroundColor: permissionStatus === 'granted' ? '#10B981' : '#F59E0B' },
            ]}
          />
          <Text style={styles.fcmStatusText}>
            {permissionStatus === 'granted'
              ? 'FCM Push Active • Device Connected'
              : 'Permission Required • Tap to Enable'}
          </Text>
        </View>

        <Pressable
          style={[styles.testAlertBtn, isSendingTest && { opacity: 0.6 }]}
          onPress={handleSendTestNotification}
          disabled={isSendingTest}
        >
          {isSendingTest ? (
            <ActivityIndicator size="small" color="#1C1917" />
          ) : (
            <>
              <Send color="#1C1917" size={13} strokeWidth={2.4} />
              <Text style={styles.testAlertBtnText}>Send Test Alert</Text>
            </>
          )}
        </Pressable>
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
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.listContainer, { paddingBottom: 40 + insets.bottom }]}
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

          {/* Test Dispatcher in Settings */}
          <Pressable
            style={({ pressed }) => [
              styles.testSectionBtn,
              pressed && { opacity: 0.8 },
            ]}
            onPress={handleSendTestNotification}
          >
            <Radio color="#D4AF37" size={18} />
            <Text style={styles.testSectionBtnText}>
              Send Test Push Notification
            </Text>
          </Pressable>
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
  fcmStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C1917',
    marginHorizontal: 16,
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  fcmStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  fcmPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  fcmStatusText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '600',
  },
  testAlertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 5,
  },
  testAlertBtnText: {
    color: '#1C1917',
    fontSize: 11,
    fontWeight: '800',
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
    gap: 12,
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
  testSectionBtn: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1917',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  testSectionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
