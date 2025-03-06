
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { AchievementData } from '../onboardingData';

export const useAchievementNotification = (
  earnedAchievements: AchievementData[],
  dismissAchievement: (id: string) => void
) => {
  const [currentNotification, setCurrentNotification] = useState<AchievementData | null>(null);
  const [showProgressTracker, setShowProgressTracker] = useState(false);
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
        
        // Show progress tracker briefly after achievement
        setShowProgressTracker(true);
        setTimeout(() => setShowProgressTracker(false), 5000);
      }
    } else {
      setCurrentNotification(null);
    }
  }, [earnedAchievements, toast, currentNotification]);

  const handleDismiss = () => {
    if (currentNotification) {
      dismissAchievement(currentNotification.id);
      setCurrentNotification(null);
    }
  };

  return {
    currentNotification,
    showProgressTracker,
    handleDismiss,
  };
};
