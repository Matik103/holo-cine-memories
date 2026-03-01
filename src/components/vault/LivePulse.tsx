import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { useVaultLivePulse, useVaultActivity } from '@/hooks/useVaultStats';
import { Activity, Zap } from 'lucide-react';

export function LivePulse() {
  const { t } = useTranslation();
  const pulseCount = useVaultLivePulse();
  const { activities } = useVaultActivity();
  const [currentActivity, setCurrentActivity] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (activities.length === 0) return;

    const showRandomActivity = () => {
      const activity = activities[Math.floor(Math.random() * Math.min(activities.length, 5))];
      if (!activity) return;

      setIsTyping(true);
      
      let message = '';
      const name = activity.display_name || 'Someone';
      const movie = activity.movie_title || 'a movie';
      
      switch (activity.activity_type) {
        case 'search':
          message = t('vault.activity.search', { name, movie });
          break;
        case 'favorite':
          message = t('vault.activity.favorite', { name, movie });
          break;
        case 'rating':
          message = t('vault.activity.rating', { name, movie });
          break;
        case 'badge':
          message = t('vault.activity.badge', { name });
          break;
        case 'mystery_posted':
          message = `🔍 ${t('vault.activity.mystery_posted', { name })}`;
          break;
        case 'mystery_solved':
          message = `🎉 ${t('vault.activity.mystery_solved', { name })}`;
          break;
        default:
          message = t('vault.activity.generic', { name });
      }

      setTimeout(() => {
        setCurrentActivity(message);
        setIsTyping(false);
      }, 1500);
    };

    showRandomActivity();
    const interval = setInterval(showRandomActivity, 8000);
    return () => clearInterval(interval);
  }, [activities, t]);

  return (
    <Card className="neural-card p-4 mb-4 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
      
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Zap className="h-5 w-5 text-yellow-400" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full" />
          </div>
          <div>
            <div className="text-sm font-medium text-primary">
              {t('vault.livePulse.title')}
            </div>
            <div className="text-xs text-muted-foreground">
              {t('vault.livePulse.count', { count: pulseCount })}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground max-w-[50%]">
          {isTyping ? (
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3 animate-pulse" />
              <span className="typing-dots">
                <span className="dot">.</span>
                <span className="dot">.</span>
                <span className="dot">.</span>
              </span>
            </div>
          ) : currentActivity ? (
            <span className="truncate animate-fade-in">{currentActivity}</span>
          ) : (
            <span className="text-primary/50 italic">{t('vault.livePulse.waiting')}</span>
          )}
        </div>
      </div>

      <style>{`
        .typing-dots .dot {
          animation: typing 1.4s infinite;
          opacity: 0;
        }
        .typing-dots .dot:nth-child(1) { animation-delay: 0s; }
        .typing-dots .dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots .dot:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes typing {
          0%, 60%, 100% { opacity: 0; }
          30% { opacity: 1; }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Card>
  );
}
