import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Megaphone } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const Advertising = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background pt-safe-top">
      <div className="container mx-auto px-4 py-6 max-w-4xl pt-6 sm:pt-4">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2"
            aria-label={t('common.back')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{t('advertising.title')}</h1>
        </div>

        <Card className="neural-card">
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Megaphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{t('advertising.thirdParty.title')}</h2>
                <p className="text-sm text-muted-foreground">{t('advertising.thirdParty.subtitle')}</p>
              </div>
            </div>

            <p className="text-muted-foreground">
              {t('advertising.description')}
            </p>

            <section>
              <h3 className="font-semibold mb-2">{t('advertising.whatThisMeans.title')}</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>{t('advertising.whatThisMeans.item1')}</li>
                <li>{t('advertising.whatThisMeans.item2')}</li>
                <li>{t('advertising.whatThisMeans.item3')}</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">{t('advertising.moreInfo.title')}</h3>
              <p className="text-muted-foreground mb-3">
                {t('advertising.moreInfo.description')}
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>
                  <a
                    href="https://policies.google.com/technologies/ads"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {t('advertising.moreInfo.googleDataLink')}
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.google.com/adsense/answer/48182"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {t('advertising.moreInfo.adsensePolicies')}
                  </a>
                </li>
                <li>
                  <a
                    href="https://adssettings.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {t('advertising.moreInfo.adSettings')}
                  </a>
                </li>
              </ul>
            </section>

            <p className="text-sm text-muted-foreground">
              {t('advertising.privacyNote')}{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                {t('privacy.title')}
              </Link>. {t('advertising.reviewNote')}{" "}
              <Link to="/review" className="text-primary hover:underline">
                {t('advertising.reviewPages')}
              </Link> {t('advertising.forUrls')}.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
