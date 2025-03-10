
import React from 'react';
import { motion } from 'framer-motion';
import { Award, Check, Star, Trophy, Zap, Sparkles } from 'lucide-react';
import { calculateProgressPercentage, getCategoryColor } from '@/utils/achievementUtils';

interface AchievementProps {
  achievement: {
    id: string;
    title: string;
    description: string;
    category: 'meditation' | 'practice' | 'reflection' | 'wisdom' | 'special' | 'portal' | 'chakra';
    progress?: number;
    awarded?: boolean;
    icon?: 'star' | 'trophy' | 'award' | 'check' | 'zap' | 'sparkles';
  };
}

const AchievementItem: React.FC<AchievementProps> = ({ achievement }) => {
  const progressPercentage = calculateProgressPercentage(achievement.progress || 0);
  const categoryColorClass = getCategoryColor(achievement.category);
  
  const iconMap = {
    star: <Star className="h-5 w-5" />,
    trophy: <Trophy className="h-5 w-5" />,
    award: <Award className="h-5 w-5" />,
    check: <Check className="h-5 w-5" />,
    zap: <Zap className="h-5 w-5" />,
    sparkles: <Sparkles className="h-5 w-5" />
  };
  
  const icon = achievement.icon ? iconMap[achievement.icon] : <Award className="h-5 w-5" />;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/5 backdrop-blur-md rounded-lg p-4 hover:bg-white/10 transition-colors"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-3">
          <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${categoryColorClass} flex items-center justify-center text-white`}>
            {icon}
          </div>
          <div>
            <h3 className="font-medium text-white text-base">{achievement.title}</h3>
            <p className="text-white/70 text-sm">{achievement.description}</p>
          </div>
        </div>
        {achievement.awarded && (
          <div className="bg-green-500/20 rounded-full p-1">
            <Check className="h-4 w-4 text-green-500" />
          </div>
        )}
      </div>
      
      {!achievement.awarded && (
        <div className="mt-3">
          <div className="w-full bg-white/10 rounded-full h-2 mt-1">
            <div 
              className={`h-2 rounded-full bg-gradient-to-r ${categoryColorClass}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-white/60 text-xs mt-1">{progressPercentage}% complete</p>
        </div>
      )}
    </motion.div>
  );
};

export default AchievementItem;
