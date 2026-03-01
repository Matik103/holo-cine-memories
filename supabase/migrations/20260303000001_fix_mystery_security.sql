-- Fix Collective Memory Security Issues
-- This migration addresses RLS policy gaps, race conditions, and data integrity issues

-- ============================================
-- 1. DROP OVERLY PERMISSIVE UPDATE POLICIES
-- ============================================

-- Drop the permissive UPDATE policy on mysteries that allows users to manipulate status/points
DROP POLICY IF EXISTS "Users can update their own mysteries" ON public.memory_mysteries;

-- Drop the permissive UPDATE policy on attempts that allows vote manipulation
DROP POLICY IF EXISTS "Users can update their own attempts" ON public.mystery_attempts;

-- ============================================
-- 2. CREATE RESTRICTED UPDATE POLICIES
-- ============================================

-- Users can only update description and clues on their UNSOLVED mysteries
CREATE POLICY "Users can update own unsolved mysteries" ON public.memory_mysteries
  FOR UPDATE USING (
    auth.uid() = user_id 
    AND status = 'unsolved'
  )
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'unsolved'
  );

-- Users cannot update attempts after submission (votes are handled by triggers)
-- No UPDATE policy needed - all updates go through database functions

-- ============================================
-- 3. PREVENT SELF-VOTING
-- ============================================

-- Drop existing insert policy
DROP POLICY IF EXISTS "Users can create their own votes" ON public.mystery_votes;

-- New policy: Users can vote but NOT on their own attempts
CREATE POLICY "Users can vote on others attempts" ON public.mystery_votes
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND auth.uid() != (
      SELECT ma.user_id 
      FROM public.mystery_attempts ma 
      WHERE ma.id = attempt_id
    )
  );

-- ============================================
-- 4. PREVENT SELF-SOLVING
-- ============================================

-- Drop existing insert policy for attempts
DROP POLICY IF EXISTS "Users can create their own attempts" ON public.mystery_attempts;

-- New policy: Users can submit attempts but NOT on their own mysteries
CREATE POLICY "Users can attempt others mysteries" ON public.mystery_attempts
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND auth.uid() != (
      SELECT mm.user_id 
      FROM public.memory_mysteries mm 
      WHERE mm.id = mystery_id
    )
    AND EXISTS (
      SELECT 1 FROM public.memory_mysteries mm 
      WHERE mm.id = mystery_id 
      AND mm.status = 'unsolved'
    )
  );

-- ============================================
-- 5. ADD MISSING INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_mystery_votes_user ON public.mystery_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_mysteries_solved_by ON public.memory_mysteries(solved_by) WHERE solved_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_attempts_accepted ON public.mystery_attempts(is_accepted) WHERE is_accepted = TRUE;
CREATE INDEX IF NOT EXISTS idx_mysteries_difficulty ON public.memory_mysteries(difficulty);

-- ============================================
-- 6. ADD LENGTH CONSTRAINTS
-- ============================================

-- Add check constraints for text field lengths
ALTER TABLE public.memory_mysteries 
  DROP CONSTRAINT IF EXISTS check_description_length,
  ADD CONSTRAINT check_description_length CHECK (length(description) <= 5000);

ALTER TABLE public.memory_mysteries 
  DROP CONSTRAINT IF EXISTS check_clues_length,
  ADD CONSTRAINT check_clues_length CHECK (additional_clues IS NULL OR length(additional_clues) <= 2000);

ALTER TABLE public.mystery_attempts 
  DROP CONSTRAINT IF EXISTS check_title_length,
  ADD CONSTRAINT check_title_length CHECK (length(movie_title) <= 500);

ALTER TABLE public.mystery_attempts 
  DROP CONSTRAINT IF EXISTS check_explanation_length,
  ADD CONSTRAINT check_explanation_length CHECK (explanation IS NULL OR length(explanation) <= 2000);

-- Add reasonable year range
ALTER TABLE public.memory_mysteries 
  DROP CONSTRAINT IF EXISTS check_solution_year_range,
  ADD CONSTRAINT check_solution_year_range CHECK (
    solution_movie_year IS NULL 
    OR (solution_movie_year >= 1888 AND solution_movie_year <= EXTRACT(YEAR FROM NOW())::INTEGER + 5)
  );

ALTER TABLE public.mystery_attempts 
  DROP CONSTRAINT IF EXISTS check_movie_year_range,
  ADD CONSTRAINT check_movie_year_range CHECK (
    movie_year IS NULL 
    OR (movie_year >= 1888 AND movie_year <= EXTRACT(YEAR FROM NOW())::INTEGER + 5)
  );

-- Add non-negative constraints for counts
ALTER TABLE public.memory_mysteries 
  DROP CONSTRAINT IF EXISTS check_view_count_positive,
  ADD CONSTRAINT check_view_count_positive CHECK (view_count >= 0);

ALTER TABLE public.memory_mysteries 
  DROP CONSTRAINT IF EXISTS check_attempt_count_positive,
  ADD CONSTRAINT check_attempt_count_positive CHECK (attempt_count >= 0);

ALTER TABLE public.mystery_attempts 
  DROP CONSTRAINT IF EXISTS check_upvotes_positive,
  ADD CONSTRAINT check_upvotes_positive CHECK (upvotes >= 0);

ALTER TABLE public.mystery_attempts 
  DROP CONSTRAINT IF EXISTS check_downvotes_positive,
  ADD CONSTRAINT check_downvotes_positive CHECK (downvotes >= 0);

-- Points reward must be reasonable
ALTER TABLE public.memory_mysteries 
  DROP CONSTRAINT IF EXISTS check_points_range,
  ADD CONSTRAINT check_points_range CHECK (points_reward >= 10 AND points_reward <= 500);

-- ============================================
-- 7. FIX ACCEPT_MYSTERY_SOLUTION WITH LOCKING
-- ============================================

CREATE OR REPLACE FUNCTION accept_mystery_solution(
  p_mystery_id UUID,
  p_attempt_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_mystery_owner UUID;
  v_solver_id UUID;
  v_attempt_movie_title TEXT;
  v_attempt_movie_year INTEGER;
  v_attempt_tmdb_id INTEGER;
  v_attempt_poster_url TEXT;
  v_points INTEGER;
  v_solver_stats_exists BOOLEAN;
BEGIN
  -- Lock the mystery row to prevent race conditions
  SELECT user_id, points_reward INTO v_mystery_owner, v_points
  FROM public.memory_mysteries
  WHERE id = p_mystery_id AND status = 'unsolved'
  FOR UPDATE;
  
  -- Only mystery owner can accept
  IF v_mystery_owner IS NULL OR v_mystery_owner != p_user_id THEN
    RETURN FALSE;
  END IF;
  
  -- Get attempt details
  SELECT user_id, movie_title, movie_year, tmdb_id, poster_url
  INTO v_solver_id, v_attempt_movie_title, v_attempt_movie_year, v_attempt_tmdb_id, v_attempt_poster_url
  FROM public.mystery_attempts
  WHERE id = p_attempt_id AND mystery_id = p_mystery_id;
  
  IF v_solver_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Ensure solver has stats row (create if not exists)
  SELECT EXISTS(SELECT 1 FROM public.vault_user_stats WHERE user_id = v_solver_id) INTO v_solver_stats_exists;
  
  IF NOT v_solver_stats_exists THEN
    INSERT INTO public.vault_user_stats (user_id, vault_score, mysteries_solved, solve_streak, longest_solve_streak, detective_rank)
    VALUES (v_solver_id, 0, 0, 0, 0, 'rookie');
  END IF;
  
  -- Mark attempt as accepted
  UPDATE public.mystery_attempts
  SET is_accepted = TRUE, accepted_at = NOW()
  WHERE id = p_attempt_id;
  
  -- Mark mystery as solved
  UPDATE public.memory_mysteries
  SET 
    status = 'solved',
    solved_at = NOW(),
    solved_by = v_solver_id,
    solution_movie_title = v_attempt_movie_title,
    solution_movie_year = v_attempt_movie_year,
    solution_tmdb_id = v_attempt_tmdb_id,
    solution_poster_url = v_attempt_poster_url,
    updated_at = NOW()
  WHERE id = p_mystery_id;
  
  -- Award points to solver with proper streak handling
  UPDATE public.vault_user_stats
  SET 
    vault_score = vault_score + v_points,
    mysteries_solved = COALESCE(mysteries_solved, 0) + 1,
    solve_streak = COALESCE(solve_streak, 0) + 1,
    longest_solve_streak = GREATEST(COALESCE(longest_solve_streak, 0), COALESCE(solve_streak, 0) + 1),
    updated_at = NOW()
  WHERE user_id = v_solver_id;
  
  -- Update detective rank based on solves
  PERFORM update_detective_rank(v_solver_id);
  
  -- Add to activity feed
  INSERT INTO public.vault_activity_feed (activity_type, movie_title, movie_year, display_name, metadata)
  SELECT 'mystery_solved', v_attempt_movie_title, v_attempt_movie_year, 
         COALESCE(display_name, 'A detective'),
         jsonb_build_object('mystery_id', p_mystery_id, 'points', v_points)
  FROM public.vault_user_stats WHERE user_id = v_solver_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. ADD ATOMIC INCREMENT FUNCTIONS
-- ============================================

-- Function to atomically increment view count
CREATE OR REPLACE FUNCTION increment_mystery_views(p_mystery_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.memory_mysteries
  SET view_count = view_count + 1
  WHERE id = p_mystery_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to atomically increment attempt count
CREATE OR REPLACE FUNCTION increment_mystery_attempts(p_mystery_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.memory_mysteries
  SET attempt_count = attempt_count + 1
  WHERE id = p_mystery_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment mysteries_posted for a user
CREATE OR REPLACE FUNCTION increment_mysteries_posted(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.vault_user_stats
  SET mysteries_posted = COALESCE(mysteries_posted, 0) + 1,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Create row if doesn't exist
  IF NOT FOUND THEN
    INSERT INTO public.vault_user_stats (user_id, mysteries_posted)
    VALUES (p_user_id, 1)
    ON CONFLICT (user_id) DO UPDATE SET mysteries_posted = COALESCE(vault_user_stats.mysteries_posted, 0) + 1;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. ADD TRIGGER FOR updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_mystery_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_mystery_updated_at ON public.memory_mysteries;
CREATE TRIGGER trigger_mystery_updated_at
  BEFORE UPDATE ON public.memory_mysteries
  FOR EACH ROW
  EXECUTE FUNCTION update_mystery_updated_at();

-- ============================================
-- 10. ADD FUNCTION TO CLOSE MYSTERY SAFELY
-- ============================================

CREATE OR REPLACE FUNCTION close_mystery(p_mystery_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_mystery_owner UUID;
  v_current_status TEXT;
BEGIN
  -- Get mystery info with lock
  SELECT user_id, status INTO v_mystery_owner, v_current_status
  FROM public.memory_mysteries
  WHERE id = p_mystery_id
  FOR UPDATE;
  
  -- Only owner can close, and only if unsolved
  IF v_mystery_owner IS NULL OR v_mystery_owner != p_user_id THEN
    RETURN FALSE;
  END IF;
  
  IF v_current_status != 'unsolved' THEN
    RETURN FALSE;
  END IF;
  
  UPDATE public.memory_mysteries
  SET status = 'closed', updated_at = NOW()
  WHERE id = p_mystery_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION accept_mystery_solution IS 'Safely accept a mystery solution with proper locking and validation';
COMMENT ON FUNCTION close_mystery IS 'Safely close a mystery - only owner can close unsolved mysteries';
COMMENT ON FUNCTION increment_mystery_views IS 'Atomically increment view count';
COMMENT ON FUNCTION increment_mystery_attempts IS 'Atomically increment attempt count';
