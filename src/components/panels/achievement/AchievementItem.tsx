
import React from 'react';
import { motion } from 'framer-motion';
import { Award, Star, Brain, Flame, Zap, BookOpen, Sparkles, LucideIcon } from 'lucide-react';
import { calculateProgressPercentage, getAchievementProgress, getAchievementTarget } from '@/utils/achievementUtils';
import type { Achievement, AchievementIcon } from '@/types/achievement';

interface AchievementItemProps {
  achievement: Achievement;
  onClick: () => void;
}

/**
 * Icon mapping for achievement categories
 */
const iconMap: Record<AchievementIcon, LucideIcon> = {
  'star': Star,
  'award': Award,
  'brain': Brain,
  'flame': Flame,
  'energy': Zap,
  'book': BookOpen,
  'sparkles': Sparkles
};

/**
 * Background color mapping for achievement categories
 */
const categoryColorMap: Record<string, string> = {
  'meditation': 'from-blue-600 to-indigo-600',
  'chakra': 'from-purple-600 to-pink-600',
  'reflection': 'from-green-600 to-emerald-600',
  'practice': 'from-orange-600 to-amber-600',
  'portal': 'from-violet-600 to-fuchsia-600',
  'wisdom': 'from-cyan-600 to-sky-600',
  'consciousness': 'from-indigo-600 to-blue-600',
  'special': 'from-yellow-600 to-amber-600'
};

/**
 * Individual achievement item component
 */
const AchievementItem: React.FC<AchievementItemProps> = ({ achievement, onClick }) => {
  const progress = getAchievementProgress(achievement);
  const target = getAchievementTarget(achievement);
  const percentage = calculateProgressPercentage(progress, target);
  
  // Select icon based on achievement icon property or fallback to Award
  const IconComponent = achievement.icon && iconMap[achievement.icon as AchievementIcon]
    ? iconMap[achievement.icon as AchievementIcon]
    : Award;
  
  // Select background gradient based on category
  const backgroundGradient = achievement.category && categoryColorMap[achievement.category]
    ? categoryColorMap[achievement.category]
    : 'from-blue-600 to-indigo-600';
  
  // Blur the achievement if it's secret and not awarded
  const isBlurred = achievement.secret && !achievement.awarded;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        mb-3 rounded-lg overflow-hidden cursor-pointer
        ${isBlurred ? 'opacity-60' : ''}
      `}
      onClick={onClick}
    >
      <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg border border-gray-700/50">
        <div className="flex items-center">
          <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${backgroundGradient} flex items-center justify-center text-white`}>
            <IconComponent size={20} />
          </div>
          
          <div className="ml-3 flex-1">
            <h3 className="font-medium text-white">
              {isBlurred ? '???' : achievement.title}
            </h3>
            <p className="text-gray-400 text-sm line-clamp-1">
              {isBlurred ? 'Secret achievement' : achievement.description}
            </p>
          </div>
          
          {achievement.awarded && (
            <div className="ml-2">
              <span className="text-yellow-400">
                <Sparkles size={20} />
              </span>
            </div>
          )}
        </div>
        
        {!achievement.awarded && (
          <div className="mt-3">
            <div className="bg-gray-700/40 h-2 rounded-full overflow-hidden">
              <div 
                className={`bg-gradient-to-r ${backgroundGradient} h-full transition-all duration-500`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-400">
                {isBlurred ? '?' : `${progress}/${target}`}
              </span>
              <span className="text-xs text-gray-400">
                {`${percentage}%`}
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AchievementItem;
