import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
import { getDetectedLanguageInfo } from '@/i18n';

const LANGUAGE_NOTIFIED_KEY = 'cinemind_language_notified';

export function LanguageAutoDetect() {
  const { toast } = useToast();
  const { t, currentLanguageInfo } = useTranslation();
  const hasNotified = useRef(false);

  useEffect(() => {
    if (hasNotified.current) return;
    
    const alreadyNotified = localStorage.getItem(LANGUAGE_NOTIFIED_KEY);
    if (alreadyNotified) return;

    const info = getDetectedLanguageInfo();
    
    if (info.currentLanguage !== 'en') {
      hasNotified.current = true;
      
      const timer = setTimeout(() => {
        toast({
          title: `${currentLanguageInfo.flag} ${currentLanguageInfo.nativeName}`,
          description: t('toast.languageSet'),
          duration: 4000,
        });
        localStorage.setItem(LANGUAGE_NOTIFIED_KEY, 'true');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [toast, currentLanguageInfo, t]);

  return null;
}
