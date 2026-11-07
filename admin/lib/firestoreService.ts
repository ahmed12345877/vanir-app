import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { PrivateJet, LuxuryYacht, VIPTransfer, LuxuryPackage } from './serviceTypes';
import type { User, Booking } from './types';

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
  fallbackImage: string;
  badge?: string | null;
  highlights: string[];
  status: 'active' | 'draft';
  updatedAt?: string;
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
  images?: string[];
  title: string;
  subtitle: string;
  price?: string;
  rating?: number;
  routeTarget: string;
  routeParams?: any;
}

export interface AppConfigData {
  services: ServiceControls;
  feedCards: HomeFeedCard[];
  heroBanner: {
    title: string;
    subtitle: string;
    imageUrl: string;
    active: boolean;
  };
}

export const INITIAL_TOURS: TourItem[] = [
  {
    id: 't1',
    name: 'Private VIP Giza Pyramids & Sphinx Expedition',
    location: 'Giza Plateau, Cairo',
    duration: '6 Hours',
    rating: 4.95,
    reviews: 412,
    price: '$180',
    category: 'day-trips',
    image: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=800&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c0e?w=800&q=80',
    badge: 'Top Choice',
    highlights: ['Exclusive After-Hours Gate Access', 'Dedicated Senior Egyptologist Guide', 'Fine Dining Lunch Overlooking Pyramids'],
    status: 'active',
  },
  {
    id: 't2',
    name: 'Royal Dubai Desert Safari & Oasis Gala',
    location: 'Dubai, UAE',
    duration: '8 Hours',
    rating: 4.92,
    reviews: 620,
    price: '$290',
    category: 'day-trips',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    badge: 'Exclusive',
    highlights: ['Private Range Rover Fleet', 'Luxury Bedouin Retreat', '5-Star Dining Under the Desert Stars'],
    status: 'active',
  },
  {
    id: 't3',
    name: 'Private Catamaran Sunset Cruise in Santorini',
    location: 'Santorini, Greece',
    duration: '5 Hours',
    rating: 4.98,
    reviews: 185,
    price: '$1,290',
    category: 'day-trips',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=80',
    badge: 'Signature',
    highlights: ['Onboard Private Seafood Chef', 'Thermal Spring Swimming', 'Unrivaled Sunset View from Oia'],
    status: 'active',
  },
  {
    id: 't4',
    name: 'Parisian Grand Luxury: Louvre, Eiffel & Seine Cruise',
    location: 'Paris, France',
    duration: '4 Days',
    rating: 4.96,
    reviews: 240,
    price: '$4,800',
    category: 'packages',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&q=80',
    badge: 'Curated',
    highlights: ['After-Hours Private Louvre Gallery Tour', 'Michelin-Starred Dining at Jules Verne', 'Chauffeured Rolls-Royce Phantom'],
    status: 'active',
  },
  {
    id: 't5',
    name: 'Cairo Islamic Architecture & Khan El Khalili VIP Walk',
    location: 'Old Cairo, Egypt',
    duration: '5 Hours',
    rating: 4.91,
    reviews: 178,
    price: '$140',
    category: 'cultural',
    image: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80',
    badge: 'Heritage',
    highlights: ['Private Historian Companion', 'Exclusive Rooftop Minaret Access', 'Authentic Naguib Mahfouz Cafe Reservation'],
    status: 'active',
  },
  {
    id: 't6',
    name: 'Swiss Alps Helicopter Safari & Glacier Fondue',
    location: 'Zermatt, Switzerland',
    duration: '3 Days',
    rating: 4.99,
    reviews: 94,
    price: '$6,500',
    category: 'packages',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1491557345352-5929e343eb89?w=800&q=80',
    badge: 'Ultra VIP',
    highlights: ['Matterhorn Helicopter Flyover', 'Private Ski Instructor & Equipment', 'Glacier Champagne & Fondue Experience'],
    status: 'active',
  },
];

export const INITIAL_SERVICE_CONTROLS: ServiceControls = {
  flights: true,
  private_jet: true,
  hotels: true,
  apartments: true,
  yachts: true,
  cars: true,
  tours: true,
  gallery: true,
  blog: true,
  esim: true,
  visa: true,
  fasttrack: true,
  ai_concierge: true,
  offices: true,
  emergency_notice: '',
  welcome_bg_image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1600',
};

export const INITIAL_FEED_CARDS: HomeFeedCard[] = [
  {
    id: 'f1',
    category: 'flights',
    tag: 'Global First Class & Private Jet ✈️',
    image: 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=1200&q=85',
    title: 'Emirates, Qatar Airways & Gulfstream Fleet',
    subtitle: 'Ultra-Luxury First Suites, Private Jet Charters & Concierge',
    routeTarget: 'FlightBooking',
  },
  {
    id: 'f2',
    category: 'hotels',
    tag: 'EXCLUSIVE 25% PRIVILEGE',
    tagColor: '#EF4444',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
    title: 'FIVE Palm Jumeirah Dubai',
    subtitle: 'Palm Jumeirah, Dubai • 5-Star Beachfront',
    price: '$450/nt',
    rating: 4.95,
    routeTarget: 'HotelDetails',
  },
  {
    id: 'f3',
    category: 'apartments',
    tag: 'Luxury Serviced Residences',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    title: 'The Address Downtown Residences',
    subtitle: 'Downtown Dubai • Panoramic Burj Khalifa View',
    price: '$750/nt',
    rating: 4.98,
    routeTarget: 'HotelApartments',
  },
  {
    id: 'f4',
    category: 'cars',
    tag: 'Chauffeur & Executive Fleet',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
    title: 'Mercedes-Benz E-Class Sedan',
    subtitle: 'Uniformed Chauffeur • Wi-Fi & Refreshments • Massage Seats',
    price: '$150/day',
    rating: 5.0,
    routeTarget: 'Cars',
  },
  {
    id: 'f5',
    category: 'yachts',
    tag: 'Luxury Superyacht Charter',
    image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80',
    title: 'Majesty 120 Superyacht',
    subtitle: 'Dubai Marina • Private Onboard Chef & 7-Member Crew',
    price: '$1,500/hr',
    rating: 4.92,
    routeTarget: 'Yacht',
  },
  {
    id: 'f6',
    category: 'hotels',
    tag: 'Historic Nile Panoramic Suites',
    image: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800&q=80',
    title: 'The Nile Ritz-Carlton Cairo',
    subtitle: 'Nile Corniche, Downtown Cairo • Royal Suites',
    price: '$850/nt',
    rating: 4.96,
    routeTarget: 'HotelDetails',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Firestore Operations
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchToursFromFirestore(): Promise<TourItem[]> {
  if (!db) return INITIAL_TOURS;

  try {
    const toursCol = collection(db, 'tours');
    const snapshot = await getDocs(toursCol);

    if (snapshot.empty) {
      // Seed initial tours automatically
      await seedInitialTours();
      return INITIAL_TOURS;
    }

    const items: TourItem[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      items.push({
        id: docSnap.id,
        name: data.name || '',
        location: data.location || '',
        duration: data.duration || '',
        rating: typeof data.rating === 'number' ? data.rating : 4.9,
        reviews: typeof data.reviews === 'number' ? data.reviews : 100,
        price: data.price || '$0',
        category: data.category || 'all',
        image: data.image || '',
        fallbackImage: data.fallbackImage || 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c0e?w=800&q=80',
        badge: data.badge || null,
        highlights: Array.isArray(data.highlights) ? data.highlights : [],
        status: data.status === 'draft' ? 'draft' : 'active',
        updatedAt: data.updatedAt ? String(data.updatedAt) : undefined,
      });
    });

    return items;
  } catch (err) {
    console.warn('Error reading tours from Firestore, returning fallback:', err);
    return INITIAL_TOURS;
  }
}

export async function saveTourToFirestore(tour: TourItem): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  const tourRef = doc(db, 'tours', tour.id);
  await setDoc(tourRef, {
    ...tour,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

export async function deleteTourFromFirestore(tourId: string): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  await deleteDoc(doc(db, 'tours', tourId));
}

export async function seedInitialTours(): Promise<void> {
  if (!db) return;
  for (const tour of INITIAL_TOURS) {
    await setDoc(doc(db, 'tours', tour.id), {
      ...tour,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// App Controls & Home Config Operations
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchAppControlsFromFirestore(): Promise<ServiceControls> {
  if (!db) return INITIAL_SERVICE_CONTROLS;
  try {
    const configDoc = await getDoc(doc(db, 'app_config', 'services'));
    if (!configDoc.exists()) {
      await saveAppControlsToFirestore(INITIAL_SERVICE_CONTROLS);
      return INITIAL_SERVICE_CONTROLS;
    }
    return { ...INITIAL_SERVICE_CONTROLS, ...configDoc.data() } as ServiceControls;
  } catch {
    return INITIAL_SERVICE_CONTROLS;
  }
}

export async function saveAppControlsToFirestore(controls: ServiceControls): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  await setDoc(doc(db, 'app_config', 'services'), {
    ...controls,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

export async function fetchFeedCardsFromFirestore(): Promise<HomeFeedCard[]> {
  if (!db) return INITIAL_FEED_CARDS;
  try {
    const cardsDoc = await getDoc(doc(db, 'app_config', 'home_feed'));
    if (!cardsDoc.exists() || !cardsDoc.data()?.cards) {
      await saveFeedCardsToFirestore(INITIAL_FEED_CARDS);
      return INITIAL_FEED_CARDS;
    }
    return cardsDoc.data().cards as HomeFeedCard[];
  } catch {
    return INITIAL_FEED_CARDS;
  }
}

export async function compressDataUrlString(
  dataUrl: string,
  maxDimension = 800,
  quality = 0.65,
  maxChars = 55000,
): Promise<string> {
  if (typeof window === 'undefined' || !dataUrl || !dataUrl.startsWith('data:image/')) {
    return dataUrl;
  }
  return new Promise(resolve => {
    const img = new window.Image();
    img.onload = () => {
      let dim = maxDimension;
      let q = quality;
      let result = dataUrl;

      for (let attempt = 0; attempt < 6; attempt++) {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > dim || height > dim) {
          if (width > height) {
            height = Math.round((height * dim) / width);
            width = dim;
          } else {
            width = Math.round((width * dim) / height);
            height = dim;
          }
        }

        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) break;

        ctx.drawImage(img, 0, 0, width, height);
        result = canvas.toDataURL('image/jpeg', q);

        if (result.length <= maxChars) {
          break;
        }

        dim = Math.round(dim * 0.82);
        q = Math.max(0.35, q - 0.12);
      }

      resolve(result);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export async function saveFeedCardsToFirestore(cards: HomeFeedCard[]): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');

  // Pre-process cards: compress oversized data URLs and strip duplicate arrays to strictly keep document well under 1MB
  const sanitizedCards = await Promise.all(
    cards.map(async card => {
      let image = card.image || '';

      // If this card uses a base64 Data URL, ensure it is compressed down to ~40KB (55,000 chars)
      if (typeof window !== 'undefined' && image.startsWith('data:image/') && image.length > 55000) {
        try {
          image = await compressDataUrlString(image, 800, 0.65, 55000);
        } catch {
          // keep as is
        }
      }

      // Ensure 'images' array does NOT store redundant 50KB-500KB duplicate copies of base64
      let images = card.images;
      if (image.startsWith('data:image/')) {
        images = [image];
      } else if (images && images.length > 0) {
        images = images.map(img => (img.startsWith('data:image/') ? image : img));
      }

      const sanitized: HomeFeedCard = {
        ...card,
        image,
        images: images && images.length > 0 ? images : [image],
      };

      if (sanitized.routeParams?.images && image.startsWith('data:image/')) {
        sanitized.routeParams = {
          ...sanitized.routeParams,
          images: [image],
        };
      }

      return sanitized;
    }),
  );

  await setDoc(doc(db, 'app_config', 'home_feed'), {
    cards: sanitizedCards,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

export const fetchHomeFeedCardsFromFirestore = fetchFeedCardsFromFirestore;
export const saveHomeFeedCardsToFirestore = saveFeedCardsToFirestore;

// ─────────────────────────────────────────────────────────────────────────────
// Hotel Firestore Operations & Seed Data
// ─────────────────────────────────────────────────────────────────────────────

import type { Hotel, ServiceImage } from './serviceTypes';

export const INITIAL_HOTELS: Hotel[] = [
  // 1. EGYPT
  {
    id: 'hotel-cairo-ritz',
    propertyName: 'The Nile Ritz-Carlton, Cairo',
    cityDestination: 'Cairo, Egypt 🇪🇬',
    suiteType: 'Royal Suite',
    status: 'active',
    roomSizeSqm: 180,
    viewType: 'ocean',
    butlerService: true,
    privatePool: true,
    nightlyRate: 850,
    latitude: 30.0469,
    longitude: 31.2335,
    description: 'Palatial five-star retreat on the historic Nile Corniche facing the Egyptian Museum. Features royal private balconies with panoramic river vistas, heated Olympic pool, and 24/7 dedicated butler service.',
    images: [
      { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&q=80', label: 'Exterior & Nile River Front', position: 'main' },
      { url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1000&q=80', label: 'Royal Suite Master Bedroom', position: 'bedroom' },
      { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1000&q=80', label: 'Luxury Marble Bathroom', position: 'bath' },
      { url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1000&q=80', label: 'Bab El-Sharq Fine Dining', position: 'dining' },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'hotel-cairo-fourseasons',
    propertyName: 'Four Seasons Hotel Cairo at Nile Plaza',
    cityDestination: 'Cairo, Egypt 🇪🇬',
    suiteType: 'Diplomatic Nile Suite',
    status: 'active',
    roomSizeSqm: 160,
    viewType: 'ocean',
    butlerService: true,
    privatePool: false,
    nightlyRate: 790,
    latitude: 30.0345,
    longitude: 31.2285,
    description: 'A sanctuary of timeless luxury in diplomatic Garden City with panoramic Nile vistas, 9 dining establishments, and holistic spa.',
    images: [
      { url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1000&q=80', label: 'Nile Plaza View', position: 'main' },
      { url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1000&q=80', label: 'Diplomatic Suite', position: 'bedroom' },
      { url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1000&q=80', label: 'Spa Pool', position: 'pool' },
      { url: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1000&q=80', label: 'Zitouni Restaurant', position: 'dining' },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'hotel-giza-menahouse',
    propertyName: 'Marriott Mena House, Giza Pyramids',
    cityDestination: 'Giza, Egypt 🇪🇬',
    suiteType: 'Presidential Pyramid Suite',
    status: 'active',
    roomSizeSqm: 145,
    viewType: 'garden',
    butlerService: true,
    privatePool: false,
    nightlyRate: 920,
    latitude: 29.9858,
    longitude: 31.1325,
    description: 'Historic palace hotel surrounded by 40 acres of landscaped jasmine gardens with majestic views of the Great Pyramids of Giza.',
    images: [
      { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1000&q=80', label: 'Pyramids View Balcony', position: 'main' },
      { url: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1000&q=80', label: 'Grand Living Salon', position: 'living' },
      { url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1000&q=80', label: 'Palace Gardens', position: 'garden' },
      { url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&q=80', label: '139 Pavilion Dining', position: 'dining' },
    ],
    createdAt: new Date().toISOString(),
  },

  // 2. DUBAI
  {
    id: 'hotel-dubai-burjalarab',
    propertyName: 'Burj Al Arab Jumeirah',
    cityDestination: 'Dubai, UAE 🇦🇪',
    suiteType: 'Royal Two-Bedroom Suite',
    status: 'active',
    roomSizeSqm: 780,
    viewType: 'ocean',
    butlerService: true,
    privatePool: true,
    nightlyRate: 2400,
    latitude: 25.1412,
    longitude: 55.1852,
    description: 'The world-famous sail-shaped hotel rising from its own private island. Features 24-karat gold interiors, duplex suites, and dedicated personal butler on every floor.',
    images: [
      { url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1000&q=80', label: 'Iconic Sail Architecture', position: 'main' },
      { url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1000&q=80', label: 'Gold Leaf Duplex Living', position: 'living' },
      { url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1000&q=80', label: 'Sal Infinity Pool', position: 'pool' },
      { url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1000&q=80', label: 'Al Muntaha Dining', position: 'dining' },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'hotel-dubai-atlantisroyal',
    propertyName: 'Atlantis The Royal, Palm Jumeirah',
    cityDestination: 'Dubai, UAE 🇦🇪',
    suiteType: 'Sky Pool Villa Suite',
    status: 'active',
    roomSizeSqm: 350,
    viewType: 'ocean',
    butlerService: true,
    privatePool: true,
    nightlyRate: 1850,
    latitude: 25.1385,
    longitude: 55.1205,
    description: 'Visionary experiential luxury resort crowned by Cloud 22 infinity pool with private cantilevered glass plunge pools and celebrity dining.',
    images: [
      { url: 'https://images.unsplash.com/photo-1580977276076-ae4b8c219b8e?w=1000&q=80', label: 'Architectural Exterior', position: 'main' },
      { url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1000&q=80', label: 'Sky Pool Villa', position: 'bedroom' },
      { url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=1000&q=80', label: 'Cloud 22 Sky Pool', position: 'pool' },
      { url: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1000&q=80', label: 'Nobu by the Beach', position: 'dining' },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'hotel-dubai-armani',
    propertyName: 'Armani Hotel Dubai, Burj Khalifa',
    cityDestination: 'Dubai, UAE 🇦🇪',
    suiteType: 'Armani Signature Suite',
    status: 'active',
    roomSizeSqm: 235,
    viewType: 'city',
    butlerService: true,
    privatePool: false,
    nightlyRate: 1250,
    latitude: 25.1972,
    longitude: 55.2744,
    description: 'Personal creation of Giorgio Armani occupying 11 floors in the Burj Khalifa with minimalist Florentine design and fountain vistas.',
    images: [
      { url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1000&q=80', label: 'Burj Khalifa Tower Suite', position: 'main' },
      { url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1000&q=80', label: 'Armani Living Salon', position: 'living' },
      { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1000&q=80', label: 'Marble Bathroom', position: 'bath' },
      { url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1000&q=80', label: 'Armani Ristorante', position: 'dining' },
    ],
    createdAt: new Date().toISOString(),
  },

  // 3. ENGLAND / LONDON
  {
    id: 'hotel-london-ritz',
    propertyName: 'The Ritz London, Mayfair',
    cityDestination: 'London, UK 🇬🇧',
    suiteType: 'Prince of Wales Royal Suite',
    status: 'active',
    roomSizeSqm: 250,
    viewType: 'city',
    butlerService: true,
    privatePool: false,
    nightlyRate: 1650,
    latitude: 51.5071,
    longitude: -0.1416,
    description: 'The epitome of British aristocratic sophistication on Piccadilly with Louis XVI salon suites, Michelin dining, and Rolls-Royce fleet.',
    images: [
      { url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1000&q=80', label: 'Piccadilly Palace Facade', position: 'main' },
      { url: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1000&q=80', label: 'Louis XVI Royal Suite', position: 'bedroom' },
      { url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1000&q=80', label: 'Palm Court Afternoon Tea', position: 'living' },
      { url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1000&q=80', label: 'Michelin Ritz Dining', position: 'dining' },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'hotel-london-savoy',
    propertyName: 'The Savoy London, Strand',
    cityDestination: 'London, UK 🇬🇧',
    suiteType: 'Royal Thames Suite',
    status: 'active',
    roomSizeSqm: 265,
    viewType: 'ocean',
    butlerService: true,
    privatePool: false,
    nightlyRate: 1350,
    latitude: 51.5104,
    longitude: -0.1206,
    description: 'Britain’s first purpose-built luxury hotel since 1889 on the River Thames. Home to the American Bar and Savoy Grill by Gordon Ramsay.',
    images: [
      { url: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=1000&q=80', label: 'Savoy River Thames Facade', position: 'main' },
      { url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1000&q=80', label: 'Art Deco Royal Suite', position: 'bedroom' },
      { url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1000&q=80', label: 'American Bar Cocktails', position: 'bar' },
      { url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&q=80', label: 'Savoy Grill Dining', position: 'dining' },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'hotel-london-claridges',
    propertyName: 'Claridge’s, Mayfair',
    cityDestination: 'London, UK 🇬🇧',
    suiteType: 'Grand Mayfair Piano Suite',
    status: 'active',
    roomSizeSqm: 190,
    viewType: 'city',
    butlerService: true,
    privatePool: false,
    nightlyRate: 1780,
    latitude: 51.5126,
    longitude: -0.1488,
    description: 'Revered as the royal annex to Buckingham Palace in the heart of Mayfair, offering Linley designer suites and white-glove discreet service.',
    images: [
      { url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1000&q=80', label: 'Mayfair Foyer & Facade', position: 'main' },
      { url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1000&q=80', label: 'Piano Master Suite', position: 'bedroom' },
      { url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1000&q=80', label: 'Claridge’s Marble Spa', position: 'spa' },
      { url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1000&q=80', label: 'Foyer Restaurant', position: 'dining' },
    ],
    createdAt: new Date().toISOString(),
  },

  // 4. PARIS
  {
    id: 'hotel-paris-crillon',
    propertyName: 'Hôtel de Crillon, Rosewood Hotel',
    cityDestination: 'Paris, France 🇫🇷',
    suiteType: 'Duc de Crillon Grand Suite',
    status: 'active',
    roomSizeSqm: 210,
    viewType: 'city',
    butlerService: true,
    privatePool: false,
    nightlyRate: 1950,
    latitude: 48.8681,
    longitude: 2.3287,
    description: 'An illustrious 18th-century French neoclassical palace commissioned by King Louis XV on Place de la Concorde with Karl Lagerfeld suites.',
    images: [
      { url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1000&q=80', label: 'Place de la Concorde Palace', position: 'main' },
      { url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1000&q=80', label: 'Duc de Crillon Master Suite', position: 'bedroom' },
      { url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=1000&q=80', label: 'Gold Leaf Subterranean Pool', position: 'pool' },
      { url: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1000&q=80', label: 'L’Écrin Michelin Gastronomy', position: 'dining' },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'hotel-paris-georgev',
    propertyName: 'Four Seasons Hotel George V, Paris',
    cityDestination: 'Paris, France 🇫🇷',
    suiteType: 'The Penthouse Eiffel Vista Suite',
    status: 'active',
    roomSizeSqm: 220,
    viewType: 'city',
    butlerService: true,
    privatePool: false,
    nightlyRate: 2100,
    latitude: 48.8689,
    longitude: 2.3009,
    description: 'An art-deco palace steps from Champs-Élysées holding 5 collective Michelin stars across three restaurants and floral artistry.',
    images: [
      { url: 'https://images.unsplash.com/photo-1549144511-f099e773c147?w=1000&q=80', label: 'Avenue George V Palace', position: 'main' },
      { url: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1000&q=80', label: 'The Penthouse Eiffel Vista', position: 'bedroom' },
      { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1000&q=80', label: 'Jeff Leatham Floral Courtyard', position: 'courtyard' },
      { url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1000&q=80', label: 'Le Cinq 3-Star Michelin', position: 'dining' },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'hotel-paris-ritz',
    propertyName: 'The Ritz Paris, Place Vendôme',
    cityDestination: 'Paris, France 🇫🇷',
    suiteType: 'Coco Chanel Prestige Suite',
    status: 'active',
    roomSizeSqm: 200,
    viewType: 'city',
    butlerService: true,
    privatePool: false,
    nightlyRate: 2250,
    latitude: 48.8683,
    longitude: 2.3292,
    description: 'The golden standard of French aristocratic luxury founded by César Ritz in 1898 on Place Vendôme with Chanel Spa and private Versailles gardens.',
    images: [
      { url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1000&q=80', label: 'Place Vendôme Prestige Facade', position: 'main' },
      { url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1000&q=80', label: 'Coco Chanel Suite', position: 'bedroom' },
      { url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1000&q=80', label: 'Grand Jardin Park', position: 'garden' },
      { url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&q=80', label: 'Bar Hemingway', position: 'bar' },
    ],
    createdAt: new Date().toISOString(),
  },

  // 5. TURKEY
  {
    id: 'hotel-turkey-ciragan',
    propertyName: 'Çırağan Palace Kempinski Istanbul',
    cityDestination: 'Istanbul, Turkey 🇹🇷',
    suiteType: 'Imperial Sultan Palace Suite',
    status: 'active',
    roomSizeSqm: 450,
    viewType: 'ocean',
    butlerService: true,
    privatePool: true,
    nightlyRate: 1450,
    latitude: 41.0435,
    longitude: 29.0163,
    description: 'The only authentic Ottoman imperial palace on the Bosphorus Strait where Sultans once resided with heated infinity pool and superyacht dock.',
    images: [
      { url: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=1000&q=80', label: 'Bosphorus Palace Imperial Facade', position: 'main' },
      { url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1000&q=80', label: 'Sultan Palace Bedroom', position: 'bedroom' },
      { url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=1000&q=80', label: 'Bosphorus Edge Infinity Pool', position: 'pool' },
      { url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1000&q=80', label: 'Tuğra Ottoman Royal Dining', position: 'dining' },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'hotel-turkey-mandarin',
    propertyName: 'Mandarin Oriental Bosphorus, Istanbul',
    cityDestination: 'Istanbul, Turkey 🇹🇷',
    suiteType: 'Bosphorus Presidential Suite',
    status: 'active',
    roomSizeSqm: 290,
    viewType: 'ocean',
    butlerService: true,
    privatePool: false,
    nightlyRate: 1320,
    latitude: 41.0601,
    longitude: 29.0354,
    description: 'Contemporary waterfront sanctuary in Kuruçeşme with 200m shoreline, Novikov dining, and marble Ottoman hammams.',
    images: [
      { url: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a1b?w=1000&q=80', label: 'European Shoreline Water Pavilion', position: 'main' },
      { url: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1000&q=80', label: 'Bosphorus Master Panorama', position: 'bedroom' },
      { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1000&q=80', label: 'Authentic Turkish Marble Hammam', position: 'spa' },
      { url: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1000&q=80', label: 'Novikov Waterfront Terrace', position: 'dining' },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'hotel-turkey-cappadocia',
    propertyName: 'Argos in Cappadocia',
    cityDestination: 'Cappadocia, Turkey 🇹🇷',
    suiteType: 'Splendid Cave Suite with In-Room Pool',
    status: 'active',
    roomSizeSqm: 120,
    viewType: 'mountain',
    butlerService: true,
    privatePool: true,
    nightlyRate: 890,
    latitude: 38.6305,
    longitude: 34.8055,
    description: 'Converted from thousands-of-years-old monastery caves with private heated rock plunge pools and panoramic hot air balloon terraces.',
    images: [
      { url: 'https://images.unsplash.com/photo-1570939274717-7eda259b50ed?w=1000&q=80', label: 'Hot Air Balloons Valley Panorama', position: 'main' },
      { url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1000&q=80', label: 'Heated Cave Plunge Pool Suite', position: 'bedroom' },
      { url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1000&q=80', label: 'Underground Tunnel Monastery', position: 'cellar' },
      { url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1000&q=80', label: 'Seki Valley Terrace Dining', position: 'dining' },
    ],
    createdAt: new Date().toISOString(),
  },

  // 6. EAST ASIA
  {
    id: 'hotel-asia-amantokyo',
    propertyName: 'Aman Tokyo, Japan',
    cityDestination: 'Tokyo, Japan 🇯🇵',
    suiteType: 'Aman Master Suite with Fuji Vista',
    status: 'active',
    roomSizeSqm: 157,
    viewType: 'mountain',
    butlerService: true,
    privatePool: false,
    nightlyRate: 2300,
    latitude: 35.6868,
    longitude: 139.7652,
    description: 'Urban sanctuary on Otemachi Tower with panoramic views of Tokyo and Mount Fuji, basalt stone onsen baths, and Musashi sushi.',
    images: [
      { url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1000&q=80', label: 'Otemachi Tower Skyline & Fuji', position: 'main' },
      { url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1000&q=80', label: 'Washi Paper Lantern Living', position: 'bedroom' },
      { url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1000&q=80', label: 'Basalt Stone Sky Pool', position: 'pool' },
      { url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&q=80', label: 'Musashi by Aman Master Sushi', position: 'dining' },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'hotel-asia-bulgaribali',
    propertyName: 'Bulgari Resort Bali, Indonesia',
    cityDestination: 'Bali, Indonesia 🇮🇩',
    suiteType: 'Five-Bedroom Bulgari Ocean Villa',
    status: 'active',
    roomSizeSqm: 1300,
    viewType: 'ocean',
    butlerService: true,
    privatePool: true,
    nightlyRate: 1750,
    latitude: -8.8471,
    longitude: 115.1432,
    description: 'Perched 150m above the Indian Ocean on the dramatic cliffs of Uluwatu with hand-cut volcanic stone walls, private infinity pool, and funicular.',
    images: [
      { url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1000&q=80', label: 'Uluwatu Clifftop Ocean Edge', position: 'main' },
      { url: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1000&q=80', label: 'Private Volcanic Stone Villa', position: 'bedroom' },
      { url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=1000&q=80', label: 'Cliffside Infinity Plunge Pool', position: 'pool' },
      { url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1000&q=80', label: 'Il Ristorante Luca Fantin', position: 'dining' },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'hotel-asia-marinabaysands',
    propertyName: 'Marina Bay Sands, Singapore',
    cityDestination: 'Singapore 🇸🇬',
    suiteType: 'Paiza Chairman Suite',
    status: 'active',
    roomSizeSqm: 620,
    viewType: 'ocean',
    butlerService: true,
    privatePool: true,
    nightlyRate: 1150,
    latitude: 1.2834,
    longitude: 103.8607,
    description: 'Singapore’s globally celebrated architectural triumph crowned by the Sands SkyPark 57 levels above the city and world’s longest rooftop pool.',
    images: [
      { url: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1000&q=80', label: 'Sands SkyPark Architectural Wonder', position: 'main' },
      { url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1000&q=80', label: 'Paiza Royal Sky Suite', position: 'bedroom' },
      { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1000&q=80', label: '57th Floor SkyPool', position: 'pool' },
      { url: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1000&q=80', label: 'Spago by Wolfgang Puck', position: 'dining' },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'hotel-asia-peninsulabangkok',
    propertyName: 'The Peninsula Bangkok, Thailand',
    cityDestination: 'Bangkok, Thailand 🇹🇭',
    suiteType: 'Grand Terrace Suite River Panorama',
    status: 'active',
    roomSizeSqm: 240,
    viewType: 'ocean',
    butlerService: true,
    privatePool: false,
    nightlyRate: 680,
    latitude: 13.7225,
    longitude: 100.5103,
    description: 'Iconic wave-shaped palace along the banks of the Chao Phraya River with private teakwood river shuttles, three-tiered pool, and rooftop helipad.',
    images: [
      { url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1000&q=80', label: 'Chao Phraya River Waterfront', position: 'main' },
      { url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1000&q=80', label: 'Grand Terrace River Suite', position: 'bedroom' },
      { url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1000&q=80', label: '88-Meter Riverside Pool', position: 'pool' },
      { url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1000&q=80', label: 'Thiptara Thai Garden Pavilion', position: 'dining' },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'hotel-asia-ritzkyoto',
    propertyName: 'The Ritz-Carlton, Kyoto, Japan',
    cityDestination: 'Kyoto, Japan 🇯🇵',
    suiteType: 'Tsukimi Moonlight Suite',
    status: 'active',
    roomSizeSqm: 140,
    viewType: 'mountain',
    butlerService: true,
    privatePool: false,
    nightlyRate: 1820,
    latitude: 35.0125,
    longitude: 135.7725,
    description: 'Sublime riverside sanctuary along the banks of the Kamogawa River with views of Higashiyama mountains, private rock gardens, and Michelin tempura.',
    images: [
      { url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1000&q=80', label: 'Kamogawa Riverfront & Mountains', position: 'main' },
      { url: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1000&q=80', label: 'Tsukimi Ryokan Tatami Suite', position: 'bedroom' },
      { url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1000&q=80', label: 'Zen Rock Garden & Waterfall', position: 'garden' },
      { url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&q=80', label: 'Mizuki Michelin Tempura', position: 'dining' },
    ],
    createdAt: new Date().toISOString(),
  },

  // 11. HOTEL APARTMENTS & PENTHOUSES
  {
    id: 'apt1',
    propertyName: 'The Address Downtown Luxury Residence',
    cityDestination: 'Dubai, UAE 🇦🇪',
    suiteType: 'Burj Khalifa View Luxury Residence',
    category: 'apartments',
    isApartment: true,
    status: 'active',
    roomSizeSqm: 155,
    viewType: 'city',
    butlerService: true,
    privatePool: true,
    nightlyRate: 750,
    latitude: 25.1972,
    longitude: 55.2744,
    description: 'Fully-serviced luxury residence with floor-to-ceiling Burj Khalifa and Dubai Fountain vistas, Italian Valcucine kitchen, and twice-daily VIP housekeeping.',
    images: [
      { url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1000&q=80', label: 'Downtown Residence Living & Balcony', position: 'main' },
      { url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1000&q=80', label: 'Master Bedroom Suite', position: 'bedroom' },
      { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000&q=80', label: 'Private Infinity Pool Deck', position: 'pool' },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'apt2',
    propertyName: 'Four Seasons Private Residences Nile Plaza',
    cityDestination: 'Cairo, Egypt 🇪🇬',
    suiteType: 'Royal Nile Panorama Residence',
    category: 'apartments',
    isApartment: true,
    status: 'active',
    roomSizeSqm: 240,
    viewType: 'ocean',
    butlerService: true,
    privatePool: false,
    nightlyRate: 850,
    latitude: 30.0381,
    longitude: 31.2312,
    description: 'Palatial 3-bedroom serviced apartment in Garden City with panoramic Nile terraces, 24/7 dedicated butler, and diplomatic-grade acoustic privacy.',
    images: [
      { url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1000&q=80', label: 'Panoramic Nile Living Salon', position: 'main' },
      { url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1000&q=80', label: 'Royal Master Bedroom', position: 'bedroom' },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'apt3',
    propertyName: 'Mayfair Royal Penthouse Suites',
    cityDestination: 'London, UK 🇬🇧',
    suiteType: 'Park Lane Royal Penthouse',
    category: 'apartments',
    isApartment: true,
    status: 'active',
    roomSizeSqm: 180,
    viewType: 'city',
    butlerService: true,
    privatePool: false,
    nightlyRate: 1200,
    latitude: 51.5074,
    longitude: -0.1416,
    description: 'Private wraparound terrace overlooking Hyde Park, bespoke British furnishings, heated marble baths, and dedicated private elevator with biometric entry.',
    images: [
      { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000&q=80', label: 'Mayfair Penthouse Terrace', position: 'main' },
      { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&q=80', label: 'Hyde Park View Salon', position: 'living' },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'apt4',
    propertyName: 'Knightsbridge Luxury Serviced Suites',
    cityDestination: 'London, UK 🇬🇧',
    suiteType: 'Harrods View Penthouse Residence',
    category: 'apartments',
    isApartment: true,
    status: 'active',
    roomSizeSqm: 210,
    viewType: 'city',
    butlerService: true,
    privatePool: false,
    nightlyRate: 1350,
    latitude: 51.4995,
    longitude: -0.1633,
    description: 'Direct Harrods proximity with bespoke concierge, private chef kitchen, and Rolls-Royce chauffeur on demand.',
    images: [
      { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1000&q=80', label: 'Knightsbridge Grand Salon', position: 'main' },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'apt5',
    propertyName: 'Bvlgari Marina Resort Residences',
    cityDestination: 'Dubai, UAE 🇦🇪',
    suiteType: 'Ultra-Luxury Marina Villa Residence',
    category: 'apartments',
    isApartment: true,
    status: 'active',
    roomSizeSqm: 290,
    viewType: 'ocean',
    butlerService: true,
    privatePool: true,
    nightlyRate: 2200,
    latitude: 25.2155,
    longitude: 55.2444,
    description: 'Private 40m yacht berth at your doorstep, cantilevered private plunge pool, Zen garden, and private sandy beach access.',
    images: [
      { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000&q=80', label: 'Bvlgari Island Marina Villa', position: 'main' },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'apt6',
    propertyName: 'Avenue Montaigne Luxury Residence',
    cityDestination: 'Paris, France 🇫🇷',
    suiteType: 'Haute Couture Living Penthouse',
    category: 'apartments',
    isApartment: true,
    status: 'active',
    roomSizeSqm: 135,
    viewType: 'city',
    butlerService: true,
    privatePool: false,
    nightlyRate: 1500,
    latitude: 48.8667,
    longitude: 2.3083,
    description: 'Classic Haussmannian wrought-iron balcony with Eiffel Tower vistas, designer interiors by Paris haute ateliers, and private wine cellar.',
    images: [
      { url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1000&q=80', label: 'Eiffel View Balcony & Salon', position: 'main' },
    ],
    createdAt: new Date().toISOString(),
  },
];

export async function fetchHotelsFromFirestore(): Promise<Hotel[]> {
  if (!db) return INITIAL_HOTELS;

  try {
    const col = collection(db, 'hotels');
    const snapshot = await getDocs(col);

    if (snapshot.empty || snapshot.size < 20) {
      await seedInitialHotels();
    }

    const map = new Map<string, Hotel>();
    // Pre-populate with all INITIAL_HOTELS (hotels + apartments)
    for (const h of INITIAL_HOTELS) {
      map.set(h.id, h);
    }

    // Merge any live edits or additions from Firestore
    snapshot.forEach(docSnap => {
      const d = docSnap.data();
      const existing = map.get(docSnap.id);

      // Normalize images from objects or strings
      let resolvedImages: any[] = [];
      if (Array.isArray(d.images) && d.images.length > 0) {
        resolvedImages = d.images.map((img: any, idx: number) => {
          if (typeof img === 'string') return { url: img, label: `صورة ${idx + 1}`, position: idx === 0 ? 'main' : '' };
          return img;
        });
      } else if (Array.isArray(d.photos) && d.photos.length > 0) {
        resolvedImages = d.photos.map((p: any, idx: number) => {
          if (typeof p === 'string') return { url: p, label: `صورة ${idx + 1}`, position: idx === 0 ? 'main' : '' };
          return p;
        });
      } else if (d.image) {
        resolvedImages = [{ url: d.image, label: 'الغلاف الرئيسي', position: 'main' }];
      } else if (existing?.images) {
        resolvedImages = existing.images;
      }

      const isApt = Boolean(d.isApartment || d.category === 'apartments' || existing?.isApartment);
      const cat = isApt ? 'apartments' : (d.category || existing?.category || 'hotel');

      map.set(docSnap.id, {
        id: docSnap.id,
        propertyName: d.propertyName || existing?.propertyName || '',
        cityDestination: d.cityDestination || existing?.cityDestination || '',
        suiteType: d.suiteType || existing?.suiteType || '',
        category: cat,
        isApartment: isApt,
        status: d.status || existing?.status || 'active',
        roomSizeSqm: typeof d.roomSizeSqm === 'number' ? d.roomSizeSqm : (existing?.roomSizeSqm || 0),
        viewType: d.viewType || existing?.viewType || 'ocean',
        butlerService: typeof d.butlerService === 'boolean' ? d.butlerService : (existing?.butlerService ?? true),
        privatePool: typeof d.privatePool === 'boolean' ? d.privatePool : (existing?.privatePool ?? false),
        nightlyRate: typeof d.nightlyRate === 'number' ? d.nightlyRate : (existing?.nightlyRate || 0),
        latitude: typeof d.latitude === 'number' ? d.latitude : (existing?.latitude || 0),
        longitude: typeof d.longitude === 'number' ? d.longitude : (existing?.longitude || 0),
        description: d.description || existing?.description || '',
        images: resolvedImages,
        createdAt: d.createdAt || existing?.createdAt || new Date().toISOString(),
      });
    });

    return Array.from(map.values());
  } catch (err) {
    console.warn('Error reading hotels from Firestore, returning fallback:', err);
    return INITIAL_HOTELS;
  }
}

export async function fetchHotelByIdFromFirestore(id: string): Promise<Hotel | null> {
  if (!db) {
    return INITIAL_HOTELS.find(h => h.id === id) || null;
  }
  try {
    const snap = await getDoc(doc(db, 'hotels', id));
    if (snap.exists()) {
      const d = snap.data();
      return {
        id: snap.id,
        propertyName: d.propertyName || '',
        cityDestination: d.cityDestination || '',
        suiteType: d.suiteType || '',
        status: d.status || 'active',
        roomSizeSqm: typeof d.roomSizeSqm === 'number' ? d.roomSizeSqm : 0,
        viewType: d.viewType || 'ocean',
        butlerService: Boolean(d.butlerService),
        privatePool: Boolean(d.privatePool),
        nightlyRate: typeof d.nightlyRate === 'number' ? d.nightlyRate : 0,
        latitude: typeof d.latitude === 'number' ? d.latitude : 0,
        longitude: typeof d.longitude === 'number' ? d.longitude : 0,
        description: d.description || '',
        category: d.category || (d.isApartment ? 'apartments' : 'hotel'),
        isApartment: Boolean(d.isApartment || d.category === 'apartments'),
        images: Array.isArray(d.images) && d.images.length > 0
          ? d.images.map((img: any, idx: number) => typeof img === 'string' ? { url: img, label: `صورة ${idx + 1}`, position: idx === 0 ? 'main' : '' } : img)
          : Array.isArray(d.photos) && d.photos.length > 0
          ? d.photos.map((p: any, idx: number) => typeof p === 'string' ? { url: p, label: `صورة ${idx + 1}`, position: idx === 0 ? 'main' : '' } : p)
          : d.image
          ? [{ url: d.image, label: 'الغلاف الرئيسي', position: 'main' }]
          : [],
        createdAt: d.createdAt || new Date().toISOString(),
      };
    }
    return INITIAL_HOTELS.find(h => h.id === id) || null;
  } catch {
    return INITIAL_HOTELS.find(h => h.id === id) || null;
  }
}

export async function saveHotelToFirestore(hotel: Hotel): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');

  const sanitizedHotel: Record<string, any> = {
    id: String(hotel.id),
    propertyName: hotel.propertyName || '',
    cityDestination: hotel.cityDestination || '',
    suiteType: hotel.suiteType || '',
    status: hotel.status || 'active',
    roomSizeSqm: typeof hotel.roomSizeSqm === 'number' && !isNaN(hotel.roomSizeSqm) ? hotel.roomSizeSqm : 0,
    viewType: hotel.viewType || 'ocean',
    butlerService: Boolean(hotel.butlerService),
    privatePool: Boolean(hotel.privatePool),
    nightlyRate: typeof hotel.nightlyRate === 'number' && !isNaN(hotel.nightlyRate) ? hotel.nightlyRate : 0,
    latitude: typeof hotel.latitude === 'number' && !isNaN(hotel.latitude) ? hotel.latitude : 0,
    longitude: typeof hotel.longitude === 'number' && !isNaN(hotel.longitude) ? hotel.longitude : 0,
    description: hotel.description || '',
    images: Array.isArray(hotel.images) ? hotel.images : [],
    createdAt: hotel.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const ref = doc(db, 'hotels', sanitizedHotel.id);
  await setDoc(ref, sanitizedHotel, { merge: true });

  // Automatically synchronize corresponding feed card in app_config/home_feed
  try {
    const feedSnap = await getDoc(doc(db, 'app_config', 'home_feed'));
    if (feedSnap.exists() && Array.isArray(feedSnap.data()?.cards)) {
      const cards: HomeFeedCard[] = feedSnap.data()?.cards;
      let changed = false;
      const updatedCards = cards.map(c => {
        const isMatch = (hotel.id === 'hotel-cairo-ritz' && c.id === 'f6') ||
                        ((hotel.id === 'hotel-dubai-burj' || hotel.id === 'hotel-dubai-burjalarab') && c.id === 'f2') ||
                        (c.category === 'hotels' && (c as any).hotelId === hotel.id);
        if (isMatch) {
          changed = true;
          const imgUrls = (hotel.images?.map(i => i.url) || []).filter(Boolean);
          const primaryImg = imgUrls[0] || c.image;
          return {
            ...c,
            title: hotel.propertyName,
            subtitle: hotel.cityDestination,
            price: `$${hotel.nightlyRate}/nt`,
            image: primaryImg,
            images: imgUrls.length > 0 ? imgUrls : (c.images || [primaryImg]),
            hotelId: hotel.id,
            routeTarget: 'HotelDetails',
            routeParams: {
              hotelId: hotel.id,
              hotelName: hotel.propertyName,
              location: hotel.cityDestination,
              price: `$${hotel.nightlyRate}/nt`,
              image: primaryImg,
              images: imgUrls.length > 0 ? imgUrls : (c.images || [primaryImg]),
              description: hotel.description,
            },
          };
        }
        return c;
      });
      if (changed) {
        await saveFeedCardsToFirestore(updatedCards);
      }
    }
  } catch (err) {
    console.warn('Could not sync hotel to home_feed:', err);
  }
}

export async function deleteHotelFromFirestore(id: string): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  await deleteDoc(doc(db, 'hotels', id));
}

export async function seedInitialHotels(): Promise<void> {
  if (!db) return;
  for (const h of INITIAL_HOTELS) {
    await setDoc(doc(db, 'hotels', h.id), {
      ...h,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Blog Firestore Operations
// ─────────────────────────────────────────────────────────────────────────────

export interface BlogPostItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  author: string;
  status: 'منشورة' | 'مسودة';
  date: string;
  excerpt: string;
  content: string;
  image: string;
  readingTime?: number;
}

export const INITIAL_BLOG_POSTS: BlogPostItem[] = [
  {
    id: 'b1',
    slug: 'dubai-luxury-travel-guide',
    title: 'دليل السفر الفاخر إلى دبي: أجنحة برج العرب ومغامرات اليخوت الملكية',
    category: 'Luxury Travel',
    author: 'A Roshdi',
    status: 'منشورة',
    date: '2026-10-15',
    excerpt: 'اكتشف أرقى معايير الضيافة العالمية في دبي، من الإقامة في الأجنحة الملكية البانورامية إلى تجارب الطيران الخاص.',
    content: 'تعد دبي عاصمة الفخامة الحديثة في الشرق الأوسط. تقدم فانير جروب لضيوفها خدمات حصرية تبدأ من استقبال VIP من الطائرة عبر صالة المجلس، وتوفير أسطول رولز رويس مع سائق خاص، وصولاً إلى حجوزات الأجنحة الرئاسية في برج العرب وأتلانتس ذا رويال.',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=85',
    readingTime: 5,
  },
  {
    id: 'b2',
    slug: 'egypt-pyramids-nile-cruise-secrets',
    title: 'أسرار مصر الملكية: رحلات الأهرامات الخاصة والنايل كروز الفاخر',
    category: 'Luxury Tours',
    author: 'A Roshdi',
    status: 'منشورة',
    date: '2026-10-14',
    excerpt: 'استمتع بدخول استثنائي بعد ساعات الإغلاق إلى هضبة الأهرامات والمتحف المصري الكبير، متبوعاً بإبحار خاص على نهر النيل.',
    content: 'رحلة استكشافية حصرية تجمع عبق التاريخ المصري القديم وأعلى مستويات الرفاهية المعاصرة. تجربة إفطار خاصة بإطلالة مباشرة على تمثال أبو الهول، وجولات خاصة يقودها كبار علماء المصريات، وإقامة في قصر مينا هاوس التاريخي.',
    image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c0e?w=1200&q=85',
    readingTime: 6,
  },
  {
    id: 'b3',
    slug: 'paris-haute-couture-palaces',
    title: 'باريس الكلاسيكية: إقامة القصور الملكية وجولات الهوت كوتور',
    category: 'European Getaways',
    author: 'Vanir Editorial',
    status: 'منشورة',
    date: '2026-10-10',
    excerpt: 'رحلة إلى قلب باريس الساحرة مع إقامة في فندق دو كريون وفور سيزونز جورج الخامس وجولات تسوق حصرية.',
    content: 'في باريس، الفخامة ليست مجرد خدمة بل أسلوب حياة. توفر فانير تجارب تسوق خاصة بعد إغلاق أشهر دور الأزياء في شارع فوبورغ سانت أونوريه، وحجز موائد عشاء مميزة في مطاعم حائزة على 3 نجوم ميشلان.',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=85',
    readingTime: 4,
  },
  {
    id: 'b4',
    slug: 'swiss-alps-helicopter-glaciers',
    title: 'جبال الألب السويسرية: طيران الهليكوبتر بين القمم والمنتجعات الجليدية',
    category: 'Nature & Mountain',
    author: 'Vanir Editorial',
    status: 'منشورة',
    date: '2026-10-05',
    excerpt: 'تجربة التزلج الشتوي الفاخر في زيرمات وسانت موريتز مع جولات هليكوبتر فوق ماترهورن.',
    content: 'عش سحر الشتاء الأوروبي في أرقى الشاليهات الخاصة في زيرمات، مع طاهٍ سويسري خاص وخدمات ساونا وسبا متكاملة وسط إطلالات ثلجية تأسر القلوب.',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1200&q=85',
    readingTime: 5,
  },
];

export async function fetchBlogPostsFromFirestore(): Promise<BlogPostItem[]> {
  if (!db) return INITIAL_BLOG_POSTS;
  try {
    const col = collection(db, 'blog_posts');
    const snapshot = await getDocs(col);
    if (snapshot.empty) {
      await seedInitialBlogPosts();
      return INITIAL_BLOG_POSTS;
    }
    const items: BlogPostItem[] = [];
    snapshot.forEach(docSnap => {
      const d = docSnap.data();
      items.push({
        id: docSnap.id,
        slug: d.slug || docSnap.id,
        title: d.title || '',
        category: d.category || 'Luxury Travel',
        author: d.author || 'Vanir Editorial',
        status: d.status || 'منشورة',
        date: d.date || new Date().toISOString().split('T')[0],
        excerpt: d.excerpt || '',
        content: d.content || '',
        image: d.image || 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=85',
        readingTime: d.readingTime || 5,
      });
    });
    return items;
  } catch {
    return INITIAL_BLOG_POSTS;
  }
}

export async function saveBlogPostToFirestore(post: BlogPostItem): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  await setDoc(doc(db, 'blog_posts', post.id), {
    ...post,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

export async function deleteBlogPostFromFirestore(id: string): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  await deleteDoc(doc(db, 'blog_posts', id));
}

export async function seedInitialBlogPosts(): Promise<void> {
  if (!db) return;
  for (const post of INITIAL_BLOG_POSTS) {
    await setDoc(doc(db, 'blog_posts', post.id), {
      ...post,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  }
}

// ─────────────────────────────────────────────────────────────
// Gallery (معرض الصور والوسائط)
// ─────────────────────────────────────────────────────────────

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  url: string;
  createdAt?: string;
}

export const INITIAL_GALLERY: GalleryItem[] = [
  { id: 'g1', title: 'طائرة بومباردييه جلوبال 7500', category: 'الطيران الخاص', url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', createdAt: '2026-04-10T10:00:00Z' },
  { id: 'g2', title: 'يخت سوبر فاخر في موناكو', category: 'اليخوت', url: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?w=800', createdAt: '2026-04-09T11:00:00Z' },
  { id: 'g3', title: 'منتجع فيلات خاصة فوق الماء بالمالديف', category: 'الفنادق', url: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800', createdAt: '2026-04-08T12:00:00Z' },
  { id: 'g4', title: 'رولز رويس فانتوم أسطول فانير', category: 'الليموزين', url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800', createdAt: '2026-04-07T13:00:00Z' },
  { id: 'g5', title: 'بانوراما الأهرامات عند الغروب', category: 'الوجهات', url: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=800', createdAt: '2026-04-06T14:00:00Z' },
  { id: 'g6', title: 'أفق دبي مارينا وبرج العرب', category: 'الوجهات', url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800', createdAt: '2026-04-05T15:00:00Z' },
];

export async function fetchGalleryFromFirestore(): Promise<GalleryItem[]> {
  if (!db) return INITIAL_GALLERY;
  try {
    const snap = await getDocs(collection(db, 'gallery'));
    if (snap.empty) {
      await seedInitialGallery();
      return INITIAL_GALLERY;
    }
    const items: GalleryItem[] = [];
    snap.forEach(d => {
      const data = d.data();
      items.push({
        id: d.id,
        title: data.title || '',
        category: data.category || 'عام',
        url: data.url || '',
        createdAt: data.createdAt || '',
      });
    });
    return items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  } catch (err) {
    console.error('Error fetching gallery from Firestore:', err);
    return INITIAL_GALLERY;
  }
}

export async function saveGalleryItemToFirestore(item: GalleryItem): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  await setDoc(doc(db, 'gallery', item.id), {
    ...item,
    createdAt: item.createdAt || new Date().toISOString(),
  }, { merge: true });
}

export async function deleteGalleryItemFromFirestore(id: string): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  await deleteDoc(doc(db, 'gallery', id));
}

export async function seedInitialGallery(): Promise<void> {
  if (!db) return;
  for (const item of INITIAL_GALLERY) {
    await setDoc(doc(db, 'gallery', item.id), {
      ...item,
      createdAt: item.createdAt || new Date().toISOString(),
    }, { merge: true });
  }
}

// ─────────────────────────────────────────────────────────────
// Destinations Service
// ─────────────────────────────────────────────────────────────
export interface DestinationItem {
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

export const INITIAL_DESTINATIONS: DestinationItem[] = [
  { id: 'dest_1', name: 'دبي', country: 'الإمارات العربية المتحدة', packages: 14, hotels: 28, status: 'نشط', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600' },
  { id: 'dest_2', name: 'القاهرة والأقصر', country: 'جمهورية مصر العربية', packages: 9, hotels: 18, status: 'نشط', image: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=600' },
  { id: 'dest_3', name: 'جزر المالديف', country: 'المالديف', packages: 6, hotels: 15, status: 'نشط', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600' },
  { id: 'dest_4', name: 'موناكو والريفييرا', country: 'موناكو / فرنسا', packages: 8, hotels: 12, status: 'نشط', image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600' },
  { id: 'dest_5', name: 'سويسرا وزيورخ', country: 'سويسرا', packages: 7, hotels: 16, status: 'نشط', image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=600' },
  { id: 'dest_6', name: 'لندن', country: 'المملكة المتحدة', packages: 11, hotels: 24, status: 'نشط', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600' },
];

export async function fetchDestinationsFromFirestore(): Promise<DestinationItem[]> {
  if (!db) return INITIAL_DESTINATIONS;
  try {
    const snap = await getDocs(collection(db, 'destinations'));
    if (snap.empty) {
      await seedInitialDestinations();
      return INITIAL_DESTINATIONS;
    }
    const items: DestinationItem[] = [];
    snap.forEach(d => {
      const data = d.data();
      const img = data.image || data.imageUrl || '';
      const loc = data.country || data.location || '';
      items.push({
        id: String(d.id),
        name: data.name || '',
        country: loc,
        packages: Number(data.packages) || 5,
        hotels: Number(data.hotels) || 12,
        status: data.status || 'نشط',
        image: img,
        createdAt: typeof data.createdAt === 'string' ? data.createdAt : '',
        updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : '',
      });
    });
    return items.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  } catch (err) {
    console.error('Error fetching destinations from Firestore:', err);
    return INITIAL_DESTINATIONS;
  }
}

export async function saveDestinationToFirestore(dest: DestinationItem): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  await setDoc(doc(db, 'destinations', String(dest.id)), {
    ...dest,
    id: String(dest.id),
    name: dest.name,
    country: dest.country,
    location: dest.country,
    image: dest.image,
    imageUrl: dest.image,
    packages: Number(dest.packages) || 0,
    hotels: Number(dest.hotels) || 0,
    status: dest.status || 'نشط',
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

export async function deleteDestinationFromFirestore(id: string): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  await deleteDoc(doc(db, 'destinations', String(id)));
}

export async function seedInitialDestinations(): Promise<void> {
  if (!db) return;
  for (const item of INITIAL_DESTINATIONS) {
    await setDoc(doc(db, 'destinations', String(item.id)), {
      ...item,
      id: String(item.id),
      location: item.country,
      imageUrl: item.image,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  }
}

// ─────────────────────────────────────────────────────────────
// Offers Service
// ─────────────────────────────────────────────────────────────
export interface OfferItem {
  id: string;
  title: string;
  code: string;
  discount: string;
  target: string;
  validUntil: string;
  status: string;
  uses: number;
  image?: string;
}

export const INITIAL_OFFERS: OfferItem[] = [
  { id: 'off_1', title: 'خصم الصيف الحصري على اليخوت', code: 'YACHT2026', discount: '15%', target: 'اليخوت الفاخرة', validUntil: '2026-09-30', status: 'نشط', uses: 42 },
  { id: 'off_2', title: 'باقة شهر العسل بالمالديف', code: 'MALDIVES-VIP', discount: '20%', target: 'الفنادق والمنتجعات', validUntil: '2026-12-31', status: 'نشط', uses: 28 },
  { id: 'off_3', title: 'ترقية مجانية للطيران الخاص', code: 'JET-UPGRADE', discount: '$2,500', target: 'الطيران الخاص', validUntil: '2026-08-15', status: 'نشط', uses: 16 },
  { id: 'off_4', title: 'خصم نايل كروز VIP العائلي', code: 'NILE-ROYAL', discount: '10%', target: 'البرامج السياحية', validUntil: '2026-11-15', status: 'نشط', uses: 34 },
];

export async function fetchOffersFromFirestore(): Promise<OfferItem[]> {
  if (!db) return INITIAL_OFFERS;
  try {
    const snap = await getDocs(collection(db, 'offers'));
    if (snap.empty) {
      await seedInitialOffers();
      return INITIAL_OFFERS;
    }
    const items: OfferItem[] = [];
    snap.forEach(d => {
      const data = d.data();
      items.push({
        id: d.id,
        title: data.title || '',
        code: data.code || '',
        discount: data.discount || '',
        target: data.target || '',
        validUntil: data.validUntil || '',
        status: data.status || 'نشط',
        uses: Number(data.uses) || 0,
        image: data.image || '',
      });
    });
    return items;
  } catch (err) {
    console.error('Error fetching offers from Firestore:', err);
    return INITIAL_OFFERS;
  }
}

export async function saveOfferToFirestore(offer: OfferItem): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  await setDoc(doc(db, 'offers', offer.id), {
    ...offer,
  }, { merge: true });
}

export async function deleteOfferFromFirestore(id: string): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  await deleteDoc(doc(db, 'offers', id));
}

export async function seedInitialOffers(): Promise<void> {
  if (!db) return;
  for (const item of INITIAL_OFFERS) {
    await setDoc(doc(db, 'offers', item.id), item, { merge: true });
  }
}

// ─────────────────────────────────────────────────────────────
// Private Jets Service
// ─────────────────────────────────────────────────────────────
export const INITIAL_JETS: PrivateJet[] = [
  {
    id: '1', name: 'Bombardier Global 7500', tailNumber: 'C-GLBL',
    category: 'ultra_long_range', status: 'active',
    guestCapacity: 19, flightRange: 7700, wifiIncluded: true, bedConfiguration: 2, petFriendly: true,
    departureCity: 'Dubai', arrivalCity: 'London', hourlyRate: 18500, flatRoutePrice: 85000,
    description: 'The world’s largest and longest-range purpose-built luxury business jet. Four true living spaces including a permanent private master bedroom, en-suite stand-up shower, and full gourmet kitchen.',
    images: [
      { url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=85', label: 'Flagship Exterior & Runway', position: 'main' },
      { url: 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=1200&q=85', label: 'VIP Executive Salon Lounge', position: 'salon' },
      { url: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=1200&q=85', label: 'Master Stateroom Suite', position: 'bedroom' },
      { url: 'https://images.unsplash.com/photo-1520437358207-323b43b50729?w=1200&q=85', label: 'Gourmet In-Flight Dining', position: 'dining' },
    ],
    createdAt: '2024-11-01T10:00:00Z',
  },
  {
    id: '2', name: 'Gulfstream G650ER', tailNumber: 'N650GV',
    category: 'ultra_long_range', status: 'active',
    guestCapacity: 16, flightRange: 7500, wifiIncluded: true, bedConfiguration: 2, petFriendly: true,
    departureCity: 'Paris', arrivalCity: 'New York', hourlyRate: 16800, flatRoutePrice: 78000,
    description: 'Iconic ultra-long-range luxury jet capable of flying non-stop from Cairo or Dubai to London, New York, or Tokyo. Handcrafted leather club seats and private master stateroom.',
    images: [
      { url: 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=1200&q=85', label: 'Gulfstream Exterior', position: 'main' },
      { url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=85', label: 'VIP Club Seating', position: 'salon' },
      { url: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=1200&q=85', label: 'Stateroom Divan', position: 'bedroom' },
      { url: 'https://images.unsplash.com/photo-1520437358207-323b43b50729?w=1200&q=85', label: 'Executive Bar & Service', position: 'dining' },
    ],
    createdAt: '2024-10-15T08:30:00Z',
  },
  {
    id: '3', name: 'Dassault Falcon 8X', tailNumber: 'F-HFAL',
    category: 'heavy', status: 'active',
    guestCapacity: 14, flightRange: 6450, wifiIncluded: true, bedConfiguration: 1, petFriendly: true,
    departureCity: 'Cairo', arrivalCity: 'London', hourlyRate: 14500, flatRoutePrice: 52000,
    description: 'Tri-jet performance and unparalleled peace of mind over oceans. Special steep-approach certification for landing directly at Aspen, London City, and St. Moritz.',
    images: [
      { url: 'https://images.unsplash.com/photo-1520437358207-323b43b50729?w=1200&q=85', label: 'Tri-Jet Falcon 8X', position: 'main' },
      { url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=85', label: 'Silent Acoustic Cabin', position: 'salon' },
      { url: 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=1200&q=85', label: 'Private Suite', position: 'bedroom' },
      { url: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=1200&q=85', label: 'Gourmet Galley', position: 'dining' },
    ],
    createdAt: '2024-09-22T12:00:00Z',
  },
  {
    id: '4', name: 'Cessna Citation Longitude', tailNumber: 'N700CL',
    category: 'super_midsize', status: 'active',
    guestCapacity: 12, flightRange: 3500, wifiIncluded: true, bedConfiguration: 0, petFriendly: true,
    departureCity: 'Riyadh', arrivalCity: 'Dubai', hourlyRate: 8500, flatRoutePrice: 22000,
    description: 'Ultra-efficient super-midsize business jet with whisper-quiet cabin acoustics, fully flat club seats, and class-leading baggage capacity.',
    images: [
      { url: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=1200&q=85', label: 'Citation Longitude', position: 'main' },
      { url: 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=1200&q=85', label: 'Executive Club Lounge', position: 'salon' },
      { url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=85', label: 'Panoramic Windows', position: 'bedroom' },
      { url: 'https://images.unsplash.com/photo-1520437358207-323b43b50729?w=1200&q=85', label: 'Avionics & Flight Deck', position: 'dining' },
    ],
    createdAt: '2024-08-10T09:00:00Z',
  },
];

export async function fetchJetsFromFirestore(): Promise<PrivateJet[]> {
  if (!db) return INITIAL_JETS;
  try {
    const snap = await getDocs(collection(db, 'jets'));
    if (snap.empty) {
      await seedInitialJets();
      return INITIAL_JETS;
    }
    const items: PrivateJet[] = [];
    snap.forEach(d => {
      const data = d.data();
      items.push({
        id: String(d.id),
        name: data.name || '',
        tailNumber: data.tailNumber || '',
        category: data.category || 'super_midsize',
        status: data.status || 'active',
        guestCapacity: Number(data.guestCapacity) || 0,
        flightRange: Number(data.flightRange) || 0,
        wifiIncluded: Boolean(data.wifiIncluded),
        bedConfiguration: Number(data.bedConfiguration) || 0,
        petFriendly: Boolean(data.petFriendly),
        departureCity: data.departureCity || '',
        arrivalCity: data.arrivalCity || '',
        hourlyRate: Number(data.hourlyRate) || 0,
        flatRoutePrice: Number(data.flatRoutePrice) || 0,
        description: data.description || '',
        images: Array.isArray(data.images) ? data.images : [],
        createdAt: data.createdAt || new Date().toISOString(),
      });
    });
    return items;
  } catch (err) {
    console.error('Error fetching jets from Firestore:', err);
    return INITIAL_JETS;
  }
}

export async function fetchJetByIdFromFirestore(id: string): Promise<PrivateJet | null> {
  if (!db) return INITIAL_JETS.find(j => j.id === id) || null;
  try {
    const snap = await getDoc(doc(db, 'jets', String(id)));
    if (snap.exists()) {
      const data = snap.data();
      return {
        id: snap.id,
        name: data.name || '',
        tailNumber: data.tailNumber || '',
        category: data.category || 'super_midsize',
        status: data.status || 'active',
        guestCapacity: Number(data.guestCapacity) || 0,
        flightRange: Number(data.flightRange) || 0,
        wifiIncluded: Boolean(data.wifiIncluded),
        bedConfiguration: Number(data.bedConfiguration) || 0,
        petFriendly: Boolean(data.petFriendly),
        departureCity: data.departureCity || '',
        arrivalCity: data.arrivalCity || '',
        hourlyRate: Number(data.hourlyRate) || 0,
        flatRoutePrice: Number(data.flatRoutePrice) || 0,
        description: data.description || '',
        images: Array.isArray(data.images) ? data.images : [],
        createdAt: data.createdAt || new Date().toISOString(),
      };
    }
    return INITIAL_JETS.find(j => j.id === id) || null;
  } catch {
    return INITIAL_JETS.find(j => j.id === id) || null;
  }
}

export async function saveJetToFirestore(jet: PrivateJet): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  await setDoc(doc(db, 'jets', String(jet.id)), {
    ...jet,
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  // Sync to app_config/home_feed for featured jet
  try {
    const feedSnap = await getDoc(doc(db, 'app_config', 'home_feed'));
    if (feedSnap.exists() && Array.isArray(feedSnap.data()?.cards)) {
      const cards: HomeFeedCard[] = feedSnap.data()?.cards;
      let changed = false;
      const imgUrls = (jet.images?.map(i => i.url) || []).filter(Boolean);
      const primaryImg = imgUrls[0] || '';
      const updatedCards = cards.map(c => {
        if (c.id === 'f7' || c.category === 'jets') {
          changed = true;
          return {
            ...c,
            title: jet.name || c.title,
            subtitle: `${jet.guestCapacity || 19} VIP Seats • ${jet.flightRange || 7500} nm Range`,
            price: `$${(jet.hourlyRate || 18500).toLocaleString()}/hr`,
            image: primaryImg || c.image,
            images: imgUrls.length > 0 ? imgUrls : (c.images || [primaryImg || c.image]),
            routeTarget: 'JetDetails',
            routeParams: {
              jetId: String(jet.id),
              jetName: jet.name,
              category: jet.category,
              range: `${jet.flightRange || 7500} nm`,
              pax: `${jet.guestCapacity || 19} VIP Seats`,
              price: `$${(jet.hourlyRate || 18500).toLocaleString()}/hr`,
              image: primaryImg || c.image,
              images: imgUrls.length > 0 ? imgUrls : (c.images || [primaryImg || c.image]),
              description: jet.description,
            },
          };
        }
        return c;
      });
      if (changed) {
        await saveFeedCardsToFirestore(updatedCards);
      }
    }
  } catch (err) {
    console.warn('Failed to sync jet to home feed cards:', err);
  }
}

export async function deleteJetFromFirestore(id: string): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  await deleteDoc(doc(db, 'jets', String(id)));
}

export async function seedInitialJets(): Promise<void> {
  if (!db) return;
  for (const item of INITIAL_JETS) {
    await setDoc(doc(db, 'jets', item.id), item, { merge: true });
  }
}

// ─────────────────────────────────────────────────────────────
// Luxury Yachts Service
// ─────────────────────────────────────────────────────────────
export const INITIAL_YACHTS: LuxuryYacht[] = [
  {
    id: '1', name: 'Azure Empress', builder: 'Feadship', marinaLocation: 'Dubai Marina',
    status: 'active',
    lengthFt: 164, cabins: 6, guestCapacity: 12, crewSize: 14, jacuzzi: true, helipad: true,
    dailyRate: 65000, weeklyRate: 390000,
    description: 'Award-winning superyacht with helipad and beach club.',
    images: [{ url: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?w=1200&q=85', label: 'Azure Empress', position: 'main' }],
    createdAt: '2024-10-01T09:00:00Z',
  },
  {
    id: '2', name: 'Pearl of the Gulf', builder: 'Lürssen', marinaLocation: 'Abu Dhabi',
    status: 'active',
    lengthFt: 246, cabins: 10, guestCapacity: 20, crewSize: 26, jacuzzi: true, helipad: true,
    dailyRate: 120000, weeklyRate: 720000,
    description: 'Flagship superyacht with full spa and cinema.',
    images: [{ url: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1200&q=85', label: 'Pearl of the Gulf', position: 'main' }],
    createdAt: '2024-09-10T11:00:00Z',
  },
  {
    id: '3', name: 'Ivory Wave', builder: 'Sunseeker', marinaLocation: 'Monaco',
    status: 'draft',
    lengthFt: 95, cabins: 4, guestCapacity: 8, crewSize: 6, jacuzzi: true, helipad: false,
    dailyRate: 28000, weeklyRate: 168000,
    description: 'Sleek motor yacht ideal for Mediterranean day charters.',
    images: [{ url: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?w=1200&q=85', label: 'Ivory Wave', position: 'main' }],
    createdAt: '2024-08-15T08:00:00Z',
  },
  {
    id: '4', name: 'Horizon Star', builder: 'Benetti', marinaLocation: 'Maldives',
    status: 'active',
    lengthFt: 131, cabins: 5, guestCapacity: 10, crewSize: 11, jacuzzi: true, helipad: false,
    dailyRate: 48000, weeklyRate: 290000,
    description: 'Custom-built Benetti with tropical interior design.',
    images: [{ url: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1200&q=85', label: 'Horizon Star', position: 'main' }],
    createdAt: '2024-07-20T10:00:00Z',
  },
];

export async function fetchYachtsFromFirestore(): Promise<LuxuryYacht[]> {
  if (!db) return INITIAL_YACHTS;
  try {
    const snap = await getDocs(collection(db, 'yachts'));
    if (snap.empty) {
      await seedInitialYachts();
      return INITIAL_YACHTS;
    }
    const items: LuxuryYacht[] = [];
    snap.forEach(d => {
      const data = d.data();
      items.push({
        id: String(d.id),
        name: data.name || '',
        builder: data.builder || '',
        marinaLocation: data.marinaLocation || '',
        status: data.status || 'active',
        lengthFt: Number(data.lengthFt) || 0,
        cabins: Number(data.cabins) || 0,
        guestCapacity: Number(data.guestCapacity) || 0,
        crewSize: Number(data.crewSize) || 0,
        jacuzzi: Boolean(data.jacuzzi),
        helipad: Boolean(data.helipad),
        dailyRate: Number(data.dailyRate) || 0,
        weeklyRate: Number(data.weeklyRate) || 0,
        description: data.description || '',
        images: Array.isArray(data.images) ? data.images : [],
        createdAt: data.createdAt || new Date().toISOString(),
      });
    });
    return items;
  } catch (err) {
    console.error('Error fetching yachts from Firestore:', err);
    return INITIAL_YACHTS;
  }
}

export async function fetchYachtByIdFromFirestore(id: string): Promise<LuxuryYacht | null> {
  if (!db) return INITIAL_YACHTS.find(y => y.id === id) || null;
  try {
    const snap = await getDoc(doc(db, 'yachts', String(id)));
    if (snap.exists()) {
      const data = snap.data();
      return {
        id: snap.id,
        name: data.name || '',
        builder: data.builder || '',
        marinaLocation: data.marinaLocation || '',
        status: data.status || 'active',
        lengthFt: Number(data.lengthFt) || 0,
        cabins: Number(data.cabins) || 0,
        guestCapacity: Number(data.guestCapacity) || 0,
        crewSize: Number(data.crewSize) || 0,
        jacuzzi: Boolean(data.jacuzzi),
        helipad: Boolean(data.helipad),
        dailyRate: Number(data.dailyRate) || 0,
        weeklyRate: Number(data.weeklyRate) || 0,
        description: data.description || '',
        images: Array.isArray(data.images) ? data.images : [],
        createdAt: data.createdAt || new Date().toISOString(),
      };
    }
    return INITIAL_YACHTS.find(y => y.id === id) || null;
  } catch {
    return INITIAL_YACHTS.find(y => y.id === id) || null;
  }
}

export async function saveYachtToFirestore(yacht: LuxuryYacht): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  await setDoc(doc(db, 'yachts', String(yacht.id)), {
    ...yacht,
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  // Sync to app_config/home_feed for featured yacht
  try {
    const feedSnap = await getDoc(doc(db, 'app_config', 'home_feed'));
    if (feedSnap.exists() && Array.isArray(feedSnap.data()?.cards)) {
      const cards: HomeFeedCard[] = feedSnap.data()?.cards;
      let changed = false;
      const imgUrls = (yacht.images?.map(i => i.url) || []).filter(Boolean);
      const primaryImg = imgUrls[0] || '';
      const updatedCards = cards.map(c => {
        if (c.id === 'f5' || c.category === 'yachts') {
          changed = true;
          return {
            ...c,
            title: yacht.vesselName || c.title,
            subtitle: yacht.marinaLocation || c.subtitle,
            price: `$${(yacht.dailyCharterRate || yacht.dailyRate || 1500).toLocaleString()}/hr`,
            image: primaryImg || c.image,
            images: imgUrls.length > 0 ? imgUrls : (c.images || [primaryImg || c.image]),
            routeTarget: 'YachtDetails',
            routeParams: {
              yachtId: String(yacht.id),
              yachtName: yacht.vesselName,
              location: yacht.marinaLocation,
              price: `$${(yacht.dailyCharterRate || yacht.dailyRate || 1500).toLocaleString()}/hr`,
              image: primaryImg || c.image,
              images: imgUrls.length > 0 ? imgUrls : (c.images || [primaryImg || c.image]),
              description: yacht.description,
            },
          };
        }
        return c;
      });
      if (changed) {
        await saveFeedCardsToFirestore(updatedCards);
      }
    }
  } catch (e) {
    console.warn('Could not sync yacht to home_feed:', e);
  }
}

export async function deleteYachtFromFirestore(id: string): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  await deleteDoc(doc(db, 'yachts', String(id)));
}

export async function seedInitialYachts(): Promise<void> {
  if (!db) return;
  for (const item of INITIAL_YACHTS) {
    await setDoc(doc(db, 'yachts', item.id), item, { merge: true });
  }
}

// ─────────────────────────────────────────────────────────────
// VIP Transfers Service
// ─────────────────────────────────────────────────────────────
export const INITIAL_TRANSFERS: VIPTransfer[] = [
  {
    id: '1', vehicleMakeModel: 'Rolls-Royce Phantom VIII', category: 'sedan', status: 'active',
    passengerCapacity: 4, luggageCapacity: 3, armored: false, englishChauffeur: true,
    hourlyRate: 800, airportTransferRate: 1200,
    description: 'The pinnacle of luxury motoring with hand-crafted Starlight Headliner.',
    images: [{ url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=85', label: 'Rolls-Royce Phantom', position: 'main' }],
    createdAt: '2024-10-01T09:00:00Z',
  },
  {
    id: '2', vehicleMakeModel: 'Mercedes-Maybach S680', category: 'sedan', status: 'active',
    passengerCapacity: 4, luggageCapacity: 3, armored: true, englishChauffeur: true,
    hourlyRate: 650, airportTransferRate: 950,
    description: 'Executive sedan with massage seats and Burmester 3D audio.',
    images: [{ url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=85', label: 'Maybach S680', position: 'main' }],
    createdAt: '2024-09-15T10:00:00Z',
  },
  {
    id: '3', vehicleMakeModel: 'Bentley Bentayga EWB', category: 'suv', status: 'active',
    passengerCapacity: 4, luggageCapacity: 6, armored: false, englishChauffeur: true,
    hourlyRate: 700, airportTransferRate: 1100,
    description: 'Ultra-luxury SUV with panoramic sunroof and rear entertainment.',
    images: [{ url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=85', label: 'Bentley Bentayga', position: 'main' }],
    createdAt: '2024-08-20T11:00:00Z',
  },
  {
    id: '4', vehicleMakeModel: 'Mercedes-Benz V-Class VIP', category: 'van', status: 'draft',
    passengerCapacity: 7, luggageCapacity: 10, armored: false, englishChauffeur: true,
    hourlyRate: 450, airportTransferRate: 700,
    description: 'Spacious VIP van ideal for group airport transfers and city tours.',
    images: [{ url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=85', label: 'V-Class VIP', position: 'main' }],
    createdAt: '2024-07-10T08:00:00Z',
  },
];

export async function fetchTransfersFromFirestore(): Promise<VIPTransfer[]> {
  if (!db) return INITIAL_TRANSFERS;
  try {
    const snap = await getDocs(collection(db, 'transfers'));
    if (snap.empty) {
      await seedInitialTransfers();
      return INITIAL_TRANSFERS;
    }
    const items: VIPTransfer[] = [];
    snap.forEach(d => {
      const data = d.data();
      items.push({
        id: String(d.id),
        vehicleMakeModel: data.vehicleMakeModel || '',
        category: data.category || 'sedan',
        status: data.status || 'active',
        passengerCapacity: Number(data.passengerCapacity) || 0,
        luggageCapacity: Number(data.luggageCapacity) || 0,
        armored: Boolean(data.armored),
        englishChauffeur: Boolean(data.englishChauffeur),
        hourlyRate: Number(data.hourlyRate) || 0,
        airportTransferRate: Number(data.airportTransferRate) || 0,
        description: data.description || '',
        images: Array.isArray(data.images) ? data.images : [],
        createdAt: data.createdAt || new Date().toISOString(),
      });
    });
    return items;
  } catch (err) {
    console.error('Error fetching transfers from Firestore:', err);
    return INITIAL_TRANSFERS;
  }
}

export async function fetchTransferByIdFromFirestore(id: string): Promise<VIPTransfer | null> {
  if (!db) return INITIAL_TRANSFERS.find(t => t.id === id) || null;
  try {
    const snap = await getDoc(doc(db, 'transfers', String(id)));
    if (snap.exists()) {
      const data = snap.data();
      return {
        id: snap.id,
        vehicleMakeModel: data.vehicleMakeModel || '',
        category: data.category || 'sedan',
        status: data.status || 'active',
        passengerCapacity: Number(data.passengerCapacity) || 0,
        luggageCapacity: Number(data.luggageCapacity) || 0,
        armored: Boolean(data.armored),
        englishChauffeur: Boolean(data.englishChauffeur),
        hourlyRate: Number(data.hourlyRate) || 0,
        airportTransferRate: Number(data.airportTransferRate) || 0,
        description: data.description || '',
        images: Array.isArray(data.images) ? data.images : [],
        createdAt: data.createdAt || new Date().toISOString(),
      };
    }
    return INITIAL_TRANSFERS.find(t => t.id === id) || null;
  } catch {
    return INITIAL_TRANSFERS.find(t => t.id === id) || null;
  }
}

export async function saveTransferToFirestore(transfer: VIPTransfer): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  await setDoc(doc(db, 'transfers', String(transfer.id)), {
    ...transfer,
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  // Sync to app_config/home_feed for featured car
  try {
    const feedSnap = await getDoc(doc(db, 'app_config', 'home_feed'));
    if (feedSnap.exists() && Array.isArray(feedSnap.data()?.cards)) {
      const cards: HomeFeedCard[] = feedSnap.data()?.cards;
      let changed = false;
      const imgUrls = (transfer.images?.map(i => i.url) || []).filter(Boolean);
      const primaryImg = imgUrls[0] || '';
      const updatedCards = cards.map(c => {
        if (c.id === 'f4' || c.category === 'cars') {
          changed = true;
          return {
            ...c,
            title: transfer.vehicleMakeModel || c.title,
            subtitle: `${(transfer.category || 'SEDAN').toUpperCase()} • Uniformed Chauffeur`,
            price: `$${transfer.airportTransferRate || transfer.hourlyRate || 350}`,
            image: primaryImg || c.image,
            images: imgUrls.length > 0 ? imgUrls : (c.images || [primaryImg || c.image]),
            routeTarget: 'CarDetails',
            routeParams: {
              carId: String(transfer.id),
              carName: transfer.vehicleMakeModel,
              category: transfer.category,
              location: `${(transfer.category || 'SEDAN').toUpperCase()} • Uniformed Chauffeur`,
              price: `$${transfer.airportTransferRate || transfer.hourlyRate || 350}`,
              image: primaryImg || c.image,
              images: imgUrls.length > 0 ? imgUrls : (c.images || [primaryImg || c.image]),
              description: transfer.description,
            },
          };
        }
        return c;
      });
      if (changed) {
        await saveFeedCardsToFirestore(updatedCards);
      }
    }
  } catch (e) {
    console.warn('Could not sync transfer to home_feed:', e);
  }
}

export async function deleteTransferFromFirestore(id: string): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  await deleteDoc(doc(db, 'transfers', String(id)));
}

export async function seedInitialTransfers(): Promise<void> {
  if (!db) return;
  for (const item of INITIAL_TRANSFERS) {
    await setDoc(doc(db, 'transfers', item.id), item, { merge: true });
  }
}

// ─────────────────────────────────────────────────────────────
// Luxury Packages Service
// ─────────────────────────────────────────────────────────────
export const INITIAL_PACKAGES: LuxuryPackage[] = [
  {
    id: '1',
    name: 'رحلة دهبية النيل الملكية الخاصة',
    destination: 'الأقصر وأسوان، مصر 🇪🇬',
    durationNights: 7,
    maxVipGuests: 8,
    includedServices: 'دهبية خاصة، مرشد عالم مصريات، طاهٍ خاص، وتصاريح دخول المعابد الحصرية',
    pricePerPerson: 12500,
    latitude: 25.6872,
    longitude: 32.6396,
    status: 'active',
    description: 'رحلة نيلية تاريخية فاخرة خاصة بالكامل على متن دهبية شراعية مصممة على الطراز الخديوي الملكي.',
    images: [{ url: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=1200&q=85', label: 'دهبية النيل الملكية', position: 'main' }],
    createdAt: '2024-10-01T09:00:00Z',
  },
  {
    id: '2',
    name: 'ملاذ الريفييرا الفرنسية وموناكو',
    destination: 'كان وموناكو، فرنسا 🇫🇷',
    durationNights: 5,
    maxVipGuests: 6,
    includedServices: 'فيلا خاصة مطلة على البحر، يخت يومي، وسائق مايباخ خاص طوال الإقامة',
    pricePerPerson: 18000,
    latitude: 43.7384,
    longitude: 7.4246,
    status: 'active',
    description: 'تجربة النخبة الأوروبية في الريفييرا الفرنسية مع إقامة فارهة وتنقلات بحرية خاصة.',
    images: [{ url: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?w=1200&q=85', label: 'موناكو والريفييرا', position: 'main' }],
    createdAt: '2024-09-15T10:00:00Z',
  },
  {
    id: '3',
    name: 'أسبوع الألب السويسري الفاخر',
    destination: 'زيرمات وسانت موريتز، سويسرا 🇨🇭',
    durationNights: 6,
    maxVipGuests: 10,
    includedServices: 'شاليه خاص 5 نجوم، طائرة هليكوبتر خاصة، ومعدات تزلج VIP',
    pricePerPerson: 22000,
    latitude: 45.9765,
    longitude: 7.7491,
    status: 'active',
    description: 'قمة الرفاهية بين جبال الألب السويسرية في شاليهات خشبية فارهة مع إطلالات ساحرة على الماترهورن.',
    images: [{ url: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1200&q=85', label: 'الألب السويسري', position: 'main' }],
    createdAt: '2024-08-20T11:00:00Z',
  },
];

export async function fetchPackagesFromFirestore(): Promise<LuxuryPackage[]> {
  if (!db) return INITIAL_PACKAGES;
  try {
    const snap = await getDocs(collection(db, 'packages'));
    if (snap.empty) {
      await seedInitialPackages();
      return INITIAL_PACKAGES;
    }
    const items: LuxuryPackage[] = [];
    snap.forEach(d => {
      const data = d.data();
      items.push({
        id: String(d.id),
        name: data.name || '',
        destination: data.destination || '',
        durationNights: Number(data.durationNights) || 0,
        maxVipGuests: Number(data.maxVipGuests) || 0,
        includedServices: data.includedServices || '',
        pricePerPerson: Number(data.pricePerPerson) || 0,
        latitude: typeof data.latitude === 'number' ? data.latitude : 0,
        longitude: typeof data.longitude === 'number' ? data.longitude : 0,
        status: data.status || 'active',
        description: data.description || '',
        images: Array.isArray(data.images) ? data.images : [],
        createdAt: data.createdAt || new Date().toISOString(),
      });
    });
    return items;
  } catch (err) {
    console.error('Error fetching packages from Firestore:', err);
    return INITIAL_PACKAGES;
  }
}

export async function fetchPackageByIdFromFirestore(id: string): Promise<LuxuryPackage | null> {
  if (!db) return INITIAL_PACKAGES.find(p => p.id === id) || null;
  try {
    const snap = await getDoc(doc(db, 'packages', String(id)));
    if (snap.exists()) {
      const data = snap.data();
      return {
        id: snap.id,
        name: data.name || '',
        destination: data.destination || '',
        durationNights: Number(data.durationNights) || 0,
        maxVipGuests: Number(data.maxVipGuests) || 0,
        includedServices: data.includedServices || '',
        pricePerPerson: Number(data.pricePerPerson) || 0,
        latitude: typeof data.latitude === 'number' ? data.latitude : 0,
        longitude: typeof data.longitude === 'number' ? data.longitude : 0,
        status: data.status || 'active',
        description: data.description || '',
        images: Array.isArray(data.images) ? data.images : [],
        createdAt: data.createdAt || new Date().toISOString(),
      };
    }
    return INITIAL_PACKAGES.find(p => p.id === id) || null;
  } catch {
    return INITIAL_PACKAGES.find(p => p.id === id) || null;
  }
}

export async function savePackageToFirestore(pkg: LuxuryPackage): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  await setDoc(doc(db, 'packages', String(pkg.id)), {
    ...pkg,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

export async function deletePackageFromFirestore(id: string): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  await deleteDoc(doc(db, 'packages', String(id)));
}

export async function seedInitialPackages(): Promise<void> {
  if (!db) return;
  for (const item of INITIAL_PACKAGES) {
    await setDoc(doc(db, 'packages', item.id), item, { merge: true });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic Backend: User Profiles & VIP Members Management (CRM)
// ─────────────────────────────────────────────────────────────────────────────

export const INITIAL_USERS: User[] = [
  {
    id: 'default_vip_user',
    name: 'صاحب السمو الملكي (VIP Member)',
    email: 'vip.guest@vanir.luxury',
    phone: '+971 50 888 9999',
    tier: 'royal',
    memberId: 'VN-0042',
    walletBalance: 15000,
    coins: 1500,
    isVerified: true,
    status: 'active',
    totalBookings: 34,
    totalSpend: 1420000,
    currency: 'USD',
    lastActive: '2026-04-18',
    joinedAt: '2024-01-10',
    preferredDestinations: ['دبي', 'الريفييرا الفرنسية', 'المالديف'],
    assignedConcierge: 'صوفيا د. (Chief Concierge)',
  },
  {
    id: 'user_2',
    name: 'فيكتوريا وورثينجتون',
    email: 'v.worthington@vc.com',
    phone: '+44 20 7946 0912',
    tier: 'ultra',
    memberId: 'VN-0088',
    walletBalance: 85000,
    coins: 8500,
    isVerified: true,
    status: 'active',
    totalBookings: 23,
    totalSpend: 680000,
    currency: 'USD',
    lastActive: '2026-04-15',
    joinedAt: '2024-02-14',
    preferredDestinations: ['باريس', 'موناكو', 'الأقصر'],
    assignedConcierge: 'ماركو أ.',
  },
  {
    id: 'user_3',
    name: 'ديمتري فولكونسكي',
    email: 'd.volkonsky@invest.ch',
    phone: '+41 22 555 0199',
    tier: 'ultra',
    memberId: 'VN-0105',
    walletBalance: 120000,
    coins: 12000,
    isVerified: true,
    status: 'active',
    totalBookings: 61,
    totalSpend: 4200000,
    currency: 'USD',
    lastActive: '2026-04-11',
    joinedAt: '2023-07-22',
    preferredDestinations: ['المالديف', 'زيورخ', 'سيشل'],
    assignedConcierge: 'صوفيا د.',
  },
  {
    id: 'user_4',
    name: 'بريا ميهتا',
    email: 'p.mehta@titan.in',
    phone: '+91 22 2655 4000',
    tier: 'elite',
    memberId: 'VN-0214',
    walletBalance: 45000,
    coins: 4500,
    isVerified: true,
    status: 'active',
    totalBookings: 18,
    totalSpend: 420000,
    currency: 'USD',
    lastActive: '2026-04-05',
    joinedAt: '2024-06-14',
    preferredDestinations: ['مصر', 'الأردن', 'المغرب'],
    assignedConcierge: 'ماركو أ.',
  },
];

export async function fetchUsersFromFirestore(): Promise<User[]> {
  if (!db) return INITIAL_USERS;
  try {
    const q = query(collection(db, 'users'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const u of INITIAL_USERS) {
        await setDoc(doc(db, 'users', u.id), u);
      }
      return INITIAL_USERS;
    }
    return snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name || data.displayName || 'VIP Member',
        email: data.email || '',
        phone: data.phone || '',
        avatar: data.avatar || '',
        tier: data.tier ? data.tier.toLowerCase().replace(' tier', '') : 'royal',
        memberId: data.memberId || 'VN-0042',
        walletBalance: typeof data.walletBalance === 'number' ? data.walletBalance : 15000,
        coins: typeof data.coins === 'number' ? data.coins : 1500,
        isVerified: data.isVerified !== false,
        status: data.status || 'active',
        totalBookings: typeof data.totalBookings === 'number' ? data.totalBookings : 12,
        totalSpend: typeof data.totalSpend === 'number' ? data.totalSpend : 150000,
        currency: data.currency || 'USD',
        lastActive: data.lastActive || new Date().toISOString().split('T')[0],
        joinedAt: data.joinedAt || '2024-01-01',
        preferredDestinations: Array.isArray(data.preferredDestinations) ? data.preferredDestinations : ['دبي'],
        assignedConcierge: data.assignedConcierge || 'صوفيا د.',
      } as User;
    });
  } catch (err) {
    console.warn('Failed to fetch users from Firestore:', err);
    return INITIAL_USERS;
  }
}

export async function saveUserToFirestore(user: Partial<User> & { id: string }): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  try {
    const ref = doc(db, 'users', user.id);
    // Format tier to match both mobile app ('ROYAL TIER') and admin ('royal')
    let tierString = user.tier ? user.tier.toUpperCase() : 'ROYAL TIER';
    if (!tierString.includes('TIER') && tierString !== 'ULTRA' && tierString !== 'STANDARD') {
      tierString = `${tierString} TIER`;
    }

    await setDoc(
      ref,
      {
        ...user,
        displayName: user.name,
        tier: tierString,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );
  } catch (err) {
    console.error('Failed to save user to Firestore:', err);
    throw err;
  }
}

export async function deleteUserFromFirestore(id: string): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  try {
    await deleteDoc(doc(db, 'users', id));
  } catch (err) {
    console.error('Failed to delete user from Firestore:', err);
    throw err;
  }
}

// ============================================================================
// BOOKINGS MANAGEMENT (مزامنة حجوزات تطبيق الهاتف مع لوحة التحكم)
// ============================================================================

export async function fetchBookingsFromFirestore(): Promise<Booking[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(collection(db, 'bookings'));
    if (snap.empty) return [];
    const items: Booking[] = [];
    snap.forEach(d => {
      const data = d.data();
      const code = data.confirmationCode || `VNR-${d.id.slice(0, 7).toUpperCase()}`;
      const name = data.guestName || data.clientName || data.userName || 'VIP Guest';
      const email = data.guestEmail || data.email || data.userEmail || 'guest@vanir.vip';
      const prop = data.propertyName || data.hotelName || data.vehicleOrVesselName || data.airline || data.itemName || 'VIP Travel Service';
      const dest = data.destination || data.destinationCity || 'Global';
      const rawCat = (data.category || data.type || 'hotel').toLowerCase();
      const validCat = ['hotel', 'flight', 'car', 'experience'].includes(rawCat) ? rawCat : 'hotel';
      const checkIn = data.checkIn || data.checkInDate || data.startDate || new Date().toISOString().slice(0, 10);
      const checkOut = data.checkOut || data.checkOutDate || data.endDate || checkIn;
      const amount = Number(data.totalAmount || data.totalAmountPaid || data.price || 1200);

      items.push({
        id: d.id,
        confirmationCode: code,
        guestName: name,
        guestEmail: email,
        category: validCat as any,
        propertyName: prop,
        destination: dest,
        checkIn,
        checkOut,
        guests: Number(data.guests || data.guestsCount || 1),
        totalAmount: amount,
        currency: data.currency || 'USD',
        status: (data.status || 'pending').toLowerCase() as any,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString(),
        specialRequests: data.specialRequests || '',
      });
    });
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error('Failed to fetch bookings from Firestore:', err);
    return [];
  }
}

export async function updateBookingStatusInFirestore(id: string, status: any): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  await setDoc(doc(db, 'bookings', id), { status, updatedAt: new Date().toISOString() }, { merge: true });
}

// ============================================================================
// INTERACTIVE LIFESTYLE SERVICES & EXPERIENCES (lifestyle_services collection)
// Synced in real time with src/components/InteractiveServicesSection.tsx
// ============================================================================

export interface LifestyleServicePackageAdmin {
  id: string;
  title: string;
  description: string;
  price: string;
  unit: string;
  image: string;
}

export interface LifestyleServiceAdminItem {
  id: string;
  serviceCategoryKey: 'chef' | 'photography' | 'massage' | 'makeup' | 'training' | 'car' | 'experiences' | 'homes';
  title: string;
  subtitle: string;
  description: string;
  hostName: string;
  hostRole: string;
  hostBadgeText: string;
  hostBadgeColor: string;
  deliveryNote: string;
  priceFrom: string;
  originalPrice?: string;
  priceUnit: string;
  rating: number;
  reviewsCount: number;
  badge?: string;
  coverImage: string;
  packages: LifestyleServicePackageAdmin[];
  status?: 'active' | 'draft';
  updatedAt?: string;
}

export const INITIAL_LIFESTYLE_SERVICES: LifestyleServiceAdminItem[] = [
  // ── PHOTOGRAPHY ──
  {
    id: 'prov-ayman-photo',
    serviceCategoryKey: 'photography',
    title: 'Iconic Portrait Session by Ayman Dakroury',
    subtitle: 'Hosted by Ayman • Master Photographer in Cairo',
    description:
      'Capture your unforgettable time in Egypt through a private, editorial-grade portrait session at the Great Pyramids of Giza & Sphinx. Includes creative posing direction, golden-hour lighting, and professionally retouched high-resolution photographs.',
    hostName: 'Ayman Dakroury',
    hostRole: 'Master Photographer in Cairo',
    hostBadgeText: 'AD',
    hostBadgeColor: '#EA580C',
    deliveryNote: 'Delivered at the Pyramids or your residence',
    priceFrom: '$220',
    priceUnit: '/ guest',
    rating: 4.98,
    reviewsCount: 164,
    badge: 'Top Rated',
    coverImage: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=1200&q=85',
    packages: [
      {
        id: 'pkg-pyramids-sphinx',
        title: 'Pyramids & Great Sphinx Portrait Session',
        description: 'Document your time in Egypt through an exclusive private shoot inside the Giza Plateau.',
        price: '$220',
        unit: '/ guest',
        image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c0e?w=600&q=85',
      },
      {
        id: 'pkg-couples-sunset',
        title: 'Royal Couples Golden-Hour Session',
        description: 'Romantic sunset photography session overlooking Khufu & Khafre with 45 retouched shots.',
        price: '$310',
        unit: '/ couple',
        image: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=600&q=85',
      },
      {
        id: 'pkg-group-editorial',
        title: 'VIP Family & Group Editorial Shoot',
        description: 'Full 2-hour multi-location session with private luxury SUV transfer between viewpoints.',
        price: '$450',
        unit: '/ group',
        image: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=600&q=85',
      },
    ],
    status: 'active',
  },
  {
    id: 'prov-abdul-horse',
    serviceCategoryKey: 'photography',
    title: 'Dreamy Horseback Photoshoot at Giza Pyramids',
    subtitle: 'Hosted by AbdulRahman • Equestrian & Action Photographer',
    description:
      'Experience the majesty of purebred Arabian horses against the timeless backdrop of the Giza Pyramids. Perfect for dramatic action portraits and cinematic reels.',
    hostName: 'AbdulRahman',
    hostRole: 'Equestrian & Action Photographer',
    hostBadgeText: 'AR',
    hostBadgeColor: '#0E2442',
    deliveryNote: 'Meet at Giza Panorama Desert Gate',
    priceFrom: '$185',
    priceUnit: '/ guest',
    rating: 4.96,
    reviewsCount: 118,
    badge: 'Popular',
    coverImage: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=1200&q=85',
    packages: [
      {
        id: 'pkg-arabian-stallion',
        title: 'Sunrise Arabian Stallion Shoot',
        description: '1-hour guided desert ride with 30 high-speed action portraits & 4K drone reel.',
        price: '$185',
        unit: '/ guest',
        image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=600&q=85',
      },
      {
        id: 'pkg-royal-caravan',
        title: 'Private Sunset Desert Caravan Portfolio',
        description: '90-minute golden hour session with wardrobe styling and 60 edited photos.',
        price: '$290',
        unit: '/ guest',
        image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&q=85',
      },
    ],
    status: 'active',
  },
  {
    id: 'prov-mostafa-portrait',
    serviceCategoryKey: 'photography',
    title: 'Atmospheric Old Cairo & Nile Editorial Portraits',
    subtitle: 'Hosted by Mostafa • Fine Art & Street Portraitist',
    description:
      'Stroll through historic Islamic Cairo, Al-Muizz street, and traditional feluccas on the Nile while capturing candid, magazine-worthy portraits.',
    hostName: 'Mostafa',
    hostRole: 'Fine Art Portraitist in Cairo',
    hostBadgeText: 'MS',
    hostBadgeColor: '#B45309',
    deliveryNote: 'Available across Greater Cairo & Zamalek',
    priceFrom: '$150',
    priceUnit: '/ guest',
    rating: 4.95,
    reviewsCount: 92,
    coverImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&q=85',
    packages: [
      {
        id: 'pkg-old-cairo-walk',
        title: 'Al-Muizz & Khan El Khalili Portrait Walk',
        description: '90-minute architectural & lantern-lit portrait session in historic Old Cairo.',
        price: '$150',
        unit: '/ guest',
        image: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=600&q=85',
      },
      {
        id: 'pkg-nile-felucca-shoot',
        title: 'Private Nile Felucca Sunset Session',
        description: 'Private sailboat charter included with 40 warm film-grade portraits.',
        price: '$240',
        unit: '/ couple',
        image: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=600&q=85',
      },
    ],
    status: 'active',
  },

  // ── SPA & MASSAGE ──
  {
    id: 'prov-garden-physio',
    serviceCategoryKey: 'massage',
    title: 'Recovery Sessions with Garden Physio',
    subtitle: 'Available at your suite • Therapeutic & Sports Recovery',
    description:
      'Clinical-grade physical recovery, myofascial release, and deep tissue therapy brought directly to your hotel suite or private villa by certified specialists.',
    hostName: 'Garden Physio Clinic',
    hostRole: 'Certified Physiotherapy & Wellness Team',
    hostBadgeText: 'GP',
    hostBadgeColor: '#059669',
    deliveryNote: 'Delivered in your hotel suite or residence',
    priceFrom: '$95',
    priceUnit: '/ guest',
    rating: 4.99,
    reviewsCount: 142,
    badge: 'Guest Favorite',
    coverImage: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&q=85',
    packages: [
      {
        id: 'pkg-deep-recovery',
        title: '60-Min Deep Tissue & Myofascial Recovery',
        description: 'Targeted muscle relief after long-haul flights with heated volcanic stones.',
        price: '$95',
        unit: '/ guest',
        image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=85',
      },
      {
        id: 'pkg-full-reset',
        title: '90-Min Full Body Athletic Reset & Stretch',
        description: 'Comprehensive mobility therapy, cupping option, and aromatic botanical oils.',
        price: '$140',
        unit: '/ guest',
        image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&q=85',
      },
    ],
    status: 'active',
  },
  {
    id: 'prov-hotel-relax-massage',
    serviceCategoryKey: 'massage',
    title: 'Five-Star Hotel Relaxation Massage',
    subtitle: 'Swedish & Aromatherapy • Organic Botanical Oils',
    description:
      'Indulge in a serene five-star spa ritual in the privacy of your residence. Features warm eucalyptus towels, organic essential oils, and calming soundscapes.',
    hostName: 'Royal Sanctuary Spa',
    hostRole: 'Luxury Hospitality Spa Therapists',
    hostBadgeText: 'RS',
    hostBadgeColor: '#7C3AED',
    deliveryNote: 'Delivered in your hotel suite or residence',
    priceFrom: '$155',
    priceUnit: '/ guest',
    rating: 4.97,
    reviewsCount: 210,
    badge: 'Five-Star Standard',
    coverImage: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=1200&q=85',
    packages: [
      {
        id: 'pkg-swedish-60',
        title: 'Signature Royal Swedish Relaxation (60 Min)',
        description: 'Gentle flowing strokes using warm sweet almond and lavender essential oil.',
        price: '$155',
        unit: '/ guest',
        image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600&q=85',
      },
      {
        id: 'pkg-couples-ritual',
        title: 'Couples In-Suite Hammam & Massage Ritual',
        description: 'Two therapists simultaneously for a 90-minute candlelit wellness journey.',
        price: '$295',
        unit: '/ couple',
        image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=85',
      },
    ],
    status: 'active',
  },
  {
    id: 'prov-ash-massage',
    serviceCategoryKey: 'massage',
    title: 'Energizing Body Massage by Ash',
    subtitle: 'Available at home • Deep Tissue & Hot Stone Therapy',
    description:
      'Revitalize your body and mind with Ash’s signature combination of Thai stretching, deep tissue pressure point work, and basalt hot stone therapy.',
    hostName: 'Ash Wellness',
    hostRole: 'Senior Holistic Massage Therapist',
    hostBadgeText: 'AW',
    hostBadgeColor: '#0284C7',
    deliveryNote: 'Available at your residence across Cairo & Giza',
    priceFrom: '$78',
    originalPrice: '$98',
    priceUnit: '/ guest',
    rating: 4.94,
    reviewsCount: 87,
    badge: 'Special Offer',
    coverImage: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=1200&q=85',
    packages: [
      {
        id: 'pkg-ash-hotstone',
        title: 'Energizing Hot Stone & Deep Tissue (75 Min)',
        description: 'Full-body tension release with heated basalt stones and organic argan oil.',
        price: '$78',
        unit: '/ guest',
        image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&q=85',
      },
    ],
    status: 'active',
  },

  // ── MAKEUP & GLAM ──
  {
    id: 'prov-house-of-glow',
    serviceCategoryKey: 'makeup',
    title: 'House of Glow — Luxury Bridal & Gala Glam',
    subtitle: 'Available at your suite • Haute Couture Makeup Artistry',
    description:
      'Red-carpet and bridal makeup artistry using exclusively Dior, Charlotte Tilbury, and Chanel skin prep for a luminous, long-wear finish in your suite.',
    hostName: 'House of Glow Studio',
    hostRole: 'Celebrity & Bridal Makeup Artists',
    hostBadgeText: 'HG',
    hostBadgeColor: '#DB2777',
    deliveryNote: 'Delivered in your hotel suite or residence',
    priceFrom: '$220',
    priceUnit: '/ guest',
    rating: 4.99,
    reviewsCount: 176,
    badge: 'VIP Choice',
    coverImage: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1200&q=85',
    packages: [
      {
        id: 'pkg-evening-glam',
        title: 'Signature Evening & Red Carpet Glow',
        description: 'Full luxury skin prep, custom lash application, and luminous contour finish.',
        price: '$220',
        unit: '/ guest',
        image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=85',
      },
      {
        id: 'pkg-bridal-royal',
        title: 'Royal Bridal VIP Suite Package',
        description: 'Full bridal glam + touch-up kit and 2 bridesmaids styling included.',
        price: '$580',
        unit: '/ package',
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=85',
      },
    ],
    status: 'active',
  },
  {
    id: 'prov-shrouk-mohsen',
    serviceCategoryKey: 'makeup',
    title: 'Charming Natural Beauty by Shrouk Mohsen',
    subtitle: 'Available at home • Soft Glam & Editorial Makeup',
    description:
      'Known for feather-light skin textures, soft sultry eyes, and natural radiance tailored for Mediterranean evenings, engagements, and private galas.',
    hostName: 'Shrouk Mohsen',
    hostRole: 'Lead Beauty & Soft-Glam Artist',
    hostBadgeText: 'SM',
    hostBadgeColor: '#E11D48',
    deliveryNote: 'Delivered at your home or hotel suite',
    priceFrom: '$110',
    priceUnit: '/ group',
    rating: 4.96,
    reviewsCount: 134,
    coverImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=85',
    packages: [
      {
        id: 'pkg-soft-glam',
        title: 'Signature Soft Glam & Silk Skin Finish',
        description: 'Radiant dewy complexion with waterproof setting for Cairo & Red Sea events.',
        price: '$110',
        unit: '/ guest',
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=85',
      },
    ],
    status: 'active',
  },

  // ── PRIVATE CHEF ──
  {
    id: 'prov-chef-karim',
    serviceCategoryKey: 'chef',
    title: 'Michelin-Trained Private Dining by Chef Karim',
    subtitle: 'In-Villa & Penthouse Gastronomy • 5-Course Tasting Menu',
    description:
      'Transform your residence or penthouse into a private Michelin-starred dining room. Chef Karim sources Wagyu beef, Mediterranean seafood, and truffle delicacies, handling everything from table styling to sommelier pairings.',
    hostName: 'Chef Karim El-Masry',
    hostRole: 'Executive Private Chef & Sommelier',
    hostBadgeText: 'CK',
    hostBadgeColor: '#B45309',
    deliveryNote: 'Full kitchen preparation & service at your residence',
    priceFrom: '$190',
    priceUnit: '/ guest',
    rating: 4.99,
    reviewsCount: 205,
    badge: 'Chef’s Table',
    coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=85',
    packages: [
      {
        id: 'pkg-mediterranean-tasting',
        title: '5-Course Royal Mediterranean Seafood & Wagyu Menu',
        description: 'Includes amuse-bouche, wild sea bass, A5 Wagyu tenderloin, and table service.',
        price: '$190',
        unit: '/ guest',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=85',
      },
      {
        id: 'pkg-levantine-feast',
        title: 'Imperial Egyptian & Levantine Candlelit Feast',
        description: 'Elevated heritage recipes, artisanal mezzes, slow-roasted lamb, and live dessert plating.',
        price: '$145',
        unit: '/ guest',
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=85',
      },
    ],
    status: 'active',
  },

  // ── PERSONAL TRAINING ──
  {
    id: 'prov-coach-omar',
    serviceCategoryKey: 'training',
    title: 'Executive Performance & Mobility by Coach Omar',
    subtitle: 'In-Suite or Hotel Gym • Strength, HIIT & Yoga Flow',
    description:
      'Maintain peak physical conditioning during your travels. Customized 1-on-1 personal training, boxing pad work, or sunrise mobility flow in your hotel gym or private terrace.',
    hostName: 'Coach Omar Hassan',
    hostRole: 'Certified Strength & Mobility Coach',
    hostBadgeText: 'OH',
    hostBadgeColor: '#0E2442',
    deliveryNote: 'At your residence, terrace, or hotel fitness center',
    priceFrom: '$110',
    priceUnit: '/ session',
    rating: 4.98,
    reviewsCount: 98,
    coverImage: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&q=85',
    packages: [
      {
        id: 'pkg-pt-session',
        title: '60-Min Private Strength & Conditioning Session',
        description: 'Full equipment brought to your suite or guided in your hotel fitness center.',
        price: '$110',
        unit: '/ guest',
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=85',
      },
    ],
    status: 'active',
  },

  // ── CAR RENTAL & CHAUFFEUR ──
  {
    id: 'prov-vanir-fleet',
    serviceCategoryKey: 'car',
    title: 'Mercedes-Maybach S680 & Rolls-Royce Chauffeur',
    subtitle: '24/7 Protocol Chauffeur • Airport Tarmac & City Escort',
    description:
      'Travel in whisper-quiet luxury aboard our flagship Mercedes-Maybach S680 and Rolls-Royce Ghost fleet with multilingual diplomatic chauffeurs.',
    hostName: 'Vanir Royal Fleet',
    hostRole: 'Diplomatic Chauffeur Division',
    hostBadgeText: 'VF',
    hostBadgeColor: '#0E2442',
    deliveryNote: 'Door-to-door pickup at airport or hotel',
    priceFrom: '$350',
    priceUnit: '/ day',
    rating: 5.0,
    reviewsCount: 312,
    badge: 'Flagship Fleet',
    coverImage: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200&q=85',
    packages: [
      {
        id: 'pkg-maybach-day',
        title: 'Mercedes-Maybach S680 Full-Day Chauffeur (10 Hrs)',
        description: 'Includes uniformed protocol driver, chilled refreshments, and unlimited city mileage.',
        price: '$350',
        unit: '/ day',
        image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&q=85',
      },
      {
        id: 'pkg-range-rover-autobiography',
        title: 'Range Rover Autobiography VIP Escort',
        description: 'Commanding luxury SUV ideal for Giza Pyramids, New Capital, and North Coast transfers.',
        price: '$290',
        unit: '/ day',
        image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&q=85',
      },
    ],
    status: 'active',
  },

  // ── CULTURAL EXPERIENCES ──
  {
    id: 'exp-cairo-food-walk',
    serviceCategoryKey: 'experiences',
    title: 'Cairo Walking & Culinary Tasting Tour',
    subtitle: 'Hosted by Layla • Culinary Historian & Local Guide',
    description:
      'Discover authentic Egyptian flavors across Downtown Cairo’s hidden gems, heritage bakeries, and royal cafés with a private culinary historian.',
    hostName: 'Layla Mansour',
    hostRole: 'Culinary Historian',
    hostBadgeText: 'LM',
    hostBadgeColor: '#D97706',
    deliveryNote: 'Meet in Downtown Cairo (Private pickup included)',
    priceFrom: '$65',
    priceUnit: '/ guest',
    rating: 4.95,
    reviewsCount: 248,
    badge: 'Most Popular',
    coverImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=85',
    packages: [
      {
        id: 'pkg-food-tour-vip',
        title: 'Private 4-Hour Culinary & Heritage Tasting Walk',
        description: '10+ curated tastings, artisanal desserts, and historic café stops.',
        price: '$65',
        unit: '/ guest',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=85',
      },
    ],
    status: 'active',
  },
  {
    id: 'exp-egyptian-bazaar',
    serviceCategoryKey: 'experiences',
    title: 'Engage with Egyptian Life & Khan El Khalili Bazaar',
    subtitle: 'Hosted by Tarek • Master Egyptologist & Artisan Curator',
    description:
      'Go beyond tourist paths into private silversmith workshops, centuries-old caravanserais, and panoramic rooftop terraces in Islamic Cairo.',
    hostName: 'Tarek El-Sharif',
    hostRole: 'Master Egyptologist',
    hostBadgeText: 'TE',
    hostBadgeColor: '#0E2442',
    deliveryNote: 'Private Chauffeur Pickup from Your Hotel',
    priceFrom: '$58',
    priceUnit: '/ guest',
    rating: 4.97,
    reviewsCount: 319,
    badge: 'Most Popular',
    coverImage: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=1200&q=85',
    packages: [
      {
        id: 'pkg-bazaar-insider',
        title: 'Private Artisan Workshops & Rooftop Tea Tour',
        description: 'Exclusive access to heritage craft masters and sunset mint tea overlooking Al-Hussein.',
        price: '$58',
        unit: '/ guest',
        image: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=600&q=85',
      },
    ],
    status: 'active',
  },
];

export async function fetchLifestyleServicesFromFirestore(): Promise<LifestyleServiceAdminItem[]> {
  if (!db) return INITIAL_LIFESTYLE_SERVICES;
  try {
    const snap = await getDocs(collection(db, 'lifestyle_services'));
    if (snap.empty) {
      await seedInitialLifestyleServices();
      return INITIAL_LIFESTYLE_SERVICES;
    }
    const remoteMap = new Map<string, any>();
    snap.forEach(docSnap => {
      remoteMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() });
    });

    const merged: LifestyleServiceAdminItem[] = INITIAL_LIFESTYLE_SERVICES.map(def => {
      const rem = remoteMap.get(def.id);
      if (!rem) return def;
      remoteMap.delete(def.id);
      return {
        ...def,
        ...rem,
        coverImage: rem.coverImage || rem.image || def.coverImage,
        packages: Array.isArray(rem.packages) && rem.packages.length > 0 ? rem.packages : def.packages,
      };
    });

    remoteMap.forEach(rem => {
      if (rem.title && (rem.coverImage || rem.image)) {
        merged.push({
          id: rem.id,
          serviceCategoryKey: rem.serviceCategoryKey || 'massage',
          title: rem.title,
          subtitle: rem.subtitle || 'Hosted by Vanir Certified Partner',
          description: rem.description || '',
          hostName: rem.hostName || 'Vanir Partner',
          hostRole: rem.hostRole || 'Luxury Service Specialist',
          hostBadgeText: rem.hostBadgeText || 'VP',
          hostBadgeColor: rem.hostBadgeColor || '#0E2442',
          deliveryNote: rem.deliveryNote || 'Delivered at your residence or hotel suite',
          priceFrom: rem.priceFrom || rem.price || '$150',
          originalPrice: rem.originalPrice,
          priceUnit: rem.priceUnit || '/ guest',
          rating: Number(rem.rating) || 4.95,
          reviewsCount: Number(rem.reviewsCount) || 85,
          badge: rem.badge,
          coverImage: rem.coverImage || rem.image,
          packages: Array.isArray(rem.packages) ? rem.packages : [],
          status: rem.status || 'active',
          updatedAt: rem.updatedAt,
        });
      }
    });

    return merged;
  } catch (err) {
    console.warn('Error fetching lifestyle_services from Firestore:', err);
    return INITIAL_LIFESTYLE_SERVICES;
  }
}

export async function saveLifestyleServiceToFirestore(item: LifestyleServiceAdminItem): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  let coverImage = item.coverImage || '';
  if (typeof window !== 'undefined' && coverImage.startsWith('data:image/') && coverImage.length > 180000) {
    try {
      coverImage = await compressDataUrlString(coverImage, 1100, 0.75, 180000);
    } catch {
      // keep as is
    }
  }

  const packages = await Promise.all(
    (item.packages || []).map(async pkg => {
      let pkgImg = pkg.image || '';
      if (typeof window !== 'undefined' && pkgImg.startsWith('data:image/') && pkgImg.length > 90000) {
        try {
          pkgImg = await compressDataUrlString(pkgImg, 800, 0.72, 90000);
        } catch {
          // keep as is
        }
      }
      return { ...pkg, image: pkgImg };
    }),
  );

  const payload = {
    ...item,
    coverImage,
    packages,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'lifestyle_services', item.id), payload, { merge: true });
}

export async function deleteLifestyleServiceFromFirestore(id: string): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  await deleteDoc(doc(db, 'lifestyle_services', id));
}

export async function seedInitialLifestyleServices(): Promise<void> {
  if (!db) return;
  for (const item of INITIAL_LIFESTYLE_SERVICES) {
    await setDoc(
      doc(db, 'lifestyle_services', item.id),
      {
        ...item,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );
  }
}


