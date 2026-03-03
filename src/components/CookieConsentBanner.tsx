import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'cinemind_cookie_consent';

export function CookieConsentBanner() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === null) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'accepted');
    } catch {}
    setVisible(false);
  };

  const decline = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'declined');
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label={t('cookies.consentBanner.title')}
      className="fixed bottom-0 left-0 right-0 z-[100] p-4 bg-background/95 backdrop-blur border-t shadow-lg"
    >
      <div className="container mx-auto max-w-4xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {t('cookies.consentBanner.message')}{' '}
          <Link
            to="/cookies"
            className="underline hover:text-foreground"
          >
            {t('cookies.consentBanner.learnMore')}
          </Link>
        </p>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={decline}>
            {t('cookies.consentBanner.decline')}
          </Button>
          <Button size="sm" onClick={accept}>
            {t('cookies.consentBanner.accept')}
          </Button>
        </div>
      </div>
    </div>
  );
}
