
import { useState, useEffect, useCallback } from 'react';
import { 
  getChakraVisualizationData, 
  ChakraVisualizationData, 
  ChakraName, 
  ChakraPractice 
} from '@/services/chakra/chakraVisualizationService';

interface UseChakraVisualizationProps {
  userLevel?: number;
}

/**
 * Hook for managing chakra visualization data and interactions
 */
export function useChakraVisualization({ userLevel = 1 }: UseChakraVisualizationProps) {
  const [chakraData, setChakraData] = useState<ChakraVisualizationData | null>(null);
  const [selectedChakra, setSelectedChakra] = useState<ChakraName | null>(null);
  const [selectedPractice, setSelectedPractice] = useState<ChakraPractice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load chakra data
  const loadChakraData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await getChakraVisualizationData({ userLevel });
      setChakraData(data);
      
      // If no chakra is selected, select the first one
      if (!selectedChakra && data.chakras.length > 0) {
        setSelectedChakra(data.chakras[0].id);
      }
    } catch (err) {
      console.error('Error loading chakra data:', err);
      setError('Failed to load chakra visualization data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [userLevel, selectedChakra]);

  // Initial data loading
  useEffect(() => {
    loadChakraData();
  }, [loadChakraData]);

  // Handle chakra selection
  const selectChakra = useCallback((chakraId: ChakraName) => {
    setSelectedChakra(chakraId);
    setSelectedPractice(null);
  }, []);

  // Handle practice selection
  const selectPractice = useCallback((practice: ChakraPractice) => {
    setSelectedPractice(practice);
  }, []);

  // Refresh chakra data
  const refreshChakraData = useCallback(() => {
    loadChakraData();
  }, [loadChakraData]);

  return {
    chakraData,
    isLoading,
    error,
    selectedChakra,
    selectedPractice,
    selectChakra,
    selectPractice,
    refreshChakraData
  };
}

export default useChakraVisualization;
