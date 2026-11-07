import {
  DRV_LOGO_DATA_URI,
  IATA_LOGO_DATA_URI,
  VANIR_SEAL_DATA_URI,
  EMIRATES_OFFICIAL_LOGO_DATA_URI,
  FOUR_SEASONS_BLACK_SVG,
} from './pdfAirlineBitmaps';

export {
  IATA_LOGO_DATA_URI,
  DRV_LOGO_DATA_URI,
  VANIR_SEAL_DATA_URI,
  EMIRATES_OFFICIAL_LOGO_DATA_URI,
  FOUR_SEASONS_BLACK_SVG,
};

export interface AirlineBrandProfile {
  code: string;
  name: string;
  iataAccountingPrefix: string;
  alliance: string;
  primaryColor: string;
  accentColor: string;
  headquarters: string;
  baggagePolicy: string;
  logoHtml: string;
}

const AIRLINE_PROFILES: Record<
  string,
  Omit<AirlineBrandProfile, 'logoHtml'>
> = {
  EK: {
    code: 'EK',
    name: 'Emirates',
    iataAccountingPrefix: '176',
    alliance: 'Skywards Global Partner',
    primaryColor: '#D71921',
    accentColor: '#C69C6D',
    headquarters: 'Emirates Group HQ, Garhoud, Dubai, UAE',
    baggagePolicy: '2 x 32 KG Checked + 2 x 7 KG Cabin',
  },
  QR: {
    code: 'QR',
    name: 'Qatar Airways',
    iataAccountingPrefix: '157',
    alliance: 'oneworld Alliance Member',
    primaryColor: '#5C0632',
    accentColor: '#8A1538',
    headquarters: 'Qatar Airways Towers, Doha, State of Qatar',
    baggagePolicy: '2 x 32 KG Checked + 15 KG Cabin',
  },
  MS: {
    code: 'MS',
    name: 'EgyptAir',
    iataAccountingPrefix: '077',
    alliance: 'Star Alliance Member',
    primaryColor: '#002855',
    accentColor: '#B4975A',
    headquarters: 'Cairo International Airport Complex, Cairo, Egypt',
    baggagePolicy: '2 x 23 KG Checked + 8 KG Cabin',
  },
  SV: {
    code: 'SV',
    name: 'Saudia (Saudi Arabian Airlines)',
    iataAccountingPrefix: '065',
    alliance: 'SkyTeam Alliance Member',
    primaryColor: '#006C35',
    accentColor: '#C5A059',
    headquarters: 'Al Khalidiyyah District, Jeddah, Saudi Arabia',
    baggagePolicy: '2 x 32 KG Checked + 12 KG Cabin',
  },
  EY: {
    code: 'EY',
    name: 'Etihad Airways',
    iataAccountingPrefix: '607',
    alliance: 'Etihad Guest Global Network',
    primaryColor: '#BD8B13',
    accentColor: '#3B2820',
    headquarters: 'Khalifa City, Abu Dhabi, United Arab Emirates',
    baggagePolicy: '2 x 32 KG Checked + 12 KG Cabin',
  },
  BA: {
    code: 'BA',
    name: 'British Airways',
    iataAccountingPrefix: '125',
    alliance: 'oneworld Alliance Member',
    primaryColor: '#075AAA',
    accentColor: '#EB2226',
    headquarters: 'Waterside, Harmondsworth, London Heathrow, UK',
    baggagePolicy: '2 x 32 KG Checked + 2 Cabin Bags',
  },
  TK: {
    code: 'TK',
    name: 'Turkish Airlines',
    iataAccountingPrefix: '235',
    alliance: 'Star Alliance Member',
    primaryColor: '#C70A0C',
    accentColor: '#1D252D',
    headquarters: 'Istanbul Airport Campus, Arnavutkoy, Istanbul, Turkiye',
    baggagePolicy: '2 x 30 KG Checked + 8 KG Cabin',
  },
  LH: {
    code: 'LH',
    name: 'Lufthansa',
    iataAccountingPrefix: '220',
    alliance: 'Star Alliance Founder',
    primaryColor: '#05164D',
    accentColor: '#FFAD00',
    headquarters: 'Frankfurt Airport Center, Frankfurt am Main, Germany',
    baggagePolicy: '2 x 32 KG Checked + 2 x 8 KG Cabin',
  },
  AF: {
    code: 'AF',
    name: 'Air France',
    iataAccountingPrefix: '057',
    alliance: 'SkyTeam Alliance Founder',
    primaryColor: '#002157',
    accentColor: '#FF0000',
    headquarters: '45 Rue de Paris, Roissy CDG, France',
    baggagePolicy: '2 x 32 KG Checked + 18 KG Cabin',
  },
  LX: {
    code: 'LX',
    name: 'SWISS International Air Lines',
    iataAccountingPrefix: '724',
    alliance: 'Star Alliance Member',
    primaryColor: '#CC0000',
    accentColor: '#1E293B',
    headquarters: 'EuroAirport Basel-Mulhouse & Zurich Kloten, Switzerland',
    baggagePolicy: '2 x 32 KG Checked + 2 x 8 KG Cabin',
  },
  SQ: {
    code: 'SQ',
    name: 'Singapore Airlines',
    iataAccountingPrefix: '618',
    alliance: 'Star Alliance Member',
    primaryColor: '#00266B',
    accentColor: '#F59E0B',
    headquarters: 'Airline House, Changi Airport, Singapore',
    baggagePolicy: '2 x 32 KG Checked + 2 x 7 KG Cabin',
  },
  FZ: {
    code: 'FZ',
    name: 'flydubai',
    iataAccountingPrefix: '141',
    alliance: 'Emirates Skywards Partner',
    primaryColor: '#0064A2',
    accentColor: '#F37021',
    headquarters: 'Dubai International Airport T2, Dubai, UAE',
    baggagePolicy: '40 KG Checked + 14 KG Business Cabin',
  },
  GF: {
    code: 'GF',
    name: 'Gulf Air',
    iataAccountingPrefix: '072',
    alliance: 'Falcon Gold Carrier',
    primaryColor: '#8B6F4E',
    accentColor: '#101820',
    headquarters: 'Muharraq International Complex, Kingdom of Bahrain',
    baggagePolicy: '2 x 32 KG Checked + 9 KG Cabin',
  },
  RJ: {
    code: 'RJ',
    name: 'Royal Jordanian',
    iataAccountingPrefix: '512',
    alliance: 'oneworld Alliance Member',
    primaryColor: '#231F20',
    accentColor: '#C8102E',
    headquarters: 'Amman Queen Alia International, Hashemite Kingdom of Jordan',
    baggagePolicy: '2 x 30 KG Checked + 2 x 7 KG Cabin',
  },
  KL: {
    code: 'KL',
    name: 'KLM Royal Dutch Airlines',
    iataAccountingPrefix: '074',
    alliance: 'SkyTeam Alliance Member',
    primaryColor: '#00A1DE',
    accentColor: '#003145',
    headquarters: 'Amsterdamseweg 55, Amstelveen, Netherlands',
    baggagePolicy: '2 x 32 KG Checked + 18 KG Cabin',
  },
  AA: {
    code: 'AA',
    name: 'American Airlines',
    iataAccountingPrefix: '001',
    alliance: 'oneworld Alliance Founder',
    primaryColor: '#0078D2',
    accentColor: '#C8102E',
    headquarters: 'Skyview Campus, Fort Worth, Texas, USA',
    baggagePolicy: '2 x 32 KG Checked + 1 Carry-on',
  },
  DL: {
    code: 'DL',
    name: 'Delta Air Lines',
    iataAccountingPrefix: '006',
    alliance: 'SkyTeam Alliance Founder',
    primaryColor: '#003366',
    accentColor: '#E01933',
    headquarters: 'Hartsfield-Jackson Blvd, Atlanta, Georgia, USA',
    baggagePolicy: '2 x 32 KG Checked + 1 Carry-on',
  },
  KU: {
    code: 'KU',
    name: 'Kuwait Airways',
    iataAccountingPrefix: '229',
    alliance: 'Oasis Club Carrier',
    primaryColor: '#003A70',
    accentColor: '#69B3E7',
    headquarters: 'Kuwait International Airport, Farwaniya, State of Kuwait',
    baggagePolicy: '2 x 32 KG Checked + 11 KG Cabin',
  },
  WY: {
    code: 'WY',
    name: 'Oman Air',
    iataAccountingPrefix: '910',
    alliance: 'oneworld Connect Member',
    primaryColor: '#005A8B',
    accentColor: '#B5985A',
    headquarters: 'Muscat International Airport, Sultanate of Oman',
    baggagePolicy: '2 x 30 KG Checked + 2 x 7 KG Cabin',
  },
  XY: {
    code: 'XY',
    name: 'flynas',
    iataAccountingPrefix: '593',
    alliance: 'nasmiles Carrier',
    primaryColor: '#00A79D',
    accentColor: '#662D91',
    headquarters: 'Riyadh King Khalid Airport Road, Saudi Arabia',
    baggagePolicy: '2 x 23 KG Checked + 7 KG Cabin',
  },
  G9: {
    code: 'G9',
    name: 'Air Arabia',
    iataAccountingPrefix: '514',
    alliance: 'AirRewards Group',
    primaryColor: '#DA291C',
    accentColor: '#333F48',
    headquarters: 'Sharjah International Airport, UAE',
    baggagePolicy: '30 KG Checked + 10 KG Cabin',
  },
  SM: {
    code: 'SM',
    name: 'Air Cairo',
    iataAccountingPrefix: '653',
    alliance: 'EgyptAir Partner Carrier',
    primaryColor: '#004B87',
    accentColor: '#E31837',
    headquarters: 'Sheraton Heliopolis, Cairo, Egypt',
    baggagePolicy: '30 KG Checked + 7 KG Cabin',
  },
};

function buildAirlineVectorLogoHtml(
  code: string,
  name: string,
  primaryColor: string,
  accentColor: string,
): string {
  switch (code) {
    case 'EK':
      return `<div style="display:flex;align-items:center;gap:12px;">
        <img src="${EMIRATES_OFFICIAL_LOGO_DATA_URI}" alt="Emirates" style="height:44px;max-width:140px;object-fit:contain;display:block;" />
      </div>`;
    case 'QR':
      return `<div style="display:flex;align-items:center;gap:11px;">
        <svg width="48" height="48" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="28" cy="28" r="26" fill="#5C0632" stroke="#C5A059" stroke-width="1.6"/>
          <path d="M18 40C21 33 26 29 35 27L39 22L33 24C26 19 20 12 16 9C19 16 23 22 28 26C21 29 17 34 15 40H18Z" fill="#FFFFFF"/>
          <path d="M23 10C26 16 29 21 34 25" stroke="#E2C385" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <div>
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:18.5px;font-weight:700;color:#5C0632;letter-spacing:2.2px;line-height:1.05;">QATAR AIRWAYS</div>
          <div style="font-size:10px;font-weight:800;color:#8A1538;margin-top:3px;letter-spacing:1.2px;">QATAR AIRWAYS • DOHA • ONEWORLD</div>
        </div>
      </div>`;
    case 'MS':
      return `<div style="display:flex;align-items:center;gap:11px;">
        <svg width="48" height="48" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="28" cy="28" r="26" fill="#002855" stroke="#B4975A" stroke-width="2"/>
          <circle cx="34" cy="17" r="4.5" fill="#B4975A"/>
          <path d="M12 36C20 35 28 30 42 19C38 28 31 35 18 40L12 36Z" fill="#FFFFFF"/>
          <path d="M15 42C24 41 33 36 44 26" stroke="#B4975A" stroke-width="2.2" stroke-linecap="round"/>
        </svg>
        <div>
          <div style="font-size:19px;font-weight:900;color:#002855;letter-spacing:2.2px;line-height:1.05;">EGYPTAIR</div>
          <div style="font-size:10px;font-weight:800;color:#9A7B38;margin-top:3px;letter-spacing:1px;">EGYPTAIR • STAR ALLIANCE</div>
        </div>
      </div>`;
    case 'SV':
      return `<div style="display:flex;align-items:center;gap:11px;">
        <svg width="48" height="48" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="50" height="50" rx="11" fill="#006C35" stroke="#C5A059" stroke-width="2"/>
          <path d="M28 13V32M28 19C23 15 18 16 16 19M28 19C33 15 38 16 40 19M28 23C24 20 20 21 18 24M28 23C32 20 36 21 38 24" stroke="#E5C887" stroke-width="2.1" stroke-linecap="round"/>
          <path d="M17 40L39 32M39 40L17 32" stroke="#FFFFFF" stroke-width="2.1" stroke-linecap="round"/>
        </svg>
        <div>
          <div style="font-size:20px;font-weight:900;color:#006C35;letter-spacing:2.4px;line-height:1.05;">SAUDIA</div>
          <div style="font-size:10px;font-weight:800;color:#9A7B38;margin-top:3px;letter-spacing:1px;">SAUDIA • SKYTEAM ALLIANCE</div>
        </div>
      </div>`;
    case 'EY':
      return `<div style="display:flex;align-items:center;gap:11px;">
        <svg width="48" height="48" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="28,4 52,28 28,52 4,28" fill="#3B2820" stroke="#BD8B13" stroke-width="2"/>
          <polygon points="28,8 48,28 28,28" fill="#D4AF37"/>
          <polygon points="28,28 48,28 28,48" fill="#9E7312"/>
          <polygon points="8,28 28,8 28,28" fill="#BD8B13"/>
        </svg>
        <div>
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:18.5px;font-weight:700;color:#3B2820;letter-spacing:2.4px;line-height:1.05;">ETIHAD AIRWAYS</div>
          <div style="font-size:10px;font-weight:800;color:#9E7312;margin-top:3px;letter-spacing:1.1px;">ETIHAD AIRWAYS • ABU DHABI</div>
        </div>
      </div>`;
    case 'TK':
      return `<div style="display:flex;align-items:center;gap:11px;">
        <svg width="46" height="46" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="28" cy="28" r="26" fill="#C70A0C"/>
          <path d="M13 33C22 33 30 27 42 15C38 26 32 34 19 40C23 36 24 34 13 33Z" fill="#FFFFFF"/>
        </svg>
        <div>
          <div style="font-size:18px;font-weight:900;color:#1D252D;letter-spacing:1.8px;line-height:1.05;">TURKISH AIRLINES</div>
          <div style="font-size:9.5px;font-weight:800;color:#C70A0C;margin-top:3px;letter-spacing:1.2px;">STAR ALLIANCE MEMBER</div>
        </div>
      </div>`;
    case 'BA':
      return `<div style="display:flex;align-items:center;gap:11px;">
        <svg width="52" height="44" viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 20C22 14 44 13 58 19C43 20 24 23 10 29L6 20Z" fill="#075AAA"/>
          <path d="M10 29C25 24 44 23 56 30C40 31 22 33 14 36L10 29Z" fill="#EB2226"/>
        </svg>
        <div>
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:700;color:#075AAA;letter-spacing:1.8px;line-height:1.05;">BRITISH AIRWAYS</div>
          <div style="font-size:9.5px;font-weight:800;color:#EB2226;margin-top:3px;letter-spacing:1.2px;">ONEWORLD ALLIANCE</div>
        </div>
      </div>`;
    case 'LH':
      return `<div style="display:flex;align-items:center;gap:11px;">
        <svg width="46" height="46" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="28" cy="28" r="25" fill="#05164D" stroke="#FFAD00" stroke-width="2.4"/>
          <path d="M12 31L43 19L29 30L41 33L18 35L12 31Z" fill="#FFAD00"/>
        </svg>
        <div>
          <div style="font-size:20px;font-weight:900;color:#05164D;letter-spacing:1.4px;line-height:1.05;">Lufthansa</div>
          <div style="font-size:9.5px;font-weight:800;color:#B47B00;margin-top:3px;letter-spacing:1.2px;">STAR ALLIANCE FOUNDER</div>
        </div>
      </div>`;
    default:
      return `<div style="display:flex;align-items:center;gap:11px;">
        <svg width="46" height="46" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="50" height="50" rx="10" fill="${primaryColor}" stroke="${accentColor}" stroke-width="2"/>
          <path d="M13 35C22 33 32 26 43 15C39 25 32 33 21 38L13 35Z" fill="${accentColor}" opacity="0.9"/>
          <text x="28" y="31" text-anchor="middle" fill="#FFFFFF" font-family="Arial,sans-serif" font-size="14" font-weight="900" letter-spacing="1">${escapeHtml(code)}</text>
        </svg>
        <div>
          <div style="font-size:18px;font-weight:900;color:${primaryColor};letter-spacing:0.8px;line-height:1.1;">${escapeHtml(name)}</div>
          <div style="font-size:9.5px;font-weight:800;color:${accentColor};margin-top:2px;letter-spacing:1.2px;">IATA CARRIER CODE: ${escapeHtml(code)}</div>
        </div>
      </div>`;
  }
}

export function resolveAirlineBrand(
  airlineNameOrCode?: string,
  explicitCode?: string,
): AirlineBrandProfile {
  const rawName = (airlineNameOrCode || '').trim();
  const upperCode = (explicitCode || '').trim().toUpperCase();
  const lower = rawName.toLowerCase();

  let matchedCode = upperCode;
  if (!matchedCode || matchedCode.length !== 2) {
    if (/^[A-Z0-9]{2}$/.test(rawName.toUpperCase())) {
      matchedCode = rawName.toUpperCase();
    } else if (lower.includes('emirates') || lower.includes('إمارات')) matchedCode = 'EK';
    else if (lower.includes('qatar') || lower.includes('قطر')) matchedCode = 'QR';
    else if (lower.includes('egypt') || lower.includes('مصر')) matchedCode = 'MS';
    else if (lower.includes('saudia') || lower.includes('سعودي')) matchedCode = 'SV';
    else if (lower.includes('etihad') || lower.includes('اتحاد')) matchedCode = 'EY';
    else if (lower.includes('british')) matchedCode = 'BA';
    else if (lower.includes('turkish') || lower.includes('تركي')) matchedCode = 'TK';
    else if (lower.includes('lufthansa') || lower.includes('لوفتهانزا')) matchedCode = 'LH';
    else if (lower.includes('air france') || lower.includes('فرنس')) matchedCode = 'AF';
    else if (lower.includes('swiss') || lower.includes('سويسر')) matchedCode = 'LX';
    else if (lower.includes('singapore')) matchedCode = 'SQ';
    else if (lower.includes('flydubai') || lower.includes('فلاي دبي')) matchedCode = 'FZ';
    else if (lower.includes('gulf') || lower.includes('خليج')) matchedCode = 'GF';
    else if (lower.includes('jordan') || lower.includes('أردن')) matchedCode = 'RJ';
    else if (lower.includes('klm')) matchedCode = 'KL';
    else if (lower.includes('american')) matchedCode = 'AA';
    else if (lower.includes('delta')) matchedCode = 'DL';
    else if (lower.includes('kuwait') || lower.includes('كويت')) matchedCode = 'KU';
    else if (lower.includes('oman') || lower.includes('عمان')) matchedCode = 'WY';
    else if (lower.includes('flynas') || lower.includes('ناس')) matchedCode = 'XY';
    else if (lower.includes('arabia') || lower.includes('عربية')) matchedCode = 'G9';
    else if (lower.includes('air cairo')) matchedCode = 'SM';
    else matchedCode = 'EK';
  }

  const base = AIRLINE_PROFILES[matchedCode] || {
    code: matchedCode,
    name: rawName && rawName.length > 2 ? rawName : `${matchedCode} International Airlines`,
    iataAccountingPrefix: '176',
    alliance: 'IATA Accredited Carrier',
    primaryColor: '#1C1917',
    accentColor: '#C5A059',
    headquarters: 'International Aviation Terminal',
    baggagePolicy: '2 x 23 KG Checked + 7 KG Cabin',
  };

  const finalName =
    rawName && rawName.length > 2 && !AIRLINE_PROFILES[matchedCode]
      ? rawName
      : base.name;

  const logoHtml = buildAirlineVectorLogoHtml(
    base.code,
    finalName,
    base.primaryColor,
    base.accentColor,
  );

  return {
    ...base,
    name: finalName,
    logoHtml,
  };
}

export interface HotelBrandProfile {
  brandName: string;
  groupName: string;
  primaryColor: string;
  accentColor: string;
  crsSystem: string;
  address: string;
  phone: string;
  checkInTime: string;
  checkOutTime: string;
  logoSvgHtml: string;
}

export function resolveHotelBrand(
  hotelName?: string,
  city?: string,
): HotelBrandProfile {
  const name = (hotelName || 'The Ritz-Carlton').trim();
  const lower = name.toLowerCase();
  const safeCity = (city || 'Dubai, United Arab Emirates').trim();

  if (lower.includes('ritz')) {
    return {
      brandName: 'THE RITZ-CARLTON',
      groupName: 'Marriott International Luxury Group',
      primaryColor: '#0D131A',
      accentColor: '#C5A059',
      crsSystem: 'MARSHA CRS • GDS AMADEUS RT',
      address: `Royal Boulevard, ${safeCity}`,
      phone: '+971 4 399 4000 / Global Desk +1 800 542 8680',
      checkInTime: '15:00 HRS (Guaranteed Early VIP 12:00)',
      checkOutTime: '12:00 HRS (Late Royal Checkout 14:00)',
      logoSvgHtml: `
        <div style="display:flex;align-items:center;gap:12px;">
          <svg width="52" height="52" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="30" stroke="#C5A059" stroke-width="2" fill="#0D131A"/>
            <circle cx="32" cy="32" r="26" stroke="#C5A059" stroke-width="0.8" stroke-dasharray="2 2"/>
            <path d="M20 24L25 16L32 22L39 16L44 24H20Z" fill="#C5A059"/>
            <path d="M22 28H42V30C42 38 37 44 32 47C27 44 22 38 22 30V28Z" stroke="#C5A059" stroke-width="1.8" fill="none"/>
            <text x="32" y="39" text-anchor="middle" fill="#C5A059" font-family="Georgia,serif" font-size="11" font-weight="bold">RC</text>
          </svg>
          <div>
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:17px;font-weight:700;letter-spacing:2.4px;color:#0D131A;">THE RITZ-CARLTON</div>
            <div style="font-size:8.5px;letter-spacing:2px;color:#8C6D2F;font-weight:700;text-transform:uppercase;margin-top:2px;">HOTELS &amp; PALACE RESORTS</div>
          </div>
        </div>`,
    };
  }

  if (lower.includes('four seasons')) {
    return {
      brandName: 'FOUR SEASONS',
      groupName: 'Four Seasons Hotels and Resorts',
      primaryColor: '#111827',
      accentColor: '#B5945B',
      crsSystem: 'FOUR SEASONS CENTRAL RESERVATIONS • SABRE FS',
      address: `Waterfront Diplomatic Quarter, ${safeCity}`,
      phone: '+41 22 908 7000 / Concierge +971 4 270 7777',
      checkInTime: '15:00 HRS',
      checkOutTime: '12:00 HRS',
      logoSvgHtml: `
        <div style="margin-bottom:8px;">
          ${FOUR_SEASONS_BLACK_SVG}
        </div>`,
    };
  }

  if (lower.includes('burj al arab') || lower.includes('jumeirah')) {
    return {
      brandName: 'JUMEIRAH',
      groupName: 'Jumeirah International Hospitality LLC',
      primaryColor: '#0C2340',
      accentColor: '#D4AF37',
      crsSystem: 'JUMEIRAH ONE CRS • GALILEO JT',
      address: `Jumeirah Beach Road, Umm Suqeim 3, ${safeCity}`,
      phone: '+971 4 301 7777 / Suite Desk +971 4 366 5000',
      checkInTime: '15:00 HRS (Private Rolls-Royce / Suite Check-In)',
      checkOutTime: '12:00 HRS',
      logoSvgHtml: `
        <div style="display:flex;align-items:center;gap:12px;">
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="29" fill="#0C2340" stroke="#D4AF37" stroke-width="2"/>
            <path d="M27 12V50M27 14C41 20 45 34 27 46" stroke="#D4AF37" stroke-width="2.6" stroke-linecap="round"/>
            <path d="M18 50H46" stroke="#D4AF37" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <div>
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:700;letter-spacing:2.8px;color:#0C2340;">JUMEIRAH</div>
            <div style="font-size:8.5px;letter-spacing:2px;color:#9A7B2C;font-weight:700;text-transform:uppercase;margin-top:2px;">PALACES &amp; ICONIC SUITES</div>
          </div>
        </div>`,
    };
  }

  if (lower.includes('st. regis') || lower.includes('st regis') || lower.includes('marriott')) {
    return {
      brandName: lower.includes('regis') ? 'THE ST. REGIS' : 'MARRIOTT LUXURY',
      groupName: 'Marriott International, Inc.',
      primaryColor: '#1C1917',
      accentColor: '#A68446',
      crsSystem: 'MARRIOTT BONVOY MARSHA CRS',
      address: `Grand Corniche Avenue, ${safeCity}`,
      phone: '+1 888 625 4988 / Property +971 2 694 4444',
      checkInTime: '15:00 HRS (Signature Butler Welcome)',
      checkOutTime: '12:00 HRS',
      logoSvgHtml: `
        <div style="display:flex;align-items:center;gap:12px;">
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="56" height="56" rx="28" fill="#1C1917" stroke="#A68446" stroke-width="2"/>
            <text x="32" y="38" text-anchor="middle" fill="#E5C887" font-family="Georgia,serif" font-size="18" font-weight="bold">SR</text>
          </svg>
          <div>
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:17px;font-weight:700;letter-spacing:2.4px;color:#1C1917;">${lower.includes('regis') ? 'THE ST. REGIS' : 'MARRIOTT INTERNATIONAL'}</div>
            <div style="font-size:8.5px;letter-spacing:2px;color:#8C6D2F;font-weight:700;text-transform:uppercase;margin-top:2px;">LUXURY HOSPITALITY COLLECTION</div>
          </div>
        </div>`,
    };
  }

  if (lower.includes('intercontinental') || lower.includes('ihg')) {
    return {
      brandName: 'INTERCONTINENTAL',
      groupName: 'IHG Hotels & Resorts Luxury & Lifestyle',
      primaryColor: '#1E293B',
      accentColor: '#B8860B',
      crsSystem: 'IHG CONCERTO CRS • AMADEUS IC',
      address: `Central Esplanade, ${safeCity}`,
      phone: '+44 20 7409 3131 / Reservations +800 424 68357',
      checkInTime: '15:00 HRS',
      checkOutTime: '12:00 HRS',
      logoSvgHtml: `
        <div style="display:flex;align-items:center;gap:12px;">
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="28" fill="#1E293B" stroke="#D4AF37" stroke-width="2"/>
            <circle cx="32" cy="32" r="22" stroke="#D4AF37" stroke-width="1"/>
            <text x="32" y="39" text-anchor="middle" fill="#D4AF37" font-family="Georgia,serif" font-size="22" font-weight="bold">I</text>
          </svg>
          <div>
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:16px;font-weight:700;letter-spacing:2.2px;color:#1E293B;">INTERCONTINENTAL</div>
            <div style="font-size:8.5px;letter-spacing:2px;color:#9A7B2C;font-weight:700;text-transform:uppercase;margin-top:2px;">HOTELS &amp; RESORTS • IHG</div>
          </div>
        </div>`,
    };
  }

  if (lower.includes('hilton') || lower.includes('waldorf') || lower.includes('conrad')) {
    const title = lower.includes('waldorf') ? 'WALDORF ASTORIA' : lower.includes('conrad') ? 'CONRAD HOTELS' : 'HILTON HOTELS & RESORTS';
    return {
      brandName: title,
      groupName: 'Hilton Worldwide Holdings Inc.',
      primaryColor: '#1C1917',
      accentColor: '#C8A24B',
      crsSystem: 'HILTON ONQ CRS • GDS HL',
      address: `Grand Imperial Avenue, ${safeCity}`,
      phone: '+1 800 445 8667 / Front Desk +971 4 511 7777',
      checkInTime: '15:00 HRS',
      checkOutTime: '12:00 HRS',
      logoSvgHtml: `
        <div style="display:flex;align-items:center;gap:12px;">
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="56" height="56" rx="10" fill="#1C1917" stroke="#C8A24B" stroke-width="2"/>
            <text x="32" y="40" text-anchor="middle" fill="#C8A24B" font-family="Georgia,serif" font-size="22" font-weight="bold">${lower.includes('waldorf') ? 'WA' : 'H'}</text>
          </svg>
          <div>
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:16px;font-weight:700;letter-spacing:2.2px;color:#1C1917;">${title}</div>
            <div style="font-size:8.5px;letter-spacing:2px;color:#8C6D2F;font-weight:700;text-transform:uppercase;margin-top:2px;">HILTON LUXURY GROUP</div>
          </div>
        </div>`,
    };
  }

  if (lower.includes('grande bretagne') || lower.includes('luxury collection') || lower.includes('gritti') || lower.includes('imperial vienna')) {
    return {
      brandName: 'THE LUXURY COLLECTION',
      groupName: 'Marriott International Luxury Group',
      primaryColor: '#0A192F',
      accentColor: '#C5A059',
      crsSystem: 'MARSHA CRS • GDS LC',
      address: `Historic Royal Boulevard, ${safeCity}`,
      phone: '+30 210 3330000 / Global Desk +1 800 325 3589',
      checkInTime: '15:00 HRS (VIP Concierge Check-In)',
      checkOutTime: '12:00 HRS',
      logoSvgHtml: `
        <div style="display:flex;align-items:center;gap:12px;">
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="32" cy="32" rx="30" ry="26" fill="#0A192F" stroke="#C5A059" stroke-width="2"/>
            <path d="M22 20L27 14L32 18L37 14L42 20H22Z" fill="#C5A059"/>
            <text x="32" y="38" text-anchor="middle" fill="#E5C887" font-family="Georgia,serif" font-size="14" font-weight="bold">LC</text>
            <path d="M18 42C24 45 40 45 46 42" stroke="#C5A059" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
          <div>
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:16px;font-weight:700;letter-spacing:2.2px;color:#0A192F;">THE LUXURY COLLECTION</div>
            <div style="font-size:8.5px;letter-spacing:2px;color:#8C6D2F;font-weight:700;text-transform:uppercase;margin-top:2px;">HOTELS &amp; PALACES OF THE WORLD</div>
          </div>
        </div>`,
    };
  }

  if (lower.includes('canaves') || lower.includes('katikies') || lower.includes('cavo tagoo') || lower.includes('grace hotel') || lower.includes('amirandes') || lower.includes('grecotel') || lower.includes('lindos') || lower.includes('greece') || lower.includes('santorini')) {
    const greekBrand = lower.includes('canaves')
      ? 'CANAVES OIA LUXURY'
      : lower.includes('katikies')
      ? 'KATIKIES HOTELS'
      : lower.includes('cavo tagoo')
      ? 'CAVO TAGOO MYKONOS'
      : lower.includes('grecotel') || lower.includes('amirandes')
      ? 'GRECOTEL LUXURY RESORTS'
      : 'GREEK CYCLADIC LUXURY';
    return {
      brandName: greekBrand,
      groupName: 'Leading Hotels & Resorts of Greece',
      primaryColor: '#002B49',
      accentColor: '#D4AF37',
      crsSystem: 'LHW / SABRE GREECE • GDS LW',
      address: `Caldera Cliffside & Aegean Shore, ${safeCity}`,
      phone: '+30 22860 71453 / Concierge Desk Direct',
      checkInTime: '15:00 HRS (Private Yacht/Helipad Welcome)',
      checkOutTime: '12:00 HRS',
      logoSvgHtml: `
        <div style="display:flex;align-items:center;gap:12px;">
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="28" fill="#002B49" stroke="#D4AF37" stroke-width="2"/>
            <circle cx="32" cy="32" r="22" stroke="#D4AF37" stroke-width="1" stroke-dasharray="3 2"/>
            <path d="M22 34C26 28 38 28 42 34" stroke="#D4AF37" stroke-width="2" stroke-linecap="round"/>
            <circle cx="32" cy="24" r="5" fill="#D4AF37"/>
          </svg>
          <div>
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:16px;font-weight:700;letter-spacing:2px;color:#002B49;">${greekBrand}</div>
            <div style="font-size:8.5px;letter-spacing:2px;color:#8C6D2F;font-weight:700;text-transform:uppercase;margin-top:2px;">AEGEAN &amp; CYCLADIC PALACE RESORTS</div>
          </div>
        </div>`,
    };
  }

  if (lower.includes('kempinski') || lower.includes('çırağan') || lower.includes('adlon')) {
    return {
      brandName: 'KEMPINSKI HOTELS',
      groupName: 'Kempinski Hotels S.A. • Est. 1897',
      primaryColor: '#101924',
      accentColor: '#C5A059',
      crsSystem: 'DISCOVERY GHA • GDS KI',
      address: `Imperial Palace Boulevard, ${safeCity}`,
      phone: '+41 22 809 8888 / Palace Desk +90 212 326 4646',
      checkInTime: '15:00 HRS (White-Glove Butler Welcome)',
      checkOutTime: '12:00 HRS',
      logoSvgHtml: `
        <div style="display:flex;align-items:center;gap:12px;">
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="56" height="56" rx="8" fill="#101924" stroke="#C5A059" stroke-width="2"/>
            <path d="M20 22H44M20 32H38M20 42H44" stroke="#C5A059" stroke-width="2" stroke-linecap="round"/>
            <path d="M32 16L34 20H30L32 16Z" fill="#C5A059"/>
          </svg>
          <div>
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:16px;font-weight:700;letter-spacing:2.4px;color:#101924;">KEMPINSKI</div>
            <div style="font-size:8.5px;letter-spacing:2px;color:#8C6D2F;font-weight:700;text-transform:uppercase;margin-top:2px;">HOTELIERS SINCE 1897 • PALACE SUITES</div>
          </div>
        </div>`,
    };
  }

  if (lower.includes('mandarin oriental')) {
    return {
      brandName: 'MANDARIN ORIENTAL',
      groupName: 'Mandarin Oriental Hotel Group',
      primaryColor: '#1F1610',
      accentColor: '#C89D4B',
      crsSystem: 'FANS OF M.O. • GDS MO',
      address: `Waterfront Promenade, ${safeCity}`,
      phone: '+852 2895 9288 / Global Direct +44 20 7908 7888',
      checkInTime: '15:00 HRS',
      checkOutTime: '12:00 HRS',
      logoSvgHtml: `
        <div style="display:flex;align-items:center;gap:12px;">
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="28" fill="#1F1610" stroke="#C89D4B" stroke-width="2"/>
            <path d="M32 44C20 30 14 20 32 14C50 20 44 30 32 44Z" fill="#C89D4B"/>
            <path d="M32 14V44M22 20L32 44M42 20L32 44" stroke="#1F1610" stroke-width="1.2"/>
          </svg>
          <div>
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:15.5px;font-weight:700;letter-spacing:2px;color:#1F1610;">MANDARIN ORIENTAL</div>
            <div style="font-size:8.5px;letter-spacing:2px;color:#8C6D2F;font-weight:700;text-transform:uppercase;margin-top:2px;">THE HOTEL GROUP • LUXURY RESIDENCES</div>
          </div>
        </div>`,
    };
  }

  if (lower.includes('peninsula')) {
    return {
      brandName: 'THE PENINSULA',
      groupName: 'The Hongkong and Shanghai Hotels, Limited',
      primaryColor: '#0B1E28',
      accentColor: '#D4AF37',
      crsSystem: 'PENINSULA TIME CRS • GDS PH',
      address: `Waterfront Esplanade, ${safeCity}`,
      phone: '+852 2920 2888 / Concierge Direct',
      checkInTime: 'Peninsula Time (Flexible 24H)',
      checkOutTime: 'Peninsula Time (Flexible 24H)',
      logoSvgHtml: `
        <div style="display:flex;align-items:center;gap:12px;">
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="28" fill="#0B1E28" stroke="#D4AF37" stroke-width="2"/>
            <path d="M18 36C24 24 40 24 46 36M32 20V42" stroke="#D4AF37" stroke-width="2.2" stroke-linecap="round"/>
          </svg>
          <div>
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:16px;font-weight:700;letter-spacing:2.2px;color:#0B1E28;">THE PENINSULA</div>
            <div style="font-size:8.5px;letter-spacing:2px;color:#8C6D2F;font-weight:700;text-transform:uppercase;margin-top:2px;">HOTELS • HERITAGE &amp; ROLLS-ROYCE</div>
          </div>
        </div>`,
    };
  }

  if (lower.includes('rosewood') || lower.includes('crillon') || lower.includes('carlyle') || lower.includes('villa magna')) {
    return {
      brandName: 'ROSEWOOD',
      groupName: 'Rosewood Hotel Group',
      primaryColor: '#18181B',
      accentColor: '#B5945B',
      crsSystem: 'ROSEWOOD CENTRAL • GDS RW',
      address: `Historic Place, ${safeCity}`,
      phone: '+1 888 767 3966 / Palace Direct',
      checkInTime: '15:00 HRS',
      checkOutTime: '12:00 HRS',
      logoSvgHtml: `
        <div style="display:flex;align-items:center;gap:12px;">
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="28" fill="#18181B" stroke="#B5945B" stroke-width="2"/>
            <circle cx="32" cy="32" r="18" stroke="#B5945B" stroke-width="1"/>
            <path d="M26 26L32 32L38 26M32 32V42" stroke="#B5945B" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <div>
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:16px;font-weight:700;letter-spacing:2.4px;color:#18181B;">ROSEWOOD</div>
            <div style="font-size:8.5px;letter-spacing:2px;color:#8C6D2F;font-weight:700;text-transform:uppercase;margin-top:2px;">HOTELS &amp; RESORTS • SENSE OF PLACE</div>
          </div>
        </div>`,
    };
  }

  if (lower.includes('belmond') || lower.includes('cipriani') || lower.includes('residencia')) {
    return {
      brandName: 'BELMOND',
      groupName: 'Belmond Ltd. • LVMH Moët Hennessy Louis Vuitton',
      primaryColor: '#0F2027',
      accentColor: '#C5A059',
      crsSystem: 'BELMOND BELLINI CRS • GDS BL',
      address: `Lagoon Shore, ${safeCity}`,
      phone: '+44 20 7921 4000 / Reservations Desk',
      checkInTime: '15:00 HRS (Private Riva Launch)',
      checkOutTime: '12:00 HRS',
      logoSvgHtml: `
        <div style="display:flex;align-items:center;gap:12px;">
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="56" height="56" rx="10" fill="#0F2027" stroke="#C5A059" stroke-width="2"/>
            <text x="32" y="39" text-anchor="middle" fill="#E6C986" font-family="Georgia,serif" font-size="20" font-weight="bold">B</text>
          </svg>
          <div>
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:16px;font-weight:700;letter-spacing:2.4px;color:#0F2027;">BELMOND</div>
            <div style="font-size:8.5px;letter-spacing:2px;color:#8C6D2F;font-weight:700;text-transform:uppercase;margin-top:2px;">LEGENDARY HOTELS &amp; TRAINS • LVMH</div>
          </div>
        </div>`,
    };
  }

  if (lower.includes('sacher')) {
    return {
      brandName: 'HOTEL SACHER',
      groupName: 'Sacher Hotels Betriebsgesellschaft mbH',
      primaryColor: '#58111A',
      accentColor: '#C5A059',
      crsSystem: 'LHW / OPERA PMS • GDS LW',
      address: `Philharmoniker Strasse 4, ${safeCity}`,
      phone: '+43 1 514560 / Concierge Desk Direct',
      checkInTime: '15:00 HRS',
      checkOutTime: '12:00 HRS',
      logoSvgHtml: `
        <div style="display:flex;align-items:center;gap:12px;">
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="32" cy="32" rx="28" ry="26" fill="#58111A" stroke="#C5A059" stroke-width="2"/>
            <text x="32" y="39" text-anchor="middle" fill="#E6C986" font-family="Georgia,serif" font-size="18" font-weight="bold">S</text>
          </svg>
          <div>
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:16px;font-weight:700;letter-spacing:2px;color:#58111A;">HOTEL SACHER</div>
            <div style="font-size:8.5px;letter-spacing:2px;color:#8C6D2F;font-weight:700;text-transform:uppercase;margin-top:2px;">WIEN • SINCE 1876 • IMPERIAL HERITAGE</div>
          </div>
        </div>`,
    };
  }

  if (lower.includes('edition')) {
    return {
      brandName: 'THE EDITION',
      groupName: 'EDITION Hotels • Marriott Luxury Lifestyle',
      primaryColor: '#121212',
      accentColor: '#D4AF37',
      crsSystem: 'MARRIOTT BONVOY CRS • GDS ED',
      address: `Yalıkavak Bay Coast, ${safeCity}`,
      phone: '+90 252 311 3131 / Front Desk',
      checkInTime: '15:00 HRS',
      checkOutTime: '12:00 HRS',
      logoSvgHtml: `
        <div style="display:flex;align-items:center;gap:12px;">
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="56" height="56" fill="#121212" stroke="#D4AF37" stroke-width="1.8"/>
            <text x="32" y="39" text-anchor="middle" fill="#FFFFFF" font-family="'Times New Roman',serif" font-size="13" font-style="italic">EDITION</text>
          </svg>
          <div>
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:16px;font-weight:700;letter-spacing:3px;color:#121212;">THE EDITION</div>
            <div style="font-size:8.5px;letter-spacing:2px;color:#8C6D2F;font-weight:700;text-transform:uppercase;margin-top:2px;">LUXURY LIFESTYLE RESORTS</div>
          </div>
        </div>`,
    };
  }

  if (lower.includes('oetker') || lower.includes('bristol') || lower.includes('woodward')) {
    return {
      brandName: 'OETKER COLLECTION',
      groupName: 'Oetker Hotel Management AG',
      primaryColor: '#111827',
      accentColor: '#B4975A',
      crsSystem: 'OETKER PEARL PARTNER • GDS OE',
      address: `Palace Quarter, ${safeCity}`,
      phone: '+49 7221 9000 / Concierge Direct',
      checkInTime: '15:00 HRS',
      checkOutTime: '12:00 HRS',
      logoSvgHtml: `
        <div style="display:flex;align-items:center;gap:12px;">
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="28" fill="#111827" stroke="#B4975A" stroke-width="2"/>
            <circle cx="32" cy="32" r="22" stroke="#B4975A" stroke-width="1" stroke-dasharray="3 2"/>
            <text x="32" y="38" text-anchor="middle" fill="#E6C986" font-family="Georgia,serif" font-size="14" font-weight="bold">OC</text>
          </svg>
          <div>
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:16px;font-weight:700;letter-spacing:2.2px;color:#111827;">OETKER COLLECTION</div>
            <div style="font-size:8.5px;letter-spacing:2px;color:#8C6D2F;font-weight:700;text-transform:uppercase;margin-top:2px;">MASTERPIECE HOTELS • PALACES</div>
          </div>
        </div>`,
    };
  }

  if (lower.includes('rocco forte') || lower.includes('de russie') || lower.includes('balmoral') || lower.includes('charles')) {
    return {
      brandName: 'ROCCO FORTE HOTELS',
      groupName: 'Rocco Forte & Family Limited',
      primaryColor: '#1A202C',
      accentColor: '#C5A059',
      crsSystem: 'ROCCO FORTE KNIGHTS • GDS RF',
      address: `Historic Center, ${safeCity}`,
      phone: '+44 20 7321 2626 / Front Desk Direct',
      checkInTime: '15:00 HRS',
      checkOutTime: '12:00 HRS',
      logoSvgHtml: `
        <div style="display:flex;align-items:center;gap:12px;">
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="56" height="56" rx="8" fill="#1A202C" stroke="#C5A059" stroke-width="2"/>
            <path d="M22 20L32 14L42 20V42L32 48L22 42V20Z" stroke="#C5A059" stroke-width="1.8" fill="none"/>
            <text x="32" y="36" text-anchor="middle" fill="#E6C986" font-family="Georgia,serif" font-size="13" font-weight="bold">RF</text>
          </svg>
          <div>
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:16px;font-weight:700;letter-spacing:2.2px;color:#1A202C;">ROCCO FORTE</div>
            <div style="font-size:8.5px;letter-spacing:2px;color:#8C6D2F;font-weight:700;text-transform:uppercase;margin-top:2px;">EUROPEAN PALACE HOTELS</div>
          </div>
        </div>`,
    };
  }

  if (lower.includes('address') || lower.includes('fairmont') || lower.includes('sofitel') || lower.includes('atlantis') || lower.includes('royal mansour')) {
    const brandTitle = name.split(/[,–-]/)[0].trim().toUpperCase().slice(0, 28);
    const initials = brandTitle
      .split(/\s+/)
      .filter(w => w !== 'THE' && w !== 'HOTEL')
      .slice(0, 2)
      .map(w => w[0] || 'H')
      .join('');
    return {
      brandName: brandTitle,
      groupName: 'Leading Palace Hotels of the World',
      primaryColor: '#141B2D',
      accentColor: '#C5A059',
      crsSystem: 'LHW / OPERA CLOUD PMS • GDS LW',
      address: `Palace District, ${safeCity}`,
      phone: '+41 44 580 2150 / Concierge Desk Direct',
      checkInTime: '15:00 HRS',
      checkOutTime: '12:00 HRS',
      logoSvgHtml: `
        <div style="display:flex;align-items:center;gap:12px;">
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="32,4 58,18 58,46 32,60 6,46 6,18" fill="#141B2D" stroke="#C5A059" stroke-width="2"/>
            <text x="32" y="39" text-anchor="middle" fill="#E6C986" font-family="Georgia,serif" font-size="18" font-weight="bold">${escapeHtml(initials || 'LH')}</text>
          </svg>
          <div>
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:16px;font-weight:700;letter-spacing:2px;color:#141B2D;">${escapeHtml(brandTitle)}</div>
            <div style="font-size:8.5px;letter-spacing:2px;color:#8C6D2F;font-weight:700;text-transform:uppercase;margin-top:2px;">FIVE-STAR HOSPITALITY &amp; SUITES</div>
          </div>
        </div>`,
    };
  }

  // Bespoke crest for ANY custom hotel entered by the user
  const customInitials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .filter(w => !['the', 'hotel', 'resort', 'and', '&'].includes(w.toLowerCase()))
      .slice(0, 2)
      .map(w => w[0]?.toUpperCase() || '')
      .join('') || 'VH';

  return {
    brandName: name.toUpperCase().slice(0, 34),
    groupName: 'International Hospitality & GDS Reservations',
    primaryColor: '#1C1917',
    accentColor: '#C5A059',
    crsSystem: 'OPERA PMS • AMADEUS GLOBAL GDS',
    address: `Central Hospitality Boulevard, ${safeCity}`,
    phone: '24/7 Front Desk & Global Reservations',
    checkInTime: '14:00 – 15:00 HRS',
    checkOutTime: '12:00 HRS',
    logoSvgHtml: `
      <div style="display:flex;align-items:center;gap:12px;">
        <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="4" width="56" height="56" rx="12" fill="#1C1917" stroke="#C5A059" stroke-width="2"/>
          <path d="M22 18L27 12L32 16L37 12L42 18H22Z" fill="#C5A059"/>
          <text x="32" y="42" text-anchor="middle" fill="#FFFFFF" font-family="Georgia,serif" font-size="18" font-weight="bold">${escapeHtml(customInitials)}</text>
        </svg>
        <div>
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:15.5px;font-weight:700;letter-spacing:1.6px;color:#1C1917;">${escapeHtml(name.toUpperCase().slice(0, 34))}</div>
          <div style="font-size:8.5px;letter-spacing:1.8px;color:#8C6D2F;font-weight:700;text-transform:uppercase;margin-top:2px;">OFFICIAL ACCOMMODATION VOUCHER • ${escapeHtml(safeCity.toUpperCase().slice(0, 24))}</div>
        </div>
      </div>`,
  };
}

export interface InsuranceBrandProfile {
  companyName: string;
  underwriter: string;
  policyPrefix: string;
  primaryColor: string;
  accentColor: string;
  emergencyPhone: string;
  claimsPortal: string;
  regNumber: string;
  logoSvgHtml: string;
}

export function resolveInsuranceBrand(
  providerName?: string,
): InsuranceBrandProfile {
  const raw = (providerName || 'AXA Schengen').trim();
  const lower = raw.toLowerCase();

  if (lower.includes('axa')) {
    return {
      companyName: 'AXA SCHENGEN ASSISTANCE',
      underwriter: 'AXA Partners / Inter Partner Assistance S.A. (Brussels, Belgium)',
      policyPrefix: 'AXA-SCH',
      primaryColor: '#00008F',
      accentColor: '#FF1721',
      emergencyPhone: '+32 2 550 05 55 (24/7 Medical Alarm Center)',
      claimsPortal: 'https://www.axa-schengen.com',
      regNumber: 'NBB Reg. 0487 • EU Regulation (EC) No 810/2009 Certified',
      logoSvgHtml: `
        <div style="display:flex;align-items:center;gap:12px;">
          <svg width="50" height="50" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
            <rect width="60" height="60" rx="4" fill="#00008F"/>
            <line x1="34" y1="60" x2="60" y2="22" stroke="#FF1721" stroke-width="5.5"/>
            <text x="8" y="41" fill="#FFFFFF" font-family="Arial,Helvetica,sans-serif" font-weight="900" font-style="italic" font-size="21">AXA</text>
          </svg>
          <div>
            <div style="font-size:17px;font-weight:900;color:#00008F;letter-spacing:0.6px;">AXA SCHENGEN</div>
            <div style="font-size:9px;font-weight:700;color:#475569;letter-spacing:1.2px;text-transform:uppercase;">INTER PARTNER ASSISTANCE S.A. • EUROPE</div>
          </div>
        </div>`,
    };
  }

  if (lower.includes('allianz')) {
    return {
      companyName: 'ALLIANZ TRAVEL & ASSISTANCE',
      underwriter: 'AWP P&C S.A. — Allianz Partners Group (Saint-Ouen, France / Munich)',
      policyPrefix: 'ALZ-GLB',
      primaryColor: '#003781',
      accentColor: '#0062CC',
      emergencyPhone: '+49 89 62424 460 / +44 20 8603 9853 (24/7 Medical Desk)',
      claimsPortal: 'https://www.allianz-assistance.com',
      regNumber: 'ACPR France Reg. 519490080 • Schengen & Worldwide Compliant',
      logoSvgHtml: `
        <div style="display:flex;align-items:center;gap:12px;">
          <svg width="50" height="50" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
            <circle cx="30" cy="30" r="28" fill="#003781"/>
            <circle cx="30" cy="30" r="22" fill="none" stroke="#FFFFFF" stroke-width="2.5"/>
            <rect x="19" y="20" width="5" height="20" rx="1" fill="#FFFFFF"/>
            <rect x="27.5" y="16" width="5" height="24" rx="1" fill="#FFFFFF"/>
            <rect x="36" y="20" width="5" height="20" rx="1" fill="#FFFFFF"/>
          </svg>
          <div>
            <div style="font-size:18px;font-weight:900;color:#003781;letter-spacing:0.5px;">Allianz Partners</div>
            <div style="font-size:9px;font-weight:700;color:#475569;letter-spacing:1.2px;text-transform:uppercase;">ALLIANZ GLOBAL ASSISTANCE • AWP P&amp;C S.A.</div>
          </div>
        </div>`,
    };
  }

  if (lower.includes('worldtrips') || lower.includes('tokio')) {
    return {
      companyName: 'WORLDTRIPS ATLAS INTERNATIONAL',
      underwriter: 'Tokio Marine HCC — MIS Group (Indianapolis, IN, USA / Lloyd’s Syndicate)',
      policyPrefix: 'WT-ATL',
      primaryColor: '#004B87',
      accentColor: '#00A3E0',
      emergencyPhone: '+1 317 262 2132 / Toll-Free +1 800 605 2282',
      claimsPortal: 'https://www.worldtrips.com',
      regNumber: 'Tokio Marine HCC Group • AM Best A++ (Superior) Rated',
      logoSvgHtml: `
        <div style="display:flex;align-items:center;gap:12px;">
          <svg width="50" height="50" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
            <rect width="60" height="60" rx="12" fill="#004B87"/>
            <circle cx="30" cy="30" r="18" fill="none" stroke="#00A3E0" stroke-width="2.4"/>
            <ellipse cx="30" cy="30" rx="9" ry="18" fill="none" stroke="#FFFFFF" stroke-width="1.6"/>
            <line x1="12" y1="30" x2="48" y2="30" stroke="#FFFFFF" stroke-width="1.6"/>
          </svg>
          <div>
            <div style="font-size:17px;font-weight:900;color:#004B87;letter-spacing:0.4px;">WorldTrips</div>
            <div style="font-size:9px;font-weight:700;color:#0077B6;letter-spacing:1.2px;text-transform:uppercase;">A MEMBER OF TOKIO MARINE HCC GROUP</div>
          </div>
        </div>`,
    };
  }

  if (lower.includes('trawick')) {
    return {
      companyName: 'TRAWICK INTERNATIONAL',
      underwriter: 'Trawick International GmbH & Crum & Forster SPC',
      policyPrefix: 'TRW-SAFE',
      primaryColor: '#0A3D62',
      accentColor: '#E58E26',
      emergencyPhone: '+1 888 301 9289 / Int’l Collect +1 251 661 0924',
      claimsPortal: 'https://www.trawickinternational.com',
      regNumber: 'Safe Travels International • Embassy Visa Certified',
      logoSvgHtml: `
        <div style="display:flex;align-items:center;gap:12px;">
          <svg width="50" height="50" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
            <path d="M30 4L54 14V30C54 44 43 53 30 57C17 53 6 44 6 30V14L30 4Z" fill="#0A3D62"/>
            <polygon points="30,14 35,26 48,30 35,34 30,46 25,34 12,30 25,26" fill="#E58E26"/>
          </svg>
          <div>
            <div style="font-size:17px;font-weight:900;color:#0A3D62;letter-spacing:0.5px;">TRAWICK INTERNATIONAL</div>
            <div style="font-size:9px;font-weight:700;color:#B45309;letter-spacing:1.2px;text-transform:uppercase;">SAFE TRAVELS GLOBAL MEDICAL INSURANCE</div>
          </div>
        </div>`,
    };
  }

  // IMG (International Medical Group) or custom
  return {
    companyName: lower.includes('img') ? 'IMG — INTERNATIONAL MEDICAL GROUP' : raw.toUpperCase(),
    underwriter: 'SiriusPoint Specialty Insurance Corporation / IMG Europe Ltd.',
    policyPrefix: 'IMG-PAT',
    primaryColor: '#005587',
    accentColor: '#4D9F2A',
    emergencyPhone: '+1 317 655 4500 (24/7 Global Medical Management)',
    claimsPortal: 'https://www.imglobal.com',
    regNumber: 'Patriot Travel Medical • Consular & Schengen Visa Compliant',
    logoSvgHtml: `
      <div style="display:flex;align-items:center;gap:12px;">
        <svg width="50" height="50" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
          <rect width="60" height="60" rx="10" fill="#005587"/>
          <rect x="25" y="13" width="10" height="34" rx="2" fill="#6DBE45"/>
          <rect x="13" y="25" width="34" height="10" rx="2" fill="#6DBE45"/>
          <circle cx="30" cy="30" r="22" fill="none" stroke="#FFFFFF" stroke-width="1.8"/>
        </svg>
        <div>
          <div style="font-size:17px;font-weight:900;color:#005587;letter-spacing:0.6px;">${escapeHtml(lower.includes('img') ? 'IMG GLOBAL MEDICAL' : raw.toUpperCase())}</div>
          <div style="font-size:9px;font-weight:700;color:#475569;letter-spacing:1.2px;text-transform:uppercase;">INTERNATIONAL MEDICAL &amp; REPATRIATION COVER</div>
        </div>
      </div>`,
  };
}

/**
 * Generates a crisp, print-accurate 1D Code-128 style linear barcode SVG
 * for IATA boarding passes, GDS PNR stubs, and hotel/insurance vouchers.
 */
export function generateLinearBarcodeSvg(
  payload: string,
  width = 230,
  height = 42,
  barColor = '#0F172A',
): string {
  const clean = (payload || 'VANIR2026VIP').toUpperCase();
  const bars: string[] = [];
  // Quiet zone + Start B guard bars
  let x = 4;
  const startPattern = [2, 1, 1, 2, 3, 2];
  for (let i = 0; i < startPattern.length; i++) {
    const w = startPattern[i] * 1.35;
    if (i % 2 === 0) {
      bars.push(`<rect x="${x.toFixed(2)}" y="0" width="${w.toFixed(2)}" height="${height}" fill="${barColor}"/>`);
    }
    x += w;
  }

  for (let idx = 0; idx < Math.min(clean.length, 24); idx++) {
    const code = clean.charCodeAt(idx);
    const b1 = ((code % 3) + 1) * 1.15;
    const s1 = (((code >> 2) % 3) + 1) * 1.1;
    const b2 = (((code >> 4) % 3) + 1) * 1.2;
    const s2 = (((code + idx) % 2) + 1) * 1.1;
    const b3 = (((code * 3) % 2) + 1) * 1.15;
    const s3 = 1.25;

    bars.push(`<rect x="${x.toFixed(2)}" y="0" width="${b1.toFixed(2)}" height="${height}" fill="${barColor}"/>`);
    x += b1 + s1;
    bars.push(`<rect x="${x.toFixed(2)}" y="0" width="${b2.toFixed(2)}" height="${height}" fill="${barColor}"/>`);
    x += b2 + s2;
    bars.push(`<rect x="${x.toFixed(2)}" y="0" width="${b3.toFixed(2)}" height="${height}" fill="${barColor}"/>`);
    x += b3 + s3;
  }

  // Stop guard pattern
  const stopPattern = [2, 3, 3, 1, 1, 1, 2];
  for (let i = 0; i < stopPattern.length; i++) {
    const w = stopPattern[i] * 1.3;
    if (i % 2 === 0) {
      bars.push(`<rect x="${x.toFixed(2)}" y="0" width="${w.toFixed(2)}" height="${height}" fill="${barColor}"/>`);
    }
    x += w;
  }

  const totalWidth = Math.max(x + 4, 140);
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${totalWidth.toFixed(1)} ${height}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">${bars.join('')}</svg>`;
}

/**
 * Generates an inline deterministic QR-style vector matrix as an offline fallback
 * while loading the live QR code pointing to https://vanirgroup.com/verify/...
 */
export function buildOfficialQrBlockHtml(
  kind: 'ticket' | 'doc',
  params: Record<string, string>,
  size = 86,
): { verifyUrl: string; qrHtml: string } {
  const qs = Object.entries(params)
    .filter(([, v]) => Boolean(v))
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  const verifyUrl = `https://vanirgroup.com/verify/${kind}${qs ? `?${qs}` : ''}`;
  const liveQrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=0&data=${encodeURIComponent(verifyUrl)}`;

  // Build deterministic 15x15 vector fallback pattern behind the <img> in case device is offline
  const cells = 15;
  const cellSize = 6;
  const rects: string[] = [];
  const drawFinder = (ox: number, oy: number) => {
    rects.push(`<rect x="${ox * cellSize}" y="${oy * cellSize}" width="${5 * cellSize}" height="${5 * cellSize}" fill="#0F172A"/>`);
    rects.push(`<rect x="${(ox + 1) * cellSize}" y="${(oy + 1) * cellSize}" width="${3 * cellSize}" height="${3 * cellSize}" fill="#FFFFFF"/>`);
    rects.push(`<rect x="${(ox + 2) * cellSize}" y="${(oy + 2) * cellSize}" width="${cellSize}" height="${cellSize}" fill="#0F172A"/>`);
  };
  drawFinder(0, 0);
  drawFinder(cells - 5, 0);
  drawFinder(0, cells - 5);

  let hash = 2166136261;
  for (let i = 0; i < verifyUrl.length; i++) {
    hash ^= verifyUrl.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      const inFinder =
        (r < 6 && c < 6) ||
        (r < 6 && c >= cells - 6) ||
        (r >= cells - 6 && c < 6);
      if (inFinder) continue;
      hash ^= (r * 31 + c * 17) & 0xff;
      hash = Math.imul(hash, 16777619);
      if ((hash >>> 3) & 1) {
        rects.push(`<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize}" height="${cellSize}" fill="#0F172A"/>`);
      }
    }
  }
  const fallbackSvg = `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cells * cellSize} ${cells * cellSize}"><rect width="100%" height="100%" fill="#FFFFFF"/>${rects.join('')}</svg>`,
  )}`;

  const qrHtml = `<div style="width:${size}px;height:${size}px;padding:4px;background:#FFFFFF;border:1px solid #CBD5E1;border-radius:6px;box-sizing:border-box;">
    <img src="${fallbackSvg}" alt="QR" style="width:100%;height:100%;display:block;" />
  </div>`;

  return { verifyUrl, qrHtml };
}

export function escapeHtml(value?: string | number | null): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export type StampVariant =
  | 'airline_ticket'
  | 'insurance'
  | 'hotel'
  | 'apartment'
  | 'flight'
  | 'noc'
  | 'jet'
  | 'yacht'
  | 'car'
  | 'limousine'
  | 'itinerary'
  | 'package'
  | 'tour'
  | 'airport'
  | 'esim';

function getSignatureVectorSvg(variantIndex: number, penColor = '#143A8A'): string {
  const paths = [
    // Signature 0: Flowing European Executive Loop
    `<path d="M8,36 C16,12 26,8 28,26 C29,35 19,40 16,33 C14,27 28,16 40,22 C45,25 42,33 48,31 C55,28 62,18 68,24 C72,28 69,34 76,31 C86,27 98,21 116,24 C128,26 138,22 148,19 M22,41 C54,37 96,35 138,38" stroke="${penColor}" stroke-width="1.9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    // Signature 1: Actuarial / Underwriter Sharp Cursive
    `<path d="M12,38 L24,11 L31,34 L42,14 C46,24 44,33 52,31 C60,29 65,20 71,27 C76,32 84,23 92,28 C100,32 114,24 134,26 M16,42 Q74,34 142,39" stroke="${penColor}" stroke-width="1.85" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    // Signature 2: Grand Hotel Director Flourish
    `<path d="M14,32 C10,16 28,9 34,21 C38,29 25,39 21,34 C18,30 35,20 48,25 C56,28 58,19 66,24 C73,29 82,22 91,27 C102,32 118,22 140,25 M30,43 C62,36 105,36 144,41" stroke="${penColor}" stroke-width="1.95" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    // Signature 3: Corporate HR Director Bold Ballpoint
    `<path d="M10,35 C18,9 33,10 30,29 C28,39 18,38 22,28 C27,18 44,18 50,29 C54,35 61,21 68,28 C75,34 83,24 94,28 C108,33 122,25 145,23 M18,43 L132,37" stroke="${penColor}" stroke-width="2.1" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    // Signature 4: Aviation / Maritime Captain Signature
    `<path d="M9,34 C20,12 31,14 27,32 C25,38 38,21 47,26 C53,30 60,21 67,27 C74,33 86,18 95,27 C104,35 120,25 144,27 M24,41 C58,39 102,34 146,36" stroke="${penColor}" stroke-width="1.9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  ];
  const chosen = paths[Math.abs(variantIndex) % paths.length];
  return `<svg width="142" height="46" viewBox="0 0 155 48" xmlns="http://www.w3.org/2000/svg" style="display:block;overflow:visible;">${chosen}</svg>`;
}

/**
 * Generates an authentic, document-specific wet-ink rubber stamp + overlapping
 * calligraphic fountain-pen signature block. Every document type has a completely
 * different stamp geometry, ink pigment, authority text, and rotation angle.
 */
export function buildAuthenticDocumentStampHtml(options: {
  variant: StampVariant;
  issuerName: string;
  dateStr: string;
  refCode: string;
  signerName?: string;
  signerTitle?: string;
  cityOrBranch?: string;
}): string {
  const {
    variant,
    issuerName,
    dateStr,
    refCode,
    signerName,
    signerTitle,
    cityOrBranch,
  } = options;

  const cleanIssuer = escapeHtml(issuerName.toUpperCase().slice(0, 32));
  const cleanFullIssuer = escapeHtml(issuerName.toUpperCase().slice(0, 52));
  const cleanDate = escapeHtml(dateStr.toUpperCase());
  const cleanRef = escapeHtml(refCode.toUpperCase().slice(0, 18));
  const cleanBranch = escapeHtml((cityOrBranch || 'INTERNATIONAL DESK').toUpperCase().slice(0, 22));
  const uid = `${variant}_${refCode.replace(/[^A-Za-z0-9]/g, '').slice(-6)}`;

  // 1. AIRLINE E-TICKET / FLIGHT RESERVATION -> Rectangular IATA BSP Ticketing Stamp + Round Carrier Seal
  if (variant === 'airline_ticket' || variant === 'flight') {
    const sig = getSignatureVectorSvg(0, '#163B8C');
    return `
      <div style="position:relative;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:4px 2px;">
        <div style="position:relative;z-index:2;">
          <div style="font-size:8px;font-weight:800;color:#64748B;letter-spacing:0.8px;text-transform:uppercase;">VALIDATING CARRIER &amp; BSP AGENT</div>
          <div style="margin:2px 0 -4px -4px;">${sig}</div>
          <div style="font-size:9px;font-weight:800;color:#0F172A;">${escapeHtml(signerName || 'A. Al-Hashimi • IATA Ticketing')}</div>
          <div style="font-size:8px;color:#475569;">${escapeHtml(signerTitle || 'BSP Revenue & GDS Control')}</div>
        </div>
        <div style="transform:rotate(-5.5deg);opacity:0.90;mix-blend-mode:multiply;">
          <svg width="168" height="78" viewBox="0 0 184 86" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="grunge_${uid}" x="-15%" y="-15%" width="130%" height="130%">
                <feTurbulence type="fractalNoise" baseFrequency="0.055" numOctaves="3" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>
            <g filter="url(#grunge_${uid})">
              <rect x="3" y="3" width="178" height="80" rx="6" fill="none" stroke="#133876" stroke-width="2.8"/>
              <rect x="7" y="7" width="170" height="72" rx="4" fill="none" stroke="#133876" stroke-width="1.2" stroke-dasharray="6 3"/>
              <text x="92" y="21" text-anchor="middle" fill="#133876" font-family="Arial,sans-serif" font-size="8.2" font-weight="900" letter-spacing="0.8">${cleanIssuer}</text>
              <line x1="14" y1="26" x2="170" y2="26" stroke="#133876" stroke-width="1.2"/>
              <text x="92" y="40" text-anchor="middle" fill="#B91C1C" font-family="'Courier New',monospace" font-size="10.5" font-weight="900" letter-spacing="1">ISSUED ${cleanDate}</text>
              <text x="92" y="53" text-anchor="middle" fill="#133876" font-family="Arial,sans-serif" font-size="8.5" font-weight="900" letter-spacing="1.1">IATA BSP • E-TKT VALIDATED</text>
              <line x1="14" y1="59" x2="170" y2="59" stroke="#133876" stroke-width="1.2"/>
              <text x="92" y="71" text-anchor="middle" fill="#133876" font-family="'Courier New',monospace" font-size="7.8" font-weight="800">LOCATOR: ${cleanRef} • HK1</text>
            </g>
          </svg>
        </div>
      </div>`;
  }

  // 2. INSURANCE POLICY -> Circular Actuarial Underwriter Wet-Ink Seal + Crimson "ZERO DEDUCTIBLE" Stamp
  if (variant === 'insurance') {
    const sig = getSignatureVectorSvg(1, '#0F358E');
    return `
      <div style="position:relative;display:flex;align-items:center;justify-content:space-between;gap:6px;">
        <div style="position:relative;z-index:2;">
          <div style="font-size:8px;font-weight:800;color:#64748B;text-transform:uppercase;letter-spacing:0.7px;">AUTHORIZED ACTUARIAL UNDERWRITER</div>
          <div style="margin:2px 0 -4px -4px;">${sig}</div>
          <div style="font-size:9.5px;font-weight:900;color:#0F172A;">${escapeHtml(signerName || 'Dr. M. Laurent-Dubois')}</div>
          <div style="font-size:8px;color:#475569;">${escapeHtml(signerTitle || 'Chief Medical Underwriting Officer')}</div>
          <div style="margin-top:5px;display:inline-block;border:1.8px solid #B91C1C;border-radius:3px;padding:1px 6px;transform:rotate(2.5deg);color:#B91C1C;font-size:7.5px;font-weight:900;letter-spacing:0.8px;">
            ✓ ZERO DEDUCTIBLE • ART.15 EC 810/2009
          </div>
        </div>
        <div style="transform:rotate(-8deg);opacity:0.91;mix-blend-mode:multiply;margin-left:-8px;">
          <svg width="108" height="108" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="grunge_${uid}" x="-15%" y="-15%" width="130%" height="130%">
                <feTurbulence type="fractalNoise" baseFrequency="0.055" numOctaves="3" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.6" xChannelSelector="R" yChannelSelector="G" />
              </filter>
              <path id="topArc_${uid}" d="M 18,58 A 43,43 0 0,1 102,58" />
              <path id="botArc_${uid}" d="M 16,63 A 45,45 0 0,0 104,63" />
            </defs>
            <g filter="url(#grunge_${uid})">
              <circle cx="60" cy="60" r="55" fill="none" stroke="#1034A6" stroke-width="2.8"/>
              <circle cx="60" cy="60" r="50" fill="none" stroke="#1034A6" stroke-width="1.2" stroke-dasharray="4 2"/>
              <circle cx="60" cy="60" r="32" fill="none" stroke="#1034A6" stroke-width="1.8"/>
              <text fill="#1034A6" font-family="Arial,sans-serif" font-size="6.8" font-weight="900" letter-spacing="0.9">
                <textPath href="#topArc_${uid}" startOffset="50%" text-anchor="middle">★ ${cleanIssuer.slice(0, 18)} ★</textPath>
              </text>
              <text fill="#1034A6" font-family="Arial,sans-serif" font-size="6.2" font-weight="900" letter-spacing="0.8">
                <textPath href="#botArc_${uid}" startOffset="50%" text-anchor="middle">UNDERWRITING &amp; POLICY</textPath>
              </text>
              <text x="60" y="53" text-anchor="middle" fill="#1034A6" font-family="Arial,sans-serif" font-size="7.5" font-weight="900">POLICY ACTIVE</text>
              <text x="60" y="64" text-anchor="middle" fill="#B91C1C" font-family="'Courier New',monospace" font-size="8" font-weight="900">${cleanDate}</text>
              <text x="60" y="74" text-anchor="middle" fill="#1034A6" font-family="'Courier New',monospace" font-size="7" font-weight="800">PAID IN FULL</text>
            </g>
          </svg>
        </div>
      </div>`;
  }

  // 3. HOTEL & LUXURY APARTMENT -> Classic European 5-Star Oval Concierge & Reservations Stamp (Burgundy Ink)
  if (variant === 'hotel' || variant === 'apartment') {
    const sig = getSignatureVectorSvg(2, '#1E3A8A');
    return `
      <div style="position:relative;display:flex;align-items:center;justify-content:space-between;gap:6px;">
        <div style="position:relative;z-index:2;">
          <div style="font-size:8px;font-weight:800;color:#8C6D2F;text-transform:uppercase;letter-spacing:0.8px;">CENTRAL RESERVATIONS &amp; FRONT OFFICE</div>
          <div style="margin:2px 0 -4px -4px;">${sig}</div>
          <div style="font-size:9.5px;font-weight:900;color:#0F172A;">${escapeHtml(signerName || 'H. Van Der Berg')}</div>
          <div style="font-size:8px;color:#475569;">${escapeHtml(signerTitle || 'Director of Rooms & Reservations')}</div>
        </div>
        <div style="transform:rotate(-6.5deg);opacity:0.91;mix-blend-mode:multiply;">
          <svg width="158" height="94" viewBox="0 0 176 104" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="grunge_${uid}" x="-15%" y="-15%" width="130%" height="130%">
                <feTurbulence type="fractalNoise" baseFrequency="0.055" numOctaves="3" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>
            <g filter="url(#grunge_${uid})">
              <ellipse cx="88" cy="52" rx="83" ry="47" fill="none" stroke="#6D1A36" stroke-width="2.8"/>
              <ellipse cx="88" cy="52" rx="77" ry="41" fill="none" stroke="#6D1A36" stroke-width="1.2" stroke-dasharray="5 2.5"/>
              <ellipse cx="88" cy="52" rx="55" ry="23" fill="none" stroke="#6D1A36" stroke-width="1.5"/>
              <text x="88" y="22" text-anchor="middle" fill="#6D1A36" font-family="Georgia,serif" font-size="7.5" font-weight="bold" letter-spacing="1">★ ${cleanIssuer.slice(0, 22)} ★</text>
              <text x="88" y="48" text-anchor="middle" fill="#6D1A36" font-family="Arial,sans-serif" font-size="7.5" font-weight="900" letter-spacing="0.7">PREPAID &amp; GUARANTEED</text>
              <text x="88" y="60" text-anchor="middle" fill="#1E3A8A" font-family="'Courier New',monospace" font-size="8.5" font-weight="900">${cleanDate}</text>
              <text x="88" y="86" text-anchor="middle" fill="#6D1A36" font-family="Arial,sans-serif" font-size="7.2" font-weight="800" letter-spacing="0.9">FRONT DESK • ${cleanBranch.slice(0, 14)}</text>
            </g>
          </svg>
        </div>
      </div>`;
  }

  // 4. EMPLOYER NOC & SALARY CERTIFICATE -> Heavy Corporate HR & Commercial Registry Round Ink Seal
  if (variant === 'noc') {
    const sig = getSignatureVectorSvg(3, '#153585');
    return `
      <div style="position:relative;display:flex;align-items:flex-end;justify-content:space-between;width:100%;margin-top:26px;">
        <div style="position:relative;z-index:2;">
          <div style="font-size:9.5px;font-weight:800;color:#334155;text-transform:uppercase;letter-spacing:0.6px;">FOR AND ON BEHALF OF ${cleanFullIssuer}</div>
          <div style="margin:6px 0 -2px -4px;">${sig}</div>
          <div style="width:190px;border-top:1px solid #64748B;padding-top:4px;font-size:11px;font-weight:900;color:#0F172A;">${escapeHtml(signerName || 'Dr. Khaled Al-Mansoori')}</div>
          <div style="font-size:9.5px;color:#475569;">${escapeHtml(signerTitle || 'Director of Human Resources & Legal Affairs')}</div>
        </div>
        <div style="transform:rotate(-11.5deg);opacity:0.88;mix-blend-mode:multiply;margin-right:14px;">
          <svg width="118" height="118" viewBox="0 0 130 130" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <path id="nocTop_${uid}" d="M 21,63 A 46,46 0 0,1 109,63" />
              <path id="nocBot_${uid}" d="M 19,67 A 48,48 0 0,0 111,67" />
            </defs>
            <circle cx="65" cy="65" r="60" fill="none" stroke="#232B7A" stroke-width="2.8"/>
            <circle cx="65" cy="65" r="55" fill="none" stroke="#232B7A" stroke-width="1.2" stroke-dasharray="2.5 2"/>
            <circle cx="65" cy="65" r="35" fill="none" stroke="#232B7A" stroke-width="1.6"/>
            <text fill="#232B7A" font-family="Arial,sans-serif" font-size="6.8" font-weight="900" letter-spacing="0.9">
              <textPath href="#nocTop_${uid}" startOffset="50%" text-anchor="middle">★ ${cleanIssuer.slice(0, 20)} ★</textPath>
            </text>
            <text fill="#232B7A" font-family="Arial,sans-serif" font-size="6.4" font-weight="900" letter-spacing="0.8">
              <textPath href="#nocBot_${uid}" startOffset="50%" text-anchor="middle">HUMAN RESOURCES SEAL</textPath>
            </text>
            <text x="65" y="56" text-anchor="middle" fill="#232B7A" font-family="Arial,sans-serif" font-size="7.6" font-weight="900">C.R. VERIFIED</text>
            <text x="65" y="68" text-anchor="middle" fill="#B91C1C" font-family="'Courier New',monospace" font-size="7.8" font-weight="900">${cleanDate}</text>
            <text x="65" y="79" text-anchor="middle" fill="#232B7A" font-family="'Courier New',monospace" font-size="6.8" font-weight="800">${cleanRef}</text>
          </svg>
        </div>
      </div>`;
  }

  // 5. PRIVATE JET CHARTER -> Octagonal FBO Flight Dispatch & Ramp Clearance Stamp
  if (variant === 'jet') {
    const sig = getSignatureVectorSvg(4, '#1C1917');
    return `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
        <div>
          <div style="font-size:8px;font-weight:800;color:#64748B;text-transform:uppercase;">CHIEF FLIGHT DISPATCHER (FBO)</div>
          <div style="margin:2px 0 -4px -4px;">${sig}</div>
          <div style="font-size:9.5px;font-weight:900;color:#0F172A;">Capt. R. Sterling • ICAO Dispatch</div>
        </div>
        <div style="transform:rotate(-6deg);opacity:0.88;mix-blend-mode:multiply;">
          <svg width="112" height="100" viewBox="0 0 130 116" xmlns="http://www.w3.org/2000/svg">
            <polygon points="38,4 92,4 126,34 126,82 92,112 38,112 4,82 4,34" fill="none" stroke="#1C1917" stroke-width="2.8"/>
            <polygon points="41,10 89,10 120,37 120,79 89,106 41,106 10,79 10,37" fill="none" stroke="#1C1917" stroke-width="1" stroke-dasharray="3 2"/>
            <text x="65" y="32" text-anchor="middle" fill="#1C1917" font-size="7.5" font-weight="900" letter-spacing="0.9">VIP FBO FLIGHT OPS</text>
            <text x="65" y="50" text-anchor="middle" fill="#B91C1C" font-family="'Courier New',monospace" font-size="9.5" font-weight="900">RAMP CLEARED</text>
            <text x="65" y="64" text-anchor="middle" fill="#1C1917" font-family="'Courier New',monospace" font-size="8" font-weight="900">${cleanDate}</text>
            <text x="65" y="80" text-anchor="middle" fill="#1C1917" font-size="7.2" font-weight="800">TAIL &amp; CREW VERIFIED</text>
            <text x="65" y="95" text-anchor="middle" fill="#1C1917" font-family="'Courier New',monospace" font-size="6.8" font-weight="800">${cleanRef}</text>
          </svg>
        </div>
      </div>`;
  }

  // 6. SUPERYACHT MARITIME CHARTER -> Port Harbor Master & MYBA Anchor Round Stamp
  if (variant === 'yacht') {
    const sig = getSignatureVectorSvg(4, '#075985');
    return `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
        <div>
          <div style="font-size:8px;font-weight:800;color:#64748B;text-transform:uppercase;">HARBOR MASTER &amp; CHARTER BROKER</div>
          <div style="margin:2px 0 -4px -4px;">${sig}</div>
          <div style="font-size:9.5px;font-weight:900;color:#0F172A;">Capt. N. Kostas • MYBA Registry</div>
        </div>
        <div style="transform:rotate(-8.5deg);opacity:0.88;mix-blend-mode:multiply;">
          <svg width="104" height="104" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <path id="ychTop_${uid}" d="M 18,58 A 43,43 0 0,1 102,58" />
              <path id="ychBot_${uid}" d="M 16,63 A 45,45 0 0,0 104,63" />
            </defs>
            <circle cx="60" cy="60" r="55" fill="none" stroke="#075985" stroke-width="2.6"/>
            <circle cx="60" cy="60" r="33" fill="none" stroke="#075985" stroke-width="1.5"/>
            <text fill="#075985" font-size="6.6" font-weight="900" letter-spacing="0.9">
              <textPath href="#ychTop_${uid}" startOffset="50%" text-anchor="middle">★ ROYAL MARITIME CHARTER ★</textPath>
            </text>
            <text fill="#075985" font-size="6.3" font-weight="900" letter-spacing="0.8">
              <textPath href="#ychBot_${uid}" startOffset="50%" text-anchor="middle">PORT EMBARKATION CLEARED</textPath>
            </text>
            <text x="60" y="55" text-anchor="middle" fill="#075985" font-size="7.4" font-weight="900">BERTH CLEARED</text>
            <text x="60" y="68" text-anchor="middle" fill="#B91C1C" font-family="'Courier New',monospace" font-size="7.5" font-weight="900">${cleanDate}</text>
          </svg>
        </div>
      </div>`;
  }

  // 7. EXECUTIVE CHAUFFEUR / LIMOUSINE -> Emerald Rectangular Fleet Protocol Dispatch Stamp
  if (variant === 'car' || variant === 'limousine') {
    const sig = getSignatureVectorSvg(0, '#0F5132');
    return `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
        <div>
          <div style="font-size:8px;font-weight:800;color:#64748B;text-transform:uppercase;">DIPLOMATIC FLEET CONTROLLER</div>
          <div style="margin:2px 0 -4px -4px;">${sig}</div>
          <div style="font-size:9.5px;font-weight:900;color:#0F172A;">K. Al-otaibi • Executive Dispatch</div>
        </div>
        <div style="transform:rotate(-4.5deg);opacity:0.88;mix-blend-mode:multiply;">
          <svg width="160" height="72" viewBox="0 0 176 80" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="170" height="74" rx="5" fill="none" stroke="#0F5132" stroke-width="2.6"/>
            <rect x="7" y="7" width="162" height="66" rx="3" fill="none" stroke="#0F5132" stroke-width="1"/>
            <text x="88" y="23" text-anchor="middle" fill="#0F5132" font-size="8.2" font-weight="900" letter-spacing="0.9">VIP PROTOCOL FLEET CONTROL</text>
            <text x="88" y="42" text-anchor="middle" fill="#B91C1C" font-family="'Courier New',monospace" font-size="9.8" font-weight="900">CHAUFFEUR DISPATCHED</text>
            <text x="88" y="56" text-anchor="middle" fill="#0F5132" font-family="'Courier New',monospace" font-size="8" font-weight="800">${cleanDate} • PAID</text>
            <text x="88" y="68" text-anchor="middle" fill="#0F5132" font-family="'Courier New',monospace" font-size="7" font-weight="800">${cleanRef}</text>
          </svg>
        </div>
      </div>`;
  }

  // 8. CONSULAR ITINERARY / EMBASSY VISA PACKAGE / VIP CONCIERGE / ESIM -> Crimson-Gold Diplomatic Attestation Seal
  const sig = getSignatureVectorSvg(2, '#1E3A8A');
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
      <div>
        <div style="font-size:8px;font-weight:800;color:#8C6D2F;text-transform:uppercase;">CONSULAR DOCUMENTATION OFFICER</div>
        <div style="margin:2px 0 -4px -4px;">${sig}</div>
        <div style="font-size:9.5px;font-weight:900;color:#0F172A;">${escapeHtml(signerName || 'S. El-hariri • Accredited Desk')}</div>
        <div style="font-size:8px;color:#475569;">IATA &amp; DRV Certified Documentation</div>
      </div>
      <div style="transform:rotate(-8deg);opacity:0.88;mix-blend-mode:multiply;">
        <svg width="106" height="106" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <path id="conTop_${uid}" d="M 18,58 A 43,43 0 0,1 102,58" />
            <path id="conBot_${uid}" d="M 16,63 A 45,45 0 0,0 104,63" />
          </defs>
          <circle cx="60" cy="60" r="55" fill="none" stroke="#881337" stroke-width="2.6"/>
          <circle cx="60" cy="60" r="50" fill="none" stroke="#881337" stroke-width="1" stroke-dasharray="3 2"/>
          <circle cx="60" cy="60" r="33" fill="none" stroke="#881337" stroke-width="1.6"/>
          <text fill="#881337" font-size="6.6" font-weight="900" letter-spacing="0.9">
            <textPath href="#conTop_${uid}" startOffset="50%" text-anchor="middle">★ VANIR DIPLOMATIC DESK ★</textPath>
          </text>
          <text fill="#881337" font-size="6.3" font-weight="900" letter-spacing="0.8">
            <textPath href="#conBot_${uid}" startOffset="50%" text-anchor="middle">IATA &amp; DRV ATTESTED</textPath>
          </text>
          <text x="60" y="54" text-anchor="middle" fill="#881337" font-size="7.4" font-weight="900">EMBASSY VALID</text>
          <text x="60" y="66" text-anchor="middle" fill="#1E3A8A" font-family="'Courier New',monospace" font-size="7.5" font-weight="900">${cleanDate}</text>
          <text x="60" y="76" text-anchor="middle" fill="#881337" font-family="'Courier New',monospace" font-size="6.6" font-weight="800">${cleanRef.slice(0, 12)}</text>
        </svg>
      </div>
    </div>`;
}

