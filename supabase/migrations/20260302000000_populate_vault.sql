-- Populate vault with existing data
INSERT INTO vault_trending (
  movie_title, movie_year, poster_url,
  recall_count_hour, recall_count_day, recall_count_week, recall_count_total,
  first_recalled_at, updated_at
)
SELECT 
  movie_title, movie_year, movie_poster_url,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 hour'),
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 day'),
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days'),
  COUNT(*),
  MIN(created_at),
  MAX(created_at)
FROM movie_searches
WHERE movie_title IS NOT NULL
GROUP BY movie_title, movie_year, movie_poster_url
ON CONFLICT (movie_title, movie_year) DO UPDATE SET
  recall_count_hour = EXCLUDED.recall_count_hour,
  recall_count_day = EXCLUDED.recall_count_day,
  recall_count_week = EXCLUDED.recall_count_week,
  recall_count_total = vault_trending.recall_count_total + EXCLUDED.recall_count_total,
  updated_at = EXCLUDED.updated_at;

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

INSERT INTO vault_user_stats (
  user_id, display_name, vault_score, total_searches,
  last_active_date, created_at, updated_at
)
SELECT 
  p.user_id, p.display_name,
  COUNT(ms.id) * 5,
  COUNT(ms.id),
  MAX(ms.created_at)::DATE,
  MIN(ms.created_at),
  MAX(ms.created_at)
FROM profiles p
LEFT JOIN movie_searches ms ON ms.user_id = p.user_id
GROUP BY p.user_id, p.display_name
ON CONFLICT (user_id) DO UPDATE SET
  vault_score = vault_user_stats.vault_score + EXCLUDED.vault_score,
  total_searches = vault_user_stats.total_searches + EXCLUDED.total_searches,
  last_active_date = GREATEST(vault_user_stats.last_active_date, EXCLUDED.last_active_date),
  updated_at = EXCLUDED.updated_at;

INSERT INTO vault_activity_feed (
  activity_type, movie_title, movie_year, display_name, created_at
)
SELECT 
  'search', ms.movie_title, ms.movie_year, p.display_name, ms.created_at
FROM movie_searches ms
JOIN profiles p ON p.user_id = ms.user_id
WHERE ms.movie_title IS NOT NULL
ORDER BY ms.created_at DESC
LIMIT 100
ON CONFLICT DO NOTHING;

INSERT INTO vault_activity_feed (
  activity_type, movie_title, movie_year, display_name, created_at
)
SELECT 
  'favorite', f.movie_title, f.movie_year, p.display_name, f.created_at
FROM favorites f
JOIN profiles p ON p.user_id = f.user_id
WHERE f.movie_title IS NOT NULL
ORDER BY f.created_at DESC
LIMIT 50
ON CONFLICT DO NOTHING;
