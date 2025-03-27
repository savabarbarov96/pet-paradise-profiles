-- This migration file adds the 'favorite_things' column to the pet_profiles table
-- Needed to support the pet profile creation functionality

-- Check if the column exists and add it if it doesn't
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pet_profiles' 
        AND column_name = 'favorite_things'
    ) THEN
        ALTER TABLE public.pet_profiles ADD COLUMN favorite_things TEXT[] DEFAULT '{}'::TEXT[];
    END IF;

    -- Also check for the behaviors column and add it if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pet_profiles' 
        AND column_name = 'behaviors'
    ) THEN
        ALTER TABLE public.pet_profiles ADD COLUMN behaviors TEXT DEFAULT '';
    END IF;
END
$$; 