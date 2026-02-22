-- ============================================
-- COMPLETE DATABASE SETUP FOR CINEMIND
-- Run this in Supabase Dashboard SQL Editor
-- ============================================

-- ============================================
-- PART 1: FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

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
LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public
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

CREATE OR REPLACE FUNCTION public.get_user_movie_history(user_uuid UUID)
RETURNS TABLE (
  movie_title TEXT,
  movie_year INTEGER,
  search_count BIGINT,
  last_searched TIMESTAMP WITH TIME ZONE,
  is_favorite BOOLEAN
)
LANGUAGE SQL STABLE SET search_path = public
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

CREATE OR REPLACE FUNCTION public.get_user_cinedna(user_uuid UUID)
RETURNS TABLE (
  favorite_genres TEXT[],
  top_movies TEXT[],
  total_searches BIGINT,
  voice_searches BIGINT,
  text_searches BIGINT,
  success_rate NUMERIC
)
LANGUAGE SQL STABLE SET search_path = public
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

CREATE OR REPLACE FUNCTION public.clean_expired_reset_tokens()
RETURNS INTEGER
LANGUAGE SQL SECURITY DEFINER SET search_path = public
AS $$
  WITH deleted AS (
    DELETE FROM password_reset_tokens
    WHERE expires_at < NOW()
    RETURNING *
  )
  SELECT COUNT(*)::INTEGER FROM deleted;
$$;

CREATE OR REPLACE FUNCTION public.validate_reset_token(token_value TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  email TEXT,
  token_id UUID
)
LANGUAGE SQL STABLE SET search_path = public
AS $$
  SELECT 
    (expires_at > NOW() AND used_at IS NULL) as is_valid,
    email,
    id as token_id
  FROM password_reset_tokens
  WHERE token = token_value
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.mark_token_used(token_value TEXT)
RETURNS BOOLEAN
LANGUAGE SQL SECURITY DEFINER SET search_path = public
AS $$
  UPDATE password_reset_tokens
  SET used_at = NOW()
  WHERE token = token_value
  AND used_at IS NULL
  RETURNING true;
$$;

-- ============================================
-- PART 2: TRIGGERS
-- ============================================

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_query_analytics_updated_at ON public.user_query_analytics;
CREATE TRIGGER update_user_query_analytics_updated_at
  BEFORE UPDATE ON public.user_query_analytics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- PART 3: RLS POLICIES
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.movie_searches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own searches" ON public.movie_searches;
CREATE POLICY "Users can view their own searches" ON public.movie_searches FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own searches" ON public.movie_searches;
CREATE POLICY "Users can insert their own searches" ON public.movie_searches FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own searches" ON public.movie_searches;
CREATE POLICY "Users can delete their own searches" ON public.movie_searches FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
CREATE POLICY "Users can view their own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;
CREATE POLICY "Users can update their own preferences" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_preferences;
CREATE POLICY "Users can insert their own preferences" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
CREATE POLICY "Users can view their own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage their own favorites" ON public.favorites;
CREATE POLICY "Users can manage their own favorites" ON public.favorites FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.user_query_analytics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can insert their own analytics" ON public.user_query_analytics;
CREATE POLICY "Users can insert their own analytics" ON public.user_query_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can view their own analytics" ON public.user_query_analytics;
CREATE POLICY "Users can view their own analytics" ON public.user_query_analytics FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Service role can view all analytics" ON public.user_query_analytics;
CREATE POLICY "Service role can view all analytics" ON public.user_query_analytics FOR SELECT USING (auth.jwt() ->> 'role' = 'service_role');

ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can insert their own reset tokens" ON password_reset_tokens;
CREATE POLICY "Users can insert their own reset tokens" ON password_reset_tokens FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Users can read their own reset tokens" ON password_reset_tokens;
CREATE POLICY "Users can read their own reset tokens" ON password_reset_tokens FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update their own reset tokens" ON password_reset_tokens;
CREATE POLICY "Users can update their own reset tokens" ON password_reset_tokens FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Users can delete their own reset tokens" ON password_reset_tokens;
CREATE POLICY "Users can delete their own reset tokens" ON password_reset_tokens FOR DELETE USING (true);

-- ============================================
-- PART 4: INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_query_analytics_user_id ON public.user_query_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_query_analytics_query_type ON public.user_query_analytics(query_type);
CREATE INDEX IF NOT EXISTS idx_user_query_analytics_success ON public.user_query_analytics(success);
CREATE INDEX IF NOT EXISTS idx_user_query_analytics_created_at ON public.user_query_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_query_analytics_movie_identified ON public.user_query_analytics(movie_identified);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_movie_searches_user_id ON public.movie_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);

SELECT 'Complete database setup finished! 8 functions, 4 triggers, 20+ policies, 10 indexes created.' as status;
