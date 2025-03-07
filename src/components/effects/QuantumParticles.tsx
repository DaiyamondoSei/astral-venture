
import React, { useEffect, useRef, useState } from 'react';
import QuantumParticlesComponent from './quantum-particles/QuantumParticles';
import { QuantumParticlesProps } from './quantum-particles/types';
import { usePerformance } from '@/contexts/PerformanceContext';
import useVisibilityObserver from '@/hooks/useVisibilityObserver';
import { useOptimizedMemo } from '@/hooks/useOptimizedRender';
import { submitWorkerTask } from '@/utils/workerManager';

/**
 * QuantumParticles
 * 
 * A wrapper component that ensures correct prop types before passing to the
 * main implementation. Ensures count is always passed as a number.
 * Now with visibility optimization to pause animations when off-screen.
 * Uses web workers for particle calculations when available.
 */
const QuantumParticles: React.FC<QuantumParticlesProps> = (props) => {
  const { isLowPerformance, isMediumPerformance, enableParticles } = usePerformance();
  const [useWorker, setUseWorker] = useState(false);
  const workerSupported = useRef(typeof Worker !== 'undefined').current;
  
  // Add visibility observer to optimize rendering
  const { setRef, isVisible, wasEverVisible } = useVisibilityObserver({
    rootMargin: '100px',
    threshold: 0.1
  });
  
  // Check if the browser supports workers
  useEffect(() => {
    // Only enable worker for medium/high performance devices
    if (workerSupported && !isLowPerformance) {
      setUseWorker(true);
    }
  }, [workerSupported, isLowPerformance]);
  
  // Early return with null if particles are disabled
  if (!enableParticles) {
    return null;
  }
  
  // Optimize the count calculation with memoization
  const count = useOptimizedMemo(() => {
    // Safely convert count to number with fallback to default
    let particleCount = typeof props.count === 'number' 
      ? props.count 
      : props.count !== undefined && props.count !== null 
        ? parseInt(String(props.count), 10) || 30 // Added fallback if parseInt returns NaN
        : 30;

    // Scale down count based on performance profile
    if (isLowPerformance) {
      particleCount = Math.max(5, Math.floor(particleCount * 0.3));
    } else if (isMediumPerformance) {
      particleCount = Math.max(10, Math.floor(particleCount * 0.7));
    }
    
    // Further reduce count when not visible
    if (!isVisible && particleCount > 5) {
      particleCount = Math.max(5, Math.floor(particleCount * 0.3));
    }
    
    return particleCount;
  }, [props.count, isLowPerformance, isMediumPerformance, isVisible], 'particleCount');
  
  // Scale down interactive mode on low performance devices
  const interactive = isLowPerformance ? false : props.interactive;
  
  // Determine if particles should be paused
  const isPaused = props.isPaused !== undefined 
    ? props.isPaused 
    : (!isVisible && !isLowPerformance && wasEverVisible);
  
  return (
    <div ref={setRef} className="w-full h-full">
      <QuantumParticlesComponent 
        {...props} 
        count={count}
        interactive={interactive}
        isPaused={isPaused}
        useWorker={useWorker}
        workerTask={useWorker ? submitWorkerTask : undefined}
      />
    </div>
  );
};

export default React.memo(QuantumParticles);
