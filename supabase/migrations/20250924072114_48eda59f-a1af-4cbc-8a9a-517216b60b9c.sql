-- Create analytics table for tracking all user queries
CREATE TABLE public.user_query_analytics (
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

-- Enable Row Level Security
ALTER TABLE public.user_query_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can insert their own analytics data
CREATE POLICY "Users can insert their own analytics" 
ON public.user_query_analytics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can view their own analytics data
CREATE POLICY "Users can view their own analytics" 
ON public.user_query_analytics 
FOR SELECT 
USING (auth.uid() = user_id);

-- Admin policy - for now, create a function to check if user is admin
-- You can later extend this with a proper admin role system
CREATE POLICY "Service role can view all analytics" 
ON public.user_query_analytics 
FOR SELECT 
USING (
  auth.jwt() ->> 'role' = 'service_role' OR
  auth.uid()::text = '2fad0c82-4637-4718-905e-f90509625cb4' -- Your user ID as admin
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_query_analytics_updated_at
BEFORE UPDATE ON public.user_query_analytics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_user_query_analytics_user_id ON public.user_query_analytics(user_id);
CREATE INDEX idx_user_query_analytics_query_type ON public.user_query_analytics(query_type);
CREATE INDEX idx_user_query_analytics_success ON public.user_query_analytics(success);
CREATE INDEX idx_user_query_analytics_created_at ON public.user_query_analytics(created_at DESC);
CREATE INDEX idx_user_query_analytics_movie_identified ON public.user_query_analytics(movie_identified);

-- Create a view for admin analytics dashboard
CREATE OR REPLACE VIEW public.admin_query_insights AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  query_type,
  success,
  COUNT(*) as query_count,
  AVG(confidence_score) as avg_confidence,
  AVG(search_duration_ms) as avg_duration_ms,
  COUNT(DISTINCT user_id) as unique_users,
  array_agg(DISTINCT movie_identified) FILTER (WHERE movie_identified IS NOT NULL) as movies_found
FROM public.user_query_analytics 
GROUP BY DATE_TRUNC('day', created_at), query_type, success
ORDER BY date DESC;