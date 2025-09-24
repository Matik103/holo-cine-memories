-- Drop the existing view
DROP VIEW IF EXISTS public.admin_query_insights;

-- Create a secure function for admin analytics instead of a view
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