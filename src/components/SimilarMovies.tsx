import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Play, Star, Clock, Users, Calendar, User, Clapperboard, Film } from "lucide-react";
import { Movie } from "./MovieCard";

interface SimilarMoviesProps {
  originalMovie: Movie;
  similarMovies: Movie[];
  onBack: () => void;
  onMovieSelect: (movie: Movie) => void;
}

export const SimilarMovies = ({ originalMovie, similarMovies, onBack, onMovieSelect }: SimilarMoviesProps) => {
  // Debug logging
  console.log('SimilarMovies component received:', { originalMovie, similarMovies });
  
  return (
    <div className="w-full max-w-6xl mx-auto space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-0">
      {/* Header - Mobile Optimized */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="rounded-full w-10 h-10 p-0 hover:bg-secondary/50 touch-manipulation flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">Similar Movies</h1>
          <p className="text-sm sm:text-base md:text-lg text-primary font-medium truncate">
            Movies like {originalMovie.title}
          </p>
        </div>
      </div>

      {/* Similar Movies Grid - Optimized for 2 movies */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
        {similarMovies.map((movie, index) => (
          <Card 
            key={`${movie.title}-${movie.year}`}
            className="neural-card rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
            onClick={() => onMovieSelect(movie)}
          >
            {/* Movie Poster */}
            <div className="relative aspect-[2/3] bg-secondary/20 flex items-center justify-center text-muted-foreground">
              {movie.poster ? (
                <img 
                  src={movie.poster} 
                  alt={movie.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  onError={(e) => {
                    console.log('Poster failed to load for:', movie.title, 'URL:', movie.poster);
                    e.currentTarget.style.display = 'none';
                  }}
                  onLoad={() => {
                    console.log('Poster loaded successfully for:', movie.title);
                  }}
                />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Film className="w-12 h-12 opacity-30" />
                  <span className="text-xs opacity-50">No poster</span>
                </div>
              )}
              
              {/* Play Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Play className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            {/* Movie Info */}
            <div className="p-4 sm:p-6 space-y-3">
              <h3 className="text-lg sm:text-xl font-semibold text-foreground truncate">{movie.title}</h3>
              
              {/* Year and Rating */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  {movie.year}
                </div>
                {movie.imdbRating && movie.imdbRating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    {movie.imdbRating.toFixed(1)}
                  </div>
                )}
                {movie.runtime && movie.runtime > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {movie.runtime}m
                  </div>
                )}
              </div>
              
              {/* Director */}
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <User className="w-4 h-4 flex-shrink-0" />
                {movie.director || 'Unknown Director'}
              </p>
              
              {/* Genre */}
              {movie.genre && movie.genre.length > 0 && (
                <div className="flex items-start gap-2">
                  <Clapperboard className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div className="flex flex-wrap gap-1">
                    {movie.genre.slice(0, 3).map((genre, idx) => (
                      <span key={idx} className="text-xs bg-secondary/50 text-muted-foreground px-2 py-1 rounded-full">
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Plot Preview */}
              {movie.plot && (
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {movie.plot}
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {similarMovies.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-secondary/20 rounded-full flex items-center justify-center mb-4">
            <Play className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Similar Movies Found</h3>
          <p className="text-muted-foreground">
            We couldn't find similar movies for {originalMovie.title}. Try searching for another movie.
          </p>
        </div>
      )}

      {/* Back to Original Movie Button */}
      {similarMovies.length > 0 && (
        <div className="flex justify-center pt-6">
          <Button 
            variant="outline"
            onClick={onBack}
            className="neural-button rounded-xl border-border hover:bg-secondary/50 h-12 px-6 touch-manipulation"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {originalMovie.title}
          </Button>
        </div>
      )}

      {/* Neural Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="floating-particle absolute top-32 right-20 w-2 h-2 bg-accent rounded-full opacity-40" style={{ animationDelay: '1s' }}></div>
        <div className="floating-particle absolute bottom-40 left-24 w-1 h-1 bg-primary rounded-full opacity-60" style={{ animationDelay: '3s' }}></div>
      </div>
    </div>
  );
};

