import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useCallback, useEffect, useState } from 'react';
import { loadLanguage, SUPPORTED_LANGUAGES } from '@/i18n';

export function useTranslation() {
  const { t, i18n } = useI18nTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const currentLanguage = i18n.language || 'en';
  const currentLanguageInfo = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) 
    || SUPPORTED_LANGUAGES.find(l => currentLanguage.startsWith(l.code))
    || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    if (currentLanguage !== 'en' && !i18n.hasResourceBundle(currentLanguage, 'translation')) {
      setIsLoading(true);
      loadLanguage(currentLanguage).finally(() => setIsLoading(false));
    }
  }, [currentLanguage, i18n]);

  const changeLanguage = useCallback(async (lang: string) => {
    setIsLoading(true);
    try {
      if (lang !== 'en') {
        await loadLanguage(lang);
      }
      await i18n.changeLanguage(lang);
    } finally {
      setIsLoading(false);
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
    isLoading,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };
}

export { useTranslation as default };
