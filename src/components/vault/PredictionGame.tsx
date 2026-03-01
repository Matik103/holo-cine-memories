import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useVaultPredictions } from '@/hooks/useVaultStats';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Clock, Check, Trophy, Lock } from 'lucide-react';

export function PredictionGame() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { predictions, isLoading, submitPrediction, isAuthenticated } = useVaultPredictions();
  const [submitting, setSubmitting] = useState<string | null>(null);

  const formatTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return t('vault.predictions.ended');
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return t('vault.predictions.timeRemaining', { days, hours });
    }
    return t('vault.predictions.hoursRemaining', { hours });
  };

  const handleSubmit = async (predictionId: string, option: string) => {
    if (!isAuthenticated) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to vote on predictions',
        className: 'bg-primary/10 border-primary/20',
      });
      setTimeout(() => navigate('/auth'), 1500);
      return;
    }

    setSubmitting(predictionId);
    try {
      const success = await submitPrediction(predictionId, option);
      if (success) {
        toast({
          title: t('vault.predictions.submitted'),
          description: t('vault.predictions.submittedDesc'),
          className: 'bg-primary/10 border-primary/20',
        });
      } else {
        toast({
          title: t('toast.error'),
          description: t('vault.predictions.submitError'),
          className: 'bg-primary/10 border-primary/20',
        });
      }
    } catch (err: any) {
      if (err.message === 'AUTH_REQUIRED') {
        toast({
          title: 'Sign in required',
          description: 'Please sign in to vote on predictions',
          className: 'bg-primary/10 border-primary/20',
        });
        setTimeout(() => navigate('/auth'), 1500);
      } else {
        toast({
          title: t('toast.error'),
          description: t('vault.predictions.submitError'),
          className: 'bg-primary/10 border-primary/20',
        });
      }
    } finally {
      setSubmitting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3 sm:space-y-4">
        <Skeleton className="h-20 sm:h-24 w-full rounded-lg" />
        <div className="grid grid-cols-2 gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-12 sm:h-14 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (predictions.length === 0) {
    return (
      <div className="text-center py-6 sm:py-8">
        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-primary/50" />
        </div>
        <p className="text-sm sm:text-base text-muted-foreground mb-1 sm:mb-2">{t('vault.predictions.noPredictions')}</p>
        <p className="text-xs sm:text-sm text-muted-foreground/70">{t('vault.predictions.checkBack')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {predictions.map((prediction) => {
        const hasVoted = !!prediction.user_selection;
        const isSubmitting = submitting === prediction.id;

        return (
          <div key={prediction.id} className="space-y-3 sm:space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
              <div className="flex-1">
                <h3 className="text-sm sm:text-base font-medium">{prediction.title}</h3>
                {prediction.description && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {prediction.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                <span className="text-muted-foreground whitespace-nowrap">
                  {formatTimeRemaining(prediction.ends_at)}
                </span>
                <Badge variant="outline" className="text-[10px] sm:text-xs">
                  +{prediction.points_reward} pts
                </Badge>
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-2">
              {prediction.options.map((option) => {
                const isSelected = prediction.user_selection === option.id;
                const voteCount = prediction.vote_distribution?.[option.id] || 0;
                const votePercentage = prediction.total_votes ? Math.round((voteCount / prediction.total_votes) * 100) : 0;
                
                return (
                  <Button
                    key={option.id}
                    variant={isSelected ? 'default' : 'outline'}
                    className={`h-auto py-2 sm:py-3 px-3 sm:px-4 flex flex-col items-center gap-1 relative text-xs sm:text-sm ${
                      isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
                    } ${hasVoted && !isSelected ? 'opacity-50' : ''}`}
                    disabled={hasVoted || isSubmitting}
                    onClick={() => handleSubmit(prediction.id, option.id)}
                  >
                    {option.icon && <span className="text-lg sm:text-xl">{option.icon}</span>}
                    <span className="font-medium">{option.label}</span>
                    {hasVoted && voteCount > 0 && (
                      <span className="text-[10px] text-muted-foreground mt-1">
                        {voteCount} votes ({votePercentage}%)
                      </span>
                    )}
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-primary rounded-full flex items-center justify-center">
                        <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary-foreground" />
                      </div>
                    )}
                  </Button>
                );
              })}
            </div>

            {/* Status */}
            {hasVoted && (
              <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{t('vault.predictions.voteLocked')}</span>
                </div>
                {prediction.total_votes && prediction.total_votes > 0 && (
                  <span>{prediction.total_votes} total votes</span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
