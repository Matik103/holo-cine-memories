import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useMystery } from '@/hooks/useMysteries';
import { mysteryService } from '@/services/mysteryService';
import { DetectiveRankBadge } from '@/components/mystery';
import { 
  ArrowLeft, 
  Clock, 
  Eye, 
  MessageSquare, 
  Trophy, 
  CheckCircle, 
  ThumbsUp, 
  ThumbsDown,
  Send,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';

export const MysteryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    mystery,
    attempts,
    userVotes,
    isLoading,
    isOwner,
    hasUserAttempted,
    submitAttempt,
    vote,
    acceptSolution,
    closeMystery,
    isAuthenticated,
    userId
  } = useMystery(id || null);

  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [movieTitle, setMovieTitle] = useState('');
  const [movieYear, setMovieYear] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitAttempt = async () => {
    if (!movieTitle.trim()) {
      toast({
        title: 'Movie title required',
        description: 'Please enter the movie title',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    const success = await submitAttempt(
      movieTitle.trim(),
      movieYear ? parseInt(movieYear) : undefined,
      undefined,
      undefined,
      explanation.trim() || undefined
    );

    if (success) {
      toast({
        title: 'Solution submitted!',
        description: 'Your answer has been submitted for review',
        className: 'bg-primary/10 border-primary/20'
      });
      setShowSubmitForm(false);
      setMovieTitle('');
      setMovieYear('');
      setExplanation('');
    } else {
      toast({
        title: 'Error',
        description: 'Failed to submit solution. You may have already submitted.',
        variant: 'destructive'
      });
    }
    setIsSubmitting(false);
  };

  const handleVote = async (attemptId: string, voteType: 'up' | 'down') => {
    if (!isAuthenticated) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to vote',
        variant: 'destructive'
      });
      return;
    }

    await vote(attemptId, voteType);
  };

  const handleAcceptSolution = async (attemptId: string) => {
    const success = await acceptSolution(attemptId);
    if (success) {
      toast({
        title: 'Mystery solved!',
        description: 'The solver has been awarded points',
        className: 'bg-green-500/10 border-green-500/20'
      });
    }
  };

  const handleCloseMystery = async () => {
    const success = await closeMystery();
    if (success) {
      toast({
        title: 'Mystery closed',
        description: 'This mystery has been closed without a solution',
        className: 'bg-primary/10 border-primary/20'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-48 w-full rounded-lg mb-4" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!mystery) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <Card className="neural-card p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold mb-2">Mystery Not Found</h2>
          <p className="text-sm text-muted-foreground mb-4">
            This mystery may have been deleted or doesn't exist.
          </p>
          <Button onClick={() => navigate('/mysteries')} className="neural-button">
            Browse Mysteries
          </Button>
        </Card>
      </div>
    );
  }

  const difficultyInfo = mysteryService.getDifficultyInfo(mystery.difficulty);
  const timeAgo = mysteryService.formatTimeAgo(mystery.created_at);
  const isSolved = mystery.status === 'solved';
  const isClosed = mystery.status === 'closed';

  return (
    <div className="min-h-screen p-2 sm:p-4 relative pt-safe-top">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto px-2 sm:px-4 pt-6 sm:pt-4 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/mysteries')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        {/* Mystery Card */}
        <Card className="neural-card p-4 sm:p-6 mb-4">
          {/* Status badge */}
          {isSolved && (
            <div className="flex items-center gap-2 mb-4 text-green-500">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Solved!</span>
              {mystery.solution_movie_title && (
                <span className="text-muted-foreground">
                  — {mystery.solution_movie_title} {mystery.solution_movie_year && `(${mystery.solution_movie_year})`}
                </span>
              )}
            </div>
          )}

          {isClosed && (
            <div className="flex items-center gap-2 mb-4 text-muted-foreground">
              <X className="h-5 w-5" />
              <span>This mystery was closed without a solution</span>
            </div>
          )}

          {/* Mystery description */}
          <blockquote className="text-lg sm:text-xl mb-4 border-l-4 border-purple-500/50 pl-4 italic">
            "{mystery.description}"
          </blockquote>

          {/* Additional clues */}
          {mystery.additional_clues && (
            <div className="bg-purple-500/5 rounded-lg p-3 mb-4">
              <p className="text-xs font-medium text-purple-400 mb-1">Additional Clues:</p>
              <p className="text-sm text-muted-foreground">{mystery.additional_clues}</p>
            </div>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {timeAgo}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {mystery.view_count} views
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              {mystery.attempt_count} attempts
            </span>
            <Badge variant="outline" className={`${difficultyInfo.bgColor} ${difficultyInfo.color}`}>
              {difficultyInfo.label}
            </Badge>
            {!isSolved && !isClosed && (
              <Badge variant="outline" className="bg-primary/10 text-primary">
                <Trophy className="h-3 w-3 mr-1" />
                +{mystery.points_reward} pts
              </Badge>
            )}
          </div>

          {/* Posted by */}
          <div className="mt-4 pt-4 border-t border-border/50 text-sm text-muted-foreground">
            Posted by <span className="text-primary">{mystery.poster_name}</span>
          </div>

          {/* Owner actions */}
          {isOwner && !isSolved && !isClosed && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCloseMystery}
                className="text-muted-foreground"
              >
                <X className="h-4 w-4 mr-2" />
                Close Mystery
              </Button>
            </div>
          )}
        </Card>

        {/* Submit Solution */}
        {!isSolved && !isClosed && !hasUserAttempted && isAuthenticated && (
          <Card className="neural-card p-4 sm:p-6 mb-4">
            {!showSubmitForm ? (
              <Button
                onClick={() => setShowSubmitForm(true)}
                className="w-full neural-button"
              >
                <Send className="h-4 w-4 mr-2" />
                I Know This Movie!
              </Button>
            ) : (
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Send className="h-4 w-4 text-primary" />
                  Submit Your Answer
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="movieTitle">Movie Title *</Label>
                    <Input
                      id="movieTitle"
                      placeholder="Enter the movie title"
                      value={movieTitle}
                      onChange={(e) => setMovieTitle(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="movieYear">Year (optional)</Label>
                    <Input
                      id="movieYear"
                      placeholder="e.g., 1999"
                      value={movieYear}
                      onChange={(e) => setMovieYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="explanation">Why do you think this is correct? (optional)</Label>
                  <Textarea
                    id="explanation"
                    placeholder="Explain how your answer matches the description..."
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    className="mt-1 min-h-[80px]"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowSubmitForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitAttempt}
                    disabled={isSubmitting || !movieTitle.trim()}
                    className="flex-1 neural-button"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Answer'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Already submitted notice */}
        {hasUserAttempted && !isSolved && !isClosed && (
          <Card className="neural-card p-4 mb-4 bg-primary/5">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              You've already submitted an answer for this mystery
            </p>
          </Card>
        )}

        {/* Sign in prompt */}
        {!isAuthenticated && !isSolved && !isClosed && (
          <Card className="neural-card p-4 mb-4 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Sign in to submit your answer and earn detective points!
            </p>
            <Button onClick={() => navigate('/auth')} className="neural-button">
              Sign In
            </Button>
          </Card>
        )}

        {/* Attempts/Solutions */}
        <Card className="neural-card p-4 sm:p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            Solutions ({attempts.length})
          </h3>

          {attempts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No solutions submitted yet. Be the first!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {attempts.map((attempt) => {
                const userVote = userVotes[attempt.id];
                const isAccepted = attempt.is_accepted;
                const canAccept = isOwner && !isSolved && !isClosed;

                return (
                  <div
                    key={attempt.id}
                    className={`p-4 rounded-lg border ${
                      isAccepted 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : 'bg-background/50 border-border/50'
                    }`}
                  >
                    {/* Accepted badge */}
                    {isAccepted && (
                      <div className="flex items-center gap-2 mb-3 text-green-500">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Accepted Solution</span>
                      </div>
                    )}

                    {/* Movie info */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-lg">
                          {attempt.movie_title}
                          {attempt.movie_year && (
                            <span className="text-muted-foreground font-normal ml-2">
                              ({attempt.movie_year})
                            </span>
                          )}
                        </h4>
                        {attempt.explanation && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {attempt.explanation}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30">
                      <div className="text-xs text-muted-foreground">
                        by <span className="text-primary">{attempt.solver_name}</span>
                        <span className="mx-2">•</span>
                        {mysteryService.formatTimeAgo(attempt.created_at)}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Voting */}
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVote(attempt.id, 'up')}
                            className={`h-8 px-2 ${userVote === 'up' ? 'text-green-500' : ''}`}
                            disabled={!isAuthenticated}
                          >
                            <ThumbsUp className="h-4 w-4" />
                            <span className="ml-1 text-xs">{attempt.upvotes}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVote(attempt.id, 'down')}
                            className={`h-8 px-2 ${userVote === 'down' ? 'text-red-500' : ''}`}
                            disabled={!isAuthenticated}
                          >
                            <ThumbsDown className="h-4 w-4" />
                            <span className="ml-1 text-xs">{attempt.downvotes}</span>
                          </Button>
                        </div>

                        {/* Accept button for owner */}
                        {canAccept && (
                          <Button
                            size="sm"
                            onClick={() => handleAcceptSolution(attempt.id)}
                            className="neural-button h-8"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default MysteryDetail;
