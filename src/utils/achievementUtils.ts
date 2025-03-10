
import { supabase } from '@/lib/supabaseClient';
import { ValidationError } from './validation/ValidationError';
import { handleError } from './errorHandling';

/**
 * Achievement categories
 */
export enum AchievementCategory {
  MEDITATION = 'meditation',
  PRACTICE = 'practice',
  REFLECTION = 'reflection',
  WISDOM = 'wisdom',
  SPECIAL = 'special'
}

/**
 * Achievement type
 */
export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  icon?: string;
  requirements?: Record<string, any>;
}

/**
 * User achievement type
 */
export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  progress: number;
  awarded: boolean;
  awarded_at?: string;
  created_at: string;
  updated_at: string;
  achievement_data?: Achievement;
}

/**
 * Get all available achievements
 */
export async function getAchievements(): Promise<Achievement[]> {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*');
      
    if (error) {
      throw new ValidationError(`Failed to fetch achievements: ${error.message}`, {
        code: 'fetch_achievements_error'
      });
    }
    
    return data as Achievement[];
  } catch (error) {
    handleError(error, {
      context: 'getAchievements',
      showToast: true,
      customMessage: 'Unable to load achievements'
    });
    return [];
  }
}

/**
 * Get user achievements
 */
export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  try {
    const { data, error } = await supabase
      .rpc('get_user_achievements', { user_id_param: userId });
      
    if (error) {
      throw new ValidationError(`Failed to fetch user achievements: ${error.message}`, {
        code: 'fetch_user_achievements_error'
      });
    }
    
    return data as UserAchievement[];
  } catch (error) {
    handleError(error, {
      context: 'getUserAchievements',
      showToast: true,
      customMessage: 'Unable to load your achievements'
    });
    return [];
  }
}

/**
 * Track achievement progress
 */
export async function trackAchievementProgress(
  userId: string,
  achievementId: string,
  progress: number,
  autoAward = true
): Promise<UserAchievement | null> {
  try {
    if (!userId) {
      throw new ValidationError('User ID is required', { code: 'missing_user_id' });
    }
    
    if (!achievementId) {
      throw new ValidationError('Achievement ID is required', { code: 'missing_achievement_id' });
    }
    
    const { data, error } = await supabase
      .rpc('update_achievement_progress', {
        user_id_param: userId,
        achievement_id_param: achievementId,
        progress_value: progress,
        auto_award: autoAward
      });
      
    if (error) {
      throw new ValidationError(`Failed to update achievement progress: ${error.message}`, {
        code: 'update_achievement_progress_error'
      });
    }
    
    return data as unknown as UserAchievement;
  } catch (error) {
    handleError(error, {
      context: 'trackAchievementProgress',
      showToast: true,
      customMessage: 'Unable to update achievement progress'
    });
    return null;
  }
}

/**
 * Check if user has unlocked a specific achievement
 */
export async function hasAchievement(userId: string, achievementId: string): Promise<boolean> {
  try {
    if (!userId || !achievementId) return false;
    
    const { data, error } = await supabase
      .rpc('has_achievement', {
        user_id_param: userId,
        achievement_id_param: achievementId
      });
      
    if (error) {
      throw new ValidationError(`Failed to check achievement: ${error.message}`, {
        code: 'check_achievement_error'
      });
    }
    
    return data as boolean;
  } catch (error) {
    handleError(error, {
      context: 'hasAchievement',
      showToast: false
    });
    return false;
  }
}

/**
 * Award an achievement directly
 */
export async function awardAchievement(
  userId: string,
  achievementId: string
): Promise<boolean> {
  try {
    if (!userId) {
      throw new ValidationError('User ID is required', { code: 'missing_user_id' });
    }
    
    if (!achievementId) {
      throw new ValidationError('Achievement ID is required', { code: 'missing_achievement_id' });
    }
    
    const { data, error } = await supabase
      .rpc('award_achievement', {
        user_id_param: userId,
        achievement_id_param: achievementId
      });
      
    if (error) {
      throw new ValidationError(`Failed to award achievement: ${error.message}`, {
        code: 'award_achievement_error'
      });
    }
    
    return data as boolean;
  } catch (error) {
    handleError(error, {
      context: 'awardAchievement',
      showToast: true,
      customMessage: 'Unable to award achievement'
    });
    return false;
  }
}

/**
 * Get achievement progress
 */
export async function getAchievementProgress(
  userId: string,
  achievementId: string
): Promise<number> {
  try {
    if (!userId || !achievementId) return 0;
    
    const { data, error } = await supabase
      .from('user_achievements')
      .select('progress')
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // No data found
        return 0;
      }
      throw new ValidationError(`Failed to get achievement progress: ${error.message}`, {
        code: 'get_achievement_progress_error'
      });
    }
    
    return data?.progress || 0;
  } catch (error) {
    handleError(error, {
      context: 'getAchievementProgress',
      showToast: false
    });
    return 0;
  }
}
