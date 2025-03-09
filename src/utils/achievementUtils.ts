
export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'meditation' | 'practice' | 'reflection' | 'wisdom' | 'special';
  progress?: number;
  awarded?: boolean;
  icon?: 'star' | 'trophy' | 'award' | 'check';
}

/**
 * Get placeholder achievements for when the database doesn't have any yet
 */
export function getPlaceholderAchievements(): Achievement[] {
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
      progress: 0,
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
    }
  ];
}

/**
 * Calculate progress percentage from achievement progress
 */
export function calculateProgressPercentage(progress: number): number {
  return Math.min(100, Math.max(0, progress * 100));
}

/**
 * Get a suitable color for an achievement category
 */
export function getCategoryColor(category: string): string {
  switch (category) {
    case 'meditation':
      return 'from-blue-400 to-blue-600';
    case 'practice':
      return 'from-green-400 to-green-600';
    case 'reflection':
      return 'from-purple-400 to-purple-600';
    case 'wisdom':
      return 'from-amber-400 to-amber-600';
    case 'special':
      return 'from-pink-400 to-pink-600';
    default:
      return 'from-gray-400 to-gray-600';
  }
}
