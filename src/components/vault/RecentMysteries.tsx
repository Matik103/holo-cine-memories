import { useNavigate } from 'react-router-dom';
import { useMysteries, useUnsolvedCount } from '@/hooks/useMysteries';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { HelpCircle, Eye, MessageSquare, Trophy, ArrowRight, Users } from 'lucide-react';

export function RecentMysteries() {
  const navigate = useNavigate();
  const unsolvedCount = useUnsolvedCount();
  const { mysteries, isLoading } = useMysteries('unsolved', 'recent');

  // Only show first 3 mysteries
  const recentMysteries = mysteries.slice(0, 3);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (recentMysteries.length === 0) {
    return (
      <div className="text-center py-6">
        <HelpCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No mysteries yet</p>
        <Button 
          variant="link" 
          size="sm" 
          onClick={() => navigate('/mysteries')}
          className="mt-2"
        >
          Be the first to post one
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Stats bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
        <span className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {unsolvedCount} unsolved mysteries
        </span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/mysteries')}
          className="h-6 text-xs gap-1 px-2"
        >
          View All
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>

      {/* Mystery list */}
      {recentMysteries.map((mystery) => (
        <div
          key={mystery.id}
          onClick={() => navigate(`/mysteries/${mystery.id}`)}
          className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20 hover:border-purple-500/40 cursor-pointer transition-all group"
        >
          <p className="text-sm line-clamp-2 group-hover:text-purple-300 transition-colors">
            {mystery.description}
          </p>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {mystery.view_count}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {mystery.attempt_count}
              </span>
            </div>
            <span className="flex items-center gap-1 text-[10px] text-primary">
              <Trophy className="h-3 w-3" />
              +{mystery.points_reward}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
