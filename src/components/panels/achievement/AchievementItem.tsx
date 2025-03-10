
import React from 'react';
import { motion } from 'framer-motion';
import { Award, Star, Brain, Flame, BookOpen, Zap, Sparkles } from 'lucide-react';
import { Achievement, AchievementCategory } from '@/types/achievement';
import { calculateProgressPercentage, getAchievementTarget } from '@/utils/achievementUtils';

interface AchievementItemProps {
  achievement: Achievement;
  onClick: () => void;
}

const AchievementItem: React.FC<AchievementItemProps> = ({ achievement, onClick }) => {
  const progressPercentage = achievement.progress !== undefined && achievement.target !== undefined
    ? calculateProgressPercentage(achievement.progress, achievement.target)
    : calculateProgressPercentage(achievement.progress || 0, getAchievementTarget(achievement));

  const getIconComponent = (category: AchievementCategory) => {
    switch (category) {
      case 'meditation':
        return <Zap className="text-purple-400" />;
      case 'chakra':
        return <Flame className="text-orange-400" />;
      case 'reflection':
        return <BookOpen className="text-blue-400" />;
      case 'practice':
        return <Flame className="text-red-400" />;
      case 'portal':
        return <Zap className="text-cyan-400" />;
      case 'wisdom':
        return <Brain className="text-emerald-400" />;
      case 'consciousness':
        return <Star className="text-yellow-400" />;
      case 'special':
        return <Sparkles className="text-pink-400" />;
      default:
        return <Award className="text-gray-400" />;
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-gray-800/60 backdrop-blur-md rounded-lg p-4 cursor-pointer mb-3 border border-gray-700/50 hover:border-gray-600/70 transition-colors"
    >
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gray-700/50 rounded-full">
          {getIconComponent(achievement.category)}
        </div>
        <div className="flex-1">
          <h3 className="text-white font-medium">{achievement.title}</h3>
          <p className="text-gray-400 text-sm truncate">{achievement.description}</p>
        </div>
        {achievement.awarded && (
          <div className="flex-shrink-0">
            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
              Awarded
            </span>
          </div>
        )}
      </div>
      
      {/* Progress bar */}
      {!achievement.awarded && (
        <div className="mt-3">
          <div className="bg-gray-700/50 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-400">
              {achievement.progress || 0} / {achievement.target || getAchievementTarget(achievement)}
            </span>
            <span className="text-xs text-gray-400">{progressPercentage}%</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AchievementItem;
