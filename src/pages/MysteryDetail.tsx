import { useState, useId, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMystery } from '@/hooks/useMysteries';
import { mysteryService } from '@/services/mysteryService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Eye,
  MessageSquare,
  Clock,
  Trophy,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  Send,
  X,
  AlertCircle,
  Loader2,
  RefreshCw,
  LogIn,
  Pencil
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ShareMysteryMenu } from '@/components/mystery';
import { scrollInputIntoView } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { translationService } from '@/services/translationService';
import { sanitizeInput, checkRateLimit } from '@/lib/sanitize';

export function MysteryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language?.split('-')[0] || 'en';
  const {
    mystery,
    attempts,
    userVotes,
    isLoading,
    error,
    isOwner,
    hasUserAttempted,
    submitAttempt,
    vote,
    acceptSolution,
    closeMystery,
    refetch,
    isAuthenticated,
    userId
  } = useMystery(id || null);

  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [movieTitle, setMovieTitle] = useState('');
  const [movieYear, setMovieYear] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptingAttemptId, setAcceptingAttemptId] = useState<string | null>(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [votingAttemptId, setVotingAttemptId] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editDescription, setEditDescription] = useState('');
  const [editClues, setEditClues] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  const [translatedDescription, setTranslatedDescription] = useState<string>('');
  const [translatedClues, setTranslatedClues] = useState<string>('');
  const [translatedAttempts, setTranslatedAttempts] = useState<Record<string, { explanation?: string }>>({});

  useEffect(() => {
    const translateContent = async () => {
      if (!mystery) {
        setTranslatedDescription('');
        setTranslatedClues('');
        return;
      }
      
      // Always translate to user's language using auto-detection for source
      if (mystery.description) {
        const translated = await translationService.translate(mystery.description, currentLanguage);
        setTranslatedDescription(translated);
      }
      
      if (mystery.additional_clues) {
        const translated = await translationService.translate(mystery.additional_clues, currentLanguage);
        setTranslatedClues(translated);
      }
    };
    
    translateContent();
  }, [mystery?.description, mystery?.additional_clues, currentLanguage]);

  useEffect(() => {
    const translateAttemptExplanations = async () => {
      if (!attempts.length) {
        setTranslatedAttempts({});
        return;
      }
      
      const translations: Record<string, { explanation?: string }> = {};
      
      // Always translate to user's language using auto-detection for source
      for (const attempt of attempts) {
        if (attempt.explanation) {
          const translated = await translationService.translate(attempt.explanation, currentLanguage);
          translations[attempt.id] = { explanation: translated };
        }
      }
      
      setTranslatedAttempts(translations);
    };
    
    translateAttemptExplanations();
  }, [attempts, currentLanguage]);

  const titleId = useId();
  const yearId = useId();
  const explanationId = useId();
  const editDescriptionId = useId();
  const editCluesId = useId();
  
  const titleRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);
  const explanationRef = useRef<HTMLTextAreaElement>(null);
  const editDescriptionRef = useRef<HTMLTextAreaElement>(null);
  const editCluesRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmitAttempt = async () => {
    // Rate limiting
    if (!checkRateLimit(`submit-attempt-${id}`, 10, 300000)) {
      toast({
        title: t('toast.error'),
        description: t('mystery.tooManySubmissions'),
        variant: 'destructive'
      });
      return;
    }

    // Sanitize inputs
    const sanitizedTitle = sanitizeInput(movieTitle);
    const sanitizedYear = sanitizeInput(movieYear);
    const sanitizedExplanation = sanitizeInput(explanation);

    if (!sanitizedTitle) {
      toast({
        title: t('mystery.movieTitleRequired'),
        description: t('mystery.movieTitleRequiredDesc'),
        variant: 'destructive'
      });
      return;
    }

    const year = sanitizedYear ? parseInt(sanitizedYear, 10) : undefined;
    if (sanitizedYear && (isNaN(year!) || year! < 1888 || year! > new Date().getFullYear() + 5)) {
      toast({
        title: t('mystery.invalidYear'),
        description: t('mystery.invalidYearDesc'),
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    const result = await submitAttempt(
      sanitizedTitle,
      year,
      undefined,
      undefined,
      sanitizedExplanation || undefined
    );
    setIsSubmitting(false);

    if (result.error) {
      toast({
        title: t('toast.error'),
        description: result.error.message,
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: t('mystery.solutionSubmitted'),
      description: t('mystery.solutionSubmittedDesc')
    });

    setShowSubmitForm(false);
    setMovieTitle('');
    setMovieYear('');
    setExplanation('');
  };

  const handleVote = async (attemptId: string, voteType: 'up' | 'down') => {
    if (!isAuthenticated) {
      toast({
        title: t('mystery.signInToVote'),
        description: t('mystery.signInToVoteDesc'),
        variant: 'destructive'
      });
      return;
    }

    setVotingAttemptId(attemptId);
    const result = await vote(attemptId, voteType);
    setVotingAttemptId(null);

    if (result.error) {
      toast({
        title: t('toast.error'),
        description: result.error.message,
        variant: 'destructive'
      });
    }
  };

  const handleAcceptSolution = async (attemptId: string) => {
    setAcceptingAttemptId(attemptId);
    const result = await acceptSolution(attemptId);

    if (result.error) {
      toast({
        title: t('toast.error'),
        description: result.error.message,
        variant: 'destructive'
      });
      setAcceptingAttemptId(null);
      return;
    }

    toast({
      title: t('mystery.mysterySolved'),
      description: t('mystery.mysterySolvedDesc')
    });
    setAcceptingAttemptId(null);
  };

  const handleCloseMystery = async () => {
    setIsClosing(true);
    const result = await closeMystery();
    setIsClosing(false);
    setShowCloseConfirm(false);

    if (result.error) {
      toast({
        title: t('toast.error'),
        description: result.error.message,
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: t('mystery.mysteryClosed'),
      description: t('mystery.mysteryClosedDesc')
    });
  };

  const handleSignIn = () => {
    // Navigate to auth page with return URL
    navigate('/auth', { state: { returnTo: window.location.pathname } });
  };

  const handleOpenEdit = () => {
    if (mystery) {
      setEditDescription(mystery.description);
      setEditClues(mystery.additional_clues || '');
      setShowEditForm(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!mystery || !userId) return;

    if (editDescription.trim().length < 20) {
      toast({
        title: t('mystery.descriptionTooShort'),
        description: t('mystery.descriptionMinChars', { min: 20, current: editDescription.trim().length }),
        variant: 'destructive'
      });
      return;
    }

    setIsEditing(true);
    const result = await mysteryService.updateMystery(mystery.id, userId, {
      description: editDescription.trim(),
      additional_clues: editClues.trim() || null
    });
    setIsEditing(false);

    if (result.error) {
      toast({
        title: t('toast.error'),
        description: result.error.message,
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: t('mystery.mysteryUpdated'),
      description: t('mystery.mysteryUpdatedDesc')
    });

    setShowEditForm(false);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
          <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/mysteries')} aria-label={t('common.back')} className="flex-shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Skeleton className="h-5 sm:h-6 w-32 sm:w-48" />
            </div>
          </div>
        </header>
        <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6" role="status" aria-label={t('mystery.loading')}>
          <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
            <Skeleton className="h-40 sm:h-48 w-full rounded-xl" />
            <Skeleton className="h-24 sm:h-32 w-full rounded-xl" />
            <Skeleton className="h-24 sm:h-32 w-full rounded-xl" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !mystery) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
          <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/mysteries')} aria-label={t('common.back')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
        </header>
        <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <Card className="max-w-lg mx-auto neural-card p-6 sm:p-8 text-center" role="alert">
            <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-destructive" aria-hidden="true" />
            <h1 className="text-lg sm:text-xl font-semibold mb-2">
              {error?.code === 'NOT_FOUND' ? t('mystery.mysteryNotFound') : t('mystery.errorLoading')}
            </h1>
            <p className="text-sm text-muted-foreground mb-4 sm:mb-6">
              {error?.message || t('mystery.mayBeRemoved')}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate('/mysteries')} className="w-full sm:w-auto">
                {t('mystery.browseMysteries')}
              </Button>
              {error?.code !== 'NOT_FOUND' && (
                <Button onClick={refetch} className="gap-2 w-full sm:w-auto">
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  {t('mystery.tryAgain')}
                </Button>
              )}
            </div>
          </Card>
        </main>
      </div>
    );
  }

  const difficultyInfo = mysteryService.getDifficultyInfo(mystery.difficulty);
  const isSolved = mystery.status === 'solved';
  const isClosed = mystery.status === 'closed';
  const canSubmit = isAuthenticated && !isOwner && !hasUserAttempted && !isSolved && !isClosed;

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Button variant="ghost" size="icon" onClick={() => navigate('/mysteries')} aria-label={t('common.back')} className="flex-shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-semibold truncate">{t('mystery.movieMystery')}</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                  {t('mystery.by')} {mystery.poster_name} • {timeAgo}
                </p>
              </div>
            </div>
            {/* Badges - hide points badge on very small screens if space is tight */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <Badge variant="outline" className={`${difficultyInfo.bgColor} ${difficultyInfo.color} text-[10px] sm:text-xs px-1.5 sm:px-2`}>
                {difficultyLabel}
              </Badge>
              {!isSolved && !isClosed && (
                <Badge variant="outline" className="bg-primary/10 text-primary text-[10px] sm:text-xs px-1.5 sm:px-2 hidden xs:flex">
                  <Trophy className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" aria-hidden="true" />
                  +{mystery.points_reward}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
          {/* Mystery content */}
          <Card className="neural-card p-4 sm:p-6">
            {/* Status banner */}
            {isSolved && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-3 sm:mb-4 p-2.5 sm:p-3 rounded-lg bg-green-500/10 text-green-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" aria-hidden="true" />
                  <span className="font-medium text-sm sm:text-base">{t('mystery.solved')}!</span>
                </div>
                {mystery.solution_movie_title && (
                  <span className="text-xs sm:text-sm ml-6 sm:ml-0">
                    {mystery.solution_movie_title} {mystery.solution_movie_year && `(${mystery.solution_movie_year})`}
                  </span>
                )}
              </div>
            )}

            {isClosed && (
              <div className="flex items-center gap-2 mb-3 sm:mb-4 p-2.5 sm:p-3 rounded-lg bg-muted text-muted-foreground">
                <X className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                <span className="font-medium text-sm sm:text-base">{t('mystery.closedWithoutSolution')}</span>
              </div>
            )}

            {/* Points badge on mobile - shown here since hidden in header */}
            {!isSolved && !isClosed && (
              <div className="xs:hidden mb-3">
                <Badge variant="outline" className="bg-primary/10 text-primary text-xs">
                  <Trophy className="h-3 w-3 mr-1" aria-hidden="true" />
                  +{mystery.points_reward} {t('mystery.points')}
                </Badge>
              </div>
            )}

            {/* Description */}
            <blockquote className="text-sm sm:text-lg mb-3 sm:mb-4 border-l-4 border-primary/50 pl-3 sm:pl-4">
              {translatedDescription || mystery.description}
            </blockquote>

            {/* Additional clues */}
            {mystery.additional_clues && (
              <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 rounded-lg bg-muted/50">
                <h2 className="text-xs sm:text-sm font-medium mb-1">{t('mystery.additionalClues')}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">{translatedClues || mystery.additional_clues}</p>
              </div>
            )}

            {/* AI suggestion */}
            {mystery.ai_suggestions?.suggestedTitle && (
              <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 rounded-lg bg-blue-500/10">
                <h2 className="text-xs sm:text-sm font-medium mb-1 text-blue-400">{t('mystery.aiSuggestion')}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {mystery.ai_suggestions.suggestedTitle}
                  {mystery.ai_suggestions.confidence && (
                    <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs">
                      ({Math.round(mystery.ai_suggestions.confidence * 100)}% {t('mystery.confidence')})
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Stats and Share - responsive wrap */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                  <span>{mystery.view_count} {t('mystery.views')}</span>
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                  <span>{mystery.attempt_count} {t('mystery.attempts')}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                  <span>{timeAgo}</span>
                </span>
              </div>
              
              {/* Share button */}
              <ShareMysteryMenu
                mysteryId={mystery.id}
                description={mystery.description}
                size="sm"
                triggerClassName="text-xs sm:text-sm"
              />
            </div>

            {/* Owner actions */}
            {isOwner && !isSolved && !isClosed && (
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border/50 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenEdit}
                  className="text-muted-foreground text-xs sm:text-sm"
                >
                  <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" aria-hidden="true" />
                  {t('mystery.editMystery')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCloseConfirm(true)}
                  className="text-muted-foreground text-xs sm:text-sm"
                >
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" aria-hidden="true" />
                  {t('mystery.closeMystery')}
                </Button>
              </div>
            )}
          </Card>

          {/* Submit solution */}
          {!isAuthenticated && !isSolved && !isClosed && (
            <Card className="neural-card p-4 sm:p-6 text-center">
              <LogIn className="h-7 w-7 sm:h-8 sm:w-8 mx-auto mb-2 sm:mb-3 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm text-muted-foreground mb-3 sm:mb-4">{t('mystery.signInToSubmit')}</p>
              <Button onClick={handleSignIn} className="neural-button w-full sm:w-auto">
                <LogIn className="h-4 w-4 mr-2" aria-hidden="true" />
                {t('auth.signIn')}
              </Button>
            </Card>
          )}

          {canSubmit && !showSubmitForm && (
            <Card className="neural-card p-3 sm:p-4">
              <Button
                onClick={() => setShowSubmitForm(true)}
                className="w-full neural-button gap-2"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                {t('mystery.submitYourAnswer')}
              </Button>
            </Card>
          )}

          {isOwner && !isSolved && !isClosed && (
            <Card className="neural-card p-3 sm:p-4 bg-purple-500/5 border-purple-500/20">
              <p className="text-xs sm:text-sm text-muted-foreground text-center">
                {t('mystery.yourMystery')}
              </p>
            </Card>
          )}

          {hasUserAttempted && !isOwner && !isSolved && !isClosed && (
            <Card className="neural-card p-3 sm:p-4 bg-blue-500/5 border-blue-500/20">
              <p className="text-xs sm:text-sm text-muted-foreground text-center">
                {t('mystery.alreadySubmitted')}
              </p>
            </Card>
          )}

          {showSubmitForm && (
            <Card className="neural-card p-4 sm:p-6">
              <h2 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">{t('mystery.submitYourAnswer')}</h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor={titleId} className="text-xs sm:text-sm">
                    {t('mystery.movieTitle')} <span className="text-destructive" aria-hidden="true">*</span>
                  </Label>
                  <Input
                    ref={titleRef}
                    id={titleId}
                    placeholder={t('mystery.movieTitlePlaceholder')}
                    value={movieTitle}
                    onChange={(e) => setMovieTitle(e.target.value)}
                    onFocus={() => scrollInputIntoView(titleRef.current)}
                    required
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor={yearId} className="text-xs sm:text-sm">{t('mystery.yearOptional')}</Label>
                  <Input
                    ref={yearRef}
                    id={yearId}
                    type="number"
                    placeholder={t('mystery.yearPlaceholder')}
                    value={movieYear}
                    onChange={(e) => setMovieYear(e.target.value)}
                    onFocus={() => scrollInputIntoView(yearRef.current)}
                    min="1888"
                    max={new Date().getFullYear() + 5}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor={explanationId} className="text-xs sm:text-sm">{t('mystery.whyThisMovie')}</Label>
                  <Textarea
                    ref={explanationRef}
                    id={explanationId}
                    placeholder={t('mystery.whyThisMoviePlaceholder')}
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    onFocus={() => scrollInputIntoView(explanationRef.current)}
                    className="min-h-[70px] sm:min-h-[80px] text-sm"
                  />
                </div>
                {/* Buttons - stack on mobile */}
                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowSubmitForm(false)}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    {t('mystery.cancel')}
                  </Button>
                  <Button
                    onClick={handleSubmitAttempt}
                    disabled={isSubmitting || !movieTitle.trim()}
                    className="neural-button w-full sm:flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                        {t('mystery.submitting')}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" aria-hidden="true" />
                        {t('mystery.submitAnswer')}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Attempts */}
          <div>
            <h2 className="font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-primary" aria-hidden="true" />
              {t('mystery.solutions')} ({attempts.length})
            </h2>

            {attempts.length === 0 ? (
              <Card className="neural-card p-4 sm:p-6 text-center text-muted-foreground">
                <p className="text-sm">{t('mystery.noSolutions')}</p>
              </Card>
            ) : (
              <div className="space-y-3 sm:space-y-4" aria-label={t('mystery.solutions')}>
                {attempts.map((attempt) => {
                  const userVote = userVotes[attempt.id];
                  const isOwnAttempt = attempt.user_id === userId;
                  const isVoting = votingAttemptId === attempt.id;
                  const translatedExplanation = translatedAttempts[attempt.id]?.explanation;

                  return (
                    <Card
                      key={attempt.id}
                      className={`neural-card p-3 sm:p-4 ${attempt.is_accepted ? 'border-green-500/50 bg-green-500/5' : ''}`}
                    >
                      {attempt.is_accepted && (
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 text-green-500">
                          <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                          <span className="text-xs sm:text-sm font-medium">{t('mystery.acceptedSolution')}</span>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm sm:text-base">
                            {attempt.movie_title}
                            {attempt.movie_year && (
                              <span className="text-muted-foreground ml-1 sm:ml-2">({attempt.movie_year})</span>
                            )}
                          </h3>
                          {attempt.explanation && (
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2">{translatedExplanation || attempt.explanation}</p>
                          )}
                          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 sm:mt-2">
                            {t('mystery.by')} {attempt.solver_name} • {getTranslatedTimeAgo(attempt.created_at)}
                          </p>
                        </div>

                        {/* Voting - larger touch targets on mobile */}
                        {!isSolved && !isClosed && (
                          <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-start">
                            <Button
                              variant="ghost"
                              onClick={() => handleVote(attempt.id, 'up')}
                              disabled={isOwnAttempt || isVoting}
                              className={`gap-1 h-10 w-14 sm:h-9 sm:w-auto px-2 sm:px-3 ${userVote === 'up' ? 'text-green-500 bg-green-500/10' : ''}`}
                              aria-label={`${t('mystery.upvote')} (${attempt.upvotes})`}
                              aria-pressed={userVote === 'up'}
                            >
                              {isVoting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <ThumbsUp className="h-4 w-4" />
                              )}
                              <span className="text-sm">{attempt.upvotes}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => handleVote(attempt.id, 'down')}
                              disabled={isOwnAttempt || isVoting}
                              className={`gap-1 h-10 w-14 sm:h-9 sm:w-auto px-2 sm:px-3 ${userVote === 'down' ? 'text-red-500 bg-red-500/10' : ''}`}
                              aria-label={`${t('mystery.downvote')} (${attempt.downvotes})`}
                              aria-pressed={userVote === 'down'}
                            >
                              <ThumbsDown className="h-4 w-4" />
                              <span className="text-sm">{attempt.downvotes}</span>
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Accept button for owner */}
                      {isOwner && !isSolved && !isClosed && !attempt.is_accepted && (
                        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border/50">
                          <Button
                            onClick={() => handleAcceptSolution(attempt.id)}
                            disabled={acceptingAttemptId === attempt.id}
                            className="neural-button w-full gap-2"
                          >
                            {acceptingAttemptId === attempt.id ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                {t('mystery.accepting')}
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4" aria-hidden="true" />
                                {t('mystery.acceptThisSolution')}
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Close confirmation dialog */}
      <AlertDialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">{t('mystery.closeConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              {t('mystery.closeConfirmDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel disabled={isClosing} className="w-full sm:w-auto">{t('mystery.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCloseMystery}
              disabled={isClosing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
            >
              {isClosing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                  {t('mystery.closingMystery')}
                </>
              ) : (
                t('mystery.closeMystery')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit mystery dialog */}
      <AlertDialog open={showEditForm} onOpenChange={setShowEditForm}>
        <AlertDialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">{t('mystery.editMysteryTitle')}</AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              {t('mystery.editMysteryDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor={editDescriptionId} className="text-xs sm:text-sm">
                {t('mystery.description')} <span className="text-destructive" aria-hidden="true">*</span>
              </Label>
              <Textarea
                ref={editDescriptionRef}
                id={editDescriptionId}
                placeholder={t('mystery.descriptionEditPlaceholder')}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                onFocus={() => scrollInputIntoView(editDescriptionRef.current)}
                className="min-h-[120px] text-sm"
                maxLength={5000}
              />
              <p className="text-[10px] sm:text-xs text-muted-foreground text-right">
                {editDescription.length}/5000
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor={editCluesId} className="text-xs sm:text-sm">{t('mystery.additionalCluesOptional')}</Label>
              <Textarea
                ref={editCluesRef}
                id={editCluesId}
                placeholder={t('mystery.cluesPlaceholder')}
                value={editClues}
                onChange={(e) => setEditClues(e.target.value)}
                onFocus={() => scrollInputIntoView(editCluesRef.current)}
                className="min-h-[80px] text-sm"
                maxLength={2000}
              />
              <p className="text-[10px] sm:text-xs text-muted-foreground text-right">
                {editClues.length}/2000
              </p>
            </div>
          </div>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel disabled={isEditing} className="w-full sm:w-auto">{t('mystery.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSaveEdit}
              disabled={isEditing || editDescription.trim().length < 20}
              className="neural-button w-full sm:w-auto"
            >
              {isEditing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                  {t('mystery.saving')}
                </>
              ) : (
                <>
                  <Pencil className="h-4 w-4 mr-2" aria-hidden="true" />
                  {t('mystery.saveChanges')}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
