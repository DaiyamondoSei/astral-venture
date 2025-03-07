
import React, { useRef } from 'react';
import { useParticles } from './useParticles';
import { useDimensions } from './useDimensions';
import { useMouseTracking } from './useMouseTracking';
import { useIsMounted } from './useIsMounted';
import ParticleComponent from './ParticleComponent';
import { EnergyFieldProps } from './types';
import BackgroundGlow from './BackgroundGlow';
import ClickWave from './ClickWave';
import useVisibilityObserver from '@/hooks/useVisibilityObserver';

const InteractiveEnergyField: React.FC<EnergyFieldProps> = ({
  energyPoints = 100,
  colors = ['#8A5CF6', '#6366F1', '#ED64A6', '#EC4899', '#8B5CF6'],
  className = '',
  particleDensity = 1,
  reactToClick = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMounted = useIsMounted();
  const dimensions = useDimensions(containerRef);
  
  // Add visibility observer to pause animations when not visible
  const { setRef, isVisible } = useVisibilityObserver({
    rootMargin: '100px', // Start animation slightly before becoming visible
    threshold: 0.1
  });
  
  // Set both refs - our container ref and the visibility observer ref
  const setContainerRef = (el: HTMLDivElement | null) => {
    containerRef.current = el;
    if (el) setRef(el);
  };
  
  const { mousePosition, clickWave } = useMouseTracking({
    containerRef,
    isMounted: isMounted.current,
    reactToClick
  });
  
  const particles = useParticles({
    energyPoints,
    colors,
    particleDensity,
    dimensions,
    mousePosition,
    isMounted: isMounted.current,
    isVisible
  });
  
  return (
    <div
      ref={setContainerRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      aria-label="Interactive Energy Field"
      role="img"
    >
      {dimensions && (
        <BackgroundGlow
          energyPoints={energyPoints}
          colors={colors}
          dimensions={dimensions}
        />
      )}
      
      {particles.map(particle => (
        <ParticleComponent key={particle.id} particle={particle} />
      ))}
      
      {clickWave && (
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
