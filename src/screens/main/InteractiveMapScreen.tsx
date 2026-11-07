import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import firestore from '@react-native-firebase/firestore';
import { CURATED_LUXURY_HOTELS } from '../../services/catalogApi';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { WebView } from 'react-native-webview';
import {
  ChevronLeft,
  Layers,
  MapPin,
  Star,
  Plus,
  Minus,
  ArrowRight,
  Sparkles,
  Globe,
} from 'lucide-react-native';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export interface MapLocationPin {
  id: string;
  cityName: string;
  countryName: string;
  category: 'hotel' | 'landmark' | 'marina';
  title: string;
  subtitle: string;
  desc: string;
  price: string;
  pricePeriod: string;
  rating: number;
  image: string;
  lat: number;
  lng: number;
}

/**
 * Complete Real-World GPS Coordinates for ALL 94 Curated Luxury Hotels across 25 Countries
 */
const HOTEL_GPS: Record<string, { lat: number; lng: number; city: string; country: string }> = {
  // Greece (8)
  'hotel-athens-grandebretagne': { lat: 37.9763, lng: 23.7353, city: 'Athens', country: 'Greece' },
  'hotel-athens-fourseasons-astir': { lat: 37.8041, lng: 23.7712, city: 'Athens', country: 'Greece' },
  'hotel-santorini-canaves-oia': { lat: 36.4628, lng: 25.3725, city: 'Santorini', country: 'Greece' },
  'hotel-santorini-katikies': { lat: 36.4608, lng: 25.3788, city: 'Santorini', country: 'Greece' },
  'hotel-santorini-grace': { lat: 36.4328, lng: 25.4227, city: 'Santorini', country: 'Greece' },
  'hotel-mykonos-cavotagoo': { lat: 37.4567, lng: 25.3292, city: 'Mykonos', country: 'Greece' },
  'hotel-crete-amirandes': { lat: 35.3342, lng: 25.3048, city: 'Crete', country: 'Greece' },
  'hotel-rhodes-lindosblu': { lat: 36.1025, lng: 28.0772, city: 'Rhodes', country: 'Greece' },

  // Turkey (8)
  'hotel-turkey-ciragan': { lat: 41.0436, lng: 29.0163, city: 'Istanbul', country: 'Turkey' },
  'hotel-turkey-mandarin': { lat: 41.0545, lng: 29.0348, city: 'Istanbul', country: 'Turkey' },
  'hotel-turkey-fourseasons-bosphorus': { lat: 41.0408, lng: 29.0094, city: 'Istanbul', country: 'Turkey' },
  'hotel-turkey-peninsula-istanbul': { lat: 41.0235, lng: 28.9784, city: 'Istanbul', country: 'Turkey' },
  'hotel-turkey-cappadocia': { lat: 38.6318, lng: 34.8055, city: 'Cappadocia', country: 'Turkey' },
  'hotel-turkey-bodrum-mandarin': { lat: 37.1362, lng: 27.3812, city: 'Bodrum', country: 'Turkey' },
  'hotel-turkey-bodrum-edition': { lat: 37.1105, lng: 27.2836, city: 'Bodrum', country: 'Turkey' },
  'hotel-turkey-antalya-maxx': { lat: 36.5844, lng: 30.5752, city: 'Antalya', country: 'Turkey' },

  // France (7)
  'hotel-paris-crillon': { lat: 48.8672, lng: 2.3217, city: 'Paris', country: 'France' },
  'hotel-paris-georgev': { lat: 48.8688, lng: 2.3005, city: 'Paris', country: 'France' },
  'hotel-paris-ritz': { lat: 48.8682, lng: 2.3294, city: 'Paris', country: 'France' },
  'hotel-paris-lebristol': { lat: 48.8719, lng: 2.3149, city: 'Paris', country: 'France' },
  'hotel-paris-shangrila': { lat: 48.8636, lng: 2.2933, city: 'Paris', country: 'France' },
  'hotel-riviera-capferrat': { lat: 43.6761, lng: 7.3308, city: 'Nice / Cap-Ferrat', country: 'France' },
  'hotel-cannes-martinez': { lat: 43.5484, lng: 7.0298, city: 'Cannes', country: 'France' },

  // Italy (8)
  'hotel-rome-derussie': { lat: 41.9094, lng: 12.4776, city: 'Rome', country: 'Italy' },
  'hotel-rome-stregis': { lat: 41.9041, lng: 12.4945, city: 'Rome', country: 'Italy' },
  'hotel-milan-bulgari': { lat: 45.4706, lng: 9.1887, city: 'Milan', country: 'Italy' },
  'hotel-milan-mandarin': { lat: 45.4691, lng: 9.1904, city: 'Milan', country: 'Italy' },
  'hotel-venice-grittipalace': { lat: 45.4317, lng: 12.3331, city: 'Venice', country: 'Italy' },
  'hotel-venice-belmond-cipriani': { lat: 45.4262, lng: 12.3401, city: 'Venice', country: 'Italy' },
  'hotel-firenze-fourseasons': { lat: 43.7778, lng: 11.2669, city: 'Florence', country: 'Italy' },
  'hotel-lakecomo-tremezzo': { lat: 45.9862, lng: 9.2267, city: 'Lake Como', country: 'Italy' },

  // Netherlands, Czechia, Hungary (3)
  'hotel-amsterdam-waldorf': { lat: 52.3649, lng: 4.8967, city: 'Amsterdam', country: 'Netherlands' },
  'hotel-prague-fourseasons': { lat: 50.0875, lng: 14.4141, city: 'Prague', country: 'Czech Republic' },
  'hotel-budapest-fourseasons-gresham': { lat: 47.4997, lng: 19.0478, city: 'Budapest', country: 'Hungary' },

  // Spain (4)
  'hotel-madrid-fourseasons': { lat: 40.4172, lng: -3.7003, city: 'Madrid', country: 'Spain' },
  'hotel-madrid-rosewood': { lat: 40.4312, lng: -3.6881, city: 'Madrid', country: 'Spain' },
  'hotel-barcelona-arts': { lat: 41.3867, lng: 2.1963, city: 'Barcelona', country: 'Spain' },
  'hotel-marbella-club': { lat: 36.5062, lng: -4.9225, city: 'Marbella', country: 'Spain' },

  // Switzerland (5)
  'hotel-geneva-fourseasons': { lat: 46.2066, lng: 6.1475, city: 'Geneva', country: 'Switzerland' },
  'hotel-geneva-woodward': { lat: 46.2104, lng: 6.1502, city: 'Geneva', country: 'Switzerland' },
  'hotel-zurich-bauraulac': { lat: 47.3672, lng: 8.5404, city: 'Zurich', country: 'Switzerland' },
  'hotel-zurich-dolder': { lat: 47.3728, lng: 8.5732, city: 'Zurich', country: 'Switzerland' },
  'hotel-stmoritz-badrutts': { lat: 46.4969, lng: 9.8412, city: 'St. Moritz', country: 'Switzerland' },

  // Germany & Austria (3)
  'hotel-berlin-adlon': { lat: 52.5159, lng: 13.3799, city: 'Berlin', country: 'Germany' },
  'hotel-munich-charles': { lat: 48.1428, lng: 11.5632, city: 'Munich', country: 'Germany' },
  'hotel-vienna-sacher': { lat: 48.2039, lng: 16.3694, city: 'Vienna', country: 'Austria' },

  // United Kingdom (6)
  'hotel-london-ritz': { lat: 51.5070, lng: -0.1416, city: 'London', country: 'UK' },
  'hotel-london-savoy': { lat: 51.5104, lng: -0.1205, city: 'London', country: 'UK' },
  'hotel-london-claridges': { lat: 51.5126, lng: -0.1488, city: 'London', country: 'UK' },
  'hotel-london-dorchester': { lat: 51.5073, lng: -0.1526, city: 'London', country: 'UK' },
  'hotel-london-mandarin': { lat: 51.5023, lng: -0.1599, city: 'London', country: 'UK' },
  'hotel-edinburgh-balmoral': { lat: 55.9527, lng: -3.1896, city: 'Edinburgh', country: 'UK' },

  // Saudi Arabia (8)
  'hotel-riyadh-ritz': { lat: 24.6661, lng: 46.6311, city: 'Riyadh', country: 'Saudi Arabia' },
  'hotel-riyadh-fourseasons': { lat: 24.7114, lng: 46.6744, city: 'Riyadh', country: 'Saudi Arabia' },
  'hotel-jeddah-rosewood': { lat: 21.5892, lng: 39.1089, city: 'Jeddah', country: 'Saudi Arabia' },
  'hotel-jeddah-hilton': { lat: 21.6031, lng: 39.1072, city: 'Jeddah', country: 'Saudi Arabia' },
  'hotel-alula-banyantree': { lat: 26.7824, lng: 37.9583, city: 'AlUla', country: 'Saudi Arabia' },
  'hotel-alula-habitas': { lat: 26.7745, lng: 37.9491, city: 'AlUla', country: 'Saudi Arabia' },
  'hotel-makkah-raffles': { lat: 21.4187, lng: 39.8256, city: 'Makkah', country: 'Saudi Arabia' },
  'hotel-madinah-oberoi': { lat: 24.4709, lng: 39.6104, city: 'Madinah', country: 'Saudi Arabia' },

  // UAE (8)
  'hotel-dubai-burjalarab': { lat: 25.1412, lng: 55.1852, city: 'Dubai', country: 'UAE' },
  'hotel-dubai-atlantisroyal': { lat: 25.1378, lng: 55.1272, city: 'Dubai', country: 'UAE' },
  'hotel-dubai-armani': { lat: 25.1972, lng: 55.2744, city: 'Dubai', country: 'UAE' },
  'hotel-dubai-fourseasons-jumeirah': { lat: 25.2028, lng: 55.2401, city: 'Dubai', country: 'UAE' },
  'hotel-dubai-ritz-jbr': { lat: 25.0789, lng: 55.1338, city: 'Dubai', country: 'UAE' },
  'hotel-abudhabi-emiratespalace': { lat: 24.4616, lng: 54.3173, city: 'Abu Dhabi', country: 'UAE' },
  'hotel-abudhabi-stregis-saadiyat': { lat: 24.5446, lng: 54.4272, city: 'Abu Dhabi', country: 'UAE' },
  'hotel-liwa-qasralsarab': { lat: 22.9694, lng: 54.2181, city: 'Liwa Desert', country: 'UAE' },

  // Qatar, Bahrain, Kuwait, Oman (5)
  'hotel-doha-raffles': { lat: 25.3941, lng: 51.5292, city: 'Doha', country: 'Qatar' },
  'hotel-doha-stregis': { lat: 25.3519, lng: 51.5276, city: 'Doha', country: 'Qatar' },
  'hotel-bahrain-ritz': { lat: 26.2422, lng: 50.5318, city: 'Manama', country: 'Bahrain' },
  'hotel-kuwait-fourseasons': { lat: 29.3688, lng: 47.9712, city: 'Kuwait City', country: 'Kuwait' },
  'hotel-muscat-chedi': { lat: 23.5992, lng: 58.3821, city: 'Muscat', country: 'Oman' },

  // Egypt (4 in CURATED_LUXURY_HOTELS + 6 additional iconic Egyptian resorts below)
  'hotel-cairo-ritz': { lat: 30.0456, lng: 31.2335, city: 'Cairo', country: 'Egypt' },
  'hotel-cairo-fourseasons': { lat: 30.0351, lng: 31.2307, city: 'Cairo', country: 'Egypt' },
  'hotel-giza-menahouse': { lat: 29.9861, lng: 31.1326, city: 'Giza', country: 'Egypt' },
  'hotel-cairo-stregis': { lat: 30.0642, lng: 31.2278, city: 'Cairo', country: 'Egypt' },

  // USA (6)
  'hotel-ny-plaza': { lat: 40.7644, lng: -73.9745, city: 'New York', country: 'USA' },
  'hotel-ny-carlyle': { lat: 40.7744, lng: -73.9632, city: 'New York', country: 'USA' },
  'hotel-la-beverlywilshire': { lat: 34.0672, lng: -118.4008, city: 'Los Angeles', country: 'USA' },
  'hotel-la-peninsula': { lat: 34.0663, lng: -118.4112, city: 'Los Angeles', country: 'USA' },
  'hotel-miami-faena': { lat: 25.8078, lng: -80.1235, city: 'Miami', country: 'USA' },
  'hotel-vegas-bellagio': { lat: 36.1126, lng: -115.1767, city: 'Las Vegas', country: 'USA' },

  // Asia & Indian Ocean (11)
  'hotel-asia-amantokyo': { lat: 35.6882, lng: 139.7645, city: 'Tokyo', country: 'Japan' },
  'hotel-tokyo-parkhyatt': { lat: 35.6855, lng: 139.6908, city: 'Tokyo', country: 'Japan' },
  'hotel-asia-ritzkyoto': { lat: 35.0116, lng: 135.7712, city: 'Kyoto', country: 'Japan' },
  'hotel-asia-bulgaribali': { lat: -8.8475, lng: 115.1408, city: 'Bali', country: 'Indonesia' },
  'hotel-bali-fourseasons-sayan': { lat: -8.5015, lng: 115.2448, city: 'Bali', country: 'Indonesia' },
  'hotel-asia-marinabaysands': { lat: 1.2838, lng: 103.8591, city: 'Singapore', country: 'Singapore' },
  'hotel-singapore-raffles': { lat: 1.2949, lng: 103.8545, city: 'Singapore', country: 'Singapore' },
  'hotel-asia-peninsulabangkok': { lat: 13.7228, lng: 100.5103, city: 'Bangkok', country: 'Thailand' },
  'hotel-maldives-chevalblanc': { lat: 5.7924, lng: 73.3638, city: 'Noonu Atoll', country: 'Maldives' },
  'hotel-maldives-sonevajani': { lat: 5.7642, lng: 73.4126, city: 'Noonu Atoll', country: 'Maldives' },
  'hotel-maldives-waldorf': { lat: 3.9876, lng: 73.4628, city: 'South Malé Atoll', country: 'Maldives' },
};

const ADDITIONAL_REGIONAL_HOTELS: MapLocationPin[] = [
  {
    id: 'hotel-alex-fourseasons',
    cityName: 'Alexandria',
    countryName: 'Egypt',
    category: 'hotel',
    title: 'Four Seasons Hotel Alexandria at San Stefano',
    subtitle: '399 El Geish Road, San Stefano Corniche, Alexandria, Egypt',
    desc: 'Mediterranean grand palace overlooking the sea with private beach and royal suites.',
    price: '$580',
    pricePeriod: '/ night',
    rating: 4.96,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&q=80',
    lat: 31.2456,
    lng: 29.9665,
  },
  {
    id: 'hotel-hurghada-oberoi',
    cityName: 'Hurghada',
    countryName: 'Egypt',
    category: 'hotel',
    title: 'The Oberoi Beach Resort, Sahl Hasheesh, Hurghada',
    subtitle: 'Sahl Hasheesh Red Sea Coast, Hurghada, Egypt',
    desc: 'All-suite Red Sea sanctuary with private coral reef, sunken marble baths & private pools.',
    price: '$690',
    pricePeriod: '/ night',
    rating: 4.98,
    image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=900&q=80',
    lat: 27.0418,
    lng: 33.8924,
  },
  {
    id: 'hotel-elgouna-chedi',
    cityName: 'El Gouna',
    countryName: 'Egypt',
    category: 'hotel',
    title: 'The Chedi El Gouna, Red Sea Riviera',
    subtitle: 'Hill Villas Rd, El Gouna, Red Sea, Egypt',
    desc: 'Asian-inspired beachfront minimalism on the turquoise lagoons of El Gouna.',
    price: '$540',
    pricePeriod: '/ night',
    rating: 4.95,
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=900&q=80',
    lat: 27.3941,
    lng: 33.6782,
  },
  {
    id: 'hotel-sharm-fourseasons',
    cityName: 'Sharm El Sheikh',
    countryName: 'Egypt',
    category: 'hotel',
    title: 'Four Seasons Resort Sharm El Sheikh',
    subtitle: '1 Four Seasons Blvd, Sharks Bay, Sharm El Sheikh, Egypt',
    desc: 'Hillside Arabian village cascading down to the Red Sea with private funicular & dive jetty.',
    price: '$750',
    pricePeriod: '/ night',
    rating: 4.97,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&q=80',
    lat: 27.9592,
    lng: 34.3914,
  },
  {
    id: 'hotel-luxor-winterpalace',
    cityName: 'Luxor',
    countryName: 'Egypt',
    category: 'hotel',
    title: 'Sofitel Winter Palace Luxor, Historic Nile Sanctuary',
    subtitle: 'Corniche El Nil Street, Luxor, Egypt',
    desc: '1886 Victorian royal palace overlooking the Nile and Valley of the Kings.',
    price: '$520',
    pricePeriod: '/ night',
    rating: 4.95,
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=900&q=80',
    lat: 25.6967,
    lng: 32.6371,
  },
  {
    id: 'hotel-aswan-cataract',
    cityName: 'Aswan',
    countryName: 'Egypt',
    category: 'hotel',
    title: 'Sofitel Legend Old Cataract Aswan',
    subtitle: 'Abtal El Tahrir Street, Aswan, Egypt',
    desc: 'Pink granite cliffside palace facing Elephantine Island and the Nile.',
    price: '$640',
    pricePeriod: '/ night',
    rating: 4.99,
    image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=900&q=80',
    lat: 24.0801,
    lng: 32.8858,
  },
  {
    id: 'hotel-marrakech-royalmansour',
    cityName: 'Marrakech',
    countryName: 'Morocco',
    category: 'hotel',
    title: 'Royal Mansour Marrakech, Sovereign Riad Palace',
    subtitle: 'Rue Abou Abbas El Sebti, Marrakech 40000, Morocco',
    desc: 'Private three-story riads with rooftop plunge pools and personal butler tunnels.',
    price: '$1,850',
    pricePeriod: '/ night',
    rating: 4.99,
    image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=900&q=80',
    lat: 31.6252,
    lng: -7.9992,
  },
  {
    id: 'hotel-monaco-deparis',
    cityName: 'Monte Carlo',
    countryName: 'Monaco',
    category: 'hotel',
    title: 'Hôtel de Paris Monte-Carlo, Place du Casino',
    subtitle: 'Place du Casino, 98000 Monaco',
    desc: 'Legendary Belle Époque palace with Le Louis XV 3-Michelin-star dining.',
    price: '$2,150',
    pricePeriod: '/ night',
    rating: 4.99,
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=900&q=80',
    lat: 43.7392,
    lng: 7.4275,
  },
];

const BASE_GLOBAL_HOTEL_PINS: MapLocationPin[] = [
  ...CURATED_LUXURY_HOTELS.filter(h => h.id.startsWith('hotel-')).map(h => {
    const gps = HOTEL_GPS[h.id] || { lat: 30.0456, lng: 31.2335, city: 'Cairo', country: h.country || 'Egypt' };
    return {
      id: h.id,
      cityName: gps.city,
      countryName: gps.country,
      category: 'hotel' as const,
      title: h.name,
      subtitle: h.subtitle,
      desc: h.description || 'Exclusive luxury hotel.',
      price: h.price,
      pricePeriod: '/ night',
      rating: h.rating || 4.96,
      image: h.image,
      lat: gps.lat,
      lng: gps.lng,
    };
  }),
  ...ADDITIONAL_REGIONAL_HOTELS,
];

export const MAP_API_KEY = 'cb1_4k33_1_e6592c53ec21cb20de03455d';

interface CountryRegionCenter {
  name: string;
  flag: string;
  lat: number;
  lng: number;
  zoom: number;
  countryFilter?: string;
}

const REGIONS_AND_COUNTRIES: CountryRegionCenter[] = [
  { name: 'All World (102)', flag: '🌍', lat: 30.0, lng: 28.0, zoom: 3 },
  { name: 'Egypt (10)', flag: '🇪🇬', lat: 28.8, lng: 31.8, zoom: 6, countryFilter: 'Egypt' },
  { name: 'Saudi Arabia (8)', flag: '🇸🇦', lat: 24.0, lng: 42.0, zoom: 5, countryFilter: 'Saudi Arabia' },
  { name: 'UAE (8)', flag: '🇦🇪', lat: 24.8, lng: 54.8, zoom: 8, countryFilter: 'UAE' },
  { name: 'Turkey (8)', flag: '🇹🇷', lat: 39.2, lng: 31.0, zoom: 6, countryFilter: 'Turkey' },
  { name: 'Greece (8)', flag: '🇬🇷', lat: 37.2, lng: 24.8, zoom: 6, countryFilter: 'Greece' },
  { name: 'France (7)', flag: '🇫🇷', lat: 46.8, lng: 4.2, zoom: 6, countryFilter: 'France' },
  { name: 'Italy (8)', flag: '🇮🇹', lat: 44.2, lng: 11.4, zoom: 6, countryFilter: 'Italy' },
  { name: 'UK (6)', flag: '🇬🇧', lat: 52.8, lng: -1.5, zoom: 6, countryFilter: 'UK' },
  { name: 'Switzerland (5)', flag: '🇨🇭', lat: 46.8, lng: 8.2, zoom: 7, countryFilter: 'Switzerland' },
  { name: 'Spain (4)', flag: '🇪🇸', lat: 39.5, lng: -3.2, zoom: 6, countryFilter: 'Spain' },
  { name: 'Germany & Austria', flag: '🇩🇪', lat: 49.8, lng: 13.5, zoom: 6, countryFilter: 'Germany' },
  { name: 'Qatar & Gulf', flag: '🇶🇦', lat: 25.5, lng: 51.5, zoom: 6, countryFilter: 'Qatar' },
  { name: 'USA (6)', flag: '🇺🇸', lat: 37.5, lng: -96.0, zoom: 4, countryFilter: 'USA' },
  { name: 'Japan (3)', flag: '🇯🇵', lat: 35.4, lng: 138.2, zoom: 6, countryFilter: 'Japan' },
  { name: 'Maldives (3)', flag: '🇲🇻', lat: 4.8, lng: 73.4, zoom: 7, countryFilter: 'Maldives' },
  { name: 'Bali & Asia', flag: '🇮🇩', lat: -2.0, lng: 109.0, zoom: 4, countryFilter: 'Indonesia' },
];

function generateGoogleMapHtml(pins: MapLocationPin[]) {
  const pinsJson = JSON.stringify(pins);
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" onerror="this.onerror=null;this.href='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; background: #E5E3DF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    
    .gmap-hotel-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: #FFFFFF;
      color: #1C1917;
      border: 1.8px solid #C5A059;
      border-radius: 18px;
      padding: 4px 9px;
      font-size: 11.5px;
      font-weight: 800;
      white-space: nowrap;
      box-shadow: 0 3px 10px rgba(0,0,0,0.28);
      cursor: pointer;
      transition: transform 0.15s ease, background 0.15s ease;
    }
    .gmap-hotel-pill:active, .gmap-hotel-pill.selected {
      background: #0D1626;
      color: #FFFFFF;
      border-color: #D4AF37;
      transform: scale(1.12);
      z-index: 9999 !important;
    }
    .gmap-hotel-star {
      color: #C5A059;
      font-size: 11px;
    }
    .google-badge {
      position: absolute;
      bottom: 8px;
      left: 10px;
      z-index: 500;
      background: rgba(255,255,255,0.92);
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      color: #3C4043;
      box-shadow: 0 1px 4px rgba(0,0,0,0.15);
      pointer-events: none;
    }
    .leaflet-popup-content-wrapper {
      background: #FFFFFF;
      color: #1C1917;
      border-radius: 14px;
      border: 1.5px solid #C5A059;
      padding: 4px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.2);
    }
    .leaflet-popup-tip {
      background: #FFFFFF;
    }
    .popup-title {
      font-weight: 800;
      font-size: 13px;
      color: #1C1917;
    }
    .popup-city {
      font-size: 11px;
      color: #64748B;
      margin-top: 2px;
    }
    .popup-price {
      font-size: 12.5px;
      color: #9A7B38;
      font-weight: 900;
      margin-top: 3px;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div class="google-badge">Google Maps • 102 Luxury Hotels</div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    if (typeof L === 'undefined') {
      document.write('<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"><\\/script>');
    }
  </script>
  <script>
    function initMap() {
      if (typeof L === 'undefined') {
        setTimeout(initMap, 150);
        return;
      }

      // Official Google Maps Road Tiles (mt0..mt3.google.com)
      const googleRoadLayer = L.tileLayer(
        'https://{s}.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}',
        {
          maxZoom: 20,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
          attribution: 'Map data ©2026 Google'
        }
      );

      // Official Google Maps Satellite Hybrid Tiles (Satellite + Roads & Labels)
      const googleSatelliteLayer = L.tileLayer(
        'https://{s}.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}',
        {
          maxZoom: 20,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
          attribution: 'Imagery ©2026 Google, Maxar Technologies'
        }
      );

      // Fallback if network blocks mt0.google.com
      googleRoadLayer.on('tileerror', function(error) {
        try {
          if (error && error.tile && !error.tile._fallbackTried) {
            error.tile._fallbackTried = true;
            const coords = error.coords;
            if (coords) {
              error.tile.src = 'https://tile.openstreetmap.org/' + coords.z + '/' + coords.x + '/' + coords.y + '.png';
            }
          }
        } catch (e) {}
      });

      const map = L.map('map', {
        center: [30.0, 28.0], // Centered to show Europe, Egypt, Middle East & Mediterranean
        zoom: 4,
        zoomControl: false,
        layers: [googleRoadLayer]
      });

      let currentLayer = 'street';
      window.toggleLayer = function() {
        if (currentLayer === 'street') {
          map.removeLayer(googleRoadLayer);
          map.addLayer(googleSatelliteLayer);
          currentLayer = 'satellite';
        } else {
          map.removeLayer(googleSatelliteLayer);
          map.addLayer(googleRoadLayer);
          currentLayer = 'street';
        }
      };

      window.jumpToCity = function(lat, lng, zoom) {
        map.flyTo([lat, lng], zoom || 6, { duration: 1.2 });
      };

      window.mapZoomIn = function() {
        map.zoomIn();
      };

      window.mapZoomOut = function() {
        map.zoomOut();
      };

      const pins = ${pinsJson};
      pins.forEach(function(pin) {
        const pinHtml = '<div class="gmap-hotel-pill">' +
          '<span class="gmap-hotel-star">★</span>' +
          '<span>' + pin.price + '</span>' +
        '</div>';

        const customIcon = L.divIcon({
          html: pinHtml,
          className: '',
          iconSize: [74, 28],
          iconAnchor: [37, 14],
          popupAnchor: [0, -14]
        });

        const marker = L.marker([pin.lat, pin.lng], { icon: customIcon }).addTo(map);
        marker.bindPopup(
          '<div class="popup-title">' + pin.title + '</div>' +
          '<div class="popup-city">' + pin.cityName + ', ' + pin.countryName + '</div>' +
          '<div class="popup-price">' + pin.price + ' ' + pin.pricePeriod + ' • ★ ' + pin.rating + '</div>'
        );

        marker.on('click', function() {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'SELECT_PIN',
              pin: pin
            }));
          }
        });
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initMap);
    } else {
      initMap();
    }
  </script>
</body>
</html>
  `;
}

const MapWebView = WebView as unknown as React.ComponentType<any>;

export function InteractiveMapScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<any>(null);

  const [activeRegion, setActiveRegion] = useState('All World (102)');
  const [firestorePins, setFirestorePins] = useState<MapLocationPin[]>([]);

  useEffect(() => {
    try {
      const unsub = firestore().collection('hotels').onSnapshot(snap => {
        if (!snap || snap.empty) return;
        const extra: MapLocationPin[] = [];
        snap.forEach(doc => {
          const d = doc.data();
          if (d && !HOTEL_GPS[doc.id]) {
            extra.push({
              id: doc.id,
              cityName: d.city || 'Cairo',
              countryName: d.country || 'Egypt',
              category: 'hotel',
              title: d.name || 'VANIR Luxury Hotel',
              subtitle: d.subtitle || d.address || 'Exclusive Destination',
              desc: d.description || 'Curated ultra-luxury property.',
              price: d.price || '$650',
              pricePeriod: '/ night',
              rating: typeof d.rating === 'number' ? d.rating : 4.95,
              image: d.image || d.heroImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
              lat: typeof d.lat === 'number' ? d.lat : 30.0456,
              lng: typeof d.lng === 'number' ? d.lng : 31.2335,
            });
          }
        });
        if (extra.length > 0) setFirestorePins(extra);
      }, () => {});
      return () => unsub();
    } catch {
      // offline fallback
    }
  }, []);

  const allPins = useMemo(() => {
    return [...BASE_GLOBAL_HOTEL_PINS, ...firestorePins];
  }, [firestorePins]);

  const [selectedPin, setSelectedPin] = useState<MapLocationPin>(BASE_GLOBAL_HOTEL_PINS[0]);
  const [showPlannerSheet, setShowPlannerSheet] = useState(false);
  const [isSatellite, setIsSatellite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const googleMapHtml = useMemo(() => generateGoogleMapHtml(allPins), [allPins]);

  const handleRegionPress = (region: CountryRegionCenter) => {
    setActiveRegion(region.name);
    setShowPlannerSheet(false);
    if (region.countryFilter) {
      const match = allPins.find(
        p => p.countryName.toLowerCase() === region.countryFilter!.toLowerCase(),
      );
      if (match) setSelectedPin(match);
    }
    webViewRef.current?.injectJavaScript(
      `window.jumpToCity(${region.lat}, ${region.lng}, ${region.zoom}); true;`,
    );
  };

  const handleToggleLayer = () => {
    setIsSatellite(prev => !prev);
    webViewRef.current?.injectJavaScript(`window.toggleLayer(); true;`);
  };

  const handleZoomIn = () => {
    webViewRef.current?.injectJavaScript(`window.mapZoomIn(); true;`);
  };

  const handleZoomOut = () => {
    webViewRef.current?.injectJavaScript(`window.mapZoomOut(); true;`);
  };

  const handleMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'SELECT_PIN' && data.pin) {
        setSelectedPin(data.pin);
        setShowPlannerSheet(false);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const handleBookSelected = () => {
    if (!selectedPin) return;
    navigation.navigate('HotelDetails', {
      hotelId: selectedPin.id,
      hotelName: selectedPin.title,
      location: selectedPin.subtitle,
      price: selectedPin.price,
      image: selectedPin.image,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

      {/* Top Floating Header */}
      <SafeAreaView edges={['top']} style={styles.topSafeArea}>
        <View style={styles.topBar}>
          <Pressable
            style={({ pressed }) => [styles.iconBtn, pressed && styles.topBtnPressed]}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft color="#1C1917" size={22} strokeWidth={2.2} />
          </Pressable>

          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>GOOGLE WORLD HOTEL MAP</Text>
            <Text style={styles.headerSub}>
              {allPins.length} Luxury Hotels Across 25+ Countries
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.iconBtn,
              isSatellite && styles.iconBtnActive,
              pressed && styles.topBtnPressed,
            ]}
            onPress={handleToggleLayer}
          >
            <Layers color="#1C1917" size={20} strokeWidth={2.2} />
          </Pressable>
        </View>

        {/* Country & Global Filter Pills */}
        <View style={styles.citiesBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.citiesScroll}>
            {REGIONS_AND_COUNTRIES.map(reg => {
              const isActive = activeRegion === reg.name;
              return (
                <Pressable
                  key={reg.name}
                  style={[styles.cityPill, isActive && styles.cityPillActive]}
                  onPress={() => handleRegionPress(reg)}
                >
                  <Text style={styles.cityFlag}>{reg.flag}</Text>
                  <Text style={[styles.cityText, isActive && styles.cityTextActive]}>
                    {reg.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </SafeAreaView>

      {/* Google Maps WebView */}
      <View style={styles.mapWrapper}>
        <MapWebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: googleMapHtml, baseUrl: 'https://maps.google.com' }}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          mixedContentMode="always"
          allowsInlineMediaPlayback={true}
          allowFileAccess={true}
          scalesPageToFit={true}
          startInLoadingState={true}
          onLoadEnd={() => setIsLoading(false)}
          onMessage={handleMessage}
        />

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#D4AF37" />
            <Text style={styles.loadingText}>Loading Google Maps & 102 Global Hotels…</Text>
          </View>
        )}

        {/* Floating Zoom Controls Right Side */}
        <View style={styles.zoomControls}>
          <Pressable style={styles.zoomBtn} onPress={handleZoomIn}>
            <Plus color="#1C1917" size={20} strokeWidth={2.5} />
          </Pressable>
          <View style={styles.zoomDivider} />
          <Pressable style={styles.zoomBtn} onPress={handleZoomOut}>
            <Minus color="#1C1917" size={20} strokeWidth={2.5} />
          </Pressable>
        </View>
      </View>

      {/* Interactive 3D Trip Planner Diorama Sheet OR Selected Hotel Pin Card */}
      {showPlannerSheet ? (
        <View
          style={[
            styles.plannerSheetWrap,
            { paddingBottom: (insets.bottom > 0 ? insets.bottom + 8 : 16) + 74 },
          ]}
        >
          <Pressable
            style={styles.plannerSheetHandleWrap}
            onPress={() => setShowPlannerSheet(false)}
          >
            <View style={styles.plannerSheetHandle} />
          </Pressable>

          <Image
            source={require('../../assets/images/interactive/trip_planner_diorama.png')}
            style={styles.plannerDioramaImg}
            resizeMode="contain"
          />

          <Text style={styles.plannerTitle}>Plan Your Next Journey</Text>
          <Text style={styles.plannerDesc}>
            After booking a flight, residence, experience, or lifestyle service, return to this section to view your itinerary, explore the interactive Google Map, and save places you wish to visit.
          </Text>

          <View style={styles.plannerActionsRow}>
            <Pressable
              style={styles.plannerPrimaryBtn}
              onPress={() => setShowPlannerSheet(false)}
            >
              <Text style={styles.plannerPrimaryBtnText}>View All 102 Hotels</Text>
            </Pressable>
            <Pressable
              style={styles.plannerSecondaryBtn}
              onPress={() => navigation.navigate('TravelPlan')}
            >
              <Sparkles size={15} color="#C5A059" />
              <Text style={styles.plannerSecondaryBtnText}>AI Trip Planner</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        selectedPin && (
          <View
            style={[
              styles.bottomCardWrapper,
              { bottom: (insets.bottom > 0 ? insets.bottom + 8 : 16) + 72 },
            ]}
          >
            <View style={styles.topFloatingPillsRow}>
              <Pressable
                style={styles.reopenPlannerPill}
                onPress={() =>
                  handleRegionPress(REGIONS_AND_COUNTRIES[0])
                }
              >
                <Globe size={13} color="#C5A059" />
                <Text style={styles.reopenPlannerText}>Show All 102 Hotels</Text>
              </Pressable>

              <Pressable
                style={styles.reopenPlannerPill}
                onPress={() => setShowPlannerSheet(true)}
              >
                <Sparkles size={13} color="#C5A059" />
                <Text style={styles.reopenPlannerText}>Trip Planner</Text>
              </Pressable>
            </View>

            <Pressable style={styles.locationCard} onPress={handleBookSelected}>
              <Image source={{ uri: selectedPin.image }} style={styles.cardImage} resizeMode="cover" />

              <View style={styles.cardDetails}>
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardCategoryPill}>
                    <Text style={styles.cardCategoryText}>
                      {selectedPin.cityName.toUpperCase()} • {selectedPin.countryName.toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.ratingBadge}>
                    <Star color="#F59E0B" fill="#F59E0B" size={12} />
                    <Text style={styles.ratingText}>{selectedPin.rating}</Text>
                  </View>
                </View>

                <Text style={styles.cardTitle} numberOfLines={1}>
                  {selectedPin.title}
                </Text>

                <View style={styles.locationSubRow}>
                  <MapPin color="#64748B" size={12} strokeWidth={2} />
                  <Text style={styles.locationSubText} numberOfLines={1}>
                    {selectedPin.subtitle}
                  </Text>
                </View>

                <View style={styles.cardFooterRow}>
                  <View>
                    <Text style={styles.priceValue}>
                      {selectedPin.price}
                      <Text style={styles.pricePeriod}> {selectedPin.pricePeriod}</Text>
                    </Text>
                  </View>

                  <Pressable style={styles.bookBtn} onPress={handleBookSelected}>
                    <Text style={styles.bookBtnText}>Book Hotel</Text>
                    <ArrowRight color="#1C1917" size={14} strokeWidth={2.5} />
                  </Pressable>
                </View>
              </View>
            </Pressable>
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  topSafeArea: {
    backgroundColor: '#FAF9F6',
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.25)',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderColor: '#D4AF37',
  },
  topBtnPressed: {
    opacity: 0.75,
  },
  headerTitleBox: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1C1917',
    letterSpacing: 1.5,
  },
  headerSub: {
    fontSize: 11,
    color: '#9A7B38',
    fontWeight: '700',
    marginTop: 2,
  },
  citiesBar: {
    paddingBottom: 10,
  },
  citiesScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  cityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  cityPillActive: {
    backgroundColor: '#0D1626',
    borderColor: '#D4AF37',
  },
  cityFlag: {
    fontSize: 14,
  },
  cityText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  cityTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  mapWrapper: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: '#E5E3DF',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(250, 249, 246, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  loadingText: {
    color: '#1C1917',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 10,
  },
  zoomControls: {
    position: 'absolute',
    right: 16,
    top: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  zoomBtn: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  bottomCardWrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 30,
  },
  topFloatingPillsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  locationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.45)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
  },
  cardImage: {
    width: 96,
    height: 96,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
  },
  cardDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardCategoryPill: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cardCategoryText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#9A7B38',
    letterSpacing: 0.6,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1C1917',
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#1C1917',
    marginTop: 2,
  },
  locationSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationSubText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '900',
    color: '#9A7B38',
  },
  pricePeriod: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  bookBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1C1917',
  },
  plannerSheetWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 16,
  },
  plannerSheetHandleWrap: {
    paddingVertical: 6,
    paddingHorizontal: 20,
  },
  plannerSheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#A8A29E',
  },
  plannerDioramaImg: {
    width: 220,
    height: 155,
    marginTop: 4,
    marginBottom: 8,
  },
  plannerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1C1917',
    textAlign: 'center',
    marginBottom: 8,
  },
  plannerDesc: {
    fontSize: 13.5,
    color: '#57534E',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    paddingHorizontal: 6,
  },
  plannerActionsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  plannerPrimaryBtn: {
    flex: 1,
    backgroundColor: '#F3F2EE',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plannerPrimaryBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1C1917',
  },
  plannerSecondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#0D1626',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C5A059',
  },
  plannerSecondaryBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  reopenPlannerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0D1626',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C5A059',
  },
  reopenPlannerText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
