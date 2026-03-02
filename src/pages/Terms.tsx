import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const Terms = () => {
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
          <h1 className="text-2xl font-bold">{t('terms.title')}</h1>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-sm text-muted-foreground mb-6">
            {t('terms.lastUpdated')}: {new Date().toLocaleDateString(currentLanguage)}
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t('terms.acceptance.title')}</h2>
            <p className="text-muted-foreground">
              {t('terms.acceptance.description')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t('terms.license.title')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('terms.license.description')}
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>{t('terms.license.item1')}</li>
              <li>{t('terms.license.item2')}</li>
              <li>{t('terms.license.item3')}</li>
              <li>{t('terms.license.item4')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t('terms.accounts.title')}</h2>
            <p className="text-muted-foreground">
              {t('terms.accounts.description')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t('terms.liability.title')}</h2>
            <p className="text-muted-foreground">
              {t('terms.liability.description')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t('terms.contact.title')}</h2>
            <p className="text-muted-foreground">
              {t('terms.contact.description')}
            </p>
            <p className="font-medium mt-2">ernst@cinemind.tech</p>
          </section>
        </div>
      </div>
    </div>
  );
};
