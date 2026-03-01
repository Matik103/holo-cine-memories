import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Brain, HelpCircle, Trophy, Flame } from 'lucide-react';
import { useMysteries, useDetectiveStats, useUnsolvedCount } from '@/hooks/useMysteries';
import { 
  MysteryCard, 
  MysteryFilters, 
  CreateMysteryDialog, 
  DetectiveRankBadge,
  DetectiveLeaderboard 
} from '@/components/mystery';

export const CollectiveMemory = () => {
  const navigate = useNavigate();
  const { 
    mysteries, 
    isLoading, 
    filter, 
    sort, 
    hasMore, 
    loadMore, 
    changeFilter, 
    changeSort,
    isAuthenticated 
  } = useMysteries();
  const { stats, rankInfo } = useDetectiveStats();
  const unsolvedCount = useUnsolvedCount();

  return (
    <div className="min-h-screen p-2 sm:p-4 relative pt-safe-top">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-4xl mx-auto px-2 sm:px-4 pt-6 sm:pt-4 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-1 sm:gap-2 text-primary/80 hover:text-primary px-2 sm:px-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="p-1.5 sm:p-2 rounded-full bg-purple-500/10">
                <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
              </div>
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Collective Memory
              </h1>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
            <HelpCircle className="h-4 w-4 text-purple-400" />
            <span className="text-xs sm:text-sm">
              <span className="font-bold text-purple-400">{unsolvedCount}</span>
              <span className="text-muted-foreground ml-1">unsolved</span>
            </span>
          </div>

          {isAuthenticated && stats && (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                <Trophy className="h-4 w-4 text-cyan-400" />
                <span className="text-xs sm:text-sm">
                  <span className="font-bold text-cyan-400">{stats.mysteries_solved}</span>
                  <span className="text-muted-foreground ml-1">solved</span>
                </span>
              </div>
              
              {stats.solve_streak > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
                  <Flame className="h-4 w-4 text-orange-400" />
                  <span className="text-xs sm:text-sm">
                    <span className="font-bold text-orange-400">{stats.solve_streak}</span>
                    <span className="text-muted-foreground ml-1">streak</span>
                  </span>
                </div>
              )}

              <DetectiveRankBadge 
                rank={stats.detective_rank} 
                solves={stats.mysteries_solved}
                size="sm"
              />
            </>
          )}

          <div className="ml-auto">
            <CreateMysteryDialog />
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Mystery feed - main column */}
          <div className="lg:col-span-2">
            <Card className="neural-card p-4">
              <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2 mb-4">
                <span className="text-lg">🔍</span>
                Movie Mysteries
              </h2>

              <MysteryFilters
                filter={filter}
                sort={sort}
                onFilterChange={changeFilter}
                onSortChange={changeSort}
                isAuthenticated={isAuthenticated}
              />

              {isLoading && mysteries.length === 0 ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-lg" />
                  ))}
                </div>
              ) : mysteries.length === 0 ? (
                <div className="text-center py-12">
                  <HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground mb-4">No mysteries found</p>
                  <CreateMysteryDialog 
                    trigger={
                      <Button variant="outline" className="gap-2">
                        <HelpCircle className="h-4 w-4" />
                        Post the first mystery
                      </Button>
                    }
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {mysteries.map((mystery) => (
                      <MysteryCard key={mystery.id} mystery={mystery} />
                    ))}
                  </div>

                  {hasMore && (
                    <div className="mt-4 text-center">
                      <Button
                        variant="outline"
                        onClick={loadMore}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Loading...' : 'Load More'}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* How it works */}
            <Card className="neural-card p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <span>💡</span>
                How It Works
              </h3>
              <div className="space-y-3 text-xs text-muted-foreground">
                <div className="flex gap-2">
                  <span className="text-purple-400 font-bold">1.</span>
                  <p>Post a mystery describing the movie you're trying to remember</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-purple-400 font-bold">2.</span>
                  <p>Community detectives submit their guesses</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-purple-400 font-bold">3.</span>
                  <p>Vote on solutions and accept the correct answer</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-purple-400 font-bold">4.</span>
                  <p>Solvers earn points and climb the detective ranks!</p>
                </div>
              </div>
            </Card>

            {/* Detective Leaderboard */}
            <Card className="neural-card p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <span>🏆</span>
                Top Detectives
              </h3>
              <DetectiveLeaderboard />
            </Card>

            {/* Your detective stats */}
            {isAuthenticated && stats && (
              <Card className="neural-card p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <span>📊</span>
                  Your Detective Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Rank</span>
                    <DetectiveRankBadge 
                      rank={stats.detective_rank} 
                      solves={stats.mysteries_solved}
                      showProgress
                      size="sm"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Mysteries Solved</span>
                    <span className="text-sm font-bold text-cyan-400">{stats.mysteries_solved}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Mysteries Posted</span>
                    <span className="text-sm font-bold">{stats.mysteries_posted}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Current Streak</span>
                    <span className="text-sm font-bold text-orange-400 flex items-center gap-1">
                      {stats.solve_streak > 0 && <Flame className="h-3 w-3" />}
                      {stats.solve_streak}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Best Streak</span>
                    <span className="text-sm font-bold">{stats.longest_solve_streak}</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Sign in prompt */}
            {!isAuthenticated && (
              <Card className="neural-card p-4 text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  Sign in to post mysteries and earn detective badges!
                </p>
                <Button onClick={() => navigate('/auth')} className="w-full neural-button">
                  Sign In
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectiveMemory;
