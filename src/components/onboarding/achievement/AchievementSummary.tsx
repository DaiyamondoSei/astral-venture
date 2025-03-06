
import React from 'react';
import { motion } from 'framer-motion';
import { Award, Sparkles } from 'lucide-react';
import { formatAchievementPoints, getProgressColor } from '../hooks/achievement';
import { AchievementData } from '../data/types';
import ProgressValue from '@/components/progress/ProgressValue';
import { achievementService } from '@/services/achievements';

interface AchievementSummaryProps {
  achievement: AchievementData;
  progress: number;
  totalPoints: number;
  showProgress?: boolean;
  animate?: boolean;
}

const AchievementSummary: React.FC<AchievementSummaryProps> = ({
  achievement,
  progress,
  totalPoints,
  showProgress = true,
  animate = true
}) => {
  const formattedPoints = formatAchievementPoints(achievement.points);
  const progressColor = getProgressColor(progress);
  
  return (
    <motion.div 
      className="bg-background/95 border border-border rounded-lg p-4 shadow-sm"
      initial={animate ? { opacity: 0, y: 10 } : undefined}
      animate={animate ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          <motion.div
            initial={animate ? { scale: 0.8 } : undefined}
            animate={animate ? { scale: 1 } : undefined}
            transition={{ delay: 0.1, type: "spring" }}
          >
            <Award className="h-10 w-10 text-primary" />
          </motion.div>
        </div>
        
        <div className="flex-grow">
          <h4 className="font-medium text-foreground">{achievement.title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>
          
          {showProgress && (
            <div className="mt-3">
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-primary"
                  initial={{ width: "0%" }}
                  animate={{ width: `${Math.min(100, progress)}%` }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                />
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-muted-foreground">
                  {progress < 100 ? `${Math.round(progress)}% complete` : 'Completed'}
                </span>
                <div className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-primary" />
                  <span className="text-xs font-medium">{achievement.points}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AchievementSummary;
