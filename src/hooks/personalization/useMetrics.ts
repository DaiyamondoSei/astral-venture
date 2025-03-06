
import { useState, useCallback } from 'react';
import { personalizationService } from '@/services/personalization';
import { PersonalizationMetrics } from '@/services/personalization';

export function useMetrics(userId: string | undefined) {
  const [metrics, setMetrics] = useState<PersonalizationMetrics | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Load metrics
  const loadMetrics = useCallback(async () => {
    if (!userId) return;
    
    try {
      const userMetrics = await personalizationService.metrics.getMetrics(userId);
      if (userMetrics) {
        setMetrics(userMetrics);
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  }, [userId]);

  // Refresh metrics
  const refreshMetrics = useCallback(async () => {
    if (!userId) return;
    
    setIsUpdating(true);
    try {
      const userMetrics = await personalizationService.metrics.calculateMetrics(userId);
      setMetrics(userMetrics);
    } catch (error) {
      console.error('Error refreshing metrics:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [userId]);

  return {
    metrics,
    loadMetrics,
    refreshMetrics,
    isUpdating
  };
}
