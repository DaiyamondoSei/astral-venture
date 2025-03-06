
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AchievementData } from '../data/types';
import { motion } from 'framer-motion';
import { formatAchievementPoints, getAchievementIcon, getProgressColor } from '../hooks/achievement';
import { 
  Trophy, 
  Star, 
  Sparkles, 
  MousePointer, 
  Flame, 
  TrendingUp, 
  Award,
  Check 
} from 'lucide-react';

interface AchievementSummaryProps {
  achievement: AchievementData;
  progress?: number;
  onDismiss?: () => void;
  showDetails?: boolean;
}

const AchievementSummary: React.FC<AchievementSummaryProps> = ({
  achievement,
  progress = 0,
  onDismiss,
  showDetails = true
}) => {
  const renderAchievementIcon = () => {
    switch (achievement.type) {
      case 'discovery':
        return <Sparkles className="h-5 w-5 text-cyan-400" />;
      case 'completion':
        return <Check className="h-5 w-5 text-green-400" />;
      case 'interaction':
        return <MousePointer className="h-5 w-5 text-indigo-400" />;
      case 'streak':
        return <Flame className="h-5 w-5 text-orange-400" />;
      case 'progressive':
        return <TrendingUp className="h-5 w-5 text-blue-400" />;
      case 'milestone':
        return <Award className="h-5 w-5 text-purple-400" />;
      default:
        return <Star className="h-5 w-5 text-yellow-400" />;
    }
  };

  return (
    <motion.div
      className="bg-black/40 border border-quantum-500/30 rounded-lg p-4 shadow-lg backdrop-blur-sm"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start">
        <div className="p-2 bg-quantum-900/60 rounded-lg mr-3">
          {renderAchievementIcon()}
        </div>
        
        <div className="flex-1">
          <h4 className="text-lg font-medium text-white">{achievement.title}</h4>
          <p className="text-sm text-white/70 mb-2">{achievement.description}</p>
          
          {showDetails && (
            <div className="flex items-center justify-between mt-3">
              <Badge variant="outline" className="bg-black/30 border-quantum-400/40">
                {formatAchievementPoints(achievement.points)}
              </Badge>
              
              <Badge variant="outline" className={`bg-black/30 border-quantum-400/40 ${getProgressColor(progress)}`}>
                {achievement.type === 'streak' ? `${achievement.streakDays} days` : ''}
                {achievement.type === 'progressive' ? `Tier ${achievement.tier || 1}` : ''}
              </Badge>
            </div>
          )}
        </div>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-2 text-white/50 hover:text-white"
            aria-label="Dismiss achievement"
          >
            ✕
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default AchievementSummary;
