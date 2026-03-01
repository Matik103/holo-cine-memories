-- Add participation tracking to predictions
ALTER TABLE vault_predictions ADD COLUMN IF NOT EXISTS total_votes INTEGER DEFAULT 0;
ALTER TABLE vault_predictions ADD COLUMN IF NOT EXISTS vote_distribution JSONB DEFAULT '{}'::jsonb;

-- Function to update vote stats when user votes
CREATE OR REPLACE FUNCTION update_prediction_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE vault_predictions
  SET 
    total_votes = total_votes + 1,
    vote_distribution = COALESCE(vote_distribution, '{}'::jsonb) || 
      jsonb_build_object(
        NEW.selected_option,
        COALESCE((vote_distribution->>NEW.selected_option)::int, 0) + 1
      )
  WHERE id = NEW.prediction_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_prediction_vote ON vault_user_predictions;
CREATE TRIGGER on_prediction_vote
  AFTER INSERT ON vault_user_predictions
  FOR EACH ROW
  EXECUTE FUNCTION update_prediction_stats();

-- Better movie-specific predictions
DELETE FROM vault_predictions WHERE is_active = true;

INSERT INTO vault_predictions (
  prediction_type, title, description, options, 
  points_reward, starts_at, ends_at, is_active
) VALUES 
(
  'movie_specific',
  'Which classic will be searched most?',
  'Predict which iconic movie gets the most searches this week',
  '[
    {"id": "godfather", "label": "The Godfather", "icon": "🎩"},
    {"id": "pulp", "label": "Pulp Fiction", "icon": "💼"},
    {"id": "matrix", "label": "The Matrix", "icon": "💊"},
    {"id": "inception", "label": "Inception", "icon": "🌀"}
  ]'::jsonb,
  100,
  NOW(),
  NOW() + INTERVAL '7 days',
  true
),
(
  'genre_battle',
  'Genre Battle: Which wins?',
  'Action vs Horror - which genre dominates searches?',
  '[
    {"id": "action", "label": "Action 💥", "icon": "💥"},
    {"id": "horror", "label": "Horror 👻", "icon": "👻"},
    {"id": "tie", "label": "Tie", "icon": "🤝"}
  ]'::jsonb,
  75,
  NOW(),
  NOW() + INTERVAL '7 days',
  true
),
(
  'community_milestone',
  'Will we hit 500 searches?',
  'Can the community reach 500 total searches this week?',
  '[
    {"id": "yes", "label": "Yes! 🚀", "icon": "🚀"},
    {"id": "no", "label": "Not yet", "icon": "🎯"},
    {"id": "exceed", "label": "Exceed 1000!", "icon": "🔥"}
  ]'::jsonb,
  50,
  NOW(),
  NOW() + INTERVAL '7 days',
  true
)
ON CONFLICT DO NOTHING;
