import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useCallback } from 'react';
import { SUPPORTED_LANGUAGES } from '@/i18n';

export function useTranslation() {
  const { t, i18n } = useI18nTranslation();

  const currentLanguage = i18n.language?.split('-')[0] || 'en';
  const currentLanguageInfo = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) 
    || SUPPORTED_LANGUAGES.find(l => currentLanguage.startsWith(l.code))
    || SUPPORTED_LANGUAGES[0];

  // Language change is now instant - all translations are bundled
  const changeLanguage = useCallback((lang: string): { success: boolean } => {
    try {
      i18n.changeLanguage(lang);
      return { success: true };
    } catch {
      return { success: false };
    }
  }, [i18n]);

  const getLanguageName = useCallback((code: string) => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
    return lang?.nativeName || lang?.name || code;
  }, []);

  return {
    t,
    i18n,
    currentLanguage,
    currentLanguageInfo,
    changeLanguage,
    getLanguageName,
    isLoading: false, // Never loading - all translations are bundled
    error: null,
    clearError: () => {},
    supportedLanguages: SUPPORTED_LANGUAGES,
  };
}

export { useTranslation as default };
