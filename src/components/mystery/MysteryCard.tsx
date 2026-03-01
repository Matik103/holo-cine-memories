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
        className="neural-card p-3 cursor-pointer hover:border-primary/40 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`Mystery: ${mystery.description.slice(0, 50)}${mystery.description.length > 50 ? '...' : ''}. ${mystery.status === 'solved' ? 'Solved' : `${mystery.points_reward} points`}. ${mystery.attempt_count} attempts.`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm line-clamp-2">{mystery.description}</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <span>{timeAgo}</span>
              <span aria-hidden="true">•</span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" aria-hidden="true" />
                <span aria-label={`${mystery.attempt_count} attempts`}>{mystery.attempt_count}</span>
              </span>
            </div>
          </div>
          {mystery.status === 'solved' ? (
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" aria-label="Solved" />
          ) : (
            <Badge variant="outline" className={`${difficultyInfo.bgColor} ${difficultyInfo.color} text-[10px]`}>
              +{mystery.points_reward}
            </Badge>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className="neural-card p-4 cursor-pointer hover:border-primary/40 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Mystery by ${mystery.poster_name}: ${mystery.description.slice(0, 100)}${mystery.description.length > 100 ? '...' : ''}. ${mystery.status === 'solved' ? `Solved: ${mystery.solution_movie_title}` : `${mystery.points_reward} points, ${difficultyInfo.label} difficulty`}. ${mystery.view_count} views, ${mystery.attempt_count} attempts. Posted ${timeAgo}.`}
    >
      {/* Status indicator */}
      {mystery.status === 'solved' && (
        <div className="flex items-center gap-2 mb-3 text-green-500">
          <CheckCircle className="h-4 w-4" aria-hidden="true" />
          <span className="text-xs font-medium">Solved</span>
          {mystery.solution_movie_title && (
            <span className="text-xs text-muted-foreground">
              — {mystery.solution_movie_title} {mystery.solution_movie_year && `(${mystery.solution_movie_year})`}
            </span>
          )}
        </div>
      )}

      {/* Mystery description */}
      <p className="text-sm sm:text-base mb-3 line-clamp-3 group-hover:text-primary/90 transition-colors">
        "{mystery.description}"
      </p>

      {/* Additional clues */}
      {mystery.additional_clues && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2 italic">
          Clues: {mystery.additional_clues}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden="true" />
            <span>{timeAgo}</span>
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" aria-hidden="true" />
            <span aria-label={`${mystery.view_count} views`}>{mystery.view_count}</span>
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" aria-hidden="true" />
            <span aria-label={`${mystery.attempt_count} attempts`}>{mystery.attempt_count}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={`${difficultyInfo.bgColor} ${difficultyInfo.color} text-[10px]`}
          >
            {difficultyInfo.label}
          </Badge>
          {mystery.status === 'unsolved' && (
            <Badge variant="outline" className="bg-primary/10 text-primary text-[10px]">
              <Trophy className="h-3 w-3 mr-1" aria-hidden="true" />
              +{mystery.points_reward}
            </Badge>
          )}
        </div>
      </div>

      {/* Poster info */}
      <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
        Posted by <span className="text-primary/80">{mystery.poster_name}</span>
      </div>
    </Card>
  );
}
