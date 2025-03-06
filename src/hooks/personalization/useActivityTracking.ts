
import { useCallback } from 'react';
import { personalizationService } from '@/services/personalization';

export function useActivityTracking(userId: string | undefined) {
  // Track content view
  const trackContentView = useCallback(async (
    contentId: string, 
    duration?: number, 
    completionRate?: number
  ) => {
    if (!userId) return;
    
    try {
      await personalizationService.activity.trackContentView(
        userId,
        contentId,
        duration,
        completionRate
      );
    } catch (error) {
      console.error('Error tracking content view:', error);
    }
  }, [userId]);

  // Track practice completion
  const trackPracticeCompletion = useCallback(async (
    practiceId: string, 
    practiceType: string, 
    duration: number,
    chakrasActivated?: number[],
    emotionalResponse?: string[]
  ) => {
    if (!userId) return;
    
    try {
      await personalizationService.activity.trackPracticeCompletion(
        userId,
        practiceId,
        practiceType,
        duration,
        chakrasActivated,
        emotionalResponse
      );
    } catch (error) {
      console.error('Error tracking practice completion:', error);
    }
  }, [userId]);

  // Track reflection
  const trackReflection = useCallback(async (
    reflectionId: string,
    chakrasActivated?: number[],
    emotionalResponse?: string[],
    depth?: number
  ) => {
    if (!userId) return;
    
    try {
      await personalizationService.activity.trackReflection(
        userId,
        reflectionId,
        chakrasActivated,
        emotionalResponse,
        depth
      );
    } catch (error) {
      console.error('Error tracking reflection:', error);
    }
  }, [userId]);

  return {
    trackContentView,
    trackPracticeCompletion,
    trackReflection
  };
}
