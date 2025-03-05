
import { supabase } from '@/lib/supabaseClient';
import { EnergyReflection, EmotionalJourney } from './types';
import { fetchUserReflections } from './reflectionOperations';
import { evaluateEmotionalDepth } from '@/utils/emotion/analysis/depthEvaluator';
import { getReflectionInsights } from './insightsGenerator';

/**
 * Fetches a user's emotional journey data, including reflections and analysis
 */
export const fetchEmotionalJourney = async (userId: string): Promise<EmotionalJourney | null> => {
  try {
    // Get recent reflections (limited to last 10)
    const recentReflections = await fetchUserReflections(userId, 10);
    
    if (recentReflections.length === 0) {
      return null;
    }
    
    // Calculate total points earned
    const totalPointsEarned = recentReflections.reduce(
      (sum, reflection) => sum + (reflection.points_earned || 0), 
      0
    );
    
    // Calculate average emotional depth
    const depthValues = recentReflections
      .filter(r => r.emotional_depth !== undefined)
      .map(r => r.emotional_depth || 0);
    
    const averageEmotionalDepth = depthValues.length > 0
      ? depthValues.reduce((sum, depth) => sum + depth, 0) / depthValues.length
      : 0;
    
    // Get unique activated chakras from all reflections
    const allChakras = recentReflections.flatMap(r => r.chakras_activated || []);
    const activatedChakras = [...new Set(allChakras)];
    
    // Get dominant emotions (count frequency and take top 3)
    const emotionCounts: Record<string, number> = {};
    recentReflections.forEach(reflection => {
      if (reflection.dominant_emotion) {
        const emotion = reflection.dominant_emotion;
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      }
    });
    
    const dominantEmotions = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([emotion]) => emotion);
    
    // Get insights based on reflections
    const insights = getReflectionInsights(recentReflections);
    
    // Get last reflection date
    const lastReflectionDate = recentReflections.length > 0
      ? recentReflections[0].created_at
      : null;
    
    // Create emotional analysis summary
    const emotionalAnalysis = {
      reflectionFrequency: recentReflections.length / 10, // normalized to 0-1 scale
      emotionalVariety: dominantEmotions.length / 3, // normalized to 0-1 scale
      averageDepth: averageEmotionalDepth,
      chakraBalance: activatedChakras.length / 7, // normalized to 0-1 scale
    };
    
    return {
      recentReflectionCount: recentReflections.length,
      totalPointsEarned,
      averageEmotionalDepth,
      activatedChakras,
      dominantEmotions,
      lastReflectionDate,
      emotionalAnalysis,
      recentReflections
    };
  } catch (error) {
    console.error('Error fetching emotional journey:', error);
    return null;
  }
};

/**
 * Updates or creates a user's emotional journey analysis
 */
export const updateEmotionalJourney = async (userId: string): Promise<boolean> => {
  try {
    const journey = await fetchEmotionalJourney(userId);
    
    if (!journey) {
      return false;
    }
    
    // Store the latest analysis in the emotional_analysis table
    const { error } = await supabase
      .from('emotional_analysis')
      .upsert({
        user_id: userId,
        analysis_data: {
          reflectionCount: journey.recentReflectionCount,
          totalPoints: journey.totalPointsEarned,
          averageDepth: journey.averageEmotionalDepth,
          activatedChakras: journey.activatedChakras,
          dominantEmotions: journey.dominantEmotions,
          lastUpdated: new Date().toISOString(),
          insights: journey.emotionalAnalysis
        }
      }, { onConflict: 'user_id' });
    
    if (error) {
      console.error('Error updating emotional journey:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating emotional journey:', error);
    return false;
  }
};
