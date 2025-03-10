
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import AchievementHeader from './achievement/AchievementHeader';
import AchievementItem from './achievement/AchievementItem';
import EmptyAchievementList from './achievement/EmptyAchievementList';
import AchievementFilter from './achievement/AchievementFilter';
import SwipeablePanelController from './SwipeablePanelController';
import { handleError, ErrorCategory } from '@/utils/errorHandling';
import { invokeEdgeFunction } from '@/utils/edgeFunctionHelper';
import type { Achievement, AchievementCategory } from '@/types/achievement';

/**
 * Panel that displays user achievements
 */
const AchievementsPanel: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filteredAchievements, setFilteredAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch achievements on mount
  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setIsLoading(true);
        
        const data = await invokeEdgeFunction<{
          achievements: Achievement[];
          unlocked: string[];
        }>('get_user_achievements');
        
        // Mark achievements as unlocked
        const achievementsWithStatus = data.achievements.map(achievement => ({
          ...achievement,
          unlocked: data.unlocked.includes(achievement.id)
        }));
        
        setAchievements(achievementsWithStatus);
        setFilteredAchievements(achievementsWithStatus);
        
        toast.success('Achievements loaded');
      } catch (error) {
        handleError(error, {
          category: ErrorCategory.DATA_PROCESSING,
          context: 'Achievement loading',
          customMessage: 'Failed to load achievements'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAchievements();
  }, []);
  
  // Filter achievements when category changes
  useEffect(() => {
    if (selectedCategory === null) {
      setFilteredAchievements(achievements);
    } else {
      setFilteredAchievements(
        achievements.filter(achievement => achievement.category === selectedCategory)
      );
    }
  }, [selectedCategory, achievements]);
  
  // Handlers
  const handleCategoryChange = (category: AchievementCategory | null) => {
    setSelectedCategory(category);
  };
  
  // Calculate counts
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  
  return (
    <SwipeablePanelController position="bottom" height="85vh" title="Achievements">
      <div className="space-y-4">
        <AchievementHeader unlockedCount={unlockedCount} totalCount={totalCount} />
        
        <AchievementFilter 
          selectedCategory={selectedCategory} 
          onCategoryChange={handleCategoryChange} 
        />
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse h-8 w-8 rounded-full bg-primary-600"></div>
          </div>
        ) : filteredAchievements.length > 0 ? (
          <div className="space-y-3">
            {filteredAchievements.map(achievement => (
              <AchievementItem 
                key={achievement.id} 
                achievement={achievement} 
              />
            ))}
          </div>
        ) : (
          <EmptyAchievementList selectedCategory={selectedCategory} />
        )}
      </div>
    </SwipeablePanelController>
  );
};

export default AchievementsPanel;
