import { supabase } from "@/integrations/supabase/client";

export interface NotificationPreferences {
  id?: string;
  user_id?: string;
  email_frequency: 'daily' | 'weekly' | 'never';
  notify_new_stories: boolean;
  notify_comments: boolean;
  notify_system_updates: boolean;
  last_notification_sent?: string;
  created_at?: string;
  updated_at?: string;
}

export const getNotificationPreferences = async (): Promise<{ 
  success: boolean; 
  data?: NotificationPreferences; 
  error?: string 
}> => {
  try {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: "You must be logged in to access notification preferences" };
    }

    // Fetch notification preferences for current user
    const { data, error } = await supabase
      .from('user_notification_preferences')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (error) {
      // If no record is found, we'll create default preferences
      if (error.code === 'PGRST116') {
        return await createDefaultNotificationPreferences();
      }
      
      console.error('Error fetching notification preferences:', error);
      return { success: false, error: `Error fetching preferences: ${error.message}` };
    }

    return { 
      success: true, 
      data: data as unknown as NotificationPreferences
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { 
      success: false, 
      error: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};

export const updateNotificationPreferences = async (
  preferences: Partial<NotificationPreferences>
): Promise<{ 
  success: boolean; 
  data?: NotificationPreferences; 
  error?: string 
}> => {
  try {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: "You must be logged in to update notification preferences" };
    }

    // First check if preferences exist
    const { data: existingData, error: fetchError } = await supabase
      .from('user_notification_preferences')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (fetchError) {
      // If no record is found, we'll create one with the provided preferences
      if (fetchError.code === 'PGRST116') {
        return await createDefaultNotificationPreferences(preferences);
      }
      
      console.error('Error fetching notification preferences:', fetchError);
      return { success: false, error: `Error fetching preferences: ${fetchError.message}` };
    }

    // Update the existing preferences
    const { data, error } = await supabase
      .from('user_notification_preferences')
      .update({
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingData.id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating notification preferences:', error);
      return { success: false, error: `Error updating preferences: ${error.message}` };
    }

    return { 
      success: true, 
      data: data as unknown as NotificationPreferences
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { 
      success: false, 
      error: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};

const createDefaultNotificationPreferences = async (
  customPreferences?: Partial<NotificationPreferences>
): Promise<{ 
  success: boolean; 
  data?: NotificationPreferences; 
  error?: string 
}> => {
  try {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: "You must be logged in to create notification preferences" };
    }

    // Default preferences
    const defaultPreferences: Partial<NotificationPreferences> = {
      user_id: session.user.id,
      email_frequency: 'weekly',
      notify_new_stories: true,
      notify_comments: true,
      notify_system_updates: true
    };

    // Merge with custom preferences if provided
    const preferencesToInsert = customPreferences 
      ? { ...defaultPreferences, ...customPreferences }
      : defaultPreferences;

    // Insert the preferences
    const { data, error } = await supabase
      .from('user_notification_preferences')
      .insert([preferencesToInsert])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating notification preferences:', error);
      return { success: false, error: `Error creating preferences: ${error.message}` };
    }

    return { 
      success: true, 
      data: data as unknown as NotificationPreferences
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { 
      success: false, 
      error: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}; 