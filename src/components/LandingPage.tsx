import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Brain, Play, Search, Lightbulb, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { VideoPlayer } from "./VideoPlayer";

interface MovieData {
  title: string;
  year: string;
  poster: string;
  description: string;
  painPoint: string;
  solution: string;
  trailer?: {
    videoId: string;
    title: string;
    embedUrl: string;
    thumbnail: string;
  };
}

const movies: MovieData[] = [
  {
    title: "Avengers: Endgame",
    year: "2019",
    description: "I am inevitable.",
    painPoint: "Lost in the MCU timeline?",
    solution: "Track complex franchises and understand every connection.",
    poster: "https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_SX300.jpg"
  },
  {
    title: "Inception",
    year: "2010",
    description: "A dream within a dream within a dream...",
    painPoint: "Ever forgot a movie like this?",
    solution: "CineMind remembers every detail, even the most complex plots.",
    poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg"
  },
  {
    title: "Blade Runner 2049",
    year: "2017",
    description: "More human than human is our motto.",
    painPoint: "Lost in philosophical sci-fi?",
    solution: "Get instant explanations of deep themes and symbolism.",
    poster: "https://m.media-amazon.com/images/M/MV5BNzA1Njg4NzYxOV5BMl5BanBnXkFtZTgwODk5NjU3MzI@._V1_SX300.jpg"
  },
  {
    title: "The Dark Knight",
    year: "2008",
    description: "Why so serious?",
    painPoint: "Want to rewatch this instantly?",
    solution: "Find where to watch any movie, anywhere, anytime.",
    poster: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg"
  },
  {
    title: "The Matrix",
    year: "1999",
    description: "There is no spoon.",
    painPoint: "Confused by the meaning?",
    solution: "Understand every layer of symbolism and philosophy.",
    poster: "https://m.media-amazon.com/images/M/MV5BN2NmN2VhMTQtMDNiOS00NDlhLTliMjgtODE2ZTY0ODQyNDRhXkEyXkFqcGc@._V1_SX300.jpg"
  },
  {
    title: "Titanic",
    year: "1997",
    description: "I'm the king of the world!",
    painPoint: "Where can I watch now?",
    solution: "Get instant streaming availability across all platforms.",
    poster: "https://m.media-amazon.com/images/M/MV5BYzYyN2FiZmUtYWYzMy00MzViLWJkZTMtOGY1ZjgzNWMwN2YxXkEyXkFqcGc@._V1_SX300.jpg"
  },
  {
    title: "The Lion King",
    year: "1994",
    description: "Hakuna Matata!",
    painPoint: "Childhood memories fading?",
    solution: "Preserve and rediscover your favorite childhood films.",
    poster: "https://m.media-amazon.com/images/M/MV5BYTYxNGMyZTYtMjE3MS00MzNjLWFjNmYtMDk3N2FmM2JiM2M1XkEyXkFqcGdeQXVyNjY5NDU4NzI@._V1_SX300.jpg"
  }
];

export const LandingPage = ({ onStart }: { onStart: () => void }) => {
  const navigate = useNavigate();
  const [movieData, setMovieData] = useState<MovieData[]>([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<MovieData | null>(null);

  useEffect(() => {
    fetchMovieData();
  }, []);


  // Simple poster component with fallback
  const PosterImage = ({ movie, className }: { movie: MovieData; className: string }) => {
    const [imageError, setImageError] = useState(false);

    return (
      <img
        src={imageError ? '/placeholder.svg' : movie.poster}
        alt={`${movie.title} (${movie.year}) poster`}
        className={className}
        onError={() => {
          console.warn(`Failed to load poster for ${movie.title}: ${movie.poster}`);
          setImageError(true);
        }}
        onLoad={() => {
          console.log(`✓ Poster loaded for ${movie.title}`);
        }}
        loading="eager"
      />
    );
  };

  const fetchMovieData = async () => {
    // Load movies instantly without fetching trailers upfront
    console.log('🎬 Loading movies instantly...');
    setMovieData([...movies]);
    setIsLoading(false);
  };

  const handleCardClick = async (movie: MovieData) => {
    // If movie already has a trailer, play it immediately
    if (movie.trailer) {
      setSelectedMovie(movie);
      setIsVideoPlayerOpen(true);
      return;
    }

    // Otherwise, fetch trailer on-demand
    try {
      console.log(`🎬 Fetching trailer for: ${movie.title} (${movie.year})`);
      
      const { data: movieData, error } = await supabase.functions.invoke('movie-identify', {
        body: { query: `${movie.title} ${movie.year}` }
      });
      
      if (error) {
        console.error(`❌ Error fetching trailer for ${movie.title}:`, error);
        // Fallback to navigation
        navigate(`/movie/${encodeURIComponent(movie.title + ' ' + movie.year)}`);
        return;
      }
      
      if (movieData && movieData.trailer_url) {
        console.log(`✅ Trailer found for ${movie.title}`);
        const movieWithTrailer = {
          ...movie,
          trailer: movieData.trailer_url
        };
        setSelectedMovie(movieWithTrailer);
        setIsVideoPlayerOpen(true);
      } else {
        console.log(`⚠️ No trailer found for ${movie.title}`);
        // Fallback to navigation
        navigate(`/movie/${encodeURIComponent(movie.title + ' ' + movie.year)}`);
      }
      
    } catch (error) {
      console.error(`❌ Network error fetching trailer for ${movie.title}:`, error);
      // Fallback to navigation
      navigate(`/movie/${encodeURIComponent(movie.title + ' ' + movie.year)}`);
    }
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

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-6 sm:mb-8 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="relative">
              <Brain className="w-8 h-8 sm:w-12 sm:h-12 text-primary" />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg animate-pulse" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              CineMind
            </h1>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3">
            Remember Any Movie.<br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Anywhere. Anytime.
            </span>
          </h2>
          
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl mx-auto px-4 opacity-0 animate-fade-in-up animation-delay-500">
            Your AI-powered movie memory companion that never forgets a single detail, 
            meaning, or where to watch your favorite films.
          </p>
        </div>

        {/* Movie Cards Carousel */}
        <div className="w-full max-w-5xl mb-8 sm:mb-12">
          <div className="relative">
            {/* Card Container */}
            <div className="flex justify-center">
              <div className="relative w-80 h-96 sm:w-96 sm:h-[28rem] md:w-[28rem] md:h-[32rem] perspective-1000">
                {movieData.map((movie, index) => {
                  const isActive = index === currentCard;
                  
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
                              movie={movie}
                              className={`w-full h-full object-cover rounded-lg ${
                                movie.title === "Inception" ? "object-top" : ""
                              }`}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            
                            {/* Hover overlay with trailer preview */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <div className="text-center text-white">
                                <Play className="w-12 h-12 mx-auto mb-2 text-primary" />
                                {movie.trailer ? (
                                  <>
                                    <p className="text-lg font-semibold">Watch Trailer</p>
                                    <p className="text-sm opacity-75">Click to play</p>
                                  </>
                                ) : (
                                  <>
                                <p className="text-lg font-semibold">View Details</p>
                                <p className="text-sm opacity-75">Click to explore</p>
                                  </>
                                )}
                                
                                {/* Trailer Status */}
                                <div className="mt-3 space-y-1">
                                  {movie.trailer ? (
                                    <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                                      ✓ Trailer Available
                                    </Badge>
                                  ) : movie.trailer === undefined ? (
                                    <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                                      ... Loading Trailer
                                    </Badge>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                            
                            <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4">
                              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg">{movie.title}</h3>
                              <p className="text-xs sm:text-sm text-gray-300 mb-1 sm:mb-2">{movie.year}</p>
                              <p className="text-xs sm:text-sm text-gray-400 italic line-clamp-2">"{movie.description}"</p>
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
              <span className="sm:hidden">Tap any card to explore full details</span>
              <span className="hidden sm:inline">Click any card above to explore full movie details with AI insights</span>
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

      {/* Video Player Modal */}
      {selectedMovie && selectedMovie.trailer && (
        <VideoPlayer
          isOpen={isVideoPlayerOpen}
          onClose={() => {
            setIsVideoPlayerOpen(false);
            setSelectedMovie(null);
          }}
          videoUrl={selectedMovie.trailer}
          title={selectedMovie.title}
        />
      )}
    </div>
  );
};
