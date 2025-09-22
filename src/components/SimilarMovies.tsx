import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Play, Star, Clock, Users } from "lucide-react";
import { Movie } from "./MovieCard";

interface SimilarMoviesProps {
  originalMovie: Movie;
  similarMovies: Movie[];
  onBack: () => void;
  onMovieSelect: (movie: Movie) => void;
}

export const SimilarMovies = ({ originalMovie, similarMovies, onBack, onMovieSelect }: SimilarMoviesProps) => {
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

      {/* Similar Movies Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {similarMovies.map((movie, index) => (
          <Card 
            key={`${movie.title}-${movie.year}`}
            className="neural-card rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
            onClick={() => onMovieSelect(movie)}
          >
            <div className="p-4 sm:p-6">
              {/* Movie Header */}
              <div className="space-y-2 mb-4">
                <h3 className="font-bold text-foreground text-base sm:text-lg line-clamp-2 group-hover:text-primary transition-colors">
                  {movie.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {movie.year} • {movie.director}
                </p>
              </div>

              {/* Movie Details */}
              <div className="space-y-3">
                {/* Plot */}
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  {movie.plot}
                </p>

                {/* Genres */}
                {movie.genre && movie.genre.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {movie.genre.slice(0, 3).map((genre, genreIndex) => (
                      <span 
                        key={genreIndex}
                        className="px-2 py-1 bg-secondary/30 text-xs rounded-full text-muted-foreground"
                      >
                        {genre}
                      </span>
                    ))}
                    {movie.genre.length > 3 && (
                      <span className="px-2 py-1 bg-secondary/30 text-xs rounded-full text-muted-foreground">
                        +{movie.genre.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Movie Stats */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {movie.imdbRating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>{movie.imdbRating}</span>
                    </div>
                  )}
                  {movie.runtime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{movie.runtime}m</span>
                    </div>
                  )}
                  {movie.cast && movie.cast.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{movie.cast.length} cast</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-4 border-t border-border">
                <Button 
                  className="w-full neural-button rounded-lg h-10 touch-manipulation"
                  size="sm"
                >
                  <Play className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>
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

      {/* Neural Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="floating-particle absolute top-32 right-20 w-2 h-2 bg-accent rounded-full opacity-40" style={{ animationDelay: '1s' }}></div>
        <div className="floating-particle absolute bottom-40 left-24 w-1 h-1 bg-primary rounded-full opacity-60" style={{ animationDelay: '3s' }}></div>
      </div>
    </div>
  );
};

