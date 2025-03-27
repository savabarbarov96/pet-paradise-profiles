-- This migration file adds the 'is_private' column to the pet_profiles table
-- Needed to support private/public profile functionality

-- Check if the column exists and add it if it doesn't
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pet_profiles' 
        AND column_name = 'is_private'
    ) THEN
        ALTER TABLE public.pet_profiles ADD COLUMN is_private BOOLEAN DEFAULT false;
    END IF;
END
$$; 