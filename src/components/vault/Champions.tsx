import { useTranslation } from '@/hooks/useTranslation';
import { useVaultChampions } from '@/hooks/useVaultStats';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { vaultService } from '@/services/vaultService';
import { Crown, Flame, Star, Medal } from 'lucide-react';

export function Champions() {
  const { t } = useTranslation();
  const { champions, isLoading } = useVaultChampions();

  if (isLoading) {
    return (
      <div className="space-y-2 sm:space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-primary/5">
            <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-3 sm:h-4 w-20 sm:w-24 mb-1" />
              <Skeleton className="h-2 sm:h-3 w-12 sm:w-16" />
            </div>
            <Skeleton className="w-10 sm:w-12 h-5 sm:h-6" />
          </div>
        ))}
      </div>
    );
  }

  if (champions.length === 0) {
    return (
      <div className="text-center py-6 sm:py-8">
        <Crown className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-primary/50" />
        <p className="text-sm sm:text-base text-muted-foreground">{t('vault.champions.empty')}</p>
        <p className="text-xs sm:text-sm text-muted-foreground/70 mt-1">
          {t('vault.champions.beFirst')}
        </p>
      </div>
    );
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />;
      case 1:
        return <Medal className="h-4 w-4 sm:h-5 sm:w-5 text-gray-300" />;
      case 2:
        return <Medal className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400" />;
      default:
        return <Star className="h-4 w-4 sm:h-5 sm:w-5 text-primary/50" />;
    }
  };

  const getRankBg = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
      case 1:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/30';
      case 2:
        return 'bg-gradient-to-r from-orange-400/20 to-orange-500/20 border-orange-400/30';
      default:
        return 'bg-primary/5 border-primary/10';
    }
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      {champions.map((champion, index) => (
        <div
          key={`${champion.display_name}_${index}`}
          className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border transition-all hover:scale-[1.02] ${getRankBg(index)}`}
        >
          {/* Rank */}
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-background/50">
            {getRankIcon(index)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-xs sm:text-sm font-medium truncate">
                @{champion.display_name}
              </span>
              {index === 0 && (
                <Badge className="text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0 h-3 sm:h-4 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  {t('vault.champions.topScorer')}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-muted-foreground mt-0.5">
              {champion.current_streak > 0 && (
                <span className="flex items-center gap-0.5 sm:gap-1">
                  <Flame className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-orange-400" />
                  {champion.current_streak} {t('vault.champions.dayStreak')}
                </span>
              )}
              {champion.badges.length > 0 && (
                <span className="flex items-center gap-0.5 sm:gap-1">
                  {champion.badges.slice(0, 3).map((badge, i) => (
                    <span key={i} className="text-xs sm:text-sm">{badge.icon}</span>
                  ))}
                  {champion.badges.length > 3 && (
                    <span className="text-muted-foreground">+{champion.badges.length - 3}</span>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Score */}
          <div className="text-right">
            <div className="text-base sm:text-lg font-bold">
              {champion.vault_score.toLocaleString()}
            </div>
            <div className="text-[8px] sm:text-[10px] text-muted-foreground uppercase tracking-wide">
              {t('vault.score')}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
