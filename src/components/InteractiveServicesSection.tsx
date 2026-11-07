import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import { WebView } from 'react-native-webview';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  ChevronDown,
  ChevronRight,
  Heart,
  MapPin,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Star,
  Users,
  X,
  Accessibility,
  CalendarX2,
  Maximize2,
} from 'lucide-react-native';
import { BespokeLifestyleIcon, type LifestyleIconKey } from './BespokeLifestyleIcons';

const WISHLIST_STORAGE_KEY = '@vanir_interactive_wishlist_v2';
const MapWebView = WebView as unknown as React.ComponentType<any>;

export type InteractiveCategoryFilter = 'all' | 'services' | 'experiences' | 'homes';
export type ServiceCategoryKey =
  | 'massage'
  | 'makeup'
  | 'photography'
  | 'chef'
  | 'training'
  | 'car';

export interface ServicePackageTier {
  id: string;
  title: string;
  description: string;
  price: string;
  image: string;
}

export interface LifestyleServiceProvider {
  id: string;
  categoryKey: ServiceCategoryKey | 'experiences' | 'homes';
  sectionGroup?: 'popular_experiences' | 'memories' | 'alexandria' | 'hurghada';
  title: string;
  subtitle: string;
  hostName: string;
  hostInitials: string;
  hostAvatarColor: string;
  hostAvatarUrl?: string;
  hostRole: string;
  deliveryNote: string;
  city: string;
  priceFrom: string;
  oldPrice?: string;
  priceUnit: string;
  minSpendText?: string;
  rating: number;
  reviewsCount: number;
  badge?: string;
  coverImage: string;
  description: string;
  coverageCity: string;
  coverageLat: number;
  coverageLng: number;
  packages: ServicePackageTier[];
  guestRequirements: string;
  accessibilityInfo: string;
  cancellationPolicy: string;
  routeTarget?: string;
}

export interface DestinationHotelInfo {
  id: string;
  name: string;
  rating: number;
  reviewsCount: number;
  price: string;
  image: string;
  highlights: string;
  lat: number;
  lng: number;
  address: string;
  badge?: string;
}

export interface MustVisitDestination {
  id: string;
  city: string;
  tagline: string;
  country: string;
  image: string;
  airportCode: string;
  lat: number;
  lng: number;
  hotels: DestinationHotelInfo[];
}

export const SERVICE_CATEGORIES_META: {
  key: ServiceCategoryKey;
  label: string;
  shortDesc: string;
  iconKey: LifestyleIconKey;
  countLabel: string;
}[] = [
  {
    key: 'massage',
    label: 'Spa & Massage',
    shortDesc: 'In-suite holistic & deep tissue',
    iconKey: 'massage',
    countLabel: '7 Spa Services',
  },
  {
    key: 'photography',
    label: 'Photography',
    shortDesc: 'Pyramids & portrait sessions',
    iconKey: 'photography',
    countLabel: '6 Photo Services',
  },
  {
    key: 'chef',
    label: 'Private Chef',
    shortDesc: 'Michelin dining at home',
    iconKey: 'chef',
    countLabel: '5 Chef Services',
  },
  {
    key: 'makeup',
    label: 'Makeup & Glam',
    shortDesc: 'Bridal & red-carpet artists',
    iconKey: 'makeup',
    countLabel: '6 Glam Services',
  },
  {
    key: 'training',
    label: 'Personal Training',
    shortDesc: 'Private fitness & Pilates',
    iconKey: 'training',
    countLabel: '4 Wellness Coaches',
  },
  {
    key: 'car',
    label: 'Car Rental',
    shortDesc: 'Save up to 20% on fleet',
    iconKey: 'car',
    countLabel: '8 Chauffeur & SUVs',
  },
];

export const MUST_VISIT_DESTINATIONS: MustVisitDestination[] = [
  {
    id: 'dest-madinah',
    city: 'Al Madinah',
    tagline: 'Timeless spiritual sanctuary & palatial suites',
    country: 'Saudi Arabia',
    image: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=900&q=85',
    airportCode: 'MED',
    lat: 24.4672,
    lng: 39.6108,
    hotels: [
      {
        id: 'htl-oberoi-madina',
        name: 'The Oberoi Madina, Royal Wing',
        rating: 4.98,
        reviewsCount: 240,
        price: '$780 / night',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&q=80',
        highlights: 'Palatial residence steps from Al Masjid an Nabawi, private butler & hand-loomed gold suites.',
        lat: 24.4715,
        lng: 39.6095,
        address: 'Northern Central Area, Al Madinah, Saudi Arabia',
        badge: 'ROYAL SANCTUARY',
      },
      {
        id: 'htl-dar-altaqwa',
        name: 'Dar Al Taqwa Hotel Madinah',
        rating: 4.95,
        reviewsCount: 180,
        price: '$620 / night',
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&q=80',
        highlights: 'Courtyard suites facing the Holy Haram with private executive dining.',
        lat: 24.4688,
        lng: 39.6112,
        address: 'Al Haram Courtyard, Al Madinah, Saudi Arabia',
      },
    ],
  },
  {
    id: 'dest-istanbul',
    city: 'Istanbul',
    tagline: 'Vibrant Bosphorus nightlife & imperial palaces',
    country: 'Turkey',
    image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=900&q=85',
    airportCode: 'IST',
    lat: 41.0438,
    lng: 29.0163,
    hotels: [
      {
        id: 'htl-ciragan-kempinski',
        name: 'Çırağan Palace Kempinski Istanbul',
        rating: 4.99,
        reviewsCount: 320,
        price: '$1,450 / night',
        image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=900&q=80',
        highlights: '19th-century Ottoman imperial sultan palace with private Bosphorus yacht harbor.',
        lat: 41.0438,
        lng: 29.0163,
        address: 'Çırağan Caddesi 32, Beşiktaş, Istanbul, Turkey',
        badge: 'SULTAN PALACE',
      },
      {
        id: 'htl-fs-bosphorus',
        name: 'Four Seasons Hotel Istanbul at the Bosphorus',
        rating: 4.98,
        reviewsCount: 290,
        price: '$1,280 / night',
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=900&q=80',
        highlights: 'Restored 19th-century waterfront palace, open-air Bosphorus pool and marble hammam.',
        lat: 41.0465,
        lng: 29.0189,
        address: 'Çırağan Cd. No: 28, Beşiktaş, Istanbul, Turkey',
      },
    ],
  },
  {
    id: 'dest-jeddah',
    city: 'Jeddah',
    tagline: 'Exquisite Red Sea coastal architecture & corniche',
    country: 'Saudi Arabia',
    image: 'https://images.unsplash.com/photo-1578895101408-1a36b834405b?w=900&q=85',
    airportCode: 'JED',
    lat: 21.5812,
    lng: 39.1234,
    hotels: [
      {
        id: 'htl-rosewood-jeddah',
        name: 'Rosewood Jeddah, North Corniche',
        rating: 4.97,
        reviewsCount: 210,
        price: '$790 / night',
        image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=900&q=80',
        highlights: 'Rooftop infinity swimming pool over the Red Sea with 24-hour dedicated butler floor.',
        lat: 21.5812,
        lng: 39.1234,
        address: 'North Corniche Road, Al Shatie, Jeddah, Saudi Arabia',
        badge: 'CORNICHE ICON',
      },
      {
        id: 'htl-ritz-jeddah',
        name: 'The Ritz-Carlton Jeddah Palace',
        rating: 4.96,
        reviewsCount: 195,
        price: '$850 / night',
        image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=900&q=80',
        highlights: 'Grand neoclassical architecture facing King Fahd Fountain with royal suites.',
        lat: 21.5175,
        lng: 39.1578,
        address: 'Al Hamra District, Southern Corniche, Jeddah, Saudi Arabia',
      },
    ],
  },
  {
    id: 'dest-barcelona',
    city: 'Barcelona',
    tagline: 'Mediterranean beachside glamour & Gaudí art',
    country: 'Spain',
    image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=900&q=85',
    airportCode: 'BCN',
    lat: 41.3888,
    lng: 2.1965,
    hotels: [
      {
        id: 'htl-arts-barcelona',
        name: 'Hotel Arts Barcelona, The Ritz-Carlton',
        rating: 4.97,
        reviewsCount: 260,
        price: '$920 / night',
        image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=900&q=80',
        highlights: '44 stories of seafront glass and blue Mediterranean views with two-Michelin-star Enoteca.',
        lat: 41.3888,
        lng: 2.1965,
        address: 'Carrer de Marina 19-21, 08005 Barcelona, Spain',
        badge: 'SEAFRONT TOWER',
      },
    ],
  },
  {
    id: 'dest-amman',
    city: 'Amman',
    tagline: 'Ancient citadel vistas & Seven Hills luxury',
    country: 'Jordan',
    image: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=900&q=85',
    airportCode: 'AMM',
    lat: 31.9632,
    lng: 35.8856,
    hotels: [
      {
        id: 'htl-fs-amman',
        name: 'Four Seasons Hotel Amman, 5th Circle',
        rating: 4.96,
        reviewsCount: 175,
        price: '$620 / night',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&q=80',
        highlights: 'Perched atop the highest of the Seven Hills with panoramic sunset views over the capital.',
        lat: 31.9632,
        lng: 35.8856,
        address: 'Al Kindi Street, 5th Circle, Jabal Amman, Jordan',
        badge: 'ROYAL EMBASSY',
      },
    ],
  },
  {
    id: 'dest-doha',
    city: 'Doha',
    tagline: 'Futuristic West Bay skyline & pearl marina',
    country: 'Qatar',
    image: 'https://images.unsplash.com/photo-1557971370-e7298ee473fb?w=900&q=85',
    airportCode: 'DOH',
    lat: 25.3941,
    lng: 51.5292,
    hotels: [
      {
        id: 'htl-raffles-doha',
        name: 'Raffles Doha, Katara Towers',
        rating: 4.99,
        reviewsCount: 310,
        price: '$1,480 / night',
        image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=900&q=80',
        highlights: 'Iconic crescent Katara Towers suites with private cinema & ALBA 3-star Italian dining.',
        lat: 25.3941,
        lng: 51.5292,
        address: 'Katara Towers, Lusail Marina, Doha, Qatar',
        badge: 'ARCHITECTURAL WONDER',
      },
    ],
  },
  {
    id: 'dest-rome',
    city: 'Rome',
    tagline: 'The Eternal City, haute cuisine & historic piazza',
    country: 'Italy',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=900&q=85',
    airportCode: 'FCO',
    lat: 41.9099,
    lng: 12.4787,
    hotels: [
      {
        id: 'htl-russie-rome',
        name: 'Hotel de Russie, Rocco Forte Rome',
        rating: 4.99,
        reviewsCount: 340,
        price: '$1,380 / night',
        image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=900&q=80',
        highlights: 'Secret tiered pine garden steps from Spanish Steps and Piazza del Popolo.',
        lat: 41.9099,
        lng: 12.4787,
        address: 'Via del Babuino 9, Piazza del Popolo, Rome, Italy',
        badge: 'HISTORIC PALACE',
      },
    ],
  },
  {
    id: 'dest-bangkok',
    city: 'Bangkok',
    tagline: 'Chao Phraya river of kings & golden temples',
    country: 'Thailand',
    image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=900&q=85',
    airportCode: 'BKK',
    lat: 13.7228,
    lng: 100.5103,
    hotels: [
      {
        id: 'htl-peninsula-bangkok',
        name: 'The Peninsula Bangkok, Riverfront',
        rating: 4.98,
        reviewsCount: 285,
        price: '$680 / night',
        image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=900&q=80',
        highlights: 'Private teak boat transfers along Chao Phraya River with three-tier riverside pool.',
        lat: 13.7228,
        lng: 100.5103,
        address: '333 Charoennakorn Road, Klongsan, Bangkok, Thailand',
        badge: 'RIVERSIDE LUXURY',
      },
    ],
  },
  {
    id: 'dest-madrid',
    city: 'Madrid',
    tagline: 'Bourbon royal palaces & Gran Vía couture',
    country: 'Spain',
    image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=900&q=85',
    airportCode: 'MAD',
    lat: 40.4173,
    lng: -3.7001,
    hotels: [
      {
        id: 'htl-fs-madrid',
        name: 'Four Seasons Hotel Madrid, Canalejas',
        rating: 4.98,
        reviewsCount: 220,
        price: '$1,150 / night',
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&q=80',
        highlights: 'Historical landmark of seven heritage buildings with rooftop Dani García brasserie.',
        lat: 40.4173,
        lng: -3.7001,
        address: 'Calle de Sevilla 3, Centro Canalejas, Madrid, Spain',
        badge: 'BOURBON GRANDEUR',
      },
    ],
  },
  {
    id: 'dest-marrakech',
    city: 'Marrakech',
    tagline: 'Enchanting sovereign riads & Palmeraie oasis',
    country: 'Morocco',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=900&q=85',
    airportCode: 'RAK',
    lat: 31.6252,
    lng: -7.9992,
    hotels: [
      {
        id: 'htl-royal-mansour',
        name: 'Royal Mansour Marrakech, Sovereign Riad',
        rating: 4.99,
        reviewsCount: 315,
        price: '$1,850 / night',
        image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=900&q=80',
        highlights: 'Private multi-story riads with secluded rooftop plunge pools & underground service tunnels.',
        lat: 31.6252,
        lng: -7.9992,
        address: 'Rue Abou Abbas El Sebti, Marrakech 40000, Morocco',
        badge: 'ROYAL RIAD',
      },
    ],
  },
  {
    id: 'dest-prague',
    city: 'Prague',
    tagline: 'Gothic spires, Charles Bridge & bohemian castles',
    country: 'Czech Republic',
    image: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=900&q=85',
    airportCode: 'PRG',
    lat: 50.0865,
    lng: 14.4143,
    hotels: [
      {
        id: 'htl-fs-prague',
        name: 'Four Seasons Hotel Prague, Vltava River',
        rating: 4.98,
        reviewsCount: 205,
        price: '$890 / night',
        image: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=900&q=80',
        highlights: 'Vltava riverfront palace facing Prague Castle & landmark Charles Bridge.',
        lat: 50.0865,
        lng: 14.4143,
        address: 'Veleslavinova 1098/2a, 110 00 Prague 1, Czech Republic',
        badge: 'CASTLE VISTAS',
      },
    ],
  },
  {
    id: 'dest-dammam',
    city: 'Dammam & Al Khobar',
    tagline: 'Arabian Gulf corniche & Eastern Province oasis',
    country: 'Saudi Arabia',
    image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=900&q=85',
    airportCode: 'DMM',
    lat: 26.3021,
    lng: 50.1982,
    hotels: [
      {
        id: 'htl-kempinski-dammam',
        name: 'Kempinski Al Othman Hotel Al Khobar/Dammam',
        rating: 4.95,
        reviewsCount: 190,
        price: '$580 / night',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&q=80',
        highlights: 'Twin luxury glass towers with royal suites, luxury mall access & Turkish hammam.',
        lat: 26.3021,
        lng: 50.1982,
        address: 'King Saud Road, Al Qashlah, Al Khobar/Dammam, Saudi Arabia',
        badge: 'GULF PREMIER',
      },
    ],
  },
  {
    id: 'dest-dubai',
    city: 'Dubai',
    tagline: 'Prime beachfront & Burj Al Arab skyline glamour',
    country: 'UAE',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=900&q=85',
    airportCode: 'DXB',
    lat: 25.1412,
    lng: 55.1852,
    hotels: [
      {
        id: 'htl-burj-alarab',
        name: 'Burj Al Arab Jumeirah, Ultra-Luxury Sail',
        rating: 4.99,
        reviewsCount: 450,
        price: '$2,400 / night',
        image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=900&q=80',
        highlights: 'All-suite sail tower, Rolls-Royce Phantoms, helicopter pad & private infinity terrace.',
        lat: 25.1412,
        lng: 55.1852,
        address: 'Jumeirah Beach Road, Umm Suqeim 3, Dubai, UAE',
        badge: 'WORLD ICON',
      },
    ],
  },
  {
    id: 'dest-paris',
    city: 'Paris',
    tagline: 'Iconic Eiffel vistas & Place Vendôme couture',
    country: 'France',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=900&q=85',
    airportCode: 'CDG',
    lat: 48.8674,
    lng: 2.3294,
    hotels: [
      {
        id: 'htl-ritz-paris',
        name: 'The Ritz Paris, Place Vendôme',
        rating: 4.99,
        reviewsCount: 390,
        price: '$2,100 / night',
        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=900&q=80',
        highlights: 'Legendary palace hotel facing Place Vendôme column with salon Proust & Bar Hemingway.',
        lat: 48.8674,
        lng: 2.3294,
        address: '15 Place Vendôme, 75001 Paris, France',
        badge: 'HAUTE COUTURE',
      },
    ],
  },
  {
    id: 'dest-london',
    city: 'London',
    tagline: 'Royal Mayfair estates & Thames riverside elegance',
    country: 'UK',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=900&q=85',
    airportCode: 'LHR',
    lat: 51.5103,
    lng: -0.1205,
    hotels: [
      {
        id: 'htl-savoy-london',
        name: 'The Savoy London, Strand & Thames',
        rating: 4.99,
        reviewsCount: 360,
        price: '$1,450 / night',
        image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=900&q=80',
        highlights: 'Art Deco and Edwardian royal suites overlooking River Thames and Gordon Ramsay Savoy Grill.',
        lat: 51.5103,
        lng: -0.1205,
        address: 'Strand, London WC2R 0EZ, United Kingdom',
        badge: 'ROYAL HERITAGE',
      },
    ],
  },
];

export const DEFAULT_LIFESTYLE_PROVIDERS: LifestyleServiceProvider[] = [
  // ── PHOTOGRAPHY PROVIDERS ──
  {
    id: 'prov-ayman-photo',
    categoryKey: 'photography',
    sectionGroup: 'memories',
    title: 'Iconic Portrait Session by Ayman Dakroury',
    subtitle: 'Editorial & heritage portraits at the Great Pyramids & Sphinx',
    hostName: 'Ayman Dakroury',
    hostInitials: 'AD',
    hostAvatarColor: '#EA580C',
    hostRole: 'Photographer in Cairo',
    deliveryNote: 'Provided at your residence or iconic landmark',
    city: 'Cairo & Giza',
    priceFrom: '$220',
    priceUnit: '/ guest',
    rating: 5.0,
    reviewsCount: 94,
    badge: 'Guest Favorite',
    coverImage: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=1000&q=85',
    description:
      'Document your time in Egypt through a private, magazine-grade photography session at the world-famous Giza Pyramids. Featuring creative direction, cinematic compositions, and professionally retouched high-resolution portraits to remember your journey forever.',
    coverageCity: 'Greater Cairo, Giza, Sheikh Zayed & New Cairo',
    coverageLat: 30.0444,
    coverageLng: 31.2357,
    packages: [
      {
        id: 'pkg-ayman-1',
        title: 'Pyramids & Great Sphinx Photoshoot',
        description:
          'Document your time in Egypt with a private guided photoshoot across the Great Pyramids and Sphinx panorama.',
        price: '$220 / guest',
        image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c0e?w=600&q=85',
      },
      {
        id: 'pkg-ayman-2',
        title: 'Couples Golden Hour Editorial Session',
        description:
          'Romantic sunset session on the desert ridge with Arabian horses, vintage styling, and 50 retouched portraits.',
        price: '$295 / couple',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=85',
      },
      {
        id: 'pkg-ayman-3',
        title: 'Group & Family Royal Heritage Shoot',
        description:
          'Private multi-location family session with fast-track plateau entry and instant digital gallery delivery.',
        price: '$360 / group',
        image: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=600&q=85',
      },
    ],
    guestRequirements: 'Guests aged 18 and older can book directly (children welcome with family).',
    accessibilityInfo: 'Message your host for private vehicle access right up to the panorama viewpoint.',
    cancellationPolicy: 'For a full 100% refund, cancel at least 1 day before the scheduled start time.',
  },
  {
    id: 'prov-abdul-horse',
    categoryKey: 'photography',
    sectionGroup: 'memories',
    title: 'Dreamy Horseback Photoshoot at Giza Pyramids',
    subtitle: 'Purebred Arabian horses & golden-hour desert action photography',
    hostName: 'AbdulRahman Studio',
    hostInitials: 'AR',
    hostAvatarColor: '#0D1626',
    hostRole: 'Equestrian & Action Photographer in Giza',
    deliveryNote: 'Provided at Giza Desert Plateau',
    city: 'Giza Pyramids',
    priceFrom: '$95',
    priceUnit: '/ guest',
    minSpendText: 'Minimum booking $160',
    rating: 5.0,
    reviewsCount: 168,
    badge: 'Guest Favorite',
    coverImage: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=1000&q=85',
    description:
      'Ride noble Arabian horses across the golden sands overlooking the three Pyramids of Giza while our equestrian photography team captures breathtaking motion and portrait shots.',
    coverageCity: 'Giza Pyramids Plateau & Saqqara Desert',
    coverageLat: 29.9792,
    coverageLng: 31.1342,
    packages: [
      {
        id: 'pkg-abdul-1',
        title: 'Sunrise Arabian Horseback Shoot (90 Min)',
        description: 'Trained Arabian stallion or mare, private handler, and 40 edited high-res photos.',
        price: '$95 / guest',
        image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=600&q=85',
      },
      {
        id: 'pkg-abdul-2',
        title: 'Sunset Horseback + 4K Drone Cinema Reel',
        description: 'Golden hour ride plus cinematic aerial drone video and 60 retouched portraits.',
        price: '$175 / guest',
        image: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=600&q=85',
      },
    ],
    guestRequirements: 'Suitable for both beginners and experienced riders (handlers accompany all guests).',
    accessibilityInfo: 'Gentle walk-pace horses and carriage options available upon request.',
    cancellationPolicy: 'For a full 100% refund, cancel at least 1 day before the start time.',
  },
  {
    id: 'prov-mostafa-portrait',
    categoryKey: 'photography',
    sectionGroup: 'memories',
    title: 'Private Portrait Session with Mostafa',
    subtitle: 'Traditional royal textiles, camel caravan & editorial lighting',
    hostName: 'Mostafa El-Shenawy',
    hostInitials: 'MS',
    hostAvatarColor: '#9A7B38',
    hostRole: 'Celebrity Portrait Artist in Cairo',
    deliveryNote: 'Provided at Giza & Old Cairo',
    city: 'Cairo',
    priceFrom: '$165',
    priceUnit: '/ guest',
    rating: 5.0,
    reviewsCount: 112,
    badge: 'Guest Favorite',
    coverImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1000&q=85',
    description:
      'An intimate fashion and portrait session styled with authentic Egyptian heritage kilims, desert lounge setups, and warm golden-hour reflectors.',
    coverageCity: 'Cairo, Giza Plateau & Khan El Khalili',
    coverageLat: 30.0444,
    coverageLng: 31.2357,
    packages: [
      {
        id: 'pkg-mostafa-1',
        title: 'Solo Editorial Heritage Portrait Shoot',
        description: 'Includes wardrobe styling assistance, private camel setup, and 45 retouched images.',
        price: '$165 / guest',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=85',
      },
      {
        id: 'pkg-mostafa-2',
        title: 'VIP Duo / Couple Desert Lounge Session',
        description: '2-hour sunset shoot with Bedouin carpet lounge and 70 magazine-grade edits.',
        price: '$260 / couple',
        image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c0e?w=600&q=85',
      },
    ],
    guestRequirements: 'Guests aged 18 and older can book directly.',
    accessibilityInfo: 'Private 4x4 transport included from the gate to the desert lounge.',
    cancellationPolicy: 'For a full 100% refund, cancel at least 1 day before the start time.',
  },

  // ── SPA & MASSAGE PROVIDERS (Matching Screenshots 4 & 5!) ──
  {
    id: 'prov-garden-physio',
    categoryKey: 'massage',
    title: 'Recovery Sessions with Garden Physio',
    subtitle: 'Deep tissue massage & hot volcanic stone therapy',
    hostName: 'Garden Physio Clinic',
    hostInitials: 'GP',
    hostAvatarColor: '#059669',
    hostRole: 'Certified Physiotherapy & Spa Team in Cairo',
    deliveryNote: 'Available at your residence or hotel suite',
    city: 'Cairo & Sheikh Zayed',
    priceFrom: '$45',
    priceUnit: '/ guest',
    rating: 5.0,
    reviewsCount: 28,
    badge: 'Top Rated',
    coverImage: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1000&q=85',
    description:
      'Restore your body after long flights with our clinical-grade deep tissue recovery and warm basalt stone massage, performed in the privacy of your residence or suite with heated massage tables and organic oils.',
    coverageCity: 'Cairo, Zamalek, New Cairo & Sheikh Zayed',
    coverageLat: 30.0444,
    coverageLng: 31.2357,
    packages: [
      {
        id: 'pkg-gp-1',
        title: 'Deep Tissue & Myofascial Recovery (75 Min)',
        description: 'Targeted muscle release, heated volcanic stones, and full portable spa setup.',
        price: '$45 / guest',
        image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=85',
      },
      {
        id: 'pkg-gp-2',
        title: 'Athletic Post-Travel Full Body Reset (90 Min)',
        description: 'Includes assisted stretching, cupping therapy option, and aromatherapy.',
        price: '$65 / guest',
        image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600&q=85',
      },
    ],
    guestRequirements: 'Guests aged 18 and older can attend.',
    accessibilityInfo: 'We bring the complete heated massage table and fresh linens directly to your room.',
    cancellationPolicy: 'For a full 100% refund, cancel at least 1 day before the start time.',
  },
  {
    id: 'prov-hotel-relax-massage',
    categoryKey: 'massage',
    title: 'Five-Star Hotel Relaxation Massage',
    subtitle: 'Swedish relaxation massage & aromatic botanical oils',
    hostName: 'Royal Sanctuary Spa',
    hostInitials: 'RS',
    hostAvatarColor: '#9A7B38',
    hostRole: 'Luxury Hotel Spa Therapists in Cairo',
    deliveryNote: 'Provided in your suite or private residence',
    city: 'Cairo & Hurghada',
    priceFrom: '$155',
    priceUnit: '/ guest',
    rating: 4.99,
    reviewsCount: 64,
    badge: '5-Star Standard',
    coverImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1000&q=85',
    description:
      'Experience the exact tranquility of a five-star palace spa in your own suite. Our senior therapists bring warm eucalyptus towels, pure Egyptian neroli oil, and soothing soundscapes.',
    coverageCity: 'Greater Cairo, New Cairo, Sheikh Zayed & El Gouna',
    coverageLat: 30.0444,
    coverageLng: 31.2357,
    packages: [
      {
        id: 'pkg-hr-1',
        title: 'Signature Swedish Relaxation Ritual (90 Min)',
        description: 'Gentle flowing strokes with warm botanical oils to melt away jet lag.',
        price: '$155 / guest',
        image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=85',
      },
      {
        id: 'pkg-hr-2',
        title: 'Royal Couples Holistic Spa Sanctuary (120 Min)',
        description: 'Two senior therapists, synchronized massage, and gold hydrating facial mask.',
        price: '$280 / couple',
        image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&q=85',
      },
    ],
    guestRequirements: 'Guests aged 18 and older can attend.',
    accessibilityInfo: 'Full in-suite setup with zero preparation needed from the guest.',
    cancellationPolicy: 'For a full 100% refund, cancel at least 1 day before the start time.',
  },
  {
    id: 'prov-ash-massage',
    categoryKey: 'massage',
    title: 'Energizing Body Massage by Ash',
    subtitle: 'Available at home • Deep tissue & hot stone massage',
    hostName: 'Ash Holistic Studio',
    hostInitials: 'AH',
    hostAvatarColor: '#1E293B',
    hostRole: 'Senior Holistic Therapist in Cairo',
    deliveryNote: 'Available for in-home & in-villa service',
    city: 'Cairo',
    priceFrom: '$32',
    oldPrice: '$42',
    priceUnit: '/ guest',
    rating: 4.97,
    reviewsCount: 41,
    badge: 'Special Offer',
    coverImage: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=1000&q=85',
    description:
      'Rejuvenate your senses with an energizing full-body therapeutic massage combining deep tissue pressure, warm aromatic candles, and organic waffle-cotton spa robes.',
    coverageCity: 'Greater Cairo, Maadi, Zamalek & New Cairo',
    coverageLat: 30.0444,
    coverageLng: 31.2357,
    packages: [
      {
        id: 'pkg-ash-1',
        title: 'Energizing Deep Tissue & Hot Stones (60 Min)',
        description: 'Full-body tension release with warm basalt stones and organic essential oils.',
        price: '$32 / guest',
        image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600&q=85',
      },
      {
        id: 'pkg-ash-2',
        title: 'Extended Aromatherapy & Reflexology (90 Min)',
        description: 'Includes foot reflexology, scalp massage, and warm herbal compress.',
        price: '$48 / guest',
        image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=85',
      },
    ],
    guestRequirements: 'Guests aged 18 and older can attend.',
    accessibilityInfo: 'Message your therapist for custom oil preferences or pressure adjustments.',
    cancellationPolicy: 'For a full 100% refund, cancel at least 1 day before the start time.',
  },

  // ── VIP MAKEUP & STYLING PROVIDERS (Matching Screenshot 7!) ──
  {
    id: 'prov-house-of-glow',
    categoryKey: 'makeup',
    title: 'House of Glow — Couture In-Suite Makeup',
    subtitle: 'Available at your residence • Red-carpet & evening makeup',
    hostName: 'House of Glow Studio',
    hostInitials: 'HG',
    hostAvatarColor: '#BE185D',
    hostRole: 'Celebrity Makeup Artist in Cairo',
    deliveryNote: 'Provided at your residence or hotel suite',
    city: 'Cairo & El Gouna',
    priceFrom: '$220',
    priceUnit: '/ guest',
    rating: 5.0,
    reviewsCount: 53,
    badge: 'VIP Glam',
    coverImage: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1000&q=85',
    description:
      'Flawless, luminous red-carpet and gala makeup artistry in the comfort of your suite using luxury Dior, Chanel, and Charlotte Tilbury products.',
    coverageCity: 'Cairo, Sheikh Zayed, New Cairo & El Gouna',
    coverageLat: 30.0444,
    coverageLng: 31.2357,
    packages: [
      {
        id: 'pkg-hg-1',
        title: 'Signature Evening & Gala Glow Look',
        description: 'Luxury skin prep, custom silk lashes, and long-wear editorial finish.',
        price: '$220 / guest',
        image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=85',
      },
      {
        id: 'pkg-hg-2',
        title: 'VIP Bridal & Photoshoot Full Day Package',
        description: 'Includes hair styling, 2 look transitions, and on-location touch-ups.',
        price: '$390 / session',
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=85',
      },
    ],
    guestRequirements: 'Guests aged 18 and older can book.',
    accessibilityInfo: 'Full ring-light and luxury vanity kit brought directly to your suite.',
    cancellationPolicy: 'For a full 100% refund, cancel at least 1 day before the start time.',
  },
  {
    id: 'prov-shrouk-mohsen',
    categoryKey: 'makeup',
    title: 'Enchanting Natural Beauty by Shrouk Mohsen',
    subtitle: 'Available at your residence • Soft glam & group styling',
    hostName: 'Shrouk Mohsen',
    hostInitials: 'SM',
    hostAvatarColor: '#9A7B38',
    hostRole: 'Bridal & Soft-Glam Artist in Cairo',
    deliveryNote: 'Available at your residence or hotel',
    city: 'Cairo',
    priceFrom: '$45',
    priceUnit: '/ group',
    rating: 4.98,
    reviewsCount: 79,
    badge: 'Guest Favorite',
    coverImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1000&q=85',
    description:
      'Radiant, camera-ready soft glam designed to highlight your natural features for weddings, engagement soirées, and desert photoshoots.',
    coverageCity: 'Greater Cairo, New Cairo & Sheikh Zayed',
    coverageLat: 30.0444,
    coverageLng: 31.2357,
    packages: [
      {
        id: 'pkg-sm-1',
        title: 'Soft Glam Portrait & Evening Makeup',
        description: 'Velvet skin finish, contoured glow, and waterproof setting for events.',
        price: '$45 / guest',
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=85',
      },
    ],
    guestRequirements: 'Individual and group bookings welcome.',
    accessibilityInfo: 'In-home and in-hotel service across Greater Cairo.',
    cancellationPolicy: 'For a full 100% refund, cancel at least 1 day before the start time.',
  },

  // ── PRIVATE CHEF PROVIDERS ──
  {
    id: 'prov-chef-karim',
    categoryKey: 'chef',
    title: 'Private Fine Dining with Chef Karim El-Masry',
    subtitle: '5-Course Mediterranean & Wagyu tasting menu in your villa',
    hostName: 'Chef Karim El-Masry',
    hostInitials: 'KM',
    hostAvatarColor: '#0D1626',
    hostRole: 'Michelin-Trained Executive Chef in Cairo & Red Sea',
    deliveryNote: 'Prepared fresh in your residence or superyacht',
    city: 'Cairo, El Gouna & Dubai',
    priceFrom: '$180',
    priceUnit: '/ guest',
    rating: 5.0,
    reviewsCount: 142,
    badge: 'Michelin Standard',
    coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000&q=85',
    description:
      'Transform your private residence, penthouse, or yacht into a Michelin-caliber dining room. Includes organic market sourcing, table styling, waiter service, and complete kitchen cleanup.',
    coverageCity: 'Cairo, Sheikh Zayed, New Cairo, El Gouna & Dubai',
    coverageLat: 30.0444,
    coverageLng: 31.2357,
    packages: [
      {
        id: 'pkg-chef-1',
        title: 'Mediterranean & Wagyu 5-Course Tasting Menu',
        description: 'Burrata & truffle starter, seared sea bass, A5 Wagyu tenderloin & artisan dessert.',
        price: '$180 / guest',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=85',
      },
      {
        id: 'pkg-chef-2',
        title: 'Royal Egyptian & Levantine Charcoal Feast',
        description: 'Live grill station, gourmet mezze spread, stuffed pigeon & Umm Ali.',
        price: '$145 / guest',
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=85',
      },
    ],
    guestRequirements: 'Minimum 2 guests; dietary & halal preferences fully accommodated.',
    accessibilityInfo: 'Our team brings all cookware, plating china, and serving staff.',
    cancellationPolicy: 'For a full 100% refund, cancel at least 24 hours before the dinner.',
  },

  // ── PERSONAL TRAINING PROVIDERS ──
  {
    id: 'prov-coach-omar',
    categoryKey: 'training',
    title: '1-on-1 Elite Performance & Pilates with Coach Omar',
    subtitle: 'Private strength, mobility & athletic conditioning at your villa',
    hostName: 'Coach Omar Hassan',
    hostInitials: 'OH',
    hostAvatarColor: '#0284C7',
    hostRole: 'Certified Olympic Strength & Pilates Coach',
    deliveryNote: 'Provided at your residence, hotel gym, or garden',
    city: 'Cairo & Sheikh Zayed',
    priceFrom: '$85',
    priceUnit: '/ session',
    rating: 4.98,
    reviewsCount: 67,
    badge: 'Elite Coach',
    coverImage: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1000&q=85',
    description:
      'Stay in peak physical condition while traveling with customized 1-on-1 strength, TRX, kettlebell, and mobility sessions tailored to your goals.',
    coverageCity: 'New Cairo, Sheikh Zayed, Zamalek & Maadi',
    coverageLat: 30.0444,
    coverageLng: 31.2357,
    packages: [
      {
        id: 'pkg-fit-1',
        title: 'Private 60-Min Strength & Metabolic Conditioning',
        description: 'Full portable equipment kit (kettlebells, bands, TRX) brought to your suite.',
        price: '$85 / session',
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=85',
      },
    ],
    guestRequirements: 'All fitness levels welcome.',
    accessibilityInfo: 'Exercises adapted to any injury or mobility requirement.',
    cancellationPolicy: 'For a full 100% refund, cancel at least 1 day before the session.',
  },

  // ── CAR RENTAL PROVIDERS ──
  {
    id: 'prov-vanir-fleet',
    categoryKey: 'car',
    title: 'Executive Chauffeur & Exotic SUV Delivery',
    subtitle: 'Mercedes-Maybach, Range Rover Autobiography & G-Class Fleet',
    hostName: 'Vanir Royal Fleet',
    hostInitials: 'VF',
    hostAvatarColor: '#0D1626',
    hostRole: 'Official VIP Chauffeur & Exotic Rental Desk',
    deliveryNote: 'Delivered directly to your airport terminal or hotel door',
    city: 'Cairo, Hurghada & Dubai',
    priceFrom: '$190',
    oldPrice: '$240',
    priceUnit: '/ day',
    rating: 4.99,
    reviewsCount: 318,
    badge: 'Save 20%',
    coverImage: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1000&q=85',
    description:
      'Save up to 20% with our preferred executive fleet partners. Choose between self-drive luxury SUVs delivered to your door or a 24/7 uniformed multilingual chauffeur.',
    coverageCity: 'Cairo International Airport, Sheikh Zayed, New Cairo, Hurghada & Dubai',
    coverageLat: 30.0444,
    coverageLng: 31.2357,
    packages: [
      {
        id: 'pkg-car-1',
        title: 'Range Rover Autobiography (Self-Drive or Chauffeur)',
        description: '24-hour rental with VIP comprehensive insurance and airport meet & greet.',
        price: '$290 / day',
        image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&q=85',
      },
      {
        id: 'pkg-car-2',
        title: 'Mercedes-Maybach S680 with Protocol Chauffeur',
        description: '10-hour dedicated chauffeur, onboard Wi-Fi, refreshments & VIP security.',
        price: '$420 / day',
        image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&q=85',
      },
    ],
    guestRequirements: 'Valid passport & driving license for self-drive; no requirements for chauffeur.',
    accessibilityInfo: 'Door-to-door tarmac and hotel porte-cochère pickup.',
    cancellationPolicy: 'Free cancellation up to 24 hours before vehicle delivery.',
  },

  // ── MOST POPULAR CULTURAL & CULINARY EXPERIENCES (Matching Screenshots 8, 9, 10!) ──
  {
    id: 'exp-cairo-food-walk',
    categoryKey: 'experiences',
    sectionGroup: 'popular_experiences',
    title: 'Cairo Walking & Authentic Culinary Tasting Tour',
    subtitle: 'Taste 12+ signature Egyptian delicacies with a culinary historian',
    hostName: 'Tarek El-Masry',
    hostInitials: 'TM',
    hostAvatarColor: '#D97706',
    hostRole: 'Culinary Historian & Local Host in Cairo',
    deliveryNote: 'Guided walking & private tasting tour in Downtown Cairo',
    city: 'Downtown Cairo',
    priceFrom: '$45',
    priceUnit: '/ guest',
    rating: 4.95,
    reviewsCount: 214,
    badge: 'Most Popular',
    coverImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&q=85',
    description:
      'Stroll through Belle Époque Downtown Cairo and historic alleys while tasting authentic koshary, wood-fired feteer, artisan shawarma, and heritage oriental pastries at hidden family-run gems.',
    coverageCity: 'Downtown Cairo, Zamalek & Old Cairo',
    coverageLat: 30.0478,
    coverageLng: 31.2386,
    packages: [
      {
        id: 'pkg-food-1',
        title: '4-Hour Signature Cairo Culinary & Heritage Walk',
        description: 'Includes all 12 food & drink tastings, private guide, and rooftop tea.',
        price: '$45 / guest',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=85',
      },
    ],
    guestRequirements: 'All ages welcome; vegetarian options included.',
    accessibilityInfo: 'Gentle flat walking route with seated tasting stops every 20 minutes.',
    cancellationPolicy: 'For a full 100% refund, cancel at least 1 day before the start time.',
  },
  {
    id: 'exp-egyptian-bazaar',
    categoryKey: 'experiences',
    sectionGroup: 'popular_experiences',
    title: 'Immerse in Egyptian Life & Khan El Khalili Bazaar',
    subtitle: 'Private storytelling, artisan workshops & historic caravanserais',
    hostName: 'Nourhan & Hany',
    hostInitials: 'NH',
    hostAvatarColor: '#0D1626',
    hostRole: 'Cultural Ambassadors in Historic Cairo',
    deliveryNote: 'Private guided cultural immersion in Old Cairo',
    city: 'Historic Cairo',
    priceFrom: '$39',
    priceUnit: '/ guest',
    rating: 4.97,
    reviewsCount: 310,
    badge: 'Most Popular',
    coverImage: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=1000&q=85',
    description:
      'Go beyond tourist paths into the living heart of Islamic Cairo. Meet master brass engravers, spice merchants, and perfumers in 14th-century souks, ending with mint tea at El Fishawy.',
    coverageCity: 'Al-Muizz Street, Khan El Khalili & Al-Azhar',
    coverageLat: 30.0477,
    coverageLng: 31.2623,
    packages: [
      {
        id: 'pkg-baz-1',
        title: 'Private Old Cairo & Bazaar Insider Walk (3.5 Hours)',
        description: 'Includes private Egyptologist host, artisan visits, and traditional café hospitality.',
        price: '$39 / guest',
        image: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=600&q=85',
      },
    ],
    guestRequirements: 'Guests of all ages welcome.',
    accessibilityInfo: 'Private car pickup and drop-off available upon request.',
    cancellationPolicy: 'For a full 100% refund, cancel at least 1 day before the start time.',
  },

  // ── GUEST FAVORITE RESIDENCES (Alexandria, Hurghada & Sheikh Zayed) ──
  {
    id: 'stay-alex-corniche',
    categoryKey: 'homes',
    sectionGroup: 'alexandria',
    title: 'Royal Sea-View Residence in Alexandria',
    subtitle: 'San Stefano Corniche • Panoramic Mediterranean Balcony',
    hostName: 'Vanir Royal Residences',
    hostInitials: 'VR',
    hostAvatarColor: '#0D1626',
    hostRole: 'Verified Luxury Residence Host',
    deliveryNote: 'Entire serviced sea-view apartment • 3 Bedrooms',
    city: 'Alexandria',
    priceFrom: '$195',
    priceUnit: 'for 2 nights',
    rating: 4.96,
    reviewsCount: 84,
    badge: 'Guest Favorite',
    coverImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000&q=85',
    description:
      'Direct Mediterranean sea views from your high-floor marble salon in San Stefano, Alexandria. Features 3 master suites, smart home automation, and 24/7 concierge security.',
    coverageCity: 'San Stefano Corniche, Alexandria',
    coverageLat: 31.2456,
    coverageLng: 29.9665,
    packages: [
      {
        id: 'pkg-alex-1',
        title: '2-Night Weekend Sea-View Stay',
        description: 'Includes daily housekeeping, private parking, and high-speed fiber Wi-Fi.',
        price: '$195 / 2 nights',
        image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=85',
      },
    ],
    guestRequirements: 'Up to 6 guests; family & VIP corporate stays welcome.',
    accessibilityInfo: 'High-speed private elevator direct from underground parking.',
    cancellationPolicy: 'Free cancellation up to 48 hours before check-in.',
    routeTarget: 'HotelApartments',
  },
  {
    id: 'stay-alex-sanstefano',
    categoryKey: 'homes',
    sectionGroup: 'alexandria',
    title: 'Suite in San Stefano Grand Bay',
    subtitle: 'Direct Sea Terrace • Private Beach Access',
    hostName: 'San Stefano Suites',
    hostInitials: 'SS',
    hostAvatarColor: '#9A7B38',
    hostRole: 'Superhost in Alexandria',
    deliveryNote: 'Entire beachfront suite • 2 Bedrooms',
    city: 'Alexandria',
    priceFrom: '$145',
    priceUnit: 'for 2 nights',
    rating: 4.85,
    reviewsCount: 52,
    badge: 'Sea View',
    coverImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1000&q=85',
    description:
      'Enjoy morning coffee on your private sun terrace overlooking the Mediterranean waves in the prestigious San Stefano district.',
    coverageCity: 'San Stefano, Alexandria',
    coverageLat: 31.2442,
    coverageLng: 29.9651,
    packages: [
      {
        id: 'pkg-alex-2',
        title: '2-Night Coastal Suite Escape',
        description: 'Full sea-view terrace, designer kitchen, and beach club access.',
        price: '$145 / 2 nights',
        image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=85',
      },
    ],
    guestRequirements: 'Up to 4 guests.',
    accessibilityInfo: 'Step-free elevator access.',
    cancellationPolicy: 'Free cancellation up to 48 hours before check-in.',
    routeTarget: 'HotelApartments',
  },
  {
    id: 'stay-hurghada-lagoon',
    categoryKey: 'homes',
    sectionGroup: 'hurghada',
    title: 'Beachfront Lagoon Suite in Hurghada',
    subtitle: 'Sahl Hasheesh & El Gouna • Private Red Sea Horizon',
    hostName: 'Red Sea Royal Estates',
    hostInitials: 'RS',
    hostAvatarColor: '#0284C7',
    hostRole: 'Luxury Red Sea Host',
    deliveryNote: 'Entire beachfront residence • Heated Pool',
    city: 'Hurghada',
    priceFrom: '$260',
    priceUnit: 'for 2 nights',
    rating: 5.0,
    reviewsCount: 119,
    badge: 'Guest Favorite',
    coverImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1000&q=85',
    description:
      'Wake up to crystal-clear turquoise Red Sea views right from your king bed. Includes private beach access, heated infinity pool, and optional yacht marina mooring.',
    coverageCity: 'Sahl Hasheesh & El Gouna, Hurghada',
    coverageLat: 27.0418,
    coverageLng: 33.8924,
    packages: [
      {
        id: 'pkg-hrg-1',
        title: '2-Night Red Sea Beachfront Stay',
        description: 'Direct beach access, private sun loungers, and concierge room service.',
        price: '$260 / 2 nights',
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=85',
      },
    ],
    guestRequirements: 'Up to 4 guests.',
    accessibilityInfo: 'Ground-floor beachfront terrace access.',
    cancellationPolicy: 'Free cancellation up to 48 hours before check-in.',
    routeTarget: 'HotelApartments',
  },
  {
    id: 'stay-zayed-penthouse',
    categoryKey: 'homes',
    sectionGroup: 'hurghada',
    title: 'Designer Penthouse in Sheikh Zayed City',
    subtitle: 'Allegria & ZED Park View • Gated VIP Compound',
    hostName: 'Zayed Signature Stays',
    hostInitials: 'ZS',
    hostAvatarColor: '#0D1626',
    hostRole: 'Executive Compound Host',
    deliveryNote: 'Entire designer penthouse • Smart Home',
    city: 'Sheikh Zayed',
    priceFrom: '$175',
    priceUnit: 'for 2 nights',
    rating: 4.92,
    reviewsCount: 68,
    badge: 'Guest Favorite',
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&q=85',
    description:
      'Architectural penthouse with cove lighting, 75-inch cinema lounge, and private terrace in Sheikh Zayed’s most prestigious gated community.',
    coverageCity: 'Sheikh Zayed City, West Cairo',
    coverageLat: 30.0444,
    coverageLng: 30.9762,
    packages: [
      {
        id: 'pkg-zayed-1',
        title: '2-Night Executive Penthouse Stay',
        description: 'Smart self check-in, clubhouse access, and 24/7 compound security.',
        price: '$175 / 2 nights',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=85',
      },
    ],
    guestRequirements: 'Up to 5 guests.',
    accessibilityInfo: 'Private elevator with smart lock entry.',
    cancellationPolicy: 'Free cancellation up to 48 hours before check-in.',
    routeTarget: 'HotelApartments',
  },
];

function buildCoverageMapHtml(lat: number, lng: number, cityLabel: string) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body, #map { width:100%; height:100%; background:#E5E3DF; font-family:-apple-system,sans-serif; }
  .g-logo {
    position:absolute; bottom:8px; right:10px; z-index:500;
    font-size:15px; font-weight:800; color:#3C4043;
    text-shadow: 0 1px 2px #FFF;
  }
</style>
</head>
<body>
<div id="map"></div>
<div class="g-logo">Google</div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  const map = L.map('map', {
    center: [${lat}, ${lng}],
    zoom: 10,
    zoomControl: false,
    attributionControl: false,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false
  });
  L.tileLayer('https://{s}.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}', {
    subdomains: ['mt0','mt1','mt2','mt3'],
    maxZoom: 18
  }).addTo(map);
  // Shaded octagon coverage polygon matching Screenshot 2
  const d = 0.14;
  const poly = [
    [${lat} + d, ${lng} - d*0.5],
    [${lat} + d*0.7, ${lng} + d*0.8],
    [${lat} - d*0.2, ${lng} + d*1.2],
    [${lat} - d*0.9, ${lng} + d*0.4],
    [${lat} - d*1.1, ${lng} - d*0.2],
    [${lat} - d*0.5, ${lng} - d*1.0],
    [${lat} + d*0.3, ${lng} - d*1.1]
  ];
  L.polygon(poly, {
    color: '#57534E',
    weight: 2,
    dashArray: '4, 5',
    fillColor: '#78716C',
    fillOpacity: 0.28
  }).addTo(map);
  L.circleMarker([${lat}, ${lng}], {
    radius: 5,
    color: '#1C1917',
    fillColor: '#FFFFFF',
    fillOpacity: 1,
    weight: 3
  }).addTo(map);
</script>
</body>
</html>`;
}

function buildDestinationHotelsMapHtml(
  cityName: string,
  countryName: string,
  hotels: DestinationHotelInfo[],
  lat: number,
  lng: number
) {
  const hotelPinsJs = hotels
    .map(
      (h, idx) => `
    (function() {
      const el = document.createElement('div');
      el.className = 'hotel-pin';
      el.innerHTML = '<div class="pin-bubble">${h.price.split(' ')[0]}</div><div class="pin-stem"></div>';
      const customIcon = L.divIcon({
        className: 'custom-hotel-marker',
        html: el.outerHTML,
        iconSize: [72, 38],
        iconAnchor: [36, 38],
        popupAnchor: [0, -36]
      });
      const marker = L.marker([${h.lat}, ${h.lng}], { icon: customIcon }).addTo(map);
      marker.bindPopup(\`
        <div style="font-family:-apple-system,sans-serif;min-width:180px;padding:4px;">
          <div style="font-weight:800;font-size:13px;color:#1C1917;margin-bottom:2px;">\${decodeURIComponent("${encodeURIComponent(h.name)}")}</div>
          <div style="font-size:11px;color:#C5A059;font-weight:700;margin-bottom:4px;">⭐ ${h.rating.toFixed(2)} · ${h.price}</div>
          <div style="font-size:10.5px;color:#78716C;line-height:14px;">\${decodeURIComponent("${encodeURIComponent(h.highlights)}")}</div>
        </div>
      \`);
      ${idx === 0 ? 'setTimeout(() => marker.openPopup(), 400);' : ''}
    })();
  `
    )
    .join('\n');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body, #map { width:100%; height:100%; background:#F8FAFC; font-family:-apple-system,sans-serif; }
  .g-logo {
    position:absolute; bottom:8px; right:10px; z-index:500;
    font-size:14px; font-weight:800; color:#3C4043;
    text-shadow: 0 1px 2px #FFF;
  }
  .pin-bubble {
    background: #0D1626;
    color: #F8D384;
    border: 1.5px solid #C5A059;
    border-radius: 14px;
    padding: 4px 8px;
    font-size: 11px;
    font-weight: 800;
    text-align: center;
    box-shadow: 0 4px 10px rgba(0,0,0,0.35);
    white-space: nowrap;
  }
  .pin-stem {
    width: 0;
    height: 0;
    margin: 0 auto;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 6px solid #0D1626;
  }
  .leaflet-popup-content-wrapper {
    border-radius: 12px;
    box-shadow: 0 6px 18px rgba(0,0,0,0.2);
  }
</style>
</head>
<body>
<div id="map"></div>
<div class="g-logo">Google</div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  const map = L.map('map', {
    center: [${lat}, ${lng}],
    zoom: 12,
    zoomControl: false,
    attributionControl: false
  });
  L.tileLayer('https://{s}.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}', {
    subdomains: ['mt0','mt1','mt2','mt3'],
    maxZoom: 18
  }).addTo(map);

  ${hotelPinsJs}
</script>
</body>
</html>`;
}

interface Props {
  navigation: any;
  compactMode?: boolean;
  hideServiceCategories?: boolean;
  destinationsOnly?: boolean;
}

const CACHE_LIFESTYLE_PROVIDERS_KEY = '@vanir_cached_lifestyle_providers_v4';
const CACHE_DESTINATIONS_DATA_KEY = '@vanir_cached_destinations_data_v4';

let memoryLifestyleProviders: LifestyleServiceProvider[] | null = null;
let memoryDestinationsData: MustVisitDestination[] | null = null;

// Eager preload from AsyncStorage so cold starts have cached data immediately
AsyncStorage.getItem(CACHE_LIFESTYLE_PROVIDERS_KEY)
  .then(raw => {
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryLifestyleProviders = parsed;
        }
      } catch {}
    }
  })
  .catch(() => {});

AsyncStorage.getItem(CACHE_DESTINATIONS_DATA_KEY)
  .then(raw => {
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryDestinationsData = parsed;
        }
      } catch {}
    }
  })
  .catch(() => {});

export function InteractiveServicesSection({
  navigation,
  compactMode = false,
  hideServiceCategories = false,
  destinationsOnly = false,
}: Props) {
  const [activeFilter, setActiveFilter] = useState<InteractiveCategoryFilter>('all');
  const [providers, setProviders] = useState<LifestyleServiceProvider[]>(
    () => memoryLifestyleProviders || DEFAULT_LIFESTYLE_PROVIDERS
  );
  const [destinationsList, setDestinationsList] = useState<MustVisitDestination[]>(
    () => memoryDestinationsData || MUST_VISIT_DESTINATIONS
  );
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({
    'prov-ayman-photo': true,
    'prov-abdul-horse': true,
    'stay-alex-corniche': true,
  });

  // Level 2: Category Providers List Modal State
  const [activeCategoryModal, setActiveCategoryModal] = useState<ServiceCategoryKey | null>(null);
  const [timeOfDayFilter, setTimeOfDayFilter] = useState<'Anytime' | 'Morning' | 'Evening'>('Anytime');
  const [showCatDropdown, setShowCatDropdown] = useState(false);

  // Level 3: Full Provider Details Screen Modal State
  const [selectedProvider, setSelectedProvider] = useState<LifestyleServiceProvider | null>(null);
  const [selectedPkgId, setSelectedPkgId] = useState<string | null>(null);

  // Immediate storage cache hydration on mount to guarantee latest images from frame 1
  useEffect(() => {
    if (!memoryLifestyleProviders) {
      AsyncStorage.getItem(CACHE_LIFESTYLE_PROVIDERS_KEY)
        .then(raw => {
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed) && parsed.length > 0) {
                memoryLifestyleProviders = parsed;
                setProviders(parsed);
              }
            } catch {}
          }
        })
        .catch(() => {});
    }

    if (!memoryDestinationsData) {
      AsyncStorage.getItem(CACHE_DESTINATIONS_DATA_KEY)
        .then(raw => {
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed) && parsed.length > 0) {
                memoryDestinationsData = parsed;
                setDestinationsList(parsed);
              }
            } catch {}
          }
        })
        .catch(() => {});
    }
  }, []);

  // Real-time Firestore listener: updates memory cache and disk cache simultaneously
  useEffect(() => {
    try {
      const unsub = firestore()
        .collection('lifestyle_services')
        .onSnapshot(
          snap => {
            if (!snap || snap.empty) return;
            const liveMap: Record<string, Partial<LifestyleServiceProvider>> = {};
            const extraProviders: LifestyleServiceProvider[] = [];
            snap.forEach(doc => {
              const data = doc.data() as Partial<LifestyleServiceProvider>;
              if (!data) return;
              const matchDefault = DEFAULT_LIFESTYLE_PROVIDERS.find(p => p.id === doc.id);
              if (matchDefault) {
                liveMap[doc.id] = data;
              } else if (data.title && data.coverImage) {
                extraProviders.push({
                  ...DEFAULT_LIFESTYLE_PROVIDERS[0],
                  ...data,
                  id: doc.id,
                  packages: Array.isArray(data.packages) && data.packages.length > 0
                    ? data.packages
                    : [
                        {
                          id: `${doc.id}-pkg-1`,
                          title: data.title,
                          description: data.subtitle || data.description || 'VIP Service Session',
                          price: `${data.priceFrom || '$120'} ${data.priceUnit || '/ guest'}`,
                          image: data.coverImage,
                        },
                      ],
                });
              }
            });

            const merged = DEFAULT_LIFESTYLE_PROVIDERS.map(def => {
              const override = liveMap[def.id];
              if (!override) return def;
              return {
                ...def,
                ...override,
                packages:
                  Array.isArray(override.packages) && override.packages.length > 0
                    ? override.packages
                    : def.packages,
              };
            });

            const updated = [...extraProviders, ...merged];
            memoryLifestyleProviders = updated;
            setProviders(updated);
            AsyncStorage.setItem(CACHE_LIFESTYLE_PROVIDERS_KEY, JSON.stringify(updated)).catch(() => {});
          },
          () => {},
        );
      return () => unsub();
    } catch {
      // Fallback to default providers offline
    }
  }, []);

  // Real-time Firestore listener for destinations (so admin dashboard image changes reflect immediately)
  useEffect(() => {
    try {
      const unsubDest = firestore()
        .collection('destinations')
        .onSnapshot(
          snap => {
            if (!snap || snap.empty) return;
            const liveDestMap: Record<string, any> = {};
            snap.forEach(doc => {
              const d = doc.data();
              if (d && (d.image || d.imageUrl)) {
                liveDestMap[doc.id.toLowerCase()] = d;
                if (d.name) {
                  liveDestMap[d.name.toLowerCase()] = d;
                }
              }
            });

            const merged = MUST_VISIT_DESTINATIONS.map(def => {
              const live = liveDestMap[def.id.toLowerCase()] || liveDestMap[def.city.toLowerCase()];
              if (!live) return def;
              return {
                ...def,
                image: live.image || live.imageUrl || def.image,
                tagline: live.tagline || live.description || def.tagline,
              };
            });

            memoryDestinationsData = merged;
            setDestinationsList(merged);
            AsyncStorage.setItem(CACHE_DESTINATIONS_DATA_KEY, JSON.stringify(merged)).catch(() => {});
          },
          () => {},
        );
      return () => unsubDest();
    } catch {}
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(WISHLIST_STORAGE_KEY)
      .then(saved => {
        if (saved) setWishlist(JSON.parse(saved));
      })
      .catch(() => {});
  }, []);

  const toggleWishlist = useCallback((id: string) => {
    setWishlist(prev => {
      const next = { ...prev, [id]: !prev[id] };
      AsyncStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const openProviderDetails = useCallback((prov: LifestyleServiceProvider) => {
    setSelectedProvider(prov);
    setSelectedPkgId(prov.packages?.[0]?.id || null);
  }, []);

  const categoryProviders = useMemo(() => {
    if (!activeCategoryModal) return [];
    return providers.filter(p => p.categoryKey === activeCategoryModal);
  }, [activeCategoryModal, providers]);

  const popularExperiences = useMemo(
    () => providers.filter(p => p.sectionGroup === 'popular_experiences'),
    [providers],
  );
  const memoryExperiences = useMemo(
    () => providers.filter(p => p.sectionGroup === 'memories'),
    [providers],
  );
  const alexandriaStays = useMemo(
    () => providers.filter(p => p.sectionGroup === 'alexandria'),
    [providers],
  );
  const hurghadaStays = useMemo(
    () => providers.filter(p => p.sectionGroup === 'hurghada'),
    [providers],
  );

  // Level 4: Destination Hotels Map Modal State
  const [selectedDestination, setSelectedDestination] = useState<MustVisitDestination | null>(null);

  const insets = useSafeAreaInsets();
  const showServices = activeFilter === 'all' || activeFilter === 'services';
  const showServicesSection = showServices && !hideServiceCategories;
  const showExperiences = activeFilter === 'all' || activeFilter === 'experiences';
  const showHomes = activeFilter === 'all' || activeFilter === 'homes';

  const activeCatMeta = SERVICE_CATEGORIES_META.find(c => c.key === activeCategoryModal);

  return (
    <View style={styles.container}>
      {/* 1. Artistic Luxury Filter Strip (Harmonized with Royal Navy & Champagne Gold) */}
      {!compactMode && !destinationsOnly && (
        <View style={styles.artisticHeaderWrap}>
          <View style={styles.artisticTitleRow}>
            <View>
              <View style={styles.kickerRow}>
                <Sparkles size={12} color="#C5A059" />
                <Text style={styles.kickerText}>INTERACTIVE CONCIERGE & CURATED LIVING</Text>
              </View>
              <Text style={styles.mainArtTitle}>Explore Services, Experiences & Stays</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsRow}
          >
            {(
              [
                { key: 'all', label: 'All Portfolio', icon: 'pill_all' },
                { key: 'services', label: 'In-Suite Services', icon: 'pill_services' },
                { key: 'experiences', label: 'Cultural Experiences', icon: 'pill_experiences' },
                { key: 'homes', label: 'Royal Residences', icon: 'pill_homes' },
              ] as { key: InteractiveCategoryFilter; label: string; icon: LifestyleIconKey }[]
            ).map(tab => {
              const isSelected = activeFilter === tab.key;
              return (
                <Pressable
                  key={tab.key}
                  onPress={() => setActiveFilter(tab.key)}
                  style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                >
                  <BespokeLifestyleIcon name={tab.icon} size={26} />
                  <Text
                    style={[
                      styles.categoryPillLabel,
                      isSelected && styles.categoryPillLabelActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* 2. Bespoke Lifestyle Services Near You (Vector-Sharp Original 3D Royal Icons) */}
      {showServicesSection && !destinationsOnly && (
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Bespoke Services Available in Cairo</Text>
              <Text style={styles.sectionSubtitle}>
                Tap any category to browse verified specialists & book in-suite packages
              </Text>
            </View>
            <Pressable
              style={styles.circleArrowBtn}
              onPress={() => setActiveCategoryModal('massage')}
            >
              <ArrowRight color="#C5A059" size={16} strokeWidth={2.4} />
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.servicesRow}
          >
            {SERVICE_CATEGORIES_META.map(cat => (
              <Pressable
                key={cat.key}
                style={({ pressed }) => [
                  styles.serviceCatCard,
                  pressed && { transform: [{ scale: 0.96 }] },
                ]}
                onPress={() => setActiveCategoryModal(cat.key)}
              >
                <View style={styles.serviceCatIconBox}>
                  <BespokeLifestyleIcon name={cat.iconKey} size={50} />
                </View>
                <Text style={styles.serviceCatTitle} numberOfLines={1}>
                  {cat.label}
                </Text>
                <Text style={styles.serviceCatSub} numberOfLines={1}>
                  {cat.countLabel}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* 3. Don't Miss These Destinations (Matching Screenshots 8, 9, 10!) */}
      {!compactMode && (
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Don’t Miss These Destinations</Text>
              <Text style={styles.sectionSubtitle}>
                Curated international capitals & Red Sea sanctuaries — tap for hotel map & suites
              </Text>
            </View>
            <Pressable
              style={styles.circleArrowBtn}
              onPress={() => navigation.navigate('Destinations')}
            >
              <ArrowRight color="#C5A059" size={16} strokeWidth={2.4} />
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalCardsRow}
          >
            {destinationsList.map(dest => (
              <Pressable
                key={dest.id}
                style={({ pressed }) => [
                  styles.destSpotCard,
                  pressed && { transform: [{ scale: 0.97 }] },
                ]}
                onPress={() => setSelectedDestination(dest)}
              >
                <View style={styles.destSpotImgWrap}>
                  <Image
                    source={{ uri: dest.image }}
                    style={styles.destSpotImg}
                    resizeMode="cover"
                  />
                </View>
                <Text style={styles.destSpotCity} numberOfLines={1}>
                  {dest.city}
                </Text>
                <Text style={styles.destSpotTagline} numberOfLines={2}>
                  {dest.tagline}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* 4. Capture Memories in a Destination Near You + Most Popular Experiences */}
      {showExperiences && !compactMode && !destinationsOnly && (
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>
                Capture Memories & Popular Experiences
              </Text>
              <Text style={styles.sectionSubtitle}>
                Tap any experience to view packages, host details & coverage map
              </Text>
            </View>
            <Pressable
              style={styles.circleArrowBtn}
              onPress={() => setActiveCategoryModal('photography')}
            >
              <ArrowRight color="#C5A059" size={16} strokeWidth={2.4} />
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalCardsRow}
          >
            {[...memoryExperiences, ...popularExperiences].map(item => {
              const isLiked = !!wishlist[item.id];
              return (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [
                    styles.discoveryCard,
                    pressed && { transform: [{ scale: 0.98 }] },
                  ]}
                  onPress={() => openProviderDetails(item)}
                >
                  <View style={styles.discoveryImageWrap}>
                    <Image
                      source={{ uri: item.coverImage }}
                      style={styles.discoveryImage}
                      resizeMode="cover"
                    />
                    {item.badge && (
                      <View style={styles.guestFavBadge}>
                        <Text style={styles.guestFavText}>{item.badge}</Text>
                      </View>
                    )}
                    <Pressable
                      style={styles.heartBtn}
                      onPress={() => toggleWishlist(item.id)}
                      hitSlop={10}
                    >
                      <Heart
                        size={20}
                        color="#FFFFFF"
                        fill={isLiked ? '#FF385C' : 'rgba(0,0,0,0.38)'}
                        strokeWidth={2}
                      />
                    </Pressable>
                  </View>

                  <Text style={styles.discoveryTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.discoverySub} numberOfLines={1}>
                    From <Text style={styles.priceUnderline}>{item.priceFrom}</Text> {item.priceUnit}
                  </Text>
                  <View style={styles.ratingRow}>
                    <Star size={12} color="#C5A059" fill="#C5A059" />
                    <Text style={styles.ratingText}>
                      {item.rating.toFixed(2)} · {item.reviewsCount} reviews
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* 5. Trending Residences in Alexandria & Hurghada */}
      {showHomes && !compactMode && !destinationsOnly && (
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>
                Trending Residences in Alexandria & Red Sea
              </Text>
              <Text style={styles.sectionSubtitle}>
                Guest-favorite sea-view suites, penthouses & beachfront chalets
              </Text>
            </View>
            <Pressable
              style={styles.circleArrowBtn}
              onPress={() => navigation.navigate('HotelApartments')}
            >
              <ArrowRight color="#C5A059" size={16} strokeWidth={2.4} />
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalCardsRow}
          >
            {[...alexandriaStays, ...hurghadaStays].map(stay => {
              const isLiked = !!wishlist[stay.id];
              return (
                <Pressable
                  key={stay.id}
                  style={({ pressed }) => [
                    styles.discoveryCard,
                    pressed && { transform: [{ scale: 0.98 }] },
                  ]}
                  onPress={() => openProviderDetails(stay)}
                >
                  <View style={styles.discoveryImageWrap}>
                    <Image
                      source={{ uri: stay.coverImage }}
                      style={styles.discoveryImage}
                      resizeMode="cover"
                    />
                    {stay.badge && (
                      <View style={styles.guestFavBadge}>
                        <Text style={styles.guestFavText}>{stay.badge}</Text>
                      </View>
                    )}
                    <Pressable
                      style={styles.heartBtn}
                      onPress={() => toggleWishlist(stay.id)}
                      hitSlop={10}
                    >
                      <Heart
                        size={20}
                        color="#FFFFFF"
                        fill={isLiked ? '#FF385C' : 'rgba(0,0,0,0.38)'}
                        strokeWidth={2}
                      />
                    </Pressable>
                  </View>

                  <Text style={styles.discoveryTitle} numberOfLines={1}>
                    {stay.title}
                  </Text>
                  <View style={styles.priceRatingInline}>
                    <Text style={styles.discoverySub}>
                      {stay.priceFrom} {stay.priceUnit}
                    </Text>
                    <Text style={styles.dotSep}>•</Text>
                    <Star size={11} color="#C5A059" fill="#C5A059" />
                    <Text style={styles.ratingText}>{stay.rating.toFixed(2)}</Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          LEVEL 2 MODAL: Category Providers Catalog Screen (Screenshots 4, 5, 6, 7)
         ═══════════════════════════════════════════════════════════════════════ */}
      <Modal
        visible={!!activeCategoryModal}
        animationType="slide"
        onRequestClose={() => setActiveCategoryModal(null)}
      >
        <View style={styles.catScreenContainer}>
          {/* Top Floating Search/Context Bar */}
          <View style={styles.catTopBar}>
            <Pressable
              style={styles.catTopIconBtn}
              onPress={() => setActiveCategoryModal(null)}
            >
              <ArrowLeft size={20} color="#1C1917" strokeWidth={2.2} />
            </Pressable>

            <View style={styles.catCenterPill}>
              <Text style={styles.catCenterTitle}>Services in Cairo</Text>
              <Text style={styles.catCenterSub}>
                {timeOfDayFilter} · {activeCatMeta?.label || 'Services'}
              </Text>
            </View>

            <Pressable
              style={styles.catTopIconBtn}
              onPress={() => setShowCatDropdown(prev => !prev)}
            >
              <SlidersHorizontal size={18} color="#1C1917" strokeWidth={2.2} />
            </Pressable>
          </View>

          {/* Filter Dropdown Pills Row */}
          <View style={styles.catFilterPillsRow}>
            <Pressable
              style={styles.catFilterPillActive}
              onPress={() => setShowCatDropdown(prev => !prev)}
            >
              <Text style={styles.catFilterPillActiveText}>
                {activeCatMeta?.label || 'Category'}
              </Text>
              <ChevronDown size={15} color="#1C1917" />
            </Pressable>

            <Pressable
              style={styles.catFilterPillInactive}
              onPress={() =>
                setTimeOfDayFilter(prev =>
                  prev === 'Anytime'
                    ? 'Morning'
                    : prev === 'Morning'
                    ? 'Evening'
                    : 'Anytime',
                )
              }
            >
              <Text style={styles.catFilterPillInactiveText}>
                Time: {timeOfDayFilter}
              </Text>
              <ChevronDown size={15} color="#57534E" />
            </Pressable>
          </View>

          {/* Optional Category Switcher Strip */}
          {showCatDropdown && (
            <View style={styles.catDropdownStrip}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
              >
                {SERVICE_CATEGORIES_META.map(c => {
                  const isAct = c.key === activeCategoryModal;
                  return (
                    <Pressable
                      key={c.key}
                      style={[
                        styles.catSwitchChip,
                        isAct && styles.catSwitchChipActive,
                      ]}
                      onPress={() => {
                        setActiveCategoryModal(c.key);
                        setShowCatDropdown(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.catSwitchChipText,
                          isAct && styles.catSwitchChipTextActive,
                        ]}
                      >
                        {c.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.catScrollContent}
          >
            <Text style={styles.catExploreHeading}>
              Explore {categoryProviders.length} {activeCatMeta?.label} Services
            </Text>

            {categoryProviders.map(prov => {
              const isLiked = !!wishlist[prov.id];
              return (
                <Pressable
                  key={prov.id}
                  style={styles.providerBigCard}
                  onPress={() => openProviderDetails(prov)}
                >
                  <View style={styles.providerBigImgWrap}>
                    <Image
                      source={{ uri: prov.coverImage }}
                      style={styles.providerBigImg}
                      resizeMode="cover"
                    />
                    {prov.badge && (
                      <View style={styles.guestFavBadge}>
                        <Text style={styles.guestFavText}>{prov.badge}</Text>
                      </View>
                    )}
                    <Pressable
                      style={styles.heartBtnBig}
                      onPress={() => toggleWishlist(prov.id)}
                    >
                      <Heart
                        size={22}
                        color="#FFFFFF"
                        fill={isLiked ? '#FF385C' : 'rgba(0,0,0,0.35)'}
                        strokeWidth={2}
                      />
                    </Pressable>
                  </View>

                  <Text style={styles.providerBigTitle}>{prov.title}</Text>
                  <Text style={styles.providerBigSub}>{prov.subtitle}</Text>
                  <View style={styles.providerBigMetaRow}>
                    <Star size={13} color="#1C1917" fill="#1C1917" />
                    <Text style={styles.providerBigRating}>
                      {prov.rating.toFixed(1)} · {prov.reviewsCount} reviews
                    </Text>
                  </View>
                  <Text style={styles.providerBigPriceLine}>
                    From{' '}
                    {prov.oldPrice && (
                      <Text style={styles.strikethroughPrice}>{prov.oldPrice} </Text>
                    )}
                    <Text style={styles.providerBigPriceBold}>{prov.priceFrom}</Text>{' '}
                    {prov.priceUnit}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>

      {/* ═══════════════════════════════════════════════════════════════════════
          LEVEL 3 MODAL: Full Provider Details Page (Screenshots 1, 2, 3!)
         ═══════════════════════════════════════════════════════════════════════ */}
      <Modal
        visible={!!selectedProvider}
        animationType="slide"
        onRequestClose={() => setSelectedProvider(null)}
      >
        {selectedProvider && (
          <View style={styles.detailScreenContainer}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 130, 160) }}
            >
              {/* 1. Full-Bleed Hero Cover Image + Floating Top Action Buttons */}
              <View style={styles.detailHeroBox}>
                <Image
                  source={{ uri: selectedProvider.coverImage }}
                  style={styles.detailHeroImg}
                  resizeMode="cover"
                />
                <View
                  style={[
                    styles.detailTopFloatingBar,
                    { top: Math.max(insets.top + 8, 16) },
                  ]}
                >
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Pressable
                      style={styles.detailCircleBtn}
                      onPress={() => toggleWishlist(selectedProvider.id)}
                    >
                      <Heart
                        size={20}
                        color="#1C1917"
                        fill={wishlist[selectedProvider.id] ? '#FF385C' : 'transparent'}
                      />
                    </Pressable>
                    <Pressable
                      style={styles.detailCircleBtn}
                      onPress={() => {
                        Share.share({
                          message: `${selectedProvider.title} — ${selectedProvider.subtitle} (${selectedProvider.priceFrom} ${selectedProvider.priceUnit}) on Vanir Royal Concierge`,
                        }).catch(() => {});
                      }}
                    >
                      <Share2 size={19} color="#1C1917" />
                    </Pressable>
                  </View>

                  <Pressable
                    style={styles.detailCircleBtn}
                    onPress={() => setSelectedProvider(null)}
                  >
                    <ArrowRight size={20} color="#1C1917" />
                  </Pressable>
                </View>
              </View>

              {/* 2. Overlapping White Rounded Sheet + Centered Circular Host Avatar */}
              <View style={styles.detailWhiteSheet}>
                <View
                  style={[
                    styles.detailAvatarCircle,
                    { backgroundColor: selectedProvider.hostAvatarColor || '#EA580C' },
                  ]}
                >
                  {selectedProvider.hostAvatarUrl ? (
                    <Image
                      source={{ uri: selectedProvider.hostAvatarUrl }}
                      style={{ width: '100%', height: '100%', borderRadius: 42 }}
                    />
                  ) : (
                    <Text style={styles.detailAvatarInitials}>
                      {selectedProvider.hostInitials}
                    </Text>
                  )}
                </View>

                <Text style={styles.detailMainTitle}>{selectedProvider.title}</Text>
                <Text style={styles.detailMainDesc}>{selectedProvider.description}</Text>

                <Text style={styles.detailHostRoleText}>{selectedProvider.hostRole}</Text>
                <Text style={styles.detailDeliveryNoteText}>
                  {selectedProvider.deliveryNote}
                </Text>

                <View style={styles.detailDivider} />

                {/* 3. Selectable Service Packages with Right-Side Photo Thumbnails (Screenshot 1!) */}
                <Text style={styles.detailSectionHeading}>Select Service Package</Text>
                {selectedProvider.packages.map(pkg => {
                  const isSelected = selectedPkgId === pkg.id;
                  return (
                    <Pressable
                      key={pkg.id}
                      style={[
                        styles.packageTierCard,
                        isSelected && styles.packageTierCardSelected,
                      ]}
                      onPress={() => setSelectedPkgId(pkg.id)}
                    >
                      <View style={styles.packageTierLeft}>
                        <Text style={styles.packageTierTitle}>{pkg.title}</Text>
                        <Text style={styles.packageTierDesc} numberOfLines={2}>
                          {pkg.description}
                        </Text>
                        <Text style={styles.packageTierPrice}>{pkg.price}</Text>
                      </View>
                      <Image
                        source={{ uri: pkg.image }}
                        style={styles.packageTierRightImg}
                        resizeMode="cover"
                      />
                    </Pressable>
                  );
                })}

                <View style={styles.detailDivider} />

                {/* 4. "Where I Can Meet You" (يمكنني ملاقاتك) + Embedded Google Map Coverage Zone (Screenshot 2!) */}
                <Text style={styles.detailSectionHeading}>Where I Can Meet You</Text>
                <Text style={styles.detailMeetSub}>
                  I travel to guests’ locations within the highlighted coverage area on the map ({selectedProvider.coverageCity}). You can message me to book the service in a different location.
                </Text>

                <View style={styles.coverageMapCard}>
                  <MapWebView
                    originWhitelist={['*']}
                    source={{
                      html: buildCoverageMapHtml(
                        selectedProvider.coverageLat || 30.0444,
                        selectedProvider.coverageLng || 31.2357,
                        selectedProvider.city,
                      ),
                      baseUrl: 'https://maps.google.com',
                    }}
                    style={{ flex: 1 }}
                    scrollEnabled={false}
                  />
                  <Pressable
                    style={styles.coverageExpandBtn}
                    onPress={() => {
                      setSelectedProvider(null);
                      setActiveCategoryModal(null);
                      navigation.navigate('Discover');
                    }}
                  >
                    <Maximize2 size={16} color="#1C1917" />
                  </Pressable>
                </View>

                <View style={styles.detailDivider} />

                {/* 5. "Things to Know" (أشياء يجب معرفتها) Section (Screenshot 3!) */}
                <Text style={styles.detailSectionHeading}>Things to Know</Text>

                <View style={styles.policyRow}>
                  <Users size={24} color="#1C1917" strokeWidth={1.8} />
                  <View style={styles.policyTextCol}>
                    <Text style={styles.policyTitle}>Guest Requirements</Text>
                    <Text style={styles.policySub}>
                      {selectedProvider.guestRequirements}
                    </Text>
                  </View>
                </View>

                <Pressable
                  style={styles.policyRow}
                  onPress={() => navigation.navigate('CustomerSupport')}
                >
                  <Accessibility size={24} color="#1C1917" strokeWidth={1.8} />
                  <View style={styles.policyTextCol}>
                    <Text style={styles.policyTitle}>Accessibility</Text>
                    <Text style={styles.policySub}>
                      {selectedProvider.accessibilityInfo}
                    </Text>
                  </View>
                  <ChevronRight size={18} color="#78716C" />
                </Pressable>

                <View style={styles.policyRow}>
                  <CalendarX2 size={24} color="#1C1917" strokeWidth={1.8} />
                  <View style={styles.policyTextCol}>
                    <Text style={styles.policyTitle}>Cancellation Policy</Text>
                    <Text style={styles.policySub}>
                      {selectedProvider.cancellationPolicy}
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* 6. Floating Sticky Bottom Booking Bar (Matching Screenshots 1, 2, 3!) */}
            <View
              style={[
                styles.stickyBookingBar,
                { bottom: Math.max(insets.bottom + 12, 22) },
              ]}
            >
              <View>
                <Text style={styles.stickyPriceTitle}>
                  From{' '}
                  {selectedProvider.packages.find(p => p.id === selectedPkgId)?.price ||
                    `${selectedProvider.priceFrom} ${selectedProvider.priceUnit}`}
                </Text>
                <Text style={styles.stickyFreeCancel}>Free cancellation</Text>
              </View>

              <Pressable
                style={styles.showDatesBtn}
                onPress={() => {
                  const prov = selectedProvider;
                  const chosenPkg =
                    prov.packages.find(p => p.id === selectedPkgId) ||
                    prov.packages[0];
                  setSelectedProvider(null);
                  setActiveCategoryModal(null);
                  if (prov.routeTarget) {
                    navigation.navigate(prov.routeTarget as any);
                  } else {
                    navigation.navigate('ServiceBooking', {
                      serviceId: prov.id,
                      serviceTitle: `${prov.title} — ${chosenPkg?.title || 'VIP Session'}`,
                      serviceCategory: prov.hostRole,
                      price: chosenPkg?.price || `${prov.priceFrom} ${prov.priceUnit}`,
                    });
                  }
                }}
              >
                <Text style={styles.showDatesBtnText}>Show Dates & Book</Text>
              </Pressable>
            </View>
          </View>
        )}
      </Modal>

      {/* ═══════════════════════════════════════════════════════════════════════
          LEVEL 4 MODAL: Destination Luxury Hotels Interactive Map & Suites
         ═══════════════════════════════════════════════════════════════════════ */}
      <Modal
        visible={!!selectedDestination}
        animationType="slide"
        onRequestClose={() => setSelectedDestination(null)}
      >
        {selectedDestination && (
          <View style={styles.destModalContainer}>
            {/* Top Bar with Safe Area Insets */}
            <View
              style={[
                styles.destModalTopBar,
                { paddingTop: Math.max(insets.top + 6, 16) },
              ]}
            >
              <Pressable
                style={styles.destModalCloseBtn}
                onPress={() => setSelectedDestination(null)}
              >
                <X size={20} color="#1C1917" strokeWidth={2.2} />
              </Pressable>

              <View style={{ alignItems: 'center', flex: 1, paddingHorizontal: 12 }}>
                <Text style={styles.destModalTitle} numberOfLines={1}>
                  {selectedDestination.city}
                </Text>
                <Text style={styles.destModalSub} numberOfLines={1}>
                  {selectedDestination.hotels.length} Curated Luxury 5-Star Hotels & Suites
                </Text>
              </View>

              <Pressable
                style={styles.destModalCloseBtn}
                onPress={() => {
                  const dest = selectedDestination;
                  setSelectedDestination(null);
                  navigation.navigate('FlightBooking', {
                    prefillDestination: dest.airportCode,
                    prefillDestinationCity: dest.city,
                  } as any);
                }}
              >
                <Sparkles size={18} color="#C5A059" strokeWidth={2} />
              </Pressable>
            </View>

            {/* Interactive Google Maps Leaflet View */}
            <View style={styles.destMapBox}>
              <MapWebView
                originWhitelist={['*']}
                source={{
                  html: buildDestinationHotelsMapHtml(
                    selectedDestination.city,
                    selectedDestination.country,
                    selectedDestination.hotels,
                    selectedDestination.lat,
                    selectedDestination.lng
                  ),
                }}
                style={{ flex: 1 }}
                javaScriptEnabled
                domStorageEnabled
                scrollEnabled={false}
              />
            </View>

            {/* Hotels Cards List */}
            <ScrollView
              contentContainerStyle={[
                styles.destHotelsListScroll,
                { paddingBottom: Math.max(insets.bottom + 24, 36) },
              ]}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.destSectionHeading}>
                Exclusive Hotels & Resorts in {selectedDestination.city}
              </Text>

              {selectedDestination.hotels.map(htl => (
                <View key={htl.id} style={styles.destHotelCard}>
                  <Image
                    source={{ uri: htl.image }}
                    style={styles.destHotelImg}
                    resizeMode="cover"
                  />
                  <View style={styles.destHotelBody}>
                    <View style={styles.destHotelTopRow}>
                      <Text style={styles.destHotelName} numberOfLines={1}>
                        {htl.name}
                      </Text>
                      <View style={styles.destRatingBadge}>
                        <Star size={13} color="#C5A059" fill="#C5A059" />
                        <Text style={styles.destRatingNum}>{htl.rating.toFixed(2)}</Text>
                      </View>
                    </View>

                    <Text style={styles.destHotelAddress} numberOfLines={1}>
                      {htl.address}
                    </Text>

                    <Text style={styles.destHotelHighlights} numberOfLines={2}>
                      {htl.highlights}
                    </Text>

                    <View style={styles.destHotelBottomRow}>
                      <View>
                        <Text style={styles.destHotelPriceLabel}>Starting from</Text>
                        <Text style={styles.destHotelPrice}>{htl.price}</Text>
                      </View>

                      <Pressable
                        style={styles.destBookHotelBtn}
                        onPress={() => {
                          setSelectedDestination(null);
                          navigation.navigate('HotelDetails', {
                            hotel: {
                              id: htl.id,
                              name: htl.name,
                              location: `${selectedDestination.city}, ${selectedDestination.country}`,
                              price: parseInt(htl.price.replace(/[^0-9]/g, '')) || 850,
                              rating: htl.rating,
                              imageUrl: htl.image,
                              description: htl.highlights,
                            },
                          } as any);
                        }}
                      >
                        <Text style={styles.destBookHotelBtnText}>Book Hotel</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
    marginBottom: 8,
  },
  artisticHeaderWrap: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  artisticTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  kickerText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9A7B38',
    letterSpacing: 1.2,
  },
  mainArtTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1C1917',
    letterSpacing: -0.3,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
    borderWidth: 1.2,
    borderColor: 'rgba(197, 160, 89, 0.28)',
    shadowColor: '#0D1626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  categoryPillActive: {
    backgroundColor: '#0D1626',
    borderColor: '#C5A059',
    borderWidth: 1.5,
  },
  categoryPillLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#44403C',
  },
  categoryPillLabelActive: {
    color: '#FFFFFF',
  },
  /* Sections */
  sectionBlock: {
    marginTop: 10,
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1C1917',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#78716C',
    marginTop: 2,
  },
  circleArrowBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#0D1626',
    borderWidth: 1,
    borderColor: '#C5A059',
    alignItems: 'center',
    justifyContent: 'center',
  },
  /* Bespoke Vector-Sharp Service Category Cards */
  servicesRow: {
    paddingHorizontal: 16,
    gap: 12,
  },
  serviceCatCard: {
    width: 94,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.28)',
    shadowColor: '#0D1626',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  serviceCatIconBox: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  serviceCatTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1C1917',
    textAlign: 'center',
  },
  serviceCatSub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9A7B38',
    marginTop: 2,
    textAlign: 'center',
  },
  /* Must Visit Destinations */
  horizontalCardsRow: {
    paddingHorizontal: 16,
    gap: 14,
  },
  destSpotCard: {
    width: 132,
  },
  destSpotImgWrap: {
    width: 132,
    height: 132,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#E7E5E4',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.25)',
  },
  destSpotImg: {
    width: '100%',
    height: '100%',
  },
  destSpotCity: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1917',
  },
  destSpotTagline: {
    fontSize: 11.5,
    color: '#78716C',
    marginTop: 2,
    lineHeight: 15,
  },
  /* Discovery Cards */
  discoveryCard: {
    width: 192,
  },
  discoveryImageWrap: {
    width: 192,
    height: 192,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#E7E5E4',
    marginBottom: 8,
    position: 'relative',
  },
  discoveryImage: {
    width: '100%',
    height: '100%',
  },
  guestFavBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  guestFavText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1C1917',
  },
  heartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discoveryTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1C1917',
    lineHeight: 18,
  },
  discoverySub: {
    fontSize: 12,
    color: '#57534E',
    marginTop: 3,
  },
  priceUnderline: {
    fontWeight: '800',
    color: '#1C1917',
    textDecorationLine: 'underline',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#57534E',
  },
  priceRatingInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  dotSep: {
    fontSize: 11,
    color: '#78716C',
  },

  /* ── LEVEL 2: Category Providers Catalog Screen ── */
  catScreenContainer: {
    flex: 1,
    backgroundColor: '#FAF9F6',
    paddingTop: 46,
  },
  catTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  catTopIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E7E5E4',
  },
  catCenterPill: {
    flex: 1,
    marginHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingVertical: 9,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  catCenterTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1917',
  },
  catCenterSub: {
    fontSize: 11.5,
    color: '#78716C',
    marginTop: 1,
  },
  catFilterPillsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
  },
  catFilterPillActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.8,
    borderColor: '#1C1917',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  catFilterPillActiveText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1C1917',
  },
  catFilterPillInactive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D6D3D1',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  catFilterPillInactiveText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#57534E',
  },
  catDropdownStrip: {
    paddingBottom: 12,
  },
  catSwitchChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E5E4',
  },
  catSwitchChipActive: {
    backgroundColor: '#0D1626',
    borderColor: '#C5A059',
  },
  catSwitchChipText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#44403C',
  },
  catSwitchChipTextActive: {
    color: '#FFFFFF',
  },
  catScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  catExploreHeading: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1C1917',
    marginTop: 6,
    marginBottom: 16,
  },
  providerBigCard: {
    marginBottom: 28,
  },
  providerBigImgWrap: {
    width: '100%',
    height: 250,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#E7E5E4',
    marginBottom: 12,
    position: 'relative',
  },
  providerBigImg: {
    width: '100%',
    height: '100%',
  },
  heartBtnBig: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerBigTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1C1917',
  },
  providerBigSub: {
    fontSize: 13.5,
    color: '#78716C',
    marginTop: 3,
  },
  providerBigMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  providerBigRating: {
    fontSize: 13,
    fontWeight: '700',
    color: '#57534E',
  },
  providerBigPriceLine: {
    fontSize: 13.5,
    color: '#57534E',
    marginTop: 4,
  },
  strikethroughPrice: {
    textDecorationLine: 'line-through',
    color: '#A8A29E',
  },
  providerBigPriceBold: {
    fontWeight: '800',
    color: '#1C1917',
    textDecorationLine: 'underline',
  },

  /* ── LEVEL 3: Full Provider Details Screen (Screenshots 1, 2, 3) ── */
  detailScreenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  detailHeroBox: {
    width: '100%',
    height: 290,
    position: 'relative',
  },
  detailHeroImg: {
    width: '100%',
    height: '100%',
  },
  detailTopFloatingBar: {
    position: 'absolute',
    top: 46,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailWhiteSheet: {
    marginTop: -32,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 22,
    paddingTop: 52,
  },
  detailAvatarCircle: {
    position: 'absolute',
    top: -42,
    alignSelf: 'center',
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  detailAvatarInitials: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  detailMainTitle: {
    fontSize: 25,
    fontWeight: '900',
    color: '#1C1917',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 12,
  },
  detailMainDesc: {
    fontSize: 14.5,
    color: '#57534E',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  detailHostRoleText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1C1917',
    textAlign: 'center',
  },
  detailDeliveryNoteText: {
    fontSize: 13,
    color: '#78716C',
    textAlign: 'center',
    marginTop: 2,
  },
  detailDivider: {
    height: 1,
    backgroundColor: '#E7E5E4',
    marginVertical: 24,
  },
  detailSectionHeading: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1C1917',
    marginBottom: 12,
  },
  packageTierCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#E7E5E4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  packageTierCardSelected: {
    borderColor: '#C5A059',
    backgroundColor: '#FAF9F6',
  },
  packageTierLeft: {
    flex: 1,
    paddingRight: 14,
  },
  packageTierTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#1C1917',
    marginBottom: 6,
  },
  packageTierDesc: {
    fontSize: 13,
    color: '#78716C',
    lineHeight: 18,
    marginBottom: 8,
  },
  packageTierPrice: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1C1917',
  },
  packageTierRightImg: {
    width: 96,
    height: 96,
    borderRadius: 16,
    backgroundColor: '#E7E5E4',
  },
  detailMeetSub: {
    fontSize: 14,
    color: '#57534E',
    lineHeight: 20,
    marginBottom: 16,
  },
  coverageMapCard: {
    width: '100%',
    height: 290,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#E5E3DF',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E7E5E4',
  },
  coverageExpandBtn: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 20,
  },
  policyTextCol: {
    flex: 1,
  },
  policyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1917',
    marginBottom: 3,
  },
  policySub: {
    fontSize: 13.5,
    color: '#78716C',
    lineHeight: 19,
  },
  stickyBookingBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 14,
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.35)',
  },
  stickyPriceTitle: {
    fontSize: 15.5,
    fontWeight: '900',
    color: '#1C1917',
  },
  stickyFreeCancel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E11D48',
    marginTop: 2,
  },
  showDatesBtn: {
    backgroundColor: '#E11D48',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  showDatesBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* Destination Luxury Hotels Interactive Map Modal Styles */
  destModalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  destModalTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F4',
  },
  destModalCloseBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F5F5F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  destModalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1C1917',
  },
  destModalSub: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#C5A059',
    marginTop: 1,
  },
  destMapBox: {
    width: '100%',
    height: 250,
    backgroundColor: '#E5E3DF',
  },
  destHotelsListScroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  destSectionHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1C1917',
    marginBottom: 14,
  },
  destHotelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  destHotelImg: {
    width: '100%',
    height: 180,
    backgroundColor: '#E7E5E4',
  },
  destHotelBody: {
    padding: 16,
  },
  destHotelTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  destHotelName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1917',
    marginRight: 8,
  },
  destRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  destRatingNum: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1917',
  },
  destHotelAddress: {
    fontSize: 12,
    color: '#78716C',
    marginBottom: 8,
  },
  destHotelHighlights: {
    fontSize: 13,
    color: '#44403C',
    lineHeight: 18,
    marginBottom: 14,
  },
  destHotelBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F4',
  },
  destHotelPriceLabel: {
    fontSize: 11,
    color: '#78716C',
  },
  destHotelPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1C1917',
  },
  destBookHotelBtn: {
    backgroundColor: '#0D1626',
    borderWidth: 1,
    borderColor: '#C5A059',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
  },
  destBookHotelBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#F8D384',
  },
});

