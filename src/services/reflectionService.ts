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

export const addReflection = async (userId: string, content: string, points_earned: number): Promise<EnergyReflection | null> => {
  try {
    const { data, error } = await supabase
      .from('energy_reflections')
      .insert([
        { user_id: userId, content: content, points_earned: points_earned }
      ])
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

// Function to save emotional analysis for a user
export const saveEmotionalAnalysis = async (userId: string, analysisData: object) => {
  try {
    // Cast as any to bypass TypeScript errors until Supabase types are updated
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
    // Cast as any to bypass TypeScript errors until Supabase types are updated
    const { data, error } = await supabase
      .from('emotional_analysis' as any)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (error) throw error;
    return data && data.length > 0 ? data[0].analysis_data : null;
  } catch (error) {
    console.error('Error fetching emotional analysis:', error);
    return null;
  }
};
