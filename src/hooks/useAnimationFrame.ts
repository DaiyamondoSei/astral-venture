
import { useRef, useEffect, useState } from 'react';
import { animationScheduler } from '@/utils/animation/AnimationScheduler';
import { usePerformance } from '@/contexts/PerformanceContext';

type AnimationCallback = (time: number) => void;
type AnimationPriority = 'high' | 'medium' | 'low';

interface UseAnimationFrameOptions {
  priority?: AnimationPriority;
  interval?: number;
  enabled?: boolean;
  onCleanup?: () => void;
  skipFrames?: number;
}

/**
 * Hook for efficiently using requestAnimationFrame
 * with integrated performance optimizations
 * 
 * @param callback Function to call on each animation frame
 * @param options Configuration options
 * @returns Controls for the animation
 */
export const useAnimationFrame = (
  callback: AnimationCallback,
  options: UseAnimationFrameOptions = {}
): {
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  toggle: () => void;
} => {
  // Get performance settings
  const { isLowPerformance, isMediumPerformance } = usePerformance();
  
  // Default options based on performance level
  const {
    priority = isLowPerformance ? 'low' : isMediumPerformance ? 'medium' : 'high',
    interval = isLowPerformance ? 50 : isMediumPerformance ? 16 : 0, // ms between frames
    enabled = true,
    onCleanup = () => {},
    skipFrames = isLowPerformance ? 3 : isMediumPerformance ? 1 : 0,
  } = options;
  
  // Animation state
  const [isRunning, setIsRunning] = useState(enabled);
  const animationIdRef = useRef<string>(`animation-${Math.random().toString(36).substr(2, 9)}`);
  const skipFrameCounterRef = useRef(0);
  
  // Wrap callback to handle frame skipping
  const wrappedCallback = (time: number) => {
    if (skipFrames > 0) {
      skipFrameCounterRef.current = (skipFrameCounterRef.current + 1) % (skipFrames + 1);
      if (skipFrameCounterRef.current !== 0) {
        return;
      }
    }
    
    callback(time);
  };
  
  // Start animation
  const start = () => {
    if (isRunning) return;
    
    setIsRunning(true);
    animationScheduler.register(
      animationIdRef.current,
      wrappedCallback,
      priority,
      interval
    );
  };
  
  // Stop animation
  const stop = () => {
    if (!isRunning) return;
    
    setIsRunning(false);
    animationScheduler.unregister(animationIdRef.current);
  };
  
  // Toggle animation state
  const toggle = () => {
    if (isRunning) {
      stop();
    } else {
      start();
    }
  };
  
  // Setup and cleanup
  useEffect(() => {
    // Start animation if enabled
    if (enabled) {
      start();
    }
    
    // Cleanup on unmount
    return () => {
      if (isRunning) {
        animationScheduler.unregister(animationIdRef.current);
      }
      onCleanup();
    };
  }, [enabled]);
  
  // Handle priority or interval changes
  useEffect(() => {
    if (isRunning) {
      // Update priority by re-registering
      animationScheduler.unregister(animationIdRef.current);
      animationScheduler.register(
        animationIdRef.current,
        wrappedCallback,
        priority,
        interval
      );
    }
  }, [priority, interval]);
  
  return {
    isRunning,
    start,
    stop,
    toggle
  };
};

export default useAnimationFrame;
