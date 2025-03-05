
import { supabase } from '@/lib/supabaseClient';
import { Json } from '@/integrations/supabase/types';
import { EnergyReflection, EmotionalJourney } from './types';
import { fetchUserReflections } from './reflectionOperations';

// Function to save emotional analysis for a user
export const saveEmotionalAnalysis = async (userId: string, analysisData: Json) => {
  try {
    const { data, error } = await supabase
      .from('emotional_analysis')
      .insert({
        user_id: userId,
        analysis_data: analysisData
      });
      
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
    const { data, error } = await supabase
      .from('emotional_analysis')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (error) throw error;
    
    // Safely access the data by checking both existence and shape
    if (data && Array.isArray(data) && data.length > 0) {
      // Use optional chaining for additional safety
      return data[0]?.analysis_data || null;
    }
    return null;
  } catch (error) {
    console.error('Error fetching emotional analysis:', error);
    return null;
  }
};

// Function to fetch a summary of user's emotional journey
export const fetchEmotionalJourney = async (userId: string): Promise<EmotionalJourney | null> => {
  try {
    // Get the most recent reflections
    const recentReflections = await fetchUserReflections(userId, 10);
    
    // Get their emotional analysis
    const emotionalAnalysis = await fetchEmotionalAnalysis(userId);
    
    // Calculate overall emotional growth statistics
    const totalPoints = recentReflections.reduce((sum, r) => sum + r.points_earned, 0);
    const averageDepth = recentReflections
      .filter(r => r.emotional_depth !== undefined)
      .reduce((sum, r) => sum + (r.emotional_depth || 0), 0) / 
      (recentReflections.filter(r => r.emotional_depth !== undefined).length || 1);
    
    // Get an array of all activated chakras from recent reflections
    const allActivatedChakras = recentReflections
      .flatMap(r => r.chakras_activated || [])
      .filter((value, index, self) => self.indexOf(value) === index);  // Remove duplicates
    
    // Count occurrences of each dominant emotion
    const emotionCounts: Record<string, number> = {};
    recentReflections.forEach(r => {
      if (r.dominant_emotion) {
        emotionCounts[r.dominant_emotion] = (emotionCounts[r.dominant_emotion] || 0) + 1;
      }
    });
    
    // Sort emotions by frequency
    const dominantEmotions = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([emotion]) => emotion);
    
    return {
      recentReflectionCount: recentReflections.length,
      totalPointsEarned: totalPoints,
      averageEmotionalDepth: averageDepth,
      activatedChakras: allActivatedChakras,
      dominantEmotions,
      lastReflectionDate: recentReflections[0]?.created_at || null,
      emotionalAnalysis,
      recentReflections
    };
  } catch (error) {
    console.error('Error fetching emotional journey:', error);
    return null;
  }
};
