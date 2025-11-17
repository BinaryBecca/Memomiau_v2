-- Remove the old UNIQUE constraint on username and email
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_username_key;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_email_key;

-- Create new UNIQUE constraints that allow NULL values for username
-- For email, we still need it to be unique (it comes from auth)
ALTER TABLE profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);

-- Add a partial unique index for username (only when not NULL)
CREATE UNIQUE INDEX idx_profiles_username_unique ON profiles(username) WHERE username IS NOT NULL;
