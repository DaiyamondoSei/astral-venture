
import { AchievementData } from '@/components/onboarding/data/types';
import { 
  onboardingAchievements,
  progressiveAchievements,
  milestoneAchievements
} from '@/components/onboarding/data';

export interface AchievementHistory {
  awarded: boolean;
  timestamp: string;
  tier?: number;
}

export interface UserAchievements {
  userId: string;
  history: Record<string, AchievementHistory>;
  progressTracking: Record<string, number>;
}

/**
 * Gets all available achievements
 */
export function getAllAchievements(): AchievementData[] {
  return [...onboardingAchievements, ...progressiveAchievements, ...milestoneAchievements];
}

/**
 * Gets achievements by their type
 */
export function getAchievementsByType(type: string): AchievementData[] {
  return getAllAchievements().filter(achievement => achievement.type === type);
}

/**
 * Gets a specific achievement by ID
 */
export function getAchievementById(id: string): AchievementData | undefined {
  return getAllAchievements().find(achievement => achievement.id === id);
}

/**
 * Loads user achievement data from local storage
 */
export function loadUserAchievements(userId: string): UserAchievements {
  const achievementHistory = JSON.parse(
    localStorage.getItem(`achievements-${userId}`) || '{}'
  );
  
  const progressTracking = JSON.parse(
    localStorage.getItem(`achievement-progress-${userId}`) || '{}'
  );
  
  return {
    userId,
    history: achievementHistory,
    progressTracking
  };
}

/**
 * Saves user achievement data to local storage
 */
export function saveUserAchievements(data: UserAchievements): void {
  localStorage.setItem(
    `achievements-${data.userId}`, 
    JSON.stringify(data.history)
  );
  
  localStorage.setItem(
    `achievement-progress-${data.userId}`, 
    JSON.stringify(data.progressTracking)
  );
}

/**
 * Awards an achievement to a user
 */
export function awardAchievement(
  userId: string, 
  achievementId: string,
  tier?: number
): void {
  const userData = loadUserAchievements(userId);
  
  userData.history[achievementId] = {
    awarded: true,
    timestamp: new Date().toISOString(),
    ...(tier !== undefined && { tier })
  };
  
  saveUserAchievements(userData);
}

/**
 * Updates achievement progress for a user
 */
export function updateAchievementProgress(
  userId: string,
  key: string,
  value: number
): void {
  const userData = loadUserAchievements(userId);
  
  userData.progressTracking[key] = value;
  
  saveUserAchievements(userData);
}

/**
 * Gets earned achievements for a user
 */
export function getEarnedAchievements(userId: string): AchievementData[] {
  const userData = loadUserAchievements(userId);
  const earnedIds = Object.entries(userData.history)
    .filter(([_, data]) => data.awarded)
    .map(([id]) => id);
  
  return getAllAchievements()
    .filter(achievement => earnedIds.includes(achievement.id))
    .map(achievement => {
      const historyEntry = userData.history[achievement.id];
      
      // For progressive achievements, update the title and points based on tier
      if (achievement.type === 'progressive' && historyEntry.tier !== undefined) {
        return {
          ...achievement,
          title: `${achievement.title} (Tier ${historyEntry.tier})`,
          points: (achievement.pointsPerTier && historyEntry.tier > 0) 
            ? achievement.pointsPerTier[historyEntry.tier - 1] 
            : achievement.points
        };
      }
      
      return achievement;
    });
}
