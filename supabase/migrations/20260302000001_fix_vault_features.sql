-- Mark hidden gems based on low searches
UPDATE vault_trending
SET is_hidden_gem = true
WHERE recall_count_total < 50
  AND recall_count_total > 5
  AND movie_year < EXTRACT(YEAR FROM NOW()) - 2;

-- Add active predictions
INSERT INTO vault_predictions (
  prediction_type, title, description, options, 
  points_reward, starts_at, ends_at, is_active
) VALUES 
(
  'trending',
  'Which movie will trend this week?',
  'Predict which movie will have the most searches',
  '[
    {"id": "action", "label": "Action Movies", "icon": "💥"},
    {"id": "comedy", "label": "Comedy Movies", "icon": "😂"},
    {"id": "drama", "label": "Drama Movies", "icon": "🎭"},
    {"id": "horror", "label": "Horror Movies", "icon": "👻"}
  ]'::jsonb,
  75,
  NOW(),
  NOW() + INTERVAL '7 days',
  true
),
(
  'genre',
  'Most searched decade?',
  'Which decade will have the most movie searches?',
  '[
    {"id": "2020s", "label": "2020s", "icon": "🎬"},
    {"id": "2010s", "label": "2010s", "icon": "🎥"},
    {"id": "2000s", "label": "2000s", "icon": "📽️"},
    {"id": "90s", "label": "90s & Earlier", "icon": "📼"}
  ]'::jsonb,
  50,
  NOW(),
  NOW() + INTERVAL '7 days',
  true
),
(
  'community',
  'Total community searches this week?',
  'How many total searches will the community make?',
  '[
    {"id": "under100", "label": "Under 100", "icon": "🔢"},
    {"id": "100-500", "label": "100-500", "icon": "📊"},
    {"id": "500-1000", "label": "500-1000", "icon": "📈"},
    {"id": "over1000", "label": "Over 1000", "icon": "🚀"}
  ]'::jsonb,
  100,
  NOW(),
  NOW() + INTERVAL '7 days',
  true
)
ON CONFLICT DO NOTHING;

-- Function to resolve predictions
CREATE OR REPLACE FUNCTION resolve_prediction(p_prediction_id UUID, p_correct_answer TEXT)
RETURNS void AS $$
DECLARE
  v_points_reward INTEGER;
BEGIN
  SELECT points_reward INTO v_points_reward
  FROM vault_predictions
  WHERE id = p_prediction_id;

  UPDATE vault_predictions
  SET 
    correct_answer = p_correct_answer,
    is_resolved = true,
    is_active = false
  WHERE id = p_prediction_id;

  UPDATE vault_user_predictions
  SET 
    is_correct = (selected_option = p_correct_answer),
    points_earned = CASE WHEN selected_option = p_correct_answer THEN v_points_reward ELSE 0 END
  WHERE prediction_id = p_prediction_id;

  UPDATE vault_user_stats vus
  SET 
    predictions_correct = vus.predictions_correct + CASE WHEN vup.is_correct THEN 1 ELSE 0 END,
    prediction_streak = CASE 
      WHEN vup.is_correct THEN vus.prediction_streak + 1 
      ELSE 0 
    END,
    vault_score = vus.vault_score + COALESCE(vup.points_earned, 0),
    updated_at = NOW()
  FROM vault_user_predictions vup
  WHERE vus.user_id = vup.user_id
    AND vup.prediction_id = p_prediction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
