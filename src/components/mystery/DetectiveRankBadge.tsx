import { mysteryService, DetectiveStats } from '@/services/mysteryService';
import { Progress } from '@/components/ui/progress';

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
  const rankInfo = mysteryService.getDetectiveRankInfo(rank);
  
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
      aria-label={`Detective rank: ${rankInfo.label}${showProgress && rankInfo.nextRank ? `. ${solvesRemaining} more solves needed for ${rankInfo.nextRank.replace('_', ' ')}` : ''}`}
    >
      <span className={iconSizes[size]} aria-hidden="true">{rankInfo.icon}</span>
      <div className="flex flex-col">
        <span className={`font-medium ${rankInfo.color}`}>{rankInfo.label}</span>
        {showProgress && rankInfo.nextRank && (
          <div className="mt-1">
            <Progress 
              value={progressToNext} 
              className="h-1.5 w-24" 
              aria-label={`Progress to ${rankInfo.nextRank.replace('_', ' ')}: ${Math.round(progressToNext)}%`}
            />
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {solvesRemaining} more to {rankInfo.nextRank.replace('_', ' ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
