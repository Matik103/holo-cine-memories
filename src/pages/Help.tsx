import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MessageCircle, Search, Heart, Mic } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Help = () => {
  const navigate = useNavigate();

  const faqItems = [
    {
      question: "How does CineMind work?",
      answer: "CineMind uses AI to understand your movie preferences and provide personalized recommendations. Simply describe what you're looking for, and our AI will suggest movies that match your mood and taste."
    },
    {
      question: "What is CineDNA?",
      answer: "CineDNA is your personalized movie profile that learns from your searches and preferences. The more you use CineMind, the better it becomes at understanding your unique taste in movies."
    },
    {
      question: "How do I use voice search?",
      answer: "Click the microphone icon and speak your movie request. You can describe plot details, actors, or just say what mood you're in for a movie."
    },
    {
      question: "Can I save favorite movies?",
      answer: "Yes! You can add movies to your favorites list by clicking the heart icon. Access your favorites anytime from your profile."
    },
    {
      question: "How accurate are the recommendations?",
      answer: "Our AI continuously learns from your interactions to improve recommendations. The more you use CineMind, the more accurate your suggestions become."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
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
          <h1 className="text-2xl font-bold">Help Center</h1>
        </div>

        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium">Search Movies</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Mic className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium">Voice Search</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium">Save Favorites</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium">Get Support</p>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {faqItems.map((item, index) => (
                <div key={index}>
                  <h3 className="font-semibold mb-2">{item.question}</h3>
                  <p className="text-muted-foreground text-sm">{item.answer}</p>
                  {index < faqItems.length - 1 && <hr className="mt-4" />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Still Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <Button asChild>
                <a href="mailto:ernst@cinemind.tech">Contact Support</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};