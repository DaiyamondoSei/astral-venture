
import { useMemo } from 'react';
import { getAnimationQualityLevel } from '@/utils/performanceUtils';

interface AnimationProps {
  animateX: number[];
  animateY: number[];
  animateScale: number[];
  animateOpacity: number[];
  duration: number;
  delay: number;
}

/**
 * Custom hook to optimize animations based on device performance
 */
export const useThrottledAnimation = ({
  animateX,
  animateY,
  animateScale,
  animateOpacity,
  duration,
  delay
}: AnimationProps) => {
  // Get animation quality based on device capabilities
  const qualityLevel = useMemo(() => getAnimationQualityLevel(), []);
  
  return useMemo(() => {
    // Simplify animations for low-performance devices
    if (qualityLevel === 'low') {
      return {
        animate: {
          scale: [1, 1.1, 1],
          opacity: animateOpacity
        },
        transition: {
          repeat: Infinity,
          repeatType: "reverse" as const,
          duration: duration * 1.5, // Slower animations
          delay: delay,
          ease: "linear" as const
        }
      };
    }
    
    // Medium quality animations
    if (qualityLevel === 'medium') {
      return {
        animate: {
          x: animateX.map(val => val * 0.7), // Reduced movement
          y: animateY.map(val => val * 0.7),
          scale: animateScale
        },
        transition: {
          repeat: Infinity,
          repeatType: "reverse" as const,
          duration: duration * 1.2,
          delay: delay,
          ease: "easeInOut" as const
        }
      };
    }
    
    // Full quality animations
    return {
      animate: {
        x: animateX,
        y: animateY,
        scale: animateScale,
        opacity: animateOpacity,
      },
      transition: {
        repeat: Infinity,
        repeatType: "reverse" as const,
        duration: duration,
        delay: delay,
        ease: "easeInOut" as const
      }
    };
  }, [animateX, animateY, animateScale, animateOpacity, duration, delay, qualityLevel]);
};
