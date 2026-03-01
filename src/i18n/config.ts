import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { translationService } from '@/services/translationService';

import en from './locales/en.json';

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'fil', name: 'Filipino', nativeName: 'Filipino' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
];

export { SUPPORTED_LANGUAGES };

const translatedResources: Record<string, Record<string, Record<string, string>>> = {
  en: { translation: en },
};

async function translateResource(targetLang: string): Promise<Record<string, string>> {
  const translated: Record<string, string> = {};
  const entries = Object.entries(en);
  
  const batchSize = 10;
  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);
    const texts = batch.map(([, value]) => value);
    const translatedTexts = await translationService.translateBatch(texts, targetLang);
    
    batch.forEach(([key], index) => {
      translated[key] = translatedTexts[index];
    });
  }
  
  return translated;
}

export async function loadLanguage(lang: string): Promise<void> {
  if (lang === 'en' || translatedResources[lang]) {
    return;
  }

  try {
    const translated = await translateResource(lang);
    translatedResources[lang] = { translation: translated };
    i18n.addResourceBundle(lang, 'translation', translated, true, true);
  } catch (error) {
    console.warn(`Failed to load language ${lang}:`, error);
  }
}

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
    resources: translatedResources,
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
  
  if (langCode !== 'en') {
    loadLanguage(langCode);
  }
  
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

if (initialLanguage !== 'en') {
  loadLanguage(initialLanguage);
}

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
