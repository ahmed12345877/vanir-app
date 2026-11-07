import React from 'react';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

export type LifestyleIconKey =
  | 'chef'
  | 'photography'
  | 'massage'
  | 'makeup'
  | 'training'
  | 'car'
  | 'messages'
  | 'pill_all'
  | 'pill_homes'
  | 'pill_experiences'
  | 'pill_services';

interface Props {
  name: LifestyleIconKey;
  size?: number;
}

/**
 * BespokeLifestyleIcon
 * Crafted in the exact Vanir 3D Metallic Champagne-Gold on Deep Obsidian-Navy Squircle style
 * (matching the 16-icon reference sheet: double metallic gold bezel, top-right navy sheen,
 * deep cast shadow, and sculpted 3D brushed-gold emblem).
 */
export function BespokeLifestyleIcon({ name, size = 52 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Defs>
        {/* Outer Squircle Drop Shadow */}
        <RadialGradient id="dropShadow" cx="50%" cy="54%" r="50%">
          <Stop offset="65%" stopColor="#000000" stopOpacity="0.55" />
          <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </RadialGradient>

        {/* Metallic Brushed Champagne Gold Outer Rim */}
        <LinearGradient id="goldBezel" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#F9ECC7" />
          <Stop offset="28%" stopColor="#DEC07C" />
          <Stop offset="62%" stopColor="#B8934A" />
          <Stop offset="88%" stopColor="#7C5D24" />
          <Stop offset="100%" stopColor="#D6B56E" />
        </LinearGradient>

        {/* Deep Obsidian-Navy Squircle Body (Top-Right Navy Sheen -> Bottom-Left Deep Black-Navy) */}
        <LinearGradient id="obsidianNavy" x1="0.88" y1="0.12" x2="0.12" y2="0.92">
          <Stop offset="0%" stopColor="#20324E" />
          <Stop offset="36%" stopColor="#111C2F" />
          <Stop offset="76%" stopColor="#080E1A" />
          <Stop offset="100%" stopColor="#04070E" />
        </LinearGradient>

        {/* Top-Right Specular Navy Highlight */}
        <RadialGradient id="topRightSheen" cx="76%" cy="22%" r="52%">
          <Stop offset="0%" stopColor="#314B73" stopOpacity="0.48" />
          <Stop offset="100%" stopColor="#080E1A" stopOpacity="0" />
        </RadialGradient>

        {/* Primary 3D Sculpted Brushed Champagne Gold */}
        <LinearGradient id="gold3D" x1="0.15" y1="0.08" x2="0.85" y2="0.92">
          <Stop offset="0%" stopColor="#FFF4D2" />
          <Stop offset="25%" stopColor="#E9CC87" />
          <Stop offset="58%" stopColor="#C8A258" />
          <Stop offset="85%" stopColor="#946F2B" />
          <Stop offset="100%" stopColor="#6E4F19" />
        </LinearGradient>

        {/* Secondary Warm Gold for Lower Bevels & Depth */}
        <LinearGradient id="goldDeep" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#DFBE77" />
          <Stop offset="55%" stopColor="#A9823C" />
          <Stop offset="100%" stopColor="#654918" />
        </LinearGradient>

        {/* Specular Ridge Highlight */}
        <LinearGradient id="goldHighlight" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <Stop offset="50%" stopColor="#F9ECC7" stopOpacity="0.75" />
          <Stop offset="100%" stopColor="#C8A258" stopOpacity="0.2" />
        </LinearGradient>
      </Defs>

      {/* Soft Outer Ambient Shadow */}
      <Rect x="5" y="7" width="90" height="90" rx="26" fill="url(#dropShadow)" />

      {/* Outer Metallic Champagne Gold Bezel Frame */}
      <Rect x="5" y="5" width="90" height="90" rx="25" fill="url(#goldBezel)" />

      {/* Dark Recessed Inner Groove */}
      <Rect x="7.6" y="7.6" width="84.8" height="84.8" rx="22.8" fill="#04070D" />

      {/* Main Obsidian-Navy 3D Squircle Surface */}
      <Rect
        x="8.8"
        y="8.8"
        width="82.4"
        height="82.4"
        rx="21.8"
        fill="url(#obsidianNavy)"
        stroke="#2B3E5E"
        strokeWidth="0.7"
      />

      {/* Top-Right Studio Lighting Sheen */}
      <Rect x="8.8" y="8.8" width="82.4" height="82.4" rx="21.8" fill="url(#topRightSheen)" />

      {/* ===================================================================== */}
      {/* 1. SPA & MASSAGE ('massage') — 3D Sculpted Gold Lotus & Zen Stones    */}
      {/* ===================================================================== */}
      {name === 'massage' && (
        <G>
          {/* Cast 3D Shadow on Navy Surface */}
          <G transform="translate(2.2, 3.4)" opacity="0.72">
            <Ellipse cx="50" cy="71" rx="24" ry="5.5" fill="#010308" />
            <Ellipse cx="50" cy="63" rx="18" ry="4.5" fill="#010308" />
            <Path
              d="M50 22 C56 33, 59 45, 50 56 C41 45, 44 33, 50 22 Z"
              fill="#010308"
            />
            <Path
              d="M50 56 C36 52, 27 41, 29 29 C38 34, 45 43, 50 56 Z"
              fill="#010308"
            />
            <Path
              d="M50 56 C64 52, 73 41, 71 29 C62 34, 55 43, 50 56 Z"
              fill="#010308"
            />
            <Path
              d="M50 56 C32 56, 20 48, 19 38 C29 40, 40 48, 50 56 Z"
              fill="#010308"
            />
            <Path
              d="M50 56 C68 56, 80 48, 81 38 C71 40, 60 48, 50 56 Z"
              fill="#010308"
            />
          </G>

          {/* Outer Lateral Gold Petals */}
          <Path
            d="M50 56 C32 56, 20 48, 19 38 C29 40, 40 48, 50 56 Z"
            fill="url(#goldDeep)"
            stroke="url(#goldHighlight)"
            strokeWidth="0.8"
          />
          <Path
            d="M50 56 C68 56, 80 48, 81 38 C71 40, 60 48, 50 56 Z"
            fill="url(#goldDeep)"
            stroke="url(#goldHighlight)"
            strokeWidth="0.8"
          />

          {/* Mid-Layer Sculpted Gold Petals */}
          <Path
            d="M50 56 C36 52, 27 41, 29 29 C38 34, 45 43, 50 56 Z"
            fill="url(#gold3D)"
            stroke="url(#goldHighlight)"
            strokeWidth="0.9"
          />
          <Path
            d="M50 56 C64 52, 73 41, 71 29 C62 34, 55 43, 50 56 Z"
            fill="url(#gold3D)"
            stroke="url(#goldHighlight)"
            strokeWidth="0.9"
          />

          {/* Center Crown Lotus Petal with 3D Ridge */}
          <Path
            d="M50 22 C56.5 33, 59.5 45, 50 56 C40.5 45, 43.5 33, 50 22 Z"
            fill="url(#gold3D)"
            stroke="#FFF4D2"
            strokeWidth="1.1"
          />
          <Path d="M50 24 V54" stroke="#FFF4D2" strokeWidth="1" opacity="0.65" />

          {/* Upper Zen Massage Stone (Brushed Gold) */}
          <Ellipse
            cx="50"
            cy="62.5"
            rx="17.5"
            ry="4.8"
            fill="url(#gold3D)"
            stroke="#FFF4D2"
            strokeWidth="0.9"
          />
          {/* Base Zen Massage Stone (Brushed Gold) */}
          <Ellipse
            cx="50"
            cy="70.5"
            rx="24"
            ry="5.6"
            fill="url(#goldDeep)"
            stroke="url(#gold3D)"
            strokeWidth="1"
          />
          <Path
            d="M32 69.5 Q50 72.5 68 69.5"
            stroke="#FFF4D2"
            strokeWidth="0.9"
            opacity="0.55"
            fill="none"
          />
        </G>
      )}

      {/* ===================================================================== */}
      {/* 2. PHOTOGRAPHY ('photography') — 3D Sculpted Gold Leica Camera        */}
      {/* ===================================================================== */}
      {name === 'photography' && (
        <G>
          {/* Cast 3D Shadow */}
          <G transform="translate(2.4, 3.6)" opacity="0.75">
            <Rect x="20" y="32" width="60" height="40" rx="9" fill="#010308" />
            <Path d="M36 32 L40 24 H60 L64 32 Z" fill="#010308" />
          </G>

          {/* Top Prism Viewfinder Housing & Shutter */}
          <Path
            d="M36 33 L40.5 24.5 H59.5 L64 33 Z"
            fill="url(#gold3D)"
            stroke="#FFF4D2"
            strokeWidth="1"
          />
          <Rect x="65" y="27.5" width="9" height="5.5" rx="2" fill="url(#goldDeep)" stroke="#FFF4D2" strokeWidth="0.7" />
          <Rect x="25" y="29" width="7" height="4" rx="1.5" fill="url(#gold3D)" />

          {/* Main 3D Brushed Gold Camera Body */}
          <Rect
            x="20"
            y="32"
            width="60"
            height="40"
            rx="9"
            fill="url(#gold3D)"
            stroke="#FFF4D2"
            strokeWidth="1.2"
          />

          {/* Recessed Dark Navy Grip & Band Channel (like the hotel/passport cutouts) */}
          <Path d="M20 43 H80" stroke="#080E1A" strokeWidth="2.4" />
          <Rect x="24" y="47" width="8" height="20" rx="2.5" fill="#080E1A" opacity="0.75" />

          {/* Viewfinder Window Cutout */}
          <Rect x="65" y="36" width="9" height="4.5" rx="1.5" fill="#080E1A" />

          {/* Outer 3D Gold Lens Barrel */}
          <Circle cx="53" cy="54" r="15.5" fill="#080E1A" stroke="url(#goldDeep)" strokeWidth="1.8" />
          <Circle cx="53" cy="54" r="12.5" fill="url(#gold3D)" stroke="#FFF4D2" strokeWidth="1" />
          {/* Inner Dark Aperture & Gold Ring */}
          <Circle cx="53" cy="54" r="8" fill="#080E1A" stroke="url(#gold3D)" strokeWidth="1.4" />
          {/* Specular Gold Lens Glint */}
          <Circle cx="50.5" cy="51.5" r="2.4" fill="#FFF4D2" />
          <Circle cx="55.5" cy="56.5" r="1.2" fill="#E9CC87" />
        </G>
      )}

      {/* ===================================================================== */}
      {/* 3. PRIVATE CHEF ('chef') — 3D Royal Gold Cloche Dome & Crossed Cutlery*/}
      {/* ===================================================================== */}
      {name === 'chef' && (
        <G>
          {/* Cast 3D Shadow */}
          <G transform="translate(2.4, 3.6)" opacity="0.75">
            <Path d="M22 62 C22 40, 34 29, 50 29 C66 29, 78 40, 78 62 Z" fill="#010308" />
            <Rect x="16" y="62" width="68" height="6.5" rx="3.2" fill="#010308" />
            <Path d="M20 72 H80 L74 76 H26 Z" fill="#010308" />
          </G>

          {/* Top Crown Finial Ring */}
          <Circle
            cx="50"
            cy="25"
            r="5"
            fill="url(#gold3D)"
            stroke="#FFF4D2"
            strokeWidth="1.2"
          />
          <Circle cx="50" cy="25" r="2" fill="#080E1A" />

          {/* 3D Sculpted Royal Cloche Dome */}
          <Path
            d="M22 62 C22 40, 34 29, 50 29 C66 29, 78 40, 78 62 Z"
            fill="url(#gold3D)"
            stroke="#FFF4D2"
            strokeWidth="1.2"
          />

          {/* 3D Specular Sheen on Left Curve of Dome */}
          <Path
            d="M30 57 C31 43, 39 35, 48 33"
            stroke="#FFF4D2"
            strokeWidth="2.8"
            strokeLinecap="round"
            opacity="0.75"
            fill="none"
          />

          {/* Engraved Royal Star Emblem in Center of Dome */}
          <Path
            d="M50 41 L51.8 45.5 L56.5 45.8 L52.8 48.8 L54 53.5 L50 50.8 L46 53.5 L47.2 48.8 L43.5 45.8 L48.2 45.5 Z"
            fill="#080E1A"
            opacity="0.82"
          />

          {/* Heavy Gold Serving Platter Rim & Base */}
          <Rect
            x="16"
            y="61.5"
            width="68"
            height="6.2"
            rx="3.1"
            fill="url(#gold3D)"
            stroke="#FFF4D2"
            strokeWidth="1"
          />
          <Path
            d="M22 68.5 H78 L72 74 H28 Z"
            fill="url(#goldDeep)"
          />
        </G>
      )}

      {/* ===================================================================== */}
      {/* 4. MAKEUP & GLAM ('makeup') — 3D Gold Vanity Mirror & Couture Lipstick*/}
      {/* ===================================================================== */}
      {name === 'makeup' && (
        <G>
          {/* Cast 3D Shadow */}
          <G transform="translate(2.4, 3.6)" opacity="0.75">
            <Circle cx="41" cy="45" r="21" fill="#010308" />
            <Rect x="25" y="65" width="32" height="7" rx="3.5" fill="#010308" />
            <Rect x="64" y="47" width="14" height="25" rx="3" fill="#010308" />
            <Path d="M66 47 V32 C66 28, 76 31, 76 36 V47 Z" fill="#010308" />
          </G>

          {/* Ornate 3D Gold Compact Mirror Frame */}
          <Circle
            cx="41"
            cy="45"
            r="20.5"
            fill="url(#gold3D)"
            stroke="#FFF4D2"
            strokeWidth="1.2"
          />
          {/* Top Crown clasp on Compact */}
          <Rect x="37" y="21.5" width="8" height="4" rx="2" fill="url(#gold3D)" stroke="#FFF4D2" strokeWidth="0.8" />

          {/* Dark Obsidian Mirror Glass Inside Frame */}
          <Circle
            cx="41"
            cy="45"
            r="14.5"
            fill="#080E1A"
            stroke="url(#goldDeep)"
            strokeWidth="1.4"
          />
          {/* Diagonal Gold Glint Reflection Lines Across Mirror */}
          <Path
            d="M33 52 L47 36 M39 54 L50 42"
            stroke="url(#gold3D)"
            strokeWidth="2.4"
            strokeLinecap="round"
          />

          {/* Open Compact Lower Base */}
          <Rect
            x="23"
            y="64.5"
            width="36"
            height="7"
            rx="3.5"
            fill="url(#gold3D)"
            stroke="#FFF4D2"
            strokeWidth="1"
          />

          {/* 3D Sculpted Gold Couture Lipstick Tube */}
          <Path
            d="M66 48 V33 C66 28.5, 76 31.5, 76 36.5 V48 Z"
            fill="url(#goldDeep)"
            stroke="#FFF4D2"
            strokeWidth="1"
          />
          <Rect
            x="64"
            y="47"
            width="14"
            height="24.5"
            rx="3"
            fill="url(#gold3D)"
            stroke="#FFF4D2"
            strokeWidth="1.1"
          />
          {/* Engraved Dark Band on Lipstick Case */}
          <Rect x="64" y="55" width="14" height="3.2" fill="#080E1A" />
        </G>
      )}

      {/* ===================================================================== */}
      {/* 5. PERSONAL TRAINING ('training') — 3D Sculpted Gold Dumbbell & Laurel*/}
      {/* ===================================================================== */}
      {name === 'training' && (
        <G>
          {/* Cast 3D Shadow */}
          <G transform="translate(2.4, 3.6)" opacity="0.75">
            <Rect x="32" y="46" width="36" height="8" rx="3" fill="#010308" />
            <Rect x="22" y="33" width="10" height="34" rx="3.5" fill="#010308" />
            <Rect x="14" y="38" width="7" height="24" rx="3" fill="#010308" />
            <Rect x="68" y="33" width="10" height="34" rx="3.5" fill="#010308" />
            <Rect x="79" y="38" width="7" height="24" rx="3" fill="#010308" />
          </G>

          {/* Upper Victory Crown / Star Accent */}
          <Path
            d="M50 22 L52.2 27.2 L57.8 27.6 L53.5 31.2 L54.8 36.6 L50 33.6 L45.2 36.6 L46.5 31.2 L42.2 27.6 L47.8 27.2 Z"
            fill="url(#gold3D)"
            stroke="#FFF4D2"
            strokeWidth="0.8"
          />

          {/* Central Knurled Gold Barbell Shaft */}
          <Rect
            x="31"
            y="46"
            width="38"
            height="8"
            rx="2.5"
            fill="url(#goldDeep)"
            stroke="#FFF4D2"
            strokeWidth="0.9"
          />
          <Path d="M40 46.5 V53.5 M46 46.5 V53.5 M54 46.5 V53.5 M60 46.5 V53.5" stroke="#080E1A" strokeWidth="1.4" />

          {/* Left Inner Heavy Gold Weight Plate */}
          <Rect
            x="22"
            y="33"
            width="10.5"
            height="34"
            rx="3.8"
            fill="url(#gold3D)"
            stroke="#FFF4D2"
            strokeWidth="1.1"
          />
          {/* Left Outer Gold Weight Plate */}
          <Rect
            x="14"
            y="38"
            width="7.5"
            height="24"
            rx="3"
            fill="url(#goldDeep)"
            stroke="#FFF4D2"
            strokeWidth="0.9"
          />

          {/* Right Inner Heavy Gold Weight Plate */}
          <Rect
            x="67.5"
            y="33"
            width="10.5"
            height="34"
            rx="3.8"
            fill="url(#gold3D)"
            stroke="#FFF4D2"
            strokeWidth="1.1"
          />
          {/* Right Outer Gold Weight Plate */}
          <Rect
            x="78.5"
            y="38"
            width="7.5"
            height="24"
            rx="3"
            fill="url(#goldDeep)"
            stroke="#FFF4D2"
            strokeWidth="0.9"
          />

          {/* Lower Subtle Arc Pedestal */}
          <Path
            d="M32 72 Q50 77 68 72"
            stroke="url(#gold3D)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </G>
      )}

      {/* ===================================================================== */}
      {/* 6. CAR RENTAL ('car') — 3D Sculpted Gold Luxury Grand Tourer Coupe    */}
      {/* ===================================================================== */}
      {name === 'car' && (
        <G>
          {/* Cast 3D Shadow */}
          <G transform="translate(2.4, 3.6)" opacity="0.78">
            <Path
              d="M15 56 C15 50, 20 47, 27 46 L37 35 C41 31, 59 31, 65 36 L74 45 C81 46, 85 50, 85 56 L83 61 H17 Z"
              fill="#010308"
            />
            <Circle cx="29" cy="61" r="8.5" fill="#010308" />
            <Circle cx="71" cy="61" r="8.5" fill="#010308" />
          </G>

          {/* Royal Crest Above Car */}
          <Path
            d="M43 22 L46.5 26.5 L50 20.5 L53.5 26.5 L57 22 L55.5 29 H44.5 Z"
            fill="url(#gold3D)"
            stroke="#FFF4D2"
            strokeWidth="0.7"
          />

          {/* 3D Sculpted Champagne-Gold Luxury Sedan/Coupe Body */}
          <Path
            d="M15 56 C15 50, 20 47, 27 46 L37 35 C41 31, 59 31, 65 36 L74 45 C81 46, 85 50, 85 56 L83 61 H17 Z"
            fill="url(#gold3D)"
            stroke="#FFF4D2"
            strokeWidth="1.2"
          />

          {/* Recessed Dark Navy Cabin Windows */}
          <Path
            d="M38.5 36.5 L30.5 45.5 H49 V34.8 C44 34.8, 40.5 35.2, 38.5 36.5 Z"
            fill="#080E1A"
          />
          <Path
            d="M52 34.8 V45.5 H69.5 L62.5 37 C59.5 35.3, 56 34.8, 52 34.8 Z"
            fill="#080E1A"
          />

          {/* Sculpted Side Character Line */}
          <Path
            d="M20 52 H80"
            stroke="#080E1A"
            strokeWidth="1.5"
            opacity="0.65"
          />

          {/* Front & Rear 3D Gold Multi-Spoke Wheels */}
          <Circle cx="29" cy="61" r="8.5" fill="#080E1A" stroke="url(#goldDeep)" strokeWidth="1.5" />
          <Circle cx="29" cy="61" r="5.5" fill="url(#gold3D)" stroke="#FFF4D2" strokeWidth="0.9" />
          <Circle cx="29" cy="61" r="2" fill="#080E1A" />

          <Circle cx="71" cy="61" r="8.5" fill="#080E1A" stroke="url(#goldDeep)" strokeWidth="1.5" />
          <Circle cx="71" cy="61" r="5.5" fill="url(#gold3D)" stroke="#FFF4D2" strokeWidth="0.9" />
          <Circle cx="71" cy="61" r="2" fill="#080E1A" />
        </G>
      )}

      {/* ===================================================================== */}
      {/* PILL ICONS (Same 3D Metallic Gold on Obsidian-Navy Squircle Style)    */}
      {/* ===================================================================== */}
      {name === 'messages' && (
        <G>
          {/* Back Chat Bubble (Deeper Gold with shadow) */}
          <Path
            d="M38 30 H68 C73.5 30 78 34.5 78 40 V52 C78 57.5 73.5 62 68 62 H62 L55 69 V62 H38 C32.5 62 28 57.5 28 52 V40 C28 34.5 32.5 30 38 30 Z"
            fill="url(#goldDeep)"
            stroke="#FFF4D2"
            strokeWidth="1.2"
          />
          {/* Front Primary Chat Bubble (Prominent Sculpted 3D Gold) */}
          <Path
            d="M26 40 H56 C61 40 65 44 65 49 V60 C65 65 61 69 56 69 H48 L41 76 V69 H26 C21 69 17 65 17 60 V49 C17 44 21 40 26 40 Z"
            fill="url(#gold3D)"
            stroke="#FFFFFF"
            strokeWidth="1.4"
          />
          {/* Subtle Chat Lines on Front Bubble */}
          <Rect x="26" y="49" width="22" height="3" rx="1.5" fill="#080E1A" opacity={0.75} />
          <Rect x="26" y="56" width="14" height="3" rx="1.5" fill="#080E1A" opacity={0.75} />
          {/* Specular Ridge Highlights */}
          <Circle cx="62" cy="38" r="2" fill="#FFF4D2" />
        </G>
      )}

      {name === 'pill_all' && (
        <G>
          <Circle cx="50" cy="50" r="25" fill="url(#gold3D)" stroke="#FFF4D2" strokeWidth="1.2" />
          <Ellipse cx="50" cy="50" rx="12" ry="24" stroke="#080E1A" strokeWidth="2.6" fill="none" />
          <Path d="M26 50 H74 M30 38 H70 M30 62 H70" stroke="#080E1A" strokeWidth="2.6" />
        </G>
      )}

      {name === 'pill_homes' && (
        <G>
          <Path
            d="M24 48 L50 24 L76 48"
            stroke="url(#gold3D)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Rect
            x="31"
            y="45"
            width="38"
            height="28"
            rx="4"
            fill="url(#gold3D)"
            stroke="#FFF4D2"
            strokeWidth="1"
          />
          <Rect x="44" y="55" width="12" height="18" rx="2" fill="#080E1A" />
        </G>
      )}

      {name === 'pill_experiences' && (
        <G>
          <Circle cx="50" cy="50" r="25" fill="url(#gold3D)" stroke="#FFF4D2" strokeWidth="1.2" />
          <Circle cx="50" cy="50" r="19" fill="#080E1A" />
          <Path
            d="M50 28 L55 45 L72 50 L55 55 L50 72 L45 55 L28 50 L45 45 Z"
            fill="url(#gold3D)"
            stroke="#FFF4D2"
            strokeWidth="0.8"
          />
          <Circle cx="50" cy="50" r="3" fill="#080E1A" />
        </G>
      )}

      {name === 'pill_services' && (
        <G>
          <Circle cx="50" cy="28" r="5" fill="url(#gold3D)" stroke="#FFF4D2" strokeWidth="1" />
          <Path
            d="M24 64 C24 44, 35 33, 50 33 C65 33, 76 44, 76 64 Z"
            fill="url(#gold3D)"
            stroke="#FFF4D2"
            strokeWidth="1.2"
          />
          <Rect x="19" y="64" width="62" height="6.5" rx="3.2" fill="url(#goldDeep)" stroke="#FFF4D2" strokeWidth="0.9" />
        </G>
      )}
    </Svg>
  );
}

export default BespokeLifestyleIcon;
