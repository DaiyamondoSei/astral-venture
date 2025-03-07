
import React, { useRef, useCallback } from 'react';
import { useDimensions } from './useDimensions';
import { useIsMounted } from './useIsMounted';
import { useMouseTracking } from './useMouseTracking';
import { useParticles } from './useParticles';
import ParticleComponent from './ParticleComponent';
import ClickWave from './ClickWave';
import BackgroundGlow from './BackgroundGlow';
import { getOptimalElementCount } from '@/utils/performanceUtils';

interface InteractiveEnergyFieldProps {
  energyPoints: number;
  colors?: string[];
  particleDensity?: number;
  reactToMouse?: boolean;
  className?: string;
}

const InteractiveEnergyField: React.FC<InteractiveEnergyFieldProps> = ({
  energyPoints,
  colors = ['#8b5cf6', '#6366f1', '#ec4899', '#0ea5e9', '#22d3ee'],
  particleDensity = 1.5,
  reactToMouse = true,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useIsMounted();
  
  // Get container dimensions
  const dimensions = useDimensions(containerRef);
  
  // Track mouse movements and clicks
  const { mousePosition, clickWave } = useMouseTracking({
    containerRef,
    isMounted: isMountedRef.current, // Fixed: Passing the boolean value, not the ref
    reactToClick: reactToMouse
  });
  
  // Calculate optimal particle density based on device capabilities
  const adjustedDensity = getOptimalElementCount(
    Math.ceil(particleDensity), 
    'medium'
  ) / 10;
  
  // Create and update particles
  const particles = useParticles({
    energyPoints,
    colors,
    particleDensity: adjustedDensity,
    dimensions,
    mousePosition,
    isMounted: isMountedRef.current // Fixed: Passing the boolean value, not the ref
  });
  
  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden rounded-lg w-full h-full ${className}`}
      aria-hidden="true"
    >
      {/* Background glow */}
      <BackgroundGlow 
        energyPoints={energyPoints} 
        colors={colors} 
        dimensions={dimensions} 
      />
      
      {/* Render particles */}
      {particles.map(particle => (
        <ParticleComponent 
          key={`energy-particle-${particle.id}`}
          particle={particle}
        />
      ))}
      
      {/* Render click wave if active */}
      {clickWave && clickWave.active && (
        <ClickWave 
          x={clickWave.x}
          y={clickWave.y}
          color={colors[Math.floor(Math.random() * colors.length)]}
        />
      )}
    </div>
  );
};

export default React.memo(InteractiveEnergyField);
