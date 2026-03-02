import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { translationService } from '@/services/translationService';

import en from './locales/en.json';

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

const TRANSLATION_CACHE_PREFIX = 'cinemind_i18n_';
const TRANSLATION_CACHE_VERSION = 'v23';

function getCachedTranslations(lang: string): Record<string, string> | null {
  try {
    const cached = localStorage.getItem(`${TRANSLATION_CACHE_PREFIX}${lang}_${TRANSLATION_CACHE_VERSION}`);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {}
  return null;
}

function setCachedTranslations(lang: string, translations: Record<string, string>): void {
  try {
    localStorage.setItem(`${TRANSLATION_CACHE_PREFIX}${lang}_${TRANSLATION_CACHE_VERSION}`, JSON.stringify(translations));
  } catch {}
}

const translatedResources: Record<string, Record<string, Record<string, string>>> = {
  en: { translation: en },
};

async function translateResource(targetLang: string): Promise<Record<string, string>> {
  const translated: Record<string, string> = {};
  const entries = Object.entries(en);
  
  const batchSize = 25;
  const batches: [string, string][][] = [];
  
  for (let i = 0; i < entries.length; i += batchSize) {
    batches.push(entries.slice(i, i + batchSize));
  }
  
  const results = await Promise.all(
    batches.map(async (batch) => {
      const texts = batch.map(([, value]) => value);
      const translatedTexts = await translationService.translateBatch(texts, targetLang);
      return batch.map(([key], index) => [key, translatedTexts[index]] as [string, string]);
    })
  );
  
  results.flat().forEach(([key, value]) => {
    translated[key] = value;
  });
  
  return translated;
}

export async function loadLanguage(lang: string): Promise<void> {
  if (lang === 'en' || translatedResources[lang]) {
    return;
  }

  const cached = getCachedTranslations(lang);
  if (cached) {
    translatedResources[lang] = { translation: cached };
    i18n.addResourceBundle(lang, 'translation', cached, true, true);
    return;
  }

  try {
    const translated = await translateResource(lang);
    translatedResources[lang] = { translation: translated };
    i18n.addResourceBundle(lang, 'translation', translated, true, true);
    setCachedTranslations(lang, translated);
  } catch {
    // Language loading failed, fallback to English
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
