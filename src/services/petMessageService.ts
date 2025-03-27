import { supabase } from "@/integrations/supabase/client";

export interface PetMessage {
  id?: string;
  pet_id: string;
  message_text: string;
  created_at?: string;
  updated_at?: string;
  is_ai_generated: boolean;
  message_type: 'story' | 'memory' | 'tribute' | 'other';
}

/**
 * Create a new message for a pet
 */
export const createPetMessage = async (
  message: PetMessage
): Promise<{ success: boolean; error?: string; messageId?: string }> => {
  try {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: "Трябва да сте влезли в профила си, за да създадете съобщение" };
    }

    // Create message in database
    const { data, error } = await supabase
      .from('pet_messages')
      .insert([{
        pet_id: message.pet_id,
        message_text: message.message_text,
        is_ai_generated: message.is_ai_generated,
        message_type: message.message_type,
        user_id: session.user.id
      }])
      .select('id')
      .single();

    if (error) {
      console.error('Error creating pet message:', error);
      return { success: false, error: `Грешка при създаване на съобщение: ${error.message}` };
    }

    return { 
      success: true, 
      messageId: data.id 
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { 
      success: false, 
      error: `Възникна неочаквана грешка: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};

/**
 * Get all messages for a specific pet
 */
export const getPetMessages = async (
  petId: string
): Promise<{ success: boolean; data?: PetMessage[]; error?: string }> => {
  try {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: "Трябва да сте влезли в профила си, за да видите съобщенията" };
    }

    // Fetch all messages for the pet
    const { data, error } = await supabase
      .from('pet_messages')
      .select('*')
      .eq('pet_id', petId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pet messages:', error);
      return { success: false, error: `Грешка при зареждане на съобщения: ${error.message}` };
    }

    return { 
      success: true, 
      data: data as PetMessage[]
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { 
      success: false, 
      error: `Възникна неочаквана грешка: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};

/**
 * Update an existing pet message
 */
export const updatePetMessage = async (
  messageId: string,
  updates: Partial<PetMessage>
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: "Трябва да сте влезли в профила си, за да редактирате съобщение" };
    }

    // First verify ownership of the message
    const { data: messageData, error: fetchError } = await supabase
      .from('pet_messages')
      .select('user_id')
      .eq('id', messageId)
      .single();

    if (fetchError) {
      console.error('Error fetching message:', fetchError);
      return { success: false, error: `Грешка при намиране на съобщение: ${fetchError.message}` };
    }

    if (messageData.user_id !== session.user.id) {
      return { success: false, error: "Нямате право да редактирате това съобщение" };
    }

    // Update the message
    const { error: updateError } = await supabase
      .from('pet_messages')
      .update({
        message_text: updates.message_text,
        message_type: updates.message_type,
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId);

    if (updateError) {
      console.error('Error updating message:', updateError);
      return { success: false, error: `Грешка при обновяване на съобщение: ${updateError.message}` };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { 
      success: false, 
      error: `Възникна неочаквана грешка: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};

/**
 * Delete a pet message
 */
export const deletePetMessage = async (
  messageId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: "Трябва да сте влезли в профила си, за да изтриете съобщение" };
    }

    // First verify ownership of the message
    const { data: messageData, error: fetchError } = await supabase
      .from('pet_messages')
      .select('user_id')
      .eq('id', messageId)
      .single();

    if (fetchError) {
      console.error('Error fetching message:', fetchError);
      return { success: false, error: `Грешка при намиране на съобщение: ${fetchError.message}` };
    }

    if (messageData.user_id !== session.user.id) {
      return { success: false, error: "Нямате право да изтриете това съобщение" };
    }

    // Delete the message
    const { error: deleteError } = await supabase
      .from('pet_messages')
      .delete()
      .eq('id', messageId);

    if (deleteError) {
      console.error('Error deleting message:', deleteError);
      return { success: false, error: `Грешка при изтриване на съобщение: ${deleteError.message}` };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { 
      success: false, 
      error: `Възникна неочаквана грешка: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}; 