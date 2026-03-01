import { useState, useEffect } from 'react';
import { X, Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { getDetectedLanguageInfo } from '@/i18n';

const BANNER_DISMISSED_KEY = 'cinemind_lang_banner_dismissed';

export function LanguageDetectionBanner() {
  const { currentLanguage, currentLanguageInfo, changeLanguage } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [detectedInfo, setDetectedInfo] = useState<ReturnType<typeof getDetectedLanguageInfo> | null>(null);

  useEffect(() => {
    const info = getDetectedLanguageInfo();
    setDetectedInfo(info);

    if (info.isAutoDetected && info.currentLanguage !== 'en') {
      const dismissed = localStorage.getItem(BANNER_DISMISSED_KEY);
      if (!dismissed) {
        const timer = setTimeout(() => setIsVisible(true), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleConfirm = () => {
    localStorage.setItem(BANNER_DISMISSED_KEY, 'true');
    setIsVisible(false);
  };

  const handleSwitchToEnglish = async () => {
    await changeLanguage('en');
    localStorage.setItem(BANNER_DISMISSED_KEY, 'true');
    setIsVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(BANNER_DISMISSED_KEY, 'true');
    setIsVisible(false);
  };

  if (!isVisible || !detectedInfo) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-card border border-border rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Globe className="w-5 h-5 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              {currentLanguageInfo.nativeName}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              We detected your language as {currentLanguageInfo.name}
            </p>
            
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="default"
                onClick={handleConfirm}
                className="h-8 text-xs"
              >
                <Check className="w-3 h-3 mr-1" />
                Keep {currentLanguageInfo.nativeName}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSwitchToEnglish}
                className="h-8 text-xs"
              >
                Use English
              </Button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
