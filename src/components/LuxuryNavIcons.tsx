import React from 'react';
import Svg, { Path, Circle, Rect, Polygon } from 'react-native-svg';

export interface LuxuryIconProps {
  color?: string;
  size?: number;
  strokeWidth?: number;
}

const DEFAULT_COLOR = '#C5A059'; // Muted Champagne Gold (Vanir Quiet Luxury)
const DEFAULT_SIZE = 24;
const DEFAULT_STROKE = 1.5; // Minimalist Line Art stroke (1.5px Apple SF Symbols style)

/**
 * 1. Commercial & VIP Flights
 * Concept: Sleek, aerodynamic commercial airliner angled upwards at 45 degrees.
 */
export function CommercialFlightIcon({
  color = DEFAULT_COLOR,
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE,
}: LuxuryIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 3L14.5 9.5M21 3C19.8 1.8 17.5 2.2 16 3.7L12.2 7.5L3.8 5.6C3.1 5.4 2.5 5.9 2.6 6.6C2.7 7.1 3 7.5 3.4 7.8L9.2 12.2L6.8 14.6L3.9 14C3.5 13.9 3.1 14.1 2.9 14.4C2.7 14.7 2.7 15.1 2.9 15.4L4.5 18.7L7.8 20.3C8.1 20.5 8.5 20.5 8.8 20.3C9.1 20.1 9.3 19.7 9.2 19.3L8.6 16.4L11 14L15.4 19.8C15.7 20.2 16.1 20.5 16.6 20.6C17.3 20.7 17.8 20.1 17.6 19.4L15.7 11L19.5 7.2C21 5.7 21.4 3.4 21 3Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * 2. Private Aviation & Jets
 * Concept: Distinctive, bespoke illustration of a Gulfstream G700 / Bombardier Global 7500 executive private jet
 * featuring rear turbine engines, swept winglets, executive cabin windows, and gold crown speed accent.
 */
export function PrivateJetIcon({
  color = DEFAULT_COLOR,
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE,
}: LuxuryIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Streamlined executive jet fuselage with sharp needle nose cone */}
      <Path
        d="M12 1.8C11.5 1.8 11.2 3.2 11.2 5.5L11 10.5L2.2 14.2C1.7 14.4 1.5 14.9 1.7 15.4C1.8 15.8 2.2 16 2.6 15.9L11 13.8L11 18.8L8.5 20.5C8.1 20.8 8.2 21.5 8.7 21.5H10.5L12 22.8L13.5 21.5H15.3C15.8 21.5 15.9 20.8 15.5 20.5L13 18.8L13 13.8L21.4 15.9C21.8 16 22.2 15.8 22.3 15.4C22.5 14.9 22.3 14.4 21.8 14.2L13 10.5L12.8 5.5C12.8 3.2 12.5 1.8 12 1.8Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Signature rear twin jet turbine engine pods (Gulfstream / Bombardier hallmark) */}
      <Path
        d="M8.8 15.2C8.8 14.3 9.4 13.6 10.2 13.6M15.2 15.2C15.2 14.3 14.6 13.6 13.8 13.6"
        stroke={color === DEFAULT_COLOR ? '#C5A059' : color}
        strokeWidth={strokeWidth * 1.1}
        strokeLinecap="round"
      />
      {/* Upward Wingtip Winglets (Aero Efficiency) */}
      <Path
        d="M1.8 13.2L1.5 15.5M22.2 13.2L22.5 15.5"
        stroke={color === DEFAULT_COLOR ? '#C5A059' : color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Sleek executive cockpit visor */}
      <Path
        d="M11.3 5.2H12.7"
        stroke={color}
        strokeWidth={strokeWidth * 1.3}
        strokeLinecap="round"
      />
      {/* Luxury gold cabin window dots */}
      <Circle cx="12" cy="8.2" r="0.6" fill={color === DEFAULT_COLOR ? '#C5A059' : color} />
      <Circle cx="12" cy="10.2" r="0.6" fill={color === DEFAULT_COLOR ? '#C5A059' : color} />
    </Svg>
  );
}

/**
 * 3. Hotel Apartments / Serviced Residences
 * Concept: Elegant, geometric architectural line structure of a modern skyscraper.
 */
export function HotelApartmentsIcon({
  color = DEFAULT_COLOR,
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE,
}: LuxuryIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Central Spire & Crown Penthouse */}
      <Path
        d="M12 2V4M10 4H14L15 7.5H9L10 4Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Geometric Stepped Skyscraper Tower */}
      <Path
        d="M7 21V12L9 7.5H15L17 12V21"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Terraced Setbacks */}
      <Path
        d="M4 21V15L7 13M20 21V15L17 13"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Minimalist Floor & Balcony Divisions */}
      <Path
        d="M10 11.5H14M9 15.5H15M7 19H17M2 21H22"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * 4. Luxury Hotels & Resorts
 * Concept: 5-Star grand palace facade with stately columns and pediment.
 */
export function HotelResortIcon({
  color = DEFAULT_COLOR,
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE,
}: LuxuryIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Grand Pediment */}
      <Path
        d="M12 3L2.5 8H21.5L12 3Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Slender Columns */}
      <Path
        d="M5.5 11V18M9 11V18M15 11V18M18.5 11V18"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Royal Arch Portal */}
      <Path
        d="M10 18V14C10 12.9 10.9 12 12 12C13.1 12 14 12.9 14 14V18"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Stately Base */}
      <Path
        d="M3.5 18H20.5M2 21H22"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/**
 * 5. Luxury Superyachts
 * Concept: Sleek, horizontal abstract side-profile of a modern mega-yacht over a single wave line.
 */
export function SuperyachtIcon({
  color = DEFAULT_COLOR,
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE,
}: LuxuryIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Mega-Yacht Plumb-Bow Hull & Main Deck */}
      <Path
        d="M3 16.5L4.5 17.5H19.5L21.5 14L17 14L15.5 11H8L7 14L3 14V16.5Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Upper Bridge Deck & Flybridge */}
      <Path
        d="M9 11L10 8.5H13.5L14.5 11"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Satellite Radar Mast */}
      <Path
        d="M11.5 8.5V6M10 6H13"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Wraparound VIP Salon Glass */}
      <Path
        d="M8.5 13.5H15"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Single Elegant Horizon Ocean Wave */}
      <Path
        d="M1.5 20C4.5 18.5 7.5 21 11.5 19.5C15.5 18 18.5 20.5 22.5 19"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/**
 * 6. Limousine & Fleet
 * Concept: Extended, elegant side-profile line drawing of an executive limousine.
 */
export function LimousineIcon({
  color = DEFAULT_COLOR,
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE,
}: LuxuryIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Extended Executive Limousine Profile */}
      <Path
        d="M1.5 14.5V13.5C1.5 13.5 2.5 12.5 4 12.5H5.5L7 8.5H16.5L18.5 12.5H21.5C22 12.5 22.5 13 22.5 13.5V14.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Undercarriage Ground Clearance */}
      <Path
        d="M1.5 14.5H4M8 14.5H16M20 14.5H22.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Minimalist Spoke Wheels */}
      <Circle
        cx="6"
        cy="14.5"
        r="2"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Circle
        cx="18"
        cy="14.5"
        r="2"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      {/* Executive Window Trio: Chauffeur, Salon, Rear VIP Quarter */}
      <Path
        d="M7.3 12H16M10.5 8.5V12M13.5 8.5V12"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/**
 * 7. VIP Gallery
 * Concept: Modern abstract gallery metaphor using three minimalist layered/overlapping thin-line frames.
 */
export function VipGalleryIcon({
  color = DEFAULT_COLOR,
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE,
}: LuxuryIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Frame 1: Back Layer (Offset Top-Right) */}
      <Rect
        x="8"
        y="2.5"
        width="12.5"
        height="12.5"
        rx="2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.35}
      />
      {/* Frame 2: Middle Layer (Offset Center) */}
      <Rect
        x="5"
        y="5.5"
        width="12.5"
        height="12.5"
        rx="2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.65}
      />
      {/* Frame 3: Foreground Focal Frame */}
      <Rect
        x="2.5"
        y="8.5"
        width="12.5"
        height="12.5"
        rx="2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Minimalist Horizon & Sun in Foreground Exhibition */}
      <Circle
        cx="6.5"
        cy="12.5"
        r="1.2"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Path
        d="M3 18L6.8 14.5L10 17.5L11.8 16L14.8 18"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * 8. Luxury Tours & Packages
 * Concept: Minimalist precision compass with needle.
 */
export function LuxuryTourIcon({
  color = DEFAULT_COLOR,
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE,
}: LuxuryIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
      <Polygon
        points="15.5 8.5 13.5 13.5 8.5 15.5 10.5 10.5 15.5 8.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="12" r="1.2" fill={color} />
    </Svg>
  );
}

/**
 * 9. Luxury Travel Magazine & Blog
 * Concept: Minimalist editorial open journal.
 */
export function LuxuryMagazineIcon({
  color = DEFAULT_COLOR,
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE,
}: LuxuryIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 5.5C2 4.1 3.1 3 4.5 3H12V20H4.5C3.1 20 2 18.9 2 17.5V5.5ZM22 5.5C22 4.1 20.9 3 19.5 3H12V20H19.5C20.9 20 22 18.9 22 17.5V5.5Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5.5 7.5H9.5M5.5 11.5H9.5M14.5 7.5H18.5M14.5 11.5H18.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/**
 * 10. Global eSIM
 * Concept: Minimalist globe and orbiting data plan.
 */
export function GlobalEsimIcon({
  color = DEFAULT_COLOR,
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE,
}: LuxuryIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
      <Path
        d="M3 12H21M12 3C14.5 6 16 9 16 12C16 15 14.5 18 12 21C9.5 18 8 15 8 12C8 9 9.5 6 12 3Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * 11. Visa Services
 * Concept: Official passport document with diplomatic seal.
 */
export function VisaServiceIcon({
  color = DEFAULT_COLOR,
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE,
}: LuxuryIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="4.5"
        y="3"
        width="15"
        height="18"
        rx="2.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="9.5" r="3" stroke={color} strokeWidth={strokeWidth} />
      <Path
        d="M8.5 16H15.5M8.5 18H13"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/**
 * 12. Airport Fast-Track
 * Concept: VIP priority security shield with swift flight check.
 */
export function FastTrackIcon({
  color = DEFAULT_COLOR,
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE,
}: LuxuryIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2.5L19.5 5.5V11.5C19.5 16.5 16.3 20.8 12 22C7.7 20.8 4.5 16.5 4.5 11.5V5.5L12 2.5Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 12L11 14L15 9.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * 13. AI Concierge
 * Concept: Minimalist 4-point diamond star / bespoke concierge intelligence.
 */
export function AiConciergeIcon({
  color = DEFAULT_COLOR,
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE,
}: LuxuryIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="19" cy="5" r="1.5" stroke={color} strokeWidth={strokeWidth * 0.8} />
    </Svg>
  );
}

/**
 * 14. Our Offices
 * Concept: Minimalist location pin for global concierge offices.
 */
export function OfficesIcon({
  color = DEFAULT_COLOR,
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE,
}: LuxuryIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2.5C8.4 2.5 5.5 5.4 5.5 9C5.5 13.8 12 21.5 12 21.5C12 21.5 18.5 13.8 18.5 9C18.5 5.4 15.6 2.5 12 2.5Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="9" r="2.5" stroke={color} strokeWidth={strokeWidth} />
    </Svg>
  );
}

// ============================================================================
// VANIR MASTER NAVIGATION & BOTTOM TAB SUITE (Apple SF Symbols Quiet Luxury)
// Stroke weight: 1.5px, Color: #C5A059 / Gold Accent
// ============================================================================

export const NAV_GOLD = '#C5A059';

/**
 * Modern Sleek House Frame
 * For: Home / Explore navigation tab
 */
export function NavHomeIcon({
  color = NAV_GOLD,
  size = DEFAULT_SIZE,
  strokeWidth = 1.5,
}: LuxuryIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 10.5L12 3.5L21 10.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18 7.5V4.5H20V9"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5.5 9.5V19.5C5.5 20.0523 5.94772 20.5 6.5 20.5H17.5C18.0523 20.5 18.5 20.0523 18.5 19.5V9.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10 20.5V14.5C10 13.9477 10.4477 13.5 11 13.5H13C13.5523 13.5 14 13.9477 14 14.5V20.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Folded Geographic Map Layout with Pin
 * For: Discover / Interactive Map navigation tab
 */
export function NavMapIcon({
  color = NAV_GOLD,
  size = DEFAULT_SIZE,
  strokeWidth = 1.5,
}: LuxuryIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3.5 6.5L8.5 4L15.5 7L20.5 4.5V17.5L15.5 20L8.5 17L3.5 19.5V6.5Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.5 4V17"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.5 7V20"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 4C10.6193 4 9.5 5.11929 9.5 6.5C9.5 8.3 12 11 12 11C12 11 14.5 8.3 14.5 6.5C14.5 5.11929 13.3807 4 12 4Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="6.5" r="1" fill={color} />
    </Svg>
  );
}

/**
 * Clean 2x2 Soft-Rounded Squares Grid
 * For: Services / Dashboard navigation tab
 */
export function NavGridIcon({
  color = NAV_GOLD,
  size = DEFAULT_SIZE,
  strokeWidth = 1.5,
}: LuxuryIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="4"
        y="4"
        width="6.8"
        height="6.8"
        rx="1.8"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Rect
        x="13.2"
        y="4"
        width="6.8"
        height="6.8"
        rx="1.8"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Rect
        x="4"
        y="13.2"
        width="6.8"
        height="6.8"
        rx="1.8"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Rect
        x="13.2"
        y="13.2"
        width="6.8"
        height="6.8"
        rx="1.8"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Sleek Geometric Magnifying Glass
 * For: Search & Discovery flows
 */
export function NavSearchIcon({
  color = NAV_GOLD,
  size = DEFAULT_SIZE,
  strokeWidth = 1.5,
}: LuxuryIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="10.5"
        cy="10.5"
        r="6.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.5 15.5L20.5 20.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Stylized VIP Human User Profile Silhouette
 * For: VIP Account / Profile navigation tab
 */
export function NavProfileIcon({
  color = NAV_GOLD,
  size = DEFAULT_SIZE,
  strokeWidth = 1.5,
}: LuxuryIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="12"
        cy="7.5"
        r="4"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4.5 20C4.5 16.4101 7.85786 13.5 12 13.5C16.1421 13.5 19.5 16.4101 19.5 20"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Luxury Notification Bell
 * For: Top Header Notification Action
 */
export function NavBellIcon({
  color = NAV_GOLD,
  size = DEFAULT_SIZE,
  strokeWidth = 1.5,
}: LuxuryIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Destinations Category Icon (Folded Map)
 */
export const DestinationsIcon = NavMapIcon;

/**
 * Luxury Offers & Perks Icon (Minimalist Diamond Cut Tag)
 */
export function OffersIcon({
  color = NAV_GOLD,
  size = DEFAULT_SIZE,
  strokeWidth = 1.5,
}: LuxuryIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20.59 13.41L13.42 20.58C13.05 20.95 12.53 21.16 12 21.16C11.47 21.16 10.95 20.95 10.59 20.59L2.83 12.83C2.46 12.46 2.25 11.95 2.25 11.41V4.25C2.25 3.15 3.15 2.25 4.25 2.25H11.41C11.95 2.25 12.46 2.46 12.83 2.83L20.59 10.59C21.37 11.37 21.37 12.63 20.59 13.41Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="7.5" cy="7.5" r="1.5" fill={color} />
    </Svg>
  );
}

/**
 * Messages / Inbox Navigation Icon
 * Dual speech bubble design with clean Apple/Vanir quiet luxury line art
 */
export function NavMessagesIcon({
  color = NAV_GOLD,
  size = DEFAULT_SIZE,
  strokeWidth = 1.6,
}: LuxuryIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Upper Back Bubble */}
      <Path
        d="M9 3.5H17.5C19.4 3.5 21 5.1 21 7V10.5C21 12.4 19.4 14 17.5 14H16L14 16V14H9C7.1 14 5.5 12.4 5.5 10.5V7C5.5 5.1 7.1 3.5 9 3.5Z"
        stroke={color}
        strokeWidth={strokeWidth * 0.85}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.55}
      />
      {/* Lower Front Bubble */}
      <Path
        d="M4.5 7.5H14.5C16.4 7.5 18 9.1 18 11V14.5C18 16.4 16.4 18 14.5 18H11.5L7.5 21V18H4.5C2.6 18 1 16.4 1 14.5V11C1 9.1 2.6 7.5 4.5 7.5Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Refined Gold Horizontal Whispers */}
      <Path
        d="M5.5 11.5H13.5M5.5 14.5H10"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}


