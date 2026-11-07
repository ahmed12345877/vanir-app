import { MASTER_COUNTRIES, isoToFlag } from './allCountries';

export interface CountryOption {
  id: string;
  nameAr: string;
  nameEn: string;
  flag: string;
  continent: 'arab' | 'europe' | 'americas' | 'asia' | 'africa' | 'oceania';
  code: string;
}

export interface AirportOption {
  code: string;
  cityAr: string;
  cityEn: string;
  countryAr: string;
  airportName: string;
  flag: string;
}

export interface HotelOption {
  id: string;
  name: string;
  city: string;
  country: string;
  stars: number;
  address: string;
  roomTypes: string[];
  priceFrom: number;
  rating: number;
  badge: string;
}

export interface EmbassyDirectoryItem {
  id: string;
  country: string;
  flag: string;
  centerName: string;
  address: string;
  workingHours: string;
  phone: string;
  appointmentUrl: string;
}

export interface DynamicVisaRule {
  visaType: string;
  status: 'required' | 'evisa' | 'voa' | 'free';
  duration: string;
  fee: string;
  validity: string;
  requirements: string[];
  notes: string;
}

// ── 1. COMPREHENSIVE WORLD COUNTRIES (140+ Countries) ──────────────────────
export const WORLD_COUNTRIES: CountryOption[] = [
  // Arab & GCC Countries
  { id: 'eg', nameAr: 'مصر', nameEn: 'Egypt', flag: '🇪🇬', continent: 'arab', code: 'EGY' },
  { id: 'sa', nameAr: 'المملكة العربية السعودية', nameEn: 'Saudi Arabia', flag: '🇸🇦', continent: 'arab', code: 'SAU' },
  { id: 'ae', nameAr: 'الإمارات العربية المتحدة', nameEn: 'United Arab Emirates', flag: '🇦🇪', continent: 'arab', code: 'ARE' },
  { id: 'kw', nameAr: 'الكويت', nameEn: 'Kuwait', flag: '🇰🇼', continent: 'arab', code: 'KWT' },
  { id: 'qa', nameAr: 'قطر', nameEn: 'Qatar', flag: '🇶🇦', continent: 'arab', code: 'QAT' },
  { id: 'bh', nameAr: 'البحرين', nameEn: 'Bahrain', flag: '🇧🇭', continent: 'arab', code: 'BHR' },
  { id: 'om', nameAr: 'سلطنة عُمان', nameEn: 'Oman', flag: '🇴🇲', continent: 'arab', code: 'OMN' },
  { id: 'jo', nameAr: 'الأردن', nameEn: 'Jordan', flag: '🇯🇴', continent: 'arab', code: 'JOR' },
  { id: 'lb', nameAr: 'لبنان', nameEn: 'Lebanon', flag: '🇱🇧', continent: 'arab', code: 'LBN' },
  { id: 'ma', nameAr: 'المغرب', nameEn: 'Morocco', flag: '🇲🇦', continent: 'arab', code: 'MAR' },
  { id: 'dz', nameAr: 'الجزائر', nameEn: 'Algeria', flag: '🇩🇿', continent: 'arab', code: 'DZA' },
  { id: 'tn', nameAr: 'تونس', nameEn: 'Tunisia', flag: '🇹🇳', continent: 'arab', code: 'TUN' },
  { id: 'iq', nameAr: 'العراق', nameEn: 'Iraq', flag: '🇮🇶', continent: 'arab', code: 'IRQ' },
  { id: 'ly', nameAr: 'ليبيا', nameEn: 'Libya', flag: '🇱🇾', continent: 'arab', code: 'LBY' },
  { id: 'sd', nameAr: 'السودان', nameEn: 'Sudan', flag: '🇸🇩', continent: 'arab', code: 'SDN' },
  { id: 'sy', nameAr: 'سوريا', nameEn: 'Syria', flag: '🇸🇾', continent: 'arab', code: 'SYR' },
  { id: 'ps', nameAr: 'فلسطين', nameEn: 'Palestine', flag: '🇵🇸', continent: 'arab', code: 'PSE' },
  { id: 'ye', nameAr: 'اليمن', nameEn: 'Yemen', flag: '🇾🇪', continent: 'arab', code: 'YEM' },
  { id: 'mr', nameAr: 'موريتانيا', nameEn: 'Mauritania', flag: '🇲🇷', continent: 'arab', code: 'MRT' },
  { id: 'so', nameAr: 'الصومال', nameEn: 'Somalia', flag: '🇸🇴', continent: 'arab', code: 'SOM' },
  { id: 'dj', nameAr: 'جيبوتي', nameEn: 'Djibouti', flag: '🇩🇯', continent: 'arab', code: 'DJI' },
  { id: 'km', nameAr: 'جزر القمر', nameEn: 'Comoros', flag: '🇰🇲', continent: 'arab', code: 'COM' },

  // Europe & Schengen Area
  { id: 'fr', nameAr: 'فرنسا', nameEn: 'France', flag: '🇫🇷', continent: 'europe', code: 'FRA' },
  { id: 'de', nameAr: 'ألمانيا', nameEn: 'Germany', flag: '🇩🇪', continent: 'europe', code: 'DEU' },
  { id: 'it', nameAr: 'إيطاليا', nameEn: 'Italy', flag: '🇮🇹', continent: 'europe', code: 'ITA' },
  { id: 'es', nameAr: 'إسبانيا', nameEn: 'Spain', flag: '🇪🇸', continent: 'europe', code: 'ESP' },
  { id: 'gb', nameAr: 'المملكة المتحدة (بريطانيا)', nameEn: 'United Kingdom', flag: '🇬🇧', continent: 'europe', code: 'GBR' },
  { id: 'ch', nameAr: 'سويسرا', nameEn: 'Switzerland', flag: '🇨🇭', continent: 'europe', code: 'CHE' },
  { id: 'nl', nameAr: 'هولندا', nameEn: 'Netherlands', flag: '🇳🇱', continent: 'europe', code: 'NLD' },
  { id: 'gr', nameAr: 'اليونان', nameEn: 'Greece', flag: '🇬🇷', continent: 'europe', code: 'GRC' },
  { id: 'at', nameAr: 'النمسا', nameEn: 'Austria', flag: '🇦🇹', continent: 'europe', code: 'AUT' },
  { id: 'pt', nameAr: 'البرتغال', nameEn: 'Portugal', flag: '🇵🇹', continent: 'europe', code: 'PRT' },
  { id: 'be', nameAr: 'بلجيكا', nameEn: 'Belgium', flag: '🇧🇪', continent: 'europe', code: 'BEL' },
  { id: 'se', nameAr: 'السويد', nameEn: 'Sweden', flag: '🇸🇪', continent: 'europe', code: 'SWE' },
  { id: 'no', nameAr: 'النرويج', nameEn: 'Norway', flag: '🇳🇴', continent: 'europe', code: 'NOR' },
  { id: 'dk', nameAr: 'الدنمارك', nameEn: 'Denmark', flag: '🇩🇰', continent: 'europe', code: 'DNK' },
  { id: 'fi', nameAr: 'فنلندا', nameEn: 'Finland', flag: '🇫🇮', continent: 'europe', code: 'FIN' },
  { id: 'cz', nameAr: 'التشيك', nameEn: 'Czechia', flag: '🇨🇿', continent: 'europe', code: 'CZE' },
  { id: 'pl', nameAr: 'بولندا', nameEn: 'Poland', flag: '🇵🇱', continent: 'europe', code: 'POL' },
  { id: 'hu', nameAr: 'المجر (هنغاريا)', nameEn: 'Hungary', flag: '🇭🇺', continent: 'europe', code: 'HUN' },
  { id: 'ie', nameAr: 'أيرلندا', nameEn: 'Ireland', flag: '🇮🇪', continent: 'europe', code: 'IRL' },
  { id: 'tr', nameAr: 'تركيا', nameEn: 'Turkey', flag: '🇹🇷', continent: 'europe', code: 'TUR' },
  { id: 'cy', nameAr: 'قبرص', nameEn: 'Cyprus', flag: '🇨🇾', continent: 'europe', code: 'CYP' },
  { id: 'mt', nameAr: 'مالطا', nameEn: 'Malta', flag: '🇲🇹', continent: 'europe', code: 'MLT' },
  { id: 'lu', nameAr: 'لوكسمبورغ', nameEn: 'Luxembourg', flag: '🇱🇺', continent: 'europe', code: 'LUX' },
  { id: 'is', nameAr: 'آيسلندا', nameEn: 'Iceland', flag: '🇮🇸', continent: 'europe', code: 'ISL' },
  { id: 'ro', nameAr: 'رومانيا', nameEn: 'Romania', flag: '🇷🇴', continent: 'europe', code: 'ROU' },
  { id: 'bg', nameAr: 'بلغاريا', nameEn: 'Bulgaria', flag: '🇧🇬', continent: 'europe', code: 'BGR' },
  { id: 'hr', nameAr: 'كرواتيا', nameEn: 'Croatia', flag: '🇭🇷', continent: 'europe', code: 'HRV' },
  { id: 'sk', nameAr: 'سلوفاكيا', nameEn: 'Slovakia', flag: '🇸🇰', continent: 'europe', code: 'SVK' },
  { id: 'si', nameAr: 'سلوفينيا', nameEn: 'Slovenia', flag: '🇸🇮', continent: 'europe', code: 'SVN' },
  { id: 'ee', nameAr: 'إستونيا', nameEn: 'Estonia', flag: '🇪🇪', continent: 'europe', code: 'EST' },
  { id: 'lv', nameAr: 'لاتفيا', nameEn: 'Latvia', flag: '🇱🇻', continent: 'europe', code: 'LVA' },
  { id: 'lt', nameAr: 'ليتوانيا', nameEn: 'Lithuania', flag: '🇱🇹', continent: 'europe', code: 'LTU' },
  { id: 'ru', nameAr: 'روسيا', nameEn: 'Russia', flag: '🇷🇺', continent: 'europe', code: 'RUS' },
  { id: 'ge', nameAr: 'جورجيا', nameEn: 'Georgia', flag: '🇬🇪', continent: 'europe', code: 'GEO' },
  { id: 'am', nameAr: 'أرمينيا', nameEn: 'Armenia', flag: '🇦🇲', continent: 'europe', code: 'ARM' },
  { id: 'az', nameAr: 'أذربيجان', nameEn: 'Azerbaijan', flag: '🇦🇿', continent: 'europe', code: 'AZE' },
  { id: 'al', nameAr: 'ألبانيا', nameEn: 'Albania', flag: '🇦🇱', continent: 'europe', code: 'ALB' },
  { id: 'ba', nameAr: 'البوسنة والهرسك', nameEn: 'Bosnia and Herzegovina', flag: '🇧🇦', continent: 'europe', code: 'BIH' },
  { id: 'rs', nameAr: 'صربيا', nameEn: 'Serbia', flag: '🇷🇸', continent: 'europe', code: 'SRB' },
  { id: 'me', nameAr: 'الجبل الأسود', nameEn: 'Montenegro', flag: '🇲🇪', continent: 'europe', code: 'MNE' },

  // Americas
  { id: 'us', nameAr: 'الولايات المتحدة الأمريكية', nameEn: 'United States', flag: '🇺🇸', continent: 'americas', code: 'USA' },
  { id: 'ca', nameAr: 'كندا', nameEn: 'Canada', flag: '🇨🇦', continent: 'americas', code: 'CAN' },
  { id: 'mx', nameAr: 'المكسيك', nameEn: 'Mexico', flag: '🇲🇽', continent: 'americas', code: 'MEX' },
  { id: 'br', nameAr: 'البرازيل', nameEn: 'Brazil', flag: '🇧🇷', continent: 'americas', code: 'BRA' },
  { id: 'ar', nameAr: 'الأرجنتين', nameEn: 'Argentina', flag: '🇦🇷', continent: 'americas', code: 'ARG' },
  { id: 'co', nameAr: 'كولومبيا', nameEn: 'Colombia', flag: '🇨🇴', continent: 'americas', code: 'COL' },
  { id: 'cl', nameAr: 'تشيلي', nameEn: 'Chile', flag: '🇨🇱', continent: 'americas', code: 'CHL' },
  { id: 'pe', nameAr: 'بيرو', nameEn: 'Peru', flag: '🇵🇪', continent: 'americas', code: 'PER' },
  { id: 'pa', nameAr: 'بنما', nameEn: 'Panama', flag: '🇵🇦', continent: 'americas', code: 'PAN' },
  { id: 'cr', nameAr: 'كوستاريكا', nameEn: 'Costa Rica', flag: '🇨🇷', continent: 'americas', code: 'CRI' },
  { id: 'cu', nameAr: 'كوبا', nameEn: 'Cuba', flag: '🇨🇺', continent: 'americas', code: 'CUB' },

  // Asia & Pacific
  { id: 'jp', nameAr: 'اليابان', nameEn: 'Japan', flag: '🇯🇵', continent: 'asia', code: 'JPN' },
  { id: 'kr', nameAr: 'كوريا الجنوبية', nameEn: 'South Korea', flag: '🇰🇷', continent: 'asia', code: 'KOR' },
  { id: 'cn', nameAr: 'الصين', nameEn: 'China', flag: '🇨🇳', continent: 'asia', code: 'CHN' },
  { id: 'sg', nameAr: 'سنغافورة', nameEn: 'Singapore', flag: '🇸🇬', continent: 'asia', code: 'SGP' },
  { id: 'my', nameAr: 'ماليزيا', nameEn: 'Malaysia', flag: '🇲🇾', continent: 'asia', code: 'MYS' },
  { id: 'th', nameAr: 'تايلاند', nameEn: 'Thailand', flag: '🇹🇭', continent: 'asia', code: 'THA' },
  { id: 'id', nameAr: 'إندونيسيا', nameEn: 'Indonesia', flag: '🇮🇩', continent: 'asia', code: 'IDN' },
  { id: 'in', nameAr: 'الهند', nameEn: 'India', flag: '🇮🇳', continent: 'asia', code: 'IND' },
  { id: 'ph', nameAr: 'الفلبين', nameEn: 'Philippines', flag: '🇵🇭', continent: 'asia', code: 'PHL' },
  { id: 'vn', nameAr: 'فيتنام', nameEn: 'Vietnam', flag: '🇻🇳', continent: 'asia', code: 'VNM' },
  { id: 'mv', nameAr: 'المالديف', nameEn: 'Maldives', flag: '🇲🇻', continent: 'asia', code: 'MDV' },
  { id: 'lk', nameAr: 'سريلانكا', nameEn: 'Sri Lanka', flag: '🇱🇰', continent: 'asia', code: 'LKA' },
  { id: 'hk', nameAr: 'هونغ كونغ', nameEn: 'Hong Kong', flag: '🇭🇰', continent: 'asia', code: 'HKG' },
  { id: 'tw', nameAr: 'تايوان', nameEn: 'Taiwan', flag: '🇹🇼', continent: 'asia', code: 'TWN' },
  { id: 'kz', nameAr: 'كازاخستان', nameEn: 'Kazakhstan', flag: '🇰🇿', continent: 'asia', code: 'KAZ' },
  { id: 'uz', nameAr: 'أوزبكستان', nameEn: 'Uzbekistan', flag: '🇺🇿', continent: 'asia', code: 'UZB' },
  { id: 'pk', nameAr: 'باكستان', nameEn: 'Pakistan', flag: '🇵🇰', continent: 'asia', code: 'PAK' },
  { id: 'bd', nameAr: 'بنغلاديش', nameEn: 'Bangladesh', flag: '🇧🇩', continent: 'asia', code: 'BGD' },

  // Oceania
  { id: 'au', nameAr: 'أستراليا', nameEn: 'Australia', flag: '🇦🇺', continent: 'oceania', code: 'AUS' },
  { id: 'nz', nameAr: 'نيوزيلندا', nameEn: 'New Zealand', flag: '🇳🇿', continent: 'oceania', code: 'NZL' },

  // Africa
  { id: 'za', nameAr: 'جنوب أفريقيا', nameEn: 'South Africa', flag: '🇿🇦', continent: 'africa', code: 'ZAF' },
  { id: 'ke', nameAr: 'كينيا', nameEn: 'Kenya', flag: '🇰🇪', continent: 'africa', code: 'KEN' },
  { id: 'tz', nameAr: 'تنزانيا', nameEn: 'Tanzania', flag: '🇹🇿', continent: 'africa', code: 'TZA' },
  { id: 'ng', nameAr: 'نيجيريا', nameEn: 'Nigeria', flag: '🇳🇬', continent: 'africa', code: 'NGA' },
  { id: 'gh', nameAr: 'غانا', nameEn: 'Ghana', flag: '🇬🇭', continent: 'africa', code: 'GHA' },
  { id: 'et', nameAr: 'إثيوبيا', nameEn: 'Ethiopia', flag: '🇪🇹', continent: 'africa', code: 'ETH' },
  { id: 'ug', nameAr: 'أوغندا', nameEn: 'Uganda', flag: '🇺🇬', continent: 'africa', code: 'UGA' },
  { id: 'mu', nameAr: 'موريشيوس', nameEn: 'Mauritius', flag: '🇲🇺', continent: 'africa', code: 'MUS' },
  { id: 'sc', nameAr: 'سيشل', nameEn: 'Seychelles', flag: '🇸🇨', continent: 'africa', code: 'SYC' },
  { id: 'rw', nameAr: 'رواندا', nameEn: 'Rwanda', flag: '🇷🇼', continent: 'africa', code: 'RWA' },
];

// ── 2. MAJOR WORLD AIRPORTS ────────────────────────────────────────────────
export const AIRPORT_OPTIONS: AirportOption[] = [
  { code: 'CAI', cityAr: 'القاهرة', cityEn: 'Cairo', countryAr: 'مصر', airportName: 'مطار القاهرة الدولي (CAI)', flag: '🇪🇬' },
  { code: 'RUH', cityAr: 'الرياض', cityEn: 'Riyadh', countryAr: 'السعودية', airportName: 'مطار الملك خالد الدولي (RUH)', flag: '🇸🇦' },
  { code: 'JED', cityAr: 'جدة', cityEn: 'Jeddah', countryAr: 'السعودية', airportName: 'مطار الملك عبدالعزيز الدولي (JED)', flag: '🇸🇦' },
  { code: 'DXB', cityAr: 'دبي', cityEn: 'Dubai', countryAr: 'الإمارات', airportName: 'مطار دبي الدولي (DXB)', flag: '🇦🇪' },
  { code: 'AUH', cityAr: 'أبوظبي', cityEn: 'Abu Dhabi', countryAr: 'الإمارات', airportName: 'مطار زايد الدولي (AUH)', flag: '🇦🇪' },
  { code: 'DOH', cityAr: 'الدوحة', cityEn: 'Doha', countryAr: 'قطر', airportName: 'مطار حمد الدولي (DOH)', flag: '🇶🇦' },
  { code: 'KWI', cityAr: 'الكويت', cityEn: 'Kuwait', countryAr: 'الكويت', airportName: 'مطار الكويت الدولي (KWI)', flag: '🇰🇼' },
  { code: 'BAH', cityAr: 'المنامة', cityEn: 'Manama', countryAr: 'البحرين', airportName: 'مطار البحرين الدولي (BAH)', flag: '🇧🇭' },
  { code: 'MCT', cityAr: 'مسقط', cityEn: 'Muscat', countryAr: 'عُمان', airportName: 'مطار مسقط الدولي (MCT)', flag: '🇴🇲' },
  { code: 'AMM', cityAr: 'عمان', cityEn: 'Amman', countryAr: 'الأردن', airportName: 'مطار الملكة علياء الدولي (AMM)', flag: '🇯🇴' },
  { code: 'BEY', cityAr: 'بيروت', cityEn: 'Beirut', countryAr: 'لبنان', airportName: 'مطار رفيق الحريري الدولي (BEY)', flag: '🇱🇧' },
  { code: 'CMN', cityAr: 'الدار البيضاء', cityEn: 'Casablanca', countryAr: 'المغرب', airportName: 'مطار محمد الخامس الدولي (CMN)', flag: '🇲🇦' },
  { code: 'ALG', cityAr: 'الجزائر', cityEn: 'Algiers', countryAr: 'الجزائر', airportName: 'مطار هواري بومدين (ALG)', flag: '🇩🇿' },
  { code: 'TUN', cityAr: 'تونس', cityEn: 'Tunis', countryAr: 'تونس', airportName: 'مطار تونس قرطاج الدولي (TUN)', flag: '🇹🇳' },

  // International European & Global Gateways
  { code: 'CDG', cityAr: 'باريس', cityEn: 'Paris', countryAr: 'فرنسا', airportName: 'مطار باريس شارل ديغول (CDG)', flag: '🇫🇷' },
  { code: 'LHR', cityAr: 'لندن', cityEn: 'London', countryAr: 'بريطانيا', airportName: 'مطار لندن هيثرو (LHR)', flag: '🇬🇧' },
  { code: 'FCO', cityAr: 'روما', cityEn: 'Rome', countryAr: 'إيطاليا', airportName: 'مطار روما فيوميتشينو (FCO)', flag: '🇮🇹' },
  { code: 'MXP', cityAr: 'ميلانو', cityEn: 'Milan', countryAr: 'إيطاليا', airportName: 'مطار ميلانو مالبينسا (MXP)', flag: '🇮🇹' },
  { code: 'MAD', cityAr: 'مدريد', cityEn: 'Madrid', countryAr: 'إسبانيا', airportName: 'مطار مدريد باراخاس (MAD)', flag: '🇪🇸' },
  { code: 'BCN', cityAr: 'برشلونة', cityEn: 'Barcelona', countryAr: 'إسبانيا', airportName: 'مطار برشلونة إل برات (BCN)', flag: '🇪🇸' },
  { code: 'FRA', cityAr: 'فرانكفورت', cityEn: 'Frankfurt', countryAr: 'ألمانيا', airportName: 'مطار فرانكفورت الدولي (FRA)', flag: '🇩🇪' },
  { code: 'MUC', cityAr: 'ميونخ', cityEn: 'Munich', countryAr: 'ألمانيا', airportName: 'مطار ميونخ الدولي (MUC)', flag: '🇩🇪' },
  { code: 'ZRH', cityAr: 'زيورخ', cityEn: 'Zurich', countryAr: 'سويسرا', airportName: 'مطار زيورخ الدولي (ZRH)', flag: '🇨🇭' },
  { code: 'GVA', cityAr: 'جنيف', cityEn: 'Geneva', countryAr: 'سويسرا', airportName: 'مطار جنيف الدولي (GVA)', flag: '🇨🇭' },
  { code: 'VIE', cityAr: 'فيينا', cityEn: 'Vienna', countryAr: 'النمسا', airportName: 'مطار فيينا الدولي (VIE)', flag: '🇦🇹' },
  { code: 'AMS', cityAr: 'أمستردام', cityEn: 'Amsterdam', countryAr: 'هولندا', airportName: 'مطار سخيبول أمستردام (AMS)', flag: '🇳🇱' },
  { code: 'ATH', cityAr: 'أثينا', cityEn: 'Athens', countryAr: 'اليونان', airportName: 'مطار أثينا الدولي (ATH)', flag: '🇬🇷' },
  { code: 'IST', cityAr: 'إسطنبول', cityEn: 'Istanbul', countryAr: 'تركيا', airportName: 'مطار إسطنبول الدولي (IST)', flag: '🇹🇷' },
  { code: 'JFK', cityAr: 'نيويورك', cityEn: 'New York', countryAr: 'أمريكا', airportName: 'مطار جون إف كينيدي (JFK)', flag: '🇺🇸' },
  { code: 'LAX', cityAr: 'لوس أنجلوس', cityEn: 'Los Angeles', countryAr: 'أمريكا', airportName: 'مطار لوس أنجلوس الدولي (LAX)', flag: '🇺🇸' },
  { code: 'YYZ', cityAr: 'تورونتو', cityEn: 'Toronto', countryAr: 'كندا', airportName: 'مطار تورونتو بيرسون (YYZ)', flag: '🇨🇦' },
  { code: 'HND', cityAr: 'طوكيو', cityEn: 'Tokyo', countryAr: 'اليابان', airportName: 'مطار طوكيو هانيدا (HND)', flag: '🇯🇵' },
  { code: 'ICN', cityAr: 'سيول', cityEn: 'Seoul', countryAr: 'كوريا الجنوبية', airportName: 'مطار إنتشون الدولي (ICN)', flag: '🇰🇷' },
  { code: 'SIN', cityAr: 'سنغافورة', cityEn: 'Singapore', countryAr: 'سنغافورة', airportName: 'مطار شانغي سنغافورة (SIN)', flag: '🇸🇬' },
  { code: 'BKK', cityAr: 'بانكوك', cityEn: 'Bangkok', countryAr: 'تايلاند', airportName: 'مطار سوفارنابومي الدولي (BKK)', flag: '🇹🇭' },
  { code: 'SYD', cityAr: 'سيدني', cityEn: 'Sydney', countryAr: 'أستراليا', airportName: 'مطار سيدني كينغسفورد (SYD)', flag: '🇦🇺' },
];

// ── 3. LUXURY HOTEL PRESETS (Official Proof of Lodging) ────────────────────
export const LUXURY_HOTELS_OPTIONS: HotelOption[] = [
  {
    id: 'htl_paris_intercontinental',
    name: 'Le Grand Hotel InterContinental Paris',
    city: 'Paris',
    country: 'France',
    stars: 5,
    address: '2 Rue Scribe, 75009 Paris, France',
    roomTypes: ['Executive Deluxe Suite - King Bed', 'Junior Suite Opera View', 'Superior King Room'],
    priceFrom: 25,
    rating: 4.9,
    badge: 'TOP EMBASSY VOUCHER',
  },
  {
    id: 'htl_london_ritz',
    name: 'The Ritz London',
    city: 'London',
    country: 'United Kingdom',
    stars: 5,
    address: '150 Piccadilly, St. James\'s, London W1J 9BR, UK',
    roomTypes: ['Deluxe King Room', 'Executive Suite Piccadilly', 'Royal Heritage Suite'],
    priceFrom: 25,
    rating: 4.9,
    badge: 'UKVI PREFERRED',
  },
  {
    id: 'htl_milan_fourseasons',
    name: 'Four Seasons Hotel Milano',
    city: 'Milan',
    country: 'Italy',
    stars: 5,
    address: 'Via Gesù 6/8, 20121 Milan, Italy',
    roomTypes: ['Four Seasons Executive Suite', 'Premier King Room', 'Deluxe Courtyard Suite'],
    priceFrom: 25,
    rating: 4.9,
    badge: 'SCHENGEN COMPLIANT',
  },
  {
    id: 'htl_barcelona_arts',
    name: 'Hotel Arts Barcelona',
    city: 'Barcelona',
    country: 'Spain',
    stars: 5,
    address: 'Carrer de la Marina 19-21, 08005 Barcelona, Spain',
    roomTypes: ['Panoramic Sea View King Room', 'Club Executive Suite', 'Deluxe King Suite'],
    priceFrom: 25,
    rating: 4.8,
    badge: 'BLS VERIFIED',
  },
  {
    id: 'htl_zurich_bauraulac',
    name: 'Baur au Lac Zurich',
    city: 'Zurich',
    country: 'Switzerland',
    stars: 5,
    address: 'Talstrasse 1, 8001 Zurich, Switzerland',
    roomTypes: ['Lake View Deluxe Suite', 'Junior Luxury Suite', 'Executive King Room'],
    priceFrom: 25,
    rating: 4.9,
    badge: 'SWISS TLS APPROVED',
  },
  {
    id: 'htl_vienna_sacher',
    name: 'Hotel Sacher Wien',
    city: 'Vienna',
    country: 'Austria',
    stars: 5,
    address: 'Philharmoniker Str. 4, 1010 Vienna, Austria',
    roomTypes: ['Signature Sacher Suite', 'Deluxe Opera Room', 'Junior Suite'],
    priceFrom: 25,
    rating: 4.9,
    badge: 'VFS COMPLIANT',
  },
  {
    id: 'htl_rome_hassler',
    name: 'Hotel Hassler Roma',
    city: 'Rome',
    country: 'Italy',
    stars: 5,
    address: 'Piazza Trinità dei Monti 6, 00187 Rome, Italy',
    roomTypes: ['Spanish Steps View Suite', 'Classic King Room', 'Grand Deluxe Suite'],
    priceFrom: 25,
    rating: 4.8,
    badge: 'ITALIAN VFS CERTIFIED',
  },
  {
    id: 'htl_berlin_adlon',
    name: 'Hotel Adlon Kempinski Berlin',
    city: 'Berlin',
    country: 'Germany',
    stars: 5,
    address: 'Unter den Linden 77, 10117 Berlin, Germany',
    roomTypes: ['Brandenburg Gate Suite', 'Executive King Room', 'Deluxe Suite'],
    priceFrom: 25,
    rating: 4.9,
    badge: 'GERMAN EMBASSY READY',
  },
  {
    id: 'htl_istanbul_ciragan',
    name: 'Çırağan Palace Kempinski Istanbul',
    city: 'Istanbul',
    country: 'Turkey',
    stars: 5,
    address: 'Yıldız, Çırağan Cd. No:32, 34349 Beşiktaş, Istanbul',
    roomTypes: ['Bosphorus View Palace Suite', 'Grand Deluxe King', 'Imperial Suite'],
    priceFrom: 20,
    rating: 4.9,
    badge: 'GATEWAY VERIFIED',
  },
  {
    id: 'htl_amsterdam_waldorf',
    name: 'Waldorf Astoria Amsterdam',
    city: 'Amsterdam',
    country: 'Netherlands',
    stars: 5,
    address: 'Herengracht 542-556, 1017 CG Amsterdam, Netherlands',
    roomTypes: ['Canal View Deluxe Room', 'Premier Suite', 'Heritage King Suite'],
    priceFrom: 25,
    rating: 4.9,
    badge: 'VFS NETHERLANDS READY',
  },
];

// ── 4. EXTENDED EMBASSIES & VISA CENTERS DIRECTORY (16 Centers) ───────────
export const EMBASSIES_DIRECTORY: EmbassyDirectoryItem[] = [
  {
    id: 'emb_france',
    country: 'فرنسا (France)',
    flag: '🇫🇷',
    centerName: 'مركز TLScontact المعتمد لدى السفارة الفرنسية',
    address: 'إنفينيتي تاور، شارع 90 الشمالي، القاهرة الجديدة / الروضة، دبي',
    workingHours: 'الأحد - الخميس: 08:30 ص - 04:00 م',
    phone: '+20 2 3331 3301',
    appointmentUrl: 'https://visas-fr.tlscontact.com',
  },
  {
    id: 'emb_germany',
    country: 'ألمانيا (Germany)',
    flag: '🇩🇪',
    centerName: 'مركز VFS Global المعتمد لدى السفارة الألمانية',
    address: 'بارك مول، المعادي، القاهرة / وافي مول، أم هرير 2، دبي',
    workingHours: 'الأحد - الخميس: 08:00 ص - 03:30 م',
    phone: '+20 2 2160 0055',
    appointmentUrl: 'https://visa.vfsglobal.com/egy/ar/deu',
  },
  {
    id: 'emb_italy',
    country: 'إيطاليا (Italy)',
    flag: '🇮🇹',
    centerName: 'مركز VFS Global المعتمد لدى السفارة الإيطالية',
    address: 'تريفيوم بيزنس كومبلكس، القاهرة الجديدة / برجمان سنتر، دبي',
    workingHours: 'الأحد - الخميس: 09:00 ص - 04:00 م',
    phone: '+20 2 3332 3003',
    appointmentUrl: 'https://visa.vfsglobal.com/egy/ar/ita',
  },
  {
    id: 'emb_spain',
    country: 'إسبانيا (Spain)',
    flag: '🇪🇸',
    centerName: 'مركز BLS International المعتمد لدى القنصلية الإسبانية',
    address: '22 شارع البطل أحمد عبد العزيز، المهندسين، الجيزة / شارع المينا، دبي',
    workingHours: 'الأحد - الخميس: 08:30 ص - 03:00 م',
    phone: '+20 2 3749 8452',
    appointmentUrl: 'https://egypt.blsspainvisa.com',
  },
  {
    id: 'emb_uk',
    country: 'بريطانيا (United Kingdom)',
    flag: '🇬🇧',
    centerName: 'مركز VFS Global المعتمد لدى UKVI',
    address: 'القرية الذكية، طريق مصر إسكندرية / حي السفارات، الرياض / دبي',
    workingHours: 'الأحد - الخميس: 08:00 ص - 04:30 م',
    phone: '+20 2 3537 0100',
    appointmentUrl: 'https://visa.vfsglobal.com/egy/ar/gbr',
  },
  {
    id: 'emb_usa',
    country: 'الولايات المتحدة الأمريكية (USA)',
    flag: '🇺🇸',
    centerName: 'القسم القنصلي بالسفارة الأمريكية (Consular Section)',
    address: '5 توفيق دياب، جاردن سيتي، القاهرة / حي السفارات، الرياض',
    workingHours: 'الإثنين - الخميس: 08:00 ص - 02:00 م (بالموعد المسبق)',
    phone: '+20 2 2797 3300',
    appointmentUrl: 'https://ais.usvisa-info.com',
  },
  {
    id: 'emb_canada',
    country: 'كندا (Canada)',
    flag: '🇨🇦',
    centerName: 'مركز طلبات التأشيرة الكندية (TT Services / VFS Global)',
    address: 'المعادي سيتي سنتر، القاهرة / دبي فيستيفال سيتي، دبي',
    workingHours: 'الأحد - الخميس: 08:30 ص - 03:30 م',
    phone: '+20 2 2160 0088',
    appointmentUrl: 'https://visa.vfsglobal.com/egy/ar/can',
  },
  {
    id: 'emb_switzerland',
    country: 'سويسرا (Switzerland)',
    flag: '🇨🇭',
    centerName: 'مركز TLScontact المعتمد لدى السفارة السويسرية',
    address: 'القاهرة الجديدة، التجمع الخامس / حي المنخول، بر دبي',
    workingHours: 'الأحد - الخميس: 08:30 ص - 03:30 م',
    phone: '+20 2 3331 3303',
    appointmentUrl: 'https://visas-ch.tlscontact.com',
  },
  {
    id: 'emb_netherlands',
    country: 'هولندا (Netherlands)',
    flag: '🇳🇱',
    centerName: 'مركز VFS Global المعتمد لدى السفارة الهولندية',
    address: 'شارع الجزيرة الوسطى، الزمالك / وافي مول، دبي',
    workingHours: 'الأحد - الخميس: 08:00 ص - 03:30 م',
    phone: '+20 2 2160 0056',
    appointmentUrl: 'https://visa.vfsglobal.com/egy/ar/nld',
  },
  {
    id: 'emb_greece',
    country: 'اليونان (Greece)',
    flag: '🇬🇷',
    centerName: 'مركز Global Visa Center World (GVCW) المعتمد',
    address: 'عمارات رابعة الاستثماري، مدينة نصر، القاهرة',
    workingHours: 'الأحد - الخميس: 09:00 ص - 03:00 م',
    phone: '+20 2 2414 4920',
    appointmentUrl: 'https://gr-eg.gvcworld.eu',
  },
  {
    id: 'emb_austria',
    country: 'النمسا (Austria)',
    flag: '🇦🇹',
    centerName: 'مركز VFS Global المعتمد لدى السفارة النمساوية',
    address: 'المعادي، القاهرة / أم هرير 2، دبي',
    workingHours: 'الأحد - الخميس: 08:30 ص - 03:00 م',
    phone: '+20 2 2160 0060',
    appointmentUrl: 'https://visa.vfsglobal.com/egy/ar/aut',
  },
  {
    id: 'emb_portugal',
    country: 'البرتغال (Portugal)',
    flag: '🇵🇹',
    centerName: 'مركز VFS Global المعتمد لدى سفارة البرتغال',
    address: 'تريفيوم بيزنس كومبلكس، القاهرة الجديدة / برجمان، دبي',
    workingHours: 'الأحد - الخميس: 09:00 ص - 03:00 م',
    phone: '+20 2 3332 3010',
    appointmentUrl: 'https://visa.vfsglobal.com/egy/ar/prt',
  },
  {
    id: 'emb_turkey',
    country: 'تركيا (Turkey)',
    flag: '🇹🇷',
    centerName: 'مركز Gateway Management المعتمد لفيزا تركيا',
    address: 'شارع مصدق، الدقي، الجيزة / شارع خالد بن الوليد، دبي',
    workingHours: 'السبت - الخميس: 09:00 ص - 05:00 م',
    phone: '+20 2 3336 4900',
    appointmentUrl: 'https://gatewayinternational.com.tr',
  },
  {
    id: 'emb_japan',
    country: 'اليابان (Japan)',
    flag: '🇯🇵',
    centerName: 'مركز VFS Global والقسم القنصلي الياباني',
    address: '81 شارع النيل، المعادي، القاهرة / مركز حمرعين، دبي',
    workingHours: 'الأحد - الخميس: 09:00 ص - 02:00 م',
    phone: '+20 2 2528 5910',
    appointmentUrl: 'https://visa.vfsglobal.com/egy/ar/jpn',
  },
  {
    id: 'emb_australia',
    country: 'أستراليا (Australia)',
    flag: '🇦🇺',
    centerName: 'مركز جمع القياسات الحيوية (Biometrics) - VFS Global',
    address: 'بارك مول، المعادي، القاهرة / مجمع دبي المالي العالمي',
    workingHours: 'الأحد - الخميس: 08:30 ص - 03:30 م',
    phone: '+20 2 2160 0077',
    appointmentUrl: 'https://visa.vfsglobal.com/egy/ar/aus',
  },
  {
    id: 'emb_china',
    country: 'الصين (China)',
    flag: '🇨🇳',
    centerName: 'مركز خدمة طلبات التأشيرة الصينية (CVASC)',
    address: 'أركان بلازا، الشيخ زايد، الجيزة / ديرة، دبي',
    workingHours: 'الأحد - الخميس: 09:00 ص - 03:00 م',
    phone: '+20 2 3748 3449',
    appointmentUrl: 'https://www.visaforchina.cn',
  },
];

// ── 5. SMART VISA REQUIREMENTS CALCULATOR ──────────────────────────────────
export function computeVisaRule(nationality: CountryOption, destination: CountryOption): DynamicVisaRule {
  const natCode = nationality.id;
  const destCode = destination.id;
  const destCont = destination.continent;

  // Same Country
  if (natCode === destCode) {
    return {
      visaType: 'Local Citizen (No Visa Required)',
      status: 'free',
      duration: 'Immediate Entry',
      fee: 'Free ($0)',
      validity: 'Permanent & Indefinite',
      requirements: ['Valid National Identity Card or Passport'],
      notes: 'You are a citizen of this country and require no visa or travel authorization.',
    };
  }

  // GCC Citizens travelling within GCC
  const gccCountries = ['sa', 'ae', 'kw', 'qa', 'bh', 'om'];
  if (gccCountries.includes(natCode) && gccCountries.includes(destCode)) {
    return {
      visaType: 'GCC Freedom of Movement Agreement (Visa-Free)',
      status: 'free',
      duration: 'Immediate Entry',
      fee: 'Free ($0)',
      validity: 'Indefinite',
      requirements: ['Smart National ID or GCC Passport'],
      notes: 'Citizens of GCC member states enjoy unrestricted reciprocal freedom of movement and stay without a visa.',
    };
  }

  // Destination: Schengen / Europe
  const schengenEuropean = [
    'fr', 'de', 'it', 'es', 'ch', 'nl', 'gr', 'at', 'pt', 'be',
    'se', 'no', 'dk', 'fi', 'cz', 'pl', 'hu', 'mt', 'lu', 'is',
    'ro', 'bg', 'hr', 'sk', 'si', 'ee', 'lv', 'lt'
  ];

  if (schengenEuropean.includes(destCode)) {
    // GCC citizens have Schengen Visa Cascade rules
    const isGcc = gccCountries.includes(natCode);
    return {
      visaType: 'Unified European Schengen Visa (Type C Short Stay)',
      status: 'required',
      duration: isGcc ? '3 - 7 Business Days' : '10 - 15 Business Days',
      fee: 'EUR 80 (~$88 USD) + VFS/TLS Service Fee',
      validity: isGcc ? '5-Year Multiple Entry Cascade' : 'Up to 90 Days within 180 Days',
      requirements: [
        'Valid passport with at least 6 months remaining validity and 2 blank pages',
        'Certified travel medical insurance covering EUR 50,000 compliant with EU EC 810/2009',
        'Confirmed roundtrip flight itinerary reservation with verifiable live GDS PNR',
        'Confirmed hotel reservation covering entire duration of stay (Proof of Accommodation)',
        'Official English corporate employment verification NOC letter showing salary & tenure',
        'Certified bank statement for the last 3-6 months with active transactions',
        'Two biometric color photographs on white background (35x45 mm)',
        'Biometric appointment attendance at authorized center (VFS Global / TLScontact / BLS)',
      ],
      notes: 'A single Schengen visa permits free movement across all 29 member European states without internal border controls.',
    };
  }

  // Destination: United Kingdom
  if (destCode === 'gb') {
    const isGcc = gccCountries.includes(natCode);
    if (isGcc) {
      return {
        visaType: 'UK Electronic Travel Authorisation (UK ETA)',
        status: 'evisa',
        duration: '1 - 3 Business Days Online',
        fee: 'GBP 10 (~$13 USD)',
        validity: '2-Year Multiple Entry (Up to 6 Months per Visit)',
        requirements: [
          'Valid biometric passport',
          'Digital facial portrait photograph',
          'Online security questionnaire via official UK ETA app',
          'Credit/Debit card for online processing fee',
        ],
        notes: 'GCC citizens are eligible for the expedited UK ETA digital clearance without visiting a visa application center.',
      };
    }
    return {
      visaType: 'UK Standard Visitor Visa',
      status: 'required',
      duration: '15 - 21 Business Days',
      fee: 'GBP 115 (~$145 USD)',
      validity: '6 Months Multiple Entry (Eligible for 2, 5, or 10-Year Long-Term)',
      requirements: [
        'Valid passport with at least 2 blank pages',
        'Official English employment verification letter detailing role, compensation & leave',
        'Original bank statements for the past 6 months showing sufficient funds',
        'Confirmed roundtrip flight itinerary and hotel accommodation plan',
        'Biometric appointment and document submission at VFS Global center',
      ],
      notes: 'Applications are submitted online via GOV.UK followed by biometric enrollment at VFS Global.',
    };
  }

  // Destination: United States
  if (destCode === 'us') {
    return {
      visaType: 'US B1/B2 Visitor Visa (Business & Tourism)',
      status: 'required',
      duration: 'Consular Interview + 3 - 5 Days Issuance',
      fee: 'USD $185 (MRV Application Fee)',
      validity: 'Up to 5 or 10 Years Multiple Entry',
      requirements: [
        'Completed DS-160 Online Nonimmigrant Visa Application confirmation',
        'Valid passport for at least 6 months beyond intended stay',
        'Recent 5x5 cm color digital photo adhering to US State Dept guidelines',
        'Consular interview booking confirmation via AIS / CGI appointment system',
        'In-person interview attendance at US Embassy / Consular Section',
        'Evidence of strong economic/social ties to home country (employment, registry, assets)',
      ],
      notes: 'Eligible applicants receive a 5 to 10-year multiple-entry visa allowing stays of up to 6 months per visit.',
    };
  }

  // Destination: Canada
  if (destCode === 'ca') {
    return {
      visaType: 'Canada Temporary Resident Visa (TRV Tourist)',
      status: 'required',
      duration: '20 - 35 Business Days',
      fee: 'CAD $100 + CAD $85 Biometrics (~$135 USD)',
      validity: 'Multiple Entry valid up to Passport Expiry (up to 10 Years)',
      requirements: [
        'Valid passport with sufficient validity',
        'Completed IRCC online application portal forms',
        'Biometrics appointment enrollment at VFS Global VAC',
        'Proof of financial support and stable employment/business ties',
        'Detailed travel itinerary and preliminary accommodation bookings',
      ],
      notes: 'Canada issues multiple-entry visitor visas valid up to the expiration date of your passport.',
    };
  }

  // Destination: Turkey
  if (destCode === 'tr') {
    if (gccCountries.includes(natCode)) {
      return {
        visaType: 'Turkey Tourist Entry (Visa-Free)',
        status: 'free',
        duration: 'Instant on Arrival',
        fee: 'Free ($0)',
        validity: '90 Days Stay within any 180-Day Period',
        requirements: ['Valid passport with at least 6 months remaining validity'],
        notes: 'Citizens of GCC countries are completely exempt from visa requirements for tourism.',
      };
    }
    return {
      visaType: 'Turkey Electronic / Sticker Visa (eVisa / Consular)',
      status: 'evisa',
      duration: 'Instant Online (eVisa) or 3-5 Days (Sticker)',
      fee: '$20 - $60 USD',
      validity: '30 - 90 Days',
      requirements: [
        'Valid passport with at least 6 months validity',
        'Valid supporting visa/residence from US, UK, Schengen, or Ireland for instant eVisa',
        'Or application via authorized Gateway center for sticker visa',
      ],
      notes: 'Travelers holding valid US, UK, or Schengen visas can obtain an instant eVisa online in minutes.',
    };
  }

  // Destination: Japan
  if (destCode === 'jp') {
    const isGcc = gccCountries.includes(natCode);
    return {
      visaType: isGcc ? 'Japan Electronic Visa (Japan eVisa)' : 'Japan Official Consular Tourist Visa',
      status: isGcc ? 'evisa' : 'required',
      duration: isGcc ? '3 - 5 Business Days Online' : '7 - 10 Business Days',
      fee: 'JPY 3,000 (~$22 USD)',
      validity: 'Single Entry Stay up to 90 Days',
      requirements: [
        'Valid passport with at least 6 months validity',
        'Detailed daily itinerary schedule in Japan',
        'Confirmed flight and hotel accommodation vouchers',
        'Recent bank statements proving adequate funds',
      ],
      notes: 'GCC nationals and eligible residents can conveniently apply via the official Japan e-Visa digital portal.',
    };
  }

  // Destination: Maldives / Seychelles
  if (destCode === 'mv' || destCode === 'sc') {
    return {
      visaType: 'Complimentary Tourist Visa on Arrival (VoA)',
      status: 'voa',
      duration: 'Immediate at Port of Entry',
      fee: 'Free ($0)',
      validity: '30 Days (Extendable)',
      requirements: [
        'Valid passport with at least 6 months validity',
        'Confirmed return/onward flight ticket and resort booking confirmation',
        'Completed online traveler declaration (IMUGA) within 96 hours prior to arrival',
      ],
      notes: 'All nationalities receive a complimentary 30-day tourist visa on arrival at Velana International Airport.',
    };
  }

  // Fallback for general countries
  return {
    visaType: `Tourist Entry Visa to ${destination.nameEn}`,
    status: 'required',
    duration: '5 - 12 Business Days',
    fee: 'Standard Consular Fee (~$50 - $90 USD)',
    validity: '30 to 90 Days',
    requirements: [
      'Valid passport with at least 6 months remaining validity',
      'Confirmed roundtrip flight itinerary and hotel accommodation voucher',
      'Proof of financial solvency or official employment verification letter',
      'Certified travel insurance policy and recent passport photos',
    ],
    notes: `Applications are processed through the consular section of the Embassy of ${destination.nameEn} or its accredited visa portal.`,
  };
}


// ── WORLD COMPLETION ───────────────────────────────────────────────────────
// Guarantees EVERY country (and one principal airport per country) is present
// in the Nationality / Residence / Destination and airport pickers.
(function completeWorldData() {
  const flagIso = (flag: string) => {
    const cps = Array.from(flag || '').map(c => c.codePointAt(0) || 0);
    return cps.length >= 2 && cps[0] >= 0x1f1e6
      ? String.fromCharCode(cps[0] - 0x1f1e6 + 65, cps[1] - 0x1f1e6 + 65)
      : '';
  };
  const haveCountry = new Set(WORLD_COUNTRIES.map(c => c.id.toLowerCase()));
  const haveAirportIso = new Set(AIRPORT_OPTIONS.map(a => flagIso(a.flag)));
  const haveIata = new Set(AIRPORT_OPTIONS.map(a => a.code));

  MASTER_COUNTRIES.forEach(m => {
    if (!haveCountry.has(m.iso.toLowerCase())) {
      WORLD_COUNTRIES.push({
        id: m.iso.toLowerCase(),
        nameAr: m.ar,
        nameEn: m.en,
        flag: isoToFlag(m.iso),
        continent: m.continent,
        code: m.iso,
      });
    }
    if (m.iata && !haveAirportIso.has(m.iso) && !haveIata.has(m.iata)) {
      AIRPORT_OPTIONS.push({
        code: m.iata,
        cityAr: m.cityAr,
        cityEn: m.cityEn,
        countryAr: m.ar,
        airportName: m.airportAr,
        flag: isoToFlag(m.iso),
      });
    }
  });
})();
