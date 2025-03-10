
import { supabaseClient } from '@/lib/supabaseClient';
import { toast } from 'sonner';

// Define achievement types
export interface Achievement {
  id: string;
  user_id: string;
  achievement_id: string;
  progress: number;
  awarded: boolean;
  awarded_at: string | null;
  updated_at: string;
  created_at: string;
  achievement_data: {
    id: string;
    title: string;
    description: string;
    category: string;
    icon: string;
  };
  category: string;
}

// Fetch user achievements from Supabase
export const getUserAchievements = async (): Promise<Achievement[]> => {
  const { data, error } = await supabaseClient.rpc('get_user_achievements');
  
  if (error) {
    console.error('Error fetching achievements:', error);
    return [];
  }
  
  return data || [];
};

// Track achievement progress
export const trackAchievementProgress = async (
  achievementId: string, 
  progress: number,
  autoAward = true
): Promise<{ success: boolean; awarded: boolean; data?: any }> => {
  try {
    const { data, error } = await supabaseClient.rpc(
      'update_achievement_progress',
      {
        user_id_param: (await supabaseClient.auth.getUser()).data.user?.id,
        achievement_id_param: achievementId,
        progress_value: progress,
        auto_award: autoAward
      }
    );
    
    if (error) throw error;
    
    const awarded = data?.awarded || false;
    
    // Show toast notification if achievement was awarded
    if (awarded) {
      toast.success(`Achievement Unlocked: ${data?.achievement_data?.title || achievementId}`, {
        description: data?.achievement_data?.description || 'You\'ve earned a new achievement!',
        duration: 5000,
      });
    }
    
    return { success: true, awarded, data };
  } catch (error) {
    console.error('Error tracking achievement progress:', error);
    return { success: false, awarded: false };
  }
};

// Award achievement directly
export const awardAchievement = async (achievementId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabaseClient.rpc(
      'award_achievement',
      {
        user_id_param: (await supabaseClient.auth.getUser()).data.user?.id,
        achievement_id_param: achievementId
      }
    );
    
    if (error) throw error;
    
    // Show toast notification
    toast.success(`Achievement Unlocked!`, {
      description: 'You\'ve earned a new achievement!',
      duration: 5000,
    });
    
    return true;
  } catch (error) {
    console.error('Error awarding achievement:', error);
    return false;
  }
};

// Check achievement thresholds
export const checkAchievementThresholds = async (): Promise<boolean> => {
  try {
    const userId = (await supabaseClient.auth.getUser()).data.user?.id;
    
    const response = await fetch(`${supabaseClient.supabaseUrl}/functions/v1/check-achievement-thresholds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabaseClient.auth.getSession()).data.session?.access_token}`
      },
      body: JSON.stringify({ userId })
    });
    
    if (!response.ok) throw new Error('Failed to check achievement thresholds');
    
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error checking achievement thresholds:', error);
    return false;
  }
};

// Get category color for achievement
export const getAchievementCategoryColor = (category: string): string => {
  switch (category) {
    case 'meditation':
      return 'bg-blue-500';
    case 'practice':
      return 'bg-green-500';
    case 'reflection':
      return 'bg-purple-500';
    case 'wisdom':
      return 'bg-yellow-500';
    case 'chakra':
      return 'bg-pink-500';
    case 'portal':
      return 'bg-cyan-500';
    case 'special':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

// Calculate percentage for progress bar
export const calculateProgressPercentage = (progress: number): number => {
  return Math.min(Math.max(progress, 0), 100);
};
