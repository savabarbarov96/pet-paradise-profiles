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
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    
    const { error } = await supabase
      .from('pet_tributes')
      .insert([{
        pet_id: tribute.pet_id,
        user_id: session?.user?.id,
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