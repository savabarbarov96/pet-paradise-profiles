-- Drop the existing policy that restricts inserts to guests with guest_user_id
DROP POLICY IF EXISTS "Anyone can add media to public profiles" ON public.pet_media;

-- Create a more permissive policy for uploads to public profiles
CREATE POLICY "Anyone can add media to public profiles" ON public.pet_media
FOR INSERT TO public
WITH CHECK (
  -- Either the user is authenticated and uploading to their own profile
  (auth.uid() = user_id) 
  OR 
  -- OR the profile is public (no auth needed in this case)
  (EXISTS (
    SELECT 1 FROM pet_profiles
    WHERE pet_profiles.id = pet_media.pet_id 
    AND pet_profiles.is_private = false
  ))
);

-- Make sure the storage RLS is also configured for anonymous uploads
-- First, make sure the bucket is public
UPDATE storage.buckets
SET public = true
WHERE id = 'pet_media';

-- Drop any existing policies for the pet_media bucket if they exist
DROP POLICY IF EXISTS "Allow public uploads to pet_media bucket" ON storage.objects;

-- Create a policy to allow anonymous uploads to the pet_media/public folder
CREATE POLICY "Allow public uploads to pet_media bucket" ON storage.objects
FOR INSERT TO public
WITH CHECK (
  bucket_id = 'pet_media' AND
  (
    -- Either the user is authenticated
    (auth.role() = 'authenticated' AND auth.uid()::text = (storage.foldername(name))[1])
    OR
    -- OR the upload is going to the public folder
    (storage.foldername(name))[1] = 'public'
  )
);

-- Create a policy to allow public read access to pet_media
DROP POLICY IF EXISTS "Allow public read access to pet_media" ON storage.objects;
CREATE POLICY "Allow public read access to pet_media" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'pet_media'); 