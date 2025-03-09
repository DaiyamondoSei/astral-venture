
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SeedOfLifeInteractionState {
  portalEnergy: number;
  interactionCount: number;
  resonanceLevel: number;
  lastInteractionTime: number | null;
}

interface InteractionResult {
  newEnergy: number;
  newResonance: number;
}

/**
 * Custom hook to manage the interactive state of the Seed of Life portal
 * Handles energy accumulation, interaction tracking, and resonance levels
 * Offloads data persistence to the backend for improved performance
 */
export function useSeedOfLifeInteraction(userLevel: number = 1) {
  const [state, setState] = useState<SeedOfLifeInteractionState>({
    portalEnergy: 0,
    interactionCount: 0,
    resonanceLevel: 1,
    lastInteractionTime: null
  });
  
  const { user } = useAuth();
  
  // Fetch initial state from backend if user is authenticated
  useEffect(() => {
    const fetchInteractionState = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_energy_interactions')
          .select('portal_energy, interaction_count, resonance_level, last_interaction_time')
          .eq('user_id', user.id)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching interaction state:', error);
          return;
        }
        
        if (data) {
          setState({
            portalEnergy: data.portal_energy,
            interactionCount: data.interaction_count,
            resonanceLevel: data.resonance_level,
            lastInteractionTime: data.last_interaction_time ? new Date(data.last_interaction_time).getTime() : null
          });
        }
      } catch (error) {
        console.error('Unexpected error fetching interaction state:', error);
      }
    };
    
    fetchInteractionState();
  }, [user]);
  
  /**
   * Handle user interaction with the Seed of Life portal
   * Each interaction increases energy and potentially resonance
   */
  const handlePortalInteraction = useCallback(async (): Promise<InteractionResult> => {
    const now = Date.now();
    const timeSinceLastInteraction = state.lastInteractionTime 
      ? now - state.lastInteractionTime
      : Infinity;
    
    // Calculate energy increase based on:
    // 1. Base energy gain
    // 2. Bonus for rapid interactions (combos)
    // 3. User level bonus
    const baseEnergyGain = 15;
    const comboMultiplier = timeSinceLastInteraction < 2000 ? 1.5 : 1;
    const levelBonus = userLevel * 2;
    
    const energyGain = baseEnergyGain * comboMultiplier + levelBonus;
    const newEnergy = Math.min(100, state.portalEnergy + energyGain);
    
    // Increase resonance level based on interaction count
    const newInteractionCount = state.interactionCount + 1;
    let newResonance = state.resonanceLevel;
    
    if (newInteractionCount >= 5 && newResonance < 2) {
      newResonance = 2;
    } else if (newInteractionCount >= 10 && newResonance < 3) {
      newResonance = 3;
    } else if (newInteractionCount >= 15 && newResonance < 4) {
      newResonance = 4;
    } else if (newInteractionCount >= 20 && newResonance < 5) {
      newResonance = 5;
    }
    
    // Update state locally first for instant feedback
    setState({
      portalEnergy: newEnergy,
      interactionCount: newInteractionCount,
      resonanceLevel: newResonance,
      lastInteractionTime: now
    });
    
    // Persist to backend if user is authenticated
    if (user) {
      try {
        // Offload to backend using supabase edges
        await supabase.functions.invoke('update-portal-interaction', {
          body: {
            userId: user.id,
            portalEnergy: newEnergy,
            interactionCount: newInteractionCount,
            resonanceLevel: newResonance,
            lastInteractionTime: new Date(now).toISOString()
          }
        });
        
        // If energy reaches 100%, grant energy points
        if (newEnergy >= 100) {
          const pointsToAdd = 50 * newResonance; // Scale points with resonance level
          await supabase.functions.invoke('increment-energy-points', {
            body: { 
              userId: user.id, 
              pointsToAdd 
            }
          });
          
          toast.success(`Portal activated! +${pointsToAdd} energy points added.`);
        }
      } catch (error) {
        console.error('Error persisting interaction state:', error);
      }
    }
    
    return { newEnergy, newResonance };
  }, [state, userLevel, user]);
  
  /**
   * Reset interaction state to default values
   */
  const resetInteraction = useCallback(async () => {
    const defaultState = {
      portalEnergy: 0,
      interactionCount: 0,
      resonanceLevel: 1,
      lastInteractionTime: null
    };
    
    setState(defaultState);
    
    // Persist reset to backend if user is authenticated
    if (user) {
      try {
        await supabase
          .from('user_energy_interactions')
          .upsert({
            user_id: user.id,
            portal_energy: 0,
            interaction_count: 0,
            resonance_level: 1,
            last_interaction_time: null
          });
      } catch (error) {
        console.error('Error resetting interaction state:', error);
      }
    }
  }, [user]);
  
  /**
   * Manually set the energy level of the portal
   */
  const setEnergy = useCallback(async (energy: number) => {
    const clampedEnergy = Math.min(100, Math.max(0, energy));
    
    setState(prev => ({
      ...prev,
      portalEnergy: clampedEnergy
    }));
    
    // Persist to backend if user is authenticated
    if (user) {
      try {
        await supabase
          .from('user_energy_interactions')
          .upsert({
            user_id: user.id,
            portal_energy: clampedEnergy,
            interaction_count: state.interactionCount,
            resonance_level: state.resonanceLevel,
            last_interaction_time: state.lastInteractionTime 
              ? new Date(state.lastInteractionTime).toISOString() 
              : null
          });
      } catch (error) {
        console.error('Error updating energy level:', error);
      }
    }
  }, [state, user]);
  
  return {
    ...state,
    handlePortalInteraction,
    resetInteraction,
    setEnergy
  };
}

export default useSeedOfLifeInteraction;
