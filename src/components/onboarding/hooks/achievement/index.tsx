
// Re-export all the achievement hooks for easy access
export { useAchievementTracker } from './useAchievementTracker';
export { useAchievementState } from './useAchievementState';
export { useAchievementProgress } from './useAchievementProgress';
export { useAchievementDetection } from './useAchievementDetection';
export { useAchievementVisualization } from './useAchievementVisualization';
export { useProgressTracking } from './useProgressTracking';
export { useAchievementNotification } from '../../hooks/useAchievementNotification';

// Re-export types
export * from './types';

// Export additional utility functions
export const getAchievementIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    'discovery': 'sparkles',
    'completion': 'check-circle',
    'interaction': 'mouse-pointer',
    'streak': 'flame',
    'progressive': 'trending-up',
    'milestone': 'award'
  };
  
  return iconMap[type] || 'star';
};

export const formatAchievementPoints = (points: number): string => {
  return `+${points} points`;
};

export const getProgressColor = (percentage: number): string => {
  if (percentage < 25) return 'text-red-500';
  if (percentage < 50) return 'text-yellow-500';
  if (percentage < 75) return 'text-blue-500';
  return 'text-green-500';
};
