export interface LocalizedDestinationInfo {
  name: string;
  country: string;
  status: string;
  region: 'europe' | 'greece' | 'turkey' | 'gulf' | 'islands' | 'other';
  filterQuery: string;
}

interface DestinationTranslation {
  name: { en: string; ar: string; fr: string; ru: string };
  country: { en: string; ar: string; fr: string; ru: string };
  region: 'europe' | 'greece' | 'turkey' | 'gulf' | 'islands' | 'other';
  filterQuery: string;
}

const DESTINATION_DEFINITIONS: DestinationTranslation[] = [
  {
    name: {
      en: 'Dubai & The Arabian Gulf',
      ar: 'دبي والخليج العربي',
      fr: 'Dubaï et le Golfe Arabique',
      ru: 'Дубай и Арабский залив',
    },
    country: {
      en: 'United Arab Emirates 🇦🇪',
      ar: 'الإمارات العربية المتحدة 🇦🇪',
      fr: 'Émirats Arabes Unis 🇦🇪',
      ru: 'ОАЭ 🇦🇪',
    },
    region: 'gulf',
    filterQuery: 'Dubai',
  },
  {
    name: {
      en: 'Cairo, Luxor & Aswan',
      ar: 'القاهرة، الأقصر وأسوان',
      fr: 'Le Caire, Louxor et Assouan',
      ru: 'Каир, Луксор и Асуан',
    },
    country: {
      en: 'Egypt 🇪🇬',
      ar: 'جمهورية مصر العربية 🇪🇬',
      fr: 'Égypte 🇪🇬',
      ru: 'Египет 🇪🇬',
    },
    region: 'other',
    filterQuery: 'Luxor',
  },
  {
    name: {
      en: 'Maldives Private Atolls',
      ar: 'جزر المالديف الملكية',
      fr: 'Atolls Privés des Maldives',
      ru: 'Мальдивские Атоллы',
    },
    country: {
      en: 'Maldives 🇲🇻',
      ar: 'المالديف 🇲🇻',
      fr: 'Maldives 🇲🇻',
      ru: 'Мальдивы 🇲🇻',
    },
    region: 'islands',
    filterQuery: 'Maldives',
  },
  {
    name: {
      en: 'Monaco & The French Riviera',
      ar: 'موناكو والريفييرا الفرنسية',
      fr: 'Monaco et la Côte d’Azur',
      ru: 'Монако и Лазурный Берег',
    },
    country: {
      en: 'Monaco & France 🇫🇷',
      ar: 'موناكو / فرنسا 🇫🇷',
      fr: 'Monaco et France 🇫🇷',
      ru: 'Монако и Франция 🇫🇷',
    },
    region: 'europe',
    filterQuery: 'Monaco',
  },
  {
    name: {
      en: 'Switzerland & Zurich',
      ar: 'سويسرا وزيورخ وجنيف',
      fr: 'Suisse, Zurich et Genève',
      ru: 'Швейцария и Цюрих',
    },
    country: {
      en: 'Switzerland 🇨🇭',
      ar: 'سويسرا 🇨🇭',
      fr: 'Suisse 🇨🇭',
      ru: 'Швейцария 🇨🇭',
    },
    region: 'europe',
    filterQuery: 'Switzerland',
  },
  {
    name: {
      en: 'London & United Kingdom',
      ar: 'لندن والمملكة المتحدة',
      fr: 'Londres et Royaume-Uni',
      ru: 'Лондон и Великобритания',
    },
    country: {
      en: 'United Kingdom 🇬🇧',
      ar: 'المملكة المتحدة 🇬🇧',
      fr: 'Royaume-Uni 🇬🇧',
      ru: 'Великобритания 🇬🇧',
    },
    region: 'europe',
    filterQuery: 'London',
  },
  {
    name: {
      en: 'Athens & Santorini',
      ar: 'أثينا وسانتوريني',
      fr: 'Athènes et Santorin',
      ru: 'Афины и Санторини',
    },
    country: {
      en: 'Greece 🇬🇷',
      ar: 'اليونان 🇬🇷',
      fr: 'Grèce 🇬🇷',
      ru: 'Греция 🇬🇷',
    },
    region: 'greece',
    filterQuery: 'Santorini',
  },
  {
    name: {
      en: 'Istanbul & Bodrum',
      ar: 'إسطنبول وبودروم',
      fr: 'Istanbul et Bodrum',
      ru: 'Стамбул и Бодрум',
    },
    country: {
      en: 'Turkey 🇹🇷',
      ar: 'تركيا 🇹🇷',
      fr: 'Turquie 🇹🇷',
      ru: 'Турция 🇹🇷',
    },
    region: 'turkey',
    filterQuery: 'Istanbul',
  },
  {
    name: {
      en: 'Rome, Milan & Venice',
      ar: 'روما، ميلانو والبندقية',
      fr: 'Rome, Milan et Venise',
      ru: 'Рим, Милан и Венеция',
    },
    country: {
      en: 'Italy 🇮🇹',
      ar: 'إيطاليا 🇮🇹',
      fr: 'Italie 🇮🇹',
      ru: 'Италия 🇮🇹',
    },
    region: 'europe',
    filterQuery: 'Rome',
  },
  {
    name: {
      en: 'Paris & Île-de-France',
      ar: 'باريس وعاصمة النور',
      fr: 'Paris et Île-de-France',
      ru: 'Париж и Иль-де-Франс',
    },
    country: {
      en: 'France 🇫🇷',
      ar: 'فرنسا 🇫🇷',
      fr: 'France 🇫🇷',
      ru: 'Франция 🇫🇷',
    },
    region: 'europe',
    filterQuery: 'Paris',
  },
];

export function getLocalizedDestination(
  rawItem: { id?: string; name?: string; country?: string; status?: string },
  lang: string = 'en',
): LocalizedDestinationInfo {
  const normLang = (lang === 'ar' || lang === 'fr' || lang === 'ru') ? lang : 'en';
  const combined = `${rawItem.id || ''} ${rawItem.name || ''} ${rawItem.country || ''}`.toLowerCase();

  let matchedDef: DestinationTranslation | null = null;

  if (
    combined.includes('dubai') ||
    combined.includes('دبي') ||
    combined.includes('uae') ||
    combined.includes('إمارات') ||
    combined.includes('امارات') ||
    combined.includes('الخليج')
  ) {
    matchedDef = DESTINATION_DEFINITIONS[0]; // Dubai
  } else if (
    combined.includes('luxor') ||
    combined.includes('أقصر') ||
    combined.includes('اقصر') ||
    combined.includes('cairo') ||
    combined.includes('قاهرة') ||
    combined.includes('aswan') ||
    combined.includes('أسوان') ||
    combined.includes('اسوان') ||
    combined.includes('egypt') ||
    combined.includes('مصر')
  ) {
    matchedDef = DESTINATION_DEFINITIONS[1]; // Cairo & Luxor
  } else if (
    combined.includes('maldives') ||
    combined.includes('مالديف') ||
    combined.includes('جزر المالديف') ||
    combined.includes('atoll')
  ) {
    matchedDef = DESTINATION_DEFINITIONS[2]; // Maldives
  } else if (
    combined.includes('monaco') ||
    combined.includes('موناكو') ||
    combined.includes('riviera') ||
    combined.includes('ريفييرا') ||
    combined.includes('الريفييرا') ||
    combined.includes('الرفيرا') ||
    combined.includes('côte d') ||
    combined.includes('nice') ||
    combined.includes('cannes')
  ) {
    matchedDef = DESTINATION_DEFINITIONS[3]; // Monaco & Riviera
  } else if (
    combined.includes('switzerland') ||
    combined.includes('سويسرا') ||
    combined.includes('zurich') ||
    combined.includes('زيورخ') ||
    combined.includes('geneva') ||
    combined.includes('جنيف') ||
    combined.includes('alps') ||
    combined.includes('zermatt') ||
    combined.includes('moritz')
  ) {
    matchedDef = DESTINATION_DEFINITIONS[4]; // Switzerland & Zurich
  } else if (
    combined.includes('london') ||
    combined.includes('لندن') ||
    combined.includes('united kingdom') ||
    combined.includes('المملكة المتحدة') ||
    combined.includes('المملكه المتحده') ||
    combined.includes('britain') ||
    combined.includes('بريطانيا') ||
    combined.includes('edinburgh') ||
    combined.includes('🇬🇧')
  ) {
    matchedDef = DESTINATION_DEFINITIONS[5]; // London & UK
  } else if (
    combined.includes('santorini') ||
    combined.includes('سانتوريني') ||
    combined.includes('athens') ||
    combined.includes('أثينا') ||
    combined.includes('اثينا') ||
    combined.includes('greece') ||
    combined.includes('اليونان') ||
    combined.includes('يونان') ||
    combined.includes('mykonos')
  ) {
    matchedDef = DESTINATION_DEFINITIONS[6]; // Athens & Santorini
  } else if (
    combined.includes('istanbul') ||
    combined.includes('إسطنبول') ||
    combined.includes('اسطنبول') ||
    combined.includes('bodrum') ||
    combined.includes('بودروم') ||
    combined.includes('turkey') ||
    combined.includes('تركيا') ||
    combined.includes('türkiye') ||
    combined.includes('bosphorus')
  ) {
    matchedDef = DESTINATION_DEFINITIONS[7]; // Istanbul & Bodrum
  } else if (
    combined.includes('rome') ||
    combined.includes('روما') ||
    combined.includes('milan') ||
    combined.includes('ميلانو') ||
    combined.includes('venice') ||
    combined.includes('البندقية') ||
    combined.includes('بندقية') ||
    combined.includes('italy') ||
    combined.includes('إيطاليا') ||
    combined.includes('ايطاليا') ||
    combined.includes('amalfi')
  ) {
    matchedDef = DESTINATION_DEFINITIONS[8]; // Rome, Milan & Venice
  } else if (
    combined.includes('paris') ||
    combined.includes('باريس') ||
    combined.includes('france') ||
    combined.includes('فرنسا')
  ) {
    matchedDef = DESTINATION_DEFINITIONS[9]; // Paris
  }

  // Localized status text
  const statusLabels: Record<string, string> = {
    en: 'Featured Destination',
    ar: 'وجهة ملكية مميزة',
    fr: 'Destination en vedette',
    ru: 'Рекомендуемое направление',
  };

  if (matchedDef) {
    return {
      name: matchedDef.name[normLang],
      country: matchedDef.country[normLang],
      status: statusLabels[normLang],
      region: matchedDef.region,
      filterQuery: matchedDef.filterQuery,
    };
  }

  // Fallback if an unrecognized custom item was added
  return {
    name: rawItem.name || 'Global Destination',
    country: rawItem.country || 'International',
    status: statusLabels[normLang],
    region: 'other',
    filterQuery: rawItem.name ? rawItem.name.split(' ')[0] : 'Tours',
  };
}
