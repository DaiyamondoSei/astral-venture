
import { supabase } from '@/lib/supabaseClient';

export interface EnergyReflection {
  id: string;
  created_at: string;
  user_id: string;
  content: string;
  points_earned: number;
}

export const fetchUserReflections = async (userId: string, limit: number = 50): Promise<EnergyReflection[]> => {
  try {
    const { data, error } = await supabase
      .from('energy_reflections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching reflections:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching reflections:', error);
    return [];
  }
};

export const addReflection = async (userId: string, content: string, points_earned: number, metadata?: any): Promise<EnergyReflection | null> => {
  try {
    const insertData = {
      user_id: userId,
      content: content,
      points_earned: points_earned,
      ...metadata
    };
    
    const { data, error } = await supabase
      .from('energy_reflections')
      .insert([insertData])
      .select('*')
      .single();

    if (error) {
      console.error('Error adding reflection:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error adding reflection:', error);
    return null;
  }
};

// Function to save reflection (for backward compatibility)
export const saveReflection = addReflection;

// Function to update user points
export const updateUserPoints = async (userId: string, pointsToAdd: number) => {
  try {
    // First, get the current points
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('energy_points')
      .eq('id', userId)
      .single();
      
    if (profileError) throw profileError;
    
    const currentPoints = profileData?.energy_points || 0;
    const newPoints = currentPoints + pointsToAdd;
    
    // Update the user's points
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ energy_points: newPoints })
      .eq('id', userId);
      
    if (error) throw error;
    return newPoints;
  } catch (error) {
    console.error('Error updating user points:', error);
    throw error;
  }
};

// Function to save emotional analysis for a user
export const saveEmotionalAnalysis = async (userId: string, analysisData: object) => {
  try {
    // Fix the type issue by using a type assertion to any
    const { data, error } = await supabase
      .from('emotional_analysis' as any)
      .insert([
        {
          user_id: userId,
          analysis_data: analysisData
        }
      ]);
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving emotional analysis:', error);
    throw error;
  }
};

// Function to fetch emotional analysis for a user
export const fetchEmotionalAnalysis = async (userId: string) => {
  try {
    // Fix the type issue by using a type assertion to any
    const { data, error } = await supabase
      .from('emotional_analysis' as any)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (error) throw error;
    // Handle the potential undefined analysis_data with proper type checking
    return data && data.length > 0 ? data[0].analysis_data : null;
  } catch (error) {
    console.error('Error fetching emotional analysis:', error);
    return null;
  }
};
