-- Add missing guest_name column to pet_media table
ALTER TABLE public.pet_media
ADD COLUMN IF NOT EXISTS guest_name text;

-- Update the existing policy to include scenarios where guest_name is provided but user isn't authenticated
DROP POLICY IF EXISTS "Anyone can add media to public profiles" ON public.pet_media;

CREATE POLICY "Anyone can add media to public profiles" ON public.pet_media
FOR INSERT TO public
WITH CHECK (
  -- Either the user is authenticated and uploading to their own profile
  (auth.uid() = user_id) 
  OR 
  -- OR the profile is public (no auth needed in this case) and guest_name is provided
  (
    guest_name IS NOT NULL
    AND
    EXISTS (
      SELECT 1 FROM pet_profiles
      WHERE pet_profiles.id = pet_media.pet_id 
      AND pet_profiles.is_private = false
    )
  )
);

-- Make sure the existing policy for updates also considers guest_name
DROP POLICY IF EXISTS "Guests can update their own media" ON public.pet_media;

CREATE POLICY "Guests can update their own media" ON public.pet_media
FOR UPDATE TO public
USING (
  -- Either authenticated user's own media
  (auth.uid() = user_id)
  OR
  -- OR media with matching guest_name
  (guest_name IS NOT NULL AND guest_user_id IS NOT NULL)
); 