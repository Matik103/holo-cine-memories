import { supabase } from '@/integrations/supabase/client';

export interface VaultTrending {
  movie_title: string;
  movie_year: number | null;
  poster_url: string | null;
  recall_count: number;
  is_hidden_gem: boolean;
  genres: string[] | null;
  tmdb_id?: number;
}

export interface VaultBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  points_value: number;
  unlock_condition: {
    type: string;
    threshold?: number;
    start_hour?: number;
    end_hour?: number;
  };
  unlocked_at?: string;
}

export interface VaultUserStats {
  user_id: string;
  display_name: string | null;
  vault_score: number;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  predictions_correct: number;
  predictions_total: number;
  prediction_streak: number;
  badges: VaultBadge[];
  hidden_gems_rated: number;
  genres_explored: string[];
  rank_percentile: number | null;
  total_searches: number;
}

export interface VaultPrediction {
  id: string;
  prediction_type: string;
  title: string;
  description: string | null;
  options: { id: string; label: string; icon?: string }[];
  correct_answer: string | null;
  points_reward: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  is_resolved: boolean;
  user_selection?: string;
  total_votes?: number;
  vote_distribution?: Record<string, number>;
}

export interface VaultActivity {
  id: string;
  activity_type: 'search' | 'favorite' | 'rating' | 'badge' | 'prediction' | 'mystery_posted' | 'mystery_solved';
  movie_title: string | null;
  movie_year: number | null;
  display_name: string | null;
  badge_id: string | null;
  created_at: string;
}

export interface VaultChampion {
  display_name: string;
  vault_score: number;
  current_streak: number;
  badges: VaultBadge[];
  rank_percentile: number | null;
}

interface TMDBTrendingMovie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  genre_ids: number[];
  vote_average: number;
}

const GENRE_MAP: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
  53: 'Thriller', 10752: 'War', 37: 'Western'
};

class VaultService {
  private livePulseCount = 0;
  private lastPulseUpdate = 0;

  async getTrending(period: 'hour' | 'day' | 'week' = 'day', limit = 10): Promise<VaultTrending[]> {
    const { data: localTrending } = await supabase
      .from('vault_trending')
      .select('*')
      .order(period === 'hour' ? 'recall_count_hour' : period === 'day' ? 'recall_count_day' : 'recall_count_week', { ascending: false })
      .limit(limit);

    return (localTrending || []).map(t => ({
      movie_title: t.movie_title,
      movie_year: t.movie_year,
      poster_url: t.poster_url,
      recall_count: period === 'hour' ? t.recall_count_hour : period === 'day' ? t.recall_count_day : t.recall_count_week,
      is_hidden_gem: t.is_hidden_gem || false,
      genres: t.genres,
      tmdb_id: t.tmdb_id || undefined
    }));
  }

  async getHiddenGems(limit = 10): Promise<VaultTrending[]> {
    // Try TMDB hidden gems first
    const tmdbGems = await this.getTMDBHiddenGems();
    
    if (tmdbGems.length >= limit) {
      return tmdbGems.slice(0, limit);
    }

    // Fallback to local data
    const { data } = await supabase
      .from('vault_trending')
      .select('*')
      .eq('is_hidden_gem', true)
      .order('recall_count_total', { ascending: true })
      .limit(limit - tmdbGems.length);

    const localGems = (data || []).map(t => ({
      movie_title: t.movie_title,
      movie_year: t.movie_year,
      poster_url: t.poster_url,
      recall_count: t.recall_count_total || 0,
      is_hidden_gem: true,
      genres: t.genres
    }));

    // Combine and deduplicate
    const combined = [...tmdbGems, ...localGems];
    const seen = new Set<string>();
    return combined.filter(m => {
      const key = `${m.movie_title}_${m.movie_year}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, limit);
  }

  private async getTMDBHiddenGems(): Promise<VaultTrending[]> {
    try {
      const { data, error } = await supabase.functions.invoke('tmdb-hidden-gems');
      if (error || !data?.results) return [];
      
      return data.results.map((movie: TMDBTrendingMovie) => ({
        movie_title: movie.title,
        movie_year: movie.release_date ? parseInt(movie.release_date.split('-')[0]) : null,
        poster_url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        recall_count: Math.round(movie.vote_average * 10),
        is_hidden_gem: true,
        genres: movie.genre_ids?.map(id => GENRE_MAP[id]).filter(Boolean) || [],
        tmdb_id: movie.id
      }));
    } catch {
      return [];
    }
  }

  async getUserStats(userId: string): Promise<VaultUserStats | null> {
    const { data } = await supabase
      .from('vault_user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!data) {
      const newStats = await this.initializeUserStats(userId);
      return newStats;
    }

    return {
      user_id: data.user_id,
      display_name: data.display_name,
      vault_score: data.vault_score || 0,
      current_streak: data.current_streak || 0,
      longest_streak: data.longest_streak || 0,
      last_active_date: data.last_active_date,
      predictions_correct: data.predictions_correct || 0,
      predictions_total: data.predictions_total || 0,
      prediction_streak: data.prediction_streak || 0,
      badges: (data.badges as VaultBadge[]) || [],
      hidden_gems_rated: data.hidden_gems_rated || 0,
      genres_explored: data.genres_explored || [],
      rank_percentile: data.rank_percentile,
      total_searches: data.total_searches || 0
    };
  }

  private async initializeUserStats(userId: string): Promise<VaultUserStats> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', userId)
      .single();

    const { data: searches } = await supabase
      .from('movie_searches')
      .select('id')
      .eq('user_id', userId);

    const totalSearches = searches?.length || 0;
    const initialScore = totalSearches * 5;

    const newStats: Partial<VaultUserStats> = {
      user_id: userId,
      display_name: profile?.display_name || null,
      vault_score: initialScore,
      current_streak: 0,
      longest_streak: 0,
      predictions_correct: 0,
      predictions_total: 0,
      prediction_streak: 0,
      badges: [],
      hidden_gems_rated: 0,
      genres_explored: [],
      rank_percentile: null,
      total_searches: totalSearches
    };

    await supabase.from('vault_user_stats').upsert({
      user_id: userId,
      display_name: newStats.display_name,
      vault_score: newStats.vault_score,
      current_streak: newStats.current_streak,
      longest_streak: newStats.longest_streak,
      predictions_correct: newStats.predictions_correct,
      predictions_total: newStats.predictions_total,
      prediction_streak: newStats.prediction_streak,
      badges: newStats.badges,
      hidden_gems_rated: newStats.hidden_gems_rated,
      genres_explored: newStats.genres_explored,
      total_searches: newStats.total_searches
    });

    return newStats as VaultUserStats;
  }

  async getAllBadges(): Promise<VaultBadge[]> {
    const { data } = await supabase
      .from('vault_badges')
      .select('*')
      .order('points_value', { ascending: true });

    return (data || []).map(b => ({
      id: b.id,
      name: b.name,
      description: b.description,
      icon: b.icon,
      rarity: b.rarity as VaultBadge['rarity'],
      points_value: b.points_value || 10,
      unlock_condition: b.unlock_condition as VaultBadge['unlock_condition']
    }));
  }

  async checkAndUnlockBadges(userId: string): Promise<VaultBadge[]> {
    const stats = await this.getUserStats(userId);
    if (!stats) return [];

    const allBadges = await this.getAllBadges();
    const unlockedBadgeIds = new Set(stats.badges.map(b => b.id));
    const newlyUnlocked: VaultBadge[] = [];

    for (const badge of allBadges) {
      if (unlockedBadgeIds.has(badge.id)) continue;

      const shouldUnlock = await this.checkBadgeCondition(badge, stats, userId);
      if (shouldUnlock) {
        badge.unlocked_at = new Date().toISOString();
        newlyUnlocked.push(badge);
      }
    }

    if (newlyUnlocked.length > 0) {
      const updatedBadges = [...stats.badges, ...newlyUnlocked];
      const pointsEarned = newlyUnlocked.reduce((sum, b) => sum + b.points_value, 0);

      await supabase
        .from('vault_user_stats')
        .update({
          badges: updatedBadges,
          vault_score: stats.vault_score + pointsEarned,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      for (const badge of newlyUnlocked) {
        await this.addActivity({
          activity_type: 'badge',
          display_name: stats.display_name || 'Someone',
          badge_id: badge.id
        });
      }
    }

    return newlyUnlocked;
  }

  private async checkBadgeCondition(badge: VaultBadge, stats: VaultUserStats, userId: string): Promise<boolean> {
    const condition = badge.unlock_condition;

    switch (condition.type) {
      case 'search_count':
        return stats.total_searches >= (condition.threshold || 0);

      case 'streak':
        return stats.current_streak >= (condition.threshold || 0);

      case 'genre_count':
        return stats.genres_explored.length >= (condition.threshold || 0);

      case 'prediction_streak':
        return stats.prediction_streak >= (condition.threshold || 0);

      case 'hidden_gem_ratings':
        return stats.hidden_gems_rated >= (condition.threshold || 0);

      case 'percentile':
        return stats.rank_percentile !== null && stats.rank_percentile <= (condition.threshold || 0);

      case 'time_range': {
        const { data: recentSearches } = await supabase
          .from('user_query_analytics')
          .select('created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (!recentSearches) return false;
        
        return recentSearches.some(s => {
          const hour = new Date(s.created_at).getHours();
          return hour >= (condition.start_hour || 0) && hour < (condition.end_hour || 24);
        });
      }

      case 'early_discovery': {
        const { data, error } = await supabase.rpc('check_early_discovery', {
          p_user_id: userId,
          p_movie_title: ''
        });
        return !error && data === true;
      }

      default:
        return false;
    }
  }

  async getActivePredictions(userId?: string): Promise<VaultPrediction[]> {
    const { data } = await supabase
      .from('vault_predictions')
      .select('*')
      .eq('is_active', true)
      .gte('ends_at', new Date().toISOString())
      .order('ends_at', { ascending: true });

    const predictions = (data || []).map(p => ({
      id: p.id,
      prediction_type: p.prediction_type,
      title: p.title,
      description: p.description,
      options: p.options as VaultPrediction['options'],
      correct_answer: p.correct_answer,
      points_reward: p.points_reward || 50,
      starts_at: p.starts_at,
      ends_at: p.ends_at,
      is_active: p.is_active || false,
      is_resolved: p.is_resolved || false,
      total_votes: p.total_votes || 0,
      vote_distribution: p.vote_distribution || {}
    }));

    if (userId && predictions.length > 0) {
      const { data: userPredictions } = await supabase
        .from('vault_user_predictions')
        .select('prediction_id, selected_option')
        .eq('user_id', userId)
        .in('prediction_id', predictions.map(p => p.id));

      const userSelections = new Map(
        (userPredictions || []).map(up => [up.prediction_id, up.selected_option])
      );

      predictions.forEach(p => {
        p.user_selection = userSelections.get(p.id);
      });
    }

    return predictions;
  }

  async getResolvedPredictions(userId?: string, limit = 5): Promise<VaultPrediction[]> {
    const { data } = await supabase
      .from('vault_predictions')
      .select('*')
      .eq('is_resolved', true)
      .order('ends_at', { ascending: false })
      .limit(limit);

    const predictions = (data || []).map(p => ({
      id: p.id,
      prediction_type: p.prediction_type,
      title: p.title,
      description: p.description,
      options: p.options as VaultPrediction['options'],
      correct_answer: p.correct_answer,
      points_reward: p.points_reward || 50,
      starts_at: p.starts_at,
      ends_at: p.ends_at,
      is_active: false,
      is_resolved: true
    }));

    if (userId && predictions.length > 0) {
      const { data: userPredictions } = await supabase
        .from('vault_user_predictions')
        .select('prediction_id, selected_option, is_correct, points_earned')
        .eq('user_id', userId)
        .in('prediction_id', predictions.map(p => p.id));

      const userSelections = new Map(
        (userPredictions || []).map(up => [up.prediction_id, { 
          selected_option: up.selected_option,
          is_correct: up.is_correct,
          points_earned: up.points_earned
        }])
      );

      predictions.forEach(p => {
        const userPred = userSelections.get(p.id);
        if (userPred) {
          p.user_selection = userPred.selected_option;
          (p as any).is_correct = userPred.is_correct;
          (p as any).points_earned = userPred.points_earned;
        }
      });
    }

    return predictions;
  }

  async submitPrediction(userId: string, predictionId: string, selectedOption: string): Promise<boolean> {
    const { error } = await supabase
      .from('vault_user_predictions')
      .upsert({
        user_id: userId,
        prediction_id: predictionId,
        selected_option: selectedOption
      });

    if (!error) {
      const { data: stats } = await supabase
        .from('vault_user_stats')
        .select('predictions_total')
        .eq('user_id', userId)
        .single();
        
      if (stats) {
        await supabase
          .from('vault_user_stats')
          .update({
            predictions_total: (stats.predictions_total || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
      }
    }

    return !error;
  }

  async getChampions(limit = 5): Promise<VaultChampion[]> {
    const { data } = await supabase
      .from('vault_user_stats')
      .select('display_name, vault_score, current_streak, badges, rank_percentile')
      .gt('vault_score', 0)
      .order('vault_score', { ascending: false })
      .limit(limit);

    return (data || []).map(c => ({
      display_name: c.display_name || 'Anonymous',
      vault_score: c.vault_score || 0,
      current_streak: c.current_streak || 0,
      badges: (c.badges as VaultBadge[]) || [],
      rank_percentile: c.rank_percentile
    }));
  }

  async getRecentActivity(limit = 20): Promise<VaultActivity[]> {
    const { data } = await supabase
      .from('vault_activity_feed')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    return (data || []).map(a => ({
      id: a.id,
      activity_type: a.activity_type as VaultActivity['activity_type'],
      movie_title: a.movie_title,
      movie_year: a.movie_year,
      display_name: a.display_name,
      badge_id: a.badge_id,
      created_at: a.created_at
    }));
  }

  async addActivity(activity: Omit<VaultActivity, 'id' | 'created_at'>): Promise<void> {
    await supabase.from('vault_activity_feed').insert({
      activity_type: activity.activity_type,
      movie_title: activity.movie_title || null,
      movie_year: activity.movie_year || null,
      display_name: activity.display_name || 'Someone',
      badge_id: activity.badge_id || null
    });
  }

  async recordSearch(userId: string, movieTitle: string, movieYear?: number, genres?: string[]): Promise<void> {
    const { data: existing } = await supabase
      .from('vault_trending')
      .select('recall_count_hour, recall_count_day, recall_count_week, recall_count_total, is_hidden_gem')
      .eq('movie_title', movieTitle)
      .maybeSingle();

    const isNewHiddenGem = !existing || (existing.recall_count_total < 50 && existing.recall_count_total > 5);

    if (existing) {
      await supabase
        .from('vault_trending')
        .update({
          recall_count_hour: (existing.recall_count_hour || 0) + 1,
          recall_count_day: (existing.recall_count_day || 0) + 1,
          recall_count_week: (existing.recall_count_week || 0) + 1,
          recall_count_total: (existing.recall_count_total || 0) + 1,
          is_hidden_gem: isNewHiddenGem,
          updated_at: new Date().toISOString()
        })
        .eq('movie_title', movieTitle);
    } else {
      await supabase.from('vault_trending').insert({
        movie_title: movieTitle,
        movie_year: movieYear,
        recall_count_hour: 1,
        recall_count_day: 1,
        recall_count_week: 1,
        recall_count_total: 1,
        is_hidden_gem: true,
        genres: genres
      });
    }

    const { data: stats } = await supabase
      .from('vault_user_stats')
      .select('total_searches, vault_score, genres_explored')
      .eq('user_id', userId)
      .maybeSingle();

    if (stats) {
      const newGenres = [...new Set([...(stats.genres_explored || []), ...(genres || [])])];
      await supabase
        .from('vault_user_stats')
        .update({
          total_searches: (stats.total_searches || 0) + 1,
          vault_score: (stats.vault_score || 0) + 5,
          genres_explored: newGenres,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
    }

    await supabase.rpc('update_user_streak', { p_user_id: userId });

    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', userId)
      .single();

    await this.addActivity({
      activity_type: 'search',
      movie_title: movieTitle,
      movie_year: movieYear,
      display_name: profile?.display_name || 'Someone'
    });

    await this.checkAndUnlockBadges(userId);
  }

  async getLivePulseCount(): Promise<number> {
    const now = Date.now();
    if (now - this.lastPulseUpdate < 30000) {
      return this.livePulseCount;
    }

    const fiveMinutesAgo = new Date(now - 5 * 60 * 1000).toISOString();
    
    const { count } = await supabase
      .from('vault_activity_feed')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', fiveMinutesAgo);

    const baseCount = Math.floor(Math.random() * 20) + 15;
    this.livePulseCount = (count || 0) + baseCount;
    this.lastPulseUpdate = now;

    return this.livePulseCount;
  }

  async updateDisplayName(userId: string, displayName: string): Promise<void> {
    await supabase
      .from('vault_user_stats')
      .update({ display_name: displayName, updated_at: new Date().toISOString() })
      .eq('user_id', userId);
  }

  async recordHiddenGemRating(userId: string, movieTitle: string): Promise<void> {
    const { data: movie } = await supabase
      .from('vault_trending')
      .select('is_hidden_gem')
      .eq('movie_title', movieTitle)
      .single();

    if (movie?.is_hidden_gem) {
      const { data: stats } = await supabase
        .from('vault_user_stats')
        .select('hidden_gems_rated')
        .eq('user_id', userId)
        .single();

      if (stats) {
        await supabase
          .from('vault_user_stats')
          .update({
            hidden_gems_rated: (stats.hidden_gems_rated || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        await this.checkAndUnlockBadges(userId);
      }
    }
  }

  getRarityColor(rarity: VaultBadge['rarity']): string {
    const colors = {
      common: 'text-gray-400',
      uncommon: 'text-green-400',
      rare: 'text-blue-400',
      epic: 'text-purple-400',
      legendary: 'text-yellow-400'
    };
    return colors[rarity] || colors.common;
  }

  getRarityBgColor(rarity: VaultBadge['rarity']): string {
    const colors = {
      common: 'bg-gray-500/20',
      uncommon: 'bg-green-500/20',
      rare: 'bg-blue-500/20',
      epic: 'bg-purple-500/20',
      legendary: 'bg-yellow-500/20'
    };
    return colors[rarity] || colors.common;
  }
}

export const vaultService = new VaultService();
