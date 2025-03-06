
import React, { useEffect, useState } from 'react';
import ProgressTracker from '@/components/ProgressTracker';
import { motion } from 'framer-motion';
import { Sparkles, Trophy, Zap, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AchievementData } from './data/types';

interface AchievementProgressTrackerProps {
  progressPercentage: number;
  totalPoints: number;
  nextAchievement?: AchievementData;
  streakDays?: number;
}

const AchievementProgressTracker: React.FC<AchievementProgressTrackerProps> = ({
  progressPercentage,
  totalPoints,
  nextAchievement,
  streakDays = 0
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Trigger the animation when the component mounts
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div 
      className="fixed bottom-4 right-4 z-50 w-64 p-4 bg-background/90 rounded-lg shadow-lg border border-quantum-500/30 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        boxShadow: isAnimating ? '0 0 15px rgba(136, 85, 255, 0.6)' : '0 0 0px rgba(136, 85, 255, 0)'
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-sm">Your Progress</h4>
        <Badge variant="outline" className="flex items-center gap-1 text-xs">
          <Sparkles size={12} className="text-primary" />
          <span>{totalPoints}</span>
        </Badge>
      </div>
      
      <ProgressTracker 
        progress={progressPercentage} 
        label="Energy Points"
        glowIntensity="high"
        animation="pulse"
        size="md"
      />
      
      <div className="mt-2 text-xs text-muted-foreground flex justify-between">
        {progressPercentage >= 100 ? (
          <span>Level milestone reached! ✨</span>
        ) : (
          <span>{100 - progressPercentage}% until next level</span>
        )}
      </div>

      {streakDays > 0 && (
        <div className="mt-3 border-t border-quantum-500/20 pt-2">
          <div className="flex items-center gap-1 text-xs mb-1">
            <Calendar size={12} className="text-quantum-400" />
            <span className="font-medium">Current streak: {streakDays} day{streakDays === 1 ? '' : 's'}</span>
          </div>
        </div>
      )}
      
      {nextAchievement && (
        <div className="mt-3 border-t border-quantum-500/20 pt-2">
          <div className="flex items-center gap-1 text-xs mb-1">
            <Trophy size={12} className="text-quantum-400" />
            <span className="font-medium">Next achievement:</span>
          </div>
          <div className="text-xs text-muted-foreground">{nextAchievement.title}</div>
          <div className="mt-1">
            <ProgressTracker 
              progress={0} // This would be populated from getAchievementProgress
              size="sm"
              colorScheme="from-quantum-300 to-quantum-600"
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AchievementProgressTracker;
