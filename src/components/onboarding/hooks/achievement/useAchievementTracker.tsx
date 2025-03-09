
import { useState, useEffect, useCallback } from 'react';
import { useAchievementState } from './useAchievementState';
import { useProgressTracking } from './useProgressTracking';
import { AchievementTrackerProps, AchievementTrackerResult } from './types';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { IAchievementData } from '../../data/types';
import { AchievementEventType } from '@/types/achievement';

/**
 * Hook for tracking and managing user achievements
 * 
 * @param props Configuration properties for the achievement tracker
 * @returns Object with methods for tracking and managing achievements
 */
export function useAchievementTracker(props: AchievementTrackerProps = {}): AchievementTrackerResult {
  const { state, earnAchievement, updateAchievementHistory, setCurrentAchievement, dismissCurrentAchievement, setProgressTracking } = useAchievementState();
  const [achievementList, setAchievementList] = useState<IAchievementData[]>(props.achievementList || []);
  const [isLoading, setIsLoading] = useState(false);
  const { trackProgress, resetProgress, logActivity, getProgressValue } = useProgressTracking(state, setProgressTracking);
  const { user } = useAuth();
  
  // Load achievements from backend if not provided
  useEffect(() => {
    if (!props.achievementList && user) {
      const fetchAchievements = async () => {
        try {
          setIsLoading(true);
          // Use RPC function instead of direct query to avoid table schema issues
          const { data, error } = await supabase.rpc('get_user_achievements', { 
            user_id_param: user.id 
          });
          
          if (error) {
            console.error('Error fetching achievements:', error);
            return;
          }
          
          if (data) {
            // Transform the achievement data
            const processedAchievements = data.map((achievement: any) => {
              // Check if achievement_data exists and is not null
              if (achievement.achievement_data) {
                return {
                  ...achievement.achievement_data,
                  id: achievement.achievement_id,
                  progress: achievement.progress,
                };
              }
              
              // Default fallback if data is missing
              return {
                id: achievement.achievement_id,
                title: 'Unknown Achievement',
                description: 'Achievement details not available',
                icon: 'trophy',
                category: 'general',
                points: 10,
                tier: 1,
                requiredAmount: 1,
                progress: achievement.progress,
              };
            });
            
            setAchievementList(processedAchievements);
          }
        } catch (err) {
          console.error('Failed to fetch achievements:', err);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchAchievements();
    }
  }, [user, props.achievementList]);

  // Track achievement progress
  const trackAchievementProgress = useCallback(
    async (achievementId: string, progress: number): Promise<void> => {
      if (!user) return;
      
      try {
        // Find the achievement
        const achievement = achievementList.find(a => a.id === achievementId);
        if (!achievement) {
          console.warn(`Achievement ${achievementId} not found`);
          return;
        }
        
        // Update achievement history
        updateAchievementHistory(achievementId, {
          progress,
          awarded: state.earnedAchievements.includes(achievementId),
          timestamp: new Date().toISOString()
        });
        
        // Call progress callback if provided
        props.onProgress?.(achievement, progress);
        
        // Check if achievement should be unlocked
        if (
          progress >= (achievement.requiredAmount || 1) && 
          !state.earnedAchievements.includes(achievementId)
        ) {
          unlockAchievement(achievementId);
        }
        
        // Update backend
        const { error } = await supabase.functions.invoke('track-achievement', {
          body: {
            achievementId,
            progress,
            action: 'progress'
          }
        });
        
        if (error) {
          console.error('Error tracking achievement progress:', error);
        }
      } catch (err) {
        console.error('Error in trackAchievementProgress:', err);
      }
    },
    [user, achievementList, state.earnedAchievements, updateAchievementHistory, props]
  );

  // Unlock an achievement
  const unlockAchievement = useCallback(
    async (achievementId: string): Promise<void> => {
      if (!user) return;
      
      try {
        // Find the achievement
        const achievement = achievementList.find(a => a.id === achievementId);
        if (!achievement) {
          console.warn(`Achievement ${achievementId} not found for unlocking`);
          return;
        }

        // Add to earned achievements
        earnAchievement(achievementId);
        
        // Set as current achievement to display notification
        setCurrentAchievement(achievementId);
        
        // Update achievement history
        updateAchievementHistory(achievementId, {
          awarded: true,
          timestamp: new Date().toISOString(),
          progress: achievement.requiredAmount || 1
        });
        
        // Call unlock callback if provided
        props.onUnlock?.(achievement);
        
        // Add achievement points to total
        if (achievement.points) {
          trackProgress('total_energy_points', achievement.points);
        }
        
        // Update backend
        const { error } = await supabase.functions.invoke('track-achievement', {
          body: {
            achievementId,
            unlocked: true,
            action: 'unlock'
          }
        });
        
        if (error) {
          console.error('Error unlocking achievement:', error);
        }
      } catch (err) {
        console.error('Error in unlockAchievement:', err);
      }
    },
    [user, achievementList, earnAchievement, setCurrentAchievement, updateAchievementHistory, props, trackProgress]
  );

  // Log activity and check for achievement unlocks
  const logActivityWithAchievementCheck = useCallback(
    (activityType: string, details?: Record<string, any>): void => {
      // Log the activity first
      logActivity(activityType, details);
      
      // Get the updated progress for relevant metrics
      let progressType = '';
      let progressValue = 0;
      
      switch (activityType) {
        case AchievementEventType.REFLECTION_COMPLETED:
          progressType = 'reflections';
          progressValue = getProgressValue(progressType);
          break;
        case AchievementEventType.MEDITATION_COMPLETED:
          progressType = 'meditation_minutes';
          progressValue = getProgressValue(progressType);
          break;
        case AchievementEventType.CHAKRA_ACTIVATED:
          progressType = 'chakras_activated';
          progressValue = getProgressValue(progressType);
          break;
        case AchievementEventType.WISDOM_EXPLORED:
          progressType = 'wisdom_resources_explored';
          progressValue = getProgressValue(progressType);
          break;
        case AchievementEventType.STREAK_MILESTONE:
          progressType = 'streakDays';
          progressValue = getProgressValue(progressType);
          break;
        default:
          break;
      }
      
      // Check all achievements related to this activity type
      if (progressType) {
        achievementList.forEach(achievement => {
          if (
            achievement.trackingType === progressType &&
            !state.earnedAchievements.includes(achievement.id)
          ) {
            trackAchievementProgress(achievement.id, progressValue);
          }
        });
      }
      
      // Send activity to backend
      if (user) {
        supabase.functions.invoke('track-achievement', {
          body: {
            activityType,
            details,
            action: 'activity'
          }
        }).catch(err => {
          console.error('Error logging activity to backend:', err);
        });
      }
    },
    [logActivity, getProgressValue, achievementList, state.earnedAchievements, trackAchievementProgress, user]
  );

  // Get achievement progress
  const getAchievementProgress = useCallback(
    (id: string): number => {
      const achievement = achievementList.find(a => a.id === id);
      if (!achievement) return 0;
      
      const history = state.achievementHistory[id];
      if (history && typeof history.progress === 'number') {
        return history.progress;
      }
      
      // If no specific progress is tracked, calculate based on tracking type
      if (achievement.trackingType) {
        return getProgressValue(achievement.trackingType);
      }
      
      return 0;
    },
    [state.achievementHistory, achievementList, getProgressValue]
  );

  // Get total points earned
  const getTotalPoints = useCallback((): number => {
    return getProgressValue('total_energy_points');
  }, [getProgressValue]);

  // Get overall progress percentage across all achievements
  const getProgressPercentage = useCallback((): number => {
    if (achievementList.length === 0) return 0;
    
    const totalAchievements = achievementList.length;
    const earnedCount = state.earnedAchievements.length;
    
    return Math.round((earnedCount / totalAchievements) * 100);
  }, [achievementList, state.earnedAchievements]);

  return {
    earnedAchievements: state.earnedAchievements.map(id => 
      achievementList.find(a => a.id === id)
    ).filter(Boolean) as IAchievementData[],
    currentAchievement: state.currentAchievement 
      ? achievementList.find(a => a.id === state.currentAchievement) 
      : null,
    dismissAchievement: dismissCurrentAchievement,
    trackProgress,
    logActivity: logActivityWithAchievementCheck,
    getAchievementProgress,
    getTotalPoints,
    getProgressPercentage,
    achievementHistory: state.achievementHistory,
    progressTracking: state.progressTracking
  };
}
