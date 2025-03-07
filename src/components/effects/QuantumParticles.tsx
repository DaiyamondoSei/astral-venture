
import React from 'react';
import QuantumParticlesComponent from './quantum-particles/QuantumParticles';
import { QuantumParticlesProps } from './quantum-particles/types';

const QuantumParticles: React.FC<QuantumParticlesProps> = (props) => {
  return <QuantumParticlesComponent {...props} />;
};

export default QuantumParticles;
