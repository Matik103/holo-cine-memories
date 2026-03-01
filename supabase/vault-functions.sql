-- ============================================
-- VAULT DATABASE FUNCTIONS
-- ============================================

-- Function to update user streak
CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_last_active DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
BEGIN
  SELECT last_active_date, current_streak, longest_streak
  INTO v_last_active, v_current_streak, v_longest_streak
  FROM vault_user_stats
  WHERE user_id = p_user_id;
  
  IF v_last_active IS NULL THEN
    v_current_streak := 1;
    v_longest_streak := 1;
  ELSIF v_last_active = CURRENT_DATE - INTERVAL '1 day' THEN
    v_current_streak := v_current_streak + 1;
  ELSIF v_last_active < CURRENT_DATE - INTERVAL '1 day' THEN
    v_current_streak := 1;
  ELSE
    RETURN;
  END IF;
  
  IF v_current_streak > v_longest_streak THEN
    v_longest_streak := v_current_streak;
  END IF;
  
  UPDATE vault_user_stats
  SET 
    current_streak = v_current_streak,
    longest_streak = v_longest_streak,
    last_active_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add rating column to favorites if missing
ALTER TABLE favorites ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);

-- Add average_rating to vault_trending if missing
ALTER TABLE vault_trending ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2) DEFAULT 0;

-- Seed initial prediction
INSERT INTO vault_predictions (
  prediction_type, title, description, options, 
  points_reward, starts_at, ends_at, is_active
) VALUES (
  'trending',
  'Which genre will be most popular this week?',
  'Predict which movie genre will have the most searches',
  '[
    {"id": "action", "label": "Action", "icon": "💥"},
    {"id": "comedy", "label": "Comedy", "icon": "😂"},
    {"id": "drama", "label": "Drama", "icon": "🎭"},
    {"id": "scifi", "label": "Sci-Fi", "icon": "🚀"}
  ]'::jsonb,
  100,
  NOW(),
  NOW() + INTERVAL '7 days',
  true
) ON CONFLICT DO NOTHING;

-- Migrate existing search data to vault
-- This populates vault with historical data
INSERT INTO vault_trending (
  movie_title,
  movie_year,
  movie_poster_url,
  recall_count_hour,
  recall_count_day,
  recall_count_week,
  recall_count_total,
  created_at,
  updated_at
)
SELECT 
  movie_title,
  movie_year,
  movie_poster_url,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 hour') as recall_count_hour,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 day') as recall_count_day,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as recall_count_week,
  COUNT(*) as recall_count_total,
  MIN(created_at) as created_at,
  MAX(created_at) as updated_at
FROM movie_searches
WHERE movie_title IS NOT NULL
GROUP BY movie_title, movie_year, movie_poster_url
ON CONFLICT (movie_title, movie_year) DO NOTHING;

-- Initialize vault_user_stats from existing users
INSERT INTO vault_user_stats (
  user_id,
  display_name,
  vault_score,
  total_searches,
  last_active_date,
  created_at,
  updated_at
)
SELECT 
  p.user_id,
  p.display_name,
  COUNT(ms.id) * 5 as vault_score,
  COUNT(ms.id) as total_searches,
  MAX(ms.created_at)::DATE as last_active_date,
  MIN(ms.created_at) as created_at,
  MAX(ms.created_at) as updated_at
FROM profiles p
LEFT JOIN movie_searches ms ON ms.user_id = p.user_id
GROUP BY p.user_id, p.display_name
ON CONFLICT (user_id) DO NOTHING;

SELECT 'Vault database functions created and data migrated!' as status;
