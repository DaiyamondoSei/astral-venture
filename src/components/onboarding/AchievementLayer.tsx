import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAchievementTracker } from './hooks/achievement/useAchievementTracker';
import { useAchievementNotification } from './hooks/useAchievementNotification';
import AchievementNotification from './AchievementNotification';
import AchievementProgressTracker from './AchievementProgressTracker';
import { StepInteraction } from '@/types/achievement';
import { useUserStreak } from '@/hooks/useUserStreak';
import { getPerformanceCategory } from '@/utils/performanceUtils';

interface AchievementLayerProps {
  userId: string;
  completedSteps: Record<string, boolean>;
  stepInteractions: StepInteraction[];
  totalPoints?: number;
  reflectionCount?: number;
  meditationMinutes?: number;
  wisdomResourcesCount?: number;
}

const AchievementLayer: React.FC<AchievementLayerProps> = ({
  userId,
  completedSteps,
  stepInteractions,
  totalPoints = 0,
  reflectionCount = 0,
  meditationMinutes = 0,
  wisdomResourcesCount = 0
}) => {
  const [lastShowTime, setLastShowTime] = useState<number>(0);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);
  const devicePerformance = useMemo(() => getPerformanceCategory(), []);
  
  // Get user streak data from hook
  const { userStreak, activatedChakras } = useUserStreak(userId);
  
  // Memoize achievement tracker inputs to prevent unnecessary recalculations
  const trackerProps = useMemo(() => ({
    userId, 
    completedSteps, 
    stepInteractions,
    currentStreak: userStreak.current,
    reflectionCount,
    meditationMinutes,
    totalPoints,
    uniqueChakrasActivated: activatedChakras.length,
    wisdomResourcesExplored: wisdomResourcesCount
  }), [
    userId, 
    completedSteps, 
    stepInteractions, 
    userStreak.current, 
    reflectionCount, 
    meditationMinutes, 
    totalPoints, 
    activatedChakras.length, 
    wisdomResourcesCount
  ]);
  
  // Get achievement data and operations using the hook structure
  const { 
    earnedAchievements, 
    dismissAchievement, 
    getTotalPoints,
    getProgressPercentage,
    progressTracking
  } = useAchievementTracker(trackerProps);

  // Handle achievement notifications and progress tracker visibility
  const {
    currentNotification,
    showProgressTracker,
    handleDismiss,
    showProgress
  } = useAchievementNotification(earnedAchievements, dismissAchievement);
  
  // Memoize the visibility check function for better performance
  const shouldShowProgressTracker = useCallback(() => {
    const now = Date.now();
    const timeSinceLastShow = now - lastShowTime;
    
    // Don't show too frequently (throttle based on device performance)
    const minTimeBetweenShows = devicePerformance === 'low' 
      ? 120000  // 2 minutes for low-end devices
      : devicePerformance === 'medium'
        ? 90000  // 1.5 minutes for medium devices
        : 60000; // 1 minute for high-end devices
        
    return timeSinceLastShow > minTimeBetweenShows;
  }, [lastShowTime, devicePerformance]);
  
  // Only show progress tracker on initial mount, not repeatedly
  useEffect(() => {
    if (!hasInitialized && userId) {
      if (shouldShowProgressTracker()) {
        // Adjust display time based on device performance
        const displayTime = devicePerformance === 'low' ? 3000 : 5000;
        const cleanup = showProgress(displayTime);
        setLastShowTime(Date.now());
        setHasInitialized(true);
        return cleanup;
      }
    }
  }, [hasInitialized, userId, shouldShowProgressTracker, showProgress, devicePerformance]);

  // Show the progress tracker only after significant changes
  useEffect(() => {
    if (hasInitialized && progressTracking && userId) {
      // Only check if enough time has passed since last show
      if (shouldShowProgressTracker()) {
        // Check for significant changes to minimize unnecessary displays
        const hasSignificantChange = 
          progressTracking.streakDays > 2 || 
          progressTracking.reflections > 2 || 
          progressTracking.meditation_minutes > 10 ||
          progressTracking.total_energy_points > 50;
          
        if (hasSignificantChange) {
          // Adjust display time based on device performance
          const displayTime = devicePerformance === 'low' ? 3000 : 5000;
          const cleanup = showProgress(displayTime);
          setLastShowTime(Date.now());
          return cleanup;
        }
      }
    }
  }, [
    progressTracking, 
    hasInitialized, 
    userId, 
    shouldShowProgressTracker, 
    showProgress, 
    devicePerformance
  ]);

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
          streakDays={userStreak.current}
        />
      )}
    </>
  );
};

export default React.memo(AchievementLayer);
