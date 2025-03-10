
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';

// Achievement types
export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  icon?: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  progress: number;
  awarded: boolean;
  awarded_at: string | null;
  updated_at: string;
  created_at: string;
  achievement_data: Achievement;
  category: string;
}

// Get color for achievement category
export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    'meditation': 'bg-purple-600',
    'practice': 'bg-blue-600',
    'reflection': 'bg-teal-600',
    'wisdom': 'bg-amber-600',
    'portal': 'bg-fuchsia-600',
    'chakra': 'bg-green-600',
    'special': 'bg-rose-600'
  };
  
  return colors[category] || 'bg-slate-600';
};

// Format progress percentage
export const formatProgress = (progress: number): string => {
  return `${Math.min(Math.round(progress * 100), 100)}%`;
};

// Fetch user achievements
export const fetchUserAchievements = async (userId: string): Promise<UserAchievement[]> => {
  try {
    const { data, error } = await supabase
      .rpc('get_user_achievements', { user_id_param: userId });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return [];
  }
};

// Track achievement progress
export const trackAchievementProgress = async (
  userId: string, 
  achievementId: string, 
  progress: number,
  incrementOnly = true
): Promise<boolean> => {
  try {
    // Fetch current progress if incrementing
    if (incrementOnly) {
      const { data: existing } = await supabase
        .from('user_achievements')
        .select('progress')
        .eq('user_id', userId)
        .eq('achievement_id', achievementId)
        .single();
        
      if (existing) {
        // Calculate new progress - only increase, never decrease
        progress = Math.max(existing.progress, progress);
      }
    }
    
    // Ensure progress is between 0 and 1
    progress = Math.min(Math.max(progress, 0), 1);
    
    // Update achievement progress
    const { error } = await supabase.rpc('update_achievement_progress', {
      user_id_param: userId,
      achievement_id_param: achievementId,
      progress_param: progress
    });
    
    if (error) throw error;
    
    // If progress is 100%, show toast notification
    if (progress >= 1) {
      const { data: achievement } = await supabase
        .from('achievements')
        .select('title')
        .eq('id', achievementId)
        .single();
        
      if (achievement) {
        toast({
          title: '🏆 Achievement Unlocked!',
          description: achievement.title,
          variant: 'default'
        });
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error tracking achievement progress:', error);
    return false;
  }
};

// Update all achievements that match a certain category
export const updateCategoryAchievements = async (
  userId: string,
  category: string,
  progressIncrement: number = 0.1
): Promise<void> => {
  try {
    // Get all achievements for the category
    const { data: achievements } = await supabase
      .from('achievements')
      .select('id')
      .eq('category', category);
      
    if (!achievements || achievements.length === 0) return;
    
    // Get existing user achievements for these IDs
    const { data: userAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id, progress')
      .eq('user_id', userId)
      .in('achievement_id', achievements.map(a => a.id));
      
    // Create a map for faster lookups
    const progressMap = new Map();
    if (userAchievements) {
      userAchievements.forEach(ua => {
        progressMap.set(ua.achievement_id, ua.progress);
      });
    }
    
    // Update each achievement
    for (const achievement of achievements) {
      const currentProgress = progressMap.get(achievement.id) || 0;
      const newProgress = Math.min(currentProgress + progressIncrement, 1);
      
      // Only update if progress changed
      if (newProgress > currentProgress) {
        await trackAchievementProgress(userId, achievement.id, newProgress, false);
      }
    }
  } catch (error) {
    console.error(`Error updating ${category} achievements:`, error);
  }
};
