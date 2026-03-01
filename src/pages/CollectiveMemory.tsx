import { useMysteries, useDetectiveStats, useUnsolvedCount, useFeaturedMystery } from '@/hooks/useMysteries';
import { MysteryCard } from '@/components/mystery/MysteryCard';
import { MysteryFilters } from '@/components/mystery/MysteryFilters';
import { CreateMysteryDialog } from '@/components/mystery/CreateMysteryDialog';
import { DetectiveRankBadge } from '@/components/mystery/DetectiveRankBadge';
import { DetectiveLeaderboard } from '@/components/mystery/DetectiveLeaderboard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  HelpCircle, 
  Trophy, 
  Flame, 
  Users, 
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  Lightbulb,
  Search,
  ThumbsUp,
  Award,
  Plus,
  Zap,
  Eye,
  MessageSquare,
  Vault,
  ArrowRight
} from 'lucide-react';
import { ShareMysteryMenu } from '@/components/mystery';
import { useNavigate } from 'react-router-dom';
import { useVaultStats } from '@/hooks/useVaultStats';

export function CollectiveMemory() {
  const navigate = useNavigate();
  const unsolvedCount = useUnsolvedCount();
  const { mystery: featuredMystery, isLoading: featuredLoading } = useFeaturedMystery();
  const { stats, rankInfo, isLoading: statsLoading, isAuthenticated } = useDetectiveStats();
  const { stats: vaultStats, isLoading: vaultLoading } = useVaultStats();
  const {
    mysteries,
    isLoading,
    error,
    filter,
    sort,
    hasMore,
    loadMore,
    changeFilter,
    changeSort,
    refetch
  } = useMysteries();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                aria-label="Go back to home"
                className="flex-shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-bold flex items-center gap-1.5 sm:gap-2">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400 flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">Collective Memory</span>
                </h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                  Help identify movies from memories
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Quick nav to Vault */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/vault')}
                className="gap-1 text-primary/80 hover:text-primary px-2 hidden sm:flex"
              >
                <Vault className="h-4 w-4" />
                <span>Vault</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/vault')}
                className="text-primary/80 hover:text-primary sm:hidden"
                aria-label="Go to Vault"
              >
                <Vault className="h-5 w-5" />
              </Button>

              {/* Desktop button */}
              <div className="hidden sm:block">
                <CreateMysteryDialog 
                  onSuccess={refetch}
                  trigger={
                    <Button className="neural-button gap-2">
                      <HelpCircle className="h-4 w-4" aria-hidden="true" />
                      Post a Mystery
                    </Button>
                  }
                />
              </div>
              {/* Mobile button */}
              <div className="sm:hidden">
                <CreateMysteryDialog 
                  onSuccess={refetch}
                  trigger={
                    <Button className="neural-button" size="icon" aria-label="Post a Mystery">
                      <Plus className="h-5 w-5" />
                    </Button>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Mobile: How it works card at top for first-time users */}
        <div className="lg:hidden mb-4">
          <Card className="neural-card p-3 sm:p-4">
            <h2 className="font-semibold mb-3 flex items-center gap-2 text-sm">
              <Lightbulb className="h-4 w-4 text-yellow-400" aria-hidden="true" />
              How It Works
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] font-bold" aria-hidden="true">1</span>
                <span className="text-xs whitespace-nowrap">Post Mystery</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold" aria-hidden="true">2</span>
                <span className="text-xs whitespace-nowrap">Get Answers</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-[10px] font-bold" aria-hidden="true">3</span>
                <span className="text-xs whitespace-nowrap">Accept Solution</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Stats bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <Card className="neural-card p-2 sm:p-3 text-center">
                <div className="text-xl sm:text-2xl font-bold text-purple-400">{unsolvedCount}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">Unsolved</div>
              </Card>
              {isAuthenticated && stats && (
                <>
                  <Card className="neural-card p-2 sm:p-3 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-green-400">{stats.mysteries_solved}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Your Solves</div>
                  </Card>
                  <Card className="neural-card p-2 sm:p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400" aria-hidden="true" />
                      <span className="text-xl sm:text-2xl font-bold text-orange-400">{stats.solve_streak}</span>
                    </div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Streak</div>
                  </Card>
                  <Card className="neural-card p-2 sm:p-3 text-center flex items-center justify-center">
                    <DetectiveRankBadge rank={stats.detective_rank} size="sm" />
                  </Card>
                </>
              )}
              {!isAuthenticated && (
                <Card className="neural-card p-2 sm:p-3 text-center col-span-1 sm:col-span-3">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Sign in to track progress
                  </p>
                </Card>
              )}
            </div>

            {/* Featured/Hot Mystery */}
            {featuredMystery && !featuredLoading && (
              <Card 
                className="neural-card p-4 sm:p-5 border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-yellow-500/5 cursor-pointer hover:border-orange-500/50 transition-all"
                onClick={() => navigate(`/mysteries/${featuredMystery.id}`)}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-orange-500/20 flex-shrink-0">
                    <Zap className="h-5 w-5 text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-orange-400 uppercase tracking-wide">Hot Mystery</span>
                      <span className="text-[10px] text-muted-foreground">• Needs your help!</span>
                    </div>
                    <p className="text-sm sm:text-base line-clamp-2 mb-2">
                      {featuredMystery.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {featuredMystery.view_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {featuredMystery.attempt_count}
                        </span>
                        <span className="flex items-center gap-1 text-primary">
                          <Trophy className="h-3 w-3" />
                          +{featuredMystery.points_reward}
                        </span>
                      </div>
                      <ShareMysteryMenu
                        mysteryId={featuredMystery.id}
                        description={featuredMystery.description}
                        variant="ghost"
                        size="sm"
                        trigger={
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Share
                          </Button>
                        }
                      />
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Filters */}
            <MysteryFilters
              filter={filter}
              sort={sort}
              onFilterChange={changeFilter}
              onSortChange={changeSort}
              isAuthenticated={isAuthenticated}
            />

            {/* Error state */}
            {error && (
              <Card className="neural-card p-4 sm:p-6 text-center" role="alert">
                <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-destructive" aria-hidden="true" />
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Failed to load mysteries</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">{error.message}</p>
                <Button onClick={refetch} variant="outline" className="gap-2 text-sm">
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Try Again
                </Button>
              </Card>
            )}

            {/* Loading state */}
            {isLoading && mysteries.length === 0 && (
              <div className="space-y-3 sm:space-y-4" role="status" aria-label="Loading mysteries">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32 sm:h-40 w-full rounded-xl" />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !error && mysteries.length === 0 && (
              <Card className="neural-card p-6 sm:p-8 text-center">
                <HelpCircle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" aria-hidden="true" />
                <h3 className="font-semibold mb-2 text-sm sm:text-base">No mysteries found</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                  {filter === 'unsolved' 
                    ? 'All mysteries have been solved! Be the first to post a new one.'
                    : filter === 'my_mysteries'
                    ? "You haven't posted any mysteries yet."
                    : filter === 'my_solves'
                    ? "You haven't solved any mysteries yet. Start helping others!"
                    : 'No mysteries match your current filters.'}
                </p>
                <CreateMysteryDialog onSuccess={refetch} />
              </Card>
            )}

            {/* Mystery list */}
            {mysteries.length > 0 && (
              <div className="space-y-3 sm:space-y-4" aria-label="Movie mysteries">
                {mysteries.map((mystery) => (
                  <MysteryCard key={mystery.id} mystery={mystery} />
                ))}
              </div>
            )}

            {/* Load more */}
            {hasMore && mysteries.length > 0 && (
              <div className="text-center py-3 sm:py-4">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={isLoading}
                  className="gap-2 w-full sm:w-auto"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" aria-hidden="true" />
                      Load More
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar - hidden on mobile, shown on lg+ */}
          <aside className="hidden lg:block space-y-6">
            {/* How it works - full version for desktop */}
            <Card className="neural-card p-4">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-400" aria-hidden="true" />
                How It Works
              </h2>
              <ol className="space-y-3 text-sm" aria-label="How Collective Memory works">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold" aria-hidden="true">1</span>
                  <div>
                    <span className="font-medium">Post a Mystery</span>
                    <p className="text-xs text-muted-foreground">Describe the movie you're trying to find</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold" aria-hidden="true">2</span>
                  <div>
                    <span className="font-medium">Community Helps</span>
                    <p className="text-xs text-muted-foreground">Detectives suggest movies and vote on answers</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold" aria-hidden="true">3</span>
                  <div>
                    <span className="font-medium">Accept Solution</span>
                    <p className="text-xs text-muted-foreground">Mark the correct answer and reward the solver</p>
                  </div>
                </li>
              </ol>
            </Card>

            {/* Detective stats */}
            {isAuthenticated && stats && (
              <Card className="neural-card p-4">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                  <Award className="h-4 w-4 text-purple-400" aria-hidden="true" />
                  Your Detective Stats
                </h2>
                <div className="space-y-4">
                  <DetectiveRankBadge 
                    rank={stats.detective_rank} 
                    solves={stats.mysteries_solved}
                    showProgress 
                    size="lg"
                  />
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-2 rounded-lg bg-background/50">
                      <div className="text-lg font-bold">{stats.mysteries_posted}</div>
                      <div className="text-xs text-muted-foreground">Posted</div>
                    </div>
                    <div className="p-2 rounded-lg bg-background/50">
                      <div className="text-lg font-bold">{stats.longest_solve_streak}</div>
                      <div className="text-xs text-muted-foreground">Best Streak</div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Leaderboard */}
            <Card className="neural-card p-4">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-400" aria-hidden="true" />
                Top Detectives
              </h2>
              <DetectiveLeaderboard />
            </Card>

            {/* Tips */}
            <Card className="neural-card p-4">
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <Search className="h-4 w-4 text-cyan-400" aria-hidden="true" />
                Tips for Solving
              </h2>
              <ul className="space-y-2 text-xs text-muted-foreground" aria-label="Tips for solving mysteries">
                <li className="flex items-start gap-2">
                  <ThumbsUp className="h-3 w-3 mt-0.5 text-green-400 flex-shrink-0" aria-hidden="true" />
                  <span>Upvote answers you think are correct</span>
                </li>
                <li className="flex items-start gap-2">
                  <ThumbsUp className="h-3 w-3 mt-0.5 text-green-400 flex-shrink-0" aria-hidden="true" />
                  <span>Include the year and any actors you recognize</span>
                </li>
                <li className="flex items-start gap-2">
                  <ThumbsUp className="h-3 w-3 mt-0.5 text-green-400 flex-shrink-0" aria-hidden="true" />
                  <span>Explain why you think it's the right movie</span>
                </li>
              </ul>
            </Card>

            {/* Vault Link */}
            <Card 
              className="neural-card p-4 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 cursor-pointer hover:border-primary/40 transition-all"
              onClick={() => navigate('/vault')}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold flex items-center gap-2">
                  <Vault className="h-4 w-4 text-primary" aria-hidden="true" />
                  The Vault
                </h2>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Explore trending movies, hidden gems, and community stats
              </p>
              {isAuthenticated && vaultStats && (
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10">
                    <Trophy className="h-3 w-3 text-primary" />
                    <span className="font-medium">{vaultStats.vault_score}</span>
                    <span className="text-muted-foreground">score</span>
                  </div>
                  {vaultStats.current_streak > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/10">
                      <Flame className="h-3 w-3 text-orange-400" />
                      <span className="font-medium text-orange-400">{vaultStats.current_streak}</span>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </aside>

          {/* Mobile-only: Collapsible sections at bottom */}
          <div className="lg:hidden space-y-4">
            {/* Detective stats for mobile */}
            {isAuthenticated && stats && (
              <Card className="neural-card p-3 sm:p-4">
                <h2 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4 text-purple-400" aria-hidden="true" />
                  Your Detective Stats
                </h2>
                <div className="flex items-center justify-between gap-4">
                  <DetectiveRankBadge 
                    rank={stats.detective_rank} 
                    solves={stats.mysteries_solved}
                    showProgress 
                    size="md"
                  />
                  <div className="flex gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold">{stats.mysteries_posted}</div>
                      <div className="text-[10px] text-muted-foreground">Posted</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{stats.longest_solve_streak}</div>
                      <div className="text-[10px] text-muted-foreground">Best</div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Leaderboard for mobile */}
            <Card className="neural-card p-3 sm:p-4">
              <h2 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                <Trophy className="h-4 w-4 text-yellow-400" aria-hidden="true" />
                Top Detectives
              </h2>
              <DetectiveLeaderboard />
            </Card>

            {/* Vault Link for mobile */}
            <Card 
              className="neural-card p-3 sm:p-4 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 cursor-pointer"
              onClick={() => navigate('/vault')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Vault className="h-4 w-4 text-primary" aria-hidden="true" />
                  <span className="font-semibold text-sm">The Vault</span>
                </div>
                <div className="flex items-center gap-2">
                  {isAuthenticated && vaultStats && (
                    <span className="text-xs text-primary font-medium">{vaultStats.vault_score} pts</span>
                  )}
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
