
import { supabase } from '@/lib/supabaseClient';

export interface EnergyReflection {
  id: string;
  created_at: string;
  user_id: string;
  content: string;
  points_earned: number;
  dominant_emotion?: string;
  emotional_depth?: number;
  chakras_activated?: number[];
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

    // Process the data to ensure chakras_activated is properly parsed
    return (data || []).map(reflection => ({
      ...reflection,
      // Parse chakras_activated if it's a string
      chakras_activated: reflection.chakras_activated 
        ? (typeof reflection.chakras_activated === 'string' 
            ? JSON.parse(reflection.chakras_activated) 
            : reflection.chakras_activated)
        : []
    }));
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
    
    // Make sure chakras_activated is stored as a string if it's an array
    if (metadata?.chakras_activated && Array.isArray(metadata.chakras_activated)) {
      insertData.chakras_activated = JSON.stringify(metadata.chakras_activated);
    }
    
    const { data, error } = await supabase
      .from('energy_reflections')
      .insert([insertData])
      .select('*')
      .single();

    if (error) {
      console.error('Error adding reflection:', error);
      return null;
    }

    // Parse chakras_activated back to an array if it was stored as a string
    if (data && typeof data.chakras_activated === 'string') {
      try {
        data.chakras_activated = JSON.parse(data.chakras_activated);
      } catch (e) {
        console.error('Error parsing chakras_activated:', e);
        data.chakras_activated = [];
      }
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
    const { data, error } = await supabase
      .from('emotional_analysis')
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

// New function to fetch a summary of user's emotional journey
export const fetchEmotionalJourney = async (userId: string) => {
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
      emotionalAnalysis
    };
  } catch (error) {
    console.error('Error fetching emotional journey:', error);
    return null;
  }
};

// New function to get reflection insights
export const getReflectionInsights = (reflections: EnergyReflection[]) => {
  // Skip if no reflections
  if (!reflections.length) return [];
  
  const insights: string[] = [];
  
  // Check frequency
  if (reflections.length >= 5) {
    const daysBetween = (date1: string, date2: string) => {
      return Math.abs(Math.floor(
        (new Date(date1).getTime() - new Date(date2).getTime()) / (1000 * 60 * 60 * 24)
      ));
    };
    
    // Sort by date
    const sortedReflections = [...reflections].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    // Get recent reflections (last 5)
    const recentReflections = sortedReflections.slice(-5);
    
    // Calculate average days between reflections
    let totalDays = 0;
    for (let i = 1; i < recentReflections.length; i++) {
      totalDays += daysBetween(recentReflections[i].created_at, recentReflections[i-1].created_at);
    }
    const avgDays = totalDays / (recentReflections.length - 1);
    
    if (avgDays <= 1) {
      insights.push("Your daily reflection practice is strengthening your emotional intelligence");
    } else if (avgDays <= 3) {
      insights.push("Your regular reflection practice is building emotional awareness");
    } else {
      insights.push("Consider more frequent reflections to accelerate your emotional growth");
    }
  }
  
  // Check emotional depth
  const depthValues = reflections
    .filter(r => r.emotional_depth !== undefined)
    .map(r => r.emotional_depth || 0);
  
  if (depthValues.length > 0) {
    const avgDepth = depthValues.reduce((a, b) => a + b, 0) / depthValues.length;
    
    if (avgDepth > 0.7) {
      insights.push("Your reflections show deep emotional intelligence and self-awareness");
    } else if (avgDepth > 0.4) {
      insights.push("Your emotional depth is developing well through your practice");
    } else {
      insights.push("Try exploring your feelings more deeply in your reflections");
    }
  }
  
  // Check chakra activation
  const allChakras = reflections.flatMap(r => r.chakras_activated || []);
  const uniqueChakras = [...new Set(allChakras)];
  
  if (uniqueChakras.length >= 5) {
    insights.push("You've activated most of your energy centers through your practice");
  } else if (uniqueChakras.length >= 3) {
    insights.push("Multiple energy centers are being activated in your practice");
  } else if (uniqueChakras.length > 0) {
    insights.push("Continue your practice to activate more energy centers");
  }
  
  return insights;
};
