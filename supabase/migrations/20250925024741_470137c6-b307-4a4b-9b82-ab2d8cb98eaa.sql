-- Fix security warning: Set proper search_path for function
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Automatically confirm email for new users
  NEW.email_confirmed_at = now();
  NEW.confirmation_token = null;
  NEW.confirmation_sent_at = null;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;