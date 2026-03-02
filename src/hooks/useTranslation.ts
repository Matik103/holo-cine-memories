import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useCallback, useEffect, useState } from 'react';
import { loadLanguage, SUPPORTED_LANGUAGES } from '@/i18n';

export function useTranslation() {
  const { t, i18n } = useI18nTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentLanguage = i18n.language?.split('-')[0] || 'en';
  const currentLanguageInfo = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) 
    || SUPPORTED_LANGUAGES.find(l => currentLanguage.startsWith(l.code))
    || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    if (currentLanguage !== 'en' && !i18n.hasResourceBundle(currentLanguage, 'translation')) {
      setIsLoading(true);
      setError(null);
      loadLanguage(currentLanguage)
        .then(result => {
          if (!result.success && result.error) {
            setError(result.error);
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [currentLanguage, i18n]);

  const changeLanguage = useCallback(async (lang: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (lang !== 'en') {
        const result = await loadLanguage(lang);
        if (!result.success) {
          setError(result.error || 'Failed to load language');
          setIsLoading(false);
          return result;
        }
      }
      await i18n.changeLanguage(lang);
      setIsLoading(false);
      return { success: true };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to change language';
      setError(errorMsg);
      setIsLoading(false);
      return { success: false, error: errorMsg };
    }
  }, [i18n]);

  const getLanguageName = useCallback((code: string) => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
    return lang?.nativeName || lang?.name || code;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    t,
    i18n,
    currentLanguage,
    currentLanguageInfo,
    changeLanguage,
    getLanguageName,
    isLoading,
    error,
    clearError,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };
}

export { useTranslation as default };
