
import { v4 as uuidv4 } from 'uuid';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'meditation' | 'practice' | 'reflection' | 'wisdom' | 'special' | 'portal' | 'chakra';
  progress?: number;
  awarded?: boolean;
  icon?: 'star' | 'trophy' | 'award' | 'check' | 'zap' | 'sparkles';
}

export const calculateProgressPercentage = (progress: number): number => {
  return Math.min(Math.round(progress * 100), 100);
};

export const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'meditation':
      return 'from-blue-400 to-blue-600';
    case 'practice':
      return 'from-purple-400 to-purple-600';
    case 'reflection':
      return 'from-teal-400 to-teal-600';
    case 'wisdom':
      return 'from-amber-400 to-amber-600';
    case 'portal':
      return 'from-indigo-400 to-indigo-600';
    case 'chakra':
      return 'from-pink-400 to-pink-600';
    case 'special':
    default:
      return 'from-green-400 to-green-600';
  }
};

export const getPlaceholderAchievements = (): Achievement[] => {
  return [
    {
      id: 'first-meditation',
      title: 'First Meditation',
      description: 'Complete your first meditation session',
      category: 'meditation',
      progress: 0,
      awarded: false,
      icon: 'star'
    },
    {
      id: 'meditation-streak',
      title: 'Consistent Mind',
      description: 'Complete meditations for 3 days in a row',
      category: 'meditation',
      progress: 0.33,
      awarded: false,
      icon: 'star'
    },
    {
      id: 'first-reflection',
      title: 'Soul Searcher',
      description: 'Write your first reflection',
      category: 'reflection',
      progress: 0,
      awarded: false,
      icon: 'check'
    },
    {
      id: 'chakra-activation',
      title: 'Energy Awakening',
      description: 'Activate your first chakra',
      category: 'practice',
      progress: 0,
      awarded: false,
      icon: 'trophy'
    },
    {
      id: 'wisdom-unlock',
      title: 'Ancient Knowledge',
      description: 'Unlock your first wisdom insight',
      category: 'wisdom',
      progress: 0,
      awarded: false,
      icon: 'star'
    },
    {
      id: 'portal_resonance_3',
      title: 'Energy Resonator',
      description: 'Reach resonance level 3 in the Seed of Life portal',
      category: 'portal',
      progress: 0,
      awarded: false,
      icon: 'zap'
    },
    {
      id: 'portal_resonance_5',
      title: 'Quantum Resonator',
      description: 'Master the Seed of Life portal by reaching resonance level 5',
      category: 'portal',
      progress: 0,
      awarded: false,
      icon: 'sparkles'
    }
  ];
};

export const trackAchievementProgress = async (
  achievementId: string, 
  progress: number, 
  autoAward = true
): Promise<boolean> => {
  try {
    // First, check if we're in a browser environment
    if (typeof window === 'undefined') return false;
    
    // Call the edge function to update achievement progress
    const response = await fetch('/api/track-achievement', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        achievementId,
        progress,
        autoAward
      })
    });
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error tracking achievement progress:', error);
    return false;
  }
};

export const awardAchievement = async (achievementId: string): Promise<boolean> => {
  try {
    // First, check if we're in a browser environment
    if (typeof window === 'undefined') return false;
    
    // Call the edge function to award an achievement
    const response = await fetch('/api/award-achievement', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        achievementId
      })
    });
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error awarding achievement:', error);
    return false;
  }
};
