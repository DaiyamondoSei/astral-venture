
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AchievementHeader from './achievement/AchievementHeader';
import AchievementFilter from './achievement/AchievementFilter';
import AchievementItem from './achievement/AchievementItem';
import EmptyAchievementList from './achievement/EmptyAchievementList';
import { getPlaceholderAchievements } from '@/utils/achievementUtils';

interface AchievementType {
  id: string;
  title: string;
  description: string;
  category: 'meditation' | 'practice' | 'reflection' | 'wisdom' | 'special';
  progress?: number;
  awarded?: boolean;
  icon?: 'star' | 'trophy' | 'award' | 'check';
}

interface AchievementsPanelProps {
  className?: string;
}

const AchievementsPanel: React.FC<AchievementsPanelProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState('all');
  
  // Get user achievements from Supabase
  const { data: achievements = [], isLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      try {
        // First check if the user_achievements table exists using our function
        const { data: userAchievements, error } = await supabase
          .rpc('get_user_achievements', { user_id_param: (await supabase.auth.getUser()).data.user?.id })
        
        if (error) throw error
        
        // If we don't have actual achievements yet, return placeholder data
        if (!userAchievements || userAchievements.length === 0) {
          return getPlaceholderAchievements();
        }
        
        return userAchievements.map((a: any) => ({
          id: a.achievement_id,
          title: a.achievement_data?.title || 'Unknown Achievement',
          description: a.achievement_data?.description || 'Description not available',
          category: a.achievement_data?.category || 'special',
          progress: a.progress,
          awarded: a.awarded,
          icon: a.achievement_data?.icon || 'award'
        }));
      } catch (error) {
        console.error('Error fetching achievements:', error);
        // Return placeholder data if there's an error
        return getPlaceholderAchievements();
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Filter achievements by category
  const filteredAchievements = activeTab === 'all' 
    ? achievements 
    : achievements.filter((a: AchievementType) => a.category === activeTab);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      }
    }
  };
  
  if (isLoading) {
    return (
      <div className={cn("pb-4", className)}>
        <AchievementHeader unlockedCount={0} totalCount={0} />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-white/5 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn("pb-4", className)}>
      <AchievementHeader 
        unlockedCount={achievements.filter((a: AchievementType) => a.awarded).length} 
        totalCount={achievements.length} 
      />
      
      <AchievementFilter activeTab={activeTab} onTabChange={setActiveTab} />
      
      <motion.div 
        className="space-y-3 overflow-auto max-h-[calc(100vh-250px)]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {filteredAchievements.length === 0 ? (
          <EmptyAchievementList />
        ) : (
          filteredAchievements.map((achievement: AchievementType) => (
            <AchievementItem key={achievement.id} achievement={achievement} />
          ))
        )}
      </motion.div>
    </div>
  );
};

export default AchievementsPanel;
