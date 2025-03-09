
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { consciousnessMetricsService } from '@/services/consciousness/consciousnessMetricsService';
import { dreamService } from '@/services/consciousness/dreamService';
import { chakraService } from '@/services/consciousness/chakraService';
import type { ConsciousnessMetrics, DreamRecord, ChakraSystem, ConsciousnessProgress } from '@/types/consciousness';

interface ConsciousnessContextType {
  metrics: ConsciousnessMetrics | null;
  dreams: DreamRecord[];
  chakraSystem: ChakraSystem | null;
  progress: ConsciousnessProgress | null;
  loading: boolean;
  error: string | null;
  refreshMetrics: () => Promise<void>;
  saveDream: (dream: Omit<DreamRecord, 'id'>) => Promise<DreamRecord | null>;
  updateChakraSystem: (chakraUpdate: Partial<ChakraSystem>) => Promise<boolean>;
  activateChakra: (chakraType: string, intensity: number) => Promise<boolean>;
}

const ConsciousnessContext = createContext<ConsciousnessContextType>({
  metrics: null,
  dreams: [],
  chakraSystem: null,
  progress: null,
  loading: false,
  error: null,
  refreshMetrics: async () => {},
  saveDream: async () => null,
  updateChakraSystem: async () => false,
  activateChakra: async () => false,
});

export const useConsciousness = () => useContext(ConsciousnessContext);

export const ConsciousnessProvider = ({ children }: { children: ReactNode }) => {
  const [metrics, setMetrics] = useState<ConsciousnessMetrics | null>(null);
  const [dreams, setDreams] = useState<DreamRecord[]>([]);
  const [chakraSystem, setChakraSystem] = useState<ChakraSystem | null>(null);
  const [progress, setProgress] = useState<ConsciousnessProgress | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Get user session on mount
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUserId(data.session?.user.id || null);
    };

    getUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setUserId(session?.user.id || null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Load consciousness data when userId changes
  useEffect(() => {
    if (userId) {
      loadUserData(userId);
    } else {
      // Reset state when user logs out
      setMetrics(null);
      setDreams([]);
      setChakraSystem(null);
      setProgress(null);
      setLoading(false);
    }
  }, [userId]);

  const loadUserData = async (uid: string) => {
    setLoading(true);
    setError(null);

    try {
      // Load metrics
      const userMetrics = await consciousnessMetricsService.getUserMetrics(uid);
      setMetrics(userMetrics);

      // Load dreams
      const userDreams = await dreamService.getUserDreams(uid);
      setDreams(userDreams);

      // Load chakra system
      const userChakraSystem = await chakraService.getUserChakraSystem(uid);
      setChakraSystem(userChakraSystem);

      // Load progress
      const userProgress = await consciousnessMetricsService.getUserProgress(uid);
      setProgress(userProgress);
    } catch (err) {
      console.error('Error loading consciousness data:', err);
      setError('Failed to load consciousness data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const refreshMetrics = async () => {
    if (!userId) return;
    
    try {
      const userMetrics = await consciousnessMetricsService.getUserMetrics(userId);
      setMetrics(userMetrics);
      
      const userProgress = await consciousnessMetricsService.getUserProgress(userId);
      setProgress(userProgress);
    } catch (err) {
      console.error('Error refreshing metrics:', err);
      setError('Failed to refresh metrics. Please try again later.');
    }
  };

  const saveDream = async (dreamData: Omit<DreamRecord, 'id'>) => {
    try {
      const savedDream = await dreamService.saveDream(dreamData);
      if (savedDream) {
        setDreams(prev => [savedDream, ...prev]);
      }
      return savedDream;
    } catch (err) {
      console.error('Error saving dream:', err);
      setError('Failed to save dream. Please try again later.');
      return null;
    }
  };

  const updateChakraSystem = async (chakraUpdate: Partial<ChakraSystem>) => {
    if (!userId || !chakraSystem) return false;
    
    try {
      const success = await chakraService.updateChakraSystem(userId, chakraUpdate);
      if (success) {
        setChakraSystem(prev => prev ? { ...prev, ...chakraUpdate } : null);
      }
      return success;
    } catch (err) {
      console.error('Error updating chakra system:', err);
      setError('Failed to update chakra system. Please try again later.');
      return false;
    }
  };

  const activateChakra = async (chakraType: string, intensity: number) => {
    if (!userId) return false;
    
    try {
      const success = await chakraService.updateChakraActivation(
        userId, 
        chakraType as any,  // Type casting as we're validating in the service
        intensity
      );
      
      if (success) {
        // Refresh chakra system
        const updatedSystem = await chakraService.getUserChakraSystem(userId);
        setChakraSystem(updatedSystem);
      }
      
      return success;
    } catch (err) {
      console.error('Error activating chakra:', err);
      setError('Failed to activate chakra. Please try again later.');
      return false;
    }
  };

  const value = {
    metrics,
    dreams,
    chakraSystem,
    progress,
    loading,
    error,
    refreshMetrics,
    saveDream,
    updateChakraSystem,
    activateChakra,
  };

  return (
    <ConsciousnessContext.Provider value={value}>
      {children}
    </ConsciousnessContext.Provider>
  );
};
