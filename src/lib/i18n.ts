import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translation files
import en from '../locales/en.json';
import ar from '../locales/ar.json';
import fr from '../locales/fr.json';
import ru from '../locales/ru.json';

export const LANGUAGE_STORAGE_KEY = '@vanir_app_language';

export type AppLanguage = 'en' | 'ar' | 'fr' | 'ru';

export interface LanguageOption {
  code: AppLanguage;
  name: string;
  nativeName: string;
  flag: string;
  isRTL: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', isRTL: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇦🇪', isRTL: true },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', isRTL: false },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', isRTL: false },
];

const resources = {
  en: { translation: en },
  ar: { translation: ar },
  fr: { translation: fr },
  ru: { translation: ru },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Set default brand language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Asynchronously hydrate user's saved language preference
(async () => {
  try {
    // Keep window layout coordinate system stable across all languages
    if (I18nManager.isRTL) {
      I18nManager.allowRTL(false);
      I18nManager.forceRTL(false);
    }
    const savedLang = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLang && (savedLang === 'en' || savedLang === 'ar' || savedLang === 'fr' || savedLang === 'ru')) {
      await i18n.changeLanguage(savedLang);
    }
  } catch (err) {
    console.warn('[i18n] Failed to load saved language:', err);
  }
})();

/**
 * Changes the app language and persists to storage
 */
export async function setAppLanguage(lang: AppLanguage): Promise<void> {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    await i18n.changeLanguage(lang);

    // Keep layout orientation stable so buttons, icons and navigation don't mirror awkwardly
    if (I18nManager.isRTL) {
      I18nManager.allowRTL(false);
      I18nManager.forceRTL(false);
    }
  } catch (error) {
    console.error('[i18n] Error setting language:', error);
  }
}

export default i18n;
