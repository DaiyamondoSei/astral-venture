
import React, { useEffect } from 'react';
import { useAchievementTracker } from './hooks/useAchievementTracker';
import { useAchievementNotification } from './hooks/useAchievementNotification';
import AchievementNotification from './AchievementNotification';
import AchievementProgressTracker from './AchievementProgressTracker';
import { StepInteraction } from '@/contexts/onboarding/types';

interface AchievementLayerProps {
  userId: string;
  completedSteps: Record<string, boolean>;
  stepInteractions: StepInteraction[];
}

const AchievementLayer: React.FC<AchievementLayerProps> = ({
  userId,
  completedSteps,
  stepInteractions
}) => {
  // Get achievement data and operations
  const { 
    earnedAchievements, 
    dismissAchievement, 
    getTotalPoints,
    getProgressPercentage
  } = useAchievementTracker(
    userId, 
    completedSteps, 
    stepInteractions
  );

  // Handle achievement notifications and progress tracker visibility
  const {
    currentNotification,
    showProgressTracker,
    handleDismiss,
    showProgress
  } = useAchievementNotification(earnedAchievements, dismissAchievement);
  
  // Show progress tracker briefly on component mount
  useEffect(() => {
    // Wait for earnedAchievements to load before deciding to show progress
    if (earnedAchievements.length > 0 || Object.keys(completedSteps).length > 0) {
      const cleanup = showProgress(7000);
      return cleanup;
    }
  }, [earnedAchievements.length, completedSteps, showProgress]);

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
        />
      )}
    </>
  );
};

export default AchievementLayer;
