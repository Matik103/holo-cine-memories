import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Brain, Play, Search, Lightbulb, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MovieData {
  title: string;
  year: string;
  poster: string;
  description: string;
  painPoint: string;
  solution: string;
}

const movies: MovieData[] = [
  {
    title: "Avengers: Endgame",
    year: "2019",
    description: "I am inevitable.",
    painPoint: "Lost in the MCU timeline?",
    solution: "Track complex franchises and understand every connection.",
    poster: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg"
  },
  {
    title: "Inception",
    year: "2010",
    description: "A dream within a dream within a dream...",
    painPoint: "Ever forgot a movie like this?",
    solution: "CineMind remembers every detail, even the most complex plots.",
    poster: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg"
  },
  {
    title: "Blade Runner 2049",
    year: "2017",
    description: "More human than human is our motto.",
    painPoint: "Lost in philosophical sci-fi?",
    solution: "Get instant explanations of deep themes and symbolism.",
    poster: "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg"
  },
  {
    title: "The Dark Knight",
    year: "2008",
    description: "Why so serious?",
    painPoint: "Want to rewatch this instantly?",
    solution: "Find where to watch any movie, anywhere, anytime.",
    poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg"
  },
  {
    title: "The Matrix",
    year: "1999",
    description: "There is no spoon.",
    painPoint: "Confused by the meaning?",
    solution: "Understand every layer of symbolism and philosophy.",
    poster: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg"
  },
  {
    title: "Titanic",
    year: "1997",
    description: "I'm the king of the world!",
    painPoint: "Where can I watch now?",
    solution: "Get instant streaming availability across all platforms.",
    poster: "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg"
  },
  {
    title: "The Lion King",
    year: "1994",
    description: "Hakuna Matata!",
    painPoint: "Childhood memories fading?",
    solution: "Preserve and rediscover your favorite childhood films.",
    poster: "https://image.tmdb.org/t/p/w500/sKCr78MXSLixwmZ8DyJLrpMsd15.jpg"
  }
];

export const LandingPage = ({ onStart }: { onStart: () => void }) => {
  const [movieData, setMovieData] = useState<MovieData[]>([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchMoviePosters();
  }, []);

  const fetchMoviePosters = async () => {
    // For now, use the hardcoded posters. Later we can implement OMDb API
    setMovieData(movies);
    setIsLoading(false);
  };

  const handleCardFlip = (index: number) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const nextCard = () => {
    setCurrentCard((prev) => (prev + 1) % movieData.length);
  };

  const prevCard = () => {
    setCurrentCard((prev) => (prev - 1 + movieData.length) % movieData.length);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="neural-card p-8 flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading your movie memories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Memory Cloud Effect */}
        <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 sm:w-56 sm:h-56 md:w-72 md:h-72 lg:w-80 lg:h-80 bg-gradient-to-l from-accent/10 to-primary/10 rounded-full blur-3xl animate-pulse animation-delay-2s" />
        
        {/* Floating Particles */}
        <div className="floating-particle absolute top-16 right-16 sm:top-20 sm:right-20 w-1 h-1 sm:w-2 sm:h-2 bg-primary rounded-full opacity-30"></div>
        <div className="floating-particle absolute bottom-24 left-24 sm:bottom-32 sm:left-32 w-1 h-1 sm:w-1 sm:h-1 bg-accent rounded-full opacity-50 animation-delay-3s"></div>
        <div className="floating-particle absolute top-1/2 left-1/3 w-1 h-1 sm:w-2 sm:h-2 bg-primary rounded-full opacity-40 animation-delay-1-5s"></div>
        
        {/* Neural Network Lines */}
        <div className="absolute top-1/4 left-1/4 w-px h-16 sm:h-24 md:h-32 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
        <div className="absolute top-1/3 right-1/3 w-16 sm:w-24 md:w-32 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
        <div className="absolute bottom-1/3 left-1/2 w-px h-12 sm:h-20 md:h-24 bg-gradient-to-b from-transparent via-primary/15 to-transparent" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12 space-y-4 sm:space-y-6">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="relative">
              <Brain className="w-8 h-8 sm:w-12 sm:h-12 text-primary" />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg animate-pulse" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              CineMind
            </h1>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-4">
            Remember Any Movie.<br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Anywhere. Anytime.
            </span>
          </h2>
          
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Your AI-powered movie memory companion that never forgets a single detail, 
            meaning, or where to watch your favorite films.
          </p>
        </div>

        {/* Movie Cards Carousel */}
        <div className="w-full max-w-4xl mb-8 sm:mb-12">
          <div className="relative">
            {/* Card Container */}
            <div className="flex justify-center">
              <div className="relative w-72 h-80 sm:w-80 sm:h-96 perspective-1000">
                {movieData.map((movie, index) => {
                  const isActive = index === currentCard;
                  const isFlipped = flippedCards.has(index);
                  
                  return (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-all duration-700 transform ${
                        isActive 
                          ? 'opacity-100 scale-100 z-10 translate-x-0 rotate-y-0' 
                          : 'opacity-0 scale-75 z-0'
                      }`}
                    >
                      <Card 
                        className={`w-full h-full cursor-pointer transition-transform duration-700 ease-in-out hover:scale-105 ${
                          isFlipped ? 'rotate-y-180' : ''
                        }`}
                        onClick={() => handleCardFlip(index)}
                      >
                        <CardContent className="p-0 h-full relative">
                          {/* Front of Card - Movie Poster */}
                          <div className="absolute inset-0 backface-hidden">
                            <div className="relative w-full h-full">
                              <img
                                src={movie.poster}
                                alt={movie.title}
                                className={`w-full h-full object-cover rounded-lg ${
                                  movie.title === "Inception" ? "object-top" : ""
                                }`}
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder.svg';
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                              <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4">
                                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2">{movie.title}</h3>
                                <p className="text-xs sm:text-sm text-gray-300 mb-1 sm:mb-2">{movie.year}</p>
                                <p className="text-xs sm:text-sm text-gray-400 italic">"{movie.description}"</p>
                              </div>
                              <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
                                <div 
                                  className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm cursor-pointer hover:bg-white/30 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCardFlip(index);
                                  }}
                                  title="Flip card to see AI response"
                                >
                                  <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Back of Card - AI Response */}
                          <div className="absolute inset-0 rotate-y-180 backface-hidden">
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 p-3 sm:p-6 flex flex-col justify-center items-center text-center rounded-lg relative">
                              {/* Flip back button */}
                              <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
                                <div 
                                  className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm cursor-pointer hover:bg-white/30 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCardFlip(index);
                                  }}
                                  title="Flip back to movie poster"
                                >
                                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                  </svg>
                                </div>
                              </div>
                              
                              <div className="mb-2 sm:mb-4">
                                <Brain className="w-8 h-8 sm:w-12 sm:h-12 text-primary mx-auto mb-1 sm:mb-2" />
                                <h4 className="text-sm sm:text-base md:text-lg font-semibold text-white mb-1 sm:mb-2">{movie.painPoint}</h4>
                              </div>
                              <p className="text-xs sm:text-sm text-gray-300 mb-2 sm:mb-4">{movie.solution}</p>
                              <div className="flex gap-1 sm:gap-2">
                                <div className="flex items-center gap-1 text-xs text-primary">
                                  <Search className="w-2 h-2 sm:w-3 sm:h-3" />
                                  <span className="hidden sm:inline">Identify</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-accent">
                                  <Lightbulb className="w-2 h-2 sm:w-3 sm:h-3" />
                                  <span className="hidden sm:inline">Explain</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-primary">
                                  <Play className="w-2 h-2 sm:w-3 sm:h-3" />
                                  <span className="hidden sm:inline">Watch</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevCard}
              title="Previous movie card"
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextCard}
              title="Next movie card"
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Card Indicators */}
          <div className="flex justify-center gap-1 sm:gap-2 mt-4 sm:mt-6">
            {movieData.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentCard(index)}
                title={`Go to movie card ${index + 1}`}
                className={`w-2 h-2 sm:w-2 sm:h-2 rounded-full transition-colors ${
                  index === currentCard ? 'bg-primary' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-4 sm:space-y-6 px-4">
          <div className="space-y-1 sm:space-y-2">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
              Your CineMind remembers for you.
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Tap any card above to see how CineMind solves your movie memory problems
            </p>
          </div>
          
          <Button
            onClick={onStart}
            size="lg"
            className="neural-button text-sm sm:text-base md:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto w-full sm:w-auto"
          >
            <Brain className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Start Your Memory Journey
          </Button>
        </div>
      </div>
    </div>
  );
};
