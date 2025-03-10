
import { useState, useEffect, useCallback } from 'react';
import { chakraInsightsService } from '@/services/chakra/ChakraInsightsService';
import { ErrorCategory, ErrorSeverity, handleError } from '@/utils/errorHandling';

export interface ChakraInsight {
  id: string;
  chakraType: string;
  status: string;
  insights: string[];
  recommendations: string[];
  affinity: number;
}

export interface ChakraInsightsOptions {
  includeRecommendations?: boolean;
  chakraTypes?: string[];
  minAffinity?: number;
  limit?: number;
}

/**
 * Hook to access chakra insights data for the user
 */
export function useChakraInsights(options: ChakraInsightsOptions = {}) {
  const [insights, setInsights] = useState<ChakraInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshInsights = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const fetchedInsights = await chakraInsightsService.getUserChakraInsights({
        includeRecommendations: options.includeRecommendations,
        chakraTypes: options.chakraTypes,
        minAffinity: options.minAffinity,
        limit: options.limit
      });
      
      setInsights(fetchedInsights);
    } catch (err) {
      handleError(err, {
        category: ErrorCategory.DATA_PROCESSING,
        severity: ErrorSeverity.ERROR,
        context: 'Chakra insights',
        customMessage: 'Unable to load chakra insights'
      });
      setError('Failed to load chakra insights. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  useEffect(() => {
    refreshInsights();
  }, [refreshInsights]);

  return {
    insights,
    isLoading,
    error,
    refreshInsights
  };
}

export default useChakraInsights;
