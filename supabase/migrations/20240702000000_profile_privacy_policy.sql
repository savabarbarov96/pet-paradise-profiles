-- This migration file adds a Row Level Security policy to restrict access to private pet profiles

-- First ensure RLS is enabled on the pet_profiles table
ALTER TABLE public.pet_profiles ENABLE ROW LEVEL SECURITY;

-- Update or create the public access policy to respect privacy settings
DO $$
BEGIN
    -- Drop existing public view policy if it exists
    IF EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'pet_profiles' 
        AND policyname = 'Public can view pet profiles'
    ) THEN
        DROP POLICY "Public can view pet profiles" ON public.pet_profiles;
    END IF;
    
    -- Create new policy that respects privacy settings
    CREATE POLICY "Public can view non-private pet profiles" 
        ON public.pet_profiles FOR SELECT 
        USING (
            is_private = false OR auth.uid() = user_id
        );
END
$$; 