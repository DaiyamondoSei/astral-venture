import { useState, useEffect, useCallback, useRef } from 'react';
import { usePerformance } from '@/contexts/PerformanceContext';

export interface UseMeditationTimerProps {
  duration?: number; // Duration in minutes
  onComplete?: () => void;
  onProgress?: (progress: number) => void;
  chakraFocus?: string[];
  allowBackgroundRunning?: boolean;
}

export function useMeditationTimer({
  duration = 10,
  onComplete,
  onProgress,
  chakraFocus = [],
  allowBackgroundRunning = false
}: UseMeditationTimerProps = {}) {
  // Convert duration to seconds
  const totalSeconds = duration * 60;
  
  // States
  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(totalSeconds);
  const [progress, setProgress] = useState(0);
  
  // Refs for keeping track across renders
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(totalSeconds);
  
  // Performance monitoring
  const { trackMetric } = usePerformance();
  
  // Start the timer
  const start = useCallback(() => {
    // Don't start if already running
    if (isRunning) return;
    
    // Record metrics
    trackMetric('MeditationTimer', 'start', timeRemaining);
    
    // Track start time
    startTimeRef.current = Date.now();
    
    // Start the timer
    setIsRunning(true);
    
    // Clear any existing timer
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }
    
    // Setup interval
    timerRef.current = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - (startTimeRef.current || 0)) / 1000);
      const newTimeRemaining = Math.max(0, pausedTimeRef.current - elapsed);
      
      setTimeRemaining(newTimeRemaining);
      
      const newProgress = 1 - newTimeRemaining / totalSeconds;
      setProgress(newProgress);
      
      // Call onProgress callback
      if (onProgress) {
        onProgress(newProgress);
      }
      
      // Check if timer is complete
      if (newTimeRemaining === 0) {
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setIsRunning(false);
        
        // Call onComplete callback
        if (onComplete) {
          onComplete();
        }
        
        // Record completion metric
        trackMetric('MeditationTimer', 'complete', totalSeconds);
      }
    }, 1000);
    
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [isRunning, timeRemaining, totalSeconds, onProgress, onComplete, trackMetric]);
  
  // Pause the timer
  const pause = useCallback(() => {
    // Don't pause if not running
    if (!isRunning) return;
    
    // Clear the interval
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Update the paused time
    pausedTimeRef.current = timeRemaining;
    
    // Update state
    setIsRunning(false);
    
    // Record metrics
    trackMetric('MeditationTimer', 'pause', timeRemaining);
  }, [isRunning, timeRemaining, trackMetric]);
  
  // Reset the timer
  const reset = useCallback(() => {
    // Clear any existing timer
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Reset state
    setIsRunning(false);
    setTimeRemaining(totalSeconds);
    setProgress(0);
    pausedTimeRef.current = totalSeconds;
    
    // Record metrics
    trackMetric('MeditationTimer', 'reset', timeRemaining);
  }, [totalSeconds, timeRemaining, trackMetric]);
  
  // Handle visibility change (for background running)
  useEffect(() => {
    if (!allowBackgroundRunning) {
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden' && isRunning) {
          pause();
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
    
    return undefined;
  }, [isRunning, pause, allowBackgroundRunning]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);
  
  return {
    isRunning,
    timeRemaining,
    progress,
    start,
    pause,
    reset,
    duration: totalSeconds,
    chakraFocus
  };
}
