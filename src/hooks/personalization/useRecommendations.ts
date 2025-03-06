
import { useState, useCallback } from 'react';
import { ContentRecommendation } from '@/services/personalization';
import { personalizationService } from '@/services/personalization';

export function useRecommendations(userId: string | undefined) {
  const [recommendations, setRecommendations] = useState<ContentRecommendation[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Load recommendations
  const loadRecommendations = useCallback(async (allowRecommendations: boolean) => {
    if (!userId || !allowRecommendations) {
      setRecommendations([]);
      return;
    }
    
    setIsUpdating(true);
    try {
      const userRecommendations = await personalizationService.recommendations.getRecommendations(userId);
      setRecommendations(userRecommendations);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      setRecommendations([]);
    } finally {
      setIsUpdating(false);
    }
  }, [userId]);

  // Refresh recommendations
  const refreshRecommendations = useCallback(async () => {
    if (!userId) return;
    
    setIsUpdating(true);
    try {
      const userRecommendations = await personalizationService.recommendations.getRecommendations(userId);
      setRecommendations(userRecommendations);
    } catch (error) {
      console.error('Error refreshing recommendations:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [userId]);

  return {
    recommendations,
    loadRecommendations,
    refreshRecommendations,
    isUpdating
  };
}
