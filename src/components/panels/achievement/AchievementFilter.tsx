
import React from 'react';
import { motion } from 'framer-motion';
import type { AchievementCategory } from '@/types/achievement';

/**
 * Props for the AchievementFilter component
 */
interface IAchievementFilterProps {
  selectedCategory: AchievementCategory | null;
  onCategoryChange: (category: AchievementCategory | null) => void;
}

/**
 * Component for filtering achievements by category
 */
const AchievementFilter: React.FC<IAchievementFilterProps> = ({ 
  selectedCategory, 
  onCategoryChange 
}) => {
  const categories: (AchievementCategory | null)[] = [
    null, // "All" option
    'meditation',
    'reflection',
    'practice',
    'chakra',
    'learning',
    'exploration',
    'social'
  ];
  
  // Map category names to display names
  const getCategoryName = (category: AchievementCategory | null): string => {
    if (category === null) return 'All';
    
    const displayNames: Record<AchievementCategory, string> = {
      meditation: 'Meditation',
      reflection: 'Reflection',
      practice: 'Practice',
      chakra: 'Chakra',
      learning: 'Learning',
      exploration: 'Exploration',
      social: 'Social'
    };
    
    return displayNames[category] || category;
  };
  
  return (
    <div className="pb-2 overflow-x-auto">
      <div className="flex space-x-2 pb-1">
        {categories.map(category => (
          <button
            key={category || 'all'}
            onClick={() => onCategoryChange(category)}
            className={`relative px-4 py-1.5 rounded-full min-w-max 
              ${selectedCategory === category 
                ? 'text-white font-medium' 
                : 'text-gray-400 hover:text-gray-300'
              }`}
          >
            {selectedCategory === category && (
              <motion.div
                layoutId="active-category"
                className="absolute inset-0 bg-gray-700/50 rounded-full"
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10">{getCategoryName(category)}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AchievementFilter;
