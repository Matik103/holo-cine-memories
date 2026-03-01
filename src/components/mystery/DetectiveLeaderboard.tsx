import { useTopDetectives } from '@/hooks/useMysteries';
import { mysteryService } from '@/services/mysteryService';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Flame, AlertCircle } from 'lucide-react';

export function DetectiveLeaderboard() {
  const { detectives, isLoading, error } = useTopDetectives(5);

  if (isLoading) {
    return (
      <div className="space-y-2" role="status" aria-label="Loading leaderboard">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6 text-muted-foreground" role="alert">
        <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" aria-hidden="true" />
        <p className="text-sm">Failed to load leaderboard</p>
      </div>
    );
  }

  if (detectives.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" aria-hidden="true" />
        <p className="text-sm">No detectives yet. Be the first to solve a mystery!</p>
      </div>
    );
  }

  return (
    <ol className="space-y-2" aria-label="Top detectives leaderboard">
      {detectives.map((detective, index) => {
        const rankInfo = mysteryService.getDetectiveRankInfo(detective.detective_rank as any);
        const isTop3 = index < 3;
        const medals = ['🥇', '🥈', '🥉'];

        return (
          <li
            key={`${detective.display_name}-${index}`}
            className={`flex items-center gap-3 p-3 rounded-lg ${
              isTop3 ? 'bg-primary/5 border border-primary/10' : 'bg-background/50'
            }`}
            aria-label={`Rank ${index + 1}: ${detective.display_name}, ${detective.mysteries_solved} mysteries solved, ${rankInfo.label} rank${detective.solve_streak > 0 ? `, ${detective.solve_streak} solve streak` : ''}`}
          >
            {/* Rank */}
            <div className="w-8 text-center" aria-hidden="true">
              {isTop3 ? (
                <span className="text-lg">{medals[index]}</span>
              ) : (
                <span className="text-sm text-muted-foreground font-medium">#{index + 1}</span>
              )}
            </div>

            {/* Detective info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">{detective.display_name}</span>
                <span className={`text-sm ${rankInfo.color}`} aria-label={rankInfo.label}>{rankInfo.icon}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {detective.mysteries_solved} mysteries solved
              </p>
            </div>

            {/* Streak */}
            {detective.solve_streak > 0 && (
              <div className="flex items-center gap-1 text-orange-400" aria-label={`${detective.solve_streak} solve streak`}>
                <Flame className="h-3 w-3" aria-hidden="true" />
                <span className="text-xs font-medium">{detective.solve_streak}</span>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
