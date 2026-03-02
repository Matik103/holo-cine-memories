import { Mystery } from '@/services/mysteryService';
import { mysteryService } from '@/services/mysteryService';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, MessageSquare, Clock, Trophy, CheckCircle, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { KeyboardEvent, MouseEvent, useState, useEffect, useRef } from 'react';
import { ShareMysteryMenu } from './ShareMysteryMenu';
import { useTranslation } from 'react-i18next';
import { translationService } from '@/services/translationService';

interface MysteryCardProps {
  mystery: Mystery;
  compact?: boolean;
}

export function MysteryCard({ mystery, compact = false }: MysteryCardProps) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language?.split('-')[0] || 'en';
  const difficultyInfo = mysteryService.getDifficultyInfo(mystery.difficulty);
  
  const [translatedDescription, setTranslatedDescription] = useState<string>(mystery.description);
  const [translatedClues, setTranslatedClues] = useState<string>(mystery.additional_clues || '');
  const translationAttempted = useRef<string>('');

  const getTranslatedTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return t('time.unknown');
    
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 0) return t('time.justNow');
    if (seconds < 60) return t('time.justNow');
    if (seconds < 3600) return t('time.minutesAgo', { count: Math.floor(seconds / 60) });
    if (seconds < 86400) return t('time.hoursAgo', { count: Math.floor(seconds / 3600) });
    if (seconds < 604800) return t('time.daysAgo', { count: Math.floor(seconds / 86400) });
    return date.toLocaleDateString(currentLanguage);
  };

  const getTranslatedDifficulty = (difficulty: string): string => {
    const difficultyMap: Record<string, string> = {
      easy: t('mystery.difficulty.easy'),
      normal: t('mystery.difficulty.normal'),
      hard: t('mystery.difficulty.hard'),
      legendary: t('mystery.difficulty.legendary')
    };
    return difficultyMap[difficulty] || difficultyMap.normal;
  };

  const timeAgo = getTranslatedTimeAgo(mystery.created_at);
  const difficultyLabel = getTranslatedDifficulty(mystery.difficulty);

  useEffect(() => {
    let mounted = true;
    const translationKey = `${mystery.id}_${currentLanguage}`;
    
    // Skip if we already attempted translation for this mystery+language combo
    if (translationAttempted.current === translationKey) {
      return;
    }
    
    const translateContent = async () => {
      translationAttempted.current = translationKey;
      
      try {
        // Translate description
        if (mystery.description) {
          const translatedDesc = await translationService.translate(mystery.description, currentLanguage);
          if (mounted && translatedDesc) {
            setTranslatedDescription(translatedDesc);
          }
        }
        
        // Translate clues
        if (mystery.additional_clues) {
          const translatedCluesText = await translationService.translate(mystery.additional_clues, currentLanguage);
          if (mounted && translatedCluesText) {
            setTranslatedClues(translatedCluesText);
          }
        }
      } catch {
        // Keep original text on error - already set as default
      }
    };
    
    // Add a small delay to stagger translations and avoid rate limiting
    const delay = Math.random() * 200;
    const timeoutId = setTimeout(translateContent, delay);
    
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [mystery.id, mystery.description, mystery.additional_clues, currentLanguage]);

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
        aria-label={`${t('mystery.movieMystery')}: ${mystery.description.slice(0, 50)}${mystery.description.length > 50 ? '...' : ''}. ${mystery.status === 'solved' ? t('mystery.solved') : `${mystery.points_reward} ${t('mystery.points')}`}. ${mystery.attempt_count} ${t('mystery.attempts')}.`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm line-clamp-2">{translatedDescription || mystery.description}</p>
            <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-muted-foreground">
              <span>{timeAgo}</span>
              <span aria-hidden="true">•</span>
              <span className="flex items-center gap-0.5 sm:gap-1">
                <MessageSquare className="h-2.5 w-2.5 sm:h-3 sm:w-3" aria-hidden="true" />
                <span aria-label={`${mystery.attempt_count} ${t('mystery.attempts')}`}>{mystery.attempt_count}</span>
              </span>
            </div>
          </div>
          {mystery.status === 'solved' ? (
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" aria-label={t('mystery.solved')} />
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
      aria-label={`${t('mystery.movieMystery')} ${t('mystery.by')} ${mystery.poster_name}: ${mystery.description.slice(0, 100)}${mystery.description.length > 100 ? '...' : ''}. ${mystery.status === 'solved' ? `${t('mystery.solved')}: ${mystery.solution_movie_title}` : `${mystery.points_reward} ${t('mystery.points')}, ${difficultyLabel}`}. ${mystery.view_count} ${t('mystery.views')}, ${mystery.attempt_count} ${t('mystery.attempts')}.`}
    >
      {/* Status indicator */}
      {mystery.status === 'solved' && (
        <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 text-green-500">
          <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
          <span className="text-[10px] sm:text-xs font-medium">{t('mystery.solved')}</span>
          {mystery.solution_movie_title && (
            <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
              — {mystery.solution_movie_title} {mystery.solution_movie_year && `(${mystery.solution_movie_year})`}
            </span>
          )}
        </div>
      )}

      {/* Mystery description */}
      <p className="text-sm sm:text-base mb-2 sm:mb-3 line-clamp-3 group-hover:text-primary/90 transition-colors">
        {translatedDescription || mystery.description}
      </p>

      {/* Additional clues */}
      {mystery.additional_clues && (
        <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 sm:mb-3 line-clamp-2 italic">
          {t('mystery.clues')}: {translatedClues || mystery.additional_clues}
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
            {difficultyLabel}
          </Badge>
          {mystery.status === 'unsolved' && (
            <Badge variant="outline" className="bg-primary/10 text-primary text-[9px] sm:text-[10px] px-1.5 sm:px-2">
              <Trophy className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" aria-hidden="true" />
              +{mystery.points_reward}
            </Badge>
          )}
        </div>
      </div>

      {/* Poster info and share */}
      <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border/50 flex items-center justify-between">
        <span className="text-[10px] sm:text-xs text-muted-foreground">
          {t('mystery.postedBy')} <span className="text-primary/80">{mystery.poster_name}</span>
        </span>
        <ShareMysteryMenu
          mysteryId={mystery.id}
          description={mystery.description}
          variant="ghost"
          size="sm"
          trigger={
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[10px] sm:text-xs text-muted-foreground hover:text-primary"
              onClick={(e: MouseEvent) => e.stopPropagation()}
              aria-label={t('mystery.share')}
            >
              <Share2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
              {t('mystery.share')}
            </Button>
          }
        />
      </div>
    </Card>
  );
}
