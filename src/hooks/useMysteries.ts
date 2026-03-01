import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  mysteryService, 
  Mystery, 
  MysteryAttempt, 
  DetectiveStats,
  MysteryFilter,
  MysterySort,
  MysteryServiceError
} from '@/services/mysteryService';

interface UseMysteryState<T> {
  data: T;
  isLoading: boolean;
  error: MysteryServiceError | null;
}

export function useMysteries(
  initialFilter: MysteryFilter = 'unsolved',
  initialSort: MysterySort = 'recent'
) {
  const [user, setUser] = useState<any>(null);
  const [mysteries, setMysteries] = useState<Mystery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<MysteryServiceError | null>(null);
  const [filter, setFilter] = useState<MysteryFilter>(initialFilter);
  const [sort, setSort] = useState<MysterySort>(initialSort);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const LIMIT = 20;
  
  // Track mounted state to prevent state updates after unmount
  const isMounted = useRef(true);
  // Track current fetch to handle race conditions
  const fetchIdRef = useRef(0);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (isMounted.current) setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (isMounted.current) setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchMysteries = useCallback(async (reset = false, currentPage = 0) => {
    const fetchId = ++fetchIdRef.current;
    
    if (!isMounted.current) return;
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await mysteryService.getMysteries(
        filter,
        sort,
        LIMIT,
        currentPage * LIMIT,
        user?.id
      );
      
      // Check if this is still the latest fetch and component is mounted
      if (fetchId !== fetchIdRef.current || !isMounted.current) return;
      
      if (result.error) {
        setError(result.error);
        return;
      }
      
      const data = result.data || [];
      
      if (reset) {
        setMysteries(data);
      } else {
        setMysteries(prev => [...prev, ...data]);
      }
      
      setHasMore(data.length === LIMIT);
    } catch (err) {
      if (fetchId === fetchIdRef.current && isMounted.current) {
        setError({ code: 'UNEXPECTED_ERROR', message: 'Failed to load mysteries' });
      }
    } finally {
      if (fetchId === fetchIdRef.current && isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [filter, sort, user?.id]);

  // Fetch when filter, sort, or user changes
  useEffect(() => {
    setPage(0);
    fetchMysteries(true, 0);
  }, [filter, sort, user?.id, fetchMysteries]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMysteries(false, nextPage);
    }
  }, [isLoading, hasMore, page, fetchMysteries]);

  const changeFilter = useCallback((newFilter: MysteryFilter) => {
    setFilter(newFilter);
  }, []);

  const changeSort = useCallback((newSort: MysterySort) => {
    setSort(newSort);
  }, []);

  const refetch = useCallback(() => {
    setPage(0);
    fetchMysteries(true, 0);
  }, [fetchMysteries]);

  return {
    mysteries,
    isLoading,
    error,
    filter,
    sort,
    hasMore,
    loadMore,
    changeFilter,
    changeSort,
    refetch,
    isAuthenticated: !!user
  };
}

export function useMystery(mysteryId: string | null) {
  const [mystery, setMystery] = useState<Mystery | null>(null);
  const [attempts, setAttempts] = useState<MysteryAttempt[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<MysteryServiceError | null>(null);
  const [user, setUser] = useState<any>(null);
  
  const isMounted = useRef(true);
  const fetchIdRef = useRef(0);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (isMounted.current) setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (isMounted.current) setUser(session?.user ?? null);
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

    const fetchId = ++fetchIdRef.current;
    
    if (!isMounted.current) return;
    setIsLoading(true);
    setError(null);

    try {
      const [mysteryResult, attemptsResult] = await Promise.all([
        mysteryService.getMysteryById(mysteryId),
        mysteryService.getAttempts(mysteryId)
      ]);
      
      if (fetchId !== fetchIdRef.current || !isMounted.current) return;
      
      if (mysteryResult.error) {
        setError(mysteryResult.error);
        setMystery(null);
        setAttempts([]);
        return;
      }
      
      setMystery(mysteryResult.data);
      setAttempts(attemptsResult.data || []);

      // Fetch user votes if authenticated
      if (user?.id && attemptsResult.data && attemptsResult.data.length > 0) {
        const votes = await mysteryService.getUserVotes(
          user.id,
          attemptsResult.data.map(a => a.id)
        );
        if (fetchId === fetchIdRef.current && isMounted.current) {
          setUserVotes(votes);
        }
      }
    } catch (err) {
      if (fetchId === fetchIdRef.current && isMounted.current) {
        setError({ code: 'UNEXPECTED_ERROR', message: 'Failed to load mystery' });
      }
    } finally {
      if (fetchId === fetchIdRef.current && isMounted.current) {
        setIsLoading(false);
      }
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
  ): Promise<{ success: boolean; error?: MysteryServiceError }> => {
    if (!user?.id || !mysteryId) {
      return { success: false, error: { code: 'AUTH_REQUIRED', message: 'Please sign in to submit a solution' } };
    }

    const result = await mysteryService.submitAttempt(
      mysteryId,
      user.id,
      movieTitle,
      movieYear,
      tmdbId,
      posterUrl,
      explanation
    );

    if (result.error) {
      return { success: false, error: result.error };
    }

    await fetchMystery();
    return { success: true };
  }, [user?.id, mysteryId, fetchMystery]);

  const vote = useCallback(async (attemptId: string, voteType: 'up' | 'down'): Promise<{ success: boolean; error?: MysteryServiceError }> => {
    if (!user?.id) {
      return { success: false, error: { code: 'AUTH_REQUIRED', message: 'Please sign in to vote' } };
    }

    const result = await mysteryService.voteOnAttempt(attemptId, user.id, voteType);
    
    if (result.error) {
      return { success: false, error: result.error };
    }

    await fetchMystery();
    return { success: true };
  }, [user?.id, fetchMystery]);

  const acceptSolution = useCallback(async (attemptId: string): Promise<{ success: boolean; error?: MysteryServiceError }> => {
    if (!user?.id || !mysteryId) {
      return { success: false, error: { code: 'AUTH_REQUIRED', message: 'Please sign in' } };
    }

    const result = await mysteryService.acceptSolution(mysteryId, attemptId, user.id);
    
    if (result.error) {
      return { success: false, error: result.error };
    }

    await fetchMystery();
    return { success: true };
  }, [user?.id, mysteryId, fetchMystery]);

  const closeMystery = useCallback(async (): Promise<{ success: boolean; error?: MysteryServiceError }> => {
    if (!user?.id || !mysteryId) {
      return { success: false, error: { code: 'AUTH_REQUIRED', message: 'Please sign in' } };
    }

    const result = await mysteryService.closeMystery(mysteryId, user.id);
    
    if (result.error) {
      return { success: false, error: result.error };
    }

    await fetchMystery();
    return { success: true };
  }, [user?.id, mysteryId, fetchMystery]);

  const isOwner = mystery?.user_id === user?.id;
  const hasUserAttempted = attempts.some(a => a.user_id === user?.id);

  return {
    mystery,
    attempts,
    userVotes,
    isLoading,
    error,
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
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (isMounted.current) setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (isMounted.current) setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const createMystery = useCallback(async (
    description: string,
    additionalClues?: string,
    originalSearchQuery?: string,
    aiSuggestions?: any
  ): Promise<{ data: Mystery | null; error: MysteryServiceError | null }> => {
    if (!user?.id) {
      return { data: null, error: { code: 'AUTH_REQUIRED', message: 'Please sign in to post a mystery' } };
    }

    if (isMounted.current) setIsSubmitting(true);
    
    try {
      const result = await mysteryService.createMystery(
        user.id,
        description,
        additionalClues,
        originalSearchQuery,
        aiSuggestions
      );
      return result;
    } finally {
      if (isMounted.current) setIsSubmitting(false);
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
  const [error, setError] = useState<MysteryServiceError | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (isMounted.current) setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (isMounted.current) setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) {
        if (isMounted.current) {
          setStats(null);
          setIsLoading(false);
        }
        return;
      }

      if (isMounted.current) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const result = await mysteryService.getDetectiveStats(user.id);
        
        if (!isMounted.current) return;
        
        if (result.error) {
          setError(result.error);
        } else {
          setStats(result.data);
        }
      } catch (err) {
        if (isMounted.current) {
          setError({ code: 'UNEXPECTED_ERROR', message: 'Failed to load stats' });
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };

    fetchStats();
  }, [user?.id]);

  const rankInfo = stats ? mysteryService.getDetectiveRankInfo(stats.detective_rank) : null;

  return {
    stats,
    rankInfo,
    isLoading,
    error,
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
  const [error, setError] = useState<MysteryServiceError | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    const fetchDetectives = async () => {
      if (isMounted.current) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const data = await mysteryService.getTopDetectives(limit);
        if (isMounted.current) {
          setDetectives(data);
        }
      } catch (err) {
        if (isMounted.current) {
          setError({ code: 'UNEXPECTED_ERROR', message: 'Failed to load leaderboard' });
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };

    fetchDetectives();
  }, [limit]);

  return { detectives, isLoading, error };
}

export function useUnsolvedCount() {
  const [count, setCount] = useState(0);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    const fetchCount = async () => {
      const unsolvedCount = await mysteryService.getUnsolvedCount();
      if (isMounted.current) {
        setCount(unsolvedCount);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 60000);
    return () => clearInterval(interval);
  }, []);

  return count;
}
