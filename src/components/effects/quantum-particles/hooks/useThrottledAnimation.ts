
import { useMemo } from 'react';
import { getAnimationQualityLevel, getDeviceCapabilities } from '@/utils/performanceUtils';

interface ThrottledAnimationProps {
  animateX: number[];
  animateY: number[];
  animateScale: number[];
  animateOpacity: number[];
  duration: number;
  delay: number;
}

interface ThrottledAnimationResult {
  animate: {
    x?: number[];
    y?: number[];
    scale?: number[];
    opacity?: number[];
  };
  transition: {
    duration: number;
    repeat: number;
    repeatType: 'reverse' | 'loop';
    delay: number;
    ease: string;
  };
}

/**
 * A hook that optimizes animations based on device capabilities
 * Returns throttled animation values for better performance
 */
export function useThrottledAnimation({
  animateX,
  animateY,
  animateScale,
  animateOpacity,
  duration,
  delay
}: ThrottledAnimationProps): ThrottledAnimationResult {
  const qualityLevel = getAnimationQualityLevel();
  const deviceCapabilities = getDeviceCapabilities();
  
  return useMemo(() => {
    // Scale down animations based on device capability and screen pixel ratio
    const pixelRatioFactor = deviceCapabilities.pixelRatio > 2 ? 1 : 0.8;
    
    // Choose animation complexity based on quality level
    switch (qualityLevel) {
      case 'low':
        // For low-end devices, only animate opacity to save resources
        return {
          animate: {
            opacity: animateOpacity
          },
          transition: {
            duration: duration * 1.5, // Slower animations
            repeat: Infinity,
            repeatType: 'reverse',
            delay: delay * 1.5,
            ease: 'linear'
          }
        };
        
      case 'medium':
        // For medium devices, animate opacity and scale but skip position
        return {
          animate: {
            scale: animateScale,
            opacity: animateOpacity
          },
          transition: {
            duration: duration * 1.2,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: delay * 1.2,
            ease: 'easeInOut'
          }
        };
        
      case 'high':
      default:
        // For high-end devices, use all animations with adaptive quality
        return {
          animate: {
            x: deviceCapabilities.pixelRatio > 1 ? animateX : undefined,
            y: deviceCapabilities.pixelRatio > 1 ? animateY : undefined,
            scale: animateScale.map(s => s * pixelRatioFactor),
            opacity: animateOpacity
          },
          transition: {
            duration: duration * pixelRatioFactor,
            repeat: Infinity,
            repeatType: 'reverse',
            delay,
            ease: 'easeInOut'
          }
        };
    }
  }, [animateX, animateY, animateScale, animateOpacity, duration, delay, qualityLevel, deviceCapabilities.pixelRatio]);
}
