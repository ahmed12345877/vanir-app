import React from 'react';
import { Image, StyleSheet, View, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  CommercialFlightIcon,
  PrivateJetIcon,
  HotelApartmentsIcon,
  HotelResortIcon,
  SuperyachtIcon,
  LimousineIcon,
  VipGalleryIcon,
  LuxuryTourIcon,
  LuxuryMagazineIcon,
  GlobalEsimIcon,
  VisaServiceIcon,
  FastTrackIcon,
  AiConciergeIcon,
  OfficesIcon,
  NavSearchIcon,
  NavBellIcon,
  DestinationsIcon,
  OffersIcon,
} from './LuxuryNavIcons';
import {
  ShieldCheck,
  Briefcase,
  Package,
  Compass,
  FileCheck2,
} from 'lucide-react-native';

export type VanirIconName =
  | 'jets'
  | 'private_jet'
  | 'flights'
  | 'yachts'
  | 'hotels'
  | 'cars'
  | 'fleet'
  | 'apartments'
  | 'packages'
  | 'tours'
  | 'esim'
  | 'visa'
  | 'fasttrack'
  | 'insurance'
  | 'noc'
  | 'itinerary'
  | 'embassies'
  | 'ai'
  | 'ai_concierge'
  | 'gallery'
  | 'blog'
  | 'destinations'
  | 'offers'
  | 'offices'
  | 'search'
  | 'bell';

export interface Vanir3DIconProps {
  name: VanirIconName | string;
  size?: number;
  style?: ViewStyle;
}

// 3D Master Renders on Dark Navy Squircles
const ASSETS_3D: Record<string, any> = {
  // Aviation
  flights: require('../assets/icons/3d/flights_3d.png'),
  jets: require('../assets/icons/3d/jet_3d.png'),
  private_jet: require('../assets/icons/3d/jet_3d.png'),
  fasttrack: require('../assets/icons/3d/fasttrack_3d.png'),

  // Stays & Residences
  hotels: require('../assets/icons/3d/hotel_3d.png'),
  apartments: require('../assets/icons/3d/apartments_3d.png'),

  // Marine & Fleet
  yachts: require('../assets/icons/3d/yacht_3d.png'),
  cars: require('../assets/icons/3d/car_3d.png'),
  fleet: require('../assets/icons/3d/car_3d.png'),

  // Curated Experiences & Media
  tours: require('../assets/icons/3d/tours_3d.png'),
  packages: require('../assets/icons/3d/packages_3d.png'),
  ai: require('../assets/icons/3d/ai_3d.png'),
  ai_concierge: require('../assets/icons/3d/ai_3d.png'),
  gallery: require('../assets/icons/3d/gallery_3d.png'),
  blog: require('../assets/icons/3d/blog_3d.png'),
  destinations: require('../assets/icons/3d/destinations_3d.png'),
  offers: require('../assets/icons/3d/offers_3d.png'),

  // Utilities & Consular Desk
  esim: require('../assets/icons/3d/esim_3d.png'),
  visa: require('../assets/icons/3d/visa_3d.png'),
  offices: require('../assets/icons/3d/offices_3d.png'),
  embassies: require('../assets/icons/3d/offices_3d.png'),
  insurance: require('../assets/icons/3d/insurance_3d.png'),
  noc: require('../assets/icons/3d/noc_3d.png'),
  itinerary: require('../assets/icons/3d/itinerary_3d.png'),
};

/**
 * Vanir3DIcon
 * Unified 3D luxury squircle icon component for Vanir.
 * Renders the high-end 3D metallic champagne gold asset on dark royal navy squircle,
 * with subtle champagne gold and spectral rim highlights.
 */
export function Vanir3DIcon({ name, size = 56, style }: Vanir3DIconProps) {
  const borderRadius = Math.round(size * 0.32); // iOS Squircle curvature
  const normalizedKey = name.toLowerCase();

  // If a pre-rendered 3D PNG asset is available, render it directly
  if (ASSETS_3D[normalizedKey]) {
    return (
      <View
        style={[
          {
            width: size,
            height: size,
            alignItems: 'center',
            justifyContent: 'center',
          },
          style,
        ]}
      >
        <Image
          source={ASSETS_3D[normalizedKey]}
          style={{ width: size, height: size }}
          resizeMode="contain"
          fadeDuration={0}
        />
      </View>
    );
  }

  // Vector fallback rendered inside the exact Dark Royal Navy Squircle with 3D Gold
  let IconComponent: React.ComponentType<any> = CommercialFlightIcon;
  let iconSize = Math.round(size * 0.52);

  switch (normalizedKey) {
    case 'flights':
      IconComponent = CommercialFlightIcon;
      break;
    case 'apartments':
      IconComponent = HotelApartmentsIcon;
      break;
    case 'fasttrack':
    case 'insurance':
      IconComponent = FastTrackIcon;
      break;
    case 'tours':
    case 'packages':
    case 'itinerary':
      IconComponent = LuxuryTourIcon;
      break;
    case 'ai':
    case 'ai_concierge':
      IconComponent = AiConciergeIcon;
      break;
    case 'gallery':
      IconComponent = VipGalleryIcon;
      break;
    case 'blog':
      IconComponent = LuxuryMagazineIcon;
      break;
    case 'destinations':
      IconComponent = DestinationsIcon;
      break;
    case 'offers':
      IconComponent = OffersIcon;
      break;
    case 'visa':
      IconComponent = VisaServiceIcon;
      break;
    case 'offices':
    case 'embassies':
      IconComponent = OfficesIcon;
      break;
    case 'noc':
      IconComponent = (props: any) => <Briefcase {...props} color="#C5A059" size={iconSize} strokeWidth={1.8} />;
      break;
    case 'search':
      IconComponent = NavSearchIcon;
      break;
    case 'bell':
      IconComponent = NavBellIcon;
      break;
    default:
      IconComponent = CommercialFlightIcon;
      break;
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={['#121D30', '#0A111D', '#060B14']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.squircleBody,
          {
            width: size,
            height: size,
            borderRadius,
          },
        ]}
      >
        <IconComponent color="#C5A059" size={iconSize} strokeWidth={1.7} />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    shadowColor: '#0A111D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  squircleBody: {
    borderWidth: 1.2,
    borderColor: 'rgba(197, 160, 89, 0.45)', // Champagne gold micro-bevel
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});

export default Vanir3DIcon;
