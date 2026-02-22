-- ============================================
-- COMBINED MIGRATIONS FOR CINEMIND
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- Migration 1: Initial schema
-- Create user profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create movie searches table to track user's movie memory
CREATE TABLE IF NOT EXISTS public.movie_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  search_query TEXT NOT NULL,
  movie_title TEXT,
  movie_year INTEGER,
  movie_poster_url TEXT,
  movie_plot TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user preferences for CineDNA
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  favorite_genres TEXT[],
  preferred_mood TEXT,
  watch_time_preference TEXT,
  cinedna_score JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create favorites/watchlist table
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_title TEXT NOT NULL,
  movie_year INTEGER,
  movie_poster_url TEXT,
  is_watched BOOLEAN DEFAULT false,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, movie_title, movie_year)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movie_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for movie_searches
DROP POLICY IF EXISTS "Users can view their own searches" ON public.movie_searches;
CREATE POLICY "Users can view their own searches" 
ON public.movie_searches FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own searches" ON public.movie_searches;
CREATE POLICY "Users can insert their own searches" 
ON public.movie_searches FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own searches" ON public.movie_searches;
CREATE POLICY "Users can delete their own searches" 
ON public.movie_searches FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for user_preferences
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
CREATE POLICY "Users can view their own preferences" 
ON public.user_preferences FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;
CREATE POLICY "Users can update their own preferences" 
ON public.user_preferences FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_preferences;
CREATE POLICY "Users can insert their own preferences" 
ON public.user_preferences FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for favorites
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
CREATE POLICY "Users can view their own favorites" 
ON public.favorites FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own favorites" ON public.favorites;
CREATE POLICY "Users can manage their own favorites" 
ON public.favorites FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
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

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Migration 2: Analytics table
CREATE TABLE IF NOT EXISTS public.user_query_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  query_text TEXT NOT NULL,
  query_type TEXT NOT NULL CHECK (query_type IN ('text', 'voice')),
  search_result JSONB,
  success BOOLEAN NOT NULL DEFAULT false,
  confidence_score NUMERIC,
  movie_identified TEXT,
  movie_year INTEGER,
  genres TEXT[],
  search_duration_ms INTEGER,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_query_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own analytics" ON public.user_query_analytics;
CREATE POLICY "Users can insert their own analytics" 
ON public.user_query_analytics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own analytics" ON public.user_query_analytics;
CREATE POLICY "Users can view their own analytics" 
ON public.user_query_analytics 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can view all analytics" ON public.user_query_analytics;
CREATE POLICY "Service role can view all analytics" 
ON public.user_query_analytics 
FOR SELECT 
USING (
  auth.jwt() ->> 'role' = 'service_role' OR
  auth.uid()::text = '2fad0c82-4637-4718-905e-f90509625cb4'
);

DROP TRIGGER IF EXISTS update_user_query_analytics_updated_at ON public.user_query_analytics;
CREATE TRIGGER update_user_query_analytics_updated_at
BEFORE UPDATE ON public.user_query_analytics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_user_query_analytics_user_id ON public.user_query_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_query_analytics_query_type ON public.user_query_analytics(query_type);
CREATE INDEX IF NOT EXISTS idx_user_query_analytics_success ON public.user_query_analytics(success);
CREATE INDEX IF NOT EXISTS idx_user_query_analytics_created_at ON public.user_query_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_query_analytics_movie_identified ON public.user_query_analytics(movie_identified);

-- Migration 3: Admin analytics function
DROP VIEW IF EXISTS public.admin_query_insights;

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

-- Migration 4: Password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE NULL
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own reset tokens" ON password_reset_tokens;
CREATE POLICY "Users can insert their own reset tokens" ON password_reset_tokens
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can read their own reset tokens" ON password_reset_tokens;
CREATE POLICY "Users can read their own reset tokens" ON password_reset_tokens
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own reset tokens" ON password_reset_tokens;
CREATE POLICY "Users can update their own reset tokens" ON password_reset_tokens
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can delete their own reset tokens" ON password_reset_tokens;
CREATE POLICY "Users can delete their own reset tokens" ON password_reset_tokens
  FOR DELETE USING (true);

-- Done!
SELECT 'All migrations applied successfully!' as status;
