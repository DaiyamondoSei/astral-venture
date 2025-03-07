
import { useRef, useEffect, useCallback } from 'react';

/**
 * Custom hook for efficiently managing requestAnimationFrame
 * with proper cleanup and FPS control
 *
 * @param callback - The animation frame callback function
 * @param enabled - Whether the animation is enabled
 * @param fps - Target frames per second (default: 60)
 */
export function useAnimationFrame(
  callback: (deltaTime: number) => void,
  enabled = true,
  fps = 60
): void {
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const fpsIntervalRef = useRef<number>(1000 / fps);
  
  const animate = useCallback((time: number) => {
    if (previousTimeRef.current === null) {
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
      return;
    }
    
    const deltaTime = time - previousTimeRef.current;
    
    // Only update if enough time has passed to maintain target FPS
    if (deltaTime > fpsIntervalRef.current) {
      callback(deltaTime);
      previousTimeRef.current = time - (deltaTime % fpsIntervalRef.current);
    }
    
    requestRef.current = requestAnimationFrame(animate);
  }, [callback, fps]);
  
  useEffect(() => {
    // Update the interval if FPS changes
    fpsIntervalRef.current = 1000 / fps;
  }, [fps]);
  
  useEffect(() => {
    if (enabled) {
      requestRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [enabled, animate]);
}

export default useAnimationFrame;
