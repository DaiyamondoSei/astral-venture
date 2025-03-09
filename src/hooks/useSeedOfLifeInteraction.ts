
import { useState, useCallback } from 'react';

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
 */
export function useSeedOfLifeInteraction(userLevel: number = 1) {
  const [state, setState] = useState<SeedOfLifeInteractionState>({
    portalEnergy: 0,
    interactionCount: 0,
    resonanceLevel: 1,
    lastInteractionTime: null
  });
  
  /**
   * Handle user interaction with the Seed of Life portal
   * Each interaction increases energy and potentially resonance
   */
  const handlePortalInteraction = useCallback((): InteractionResult => {
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
    
    // Update state
    setState({
      portalEnergy: newEnergy,
      interactionCount: newInteractionCount,
      resonanceLevel: newResonance,
      lastInteractionTime: now
    });
    
    return { newEnergy, newResonance };
  }, [state, userLevel]);
  
  /**
   * Reset interaction state to default values
   */
  const resetInteraction = useCallback(() => {
    setState({
      portalEnergy: 0,
      interactionCount: 0,
      resonanceLevel: 1,
      lastInteractionTime: null
    });
  }, []);
  
  /**
   * Manually set the energy level of the portal
   */
  const setEnergy = useCallback((energy: number) => {
    setState(prev => ({
      ...prev,
      portalEnergy: Math.min(100, Math.max(0, energy))
    }));
  }, []);
  
  return {
    ...state,
    handlePortalInteraction,
    resetInteraction,
    setEnergy
  };
}

export default useSeedOfLifeInteraction;
