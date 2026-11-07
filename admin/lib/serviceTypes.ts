export type ServiceStatus = 'active' | 'draft';

export interface ServiceImage {
  url: string;
  label: string;
  position: string;
}

// ─── Private Jets ──────────────────────────────────────────────────────────────
export type JetCategory = 'super_midsize' | 'heavy' | 'ultra_long_range';

export interface PrivateJet {
  id: string;
  name: string;
  tailNumber: string;
  category: JetCategory;
  status: ServiceStatus;
  // Specs
  guestCapacity: number;
  flightRange: number;
  wifiIncluded: boolean;
  bedConfiguration: number;
  petFriendly: boolean;
  // Route & Pricing
  departureCity: string;
  arrivalCity: string;
  hourlyRate: number;
  flatRoutePrice: number;
  description: string;
  images: ServiceImage[];
  createdAt: string;
}

// ─── Luxury Yachts ─────────────────────────────────────────────────────────────
export interface LuxuryYacht {
  id: string;
  name: string;
  vesselName?: string;
  builder: string;
  marinaLocation: string;
  status: ServiceStatus;
  // Specs
  lengthFt: number;
  lengthMeters?: number;
  cabins: number;
  guestCapacity: number;
  crewSize: number;
  jacuzzi: boolean;
  helipad: boolean;
  // Pricing
  dailyRate: number;
  dailyCharterRate?: number;
  weeklyRate: number;
  description: string;
  images: ServiceImage[];
  createdAt: string;
}

// ─── 5-Star Hotels ─────────────────────────────────────────────────────────────
export type ViewType = 'ocean' | 'city' | 'garden' | 'mountain';

export interface Hotel {
  id: string;
  propertyName: string;
  cityDestination: string;
  suiteType: string;
  category?: 'hotel' | 'apartments';
  isApartment?: boolean;
  status: ServiceStatus;
  // Specs
  roomSizeSqm: number;
  viewType: ViewType;
  butlerService: boolean;
  privatePool: boolean;
  // Pricing & Map
  nightlyRate: number;
  latitude: number;
  longitude: number;
  description: string;
  images: ServiceImage[];
  createdAt: string;
}

// ─── Luxury Packages ───────────────────────────────────────────────────────────
export interface LuxuryPackage {
  id: string;
  name: string;
  destination: string;
  durationNights: number;
  maxVipGuests: number;
  includedServices: string;
  pricePerPerson: number;
  latitude: number;
  longitude: number;
  status: ServiceStatus;
  description: string;
  images: ServiceImage[];
  createdAt: string;
}

// ─── VIP Transfers ─────────────────────────────────────────────────────────────
export type TransferCategory = 'sedan' | 'suv' | 'van';

export interface VIPTransfer {
  id: string;
  vehicleMakeModel: string;
  category: TransferCategory;
  status: ServiceStatus;
  // Specs
  passengerCapacity: number;
  luggageCapacity: number;
  armored: boolean;
  englishChauffeur: boolean;
  // Pricing
  hourlyRate: number;
  airportTransferRate: number;
  description: string;
  images: ServiceImage[];
  createdAt: string;
}
