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

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: translatedResources,
    fallbackLng: 'en',
    debug: false,
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'cinemind_language',
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });

i18n.on('languageChanged', (lng) => {
  if (lng !== 'en') {
    loadLanguage(lng);
  }
  document.documentElement.lang = lng;
  
  if (['ar', 'he', 'fa', 'ur'].includes(lng)) {
    document.documentElement.dir = 'rtl';
  } else {
    document.documentElement.dir = 'ltr';
  }
});

if (i18n.language && i18n.language !== 'en') {
  loadLanguage(i18n.language);
}

export default i18n;
