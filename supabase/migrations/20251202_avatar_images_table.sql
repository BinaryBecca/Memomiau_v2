-- Create avatar_images table to store public avatar URLs
CREATE TABLE IF NOT EXISTS public.avatar_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL UNIQUE,
  url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.avatar_images ENABLE ROW LEVEL SECURITY;

-- Allow public read access (anyone can select avatars)
CREATE POLICY "Anyone can view avatar images"
  ON public.avatar_images
  FOR SELECT
  USING (true);

-- Only authenticated users can insert (for admin purposes)
CREATE POLICY "Authenticated users can insert avatars"
  ON public.avatar_images
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert sample cat avatar URLs from your storage bucket
-- You'll need to add your actual avatar filenames here
INSERT INTO public.avatar_images (filename, url)
VALUES
  ('cat1.jpg', 'https://cyvhakrxfgqqexdbvhcs.supabase.co/storage/v1/object/public/profile-avatars/cat1.jpg'),
  ('cat2.jpg', 'https://cyvhakrxfgqqexdbvhcs.supabase.co/storage/v1/object/public/profile-avatars/cat2.jpg'),
  ('cat3.jpg', 'https://cyvhakrxfgqqexdbvhcs.supabase.co/storage/v1/object/public/profile-avatars/cat3.jpg'),
  ('cat4.jpg', 'https://cyvhakrxfgqqexdbvhcs.supabase.co/storage/v1/object/public/profile-avatars/cat4.jpg'),
  ('cat5.jpg', 'https://cyvhakrxfgqqexdbvhcs.supabase.co/storage/v1/object/public/profile-avatars/cat5.jpg')
ON CONFLICT (filename) DO NOTHING;

-- Add comment
COMMENT ON TABLE public.avatar_images IS 'Stores public avatar image URLs for profile selection';
