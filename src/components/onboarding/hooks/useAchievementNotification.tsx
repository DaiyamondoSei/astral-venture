import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { AchievementData } from '../onboardingData';

export const useAchievementNotification = (
  earnedAchievements: AchievementData[],
  dismissAchievement: (id: string) => void
) => {
  const [currentNotification, setCurrentNotification] = useState<AchievementData | null>(null);
  const [showProgressTracker, setShowProgressTracker] = useState(false);
  const [progressTrackerTimer, setProgressTrackerTimer] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Show the most recent achievement that hasn't been dismissed
  useEffect(() => {
    if (earnedAchievements.length > 0) {
      setCurrentNotification(earnedAchievements[0]);
      
      // Notify about new achievements with toast
      const isNewAchievement = earnedAchievements[0] && !currentNotification;
      if (isNewAchievement) {
        toast({
          title: "Achievement Unlocked!",
          description: earnedAchievements[0].title,
          duration: 4000,
        });
        
        // Show progress tracker briefly after achievement
        setShowProgressTracker(true);
        
        // Clear existing timer if there is one
        if (progressTrackerTimer) {
          clearTimeout(progressTrackerTimer);
        }
        
        // Set new timer
        const timer = setTimeout(() => setShowProgressTracker(false), 10000);
        setProgressTrackerTimer(timer);
      }
    } else {
      setCurrentNotification(null);
    }
    
    // Clean up timer on unmount
    return () => {
      if (progressTrackerTimer) {
        clearTimeout(progressTrackerTimer);
      }
    };
  }, [earnedAchievements, toast, currentNotification, progressTrackerTimer]);

  const handleDismiss = useCallback(() => {
    if (currentNotification) {
      dismissAchievement(currentNotification.id);
      setCurrentNotification(null);
      
      // Keep the progress tracker visible after dismissing the notification
      setShowProgressTracker(true);
      
      // Clear existing timer
      if (progressTrackerTimer) {
        clearTimeout(progressTrackerTimer);
      }
      
      // Set new timer for progress tracker
      const timer = setTimeout(() => setShowProgressTracker(false), 5000);
      setProgressTrackerTimer(timer);
    }
  }, [currentNotification, dismissAchievement, progressTrackerTimer]);

  // Force show progress tracker for a specific duration
  const showProgress = useCallback((duration: number = 5000) => {
    setShowProgressTracker(true);
    
    // Clear existing timer
    if (progressTrackerTimer) {
      clearTimeout(progressTrackerTimer);
    }
    
    const timer = setTimeout(() => setShowProgressTracker(false), duration);
    setProgressTrackerTimer(timer);
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [progressTrackerTimer]);

  return {
    currentNotification,
    showProgressTracker,
    handleDismiss,
    showProgress
  };
};
