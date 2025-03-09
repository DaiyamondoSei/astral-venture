
import { useEffect } from 'react';
import { useAchievementProgress } from './achievement/useAchievementProgress';
import { useAchievementState } from './achievement/useAchievementState';

// Props for the hook
interface AchievementTrackerProps {
  onboardingInteractions?: number;
  reflections?: number;
  completedPractices?: number;
}

// Types for the achievement tracker
type AchievementTrackerResult = ReturnType<typeof useAchievementProgress>;

/**
 * Hook to track user progress and award achievements automatically
 */
export const useAchievementTracker = (props: AchievementTrackerProps): AchievementTrackerResult => {
  const { onboardingInteractions = 0, reflections = 0, completedPractices = 0 } = props;
  const { achievements } = useAchievementState();
  const tracker = useAchievementProgress();
  
  // Track onboarding interactions
  useEffect(() => {
    if (onboardingInteractions > 0) {
      // Find onboarding interaction achievements
      const interactionAchievement = achievements.find(a => a.id === 'onboarding-interaction');
      if (interactionAchievement) {
        tracker.trackProgress('onboarding-interaction', 1);
      }
    }
  }, [onboardingInteractions, achievements]);
  
  // Track reflections
  useEffect(() => {
    if (reflections > 0) {
      // Find reflection achievements
      const reflectionAchievement = achievements.find(a => a.id === 'reflection-milestone');
      if (reflectionAchievement) {
        tracker.trackProgress('reflection-milestone', 1);
      }
    }
  }, [reflections, achievements]);
  
  // Track completed practices
  useEffect(() => {
    if (completedPractices > 0) {
      // Find practice achievements
      const practiceAchievement = achievements.find(a => a.id === 'practice-completion');
      if (practiceAchievement) {
        tracker.trackProgress('practice-completion', 1);
      }
    }
  }, [completedPractices, achievements]);
  
  return tracker;
};
