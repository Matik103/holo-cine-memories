import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { VaultBadge, vaultService } from '@/services/vaultService';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Share2, Lock, Check } from 'lucide-react';

interface BadgeCardProps {
  badge: VaultBadge;
  isUnlocked: boolean;
  size?: 'sm' | 'md' | 'lg';
  showShare?: boolean;
  onClick?: () => void;
}

export function BadgeCard({ badge, isUnlocked, size = 'md', showShare = false, onClick }: BadgeCardProps) {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);

  const sizeClasses = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-24 h-24 text-4xl',
  };

  const rarityGlow = {
    common: '',
    uncommon: 'shadow-green-500/20',
    rare: 'shadow-blue-500/30',
    epic: 'shadow-purple-500/40',
    legendary: 'shadow-yellow-500/50 animate-pulse',
  };

  return (
    <Dialog open={showDetails} onOpenChange={setShowDetails}>
      <DialogTrigger asChild>
        <button
          className={`relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
            isUnlocked
              ? `${vaultService.getRarityBgColor(badge.rarity)} hover:scale-105 cursor-pointer shadow-lg ${rarityGlow[badge.rarity]}`
              : 'bg-gray-500/10 opacity-50 cursor-pointer'
          }`}
          onClick={onClick}
        >
          {/* Badge Icon */}
          <div
            className={`${sizeClasses[size]} flex items-center justify-center rounded-full ${
              isUnlocked
                ? `bg-gradient-to-br from-white/10 to-white/5 border-2 ${
                    badge.rarity === 'legendary' ? 'border-yellow-400' :
                    badge.rarity === 'epic' ? 'border-purple-400' :
                    badge.rarity === 'rare' ? 'border-blue-400' :
                    badge.rarity === 'uncommon' ? 'border-green-400' :
                    'border-gray-400'
                  }`
                : 'bg-gray-500/20 border-2 border-gray-500/30'
            }`}
          >
            {isUnlocked ? (
              <span>{badge.icon}</span>
            ) : (
              <Lock className="h-6 w-6 text-gray-500" />
            )}
          </div>

          {/* Badge Name */}
          <span
            className={`text-xs font-medium text-center ${
              isUnlocked ? vaultService.getRarityColor(badge.rarity) : 'text-gray-500'
            }`}
          >
            {badge.name}
          </span>

          {/* Rarity indicator */}
          <span
            className={`text-[10px] uppercase tracking-wider ${
              isUnlocked ? vaultService.getRarityColor(badge.rarity) : 'text-gray-500'
            }`}
          >
            {badge.rarity}
          </span>

          {/* Unlocked checkmark */}
          {isUnlocked && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="h-3 w-3 text-white" />
            </div>
          )}
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-3xl">{badge.icon}</span>
            <div>
              <span className={vaultService.getRarityColor(badge.rarity)}>{badge.name}</span>
              <span className={`block text-xs uppercase tracking-wider ${vaultService.getRarityColor(badge.rarity)}`}>
                {badge.rarity}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-muted-foreground">{badge.description}</p>

          <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5">
            <span className="text-sm text-muted-foreground">{t('vault.badges.pointsValue')}</span>
            <span className="font-bold text-primary">+{badge.points_value} pts</span>
          </div>

          {isUnlocked && badge.unlocked_at && (
            <div className="text-sm text-muted-foreground">
              {t('vault.badges.unlockedOn', {
                date: new Date(badge.unlocked_at).toLocaleDateString()
              })}
            </div>
          )}

          {!isUnlocked && (
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-sm text-yellow-400">
                {t('vault.badges.howToUnlock')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {getUnlockHint(badge)}
              </p>
            </div>
          )}

          {isUnlocked && showShare && (
            <Button className="w-full gap-2" variant="outline">
              <Share2 className="h-4 w-4" />
              {t('vault.badges.share')}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getUnlockHint(badge: VaultBadge): string {
  const condition = badge.unlock_condition;
  
  switch (condition.type) {
    case 'search_count':
      return `Complete ${condition.threshold} movie searches`;
    case 'streak':
      return `Maintain a ${condition.threshold}-day streak`;
    case 'genre_count':
      return `Search movies from ${condition.threshold} different genres`;
    case 'prediction_streak':
      return `Win ${condition.threshold} predictions in a row`;
    case 'hidden_gem_ratings':
      return `Rate ${condition.threshold} hidden gem movies`;
    case 'percentile':
      return `Reach the top ${condition.threshold}% of users`;
    case 'time_range':
      return `Search for a movie between ${condition.start_hour}:00 and ${condition.end_hour}:00`;
    case 'early_discovery':
      return 'Find a movie before it starts trending';
    default:
      return 'Keep using CineMind to unlock this badge';
  }
}

interface BadgeGridProps {
  badges: VaultBadge[];
  unlockedBadgeIds: Set<string>;
}

export function BadgeGrid({ badges, unlockedBadgeIds }: BadgeGridProps) {
  const sortedBadges = [...badges].sort((a, b) => {
    const aUnlocked = unlockedBadgeIds.has(a.id);
    const bUnlocked = unlockedBadgeIds.has(b.id);
    if (aUnlocked !== bUnlocked) return bUnlocked ? 1 : -1;
    
    const rarityOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
    return rarityOrder[a.rarity] - rarityOrder[b.rarity];
  });

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
      {sortedBadges.map((badge) => (
        <BadgeCard
          key={badge.id}
          badge={badge}
          isUnlocked={unlockedBadgeIds.has(badge.id)}
          showShare={unlockedBadgeIds.has(badge.id)}
        />
      ))}
    </div>
  );
}
