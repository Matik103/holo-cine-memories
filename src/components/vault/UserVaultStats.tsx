import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { VaultUserStats } from '@/services/vaultService';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { vaultService } from '@/services/vaultService';
import { Flame, Target, Award, TrendingUp, ChevronRight } from 'lucide-react';

interface UserVaultStatsProps {
  stats: VaultUserStats | null;
  isLoading: boolean;
}

export function UserVaultStats({ stats, isLoading }: UserVaultStatsProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full rounded-lg" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">{t('vault.yourStats.noStats')}</p>
      </div>
    );
  }

  const percentileMessage = stats.rank_percentile !== null
    ? t('vault.yourStats.uniqueTaste', { percentile: Math.round(100 - stats.rank_percentile) })
    : t('vault.yourStats.keepSearching');

  const predictionAccuracy = stats.predictions_total > 0
    ? Math.round((stats.predictions_correct / stats.predictions_total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Percentile Banner */}
      <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/20">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-primary">{percentileMessage}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('vault.yourStats.basedOnSearches', { count: stats.total_searches })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Streak */}
        <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-center">
          <Flame className="h-5 w-5 mx-auto text-orange-400 mb-1" />
          <div className="text-2xl font-bold text-orange-400">{stats.current_streak}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
            {t('vault.yourStats.dayStreak')}
          </div>
          {stats.longest_streak > stats.current_streak && (
            <div className="text-[10px] text-muted-foreground mt-1">
              {t('vault.yourStats.best')}: {stats.longest_streak}
            </div>
          )}
        </div>

        {/* Predictions */}
        <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center">
          <Target className="h-5 w-5 mx-auto text-purple-400 mb-1" />
          <div className="text-2xl font-bold text-purple-400">
            {stats.predictions_correct}/{stats.predictions_total}
          </div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
            {t('vault.yourStats.predictions')}
          </div>
          {stats.predictions_total > 0 && (
            <div className="text-[10px] text-muted-foreground mt-1">
              {predictionAccuracy}% {t('vault.yourStats.accuracy')}
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-center">
          <Award className="h-5 w-5 mx-auto text-cyan-400 mb-1" />
          <div className="text-2xl font-bold text-cyan-400">{stats.badges.length}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
            {t('vault.yourStats.badges')}
          </div>
        </div>
      </div>

      {/* Badges Display */}
      {stats.badges.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">{t('vault.yourStats.earnedBadges')}</h4>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-6 px-2"
              onClick={() => navigate('/profile')}
            >
              {t('common.viewAll')}
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.badges.slice(0, 6).map((badge) => (
              <div
                key={badge.id}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${vaultService.getRarityBgColor(badge.rarity)} border border-current/20`}
                title={badge.description}
              >
                <span className="text-base">{badge.icon}</span>
                <span className={`text-xs font-medium ${vaultService.getRarityColor(badge.rarity)}`}>
                  {badge.name}
                </span>
              </div>
            ))}
            {stats.badges.length > 6 && (
              <Badge variant="outline" className="text-xs">
                +{stats.badges.length - 6} {t('vault.yourStats.more')}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Genres Explored */}
      {stats.genres_explored.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">{t('vault.yourStats.genresExplored')}</h4>
          <div className="flex flex-wrap gap-1.5">
            {stats.genres_explored.slice(0, 8).map((genre) => (
              <Badge key={genre} variant="secondary" className="text-xs">
                {genre}
              </Badge>
            ))}
            {stats.genres_explored.length > 8 && (
              <Badge variant="outline" className="text-xs">
                +{stats.genres_explored.length - 8}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Progress to next badge hint */}
      <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">
            {t('vault.yourStats.nextBadge')}
          </span>
          <span className="text-xs font-medium text-primary">
            {getNextBadgeHint(stats)}
          </span>
        </div>
        <Progress value={getNextBadgeProgress(stats)} className="h-1.5" />
      </div>
    </div>
  );
}

function getNextBadgeHint(stats: VaultUserStats): string {
  if (stats.total_searches < 25) {
    return `${stats.total_searches}/25 searches`;
  }
  if (stats.current_streak < 7) {
    return `${stats.current_streak}/7 day streak`;
  }
  if (stats.total_searches < 100) {
    return `${stats.total_searches}/100 searches`;
  }
  if (stats.current_streak < 30) {
    return `${stats.current_streak}/30 day streak`;
  }
  return 'Keep exploring!';
}

function getNextBadgeProgress(stats: VaultUserStats): number {
  if (stats.total_searches < 25) {
    return (stats.total_searches / 25) * 100;
  }
  if (stats.current_streak < 7) {
    return (stats.current_streak / 7) * 100;
  }
  if (stats.total_searches < 100) {
    return (stats.total_searches / 100) * 100;
  }
  if (stats.current_streak < 30) {
    return (stats.current_streak / 30) * 100;
  }
  return 100;
}
