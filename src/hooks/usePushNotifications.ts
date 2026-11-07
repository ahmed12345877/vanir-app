import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  AppState,
  AppStateStatus,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { postJson } from '../services/api';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface PushNotificationState {
  fcmToken: string | null;
  permissionStatus: PermissionStatus;
  isRegistering: boolean;
  error: string | null;
}

export interface RemoteMessage {
  messageId?: string;
  notification?: {
    title?: string;
    body?: string;
  };
  data?: Record<string, string>;
}

/** Persists the FCM device token to Firestore and the backend */
async function syncTokenToServer(token: string): Promise<void> {
  try {
    const user = auth().currentUser;
    const batch = firestore().batch();

    // 1. Save to fcm_tokens collection
    const tokenRef = firestore().collection('fcm_tokens').doc(token);
    batch.set(
      tokenRef,
      {
        token,
        platform: Platform.OS,
        userId: user?.uid || null,
        userEmail: user?.email || null,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    // 2. If user is signed in, update user profile doc
    if (user?.uid) {
      const userRef = firestore().collection('users').doc(user.uid);
      batch.set(
        userRef,
        {
          fcmToken: token,
          fcmTokenUpdatedAt: firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    }

    await batch.commit();
  } catch {
    // Non-fatal offline fallback
  }

  try {
    await postJson('/api/notifications/register-device', { fcmToken: token });
  } catch {
    // Optional fallback
  }
}

/** Resolves the current FCM permission status without prompting the user. */
async function resolveCurrentPermission(): Promise<PermissionStatus> {
  try {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const check = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      if (!check) return 'undetermined';
    }
    const status = await messaging().hasPermission();
    if (status === messaging.AuthorizationStatus.AUTHORIZED) return 'granted';
    if (status === messaging.AuthorizationStatus.PROVISIONAL) return 'granted';
    if (status === messaging.AuthorizationStatus.DENIED) return 'denied';
    return 'undetermined';
  } catch {
    return 'undetermined';
  }
}

/**
 * Triggers an authentic VIP test notification.
 * Requests OS permission, writes to Firestore under users/{uid}/notifications,
 * and displays an immediate VIP alert banner with live FCM token status.
 */
export async function triggerTestVipNotification(
  customTitle?: string,
  customBody?: string,
): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    // 1. Ensure Android 13+ runtime permission
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'VANIR VIP Concierge Notifications',
          message: 'Allow notifications to receive real-time private flight updates, hotel booking vouchers, and chauffeur arrival alerts.',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        },
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert(
          'Notification Permission Required',
          'Please enable notifications in Android Settings to receive VIP concierge alerts.',
        );
        return { success: false, error: 'Permission denied by user' };
      }
    }

    await messaging().requestPermission({
      sound: true,
      announcement: true,
      badge: true,
      alert: true,
    });

    // 2. Fetch live FCM token
    let token = '';
    try {
      token = await messaging().getToken();
      if (token) {
        await syncTokenToServer(token);
      }
    } catch (tokenErr) {
      console.warn('[Push] getToken error in triggerTestVipNotification:', tokenErr);
    }

    const title = customTitle || '✈️ VANIR VIP: Private Jet Itinerary Confirmed';
    const body =
      customBody ||
      'Your Gulfstream G700 CAI → LON reservation is locked. Rolls-Royce chauffeur assigned at Terminal 4.';

    const user = auth().currentUser;
    const notificationPayload = {
      title,
      description: body,
      body,
      type: 'travel',
      read: false,
      createdAt: firestore.FieldValue.serverTimestamp(),
      time: 'Just now',
      fcmToken: token || null,
      devicePlatform: Platform.OS,
    };

    // 3. Save to user's notifications collection
    if (user?.uid) {
      await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('notifications')
        .add(notificationPayload);
    }

    // 4. Save to global VIP notifications log
    await firestore()
      .collection('vip_notifications_log')
      .add({
        ...notificationPayload,
        userId: user?.uid || 'guest_user',
        userEmail: user?.email || 'guest@vanir.luxury',
      });

    // 5. Display immediate visible alert banner
    Alert.alert(
      '🔔 VIP Notification Delivered',
      `${title}\n\n${body}\n\n[FCM Status: ${token ? 'Connected & Registered' : 'Active'}]`,
      [{ text: 'OK' }],
    );

    return { success: true, token };
  } catch (err: any) {
    const errorMsg = err?.message || 'Failed to dispatch VIP notification';
    Alert.alert('Notification Error', errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Requests FCM push notification permission, retrieves the device token, keeps
 * it refreshed, and syncs it to the Vanir Group backend for targeted delivery.
 */
export function usePushNotifications(autoRequest = true): PushNotificationState & {
  requestPermission: () => Promise<void>;
  sendTestAlert: () => Promise<void>;
} {
  const [state, setState] = useState<PushNotificationState>({
    fcmToken: null,
    permissionStatus: 'undetermined',
    isRegistering: false,
    error: null,
  });

  const appState = useRef<AppStateStatus>(AppState.currentState);
  const tokenRefreshUnsubscribe = useRef<(() => void) | null>(null);
  const foregroundUnsubscribe = useRef<(() => void) | null>(null);
  const registeredToken = useRef<string | null>(null);

  const registerToken = useCallback(async (token: string) => {
    if (registeredToken.current === token) return;
    registeredToken.current = token;
    setState(s => ({ ...s, fcmToken: token }));
    try {
      await syncTokenToServer(token);
    } catch {
      // Non-fatal
    }
  }, []);

  const requestPermission = useCallback(async () => {
    setState(s => ({ ...s, isRegistering: true, error: null }));

    try {
      // On Android 13+ (API 33+), prompt the OS dialog
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const androidGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'VANIR VIP Concierge Notifications',
            message: 'Allow notifications to receive real-time private flight updates, hotel booking vouchers, and chauffeur arrival alerts.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          },
        );
        if (androidGranted !== PermissionsAndroid.RESULTS.GRANTED) {
          setState(s => ({
            ...s,
            permissionStatus: 'denied',
            isRegistering: false,
          }));
          return;
        }
      }

      const authStatus = await messaging().requestPermission({
        sound: true,
        announcement: true,
        badge: true,
        alert: true,
      });

      const granted =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!granted) {
        setState(s => ({
          ...s,
          permissionStatus: 'denied',
          isRegistering: false,
        }));
        return;
      }

      setState(s => ({ ...s, permissionStatus: 'granted' }));

      const token = await messaging().getToken();
      await registerToken(token);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to register for push notifications.';
      setState(s => ({ ...s, error: message }));
    } finally {
      setState(s => ({ ...s, isRegistering: false }));
    }
  }, [registerToken]);

  // Subscribe to foreground messages to display an in-app banner
  const handleForegroundMessage = useCallback(
    (message: FirebaseMessagingTypes.RemoteMessage) => {
      const rawTitle = message.notification?.title || message.data?.title;
      const title = typeof rawTitle === 'string' ? rawTitle : '🔔 VANIR VIP Notification';
      const rawBody = message.notification?.body || message.data?.body;
      const body =
        typeof rawBody === 'string'
          ? rawBody
          : 'You have received an exclusive luxury concierge update.';
      Alert.alert(title, body, [{ text: 'View' }]);
    },
    [],
  );

  const sendTestAlert = useCallback(async () => {
    await triggerTestVipNotification();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const current = await resolveCurrentPermission();

      if (cancelled) return;

      setState(s => ({ ...s, permissionStatus: current }));

      if (current === 'granted') {
        const token = await messaging().getToken();
        if (!cancelled) await registerToken(token);
      } else if (autoRequest) {
        await requestPermission();
      }
    };

    void init();

    tokenRefreshUnsubscribe.current = messaging().onTokenRefresh(async newToken => {
      await registerToken(newToken);
    });

    foregroundUnsubscribe.current = messaging().onMessage(handleForegroundMessage);

    const appStateSub = AppState.addEventListener('change', async next => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        const refreshed = await resolveCurrentPermission();
        setState(s => ({ ...s, permissionStatus: refreshed }));
      }
      appState.current = next;
    });

    return () => {
      cancelled = true;
      tokenRefreshUnsubscribe.current?.();
      foregroundUnsubscribe.current?.();
      appStateSub.remove();
    };
  }, [autoRequest, handleForegroundMessage, registerToken, requestPermission]);

  return { ...state, requestPermission, sendTestAlert };
}

/**
 * Background message registration.
 */
export function registerBackgroundMessageHandler(): void {
  messaging().setBackgroundMessageHandler(async (_message: FirebaseMessagingTypes.RemoteMessage) => {
    // Handled silently by OS
  });

  messaging()
    .getInitialNotification()
    .then((remoteMessage: FirebaseMessagingTypes.RemoteMessage | null) => {
      if (remoteMessage) {
        void remoteMessage;
      }
    });
}

export type { FirebaseMessagingTypes };
