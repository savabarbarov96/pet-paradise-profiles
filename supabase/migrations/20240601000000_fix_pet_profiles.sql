-- This migration file adds the 'behaviors' column to the pet_profiles table if it doesn't exist
-- Use this if you want to align the database schema with the application code instead of modifying the code

-- Check if the column exists and add it if it doesn't
DO $$
BEGIN
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

-- Verify that RLS policies are properly set up
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'pet_profiles' 
        AND policyname = 'Users can create their own pet profiles'
    ) THEN
        ALTER TABLE public.pet_profiles ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Public can view pet profiles" 
            ON public.pet_profiles FOR SELECT USING (true);
        
        CREATE POLICY "Users can create their own pet profiles" 
            ON public.pet_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can update their own pet profiles" 
            ON public.pet_profiles FOR UPDATE USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can delete their own pet profiles" 
            ON public.pet_profiles FOR DELETE USING (auth.uid() = user_id);
    END IF;
END
$$; 