import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
import { useVaultStats } from '@/hooks/useVaultStats';
import { Flame, Trophy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STREAK_REMINDER_KEY = 'cinemind_streak_reminder_date';
const BADGE_NOTIFICATION_KEY = 'cinemind_last_badge_check';

export function VaultNotifications() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { stats, isAuthenticated, checkBadges } = useVaultStats();
  const hasCheckedToday = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !stats || hasCheckedToday.current) return;

    const checkStreakReminder = () => {
      const lastReminder = localStorage.getItem(STREAK_REMINDER_KEY);
      const today = new Date().toDateString();
      
      if (lastReminder === today) return;

      if (stats.current_streak > 0 && stats.last_active_date) {
        const lastActive = new Date(stats.last_active_date);
        const now = new Date();
        const daysSinceActive = Math.floor(
          (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceActive === 1) {
          toast({
            title: t('vault.notifications.streakReminder'),
            description: t('vault.notifications.streakReminderDesc', { 
              streak: stats.current_streak 
            }),
            action: (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
                className="gap-1"
              >
                <Flame className="h-3 w-3 text-orange-400" />
                {t('vault.notifications.keepStreak')}
              </Button>
            ),
            duration: 10000,
          });
          localStorage.setItem(STREAK_REMINDER_KEY, today);
        }
      }
    };

    const checkForNewBadges = async () => {
      const lastCheck = localStorage.getItem(BADGE_NOTIFICATION_KEY);
      const now = Date.now();
      
      if (lastCheck && now - parseInt(lastCheck) < 60000) return;

      const newBadges = await checkBadges();
      
      if (newBadges.length > 0) {
        newBadges.forEach((badge) => {
          toast({
            title: `${badge.icon} ${t('vault.notifications.badgeUnlocked')}`,
            description: t('vault.notifications.badgeUnlockedDesc', {
              badge: badge.name,
              points: badge.points_value
            }),
            action: (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/vault')}
                className="gap-1"
              >
                <Trophy className="h-3 w-3 text-yellow-400" />
                {t('vault.notifications.viewBadge')}
              </Button>
            ),
            duration: 8000,
          });
        });
      }

      localStorage.setItem(BADGE_NOTIFICATION_KEY, now.toString());
    };

    hasCheckedToday.current = true;

    const timer = setTimeout(() => {
      checkStreakReminder();
      checkForNewBadges();
    }, 3000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, stats, checkBadges, toast, navigate, t]);

  return null;
}

export function useVaultNotifications() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const notifyTrendingDiscovery = (movieTitle: string) => {
    toast({
      title: `${t('vault.notifications.trendingDiscovery')}`,
      description: t('vault.notifications.trendingDiscoveryDesc', { movie: movieTitle }),
      action: (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/vault')}
          className="gap-1"
        >
          <Sparkles className="h-3 w-3 text-cyan-400" />
          {t('vault.notifications.viewTrending')}
        </Button>
      ),
      duration: 6000,
    });
  };

  const notifyPredictionResult = (won: boolean, points: number) => {
    if (won) {
      toast({
        title: `🎯 ${t('vault.notifications.predictionWon')}`,
        description: t('vault.notifications.predictionWonDesc', { points }),
        duration: 6000,
      });
    } else {
      toast({
        title: t('vault.notifications.predictionLost'),
        description: t('vault.notifications.predictionLostDesc'),
        duration: 5000,
      });
    }
  };

  const notifyStreakMilestone = (streak: number) => {
    const milestones = [7, 14, 30, 60, 100];
    if (milestones.includes(streak)) {
      toast({
        title: `🔥 ${t('vault.notifications.streakMilestone')}`,
        description: t('vault.notifications.streakMilestoneDesc', { streak }),
        duration: 8000,
      });
    }
  };

  return {
    notifyTrendingDiscovery,
    notifyPredictionResult,
    notifyStreakMilestone,
  };
}
