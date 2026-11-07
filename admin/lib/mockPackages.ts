import type { LuxuryPackage, ServiceImage, ServiceStatus } from '@/lib/serviceTypes';

function createPackageImage(title: string, subtitle: string, accent: string): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="960" height="640" viewBox="0 0 960 640">
      <defs>
        <linearGradient id="ocean" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0A192F" />
          <stop offset="100%" stop-color="#112240" />
        </linearGradient>
        <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.85" />
          <stop offset="100%" stop-color="#8892B0" stop-opacity="0.25" />
        </linearGradient>
      </defs>
      <rect width="960" height="640" fill="url(#ocean)" />
      <circle cx="790" cy="120" r="120" fill="${accent}" fill-opacity="0.18" />
      <circle cx="180" cy="520" r="180" fill="#8892B0" fill-opacity="0.1" />
      <rect x="72" y="72" width="816" height="496" rx="28" fill="none" stroke="rgba(248,249,250,0.18)" />
      <rect x="88" y="88" width="784" height="464" rx="22" fill="url(#accent)" fill-opacity="0.2" stroke="rgba(136,146,176,0.28)" />
      <text x="96" y="446" fill="#F8F9FA" font-family="Inter, Arial, sans-serif" font-size="54" font-weight="700">${title}</text>
      <text x="96" y="502" fill="#8892B0" font-family="Inter, Arial, sans-serif" font-size="28">${subtitle}</text>
      <text x="96" y="164" fill="#F8F9FA" fill-opacity="0.7" font-family="Inter, Arial, sans-serif" font-size="20" letter-spacing="6">VANIR OCEAN PEARL COLLECTION</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function createImageSet(destination: string, accent: string): ServiceImage[] {
  return [
    {
      url: createPackageImage(destination, 'Hero visual', accent),
      label: `${destination} hero`,
      position: 'hero',
    },
    {
      url: createPackageImage(destination, 'Suite experience', '#A8B2D1'),
      label: `${destination} suite`,
      position: 'gallery-1',
    },
    {
      url: createPackageImage(destination, 'Concierge moments', '#CCD6F6'),
      label: `${destination} concierge`,
      position: 'gallery-2',
    },
  ];
}

export interface LuxuryPackageDraft {
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
}

export const EMPTY_PACKAGE_DRAFT: LuxuryPackageDraft = {
  name: '',
  destination: '',
  durationNights: 3,
  maxVipGuests: 4,
  includedServices: '',
  pricePerPerson: 0,
  latitude: 0,
  longitude: 0,
  status: 'draft',
  description: '',
  images: [],
};

export const MOCK_PACKAGES: LuxuryPackage[] = [
  {
    id: '1',
    name: 'Royal Dubai Escape',
    destination: 'Dubai, UAE',
    durationNights: 7,
    maxVipGuests: 8,
    includedServices: 'Private Jet, Burj-side suite, VIP transfer, private marina sunset',
    pricePerPerson: 18500,
    latitude: 25.2048,
    longitude: 55.2708,
    status: 'active',
    description: 'A seven-night city-and-coast itinerary with private aviation, butler-led check-ins, and a curated yacht escape.',
    images: createImageSet('Royal Dubai Escape', '#7EB3FF'),
    createdAt: '2024-11-01T10:00:00Z',
  },
  {
    id: '2',
    name: 'Maldives Serenity Retreat',
    destination: 'Baa Atoll, Maldives',
    durationNights: 10,
    maxVipGuests: 4,
    includedServices: 'Private Jet, overwater villa, spa rituals, marine biologist cruise',
    pricePerPerson: 24000,
    latitude: 5.1601,
    longitude: 73.0382,
    status: 'active',
    description: 'Ten restorative nights across an overwater sanctuary with wellness rituals, coral excursions, and a private chef experience.',
    images: createImageSet('Maldives Serenity Retreat', '#5EEAD4'),
    createdAt: '2024-10-15T08:30:00Z',
  },
  {
    id: '3',
    name: 'Monaco Grand Prix VIP',
    destination: 'Monte Carlo, Monaco',
    durationNights: 5,
    maxVipGuests: 6,
    includedServices: 'Helicopter transfers, paddock passes, superyacht hosting, Michelin tasting menu',
    pricePerPerson: 35000,
    latitude: 43.7384,
    longitude: 7.4246,
    status: 'draft',
    description: 'A race-week itinerary centered on harbor-side hospitality, private transfers, and full concierge support during the Grand Prix.',
    images: createImageSet('Monaco Grand Prix VIP', '#C4B5FD'),
    createdAt: '2024-09-22T12:00:00Z',
  },
];
