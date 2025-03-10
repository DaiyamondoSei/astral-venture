
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import AchievementHeader from './achievement/AchievementHeader';
import AchievementFilter from './achievement/AchievementFilter';
import AchievementItem from './achievement/AchievementItem';
import EmptyAchievementList from './achievement/EmptyAchievementList';
import { getUserAchievements, Achievement } from '@/utils/achievementUtils';

interface AchievementsPanelProps {
  className?: string;
}

const AchievementsPanel: React.FC<AchievementsPanelProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState('all');
  
  // Get user achievements from Supabase
  const { data: achievements = [], isLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: getUserAchievements,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Filter achievements by category
  const filteredAchievements = activeTab === 'all' 
    ? achievements 
    : achievements.filter((a: Achievement) => a.category === activeTab);
  
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
        unlockedCount={achievements.filter((a: Achievement) => a.awarded).length} 
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
          filteredAchievements.map((achievement: Achievement) => (
            <AchievementItem key={achievement.id} achievement={achievement} />
          ))
        )}
      </motion.div>
    </div>
  );
};

export default AchievementsPanel;
