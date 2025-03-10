
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import AchievementItem from './achievement/AchievementItem';
import AchievementHeader from './achievement/AchievementHeader';
import AchievementFilter from './achievement/AchievementFilter';
import EmptyAchievementList from './achievement/EmptyAchievementList';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Achievement, AchievementCategory } from '@/types/achievement';

/**
 * Panel that displays user achievements and allows filtering
 */
const AchievementsPanel: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAwarded, setShowAwarded] = useState(true);
  const [showUnawarded, setShowUnawarded] = useState(true);
  const [detailsShown, setDetailsShown] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  // Fetch achievements from Supabase
  const { data: achievements, isLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get_user_achievements');
      
      if (error) {
        console.error('Error fetching achievements:', error);
        throw error;
      }
      
      return data as Achievement[];
    }
  });

  // Filter achievements based on user selection
  const filteredAchievements = achievements?.filter(achievement => {
    // Filter by category
    if (selectedCategory && achievement.category !== selectedCategory) {
      return false;
    }
    
    // Filter by awarded status
    if (achievement.awarded && !showAwarded) {
      return false;
    }
    
    if (!achievement.awarded && !showUnawarded) {
      return false;
    }
    
    return true;
  }) || [];

  // Show achievement details
  const showDetails = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setDetailsShown(true);
  };

  // Hide achievement details
  const hideDetails = () => {
    setDetailsShown(false);
  };

  return (
    <div className="h-full flex flex-col">
      <AchievementHeader 
        totalAchievements={achievements?.length || 0}
        awardedCount={achievements?.filter(a => a.awarded).length || 0}
      />
      
      <AchievementFilter
        selectedCategory={selectedCategory}
        showAwarded={showAwarded}
        showUnawarded={showUnawarded}
        onCategoryChange={setSelectedCategory}
        onShowAwardedChange={setShowAwarded}
        onShowUnawardedChange={setShowUnawarded}
      />
      
      <div className="flex-1 overflow-y-auto mt-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : filteredAchievements.length === 0 ? (
          <EmptyAchievementList selectedCategory={selectedCategory as AchievementCategory} />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {filteredAchievements.map((achievement) => (
              <AchievementItem
                key={achievement.id}
                achievement={achievement}
                onClick={() => showDetails(achievement)}
              />
            ))}
          </motion.div>
        )}
      </div>
      
      {/* Achievement details modal */}
      {detailsShown && selectedAchievement && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={hideDetails}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-gray-900 p-6 rounded-xl w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="text-yellow-400" />
                <h2 className="text-xl font-semibold text-white">{selectedAchievement.title}</h2>
              </div>
              <button
                onClick={hideDetails}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <p className="text-gray-300 mb-4">{selectedAchievement.description}</p>
            
            {selectedAchievement.awarded ? (
              <div className="bg-green-900/30 text-green-300 p-3 rounded-md flex items-center">
                <Sparkles className="mr-2" />
                <span>Achievement unlocked! Congratulations!</span>
              </div>
            ) : (
              <div className="mt-4">
                <div className="bg-gray-800 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-full" 
                    style={{ 
                      width: `${selectedAchievement.progress && selectedAchievement.target 
                        ? (selectedAchievement.progress / selectedAchievement.target) * 100 
                        : 0}%` 
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-sm text-gray-400">
                    {selectedAchievement.progress || 0} / {selectedAchievement.target || 1}
                  </span>
                  <span className="text-sm text-gray-400">
                    {selectedAchievement.progress && selectedAchievement.target 
                      ? Math.round((selectedAchievement.progress / selectedAchievement.target) * 100) 
                      : 0}%
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AchievementsPanel;
