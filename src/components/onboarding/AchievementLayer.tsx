
import React, { useEffect, useState } from 'react';
import { useAchievementTracker } from './hooks/achievement';
import { useAchievementNotification } from './hooks/useAchievementNotification';
import AchievementNotification from './AchievementNotification';
import AchievementProgressTracker from './AchievementProgressTracker';
import { StepInteraction } from '@/contexts/onboarding/types';
import { useUserStreak } from '@/hooks/useUserStreak';

interface AchievementLayerProps {
  userId: string;
  completedSteps: Record<string, boolean>;
  stepInteractions: StepInteraction[];
  totalPoints?: number;
  reflectionCount?: number;
  meditationMinutes?: number;
  wisdomResourcesCount?: number;
}

const AchievementLayer: React.FC<AchievementLayerProps> = ({
  userId,
  completedSteps,
  stepInteractions,
  totalPoints = 0,
  reflectionCount = 0,
  meditationMinutes = 0,
  wisdomResourcesCount = 0
}) => {
  const [lastShowTime, setLastShowTime] = useState<number>(0);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);
  
  // Get user streak data from hook
  const { userStreak, activatedChakras } = useUserStreak(userId);
  
  // Get achievement data and operations using the new hook structure
  const { 
    earnedAchievements, 
    dismissAchievement, 
    getTotalPoints,
    getProgressPercentage,
    progressTracking
  } = useAchievementTracker({
    userId, 
    completedSteps, 
    stepInteractions,
    currentStreak: userStreak.current,
    reflectionCount,
    meditationMinutes,
    totalPoints,
    uniqueChakrasActivated: activatedChakras.length,
    wisdomResourcesExplored: wisdomResourcesCount
  });

  // Handle achievement notifications and progress tracker visibility
  const {
    currentNotification,
    showProgressTracker,
    handleDismiss,
    showProgress
  } = useAchievementNotification(earnedAchievements, dismissAchievement);
  
  // Only show progress tracker on initial mount, not repeatedly
  useEffect(() => {
    if (!hasInitialized && userId) {
      const now = Date.now();
      // Only show if at least 60 seconds have passed since last show
      if (now - lastShowTime > 60000) {
        const cleanup = showProgress(5000);
        setLastShowTime(now);
        setHasInitialized(true);
        return cleanup;
      }
    }
  }, [hasInitialized, userId, lastShowTime, showProgress]);

  // Show the progress tracker only after significant changes and not too frequently
  useEffect(() => {
    if (hasInitialized && progressTracking && userId) {
      const now = Date.now();
      const hasSignificantChange = 
        progressTracking.streakDays > 2 || 
        progressTracking.reflections > 2 || 
        progressTracking.meditation_minutes > 10 ||
        progressTracking.total_energy_points > 50;
        
      // Only show if significant change AND at least 60 seconds since last show
      if (hasSignificantChange && (now - lastShowTime > 60000)) {
        const cleanup = showProgress(5000);
        setLastShowTime(now);
        return cleanup;
      }
    }
  }, [progressTracking, hasInitialized, userId, lastShowTime, showProgress]);

  return (
    <>
      {/* Display the current achievement notification if available */}
      {currentNotification && (
        <AchievementNotification
          achievement={currentNotification}
          onDismiss={handleDismiss}
        />
      )}
      
      {/* Show progress tracker after earning achievements or when specified */}
      {showProgressTracker && (
        <AchievementProgressTracker
          progressPercentage={getProgressPercentage()}
          totalPoints={getTotalPoints()}
          streakDays={userStreak.current}
        />
      )}
    </>
  );
};

export default AchievementLayer;
