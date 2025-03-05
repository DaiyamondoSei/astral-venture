
import { useState, useEffect } from 'react';

/**
 * Hook that smoothly transitions between emotional states or values
 * 
 * @param targetValue - The target value to transition to
 * @param duration - Duration of the transition in ms (default: 1500ms)
 * @param delay - Delay before starting the transition in ms (default: 0ms)
 * @returns Current interpolated value during the transition
 */
export const useEmotionalTransition = (
  targetValue: number, 
  duration: number = 1500,
  delay: number = 0
): number => {
  const [currentValue, setCurrentValue] = useState(targetValue);
  const [previousValue, setPreviousValue] = useState(targetValue);
  const [transitionProgress, setTransitionProgress] = useState(1); // 1 means transition complete
  
  // When target value changes, start a new transition
  useEffect(() => {
    if (targetValue !== previousValue) {
      setPreviousValue(currentValue);
      setTransitionProgress(0);
      
      // Optional delay before starting the transition
      const delayTimer = setTimeout(() => {
        const startTime = Date.now();
        
        // Animation interval for smooth transition
        const intervalId = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Use easeOutQuad easing function for more natural transitions
          const easedProgress = 1 - Math.pow(1 - progress, 2);
          setTransitionProgress(easedProgress);
          
          // Calculate interpolated value
          const interpolatedValue = previousValue + (targetValue - previousValue) * easedProgress;
          setCurrentValue(interpolatedValue);
          
          if (progress >= 1) {
            clearInterval(intervalId);
          }
        }, 16); // ~60fps
        
        return () => clearInterval(intervalId);
      }, delay);
      
      return () => clearTimeout(delayTimer);
    }
  }, [targetValue, previousValue, currentValue, duration, delay]);
  
  return currentValue;
};
