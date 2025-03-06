
import React, { useEffect, useState } from 'react';
import { useAchievementTracker } from './hooks/useAchievementTracker';
import AchievementNotification from './AchievementNotification';
import { StepInteraction } from '@/contexts/OnboardingContext';
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
  const [currentAchievement, setCurrentAchievement] = useState<AchievementData | null>(null);
  const { earnedAchievements, dismissAchievement } = useAchievementTracker(userId, completedSteps, stepInteractions);

  // Show the most recent achievement that hasn't been dismissed
  useEffect(() => {
    if (earnedAchievements.length > 0) {
      setCurrentAchievement(earnedAchievements[0]);
    } else {
      setCurrentAchievement(null);
    }
  }, [earnedAchievements]);

  if (!currentAchievement) return null;

  return (
    <AchievementNotification
      achievement={currentAchievement}
      onDismiss={() => dismissAchievement(currentAchievement.id)}
    />
  );
};

export default AchievementLayer;
