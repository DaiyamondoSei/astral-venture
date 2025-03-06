
import React from 'react';
import { motion } from 'framer-motion';
import { AchievementData } from '../data/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Award, Star, TrendingUp } from 'lucide-react';
import { getAchievementIcon, getProgressColor } from '../hooks/achievement';

interface AchievementSummaryProps {
  achievements: AchievementData[];
  recentlyEarned?: AchievementData[];
  getProgress: (achievementId: string) => number;
  onSelectAchievement?: (achievement: AchievementData) => void;
  className?: string;
}

const AchievementSummary: React.FC<AchievementSummaryProps> = ({
  achievements,
  recentlyEarned = [],
  getProgress,
  onSelectAchievement,
  className
}) => {
  // Group achievements by type
  const achievementGroups = achievements.reduce((groups, achievement) => {
    const type = achievement.type || 'other';
    if (!groups[type]) groups[type] = [];
    groups[type].push(achievement);
    return groups;
  }, {} as Record<string, AchievementData[]>);

  const totalAchievements = achievements.length;
  const earnedAchievements = achievements.filter(a => getProgress(a.id) === 100).length;
  const completionPercentage = totalAchievements > 0 
    ? Math.round((earnedAchievements / totalAchievements) * 100) 
    : 0;

  return (
    <div className={className}>
      <Card className="bg-black/50 border border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Award className="mr-2 h-5 w-5 text-primary" />
            Achievement Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Overall Progress</span>
            <span className="text-sm font-medium">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
          
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="bg-black/30 rounded-md p-3 text-center">
              <div className="text-2xl font-bold">{earnedAchievements}</div>
              <div className="text-xs text-muted-foreground">Achievements Earned</div>
            </div>
            <div className="bg-black/30 rounded-md p-3 text-center">
              <div className="text-2xl font-bold">{totalAchievements - earnedAchievements}</div>
              <div className="text-xs text-muted-foreground">Remaining</div>
            </div>
          </div>
          
          {recentlyEarned.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <Star className="h-4 w-4 mr-1 text-yellow-500" />
                Recently Earned
              </h3>
              <div className="space-y-2">
                {recentlyEarned.slice(0, 3).map(achievement => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-primary/10 border border-primary/20 rounded-md p-2 cursor-pointer"
                    onClick={() => onSelectAchievement?.(achievement)}
                  >
                    <div className="flex items-center">
                      <div className="bg-primary/20 p-1 rounded mr-2">
                        {React.createElement(
                          getAchievementIcon(achievement.type) === 'star' 
                            ? Star 
                            : achievement.type === 'trending-up' 
                              ? TrendingUp 
                              : Award, 
                          { size: 14, className: "text-primary" }
                        )}
                      </div>
                      <div className="text-sm font-medium">{achievement.title}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex flex-wrap gap-1 mt-4">
            {Object.entries(achievementGroups).map(([type, items]) => (
              <Badge 
                key={type}
                variant="outline" 
                className="bg-black/30 hover:bg-black/50 transition-colors"
              >
                {type} ({items.length})
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AchievementSummary;
