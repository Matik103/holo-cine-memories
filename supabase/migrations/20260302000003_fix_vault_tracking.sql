-- Fix vault stats tracking gaps

-- 1. Create function to calculate percentiles (runs periodically)
CREATE OR REPLACE FUNCTION calculate_vault_percentiles()
RETURNS void AS $$
BEGIN
  UPDATE vault_user_stats
  SET rank_percentile = subq.percentile
  FROM (
    SELECT 
      user_id,
      100.0 - (PERCENT_RANK() OVER (ORDER BY vault_score) * 100) as percentile
    FROM vault_user_stats
    WHERE vault_score > 0
  ) subq
  WHERE vault_user_stats.user_id = subq.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Create trigger to track favorites in vault
CREATE OR REPLACE FUNCTION track_favorite_in_vault()
RETURNS TRIGGER AS $$
DECLARE
  v_display_name TEXT;
  v_is_hidden_gem BOOLEAN;
BEGIN
  -- Get user display name
  SELECT display_name INTO v_display_name
  FROM profiles
  WHERE user_id = NEW.user_id;

  -- Add to activity feed
  INSERT INTO vault_activity_feed (
    activity_type,
    movie_title,
    movie_year,
    display_name,
    created_at
  ) VALUES (
    'favorite',
    NEW.movie_title,
    NEW.movie_year,
    COALESCE(v_display_name, 'Someone'),
    NOW()
  );

  -- Check if it's a hidden gem and increment counter
  SELECT is_hidden_gem INTO v_is_hidden_gem
  FROM vault_trending
  WHERE movie_title = NEW.movie_title
    AND movie_year = NEW.movie_year;

  IF v_is_hidden_gem THEN
    UPDATE vault_user_stats
    SET 
      hidden_gems_rated = hidden_gems_rated + 1,
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_favorite_added ON favorites;
CREATE TRIGGER on_favorite_added
  AFTER INSERT ON favorites
  FOR EACH ROW
  EXECUTE FUNCTION track_favorite_in_vault();

-- 3. Update submitPrediction to update streak
CREATE OR REPLACE FUNCTION track_prediction_activity()
RETURNS TRIGGER AS $$
DECLARE
  v_display_name TEXT;
BEGIN
  -- Update last active date and streak
  PERFORM update_user_streak(NEW.user_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_prediction_submitted ON vault_user_predictions;
CREATE TRIGGER on_prediction_submitted
  AFTER INSERT ON vault_user_predictions
  FOR EACH ROW
  EXECUTE FUNCTION track_prediction_activity();

-- 4. Implement early discovery tracking
CREATE OR REPLACE FUNCTION check_early_discovery(p_user_id UUID, p_movie_title TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_search_date TIMESTAMP;
  v_trending_date TIMESTAMP;
BEGIN
  -- Get when user first searched this movie
  SELECT MIN(created_at) INTO v_user_search_date
  FROM movie_searches
  WHERE user_id = p_user_id
    AND movie_title = p_movie_title;

  -- Get when movie started trending (first time it hit 50+ searches)
  SELECT MIN(created_at) INTO v_trending_date
  FROM movie_searches
  WHERE movie_title = p_movie_title
  GROUP BY movie_title
  HAVING COUNT(*) >= 50;

  -- User discovered it early if they searched before it trended
  RETURN v_user_search_date IS NOT NULL 
    AND v_trending_date IS NOT NULL 
    AND v_user_search_date < v_trending_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Run initial percentile calculation
SELECT calculate_vault_percentiles();
