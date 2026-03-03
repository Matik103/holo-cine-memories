import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const Privacy = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
          <h1 className="text-2xl font-bold">{t('privacy.title')}</h1>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-sm text-muted-foreground mb-6">
            {t('privacy.lastUpdated')}: September 27, 2025
          </p>

          <p className="text-muted-foreground mb-6">
            {t('privacy.intro')}
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t('privacy.section1.title')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('privacy.section1.intro')}
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>{t('privacy.section1.accountInfo.label')}:</strong> {t('privacy.section1.accountInfo.description')}</li>
              <li><strong>{t('privacy.section1.searchPrefs.label')}:</strong> {t('privacy.section1.searchPrefs.description')}</li>
              <li><strong>{t('privacy.section1.usageData.label')}:</strong> {t('privacy.section1.usageData.description')}</li>
              <li><strong>{t('privacy.section1.deviceInfo.label')}:</strong> {t('privacy.section1.deviceInfo.description')}</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              {t('privacy.section1.noSensitiveData')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t('privacy.section2.title')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('privacy.section2.intro')}
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>{t('privacy.section2.item1')}</li>
              <li>{t('privacy.section2.item2')}</li>
              <li>{t('privacy.section2.item3')}</li>
              <li>{t('privacy.section2.item4')}</li>
              <li>{t('privacy.section2.item5')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t('privacy.section3.title')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('privacy.section3.intro')}
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>{t('privacy.section3.serviceProviders.label')}:</strong> {t('privacy.section3.serviceProviders.description')}</li>
              <li><strong>{t('privacy.section3.legal.label')}:</strong> {t('privacy.section3.legal.description')}</li>
              <li><strong>{t('privacy.section3.thirdParty.label')}:</strong> {t('privacy.section3.thirdParty.description')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t('privacy.section4.title')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('privacy.section4.intro')}
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">{t('privacy.section4.youtubeTerms')}</a></li>
              <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">{t('privacy.section4.googlePrivacy')}</a></li>
            </ul>
            <p className="text-muted-foreground mt-4">
              {t('privacy.section4.revokeAccess')} <a href="https://security.google.com/settings/security/permissions" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">{t('privacy.section4.googleSettings')}</a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t('privacy.section5.title')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('privacy.section5.description')}
            </p>
            <p className="text-muted-foreground">
              {t('privacy.section5.moreInfo')} <a href="https://www.omdbapi.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">https://www.omdbapi.com</a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t('privacy.section6.title')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('privacy.section6.description')}{" "}
              <Link to="/advertising" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">{t('privacy.section6.advertisingPage')}</Link> {t('privacy.section6.googleAds')}{" "}
              <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">{t('privacy.section6.googleAdPolicy')}</a>.
            </p>
            <h3 className="text-lg font-medium mb-2">{t('privacy.section6.adServingTitle')}</h3>
            <p className="text-muted-foreground">
              {t('privacy.section6.adServingDescription')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t('privacy.section7.title')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('privacy.section7.intro')}
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>{t('privacy.section7.deletion.label')}:</strong> {t('privacy.section7.deletion.description')}</li>
              <li><strong>{t('privacy.section7.access.label')}:</strong> {t('privacy.section7.access.description')}</li>
              <li><strong>{t('privacy.section7.correction.label')}:</strong> {t('privacy.section7.correction.description')}</li>
              <li><strong>{t('privacy.section7.portability.label')}:</strong> {t('privacy.section7.portability.description')}</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              {t('privacy.section7.deletionNote')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t('privacy.section8.title')}</h2>
            <p className="text-muted-foreground">
              {t('privacy.section8.description')}
            </p>
            <p className="font-medium mt-2">ernst@cinemind.tech</p>
          </section>
        </div>
      </div>
    </div>
  );
};
