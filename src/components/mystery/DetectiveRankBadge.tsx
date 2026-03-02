import { mysteryService, DetectiveStats } from '@/services/mysteryService';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from 'react-i18next';

interface DetectiveRankBadgeProps {
  rank: DetectiveStats['detective_rank'];
  solves?: number;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function DetectiveRankBadge({ 
  rank, 
  solves = 0, 
  showProgress = false,
  size = 'md' 
}: DetectiveRankBadgeProps) {
  const { t } = useTranslation();
  const rankInfo = mysteryService.getDetectiveRankInfo(rank);
  
  // Map rank keys to translation keys
  const getRankTranslationKey = (rankKey: string): string => {
    const rankMap: Record<string, string> = {
      'rookie': 'mystery.rank.rookie',
      'sleuth': 'mystery.rank.sleuth',
      'detective': 'mystery.rank.detective',
      'master_detective': 'mystery.rank.masterDetective',
      'legend': 'mystery.rank.legend',
    };
    return rankMap[rankKey] || rankKey;
  };
  
  // Get translated rank label
  const translatedRankLabel = t(getRankTranslationKey(rank));
  
  // Get translated next rank label
  const translatedNextRank = rankInfo.nextRank 
    ? t(getRankTranslationKey(rankInfo.nextRank))
    : '';
  
  const sizeClasses = {
    sm: 'text-xs gap-1',
    md: 'text-sm gap-2',
    lg: 'text-base gap-2'
  };

  const iconSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl'
  };

  const progressToNext = rankInfo.nextRank 
    ? Math.min(100, (solves / rankInfo.solvesNeeded) * 100)
    : 100;

  const solvesRemaining = rankInfo.nextRank 
    ? Math.max(0, rankInfo.solvesNeeded - solves)
    : 0;

  return (
    <div 
      className={`flex items-center ${sizeClasses[size]}`}
      role="img"
      aria-label={t('mystery.rank.detectiveRank', { rank: translatedRankLabel }) + (showProgress && rankInfo.nextRank ? `. ${t('mystery.rank.solvesNeededForRank', { count: solvesRemaining, rank: translatedNextRank })}` : '')}
    >
      <span className={iconSizes[size]} aria-hidden="true">{rankInfo.icon}</span>
      <div className="flex flex-col">
        <span className={`font-medium ${rankInfo.color}`}>{translatedRankLabel}</span>
        {showProgress && rankInfo.nextRank && (
          <div className="mt-1">
            <Progress 
              value={progressToNext} 
              className="h-1.5 w-24" 
              aria-label={t('mystery.rank.progressToRank', { rank: translatedNextRank, percent: Math.round(progressToNext) })}
            />
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {t('mystery.rank.moreToRank', { count: solvesRemaining, rank: translatedNextRank })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
