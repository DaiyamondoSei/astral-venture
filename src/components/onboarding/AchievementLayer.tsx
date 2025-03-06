
import React from 'react';
import AchievementNotification from './AchievementNotification';
import { useAchievementTracker } from './hooks/useAchievementTracker';

interface AchievementLayerProps {
  userId: string;
  completedSteps: Record<string, boolean>;
  stepInteractions: any[];
}

const AchievementLayer: React.FC<AchievementLayerProps> = ({ 
  userId, 
  completedSteps,
  stepInteractions
}) => {
  const {
    currentAchievement,
    handleAchievementDismiss,
    getUserInteractions
  } = useAchievementTracker(userId, completedSteps);

  return (
    <>
      {/* Achievement notification */}
      {currentAchievement && (
        <AchievementNotification 
          achievement={currentAchievement}
          userInteractions={getUserInteractions(stepInteractions)}
          onDismiss={handleAchievementDismiss}
        />
      )}
    </>
  );
};

export default AchievementLayer;
