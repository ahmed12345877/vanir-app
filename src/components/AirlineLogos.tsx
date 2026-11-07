import React from 'react';
import {
  Image,
  ImageStyle,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

export interface AirlineLogoProps {
  airline?: string;
  iata?: string;
  size?: number;
  variant?: 'square' | 'rect';
  style?: ViewStyle;
  imageStyle?: ImageStyle;
}

/**
 * Authentic High-Resolution Airline Logos provided from user's Airhex IATA master library.
 */
const HIGH_RES_AIRLINE_LOGOS: Record<string, any> = {
  EK: require('../assets/airlines/emirates.png'),
  QR: require('../assets/airlines/qatar.png'),
  MS: require('../assets/airlines/egyptair.png'),
  BA: require('../assets/airlines/british_airways.png'),
  LH: require('../assets/airlines/lufthansa.png'),
  DL: require('../assets/airlines/delta.png'),
  FZ: require('../assets/airlines/flydubai.png'),
  SV: require('../assets/airlines/saudia.png'),
  EY: require('../assets/airlines/etihad.png'),
  TK: require('../assets/airlines/turkish.png'),
  AA: require('../assets/airlines/american_airlines.png'),
  LX: require('../assets/airlines/swiss.png'),
  OS: require('../assets/airlines/austrian.png'),
  GF: require('../assets/airlines/gulf_air.png'),
  RJ: require('../assets/airlines/royal_jordanian.png'),
  SQ: require('../assets/airlines/singapore.png'),
  AF: require('../assets/airlines/air_france.png'),
};

const AIRLINE_SQUARE_LOGOS: Record<string, any> = {
  EK: require('../assets/airlines/square/EK.png'),
  QR: require('../assets/airlines/square/QR.png'),
  MS: require('../assets/airlines/square/MS.png'),
  SV: require('../assets/airlines/square/SV.png'),
  BA: require('../assets/airlines/square/BA.png'),
  LH: require('../assets/airlines/square/LH.png'),
  SQ: require('../assets/airlines/square/SQ.png'),
  DL: require('../assets/airlines/square/DL.png'),
  FZ: require('../assets/airlines/square/FZ.png'),
  EY: require('../assets/airlines/square/EY.png'),
  TK: require('../assets/airlines/square/TK.png'),
  AF: require('../assets/airlines/square/AF.png'),
  KU: require('../assets/airlines/square/KU.png'),
  WY: require('../assets/airlines/square/WY.png'),
  GF: require('../assets/airlines/square/GF.png'),
  RJ: require('../assets/airlines/square/RJ.png'),
  ME: require('../assets/airlines/square/ME.png'),
  XY: require('../assets/airlines/square/XY.png'),
  G9: require('../assets/airlines/square/G9.png'),
  KL: require('../assets/airlines/square/KL.png'),
  LX: require('../assets/airlines/square/LX.png'),
  UA: require('../assets/airlines/square/UA.png'),
  AA: require('../assets/airlines/square/AA.png'),
  CX: require('../assets/airlines/square/CX.png'),
  JL: require('../assets/airlines/square/JL.png'),
  NH: require('../assets/airlines/square/NH.png'),
  KE: require('../assets/airlines/square/KE.png'),
  QF: require('../assets/airlines/square/QF.png'),
  AC: require('../assets/airlines/square/AC.png'),
  VS: require('../assets/airlines/square/VS.png'),
  AZ: require('../assets/airlines/square/AZ.png'),
  IB: require('../assets/airlines/square/IB.png'),
  SK: require('../assets/airlines/square/SK.png'),
  AY: require('../assets/airlines/square/AY.png'),
  TP: require('../assets/airlines/square/TP.png'),
  EI: require('../assets/airlines/square/EI.png'),
  SN: require('../assets/airlines/square/SN.png'),
  AI: require('../assets/airlines/square/AI.png'),
  MH: require('../assets/airlines/square/MH.png'),
  TG: require('../assets/airlines/square/TG.png'),
  GA: require('../assets/airlines/square/GA.png'),
  VN: require('../assets/airlines/square/VN.png'),
  AT: require('../assets/airlines/square/AT.png'),
  ET: require('../assets/airlines/square/ET.png'),
  SA: require('../assets/airlines/square/SA.png'),
  KQ: require('../assets/airlines/square/KQ.png'),
  NZ: require('../assets/airlines/square/NZ.png'),
  LA: require('../assets/airlines/square/LA.png'),
  AV: require('../assets/airlines/square/AV.png'),
  CM: require('../assets/airlines/square/CM.png'),
  AM: require('../assets/airlines/square/AM.png'),
  VANIR: require('../assets/vanir_round_logo.png'),
};

const AIRLINE_RECT_LOGOS: Record<string, any> = {
  EK: require('../assets/airlines/rect/EK.png'),
  QR: require('../assets/airlines/rect/QR.png'),
  MS: require('../assets/airlines/rect/MS.png'),
  SV: require('../assets/airlines/rect/SV.png'),
  BA: require('../assets/airlines/rect/BA.png'),
  LH: require('../assets/airlines/rect/LH.png'),
  SQ: require('../assets/airlines/rect/SQ.png'),
  DL: require('../assets/airlines/rect/DL.png'),
  FZ: require('../assets/airlines/rect/FZ.png'),
  EY: require('../assets/airlines/rect/EY.png'),
  TK: require('../assets/airlines/rect/TK.png'),
  AF: require('../assets/airlines/rect/AF.png'),
  KU: require('../assets/airlines/rect/KU.png'),
  WY: require('../assets/airlines/rect/WY.png'),
  GF: require('../assets/airlines/rect/GF.png'),
  RJ: require('../assets/airlines/rect/RJ.png'),
  ME: require('../assets/airlines/rect/ME.png'),
  XY: require('../assets/airlines/rect/XY.png'),
  G9: require('../assets/airlines/rect/G9.png'),
  AA: require('../assets/airlines/rect/AA.png'),
  LX: require('../assets/airlines/rect/LX.png'),
  OS: require('../assets/airlines/rect/OS.png'),
  KL: require('../assets/airlines/rect/KL.png'),
  VANIR: require('../assets/vanir_round_logo.png'),
};

const AIRLINE_NAME_MAP: Record<string, string> = {
  emirates: 'EK',
  'طيران الإمارات': 'EK',
  'emirates airlines': 'EK',
  qatar: 'QR',
  'qatar airways': 'QR',
  'الخطوط القطرية': 'QR',
  egyptair: 'MS',
  'egypt air': 'MS',
  'مصر للطيران': 'MS',
  saudia: 'SV',
  'saudi arabian airlines': 'SV',
  'الخطوط السعودية': 'SV',
  'السعودية': 'SV',
  'british airways': 'BA',
  'الخطوط البريطانية': 'BA',
  lufthansa: 'LH',
  لوفتهانزا: 'LH',
  'singapore airlines': 'SQ',
  'الخطوط السنغافورية': 'SQ',
  delta: 'DL',
  'delta air lines': 'DL',
  'delta airlines': 'DL',
  دلتا: 'DL',
  flydubai: 'FZ',
  'فلاي دبي': 'FZ',
  etihad: 'EY',
  'etihad airways': 'EY',
  'الاتحاد للطيران': 'EY',
  turkish: 'TK',
  'turkish airlines': 'TK',
  'الخطوط التركية': 'TK',
  'air france': 'AF',
  'الفرنسية': 'AF',
  kuwait: 'KU',
  'kuwait airways': 'KU',
  'الخطوط الكويتية': 'KU',
  oman: 'WY',
  'oman air': 'WY',
  'الطيران العماني': 'WY',
  gulf: 'GF',
  'gulf air': 'GF',
  'طيران الخليج': 'GF',
  'royal jordanian': 'RJ',
  'الملكية الأردنية': 'RJ',
  mea: 'ME',
  'middle east airlines': 'ME',
  flynas: 'XY',
  'طيران ناس': 'XY',
  'air arabia': 'G9',
  'العربية للطيران': 'G9',
  klm: 'KL',
  swiss: 'LX',
  united: 'UA',
  american: 'AA',
  'american airlines': 'AA',
  'cathay pacific': 'CX',
  'japan airlines': 'JL',
  ana: 'NH',
  'korean air': 'KE',
  qantas: 'QF',
  'air canada': 'AC',
  'virgin atlantic': 'VS',
  'royal air maroc': 'AT',
  'ethiopian airlines': 'ET',
  vanir: 'VANIR',
  'vanir aviation': 'VANIR',
  'vanir fleet': 'VANIR',
};

export function resolveIataCode(airline?: string, iata?: string): string {
  if (iata && (AIRLINE_SQUARE_LOGOS[iata.toUpperCase()] || AIRLINE_RECT_LOGOS[iata.toUpperCase()])) {
    return iata.toUpperCase();
  }

  if (!airline) return 'VANIR';

  const clean = airline.trim().toLowerCase();
  if (AIRLINE_NAME_MAP[clean]) {
    return AIRLINE_NAME_MAP[clean];
  }

  for (const [key, code] of Object.entries(AIRLINE_NAME_MAP)) {
    if (clean.includes(key) || key.includes(clean)) {
      return code;
    }
  }

  return 'VANIR';
}

/**
 * Renders the authentic, genuine brand logo for any airline from the official Airhex library.
 */
export function AirlineLogo({
  airline = '',
  iata,
  size = 32,
  variant = 'square',
  style,
  imageStyle,
}: AirlineLogoProps) {
  const code = resolveIataCode(airline, iata);

  if (variant === 'rect') {
    const rectSource = AIRLINE_RECT_LOGOS[code] || AIRLINE_SQUARE_LOGOS[code] || AIRLINE_SQUARE_LOGOS.VANIR;
    const width = size * 2.8;
    const height = size;

    return (
      <View style={[styles.rectContainer, { width, height }, style]}>
        <Image
          source={rectSource}
          style={[styles.rectImage, { width, height }, imageStyle]}
          resizeMode="contain"
        />
      </View>
    );
  }

  // Square / emblem logo (preferred for cards and lists)
  // Use high-res PNG if available, fallback to Airhex square PNG
  const squareSource =
    HIGH_RES_AIRLINE_LOGOS[code] ||
    AIRLINE_SQUARE_LOGOS[code] ||
    AIRLINE_SQUARE_LOGOS.VANIR;

  return (
    <View style={[styles.squareContainer, { width: size, height: size }, style]}>
      <Image
        source={squareSource}
        style={[styles.squareImage, { width: size, height: size }, imageStyle]}
        resizeMode="contain"
      />
    </View>
  );
}

/**
 * Backward-compatible named exports
 */
export function EmiratesLogo({ size = 32 }: { size?: number }) {
  return <AirlineLogo iata="EK" size={size} />;
}

export function QatarAirwaysLogo({ size = 32 }: { size?: number }) {
  return <AirlineLogo iata="QR" size={size} />;
}

export function SaudiaLogo({ size = 32 }: { size?: number }) {
  return <AirlineLogo iata="SV" size={size} />;
}

export function BritishAirwaysLogo({ size = 32 }: { size?: number }) {
  return <AirlineLogo iata="BA" size={size} />;
}

export function LufthansaLogo({ size = 32 }: { size?: number }) {
  return <AirlineLogo iata="LH" size={size} />;
}

export function SingaporeAirlinesLogo({ size = 32 }: { size?: number }) {
  return <AirlineLogo iata="SQ" size={size} />;
}

export function DeltaLogo({ size = 32 }: { size?: number }) {
  return <AirlineLogo iata="DL" size={size} />;
}

export function EgyptAirLogo({ size = 32 }: { size?: number }) {
  return <AirlineLogo iata="MS" size={size} />;
}

export function FlydubaiLogo({ size = 32 }: { size?: number }) {
  return <AirlineLogo iata="FZ" size={size} />;
}

export function EtihadLogo({ size = 32 }: { size?: number }) {
  return <AirlineLogo iata="EY" size={size} />;
}

export function TurkishAirlinesLogo({ size = 32 }: { size?: number }) {
  return <AirlineLogo iata="TK" size={size} />;
}

export function AirFranceLogo({ size = 32 }: { size?: number }) {
  return <AirlineLogo iata="AF" size={size} />;
}

export function VanirLogo({ size = 32 }: { size?: number }) {
  return <AirlineLogo iata="VANIR" size={size} />;
}

const styles = StyleSheet.create({
  squareContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  squareImage: {
    borderRadius: 6,
  },
  rectContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  rectImage: {
    borderRadius: 4,
  },
});
