
import { useMemo } from 'react';
import { AchievementData } from '../../data/types';

export type VisualizationStyle = 'minimal' | 'standard' | 'detailed' | 'animated';

interface VisualizationOptions {
  style?: VisualizationStyle;
  showProgress?: boolean;
  showPoints?: boolean;
  animate?: boolean;
  colorful?: boolean;
}

export function useAchievementVisualization(
  achievements: AchievementData[],
  getAchievementProgress: (achievementId: string) => number,
  options: VisualizationOptions = {}
) {
  const {
    style = 'standard',
    showProgress = true,
    showPoints = true,
    animate = true,
    colorful = true
  } = options;
  
  const achievementsByCategory = useMemo(() => {
    return achievements.reduce((acc, achievement) => {
      const category = achievement.type || 'other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(achievement);
      return acc;
    }, {} as Record<string, AchievementData[]>);
  }, [achievements]);
  
  const totalProgress = useMemo(() => {
    if (achievements.length === 0) return 0;
    
    const totalPercentage = achievements.reduce((sum, achievement) => {
      return sum + getAchievementProgress(achievement.id);
    }, 0);
    
    return totalPercentage / achievements.length;
  }, [achievements, getAchievementProgress]);
  
  const getColorForCategory = (category: string): string => {
    if (!colorful) return 'bg-primary';
    
    const colorMap: Record<string, string> = {
      'discovery': 'bg-blue-500',
      'completion': 'bg-green-500',
      'interaction': 'bg-purple-500',
      'streak': 'bg-red-500',
      'progressive': 'bg-amber-500',
      'milestone': 'bg-teal-500'
    };
    
    return colorMap[category] || 'bg-gray-500';
  };
  
  const getAnimationForStyle = (achievementStyle: VisualizationStyle): string => {
    if (!animate) return '';
    
    const animationMap: Record<VisualizationStyle, string> = {
      'minimal': 'animate-fade-in',
      'standard': 'animate-slide-in-bottom',
      'detailed': 'animate-scale-in',
      'animated': 'animate-pulse'
    };
    
    return animationMap[achievementStyle] || '';
  };
  
  return {
    achievementsByCategory,
    totalProgress,
    getColorForCategory,
    getAnimationForStyle,
    style,
    showProgress,
    showPoints
  };
}
