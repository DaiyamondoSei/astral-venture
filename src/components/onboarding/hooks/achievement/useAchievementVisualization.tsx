
import { useState, useEffect } from 'react';
import { AchievementData } from '../../data/types';
import { achievementService } from '@/services/achievements';

interface VisualizationOptions {
  animate?: boolean;
  duration?: number;
  ease?: string;
}

interface UseAchievementVisualizationResult {
  visualProgress: number;
  visualPoints: number;
  totalPointsWithAnimation: number;
  isAnimating: boolean;
  startAnimation: () => void;
  stopAnimation: () => void;
}

/**
 * Hook for handling achievement visualization effects and animations
 */
export function useAchievementVisualization(
  achievement: AchievementData,
  currentProgress: number = 0,
  totalPoints: number = 0,
  options: VisualizationOptions = {}
): UseAchievementVisualizationResult {
  const [visualProgress, setVisualProgress] = useState(0);
  const [visualPoints, setVisualPoints] = useState(0);
  const [totalPointsWithAnimation, setTotalPointsWithAnimation] = useState(totalPoints);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const defaultOptions = {
    animate: true,
    duration: 1000,
    ease: 'easeOut',
    ...options
  };
  
  // Start the animation
  const startAnimation = () => {
    if (!defaultOptions.animate) {
      // If animation is disabled, just set the final values
      setVisualProgress(currentProgress);
      setVisualPoints(achievement.points);
      setTotalPointsWithAnimation(totalPoints + achievement.points);
      return;
    }
    
    setIsAnimating(true);
    
    // Animate progress value
    const startTime = Date.now();
    const startProgress = visualProgress;
    const startPoints = visualPoints;
    const startTotalPoints = totalPointsWithAnimation;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / defaultOptions.duration, 1);
      
      // Apply easing (simple easeOut)
      const easedProgress = 1 - Math.pow(1 - progress, 2);
      
      // Update values
      setVisualProgress(startProgress + (currentProgress - startProgress) * easedProgress);
      setVisualPoints(startPoints + (achievement.points - startPoints) * easedProgress);
      setTotalPointsWithAnimation(startTotalPoints + (totalPoints + achievement.points - startTotalPoints) * easedProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };
    
    animate();
  };
  
  // Stop the animation
  const stopAnimation = () => {
    setIsAnimating(false);
    
    // Set final values
    setVisualProgress(currentProgress);
    setVisualPoints(achievement.points);
    setTotalPointsWithAnimation(totalPoints + achievement.points);
  };
  
  // Reset animation when achievement changes
  useEffect(() => {
    setVisualProgress(0);
    setVisualPoints(0);
  }, [achievement.id]);
  
  return {
    visualProgress,
    visualPoints,
    totalPointsWithAnimation,
    isAnimating,
    startAnimation,
    stopAnimation
  };
}
