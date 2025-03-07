
import { useState, useEffect } from 'react';
import { useChakraInsights as useChakraInsightsHook } from '@/hooks/useChakraInsights';
import { ChakraActivated } from '@/utils/emotion/chakraTypes';

interface UseChakraInsightsComponentResult {
  personalizedInsights: string[];
  practiceRecommendations: string[];
  loading: boolean;
  error: string | null;
}

/**
 * A hook that fetches and manages chakra insights for the reflection component
 */
export function useChakraInsights(
  activatedChakras?: ChakraActivated, 
  dominantEmotions: string[] = []
): UseChakraInsightsComponentResult {
  const [error, setError] = useState<string | null>(null);
  
  // Use the base chakra insights hook
  const { 
    personalizedInsights, 
    practiceRecommendations, 
    loading 
  } = useChakraInsightsHook(activatedChakras, dominantEmotions);
  
  // Reset error when inputs change
  useEffect(() => {
    setError(null);
  }, [activatedChakras, dominantEmotions]);

  return {
    personalizedInsights,
    practiceRecommendations,
    loading,
    error
  };
}
