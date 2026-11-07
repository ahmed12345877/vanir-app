import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import firestore from '@react-native-firebase/firestore';
import {
  Animated,
  FlatList,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import {
  PRESET_AVATARS,
  AVATAR_STORAGE_KEY,
} from '../../constants/presetAvatars';
import { useCatalogStore } from '../../context/CatalogStore';
import LinearGradient from 'react-native-linear-gradient';
import { formatEnglishNumber } from '../../lib/formatters';
import {
  getLiveHomeFeedCards,
  subscribeLiveHomeFeedCards,
  getLiveAppControls,
  subscribeLiveAppControls,
  subscribeLiveGallery,
  memoryFeedCards,
  CACHE_FEED_KEY,
  type LiveGalleryItem,
  type ServiceControls,
} from '../../services/firestore';
import {
  Search,
  Bell,
  Plane,
  Building,
  Car,
  Anchor,
  ArrowUpRight,
  MapPin,
  Star,
  Sparkles,
  Tag,
  ShieldCheck,
  Globe,
  ArrowRight,
  Compass,
  Crown,
  Image as ImageIcon,
  CheckCircle2,
  BookOpen,
} from 'lucide-react-native';
import { AirlineLogo } from '../../components/AirlineLogos';
import { CompanyBrandBadge } from '../../components/CompanyBrandBadge';
import { getLocalizedDestination } from '../../utils/destinationUtils';
import { Flag } from '../../components/Flag';
import {
  CommercialFlightIcon,
  PrivateJetIcon,
  HotelResortIcon,
  SuperyachtIcon,
  LimousineIcon,
  LuxuryTourIcon,
  VipGalleryIcon,
  HotelApartmentsIcon,
  LuxuryMagazineIcon,
  NavSearchIcon,
  NavBellIcon,
  DestinationsIcon,
  OffersIcon,
} from '../../components/LuxuryNavIcons';
import { Vanir3DIcon } from '../../components/Vanir3DIcon';
import { InteractiveServicesSection } from '../../components/InteractiveServicesSection';
import {
  LuxuryPressable,
  LUXURY_EASE,
  luxuryTypography,
} from '../../components/LuxuryMicroInteractions';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Category = 'all' | 'flights' | 'jets' | 'hotels' | 'apartments' | 'packages' | 'cars' | 'yachts' | 'gallery' | 'destinations' | 'offers' | 'blog';

interface AirlinePartner {
  id: string;
  name: string;
  code: string;
  badge: string;
  country: string;
}

const AIRLINE_PARTNERS: AirlinePartner[] = [
  { id: '1', name: 'Emirates', code: 'EK', badge: 'First Class Suite', country: '🇦🇪' },
  { id: '2', name: 'Qatar Airways', code: 'QR', badge: 'Qsuite Excellence', country: '🇶🇦' },
  { id: '3', name: 'Saudia', code: 'SV', badge: 'Alfursan VIP', country: '🇸🇦' },
  { id: '4', name: 'Etihad Airways', code: 'EY', badge: 'The Residence', country: '🇦🇪' },
  { id: '5', name: 'EgyptAir', code: 'MS', badge: 'Star Alliance Gold', country: '🇪🇬' },
  { id: '6', name: 'British Airways', code: 'BA', badge: 'Club World VIP', country: '🇬🇧' },
  { id: '7', name: 'Turkish Airlines', code: 'TK', badge: 'Miles&Smiles VIP', country: '🇹🇷' },
  { id: '8', name: 'Lufthansa', code: 'LH', badge: 'First Class Terminal', country: '🇩🇪' },
  { id: '9', name: 'Singapore Airlines', code: 'SQ', badge: 'Suites Class', country: '🇸🇬' },
  { id: '10', name: 'American Airlines', code: 'AA', badge: 'Flagship First', country: '🇺🇸' },
  { id: '11', name: 'Swiss International', code: 'LX', badge: 'SWISS First', country: '🇨🇭' },
  { id: '12', name: 'Air France', code: 'AF', badge: 'La Première', country: '🇫🇷' },
  { id: '13', name: 'Gulf Air', code: 'GF', badge: 'Falcon Gold Suite', country: '🇧🇭' },
  { id: '14', name: 'Royal Jordanian', code: 'RJ', badge: 'Crown Class', country: '🇯🇴' },
  { id: '15', name: 'flydubai', code: 'FZ', badge: 'Business Class Lie-Flat', country: '🇦🇪' },
  { id: '16', name: 'Delta Air Lines', code: 'DL', badge: 'Delta One Suite', country: '🇺🇸' },
  { id: '17', name: 'Vanir VIP Aviation', code: 'VANIR', badge: 'Presidential Fleet', country: '✈️' },
];

interface FeedCardItem {
  id: string;
  category: Category;
  tag: string;
  tagColor?: string;
  image: string;
  images?: string[];
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
  routeTarget: keyof RootStackParamList;
  routeParams?: any;
}

const LOCAL_CARD_IMAGES: Record<string, any> = {
  f1: require('../../assets/images/services/flight_airplane_sky.jpg'),
  'f-marriott-mena': require('../../assets/images/services/service_hotel_reservation.jpg'),
  f6: require('../../assets/images/the_nile_river_cairo.jpg'),
};

interface AccreditationPartner {
  id: string;
  name: string;
  title: string;
  logo: any;
  badge: string;
}

const ACCREDITATION_PARTNERS: AccreditationPartner[] = [
  {
    id: 'iata',
    name: 'IATA',
    title: 'International Air Transport Association',
    logo: require('../../assets/images/partners/iata_logo.png'),
    badge: 'Certified Agent',
  },
  {
    id: 'nta',
    name: 'NTA',
    title: 'National Tour Association',
    logo: require('../../assets/images/partners/nta_logo.jpg'),
    badge: 'Official Member',
  },
  {
    id: 'jata',
    name: 'JATA',
    title: 'Japan Association of Travel Agents',
    logo: require('../../assets/images/partners/jata_logo.jpg'),
    badge: 'Accredited Agency',
  },
  {
    id: 'drv',
    name: 'DRV',
    title: 'German Travel Association',
    logo: require('../../assets/images/partners/drv_logo.png'),
    badge: 'Global Partner',
  },
];

interface AnimatedDestination {
  id: string;
  city: string;
  country: string;
  flag: string;
  tag: string;
  image: any;
  flightDuration: string;
  priceFrom: string;
  airportCode: string;
  originCode: string;
}

const MOVING_DESTINATIONS: AnimatedDestination[] = [
  {
    id: 'dest_paris',
    city: 'Paris',
    country: 'France',
    flag: '🇫🇷',
    tag: 'Haute Couture & Champs-Élysées',
    image: require('../../assets/images/hero/hero_paris.jpg'),
    flightDuration: '4h 45m Direct',
    priceFrom: '$890',
    airportCode: 'CDG',
    originCode: 'CAI',
  },
  {
    id: 'dest_tokyo',
    city: 'Tokyo',
    country: 'Japan',
    flag: '🇯🇵',
    tag: 'Imperial Elegance & Ginza VIP',
    image: require('../../assets/images/destinations/world_japan_kyoto.jpg'),
    flightDuration: '11h 20m VIP',
    priceFrom: '$1,850',
    airportCode: 'HND',
    originCode: 'CAI',
  },
  {
    id: 'dest_maldives',
    city: 'Maldives',
    country: 'Indian Ocean',
    flag: '🇲🇻',
    tag: 'Private Atoll Overwater Villas',
    image: require('../../assets/images/hero/hero_maldives.jpg'),
    flightDuration: '4h 10m Direct',
    priceFrom: '$1,350',
    airportCode: 'MLE',
    originCode: 'DXB',
  },
  {
    id: 'dest_swiss',
    city: 'Swiss Alps',
    country: 'Switzerland',
    flag: '🇨🇭',
    tag: 'Alpine Chalets & Mountain Serenity',
    image: require('../../assets/images/hero/hero_swiss_alps.jpg'),
    flightDuration: '4h 15m Direct',
    priceFrom: '$1,120',
    airportCode: 'ZRH',
    originCode: 'CAI',
  },
  {
    id: 'dest_amalfi',
    city: 'Amalfi Coast',
    country: 'Italy',
    flag: '🇮🇹',
    tag: 'Mediterranean Cliffside Suites',
    image: require('../../assets/images/destinations/world_italy_amalfi.jpg'),
    flightDuration: '3h 30m Direct',
    priceFrom: '$820',
    airportCode: 'FCO',
    originCode: 'CAI',
  },
  {
    id: 'dest_santorini',
    city: 'Santorini',
    country: 'Greece',
    flag: '🇬🇷',
    tag: 'Caldera Sunset Infinity Pools',
    image: require('../../assets/images/hero/hero_santorini.jpg'),
    flightDuration: '2h 45m Direct',
    priceFrom: '$760',
    airportCode: 'JTR',
    originCode: 'CAI',
  },
  {
    id: 'dest_bali',
    city: 'Bali',
    country: 'Indonesia',
    flag: '🇮🇩',
    tag: 'Tropical Sanctuary & Cliff Villas',
    image: require('../../assets/images/hero/hero_bali.jpg'),
    flightDuration: '10h 40m VIP',
    priceFrom: '$1,280',
    airportCode: 'DPS',
    originCode: 'CAI',
  },
  {
    id: 'dest_newyork',
    city: 'New York',
    country: 'United States',
    flag: '🇺🇸',
    tag: 'Fifth Avenue & Central Park Penthouse',
    image: require('../../assets/images/destinations/world_usa_new_york.jpg'),
    flightDuration: '11h 50m Direct',
    priceFrom: '$1,590',
    airportCode: 'JFK',
    originCode: 'CAI',
  },
];

function normalizeFeedCards(
  rawCards: any[],
  liveHotels: any[] = [],
  liveYachts: any[] = [],
  liveTransfers: any[] = [],
  liveJets: any[] = [],
): FeedCardItem[] {
  const source = !rawCards || rawCards.length === 0 ? FEED_CARDS : rawCards;

  const cairoHotel = liveHotels.find(h => h.id === 'hotel-cairo-ritz') || liveHotels[0];
  const dubaiHotel = liveHotels.find(h => h.id === 'hotel-dubai-burjalarab' || h.id === 'hotel-dubai-burj') || (liveHotels.length > 1 ? liveHotels[1] : undefined);
  const featuredYacht = liveYachts.find(y => y.id === '1' || y.id === 'yacht-1') || liveYachts[0];
  const featuredCar = liveTransfers.find(t => t.id === '1' || t.id === 'transfer-1') || liveTransfers[0];
  const featuredJet = liveJets.find(j => j.id === '1' || j.id === 'jet-1' || j.id === '2') || liveJets[0];

  return source.map(c => {
    const isF1 = c.id === 'f1';
    const isMarriott =
      c.id === 'f-marriott-mena' ||
      c.id === 'hotel-giza-menahouse' ||
      (c.title && (c.title.toLowerCase().includes('marriott') || c.title.toLowerCase().includes('mena'))) ||
      ((c as any).hotelId && ((c as any).hotelId.includes('marriott') || (c as any).hotelId.includes('mena')));
    const isRitz =
      c.id === 'f6' ||
      c.id === 'hotel-cairo-ritz' ||
      (c.title && c.title.toLowerCase().includes('ritz')) ||
      ((c as any).hotelId && (c as any).hotelId.includes('ritz'));
    const isBurj =
      c.id === 'f2' ||
      c.id === 'hotel-dubai-burjalarab' ||
      (c.title && c.title.toLowerCase().includes('burj')) ||
      ((c as any).hotelId && (c as any).hotelId.includes('burj'));
    const isF3 =
      c.id === 'f3' ||
      c.category === 'apartments' ||
      (c.title && (c.title.toLowerCase().includes('residence') || c.title.toLowerCase().includes('penthouse') || c.title.toLowerCase().includes('apartment')));
    const isF5 = c.id === 'f5';
    const isF4 = c.id === 'f4';
    const isF7 = c.id === 'f7';

    if (isF7) {
      const matchedJet = liveJets.find(j =>
        (c.title && (j.name.toLowerCase() === c.title.toLowerCase() || c.title.toLowerCase().includes(j.name.toLowerCase()))) ||
        j.id === (c as any).jetId ||
        j.id === '4'
      ) || featuredJet;

      const img = c.image || matchedJet?.image;
      const imgs = (c.images && c.images.length > 0) ? c.images : (matchedJet?.images || (img ? [img] : []));
      return {
        ...c,
        title: c.title || matchedJet?.name || 'Dassault Falcon 10X',
        subtitle: c.subtitle || matchedJet?.subtitle || 'Ultra Long Range VIP Flagship',
        price: c.price || (matchedJet?.price ? `${matchedJet.price}/hr` : '$13,500/hr'),
        image: img,
        images: imgs,
        routeTarget: 'JetDetails' as any,
        routeParams: {
          jetId: matchedJet?.id || '4',
          jetName: c.title || matchedJet?.name || 'Dassault Falcon 10X',
          category: matchedJet?.tag1 || 'Ultra Long Range',
          range: matchedJet?.tag2 || '7,500 nm Range',
          price: c.price || matchedJet?.price || '$13,500/hr',
          image: img,
          images: imgs,
          description: matchedJet?.description,
          rating: matchedJet?.rating || 4.99,
        },
      };
    }

    if (isF3) {
      const matchedApt = liveHotels.find(h =>
        (h as any).category === 'apartments' ||
        (h as any).isApartment === true ||
        h.id === 'apt-address-downtown-1' ||
        h.id === 'apt1' ||
        h.id === 'f3' ||
        (h.name && (h.name.toLowerCase().includes('address') || h.name.toLowerCase().includes('residence') || h.name.toLowerCase().includes('penthouse')))
      );
      const title = matchedApt?.name || c.title || 'The Address Downtown Residences';
      const subtitle = matchedApt?.subtitle || c.subtitle || 'Downtown Dubai • Panoramic Burj Khalifa View';
      const price = matchedApt?.price ? (matchedApt.price.includes('/nt') ? matchedApt.price : `${matchedApt.price}/nt`) : (c.price || '$750/nt');
      const img = matchedApt?.image || c.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=700&q=75';
      const imgs = (matchedApt?.images && matchedApt.images.length > 0) ? matchedApt.images : (c.images && c.images.length > 0 ? c.images : [img]);
      return {
        ...c,
        category: 'apartments',
        tag: c.tag || 'Luxury Serviced Residences',
        title,
        subtitle,
        price,
        image: img,
        images: imgs,
        routeTarget: 'HotelApartments' as any,
        routeParams: {
          initialApartmentId: matchedApt?.id || 'apt1',
          apartmentId: matchedApt?.id || 'apt1',
        },
      };
    }

    if (isMarriott) {
      const matchedMena = liveHotels.find(h =>
        h.id === 'hotel-giza-menahouse' ||
        h.id === 'f-marriott-mena' ||
        (h.name && (h.name.toLowerCase().includes('marriott') || h.name.toLowerCase().includes('mena')))
      );
      const title = matchedMena?.name || c.title || 'Marriott Mena House, Giza Pyramids';
      const subtitle = matchedMena?.subtitle || c.subtitle || 'Pyramids Road, Giza, Cairo, Egypt • Royal Vista';
      const price = matchedMena?.price ? (matchedMena.price.includes('/nt') ? matchedMena.price : `${matchedMena.price}/nt`) : (c.price || '$920/nt');
      const img = matchedMena?.image || c.image || 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=700&q=75';
      const imgs = (matchedMena?.images && matchedMena.images.length > 0) ? matchedMena.images : (c.images && c.images.length > 0 ? c.images : [img]);
      return {
        ...c,
        category: 'hotels',
        title,
        subtitle,
        price,
        image: img,
        images: imgs,
        routeTarget: 'HotelDetails',
        routeParams: {
          hotelId: matchedMena?.id || 'hotel-giza-menahouse',
          hotelName: title,
          location: subtitle,
          price,
          image: img,
          images: imgs,
          description: matchedMena?.description || 'Legendary 1869 royal hunting lodge set in 40 private acres of fragrant jasmine gardens with unhindered, breathtaking views of the Great Pyramids of Giza. Features antique handcrafted furniture, the 139 Pavilion garden restaurant with pyramid reflections, and private sunrise archaeological access.',
          rating: typeof matchedMena?.rating === 'number' ? matchedMena.rating : (typeof c.rating === 'number' ? c.rating : 4.98),
        },
      };
    }

    if (isRitz) {
      const matchedRitz = liveHotels.find(h =>
        h.id === 'hotel-cairo-ritz' ||
        h.id === 'f6' ||
        (h.name && h.name.toLowerCase().includes('ritz'))
      ) || cairoHotel;
      const title = matchedRitz?.name || c.title || 'The Nile Ritz-Carlton Cairo';
      const subtitle = matchedRitz?.subtitle || c.subtitle || 'Nile Corniche, Downtown Cairo • Royal Suites';
      const price = matchedRitz?.price ? (matchedRitz.price.includes('/nt') ? matchedRitz.price : `${matchedRitz.price}/nt`) : (c.price || '$850/nt');
      const img = matchedRitz?.image || c.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=700&q=75';
      const imgs = (matchedRitz?.images && matchedRitz.images.length > 0) ? matchedRitz.images : (c.images && c.images.length > 0 ? c.images : [img]);
      return {
        ...c,
        category: 'hotels',
        title,
        subtitle,
        price,
        image: img,
        images: imgs,
        routeTarget: 'HotelDetails',
        routeParams: {
          hotelId: matchedRitz?.id || 'hotel-cairo-ritz',
          hotelName: title,
          location: subtitle,
          price,
          image: img,
          images: imgs,
          description: matchedRitz?.description || 'Iconic palatial hotel set on the Nile River between the historic Egyptian Museum and Tahrir Square. Offers palatial suites, panoramic river balconies, an Olympic outdoor pool with private cabanas, and 24/7 royal butler service.',
          rating: typeof matchedRitz?.rating === 'number' ? matchedRitz.rating : (typeof c.rating === 'number' ? c.rating : 4.9),
        },
      };
    }

    if (isBurj) {
      const matchedBurj = liveHotels.find(h =>
        h.id === 'hotel-dubai-burjalarab' ||
        h.id === 'hotel-dubai-burj' ||
        h.id === 'f2' ||
        (h.name && h.name.toLowerCase().includes('burj'))
      ) || dubaiHotel;
      const title = matchedBurj?.name || c.title || 'Burj Al Arab Jumeirah';
      const subtitle = matchedBurj?.subtitle || c.subtitle || 'Jumeirah Beach Road, Dubai, UAE • 7-Star Wonder';
      const price = matchedBurj?.price ? (matchedBurj.price.includes('/nt') ? matchedBurj.price : `${matchedBurj.price}/nt`) : (c.price || '$2,400/nt');
      const img = matchedBurj?.image || c.image || 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=700&q=75';
      const imgs = (matchedBurj?.images && matchedBurj.images.length > 0) ? matchedBurj.images : (c.images && c.images.length > 0 ? c.images : [img]);
      return {
        ...c,
        category: 'hotels',
        title,
        subtitle,
        price,
        image: img,
        images: imgs,
        routeTarget: 'HotelDetails',
        routeParams: {
          hotelId: matchedBurj?.id || 'hotel-dubai-burjalarab',
          hotelName: title,
          location: subtitle,
          price,
          image: img,
          images: imgs,
          description: matchedBurj?.description || 'The world’s only iconic 7-star ultra-luxury hotel, standing on its own private island with duplex suites, personal 24-karat gold iPads, dedicated private butlers, Rolls-Royce chauffeur fleets, and Michelin-starred dining underwater and in the sky.',
          rating: typeof matchedBurj?.rating === 'number' ? matchedBurj.rating : (typeof c.rating === 'number' ? c.rating : 5.0),
        },
      };
    }

    if (isF5 && featuredYacht) {
      const img = c.image || featuredYacht.image;
      const imgs = (c.images && c.images.length > 0) ? c.images : (featuredYacht.images || [img]);
      return {
        ...c,
        title: c.title || featuredYacht.name,
        subtitle: c.subtitle || featuredYacht.subtitle || 'Dubai Marina & Coastline',
        price: c.price || (featuredYacht.price ? `${featuredYacht.price}/day` : undefined),
        image: img,
        images: imgs,
        routeTarget: 'YachtDetails',
        routeParams: {
          yachtId: featuredYacht.id,
          yachtName: c.title || featuredYacht.name,
          location: c.subtitle || featuredYacht.subtitle,
          price: c.price || featuredYacht.price,
          image: img,
          images: imgs,
          description: featuredYacht.description,
          rating: featuredYacht.rating,
        },
      };
    }

    if (isF4 && featuredCar) {
      const img = c.image || featuredCar.image;
      const imgs = (c.images && c.images.length > 0) ? c.images : (featuredCar.images || [img]);
      return {
        ...c,
        title: c.title || featuredCar.name,
        subtitle: c.subtitle || featuredCar.subtitle || 'Executive Chauffeur Fleet',
        price: c.price || featuredCar.price,
        image: img,
        images: imgs,
        routeTarget: 'CarDetails',
        routeParams: {
          carId: featuredCar.id,
          carName: c.title || featuredCar.name,
          category: featuredCar.tag1,
          location: c.subtitle || featuredCar.subtitle,
          price: c.price || featuredCar.price,
          image: img,
          images: imgs,
          description: featuredCar.description,
          rating: featuredCar.rating,
        },
      };
    }

    return {
      ...c,
      localImage: LOCAL_CARD_IMAGES[c.id] || c.localImage,
      ...(isF1 || c.category === 'flights' || c.isFlightRoute || Boolean(c.origin && c.destination) ? {
        title: isF1 ? 'First Class & Private Jet' : (c.title || 'First Class Flight'),
        subtitle: isF1 ? 'Emirates, Qatar Airways & Gulfstream Fleet' : (c.subtitle || 'VIP Bespoke Routes'),
        origin: c.origin || 'CAI',
        destination: c.destination || 'LON',
        originCity: c.originCity || 'Cairo',
        destinationCity: c.destinationCity || 'London',
        price: isF1 ? '' : (c.price || ''),
        rating: typeof c.rating === 'number' ? c.rating : 5.0,
        isFlightRoute: true,
        tag: c.tag || 'First Class & Private Jet ✈️',
      } : {}),
      ...(c.category === 'hotels' || c.category === 'apartments' ? {
        routeTarget: c.category === 'apartments' ? ('HotelApartments' as any) : 'HotelDetails',
        routeParams: c.category === 'apartments'
          ? {
              initialApartmentId: (c as any).apartmentId || (c as any).hotelId || c.routeParams?.apartmentId || c.id,
              apartmentId: (c as any).apartmentId || (c as any).hotelId || c.routeParams?.apartmentId || c.id,
            }
          : {
              hotelId: (c as any).hotelId || c.routeParams?.hotelId || (
                c.title?.toLowerCase().includes('marriott') || c.title?.toLowerCase().includes('mena')
                  ? 'hotel-giza-menahouse'
                  : c.title?.toLowerCase().includes('ritz')
                  ? 'hotel-cairo-ritz'
                  : c.title?.toLowerCase().includes('burj')
                  ? 'hotel-dubai-burjalarab'
                  : c.id
              ),
              hotelName: c.title,
              location: c.subtitle,
              price: c.price,
              rating: typeof c.rating === 'number' ? c.rating : 4.96,
              image: c.image,
              images: c.images || [c.image],
            },
      } : {}),
      ...(c.category === 'yachts' ? {
        routeTarget: 'YachtDetails',
        routeParams: {
          yachtId: (c as any).yachtId || c.id,
          yachtName: c.title,
          location: c.subtitle,
          price: c.price,
          image: c.image,
          images: c.images || [c.image],
        },
      } : {}),
      ...(c.category === 'cars' ? {
        routeTarget: 'CarDetails',
        routeParams: {
          carId: (c as any).carId || c.id,
          carName: c.title,
          location: c.subtitle,
          price: c.price,
          image: c.image,
          images: c.images || [c.image],
        },
      } : {}),
      ...(c.category === 'jets' || c.category === 'private-jet' ? {
        routeTarget: 'JetDetails' as any,
        routeParams: {
          jetId: (c as any).jetId || c.id,
          jetName: c.title,
          category: c.tag,
          price: c.price,
          image: c.image,
          images: c.images || [c.image],
        },
      } : {}),
    };
  });
}

const FEED_CARDS: FeedCardItem[] = [
  {
    id: 'f1',
    category: 'flights',
    tag: 'First Class & Private Jet ✈️',
    localImage: require('../../assets/images/services/flight_airplane_sky.jpg'),
    image: 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=700&q=75',
    title: 'First Class & Private Jet',
    subtitle: 'Emirates, Qatar Airways & Gulfstream Fleet',
    isFlightRoute: true,
    origin: 'CAI',
    originCity: 'Cairo',
    destination: 'LON',
    destinationCity: 'London',
    rating: 5.0,
    routeTarget: 'FlightBooking',
    routeParams: { origin: 'CAI', destination: 'LON' },
  },

  {
    id: 'f2',
    category: 'hotels',
    tag: 'EXCLUSIVE 25% PRIVILEGE',
    tagColor: '#D4AF37',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=700&q=75',
    images: [
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=700&q=75',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=700&q=75',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=700&q=75',
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=700&q=75',
    ],
    title: 'Burj Al Arab Jumeirah',
    subtitle: 'Jumeirah Beach Road, Dubai, UAE • 7-Star Wonder',
    price: '$2,400/nt',
    rating: 5.0,
    routeTarget: 'HotelDetails',
    routeParams: {
      hotelId: 'hotel-dubai-burjalarab',
      hotelName: 'Burj Al Arab Jumeirah',
      location: 'Jumeirah Beach Road, Dubai, UAE',
      price: '$2,400/nt',
      rating: 5.0,
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=700&q=75',
      images: [
        'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=700&q=75',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=700&q=75',
        'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=700&q=75',
        'https://images.unsplash.com/photo-1544025162-d76694265947?w=700&q=75',
      ],
    },
  },
  {
    id: 'f3',
    category: 'apartments',
    tag: 'Luxury Serviced Residences',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=700&q=75',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=700&q=75',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=700&q=75',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=700&q=75',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=700&q=75',
    ],
    title: 'The Address Downtown Residences',
    subtitle: 'Downtown Dubai • Panoramic Burj Khalifa View',
    price: '$750/nt',
    rating: 4.96,
    routeTarget: 'HotelApartments',
    routeParams: {
      initialApartmentId: 'apt1',
      apartmentId: 'apt1',
    },
  },
  {
    id: 'f4',
    category: 'cars',
    tag: 'Chauffeur & Executive Fleet',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&q=75',
    title: 'Rolls-Royce Phantom VIII',
    subtitle: 'Uniformed Chauffeur • Wi-Fi & Refreshments • Massage Seats',
    price: '$800/transfer',
    rating: 4.9,
    routeTarget: 'CarDetails',
    routeParams: {
      carId: '1',
      carName: 'Rolls-Royce Phantom VIII',
      category: 'Executive Sedan',
      location: 'Dubai & Cairo • Uniformed Chauffeur',
      price: '$800/transfer',
      rating: 4.9,
    },
  },
  {
    id: 'f5',
    category: 'yachts',
    tag: 'Luxury Superyacht Charter',
    image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=600&q=75',
    title: 'Majesty 120 Superyacht',
    subtitle: 'Dubai Marina • Private Onboard Chef & 7-Member Crew',
    price: '$1,500/hr',
    rating: 4.8,
    routeTarget: 'YachtDetails',
    routeParams: {
      yachtId: '1',
      yachtName: 'Majesty 120 Superyacht',
      location: 'Dubai Marina & Arabian Gulf',
      price: '$1,500/hr',
      rating: 4.8,
    },
  },

  {
    id: 'f7',
    category: 'jets',
    tag: 'Ultra Long Range Flagship Jet',
    localImage: require('../../assets/images/services/luxury_private_jet_flight.jpg'),
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=700&q=75',
    title: 'Bombardier Global 7500',
    subtitle: 'Transcontinental • 19 VIP Seats • Master Bedroom Suite',
    price: '$18,500/hr',
    rating: 4.9,
    routeTarget: 'JetDetails' as any,
    routeParams: {
      jetId: '1',
      jetName: 'Bombardier Global 7500',
      category: 'Ultra Long Range Flagship',
      range: '7,700 nm',
      speed: 'Mach 0.925',
      pax: '19 VIP Seats',
      price: '$18,500/hr',
      rating: 4.9,
    },
  },
];

function AccreditationRibbon() {
  return (
    <View style={styles.accredSection}>
      <View style={styles.accredHeader}>
        <ShieldCheck color="#D4AF37" size={15} strokeWidth={2.4} />
        <Text style={styles.accredTitle}>Official Global Accreditations & Certifications</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.accredScroll}>
        {ACCREDITATION_PARTNERS.map(item => (
          <View key={item.id} style={styles.accredCard}>
            <View style={styles.accredLogoBox}>
              <Image source={item.logo} style={styles.accredLogo} resizeMode="contain" fadeDuration={0} />
            </View>
            <View style={styles.accredInfo}>
              <Text style={styles.accredName}>{item.name}</Text>
              <Text style={styles.accredBadgeText}>{item.badge}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function MovingDestinationsSection({
  navigation,
  isFocused,
}: {
  navigation: Nav;
  isFocused: boolean;
}) {
  const listRef = React.useRef<FlatList<AnimatedDestination>>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [liveDestinations, setLiveDestinations] = useState<AnimatedDestination[]>([]);
  const isInteracting = React.useRef(false);
  const CARD_WIDTH = 290;
  const CARD_SPACING = 14;
  const ITEM_FULL_WIDTH = CARD_WIDTH + CARD_SPACING;

  useEffect(() => {
    let mounted = true;
    firestore()
      .collection('destinations')
      .get()
      .then(snap => {
        if (!mounted || !snap || snap.empty) return;
        const list: AnimatedDestination[] = [];
        snap.forEach(doc => {
          const d = doc.data();
          if (d && d.status !== 'draft') {
            const img =
              d.images?.[0]?.url ||
              d.image ||
              d.imageUrl ||
              (typeof d.images?.[0] === 'string' ? d.images[0] : null);

            const rawCity = d.cityNameEn || d.nameEn || d.name_en || d.cityName || d.name || d.city || 'Exclusive Destination';
            const loc = getLocalizedDestination({ id: doc.id, name: rawCity, country: d.country }, 'en');
            const cityName = /[\u0600-\u06FF]/.test(rawCity) ? loc.name.split('&')[0].trim() : rawCity;
            const countryName = /[\u0600-\u06FF]/.test(d.country || '') ? loc.country : (d.country || 'Global VIP');
            const rawTag = d.tag || d.subtitle || 'VIP Bespoke Travel & Routes';
            const tag = /[\u0600-\u06FF]/.test(rawTag) ? 'VIP Bespoke Travel & Routes' : rawTag;

            list.push({
              id: doc.id,
              city: cityName,
              country: countryName,
              flag: d.flag || '✈️',
              tag,
              image: img ? { uri: img } : require('../../assets/images/hero/hero_paris.jpg'),
              flightDuration: d.flightDuration || 'Direct Private Flight',
              priceFrom: d.priceFrom || (d.price ? `$${Number(d.price).toLocaleString()}` : '$1,200'),
              airportCode: d.airportCode || 'VIP',
              originCode: d.originCode || 'DXB',
            });
          }
        });
        if (list.length > 0) {
          setLiveDestinations(list);
        }
      })
      .catch(() => {
        // Silent fallback to static destinations
      });
    return () => {
      mounted = false;
    };
  }, []);

  const displayDestinations = liveDestinations.length > 0 ? liveDestinations : MOVING_DESTINATIONS;

  useEffect(() => {
    if (!isFocused || displayDestinations.length <= 1) {
      return;
    }
    const timer = setInterval(() => {
      if (!isInteracting.current && listRef.current && displayDestinations.length > 0) {
        setActiveIndex(prev => {
          const nextIndex = (prev + 1) % displayDestinations.length;
          try {
            listRef.current?.scrollToOffset({
              offset: nextIndex * ITEM_FULL_WIDTH,
              animated: true,
            });
          } catch {
            // Ignore transient layout offset errors
          }
          return nextIndex;
        });
      }
    }, 7000);

    return () => clearInterval(timer);
  }, [ITEM_FULL_WIDTH, displayDestinations.length, isFocused]);

  const handleScroll = useCallback(
    (event: any) => {
      const contentOffsetX = event.nativeEvent.contentOffset?.x ?? 0;
      const index = Math.round(contentOffsetX / ITEM_FULL_WIDTH);
      if (index >= 0 && index < displayDestinations.length) {
        setActiveIndex(prev => (prev === index ? prev : index));
      }
    },
    [ITEM_FULL_WIDTH, displayDestinations.length],
  );

  const renderDestinationItem = useCallback(
    ({ item: dest }: { item: AnimatedDestination }) => (
      <LuxuryPressable
        style={styles.movingDestCard}
        onPress={() =>
          navigation.navigate('FlightBooking', {
            prefillDestination: dest.airportCode,
            prefillDestinationCity: dest.city,
            prefillOrigin: dest.originCode,
          } as any)
        }
      >
        <Image source={dest.image} style={styles.movingDestImg} resizeMode="cover" fadeDuration={0} />
        <LinearGradient
          colors={['rgba(15, 23, 42, 0.15)', 'rgba(15, 23, 42, 0.45)', 'rgba(11, 17, 26, 0.95)']}
          style={styles.movingDestGrad}
        />

        {/* Top Badges */}
        <View style={styles.movingDestTopRow}>
          <View style={styles.movingDestCapsule}>
            <Flag emoji={dest.flag} size={22} />
            <Text style={styles.movingDestCity}>{dest.city}</Text>
          </View>

          <View style={styles.movingDestRouteBadge}>
            <Text style={styles.movingDestRouteText}>{dest.originCode}</Text>
            <View style={styles.movingDestPlaneIconWrapper}>
              <Plane color="#D4AF37" size={11} strokeWidth={2.4} fill="#D4AF37" />
            </View>
            <Text style={styles.movingDestRouteText}>{dest.airportCode}</Text>
          </View>
        </View>

        {/* Bottom Content */}
        <View style={styles.movingDestBottom}>
          <Text style={styles.movingDestTag} numberOfLines={1}>
            {dest.tag}
          </Text>
          <View style={styles.movingDestDetailsRow}>
            <View>
              <Text style={styles.movingDestDuration}>{dest.flightDuration}</Text>
              <Text style={styles.movingDestPrice}>
                From <Text style={{ color: '#D4AF37', fontWeight: '900' }}>{dest.priceFrom}</Text>
              </Text>
            </View>

            <View style={styles.movingDestBookBtn}>
              <Text style={styles.movingDestBookBtnText}>Book Flight</Text>
              <ArrowRight color="#1C1917" size={12} strokeWidth={2.8} />
            </View>
          </View>
        </View>
      </LuxuryPressable>
    ),
    [navigation],
  );

  return (
    <View style={styles.movingDestSection}>
      {/* Section Header */}
      <View style={styles.movingDestHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={styles.movingDestIconCircle}>
            <Compass color="#D4AF37" size={18} strokeWidth={2.2} />
          </View>
          <View>
            <Text style={styles.movingDestTitle}>Trending Global Destinations</Text>
            <Text style={styles.movingDestSubtitle}>Curated VIP Routes & Non-stop Luxury Flights</Text>
          </View>
        </View>

        <Pressable
          style={styles.movingDestAllBtn}
          onPress={() => navigation.navigate('Destinations')}
        >
          <Text style={styles.movingDestAllText}>View All</Text>
          <ArrowRight color="#D4AF37" size={13} strokeWidth={2.2} />
        </Pressable>
      </View>

      {/* Virtualized Horizontal FlatList with Snap & Focus-Paused Auto-Scroll */}
      <FlatList
        ref={listRef}
        data={displayDestinations}
        keyExtractor={item => item.id}
        renderItem={renderDestinationItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_FULL_WIDTH}
        snapToAlignment="center"
        decelerationRate="fast"
        onMomentumScrollEnd={handleScroll}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={3}
        removeClippedSubviews={Platform.OS === 'android'}
        getItemLayout={(_, index) => ({
          length: ITEM_FULL_WIDTH,
          offset: ITEM_FULL_WIDTH * index,
          index,
        })}
        onTouchStart={() => {
          isInteracting.current = true;
        }}
        onTouchEnd={() => {
          setTimeout(() => {
            isInteracting.current = false;
          }, 2500);
        }}
        contentContainerStyle={styles.movingDestScroll}
      />

      {/* Progress Dots */}
      <View style={styles.movingDestDotsRow}>
        {displayDestinations.map((_, dotIdx) => (
          <View
            key={`dot-${dotIdx}`}
            style={[
              styles.movingDestDot,
              dotIdx === activeIndex && styles.movingDestDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const VIP_GALLERY_HIGHLIGHTS = [
  {
    id: 'gh-jet',
    title: 'Bombardier Global 7500',
    category: 'Private Jet Fleet',
    count: '32 Photos',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=75',
    targetCategory: 'Aviation',
  },
  {
    id: 'gh-yacht',
    title: 'Majesty 120 Superyacht',
    category: 'Marine & Charter',
    count: '28 Photos',
    image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=600&q=75',
    targetCategory: 'Yachts',
  },
  {
    id: 'gh-residence',
    title: 'The Address Residences',
    category: 'Residences & Suites',
    count: '45 Photos',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=75',
    targetCategory: 'Residences',
  },
  {
    id: 'gh-car',
    title: 'Rolls-Royce Phantom VIII',
    category: 'Executive Chauffeur',
    count: '18 Photos',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&q=75',
    targetCategory: 'Cars',
  },
  {
    id: 'gh-hotel',
    title: 'The Nile Ritz-Carlton Royal Suite',
    category: '5-Star Hospitality',
    count: '26 Photos',
    image: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=600&q=75',
    targetCategory: 'Hotels',
  },
];

function VipGalleryCarouselCard({
  item,
  onPress,
}: {
  item: typeof VIP_GALLERY_HIGHLIGHTS[0];
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 1.03,
      duration: 800,
      easing: LUXURY_EASE,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1.0,
      duration: 600,
      easing: LUXURY_EASE,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      style={styles.vipGalleryCard}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.Image
        source={{ uri: item.image }}
        style={[styles.vipGalleryCardImg, { transform: [{ scale: scaleAnim }] }]}
        resizeMode="cover"
        fadeDuration={0}
      />
      {/* Subtle bottom-heavy dark linear gradient overlay: rgba(0,0,0,0) to rgba(0,0,0,0.6) */}
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.12)', 'rgba(0,0,0,0.62)']}
        locations={[0.2, 0.55, 1]}
        style={styles.vipGalleryCardGradient}
      >
        {/* Bottom-left Tracked Uppercase Typography (Clean, zero number badges over photo) */}
        <View style={styles.vipGalleryTypographyOverlay}>
          <Text style={styles.vipGalleryCardCategory}>{item.category.toUpperCase()}</Text>
          <Text style={styles.vipGalleryCardTitle} numberOfLines={1}>
            {item.title.toUpperCase()}
          </Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

function normalizeVipGalleryCat(cat?: string): string {
  if (!cat) return 'VIP Signature Collection';
  const c = cat.trim();
  if (c.includes('مرفوع') || c.includes('جهاز') || c.includes('نخبة') || c.toLowerCase().includes('upload')) return 'VIP Signature Collection';
  if (c.includes('فنادق') || c.includes('أجنحة') || c.toLowerCase().includes('hotel')) return 'Luxury Hotels';
  if (c.includes('ليموزين') || c.includes('سيارات') || c.toLowerCase().includes('fleet') || c.toLowerCase().includes('car')) return 'Executive Fleet';
  if (c.includes('طيران') || c.toLowerCase().includes('jet') || c.toLowerCase().includes('aviation')) return 'Private Aviation';
  if (c.includes('يخوت') || c.toLowerCase().includes('yacht')) return 'Superyachts';
  if (c.includes('وجهات') || c.toLowerCase().includes('destination')) return 'Exotic Destinations';
  return cat;
}

function normalizeVipGalleryTitle(title?: string): string {
  if (!title) return 'Vanir VIP Signature Showcase';
  const t = title.trim();
  if (t.includes('مالديف') || t.includes('فيلات')) return 'Maldives Overwater Private Villas & Lagoon Sanctuary';
  if (t.includes('رولز') || t.includes('فانتوم') || t.includes('أسطول')) return 'Rolls-Royce Phantom VIII Executive Chauffeur Fleet';
  if (t.includes('جولف') || t.includes('G650') || t.includes('بومباردييه') || t.includes('طائرة')) return 'Bombardier Global 7500 VIP Transcontinental Flagship';
  if (t.includes('يخت') || t.includes('ماجستي')) return 'Majesty 120 Superyacht Private Charter Escapade';
  if (t.includes('منصور') || t.includes('مراكش') || t.includes('فندق')) return 'Royal Mansour Marrakech Palace & Private Courtyards';
  if (t.includes('أهرامات') || t.includes('غروب')) return 'Giza Royal Pyramids Exclusive Sunset Panorama';
  if (t.includes('دبي') || t.includes('مارينا')) return 'Burj Al Arab & Dubai Royal Marina Panoramic Suites';
  return title;
}

function VipGalleryShowcaseSection({
  navigation,
  liveGalleryItems = [],
}: {
  navigation: any;
  liveGalleryItems?: LiveGalleryItem[];
}) {
  const displayItems = useMemo(() => {
    if (liveGalleryItems && liveGalleryItems.length > 0) {
      return liveGalleryItems.slice(0, 10).map((item, idx) => ({
        id: item.id || `live-gal-${idx}`,
        title: normalizeVipGalleryTitle(item.title),
        category: normalizeVipGalleryCat(item.category),
        count: 'VIP Media',
        image: item.url,
        targetCategory: item.category || 'VIP Showcase',
      }));
    }
    return VIP_GALLERY_HIGHLIGHTS;
  }, [liveGalleryItems]);

  return (
    <View style={styles.vipGallerySectionContainer}>
      <View style={styles.vipGallerySectionHeader}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <View style={styles.vipGalleryBadge}>
            <Sparkles color="#D4AF37" size={11} strokeWidth={2.5} />
            <Text style={styles.vipGalleryBadgeText}>VANIR VIP MEDIA ARCHIVE</Text>
          </View>
          <Text style={styles.vipGallerySectionTitle}>Exclusive Fleet & Suite Showcase</Text>
          <Text style={styles.vipGallerySectionSubtitle}>
            High-resolution visual archives of private jets, superyachts & estates
          </Text>
        </View>
        <Pressable
          style={styles.vipGalleryViewAllBtn}
          onPress={() => navigation.navigate('Gallery')}
        >
          <Text style={styles.vipGalleryViewAllText}>View All</Text>
          <ArrowRight color="#D4AF37" size={13} strokeWidth={2.4} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={250}
        snapToAlignment="start"
        decelerationRate="fast"
        contentContainerStyle={styles.vipGalleryScrollContent}
      >
        {displayItems.map((item: any) => (
          <VipGalleryCarouselCard
            key={item.id}
            item={item}
            onPress={() => navigation.navigate('Gallery', { initialCategory: item.targetCategory })}
          />
        ))}
      </ScrollView>
    </View>
  );
}

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { t } = useTranslation();
  const { itemsByCategory, fetchCategory } = useCatalogStore();
  const [activeCategory] = useState<Category>('all');

  // User Avatar State in HomeScreen
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarPresetSource, setAvatarPresetSource] = useState<any>(null);

  const loadUserAvatar = useCallback(async () => {
    try {
      const savedAvatar = await AsyncStorage.getItem(AVATAR_STORAGE_KEY);
      if (savedAvatar) {
        const parsed = JSON.parse(savedAvatar);
        if (parsed.type === 'custom' && parsed.uri) {
          setAvatarUri(parsed.uri);
          setAvatarPresetSource(null);
        } else if (parsed.type === 'preset' && parsed.id) {
          const match = PRESET_AVATARS.find(p => p.id === parsed.id);
          if (match) {
            setAvatarPresetSource(match.source);
            setAvatarUri(null);
          }
        }
      } else {
        setAvatarPresetSource(require('../../assets/images/egyptian_royal_queen.jpg'));
      }
    } catch {
      // Fallback
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUserAvatar();
    }, [loadUserAvatar])
  );

  const [rawFeedCards, setRawFeedCards] = useState<any[]>(() => memoryFeedCards || FEED_CARDS);
  const [liveGallery, setLiveGallery] = useState<LiveGalleryItem[]>([]);
  const [serviceControls, setServiceControls] = useState<ServiceControls | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Recompute normalized feed cards cleanly from shared CatalogStore (zero duplicate Firestore listeners)
  const liveCards = useMemo(
    () =>
      normalizeFeedCards(
        rawFeedCards,
        itemsByCategory.hotels,
        itemsByCategory.yachts,
        itemsByCategory.limousines,
        itemsByCategory.jets,
      ),
    [
      rawFeedCards,
      itemsByCategory.hotels,
      itemsByCategory.yachts,
      itemsByCategory.limousines,
      itemsByCategory.jets,
    ],
  );

  useEffect(() => {
    const unsubCards = subscribeLiveHomeFeedCards(cards => {
      if (cards && cards.length > 0) {
        setRawFeedCards(cards);
      }
    });

    const unsubControls = subscribeLiveAppControls(ctrl => {
      if (ctrl) setServiceControls(ctrl);
    });

    const unsubGallery = subscribeLiveGallery(items => {
      if (items && items.length > 0) {
        setLiveGallery(items);
      }
    });

    return () => {
      unsubCards();
      unsubControls();
      unsubGallery();
    };
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [cards, ctrl] = await Promise.all([
        getLiveHomeFeedCards(),
        getLiveAppControls(),
        fetchCategory('hotels', { force: true }),
        fetchCategory('yachts', { force: true }),
        fetchCategory('limousines', { force: true }),
        fetchCategory('jets', { force: true }),
      ]);
      if (cards && cards.length > 0) {
        setRawFeedCards(cards);
      }
      if (ctrl) setServiceControls(ctrl);
      loadUserAvatar();
    } finally {
      setRefreshing(false);
    }
  }, [fetchCategory, loadUserAvatar]);

  const filteredCards = useMemo(
    () =>
      activeCategory === 'all'
        ? liveCards
        : liveCards.filter(c => c.category === activeCategory),
    [activeCategory, liveCards],
  );

  // Navigate directly to the selected service screen WITHOUT destructively filtering/unmounting the Home feed!
  const handleCategoryPress = useCallback(
    (cat: Category) => {
      if (cat === 'flights') {
        navigation.navigate('FlightBooking');
      } else if (cat === 'jets') {
        navigation.navigate('PrivateJet');
      } else if (cat === 'hotels') {
        navigation.navigate('HotelCatalog');
      } else if (cat === 'apartments') {
        navigation.navigate('HotelApartments');
      } else if (cat === 'packages') {
        navigation.navigate('Tours');
      } else if (cat === 'cars') {
        navigation.navigate('Cars');
      } else if (cat === 'yachts') {
        navigation.navigate('Yacht');
      } else if (cat === 'gallery') {
        navigation.navigate('Gallery');
      } else if (cat === 'destinations') {
        navigation.navigate('Destinations');
      } else if (cat === 'offers') {
        navigation.navigate('Offers');
      } else if (cat === 'blog') {
        navigation.navigate('Blog');
      }
    },
    [navigation],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Dark Glass Hero Header */}
      <View style={styles.heroContainer}>
        <Image
          source={require('../../assets/images/services/luxury_private_jet_flight.jpg')}
          style={styles.heroBackgroundImage}
          resizeMode="cover"
          fadeDuration={0}
        />
        <LinearGradient
          colors={['#050A14', '#0A162B', '#112340', '#182E52']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.header}>
          <View style={styles.headerTitleBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Image
                source={require('../../assets/vanir_round_logo.png')}
                style={styles.headerLogo}
                resizeMode="contain"
                fadeDuration={0}
              />
              <View>
                <Text style={styles.headerBrandDark}>VANIR</Text>
                <Text style={styles.headerBrandSubtitleDark}>ROYAL CONCIERGE</Text>
              </View>
            </View>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              style={({ pressed }) => [styles.headerBtnDark, pressed && styles.topBtnPressed]}
              onPress={() => navigation.navigate('Discover')}
            >
              <NavSearchIcon color="#C5A059" size={20} strokeWidth={1.5} />
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.headerBtnDark, pressed && styles.topBtnPressed]}
              onPress={() => navigation.navigate('DashboardNotifications')}
            >
              <NavBellIcon color="#C5A059" size={20} strokeWidth={1.5} />
            </Pressable>
          </View>
        </View>

        {/* VIP Member Card */}
        <LuxuryPressable
          style={styles.lowerProfileBarDark}
          onPress={() => navigation.navigate('UserProfile')}
        >
          <LinearGradient
            colors={['#162644', '#0C172B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.lowerProfileGradient}
          >
            <View style={styles.lowerAvatarWrapperDark}>
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={styles.lowerAvatarImg}
                  resizeMode="cover"
                  fadeDuration={0}
                />
              ) : avatarPresetSource ? (
                <Image
                  source={avatarPresetSource}
                  style={styles.lowerAvatarImg}
                  resizeMode="cover"
                  fadeDuration={0}
                />
              ) : (
                <Text style={styles.lowerAvatarFallbackText}>V</Text>
              )}
              <View style={styles.lowerAvatarDot} />
            </View>

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <Text style={styles.lowerProfileNameDark}>VIP Member</Text>
                <View style={styles.lowerProfileBadgeDark}>
                  <Crown color="#D4AF37" size={10} strokeWidth={2.2} />
                  <Text style={styles.lowerProfileBadgeTextDark}>ROYAL TIER</Text>
                </View>
              </View>
              <Text style={styles.lowerProfileSubDark} numberOfLines={1}>
                Bespoke private jet & superyacht concierge
              </Text>
              <Text style={styles.lowerProfileMemberId}>MEMBER NO. VN-0042</Text>
            </View>

            <View style={styles.lowerProfileArrowDark}>
              <ArrowRight color="#D4AF37" size={15} strokeWidth={2.2} />
            </View>
          </LinearGradient>
        </LuxuryPressable>

        {/* Smooth feathering gradient dissolving royal navy into ivory section below */}
        <LinearGradient
          colors={['rgba(250, 249, 246, 0)', 'rgba(250, 249, 246, 0.4)', 'rgba(250, 249, 246, 0.85)', '#FAF9F6']}
          style={styles.heroBottomFadeOverlay}
          pointerEvents="none"
        />
      </View>

      {/* Categories — Airbnb-style gold icons on ivory */}
      <View style={styles.categoriesSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
          {([
            { key: 'flights', Icon: CommercialFlightIcon, label: t('categories.flights', 'Flights') },
            { key: 'jets', Icon: PrivateJetIcon, label: t('categories.jets', 'Private Jet') },
            { key: 'hotels', Icon: HotelResortIcon, label: t('categories.hotels', 'Hotels') },
            { key: 'yachts', Icon: SuperyachtIcon, label: t('categories.yachts', 'Yachts') },
            { key: 'cars', Icon: LimousineIcon, label: t('categories.cars', 'Fleet') },
            { key: 'apartments', Icon: HotelApartmentsIcon, label: t('categories.apartments', 'Apartments') },
            { key: 'packages', Icon: LuxuryTourIcon, label: t('screens.tours.packages', 'Packages') },
            { key: 'gallery', Icon: VipGalleryIcon, label: t('categories.gallery', 'Gallery') },
            { key: 'destinations', Icon: DestinationsIcon, label: t('categories.destinations', 'Destinations') },
            { key: 'offers', Icon: OffersIcon, label: t('categories.offers', 'Offers') },
            { key: 'blog', Icon: LuxuryMagazineIcon, label: t('categories.blog', 'Magazine') },
          ] as { key: Category; Icon: any; label: string }[]).map(item => (
            <LuxuryPressable
              key={item.key}
              style={styles.categoryItem}
              onPress={() => handleCategoryPress(item.key)}
            >
              <Vanir3DIcon name={item.key} size={56} style={{ marginBottom: 4 }} />
              <Text style={styles.categoryText} numberOfLines={1}>
                {item.label}
              </Text>
            </LuxuryPressable>
          ))}
        </ScrollView>
      </View>

      {/* Main Feed with Partner Airlines and Offer Dividers */}
      <ScrollView
        style={{ flex: 1, backgroundColor: '#FAF9F6' }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={Platform.OS === 'android'}
        contentContainerStyle={[styles.feedScroll, { paddingBottom: 100 + insets.bottom }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />
        }
      >
        {/* Instant Emergency / Announcement Notice from Admin Dashboard */}
        {serviceControls?.emergency_notice ? (
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderWidth: 1.5,
              borderColor: '#D4AF37',
              borderRadius: 16,
              padding: 14,
              marginHorizontal: 16,
              marginBottom: 14,
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: '#1C1917',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 4,
            }}
          >
            <Sparkles color="#D4AF37" size={18} style={{ marginRight: 10 }} />
            <Text style={{ flex: 1, color: '#1C1917', fontSize: 13, fontWeight: '700', lineHeight: 18 }}>
              {serviceControls.emergency_notice}
            </Text>
          </View>
        ) : null}

        {/* Curated International Capitals & Red Sea Sanctuaries (Zero duplicate 'Explore Services' clutter) */}
        <InteractiveServicesSection navigation={navigation} destinationsOnly={true} />

        {/* Feed Cards with Promotional Offer Dividers */}
        {filteredCards.map((card, index) => {
          return (
            <React.Fragment key={card.id}>
              {/* Card Container with Instant Zero-Jank Render & Tactile Feedback */}
              <View>
                <LuxuryPressable
                  style={styles.cardContainer}
                  onPress={() => navigation.navigate(card.routeTarget as any, card.routeParams)}
                >
                  <View style={styles.imageBox}>
                    <Image
                      source={
                        card.image && (card.image.startsWith('http') || card.image.startsWith('data:image'))
                          ? { uri: card.image }
                          : (LOCAL_CARD_IMAGES[card.id] || card.localImage || LOCAL_CARD_IMAGES.f1)
                      }
                      style={styles.cardImage}
                      resizeMode="cover"
                      fadeDuration={0}
                    />

                    {/* Tag Badge Top Left */}
                    <View style={styles.tagBadge}>
                      <Text style={styles.tagBadgeText}>{card.tag}</Text>
                    </View>

                    {/* Circular Arrow Button Top Right with Tactile Feedback */}
                    <LuxuryPressable
                      style={styles.arrowBtn}
                      onPress={() => navigation.navigate(card.routeTarget as any, card.routeParams)}
                    >
                      <ArrowUpRight color="#FFFFFF" size={20} strokeWidth={2.8} />
                    </LuxuryPressable>

                    {/* Floating Bottom Card Over Image */}
                    {card.isFlightRoute ? (
                      /* Full-Width Flight Overlay with Airline Logo, Route and Stars */
                      <View style={styles.bottomOverlayCardFlight}>
                        {/* Airline Carrier Header with Official Emirates & Qatar Logos */}
                        <View style={styles.flightCarrierHeader}>
                          <View style={styles.flightCarrierLeft}>
                            <View style={styles.flightAirlineLogoWrap}>
                              <AirlineLogo airline="Emirates" iata="EK" size={24} />
                            </View>
                            <View style={{ marginLeft: 8 }}>
                              <Text style={styles.flightCarrierTitle}>EMIRATES • FIRST SUITE</Text>
                              <Text style={styles.flightCarrierSub}>Boeing 777-300ER • Daily Direct</Text>
                            </View>
                          </View>
                          <View style={styles.flightPartnerBadge}>
                            <AirlineLogo airline="Qatar Airways" iata="QR" size={18} />
                          </View>
                        </View>

                        <View style={styles.flightRouteRowFullWidth}>
                          <View style={{ alignItems: 'flex-start' }}>
                            <Text style={styles.airportCodeBig}>{card.origin || 'CAI'}</Text>
                            <Text style={styles.cityNameBig}>{card.originCity || 'Cairo'}</Text>
                          </View>

                          <View style={styles.flightLineBig}>
                            <View style={styles.dottedLineBig} />
                            <View style={styles.planeCircleBig}>
                              <View style={styles.planeRotatedWrapper}>
                                <Plane color="#D4AF37" size={16} strokeWidth={2.4} />
                              </View>
                            </View>
                            <View style={styles.dottedLineBig} />
                          </View>

                          <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.airportCodeBig}>{card.destination || 'LON'}</Text>
                            <Text style={styles.cityNameBig}>{card.destinationCity || 'London'}</Text>
                          </View>
                        </View>

                        {/* Single Gold Star Rating */}
                        <View style={styles.flightBottomStarsRow}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <Star color="#D4AF37" fill="#D4AF37" size={15} strokeWidth={1.8} />
                            <Text style={styles.flightStarsBadgeText}>5.0 ★</Text>
                          </View>
                          <Text style={styles.flightVerifiedText}>IATA Accredited • Royal Suite</Text>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.bottomOverlayCard}>
                        <View>
                          {/* Official Company Brand Logo Badge */}
                          <View style={{ marginBottom: 8 }}>
                            <CompanyBrandBadge title={card.title} category={card.category} variant="pill" />
                          </View>

                          <View style={styles.propertyInfoRow}>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.cardTitle} numberOfLines={1}>
                                {card.title}
                              </Text>
                              <View style={styles.cardSubRow}>
                                <MapPin color="#D4AF37" size={13} strokeWidth={2} />
                                <Text style={styles.cardSubtitle} numberOfLines={1}>
                                  {card.subtitle}
                                </Text>
                              </View>
                            </View>

                            {card.price && (
                              <Text style={styles.cardPrice}>{card.price}</Text>
                            )}
                          </View>

                          {/* Elegant Gold Star Rating */}
                          {card.rating && (() => {
                            const numRating = typeof card.rating === 'number'
                              ? card.rating
                              : (parseFloat(String(card.rating)) || 4.8);
                            return (
                              <View style={styles.cardStarRatingRow}>
                                <Star color="#D4AF37" fill="#D4AF37" size={14} strokeWidth={2} />
                                <Text style={styles.cardStarRatingText}>{numRating.toFixed(1)}</Text>
                                <Text style={styles.cardStarRatingLabel}>VIP Rated</Text>
                              </View>
                            );
                          })()}
                        </View>
                      </View>
                    )}
                  </View>
                </LuxuryPressable>
              </View>

              {/* Moving Destinations Carousel: Placed immediately after Card 1 (Global First Class & Private Jet) */}
              {index === 0 && (
                <MovingDestinationsSection navigation={navigation} isFocused={isFocused} />
              )}

              {/* Promotional Offer Divider 2: Between Card 2 and Card 3 (Hotels to Apartments) */}
              {index === 1 && (
                <LuxuryPressable
                  style={styles.offerBanner}
                  onPress={() => navigation.navigate('Offers')}
                >
                  <View style={styles.offerBadge}>
                    <Building color="#D4AF37" size={12} />
                    <Text style={styles.offerBadgeText}>EXTENDED STAYS PRIVILEGE</Text>
                  </View>
                  <Text style={styles.offerTitle}>Up to 30% Privilege on Penthouses & Serviced Apartments</Text>
                  <Text style={styles.offerDesc}>
                    Across Dubai, London, and Cairo with daily housekeeping, private chef, and 24/7 concierge assistance throughout your reservation.
                  </Text>
                  <View style={styles.offerCtaRow}>
                    <Text style={styles.offerCtaText}>View Promo Vouchers</Text>
                    <ArrowRight color="#D4AF37" size={12} strokeWidth={2.4} />
                  </View>
                </LuxuryPressable>
              )}

              {/* VIP Fleet & Suite Showcase Gallery: Placed gracefully after Card 3 (Apartments) */}
              {index === 2 && (
                <VipGalleryShowcaseSection navigation={navigation} liveGalleryItems={liveGallery} />
              )}

              {/* Promotional Offer Divider 3: Between Card 4 and Card 5 (Cars to Yachts) */}
              {index === 3 && (
                <LuxuryPressable
                  style={styles.offerBanner}
                  onPress={() => navigation.navigate('Offers')}
                >
                  <View style={styles.offerBadge}>
                    <Anchor color="#D4AF37" size={12} />
                    <Text style={styles.offerBadgeText}>ROYAL SUPERYACHT CHARTER</Text>
                  </View>
                  <Text style={styles.offerTitle}>Sunset Cruise with Private Seafood Chef</Text>
                  <Text style={styles.offerDesc}>
                    Charter 4 hours on the Majesty 120 and receive 2 complimentary hours in Dubai Marina or the Red Sea.
                  </Text>
                  <View style={styles.offerCtaRow}>
                    <Text style={styles.offerCtaText}>View Offer & Charter Yacht</Text>
                    <ArrowRight color="#D4AF37" size={12} strokeWidth={2.4} />
                  </View>
                </LuxuryPressable>
              )}

              {/* Luxury Magazine / Blog Editorial Banner: Placed after Card 4 (Limousine / Fleet) */}
              {index === 4 && (
                <LuxuryPressable
                  style={[styles.offerBanner, { backgroundColor: '#FFFFFF', borderColor: 'rgba(212, 175, 55, 0.4)' }]}
                  onPress={() => navigation.navigate('Blog')}
                >
                  <View style={[styles.offerBadge, { backgroundColor: '#1C1917' }]}>
                    <BookOpen color="#D4AF37" size={12} />
                    <Text style={[styles.offerBadgeText, { color: '#D4AF37' }]}>VANIR LUXURY MAGAZINE</Text>
                  </View>
                  <Text style={[styles.offerTitle, { color: '#1C1917' }]}>
                    Royal Travel Secrets & Curated Global Escapes
                  </Text>
                  <Text style={[styles.offerDesc, { color: '#64748B' }]}>
                    Explore our latest editorial features: Paris presidential suites, after-hours Pyramids access, and Aegean catamaran journeys.
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#1C1917' }}>Read Magazine Articles</Text>
                    <ArrowRight color="#D4AF37" size={12} strokeWidth={2.4} />
                  </View>
                </LuxuryPressable>
              )}
            </React.Fragment>
          );
        })}

        {/* ── BOTTOM TRUST SECTION ─────────────────────────────────── */}
        {/* Global IATA Airline Partners with Real Brand Logos */}
        <View style={[styles.airlinesSection, { marginTop: 24 }]}>
          <View style={styles.airlinesHeader}>
            <View style={styles.airlinesHeaderLeft}>
              <Plane color="#D4AF37" size={16} strokeWidth={2.4} />
              <Text style={styles.airlinesTitle}>
                {t('screens.home.partners', 'Global Airline Partners')}
              </Text>
            </View>
            <View style={styles.iataLiveBadge}>
              <View style={styles.iataLiveDot} />
              <Text style={styles.iataLiveBadgeText}>IATA GDS LIVE</Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.airlinesScroll}>
            {AIRLINE_PARTNERS.map(airline => (
              <Pressable
                key={airline.id}
                style={styles.airlineCard}
                onPress={() => navigation.navigate('FlightBooking', {
                  origin: 'CAI',
                  destination: 'DXB',
                })}
              >
                <View style={styles.airlineLogoBox}>
                  <AirlineLogo iata={airline.code} airline={airline.name} size={38} />
                </View>
                <Text style={styles.airlineName} numberOfLines={1}>{airline.name}</Text>
                <View style={styles.airlineBadgeBox}>
                  <Text style={styles.airlineBadgeText}>{airline.badge}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Official Accreditations Ribbon — Highlighted Trust Section */}
        <View style={styles.accredWrapperHighlight}>
          <AccreditationRibbon />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#050A14',
  },
  /* ── Royal Navy Hero Header with Seamless Fade ── */
  heroContainer: {
    position: 'relative',
    backgroundColor: '#0B172B',
    paddingBottom: 28,
    overflow: 'hidden',
  },
  heroBottomFadeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 44,
  },
  heroBackgroundImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
    opacity: 0.28,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
  },
  headerTitleBox: {
    flex: 1,
  },
  headerBrandDark: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 3,
  },
  headerLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: '#D4AF37',
    backgroundColor: '#FFFFFF',
  },
  headerBrandSubtitleDark: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 1.2,
    marginTop: 1,
  },
  headerBrand: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1C1917',
    letterSpacing: 2.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  headerBtnDark: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBtnPressed: {
    backgroundColor: 'rgba(212,175,55,0.28)',
    borderColor: '#D4AF37',
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  /* ── VIP Member Card inside Dark Hero (Luxury Metal Credit Card) ── */
  lowerProfileBarDark: {
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#0C172B',
    borderWidth: 1.2,
    borderColor: 'rgba(212,175,55,0.45)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  lowerProfileGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  lowerAvatarWrapperDark: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(11,21,38,0.85)',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  lowerProfileNameDark: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  lowerProfileBadgeDark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(212,175,55,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  lowerProfileBadgeTextDark: {
    color: '#D4AF37',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  lowerProfileSubDark: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.72)',
    marginTop: 2,
  },
  lowerProfileMemberId: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#D4AF37',
    letterSpacing: 1.2,
    marginTop: 2,
    opacity: 0.85,
  },
  lowerProfileArrowDark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(212,175,55,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lowerProfileBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    marginHorizontal: 20,
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  lowerAvatarWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1C1917',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  lowerAvatarImg: {
    width: '100%',
    height: '100%',
  },
  lowerAvatarFallbackText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '900',
  },
  lowerAvatarDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D4AF37',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  lowerProfileName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1917',
  },
  lowerProfileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFDF5',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  lowerProfileBadgeText: {
    color: '#B45309',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  lowerProfileSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  lowerProfileArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarBtn: {
    position: 'relative',
  },
  headerAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1C1917',
    borderWidth: 1.8,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  headerAvatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  headerAvatarFallbackText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#D4AF37',
  },
  headerAvatarDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  /* ── Modern High-Contrast Categories Menu ── */
  categoriesSection: {
    backgroundColor: '#FAF9F6',
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212,175,55,0.18)',
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    paddingVertical: 4,
    gap: 8,
  },
  categoryItem: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: 74,
    gap: 7,
  },
  categoryIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 2,
  },
  categoryPill: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 80,
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  categoryPillActive: {
    backgroundColor: '#FAF7F0',
    borderColor: '#D4AF37',
    borderWidth: 1.8,
    shadowColor: '#D4AF37',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  categoryText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#44403C',
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  categoryTextActive: {
    color: '#D4AF37',
    fontWeight: '800',
  },
  airlinesSection: {
    marginBottom: 8,
    gap: 10,
  },
  airlinesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  airlinesHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  airlinesTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1917',
  },
  airlinesSub: {
    fontSize: 11,
    color: '#64748B',
  },
  airlinesScroll: {
    gap: 10,
    paddingVertical: 4,
  },
  airlineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    minWidth: 145,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    gap: 6,
  },
  airlineLogoBox: {
    width: 60,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  airlineCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  airlineCountry: {
    fontSize: 16,
  },
  airlineCode: {
    fontSize: 13,
    fontWeight: '900',
    color: '#D4AF37',
  },
  airlineName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  airlineBadgeBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    alignSelf: 'center',
  },
  airlineBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },
  iataLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FAF6E8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.5)',
  },
  iataLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D4AF37',
  },
  iataLiveBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#8A6D1D',
    letterSpacing: 0.5,
  },
  accredWrapperHighlight: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
  },
  offerBanner: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.5)',
    borderRadius: 20,
    padding: 18,
    gap: 8,
    marginVertical: 4,
  },
  offerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1C1917',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  offerBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#D4AF37',
  },
  offerCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  offerCtaText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1C1917',
  },
  offerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1917',
    lineHeight: 21,
  },
  offerDesc: {
    fontSize: 12,
    color: '#78716C',
    lineHeight: 18,
  },
  feedScroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 16,
    backgroundColor: '#FAF9F6',
  },
  cardContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.22)',
    shadowColor: '#C9A84C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 5,
  },
  imageBox: {
    height: 340,
    width: '100%',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  tagBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
  },
  tagBadgeText: {
    color: '#1C1917',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  arrowBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B8942A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  bottomOverlayCardFlight: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.35)',
  },
  flightCarrierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  flightCarrierLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flightAirlineLogoWrap: {
    width: 26,
    height: 26,
    borderRadius: 6,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
  },
  flightCarrierTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.8,
  },
  flightCarrierSub: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
  },
  flightPartnerBadge: {
    width: 22,
    height: 22,
    borderRadius: 5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.25)',
  },
  flightVerifiedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  flightRouteRowFullWidth: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingBottom: 8,
  },
  airportCodeBig: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1C1917',
    letterSpacing: 2,
  },
  cityNameBig: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
    marginTop: 1,
  },
  flightLineBig: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  dottedLineBig: {
    flex: 1,
    height: 1.5,
    backgroundColor: 'rgba(212,175,55,0.5)',
    borderRadius: 1,
  },
  planeCircleBig: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1C1917',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
  },
  planeRotatedWrapper: {
    transform: [{ rotate: '45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  flightBottomStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    width: '100%',
  },
  fiveStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  flightStarsBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 0.5,
  },
  flightExploreBtnCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
  },
  flightExploreTextCompact: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1C1917',
  },
  bottomOverlayCard: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 18,
    padding: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.25)',
  },
  flightRouteRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  airportCode: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  cityName: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },
  flightLine: {
    flex: 1,
    maxWidth: 130,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  dottedLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
  },
  planeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  propertyInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  cardSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardSubtitle: {
    fontSize: 12.5,
    color: '#78716C',
    fontWeight: '500',
    flexShrink: 1,
  },
  ratingInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: 6,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: '#D4AF37',
    marginLeft: 8,
    letterSpacing: -0.3,
  },
  cardRatingGradientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cardRatingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    minWidth: 46,
  },
  cardRatingNumber: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardRatingTrackWrapper: {
    flex: 1,
    height: 22,
    justifyContent: 'center',
    position: 'relative',
  },
  cardRatingGradientBarBackground: {
    height: 5,
    borderRadius: 2.5,
    overflow: 'hidden',
    width: '100%',
  },
  cardRatingPointerPill: {
    position: 'absolute',
    top: 1,
    marginLeft: -14,
    width: 28,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  cardRatingPointerPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },

  /* ── Elegant Gold Star Rating Row (replaces gradient bar) ── */
  cardStarRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212,175,55,0.2)',
  },
  cardStarRatingText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 0.3,
  },
  cardStarRatingLabel: {
    fontSize: 11,
    color: '#78716C',
    fontWeight: '600',
  },

  /* VIP Search Bar */
  vipSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 10,
    paddingHorizontal: 14,
    height: 46,
    gap: 10,
  },
  vipSearchPlaceholder: {
    flex: 1,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  vipSearchBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  vipSearchBadgeText: {
    color: '#D4AF37',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  /* Official Accreditations Ribbon */
  accredSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  accredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  accredTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.3,
  },
  accredScroll: {
    gap: 10,
    paddingVertical: 2,
  },
  accredCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  accredLogoBox: {
    width: 50,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  accredLogo: {
    width: '100%',
    height: '100%',
  },
  accredInfo: {
    justifyContent: 'center',
  },
  accredName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  accredBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#B8942A',
    marginTop: 1,
  },

  /* Moving Destinations Section */
  movingDestSection: {
    marginVertical: 4,
    gap: 12,
  },
  movingDestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  movingDestIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  movingDestTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  movingDestSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 3,
  },
  movingDestAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  movingDestAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1917',
  },
  movingDestScroll: {
    gap: 14,
    paddingVertical: 4,
  },
  movingDestCard: {
    width: 290,
    height: 220,
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  movingDestImg: {
    width: '100%',
    height: '100%',
  },
  movingDestGrad: {
    ...StyleSheet.absoluteFill,
  },
  movingDestTopRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  movingDestCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 6,
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  movingDestFlag: {
    fontSize: 14,
  },
  movingDestCity: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  movingDestRouteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(28, 25, 23, 0.88)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.45)',
  },
  movingDestPlaneIconWrapper: {
    transform: [{ rotate: '45deg' }],
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  movingDestRouteText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  movingDestBottom: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    gap: 8,
  },
  movingDestTag: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  movingDestDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  movingDestDuration: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  movingDestPrice: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  movingDestBookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  movingDestBookBtnText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '800',
  },
  movingDestDotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  movingDestDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  movingDestDotActive: {
    width: 20,
    backgroundColor: '#D4AF37',
  },
  /* VIP Gallery Showcase Section */
  vipGallerySectionContainer: {
    marginVertical: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 16,
  },
  vipGallerySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  vipGalleryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  vipGalleryBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.5,
  },
  vipGallerySectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  vipGallerySectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 3,
  },
  vipGalleryViewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'transparent',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  vipGalleryViewAllText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 0.8,
  },
  vipGalleryScrollContent: {
    paddingHorizontal: 16,
    gap: 10, // 8px to 12px minimalist gaps
  },
  vipGalleryCard: {
    width: 240,
    height: 160,
    borderRadius: 8, // slight rounded corners (border-radius: 8px)
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1C1917',
  },
  vipGalleryCardImg: {
    width: '100%',
    height: '100%',
  },
  vipGalleryCardGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    padding: 12,
    justifyContent: 'space-between',
  },
  vipGalleryCountBadge: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(28, 25, 23, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  vipGalleryCountText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  vipGalleryTypographyOverlay: {
    gap: 3,
  },
  vipGalleryCardCategory: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 1.6, // Tracked uppercase typography
  },
  vipGalleryCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1.4, // Tracked uppercase typography
    textTransform: 'uppercase',
  },
});
