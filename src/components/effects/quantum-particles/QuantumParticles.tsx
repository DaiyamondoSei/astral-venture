
import React from 'react';
import Particle from './Particle';
import { useParticleSystem } from './useParticleSystem';
import { QuantumParticlesProps } from './types';

const QuantumParticles: React.FC<QuantumParticlesProps> = ({
  count = 30,
  colors = ['#8B5CF6', '#6366F1', '#4F46E5', '#A78BFA', '#C4B5FD'],
  className = '',
  interactive = true
}) => {
  const { particles, mousePosition } = useParticleSystem(count, colors, interactive);
  
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map(particle => {
        // Calculate movement based on mouse position if interactive
        const dx = interactive ? (mousePosition.x - particle.x) / 50 : 0;
        const dy = interactive ? (mousePosition.y - particle.y) / 50 : 0;
        
        return (
          <Particle 
            key={particle.id} 
            particle={particle} 
            dx={dx} 
            dy={dy}
          />
        );
      })}
    </div>
  );
};

export default QuantumParticles;
