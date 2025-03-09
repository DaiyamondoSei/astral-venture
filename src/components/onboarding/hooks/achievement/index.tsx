
import { useAchievementTracker } from './useAchievementTracker';
import { useAchievementState } from './useAchievementState';
import { useProgressTracking } from './useProgressTracking';
import { AchievementState, ProgressTrackingResult } from './types';

// Utility function to get the appropriate color class based on progress percentage
export const getProgressColor = (percentage: number): string => {
  if (percentage >= 90) return 'text-green-500';
  if (percentage >= 70) return 'text-emerald-500';
  if (percentage >= 50) return 'text-blue-500';
  if (percentage >= 30) return 'text-amber-500';
  return 'text-muted-foreground';
};

// Format achievement points for display
export const formatAchievementPoints = (points: number): string => {
  if (points >= 1000) {
    return `${(points / 1000).toFixed(1)}k`;
  }
  return points.toString();
};

export {
  useAchievementTracker,
  useAchievementState,
  useProgressTracking
};

export type {
  AchievementState,
  ProgressTrackingResult
};
