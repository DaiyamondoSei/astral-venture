
import React, { useEffect, useState } from 'react';
import ProgressTracker from '@/components/ProgressTracker';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AchievementProgressTrackerProps {
  progressPercentage: number;
  totalPoints: number;
}

const AchievementProgressTracker: React.FC<AchievementProgressTrackerProps> = ({
  progressPercentage,
  totalPoints
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
      
      <div className="mt-2 text-xs text-muted-foreground">
        {progressPercentage >= 100 ? (
          <span>Level milestone reached! ✨</span>
        ) : (
          <span>{100 - progressPercentage}% until next level</span>
        )}
      </div>
    </motion.div>
  );
};

export default AchievementProgressTracker;
