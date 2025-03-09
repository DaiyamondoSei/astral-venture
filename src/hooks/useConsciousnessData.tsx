
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { consciousnessMetricsService } from '@/services/consciousness/consciousnessMetricsService';
import { dreamService } from '@/services/consciousness/dreamService';
import { chakraService } from '@/services/consciousness/chakraService';
import type { 
  ConsciousnessMetrics, 
  ConsciousnessProgress,
  DreamRecord,
  ChakraSystem,
  ChakraType 
} from '@/types/consciousness';

/**
 * Custom hook for accessing and managing consciousness data
 */
export const useConsciousnessData = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for different data types
  const [consciousnessMetrics, setConsciousnessMetrics] = useState<ConsciousnessMetrics | null>(null);
  const [progress, setProgress] = useState<ConsciousnessProgress | null>(null);
  const [dreams, setDreams] = useState<DreamRecord[]>([]);
  const [chakraSystem, setChakraSystem] = useState<ChakraSystem | null>(null);
  
  // Load all consciousness data
  const loadAllData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch all data in parallel
      const [metricsResult, progressResult, dreamsResult, chakraResult] = await Promise.all([
        consciousnessMetricsService.getUserMetrics(user.id),
        consciousnessMetricsService.getUserProgress(user.id),
        dreamService.getUserDreams(user.id, 5),
        chakraService.getUserChakraSystem(user.id)
      ]);
      
      // Update state with results
      setConsciousnessMetrics(metricsResult);
      setProgress(progressResult);
      setDreams(dreamsResult);
      setChakraSystem(chakraResult || chakraService.createDefaultChakraSystem());
    } catch (err) {
      console.error('Error loading consciousness data:', err);
      setError('Failed to load consciousness data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  // Load data on component mount and when user changes
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);
  
  // Save dream and update related data
  const saveDream = async (dreamContent: string): Promise<DreamRecord | null> => {
    if (!user) return null;
    
    try {
      // Analyze dream content
      const analysis = dreamService.analyzeDreamContent(dreamContent);
      
      // Create dream record
      const dreamRecord: Omit<DreamRecord, 'id'> = {
        userId: user.id,
        date: new Date().toISOString(),
        content: dreamContent,
        lucidity: 50, // Default value
        emotionalTone: analysis.emotionalTone,
        symbols: analysis.symbols,
        chakrasActivated: analysis.chakrasActivated,
        consciousness: {
          depth: 50, // Default value
          insights: [],
          archetypes: []
        },
        analysis: {
          theme: analysis.theme,
          interpretation: '',
          guidance: ''
        },
        tags: []
      };
      
      // Save the dream
      const savedDream = await dreamService.saveDream(dreamRecord);
      
      if (savedDream) {
        // Update dreams list
        setDreams(prevDreams => [savedDream, ...prevDreams]);
        
        // Record chakra activation
        await chakraService.recordChakraActivity(
          user.id,
          analysis.chakrasActivated,
          'dream_reflection'
        );
        
        // Refresh chakra system
        const updatedChakraSystem = await chakraService.getUserChakraSystem(user.id);
        if (updatedChakraSystem) {
          setChakraSystem(updatedChakraSystem);
        }
      }
      
      return savedDream;
    } catch (err) {
      console.error('Error saving dream:', err);
      setError('Failed to save dream. Please try again.');
      return null;
    }
  };
  
  // Update chakra activation
  const updateChakraActivation = async (
    chakraType: ChakraType,
    activation: number
  ): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const success = await chakraService.updateChakraActivation(
        user.id,
        chakraType,
        activation
      );
      
      if (success) {
        // Refresh chakra system
        const updatedChakraSystem = await chakraService.getUserChakraSystem(user.id);
        if (updatedChakraSystem) {
          setChakraSystem(updatedChakraSystem);
        }
      }
      
      return success;
    } catch (err) {
      console.error('Error updating chakra activation:', err);
      setError('Failed to update chakra activation. Please try again.');
      return false;
    }
  };
  
  // Get chakra recommendations
  const getChakraRecommendations = useCallback(() => {
    if (!chakraSystem) return {
      focusChakras: ['heart'] as ChakraType[],
      recommendations: ['Complete your chakra assessment to receive personalized recommendations.']
    };
    
    return chakraService.getChakraRecommendations(chakraSystem);
  }, [chakraSystem]);
  
  // Public API
  return {
    isLoading,
    error,
    consciousnessMetrics,
    progress,
    dreams,
    chakraSystem,
    refreshData: loadAllData,
    saveDream,
    updateChakraActivation,
    getChakraRecommendations
  };
};
