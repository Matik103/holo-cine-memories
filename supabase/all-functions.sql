-- ============================================
-- ALL DATABASE FUNCTIONS FOR CINEMIND
-- ============================================

-- 1. Auto-update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 2. Handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Admin analytics insights
CREATE OR REPLACE FUNCTION public.get_admin_query_insights(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  date DATE,
  query_type TEXT,
  success BOOLEAN,
  query_count BIGINT,
  avg_confidence NUMERIC,
  avg_duration_ms NUMERIC,
  unique_users BIGINT,
  movies_found TEXT[]
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    DATE_TRUNC('day', ua.created_at)::DATE as date,
    ua.query_type,
    ua.success,
    COUNT(*) as query_count,
    AVG(ua.confidence_score) as avg_confidence,
    AVG(ua.search_duration_ms) as avg_duration_ms,
    COUNT(DISTINCT ua.user_id) as unique_users,
    array_agg(DISTINCT ua.movie_identified) FILTER (WHERE ua.movie_identified IS NOT NULL) as movies_found
  FROM public.user_query_analytics ua
  WHERE ua.created_at::DATE BETWEEN start_date AND end_date
  GROUP BY DATE_TRUNC('day', ua.created_at)::DATE, ua.query_type, ua.success
  ORDER BY date DESC;
$$;

-- 4. Get user's movie history
CREATE OR REPLACE FUNCTION public.get_user_movie_history(user_uuid UUID)
RETURNS TABLE (
  movie_title TEXT,
  movie_year INTEGER,
  search_count BIGINT,
  last_searched TIMESTAMP WITH TIME ZONE,
  is_favorite BOOLEAN
)
LANGUAGE SQL
STABLE
SET search_path = public
AS $$
  SELECT 
    ms.movie_title,
    ms.movie_year,
    COUNT(*) as search_count,
    MAX(ms.created_at) as last_searched,
    EXISTS(
      SELECT 1 FROM public.favorites f 
      WHERE f.user_id = user_uuid 
      AND f.movie_title = ms.movie_title 
      AND f.movie_year = ms.movie_year
    ) as is_favorite
  FROM public.movie_searches ms
  WHERE ms.user_id = user_uuid
  AND ms.movie_title IS NOT NULL
  GROUP BY ms.movie_title, ms.movie_year
  ORDER BY last_searched DESC;
$$;

-- 5. Get user's CineDNA profile
CREATE OR REPLACE FUNCTION public.get_user_cinedna(user_uuid UUID)
RETURNS TABLE (
  favorite_genres TEXT[],
  top_movies TEXT[],
  total_searches BIGINT,
  voice_searches BIGINT,
  text_searches BIGINT,
  success_rate NUMERIC
)
LANGUAGE SQL
STABLE
SET search_path = public
AS $$
  SELECT 
    up.favorite_genres,
    ARRAY(
      SELECT movie_title 
      FROM public.favorites 
      WHERE user_id = user_uuid 
      ORDER BY created_at DESC 
      LIMIT 10
    ) as top_movies,
    COUNT(*) as total_searches,
    COUNT(*) FILTER (WHERE query_type = 'voice') as voice_searches,
    COUNT(*) FILTER (WHERE query_type = 'text') as text_searches,
    ROUND(
      COUNT(*) FILTER (WHERE success = true)::NUMERIC / 
      NULLIF(COUNT(*), 0) * 100, 
      2
    ) as success_rate
  FROM public.user_preferences up
  LEFT JOIN public.user_query_analytics uqa ON uqa.user_id = user_uuid
  WHERE up.user_id = user_uuid
  GROUP BY up.favorite_genres;
$$;

-- 6. Clean expired password reset tokens
CREATE OR REPLACE FUNCTION public.clean_expired_reset_tokens()
RETURNS INTEGER
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  WITH deleted AS (
    DELETE FROM password_reset_tokens
    WHERE expires_at < NOW()
    RETURNING *
  )
  SELECT COUNT(*)::INTEGER FROM deleted;
$$;

-- 7. Validate password reset token
CREATE OR REPLACE FUNCTION public.validate_reset_token(token_value TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  email TEXT,
  token_id UUID
)
LANGUAGE SQL
STABLE
SET search_path = public
AS $$
  SELECT 
    (expires_at > NOW() AND used_at IS NULL) as is_valid,
    email,
    id as token_id
  FROM password_reset_tokens
  WHERE token = token_value
  LIMIT 1;
$$;

-- 8. Mark reset token as used
CREATE OR REPLACE FUNCTION public.mark_token_used(token_value TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE password_reset_tokens
  SET used_at = NOW()
  WHERE token = token_value
  AND used_at IS NULL
  RETURNING true;
$$;

SELECT 'All database functions created!' as status;
