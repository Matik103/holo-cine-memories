import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useVaultTrending } from '@/hooks/useVaultStats';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Flame } from 'lucide-react';

interface TrendingChartProps {
  period: 'hour' | 'day' | 'week';
}

export function TrendingChart({ period }: TrendingChartProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { trending, isLoading } = useVaultTrending(period);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="w-16 h-4" />
          </div>
        ))}
      </div>
    );
  }

  if (trending.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>{t('vault.trending.empty')}</p>
      </div>
    );
  }

  const maxCount = Math.max(...trending.map(t => t.recall_count));

  return (
    <div className="space-y-3">
      {trending.map((movie, index) => {
        const percentage = (movie.recall_count / maxCount) * 100;
        const isTop3 = index < 3;
        
        return (
          <div
            key={`${movie.movie_title}_${movie.movie_year}`}
            className="group flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer"
            onClick={() => navigate(`/movie/${encodeURIComponent(movie.movie_title)}`)}
          >
            {/* Rank */}
            <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
              index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
              index === 1 ? 'bg-gray-400/20 text-gray-300' :
              index === 2 ? 'bg-orange-500/20 text-orange-400' :
              'bg-primary/10 text-primary/60'
            }`}>
              {index + 1}
            </div>

            {/* Poster */}
            {movie.poster_url ? (
              <img
                src={movie.poster_url}
                alt={movie.movie_title}
                className="w-10 h-14 object-cover rounded shadow-md group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-10 h-14 bg-primary/10 rounded flex items-center justify-center">
                <Flame className="h-4 w-4 text-primary/50" />
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate group-hover:text-primary transition-colors">
                  {movie.movie_title}
                </span>
                {movie.movie_year && (
                  <span className="text-xs text-muted-foreground">
                    ({movie.movie_year})
                  </span>
                )}
                {isTop3 && (
                  <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-primary/30 text-primary">
                    {t('vault.trending.hot')}
                  </Badge>
                )}
              </div>
              
              {/* Progress bar */}
              <div className="mt-1 h-1.5 bg-primary/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                    index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                    index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                    'bg-primary/50'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {/* Genres */}
              {movie.genres && movie.genres.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {movie.genres.slice(0, 2).map(genre => (
                    <span key={genre} className="text-[10px] text-muted-foreground">
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Count */}
            <div className="text-right">
              <div className="font-bold text-primary">
                {movie.recall_count.toLocaleString()}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {t('vault.trending.recalls')}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
