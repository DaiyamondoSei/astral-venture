
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface EnergyReflection {
  id: string;
  created_at: string;
  user_id: string;
  content: string;
  points_earned: number;
  dominant_emotion?: string;
  emotional_depth?: number;
  chakras_activated?: any[];
}

interface UseReflectionsReturn {
  latestReflection: EnergyReflection | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch the latest reflection of a user
 */
export function useReflections(): UseReflectionsReturn {
  const [latestReflection, setLatestReflection] = useState<EnergyReflection | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchLatestReflection = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // We need to manually craft this query to match EnergyReflection type
      const { data, error: fetchError } = await supabase
        .from('energy_reflections')
        .select('id, created_at, user_id, content, points_earned, dominant_emotion, emotional_depth, chakras_activated')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (fetchError) {
        throw new Error(fetchError.message);
      }
      
      if (data) {
        // Convert the database data to the EnergyReflection type
        const reflection: EnergyReflection = {
          id: data.id,
          created_at: data.created_at,
          user_id: data.user_id,
          content: data.content,
          points_earned: data.points_earned,
        };
        
        // Add optional fields if they exist
        if (data.dominant_emotion) {
          reflection.dominant_emotion = data.dominant_emotion;
        }
        
        if (data.emotional_depth) {
          reflection.emotional_depth = data.emotional_depth;
        }
        
        if (data.chakras_activated) {
          try {
            reflection.chakras_activated = typeof data.chakras_activated === 'string'
              ? JSON.parse(data.chakras_activated)
              : data.chakras_activated;
          } catch (e) {
            console.error('Error parsing chakras_activated:', e);
            reflection.chakras_activated = [];
          }
        }
        
        setLatestReflection(reflection);
      } else {
        setLatestReflection(null);
      }
    } catch (err) {
      console.error('Error fetching latest reflection:', err);
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchLatestReflection();
  }, [user]);

  return {
    latestReflection,
    loading,
    error,
    refetch: fetchLatestReflection
  };
}
