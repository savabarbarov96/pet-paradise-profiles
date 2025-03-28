-- Add is_private column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'pet_profiles' AND column_name = 'is_private'
  ) THEN
    ALTER TABLE pet_profiles ADD COLUMN is_private BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE pet_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow users to view their own profiles" ON pet_profiles;
DROP POLICY IF EXISTS "Allow users to view public profiles" ON pet_profiles;
DROP POLICY IF EXISTS "Allow users to update their own profiles" ON pet_profiles;
DROP POLICY IF EXISTS "Allow users to delete their own profiles" ON pet_profiles;
DROP POLICY IF EXISTS "Allow users to insert profiles" ON pet_profiles;

-- Create RLS Policies
-- Users can see all public profiles
CREATE POLICY "Allow users to view public profiles" 
ON pet_profiles 
FOR SELECT 
USING (is_private = false);

-- Users can see their own profiles (public or private)
CREATE POLICY "Allow users to view their own profiles" 
ON pet_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert new pet profiles
CREATE POLICY "Allow users to insert profiles" 
ON pet_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own pet profiles
CREATE POLICY "Allow users to update their own profiles" 
ON pet_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own pet profiles
CREATE POLICY "Allow users to delete their own profiles" 
ON pet_profiles 
FOR DELETE 
USING (auth.uid() = user_id); 