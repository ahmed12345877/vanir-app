import firestore from '@react-native-firebase/firestore';
import { CURATED_LUXURY_HOTELS } from './catalogApi';
import { isUnsplashOrGeneric, sanitizePhotoList } from './urlSanitizer';
import { resolveAuthenticHotelBank } from './authenticHotelPhotoBanks';

export interface FlightData {
  id?: string;
  airline: string;
  origin: string;
  destination: string;
  departureTime: string;
  price: number;
  class: 'Economy' | 'Business' | 'First';
}

export interface PropertyData {
  id?: string;
  name: string;
  location: string;
  pricePerNight: number;
  rating: number;
  amenities: string[];
}

export interface Booking {
  id?: string;
  userId?: string;
  confirmationCode?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  category?: 'hotel' | 'flight' | 'car' | 'experience' | 'yacht' | 'jet' | string;
  propertyName?: string;
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  totalAmount?: number;
  currency?: string;
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  itemId?: string; // Flight ID or Property ID
  type?: 'flight' | 'property' | string;
  date?: string;
  details?: Record<string, any>;
  createdAt?: any;
}

/**
 * Fetch all flights from Firestore collection
 */
export async function getFlights(): Promise<FlightData[]> {
  try {
    const snapshot = await firestore().collection('flights').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FlightData));
  } catch (error) {
    console.error('Error fetching flights:', error);
    throw error;
  }
}

/**
 * Fetch all properties and luxury hotels from Firestore collection
 */
export async function getProperties(): Promise<PropertyData[]> {
  try {
    const snapshot = await firestore().collection('properties').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PropertyData));
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
}

/**
 * Create a new user booking in Firestore with direct Admin Panel compatibility
 */
export async function createBooking(booking: Omit<Booking, 'id'>): Promise<string> {
  try {
    const confirmationCode =
      booking.confirmationCode ||
      `VNR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const docRef = await firestore().collection('bookings').add({
      ...booking,
      confirmationCode,
      currency: booking.currency || 'USD',
      status: booking.status || 'pending',
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
}

/**
 * Fetch bookings for a specific user
 */
export async function getUserBookings(userId: string): Promise<Booking[]> {
  try {
    const snapshot = await firestore()
      .collection('bookings')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    throw error;
  }
}

export interface ServiceRequest {
  id?: string;
  userId: string;
  serviceType: 'Flight' | 'Hotel' | 'PrivateJet' | 'Yacht' | 'Limousine' | 'eSIM' | 'Visa' | 'VIPFastTrack' | 'AIConcierge';
  details: Record<string, any>;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  createdAt?: any;
}

/**
 * Create a customized VIP service request (concierge manual pipeline)
 */
export async function createServiceRequest(request: Omit<ServiceRequest, 'id' | 'createdAt'>): Promise<string> {
  try {
    const docRef = await firestore().collection('service_requests').add({
      ...request,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating service request:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic Backend: Tours, App Controls & Home Images Feed
// ─────────────────────────────────────────────────────────────────────────────

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TourItem {
  id: string;
  name: string;
  location: string;
  duration: string;
  rating: number;
  reviews: number;
  price: string;
  category: 'all' | 'day-trips' | 'packages' | 'cultural';
  image: string;
  images?: string[];
  fallbackImage: string;
  badge?: string | null;
  highlights: string[];
  status?: 'active' | 'draft';
}

export interface ServiceControls {
  flights: boolean;
  private_jet?: boolean;
  hotels?: boolean;
  apartments: boolean;
  yachts: boolean;
  cars: boolean;
  tours: boolean;
  gallery?: boolean;
  blog?: boolean;
  esim: boolean;
  visa: boolean;
  fasttrack: boolean;
  ai_concierge: boolean;
  offices?: boolean;
  emergency_notice?: string;
  welcome_bg_image?: string;
}

export interface HomeFeedCard {
  id: string;
  category: string;
  tag: string;
  tagColor?: string;
  image: string;
  localImage?: any;
  title: string;
  subtitle: string;
  price?: string;
  rating?: number;
  isFlightRoute?: boolean;
  origin?: string;
  originCity?: string;
  destination?: string;
  destinationCity?: string;
  routeTarget: any;
  routeParams?: any;
}

const CACHE_TOURS_KEY = '@vanir_cached_tours';
const CACHE_CONTROLS_KEY = '@vanir_cached_service_controls';
export const CACHE_FEED_KEY = '@vanir_cached_home_feed';

export async function getLiveTours(): Promise<TourItem[]> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_TOURS_KEY);
    const cachedData: TourItem[] = cached ? JSON.parse(cached) : [];

    const snapshot = await firestore().collection('tours').get();
    if (!snapshot.empty) {
      const items: TourItem[] = [];
      snapshot.forEach(doc => {
        const d = doc.data();
        if (d.status !== 'draft') {
          const imgs: string[] = Array.isArray(d.images)
            ? d.images.map((img: any) => (typeof img === 'string' ? img : img?.url || '')).filter(Boolean)
            : [];
          const primaryImg = imgs[0] || d.image || '';

          items.push({
            id: doc.id,
            name: d.name || '',
            location: d.location || '',
            duration: d.duration || '',
            rating: typeof d.rating === 'number' ? d.rating : 4.9,
            reviews: typeof d.reviews === 'number' ? d.reviews : 100,
            price: d.price || '$0',
            category: d.category || 'all',
            image: primaryImg,
            images: imgs.length > 0 ? imgs : (primaryImg ? [primaryImg] : []),
            fallbackImage: d.fallbackImage || 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c0e?w=800&q=80',
            badge: d.badge || null,
            highlights: Array.isArray(d.highlights) ? d.highlights : [],
            status: d.status,
          });
        }
      });
      if (items.length > 0) {
        await AsyncStorage.setItem(CACHE_TOURS_KEY, JSON.stringify(items)).catch(() => {});
        return items;
      }
    }
    return cachedData;
  } catch {
    const cached = await AsyncStorage.getItem(CACHE_TOURS_KEY).catch(() => null);
    return cached ? JSON.parse(cached) : [];
  }
}

export function subscribeLiveTours(callback: (tours: TourItem[]) => void): () => void {
  return firestore()
    .collection('tours')
    .onSnapshot(
      snapshot => {
        if (!snapshot || snapshot.empty) return;
        const items: TourItem[] = [];
        snapshot.forEach(doc => {
          const d = doc.data();
          if (d.status !== 'draft') {
            const imgs: string[] = Array.isArray(d.images)
              ? d.images.map((img: any) => (typeof img === 'string' ? img : img?.url || '')).filter(Boolean)
              : [];
            const primaryImg = imgs[0] || d.image || '';

            items.push({
              id: doc.id,
              name: d.name || '',
              location: d.location || '',
              duration: d.duration || '',
              rating: typeof d.rating === 'number' ? d.rating : 4.9,
              reviews: typeof d.reviews === 'number' ? d.reviews : 100,
              price: d.price || '$0',
              category: d.category || 'all',
              image: primaryImg,
              images: imgs.length > 0 ? imgs : (primaryImg ? [primaryImg] : []),
              fallbackImage: d.fallbackImage || 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c0e?w=800&q=80',
              badge: d.badge || null,
              highlights: Array.isArray(d.highlights) ? d.highlights : [],
              status: d.status,
            });
          }
        });
        if (items.length > 0) {
          AsyncStorage.setItem(CACHE_TOURS_KEY, JSON.stringify(items)).catch(() => {});
          callback(items);
        }
      },
      () => {
        // Silent fallback to local cache
      },
    );
}

export async function getLiveAppControls(): Promise<ServiceControls | null> {
  try {
    const docSnap = await firestore().collection('app_config').doc('services').get();
    if (docSnap.exists()) {
      const data = docSnap.data() as ServiceControls;
      await AsyncStorage.setItem(CACHE_CONTROLS_KEY, JSON.stringify(data)).catch(() => {});
      return data;
    }
    const cached = await AsyncStorage.getItem(CACHE_CONTROLS_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    const cached = await AsyncStorage.getItem(CACHE_CONTROLS_KEY).catch(() => null);
    return cached ? JSON.parse(cached) : null;
  }
}

export function subscribeLiveAppControls(callback: (controls: ServiceControls) => void): () => void {
  return firestore()
    .collection('app_config')
    .doc('services')
    .onSnapshot(
      docSnap => {
        if (docSnap && docSnap.exists()) {
          const data = docSnap.data() as ServiceControls;
          AsyncStorage.setItem(CACHE_CONTROLS_KEY, JSON.stringify(data)).catch(() => {});
          callback(data);
        }
      },
      () => {
        // Silent fallback to local cache
      },
    );
}

export async function getLiveHomeFeedCards(): Promise<HomeFeedCard[]> {
  try {
    const docSnap = await firestore().collection('app_config').doc('home_feed').get();
    if (docSnap.exists() && docSnap.data()?.cards) {
      const cards = docSnap.data()?.cards as HomeFeedCard[];
      await AsyncStorage.setItem(CACHE_FEED_KEY, JSON.stringify(cards)).catch(() => {});
      return cards;
    }
    const cached = await AsyncStorage.getItem(CACHE_FEED_KEY);
    return cached ? JSON.parse(cached) : [];
  } catch {
    const cached = await AsyncStorage.getItem(CACHE_FEED_KEY).catch(() => null);
    return cached ? JSON.parse(cached) : [];
  }
}

export let memoryFeedCards: HomeFeedCard[] | null = null;

export function subscribeLiveHomeFeedCards(callback: (cards: HomeFeedCard[]) => void): () => void {
  // Immediately emit cached cards to eliminate the flash of old images
  if (memoryFeedCards && memoryFeedCards.length > 0) {
    callback(memoryFeedCards);
  } else {
    AsyncStorage.getItem(CACHE_FEED_KEY)
      .then(cached => {
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              memoryFeedCards = parsed;
              callback(parsed);
            }
          } catch {}
        }
      })
      .catch(() => {});
  }

  return firestore()
    .collection('app_config')
    .doc('home_feed')
    .onSnapshot(
      docSnap => {
        if (docSnap && docSnap.exists() && docSnap.data()?.cards) {
          const cards = docSnap.data()?.cards as HomeFeedCard[];
          memoryFeedCards = cards;
          AsyncStorage.setItem(CACHE_FEED_KEY, JSON.stringify(cards)).catch(() => {});
          callback(cards);
        }
      },
      () => {
        // Silent fallback to local cache
      },
    );
}

export interface LiveGalleryItem {
  id: string;
  title: string;
  category: string;
  url: string;
  createdAt?: string;
}

const CACHE_GALLERY_KEY = '@vanir_cached_gallery';

export async function getLiveGallery(): Promise<LiveGalleryItem[]> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_GALLERY_KEY);
    const cachedData: LiveGalleryItem[] = cached ? JSON.parse(cached) : [];

    const snapshot = await firestore().collection('gallery').get();
    if (!snapshot.empty) {
      const items: LiveGalleryItem[] = [];
      snapshot.forEach(doc => {
        const d = doc.data();
        if (d.url) {
          items.push({
            id: doc.id,
            title: d.title || '',
            category: d.category || 'General',
            url: d.url,
            createdAt: d.createdAt || '',
          });
        }
      });
      if (items.length > 0) {
        await AsyncStorage.setItem(CACHE_GALLERY_KEY, JSON.stringify(items)).catch(() => {});
        return items;
      }
    }
    return cachedData;
  } catch {
    const cached = await AsyncStorage.getItem(CACHE_GALLERY_KEY).catch(() => null);
    return cached ? JSON.parse(cached) : [];
  }
}

export function subscribeLiveGallery(callback: (items: LiveGalleryItem[]) => void): () => void {
  return firestore()
    .collection('gallery')
    .onSnapshot(
      snapshot => {
        if (!snapshot || snapshot.empty) return;
        const items: LiveGalleryItem[] = [];
        snapshot.forEach(doc => {
          const d = doc.data();
          if (d.url) {
            items.push({
              id: doc.id,
              title: d.title || '',
              category: d.category || 'General',
              url: d.url,
              createdAt: d.createdAt || '',
            });
          }
        });
        if (items.length > 0) {
          AsyncStorage.setItem(CACHE_GALLERY_KEY, JSON.stringify(items)).catch(() => {});
          callback(items);
        }
      },
      () => {
        // Silent fallback to local cache
      },
    );
}

export interface LiveDestinationItem {
  id: string;
  name: string;
  country: string;
  packages: number;
  hotels: number;
  status: string;
  image: string;
  createdAt?: string;
  updatedAt?: string;
}

export const INITIAL_DESTINATIONS: LiveDestinationItem[] = [
  { id: 'dest_1', name: 'Dubai & The Arabian Gulf', country: 'United Arab Emirates 🇦🇪', packages: 14, hotels: 28, status: 'Featured', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1000&q=85' },
  { id: 'dest_2', name: 'Athens & Santorini', country: 'Greece 🇬🇷', packages: 12, hotels: 22, status: 'Featured', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1000&q=85' },
  { id: 'dest_3', name: 'Istanbul & Bodrum', country: 'Turkey 🇹🇷', packages: 15, hotels: 25, status: 'Featured', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1000&q=85' },
  { id: 'dest_4', name: 'Paris & The French Riviera', country: 'France 🇫🇷', packages: 16, hotels: 30, status: 'Featured', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1000&q=85' },
  { id: 'dest_5', name: 'Rome, Milan & Venice', country: 'Italy 🇮🇹', packages: 18, hotels: 26, status: 'Featured', image: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=1000&q=85' },
  { id: 'dest_6', name: 'Geneva, Zurich & St. Moritz', country: 'Switzerland 🇨🇭', packages: 10, hotels: 18, status: 'Featured', image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1000&q=85' },
  { id: 'dest_7', name: 'Maldives Private Atolls', country: 'Maldives 🇲🇻', packages: 8, hotels: 15, status: 'Featured', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1000&q=85' },
  { id: 'dest_8', name: 'London & Edinburgh', country: 'United Kingdom 🇬🇧', packages: 11, hotels: 24, status: 'Featured', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1000&q=85' },
  { id: 'dest_9', name: 'Cairo, Luxor & Aswan', country: 'Egypt 🇪🇬', packages: 12, hotels: 20, status: 'Featured', image: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=1000&q=85' },
];

const CACHE_DESTINATIONS_KEY = '@vanir_cached_destinations';

export async function getLiveDestinations(): Promise<LiveDestinationItem[]> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_DESTINATIONS_KEY);
    const cachedData: LiveDestinationItem[] = cached ? JSON.parse(cached) : [];

    const snapshot = await firestore().collection('destinations').get();
    if (!snapshot.empty) {
      const items: LiveDestinationItem[] = [];
      snapshot.forEach(doc => {
        const d = doc.data();
        const img = d.image || d.imageUrl || '';
        const loc = d.country || d.location || '';
        if (d.name && img) {
          items.push({
            id: doc.id,
            name: d.name || '',
            country: loc,
            packages: Number(d.packages) || 0,
            hotels: Number(d.hotels) || 0,
            status: d.status || 'Active',
            image: img,
            createdAt: d.createdAt || '',
            updatedAt: d.updatedAt || '',
          });
        }
      });
      if (items.length > 0) {
        await AsyncStorage.setItem(CACHE_DESTINATIONS_KEY, JSON.stringify(items)).catch(() => {});
        return items;
      }
    }
    return cachedData.length > 0 ? cachedData : INITIAL_DESTINATIONS;
  } catch {
    const cached = await AsyncStorage.getItem(CACHE_DESTINATIONS_KEY).catch(() => null);
    return cached ? JSON.parse(cached) : INITIAL_DESTINATIONS;
  }
}

export let memoryDestinationsCache: LiveDestinationItem[] | null = null;

export function subscribeLiveDestinations(callback: (items: LiveDestinationItem[]) => void): () => void {
  if (memoryDestinationsCache && memoryDestinationsCache.length > 0) {
    callback(memoryDestinationsCache);
  } else {
    AsyncStorage.getItem(CACHE_DESTINATIONS_KEY)
      .then(cached => {
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              memoryDestinationsCache = parsed;
              callback(parsed);
              return;
            }
          } catch {}
        }
        callback(INITIAL_DESTINATIONS);
      })
      .catch(() => {
        callback(INITIAL_DESTINATIONS);
      });
  }

  return firestore()
    .collection('destinations')
    .onSnapshot(
      snapshot => {
        if (!snapshot || snapshot.empty) {
          if (!memoryDestinationsCache) callback(INITIAL_DESTINATIONS);
          return;
        }
        const items: LiveDestinationItem[] = [];
        snapshot.forEach(doc => {
          const d = doc.data();
          const img = d.image || d.imageUrl || '';
          const loc = d.country || d.location || '';
          if (d.name && img) {
            items.push({
              id: doc.id,
              name: d.name || '',
              country: loc,
              packages: Number(d.packages) || 0,
              hotels: Number(d.hotels) || 0,
              status: d.status || 'Active',
              image: img,
              createdAt: d.createdAt || '',
              updatedAt: d.updatedAt || '',
            });
          }
        });
        if (items.length > 0) {
          memoryDestinationsCache = items;
          AsyncStorage.setItem(CACHE_DESTINATIONS_KEY, JSON.stringify(items)).catch(() => {});
          callback(items);
        } else if (!memoryDestinationsCache) {
          callback(INITIAL_DESTINATIONS);
        }
      },
      () => {
        if (!memoryDestinationsCache) callback(INITIAL_DESTINATIONS);
      },
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic Backend: Special Offers (العروض الحصرية)
// ─────────────────────────────────────────────────────────────────────────────

export interface LiveOfferItem {
  id: string;
  title: string;
  code: string;
  discount: string;
  target: string;
  validUntil: string;
  status: string;
  uses: number;
  image?: string;
  description?: string;
}

export const INITIAL_OFFERS: LiveOfferItem[] = [
  {
    id: 'off_1',
    title: 'Royal Mediterranean Superyacht Privilege',
    code: 'YACHT2026',
    discount: '15% OFF',
    target: 'Luxury Superyachts',
    validUntil: '2026-09-30',
    status: 'active',
    uses: 42,
    image: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=1000&q=85',
    description: 'Exclusive privilege across all mega-yacht charters in Dubai, Greece, and Monaco with full maritime crew and personal chef.',
  },
  {
    id: 'off_2',
    title: 'Santorini & Maldives Villa Sanctuary Privilege',
    code: 'HONEYMOON-VIP',
    discount: '20% OFF',
    target: 'Hotels & Resorts',
    validUntil: '2026-12-31',
    status: 'active',
    uses: 28,
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1000&q=85',
    description: 'Complimentary private pool villa upgrade with champagne breakfast in Santorini cliffside or overwater Maldives villas.',
  },
  {
    id: 'off_3',
    title: 'Private Aviation Flight Upgrade Privilege',
    code: 'JET-UPGRADE',
    discount: '$2,500 USD',
    target: 'Private Aviation',
    validUntil: '2026-08-15',
    status: 'active',
    uses: 16,
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1000&q=85',
    description: 'A $2,500 USD voucher applied towards transcontinental Bombardier and Gulfstream private jet charters with tarmac escort.',
  },
  {
    id: 'off_4',
    title: 'European Palaces & Luxury Hotels Privilege',
    code: 'EUROPE-GOLD',
    discount: '18% OFF',
    target: 'Europe & Turkey Hotels',
    validUntil: '2026-11-30',
    status: 'active',
    uses: 53,
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1000&q=85',
    description: 'Instant discount on The Luxury Collection, Kempinski, and Four Seasons palaces across Athens, Paris, Istanbul, and Rome.',
  },
];

const CACHE_OFFERS_KEY = '@vanir_cached_offers';

export async function getLiveOffers(): Promise<LiveOfferItem[]> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_OFFERS_KEY);
    const cachedData: LiveOfferItem[] = cached ? JSON.parse(cached) : [];

    const snapshot = await firestore().collection('offers').get();
    if (!snapshot.empty) {
      const items: LiveOfferItem[] = [];
      snapshot.forEach(doc => {
        const d = doc.data();
        if (d.title || d.code) {
          items.push({
            id: doc.id,
            title: d.title || '',
            code: d.code || '',
            discount: d.discount || '10% OFF',
            target: d.target || 'كافة الخدمات',
            validUntil: d.validUntil || '2026-12-31',
            status: d.status || 'نشط',
            uses: Number(d.uses) || 0,
            image: d.image || 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=1000&q=85',
            description: d.description || '',
          });
        }
      });
      if (items.length > 0) {
        await AsyncStorage.setItem(CACHE_OFFERS_KEY, JSON.stringify(items)).catch(() => {});
        return items;
      }
    }
    return cachedData.length > 0 ? cachedData : INITIAL_OFFERS;
  } catch {
    const cached = await AsyncStorage.getItem(CACHE_OFFERS_KEY).catch(() => null);
    return cached ? JSON.parse(cached) : INITIAL_OFFERS;
  }
}

export function subscribeLiveOffers(callback: (items: LiveOfferItem[]) => void): () => void {
  return firestore()
    .collection('offers')
    .onSnapshot(
      snapshot => {
        if (!snapshot || snapshot.empty) {
          callback(INITIAL_OFFERS);
          return;
        }
        const items: LiveOfferItem[] = [];
        snapshot.forEach(doc => {
          const d = doc.data();
          if (d.title || d.code) {
            items.push({
              id: doc.id,
              title: d.title || '',
              code: d.code || '',
              discount: d.discount || '10% OFF',
              target: d.target || 'كافة الخدمات',
              validUntil: d.validUntil || '2026-12-31',
              status: d.status || 'نشط',
              uses: Number(d.uses) || 0,
              image: d.image || 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=1000&q=85',
              description: d.description || '',
            });
          }
        });
        if (items.length > 0) {
          AsyncStorage.setItem(CACHE_OFFERS_KEY, JSON.stringify(items)).catch(() => {});
          callback(items);
        } else {
          callback(INITIAL_OFFERS);
        }
      },
      () => {
        callback(INITIAL_OFFERS);
      },
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic Backend: Blog Posts & Luxury Magazine (المدونة والمقالات)
// ─────────────────────────────────────────────────────────────────────────────

export interface LiveBlogPostItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  author: string;
  status: string;
  date: string;
  excerpt: string;
  content: string;
  image: string;
  readingTime?: number;
}

export const INITIAL_BLOG_POSTS: LiveBlogPostItem[] = [
  {
    id: 'post_1',
    slug: 'greek-islands-superyacht-guide-2026',
    title: 'Private Yacht Chartering in the Greek Cyclades & Santorini',
    category: 'Sailing & Yachts',
    author: 'VANIR Editorial',
    status: 'published',
    date: '28 Oct 2026',
    excerpt: 'Explore secluded coves in Mykonos, Santorini, and Crete aboard a chartered superyacht with dedicated onboard culinary service.',
    content: 'The Greek islands represent the world’s pinnacle for nautical luxury. In this editorial guide, we present a curated 7-day sailing itinerary departing from Athens through the Cyclades, highlighting private berths and top seaside dining.',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&q=85',
    readingTime: 6,
  },
  {
    id: 'post_2',
    slug: 'istanbul-bosphorus-palaces-luxury',
    title: 'Imperial Bosphorus Palaces in Istanbul: Sultans Heritage',
    category: 'Palaces & Suites',
    author: 'VANIR Hospitality Bureau',
    status: 'published',
    date: '25 Oct 2026',
    excerpt: 'Inside Çırağan Palace Kempinski and Four Seasons Bosphorus: How to experience true imperial opulence on the strait.',
    content: 'From the nineteenth century to the modern day, Istanbul’s waterfront palaces define timeless grandeur. We document the historic royal suites and bespoke perks including private boat transfers directly to the hotel dock.',
    image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=85',
    readingTime: 5,
  },
  {
    id: 'post_3',
    slug: 'private-aviation-etiquette-schengen',
    title: 'Private Aviation Protocol & VIP FBO Terminals across Europe',
    category: 'Private Aviation',
    author: 'Diplomatic Aviation Captain',
    status: 'published',
    date: '20 Oct 2026',
    excerpt: 'Everything you need to know regarding FBO executive terminals in Paris Le Bourget, Geneva, and London Farnborough with expedited clearance.',
    content: 'Private aviation is more than rapid transit; it is an uninterrupted sanctuary starting at the tarmac chauffeur door. We examine the Bombardier Global 7500 and amenities tailored for transcontinental family journeys.',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=85',
    readingTime: 7,
  },
];

const CACHE_BLOG_KEY = '@vanir_cached_blog';

export async function getLiveBlogPosts(): Promise<LiveBlogPostItem[]> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_BLOG_KEY);
    const cachedData: LiveBlogPostItem[] = cached ? JSON.parse(cached) : [];

    const snapshot = await firestore().collection('blog_posts').get();
    if (!snapshot.empty) {
      const items: LiveBlogPostItem[] = [];
      snapshot.forEach(doc => {
        const d = doc.data();
        if (d.title) {
          items.push({
            id: doc.id,
            slug: d.slug || doc.id,
            title: d.title || '',
            category: d.category || 'سياحة فاخرة',
            author: d.author || 'Vanir Luxury Editorial',
            status: d.status || 'published',
            date: d.date || d.publishedAt || '2026',
            excerpt: d.excerpt || '',
            content: d.content || '',
            image: d.image || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=85',
            readingTime: Number(d.readingTime) || 5,
          });
        }
      });
      if (items.length > 0) {
        await AsyncStorage.setItem(CACHE_BLOG_KEY, JSON.stringify(items)).catch(() => {});
        return items;
      }
    }
    return cachedData.length > 0 ? cachedData : INITIAL_BLOG_POSTS;
  } catch {
    const cached = await AsyncStorage.getItem(CACHE_BLOG_KEY).catch(() => null);
    return cached ? JSON.parse(cached) : INITIAL_BLOG_POSTS;
  }
}

export function subscribeLiveBlogPosts(callback: (items: LiveBlogPostItem[]) => void): () => void {
  return firestore()
    .collection('blog_posts')
    .onSnapshot(
      snapshot => {
        if (!snapshot || snapshot.empty) {
          callback(INITIAL_BLOG_POSTS);
          return;
        }
        const items: LiveBlogPostItem[] = [];
        snapshot.forEach(doc => {
          const d = doc.data();
          if (d.title) {
            items.push({
              id: doc.id,
              slug: d.slug || doc.id,
              title: d.title || '',
              category: d.category || 'سياحة فاخرة',
              author: d.author || 'Vanir Luxury Editorial',
              status: d.status || 'published',
              date: d.date || d.publishedAt || '2026',
              excerpt: d.excerpt || '',
              content: d.content || '',
              image: d.image || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=85',
              readingTime: Number(d.readingTime) || 5,
            });
          }
        });
        if (items.length > 0) {
          AsyncStorage.setItem(CACHE_BLOG_KEY, JSON.stringify(items)).catch(() => {});
          callback(items);
        } else {
          callback(INITIAL_BLOG_POSTS);
        }
      },
      () => {
        callback(INITIAL_BLOG_POSTS);
      },
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic Backend: Luxury Hotels
// ─────────────────────────────────────────────────────────────────────────────

export interface LiveHotelCatalogItem {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  images?: string[];
  tag1: string;
  tag2: string;
  price: string;
  pricePer: string;
  badge?: string;
  country?: string;
  description?: string;
  rating?: number;
}

export const CACHE_HOTELS_KEY = '@vanir_cached_hotels';

export function mapFirestoreDocToHotel(doc: any): LiveHotelCatalogItem {
  const d = typeof doc.data === 'function' ? doc.data() : doc;
  const docId = doc.id || d.id || '';
  const hotelName = d.propertyName || d.name || 'Luxury Hotel';
  const bankPhotos = resolveAuthenticHotelBank(docId, hotelName);

  const rawImages: string[] = Array.isArray(d.images)
    ? d.images.map((img: any) => (typeof img === 'string' ? img : img?.url || '')).filter(Boolean)
    : [];
  const cleanImages = sanitizePhotoList(rawImages);

  const curatedMatch = CURATED_LUXURY_HOTELS.find(h => h.id === docId);

  const finalImages: string[] =
    cleanImages.length > 0
      ? cleanImages
      : bankPhotos.length > 0
      ? bankPhotos
      : curatedMatch?.images && curatedMatch.images.length > 0
      ? curatedMatch.images
      : ['https://cf.bstatic.com/xdata/images/hotel/max1280x900/557691306.jpg?k=5a2974dae34fa907e3b9229079c9983c3409a32e35b5ca18a1786a1107646ffa'];

  const primaryImage =
    (!isUnsplashOrGeneric(d.image) ? d.image : null) ||
    finalImages[0];

  return {
    id: docId,
    name: hotelName,
    subtitle: d.cityDestination || d.subtitle || curatedMatch?.subtitle || '',
    image: primaryImage,
    images: finalImages,
    tag1: d.suiteType || d.tag1 || curatedMatch?.tag1 || (d.cityDestination ? d.cityDestination.split(',')[0].trim() : 'Vanir Luxury'),
    tag2: d.viewType
      ? `${d.viewType.charAt(0).toUpperCase() + d.viewType.slice(1)} View`
      : (d.tag2 || curatedMatch?.tag2 || 'VIP Suite'),
    price: typeof d.nightlyRate === 'number' ? `$${d.nightlyRate}` : (d.price || curatedMatch?.price || '$850'),
    pricePer: d.pricePer || curatedMatch?.pricePer || 'per night',
    badge: d.badge || (d.butlerService ? 'Butler Service' : (curatedMatch?.badge || 'Curated')),
    country: d.country || curatedMatch?.country || (d.cityDestination && d.cityDestination.includes(',') ? d.cityDestination.split(',')[1].trim() : d.cityDestination || ''),
    description: d.description || curatedMatch?.description || '',
    rating: typeof d.rating === 'number' ? d.rating : (curatedMatch?.rating || 4.96),
  };
}

function buildMergedHotelsList(firestoreDocs: any[] = []): LiveHotelCatalogItem[] {
  const map = new Map<string, LiveHotelCatalogItem>();
  for (const h of CURATED_LUXURY_HOTELS) {
    map.set(h.id, {
      id: h.id,
      name: h.name,
      subtitle: h.subtitle,
      image: h.image,
      images: h.images || [h.image],
      tag1: h.tag1,
      tag2: h.tag2,
      price: h.price,
      pricePer: h.pricePer,
      badge: h.badge,
      country: h.country,
      description: h.description,
      rating: h.rating,
    });
  }
  for (const doc of firestoreDocs) {
    const item = mapFirestoreDocToHotel(doc);
    const existing = map.get(item.id);
    // If incoming item has no authentic photos, protect existing curated photos
    if (existing && (!item.images || item.images.length === 0 || isUnsplashOrGeneric(item.image))) {
      item.image = existing.image;
      item.images = existing.images;
    }
    map.set(item.id, item);
  }
  return Array.from(map.values());
}

export async function getLiveHotels(): Promise<LiveHotelCatalogItem[]> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_HOTELS_KEY);
    const cachedData: LiveHotelCatalogItem[] = cached ? JSON.parse(cached) : [];

    const snapshot = await firestore().collection('hotels').get();
    const docs: any[] = [];
    if (!snapshot.empty) {
      snapshot.forEach(doc => {
        const d = doc.data();
        if (d.status !== 'draft') {
          docs.push(doc);
        }
      });
    }
    const merged = buildMergedHotelsList(docs);
    await AsyncStorage.setItem(CACHE_HOTELS_KEY, JSON.stringify(merged)).catch(() => {});
    return merged;
  } catch {
    return buildMergedHotelsList([]);
  }
}

export let memoryHotelsCache: LiveHotelCatalogItem[] | null = null;

export function subscribeLiveHotels(callback: (hotels: LiveHotelCatalogItem[]) => void): () => void {
  // 1. Immediately emit memory cache if available (zero flash of old images)
  if (memoryHotelsCache && memoryHotelsCache.length > 0) {
    callback(memoryHotelsCache);
  } else {
    // 2. Read persistent storage cache before waiting for network
    AsyncStorage.getItem(CACHE_HOTELS_KEY)
      .then(cached => {
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              memoryHotelsCache = parsed;
              callback(parsed);
              return;
            }
          } catch {}
        }
        callback(buildMergedHotelsList([]));
      })
      .catch(() => {
        callback(buildMergedHotelsList([]));
      });
  }

  return firestore()
    .collection('hotels')
    .onSnapshot(
      snapshot => {
        const docs: any[] = [];
        if (snapshot && !snapshot.empty) {
          snapshot.forEach(doc => {
            const d = doc.data();
            if (d.status !== 'draft') {
              docs.push(doc);
            }
          });
        }
        const merged = buildMergedHotelsList(docs);
        memoryHotelsCache = merged;
        AsyncStorage.setItem(CACHE_HOTELS_KEY, JSON.stringify(merged)).catch(() => {});
        callback(merged);
      },
      () => {
        // Silent fallback to local cache
      },
    );
}

// ─────────────────────────────────────────────────────────────
// Live Luxury Yachts
// ─────────────────────────────────────────────────────────────

export interface LiveYachtCatalogItem {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  images?: string[];
  tag1: string;
  tag2: string;
  price: string;
  pricePer: string;
  badge?: string;
  country?: string;
  description?: string;
  rating?: number;
}

export const CACHE_YACHTS_KEY = '@vanir_cached_yachts';

export function mapFirestoreDocToYacht(doc: any): LiveYachtCatalogItem {
  const d = typeof doc.data === 'function' ? doc.data() : doc;
  const docId = doc.id || d.id || '';
  const imagesList: string[] = Array.isArray(d.images)
    ? d.images.map((img: any) => (typeof img === 'string' ? img : img?.url || '')).filter(Boolean)
    : [];
  const primaryImage =
    imagesList[0] ||
    d.image ||
    'https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?w=1200&q=85';

  return {
    id: docId,
    name: d.name || d.vesselName || 'Luxury Superyacht',
    subtitle: d.marinaLocation || d.subtitle || 'Dubai Marina & Coastline',
    image: primaryImage,
    images: imagesList.length > 0 ? imagesList : [primaryImage],
    tag1: d.lengthFt ? `${d.lengthFt}ft Superyacht` : d.lengthMeters ? `${d.lengthMeters}m Mega Yacht` : (d.tag1 || '50m Superyacht'),
    tag2: d.crewSize ? `${d.crewSize} Dedicated Crew` : d.crewCount ? `${d.crewCount} Crew Members` : (d.tag2 || 'Full Crew & Chef'),
    price: typeof d.dailyRate === 'number'
      ? `$${d.dailyRate.toLocaleString()}`
      : typeof d.dailyCharterRate === 'number'
      ? `$${d.dailyCharterRate.toLocaleString()}`
      : (d.price || '$15,000'),
    pricePer: 'per day',
    badge: d.badge || 'Superyacht VIP',
    country: d.country || 'UAE & Mediterranean',
    description: d.description || '',
    rating: typeof d.rating === 'number' ? d.rating : 4.98,
  };
}

export async function getLiveYachts(): Promise<LiveYachtCatalogItem[]> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_YACHTS_KEY);
    const cachedData: LiveYachtCatalogItem[] = cached ? JSON.parse(cached) : [];

    const snapshot = await firestore().collection('yachts').get();
    if (!snapshot.empty) {
      const items: LiveYachtCatalogItem[] = [];
      snapshot.forEach(doc => {
        const d = doc.data();
        if (d.status !== 'draft') {
          items.push(mapFirestoreDocToYacht(doc));
        }
      });
      if (items.length > 0) {
        await AsyncStorage.setItem(CACHE_YACHTS_KEY, JSON.stringify(items)).catch(() => {});
        return items;
      }
    }
    return cachedData;
  } catch {
    const cached = await AsyncStorage.getItem(CACHE_YACHTS_KEY).catch(() => null);
    return cached ? JSON.parse(cached) : [];
  }
}

export let memoryYachtsCache: LiveYachtCatalogItem[] | null = null;

export function subscribeLiveYachts(callback: (yachts: LiveYachtCatalogItem[]) => void): () => void {
  // 1. Immediately emit memory cache if available
  if (memoryYachtsCache && memoryYachtsCache.length > 0) {
    callback(memoryYachtsCache);
  } else {
    // 2. Read persistent storage before network resolves
    AsyncStorage.getItem(CACHE_YACHTS_KEY)
      .then(cached => {
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              memoryYachtsCache = parsed;
              callback(parsed);
            }
          } catch {}
        }
      })
      .catch(() => {});
  }

  return firestore()
    .collection('yachts')
    .onSnapshot(
      snapshot => {
        if (!snapshot || snapshot.empty) return;
        const items: LiveYachtCatalogItem[] = [];
        snapshot.forEach(doc => {
          const d = doc.data();
          if (d.status !== 'draft') {
            items.push(mapFirestoreDocToYacht(doc));
          }
        });
        if (items.length > 0) {
          memoryYachtsCache = items;
          AsyncStorage.setItem(CACHE_YACHTS_KEY, JSON.stringify(items)).catch(() => {});
          callback(items);
        }
      },
      () => {
        // Silent fallback to local cache
      },
    );
}

// ─────────────────────────────────────────────────────────────
// Live VIP Transfers & Limousines
// ─────────────────────────────────────────────────────────────

export interface LiveTransferCatalogItem {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  images?: string[];
  tag1: string;
  tag2: string;
  price: string;
  pricePer: string;
  badge?: string;
  country?: string;
  description?: string;
  rating?: number;
}

export const CACHE_TRANSFERS_KEY = '@vanir_cached_transfers';

export function mapFirestoreDocToTransfer(doc: any): LiveTransferCatalogItem {
  const d = typeof doc.data === 'function' ? doc.data() : doc;
  const docId = doc.id || d.id || '';
  const imagesList: string[] = Array.isArray(d.images)
    ? d.images.map((img: any) => (typeof img === 'string' ? img : img?.url || '')).filter(Boolean)
    : [];
  const primaryImage =
    imagesList[0] ||
    d.image ||
    'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=85';

  const categoryLabel =
    d.category === 'sedan'
      ? 'Executive Sedan'
      : d.category === 'suv'
      ? 'Ultra Luxury SUV'
      : d.category === 'van'
      ? 'VIP Executive Van'
      : (d.category || d.vehicleType || 'VIP Chauffeur');

  return {
    id: docId,
    name: d.vehicleMakeModel || d.vehicleModel || d.name || 'Rolls-Royce Phantom VIII',
    subtitle: d.subtitle || `${categoryLabel} • Max ${d.passengerCapacity || 4} Passengers • ${d.luggageCapacity || 3} Bags`,
    image: primaryImage,
    images: imagesList.length > 0 ? imagesList : [primaryImage],
    tag1: categoryLabel,
    tag2: d.englishChauffeur ? 'Uniformed Chauffeur' : (d.tag2 || 'Private Driver'),
    price: typeof d.airportTransferRate === 'number'
      ? `$${d.airportTransferRate.toLocaleString()}`
      : typeof d.hourlyRate === 'number'
      ? `$${d.hourlyRate.toLocaleString()}/hr`
      : (d.price || '$350'),
    pricePer: 'per transfer',
    badge: d.armored ? 'Armored Security' : (d.badge || 'VIP Chauffeur'),
    country: d.country || 'Global VIP Fleet',
    description: d.description || '',
    rating: typeof d.rating === 'number' ? d.rating : 4.97,
  };
}

export async function getLiveTransfers(): Promise<LiveTransferCatalogItem[]> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_TRANSFERS_KEY);
    const cachedData: LiveTransferCatalogItem[] = cached ? JSON.parse(cached) : [];

    const snapshot = await firestore().collection('transfers').get();
    if (!snapshot.empty) {
      const items: LiveTransferCatalogItem[] = [];
      snapshot.forEach(doc => {
        const d = doc.data();
        if (d.status !== 'draft') {
          items.push(mapFirestoreDocToTransfer(doc));
        }
      });
      if (items.length > 0) {
        await AsyncStorage.setItem(CACHE_TRANSFERS_KEY, JSON.stringify(items)).catch(() => {});
        return items;
      }
    }
    return cachedData;
  } catch {
    const cached = await AsyncStorage.getItem(CACHE_TRANSFERS_KEY).catch(() => null);
    return cached ? JSON.parse(cached) : [];
  }
}

export let memoryTransfersCache: LiveTransferCatalogItem[] | null = null;

export function subscribeLiveTransfers(callback: (transfers: LiveTransferCatalogItem[]) => void): () => void {
  // 1. Immediately emit memory cache if available
  if (memoryTransfersCache && memoryTransfersCache.length > 0) {
    callback(memoryTransfersCache);
  } else {
    // 2. Read persistent storage before network resolves
    AsyncStorage.getItem(CACHE_TRANSFERS_KEY)
      .then(cached => {
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              memoryTransfersCache = parsed;
              callback(parsed);
            }
          } catch {}
        }
      })
      .catch(() => {});
  }

  return firestore()
    .collection('transfers')
    .onSnapshot(
      snapshot => {
        if (!snapshot || snapshot.empty) return;
        const items: LiveTransferCatalogItem[] = [];
        snapshot.forEach(doc => {
          const d = doc.data();
          if (d.status !== 'draft') {
            items.push(mapFirestoreDocToTransfer(doc));
          }
        });
        if (items.length > 0) {
          memoryTransfersCache = items;
          AsyncStorage.setItem(CACHE_TRANSFERS_KEY, JSON.stringify(items)).catch(() => {});
          callback(items);
        }
      },
      () => {
        // Silent fallback to local cache
      },
    );
}

// ─────────────────────────────────────────────────────────────
// Live Private Jets
// ─────────────────────────────────────────────────────────────

export interface LiveJetCatalogItem {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  images?: string[];
  tag1: string;
  tag2: string;
  price: string;
  pricePer: string;
  badge?: string;
  country?: string;
  description?: string;
  rating?: number;
  flightRange?: number;
  guestCapacity?: number;
  tailNumber?: string;
  category?: string;
  hourlyRate?: number;
  flatRoutePrice?: number;
}

export const CACHE_JETS_KEY = '@vanir_cached_jets';

export function mapFirestoreDocToJet(doc: any): LiveJetCatalogItem {
  const d = typeof doc.data === 'function' ? doc.data() : doc;
  const docId = doc.id || d.id || '';
  const imagesList: string[] = Array.isArray(d.images)
    ? d.images.map((img: any) => (typeof img === 'string' ? img : img?.url || '')).filter(Boolean)
    : [];
  const primaryImage =
    imagesList[0] ||
    d.image ||
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=85';

  const categoryLabel =
    d.category === 'ultra_long_range'
      ? 'Ultra Long Range'
      : d.category === 'heavy'
      ? 'Heavy Executive Jet'
      : d.category === 'super_midsize'
      ? 'Super Midsize'
      : (d.category || 'VIP Private Jet');

  const rangeText = d.flightRange ? `${d.flightRange.toLocaleString()} nm Range` : 'Intercontinental Range';

  return {
    id: docId,
    name: d.name || 'Bombardier Global 7500',
    subtitle: d.description ? d.description.slice(0, 60) : `${categoryLabel} • ${rangeText}`,
    image: primaryImage,
    images: imagesList.length > 0 ? imagesList : [primaryImage],
    tag1: categoryLabel,
    tag2: rangeText,
    price: typeof d.hourlyRate === 'number'
      ? `$${d.hourlyRate.toLocaleString()}`
      : (d.price || '$18,500'),
    pricePer: 'per flight hour',
    badge: d.badge || 'VIP Flagship',
    country: 'Global Aviation Fleet',
    description: d.description || '',
    rating: typeof d.rating === 'number' ? d.rating : 4.99,
    flightRange: d.flightRange,
    guestCapacity: d.guestCapacity,
    tailNumber: d.tailNumber,
    category: d.category,
    hourlyRate: d.hourlyRate,
    flatRoutePrice: d.flatRoutePrice,
  };
}

export async function getLiveJets(): Promise<LiveJetCatalogItem[]> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_JETS_KEY);
    const cachedData: LiveJetCatalogItem[] = cached ? JSON.parse(cached) : [];

    const snapshot = await firestore().collection('jets').get();
    if (!snapshot.empty) {
      const items: LiveJetCatalogItem[] = [];
      snapshot.forEach(doc => {
        const d = doc.data();
        if (d.status !== 'draft') {
          items.push(mapFirestoreDocToJet(doc));
        }
      });
      if (items.length > 0) {
        await AsyncStorage.setItem(CACHE_JETS_KEY, JSON.stringify(items)).catch(() => {});
        return items;
      }
    }
    return cachedData;
  } catch {
    const cached = await AsyncStorage.getItem(CACHE_JETS_KEY).catch(() => null);
    return cached ? JSON.parse(cached) : [];
  }
}

export let memoryJetsCache: LiveJetCatalogItem[] | null = null;

export function subscribeLiveJets(callback: (jets: LiveJetCatalogItem[]) => void): () => void {
  // 1. Immediately emit memory cache if available
  if (memoryJetsCache && memoryJetsCache.length > 0) {
    callback(memoryJetsCache);
  } else {
    // 2. Read persistent storage before network resolves
    AsyncStorage.getItem(CACHE_JETS_KEY)
      .then(cached => {
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              memoryJetsCache = parsed;
              callback(parsed);
            }
          } catch {}
        }
      })
      .catch(() => {});
  }

  return firestore()
    .collection('jets')
    .onSnapshot(
      snapshot => {
        if (!snapshot || snapshot.empty) return;
        const items: LiveJetCatalogItem[] = [];
        snapshot.forEach(doc => {
          const d = doc.data();
          if (d.status !== 'draft') {
            items.push(mapFirestoreDocToJet(doc));
          }
        });
        if (items.length > 0) {
          memoryJetsCache = items;
          AsyncStorage.setItem(CACHE_JETS_KEY, JSON.stringify(items)).catch(() => {});
          callback(items);
        }
      },
      () => {
        // Silent fallback to local cache
      },
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic Backend: User Profile & VIP Member Tier Management
// ─────────────────────────────────────────────────────────────────────────────

export interface LiveUserProfile {
  id: string;
  displayName: string;
  email: string;
  phone?: string;
  tier: 'ROYAL TIER' | 'ULTRA VIP' | 'ELITE TIER' | 'CLASSIC' | string;
  memberId: string;
  isVerified: boolean;
  walletBalance: number;
  coins: number;
  assignedConcierge?: string;
  status: 'active' | 'suspended';
  avatar?: string;
  updatedAt?: string;
}

const CACHE_PROFILE_PREFIX = '@vanir_cached_profile_';

export async function getLiveUserProfile(userId: string): Promise<LiveUserProfile | null> {
  if (!userId) return null;
  const cacheKey = `${CACHE_PROFILE_PREFIX}${userId}`;
  try {
    const docSnap = await firestore().collection('users').doc(userId).get();
    if (docSnap.exists()) {
      const d = docSnap.data() || {};
      const profile: LiveUserProfile = {
        id: docSnap.id,
        displayName: d.displayName || d.name || 'VIP Member',
        email: d.email || '',
        phone: d.phone || '',
        tier: d.tier || 'ROYAL TIER',
        memberId: d.memberId || 'VN-0042',
        isVerified: d.isVerified !== false,
        walletBalance: typeof d.walletBalance === 'number' ? d.walletBalance : 15000,
        coins: typeof d.coins === 'number' ? d.coins : 1500,
        assignedConcierge: d.assignedConcierge || 'Sofia D. (Chief Concierge)',
        status: d.status || 'active',
        avatar: d.avatar || '',
        updatedAt: d.updatedAt || '',
      };
      await AsyncStorage.setItem(cacheKey, JSON.stringify(profile)).catch(() => {});
      return profile;
    }
    const cached = await AsyncStorage.getItem(cacheKey);
    return cached ? JSON.parse(cached) : null;
  } catch {
    const cached = await AsyncStorage.getItem(cacheKey).catch(() => null);
    return cached ? JSON.parse(cached) : null;
  }
}

export function subscribeLiveUserProfile(
  userId: string,
  callback: (profile: LiveUserProfile) => void,
): () => void {
  if (!userId) return () => {};
  const cacheKey = `${CACHE_PROFILE_PREFIX}${userId}`;

  return firestore()
    .collection('users')
    .doc(userId)
    .onSnapshot(
      docSnap => {
        if (!docSnap || !docSnap.exists()) return;
        const d = docSnap.data() || {};
        const profile: LiveUserProfile = {
          id: docSnap.id,
          displayName: d.displayName || d.name || 'VIP Member',
          email: d.email || '',
          phone: d.phone || '',
          tier: d.tier || 'ROYAL TIER',
          memberId: d.memberId || 'VN-0042',
          isVerified: d.isVerified !== false,
          walletBalance: typeof d.walletBalance === 'number' ? d.walletBalance : 15000,
          coins: typeof d.coins === 'number' ? d.coins : 1500,
          assignedConcierge: d.assignedConcierge || 'Sofia D. (Chief Concierge)',
          status: d.status || 'active',
          avatar: d.avatar || '',
          updatedAt: d.updatedAt || '',
        };
        AsyncStorage.setItem(cacheKey, JSON.stringify(profile)).catch(() => {});
        callback(profile);
      },
      () => {
        // Silent fallback to local cache
      },
    );
}

export async function updateLiveUserProfile(
  userId: string,
  data: Partial<LiveUserProfile>,
): Promise<void> {
  if (!userId) return;
  const cacheKey = `${CACHE_PROFILE_PREFIX}${userId}`;
  try {
    await firestore()
      .collection('users')
      .doc(userId)
      .set(
        {
          ...data,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );

    const cached = await AsyncStorage.getItem(cacheKey).catch(() => null);
    if (cached) {
      const merged = { ...JSON.parse(cached), ...data };
      await AsyncStorage.setItem(cacheKey, JSON.stringify(merged)).catch(() => {});
    }
  } catch (err) {
    console.error('Error updating live user profile:', err);
    throw err;
  }
}
