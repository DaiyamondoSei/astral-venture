
import { supabase } from '@/integrations/supabase/client';

export interface EnergyReflection {
  id: string;
  user_id: string;
  content: string;
  points_earned: number;
  created_at: string;
  dominant_emotion?: string;
  emotional_depth?: number;
  chakras_activated?: string;
}

export interface EnhancedReflectionMetadata {
  dominant_emotion?: string;
  emotional_depth?: number;
  chakras_activated?: string;
}

export const saveReflection = async (
  userId: string, 
  content: string, 
  pointsEarned: number,
  metadata?: EnhancedReflectionMetadata
) => {
  // Use type assertion since TypeScript definitions don't know about the energy_reflections table yet
  const { error } = await supabase
    .from('energy_reflections')
    .insert({
      user_id: userId,
      content: content,
      points_earned: pointsEarned,
      dominant_emotion: metadata?.dominant_emotion,
      emotional_depth: metadata?.emotional_depth,
      chakras_activated: metadata?.chakras_activated
    } as any);
    
  if (error) throw error;
};

export const updateUserPoints = async (userId: string, pointsEarned: number) => {
  // Get current points
  const { data: userData, error: fetchError } = await supabase
    .from('user_profiles')
    .select('energy_points')
    .eq('id', userId)
    .single();
    
  if (fetchError) throw fetchError;
  
  const currentPoints = userData?.energy_points || 0;
  const newPoints = currentPoints + pointsEarned;
  
  // Update user's points
  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({ 
      energy_points: newPoints,
      last_active_at: new Date().toISOString()
    })
    .eq('id', userId);
    
  if (updateError) throw updateError;
  
  return newPoints;
};

// Fetch user's recent reflections with enhanced metadata
export const fetchUserReflections = async (userId: string, limit: number = 5): Promise<EnergyReflection[]> => {
  // Type assertion to avoid TypeScript errors until types are updated
  const { data, error } = await supabase
    .from('energy_reflections')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit) as { data: EnergyReflection[] | null, error: any };
    
  if (error) throw error;
  return data || [];
};

// New function to fetch reflection statistics for a user
export const fetchReflectionStats = async (userId: string) => {
  const { data, error } = await supabase
    .rpc('get_reflection_stats', { user_id: userId }) as { data: any, error: any };
    
  if (error) throw error;
  return data || {
    total_reflections: 0,
    total_points: 0,
    avg_depth: 0,
    top_emotions: [],
    streak_days: 0
  };
};

// Updated function to save a full emotional analysis with proper type handling
export const saveEmotionalAnalysis = async (userId: string, analysisData: any) => {
  const { error } = await supabase
    .from('emotional_analysis')
    .insert({
      user_id: userId,
      analysis_data: analysisData,
      created_at: new Date().toISOString()
    });
    
  if (error) throw error;
};

// New function to fetch emotional analysis data
export const fetchEmotionalAnalysis = async (userId: string, limit: number = 1) => {
  const { data, error } = await supabase
    .from('emotional_analysis')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
    
  if (error) throw error;
  return data || [];
};
