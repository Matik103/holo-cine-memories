-- Add optional review text to favorites (user reviews for movies)
ALTER TABLE public.favorites
  ADD COLUMN IF NOT EXISTS review TEXT,
  ADD COLUMN IF NOT EXISTS review_updated_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN public.favorites.review IS 'Optional user-written review for this movie';
COMMENT ON COLUMN public.favorites.review_updated_at IS 'When the review was last updated';
