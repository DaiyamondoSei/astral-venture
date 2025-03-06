
import { useState, useEffect } from 'react';
import { AchievementData } from '../../data/types';
import { AchievementState, AchievementTrackerProps } from './types';

export function useAchievementState(props: AchievementTrackerProps): AchievementState {
  const { userId } = props;
  
  const [earnedAchievements, setEarnedAchievements] = useState<AchievementData[]>([]);
  const [achievementHistory, setAchievementHistory] = useState<Record<string, {awarded: boolean, timestamp: string, tier?: number}>>({});
  const [currentAchievement, setCurrentAchievement] = useState<AchievementData | null>(null);
  const [progressTracking, setProgressTracking] = useState<Record<string, number>>({});

  // Load previously awarded achievements
  useEffect(() => {
    const storedAchievements = JSON.parse(localStorage.getItem(`achievements-${userId}`) || '{}');
    setAchievementHistory(storedAchievements);

    // Initialize progress tracking based on props
    initializeProgressTracking(props);
  }, [userId]);

  // Initialize and update progress tracking when values change
  const initializeProgressTracking = ({
    currentStreak = 0,
    reflectionCount = 0,
    meditationMinutes = 0,
    totalPoints = 0,
    uniqueChakrasActivated = 0,
    wisdomResourcesExplored = 0
  }) => {
    setProgressTracking({
      streakDays: currentStreak,
      reflections: reflectionCount,
      meditation_minutes: meditationMinutes,
      total_energy_points: totalPoints,
      unique_chakras_activated: uniqueChakrasActivated,
      wisdom_resources_explored: wisdomResourcesExplored
    });
  };

  // Update progress tracking when props change
  useEffect(() => {
    initializeProgressTracking(props);
  }, [
    props.currentStreak, 
    props.reflectionCount, 
    props.meditationMinutes, 
    props.totalPoints, 
    props.uniqueChakrasActivated, 
    props.wisdomResourcesExplored
  ]);

  // Display current achievement
  useEffect(() => {
    if (earnedAchievements.length > 0 && !currentAchievement) {
      setCurrentAchievement(earnedAchievements[0]);
    }
  }, [earnedAchievements, currentAchievement]);

  return {
    earnedAchievements,
    achievementHistory,
    currentAchievement,
    progressTracking
  };
}
