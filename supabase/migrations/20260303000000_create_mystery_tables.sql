-- Collective Memory: Community Movie Mystery Solving
-- Migration for mystery posts, solutions, voting, and detective stats

-- 1. Memory Mysteries - Unsolved movie queries posted to community
CREATE TABLE IF NOT EXISTS public.memory_mysteries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- The mystery content
  description TEXT NOT NULL,
  additional_clues TEXT,
  
  -- Optional context from failed AI search
  original_search_query TEXT,
  ai_suggestions JSONB,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'unsolved' CHECK (status IN ('unsolved', 'pending_verification', 'solved', 'closed')),
  solved_at TIMESTAMP WITH TIME ZONE,
  solved_by UUID REFERENCES auth.users(id),
  
  -- The verified solution
  solution_movie_title TEXT,
  solution_movie_year INTEGER,
  solution_tmdb_id INTEGER,
  solution_poster_url TEXT,
  
  -- Engagement metrics
  view_count INTEGER DEFAULT 0,
  attempt_count INTEGER DEFAULT 0,
  
  -- Difficulty (calculated based on time to solve)
  difficulty TEXT DEFAULT 'normal' CHECK (difficulty IN ('easy', 'normal', 'hard', 'legendary')),
  points_reward INTEGER DEFAULT 25,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_mysteries_status ON public.memory_mysteries(status);
CREATE INDEX idx_mysteries_created ON public.memory_mysteries(created_at DESC);
CREATE INDEX idx_mysteries_user ON public.memory_mysteries(user_id);
CREATE INDEX idx_mysteries_unsolved ON public.memory_mysteries(status, created_at DESC) WHERE status = 'unsolved';

-- 2. Mystery Attempts - User guesses/solutions
CREATE TABLE IF NOT EXISTS public.mystery_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mystery_id UUID NOT NULL REFERENCES public.memory_mysteries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- The proposed solution
  movie_title TEXT NOT NULL,
  movie_year INTEGER,
  tmdb_id INTEGER,
  poster_url TEXT,
  
  -- Explanation of why they think this is correct
  explanation TEXT,
  
  -- Voting results
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  
  -- Status
  is_accepted BOOLEAN DEFAULT FALSE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- One attempt per user per mystery
  UNIQUE(mystery_id, user_id)
);

CREATE INDEX idx_attempts_mystery ON public.mystery_attempts(mystery_id);
CREATE INDEX idx_attempts_user ON public.mystery_attempts(user_id);
CREATE INDEX idx_attempts_votes ON public.mystery_attempts(mystery_id, upvotes DESC);

-- 3. Mystery Votes - Community verification votes
CREATE TABLE IF NOT EXISTS public.mystery_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.mystery_attempts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- One vote per user per attempt
  UNIQUE(attempt_id, user_id)
);

CREATE INDEX idx_votes_attempt ON public.mystery_votes(attempt_id);

-- 4. Detective Stats - User solve counts and rankings (extends vault_user_stats)
-- We'll add columns to existing vault_user_stats instead of new table
ALTER TABLE public.vault_user_stats 
ADD COLUMN IF NOT EXISTS mysteries_solved INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS mysteries_posted INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS detective_rank TEXT DEFAULT 'rookie' CHECK (detective_rank IN ('rookie', 'sleuth', 'detective', 'master_detective', 'legend')),
ADD COLUMN IF NOT EXISTS solve_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_solve_streak INTEGER DEFAULT 0;

-- Enable RLS
ALTER TABLE public.memory_mysteries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mystery_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mystery_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Memory Mysteries: Anyone can read, authenticated users can create their own
CREATE POLICY "Anyone can read mysteries" ON public.memory_mysteries
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own mysteries" ON public.memory_mysteries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mysteries" ON public.memory_mysteries
  FOR UPDATE USING (auth.uid() = user_id);

-- Mystery Attempts: Anyone can read, authenticated users can create their own
CREATE POLICY "Anyone can read attempts" ON public.mystery_attempts
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own attempts" ON public.mystery_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attempts" ON public.mystery_attempts
  FOR UPDATE USING (auth.uid() = user_id);

-- Mystery Votes: Anyone can read, authenticated users can create their own
CREATE POLICY "Anyone can read votes" ON public.mystery_votes
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own votes" ON public.mystery_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" ON public.mystery_votes
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update vote counts on attempt
CREATE OR REPLACE FUNCTION update_attempt_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'up' THEN
      UPDATE public.mystery_attempts SET upvotes = upvotes + 1 WHERE id = NEW.attempt_id;
    ELSE
      UPDATE public.mystery_attempts SET downvotes = downvotes + 1 WHERE id = NEW.attempt_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'up' THEN
      UPDATE public.mystery_attempts SET upvotes = upvotes - 1 WHERE id = OLD.attempt_id;
    ELSE
      UPDATE public.mystery_attempts SET downvotes = downvotes - 1 WHERE id = OLD.attempt_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_vote_counts
AFTER INSERT OR DELETE ON public.mystery_votes
FOR EACH ROW EXECUTE FUNCTION update_attempt_vote_counts();

-- Function to accept a solution and mark mystery as solved
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
BEGIN
  -- Get mystery owner
  SELECT user_id, points_reward INTO v_mystery_owner, v_points
  FROM public.memory_mysteries
  WHERE id = p_mystery_id AND status = 'unsolved';
  
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
  
  -- Award points to solver
  UPDATE public.vault_user_stats
  SET 
    vault_score = vault_score + v_points,
    mysteries_solved = mysteries_solved + 1,
    solve_streak = solve_streak + 1,
    longest_solve_streak = GREATEST(longest_solve_streak, solve_streak + 1),
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

-- Function to update detective rank
CREATE OR REPLACE FUNCTION update_detective_rank(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_solves INTEGER;
  v_new_rank TEXT;
BEGIN
  SELECT mysteries_solved INTO v_solves
  FROM public.vault_user_stats
  WHERE user_id = p_user_id;
  
  v_new_rank := CASE
    WHEN v_solves >= 100 THEN 'legend'
    WHEN v_solves >= 50 THEN 'master_detective'
    WHEN v_solves >= 20 THEN 'detective'
    WHEN v_solves >= 5 THEN 'sleuth'
    ELSE 'rookie'
  END;
  
  UPDATE public.vault_user_stats
  SET detective_rank = v_new_rank
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unsolved mysteries with filters
CREATE OR REPLACE FUNCTION get_mysteries(
  p_status TEXT DEFAULT 'unsolved',
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_order_by TEXT DEFAULT 'recent'
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  description TEXT,
  additional_clues TEXT,
  status TEXT,
  view_count INTEGER,
  attempt_count INTEGER,
  difficulty TEXT,
  points_reward INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  poster_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.user_id,
    m.description,
    m.additional_clues,
    m.status,
    m.view_count,
    m.attempt_count,
    m.difficulty,
    m.points_reward,
    m.created_at,
    COALESCE(vus.display_name, 'Anonymous') as poster_name
  FROM public.memory_mysteries m
  LEFT JOIN public.vault_user_stats vus ON m.user_id = vus.user_id
  WHERE m.status = p_status OR p_status = 'all'
  ORDER BY 
    CASE WHEN p_order_by = 'recent' THEN m.created_at END DESC,
    CASE WHEN p_order_by = 'popular' THEN m.view_count END DESC,
    CASE WHEN p_order_by = 'points' THEN m.points_reward END DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add mystery_solved to activity_type enum
ALTER TABLE public.vault_activity_feed 
DROP CONSTRAINT IF EXISTS vault_activity_feed_activity_type_check;

ALTER TABLE public.vault_activity_feed 
ADD CONSTRAINT vault_activity_feed_activity_type_check 
CHECK (activity_type IN ('search', 'favorite', 'rating', 'badge', 'prediction', 'mystery_solved', 'mystery_posted'));

-- Add detective badges
INSERT INTO public.vault_badges (id, name, description, icon, rarity, points_value, unlock_condition) VALUES
  ('first_solve', 'First Solve', 'Solve your first movie mystery', '🔍', 'common', 15, '{"type": "mysteries_solved", "threshold": 1}'),
  ('mystery_helper', 'Mystery Helper', 'Solve 5 movie mysteries', '🕵️', 'uncommon', 30, '{"type": "mysteries_solved", "threshold": 5}'),
  ('detective', 'Detective', 'Solve 20 movie mysteries', '🔎', 'rare', 75, '{"type": "mysteries_solved", "threshold": 20}'),
  ('master_detective', 'Master Detective', 'Solve 50 movie mysteries', '🎖️', 'epic', 150, '{"type": "mysteries_solved", "threshold": 50}'),
  ('legend_solver', 'Legend Solver', 'Solve 100 movie mysteries', '🏆', 'legendary', 500, '{"type": "mysteries_solved", "threshold": 100}'),
  ('mystery_poster', 'Mystery Poster', 'Post your first mystery', '❓', 'common', 10, '{"type": "mysteries_posted", "threshold": 1}'),
  ('solve_streak_3', 'Hot Streak', 'Solve 3 mysteries in a row', '🔥', 'uncommon', 25, '{"type": "solve_streak", "threshold": 3}'),
  ('solve_streak_7', 'On Fire', 'Solve 7 mysteries in a row', '💥', 'rare', 50, '{"type": "solve_streak", "threshold": 7}')
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE public.memory_mysteries IS 'Community movie mysteries waiting to be solved';
COMMENT ON TABLE public.mystery_attempts IS 'User solution attempts for mysteries';
COMMENT ON TABLE public.mystery_votes IS 'Community votes on solution attempts';
