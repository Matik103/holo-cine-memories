import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all locale files statically for instant language switching
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import pt from './locales/pt.json';
import de from './locales/de.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import ar from './locales/ar.json';
import hi from './locales/hi.json';
import ht from './locales/ht.json';
import id from './locales/id.json';

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ht', name: 'Haitian Creole', nativeName: 'Kreyòl Ayisyen', flag: '🇭🇹' },
];

export { SUPPORTED_LANGUAGES };

// All translations are bundled statically - no runtime translation needed
const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  pt: { translation: pt },
  de: { translation: de },
  zh: { translation: zh },
  ja: { translation: ja },
  ko: { translation: ko },
  ar: { translation: ar },
  hi: { translation: hi },
  ht: { translation: ht },
  id: { translation: id },
};

function getBrowserLanguage(): string {
  const browserLang = navigator.language || (navigator as any).userLanguage || 'en';
  const langCode = browserLang.split('-')[0].toLowerCase();
  
  const supported = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
  return supported ? langCode : 'en';
}

function getInitialLanguage(): string {
  try {
    const stored = localStorage.getItem('cinemind_language');
    if (stored) {
      const supported = SUPPORTED_LANGUAGES.find(l => l.code === stored);
      if (supported) return stored;
    }
  } catch {}
  
  return getBrowserLanguage();
}

const initialLanguage = getInitialLanguage();

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage,
    fallbackLng: 'en',
    debug: false,
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'cinemind_language',
      convertDetectedLanguage: (lng: string) => {
        const langCode = lng.split('-')[0].toLowerCase();
        const supported = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
        return supported ? langCode : 'en';
      },
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });

i18n.on('languageChanged', (lng) => {
  const langCode = lng.split('-')[0].toLowerCase();
  
  document.documentElement.lang = langCode;
  
  if (['ar', 'he', 'fa', 'ur'].includes(langCode)) {
    document.documentElement.dir = 'rtl';
  } else {
    document.documentElement.dir = 'ltr';
  }
  
  try {
    localStorage.setItem('cinemind_language', langCode);
  } catch {}
});

export function getDetectedLanguageInfo() {
  const browserLang = getBrowserLanguage();
  const currentLang = i18n.language?.split('-')[0] || 'en';
  const isAutoDetected = !localStorage.getItem('cinemind_language');
  
  return {
    browserLanguage: browserLang,
    currentLanguage: currentLang,
    isAutoDetected,
    languageInfo: SUPPORTED_LANGUAGES.find(l => l.code === currentLang) || SUPPORTED_LANGUAGES[0],
  };
}

export default i18n;
