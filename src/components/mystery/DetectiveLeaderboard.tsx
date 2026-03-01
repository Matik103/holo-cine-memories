import { useTopDetectives } from '@/hooks/useMysteries';
import { mysteryService } from '@/services/mysteryService';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Flame, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function DetectiveLeaderboard() {
  const { detectives, isLoading, error } = useTopDetectives(5);
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="space-y-2" role="status" aria-label={t('mystery.loading')}>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-10 sm:h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 sm:py-6 text-muted-foreground" role="alert">
        <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" aria-hidden="true" />
        <p className="text-xs sm:text-sm">{t('mystery.failedLeaderboard')}</p>
      </div>
    );
  }

  if (detectives.length === 0) {
    return (
      <div className="text-center py-4 sm:py-6 text-muted-foreground">
        <Trophy className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" aria-hidden="true" />
        <p className="text-xs sm:text-sm">{t('mystery.noDetectives')}</p>
      </div>
    );
  }

  return (
    <ol className="space-y-1.5 sm:space-y-2" aria-label={t('mystery.topDetectives')}>
      {detectives.map((detective, index) => {
        const rankInfo = mysteryService.getDetectiveRankInfo(detective.detective_rank as any);
        const isTop3 = index < 3;
        const medals = ['🥇', '🥈', '🥉'];

        return (
          <li
            key={`${detective.display_name}-${index}`}
            className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg ${
              isTop3 ? 'bg-primary/5 border border-primary/10' : 'bg-background/50'
            }`}
            aria-label={`#${index + 1}: ${detective.display_name}, ${t('mystery.solvedCount', { count: detective.mysteries_solved })}${detective.solve_streak > 0 ? `, ${detective.solve_streak} ${t('mystery.streak')}` : ''}`}
          >
            {/* Rank */}
            <div className="w-6 sm:w-8 text-center flex-shrink-0" aria-hidden="true">
              {isTop3 ? (
                <span className="text-base sm:text-lg">{medals[index]}</span>
              ) : (
                <span className="text-[10px] sm:text-sm text-muted-foreground font-medium">#{index + 1}</span>
              )}
            </div>

            {/* Detective info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xs sm:text-sm font-medium truncate">{detective.display_name}</span>
                <span className={`text-xs sm:text-sm ${rankInfo.color} flex-shrink-0`} aria-label={rankInfo.label}>{rankInfo.icon}</span>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {t('mystery.solvedCount', { count: detective.mysteries_solved })}
              </p>
            </div>

            {/* Streak */}
            {detective.solve_streak > 0 && (
              <div className="flex items-center gap-0.5 sm:gap-1 text-orange-400 flex-shrink-0" aria-label={`${detective.solve_streak} ${t('mystery.streak')}`}>
                <Flame className="h-3 w-3" aria-hidden="true" />
                <span className="text-[10px] sm:text-xs font-medium">{detective.solve_streak}</span>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
