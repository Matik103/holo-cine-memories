import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useVaultHiddenGems } from '@/hooks/useVaultStats';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Gem, Sparkles, Star } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export function HiddenGems() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { gems, isLoading } = useVaultHiddenGems();

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-shrink-0">
            <Skeleton className="w-32 h-48 rounded-lg" />
            <Skeleton className="w-24 h-4 mt-2" />
          </div>
        ))}
      </div>
    );
  }

  if (gems.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Gem className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>{t('vault.hiddenGems.empty')}</p>
      </div>
    );
  }

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-4 pb-4 px-1">
        {gems.map((gem) => (
          <div
            key={`${gem.movie_title}_${gem.movie_year}`}
            className="flex-shrink-0 w-36 group cursor-pointer"
            onClick={() => navigate(`/movie/${encodeURIComponent(gem.movie_title)}`)}
          >
            <div className="relative overflow-hidden rounded-lg shadow-lg">
              {/* Gem indicator */}
              <div className="absolute top-2 right-2 z-10">
                <div className="p-1.5 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 shadow-lg">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              </div>

              {/* Rating badge */}
              <div className="absolute top-2 left-2 z-10">
                <Badge className="text-[10px] px-1.5 py-0.5 bg-black/70 border-yellow-500/50 text-yellow-400 flex items-center gap-0.5">
                  <Star className="h-2.5 w-2.5 fill-yellow-400" />
                  {(gem.recall_count / 10).toFixed(1)}
                </Badge>
              </div>

              {/* Poster */}
              {gem.poster_url ? (
                <img
                  src={gem.poster_url}
                  alt={gem.movie_title}
                  loading="lazy"
                  className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-full h-52 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center ${gem.poster_url ? 'hidden' : ''}`}>
                <Gem className="h-8 w-8 text-primary/50" />
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Hover info - show genres if available */}
              <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                {gem.genres && gem.genres.length > 0 ? (
                  <Badge variant="outline" className="text-[10px] border-cyan-400/50 text-cyan-400 bg-black/50">
                    {gem.genres.slice(0, 2).join(' • ')}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] border-cyan-400/50 text-cyan-400 bg-black/50">
                    Hidden Gem
                  </Badge>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="mt-2 px-1">
              <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                {gem.movie_title}
              </p>
              {gem.movie_year && (
                <p className="text-xs text-muted-foreground">
                  {gem.movie_year}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
