
import React from 'react';
import QuantumParticlesComponent from './quantum-particles/QuantumParticles';
import { QuantumParticlesProps } from './quantum-particles/types';

/**
 * QuantumParticles
 * 
 * A wrapper component that ensures correct prop types before passing to the
 * main implementation. Ensures count is always passed as a number.
 */
const QuantumParticles: React.FC<QuantumParticlesProps> = (props) => {
  // Safely convert count to number with fallback to default
  const count = typeof props.count === 'number' 
    ? props.count 
    : props.count !== undefined && props.count !== null 
      ? parseInt(String(props.count), 10) || 30 // Added fallback if parseInt returns NaN
      : 30;
  
  return <QuantumParticlesComponent {...props} count={count} />;
};

export default React.memo(QuantumParticles);
