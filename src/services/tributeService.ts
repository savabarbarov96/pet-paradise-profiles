import { supabase } from "@/integrations/supabase/client";

export interface Tribute {
  id?: string;
  created_at?: string;
  pet_id: string;
  user_id?: string;
  message: string;
  author_name: string;
}

// Fetch tributes for a pet
export const fetchTributes = async (petId: string): Promise<Tribute[]> => {
  // No need to check if user is authenticated for fetching tributes
  // The RLS policy will handle access control for private vs public profiles
  const { data, error } = await supabase
    .from('pet_tributes')
    .select('*')
    .eq('pet_id', petId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching tributes:", error);
    return [];
  }

  return data || [];
};

// Add a tribute for a pet
export const addTribute = async (tribute: Tribute): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if this is a public profile first
    const { data: profileData, error: profileError } = await supabase
      .from('pet_profiles')
      .select('is_private')
      .eq('id', tribute.pet_id)
      .single();
    
    if (profileError) {
      console.error("Error checking profile privacy:", profileError);
      return { success: false, error: "Could not verify profile access" };
    }
    
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    const isPublicProfile = !profileData.is_private;
    
    // If the profile is private, user must be logged in
    if (!isPublicProfile && !session) {
      return { success: false, error: "You must be logged in to add tributes to private profiles" };
    }
    
    const { error } = await supabase
      .from('pet_tributes')
      .insert([{
        pet_id: tribute.pet_id,
        user_id: session?.user?.id || null, // Allow null for anonymous users
        message: tribute.message,
        author_name: tribute.author_name
      }]);

    if (error) {
      console.error("Error adding tribute:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error adding tribute:", error);
    return { 
      success: false, 
      error: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}; 