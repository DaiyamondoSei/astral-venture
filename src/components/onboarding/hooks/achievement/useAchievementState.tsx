
import { useState } from 'react';
import { AchievementState, IAchievementData } from './types';

/**
 * Custom hook to manage achievement state
 */
export function useAchievementState(initialAchievements: IAchievementData[] = []): AchievementState {
  const [state, setState] = useState<AchievementState>({
    earnedAchievements: initialAchievements,
    achievementHistory: {},
    currentAchievement: null,
    progressTracking: {
      reflections: 0,
      meditation_minutes: 0,
      chakras_activated: 0,
      wisdom_resources_explored: 0,
      streakDays: 0,
      total_energy_points: 0
    },
    unlockedAchievements: initialAchievements,
    progress: {},
    recentAchievements: [],
    hasNewAchievements: false,
    totalPoints: initialAchievements.reduce((total, achievement) => total + achievement.points, 0)
  });

  return state;
}
