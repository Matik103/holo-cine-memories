import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Vault as VaultIcon } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useVaultStats } from '@/hooks/useVaultStats';
import { LivePulse } from '@/components/vault/LivePulse';
import { TrendingChart } from '@/components/vault/TrendingChart';
import { HiddenGems } from '@/components/vault/HiddenGems';
import { PredictionGame } from '@/components/vault/PredictionGame';
import { Champions } from '@/components/vault/Champions';
import { UserVaultStats } from '@/components/vault/UserVaultStats';

export const Vault = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { stats, isLoading, isAuthenticated } = useVaultStats();
  const [trendingPeriod, setTrendingPeriod] = useState<'hour' | 'day' | 'week'>('day');

  return (
    <div className="min-h-screen p-2 sm:p-4 relative pt-safe-top">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/3 to-transparent rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto px-2 pt-6 sm:pt-4 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2 text-primary/80 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{t('common.back')}</span>
          </Button>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <VaultIcon className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {t('vault.title')}
              </h1>
            </div>
            {stats && (
              <div className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                <span className="text-xs text-primary/70">{t('vault.score')}</span>
                <span className="font-bold text-primary">{stats.vault_score}</span>
              </div>
            )}
          </div>
        </div>

        {/* Live Pulse */}
        <LivePulse />

        {/* Trending Section */}
        <Card className="neural-card p-4 sm:p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span className="text-xl">🔥</span>
              {t('vault.trending.title')}
            </h2>
            <div className="flex gap-1">
              {(['hour', 'day', 'week'] as const).map((period) => (
                <Button
                  key={period}
                  variant={trendingPeriod === period ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTrendingPeriod(period)}
                  className="text-xs px-2 py-1 h-7"
                >
                  {t(`vault.trending.${period}`)}
                </Button>
              ))}
            </div>
          </div>
          <TrendingChart period={trendingPeriod} />
        </Card>

        {/* Hidden Gems */}
        <Card className="neural-card p-4 sm:p-6 mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <span className="text-xl">💎</span>
            {t('vault.hiddenGems.title')}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {t('vault.hiddenGems.description')}
          </p>
          <HiddenGems />
        </Card>

        {/* Prediction Game */}
        <Card className="neural-card p-4 sm:p-6 mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <span className="text-xl">🎯</span>
            {t('vault.predictions.title')}
          </h2>
          <PredictionGame />
        </Card>

        {/* Champions */}
        <Card className="neural-card p-4 sm:p-6 mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <span className="text-xl">🏆</span>
            {t('vault.champions.title')}
          </h2>
          <Champions />
        </Card>

        {/* User Stats */}
        {isAuthenticated && (
          <Card className="neural-card p-4 sm:p-6 mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <span className="text-xl">📊</span>
              {t('vault.yourStats.title')}
            </h2>
            <UserVaultStats stats={stats} isLoading={isLoading} />
          </Card>
        )}

        {/* Sign in prompt for non-authenticated users */}
        {!isAuthenticated && (
          <Card className="neural-card p-6 mb-4 text-center">
            <p className="text-muted-foreground mb-4">
              {t('vault.signInPrompt')}
            </p>
            <Button onClick={() => navigate('/auth')} className="neural-button">
              {t('auth.signIn')}
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Vault;
