
import React, { useMemo, memo } from 'react';
import Particle from './Particle';
import useParticleSystem from './useParticleSystem';
import { QuantumParticlesProps } from './types';

const QuantumParticles: React.FC<QuantumParticlesProps> = ({
  count = 30,
  colors = ['#8B5CF6', '#6366F1', '#4F46E5', '#A78BFA', '#C4B5FD'],
  className = '',
  interactive = true
}) => {
  const { particles, mousePosition, containerRef } = useParticleSystem(count, colors, interactive);
  
  // Use useMemo to avoid recalculating particles on every render
  const renderedParticles = useMemo(() => {
    return particles.map(particle => {
      // Convert the particle's position to the format Particle component expects
      const x = particle.position.x;
      const y = particle.position.y;
      
      // Calculate movement based on mouse position if interactive
      const dx = interactive ? (mousePosition.x - x) / 50 : 0;
      const dy = interactive ? (mousePosition.y - y) / 50 : 0;
      
      return (
        <Particle 
          key={particle.id} 
          particle={{
            id: parseInt(particle.id.replace(/[^0-9]/g, '')) || 0,
            x,
            y,
            size: particle.size,
            opacity: particle.alpha,
            color: particle.color,
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 2
          }} 
          dx={dx} 
          dy={dy}
        />
      );
    });
  }, [particles, mousePosition, interactive]);
  
  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {renderedParticles}
    </div>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(QuantumParticles);
