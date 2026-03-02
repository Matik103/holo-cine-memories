import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const Cookies = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language?.split('-')[0] || 'en';

  return (
    <div className="min-h-screen bg-background pt-safe-top">
      <div className="container mx-auto px-4 py-6 max-w-4xl pt-6 sm:pt-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{t('cookies.title')}</h1>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-sm text-muted-foreground mb-6">
            {t('cookies.lastUpdated')}: {new Date().toLocaleDateString(currentLanguage)}
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t('cookies.whatAreCookies.title')}</h2>
            <p className="text-muted-foreground">
              {t('cookies.whatAreCookies.description')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t('cookies.howWeUse.title')}</h2>
            <p className="text-muted-foreground mb-4">{t('cookies.howWeUse.intro')}</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>{t('cookies.howWeUse.essential.label')}:</strong> {t('cookies.howWeUse.essential.description')}</li>
              <li><strong>{t('cookies.howWeUse.authentication.label')}:</strong> {t('cookies.howWeUse.authentication.description')}</li>
              <li><strong>{t('cookies.howWeUse.preferences.label')}:</strong> {t('cookies.howWeUse.preferences.description')}</li>
              <li><strong>{t('cookies.howWeUse.analytics.label')}:</strong> {t('cookies.howWeUse.analytics.description')}</li>
              <li><strong>{t('cookies.howWeUse.performance.label')}:</strong> {t('cookies.howWeUse.performance.description')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t('cookies.types.title')}</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">{t('cookies.types.session.title')}</h3>
                <p className="text-muted-foreground">
                  {t('cookies.types.session.description')}
                </p>
              </div>
              <div>
                <h3 className="font-semibold">{t('cookies.types.persistent.title')}</h3>
                <p className="text-muted-foreground">
                  {t('cookies.types.persistent.description')}
                </p>
              </div>
              <div>
                <h3 className="font-semibold">{t('cookies.types.thirdParty.title')}</h3>
                <p className="text-muted-foreground">
                  {t('cookies.types.thirdParty.description')}
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t('cookies.managing.title')}</h2>
            <p className="text-muted-foreground">
              {t('cookies.managing.description')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t('cookies.contact.title')}</h2>
            <p className="text-muted-foreground">
              {t('cookies.contact.description')}
            </p>
            <p className="font-medium mt-2">ernst@cinemind.tech</p>
          </section>
        </div>
      </div>
    </div>
  );
};
