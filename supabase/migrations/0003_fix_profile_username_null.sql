-- Make username nullable to allow trigger to create initial profile
ALTER TABLE profiles ALTER COLUMN username DROP NOT NULL;

-- Update the trigger function to generate a default username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (new.id, new.email, 'user_' || new.id::text)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
