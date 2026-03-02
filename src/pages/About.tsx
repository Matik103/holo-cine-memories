import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Brain, Sparkles, Users, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const About = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const features = [
    {
      icon: Brain,
      titleKey: "about.features.aiPowered.title",
      descriptionKey: "about.features.aiPowered.description"
    },
    {
      icon: Sparkles,
      titleKey: "about.features.cineDNA.title",
      descriptionKey: "about.features.cineDNA.description"
    },
    {
      icon: Users,
      titleKey: "about.features.community.title",
      descriptionKey: "about.features.community.description"
    },
    {
      icon: Target,
      titleKey: "about.features.precision.title",
      descriptionKey: "about.features.precision.description"
    }
  ];

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
          <h1 className="text-2xl font-bold">{t('about.title')}</h1>
        </div>

        <div className="space-y-6">
          {/* Mission */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">{t('about.mission.title')}</h2>
                <p className="text-muted-foreground text-lg">
                  {t('about.mission.description')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{t(feature.titleKey)}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{t(feature.descriptionKey)}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Story */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('about.story.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {t('about.story.paragraph1')}
              </p>
              <p className="text-muted-foreground">
                {t('about.story.paragraph2')}
              </p>
              <p className="text-muted-foreground">
                {t('about.story.paragraph3')}
              </p>
            </CardContent>
          </Card>

          {/* Data Sources – OMDb attribution (required for app store) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('about.dataSources.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {t('about.dataSources.omdbAttribution')} <a href="https://www.omdbapi.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OMDb API</a> (https://www.omdbapi.com).
              </p>
              <p className="text-sm text-muted-foreground italic">
                {t('about.dataSources.disclaimer')}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('about.dataSources.mediaNote')}
              </p>
            </CardContent>
          </Card>

          {/* Version & Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('about.contact.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">{t('about.contact.version')}</p>
                  <p className="font-medium">1.0.0</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('about.contact.contactLabel')}</p>
                  <p className="font-medium">ernst@cinemind.tech</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('about.contact.copyright')}</p>
                  <p className="font-medium">© 2024 CineMind. {t('about.contact.allRightsReserved')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
