
import { supabase } from '@/integrations/supabase/client';

interface PortalInteractionResult {
  newEnergy: number;
  newInteractionCount: number;
  newResonance: number;
  energyPointsAdded: number;
}

/**
 * Handles portal interaction on the backend via edge function
 */
export async function handlePortalInteractionBackend(
  userId: string,
  currentEnergy: number,
  currentInteractionCount: number,
  currentResonanceLevel: number,
  lastInteractionTime: number | null,
  userLevel: number
): Promise<PortalInteractionResult> {
  try {
    const { data, error } = await supabase.functions.invoke('update-portal-interaction', {
      body: {
        userId,
        currentEnergy,
        currentInteractionCount,
        currentResonanceLevel,
        lastInteractionTime: lastInteractionTime ? new Date(lastInteractionTime).toISOString() : null,
        userLevel
      }
    });
    
    if (error) throw error;
    
    return {
      newEnergy: data.portalEnergy,
      newInteractionCount: data.interactionCount,
      newResonance: data.resonanceLevel,
      energyPointsAdded: data.energyPointsAdded || 0
    };
  } catch (error) {
    console.error('Error in portal interaction service:', error);
    throw error;
  }
}

/**
 * Resets portal interaction state to defaults
 */
export async function resetPortalInteractionBackend(userId: string): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke('update-portal-interaction', {
      body: {
        userId,
        portalEnergy: 0,
        interactionCount: 0,
        resonanceLevel: 1,
        lastInteractionTime: null,
        reset: true
      }
    });
    
    if (error) throw error;
  } catch (error) {
    console.error('Error resetting portal state:', error);
    throw error;
  }
}

/**
 * Updates only the energy level of the portal
 */
export async function updatePortalEnergyBackend(
  userId: string,
  energy: number,
  interactionCount: number,
  resonanceLevel: number,
  lastInteractionTime: number | null
): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke('update-portal-interaction', {
      body: {
        userId,
        portalEnergy: energy,
        interactionCount,
        resonanceLevel,
        lastInteractionTime: lastInteractionTime ? new Date(lastInteractionTime).toISOString() : null
      }
    });
    
    if (error) throw error;
  } catch (error) {
    console.error('Error updating portal energy:', error);
    throw error;
  }
}
