import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Brain, Sparkles, Users, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const About = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Recommendations",
      description: "Our advanced AI understands your movie preferences to suggest perfect matches for your mood and taste."
    },
    {
      icon: Sparkles,
      title: "CineDNA Technology",
      description: "Personalized movie DNA that evolves with your viewing preferences, getting smarter with every interaction."
    },
    {
      icon: Users,
      title: "Community-Driven",
      description: "Built for movie lovers, by movie lovers. Discover films you never knew existed."
    },
    {
      icon: Target,
      title: "Precision Matching",
      description: "Find exactly what you're looking for with our intelligent search and voice recognition."
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
          <h1 className="text-2xl font-bold">About CineMind</h1>
        </div>

        <div className="space-y-6">
          {/* Mission */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Discover Your Perfect Movie</h2>
                <p className="text-muted-foreground text-lg">
                  CineMind is the intelligent movie discovery platform that understands your unique taste. 
                  Using advanced AI and personalized CineDNA technology, we help you find movies that 
                  perfectly match your mood, preferences, and viewing history.
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
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Story */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Our Story</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                CineMind was born from a simple frustration: spending more time searching for movies 
                than actually watching them. We believed there had to be a better way to discover 
                films that truly resonate with individual tastes.
              </p>
              <p className="text-muted-foreground">
                Our team of movie enthusiasts and AI experts came together to create a platform that 
                doesn't just recommend popular movies, but understands the nuances of what makes a 
                film perfect for you at any given moment.
              </p>
              <p className="text-muted-foreground">
                Today, CineMind helps thousands of users discover their next favorite movie, 
                creating a more personalized and enjoyable movie-watching experience.
              </p>
            </CardContent>
          </Card>

          {/* Version & Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Get in Touch</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Version</p>
                  <p className="font-medium">1.0.0</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <p className="font-medium">ernst@cinemind.tech</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Copyright</p>
                  <p className="font-medium">© 2024 CineMind. All rights reserved.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};