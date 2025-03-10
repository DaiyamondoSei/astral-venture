
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { AchievementCategory } from '@/types/achievement';

/**
 * Props for the AchievementFilter component
 */
interface AchievementFilterProps {
  selectedCategory: string | null;
  showAwarded: boolean;
  showUnawarded: boolean;
  onCategoryChange: (category: string | null) => void;
  onShowAwardedChange: (show: boolean) => void;
  onShowUnawardedChange: (show: boolean) => void;
}

/**
 * Filter component for achievements by category and status
 */
const AchievementFilter: React.FC<AchievementFilterProps> = ({
  selectedCategory,
  showAwarded,
  showUnawarded,
  onCategoryChange,
  onShowAwardedChange,
  onShowUnawardedChange
}) => {
  const handleTabChange = (value: string) => {
    if (value === 'all') {
      onCategoryChange(null);
    } else {
      onCategoryChange(value);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs 
        defaultValue={selectedCategory || 'all'} 
        value={selectedCategory || 'all'} 
        onValueChange={handleTabChange} 
        className="mb-4"
      >
        <TabsList className="grid grid-cols-4 md:grid-cols-8 bg-white/10 backdrop-blur border-white/10">
          <TabsTrigger value="all" className="text-white">All</TabsTrigger>
          <TabsTrigger value="meditation" className="text-white">Meditation</TabsTrigger>
          <TabsTrigger value="practice" className="text-white">Practice</TabsTrigger>
          <TabsTrigger value="reflection" className="text-white">Reflection</TabsTrigger>
          <TabsTrigger value="wisdom" className="text-white">Wisdom</TabsTrigger>
          <TabsTrigger value="portal" className="text-white">Portal</TabsTrigger>
          <TabsTrigger value="chakra" className="text-white">Chakra</TabsTrigger>
          <TabsTrigger value="special" className="text-white">Special</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="flex gap-4">
        <label className="flex items-center text-white">
          <input
            type="checkbox"
            checked={showAwarded}
            onChange={(e) => onShowAwardedChange(e.target.checked)}
            className="mr-2 h-4 w-4"
          />
          Show Awarded
        </label>
        
        <label className="flex items-center text-white">
          <input
            type="checkbox"
            checked={showUnawarded}
            onChange={(e) => onShowUnawardedChange(e.target.checked)}
            className="mr-2 h-4 w-4"
          />
          Show Unawarded
        </label>
      </div>
    </div>
  );
};

export default AchievementFilter;
