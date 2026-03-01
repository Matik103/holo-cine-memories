import { useState } from 'react';
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
  const { predictions, isLoading, submitPrediction } = useVaultPredictions();
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
    setSubmitting(predictionId);
    try {
      const success = await submitPrediction(predictionId, option);
      if (success) {
        toast({
          title: t('vault.predictions.submitted'),
          description: t('vault.predictions.submittedDesc'),
        });
      } else {
        toast({
          title: t('toast.error'),
          description: t('vault.predictions.submitError'),
          variant: 'destructive',
        });
      }
    } finally {
      setSubmitting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full rounded-lg" />
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-10 flex-1 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (predictions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <Trophy className="h-8 w-8 text-primary/50" />
        </div>
        <p className="text-muted-foreground mb-2">{t('vault.predictions.noPredictions')}</p>
        <p className="text-sm text-muted-foreground/70">{t('vault.predictions.checkBack')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {predictions.map((prediction) => {
        const hasVoted = !!prediction.user_selection;
        const isSubmitting = submitting === prediction.id;

        return (
          <div key={prediction.id} className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-medium">{prediction.title}</h3>
                {prediction.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {prediction.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground whitespace-nowrap">
                  {formatTimeRemaining(prediction.ends_at)}
                </span>
                <Badge variant="outline" className="text-xs">
                  +{prediction.points_reward} pts
                </Badge>
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {prediction.options.map((option) => {
                const isSelected = prediction.user_selection === option.id;
                
                return (
                  <Button
                    key={option.id}
                    variant={isSelected ? 'default' : 'outline'}
                    className={`h-auto py-3 px-4 flex flex-col items-center gap-1 relative ${
                      isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
                    } ${hasVoted && !isSelected ? 'opacity-50' : ''}`}
                    disabled={hasVoted || isSubmitting}
                    onClick={() => handleSubmit(prediction.id, option.id)}
                  >
                    {option.icon && <span className="text-xl">{option.icon}</span>}
                    <span className="text-sm font-medium">{option.label}</span>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                  </Button>
                );
              })}
            </div>

            {/* Status */}
            {hasVoted && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span>{t('vault.predictions.voteLocked')}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
