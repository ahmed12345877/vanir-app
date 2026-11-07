import { Linking } from 'react-native';
import {
  getStateFromPath as defaultGetStateFromPath,
  type LinkingOptions,
} from '@react-navigation/native';
import messaging from '@react-native-firebase/messaging';
import type { RootStackParamList } from './types';

function isIgnoredSystemScheme(url: string | null | undefined): boolean {
  if (!url) return true;
  const lower = url.toLowerCase();
  return lower.startsWith('genericidp:') || lower.startsWith('recaptcha:');
}

function extractNotificationDeepLink(
  remoteMessage: { data?: Record<string, string | object> } | null,
): string | null {
  if (!remoteMessage?.data) return null;
  const raw =
    remoteMessage.data.url ||
    remoteMessage.data.link ||
    remoteMessage.data.deepLink;
  return typeof raw === 'string' && raw.trim().length > 0 ? raw.trim() : null;
}

/**
 * Normalizes vanirgroup.com web paths and aliases so 100% of website URLs
 * resolve cleanly to their corresponding native screen in VanirMobile.
 */
function normalizeWebPath(rawPath: string): string {
  const [rawPathname = '', rawQuery = ''] = rawPath.split('?');

  // Strip leading/trailing slashes and optional locale prefix (/ar or /en)
  let cleanPath = rawPathname.replace(/^\/+|\/+$/g, '');
  if (cleanPath === 'ar' || cleanPath === 'en') {
    cleanPath = '';
  } else if (cleanPath.startsWith('ar/')) {
    cleanPath = cleanPath.slice(3);
  } else if (cleanPath.startsWith('en/')) {
    cleanPath = cleanPath.slice(3);
  }

  const withExistingQuery = (target: string, extraQuery?: string): string => {
    const parts = [extraQuery, rawQuery].filter(Boolean);
    return parts.length > 0 ? `${target}?${parts.join('&')}` : target;
  };

  if (cleanPath === '') {
    return withExistingQuery('');
  }

  // Packages, programs, offers & day trips -> Tours screen with preselected tab
  if (cleanPath === 'packages' || cleanPath === 'programs' || cleanPath === 'offers') {
    return withExistingQuery('tours', 'initialCategory=packages');
  }
  if (cleanPath === 'day-trips') {
    return withExistingQuery('tours', 'initialCategory=day-trips');
  }

  // Destination detail pages (/destinations/:slug) -> Interactive Discover map
  if (cleanPath === 'destinations' || cleanPath.startsWith('destinations/')) {
    return withExistingQuery('destinations');
  }

  // Editorial & company aliases
  if (cleanPath === 'news' || cleanPath === 'case-studies') {
    return withExistingQuery('blog');
  }
  if (cleanPath === 'vanir') {
    return withExistingQuery('about');
  }
  if (cleanPath === 'limousine') {
    return withExistingQuery('cars');
  }

  // AI & marketing routes
  if (
    cleanPath === 'ai' ||
    cleanPath === 'ai-image-generator' ||
    cleanPath === 'ai-dashboard' ||
    cleanPath === 'ai-pricing' ||
    cleanPath === 'pricing' ||
    cleanPath === 'ai-plans' ||
    cleanPath === 'marketing' ||
    cleanPath.startsWith('marketing/')
  ) {
    return withExistingQuery('ai-concierge');
  }

  // Specialized concierge booking pages
  if (cleanPath === 'mice') {
    return withExistingQuery(
      'service-booking',
      'serviceType=MICE%20Corporate%20Events&title=MICE%20Corporate%20Events',
    );
  }
  if (cleanPath === 'groups') {
    return withExistingQuery(
      'service-booking',
      'serviceType=VIP%20Group%20Travel&title=VIP%20Group%20Travel',
    );
  }
  if (cleanPath === 'insurance') {
    return withExistingQuery(
      'service-booking',
      'serviceType=Luxury%20Travel%20Insurance&title=Luxury%20Travel%20Insurance',
    );
  }

  // Auth aliases
  if (cleanPath === 'sign-in') {
    return withExistingQuery('login');
  }
  if (cleanPath === 'sign-up' || cleanPath === 'register') {
    return withExistingQuery('signup');
  }

  return withExistingQuery(cleanPath);
}

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [
    'https://vanirgroup.com',
    'https://www.vanirgroup.com',
    'http://vanirgroup.com',
    'http://www.vanirgroup.com',
  ],

  async getInitialURL() {
    // 1. Check standard Android App Link / OS initial URL
    const url = await Linking.getInitialURL();
    if (url && !isIgnoredSystemScheme(url)) {
      return url;
    }

    // 2. Check if app was opened from a push notification containing a deep link
    try {
      const message = await messaging().getInitialNotification();
      const notificationUrl = extractNotificationDeepLink(message);
      if (notificationUrl && !isIgnoredSystemScheme(notificationUrl)) {
        return notificationUrl;
      }
    } catch {
      // Ignore if messaging is not yet ready
    }

    return null;
  },

  subscribe(listener) {
    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      if (!isIgnoredSystemScheme(url)) {
        listener(url);
      }
    });

    let unsubscribeNotification: (() => void) | undefined;
    try {
      unsubscribeNotification = messaging().onNotificationOpenedApp(remoteMessage => {
        const notificationUrl = extractNotificationDeepLink(remoteMessage);
        if (notificationUrl && !isIgnoredSystemScheme(notificationUrl)) {
          listener(notificationUrl);
        }
      });
    } catch {
      // Non-fatal
    }

    return () => {
      linkingSubscription.remove();
      unsubscribeNotification?.();
    };
  },

  config: {
    initialRouteName: 'MainTabs',
    screens: {
      MainTabs: {
        initialRouteName: 'Explore',
        screens: {
          Explore: '',
          Discover: 'destinations',
          Services: 'services',
          Profile: 'profile',
        },
      },
      About: 'about',
      CustomerSupport: 'contact',
      Offices: 'affiliated',
      Booking: 'booking',
      Reviews: 'reviews',
      Gallery: 'gallery',
      Blog: 'blog',
      BlogPost: 'blog/:slug',
      PrivacyPolicy: 'privacy-policy',
      TermsOfService: 'terms-of-service',
      LegalInfo: 'legal',
      PrivateJet: 'private-jet',
      PrivateJetCatalog: 'private-jet-catalog',
      HotelCatalog: 'hotels',
      HotelBooking: 'hotels-booking',
      HotelSearch: 'hotel-search',
      HotelApartments: 'apartments',
      FlightBooking: 'flights-booking',
      FlightCatalog: 'flights',
      Airport: 'fast-track',
      Visa: 'visa',
      ESIM: 'esim',
      Tours: 'tours',
      Yacht: 'yachts',
      Cars: 'cars',
      AIConcierge: 'ai-concierge',
      AIStudio: 'ai-studio',
      ServiceBooking: 'service-booking',
      Dashboard: 'dashboard',
      UserProfile: 'account',
      Login: 'login',
      Signup: 'signup',
    },
  },

  getStateFromPath(path, options) {
    const normalized = normalizeWebPath(path);
    const matchedState = defaultGetStateFromPath(normalized, options);
    if (matchedState) {
      return matchedState;
    }
    // Safe fallback: open Explore tab for any unrecognized path on vanirgroup.com
    return defaultGetStateFromPath('', options);
  },
};
