-- Mark all movies with low searches as hidden gems
UPDATE vault_trending
SET is_hidden_gem = true
WHERE recall_count_total BETWEEN 1 AND 50
  AND is_hidden_gem = false;

-- If no hidden gems exist, mark bottom 20% as hidden gems
DO $$
DECLARE
  hidden_count INTEGER;
  total_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO hidden_count FROM vault_trending WHERE is_hidden_gem = true;
  SELECT COUNT(*) INTO total_count FROM vault_trending;
  
  IF hidden_count = 0 AND total_count > 0 THEN
    UPDATE vault_trending
    SET is_hidden_gem = true
    WHERE id IN (
      SELECT id FROM vault_trending
      ORDER BY recall_count_total ASC
      LIMIT GREATEST(10, total_count / 5)
    );
  END IF;
END $$;
