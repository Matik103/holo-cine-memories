import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Search, Star, Calendar, User, Clapperboard } from "lucide-react";
import { Movie } from "./MovieCard";

interface SimilarMoviesProps {
  originalMovie: Movie;
  similarMovies: Movie[];
  onBack: () => void;
  onMovieSearch: (query: string) => void;
}

export const SimilarMovies = ({ originalMovie, similarMovies, onBack, onMovieSearch }: SimilarMoviesProps) => {
  // Debug logging
  console.log('SimilarMovies component received:', { originalMovie, similarMovies });
  
  const handleMovieClick = (movie: Movie) => {
    // Search for the movie using its title
    onMovieSearch(movie.title);
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-0">
      {/* Header */}
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

      {/* Similar Movies List - Text-based */}
      {similarMovies.length > 0 ? (
        <div className="space-y-3">
          {similarMovies.map((movie, index) => (
            <Card 
              key={`${movie.title}-${movie.year}`}
              className="neural-card rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group border-border hover:border-primary/50"
              onClick={() => handleMovieClick(movie)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {movie.title}
                    </h3>
                    <span className="text-sm text-muted-foreground">({movie.year})</span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {movie.director && movie.director !== 'Unknown Director' && (
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{movie.director}</span>
                      </div>
                    )}
                    
                    {movie.imdbRating && movie.imdbRating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span>{movie.imdbRating.toFixed(1)}</span>
                      </div>
                    )}
                    
                    {movie.genre && movie.genre.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Clapperboard className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{movie.genre.slice(0, 2).join(', ')}</span>
                      </div>
                    )}
                  </div>
                  
                  {movie.plot && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                      {movie.plot}
                    </p>
                  )}
                </div>
                
                <div className="ml-4 flex-shrink-0">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Search className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-secondary/20 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
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

