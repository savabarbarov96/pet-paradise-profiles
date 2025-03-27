
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

export interface PetProfile {
  id?: string;
  name: string;
  traits: string[];
  bio?: string;
  featured_media_url?: string;
}

export const createPetProfile = async (
  profile: PetProfile, 
  imageFile: string | null
): Promise<{ success: boolean; error?: string; profileId?: string }> => {
  try {
    // First check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: "You must be logged in to create a pet profile" };
    }

    let mediaUrl = null;
    
    // If there's an image, upload it to storage
    if (imageFile) {
      const imageData = imageFile.split(',')[1]; // Remove the data URL prefix
      const fileName = `${uuidv4()}.jpg`;
      const filePath = `${session.user.id}/${fileName}`;
      
      // Upload image to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('pet_media')
        .upload(filePath, Buffer.from(imageData, 'base64'), {
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
      
      mediaUrl = publicUrl;
    }

    // Create pet profile in database
    const { data: profileData, error: profileError } = await supabase
      .from('pet_profiles')
      .insert([{
        name: profile.name,
        traits: profile.traits,
        bio: profile.bio || '',
        featured_media_url: mediaUrl,
        user_id: session.user.id
      }])
      .select('id')
      .single();

    if (profileError) {
      console.error('Error creating pet profile:', profileError);
      return { success: false, error: `Error creating profile: ${profileError.message}` };
    }

    // If image was uploaded, also create entry in pet_media table
    if (mediaUrl) {
      const { error: mediaError } = await supabase
        .from('pet_media')
        .insert([{
          pet_id: profileData.id,
          user_id: session.user.id,
          storage_path: mediaUrl,
          media_type: 'image',
          is_featured: true
        }]);

      if (mediaError) {
        console.error('Error recording media:', mediaError);
        // Continue anyway as the profile is created
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
