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

export interface MysteryServiceError {
  code: string;
  message: string;
}

export interface MysteryResult<T> {
  data: T | null;
  error: MysteryServiceError | null;
}

const MAX_LIMIT = 50;
const MIN_DESCRIPTION_LENGTH = 20;
const MAX_DESCRIPTION_LENGTH = 5000;
const MAX_CLUES_LENGTH = 2000;
const MAX_TITLE_LENGTH = 500;
const MAX_EXPLANATION_LENGTH = 2000;
const MIN_MOVIE_YEAR = 1888;

function validateUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

function validateYear(year: number | undefined | null): boolean {
  if (year === undefined || year === null) return true;
  const currentYear = new Date().getFullYear();
  return year >= MIN_MOVIE_YEAR && year <= currentYear + 5;
}

function sanitizeString(str: string | undefined | null, maxLength: number): string | null {
  if (!str) return null;
  return str.trim().slice(0, maxLength);
}

class MysteryService {
  async getMysteries(
    filter: MysteryFilter = 'unsolved',
    sort: MysterySort = 'recent',
    limit = 20,
    offset = 0,
    userId?: string
  ): Promise<MysteryResult<Mystery[]>> {
    // Validate and cap limit
    const safeLimit = Math.min(Math.max(1, limit), MAX_LIMIT);
    const safeOffset = Math.max(0, offset);

    try {
      let query = supabase
        .from('memory_mysteries')
        .select('*');

      // Apply filters
      if (filter === 'unsolved') {
        query = query.eq('status', 'unsolved');
      } else if (filter === 'solved') {
        query = query.eq('status', 'solved');
      } else if (filter === 'my_mysteries' && userId) {
        if (!validateUUID(userId)) {
          return { data: null, error: { code: 'INVALID_USER_ID', message: 'Invalid user ID format' } };
        }
        query = query.eq('user_id', userId);
      } else if (filter === 'my_solves' && userId) {
        if (!validateUUID(userId)) {
          return { data: null, error: { code: 'INVALID_USER_ID', message: 'Invalid user ID format' } };
        }
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

      query = query.range(safeOffset, safeOffset + safeLimit - 1);

      const { data, error } = await query;

      if (error) {
        return { data: null, error: { code: 'FETCH_ERROR', message: error.message } };
      }

      // Fetch poster names separately to avoid complex joins
      const mysteries = await this.enrichMysteriesWithPosterNames(data || []);

      return { data: mysteries, error: null };
    } catch (err) {
      console.error('Unexpected error fetching mysteries:', err);
      return { data: null, error: { code: 'UNEXPECTED_ERROR', message: 'An unexpected error occurred' } };
    }
  }

  private async enrichMysteriesWithPosterNames(mysteries: any[]): Promise<Mystery[]> {
    if (mysteries.length === 0) return [];

    const userIds = [...new Set(mysteries.map(m => m.user_id))];
    const { data: stats } = await supabase
      .from('vault_user_stats')
      .select('user_id, display_name')
      .in('user_id', userIds);

    const nameMap = new Map((stats || []).map(s => [s.user_id, s.display_name]));

    return mysteries.map(m => ({
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
      poster_name: nameMap.get(m.user_id) || 'Anonymous'
    }));
  }

  async getMysteryById(mysteryId: string): Promise<MysteryResult<Mystery>> {
    if (!validateUUID(mysteryId)) {
      return { data: null, error: { code: 'INVALID_ID', message: 'Invalid mystery ID format' } };
    }

    try {
      const { data, error } = await supabase
        .from('memory_mysteries')
        .select('*')
        .eq('id', mysteryId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { data: null, error: { code: 'NOT_FOUND', message: 'Mystery not found' } };
        }
        return { data: null, error: { code: 'FETCH_ERROR', message: error.message } };
      }

      // Atomically increment view count using database function
      try {
        await supabase.rpc('increment_mystery_views', { p_mystery_id: mysteryId });
      } catch {
        // View count increment failed silently
      }

      // Get poster name
      const { data: stats } = await supabase
        .from('vault_user_stats')
        .select('display_name')
        .eq('user_id', data.user_id)
        .single();

      const mystery: Mystery = {
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
        poster_name: stats?.display_name || 'Anonymous'
      };

      return { data: mystery, error: null };
    } catch {
      return { data: null, error: { code: 'UNEXPECTED_ERROR', message: 'An unexpected error occurred' } };
    }
  }

  async createMystery(
    userId: string,
    description: string,
    additionalClues?: string,
    originalSearchQuery?: string,
    aiSuggestions?: any
  ): Promise<MysteryResult<Mystery>> {
    // Validate inputs
    if (!validateUUID(userId)) {
      return { data: null, error: { code: 'INVALID_USER_ID', message: 'Invalid user ID format' } };
    }

    const sanitizedDescription = sanitizeString(description, MAX_DESCRIPTION_LENGTH);
    if (!sanitizedDescription || sanitizedDescription.length < MIN_DESCRIPTION_LENGTH) {
      return { 
        data: null, 
        error: { 
          code: 'INVALID_DESCRIPTION', 
          message: `Description must be between ${MIN_DESCRIPTION_LENGTH} and ${MAX_DESCRIPTION_LENGTH} characters` 
        } 
      };
    }

    const sanitizedClues = sanitizeString(additionalClues, MAX_CLUES_LENGTH);
    const sanitizedQuery = sanitizeString(originalSearchQuery, MAX_DESCRIPTION_LENGTH);

    // Sanitize aiSuggestions - only allow specific structure
    const sanitizedAiSuggestions = aiSuggestions && typeof aiSuggestions === 'object' 
      ? { 
          suggestedTitle: typeof aiSuggestions.suggestedTitle === 'string' ? aiSuggestions.suggestedTitle.slice(0, 200) : null,
          confidence: typeof aiSuggestions.confidence === 'number' ? aiSuggestions.confidence : null
        }
      : null;

    try {
      const { data, error } = await supabase
        .from('memory_mysteries')
        .insert({
          user_id: userId,
          description: sanitizedDescription,
          additional_clues: sanitizedClues,
          original_search_query: sanitizedQuery,
          ai_suggestions: sanitizedAiSuggestions
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: { code: 'CREATE_ERROR', message: error.message } };
      }

      // Increment mysteries_posted using database function
      try {
        await supabase.rpc('increment_mysteries_posted', { p_user_id: userId });
      } catch {
        // mysteries_posted increment failed silently
      }

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

      const mystery: Mystery = {
        ...data,
        status: data.status as Mystery['status'],
        difficulty: data.difficulty as Mystery['difficulty'],
        view_count: 0,
        attempt_count: 0,
        points_reward: data.points_reward || 25,
        poster_name: profile?.display_name || 'Anonymous'
      };

      return { data: mystery, error: null };
    } catch {
      return { data: null, error: { code: 'UNEXPECTED_ERROR', message: 'An unexpected error occurred' } };
    }
  }

  async getAttempts(mysteryId: string): Promise<MysteryResult<MysteryAttempt[]>> {
    if (!validateUUID(mysteryId)) {
      return { data: null, error: { code: 'INVALID_ID', message: 'Invalid mystery ID format' } };
    }

    try {
      const { data, error } = await supabase
        .from('mystery_attempts')
        .select('*')
        .eq('mystery_id', mysteryId)
        .order('upvotes', { ascending: false });

      if (error) {
        return { data: null, error: { code: 'FETCH_ERROR', message: error.message } };
      }

      // Get solver names
      const userIds = [...new Set((data || []).map(a => a.user_id))];
      const { data: stats } = await supabase
        .from('vault_user_stats')
        .select('user_id, display_name')
        .in('user_id', userIds);

      const nameMap = new Map((stats || []).map(s => [s.user_id, s.display_name]));

      const attempts: MysteryAttempt[] = (data || []).map(a => ({
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
        solver_name: nameMap.get(a.user_id) || 'Anonymous'
      }));

      return { data: attempts, error: null };
    } catch {
      return { data: null, error: { code: 'UNEXPECTED_ERROR', message: 'An unexpected error occurred' } };
    }
  }

  async submitAttempt(
    mysteryId: string,
    userId: string,
    movieTitle: string,
    movieYear?: number,
    tmdbId?: number,
    posterUrl?: string,
    explanation?: string
  ): Promise<MysteryResult<MysteryAttempt>> {
    // Validate inputs
    if (!validateUUID(mysteryId)) {
      return { data: null, error: { code: 'INVALID_MYSTERY_ID', message: 'Invalid mystery ID format' } };
    }
    if (!validateUUID(userId)) {
      return { data: null, error: { code: 'INVALID_USER_ID', message: 'Invalid user ID format' } };
    }

    const sanitizedTitle = sanitizeString(movieTitle, MAX_TITLE_LENGTH);
    if (!sanitizedTitle) {
      return { data: null, error: { code: 'INVALID_TITLE', message: 'Movie title is required' } };
    }

    if (!validateYear(movieYear)) {
      return { data: null, error: { code: 'INVALID_YEAR', message: `Year must be between ${MIN_MOVIE_YEAR} and ${new Date().getFullYear() + 5}` } };
    }

    const sanitizedExplanation = sanitizeString(explanation, MAX_EXPLANATION_LENGTH);
    const sanitizedPosterUrl = posterUrl && posterUrl.startsWith('http') ? posterUrl.slice(0, 500) : null;

    try {
      // Check if mystery exists and is unsolved
      const { data: mystery, error: mysteryError } = await supabase
        .from('memory_mysteries')
        .select('id, user_id, status')
        .eq('id', mysteryId)
        .single();

      if (mysteryError || !mystery) {
        return { data: null, error: { code: 'MYSTERY_NOT_FOUND', message: 'Mystery not found' } };
      }

      if (mystery.status !== 'unsolved') {
        return { data: null, error: { code: 'MYSTERY_CLOSED', message: 'This mystery is no longer accepting solutions' } };
      }

      if (mystery.user_id === userId) {
        return { data: null, error: { code: 'SELF_SOLVE', message: 'You cannot solve your own mystery' } };
      }

      const { data, error } = await supabase
        .from('mystery_attempts')
        .insert({
          mystery_id: mysteryId,
          user_id: userId,
          movie_title: sanitizedTitle,
          movie_year: movieYear || null,
          tmdb_id: tmdbId || null,
          poster_url: sanitizedPosterUrl,
          explanation: sanitizedExplanation
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique violation
          return { data: null, error: { code: 'ALREADY_ATTEMPTED', message: 'You have already submitted a solution for this mystery' } };
        }
        return { data: null, error: { code: 'SUBMIT_ERROR', message: error.message } };
      }

      // Atomically increment attempt count
      try {
        await supabase.rpc('increment_mystery_attempts', { p_mystery_id: mysteryId });
      } catch {
        // Attempt count increment failed silently
      }

      const attempt: MysteryAttempt = {
        ...data,
        upvotes: 0,
        downvotes: 0,
        is_accepted: false,
        solver_name: 'You'
      };

      return { data: attempt, error: null };
    } catch {
      return { data: null, error: { code: 'UNEXPECTED_ERROR', message: 'An unexpected error occurred' } };
    }
  }

  async voteOnAttempt(
    attemptId: string,
    userId: string,
    voteType: 'up' | 'down'
  ): Promise<MysteryResult<boolean>> {
    if (!validateUUID(attemptId)) {
      return { data: null, error: { code: 'INVALID_ATTEMPT_ID', message: 'Invalid attempt ID format' } };
    }
    if (!validateUUID(userId)) {
      return { data: null, error: { code: 'INVALID_USER_ID', message: 'Invalid user ID format' } };
    }

    try {
      // Check if attempt exists and user is not the author
      const { data: attempt, error: attemptError } = await supabase
        .from('mystery_attempts')
        .select('id, user_id, mystery_id')
        .eq('id', attemptId)
        .single();

      if (attemptError || !attempt) {
        return { data: null, error: { code: 'ATTEMPT_NOT_FOUND', message: 'Attempt not found' } };
      }

      if (attempt.user_id === userId) {
        return { data: null, error: { code: 'SELF_VOTE', message: 'You cannot vote on your own solution' } };
      }

      // Check if mystery is still open
      const { data: mystery } = await supabase
        .from('memory_mysteries')
        .select('status')
        .eq('id', attempt.mystery_id)
        .single();

      if (mystery?.status !== 'unsolved') {
        return { data: null, error: { code: 'MYSTERY_CLOSED', message: 'Voting is closed for this mystery' } };
      }

      // Check existing vote
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
          
          if (error) {
            return { data: null, error: { code: 'VOTE_ERROR', message: error.message } };
          }
          return { data: true, error: null };
        } else {
          // Change vote - delete and insert in sequence
          const { error: deleteError } = await supabase
            .from('mystery_votes')
            .delete()
            .eq('id', existingVote.id);
          
          if (deleteError) {
            return { data: null, error: { code: 'VOTE_ERROR', message: deleteError.message } };
          }

          const { error: insertError } = await supabase
            .from('mystery_votes')
            .insert({
              attempt_id: attemptId,
              user_id: userId,
              vote_type: voteType
            });

          if (insertError) {
            return { data: null, error: { code: 'VOTE_ERROR', message: insertError.message } };
          }
          return { data: true, error: null };
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

      if (error) {
        return { data: null, error: { code: 'VOTE_ERROR', message: error.message } };
      }

      return { data: true, error: null };
    } catch {
      return { data: null, error: { code: 'UNEXPECTED_ERROR', message: 'An unexpected error occurred' } };
    }
  }

  async getUserVotes(userId: string, attemptIds: string[]): Promise<Record<string, 'up' | 'down'>> {
    if (attemptIds.length === 0 || !validateUUID(userId)) return {};

    // Batch in chunks of 50 to avoid large IN clauses
    const chunks = [];
    for (let i = 0; i < attemptIds.length; i += 50) {
      chunks.push(attemptIds.slice(i, i + 50));
    }

    const votes: Record<string, 'up' | 'down'> = {};

    for (const chunk of chunks) {
      const { data } = await supabase
        .from('mystery_votes')
        .select('attempt_id, vote_type')
        .eq('user_id', userId)
        .in('attempt_id', chunk);

      (data || []).forEach(v => {
        votes[v.attempt_id] = v.vote_type as 'up' | 'down';
      });
    }

    return votes;
  }

  async acceptSolution(
    mysteryId: string,
    attemptId: string,
    userId: string
  ): Promise<MysteryResult<boolean>> {
    if (!validateUUID(mysteryId) || !validateUUID(attemptId) || !validateUUID(userId)) {
      return { data: null, error: { code: 'INVALID_ID', message: 'Invalid ID format' } };
    }

    try {
      // Use the database function for atomic operation with locking
      const { data, error } = await supabase.rpc('accept_mystery_solution', {
        p_mystery_id: mysteryId,
        p_attempt_id: attemptId,
        p_user_id: userId
      });

      if (error) {
        return { data: null, error: { code: 'ACCEPT_ERROR', message: error.message } };
      }

      if (data !== true) {
        return { data: null, error: { code: 'ACCEPT_FAILED', message: 'Could not accept solution. You may not be the mystery owner, or the mystery is already solved.' } };
      }

      return { data: true, error: null };
    } catch {
      return { data: null, error: { code: 'UNEXPECTED_ERROR', message: 'An unexpected error occurred' } };
    }
  }

  async closeMystery(mysteryId: string, userId: string): Promise<MysteryResult<boolean>> {
    if (!validateUUID(mysteryId) || !validateUUID(userId)) {
      return { data: null, error: { code: 'INVALID_ID', message: 'Invalid ID format' } };
    }

    try {
      // Use the database function for safe closing
      const { data, error } = await supabase.rpc('close_mystery', {
        p_mystery_id: mysteryId,
        p_user_id: userId
      });

      if (error) {
        return { data: null, error: { code: 'CLOSE_ERROR', message: error.message } };
      }

      if (data !== true) {
        return { data: null, error: { code: 'CLOSE_FAILED', message: 'Could not close mystery. You may not be the owner, or the mystery is already solved/closed.' } };
      }

      return { data: true, error: null };
    } catch {
      return { data: null, error: { code: 'UNEXPECTED_ERROR', message: 'An unexpected error occurred' } };
    }
  }

  async getDetectiveStats(userId: string): Promise<MysteryResult<DetectiveStats>> {
    if (!validateUUID(userId)) {
      return { data: null, error: { code: 'INVALID_USER_ID', message: 'Invalid user ID format' } };
    }

    try {
      const { data, error } = await supabase
        .from('vault_user_stats')
        .select('mysteries_solved, mysteries_posted, detective_rank, solve_streak, longest_solve_streak')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No stats row - return defaults
          return {
            data: {
              mysteries_solved: 0,
              mysteries_posted: 0,
              detective_rank: 'rookie',
              solve_streak: 0,
              longest_solve_streak: 0
            },
            error: null
          };
        }
        return { data: null, error: { code: 'FETCH_ERROR', message: error.message } };
      }

      return {
        data: {
          mysteries_solved: data.mysteries_solved || 0,
          mysteries_posted: data.mysteries_posted || 0,
          detective_rank: (data.detective_rank || 'rookie') as DetectiveStats['detective_rank'],
          solve_streak: data.solve_streak || 0,
          longest_solve_streak: data.longest_solve_streak || 0
        },
        error: null
      };
    } catch {
      return { data: null, error: { code: 'UNEXPECTED_ERROR', message: 'An unexpected error occurred' } };
    }
  }

  async getTopDetectives(limit = 10): Promise<Array<{
    display_name: string;
    mysteries_solved: number;
    detective_rank: string;
    solve_streak: number;
  }>> {
    const safeLimit = Math.min(Math.max(1, limit), 50);

    const { data } = await supabase
      .from('vault_user_stats')
      .select('display_name, mysteries_solved, detective_rank, solve_streak')
      .gt('mysteries_solved', 0)
      .order('mysteries_solved', { ascending: false })
      .limit(safeLimit);

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

  async getFeaturedMystery(excludeUserId?: string): Promise<MysteryResult<Mystery>> {
    try {
      // Get the "hottest" unsolved mystery based on engagement
      // Priority: high view count + recent activity + high points
      // Exclude the current user's mysteries so they see others' mysteries
      let query = supabase
        .from('memory_mysteries')
        .select('*')
        .eq('status', 'unsolved');
      
      if (excludeUserId) {
        query = query.neq('user_id', excludeUserId);
      }
      
      const { data, error } = await query
        .order('view_count', { ascending: false })
        .order('attempt_count', { ascending: false })
        .order('points_reward', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        // Fallback: get the most recent unsolved mystery (excluding user's own)
        let fallbackQuery = supabase
          .from('memory_mysteries')
          .select('*')
          .eq('status', 'unsolved');
        
        if (excludeUserId) {
          fallbackQuery = fallbackQuery.neq('user_id', excludeUserId);
        }
        
        const { data: recentData, error: recentError } = await fallbackQuery
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (recentError || !recentData) {
          return { data: null, error: { code: 'NOT_FOUND', message: 'No featured mystery available' } };
        }

        // Get poster name
        const { data: profile } = await supabase
          .from('vault_user_stats')
          .select('display_name')
          .eq('user_id', recentData.user_id)
          .single();

        const mystery: Mystery = {
          ...recentData,
          status: recentData.status as Mystery['status'],
          difficulty: recentData.difficulty as Mystery['difficulty'],
          poster_name: profile?.display_name || 'Anonymous'
        };

        return { data: mystery, error: null };
      }

      // Get poster name
      const { data: profile } = await supabase
        .from('vault_user_stats')
        .select('display_name')
        .eq('user_id', data.user_id)
        .single();

      const mystery: Mystery = {
        ...data,
        status: data.status as Mystery['status'],
        difficulty: data.difficulty as Mystery['difficulty'],
        poster_name: profile?.display_name || 'Anonymous'
      };

      return { data: mystery, error: null };
    } catch {
      return { data: null, error: { code: 'UNEXPECTED_ERROR', message: 'Failed to get featured mystery' } };
    }
  }

  async updateMystery(
    mysteryId: string,
    userId: string,
    updates: {
      description?: string;
      additional_clues?: string | null;
    }
  ): Promise<MysteryResult<Mystery>> {
    if (!validateUUID(mysteryId)) {
      return { data: null, error: { code: 'INVALID_ID', message: 'Invalid mystery ID format' } };
    }

    // Validate description if provided
    if (updates.description !== undefined) {
      const trimmedDescription = updates.description.trim();
      if (trimmedDescription.length < MIN_DESCRIPTION_LENGTH) {
        return { 
          data: null, 
          error: { 
            code: 'DESCRIPTION_TOO_SHORT', 
            message: `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters` 
          } 
        };
      }
      if (trimmedDescription.length > MAX_DESCRIPTION_LENGTH) {
        return { 
          data: null, 
          error: { 
            code: 'DESCRIPTION_TOO_LONG', 
            message: `Description must be less than ${MAX_DESCRIPTION_LENGTH} characters` 
          } 
        };
      }
    }

    try {
      // First verify the user owns this mystery and it's still unsolved
      const { data: existingMystery, error: fetchError } = await supabase
        .from('memory_mysteries')
        .select('*')
        .eq('id', mysteryId)
        .single();

      if (fetchError || !existingMystery) {
        return { data: null, error: { code: 'NOT_FOUND', message: 'Mystery not found' } };
      }

      if (existingMystery.user_id !== userId) {
        return { data: null, error: { code: 'UNAUTHORIZED', message: 'You can only edit your own mysteries' } };
      }

      if (existingMystery.status !== 'unsolved') {
        return { data: null, error: { code: 'CANNOT_EDIT', message: 'Cannot edit a mystery that has been solved or closed' } };
      }

      // Build update object
      const updateData: Record<string, any> = {
        updated_at: new Date().toISOString()
      };

      if (updates.description !== undefined) {
        updateData.description = sanitizeString(updates.description, MAX_DESCRIPTION_LENGTH);
      }

      if (updates.additional_clues !== undefined) {
        updateData.additional_clues = updates.additional_clues 
          ? sanitizeString(updates.additional_clues, MAX_CLUES_LENGTH)
          : null;
      }

      const { data, error } = await supabase
        .from('memory_mysteries')
        .update(updateData)
        .eq('id', mysteryId)
        .eq('user_id', userId)
        .eq('status', 'unsolved')
        .select()
        .single();

      if (error) {
        return { data: null, error: { code: 'UPDATE_ERROR', message: error.message } };
      }

      // Get poster name
      const { data: profile } = await supabase
        .from('vault_user_stats')
        .select('display_name')
        .eq('user_id', userId)
        .single();

      const mystery: Mystery = {
        ...data,
        status: data.status as Mystery['status'],
        difficulty: data.difficulty as Mystery['difficulty'],
        poster_name: profile?.display_name || 'Anonymous'
      };

      return { data: mystery, error: null };
    } catch {
      return { data: null, error: { code: 'UNEXPECTED_ERROR', message: 'An unexpected error occurred' } };
    }
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
    if (isNaN(date.getTime())) return 'Unknown';
    
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 0) return 'just now'; // Handle future dates gracefully
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  }
}

export const mysteryService = new MysteryService();
