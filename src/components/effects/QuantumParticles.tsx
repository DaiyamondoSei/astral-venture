
import React from 'react';
import QuantumParticlesComponent from './quantum-particles/QuantumParticles';
import { QuantumParticlesProps } from './quantum-particles/types';
import { usePerformance } from '@/contexts/PerformanceContext';

/**
 * QuantumParticles
 * 
 * A wrapper component that ensures correct prop types before passing to the
 * main implementation. Ensures count is always passed as a number.
 */
const QuantumParticles: React.FC<QuantumParticlesProps> = (props) => {
  const { isLowPerformance, isMediumPerformance, enableParticles } = usePerformance();
  
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
  
  // Scale down interactive mode on low performance devices
  const interactive = isLowPerformance ? false : props.interactive;
  
  return (
    <QuantumParticlesComponent 
      {...props} 
      count={count}
      interactive={interactive}
    />
  );
};

export default React.memo(QuantumParticles);
