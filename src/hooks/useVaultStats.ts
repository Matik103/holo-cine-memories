import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { vaultService, VaultUserStats, VaultBadge, VaultTrending, VaultPrediction, VaultChampion, VaultActivity } from '@/services/vaultService';

export function useVaultStats() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<VaultUserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const fetchStats = useCallback(async () => {
    if (!user?.id) {
      setStats(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const userStats = await vaultService.getUserStats(user.id);
      setStats(userStats);
      setError(null);
    } catch (err) {
      setError('Failed to load vault stats');
      console.error('Error fetching vault stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const checkBadges = useCallback(async (): Promise<VaultBadge[]> => {
    if (!user?.id) return [];
    const newBadges = await vaultService.checkAndUnlockBadges(user.id);
    if (newBadges.length > 0) {
      await fetchStats();
    }
    return newBadges;
  }, [user?.id, fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
    checkBadges,
    isAuthenticated: !!user
  };
}

export function useVaultTrending(period: 'hour' | 'day' | 'week' = 'day') {
  const [trending, setTrending] = useState<VaultTrending[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let isInitialLoad = true;
    
    const fetchTrending = async () => {
      if (!mounted) return;
      if (isInitialLoad) {
        setIsLoading(true);
      }
      try {
        const data = await vaultService.getTrending(period, 10);
        if (mounted) {
          setTrending(data);
        }
      } catch (err) {
        console.error('Error fetching trending:', err);
      } finally {
        if (mounted && isInitialLoad) {
          setIsLoading(false);
          isInitialLoad = false;
        }
      }
    };

    fetchTrending();
    const interval = setInterval(fetchTrending, 5 * 60 * 1000);
    
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [period]);

  return { trending, isLoading };
}

export function useVaultHiddenGems() {
  const [gems, setGems] = useState<VaultTrending[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 2;
    
    const fetchGems = async () => {
      if (!mounted) return;
      setIsLoading(true);
      
      try {
        const data = await vaultService.getHiddenGems(10);
        if (mounted) {
          setGems(data);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching hidden gems:', err);
        // Retry on failure (handles race condition with auth)
        if (retryCount < maxRetries && mounted) {
          retryCount++;
          console.log(`Retrying hidden gems fetch (attempt ${retryCount + 1})...`);
          setTimeout(fetchGems, 1000 * retryCount);
        } else if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Small delay to let Supabase client initialize
    const timer = setTimeout(fetchGems, 100);
    
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  return { gems, isLoading };
}

export function useVaultPredictions() {
  const [user, setUser] = useState<any>(null);
  const [predictions, setPredictions] = useState<VaultPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const fetchPredictions = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await vaultService.getActivePredictions(user?.id);
      setPredictions(data);
    } catch (err) {
      console.error('Error fetching predictions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  const submitPrediction = useCallback(async (predictionId: string, option: string): Promise<boolean> => {
    if (!user?.id) {
      throw new Error('AUTH_REQUIRED');
    }
    const success = await vaultService.submitPrediction(user.id, predictionId, option);
    if (success) {
      await fetchPredictions();
    }
    return success;
  }, [user?.id, fetchPredictions]);

  return { predictions, isLoading, submitPrediction, refetch: fetchPredictions, isAuthenticated: !!user };
}

export function useVaultChampions() {
  const [champions, setChampions] = useState<VaultChampion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChampions = async () => {
      setIsLoading(true);
      try {
        const data = await vaultService.getChampions(5);
        setChampions(data);
      } catch (err) {
        console.error('Error fetching champions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChampions();
  }, []);

  return { champions, isLoading };
}

export function useVaultActivity() {
  const [activities, setActivities] = useState<VaultActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const data = await vaultService.getRecentActivity(20);
        setActivities(data);
      } catch (err) {
        console.error('Error fetching activity:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivity();
    const interval = setInterval(fetchActivity, 10000);
    return () => clearInterval(interval);
  }, []);

  return { activities, isLoading };
}

export function useVaultLivePulse() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      const pulseCount = await vaultService.getLivePulseCount();
      setCount(pulseCount);
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return count;
}

export function useVaultBadges() {
  const [badges, setBadges] = useState<VaultBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const data = await vaultService.getAllBadges();
        setBadges(data);
      } catch (err) {
        console.error('Error fetching badges:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBadges();
  }, []);

  return { badges, isLoading };
}
