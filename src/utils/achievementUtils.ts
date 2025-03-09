
interface AchievementType {
  id: string;
  title: string;
  description: string;
  category: 'meditation' | 'practice' | 'reflection' | 'wisdom' | 'special';
  progress?: number;
  awarded?: boolean;
  icon?: 'star' | 'trophy' | 'award' | 'check';
}

/**
 * Generate placeholder achievement data for development and fallback scenarios
 */
export function getPlaceholderAchievements(): AchievementType[] {
  return [
    {
      id: 'first-meditation',
      title: 'First Meditation',
      description: 'Complete your first meditation session',
      category: 'meditation',
      progress: 0,
      awarded: false,
      icon: 'award'
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
      progress: 0.5,
      awarded: false,
      icon: 'trophy'
    },
    {
      id: 'wisdom-unlock',
      title: 'Ancient Knowledge',
      description: 'Unlock your first wisdom insight',
      category: 'wisdom',
      progress: 0.2,
      awarded: false,
      icon: 'star'
    }
  ];
}

/**
 * Calculate the progress percentage for a specific achievement
 */
export function calculateAchievementProgress(
  currentValue: number, 
  targetValue: number
): number {
  if (targetValue <= 0) return 0;
  const progress = currentValue / targetValue;
  return Math.min(1, Math.max(0, progress));
}

/**
 * Format achievements for display with correct progress values
 */
export function formatAchievementsForDisplay(
  achievements: any[]
): AchievementType[] {
  return achievements.map(achievement => ({
    id: achievement.id,
    title: achievement.title || 'Unknown Achievement',
    description: achievement.description || 'Description not available',
    category: achievement.category || 'special',
    progress: achievement.progress || 0,
    awarded: achievement.awarded || false,
    icon: achievement.icon || 'award'
  }));
}
