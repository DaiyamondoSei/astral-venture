
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { usePortalState } from './usePortalState';
import { 
  handlePortalInteractionBackend, 
  resetPortalInteractionBackend,
  updatePortalEnergyBackend 
} from '@/services/portal/portalService';

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
  const { user } = useAuth();
  const { 
    portalState, 
    isLoading, 
    error 
  } = usePortalState(user?.id);
  
  const [state, setState] = useState({
    portalEnergy: 0,
    interactionCount: 0,
    resonanceLevel: 1,
    lastInteractionTime: null as number | null
  });
  
  // Sync local state with fetched portal state
  useEffect(() => {
    if (portalState) {
      setState({
        portalEnergy: portalState.portalEnergy,
        interactionCount: portalState.interactionCount,
        resonanceLevel: portalState.resonanceLevel,
        lastInteractionTime: portalState.lastInteractionTime 
          ? new Date(portalState.lastInteractionTime).getTime() 
          : null
      });
    }
  }, [portalState]);
  
  /**
   * Handle user interaction with the Seed of Life portal
   * Each interaction increases energy and potentially resonance
   */
  const handlePortalInteraction = useCallback(async (): Promise<InteractionResult> => {
    if (!user) {
      // For non-authenticated users, just update local state
      const now = Date.now();
      const timeSinceLastInteraction = state.lastInteractionTime 
        ? now - state.lastInteractionTime
        : Infinity;
      
      // Calculate energy increase based on user level and combo timing
      const baseEnergyGain = 15;
      const comboMultiplier = timeSinceLastInteraction < 2000 ? 1.5 : 1;
      const levelBonus = userLevel * 2;
      
      const energyGain = baseEnergyGain * comboMultiplier + levelBonus;
      const newEnergy = Math.min(100, state.portalEnergy + energyGain);
      
      // Calculate new resonance level based on interaction count
      const newInteractionCount = state.interactionCount + 1;
      let newResonance = state.resonanceLevel;
      
      if (newInteractionCount >= 20 && newResonance < 5) {
        newResonance = 5;
      } else if (newInteractionCount >= 15 && newResonance < 4) {
        newResonance = 4;
      } else if (newInteractionCount >= 10 && newResonance < 3) {
        newResonance = 3;
      } else if (newInteractionCount >= 5 && newResonance < 2) {
        newResonance = 2;
      }
      
      // Update local state for immediate feedback
      setState({
        portalEnergy: newEnergy,
        interactionCount: newInteractionCount,
        resonanceLevel: newResonance,
        lastInteractionTime: now
      });
      
      return { newEnergy, newResonance };
    }
    
    try {
      // Use the backend service to handle portal interaction
      const result = await handlePortalInteractionBackend(
        user.id, 
        state.portalEnergy, 
        state.interactionCount, 
        state.resonanceLevel,
        state.lastInteractionTime,
        userLevel
      );
      
      // Update local state with results from backend
      setState({
        portalEnergy: result.newEnergy,
        interactionCount: result.newInteractionCount,
        resonanceLevel: result.newResonance,
        lastInteractionTime: Date.now()
      });
      
      // Show toast if portal is fully activated
      if (result.energyPointsAdded > 0) {
        toast.success(`Portal activated! +${result.energyPointsAdded} energy points added.`);
      }
      
      return { 
        newEnergy: result.newEnergy, 
        newResonance: result.newResonance 
      };
    } catch (error) {
      console.error('Error in portal interaction:', error);
      toast.error('Something went wrong with the portal interaction');
      return { 
        newEnergy: state.portalEnergy, 
        newResonance: state.resonanceLevel 
      };
    }
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
        await resetPortalInteractionBackend(user.id);
      } catch (error) {
        console.error('Error resetting interaction state:', error);
        toast.error('Failed to reset portal state');
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
        await updatePortalEnergyBackend(
          user.id,
          clampedEnergy,
          state.interactionCount,
          state.resonanceLevel,
          state.lastInteractionTime
        );
      } catch (error) {
        console.error('Error updating energy level:', error);
        toast.error('Failed to update portal energy');
      }
    }
  }, [state, user]);
  
  return {
    portalEnergy: state.portalEnergy,
    interactionCount: state.interactionCount,
    resonanceLevel: state.resonanceLevel,
    lastInteractionTime: state.lastInteractionTime,
    isLoading,
    error,
    handlePortalInteraction,
    resetInteraction,
    setEnergy
  };
}

export default useSeedOfLifeInteraction;
