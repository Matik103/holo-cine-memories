import { useState, useId } from 'react';
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
  LogIn
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export function MysteryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
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

  const titleId = useId();
  const yearId = useId();
  const explanationId = useId();

  const handleSubmitAttempt = async () => {
    if (!movieTitle.trim()) {
      toast({
        title: 'Movie title required',
        description: 'Please enter the movie title you think matches this mystery.',
        variant: 'destructive'
      });
      return;
    }

    const year = movieYear ? parseInt(movieYear, 10) : undefined;
    if (movieYear && (isNaN(year!) || year! < 1888 || year! > new Date().getFullYear() + 5)) {
      toast({
        title: 'Invalid year',
        description: 'Please enter a valid movie year.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    const result = await submitAttempt(
      movieTitle.trim(),
      year,
      undefined,
      undefined,
      explanation.trim() || undefined
    );
    setIsSubmitting(false);

    if (result.error) {
      toast({
        title: 'Error',
        description: result.error.message,
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Solution submitted!',
      description: 'Your answer has been added. The mystery poster will review it.'
    });

    setShowSubmitForm(false);
    setMovieTitle('');
    setMovieYear('');
    setExplanation('');
  };

  const handleVote = async (attemptId: string, voteType: 'up' | 'down') => {
    if (!isAuthenticated) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to vote on solutions.',
        variant: 'destructive'
      });
      return;
    }

    setVotingAttemptId(attemptId);
    const result = await vote(attemptId, voteType);
    setVotingAttemptId(null);

    if (result.error) {
      toast({
        title: 'Error',
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
        title: 'Error',
        description: result.error.message,
        variant: 'destructive'
      });
      setAcceptingAttemptId(null);
      return;
    }

    toast({
      title: 'Mystery Solved!',
      description: 'The solution has been accepted and points awarded to the solver.'
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
        title: 'Error',
        description: result.error.message,
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Mystery Closed',
      description: 'This mystery has been closed without a solution.'
    });
  };

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.href
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
          <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/mysteries')} aria-label="Back to mysteries" className="flex-shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Skeleton className="h-5 sm:h-6 w-32 sm:w-48" />
            </div>
          </div>
        </header>
        <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6" role="status" aria-label="Loading mystery">
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
            <Button variant="ghost" size="icon" onClick={() => navigate('/mysteries')} aria-label="Back to mysteries">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
        </header>
        <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <Card className="max-w-lg mx-auto neural-card p-6 sm:p-8 text-center" role="alert">
            <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-destructive" aria-hidden="true" />
            <h1 className="text-lg sm:text-xl font-semibold mb-2">
              {error?.code === 'NOT_FOUND' ? 'Mystery Not Found' : 'Error Loading Mystery'}
            </h1>
            <p className="text-sm text-muted-foreground mb-4 sm:mb-6">
              {error?.message || 'This mystery may have been removed or does not exist.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate('/mysteries')} className="w-full sm:w-auto">
                Browse Mysteries
              </Button>
              {error?.code !== 'NOT_FOUND' && (
                <Button onClick={refetch} className="gap-2 w-full sm:w-auto">
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Try Again
                </Button>
              )}
            </div>
          </Card>
        </main>
      </div>
    );
  }

  const difficultyInfo = mysteryService.getDifficultyInfo(mystery.difficulty);
  const timeAgo = mysteryService.formatTimeAgo(mystery.created_at);
  const isSolved = mystery.status === 'solved';
  const isClosed = mystery.status === 'closed';
  const canSubmit = isAuthenticated && !isOwner && !hasUserAttempted && !isSolved && !isClosed;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Button variant="ghost" size="icon" onClick={() => navigate('/mysteries')} aria-label="Back to mysteries" className="flex-shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-semibold truncate">Movie Mystery</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                  by {mystery.poster_name} • {timeAgo}
                </p>
              </div>
            </div>
            {/* Badges - hide points badge on very small screens if space is tight */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <Badge variant="outline" className={`${difficultyInfo.bgColor} ${difficultyInfo.color} text-[10px] sm:text-xs px-1.5 sm:px-2`}>
                {difficultyInfo.label}
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
                  <span className="font-medium text-sm sm:text-base">Solved!</span>
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
                <span className="font-medium text-sm sm:text-base">Closed without solution</span>
              </div>
            )}

            {/* Points badge on mobile - shown here since hidden in header */}
            {!isSolved && !isClosed && (
              <div className="xs:hidden mb-3">
                <Badge variant="outline" className="bg-primary/10 text-primary text-xs">
                  <Trophy className="h-3 w-3 mr-1" aria-hidden="true" />
                  +{mystery.points_reward} points
                </Badge>
              </div>
            )}

            {/* Description */}
            <blockquote className="text-sm sm:text-lg mb-3 sm:mb-4 border-l-4 border-primary/50 pl-3 sm:pl-4">
              "{mystery.description}"
            </blockquote>

            {/* Additional clues */}
            {mystery.additional_clues && (
              <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 rounded-lg bg-muted/50">
                <h2 className="text-xs sm:text-sm font-medium mb-1">Additional Clues</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">{mystery.additional_clues}</p>
              </div>
            )}

            {/* AI suggestion */}
            {mystery.ai_suggestions?.suggestedTitle && (
              <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 rounded-lg bg-blue-500/10">
                <h2 className="text-xs sm:text-sm font-medium mb-1 text-blue-400">AI Suggestion</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {mystery.ai_suggestions.suggestedTitle}
                  {mystery.ai_suggestions.confidence && (
                    <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs">
                      ({Math.round(mystery.ai_suggestions.confidence * 100)}% confidence)
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Stats - responsive wrap */}
            <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 text-xs sm:text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                <span>{mystery.view_count} views</span>
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                <span>{mystery.attempt_count} attempts</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                <span>{timeAgo}</span>
              </span>
            </div>

            {/* Owner actions */}
            {isOwner && !isSolved && !isClosed && (
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border/50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCloseConfirm(true)}
                  className="text-muted-foreground text-xs sm:text-sm"
                >
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" aria-hidden="true" />
                  Close Mystery
                </Button>
              </div>
            )}
          </Card>

          {/* Submit solution */}
          {!isAuthenticated && !isSolved && !isClosed && (
            <Card className="neural-card p-4 sm:p-6 text-center">
              <LogIn className="h-7 w-7 sm:h-8 sm:w-8 mx-auto mb-2 sm:mb-3 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm text-muted-foreground mb-3 sm:mb-4">Sign in to submit a solution</p>
              <Button onClick={handleSignIn} className="neural-button w-full sm:w-auto">
                Sign in with Google
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
                Submit Your Answer
              </Button>
            </Card>
          )}

          {isOwner && !isSolved && !isClosed && (
            <Card className="neural-card p-3 sm:p-4 bg-purple-500/5 border-purple-500/20">
              <p className="text-xs sm:text-sm text-muted-foreground text-center">
                This is your mystery. Review the solutions below and accept the correct one.
              </p>
            </Card>
          )}

          {hasUserAttempted && !isOwner && !isSolved && !isClosed && (
            <Card className="neural-card p-3 sm:p-4 bg-blue-500/5 border-blue-500/20">
              <p className="text-xs sm:text-sm text-muted-foreground text-center">
                You've already submitted a solution. Wait for the mystery poster to review it.
              </p>
            </Card>
          )}

          {showSubmitForm && (
            <Card className="neural-card p-4 sm:p-6">
              <h2 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Submit Your Answer</h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor={titleId} className="text-xs sm:text-sm">
                    Movie Title <span className="text-destructive" aria-hidden="true">*</span>
                  </Label>
                  <Input
                    id={titleId}
                    placeholder="e.g., Groundhog Day"
                    value={movieTitle}
                    onChange={(e) => setMovieTitle(e.target.value)}
                    required
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor={yearId} className="text-xs sm:text-sm">Year (optional)</Label>
                  <Input
                    id={yearId}
                    type="number"
                    placeholder="e.g., 1993"
                    value={movieYear}
                    onChange={(e) => setMovieYear(e.target.value)}
                    min="1888"
                    max={new Date().getFullYear() + 5}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor={explanationId} className="text-xs sm:text-sm">Why do you think this is the movie? (optional)</Label>
                  <Textarea
                    id={explanationId}
                    placeholder="Explain why this movie matches the description..."
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
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
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitAttempt}
                    disabled={isSubmitting || !movieTitle.trim()}
                    className="neural-button w-full sm:flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" aria-hidden="true" />
                        Submit Answer
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
              Solutions ({attempts.length})
            </h2>

            {attempts.length === 0 ? (
              <Card className="neural-card p-4 sm:p-6 text-center text-muted-foreground">
                <p className="text-sm">No solutions submitted yet. Be the first to help!</p>
              </Card>
            ) : (
              <div className="space-y-3 sm:space-y-4" aria-label="Submitted solutions">
                {attempts.map((attempt) => {
                  const userVote = userVotes[attempt.id];
                  const isOwnAttempt = attempt.user_id === userId;
                  const isVoting = votingAttemptId === attempt.id;

                  return (
                    <Card
                      key={attempt.id}
                      className={`neural-card p-3 sm:p-4 ${attempt.is_accepted ? 'border-green-500/50 bg-green-500/5' : ''}`}
                    >
                      {attempt.is_accepted && (
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 text-green-500">
                          <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                          <span className="text-xs sm:text-sm font-medium">Accepted Solution</span>
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
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2">{attempt.explanation}</p>
                          )}
                          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 sm:mt-2">
                            by {attempt.solver_name} • {mysteryService.formatTimeAgo(attempt.created_at)}
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
                              aria-label={`Upvote (${attempt.upvotes})`}
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
                              aria-label={`Downvote (${attempt.downvotes})`}
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
                                Accepting...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4" aria-hidden="true" />
                                Accept This Solution
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
            <AlertDialogTitle className="text-base sm:text-lg">Close this mystery?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              This will close the mystery without marking any solution as correct. 
              No points will be awarded. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel disabled={isClosing} className="w-full sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCloseMystery}
              disabled={isClosing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
            >
              {isClosing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                  Closing...
                </>
              ) : (
                'Close Mystery'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
