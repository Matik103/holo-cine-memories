import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Brain, Search, Lightbulb, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageSelector } from "./LanguageSelector";
import { getCachedLocalizedMovie, getTMDBPosterUrl, type TMDBMovie } from "@/services/tmdbService";
import { translationService } from "@/services/translationService";

interface MovieData {
  id: string;
  title: string;
  year: string;
  poster: string;
  description: string;
  painPointKey: string;
  solutionKey: string;
  localizedTitle?: string;
  localizedOverview?: string;
}

const movies: MovieData[] = [
  {
    id: "inception",
    title: "Inception",
    year: "2010",
    description: "A dream within a dream within a dream...",
    painPointKey: "landing.movies.inception.painPoint",
    solutionKey: "landing.movies.inception.solution",
    poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg"
  },
  {
    id: "darkKnight",
    title: "The Dark Knight",
    year: "2008",
    description: "Why so serious?",
    painPointKey: "landing.movies.darkKnight.painPoint",
    solutionKey: "landing.movies.darkKnight.solution",
    poster: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg"
  },
  {
    id: "interstellar",
    title: "Interstellar",
    year: "2014",
    description: "Love is the one thing that transcends time and space.",
    painPointKey: "landing.movies.interstellar.painPoint",
    solutionKey: "landing.movies.interstellar.solution",
    poster: "https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_SX300.jpg"
  },
  {
    id: "matrix",
    title: "The Matrix",
    year: "1999",
    description: "There is no spoon.",
    painPointKey: "landing.movies.matrix.painPoint",
    solutionKey: "landing.movies.matrix.solution",
    poster: "https://m.media-amazon.com/images/M/MV5BN2NmN2VhMTQtMDNiOS00NDlhLTliMjgtODE2ZTY0ODQyNDRhXkEyXkFqcGc@._V1_SX300.jpg"
  },
  {
    id: "titanic",
    title: "Titanic",
    year: "1997",
    description: "I'm the king of the world!",
    painPointKey: "landing.movies.titanic.painPoint",
    solutionKey: "landing.movies.titanic.solution",
    poster: "https://m.media-amazon.com/images/M/MV5BYzYyN2FiZmUtYWYzMy00MzViLWJkZTMtOGY1ZjgzNWMwN2YxXkEyXkFqcGc@._V1_SX300.jpg"
  },
  {
    id: "lionKing",
    title: "The Lion King",
    year: "1994",
    description: "Hakuna Matata!",
    painPointKey: "landing.movies.lionKing.painPoint",
    solutionKey: "landing.movies.lionKing.solution",
    poster: "https://m.media-amazon.com/images/M/MV5BYTYxNGMyZTYtMjE3MS00MzNjLWFjNmYtMDk3N2FmM2JiM2M1XkEyXkFqcGdeQXVyNjY5NDU4NzI@._V1_SX300.jpg"
  },
  {
    id: "bladeRunner",
    title: "Blade Runner 2049",
    year: "2017",
    description: "More human than human is our motto.",
    painPointKey: "landing.movies.bladeRunner.painPoint",
    solutionKey: "landing.movies.bladeRunner.solution",
    poster: "https://m.media-amazon.com/images/M/MV5BNzA1Njg4NzYxOV5BMl5BanBnXkFtZTgwODk5NjU3MzI@._V1_SX300.jpg"
  }
];

export const LandingPage = ({ onStart }: { onStart: () => void }) => {
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslation();
  const [movieData, setMovieData] = useState<MovieData[]>([]);
  const [localizedData, setLocalizedData] = useState<Map<string, TMDBMovie>>(new Map());
  const [translatedDescriptions, setTranslatedDescriptions] = useState<Map<string, string>>(new Map());
  const [currentCard, setCurrentCard] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMovieData([...movies]);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (currentLanguage === 'en') {
      setLocalizedData(new Map());
      setTranslatedDescriptions(new Map());
      return;
    }

    let mounted = true;

    const fetchLocalizedData = async () => {
      const newLocalizedData = new Map<string, TMDBMovie>();
      const newTranslatedDescriptions = new Map<string, string>();
      
      await Promise.all(
        movies.map(async (movie) => {
          const localized = await getCachedLocalizedMovie(movie.title, movie.year, currentLanguage);
          if (localized) {
            newLocalizedData.set(movie.id, localized);
          }
          
          // If TMDB doesn't have a translation or overview is empty, use translation service
          if (!localized?.overview || localized.overview.trim() === '') {
            try {
              const translated = await translationService.translateText(movie.description, currentLanguage);
              if (mounted) {
                newTranslatedDescriptions.set(movie.id, translated);
              }
            } catch (error) {
              // Failed to translate description - silently continue
            }
          }
        })
      );
      
      if (mounted) {
        setLocalizedData(newLocalizedData);
        setTranslatedDescriptions(newTranslatedDescriptions);
      }
    };

    fetchLocalizedData();
    
    return () => { mounted = false; };
  }, [currentLanguage]);

  const getLocalizedMovieData = (movie: MovieData) => {
    const localized = localizedData.get(movie.id);
    const translatedDesc = translatedDescriptions.get(movie.id);
    
    // Priority: TMDB overview > translated description > original description
    let overview = movie.description;
    if (localized?.overview && localized.overview.trim() !== '') {
      overview = localized.overview;
    } else if (translatedDesc) {
      overview = translatedDesc;
    }
    
    return {
      title: localized?.title || movie.title,
      overview,
      poster: localized?.poster_path ? getTMDBPosterUrl(localized.poster_path) : movie.poster,
    };
  };

  // Simple poster component with fallback
  const PosterImage = ({ movie, className }: { movie: MovieData; className: string }) => {
    const [imageError, setImageError] = useState(false);

    return (
      <img
        src={imageError ? '/placeholder.svg' : movie.poster}
        alt={`${movie.title} (${movie.year}) poster`}
        className={className}
        loading="lazy"
        decoding="async"
        onError={() => {
          setImageError(true);
        }}
      />
    );
  };

  const handleCardClick = (movie: MovieData) => {
    // Always navigate to movie details page instead of auto-playing trailer
    navigate(`/movie/${encodeURIComponent(movie.title + ' ' + movie.year)}`);
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
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden pt-safe-top">
      {/* Mobile: language selector top-right - positioned below safe area/notch */}
      <div className="md:hidden fixed top-14 right-4 z-20">
        <LanguageSelector variant="compact" />
      </div>

      {/* Desktop: legal links + language selector top-right */}
      <nav className="hidden md:flex fixed top-4 right-4 z-20 items-center gap-4" aria-label="Legal">
        <div className="text-xs text-primary/80 hover:text-primary transition-colors">
          <Link to="/privacy" className="hover:underline">{t("nav.privacy")}</Link>
          <span className="mx-2 text-primary/50">·</span>
          <Link to="/terms" className="hover:underline">{t("nav.terms")}</Link>
          <span className="mx-2 text-primary/50">·</span>
          <Link to="/advertising" className="hover:underline">{t("nav.advertising")}</Link>
        </div>
        <LanguageSelector variant="compact" />
      </nav>

      {/* Cinematic Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Cinema Spotlight / Projector Glow */}
        <div className="cinema-spotlight" />
        
        {/* Film Reel Strips - Diagonal Animation */}
        <div className="film-reel-strip" />
        <div className="film-reel-strip" />
        <div className="film-reel-strip" />
        <div className="film-reel-strip" />
        
        {/* Floating Dust Particles */}
        <div className="dust-particle" />
        <div className="dust-particle" />
        <div className="dust-particle" />
        <div className="dust-particle" />
        <div className="dust-particle" />
        <div className="dust-particle" />
        
        {/* Faded Iconic Movie Symbols */}
        <div className="movie-symbol clapperboard">🎬</div>
        <div className="movie-symbol popcorn">🍿</div>
        <div className="movie-symbol play-button">▶️</div>
        <div className="movie-symbol director-chair">🪑</div>
        
        {/* Animated Curtain Gradients */}
        <div className="curtain-gradient top" />
        <div className="curtain-gradient bottom" />
        
        {/* Lens Flares / Bokeh Lights */}
        <div className="lens-flare" />
        <div className="lens-flare" />
        <div className="lens-flare" />
        
        {/* Storyboard Frames */}
        <div className="storyboard-frame" />
        <div className="storyboard-frame" />
        <div className="storyboard-frame" />
        <div className="storyboard-frame" />
        
        {/* Cinematic Overlay for Depth */}
        <div className="cinematic-overlay" />
        
        {/* Original Memory Cloud Effects */}
        <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 sm:w-56 sm:h-56 md:w-72 md:h-72 lg:w-80 lg:h-80 bg-gradient-to-l from-accent/10 to-primary/10 rounded-full blur-3xl animate-pulse animation-delay-2s" />
        
        {/* Neural Network Lines */}
        <div className="absolute top-1/4 left-1/4 w-px h-16 sm:h-24 md:h-32 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
        <div className="absolute top-1/3 right-1/3 w-16 sm:w-24 md:w-32 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
        <div className="absolute bottom-1/3 left-1/2 w-px h-12 sm:h-20 md:h-24 bg-gradient-to-b from-transparent via-primary/15 to-transparent" />
      </div>

      {/* Main Content - mobile: content from top + bottom padding so CTA visible */}
      <div className="relative z-10 flex flex-col items-center justify-start sm:justify-center min-h-screen px-4 pt-6 pb-24 sm:pt-8 sm:pb-8 sm:py-8 sm:px-6 lg:px-8">
        {/* Hero Section - tighter on mobile */}
        <div className="text-center mb-4 sm:mb-8 space-y-2 sm:space-y-4">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-4">
            <div className="relative">
              <Brain className="w-7 h-7 sm:w-12 sm:h-12 text-primary" />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg animate-pulse" />
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              CineMind
            </h1>
          </div>
          
          <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-3">
            {t("landing.hero.title")}<br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t("landing.hero.titleHighlight")}
            </span>
          </h2>
          
          <p className="text-xs sm:text-base md:text-lg text-muted-foreground max-w-xl mx-auto px-2 sm:px-4 opacity-0 animate-fade-in-up animation-delay-500">
            {t("app.description")}
          </p>
        </div>

        {/* Movie Cards Carousel - shorter on mobile so CTA fits */}
        <div className="w-full max-w-5xl mb-4 sm:mb-12">
          <div className="relative">
            {/* Card Container */}
            <div className="flex justify-center">
              <div className="relative w-72 h-80 sm:w-96 sm:h-[24rem] md:w-[26rem] md:h-[28rem] perspective-1000">
                {movieData.map((movie, index) => {
                  const isActive = index === currentCard;
                  const localized = getLocalizedMovieData(movie);
                  
                  return (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-all duration-500 ease-out transform ${
                        isActive 
                          ? 'opacity-100 scale-100 z-10 translate-x-0' 
                          : 'opacity-0 scale-90 z-0'
                      }`}
                    >
                      <Card 
                        className="w-full h-full cursor-pointer transition-transform duration-300 ease-out touch-manipulation select-none group card-glow hover:scale-105"
                        onClick={() => handleCardClick(movie)}
                      >
                        <CardContent className="p-0 h-full relative">
                          <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-300">
                            <PosterImage
                              movie={{ ...movie, poster: localized.poster }}
                              className={`w-full h-full object-cover rounded-lg ${
                                movie.title === "Inception" ? "object-top" : ""
                              }`}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            
                            {/* Hover overlay with movie details preview */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <div className="text-center text-white">
                                <>
                                  <Eye className="w-12 h-12 mx-auto mb-2 text-primary" />
                                  <p className="text-lg font-semibold">{t("landing.card.viewDetails")}</p>
                                  <p className="text-sm opacity-75">{t("landing.card.clickExplore")}</p>
                                </>
                              </div>
                            </div>
                            
                            <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4">
                              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg">{localized.title}</h3>
                              <p className="text-xs sm:text-sm text-gray-300 mb-1 sm:mb-2">{movie.year}</p>
                              <p className="text-xs sm:text-sm text-gray-400 italic line-clamp-2">"{localized.overview}"</p>
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
              title={t("landing.card.previous")}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextCard}
              title={t("landing.card.next")}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Card Indicators */}
          <div className="flex justify-center gap-1 sm:gap-2 mt-2 sm:mt-6">
            {movieData.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentCard(index)}
                title={`${t("landing.card.goTo")} ${index + 1}`}
                className={`w-2 h-2 sm:w-2 sm:h-2 rounded-full transition-colors ${
                  index === currentCard ? 'bg-primary' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* CTA Section - space at bottom on mobile so button is visible */}
        <div className="text-center space-y-3 sm:space-y-6 px-4 pb-safe-bottom">
          <div className="space-y-1 sm:space-y-2">
            <h3 className="text-base sm:text-xl md:text-2xl font-bold text-white">
              {t("landing.cta.remembers")}
            </h3>
            <p className="text-xs sm:text-base text-muted-foreground">
              <span className="sm:hidden">{t("landing.cta.tapCard")}</span>
              <span className="hidden sm:inline">{t("landing.cta.clickCard")}</span>
            </p>
          </div>
          
          <Button
            onClick={onStart}
            size="lg"
            className="neural-button text-sm sm:text-base md:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto w-full sm:w-auto"
          >
            <Brain className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            {t("landing.cta.start")}
          </Button>
        </div>
      </div>
    </div>
  );
};
