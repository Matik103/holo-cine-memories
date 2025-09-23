import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { VideoPlayer } from "./VideoPlayer";
import { Brain, Play, Search, Lightbulb, Eye, Calendar, Clock, Star, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MovieData {
  title: string;
  year: number;
  director: string;
  genre: string[];
  plot: string;
  imdbRating: number;
  runtime: number;
  cast: string[];
  poster: string;
  trailer?: string;
  description: string;
  painPoint: string;
  solution: string;
}

const movies: MovieData[] = [
  {
    title: "Avengers: Endgame",
    year: 2019,
    director: "Anthony Russo, Joe Russo",
    genre: ["Action", "Adventure", "Drama"],
    plot: "After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos' actions and restore balance to the universe.",
    imdbRating: 8.4,
    runtime: 181,
    cast: ["Robert Downey Jr.", "Chris Evans", "Mark Ruffalo", "Chris Hemsworth"],
    poster: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
    trailer: "https://www.youtube.com/watch?v=TcMBFSGVi1c",
    description: "I am inevitable.",
    painPoint: "Lost in the MCU timeline?",
    solution: "Track complex franchises and understand every connection."
  },
  {
    title: "Inception",
    year: 2010,
    director: "Christopher Nolan",
    genre: ["Action", "Sci-Fi", "Thriller"],
    plot: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.",
    imdbRating: 8.8,
    runtime: 148,
    cast: ["Leonardo DiCaprio", "Marion Cotillard", "Tom Hardy", "Elliot Page"],
    poster: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    trailer: "https://www.youtube.com/watch?v=YoHD9XEInc0",
    description: "A dream within a dream within a dream...",
    painPoint: "Ever forgot a movie like this?",
    solution: "CineMind remembers every detail, even the most complex plots."
  },
  {
    title: "Blade Runner 2049",
    year: 2017,
    director: "Denis Villeneuve",
    genre: ["Action", "Drama", "Mystery"],
    plot: "Young Blade Runner K's discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard, who's been missing for thirty years.",
    imdbRating: 8.0,
    runtime: 164,
    cast: ["Ryan Gosling", "Harrison Ford", "Ana de Armas", "Jared Leto"],
    poster: "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
    trailer: "https://www.youtube.com/watch?v=gCcx85zbxz4",
    description: "More human than human is our motto.",
    painPoint: "Lost in philosophical sci-fi?",
    solution: "Get instant explanations of deep themes and symbolism."
  },
  {
    title: "The Dark Knight",
    year: 2008,
    director: "Christopher Nolan",
    genre: ["Action", "Crime", "Drama"],
    plot: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    imdbRating: 9.0,
    runtime: 152,
    cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart", "Michael Caine"],
    poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    trailer: "https://www.youtube.com/watch?v=EXeTwQWrcwY",
    description: "Why so serious?",
    painPoint: "Want to rewatch this instantly?",
    solution: "Find where to watch any movie, anywhere, anytime."
  },
  {
    title: "The Matrix",
    year: 1999,
    director: "Lana Wachowski, Lilly Wachowski",
    genre: ["Action", "Sci-Fi"],
    plot: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
    imdbRating: 8.7,
    runtime: 136,
    cast: ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss", "Hugo Weaving"],
    poster: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    trailer: "https://www.youtube.com/watch?v=vKQi3bIA1HI",
    description: "There is no spoon.",
    painPoint: "Confused by the meaning?",
    solution: "Understand every layer of symbolism and philosophy."
  },
  {
    title: "Titanic",
    year: 1997,
    director: "James Cameron",
    genre: ["Drama", "Romance"],
    plot: "A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.",
    imdbRating: 7.9,
    runtime: 194,
    cast: ["Leonardo DiCaprio", "Kate Winslet", "Billy Zane", "Gloria Stuart"],
    poster: "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
    trailer: "https://www.youtube.com/watch?v=kVrqfYjkFsE",
    description: "I'm the king of the world!",
    painPoint: "Where can I watch now?",
    solution: "Get instant streaming availability across all platforms."
  },
  {
    title: "The Lion King",
    year: 1994,
    director: "Roger Allers, Rob Minkoff",
    genre: ["Animation", "Adventure", "Drama"],
    plot: "Lion prince Simba and his father are targeted by his bitter uncle, who wants to ascend the throne himself.",
    imdbRating: 8.5,
    runtime: 88,
    cast: ["Matthew Broderick", "Jeremy Irons", "James Earl Jones", "Moira Kelly"],
    poster: "https://image.tmdb.org/t/p/w500/sKCr78MXSLixwmZ8DyJLrpMsd15.jpg",
    trailer: "https://www.youtube.com/watch?v=lFzVJEksoDY",
    description: "Hakuna Matata!",
    painPoint: "Childhood memories fading?",
    solution: "Preserve and rediscover your favorite childhood films."
  }
];

export const LandingPage = ({ onStart }: { onStart: () => void }) => {
  const [movieData, setMovieData] = useState<MovieData[]>([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<MovieData | null>(null);

  useEffect(() => {
    fetchMoviePosters();
  }, []);

  const fetchMoviePosters = async () => {
    // For now, use the hardcoded posters. Later we can implement OMDb API
    setMovieData(movies);
    setIsLoading(false);
  };

  const handleCardFlip = (index: number) => {
    if (expandedCard === index) {
      // If card is expanded, close it first
      setExpandedCard(null);
      setTimeout(() => {
        setFlippedCards(prev => {
          const newSet = new Set(prev);
          newSet.delete(index);
          return newSet;
        });
      }, 300);
    } else {
      // Flip the card and expand it
      setFlippedCards(prev => {
        const newSet = new Set(prev);
        if (newSet.has(index)) {
          newSet.delete(index);
          setExpandedCard(null);
        } else {
          newSet.add(index);
          setExpandedCard(index);
        }
        return newSet;
      });
    }
  };

  const handleWatchTrailer = (movie: MovieData) => {
    setSelectedMovie(movie);
    setIsVideoPlayerOpen(true);
  };

  const handleSearchMovie = (movie: MovieData) => {
    // This would trigger the same flow as searching for the movie in the main app
    console.log('Searching for movie:', movie.title);
    onStart(); // Navigate to the main app
  };

  const handleExplainMeaning = async (movie: MovieData) => {
    try {
      const { data, error } = await supabase.functions.invoke('movie-explain', {
        body: { movieTitle: movie.title }
      });
      
      if (error) throw error;
      console.log('Movie explanation:', data);
    } catch (error) {
      console.error('Error explaining movie:', error);
    }
  };

  const handleWhereToWatch = async (movie: MovieData) => {
    try {
      const { data, error } = await supabase.functions.invoke('movie-streaming', {
        body: { movieTitle: movie.title }
      });
      
      if (error) throw error;
      console.log('Streaming options:', data);
    } catch (error) {
      console.error('Error finding streaming options:', error);
    }
  };

  const handleSimilarMovies = async (movie: MovieData) => {
    try {
      const { data, error } = await supabase.functions.invoke('movie-similar', {
        body: { 
          title: movie.title,
          year: movie.year,
          genre: movie.genre,
          director: movie.director
        }
      });
      
      if (error) throw error;
      console.log('Similar movies:', data);
    } catch (error) {
      console.error('Error finding similar movies:', error);
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
              <div className={`relative transition-all duration-500 ease-out perspective-1000 ${
                expandedCard !== null 
                  ? 'w-full max-w-4xl h-auto min-h-[600px]' 
                  : 'w-80 h-96 sm:w-96 sm:h-[28rem] md:w-[28rem] md:h-[32rem]'
              }`}>
                {movieData.map((movie, index) => {
                  const isActive = index === currentCard;
                  const isFlipped = flippedCards.has(index);
                  const isExpanded = expandedCard === index;
                  
                  return (
                    <div
                      key={index}
                      className={`transition-all duration-500 ease-out transform ${
                        isActive 
                          ? 'opacity-100 scale-100 z-10 translate-x-0 rotate-y-0' 
                          : 'opacity-0 scale-90 z-0'
                      } ${
                        isExpanded ? 'relative' : 'absolute inset-0'
                      }`}
                    >
                      <Card 
                        className={`w-full ${isExpanded ? 'h-auto' : 'h-full'} cursor-pointer transition-transform duration-600 ease-out touch-manipulation select-none group card-glow card-smooth ${
                          isFlipped ? 'rotate-y-180' : ''
                        }`}
                        onClick={() => !isExpanded && handleCardFlip(index)}
                      >
                        <CardContent className={`p-0 ${isExpanded ? 'h-auto' : 'h-full'} relative`}>
                          {/* Front of Card - Movie Poster */}
                          <div className="absolute inset-0 backface-hidden">
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

                          {/* Back of Card - Complete Movie Information */}
                          <div className="absolute inset-0 rotate-y-180 backface-hidden overflow-y-auto">
                            {isExpanded ? (
                              /* Expanded Full Details View */
                              <div className="neural-card rounded-2xl overflow-hidden min-h-full">
                                <div className="flex flex-col md:flex-row">
                                  {/* Movie Poster Section */}
                                  <div className="w-full md:w-1/3 relative group mb-4 md:mb-0">
                                    <div className="aspect-[3/4] sm:aspect-[2/3] bg-gradient-to-br from-secondary to-muted flex items-center justify-center relative overflow-hidden rounded-lg">
                                      <img 
                                        src={movie.poster} 
                                        alt={movie.title}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        onError={(e) => {
                                          e.currentTarget.src = '/placeholder.svg';
                                        }}
                                      />
                                      {/* Trailer Play Overlay */}
                                      {movie.trailer && (
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                          <Button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleWatchTrailer(movie);
                                            }}
                                            size="lg"
                                            className="neural-button rounded-full w-12 h-12 sm:w-16 sm:h-16 p-0 touch-manipulation"
                                          >
                                            <Play className="w-4 h-4 sm:w-6 sm:h-6 ml-1" />
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Memory Match Indicator */}
                                    <div className="absolute top-4 right-4">
                                      <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground border-0">
                                        Memory Match
                                      </Badge>
                                    </div>
                                    
                                    {/* Close Button */}
                                    <div className="absolute top-4 left-4">
                                      <div 
                                        className="w-10 h-10 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm cursor-pointer hover:bg-black/80 transition-all duration-150 ease-out touch-manipulation select-none shadow-lg"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCardFlip(index);
                                        }}
                                        title="Close details"
                                      >
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Movie Details Section */}
                                  <div className="w-full md:w-2/3 p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
                                    <div className="space-y-2 sm:space-y-3">
                                      <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                                        {movie.title}
                                      </h2>
                                      
                                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm sm:text-base text-muted-foreground">
                                        <div className="flex items-center gap-1.5 sm:gap-2">
                                          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                          <span>{movie.year}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 sm:gap-2">
                                          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                          <span>{movie.runtime}min</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 sm:gap-2">
                                          <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-yellow-500 text-yellow-500" />
                                          <span>{movie.imdbRating}/10</span>
                                        </div>
                                      </div>

                                      <p className="text-sm sm:text-base text-muted-foreground">
                                        Directed by <span className="text-foreground font-medium">{movie.director}</span>
                                      </p>
                                      
                                      {/* Media Status */}
                                      <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-2">
                                        <Badge variant="outline" className="text-green-600 border-green-600 text-xs sm:text-sm">
                                          📸 Poster Available
                                        </Badge>
                                        {movie.trailer && (
                                          <Badge variant="outline" className="text-red-600 border-red-600 text-xs sm:text-sm">
                                            🎬 Trailer Available
                                          </Badge>
                                        )}
                                      </div>
                                    </div>

                                    {/* Genres */}
                                    <div className="flex flex-wrap gap-2">
                                      {movie.genre.map((g) => (
                                        <Badge key={g} variant="secondary" className="bg-secondary/60">
                                          {g}
                                        </Badge>
                                      ))}
                                    </div>

                                    {/* Plot */}
                                    <div className="space-y-2">
                                      <h3 className="font-semibold text-foreground text-sm sm:text-base">Plot</h3>
                                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                                        {movie.plot}
                                      </p>
                                    </div>

                                    {/* Cast */}
                                    <div className="space-y-2">
                                      <h3 className="font-semibold text-foreground text-sm sm:text-base">Cast</h3>
                                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                                        {movie.cast.slice(0, 4).join(', ')}
                                        {movie.cast.length > 4 && '...'}
                                      </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-3 pt-3 sm:pt-4">
                                      {/* Primary Action - Watch Trailer */}
                                      {movie.trailer && (
                                        <Button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleWatchTrailer(movie);
                                          }}
                                          className="w-full neural-button rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 h-12 touch-manipulation"
                                          size="lg"
                                        >
                                          <Play className="w-4 h-4 mr-2" />
                                          Watch Trailer
                                        </Button>
                                      )}
                                      
                                      {/* Secondary Actions Grid */}
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                        <Button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleWhereToWatch(movie);
                                          }}
                                          className="w-full neural-button rounded-xl h-12 touch-manipulation"
                                          size="lg"
                                        >
                                          <Play className="w-4 h-4 mr-2" />
                                          Where to Watch
                                        </Button>
                                        
                                        <Button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleExplainMeaning(movie);
                                          }}
                                          variant="outline"
                                          className="w-full rounded-xl border-border hover:bg-secondary/50 h-12 touch-manipulation"
                                          size="lg"
                                        >
                                          <Lightbulb className="w-4 h-4 mr-2" />
                                          Explain Meaning
                                        </Button>
                                      </div>
                                      
                                      {/* Tertiary Actions */}
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                        <Button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleSimilarMovies(movie);
                                          }}
                                          variant="ghost"
                                          className="w-full rounded-xl hover:bg-secondary/30 h-12 touch-manipulation"
                                          size="lg"
                                        >
                                          <BookOpen className="w-4 h-4 mr-2" />
                                          Similar Movies
                                        </Button>
                                        
                                        <Button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleSearchMovie(movie);
                                          }}
                                          className="w-full neural-button rounded-xl bg-gradient-to-r from-primary to-accent h-12 touch-manipulation"
                                          size="lg"
                                        >
                                          <Search className="w-4 h-4 mr-2" />
                                          Search This Movie
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              /* Compact Preview View */
                              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 p-3 sm:p-6 flex flex-col justify-center items-center text-center rounded-lg relative group">
                                {/* Flip back button */}
                                <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
                                  <div 
                                    className="w-10 h-10 sm:w-8 sm:h-8 bg-white/40 rounded-full flex items-center justify-center backdrop-blur-sm cursor-pointer hover:bg-white/50 active:bg-white/60 transition-all duration-150 ease-out touch-manipulation select-none shadow-lg button-futuristic"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCardFlip(index);
                                    }}
                                    title="Tap to go back to poster"
                                  >
                                    <svg className="w-5 h-5 sm:w-4 sm:h-4 text-white drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                  </div>
                                </div>
                                
                                <div className="mb-2 sm:mb-4">
                                  <Brain className="w-8 h-8 sm:w-12 sm:h-12 text-primary mx-auto mb-1 sm:mb-2 drop-shadow-lg" />
                                  <h4 className="text-sm sm:text-base md:text-lg font-semibold text-white mb-1 sm:mb-2">{movie.painPoint}</h4>
                                </div>
                                <p className="text-xs sm:text-sm text-gray-300 mb-2 sm:mb-4">{movie.solution}</p>
                                <div className="flex gap-1 sm:gap-2 mb-3">
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
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCardFlip(index);
                                  }}
                                  size="sm"
                                  className="neural-button text-xs"
                                >
                                  See Full Details
                                </Button>
                              </div>
                            )}
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

      {/* Video Player Modal */}
      {selectedMovie && selectedMovie.trailer && (
        <VideoPlayer
          isOpen={isVideoPlayerOpen}
          onClose={() => setIsVideoPlayerOpen(false)}
          videoUrl={selectedMovie.trailer}
          title={selectedMovie.title}
        />
      )}
    </div>
  );
};
