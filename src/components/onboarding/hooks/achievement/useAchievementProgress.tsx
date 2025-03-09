import { useState, useEffect } from 'react';

export function useAchievementProgress(
  achievements: any[],
  progress: Record<string, number>,
  completedSteps: Record<string, boolean>
) {
  const [achievementProgress, setAchievementProgress] = useState<Record<string, number>>({});
  const [earnedPoints, setEarnedPoints] = useState<number>(0);
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  
  // Calculate progress for each achievement
  useEffect(() => {
    calculateProgress();
  }, [achievements, progress, completedSteps]);
  
  // Calculate progress for all achievements
  const calculateProgress = () => {
    const newProgress: Record<string, number> = {};
    let totalPoints = 0;
    let earnedPointsCount = 0;
    
    // Fix for the 'length' property error by checking if the value is a number
    achievements.forEach(achievement => {
      if (achievement.trackingType && progress[achievement.trackingType]) {
        const currentValue = progress[achievement.trackingType];
        const required = achievement.requiredAmount || 0;
        
        // Check if the value is a number before using length
        if (typeof currentValue === 'number') {
          // Handle numeric progress
          const percentage = Math.min(100, (currentValue / required) * 100);
          newProgress[achievement.id] = percentage;
        } else if (typeof currentValue === 'string' && typeof required === 'number') {
          // Handle string length comparison
          const percentage = Math.min(100, (currentValue.length / required) * 100);
          newProgress[achievement.id] = percentage;
        } else if (Array.isArray(currentValue) && typeof required === 'number') {
          // Handle array length comparison
          const percentage = Math.min(100, (currentValue.length / required) * 100);
          newProgress[achievement.id] = percentage;
        }
      }
      
      // Calculate points for step-based achievements
      if (achievement.requiredStep && completedSteps[achievement.requiredStep]) {
        newProgress[achievement.id] = 100;
        earnedPointsCount += achievement.points;
      }
      
      // Calculate points for multi-step achievements
      if (achievement.requiredSteps && achievement.requiredSteps.length > 0) {
        const completedRequiredSteps = achievement.requiredSteps.filter(step => completedSteps[step]);
        const percentage = (completedRequiredSteps.length / achievement.requiredSteps.length) * 100;
        newProgress[achievement.id] = percentage;
        
        if (percentage >= 100) {
          earnedPointsCount += achievement.points;
        }
      }
      
      totalPoints += achievement.points;
    });
    
    setAchievementProgress(newProgress);
    setEarnedPoints(earnedPointsCount);
    
    // Calculate overall progress percentage
    if (totalPoints > 0) {
      setProgressPercentage((earnedPointsCount / totalPoints) * 100);
    }
  };
  
  // Get progress for a specific achievement
  const getProgressForAchievement = (id: string): number => {
    return achievementProgress[id] || 0;
  };
  
  // Get total earned points
  const getTotalPoints = (): number => {
    return earnedPoints;
  };
  
  // Get overall progress percentage
  const getProgressPercentage = (): number => {
    return progressPercentage;
  };
  
  // Track progress for a specific metric
  const trackProgress = (type: string, amount: number): void => {
    const currentValue = progress[type] || 0;
    const newValue = currentValue + amount;
    
    // Update progress and recalculate
    progress[type] = newValue;
    calculateProgress();
  };
  
  // Reset progress for a specific metric
  const resetProgress = (type: string): void => {
    progress[type] = 0;
    calculateProgress();
  };
  
  return {
    achievementProgress,
    earnedPoints,
    progressPercentage,
    getProgressForAchievement,
    getTotalPoints,
    getProgressPercentage,
    trackProgress,
    resetProgress
  };
}
