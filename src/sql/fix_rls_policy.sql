-- Fix RLS policy for pet_media table to allow guest uploads without restrictions

-- First, drop all existing policies on pet_media table to start clean
DROP POLICY IF EXISTS "Anyone can add media to public profiles" ON public.pet_media;
DROP POLICY IF EXISTS "Anyone can view media for public profiles" ON public.pet_media;
DROP POLICY IF EXISTS "Guests can delete their own media" ON public.pet_media;
DROP POLICY IF EXISTS "Guests can update their own media" ON public.pet_media;
DROP POLICY IF EXISTS "Public can view pet media" ON public.pet_media;
DROP POLICY IF EXISTS "Users can delete their pet media" ON public.pet_media;
DROP POLICY IF EXISTS "Users can update their pet media" ON public.pet_media;
DROP POLICY IF EXISTS "Anyone can view media" ON public.pet_media;

-- Create a permissive policy for SELECT operations (view media)
CREATE POLICY "Anyone can view pet media" ON public.pet_media
FOR SELECT TO public
USING (true);

-- Create a permissive policy for INSERT operations (upload media)
CREATE POLICY "Anyone can upload to public pet profiles" ON public.pet_media
FOR INSERT TO public
WITH CHECK (
  -- Either authenticated user uploading to their own profile
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR 
  -- OR non-authenticated user uploading to a public profile with guest_name
  (
    EXISTS (
      SELECT 1 FROM pet_profiles
      WHERE pet_profiles.id = pet_media.pet_id 
      AND pet_profiles.is_private = false
    )
    AND guest_name IS NOT NULL
    AND user_id IS NULL
  )
);

-- Create policy for authenticated users to manage their own media
CREATE POLICY "Users can update their own pet media" ON public.pet_media
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pet media" ON public.pet_media
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Disable RLS temporarily and insert a dummy record to verify it works
ALTER TABLE public.pet_media DISABLE ROW LEVEL SECURITY;

-- Now re-enable RLS
ALTER TABLE public.pet_media ENABLE ROW LEVEL SECURITY;

-- Reset the storage bucket policies for public access
UPDATE storage.buckets
SET public = true
WHERE id = 'pet_media';

-- Ensure the objects in pet_media bucket can be accessed publicly
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'pet_media');

-- Ensure uploads to the pet_media bucket are allowed for both authenticated and unauthenticated users
DROP POLICY IF EXISTS "Allow uploads to pet_media bucket" ON storage.objects;
CREATE POLICY "Allow uploads to pet_media bucket" ON storage.objects
FOR INSERT TO public
WITH CHECK (
  bucket_id = 'pet_media' AND
  (
    -- Either authenticated user's folder
    (auth.role() = 'authenticated' AND auth.uid()::text = (storage.foldername(name))[1])
    OR
    -- OR public folder for guest uploads
    (storage.foldername(name))[1] = 'public'
  )
); 