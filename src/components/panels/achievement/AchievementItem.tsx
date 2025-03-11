
import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Award } from 'lucide-react';
import type { Achievement } from '@/types/achievement';
import { ensureEntityId } from '@/types/core';

/**
 * Props for the AchievementItem component
 */
interface IAchievementItemProps {
  achievement: Achievement;
  onClick?: () => void;
}

/**
 * Component that displays a single achievement
 */
const AchievementItem: React.FC<IAchievementItemProps> = ({ 
  achievement: rawAchievement, 
  onClick 
}) => {
  // Ensure the achievement has all required properties, preventing "id does not exist on type never"
  const achievement = ensureEntityId(rawAchievement);
  const { title, description, unlocked, icon } = achievement;
  
  // Get the style for the achievement based on whether it's unlocked
  const getAchievementStyle = () => {
    return {
      container: unlocked
        ? 'bg-gray-800/60 border-gray-700/50'
        : 'bg-gray-900/30 border-gray-800/50 text-gray-500',
      title: unlocked
        ? 'text-white'
        : 'text-gray-400',
      description: unlocked
        ? 'text-gray-300'
        : 'text-gray-500',
      icon: unlocked
        ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white'
        : 'bg-gray-800 text-gray-500'
    };
  };
  
  const style = getAchievementStyle();
  
  return (
    <motion.div
      className={`${style.container} p-4 rounded-lg border flex items-start space-x-3 cursor-pointer transition-colors hover:border-gray-700`}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      onClick={onClick}
    >
      <div className={`${style.icon} h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0`}>
        {unlocked ? (
          <Award size={18} />
        ) : (
          <Lock size={18} />
        )}
      </div>
      
      <div>
        <h3 className={`${style.title} font-medium`}>{title}</h3>
        <p className={`${style.description} text-sm`}>
          {unlocked ? description : 'Complete the required actions to unlock this achievement.'}
        </p>
      </div>
    </motion.div>
  );
};

export default AchievementItem;
