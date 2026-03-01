import { supabase } from '@/integrations/supabase/client';
import { vaultService } from './vaultService';

export interface Mystery {
  id: string;
  user_id: string;
  description: string;
  additional_clues: string | null;
  original_search_query: string | null;
  ai_suggestions: any | null;
  status: 'unsolved' | 'pending_verification' | 'solved' | 'closed';
  solved_at: string | null;
  solved_by: string | null;
  solution_movie_title: string | null;
  solution_movie_year: number | null;
  solution_tmdb_id: number | null;
  solution_poster_url: string | null;
  view_count: number;
  attempt_count: number;
  difficulty: 'easy' | 'normal' | 'hard' | 'legendary';
  points_reward: number;
  created_at: string;
  updated_at: string;
  poster_name?: string;
}

export interface MysteryAttempt {
  id: string;
  mystery_id: string;
  user_id: string;
  movie_title: string;
  movie_year: number | null;
  tmdb_id: number | null;
  poster_url: string | null;
  explanation: string | null;
  upvotes: number;
  downvotes: number;
  is_accepted: boolean;
  accepted_at: string | null;
  created_at: string;
  solver_name?: string;
}

export interface DetectiveStats {
  mysteries_solved: number;
  mysteries_posted: number;
  detective_rank: 'rookie' | 'sleuth' | 'detective' | 'master_detective' | 'legend';
  solve_streak: number;
  longest_solve_streak: number;
}

export type MysteryFilter = 'unsolved' | 'solved' | 'my_mysteries' | 'my_solves' | 'all';
export type MysterySort = 'recent' | 'popular' | 'points' | 'oldest';

class MysteryService {
  async getMysteries(
    filter: MysteryFilter = 'unsolved',
    sort: MysterySort = 'recent',
    limit = 20,
    offset = 0,
    userId?: string
  ): Promise<Mystery[]> {
    let query = supabase
      .from('memory_mysteries')
      .select(`
        *,
        vault_user_stats!memory_mysteries_user_id_fkey(display_name)
      `);

    // Apply filters
    if (filter === 'unsolved') {
      query = query.eq('status', 'unsolved');
    } else if (filter === 'solved') {
      query = query.eq('status', 'solved');
    } else if (filter === 'my_mysteries' && userId) {
      query = query.eq('user_id', userId);
    } else if (filter === 'my_solves' && userId) {
      query = query.eq('solved_by', userId);
    }

    // Apply sorting
    if (sort === 'recent') {
      query = query.order('created_at', { ascending: false });
    } else if (sort === 'popular') {
      query = query.order('view_count', { ascending: false });
    } else if (sort === 'points') {
      query = query.order('points_reward', { ascending: false });
    } else if (sort === 'oldest') {
      query = query.order('created_at', { ascending: true });
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching mysteries:', error);
      return [];
    }

    return (data || []).map(m => ({
      id: m.id,
      user_id: m.user_id,
      description: m.description,
      additional_clues: m.additional_clues,
      original_search_query: m.original_search_query,
      ai_suggestions: m.ai_suggestions,
      status: m.status as Mystery['status'],
      solved_at: m.solved_at,
      solved_by: m.solved_by,
      solution_movie_title: m.solution_movie_title,
      solution_movie_year: m.solution_movie_year,
      solution_tmdb_id: m.solution_tmdb_id,
      solution_poster_url: m.solution_poster_url,
      view_count: m.view_count || 0,
      attempt_count: m.attempt_count || 0,
      difficulty: m.difficulty as Mystery['difficulty'],
      points_reward: m.points_reward || 25,
      created_at: m.created_at,
      updated_at: m.updated_at,
      poster_name: (m as any).vault_user_stats?.display_name || 'Anonymous'
    }));
  }

  async getMysteryById(mysteryId: string): Promise<Mystery | null> {
    const { data, error } = await supabase
      .from('memory_mysteries')
      .select(`
        *,
        vault_user_stats!memory_mysteries_user_id_fkey(display_name)
      `)
      .eq('id', mysteryId)
      .single();

    if (error || !data) {
      console.error('Error fetching mystery:', error);
      return null;
    }

    // Increment view count
    await supabase
      .from('memory_mysteries')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', mysteryId);

    return {
      id: data.id,
      user_id: data.user_id,
      description: data.description,
      additional_clues: data.additional_clues,
      original_search_query: data.original_search_query,
      ai_suggestions: data.ai_suggestions,
      status: data.status as Mystery['status'],
      solved_at: data.solved_at,
      solved_by: data.solved_by,
      solution_movie_title: data.solution_movie_title,
      solution_movie_year: data.solution_movie_year,
      solution_tmdb_id: data.solution_tmdb_id,
      solution_poster_url: data.solution_poster_url,
      view_count: (data.view_count || 0) + 1,
      attempt_count: data.attempt_count || 0,
      difficulty: data.difficulty as Mystery['difficulty'],
      points_reward: data.points_reward || 25,
      created_at: data.created_at,
      updated_at: data.updated_at,
      poster_name: (data as any).vault_user_stats?.display_name || 'Anonymous'
    };
  }

  async createMystery(
    userId: string,
    description: string,
    additionalClues?: string,
    originalSearchQuery?: string,
    aiSuggestions?: any
  ): Promise<Mystery | null> {
    const { data, error } = await supabase
      .from('memory_mysteries')
      .insert({
        user_id: userId,
        description,
        additional_clues: additionalClues || null,
        original_search_query: originalSearchQuery || null,
        ai_suggestions: aiSuggestions || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating mystery:', error);
      return null;
    }

    // Update user's mysteries_posted count
    await supabase.rpc('increment_mysteries_posted', { p_user_id: userId }).catch(() => {
      // Fallback if RPC doesn't exist
      supabase
        .from('vault_user_stats')
        .update({ 
          mysteries_posted: supabase.rpc('coalesce', { val: 'mysteries_posted', default_val: 0 }) 
        })
        .eq('user_id', userId);
    });

    // Add to activity feed
    const { data: profile } = await supabase
      .from('vault_user_stats')
      .select('display_name')
      .eq('user_id', userId)
      .single();

    await vaultService.addActivity({
      activity_type: 'mystery_posted' as any,
      display_name: profile?.display_name || 'Someone',
      movie_title: null,
      movie_year: null,
      badge_id: null
    });

    // Check for mystery poster badge
    await vaultService.checkAndUnlockBadges(userId);

    return {
      ...data,
      status: data.status as Mystery['status'],
      difficulty: data.difficulty as Mystery['difficulty'],
      view_count: 0,
      attempt_count: 0,
      points_reward: data.points_reward || 25
    };
  }

  async getAttempts(mysteryId: string): Promise<MysteryAttempt[]> {
    const { data, error } = await supabase
      .from('mystery_attempts')
      .select(`
        *,
        vault_user_stats!mystery_attempts_user_id_fkey(display_name)
      `)
      .eq('mystery_id', mysteryId)
      .order('upvotes', { ascending: false });

    if (error) {
      console.error('Error fetching attempts:', error);
      return [];
    }

    return (data || []).map(a => ({
      id: a.id,
      mystery_id: a.mystery_id,
      user_id: a.user_id,
      movie_title: a.movie_title,
      movie_year: a.movie_year,
      tmdb_id: a.tmdb_id,
      poster_url: a.poster_url,
      explanation: a.explanation,
      upvotes: a.upvotes || 0,
      downvotes: a.downvotes || 0,
      is_accepted: a.is_accepted || false,
      accepted_at: a.accepted_at,
      created_at: a.created_at,
      solver_name: (a as any).vault_user_stats?.display_name || 'Anonymous'
    }));
  }

  async submitAttempt(
    mysteryId: string,
    userId: string,
    movieTitle: string,
    movieYear?: number,
    tmdbId?: number,
    posterUrl?: string,
    explanation?: string
  ): Promise<MysteryAttempt | null> {
    // Check if user already submitted an attempt
    const { data: existing } = await supabase
      .from('mystery_attempts')
      .select('id')
      .eq('mystery_id', mysteryId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      console.error('User already submitted an attempt for this mystery');
      return null;
    }

    const { data, error } = await supabase
      .from('mystery_attempts')
      .insert({
        mystery_id: mysteryId,
        user_id: userId,
        movie_title: movieTitle,
        movie_year: movieYear || null,
        tmdb_id: tmdbId || null,
        poster_url: posterUrl || null,
        explanation: explanation || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error submitting attempt:', error);
      return null;
    }

    // Increment attempt count on mystery
    await supabase
      .from('memory_mysteries')
      .update({ 
        attempt_count: supabase.rpc('increment_attempt_count', { mystery_id: mysteryId }) 
      })
      .eq('id', mysteryId)
      .catch(() => {
        // Fallback: direct increment
        supabase.rpc('increment_mystery_attempts', { p_mystery_id: mysteryId });
      });

    return {
      ...data,
      upvotes: 0,
      downvotes: 0,
      is_accepted: false
    };
  }

  async voteOnAttempt(
    attemptId: string,
    userId: string,
    voteType: 'up' | 'down'
  ): Promise<boolean> {
    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('mystery_votes')
      .select('id, vote_type')
      .eq('attempt_id', attemptId)
      .eq('user_id', userId)
      .single();

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // Remove vote (toggle off)
        const { error } = await supabase
          .from('mystery_votes')
          .delete()
          .eq('id', existingVote.id);
        return !error;
      } else {
        // Change vote
        const { error: deleteError } = await supabase
          .from('mystery_votes')
          .delete()
          .eq('id', existingVote.id);
        
        if (deleteError) return false;

        const { error: insertError } = await supabase
          .from('mystery_votes')
          .insert({
            attempt_id: attemptId,
            user_id: userId,
            vote_type: voteType
          });
        return !insertError;
      }
    }

    // New vote
    const { error } = await supabase
      .from('mystery_votes')
      .insert({
        attempt_id: attemptId,
        user_id: userId,
        vote_type: voteType
      });

    return !error;
  }

  async getUserVotes(userId: string, attemptIds: string[]): Promise<Record<string, 'up' | 'down'>> {
    if (attemptIds.length === 0) return {};

    const { data } = await supabase
      .from('mystery_votes')
      .select('attempt_id, vote_type')
      .eq('user_id', userId)
      .in('attempt_id', attemptIds);

    const votes: Record<string, 'up' | 'down'> = {};
    (data || []).forEach(v => {
      votes[v.attempt_id] = v.vote_type as 'up' | 'down';
    });
    return votes;
  }

  async acceptSolution(
    mysteryId: string,
    attemptId: string,
    userId: string
  ): Promise<boolean> {
    // Use the database function for atomic operation
    const { data, error } = await supabase.rpc('accept_mystery_solution', {
      p_mystery_id: mysteryId,
      p_attempt_id: attemptId,
      p_user_id: userId
    });

    if (error) {
      console.error('Error accepting solution:', error);
      return false;
    }

    return data === true;
  }

  async closeMystery(mysteryId: string, userId: string): Promise<boolean> {
    // Only mystery owner can close
    const { data: mystery } = await supabase
      .from('memory_mysteries')
      .select('user_id')
      .eq('id', mysteryId)
      .single();

    if (!mystery || mystery.user_id !== userId) {
      return false;
    }

    const { error } = await supabase
      .from('memory_mysteries')
      .update({ status: 'closed', updated_at: new Date().toISOString() })
      .eq('id', mysteryId);

    return !error;
  }

  async getDetectiveStats(userId: string): Promise<DetectiveStats | null> {
    const { data, error } = await supabase
      .from('vault_user_stats')
      .select('mysteries_solved, mysteries_posted, detective_rank, solve_streak, longest_solve_streak')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return {
        mysteries_solved: 0,
        mysteries_posted: 0,
        detective_rank: 'rookie',
        solve_streak: 0,
        longest_solve_streak: 0
      };
    }

    return {
      mysteries_solved: data.mysteries_solved || 0,
      mysteries_posted: data.mysteries_posted || 0,
      detective_rank: (data.detective_rank || 'rookie') as DetectiveStats['detective_rank'],
      solve_streak: data.solve_streak || 0,
      longest_solve_streak: data.longest_solve_streak || 0
    };
  }

  async getTopDetectives(limit = 10): Promise<Array<{
    display_name: string;
    mysteries_solved: number;
    detective_rank: string;
    solve_streak: number;
  }>> {
    const { data } = await supabase
      .from('vault_user_stats')
      .select('display_name, mysteries_solved, detective_rank, solve_streak')
      .gt('mysteries_solved', 0)
      .order('mysteries_solved', { ascending: false })
      .limit(limit);

    return (data || []).map(d => ({
      display_name: d.display_name || 'Anonymous',
      mysteries_solved: d.mysteries_solved || 0,
      detective_rank: d.detective_rank || 'rookie',
      solve_streak: d.solve_streak || 0
    }));
  }

  async getUnsolvedCount(): Promise<number> {
    const { count } = await supabase
      .from('memory_mysteries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'unsolved');

    return count || 0;
  }

  getDetectiveRankInfo(rank: DetectiveStats['detective_rank']): {
    label: string;
    icon: string;
    color: string;
    nextRank: string | null;
    solvesNeeded: number;
  } {
    const ranks = {
      rookie: { label: 'Rookie', icon: '🔰', color: 'text-gray-400', nextRank: 'sleuth', solvesNeeded: 5 },
      sleuth: { label: 'Sleuth', icon: '🕵️', color: 'text-green-400', nextRank: 'detective', solvesNeeded: 20 },
      detective: { label: 'Detective', icon: '🔎', color: 'text-blue-400', nextRank: 'master_detective', solvesNeeded: 50 },
      master_detective: { label: 'Master Detective', icon: '🎖️', color: 'text-purple-400', nextRank: 'legend', solvesNeeded: 100 },
      legend: { label: 'Legend', icon: '🏆', color: 'text-yellow-400', nextRank: null, solvesNeeded: 0 }
    };
    return ranks[rank] || ranks.rookie;
  }

  getDifficultyInfo(difficulty: Mystery['difficulty']): {
    label: string;
    color: string;
    bgColor: string;
  } {
    const difficulties = {
      easy: { label: 'Easy', color: 'text-green-400', bgColor: 'bg-green-500/20' },
      normal: { label: 'Normal', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
      hard: { label: 'Hard', color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
      legendary: { label: 'Legendary', color: 'text-purple-400', bgColor: 'bg-purple-500/20' }
    };
    return difficulties[difficulty] || difficulties.normal;
  }

  formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  }
}

export const mysteryService = new MysteryService();
