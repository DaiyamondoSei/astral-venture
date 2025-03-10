
import React from 'react';
import { Search } from 'lucide-react';
import type { AchievementCategory } from '@/types/achievement';

interface EmptyAchievementListProps {
  selectedCategory: AchievementCategory | null;
}

/**
 * Component displayed when no achievements match the current filters
 */
const EmptyAchievementList: React.FC<EmptyAchievementListProps> = ({ selectedCategory }) => {
  let message = "No achievements found";
  
  if (selectedCategory) {
    message = `No ${selectedCategory} achievements found`;
  }
  
  return (
    <div className="flex flex-col items-center justify-center h-40 text-center p-4">
      <div className="bg-gray-800/50 rounded-full p-3 mb-3">
        <Search className="h-6 w-6 text-gray-400" />
      </div>
      <p className="text-gray-400 mb-1">{message}</p>
      <p className="text-gray-500 text-sm">
        Try changing your filters or complete more activities to unlock achievements
      </p>
    </div>
  );
};

export default EmptyAchievementList;
