
import { useState, useCallback } from 'react';
import { AchievementData } from '../../data/types';
import { formatDistanceToNow } from 'date-fns';

export interface AchievementDisplayState {
  visibleAchievements: AchievementData[];
  selectedAchievement: AchievementData | null;
  showDetails: boolean;
}

export function useAchievementDisplay(
  earnedAchievements: AchievementData[],
  achievementHistory: Record<string, {awarded: boolean, timestamp: string, tier?: number}>
) {
  const [visibleAchievements, setVisibleAchievements] = useState<AchievementData[]>([]);
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementData | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const selectAchievement = useCallback((achievement: AchievementData) => {
    setSelectedAchievement(achievement);
    setShowDetails(true);
  }, []);
  
  const closeDetails = useCallback(() => {
    setShowDetails(false);
    setTimeout(() => setSelectedAchievement(null), 300); // Delay to allow animation
  }, []);
  
  const hideAchievement = useCallback((achievementId: string) => {
    setVisibleAchievements(prev => prev.filter(a => a.id !== achievementId));
  }, []);
  
  const getAchievementTime = useCallback((achievementId: string): string => {
    const timestamp = achievementHistory[achievementId]?.timestamp;
    if (!timestamp) return 'Recently';
    
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
      return 'Recently';
    }
  }, [achievementHistory]);
  
  const getLatestAchievements = useCallback((count: number = 5): AchievementData[] => {
    // Sort by timestamp (newest first)
    return [...earnedAchievements].sort((a, b) => {
      const timeA = achievementHistory[a.id]?.timestamp || '';
      const timeB = achievementHistory[b.id]?.timestamp || '';
      return timeB.localeCompare(timeA);
    }).slice(0, count);
  }, [earnedAchievements, achievementHistory]);
  
  return {
    visibleAchievements,
    selectedAchievement,
    showDetails,
    selectAchievement,
    closeDetails,
    hideAchievement,
    getAchievementTime,
    getLatestAchievements
  };
}
