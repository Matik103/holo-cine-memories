import { Mystery } from '@/services/mysteryService';
import { mysteryService } from '@/services/mysteryService';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, MessageSquare, Clock, Trophy, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { KeyboardEvent } from 'react';

interface MysteryCardProps {
  mystery: Mystery;
  compact?: boolean;
}

export function MysteryCard({ mystery, compact = false }: MysteryCardProps) {
  const navigate = useNavigate();
  const difficultyInfo = mysteryService.getDifficultyInfo(mystery.difficulty);
  const timeAgo = mysteryService.formatTimeAgo(mystery.created_at);

  const handleClick = () => {
    navigate(`/mysteries/${mystery.id}`);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  if (compact) {
    return (
      <Card 
        className="neural-card p-2.5 sm:p-3 cursor-pointer hover:border-primary/40 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98]"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`Mystery: ${mystery.description.slice(0, 50)}${mystery.description.length > 50 ? '...' : ''}. ${mystery.status === 'solved' ? 'Solved' : `${mystery.points_reward} points`}. ${mystery.attempt_count} attempts.`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm line-clamp-2">{mystery.description}</p>
            <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-muted-foreground">
              <span>{timeAgo}</span>
              <span aria-hidden="true">•</span>
              <span className="flex items-center gap-0.5 sm:gap-1">
                <MessageSquare className="h-2.5 w-2.5 sm:h-3 sm:w-3" aria-hidden="true" />
                <span aria-label={`${mystery.attempt_count} attempts`}>{mystery.attempt_count}</span>
              </span>
            </div>
          </div>
          {mystery.status === 'solved' ? (
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" aria-label="Solved" />
          ) : (
            <Badge variant="outline" className={`${difficultyInfo.bgColor} ${difficultyInfo.color} text-[9px] sm:text-[10px] px-1.5`}>
              +{mystery.points_reward}
            </Badge>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className="neural-card p-3 sm:p-4 cursor-pointer hover:border-primary/40 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.99]"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Mystery by ${mystery.poster_name}: ${mystery.description.slice(0, 100)}${mystery.description.length > 100 ? '...' : ''}. ${mystery.status === 'solved' ? `Solved: ${mystery.solution_movie_title}` : `${mystery.points_reward} points, ${difficultyInfo.label} difficulty`}. ${mystery.view_count} views, ${mystery.attempt_count} attempts. Posted ${timeAgo}.`}
    >
      {/* Status indicator */}
      {mystery.status === 'solved' && (
        <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 text-green-500">
          <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
          <span className="text-[10px] sm:text-xs font-medium">Solved</span>
          {mystery.solution_movie_title && (
            <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
              — {mystery.solution_movie_title} {mystery.solution_movie_year && `(${mystery.solution_movie_year})`}
            </span>
          )}
        </div>
      )}

      {/* Mystery description */}
      <p className="text-sm sm:text-base mb-2 sm:mb-3 line-clamp-3 group-hover:text-primary/90 transition-colors">
        {mystery.description}
      </p>

      {/* Additional clues */}
      {mystery.additional_clues && (
        <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 sm:mb-3 line-clamp-2 italic">
          Clues: {mystery.additional_clues}
        </p>
      )}

      {/* Footer - responsive layout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        {/* Stats row - scrollable on very small screens */}
        <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-muted-foreground overflow-x-auto scrollbar-hide">
          <span className="flex items-center gap-1 flex-shrink-0">
            <Clock className="h-3 w-3" aria-hidden="true" />
            <span>{timeAgo}</span>
          </span>
          <span className="flex items-center gap-1 flex-shrink-0">
            <Eye className="h-3 w-3" aria-hidden="true" />
            <span aria-label={`${mystery.view_count} views`}>{mystery.view_count}</span>
          </span>
          <span className="flex items-center gap-1 flex-shrink-0">
            <MessageSquare className="h-3 w-3" aria-hidden="true" />
            <span aria-label={`${mystery.attempt_count} attempts`}>{mystery.attempt_count}</span>
          </span>
        </div>

        {/* Badges - wrap on mobile */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <Badge 
            variant="outline" 
            className={`${difficultyInfo.bgColor} ${difficultyInfo.color} text-[9px] sm:text-[10px] px-1.5 sm:px-2`}
          >
            {difficultyInfo.label}
          </Badge>
          {mystery.status === 'unsolved' && (
            <Badge variant="outline" className="bg-primary/10 text-primary text-[9px] sm:text-[10px] px-1.5 sm:px-2">
              <Trophy className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" aria-hidden="true" />
              +{mystery.points_reward}
            </Badge>
          )}
        </div>
      </div>

      {/* Poster info */}
      <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border/50 text-[10px] sm:text-xs text-muted-foreground">
        Posted by <span className="text-primary/80">{mystery.poster_name}</span>
      </div>
    </Card>
  );
}
