
import React, { useMemo, memo, useCallback } from 'react';
import Particle from './Particle';
import useParticleSystem from './useParticleSystem';
import { QuantumParticlesProps } from './types';
import { isLowPerformanceDevice } from '@/utils/performanceUtils';

/**
 * QuantumParticles Component
 * 
 * Renders an interactive field of animated particles with optimized performance
 */
const QuantumParticles: React.FC<QuantumParticlesProps> = ({
  count = 30,
  colors = ['#8B5CF6', '#6366F1', '#4F46E5', '#A78BFA', '#C4B5FD'],
  className = '',
  interactive = true,
  speed = 1
}) => {
  // Detect if we're on a low-performance device to reduce particle count
  const isLowPerformance = useMemo(() => isLowPerformanceDevice(), []);
  
  // Adjust count for low-performance devices
  const adjustedCount = useMemo(() => 
    isLowPerformance ? Math.min(15, Number(count)) : Number(count),
  [count, isLowPerformance]);
  
  // Use memoized colors array to prevent re-creation on each render
  const particleColors = useMemo(() => colors, [colors]);
  
  // Get particles and mouse position from custom hook
  const { particles, mousePosition, containerRef } = useParticleSystem(
    adjustedCount, 
    particleColors, 
    interactive,
    speed
  );
  
  // Memoized function to calculate particle movement based on mouse position
  const calculateMovement = useCallback((x: number, y: number) => {
    if (!interactive) return { dx: 0, dy: 0 };
    
    return {
      dx: (mousePosition.x - x) / 50,
      dy: (mousePosition.y - y) / 50
    };
  }, [mousePosition, interactive]);
  
  // Use useMemo to avoid recalculating particles on every render
  const renderedParticles = useMemo(() => {
    return particles.map(particle => {
      // Convert the particle's position to the format Particle component expects
      const x = particle.position.x;
      const y = particle.position.y;
      
      // Calculate movement based on mouse position
      const { dx, dy } = calculateMovement(x, y);
      
      // Create a unique ID based on particle ID
      const particleId = parseInt(particle.id.replace(/[^0-9]/g, '0')) || 0;
      
      return (
        <Particle 
          key={particle.id} 
          particle={{
            id: particleId,
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
  }, [particles, calculateMovement]);
  
  // Add proper aria attributes for accessibility
  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
      role="presentation"
      data-testid="quantum-particles"
    >
      {renderedParticles}
    </div>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(QuantumParticles);
