
import React, { useEffect, useState } from 'react';
import { useAchievementTracker } from './hooks/useAchievementTracker';
import AchievementNotification from './AchievementNotification';
import { StepInteraction } from '@/contexts/onboarding/types';
import { AchievementData } from './onboardingData';

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
  const [currentNotification, setCurrentNotification] = useState<AchievementData | null>(null);
  const { earnedAchievements, dismissAchievement } = useAchievementTracker(userId, completedSteps, stepInteractions);

  // Show the most recent achievement that hasn't been dismissed
  useEffect(() => {
    if (earnedAchievements.length > 0) {
      setCurrentNotification(earnedAchievements[0]);
    } else {
      setCurrentNotification(null);
    }
  }, [earnedAchievements]);

  if (!currentNotification) return null;

  return (
    <AchievementNotification
      achievement={currentNotification}
      onDismiss={() => dismissAchievement(currentNotification.id)}
    />
  );
};

export default AchievementLayer;
