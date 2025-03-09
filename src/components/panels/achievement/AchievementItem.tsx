
import React from 'react';
import { Star, Trophy, Award, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useQuantumTheme } from '@/components/visual-foundation';

interface AchievementType {
  id: string;
  title: string;
  description: string;
  category: 'meditation' | 'practice' | 'reflection' | 'wisdom' | 'special';
  progress?: number;
  awarded?: boolean;
  icon?: 'star' | 'trophy' | 'award' | 'check';
}

interface AchievementItemProps {
  achievement: AchievementType;
}

const AchievementItem: React.FC<AchievementItemProps> = ({ achievement }) => {
  const { theme } = useQuantumTheme();
  
  const renderAchievementIcon = (icon?: string) => {
    switch (icon) {
      case 'star': return <Star className="text-yellow-400" size={18} />;
      case 'trophy': return <Trophy className="text-amber-500" size={18} />;
      case 'check': return <CheckCircle className="text-green-400" size={18} />;
      case 'award':
      default: return <Award className="text-purple-400" size={18} />;
    }
  };
  
  return (
    <motion.div 
      key={achievement.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "p-3 rounded-lg border transition-colors",
        achievement.awarded 
          ? "bg-white/15 backdrop-blur border-white/20" 
          : "bg-white/5 backdrop-blur border-white/10"
      )}
    >
      <div className="flex items-center space-x-3">
        <div className={cn(
          "h-10 w-10 rounded-full flex items-center justify-center",
          achievement.awarded 
            ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white" 
            : "bg-white/10 text-white/50"
        )}>
          {renderAchievementIcon(achievement.icon)}
        </div>
        
        <div className="flex-1">
          <h4 className={cn(
            "font-medium",
            achievement.awarded ? "text-white" : "text-white/70"
          )}>
            {achievement.title}
          </h4>
          <p className="text-white/60 text-sm">
            {achievement.description}
          </p>
          
          {!achievement.awarded && achievement.progress !== undefined && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-white/70 mb-1">
                <span>Progress</span>
                <span>{Math.round(achievement.progress * 100)}%</span>
              </div>
              <Progress 
                value={achievement.progress * 100} 
                className="h-1.5 bg-white/10"
                indicatorClassName={
                  theme === 'ethereal' 
                    ? "bg-gradient-to-r from-ethereal-400 to-ethereal-600" 
                    : theme === 'astral' 
                      ? "bg-gradient-to-r from-astral-400 to-astral-600"
                      : "bg-gradient-to-r from-quantum-400 to-quantum-600"
                }
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AchievementItem;
