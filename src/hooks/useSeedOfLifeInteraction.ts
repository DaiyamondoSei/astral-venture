
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { usePortalState } from './usePortalState';

interface UseSeedOfLifeInteractionResult {
  portalEnergy: number;
  resonanceLevel: number;
  handlePortalInteraction: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useSeedOfLifeInteraction(userLevel: number = 1): UseSeedOfLifeInteractionResult {
  const { user } = useAuth();
  const { portalState, isLoading: portalLoading, error: portalError } = usePortalState(user?.id);
  
  const [portalEnergy, setPortalEnergy] = useState(0);
  const [resonanceLevel, setResonanceLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize state from portal state
  useEffect(() => {
    if (portalState) {
      setPortalEnergy(portalState.portalEnergy);
      setResonanceLevel(portalState.resonanceLevel);
    }
  }, [portalState]);
  
  // Handle portal interaction
  const handlePortalInteraction = useCallback(async () => {
    if (!user?.id) {
      setError("User must be logged in to interact with the portal");
      toast({
        title: "Authentication Required",
        description: "Please log in to interact with the Seed of Life portal",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('handle-portal-interaction', {
        body: {
          userId: user.id,
          userLevel
        }
      });
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setPortalEnergy(data.portalEnergy);
      setResonanceLevel(data.resonanceLevel);
      
      // Show progress toast for meaningful interactions
      if (data.portalEnergy % 10 === 0 || data.resonanceLevel > resonanceLevel) {
        toast({
          title: data.resonanceLevel > resonanceLevel 
            ? "Resonance Level Increased!" 
            : "Energy Milestone!",
          description: data.resonanceLevel > resonanceLevel
            ? `Your connection to the portal has deepened to level ${data.resonanceLevel}`
            : `Portal energy now at ${data.portalEnergy}%`,
          variant: "default"
        });
      }
    } catch (err: any) {
      console.error('Error interacting with portal:', err);
      setError('Failed to interact with the portal. Please try again.');
      toast({
        title: "Interaction Failed",
        description: "Could not connect with the quantum field. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, userLevel, resonanceLevel]);
  
  return {
    portalEnergy,
    resonanceLevel,
    handlePortalInteraction,
    isLoading: isLoading || portalLoading,
    error: error || portalError
  };
}
