import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const License = () => {
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
          <h1 className="text-2xl font-bold">{t('license.title')}</h1>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-sm text-muted-foreground mb-6">
            {t('license.lastUpdated')}: {new Date().toLocaleDateString(currentLanguage)}
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t('license.cinemindLicense.title')}</h2>
            <p className="text-muted-foreground">
              {t('license.cinemindLicense.description')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t('license.grant.title')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('license.grant.description')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t('license.restrictions.title')}</h2>
            <p className="text-muted-foreground mb-4">{t('license.restrictions.intro')}</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>{t('license.restrictions.item1')}</li>
              <li>{t('license.restrictions.item2')}</li>
              <li>{t('license.restrictions.item3')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t('license.intellectualProperty.title')}</h2>
            <p className="text-muted-foreground">
              {t('license.intellectualProperty.description')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t('license.termination.title')}</h2>
            <p className="text-muted-foreground">
              {t('license.termination.description')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t('license.contact.title')}</h2>
            <p className="text-muted-foreground">
              {t('license.contact.description')}
            </p>
            <p className="font-medium mt-2">ernst@cinemind.tech</p>
          </section>
        </div>
      </div>
    </div>
  );
};
