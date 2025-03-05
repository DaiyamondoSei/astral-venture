
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
  },
  
  // New emotional easings for more nuanced transitions
  emotionalPulse: (t: number) => {
    // Creates a slight pulse effect in the middle of the transition
    const p = t * 2 - 1;
    return 0.5 * (p * p * p + 1) + 0.1 * Math.sin(t * Math.PI * 2);
  },
  
  emotionalBreath: (t: number) => {
    // Mimics the natural rhythm of breathing for a calming effect
    return t < 0.5 
      ? 0.5 * Math.pow(2 * t, 2) 
      : 0.5 * (1 - Math.pow(-2 * t + 2, 2) + 1);
  },
  
  emotionalResonance: (t: number) => {
    // Creates a resonant wave pattern for spiritual transitions
    return t + 0.05 * Math.sin(t * Math.PI * 4);
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
    onComplete?: () => void;
  } = {}
): number => {
  const { 
    duration = 1500,
    delay = 0,
    easing = "emotionalRise",
    immediate = false,
    onComplete
  } = options;
  
  const [currentValue, setCurrentValue] = useState(immediate ? targetValue : 0);
  const [previousValue, setPreviousValue] = useState(immediate ? targetValue : 0);
  const [transitionProgress, setTransitionProgress] = useState(immediate ? 1 : 0);
  
  // Store the animation frame request ID for cleanup
  const animationRef = useRef<number | null>(null);
  
  // Store onComplete callback in ref to avoid dependency changes
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);
  
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
            
            // Execute completion callback if provided
            if (onCompleteRef.current) {
              onCompleteRef.current();
            }
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
  
  // Detect and handle reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleReducedMotionChange = () => {
      if (mediaQuery.matches && animationRef.current !== null) {
        // If reduced motion is preferred, cancel the animation and jump to the end
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
        setCurrentValue(targetValue);
        
        // Execute completion callback if provided
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
      }
    };
    
    // Check initially
    handleReducedMotionChange();
    
    // Listen for changes
    mediaQuery.addEventListener('change', handleReducedMotionChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleReducedMotionChange);
    };
  }, [targetValue]);
  
  return currentValue;
};

export default useEmotionalTransition;
