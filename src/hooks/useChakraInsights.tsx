
import { useState, useEffect } from 'react';
import { chakraInsightsService } from '@/services/chakra/ChakraInsightsService';
import { ChakraType } from '@/types/chakra/ChakraSystemTypes';

export interface ChakraInsight {
  id: string;
  chakraType: ChakraType;
  title: string;
  description: string;
  actionItems: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface ChakraInsightsOptions {
  activatedChakras?: number[];
  includeRecommendations?: boolean;
  detailLevel?: 'basic' | 'detailed';
}

/**
 * Hook for accessing chakra insights based on the user's chakra activation
 */
export const useChakraInsights = (options: ChakraInsightsOptions = {}) => {
  const [insights, setInsights] = useState<ChakraInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshInsights = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const activatedChakras = options.activatedChakras || [];
      const data = await chakraInsightsService.getInsights(activatedChakras);
      
      setInsights(data);
    } catch (err) {
      console.error('Error fetching chakra insights:', err);
      setError('Failed to load chakra insights. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshInsights();
  }, [options.activatedChakras]);

  return {
    insights,
    isLoading,
    error,
    refreshInsights
  };
};

export default useChakraInsights;
