-- This migration file adds the 'user_notification_preferences' table
-- Needed to support the notification preferences functionality

-- Create the user_notification_preferences table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_notification_preferences'
    ) THEN
        CREATE TABLE public.user_notification_preferences (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            email_frequency TEXT NOT NULL DEFAULT 'weekly',
            notify_new_stories BOOLEAN NOT NULL DEFAULT true,
            notify_comments BOOLEAN NOT NULL DEFAULT true,
            notify_system_updates BOOLEAN NOT NULL DEFAULT true,
            last_notification_sent TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );

        -- Add RLS policies
        ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their own notification preferences" 
            ON public.user_notification_preferences FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can create their own notification preferences" 
            ON public.user_notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can update their own notification preferences" 
            ON public.user_notification_preferences FOR UPDATE USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can delete their own notification preferences" 
            ON public.user_notification_preferences FOR DELETE USING (auth.uid() = user_id);
    END IF;
END
$$; 