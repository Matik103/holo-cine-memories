import { useMysteries, useDetectiveStats, useUnsolvedCount } from '@/hooks/useMysteries';
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
  Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CollectiveMemory() {
  const navigate = useNavigate();
  const unsolvedCount = useUnsolvedCount();
  const { stats, rankInfo, isLoading: statsLoading, isAuthenticated } = useDetectiveStats();
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
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                aria-label="Go back to home"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-400" aria-hidden="true" />
                  Collective Memory
                </h1>
                <p className="text-xs text-muted-foreground">
                  Help identify movies from memories
                </p>
              </div>
            </div>
            <CreateMysteryDialog onSuccess={refetch} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="neural-card p-3 text-center">
                <div className="text-2xl font-bold text-purple-400">{unsolvedCount}</div>
                <div className="text-xs text-muted-foreground">Unsolved</div>
              </Card>
              {isAuthenticated && stats && (
                <>
                  <Card className="neural-card p-3 text-center">
                    <div className="text-2xl font-bold text-green-400">{stats.mysteries_solved}</div>
                    <div className="text-xs text-muted-foreground">Your Solves</div>
                  </Card>
                  <Card className="neural-card p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Flame className="h-5 w-5 text-orange-400" aria-hidden="true" />
                      <span className="text-2xl font-bold text-orange-400">{stats.solve_streak}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Streak</div>
                  </Card>
                  <Card className="neural-card p-3 text-center">
                    <DetectiveRankBadge rank={stats.detective_rank} size="sm" />
                  </Card>
                </>
              )}
              {!isAuthenticated && (
                <>
                  <Card className="neural-card p-3 text-center col-span-2 sm:col-span-3">
                    <p className="text-sm text-muted-foreground">
                      Sign in to track your progress and earn detective ranks
                    </p>
                  </Card>
                </>
              )}
            </div>

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
              <Card className="neural-card p-6 text-center" role="alert">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" aria-hidden="true" />
                <h3 className="font-semibold mb-2">Failed to load mysteries</h3>
                <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
                <Button onClick={refetch} variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Try Again
                </Button>
              </Card>
            )}

            {/* Loading state */}
            {isLoading && mysteries.length === 0 && (
              <div className="space-y-4" role="status" aria-label="Loading mysteries">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-40 w-full rounded-xl" />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !error && mysteries.length === 0 && (
              <Card className="neural-card p-8 text-center">
                <HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" aria-hidden="true" />
                <h3 className="font-semibold mb-2">No mysteries found</h3>
                <p className="text-sm text-muted-foreground mb-4">
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
              <div className="space-y-4" aria-label="Movie mysteries">
                {mysteries.map((mystery) => (
                  <MysteryCard key={mystery.id} mystery={mystery} />
                ))}
              </div>
            )}

            {/* Load more */}
            {hasMore && mysteries.length > 0 && (
              <div className="text-center py-4">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={isLoading}
                  className="gap-2"
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

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* How it works */}
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
          </aside>
        </div>
      </main>
    </div>
  );
}
