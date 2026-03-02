import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MessageCircle, Search, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const Help = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const faqItems = [
    {
      questionKey: "help.faq.howItWorks.question",
      answerKey: "help.faq.howItWorks.answer"
    },
    {
      questionKey: "help.faq.cineDNA.question",
      answerKey: "help.faq.cineDNA.answer"
    },
    {
      questionKey: "help.faq.favorites.question",
      answerKey: "help.faq.favorites.answer"
    },
    {
      questionKey: "help.faq.accuracy.question",
      answerKey: "help.faq.accuracy.answer"
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
          <h1 className="text-2xl font-bold">{t('help.title')}</h1>
        </div>

        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('help.quickActions.title')}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium">{t('help.quickActions.searchMovies')}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium">{t('help.quickActions.saveFavorites')}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium">{t('help.quickActions.getSupport')}</p>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('help.faq.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {faqItems.map((item, index) => (
                <div key={index}>
                  <h3 className="font-semibold mb-2">{t(item.questionKey)}</h3>
                  <p className="text-muted-foreground text-sm">{t(item.answerKey)}</p>
                  {index < faqItems.length - 1 && <hr className="mt-4" />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('help.support.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t('help.support.description')}
              </p>
              <Button asChild>
                <a href="mailto:ernst@cinemind.tech">{t('help.support.contactButton')}</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
