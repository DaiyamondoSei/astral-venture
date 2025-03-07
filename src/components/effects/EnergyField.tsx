
import React, { useRef } from 'react';
import { useParticles } from './energy-field/useParticles';
import { useDimensions } from './energy-field/useDimensions';
import { useMouseTracking } from './energy-field/useMouseTracking';
import { useIsMounted } from './energy-field/useIsMounted';
import { usePerformance } from '@/contexts/PerformanceContext';
import ParticleComponent from './energy-field/ParticleComponent';
import { EnergyFieldProps } from './energy-field/types';
import BackgroundGlow from './energy-field/BackgroundGlow';
import ClickWave from './energy-field/ClickWave';
import useVisibilityObserver from '@/hooks/useVisibilityObserver';

/**
 * Enhanced EnergyField component with visibility-based optimizations
 * A performance-optimized version of InteractiveEnergyField
 */
const EnergyField: React.FC<EnergyFieldProps> = ({
  energyPoints = 100,
  colors = ['#8A5CF6', '#6366F1', '#ED64A6', '#EC4899', '#8B5CF6'],
  className = '',
  particleDensity = 1,
  reactToClick = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMounted = useIsMounted();
  const { isLowPerformance, isMediumPerformance } = usePerformance();
  
  // Scale down particleDensity based on performance profile
  let scaledDensity = particleDensity;
  if (isLowPerformance) {
    scaledDensity = Math.max(0.3, particleDensity * 0.3);
  } else if (isMediumPerformance) {
    scaledDensity = Math.max(0.6, particleDensity * 0.7);
  }
  
  // Add visibility observer to pause animations when not visible
  const { setRef, isVisible } = useVisibilityObserver({
    rootMargin: '150px', // Start animation a bit before becoming visible
    threshold: 0.1
  });
  
  // Set both refs - our container ref and the visibility observer ref
  const setContainerRef = (el: HTMLDivElement | null) => {
    containerRef.current = el;
    if (el) setRef(el);
  };
  
  const dimensions = useDimensions(containerRef);
  
  const { mousePosition, clickWave } = useMouseTracking({
    containerRef,
    isMounted: isMounted.current,
    reactToClick: reactToClick && isVisible // Only react to clicks when visible
  });
  
  const particles = useParticles({
    energyPoints,
    colors,
    particleDensity: scaledDensity,
    dimensions,
    mousePosition,
    isMounted: isMounted.current,
    isVisible
  });
  
  return (
    <div
      ref={setContainerRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      aria-label="Energy Field Visualization"
      role="img"
    >
      {dimensions && isVisible && (
        <BackgroundGlow
          energyPoints={energyPoints}
          colors={colors}
          dimensions={dimensions}
        />
      )}
      
      {isVisible && particles.map(particle => (
        <ParticleComponent key={particle.id} particle={particle} />
      ))}
      
      {clickWave && isVisible && (
        <ClickWave
          x={clickWave.x}
          y={clickWave.y}
          color={colors[Math.floor(Math.random() * colors.length)]}
        />
      )}
    </div>
  );
};

export default React.memo(EnergyField);
