import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

export interface MediaItem {
  id: string;
  url: string;
  thumbnail?: string;
  type: 'photo' | 'video';
  size?: number;
  title?: string;
  description?: string;
  created_at?: string;
}

/**
 * Fetch all media items for a specific pet profile
 */
export const fetchPetMedia = async (
  petId: string
): Promise<{ success: boolean; data?: MediaItem[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('pet_media')
      .select('*')
      .eq('pet_id', petId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pet media:', error);
      return { success: false, error: `Error fetching media: ${error.message}` };
    }

    if (!data || data.length === 0) {
      // No media found, return empty array
      return { success: true, data: [] };
    }

    // Transform the data to match the MediaItem interface
    const mediaItems: MediaItem[] = data.map(item => ({
      id: item.id,
      url: item.storage_path,
      thumbnail: item.storage_path, // For now, using the same URL for thumbnail
      type: item.media_type as 'photo' | 'video',
      title: item.title || undefined,
      description: item.description || undefined,
      created_at: item.created_at
    }));

    return { success: true, data: mediaItems };
  } catch (error) {
    console.error('Unexpected error in fetchPetMedia:', error);
    return { 
      success: false, 
      error: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};

/**
 * Upload media (images or videos) to a pet profile
 */
export const uploadPetMedia = async (
  petId: string,
  files: File[],
  isPublicProfile: boolean = false,
  guestName: string = 'Anonymous Guest'
): Promise<{ success: boolean; data?: MediaItem[]; error?: string }> => {
  try {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session && !isPublicProfile) {
      return { success: false, error: "You must be logged in to upload media" };
    }

    // For anonymous uploads to public profiles, we'll use a special path
    const userId = session?.user.id || 'public';

    const uploadedMedia: MediaItem[] = [];

    for (const file of files) {
      try {
        // Generate unique file name
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        let filePath = '';
        
        // Use different path structure depending on whether it's a public upload
        if (isPublicProfile) {
          filePath = `public/${petId}/${fileName}`;
        } else {
          filePath = `${userId}/${petId}/${fileName}`;
        }

        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('pet_media')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          continue; // Skip this file but continue with others
        }

        // Get public URL for the uploaded file
        const { data: { publicUrl } } = supabase
          .storage
          .from('pet_media')
          .getPublicUrl(filePath);

        // Determine media type
        const mediaType = file.type.startsWith('image/') ? 'photo' : 'video';

        // Create entry in pet_media table
        const mediaRecord = {
          pet_id: petId,
          user_id: userId,
          storage_path: publicUrl,
          media_type: mediaType,
          is_featured: false,
          title: file.name,
          description: ''
        };

        // Add guest_name for public profiles without authentication
        if (isPublicProfile && !session) {
          // @ts-ignore - We know this exists in the database even if it's not in the type
          mediaRecord.guest_name = guestName;
        }

        const { data: mediaData, error: mediaError } = await supabase
          .from('pet_media')
          .insert([mediaRecord])
          .select('id')
          .single();

        if (mediaError) {
          console.error('Error creating media record:', mediaError);
          continue;
        }

        // Add to list of uploaded media
        uploadedMedia.push({
          id: mediaData.id,
          url: publicUrl,
          thumbnail: publicUrl,
          type: mediaType as 'photo' | 'video',
          size: file.size,
          title: file.name
        });

      } catch (error) {
        console.error('Error processing file:', error);
        // Continue with other files
      }
    }

    if (uploadedMedia.length === 0) {
      return { success: false, error: 'Failed to upload any media files' };
    }

    return { success: true, data: uploadedMedia };
  } catch (error) {
    console.error('Unexpected error in uploadPetMedia:', error);
    return { 
      success: false, 
      error: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};

/**
 * Delete a media item from a pet profile
 */
export const deletePetMedia = async (
  mediaId: string,
  isPublicProfile: boolean = false
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session && !isPublicProfile) {
      return { success: false, error: "You must be logged in to delete media" };
    }

    // First, get the media item details
    const { data: mediaData, error: fetchError } = await supabase
      .from('pet_media')
      .select('storage_path, user_id, pet_id')
      .eq('id', mediaId)
      .single();

    if (fetchError) {
      console.error('Error fetching media item:', fetchError);
      return { success: false, error: `Error finding media: ${fetchError.message}` };
    }

    // If not a public profile, verify ownership
    if (!isPublicProfile && session.user.id !== mediaData.user_id) {
      return { success: false, error: "You do not have permission to delete this media" };
    }

    // Extract path from the public URL
    const pathMatch = mediaData.storage_path.match(/\/storage\/v1\/object\/public\/pet_media\/(.*)/);
    if (pathMatch && pathMatch[1]) {
      // Delete file from storage
      const { error: deleteFileError } = await supabase
        .storage
        .from('pet_media')
        .remove([pathMatch[1]]);

      if (deleteFileError) {
        console.error('Error deleting file from storage:', deleteFileError);
        // Continue with record deletion anyway
      }
    }

    // Delete record from pet_media table
    const { error: deleteError } = await supabase
      .from('pet_media')
      .delete()
      .eq('id', mediaId);

    if (deleteError) {
      console.error('Error deleting media record:', deleteError);
      return { success: false, error: `Error deleting media: ${deleteError.message}` };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error in deletePetMedia:', error);
    return { 
      success: false, 
      error: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};

/**
 * Set a media item as the featured image for a pet profile
 */
export const setFeaturedMedia = async (
  petId: string,
  mediaId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: "You must be logged in to set featured media" };
    }

    // Get the media details to update the profile
    const { data: mediaData, error: mediaError } = await supabase
      .from('pet_media')
      .select('storage_path')
      .eq('id', mediaId)
      .single();

    if (mediaError) {
      console.error('Error fetching media:', mediaError);
      return { success: false, error: `Error finding media: ${mediaError.message}` };
    }

    // Update all media items to set is_featured to false
    await supabase
      .from('pet_media')
      .update({ is_featured: false })
      .eq('pet_id', petId);

    // Set the selected media as featured
    const { error: updateMediaError } = await supabase
      .from('pet_media')
      .update({ is_featured: true })
      .eq('id', mediaId);

    if (updateMediaError) {
      console.error('Error updating media:', updateMediaError);
      return { success: false, error: `Error updating media: ${updateMediaError.message}` };
    }

    // Update the pet profile with the featured media URL
    const { error: updateProfileError } = await supabase
      .from('pet_profiles')
      .update({ featured_media_url: mediaData.storage_path })
      .eq('id', petId);

    if (updateProfileError) {
      console.error('Error updating profile:', updateProfileError);
      return { success: false, error: `Error updating profile: ${updateProfileError.message}` };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error in setFeaturedMedia:', error);
    return { 
      success: false, 
      error: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}; 