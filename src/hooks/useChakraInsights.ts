
import { useState, useEffect, useCallback } from 'react';
import { chakraInsightsService, ChakraInsight, ChakraInsightsOptions } from '@/services/chakra/ChakraInsightsService';

/**
 * Hook for fetching and managing chakra insights
 */
export function useChakraInsights(options: ChakraInsightsOptions = {}) {
  const [insights, setInsights] = useState<ChakraInsight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load insights data
  const loadInsights = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await chakraInsightsService.getChakraInsights(options);
      setInsights(data);
    } catch (err) {
      console.error('Error loading chakra insights:', err);
      setError('Failed to load chakra insights. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  // Initial data loading
  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  // Refresh insights data
  const refreshInsights = useCallback(() => {
    loadInsights();
  }, [loadInsights]);

  return {
    insights,
    isLoading,
    error,
    refreshInsights
  };
}

export default useChakraInsights;
