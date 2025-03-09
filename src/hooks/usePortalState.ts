
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PortalState {
  portalEnergy: number;
  interactionCount: number;
  resonanceLevel: number;
  lastInteractionTime: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Hook to fetch and manage portal state from the backend
 */
export function usePortalState(userId?: string) {
  const [portalState, setPortalState] = useState<PortalState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPortalState = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Query the user_energy_interactions table directly instead of using RPC
        const { data, error } = await supabase
          .from('user_energy_interactions')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setPortalState({
            portalEnergy: data.portal_energy || 0,
            interactionCount: data.interaction_count || 0,
            resonanceLevel: data.resonance_level || 1,
            lastInteractionTime: data.last_interaction_time,
            createdAt: data.created_at,
            updatedAt: data.updated_at
          });
        } else {
          // Set default state if no data exists
          setPortalState({
            portalEnergy: 0,
            interactionCount: 0,
            resonanceLevel: 1,
            lastInteractionTime: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      } catch (error: any) {
        console.error('Error fetching portal state:', error);
        setError(error.message || 'Failed to fetch portal state');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPortalState();
  }, [userId]);
  
  return { portalState, isLoading, error };
}
