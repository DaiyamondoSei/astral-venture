
// Centralized service for reflection operations
import { supabase } from '@/lib/supabaseClient';
import { incrementEnergyPoints } from '@/integrations/supabase/client';
import { EnergyReflection } from './reflection/types';
import { api } from '@/utils/apiClient';

// Save a reflection
export const saveReflection = async (
  userId: string, 
  content: string, 
  points_earned: number, 
  metadata?: any
): Promise<EnergyReflection | null> => {
  try {
    const insertData: any = {
      user_id: userId,
      content: content,
      points_earned: points_earned,
    };
    
    // Add optional metadata fields if provided
    if (metadata) {
      if (metadata.dominant_emotion) {
        insertData.dominant_emotion = metadata.dominant_emotion;
      }
      
      if (metadata.emotional_depth !== undefined) {
        insertData.emotional_depth = metadata.emotional_depth;
      }
      
      // Make sure chakras_activated is stored as a string if it's an array
      if (metadata.chakras_activated) {
        insertData.chakras_activated = Array.isArray(metadata.chakras_activated) 
          ? JSON.stringify(metadata.chakras_activated)
          : metadata.chakras_activated;
      }
    }
    
    // Log reflection save attempt with sanitized data
    console.log('Saving reflection:', {
      userId,
      contentLength: content.length,
      points_earned,
      metadata: metadata ? { ...metadata, content: undefined } : undefined,
    });
    
    const { data, error } = await supabase
      .from('energy_reflections')
      .insert([insertData])
      .select('*')
      .single();

    if (error) {
      console.error('Error adding reflection:', error);
      return null;
    }

    // Parse the response into our EnergyReflection type
    const reflection: EnergyReflection = {
      id: data.id,
      created_at: data.created_at,
      user_id: data.user_id,
      content: data.content,
      points_earned: data.points_earned,
    };
    
    if (data.dominant_emotion !== undefined) {
      reflection.dominant_emotion = data.dominant_emotion;
    }
    
    if (data.emotional_depth !== undefined) {
      reflection.emotional_depth = data.emotional_depth;
    }
    
    if (data.chakras_activated !== undefined) {
      try {
        reflection.chakras_activated = typeof data.chakras_activated === 'string'
          ? JSON.parse(data.chakras_activated)
          : Array.isArray(data.chakras_activated)
            ? data.chakras_activated
            : [];
      } catch (e) {
        console.error('Error parsing chakras_activated:', e);
        reflection.chakras_activated = [];
      }
    }

    return reflection;
  } catch (error) {
    console.error('Error adding reflection:', error);
    return null;
  }
};

// Add reflection and update user points in a single function
export const addReflection = async (
  userId: string, 
  content: string, 
  points_earned: number, 
  metadata?: any
): Promise<EnergyReflection | null> => {
  const reflection = await saveReflection(userId, content, points_earned, metadata);
  
  if (reflection) {
    try {
      // Update user points
      await updateUserPoints(userId, points_earned);
    } catch (error) {
      console.error('Error updating user points:', error);
      // Continue anyway since the reflection was saved
    }
  }
  
  return reflection;
};

// Update user points
export const updateUserPoints = async (userId: string, pointsToAdd: number): Promise<number> => {
  try {
    const newPoints = await incrementEnergyPoints(userId, pointsToAdd);
    return newPoints;
  } catch (error) {
    console.error('Error updating user points:', error);
    throw error;
  }
};

// Fetch user reflections with error handling and retry
export const fetchUserReflections = async (
  userId: string, 
  limit: number = 50,
  retryCount: number = 0
): Promise<EnergyReflection[]> => {
  try {
    const { data, error } = await supabase
      .from('energy_reflections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching reflections:', error);
      
      // Retry up to 2 times with exponential backoff
      if (retryCount < 2) {
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchUserReflections(userId, limit, retryCount + 1);
      }
      
      return [];
    }

    // Process the data to ensure all fields are properly handled
    return (data || []).map(reflection => {
      // Create a base reflection object with guaranteed properties
      const baseReflection: EnergyReflection = {
        id: reflection.id,
        created_at: reflection.created_at,
        user_id: reflection.user_id,
        content: reflection.content,
        points_earned: reflection.points_earned,
      };
      
      // Add optional properties if they exist in the original data
      if (reflection.dominant_emotion !== undefined) {
        baseReflection.dominant_emotion = reflection.dominant_emotion;
      }
      
      if (reflection.emotional_depth !== undefined) {
        baseReflection.emotional_depth = reflection.emotional_depth;
      }
      
      // Handle chakras_activated specially
      if (reflection.chakras_activated !== undefined) {
        try {
          // Parse if it's a string, otherwise use as is if it's already an array
          baseReflection.chakras_activated = typeof reflection.chakras_activated === 'string' 
            ? JSON.parse(reflection.chakras_activated) 
            : Array.isArray(reflection.chakras_activated) 
              ? reflection.chakras_activated 
              : [];
        } catch (e) {
          console.error('Error parsing chakras_activated:', e);
          baseReflection.chakras_activated = [];
        }
      }
      
      return baseReflection;
    });
  } catch (error) {
    console.error('Error fetching reflections:', error);
    return [];
  }
};

// Get AI insights for reflections
export const getReflectionInsights = async (
  reflectionId?: string, 
  reflectionContent?: string,
  question: string = "What insights can you provide about this reflection?"
): Promise<string | null> => {
  try {
    return await api.getAiResponse(question, reflectionId, reflectionContent)
      .then(data => data.response);
  } catch (error) {
    console.error('Error getting reflection insights:', error);
    return null;
  }
};
