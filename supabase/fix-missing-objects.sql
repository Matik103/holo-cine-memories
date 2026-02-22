-- ============================================
-- FIX MISSING FUNCTIONS, TRIGGERS & POLICIES
-- ============================================

-- 1. FUNCTIONS
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

-- 2. TRIGGERS
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_query_analytics_updated_at ON public.user_query_analytics;
CREATE TRIGGER update_user_query_analytics_updated_at
  BEFORE UPDATE ON public.user_query_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3. RLS POLICIES - profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. RLS POLICIES - movie_searches
ALTER TABLE public.movie_searches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own searches" ON public.movie_searches;
CREATE POLICY "Users can view their own searches" ON public.movie_searches FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own searches" ON public.movie_searches;
CREATE POLICY "Users can insert their own searches" ON public.movie_searches FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own searches" ON public.movie_searches;
CREATE POLICY "Users can delete their own searches" ON public.movie_searches FOR DELETE USING (auth.uid() = user_id);

-- 5. RLS POLICIES - user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
CREATE POLICY "Users can view their own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;
CREATE POLICY "Users can update their own preferences" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_preferences;
CREATE POLICY "Users can insert their own preferences" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. RLS POLICIES - favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
CREATE POLICY "Users can view their own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage their own favorites" ON public.favorites;
CREATE POLICY "Users can manage their own favorites" ON public.favorites FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 7. RLS POLICIES - user_query_analytics
ALTER TABLE public.user_query_analytics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can insert their own analytics" ON public.user_query_analytics;
CREATE POLICY "Users can insert their own analytics" ON public.user_query_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can view their own analytics" ON public.user_query_analytics;
CREATE POLICY "Users can view their own analytics" ON public.user_query_analytics FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Service role can view all analytics" ON public.user_query_analytics;
CREATE POLICY "Service role can view all analytics" ON public.user_query_analytics FOR SELECT USING (auth.jwt() ->> 'role' = 'service_role');

-- 8. RLS POLICIES - password_reset_tokens
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can insert their own reset tokens" ON password_reset_tokens;
CREATE POLICY "Users can insert their own reset tokens" ON password_reset_tokens FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Users can read their own reset tokens" ON password_reset_tokens;
CREATE POLICY "Users can read their own reset tokens" ON password_reset_tokens FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update their own reset tokens" ON password_reset_tokens;
CREATE POLICY "Users can update their own reset tokens" ON password_reset_tokens FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Users can delete their own reset tokens" ON password_reset_tokens;
CREATE POLICY "Users can delete their own reset tokens" ON password_reset_tokens FOR DELETE USING (true);

-- 9. INDEXES
CREATE INDEX IF NOT EXISTS idx_user_query_analytics_user_id ON public.user_query_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_query_analytics_query_type ON public.user_query_analytics(query_type);
CREATE INDEX IF NOT EXISTS idx_user_query_analytics_success ON public.user_query_analytics(success);
CREATE INDEX IF NOT EXISTS idx_user_query_analytics_created_at ON public.user_query_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_query_analytics_movie_identified ON public.user_query_analytics(movie_identified);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

SELECT 'All functions, triggers, and policies created!' as status;
