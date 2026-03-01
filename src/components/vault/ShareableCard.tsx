import { useRef, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { VaultUserStats, VaultBadge, vaultService } from '@/services/vaultService';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Share2, Download, Copy, Check, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareableCardProps {
  stats: VaultUserStats;
  type: 'stats' | 'badge' | 'prediction';
  badge?: VaultBadge;
  predictionWin?: {
    title: string;
    points: number;
  };
}

export function ShareableCard({ stats, type, badge, predictionWin }: ShareableCardProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/vault?ref=${stats.user_id.slice(0, 8)}`;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({
      title: t('toast.copied'),
      description: t('vault.share.linkCopied'),
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareData = {
      title: 'CineMind Vault',
      text: getShareText(),
      url: `${window.location.origin}/vault`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const getShareText = () => {
    if (type === 'badge' && badge) {
      return t('vault.share.badgeText', {
        badge: badge.name,
        rarity: badge.rarity,
      });
    }
    if (type === 'prediction' && predictionWin) {
      return t('vault.share.predictionText', {
        title: predictionWin.title,
        points: predictionWin.points,
      });
    }
    return t('vault.share.statsText', {
      score: stats.vault_score,
      percentile: stats.rank_percentile ? Math.round(100 - stats.rank_percentile) : 50,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          {t('common.share')}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('vault.share.title')}</DialogTitle>
        </DialogHeader>

        {/* Shareable Card Preview */}
        <div
          ref={cardRef}
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 border border-primary/20"
        >
          {/* Background effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">CineMind Vault</span>
            </div>

            {type === 'stats' && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {stats.vault_score.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {t('vault.score')}
                  </div>
                </div>

                {stats.rank_percentile !== null && (
                  <div className="text-center p-3 rounded-lg bg-white/5">
                    <p className="text-sm">
                      {t('vault.yourStats.uniqueTaste', {
                        percentile: Math.round(100 - stats.rank_percentile)
                      })}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-white/5">
                    <div className="text-lg font-bold text-orange-400">
                      {stats.current_streak}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {t('vault.yourStats.dayStreak')}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5">
                    <div className="text-lg font-bold text-purple-400">
                      {stats.predictions_correct}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {t('vault.yourStats.wins')}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5">
                    <div className="text-lg font-bold text-cyan-400">
                      {stats.badges.length}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {t('vault.yourStats.badges')}
                    </div>
                  </div>
                </div>

                {stats.badges.length > 0 && (
                  <div className="flex justify-center gap-1">
                    {stats.badges.slice(0, 5).map((b) => (
                      <span key={b.id} className="text-xl">{b.icon}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {type === 'badge' && badge && (
              <div className="text-center space-y-4">
                <div className="text-6xl">{badge.icon}</div>
                <div>
                  <div className={`text-xl font-bold ${vaultService.getRarityColor(badge.rarity)}`}>
                    {badge.name}
                  </div>
                  <div className={`text-sm uppercase tracking-wider ${vaultService.getRarityColor(badge.rarity)}`}>
                    {badge.rarity}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{badge.description}</p>
                <div className="text-sm text-primary">+{badge.points_value} pts</div>
              </div>
            )}

            {type === 'prediction' && predictionWin && (
              <div className="text-center space-y-4">
                <div className="text-6xl">🎯</div>
                <div>
                  <div className="text-xl font-bold text-green-400">
                    {t('vault.share.predictionWin')}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {predictionWin.title}
                  </div>
                </div>
                <div className="text-2xl font-bold text-primary">
                  +{predictionWin.points} pts
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                @{stats.display_name || 'CineMind User'}
              </span>
              <span className="text-xs text-muted-foreground">
                cinemind.app
              </span>
            </div>
          </div>
        </div>

        {/* Share Actions */}
        <div className="flex gap-2">
          <Button onClick={handleShare} className="flex-1 gap-2">
            <Share2 className="h-4 w-4" />
            {t('vault.share.shareNow')}
          </Button>
          <Button variant="outline" onClick={handleCopyLink} className="gap-2">
            {copied ? (
              <Check className="h-4 w-4 text-green-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? t('toast.copied') : t('common.copy')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
