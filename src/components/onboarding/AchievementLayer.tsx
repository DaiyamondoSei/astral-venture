
import React, { useEffect } from 'react';
import { useAchievementTracker } from './hooks/useAchievementTracker';
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
  // Get user streak data from hook
  const { userStreak, activatedChakras } = useUserStreak(userId);
  
  // Get achievement data and operations
  const { 
    earnedAchievements, 
    dismissAchievement, 
    getTotalPoints,
    getProgressPercentage,
    progressTracking
  } = useAchievementTracker(
    userId, 
    completedSteps, 
    stepInteractions,
    userStreak.current,
    reflectionCount,
    meditationMinutes,
    totalPoints,
    activatedChakras.length,
    wisdomResourcesCount
  );

  // Handle achievement notifications and progress tracker visibility
  const {
    currentNotification,
    showProgressTracker,
    handleDismiss,
    showProgress
  } = useAchievementNotification(earnedAchievements, dismissAchievement);
  
  // Show progress tracker briefly on component mount or when achievements change
  useEffect(() => {
    // Wait for earnedAchievements to load before deciding to show progress
    if (earnedAchievements.length > 0 || Object.keys(completedSteps).length > 0) {
      const cleanup = showProgress(7000);
      return cleanup;
    }
  }, [earnedAchievements.length, completedSteps, showProgress]);

  // Show the progress tracker after significant changes in tracked values
  useEffect(() => {
    if (progressTracking && (
      progressTracking.streakDays > 0 || 
      progressTracking.reflections > 0 || 
      progressTracking.meditation_minutes > 0 ||
      progressTracking.total_energy_points > 0
    )) {
      const cleanup = showProgress(5000);
      return cleanup;
    }
  }, [progressTracking, showProgress]);

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
