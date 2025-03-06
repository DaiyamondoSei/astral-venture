
import React, { useEffect, useState } from 'react';
import { useAchievementTracker } from './hooks/useAchievementTracker';
import AchievementNotification from './AchievementNotification';
import { StepInteraction } from '@/contexts/onboarding/types';
import { AchievementData } from './onboardingData';
import { Progress } from "@/components/ui/progress";
import { useToast } from '@/components/ui/use-toast';
import ProgressTracker from '@/components/ProgressTracker';

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
  const { toast } = useToast();
  const [showProgressTracker, setShowProgressTracker] = useState(false);

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
        
        // Show progress tracker briefly after achievement
        setShowProgressTracker(true);
        setTimeout(() => setShowProgressTracker(false), 5000);
      }
    } else {
      setCurrentNotification(null);
    }
  }, [earnedAchievements, toast, currentNotification]);

  return (
    <>
      {currentNotification && (
        <AchievementNotification
          achievement={currentNotification}
          onDismiss={() => dismissAchievement(currentNotification.id)}
        />
      )}
      
      {/* Progress Tracker (shows after achievements) */}
      {showProgressTracker && (
        <div className="fixed bottom-4 right-4 z-50 w-64 p-4 bg-background/90 rounded-lg shadow-lg border border-quantum-500/30 backdrop-blur-sm">
          <h4 className="font-medium text-sm mb-2">Your Progress</h4>
          <ProgressTracker 
            progress={getProgressPercentage()} 
            label={`${getTotalPoints()} Energy Points`}
          />
        </div>
      )}
    </>
  );
};

export default AchievementLayer;
