import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Star, Users, Zap, Shield, Download, Play, Brain, Search, Lightbulb, BookOpen, Heart } from "lucide-react";

export const Marketing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Brain className="w-8 h-8 text-primary" />,
      title: "AI Movie Identification",
      description: "Describe any movie scene, quote, or feeling and our advanced AI will identify it instantly.",
      highlight: "Never lose a movie memory again"
    },
    {
      icon: <Search className="w-8 h-8 text-primary" />,
      title: "Smart Recommendations",
      description: "Get personalized movie suggestions based on your mood, preferences, and viewing history.",
      highlight: "Discover your next favorite film"
    },
    {
      icon: <Lightbulb className="w-8 h-8 text-primary" />,
      title: "Movie Explanations",
      description: "Understand the deeper meaning, symbolism, and themes of any film with AI-powered analysis.",
      highlight: "See movies in a new light"
    },
    {
      icon: <Play className="w-8 h-8 text-primary" />,
      title: "Streaming Availability",
      description: "Find where to watch movies across all major platforms including Netflix, Disney+, and more.",
      highlight: "Watch instantly, anywhere"
    },
    {
      icon: <Heart className="w-8 h-8 text-primary" />,
      title: "CineDNA Profile",
      description: "Build a unique movie personality profile that learns from your preferences and evolves over time.",
      highlight: "Your cinematic fingerprint"
    },
    {
      icon: <BookOpen className="w-8 h-8 text-primary" />,
      title: "Similar Movies",
      description: "Discover films like the ones you love with our intelligent recommendation engine.",
      highlight: "Expand your movie horizons"
    }
  ];

  const stats = [
    { number: "1M+", label: "Movies Identified" },
    { number: "500K+", label: "Happy Users" },
    { number: "99.9%", label: "Accuracy Rate" },
    { number: "24/7", label: "AI Support" }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Film Student",
      content: "CineMind helped me identify that obscure French film I saw years ago. The AI is incredibly accurate!",
      rating: 5
    },
    {
      name: "Mike Rodriguez",
      role: "Movie Enthusiast",
      content: "The CineDNA feature is amazing. It really understands my taste and suggests perfect movies.",
      rating: 5
    },
    {
      name: "Emma Thompson",
      role: "Film Critic",
      content: "The movie explanations are insightful and help me understand films on a deeper level.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen p-2 sm:p-4 relative">
      {/* Background Neural Network Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-px h-32 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
        <div className="absolute top-1/3 right-1/3 w-32 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-2">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="rounded-full w-10 h-10 p-0 hover:bg-secondary/50 touch-manipulation flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            About CineMind
          </h1>
        </div>

        {/* Hero Section */}
        <Card className="neural-card p-6 sm:p-8 mb-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Your Personal AI Movie Memory Companion
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground mb-6">
              Never forget a movie again. CineMind uses advanced AI to identify, explain, and recommend movies based on your memories and preferences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="neural-button text-lg px-8 py-3"
                onClick={() => navigate("/")}
              >
                <Download className="w-5 h-5 mr-2" />
                Try CineMind Now
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-3"
                onClick={() => navigate("/discover")}
              >
                <Play className="w-5 h-5 mr-2" />
                Discover Movies
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats Section */}
        <Card className="neural-card p-4 sm:p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Features Section */}
        <Card className="neural-card p-4 sm:p-6 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">Powerful Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-4 bg-secondary/30 rounded-lg">
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm mb-3">{feature.description}</p>
                <p className="text-primary text-sm font-medium">{feature.highlight}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* How It Works */}
        <Card className="neural-card p-4 sm:p-6 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Describe Your Memory</h3>
              <p className="text-muted-foreground text-sm">Tell us about the movie - a scene, quote, or feeling you remember.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Analysis</h3>
              <p className="text-muted-foreground text-sm">Our advanced AI analyzes your description and searches our movie database.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Get Results</h3>
              <p className="text-muted-foreground text-sm">Receive the movie title, details, and where to watch it.</p>
            </div>
          </div>
        </Card>

        {/* Testimonials */}
        <Card className="neural-card p-4 sm:p-6 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">What Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="p-4 bg-secondary/30 rounded-lg">
                <div className="flex items-center mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm mb-3">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-sm">{testimonial.name}</div>
                  <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* CTA Section */}
        <Card className="neural-card p-6 sm:p-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Never Forget a Movie Again?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join thousands of movie lovers who use CineMind to identify, understand, and discover amazing films.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="neural-button text-lg px-8 py-3"
              onClick={() => navigate("/")}
            >
              <Download className="w-5 h-5 mr-2" />
              Get Started Free
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-3"
              onClick={() => navigate("/support")}
            >
              <Users className="w-5 h-5 mr-2" />
              Learn More
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
