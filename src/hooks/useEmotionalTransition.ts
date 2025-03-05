
import { useState, useEffect, useRef } from 'react';

type EasingFunction = (t: number) => number;

const easingFunctions = {
  // Standard easing functions
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => 1 - (1 - t) * (1 - t),
  easeInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  
  // More expressive easings
  easeOutBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  
  // Special easings for emotional transitions
  emotionalRise: (t: number) => {
    // Custom easing that starts slow, accelerates, then gracefully finishes
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  },
  
  emotionalFall: (t: number) => {
    // Custom easing that starts fast and then gently slows down
    return 1 - Math.pow(1 - t, 3);
  }
};

/**
 * Enhanced hook that smoothly transitions between emotional states or values
 * with customizable easing and animation behavior
 * 
 * @param targetValue - The target value to transition to
 * @param options - Transition options
 * @returns Current interpolated value during the transition
 */
export const useEmotionalTransition = (
  targetValue: number,
  options: {
    duration?: number; 
    delay?: number;
    easing?: keyof typeof easingFunctions | EasingFunction;
    immediate?: boolean;
  } = {}
): number => {
  const { 
    duration = 1500,
    delay = 0,
    easing = "emotionalRise",
    immediate = false
  } = options;
  
  const [currentValue, setCurrentValue] = useState(immediate ? targetValue : 0);
  const [previousValue, setPreviousValue] = useState(immediate ? targetValue : 0);
  const [transitionProgress, setTransitionProgress] = useState(immediate ? 1 : 0);
  
  // Store the animation frame request ID for cleanup
  const animationRef = useRef<number | null>(null);
  
  // Get easing function
  const getEasingFunction = (easing: keyof typeof easingFunctions | EasingFunction): EasingFunction => {
    if (typeof easing === 'function') return easing;
    return easingFunctions[easing] || easingFunctions.emotionalRise;
  };
  
  // When target value changes, start a new transition
  useEffect(() => {
    if (targetValue !== previousValue) {
      // Store current value as the starting point
      setPreviousValue(currentValue);
      setTransitionProgress(0);
      
      // Clean up any existing animation
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // Optional delay before starting the transition
      const delayTimer = setTimeout(() => {
        const startTime = Date.now();
        const easingFn = getEasingFunction(easing);
        
        // Animation function for smooth transition
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const rawProgress = Math.min(elapsed / duration, 1);
          
          // Apply easing function for more natural transitions
          const easedProgress = easingFn(rawProgress);
          setTransitionProgress(easedProgress);
          
          // Calculate interpolated value
          const interpolatedValue = previousValue + (targetValue - previousValue) * easedProgress;
          setCurrentValue(interpolatedValue);
          
          if (rawProgress < 1) {
            animationRef.current = requestAnimationFrame(animate);
          } else {
            // Ensure we land exactly on target value
            setCurrentValue(targetValue);
            animationRef.current = null;
          }
        };
        
        // Start animation
        animationRef.current = requestAnimationFrame(animate);
      }, delay);
      
      return () => {
        clearTimeout(delayTimer);
        if (animationRef.current !== null) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [targetValue, previousValue, currentValue, duration, delay, easing]);
  
  return currentValue;
};

export default useEmotionalTransition;
