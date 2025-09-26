-- Disable email confirmations in production
-- This ensures Supabase doesn't send its own emails

-- Update auth configuration to disable email confirmations
UPDATE auth.config 
SET 
  enable_signup = true,
  enable_confirmations = false,
  enable_email_change_confirmations = false
WHERE id = 1;

-- Alternative approach: Update the auth settings directly
-- This might be needed if the above doesn't work
UPDATE auth.config 
SET 
  raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb), 
    '{email_confirmations}', 
    'false'::jsonb
  )
WHERE id = 1;


