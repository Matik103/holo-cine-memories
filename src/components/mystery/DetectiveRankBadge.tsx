import { DetectiveStats } from '@/services/mysteryService';
import { mysteryService } from '@/services/mysteryService';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface DetectiveRankBadgeProps {
  rank: DetectiveStats['detective_rank'];
  solves: number;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function DetectiveRankBadge({ 
  rank, 
  solves, 
  showProgress = false,
  size = 'md' 
}: DetectiveRankBadgeProps) {
  const rankInfo = mysteryService.getDetectiveRankInfo(rank);
  
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  const iconSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  // Calculate progress to next rank
  const getProgressToNextRank = () => {
    const thresholds = {
      rookie: { current: 0, next: 5 },
      sleuth: { current: 5, next: 20 },
      detective: { current: 20, next: 50 },
      master_detective: { current: 50, next: 100 },
      legend: { current: 100, next: 100 }
    };
    
    const { current, next } = thresholds[rank];
    if (rank === 'legend') return 100;
    
    const progress = ((solves - current) / (next - current)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <Badge 
        variant="outline" 
        className={`${sizeClasses[size]} ${rankInfo.color} bg-background/50 border-current/30`}
      >
        <span className={iconSizes[size]}>{rankInfo.icon}</span>
        <span className="ml-1">{rankInfo.label}</span>
      </Badge>
      
      {showProgress && rankInfo.nextRank && (
        <div className="w-full max-w-[120px]">
          <Progress value={getProgressToNextRank()} className="h-1" />
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {solves}/{rankInfo.solvesNeeded} to {mysteryService.getDetectiveRankInfo(rankInfo.nextRank as DetectiveStats['detective_rank']).label}
          </p>
        </div>
      )}
    </div>
  );
}
