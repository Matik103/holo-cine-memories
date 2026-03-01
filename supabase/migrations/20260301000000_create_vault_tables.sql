-- The Vault: Community Hub Tables
-- Migration for gamification, trending, predictions, and badges

-- 1. Vault Trending - Aggregated trending movie data
CREATE TABLE IF NOT EXISTS public.vault_trending (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_title TEXT NOT NULL,
  movie_year INTEGER,
  poster_url TEXT,
  tmdb_id INTEGER,
  recall_count_hour INTEGER DEFAULT 0,
  recall_count_day INTEGER DEFAULT 0,
  recall_count_week INTEGER DEFAULT 0,
  recall_count_total INTEGER DEFAULT 0,
  first_recalled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_hidden_gem BOOLEAN DEFAULT FALSE,
  average_rating NUMERIC(3,2),
  genres TEXT[],
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(movie_title, movie_year)
);

CREATE INDEX idx_vault_trending_hour ON public.vault_trending(recall_count_hour DESC);
CREATE INDEX idx_vault_trending_day ON public.vault_trending(recall_count_day DESC);
CREATE INDEX idx_vault_trending_week ON public.vault_trending(recall_count_week DESC);
CREATE INDEX idx_vault_trending_hidden_gem ON public.vault_trending(is_hidden_gem) WHERE is_hidden_gem = TRUE;

-- 2. Vault Badges - Badge definitions
CREATE TABLE IF NOT EXISTS public.vault_badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  points_value INTEGER DEFAULT 10,
  unlock_condition JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default badges
INSERT INTO public.vault_badges (id, name, description, icon, rarity, points_value, unlock_condition) VALUES
  ('first_recall', 'First Recall', 'Complete your first movie search', '🎬', 'common', 10, '{"type": "search_count", "threshold": 1}'),
  ('night_owl', 'Night Owl', 'Search for a movie between midnight and 4am', '🦉', 'common', 15, '{"type": "time_range", "start_hour": 0, "end_hour": 4}'),
  ('genre_explorer', 'Genre Explorer', 'Search movies from 5 different genres', '🧭', 'uncommon', 25, '{"type": "genre_count", "threshold": 5}'),
  ('movie_buff', 'Movie Buff', 'Complete 25 movie searches', '🎥', 'uncommon', 30, '{"type": "search_count", "threshold": 25}'),
  ('trendsetter', 'Trendsetter', 'Find a movie before it starts trending', '🚀', 'rare', 50, '{"type": "early_discovery", "threshold": 1}'),
  ('oracle', 'Oracle', 'Win 3 predictions in a row', '🔮', 'rare', 75, '{"type": "prediction_streak", "threshold": 3}'),
  ('week_warrior', 'Week Warrior', 'Maintain a 7-day streak', '⚔️', 'uncommon', 35, '{"type": "streak", "threshold": 7}'),
  ('vault_veteran', 'Vault Veteran', 'Maintain a 30-day streak', '🏛️', 'epic', 100, '{"type": "streak", "threshold": 30}'),
  ('hidden_gem_hunter', 'Hidden Gem Hunter', 'Rate 10 movies with less than 100 recalls', '💎', 'epic', 100, '{"type": "hidden_gem_ratings", "threshold": 10}'),
  ('century_club', 'Century Club', 'Complete 100 movie searches', '💯', 'epic', 150, '{"type": "search_count", "threshold": 100}'),
  ('cinemind_elite', 'CineMind Elite', 'Reach the top 1% Vault Score', '👑', 'legendary', 500, '{"type": "percentile", "threshold": 1}')
ON CONFLICT (id) DO NOTHING;

-- 3. Vault User Stats - User gamification data
CREATE TABLE IF NOT EXISTS public.vault_user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  vault_score INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE,
  predictions_correct INTEGER DEFAULT 0,
  predictions_total INTEGER DEFAULT 0,
  prediction_streak INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]'::JSONB,
  hidden_gems_rated INTEGER DEFAULT 0,
  genres_explored TEXT[] DEFAULT '{}',
  rank_percentile NUMERIC(5,2),
  total_searches INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_vault_user_stats_score ON public.vault_user_stats(vault_score DESC);
CREATE INDEX idx_vault_user_stats_streak ON public.vault_user_stats(current_streak DESC);

-- 4. Vault Predictions - Prediction games
CREATE TABLE IF NOT EXISTS public.vault_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  options JSONB NOT NULL,
  correct_answer TEXT,
  points_reward INTEGER DEFAULT 50,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_vault_predictions_active ON public.vault_predictions(is_active, ends_at);

-- 5. Vault User Predictions - User prediction entries
CREATE TABLE IF NOT EXISTS public.vault_user_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prediction_id UUID NOT NULL REFERENCES public.vault_predictions(id) ON DELETE CASCADE,
  selected_option TEXT NOT NULL,
  is_correct BOOLEAN,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, prediction_id)
);

CREATE INDEX idx_vault_user_predictions_user ON public.vault_user_predictions(user_id);

-- 6. Vault Activity Feed - Rolling 24h anonymized activity
CREATE TABLE IF NOT EXISTS public.vault_activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_type TEXT NOT NULL CHECK (activity_type IN ('search', 'favorite', 'rating', 'badge', 'prediction')),
  movie_title TEXT,
  movie_year INTEGER,
  display_name TEXT,
  badge_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_vault_activity_feed_created ON public.vault_activity_feed(created_at DESC);

-- Enable RLS
ALTER TABLE public.vault_trending ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_user_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_activity_feed ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Vault Trending: Anyone can read
CREATE POLICY "Anyone can read vault trending" ON public.vault_trending
  FOR SELECT USING (true);

-- Vault Badges: Anyone can read
CREATE POLICY "Anyone can read vault badges" ON public.vault_badges
  FOR SELECT USING (true);

-- Vault User Stats: Users can read all, but only update their own
CREATE POLICY "Anyone can read vault user stats" ON public.vault_user_stats
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own stats" ON public.vault_user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" ON public.vault_user_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- Vault Predictions: Anyone can read active predictions
CREATE POLICY "Anyone can read vault predictions" ON public.vault_predictions
  FOR SELECT USING (true);

-- Vault User Predictions: Users can read all, manage their own
CREATE POLICY "Anyone can read user predictions" ON public.vault_user_predictions
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own predictions" ON public.vault_user_predictions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own predictions" ON public.vault_user_predictions
  FOR UPDATE USING (auth.uid() = user_id);

-- Vault Activity Feed: Anyone can read, authenticated users can insert
CREATE POLICY "Anyone can read activity feed" ON public.vault_activity_feed
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert activity" ON public.vault_activity_feed
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Function to clean old activity feed entries (older than 24h)
CREATE OR REPLACE FUNCTION clean_old_activity_feed()
RETURNS void AS $$
BEGIN
  DELETE FROM public.vault_activity_feed
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user streak
CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_last_active DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
BEGIN
  SELECT last_active_date, current_streak, longest_streak
  INTO v_last_active, v_current_streak, v_longest_streak
  FROM public.vault_user_stats
  WHERE user_id = p_user_id;

  IF v_last_active IS NULL THEN
    -- First activity
    INSERT INTO public.vault_user_stats (user_id, current_streak, longest_streak, last_active_date)
    VALUES (p_user_id, 1, 1, CURRENT_DATE)
    ON CONFLICT (user_id) DO UPDATE SET
      current_streak = 1,
      longest_streak = GREATEST(vault_user_stats.longest_streak, 1),
      last_active_date = CURRENT_DATE,
      updated_at = NOW();
  ELSIF v_last_active = CURRENT_DATE THEN
    -- Already active today, no change
    NULL;
  ELSIF v_last_active = CURRENT_DATE - 1 THEN
    -- Consecutive day, increment streak
    UPDATE public.vault_user_stats SET
      current_streak = current_streak + 1,
      longest_streak = GREATEST(longest_streak, current_streak + 1),
      last_active_date = CURRENT_DATE,
      updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSE
    -- Streak broken, reset to 1
    UPDATE public.vault_user_stats SET
      current_streak = 1,
      last_active_date = CURRENT_DATE,
      updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate rank percentiles
CREATE OR REPLACE FUNCTION calculate_vault_percentiles()
RETURNS void AS $$
BEGIN
  UPDATE public.vault_user_stats
  SET rank_percentile = subq.percentile
  FROM (
    SELECT 
      user_id,
      100.0 - (PERCENT_RANK() OVER (ORDER BY vault_score) * 100) as percentile
    FROM public.vault_user_stats
  ) subq
  WHERE vault_user_stats.user_id = subq.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get trending movies for a time period
CREATE OR REPLACE FUNCTION get_vault_trending(p_period TEXT DEFAULT 'day', p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  movie_title TEXT,
  movie_year INTEGER,
  poster_url TEXT,
  recall_count INTEGER,
  is_hidden_gem BOOLEAN,
  genres TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vt.movie_title,
    vt.movie_year,
    vt.poster_url,
    CASE p_period
      WHEN 'hour' THEN vt.recall_count_hour
      WHEN 'day' THEN vt.recall_count_day
      WHEN 'week' THEN vt.recall_count_week
      ELSE vt.recall_count_day
    END as recall_count,
    vt.is_hidden_gem,
    vt.genres
  FROM public.vault_trending vt
  ORDER BY recall_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get champions (top users)
CREATE OR REPLACE FUNCTION get_vault_champions(p_limit INTEGER DEFAULT 5)
RETURNS TABLE (
  display_name TEXT,
  vault_score INTEGER,
  current_streak INTEGER,
  badges JSONB,
  rank_percentile NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(vus.display_name, 'Anonymous') as display_name,
    vus.vault_score,
    vus.current_streak,
    vus.badges,
    vus.rank_percentile
  FROM public.vault_user_stats vus
  WHERE vus.vault_score > 0
  ORDER BY vus.vault_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.vault_trending IS 'Aggregated trending movie data for The Vault community hub';
COMMENT ON TABLE public.vault_badges IS 'Badge definitions for gamification';
COMMENT ON TABLE public.vault_user_stats IS 'User gamification stats including score, streaks, and badges';
COMMENT ON TABLE public.vault_predictions IS 'Weekly prediction games';
COMMENT ON TABLE public.vault_user_predictions IS 'User entries for prediction games';
COMMENT ON TABLE public.vault_activity_feed IS 'Rolling 24h anonymized activity feed';
