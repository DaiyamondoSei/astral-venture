
import { useState, useCallback, useEffect } from 'react';
import { AchievementData } from '../data/types';

interface UseAchievementNotificationReturn {
  currentNotification: AchievementData | null;
  showProgressTracker: boolean;
  handleDismiss: () => void;
  showProgress: (duration?: number) => () => void;
}

/**
 * Hook to manage achievement notifications and progress tracker visibility
 */
export function useAchievementNotification(
  earnedAchievements: AchievementData[],
  dismissAchievement: (id: string) => void
): UseAchievementNotificationReturn {
  const [currentNotification, setCurrentNotification] = useState<AchievementData | null>(null);
  const [showProgressTracker, setShowProgressTracker] = useState<boolean>(false);
  const [notificationQueue, setNotificationQueue] = useState<AchievementData[]>([]);

  // Process earned achievements and add them to the queue
  useEffect(() => {
    if (earnedAchievements.length > 0) {
      setNotificationQueue(prev => [...prev, ...earnedAchievements]);
    }
  }, [earnedAchievements]);

  // Process the notification queue
  useEffect(() => {
    if (notificationQueue.length > 0 && !currentNotification) {
      const nextNotification = notificationQueue[0];
      setCurrentNotification(nextNotification);
      setNotificationQueue(prev => prev.slice(1));
    }
  }, [notificationQueue, currentNotification]);

  // Handle dismissing the current notification
  const handleDismiss = useCallback(() => {
    if (currentNotification) {
      dismissAchievement(currentNotification.id);
      setCurrentNotification(null);
    }
  }, [currentNotification, dismissAchievement]);

  // Show the progress tracker for a specific duration
  const showProgress = useCallback((duration = 5000) => {
    setShowProgressTracker(true);
    
    const timeout = setTimeout(() => {
      setShowProgressTracker(false);
    }, duration);
    
    // Return cleanup function
    return () => clearTimeout(timeout);
  }, []);

  return {
    currentNotification,
    showProgressTracker,
    handleDismiss,
    showProgress
  };
}
