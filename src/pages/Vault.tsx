import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Vault as VaultIcon, Users, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { LivePulse } from '@/components/vault/LivePulse';
import { TrendingChart } from '@/components/vault/TrendingChart';
import { HiddenGems } from '@/components/vault/HiddenGems';
import { RecentMysteries } from '@/components/vault/RecentMysteries';
import { DetectiveLeaderboard } from '@/components/mystery/DetectiveLeaderboard';

export const Vault = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [trendingPeriod, setTrendingPeriod] = useState<'hour' | 'day' | 'week'>('day');

  return (
    <div className="min-h-screen p-2 sm:p-4 relative pt-safe-top">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/3 to-transparent rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto px-2 sm:px-4 pt-6 sm:pt-4 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="gap-1 sm:gap-2 text-primary/80 hover:text-primary px-2 sm:px-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{t('common.back')}</span>
          </Button>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="p-1.5 sm:p-2 rounded-full bg-primary/10">
              <VaultIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t('vault.title')}
            </h1>
          </div>

          {/* Quick nav to Collective Memory */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/mysteries')}
            className="gap-1 sm:gap-2 text-purple-400 hover:text-purple-300 px-2 sm:px-4"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">{t('nav.mysteries')}</span>
          </Button>
        </div>

        {/* Live Pulse */}
        <LivePulse />

        {/* Trending Section */}
        <Card className="neural-card p-3 sm:p-6 mb-3 sm:mb-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold flex items-center gap-1.5 sm:gap-2">
              <span className="text-lg sm:text-xl">🔥</span>
              {t('vault.trending.title')}
            </h2>
            <div className="flex gap-1">
              {(['hour', 'day', 'week'] as const).map((period) => (
                <Button
                  key={period}
                  variant={trendingPeriod === period ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTrendingPeriod(period)}
                  className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-1 h-6 sm:h-7"
                >
                  {t(`vault.trending.${period}`)}
                </Button>
              ))}
            </div>
          </div>
          <TrendingChart period={trendingPeriod} />
        </Card>

        {/* Hidden Gems */}
        <Card className="neural-card p-3 sm:p-6 mb-3 sm:mb-4">
          <h2 className="text-base sm:text-lg font-semibold flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-4">
            <span className="text-lg sm:text-xl">💎</span>
            {t('vault.hiddenGems.title')}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
            {t('vault.hiddenGems.description')}
          </p>
          <HiddenGems />
        </Card>

        {/* Collective Memory Section */}
        <Card className="neural-card p-3 sm:p-6 mb-3 sm:mb-4 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold flex items-center gap-1.5 sm:gap-2">
              <Users className="h-5 w-5 text-purple-400" />
              {t('mystery.collectiveMemory')}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/mysteries')}
              className="text-xs gap-1 text-purple-400 hover:text-purple-300"
            >
              {t('vault.mysteries.explore')}
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
            {t('vault.mysteries.description')}
          </p>
          <RecentMysteries />
        </Card>

        {/* Top Detectives */}
        <Card className="neural-card p-3 sm:p-6 mb-3 sm:mb-4">
          <h2 className="text-base sm:text-lg font-semibold flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            <span className="text-lg sm:text-xl">🔍</span>
            {t('mystery.topDetectives')}
          </h2>
          <DetectiveLeaderboard />
        </Card>
      </div>
    </div>
  );
};

export default Vault;
