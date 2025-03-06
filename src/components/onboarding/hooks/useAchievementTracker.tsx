
import { useAchievementTracker } from './achievement';
import { StepInteraction } from '@/contexts/onboarding/types';

// This file now just re-exports the refactored hook for backward compatibility
export { useAchievementTracker };

// Re-export the main hook with the original parameter signature
export const useAchievementTracker as any = (
  userId: string, 
  completedSteps: Record<string, boolean>,
  stepInteractions: StepInteraction[],
  currentStreak: number = 0,
  reflectionCount: number = 0,
  meditationMinutes: number = 0,
  totalPoints: number = 0,
  uniqueChakrasActivated: number = 0,
  wisdomResourcesExplored: number = 0
) => {
  return useAchievementTracker({
    userId,
    completedSteps,
    stepInteractions,
    currentStreak,
    reflectionCount,
    meditationMinutes,
    totalPoints,
    uniqueChakrasActivated,
    wisdomResourcesExplored
  });
};
