
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'meditation' | 'practice' | 'reflection' | 'wisdom' | 'special' | 'portal' | 'chakra';
  progress?: number;
  awarded?: boolean;
  icon?: 'star' | 'trophy' | 'award' | 'check' | 'zap' | 'sparkles';
}

/**
 * Calculate percentage of progress for an achievement
 */
export const calculateProgressPercentage = (progress: number): number => {
  // For achievements that don't track progress, show 100% if progress > 0
  if (progress >= 1 && progress < 10) return 100;
  // Cap progress at 100%
  if (progress >= 100) return 100;
  // Round to the nearest integer
  return Math.round(progress);
};

/**
 * Get category color gradient for achievements
 */
export const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'meditation':
      return 'from-blue-400 to-blue-600';
    case 'practice':
      return 'from-green-400 to-green-600';
    case 'reflection':
      return 'from-purple-400 to-purple-600';
    case 'wisdom':
      return 'from-amber-400 to-amber-600';
    case 'portal':
      return 'from-cyan-400 to-cyan-600';
    case 'chakra':
      return 'from-rose-400 to-rose-600';
    case 'special':
    default:
      return 'from-indigo-400 to-indigo-600';
  }
};

/**
 * Get placeholder achievements for loading/empty states
 */
export const getPlaceholderAchievements = (): Achievement[] => [
  {
    id: 'first_meditation',
    title: 'Meditation Beginner',
    description: 'Complete your first meditation session',
    category: 'meditation',
    progress: 0,
    awarded: false,
    icon: 'star'
  },
  {
    id: 'first_reflection',
    title: 'Self-Reflection',
    description: 'Complete your first reflection entry',
    category: 'reflection',
    progress: 0,
    awarded: false,
    icon: 'check'
  },
  {
    id: 'energy_milestone_100',
    title: 'Energy Novice',
    description: 'Reach 100 energy points',
    category: 'special',
    progress: 0,
    awarded: false,
    icon: 'trophy'
  }
];

/**
 * Track achievement progress in Supabase
 */
export const trackAchievementProgress = async (
  achievementId: string,
  progress: number = 1,
  autoAward: boolean = true
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('track-achievement', {
      body: {
        achievementId,
        progress,
        autoAward
      }
    });

    if (error) {
      console.error('Error tracking achievement:', error);
      return { success: false, error: error.message };
    }

    // If the achievement was awarded, show a toast notification
    if (data?.awarded) {
      toast.success(`Achievement unlocked: ${data.title || achievementId}`, {
        description: data.description || 'You\'ve unlocked a new achievement!',
        duration: 5000
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error in trackAchievementProgress:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get user achievements from Supabase
 */
export const getUserAchievements = async (): Promise<Achievement[]> => {
  try {
    const { data: userAchievements, error } = await supabase
      .rpc('get_user_achievements', { 
        user_id_param: (await supabase.auth.getUser()).data.user?.id 
      });
    
    if (error) throw error;
    
    // If we don't have actual achievements yet, return placeholder data
    if (!userAchievements || userAchievements.length === 0) {
      return getPlaceholderAchievements();
    }
    
    // Transform data to match our Achievement interface
    return userAchievements.map((a: any) => ({
      id: a.achievement_id,
      title: a.achievement_data?.title || 'Unknown Achievement',
      description: a.achievement_data?.description || 'Description not available',
      category: a.achievement_data?.category || 'special',
      progress: a.progress,
      awarded: a.awarded,
      icon: a.achievement_data?.icon || 'award'
    })) as Achievement[];
  } catch (error) {
    console.error('Error fetching achievements:', error);
    // Return placeholder data if there's an error
    return getPlaceholderAchievements();
  }
};
