
import React, { useState, useEffect } from 'react';
import usePanelState from '@/hooks/usePanelState';
import SwipeablePanel from './SwipeablePanelController';
import AchievementHeader from './achievement/AchievementHeader';
import AchievementFilter from './achievement/AchievementFilter';
import AchievementItem from './achievement/AchievementItem';
import EmptyAchievementList from './achievement/EmptyAchievementList';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import type { Achievement } from '@/types/achievement';
import { normalizeEntities } from '@/utils/entityUtils';

/**
 * Achievements panel that displays user achievements
 */
const AchievementsPanel = () => {
  const [filter, setFilter] = useState<string | null>(null);
  const { activePanelType } = usePanelState();
  
  // Only fetch achievements if the panel is open
  const shouldFetch = activePanelType === 'achievements';
  
  const { data: achievements = [], isLoading, error } = useQuery({
    queryKey: ['achievements', shouldFetch],
    queryFn: async () => {
      if (!shouldFetch) return [];
      
      try {
        const { data, error } = await supabase
          .from('achievements')
          .select('*');
        
        if (error) throw error;
        
        // Transform to Achievement type and add unlocked status
        // Using normalizeEntities ensures all items have an id property
        return normalizeEntities(data.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          category: item.category,
          icon: item.icon,
          unlocked: Math.random() > 0.5, // Placeholder - replace with actual logic
          progress: Math.floor(Math.random() * 100), // Placeholder
          difficulty: ['beginner', 'intermediate', 'advanced', 'master'][
            Math.floor(Math.random() * 4)
          ] as Achievement['difficulty'],
          createdAt: item.created_at,
          unlockedAt: Math.random() > 0.7 ? new Date().toISOString() : undefined,
          requiredCount: Math.floor(Math.random() * 10) + 1,
          currentCount: Math.floor(Math.random() * 10)
        })));
      } catch (err) {
        console.error('Error fetching achievements:', err);
        return [];
      }
    },
    enabled: shouldFetch,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
  
  // Filter achievements based on selected filter
  const filteredAchievements = filter 
    ? achievements.filter(achievement => achievement.category === filter)
    : achievements;

  // Get unique categories for filter
  const categories = Array.from(
    new Set(achievements.map(achievement => achievement.category).filter(Boolean))
  );

  return (
    <SwipeablePanel position="bottom" title="Achievements">
      <div className="p-4 pb-safe">
        <AchievementHeader achievementCount={achievements.length || 0} />
        
        <AchievementFilter 
          categories={categories} 
          selectedFilter={filter} 
          onFilterChange={setFilter}
        />
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            Failed to load achievements
          </div>
        ) : filteredAchievements.length === 0 ? (
          <EmptyAchievementList />
        ) : (
          <div className="grid gap-4 pt-4">
            {filteredAchievements.map(achievement => (
              <AchievementItem 
                key={achievement.id} 
                achievement={achievement} 
              />
            ))}
          </div>
        )}
      </div>
    </SwipeablePanel>
  );
};

export default AchievementsPanel;
