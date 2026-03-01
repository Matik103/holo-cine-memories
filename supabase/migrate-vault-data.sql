-- ============================================
-- MIGRATE EXISTING SEARCH DATA TO VAULT
-- ============================================

-- 1. Populate vault_trending from movie_searches
INSERT INTO vault_trending (
  movie_title,
  movie_year,
  movie_poster_url,
  recall_count_hour,
  recall_count_day,
  recall_count_week,
  recall_count_total,
  genres,
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
  NULL as genres,
  MIN(created_at) as created_at,
  MAX(created_at) as updated_at
FROM movie_searches
WHERE movie_title IS NOT NULL
GROUP BY movie_title, movie_year, movie_poster_url
ON CONFLICT (movie_title, movie_year) 
DO UPDATE SET
  recall_count_hour = EXCLUDED.recall_count_hour,
  recall_count_day = EXCLUDED.recall_count_day,
  recall_count_week = EXCLUDED.recall_count_week,
  recall_count_total = vault_trending.recall_count_total + EXCLUDED.recall_count_total,
  movie_poster_url = COALESCE(vault_trending.movie_poster_url, EXCLUDED.movie_poster_url),
  updated_at = EXCLUDED.updated_at;

-- 2. Calculate average ratings for vault_trending from favorites
UPDATE vault_trending vt
SET average_rating = (
  SELECT AVG(rating)::NUMERIC(3,2)
  FROM favorites f
  WHERE f.movie_title = vt.movie_title
    AND f.movie_year = vt.movie_year
    AND f.rating IS NOT NULL
)
WHERE EXISTS (
  SELECT 1 FROM favorites f
  WHERE f.movie_title = vt.movie_title
    AND f.movie_year = vt.movie_year
    AND f.rating IS NOT NULL
);

-- 3. Initialize or update vault_user_stats for existing users
INSERT INTO vault_user_stats (
  user_id,
  display_name,
  vault_score,
  total_searches,
  current_streak,
  longest_streak,
  last_active_date,
  predictions_correct,
  predictions_total,
  prediction_streak,
  badges,
  hidden_gems_rated,
  genres_explored,
  created_at,
  updated_at
)
SELECT 
  p.user_id,
  p.display_name,
  COUNT(ms.id) * 5 as vault_score,
  COUNT(ms.id) as total_searches,
  0 as current_streak,
  0 as longest_streak,
  MAX(ms.created_at)::DATE as last_active_date,
  0 as predictions_correct,
  0 as predictions_total,
  0 as prediction_streak,
  '[]'::jsonb as badges,
  0 as hidden_gems_rated,
  ARRAY[]::text[] as genres_explored,
  MIN(ms.created_at) as created_at,
  MAX(ms.created_at) as updated_at
FROM profiles p
LEFT JOIN movie_searches ms ON ms.user_id = p.user_id
GROUP BY p.user_id, p.display_name
ON CONFLICT (user_id) 
DO UPDATE SET
  vault_score = vault_user_stats.vault_score + EXCLUDED.vault_score,
  total_searches = vault_user_stats.total_searches + EXCLUDED.total_searches,
  last_active_date = GREATEST(vault_user_stats.last_active_date, EXCLUDED.last_active_date),
  updated_at = EXCLUDED.updated_at;

-- 4. Populate vault_activity_feed from recent searches (last 100)
INSERT INTO vault_activity_feed (
  activity_type,
  movie_title,
  movie_year,
  display_name,
  created_at
)
SELECT 
  'search' as activity_type,
  ms.movie_title,
  ms.movie_year,
  p.display_name,
  ms.created_at
FROM movie_searches ms
JOIN profiles p ON p.user_id = ms.user_id
WHERE ms.movie_title IS NOT NULL
ORDER BY ms.created_at DESC
LIMIT 100
ON CONFLICT DO NOTHING;

-- 5. Add favorites to activity feed (last 50)
INSERT INTO vault_activity_feed (
  activity_type,
  movie_title,
  movie_year,
  display_name,
  created_at
)
SELECT 
  'favorite' as activity_type,
  f.movie_title,
  f.movie_year,
  p.display_name,
  f.created_at
FROM favorites f
JOIN profiles p ON p.user_id = f.user_id
WHERE f.movie_title IS NOT NULL
ORDER BY f.created_at DESC
LIMIT 50
ON CONFLICT DO NOTHING;

-- 6. Update user streaks based on search history
DO $$
DECLARE
  user_record RECORD;
  search_dates DATE[];
  current_streak INT;
  longest_streak INT;
  temp_streak INT;
  prev_date DATE;
  search_date DATE;
BEGIN
  FOR user_record IN 
    SELECT DISTINCT user_id FROM movie_searches
  LOOP
    -- Get all unique search dates for this user, ordered
    SELECT ARRAY_AGG(DISTINCT created_at::DATE ORDER BY created_at::DATE DESC)
    INTO search_dates
    FROM movie_searches
    WHERE user_id = user_record.user_id;
    
    current_streak := 0;
    longest_streak := 0;
    temp_streak := 1;
    prev_date := NULL;
    
    -- Calculate streaks
    FOREACH search_date IN ARRAY search_dates
    LOOP
      IF prev_date IS NULL THEN
        -- First date
        IF search_date = CURRENT_DATE OR search_date = CURRENT_DATE - INTERVAL '1 day' THEN
          current_streak := 1;
        END IF;
        temp_streak := 1;
      ELSIF prev_date - search_date = 1 THEN
        -- Consecutive day
        temp_streak := temp_streak + 1;
        IF search_date >= CURRENT_DATE - INTERVAL '1 day' THEN
          current_streak := temp_streak;
        END IF;
      ELSE
        -- Streak broken
        IF temp_streak > longest_streak THEN
          longest_streak := temp_streak;
        END IF;
        temp_streak := 1;
        IF search_date >= CURRENT_DATE - INTERVAL '1 day' THEN
          current_streak := 1;
        END IF;
      END IF;
      
      prev_date := search_date;
    END LOOP;
    
    -- Check final streak
    IF temp_streak > longest_streak THEN
      longest_streak := temp_streak;
    END IF;
    
    -- Update user stats
    UPDATE vault_user_stats
    SET 
      current_streak = current_streak,
      longest_streak = longest_streak,
      updated_at = NOW()
    WHERE user_id = user_record.user_id;
  END LOOP;
END $$;

-- 7. Summary report
SELECT 
  'Migration Complete!' as status,
  (SELECT COUNT(*) FROM vault_trending) as trending_movies,
  (SELECT COUNT(*) FROM vault_user_stats) as users_migrated,
  (SELECT COUNT(*) FROM vault_activity_feed) as activities_added,
  (SELECT SUM(recall_count_total) FROM vault_trending) as total_searches_migrated;
