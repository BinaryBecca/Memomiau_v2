-- Migration: Populate avatar_images table from avatar_images storage bucket
-- This script reads all files from the avatar_images bucket and inserts them into the table

-- First, delete all entries with the old/wrong URL from the previous project
DELETE FROM public.avatar_images WHERE url LIKE '%cyvhakrxfgqqexdbvhcs%';

-- Also clear any existing sample data that might have been added manually
DELETE FROM public.avatar_images WHERE filename LIKE 'cat%.jpg';

-- Insert avatar URLs from the avatar_images storage bucket
-- This query selects all objects from the storage.objects table where bucket_id = 'avatar_images'
-- and creates the public URL for each file
INSERT INTO public.avatar_images (filename, url)
SELECT 
  name as filename,
  CONCAT(
    'https://ucugkevyqqhpicvqplmj.supabase.co/storage/v1/object/public/avatar_images/',
    name
  ) as url
FROM storage.objects
WHERE bucket_id = 'avatar_images'
  AND name IS NOT NULL
ON CONFLICT (filename) DO UPDATE 
  SET url = EXCLUDED.url,
      created_at = now();

-- Add a comment about the migration
COMMENT ON TABLE public.avatar_images IS 'Avatar images populated from avatar_images storage bucket on 2025-12-29';
