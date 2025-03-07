
import React from 'react';
import QuantumParticlesComponent from './quantum-particles/QuantumParticles';
import { QuantumParticlesProps } from './quantum-particles/types';

const QuantumParticles: React.FC<QuantumParticlesProps> = (props) => {
  // Ensure count is passed as a number
  const count = typeof props.count === 'number' ? props.count : props.count ? parseInt(props.count.toString()) : 30;
  
  return <QuantumParticlesComponent {...props} count={count} />;
};

export default QuantumParticles;
