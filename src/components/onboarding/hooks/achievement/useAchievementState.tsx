
import { useState, useEffect, useRef } from 'react';
import { AchievementData } from '../../data/types';
import { AchievementState, AchievementTrackerProps } from './types';

export function useAchievementState(props: AchievementTrackerProps): AchievementState {
  const { userId } = props;
  const isInitialized = useRef(false);
  
  const [earnedAchievements, setEarnedAchievements] = useState<AchievementData[]>([]);
  const [achievementHistory, setAchievementHistory] = useState<Record<string, {awarded: boolean, timestamp: string, tier?: number}>>({});
  const [currentAchievement, setCurrentAchievement] = useState<AchievementData | null>(null);
  const [progressTracking, setProgressTracking] = useState<Record<string, number>>({});

  // Load previously awarded achievements - only once
  useEffect(() => {
    if (!userId || isInitialized.current) return;
    
    try {
      const storedAchievements = JSON.parse(localStorage.getItem(`achievements-${userId}`) || '{}');
      setAchievementHistory(storedAchievements);
      
      // Initialize progress tracking based on props
      initializeProgressTracking(props);
      isInitialized.current = true;
    } catch (error) {
      console.error("Error loading achievement history:", error);
      // Reset in case of corrupt data
      localStorage.removeItem(`achievements-${userId}`);
    }
  }, [userId]);

  // Initialize and update progress tracking when values change
  const initializeProgressTracking = ({
    currentStreak = 0,
    reflectionCount = 0,
    meditationMinutes = 0,
    totalPoints = 0,
    uniqueChakrasActivated = 0,
    wisdomResourcesExplored = 0
  }: Partial<AchievementTrackerProps>) => {
    setProgressTracking({
      streakDays: currentStreak,
      reflections: reflectionCount,
      meditation_minutes: meditationMinutes,
      total_energy_points: totalPoints,
      unique_chakras_activated: uniqueChakrasActivated,
      wisdom_resources_explored: wisdomResourcesExplored
    });
  };

  // Update progress tracking when props change - but throttle updates
  // to prevent too many re-renders
  const prevProps = useRef({
    currentStreak: props.currentStreak || 0,
    reflectionCount: props.reflectionCount || 0,
    meditationMinutes: props.meditationMinutes || 0,
    totalPoints: props.totalPoints || 0,
    uniqueChakrasActivated: props.uniqueChakrasActivated || 0,
    wisdomResourcesExplored: props.wisdomResourcesExplored || 0
  });
  
  useEffect(() => {
    // Only update if values have changed significantly
    const current = {
      currentStreak: props.currentStreak || 0,
      reflectionCount: props.reflectionCount || 0,
      meditationMinutes: props.meditationMinutes || 0,
      totalPoints: props.totalPoints || 0,
      uniqueChakrasActivated: props.uniqueChakrasActivated || 0,
      wisdomResourcesExplored: props.wisdomResourcesExplored || 0
    };
    
    const hasSignificantChange = 
      Math.abs(current.currentStreak - prevProps.current.currentStreak) >= 1 ||
      Math.abs(current.reflectionCount - prevProps.current.reflectionCount) >= 1 ||
      Math.abs(current.meditationMinutes - prevProps.current.meditationMinutes) >= 5 ||
      Math.abs(current.totalPoints - prevProps.current.totalPoints) >= 10 ||
      Math.abs(current.uniqueChakrasActivated - prevProps.current.uniqueChakrasActivated) >= 1 ||
      Math.abs(current.wisdomResourcesExplored - prevProps.current.wisdomResourcesExplored) >= 1;
      
    if (hasSignificantChange) {
      initializeProgressTracking(current);
      prevProps.current = current;
    }
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
