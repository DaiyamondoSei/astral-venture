
import { useState, useEffect, useCallback } from 'react';
import { ChakraInsightsService } from '@/services/chakra/ChakraInsightsService';
import { AIInsight } from '@/services/ai/types';

interface ChakraInsightsOptions {
  userId?: string;
  chakras?: Record<string, number>;
  initialInsights?: AIInsight[];
}

export function useChakraInsights({ userId, chakras, initialInsights }: ChakraInsightsOptions = {}) {
  const [insights, setInsights] = useState<AIInsight[]>(initialInsights || []);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  // Fetch insights on mount or when dependencies change
  useEffect(() => {
    if (userId) {
      fetchInsights();
    }
  }, [userId, chakras]);

  // Fetch chakra-based insights
  const fetchInsights = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const fetchedInsights = await ChakraInsightsService.getInsights(userId, chakras);
      setInsights(fetchedInsights);
      
      // Also fetch recommendations
      const fetchedRecommendations = await ChakraInsightsService.getPersonalizedRecommendations(userId);
      setRecommendations(fetchedRecommendations);
    } catch (err) {
      console.error('Error fetching chakra insights:', err);
      setError('Failed to load chakra insights');
    } finally {
      setLoading(false);
    }
  }, [userId, chakras]);

  // Get insight by type
  const getInsightByType = useCallback((type: string): AIInsight | null => {
    return insights.find(insight => insight.type === type) || null;
  }, [insights]);

  // Get all insights
  const getAllInsights = useCallback((): AIInsight[] => {
    return insights;
  }, [insights]);

  // Get recommendations
  const getRecommendations = useCallback((): string[] => {
    return recommendations;
  }, [recommendations]);

  // Refresh insights
  const refreshInsights = useCallback(async () => {
    await fetchInsights();
  }, [fetchInsights]);

  return {
    insights,
    loading,
    error,
    recommendations,
    getInsightByType,
    getAllInsights,
    getRecommendations,
    refreshInsights
  };
}
