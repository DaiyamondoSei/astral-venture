
import React from 'react';
import QuantumParticlesComponent from './quantum-particles/QuantumParticles';
import { QuantumParticlesProps } from './quantum-particles/types';
import { usePerformance } from '@/contexts/PerformanceContext';
import useVisibilityObserver from '@/hooks/useVisibilityObserver';

/**
 * QuantumParticles
 * 
 * A wrapper component that ensures correct prop types before passing to the
 * main implementation. Ensures count is always passed as a number.
 * Now with visibility optimization to pause animations when off-screen.
 */
const QuantumParticles: React.FC<QuantumParticlesProps> = (props) => {
  const { isLowPerformance, isMediumPerformance, enableParticles } = usePerformance();
  
  // Add visibility observer to optimize rendering
  const { setRef, isVisible } = useVisibilityObserver({
    rootMargin: '100px',
    threshold: 0.1
  });
  
  // Early return with null if particles are disabled
  if (!enableParticles) {
    return null;
  }
  
  // Safely convert count to number with fallback to default
  let count = typeof props.count === 'number' 
    ? props.count 
    : props.count !== undefined && props.count !== null 
      ? parseInt(String(props.count), 10) || 30 // Added fallback if parseInt returns NaN
      : 30;

  // Scale down count based on performance profile
  if (isLowPerformance) {
    count = Math.max(5, Math.floor(count * 0.3));
  } else if (isMediumPerformance) {
    count = Math.max(10, Math.floor(count * 0.7));
  }
  
  // Further reduce count when not visible
  if (!isVisible && count > 5) {
    count = Math.max(5, Math.floor(count * 0.3));
  }
  
  // Scale down interactive mode on low performance devices
  const interactive = isLowPerformance ? false : props.interactive;
  
  return (
    <div ref={setRef} className="w-full h-full">
      <QuantumParticlesComponent 
        {...props} 
        count={count}
        interactive={interactive}
        isPaused={!isVisible && !isLowPerformance} // Pause when not visible, except on low perf devices where we already reduced count
      />
    </div>
  );
};

export default React.memo(QuantumParticles);
