
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getChakraVisualizationData, 
  ChakraVisualizationData,
  ChakraName,
  ChakraPractice
} from '@/services/chakra/chakraVisualizationService';

interface UseChakraVisualizationOptions {
  userLevel?: number;
}

interface UseChakraVisualizationResult {
  chakraData: ChakraVisualizationData | null;
  isLoading: boolean;
  error: string | null;
  selectedChakra: ChakraName | null;
  selectedPractice: ChakraPractice | null;
  selectChakra: (chakraId: ChakraName) => void;
  selectPractice: (practice: ChakraPractice) => void;
  refreshChakraData: () => Promise<void>;
}

/**
 * Hook for managing chakra visualization data and interactions
 */
export function useChakraVisualization(
  options: UseChakraVisualizationOptions = {}
): UseChakraVisualizationResult {
  const { user } = useAuth();
  const userLevel = options.userLevel || 1;
  
  const [chakraData, setChakraData] = useState<ChakraVisualizationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedChakra, setSelectedChakra] = useState<ChakraName | null>(null);
  const [selectedPractice, setSelectedPractice] = useState<ChakraPractice | null>(null);
  
  // Fetch chakra data
  const fetchChakraData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getChakraVisualizationData(user?.id, userLevel);
      setChakraData(data);
      
      // Select dominant chakra if available, otherwise root chakra
      if (data.userChakraSystem?.dominantChakra) {
        setSelectedChakra(data.userChakraSystem.dominantChakra);
      } else if (!selectedChakra) {
        setSelectedChakra('root');
      }
      
      // Reset selected practice
      setSelectedPractice(null);
    } catch (err: any) {
      console.error('Error fetching chakra data:', err);
      setError(err.message || 'Error fetching chakra data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchChakraData();
  }, [user?.id, userLevel]);
  
  // Select a chakra
  const selectChakra = (chakraId: ChakraName) => {
    setSelectedChakra(chakraId);
    setSelectedPractice(null);
  };
  
  // Select a practice
  const selectPractice = (practice: ChakraPractice) => {
    setSelectedPractice(practice);
  };
  
  // Refresh chakra data
  const refreshChakraData = async () => {
    await fetchChakraData();
  };
  
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
