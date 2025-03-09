
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export interface EnergyReflection {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  dominant_emotion?: string;
  emotional_depth?: number;
  chakras_activated?: any;
  points_earned: number;
}

/**
 * Get all reflections for a user
 */
export async function getUserReflections(userId: string): Promise<EnergyReflection[]> {
  try {
    const { data, error } = await supabase
      .from('energy_reflections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching reflections:', error);
    return [];
  }
}

/**
 * Get a specific reflection by ID
 */
export async function getReflectionById(reflectionId: string): Promise<EnergyReflection | null> {
  try {
    const { data, error } = await supabase
      .from('energy_reflections')
      .select('*')
      .eq('id', reflectionId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching reflection:', error);
    return null;
  }
}

/**
 * Save a new reflection
 */
export async function saveReflection(reflection: Omit<EnergyReflection, 'id' | 'created_at'>): Promise<EnergyReflection | null> {
  try {
    const newReflection = {
      id: uuidv4(),
      ...reflection,
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('energy_reflections')
      .insert(newReflection)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving reflection:', error);
    return null;
  }
}

/**
 * Update an existing reflection
 */
export async function updateReflection(reflectionId: string, updates: Partial<EnergyReflection>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('energy_reflections')
      .update(updates)
      .eq('id', reflectionId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating reflection:', error);
    return false;
  }
}

/**
 * Delete a reflection
 */
export async function deleteReflection(reflectionId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('energy_reflections')
      .delete()
      .eq('id', reflectionId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting reflection:', error);
    return false;
  }
}

/**
 * Get recent reflections for a user
 */
export async function getRecentReflections(userId: string, limit = 5): Promise<EnergyReflection[]> {
  try {
    const { data, error } = await supabase
      .from('energy_reflections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching recent reflections:', error);
    return [];
  }
}
