
import React from 'react';
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
    handleDismiss
  } = useAchievementNotification(earnedAchievements, dismissAchievement);

  return (
    <>
      {/* Display the current achievement notification if available */}
      {currentNotification && (
        <AchievementNotification
          achievement={currentNotification}
          onDismiss={handleDismiss}
        />
      )}
      
      {/* Show progress tracker after earning achievements */}
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
