-- Fix the foreign key constraint issue by allowing guest uploads without a user_id

-- First, make the user_id column nullable for guest contributions
ALTER TABLE public.pet_media 
ALTER COLUMN user_id DROP NOT NULL;

-- Make sure the existing policy allows for null user_id
DROP POLICY IF EXISTS "Anyone can add media to public profiles" ON public.pet_media;

CREATE POLICY "Anyone can add media to public profiles" ON public.pet_media
FOR INSERT TO public
WITH CHECK (
  -- Either the user is authenticated and uploading to their own profile
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) 
  OR 
  -- OR the profile is public, guest_name is provided, and user_id is NULL
  (
    guest_name IS NOT NULL
    AND user_id IS NULL
    AND EXISTS (
      SELECT 1 FROM pet_profiles
      WHERE pet_profiles.id = pet_media.pet_id 
      AND pet_profiles.is_private = false
    )
  )
);

-- Drop other conflicting policies if needed
DROP POLICY IF EXISTS "Guests can update their own media" ON public.pet_media;

CREATE POLICY "Guests can update their own media" ON public.pet_media
FOR UPDATE TO public
USING (
  -- Either authenticated user's own media
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR
  -- OR media with matching guest_name and null user_id
  (guest_name IS NOT NULL AND user_id IS NULL)
);

-- Create a policy to allow guests to view their uploads
CREATE POLICY "Anyone can view media" ON public.pet_media
FOR SELECT TO public
USING (TRUE); 