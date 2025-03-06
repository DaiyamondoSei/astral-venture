
import React, { useEffect, useState } from 'react';
import { useAchievementTracker } from './hooks/useAchievementTracker';
import AchievementNotification from './AchievementNotification';
import { StepInteraction } from '@/contexts/onboarding/types';
import { AchievementData } from './onboardingData';
import { Progress } from "@/components/ui/progress";
import { useToast } from '@/components/ui/use-toast';

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
  const { earnedAchievements, dismissAchievement, getTotalPoints } = useAchievementTracker(
    userId, 
    completedSteps, 
    stepInteractions
  );
  const { toast } = useToast();

  // Show the most recent achievement that hasn't been dismissed
  useEffect(() => {
    if (earnedAchievements.length > 0) {
      setCurrentNotification(earnedAchievements[0]);
      
      // Notify about new achievements with toast
      if (earnedAchievements[0] && !currentNotification) {
        toast({
          title: "Achievement Unlocked!",
          description: earnedAchievements[0].title,
          duration: 4000,
        });
      }
    } else {
      setCurrentNotification(null);
    }
  }, [earnedAchievements, toast, currentNotification]);

  if (!currentNotification) return null;

  return (
    <AchievementNotification
      achievement={currentNotification}
      onDismiss={() => dismissAchievement(currentNotification.id)}
    />
  );
};

export default AchievementLayer;
