-- Create table for storing password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- Enable RLS (Row Level Security)
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to insert their own tokens
CREATE POLICY "Users can insert their own reset tokens" ON password_reset_tokens
  FOR INSERT WITH CHECK (true);

-- Create policy to allow users to read their own tokens
CREATE POLICY "Users can read their own reset tokens" ON password_reset_tokens
  FOR SELECT USING (true);

-- Create policy to allow users to update their own tokens
CREATE POLICY "Users can update their own reset tokens" ON password_reset_tokens
  FOR UPDATE USING (true);

-- Create policy to allow users to delete their own tokens
CREATE POLICY "Users can delete their own reset tokens" ON password_reset_tokens
  FOR DELETE USING (true);
