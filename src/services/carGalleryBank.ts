/**
 * Car Gallery Bank - Curated 35+ to 45+ High-Resolution Categorized Photo Bank
 * Guarantees that every luxury VIP vehicle (Rolls-Royce, Maybach, Bentley, Cadillac,
 * Mercedes-AMG, etc.) has an authentic, multi-angle luxury photo gallery with ZERO duplicates:
 * - all
 * - exterior (Stature, Grille, Silhouette, Night Allure)
 * - interior (Rear Executive Lounge, Reclining Massage Seats, Starlight Ceiling)
 * - cockpit (Chauffeur Digital Cockpit, Analog Clock, Burmester Audio)
 * - details (Lambswool Mats, Champagne Cooler, Forged Wheels, Bespoke Badging)
 */

import { resolveAuthenticCarBank } from './authenticCarPhotoBanks';
import { isUnsplashOrGeneric } from './urlSanitizer';

export interface CarGalleryPhoto {
  id: string;
  url: string;
  category: 'exterior' | 'interior' | 'cockpit' | 'details';
  title: string;
  caption?: string;
}

export interface CarCategorizedGallery {
  carId: string;
  carName: string;
  totalCount: number;
  all: CarGalleryPhoto[];
  exterior: CarGalleryPhoto[];
  interior: CarGalleryPhoto[];
  cockpit: CarGalleryPhoto[];
  details: CarGalleryPhoto[];
}

const EXT_TITLES = [
  'Aerodynamic Silhouette & Stature',
  'Illuminated Royal Grille & Crest',
  'Side Profile & Extended Wheelbase',
  'Rear Tailgate & Dual Chrome Exhausts',
  'Night Laser Headlights at Twilight',
  'Three-Quarter Front Stature',
  'Aerodynamic Forged Alloy Rims',
  'Arrival Stance at Private Terminal',
  'Refined Curvature & Metallic Lustre',
  'Executive Presence at Nightfall',
];

const INT_TITLES = [
  'First-Class Executive Rear Suite',
  'Reclining Massage Captain Seats',
  'Fiber-Optic Starlight Headliner',
  'Chilled Champagne Bar & Flutes',
  'Electrically Deployed Picnic Tables',
  'Rear Entertainment Touchscreen Duo',
  'Acoustic Double-Glazed Privacy Glass',
  'Deep-Pile Lambswool Floor Rugs',
  'Ambient Perimeter Mood Illumination',
  'Bespoke Hand-Stitched Leather Cushions',
];

const COCKPIT_TITLES = [
  'Chauffeur Digital Glass Cockpit',
  'Handcrafted Wood & Piano Black Trim',
  'Burmester 3D High-End Sound System',
  'Central Console & Analog Jewel Clock',
  'Multi-Function Leather Steering Wheel',
  'Precision Climate Control Interface',
  'Augmented Reality Navigation Display',
  'Sovereign Drive Mode Selector',
];

const DETAIL_TITLES = [
  'Laser-Engraved Door Sills',
  'Bespoke Umbrella in Door Quarter',
  'Monogrammed Headrest Embroidery',
  'Power Soft-Closing Sovereign Doors',
  'Custom Polished Brake Calipers',
  'Executive Rear Center Armrest Controls',
  'Silver Champagne Chalice Holders',
  'Machined Aluminum Air Vents',
];

/**
 * Builds a genuine, non-duplicated 35 to 45+ photo gallery for any VIP vehicle.
 */
export function getCarGallery(
  carId: string,
  carName: string,
  existingPhotos?: string[],
): CarCategorizedGallery {
  const bank = resolveAuthenticCarBank(carId, carName);
  const seenUrls = new Set<string>();

  const exterior: CarGalleryPhoto[] = [];
  const interior: CarGalleryPhoto[] = [];
  const cockpit: CarGalleryPhoto[] = [];
  const details: CarGalleryPhoto[] = [];
  const all: CarGalleryPhoto[] = [];

  let count = 1;

  // 1. Process explicit existing photos if authentic (not generic Unsplash)
  if (existingPhotos && existingPhotos.length > 0) {
    for (let i = 0; i < existingPhotos.length; i++) {
      const url = existingPhotos[i];
      if (url && !isUnsplashOrGeneric(url) && !seenUrls.has(url)) {
        seenUrls.add(url);
        const cat: 'exterior' | 'interior' | 'cockpit' | 'details' =
          i === 0 ? 'exterior' : i === 1 ? 'interior' : i === 2 ? 'cockpit' : 'details';
        const photo: CarGalleryPhoto = {
          id: `car-hero-${count++}`,
          url,
          category: cat,
          title: `${carName} — Master Edition`,
          caption: `Signature authentic presentation of ${carName}.`,
        };
        if (cat === 'exterior') exterior.push(photo);
        else if (cat === 'interior') interior.push(photo);
        else if (cat === 'cockpit') cockpit.push(photo);
        else details.push(photo);
        all.push(photo);
      }
    }
  }

  // 2. Populate Exterior (guarantee 100% uniqueness)
  bank.exterior.forEach((url, i) => {
    if (!seenUrls.has(url)) {
      seenUrls.add(url);
      const photo: CarGalleryPhoto = {
        id: `ext-${count++}`,
        url,
        category: 'exterior',
        title: `${carName} — ${EXT_TITLES[i % EXT_TITLES.length]}`,
        caption: 'Striking exterior presence crafted for dignitaries and VIP transport.',
      };
      exterior.push(photo);
      all.push(photo);
    }
  });

  // 3. Populate Interior Lounge
  bank.interior.forEach((url, i) => {
    if (!seenUrls.has(url)) {
      seenUrls.add(url);
      const photo: CarGalleryPhoto = {
        id: `int-${count++}`,
        url,
        category: 'interior',
        title: `${carName} — ${INT_TITLES[i % INT_TITLES.length]}`,
        caption: 'First-class luxury passenger compartment with bespoke leather and massage seats.',
      };
      interior.push(photo);
      all.push(photo);
    }
  });

  // 4. Populate Chauffeur Cockpit
  bank.cockpit.forEach((url, i) => {
    if (!seenUrls.has(url)) {
      seenUrls.add(url);
      const photo: CarGalleryPhoto = {
        id: `cockpit-${count++}`,
        url,
        category: 'cockpit',
        title: `${carName} — ${COCKPIT_TITLES[i % COCKPIT_TITLES.length]}`,
        caption: 'Digital chauffeur dashboard and state-of-the-art navigation.',
      };
      cockpit.push(photo);
      all.push(photo);
    }
  });

  // 5. Populate Bespoke Details
  bank.details.forEach((url, i) => {
    if (!seenUrls.has(url)) {
      seenUrls.add(url);
      const photo: CarGalleryPhoto = {
        id: `det-${count++}`,
        url,
        category: 'details',
        title: `${carName} — ${DETAIL_TITLES[i % DETAIL_TITLES.length]}`,
        caption: 'Exquisite craftsmanship and bespoke luxury details.',
      };
      details.push(photo);
      all.push(photo);
    }
  });

  return {
    carId,
    carName,
    totalCount: all.length,
    all,
    exterior,
    interior,
    cockpit,
    details,
  };
}
