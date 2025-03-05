
import { supabase } from '@/lib/supabaseClient';
import { EnergyReflection } from './types';

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
      if (reflection.dominant_emotion) {
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
      } else {
        baseReflection.chakras_activated = [];
      }
      
      return baseReflection;
    });
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
    const reflection: EnergyReflection = {
      id: data.id,
      created_at: data.created_at,
      user_id: data.user_id,
      content: data.content,
      points_earned: data.points_earned,
    };
    
    if (data.dominant_emotion) {
      reflection.dominant_emotion = data.dominant_emotion;
    }
    
    if (data.emotional_depth !== undefined) {
      reflection.emotional_depth = data.emotional_depth;
    }
    
    if (data.chakras_activated) {
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

// Function to save reflection (for backward compatibility)
export const saveReflection = addReflection;
