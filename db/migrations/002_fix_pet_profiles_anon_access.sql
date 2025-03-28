-- First, disable RLS temporarily to make changes
ALTER TABLE pet_profiles DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow users to view their own profiles" ON pet_profiles;
DROP POLICY IF EXISTS "Allow users to view public profiles" ON pet_profiles;
DROP POLICY IF EXISTS "Public can view non-private pet profiles" ON pet_profiles;

-- Create a new policy specifically for anonymous access to public profiles
-- This policy allows ANY user (including anonymous users) to view public profiles
CREATE POLICY "Anyone can view public profiles" 
ON pet_profiles 
FOR SELECT 
USING (is_private = false);

-- Recreate policy for authenticated users to view their own profiles (private or public)
CREATE POLICY "Allow users to view their own profiles" 
ON pet_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Re-enable RLS
ALTER TABLE pet_profiles ENABLE ROW LEVEL SECURITY;

-- Set auth.role() = 'anon' for anonymous access
-- This enables Supabase to properly handle anonymous users
GRANT SELECT ON pet_profiles TO anon;
GRANT SELECT ON pet_profiles TO authenticated;

-- Fix media access policies
-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view media for public profiles" ON pet_media;

-- Create policy to allow anyone to view media for public pet profiles
CREATE POLICY "Anyone can view media for public profiles" 
ON pet_media 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM pet_profiles 
    WHERE pet_profiles.id = pet_media.pet_id 
    AND pet_profiles.is_private = false
  )
);

-- Grant access to anon role
GRANT SELECT ON pet_media TO anon;
GRANT SELECT ON pet_media TO authenticated;

-- Fix tributes access policies
-- Enable RLS on tributes if not already enabled
ALTER TABLE pet_tributes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view tributes for public profiles" ON pet_tributes;
DROP POLICY IF EXISTS "Anyone can add tributes to public profiles" ON pet_tributes;

-- Allow anyone to view tributes for public pet profiles
CREATE POLICY "Anyone can view tributes for public profiles" 
ON pet_tributes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM pet_profiles 
    WHERE pet_profiles.id = pet_tributes.pet_id 
    AND pet_profiles.is_private = false
  )
);

-- Allow anyone to add tributes to public pet profiles
CREATE POLICY "Anyone can add tributes to public profiles" 
ON pet_tributes 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM pet_profiles 
    WHERE pet_profiles.id = pet_tributes.pet_id 
    AND pet_profiles.is_private = false
  )
);

-- Grant access to tributes for anon role
GRANT SELECT, INSERT ON pet_tributes TO anon;
GRANT SELECT, INSERT ON pet_tributes TO authenticated; 