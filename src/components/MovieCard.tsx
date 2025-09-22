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
        <div className="md:w-1/3 relative group">
          <div className="aspect-[2/3] bg-gradient-to-br from-secondary to-muted flex items-center justify-center relative overflow-hidden rounded-lg">
            {movie.poster && !imageError ? (
              <>
                <img 
                  src={movie.poster} 
                  alt={movie.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={() => setImageError(true)}
                />
                {/* Trailer Play Overlay */}
                {movie.trailer && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button
                      onClick={() => window.open(movie.trailer, '_blank')}
                      size="lg"
                      className="neural-button rounded-full w-16 h-16 p-0"
                    >
                      <Play className="w-6 h-6 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center space-y-4 p-8">
                <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                  <Play className="w-8 h-8 text-primary" />
                </div>
                <div className="text-sm text-muted-foreground">
                  {movie.trailer ? 'Poster Not Available' : 'Movie Poster'}
                </div>
                {movie.trailer && (
                  <Button
                    onClick={() => window.open(movie.trailer, '_blank')}
                    size="sm"
                    className="neural-button rounded-full"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Watch Trailer
                  </Button>
                )}
              </div>
            )}
          </div>
          
          {/* Memory Match Indicator */}
          <div className="absolute top-4 right-4">
            <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground border-0">
              Memory Match
            </Badge>
          </div>
          
          {/* Trailer Available Indicator */}
          {movie.trailer && (
            <div className="absolute bottom-4 left-4">
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                <Play className="w-3 h-3 mr-1" />
                Trailer Available
              </Badge>
            </div>
          )}
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
            
            {/* Media Status */}
            <div className="flex flex-wrap gap-2 pt-2">
              {movie.poster && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  📸 Poster Available
                </Badge>
              )}
              {movie.trailer && (
                <Badge variant="outline" className="text-red-600 border-red-600">
                  🎬 Trailer Available
                </Badge>
              )}
              {!movie.poster && !movie.trailer && (
                <Badge variant="outline" className="text-muted-foreground">
                  📺 Media Loading...
                </Badge>
              )}
            </div>
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
            {movie.trailer && (
              <Button 
                onClick={() => window.open(movie.trailer, '_blank')}
                className="neural-button rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Watch Trailer
              </Button>
            )}
            
            <Button 
              onClick={onFindWhereToWatch}
              className="neural-button rounded-xl"
            >
              <Play className="w-4 h-4 mr-2" />
              Where to Watch
            </Button>
            
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