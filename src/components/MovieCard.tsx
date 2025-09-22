import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Star, Play, BookOpen, Lightbulb } from "lucide-react";

export interface Movie {
  title: string;
  year: number;
  director: string;
  genre: string[];
  plot: string;
  imdbRating?: number;
  runtime?: number;
  cast?: string[];
  poster?: string;
  trailer?: string;
}

interface MovieCardProps {
  movie: Movie;
  onExplainMeaning: () => void;
  onFindWhereToWatch: () => void;
}

export const MovieCard = ({ movie, onExplainMeaning, onFindWhereToWatch }: MovieCardProps) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="neural-card rounded-2xl overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Movie Poster */}
        <div className="md:w-1/3 relative">
          <div className="aspect-[2/3] bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
            {movie.poster && !imageError ? (
              <img 
                src={movie.poster} 
                alt={movie.title}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="text-center space-y-4 p-8">
                <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                  <Play className="w-8 h-8 text-primary" />
                </div>
                <div className="text-sm text-muted-foreground">
                  Movie Poster
                </div>
              </div>
            )}
          </div>
          
          {/* Memory Match Indicator */}
          <div className="absolute top-4 right-4">
            <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground border-0">
              Memory Match
            </Badge>
          </div>
        </div>

        {/* Movie Details */}
        <div className="md:w-2/3 p-8 space-y-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-foreground">
              {movie.title}
            </h2>
            
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{movie.year}</span>
              </div>
              {movie.runtime && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{movie.runtime}min</span>
                </div>
              )}
              {movie.imdbRating && (
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  <span>{movie.imdbRating}/10</span>
                </div>
              )}
            </div>

            <p className="text-muted-foreground">
              Directed by <span className="text-foreground font-medium">{movie.director}</span>
            </p>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-2">
            {movie.genre && movie.genre.length > 0 ? (
              movie.genre.map((g) => (
                <Badge key={g} variant="secondary" className="bg-secondary/60">
                  {g}
                </Badge>
              ))
            ) : (
              <Badge variant="secondary" className="bg-secondary/60">
                Unknown Genre
              </Badge>
            )}
          </div>

          {/* Plot */}
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Plot</h3>
            <p className="text-muted-foreground leading-relaxed">
              {movie.plot}
            </p>
          </div>

          {/* Cast */}
          {movie.cast && movie.cast.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Cast</h3>
              <p className="text-muted-foreground">
                {movie.cast.slice(0, 4).join(', ')}
                {movie.cast.length > 4 && '...'}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4">
            <Button 
              onClick={onFindWhereToWatch}
              className="neural-button rounded-xl"
            >
              <Play className="w-4 h-4 mr-2" />
              Where to Watch
            </Button>
            
            {movie.trailer && (
              <Button 
                onClick={() => window.open(movie.trailer, '_blank')}
                variant="outline"
                className="rounded-xl border-border hover:bg-secondary/50"
              >
                <Play className="w-4 h-4 mr-2" />
                Watch Trailer
              </Button>
            )}
            
            <Button 
              onClick={onExplainMeaning}
              variant="outline"
              className="rounded-xl border-border hover:bg-secondary/50"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Explain Meaning
            </Button>
            
            <Button 
              variant="ghost"
              className="rounded-xl hover:bg-secondary/30"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Similar Movies
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};