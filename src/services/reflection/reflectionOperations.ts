
import { supabase } from '@/lib/supabaseClient';
import { updateUserPoints } from './userOperations';

// Create reflection
export const createReflection = async (userId: string, content: string, topicId?: string): Promise<string | null> => {
  try {
    // Insert reflection into database
    const { data, error } = await supabase
      .from('reflections')
      .insert({
        user_id: userId,
        content,
        topic_id: topicId
      })
      .select('id')
      .single();
    
    if (error) throw error;
    
    // If successful, award points to the user
    if (data?.id) {
      await updateUserPoints(userId, 10);
    }
    
    return data?.id || null;
  } catch (error) {
    console.error('Error creating reflection:', error);
    return null;
  }
};

// Get user reflections
export const getUserReflections = async (userId: string, limit: number = 10): Promise<any[]> => {
  try {
    // Fetch reflections from database
    const { data, error } = await supabase
      .from('reflections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching reflections:', error);
    return [];
  }
};

// Get reflection by ID
export const getReflectionById = async (reflectionId: string): Promise<any | null> => {
  try {
    // Fetch reflection from database
    const { data, error } = await supabase
      .from('reflections')
      .select('*')
      .eq('id', reflectionId)
      .single();
    
    if (error) throw error;
    
    return data || null;
  } catch (error) {
    console.error('Error fetching reflection:', error);
    return null;
  }
};

// Update reflection
export const updateReflection = async (reflectionId: string, content: string): Promise<boolean> => {
  try {
    // Update reflection in database
    const { error } = await supabase
      .from('reflections')
      .update({ content, updated_at: new Date() })
      .eq('id', reflectionId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating reflection:', error);
    return false;
  }
};

// Delete reflection
export const deleteReflection = async (reflectionId: string): Promise<boolean> => {
  try {
    // Delete reflection from database
    const { error } = await supabase
      .from('reflections')
      .delete()
      .eq('id', reflectionId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting reflection:', error);
    return false;
  }
};

// Save reflection with points awarded for challenge completion
export const saveReflectionWithChallenge = async (
  userId: string, 
  content: string, 
  challengeId: string
): Promise<string | null> => {
  try {
    // Insert reflection into database
    const { data, error } = await supabase
      .from('reflections')
      .insert({
        user_id: userId,
        content,
        challenge_id: challengeId
      })
      .select('id')
      .single();
    
    if (error) throw error;
    
    // If successful, award points to the user (extra points for challenge completion)
    if (data?.id) {
      await updateUserPoints(userId, 25);
    }
    
    return data?.id || null;
  } catch (error) {
    console.error('Error saving reflection with challenge:', error);
    return null;
  }
};
