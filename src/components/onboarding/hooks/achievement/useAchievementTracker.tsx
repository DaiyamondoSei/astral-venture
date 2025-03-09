
import { useEffect, useState, useCallback } from 'react';
import { IAchievementData } from '../../data/types';
import { useAchievementState } from './useAchievementState';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';

interface AchievementTrackerProps {
  userId: string;
  onUnlock?: (achievement: IAchievementData) => void;
  onProgress?: (achievement: IAchievementData, progress: number) => void;
  achievementList?: IAchievementData[];
  currentStreak?: number;
  reflectionCount?: number;
  meditationMinutes?: number;
  uniqueChakrasActivated?: number;
  totalPoints?: number;
  wisdomResourcesExplored?: number;
}

export function useAchievementTracker({
  userId,
  onUnlock,
  onProgress,
  achievementList = [],
  currentStreak = 0,
  reflectionCount = 0,
  meditationMinutes = 0,
  uniqueChakrasActivated = 0,
  totalPoints = 0,
  wisdomResourcesExplored = 0
}: AchievementTrackerProps) {
  const [unlockedAchievements, setUnlockedAchievements] = useState<IAchievementData[]>([]);
  const [inProgressAchievements, setInProgressAchievements] = useState<IAchievementData[]>([]);
  const [earnedAchievements, setEarnedAchievements] = useState<IAchievementData[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [totalEarnedPoints, setTotalEarnedPoints] = useState(0);
  
  // Get achievement state from context
  const { 
    state: { achievements = [] },
    updateAchievement,
    unlockAchievement,
    getAchievementProgress,
  } = useAchievementState();

  // Initialize by fetching user achievements from backend
  useEffect(() => {
    if (!userId || isInitialized) return;

    const fetchUserAchievements = async () => {
      try {
        const { data, error } = await supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', userId);

        if (error) {
          console.error('Error fetching user achievements:', error);
          return;
        }

        if (data?.length) {
          // Process unlocked achievements
          const unlocked = data
            .filter(a => a.progress >= 1)
            .map(a => {
              const achievementData = a.achievement_data || {};
              return {
                id: a.achievement_id,
                title: achievementData.title || 'Achievement',
                description: achievementData.description || '',
                type: achievementData.type || 'general',
                points: achievementData.points || 0,
                unlocked: true,
                icon: achievementData.icon || 'trophy'
              };
            });

          // Process in-progress achievements
          const inProgress = data
            .filter(a => a.progress > 0 && a.progress < 1)
            .map(a => {
              const achievementData = a.achievement_data || {};
              return {
                id: a.achievement_id,
                title: achievementData.title || 'Achievement',
                description: achievementData.description || '',
                type: achievementData.type || 'general',
                points: achievementData.points || 0,
                unlocked: false,
                progress: a.progress,
                icon: achievementData.icon || 'star'
              };
            });

          // Calculate total earned points
          const points = unlocked.reduce((sum, a) => sum + (a.points || 0), 0);

          // Update state
          setUnlockedAchievements(unlocked);
          setInProgressAchievements(inProgress);
          setTotalEarnedPoints(points);

          // Calculate overall progress
          const totalAchievements = achievementList.length || 20; // Default to 20 if no list provided
          const progress = (unlocked.length / totalAchievements) * 100;
          setProgressPercentage(Math.min(100, progress));
        }
      } catch (error) {
        console.error('Error in achievement initialization:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    fetchUserAchievements();
  }, [userId, isInitialized, achievementList]);

  // Track activity via backend
  const trackActivity = useCallback(async (
    eventType: string, 
    eventData?: Record<string, any>
  ) => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('track-achievement', {
        body: { eventType, eventData }
      });
      
      if (error) {
        console.error('Error tracking achievement activity:', error);
        return;
      }
      
      // Process newly unlocked achievements
      if (data?.unlockedAchievements?.length > 0) {
        const newAchievements = data.unlockedAchievements.map(a => ({
          id: a.id,
          title: a.title,
          description: a.description || '',
          points: a.points,
          unlocked: true,
          icon: a.icon || 'trophy',
          isNew: true
        }));
        
        // Update state with new achievements
        setEarnedAchievements(prev => [...prev, ...newAchievements]);
        
        // Update unlocked achievements
        setUnlockedAchievements(prev => [...prev, ...newAchievements]);
        
        // Remove from in-progress if needed
        setInProgressAchievements(prev => 
          prev.filter(a => !newAchievements.some(na => na.id === a.id))
        );
        
        // Call onUnlock callback for each new achievement
        if (onUnlock) {
          newAchievements.forEach(achievement => onUnlock(achievement));
        }
        
        // Show toast notification
        if (newAchievements.length > 0) {
          toast({
            title: '🏆 Achievement Unlocked!',
            description: `You've earned: ${newAchievements[0].title}`,
            duration: 4000
          });
        }
      }
    } catch (error) {
      console.error('Error in tracking achievement activity:', error);
    }
  }, [userId, onUnlock]);
  
  // Use effect to track streak changes
  useEffect(() => {
    if (!userId || !isInitialized || currentStreak <= 0) return;
    
    trackActivity('streak_updated', { currentStreak });
  }, [userId, isInitialized, currentStreak, trackActivity]);
  
  // Use effect to track reflection count
  useEffect(() => {
    if (!userId || !isInitialized || reflectionCount <= 0) return;
    
    // Only track when reflection count changes to significant values (5, 10, 20, etc.)
    if (reflectionCount === 5 || reflectionCount === 10 || 
        reflectionCount === 20 || reflectionCount === 50 || 
        reflectionCount === 100 || reflectionCount % 25 === 0) {
      trackActivity('reflection_milestone', { count: reflectionCount });
    }
  }, [userId, isInitialized, reflectionCount, trackActivity]);
  
  // Handle achievement unlocking (frontend)
  const handleUnlockAchievement = useCallback((achievement: IAchievementData) => {
    if (!achievement || !userId) return;
    
    // Call the backend to track the unlock
    trackActivity('achievement_unlocked', { 
      achievementId: achievement.id,
      title: achievement.title
    });
    
    // Update local state
    unlockAchievement(achievement.id);
    
    if (onUnlock) {
      onUnlock(achievement);
    }
    
    // Update local state
    setUnlockedAchievements(prev => [...prev, achievement]);
    setInProgressAchievements(prev => 
      prev.filter(a => a.id !== achievement.id)
    );
  }, [userId, trackActivity, unlockAchievement, onUnlock]);
  
  // Track progress for progressive achievements (frontend side)
  const trackProgress = useCallback((achievement: IAchievementData, progress: number) => {
    if (!achievement || !userId) return;
    
    // Call the backend to track progress
    trackActivity('achievement_progress', { 
      achievementId: achievement.id,
      progress
    });
    
    // Update local state
    updateAchievement(achievement.id, { progress });
    
    if (onProgress) {
      onProgress(achievement, progress);
    }
    
    // If achievement is complete, unlock it
    if (progress >= 1) {
      handleUnlockAchievement(achievement);
    } else if (!inProgressAchievements.some(a => a.id === achievement.id)) {
      // Add to in-progress if not already there
      setInProgressAchievements(prev => [...prev, achievement]);
    }
  }, [userId, trackActivity, updateAchievement, onProgress, handleUnlockAchievement, inProgressAchievements]);
  
  // Log simple activity without tracking progress
  const logActivity = useCallback((activityType: string, details?: Record<string, any>) => {
    if (!userId) return;
    
    trackActivity(activityType, details);
  }, [userId, trackActivity]);
  
  return {
    unlockedAchievements,
    inProgressAchievements,
    earnedAchievements,
    trackProgress,
    unlockAchievement: handleUnlockAchievement,
    getProgress: getAchievementProgress,
    logActivity,
    trackActivity,
    getProgressPercentage: () => progressPercentage,
    getTotalPoints: () => totalEarnedPoints,
    progressTracking: {
      streakDays: currentStreak,
      reflections: reflectionCount,
      meditation_minutes: meditationMinutes,
      chakras_activated: uniqueChakrasActivated,
      wisdom_resources_explored: wisdomResourcesExplored,
      total_energy_points: totalPoints
    }
  };
}
