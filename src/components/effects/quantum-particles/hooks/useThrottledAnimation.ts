import { useRef, useEffect, useCallback } from 'react';
import { detectDeviceCapabilities } from '@/utils/performanceUtils';

/**
 * Configuration options for the throttled animation
 */
interface ThrottledAnimationOptions {
  // Target frames per second
  targetFps?: number;
  
  // Whether to enable adaptive throttling based on device capabilities
  adaptive?: boolean;
  
  // Whether to prioritize smoothness over power saving
  prioritizeSmoothness?: boolean;
  
  // Enable debug logging
  debug?: boolean;
}

/**
 * Animation frame data for performance tracking
 */
interface AnimationFrameData {
  frameCount: number;
  lastFpsUpdate: number;
  currentFps: number;
  targetFrameTime: number;
  skippedFrames: number;
  actualFps: number[];
}

/**
 * Custom hook for throttling animations to a target frame rate
 * with adaptive capabilities based on device performance
 */
export function useThrottledAnimation(
  callback: (deltaTime: number) => void,
  options: ThrottledAnimationOptions = {}
) {
  // Default options with fallbacks
  const {
    targetFps = 30,
    adaptive = true,
    prioritizeSmoothness = false,
    debug = false
  } = options;
  
  // Get device capabilities
  const deviceCapabilities = detectDeviceCapabilities();
  
  // Adjust target fps based on device capabilities if adaptive mode is enabled
  const adjustedTargetFps = useRef(
    adaptive ? (
      deviceCapabilities.performanceGrade === 'high' ? 60 :
      deviceCapabilities.performanceGrade === 'medium' ? 30 : 
      20
    ) : targetFps
  );
  
  // Calculate frame time in milliseconds
  const targetFrameTime = useRef(1000 / adjustedTargetFps.current);
  
  // References for animation state
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const accumulatedTimeRef = useRef<number>(0);
  
  // Performance tracking references
  const frameDataRef = useRef<AnimationFrameData>({
    frameCount: 0,
    lastFpsUpdate: 0,
    currentFps: 0,
    targetFrameTime: targetFrameTime.current,
    skippedFrames: 0,
    actualFps: []
  });
  
  // Function to determine whether to run the frame based on accumulated time
  const shouldRunFrame = useCallback((deltaTime: number): boolean => {
    // If prioritizing smoothness, run every frame on high performance devices
    if (prioritizeSmoothness && deviceCapabilities.performanceGrade === 'high') {
      return true;
    }
    
    // Otherwise, accumulate time and check if we've reached the target frame time
    accumulatedTimeRef.current += deltaTime;
    if (accumulatedTimeRef.current >= targetFrameTime.current) {
      accumulatedTimeRef.current -= targetFrameTime.current;
      return true;
    }
    
    // Skip this frame
    frameDataRef.current.skippedFrames++;
    return false;
  }, [prioritizeSmoothness, deviceCapabilities.performanceGrade]);
  
  // Animation loop function with throttling
  const animateFrame = useCallback((time: number) => {
    if (previousTimeRef.current === null) {
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animateFrame);
      return;
    }
    
    const deltaTime = time - previousTimeRef.current;
    previousTimeRef.current = time;
    
    // Update FPS counter
    frameDataRef.current.frameCount++;
    if (time - frameDataRef.current.lastFpsUpdate >= 1000) { // Update FPS every second
      frameDataRef.current.currentFps = Math.round(
        (frameDataRef.current.frameCount * 1000) / (time - frameDataRef.current.lastFpsUpdate)
      );
      frameDataRef.current.actualFps.push(frameDataRef.current.currentFps);
      if (frameDataRef.current.actualFps.length > 10) {
        frameDataRef.current.actualFps.shift();
      }
      
      if (debug) {
        console.log(
          `FPS: ${frameDataRef.current.currentFps} | ` +
          `Target: ${adjustedTargetFps.current} | ` +
          `Skipped frames: ${frameDataRef.current.skippedFrames} | ` +
          `Device: ${deviceCapabilities.performanceGrade} | ` +
          `DPR: ${deviceCapabilities.devicePixelRatio}`
        );
      }
      
      frameDataRef.current.frameCount = 0;
      frameDataRef.current.lastFpsUpdate = time;
      frameDataRef.current.skippedFrames = 0;
    }
    
    // Run the animation callback if it's time for a frame
    if (shouldRunFrame(deltaTime)) {
      callback(deltaTime);
    }
    
    // Schedule next frame
    requestRef.current = requestAnimationFrame(animateFrame);
  }, [callback, shouldRunFrame, debug, deviceCapabilities.performanceGrade, deviceCapabilities.devicePixelRatio]);
  
  // Setup and cleanup animation loop
  useEffect(() => {
    requestRef.current = requestAnimationFrame(animateFrame);
    
    // Cleanup function to cancel animation frame on unmount
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [animateFrame]);
  
  // Return current FPS for external monitoring
  return {
    currentFps: frameDataRef.current.currentFps,
    targetFps: adjustedTargetFps.current
  };
}

export default useThrottledAnimation;
