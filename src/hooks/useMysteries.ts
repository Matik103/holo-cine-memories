import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  mysteryService, 
  Mystery, 
  MysteryAttempt, 
  DetectiveStats,
  MysteryFilter,
  MysterySort
} from '@/services/mysteryService';

export function useMysteries(
  initialFilter: MysteryFilter = 'unsolved',
  initialSort: MysterySort = 'recent'
) {
  const [user, setUser] = useState<any>(null);
  const [mysteries, setMysteries] = useState<Mystery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<MysteryFilter>(initialFilter);
  const [sort, setSort] = useState<MysterySort>(initialSort);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const LIMIT = 20;

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchMysteries = useCallback(async (reset = false) => {
    const currentPage = reset ? 0 : page;
    setIsLoading(true);
    
    try {
      const data = await mysteryService.getMysteries(
        filter,
        sort,
        LIMIT,
        currentPage * LIMIT,
        user?.id
      );
      
      if (reset) {
        setMysteries(data);
        setPage(0);
      } else {
        setMysteries(prev => [...prev, ...data]);
      }
      
      setHasMore(data.length === LIMIT);
    } catch (err) {
      console.error('Error fetching mysteries:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filter, sort, page, user?.id]);

  useEffect(() => {
    fetchMysteries(true);
  }, [filter, sort, user?.id]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
      fetchMysteries(false);
    }
  }, [isLoading, hasMore, fetchMysteries]);

  const changeFilter = useCallback((newFilter: MysteryFilter) => {
    setFilter(newFilter);
    setPage(0);
  }, []);

  const changeSort = useCallback((newSort: MysterySort) => {
    setSort(newSort);
    setPage(0);
  }, []);

  return {
    mysteries,
    isLoading,
    filter,
    sort,
    hasMore,
    loadMore,
    changeFilter,
    changeSort,
    refetch: () => fetchMysteries(true),
    isAuthenticated: !!user
  };
}

export function useMystery(mysteryId: string | null) {
  const [mystery, setMystery] = useState<Mystery | null>(null);
  const [attempts, setAttempts] = useState<MysteryAttempt[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchMystery = useCallback(async () => {
    if (!mysteryId) {
      setMystery(null);
      setAttempts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [mysteryData, attemptsData] = await Promise.all([
        mysteryService.getMysteryById(mysteryId),
        mysteryService.getAttempts(mysteryId)
      ]);
      
      setMystery(mysteryData);
      setAttempts(attemptsData);

      // Fetch user votes if authenticated
      if (user?.id && attemptsData.length > 0) {
        const votes = await mysteryService.getUserVotes(
          user.id,
          attemptsData.map(a => a.id)
        );
        setUserVotes(votes);
      }
    } catch (err) {
      console.error('Error fetching mystery:', err);
    } finally {
      setIsLoading(false);
    }
  }, [mysteryId, user?.id]);

  useEffect(() => {
    fetchMystery();
  }, [fetchMystery]);

  const submitAttempt = useCallback(async (
    movieTitle: string,
    movieYear?: number,
    tmdbId?: number,
    posterUrl?: string,
    explanation?: string
  ): Promise<boolean> => {
    if (!user?.id || !mysteryId) return false;

    const attempt = await mysteryService.submitAttempt(
      mysteryId,
      user.id,
      movieTitle,
      movieYear,
      tmdbId,
      posterUrl,
      explanation
    );

    if (attempt) {
      await fetchMystery();
      return true;
    }
    return false;
  }, [user?.id, mysteryId, fetchMystery]);

  const vote = useCallback(async (attemptId: string, voteType: 'up' | 'down'): Promise<boolean> => {
    if (!user?.id) return false;

    const success = await mysteryService.voteOnAttempt(attemptId, user.id, voteType);
    if (success) {
      await fetchMystery();
    }
    return success;
  }, [user?.id, fetchMystery]);

  const acceptSolution = useCallback(async (attemptId: string): Promise<boolean> => {
    if (!user?.id || !mysteryId) return false;

    const success = await mysteryService.acceptSolution(mysteryId, attemptId, user.id);
    if (success) {
      await fetchMystery();
    }
    return success;
  }, [user?.id, mysteryId, fetchMystery]);

  const closeMystery = useCallback(async (): Promise<boolean> => {
    if (!user?.id || !mysteryId) return false;

    const success = await mysteryService.closeMystery(mysteryId, user.id);
    if (success) {
      await fetchMystery();
    }
    return success;
  }, [user?.id, mysteryId, fetchMystery]);

  const isOwner = mystery?.user_id === user?.id;
  const hasUserAttempted = attempts.some(a => a.user_id === user?.id);

  return {
    mystery,
    attempts,
    userVotes,
    isLoading,
    isOwner,
    hasUserAttempted,
    submitAttempt,
    vote,
    acceptSolution,
    closeMystery,
    refetch: fetchMystery,
    isAuthenticated: !!user,
    userId: user?.id
  };
}

export function useCreateMystery() {
  const [user, setUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const createMystery = useCallback(async (
    description: string,
    additionalClues?: string,
    originalSearchQuery?: string,
    aiSuggestions?: any
  ): Promise<Mystery | null> => {
    if (!user?.id) return null;

    setIsSubmitting(true);
    try {
      const mystery = await mysteryService.createMystery(
        user.id,
        description,
        additionalClues,
        originalSearchQuery,
        aiSuggestions
      );
      return mystery;
    } finally {
      setIsSubmitting(false);
    }
  }, [user?.id]);

  return {
    createMystery,
    isSubmitting,
    isAuthenticated: !!user
  };
}

export function useDetectiveStats() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<DetectiveStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) {
        setStats(null);
        setIsLoading(false);
        return;
      }

      try {
        const data = await mysteryService.getDetectiveStats(user.id);
        setStats(data);
      } catch (err) {
        console.error('Error fetching detective stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user?.id]);

  const rankInfo = stats ? mysteryService.getDetectiveRankInfo(stats.detective_rank) : null;

  return {
    stats,
    rankInfo,
    isLoading,
    isAuthenticated: !!user
  };
}

export function useTopDetectives(limit = 10) {
  const [detectives, setDetectives] = useState<Array<{
    display_name: string;
    mysteries_solved: number;
    detective_rank: string;
    solve_streak: number;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetectives = async () => {
      try {
        const data = await mysteryService.getTopDetectives(limit);
        setDetectives(data);
      } catch (err) {
        console.error('Error fetching top detectives:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetectives();
  }, [limit]);

  return { detectives, isLoading };
}

export function useUnsolvedCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      const unsolvedCount = await mysteryService.getUnsolvedCount();
      setCount(unsolvedCount);
    };

    fetchCount();
    const interval = setInterval(fetchCount, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return count;
}
