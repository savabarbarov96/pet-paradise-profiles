import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

export interface PetProfile {
  id?: string;
  name: string;
  traits: string[];
  bio?: string;
  behaviors?: string;
  birthDate?: string;
  deathDate?: string;
  species?: 'dog' | 'cat' | 'other';
  breed?: string;
  favoriteThings?: string[];
  featured_media_url?: string;
  gender?: 'male' | 'female' | 'unknown';
  is_private?: boolean;
}

// Mock data for testing or when database connection fails
export const getMockPetProfiles = (): PetProfile[] => {
  console.log('Generating mock pet profiles');
  const mockProfiles: PetProfile[] = [
    {
      id: 'mock-1',
      name: 'Buddy',
      species: 'dog' as const,
      breed: 'Golden Retriever',
      traits: ['Friendly', 'Playful', 'Loyal'],
      featured_media_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=912&q=80',
      gender: 'male' as const
    },
    {
      id: 'mock-2',
      name: 'Whiskers',
      species: 'cat' as const,
      breed: 'Tabby',
      traits: ['Independent', 'Curious', 'Playful'],
      featured_media_url: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
      gender: 'female' as const
    },
    {
      id: 'mock-3',
      name: 'Luna',
      species: 'dog' as const,
      breed: 'Husky',
      traits: ['Energetic', 'Friendly', 'Smart'],
      featured_media_url: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
      gender: 'female' as const
    }
  ];
  console.log('Mock profiles generated:', mockProfiles);
  return mockProfiles;
};

export const createPetProfile = async (
  profile: PetProfile, 
  primaryImage: string | null,
  additionalImages: string[] = []
): Promise<{ success: boolean; error?: string; profileId?: string }> => {
  try {
    // First check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: "You must be logged in to create a pet profile" };
    }

    let primaryMediaUrl = null;
    
    // If there's a primary image, upload it to storage
    if (primaryImage) {
      const imageData = primaryImage.split(',')[1]; // Remove the data URL prefix
      const fileName = `${uuidv4()}.jpg`;
      const filePath = `${session.user.id}/${fileName}`;
      
      // Convert base64 to binary data using browser-compatible method
      const binaryData = atob(imageData);
      const arrayBuffer = new Uint8Array(binaryData.length);
      for (let i = 0; i < binaryData.length; i++) {
        arrayBuffer[i] = binaryData.charCodeAt(i);
      }
      
      // Upload image to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('pet_media')
        .upload(filePath, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return { success: false, error: `Error uploading image: ${uploadError.message}` };
      }

      // Get the public URL for the uploaded image
      const { data: { publicUrl } } = supabase
        .storage
        .from('pet_media')
        .getPublicUrl(filePath);
      
      primaryMediaUrl = publicUrl;
    }

    // Create pet profile in database - note: is_private defaults to false in the database
    const { data: profileData, error: profileError } = await supabase
      .from('pet_profiles')
      .insert([{
        name: profile.name,
        traits: profile.traits,
        bio: profile.bio || '',
        birth_date: profile.birthDate || null,
        death_date: profile.deathDate || null,
        species: profile.species || 'other',
        breed: profile.breed || '',
        // Temporarily store favoriteThings as part of the traits array
        // favorite_things: profile.favoriteThings || [],
        featured_media_url: primaryMediaUrl,
        user_id: session.user.id,
        is_private: profile.is_private || false,
        can_remember_photo: true  // Always allow photo tributes, regardless of privacy setting
      }])
      .select('id')
      .single();

    if (profileError) {
      console.error('Error creating pet profile:', profileError);
      return { success: false, error: `Error creating profile: ${profileError.message}` };
    }

    // If primary image was uploaded, create entry in pet_media table
    if (primaryMediaUrl) {
      const { error: mediaError } = await supabase
        .from('pet_media')
        .insert([{
          pet_id: profileData.id,
          user_id: session.user.id,
          storage_path: primaryMediaUrl,
          media_type: 'image',
          is_featured: true
        }]);

      if (mediaError) {
        console.error('Error recording primary media:', mediaError);
        // Continue anyway as the profile is created
      }
    }
    
    // Process additional images if provided
    if (additionalImages && additionalImages.length > 0) {
      for (const imageDataUrl of additionalImages) {
        if (!imageDataUrl) continue;
        
        try {
          const imageData = imageDataUrl.split(',')[1];
          const fileName = `${uuidv4()}.jpg`;
          const filePath = `${session.user.id}/${fileName}`;
          
          const binaryData = atob(imageData);
          const arrayBuffer = new Uint8Array(binaryData.length);
          for (let i = 0; i < binaryData.length; i++) {
            arrayBuffer[i] = binaryData.charCodeAt(i);
          }
          
          const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('pet_media')
            .upload(filePath, arrayBuffer, {
              contentType: 'image/jpeg',
              upsert: false
            });
            
          if (uploadError) {
            console.error('Error uploading additional image:', uploadError);
            continue; // Skip this image but continue with others
          }
          
          const { data: { publicUrl } } = supabase
            .storage
            .from('pet_media')
            .getPublicUrl(filePath);
            
          // Add to pet_media table
          await supabase
            .from('pet_media')
            .insert([{
              pet_id: profileData.id,
              user_id: session.user.id,
              storage_path: publicUrl,
              media_type: 'image',
              is_featured: false
            }]);
            
        } catch (error) {
          console.error('Error processing additional image:', error);
          // Continue with other images
        }
      }
    }

    return { 
      success: true, 
      profileId: profileData.id 
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { 
      success: false, 
      error: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};

export const getUserPetProfiles = async (): Promise<{ success: boolean; data?: PetProfile[]; error?: string }> => {
  console.log('Fetching user pet profiles...');
  try {
    // Check if user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Auth session check:', { session: !!session, error: sessionError });

    if (sessionError) {
      console.error('Session error:', sessionError);
      return { success: false, error: "Authentication error: " + sessionError.message };
    }

    if (!session) {
      console.log('No active session found');
      return { success: false, error: "You must be logged in to view pet profiles" };
    }

    console.log('Fetching profiles for user:', session.user.id);

    // Fetch profiles belonging to the current user
    const { data, error } = await supabase
      .from('pet_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pet profiles:', error);
      return { success: false, error: `Error fetching profiles: ${error.message}` };
    }

    if (!data || data.length === 0) {
      console.log('No profiles found for user');
      return { success: true, data: [] };
    }

    console.log('Successfully fetched profiles:', data);
    return { 
      success: true, 
      data: data as PetProfile[]
    };
  } catch (error) {
    console.error('Unexpected error in getUserPetProfiles:', error);
    return { 
      success: false, 
      error: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};

export const deletePetProfile = async (profileId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: "You must be logged in to delete a pet profile" };
    }

    // First, get the pet profile to verify ownership
    const { data: profileData, error: fetchError } = await supabase
      .from('pet_profiles')
      .select('user_id')
      .eq('id', profileId)
      .single();

    if (fetchError) {
      console.error('Error fetching pet profile:', fetchError);
      return { success: false, error: `Error finding profile: ${fetchError.message}` };
    }

    // Verify the profile belongs to the current user
    if (profileData.user_id !== session.user.id) {
      return { success: false, error: "You do not have permission to delete this profile" };
    }

    // Get all media associated with this pet
    const { data: mediaData, error: mediaError } = await supabase
      .from('pet_media')
      .select('storage_path')
      .eq('pet_id', profileId);

    if (!mediaError && mediaData) {
      // Delete each media file from storage
      for (const media of mediaData) {
        try {
          // Extract the path from the public URL
          const pathMatch = media.storage_path.match(/\/storage\/v1\/object\/public\/pet_media\/(.*)/);
          if (pathMatch && pathMatch[1]) {
            await supabase.storage.from('pet_media').remove([pathMatch[1]]);
          }
        } catch (error) {
          console.error('Error deleting media file:', error);
          // Continue with deletion even if some files can't be removed
        }
      }
    }

    // Delete related records from pet_media table
    const { error: deleteMediaError } = await supabase
      .from('pet_media')
      .delete()
      .eq('pet_id', profileId);

    if (deleteMediaError) {
      console.error('Error deleting media records:', deleteMediaError);
      // Continue with profile deletion anyway
    }

    // Delete pet profile
    const { error: deleteError } = await supabase
      .from('pet_profiles')
      .delete()
      .eq('id', profileId);

    if (deleteError) {
      console.error('Error deleting pet profile:', deleteError);
      return { success: false, error: `Error deleting profile: ${deleteError.message}` };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { 
      success: false, 
      error: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};

// Update pet profile privacy setting
export const updateProfilePrivacy = async (
  profileId: string,
  isPrivate: boolean
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: "Трябва да сте влезли в профила си, за да промените настройките за поверителност" };
    }

    // First, get the pet profile to verify ownership
    const { data: profileData, error: fetchError } = await supabase
      .from('pet_profiles')
      .select('user_id')
      .eq('id', profileId)
      .single();

    if (fetchError) {
      console.error('Error fetching pet profile:', fetchError);
      return { success: false, error: `Грешка при намиране на профила: ${fetchError.message}` };
    }

    // Verify the profile belongs to the current user
    if (profileData.user_id !== session.user.id) {
      return { success: false, error: "Нямате права да промените този профил" };
    }

    // Update the privacy setting
    const { error: updateError } = await supabase
      .from('pet_profiles')
      .update({ is_private: isPrivate })
      .eq('id', profileId);

    if (updateError) {
      console.error('Error updating privacy setting:', updateError);
      return { success: false, error: `Грешка при обновяване на настройките: ${updateError.message}` };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error updating privacy:', error);
    return { 
      success: false, 
      error: `Възникна неочаквана грешка: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};
