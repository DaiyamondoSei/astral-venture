
import React, { useRef } from 'react';
import { EnergyFieldProps } from './types';
import ParticleComponent from './ParticleComponent';
import BackgroundGlow from './BackgroundGlow';
import ClickWave from './ClickWave';
import { useParticles } from './useParticles';
import { useMouseTracking } from './useMouseTracking';
import { useDimensions } from './useDimensions';
import { useIsMounted } from './useIsMounted';

const InteractiveEnergyField: React.FC<EnergyFieldProps> = ({
  energyPoints = 100,
  colors = ['#8B5CF6', '#6366F1', '#4F46E5', '#A78BFA', '#C4B5FD'],
  className = '',
  particleDensity = 1,
  reactToClick = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMounted = useIsMounted();
  const dimensions = useDimensions(containerRef);
  const { mousePosition, clickWave } = useMouseTracking({ 
    containerRef, 
    isMounted,
    reactToClick 
  });
  
  const particles = useParticles({
    energyPoints,
    colors,
    particleDensity,
    dimensions,
    mousePosition,
    isMounted
  });
  
  return (
    <div 
      ref={containerRef} 
      className={`relative overflow-hidden ${className}`}
      style={{ minHeight: '200px' }}
    >
      {/* Render particles */}
      {particles.map(particle => (
        <ParticleComponent key={particle.id} particle={particle} />
      ))}
      
      {/* Render click wave effect */}
      <ClickWave clickWave={clickWave} />
      
      {/* Add subtle glow effect in the center */}
      <BackgroundGlow colors={colors} dimensions={dimensions} />
    </div>
  );
};

export default React.memo(InteractiveEnergyField);
