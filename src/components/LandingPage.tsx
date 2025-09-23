import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Brain, Play, Search, Lightbulb, Eye, Calendar, Clock, Star, Film, BookOpen, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MovieData {
  title: string;
  year: string;
  poster: string;
  description: string;
  painPoint: string;
  solution: string;
  // Enhanced movie details for back of card
  director?: string;
  runtime?: number;
  imdbRating?: number;
  genre?: string[];
  plot?: string;
  cast?: string[];
  trailer?: string;
  hasPoster?: boolean;
  hasTrailer?: boolean;
}

const movies: MovieData[] = [
  {
    title: "Avengers: Endgame",
    year: "2019",
    description: "I am inevitable.",
    painPoint: "Lost in the MCU timeline?",
    solution: "Track complex franchises and understand every connection.",
    poster: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
    director: "Anthony Russo, Joe Russo",
    runtime: 181,
    imdbRating: 8.4,
    genre: ["Action", "Adventure", "Drama", "Sci-Fi"],
    plot: "After the devastating events of Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more to reverse Thanos' actions and restore balance to the universe.",
    cast: ["Robert Downey Jr.", "Chris Evans", "Mark Ruffalo", "Chris Hemsworth", "Scarlett Johansson"],
    trailer: "https://www.youtube.com/watch?v=TcMBFSGVi1c",
    hasPoster: true,
    hasTrailer: true
  },
  {
    title: "Inception",
    year: "2010",
    description: "A dream within a dream within a dream...",
    painPoint: "Ever forgot a movie like this?",
    solution: "CineMind remembers every detail, even the most complex plots.",
    poster: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    director: "Christopher Nolan",
    runtime: 148,
    imdbRating: 8.8,
    genre: ["Action", "Sci-Fi", "Thriller"],
    plot: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    cast: ["Leonardo DiCaprio", "Marion Cotillard", "Tom Hardy", "Elliot Page", "Michael Caine"],
    trailer: "https://www.youtube.com/watch?v=YoHD9XEInc0",
    hasPoster: true,
    hasTrailer: true
  },
  {
    title: "Blade Runner 2049",
    year: "2017",
    description: "More human than human is our motto.",
    painPoint: "Lost in philosophical sci-fi?",
    solution: "Get instant explanations of deep themes and symbolism.",
    poster: "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
    director: "Denis Villeneuve",
    runtime: 164,
    imdbRating: 8.0,
    genre: ["Sci-Fi", "Thriller", "Drama"],
    plot: "A young blade runner's discovery of a long-buried secret leads him to track down former blade runner Rick Deckard, who's been missing for thirty years.",
    cast: ["Ryan Gosling", "Harrison Ford", "Ana de Armas", "Sylvia Hoeks", "Robin Wright"],
    trailer: "https://www.youtube.com/watch?v=gCcx85zbxz4",
    hasPoster: true,
    hasTrailer: true
  },
  {
    title: "The Dark Knight",
    year: "2008",
    description: "Why so serious?",
    painPoint: "Want to rewatch this instantly?",
    solution: "Find where to watch any movie, anywhere, anytime.",
    poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    director: "Christopher Nolan",
    runtime: 152,
    imdbRating: 9.0,
    genre: ["Action", "Crime", "Drama", "Thriller"],
    plot: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart", "Michael Caine", "Maggie Gyllenhaal"],
    trailer: "https://www.youtube.com/watch?v=EXeTwQWrcwY",
    hasPoster: true,
    hasTrailer: true
  },
  {
    title: "The Matrix",
    year: "1999",
    description: "There is no spoon.",
    painPoint: "Confused by the meaning?",
    solution: "Understand every layer of symbolism and philosophy.",
    poster: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    director: "Lana Wachowski, Lilly Wachowski",
    runtime: 136,
    imdbRating: 8.7,
    genre: ["Action", "Sci-Fi"],
    plot: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
    cast: ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss", "Hugo Weaving", "Joe Pantoliano"],
    trailer: "https://www.youtube.com/watch?v=vKQi3bBA1y8",
    hasPoster: true,
    hasTrailer: true
  },
  {
    title: "Titanic",
    year: "1997",
    description: "I'm the king of the world!",
    painPoint: "Where can I watch now?",
    solution: "Get instant streaming availability across all platforms.",
    poster: "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
    director: "James Cameron",
    runtime: 194,
    imdbRating: 7.8,
    genre: ["Drama", "Romance"],
    plot: "A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.",
    cast: ["Leonardo DiCaprio", "Kate Winslet", "Billy Zane", "Kathy Bates", "Frances Fisher"],
    trailer: "https://www.youtube.com/watch?v=2e-eXJ6HgkQ",
    hasPoster: true,
    hasTrailer: true
  },
  {
    title: "The Lion King",
    year: "1994",
    description: "Hakuna Matata!",
    painPoint: "Childhood memories fading?",
    solution: "Preserve and rediscover your favorite childhood films.",
    poster: "https://image.tmdb.org/t/p/w500/sKCr78MXSLixwmZ8DyJLrpMsd15.jpg",
    director: "Roger Allers, Rob Minkoff",
    runtime: 88,
    imdbRating: 8.5,
    genre: ["Animation", "Adventure", "Drama", "Family"],
    plot: "A young lion prince is cast out of his pride by his cruel uncle, who claims he killed his father. While the uncle rules with an iron paw, the prince grows up beyond the Savannah, living by a philosophy: No worries for the rest of your days.",
    cast: ["Matthew Broderick", "Jeremy Irons", "James Earl Jones", "Moira Kelly", "Nathan Lane"],
    trailer: "https://www.youtube.com/watch?v=4sj1MT05lAA",
    hasPoster: true,
    hasTrailer: true
  }
];

export const LandingPage = ({ onStart }: { onStart: (searchQuery?: string) => void }) => {
  const [movieData, setMovieData] = useState<MovieData[]>([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    // Initialize with enhanced movie data
    setMovieData(movies);
    setIsLoading(false);
  }, []);

  const handleMovieSearch = (movieTitle: string) => {
    setSearchQuery(movieTitle);
    // Navigate to search with the movie title
    onStart(movieTitle);
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
                  const isFlipped = flippedCards.has(index);
                  
                  return (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-all duration-500 ease-out transform ${
                        isActive 
                          ? 'opacity-100 scale-100 z-10 translate-x-0 rotate-y-0' 
                          : 'opacity-0 scale-90 z-0'
                      }`}
                    >
                      <Card 
                        className="w-full h-full cursor-pointer touch-manipulation select-none group card-glow card-smooth"
                        onClick={() => handleCardFlip(index)}
                      >
                        <CardContent className="p-0 h-full relative">
                          {/* Front of Card - Movie Poster */}
                          <div className={`absolute inset-0 transition-transform duration-600 ease-out ${
                            isFlipped ? 'rotate-y-180' : 'rotate-y-0'
                          }`}>
                            <div className="relative w-full h-full">
                              <img
                                src={movie.poster}
                                alt={movie.title}
                                className={`w-full h-full object-cover rounded-lg transition-transform duration-300 ease-out ${
                                  movie.title === "Inception" ? "object-top" : ""
                                }`}
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder.svg';
                                }}
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                              {/* Futuristic glow effect */}
                              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                              <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4">
                                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg">{movie.title}</h3>
                                <p className="text-xs sm:text-sm text-gray-300 mb-1 sm:mb-2">{movie.year}</p>
                                <p className="text-xs sm:text-sm text-gray-400 italic">"{movie.description}"</p>
                              </div>
                            </div>
                          </div>

                          {/* Back of Card - Stunning Movie Details */}
                          <div className={`absolute inset-0 transition-transform duration-600 ease-out ${
                            isFlipped ? 'rotate-y-0' : 'rotate-y-180'
                          }`}>
                            <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-3 sm:p-4 md:p-6 rounded-lg relative overflow-hidden">
                              {/* Neural background effect */}
                              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-50"></div>
                              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                              <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent"></div>
                              
                              {/* Flip back button */}
                              <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10">
                                <div 
                                  className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm cursor-pointer hover:bg-white/30 active:bg-white/40 transition-all duration-150 ease-out touch-manipulation select-none shadow-lg border border-white/20"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCardFlip(index);
                                  }}
                                  title="Back to poster"
                                >
                                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                  </svg>
                                </div>
                              </div>
                              
                              {/* Movie Header */}
                              <div className="mb-3 sm:mb-4">
                                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 drop-shadow-lg">{movie.title}</h3>
                                <p className="text-sm text-gray-300 mb-2">({movie.year})</p>
                                
                                {/* Movie Metadata */}
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-300 mb-3">
                                  {movie.director && (
                                    <div className="flex items-center gap-1">
                                      <Film className="w-3 h-3" />
                                      <span className="truncate">{movie.director}</span>
                                    </div>
                                  )}
                                  {movie.runtime && (
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      <span>{movie.runtime}min</span>
                                    </div>
                                  )}
                                  {movie.imdbRating && (
                                    <div className="flex items-center gap-1">
                                      <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                      <span>{movie.imdbRating}/10</span>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Genre Badges */}
                                {movie.genre && movie.genre.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-3">
                                    {movie.genre.slice(0, 3).map((genre, idx) => (
                                      <Badge key={idx} variant="secondary" className="text-xs bg-primary/20 text-primary border-primary/30">
                                        {genre}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              
                              {/* Plot Summary */}
                              {movie.plot && (
                                <div className="mb-3 sm:mb-4">
                                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed line-clamp-3">
                                    {movie.plot}
                                  </p>
                                </div>
                              )}
                              
                              {/* Cast */}
                              {movie.cast && movie.cast.length > 0 && (
                                <div className="mb-3 sm:mb-4">
                                  <p className="text-xs text-gray-400 mb-1">Starring:</p>
                                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed line-clamp-2">
                                    {movie.cast.slice(0, 3).join(", ")}
                                    {movie.cast.length > 3 && "..."}
                                  </p>
                                </div>
                              )}
                              
                              {/* Media Status */}
                              <div className="flex items-center gap-2 mb-4">
                                {movie.hasPoster && (
                                  <div className="flex items-center gap-1 text-xs text-green-400">
                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                    <span>Poster</span>
                                  </div>
                                )}
                                {movie.hasTrailer && (
                                  <div className="flex items-center gap-1 text-xs text-blue-400">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                    <span>Trailer</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="space-y-2">
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMovieSearch(movie.title);
                                  }}
                                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/80 hover:to-accent/80 text-white border-0 h-8 sm:h-9 text-xs sm:text-sm font-medium shadow-lg"
                                >
                                  <Search className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                  Search This Movie
                                </Button>
                                
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 h-7 text-xs"
                                  >
                                    <Lightbulb className="w-3 h-3 mr-1" />
                                    Explain
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 h-7 text-xs"
                                  >
                                    <Play className="w-3 h-3 mr-1" />
                                    Watch
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 h-7 text-xs"
                                  >
                                    <BookOpen className="w-3 h-3 mr-1" />
                                    Similar
                                  </Button>
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
              <span className="sm:hidden">Tap any card to flip and explore</span>
              <span className="hidden sm:inline">Tap any card above to see how CineMind solves your movie memory problems</span>
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
