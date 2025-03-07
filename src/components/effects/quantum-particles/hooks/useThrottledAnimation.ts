
import { useEffect, useMemo } from 'react';
import { usePerformance } from '@/contexts/PerformanceContext';

interface AnimationConfig {
  animateX?: number[];
  animateY?: number[];
  animateScale?: number[];
  animateOpacity?: number[];
  duration?: number;
  delay?: number;
}

interface AnimationResult {
  animate: {
    x?: number[];
    y?: number[];
    scale?: number[];
    opacity?: number[];
  };
  transition: {
    duration: number;
    delay: number;
    repeat?: number;
    repeatType?: "mirror" | "loop";
  };
}

/**
 * Hook that provides throttled animations based on device performance
 */
export function useThrottledAnimation(config: AnimationConfig): AnimationResult {
  const { isLowPerformance, isMediumPerformance, enableComplexAnimations } = usePerformance();
  
  // Calculate adjusted animation parameters
  return useMemo(() => {
    // Determine if animations should be simplified
    const shouldSimplify = isLowPerformance || !enableComplexAnimations;
    
    // Create simplified or full animations
    const animateObj: AnimationResult['animate'] = {};
    
    if (config.animateX) {
      animateObj.x = shouldSimplify 
        ? [config.animateX[0], config.animateX[config.animateX.length - 1]] 
        : config.animateX;
    }
    
    if (config.animateY) {
      animateObj.y = shouldSimplify 
        ? [config.animateY[0], config.animateY[config.animateY.length - 1]] 
        : config.animateY;
    }
    
    if (config.animateScale) {
      animateObj.scale = shouldSimplify 
        ? [config.animateScale[0]] 
        : config.animateScale;
    }
    
    if (config.animateOpacity) {
      animateObj.opacity = shouldSimplify 
        ? [config.animateOpacity[0]] 
        : config.animateOpacity;
    }
    
    // Adjust duration based on device capability
    let adjustedDuration = config.duration || 2.0;
    if (shouldSimplify) {
      adjustedDuration = Math.max(0.3, adjustedDuration * 0.6);
    } else if (isMediumPerformance) {
      adjustedDuration = Math.max(0.5, adjustedDuration * 0.8);
    }
    
    return {
      animate: animateObj,
      transition: {
        duration: adjustedDuration,
        delay: config.delay || 0,
        repeat: shouldSimplify ? 0 : Infinity,
        repeatType: "mirror"
      }
    };
  }, [isLowPerformance, isMediumPerformance, enableComplexAnimations, config]);
}
