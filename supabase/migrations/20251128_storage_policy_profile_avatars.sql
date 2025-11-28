-- Enable RLS for storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read all files in profile-avatars bucket
CREATE POLICY "Allow authenticated users to read profile avatars"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'profile-avatars');

-- Policy: Authenticated users can view profile-avatars bucket
CREATE POLICY "Allow authenticated users to list profile avatars"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'profile-avatars');
