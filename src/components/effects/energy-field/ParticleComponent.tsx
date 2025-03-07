
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ParticleProps } from './types';
import { usePerformance } from '@/contexts/PerformanceContext';

const ParticleComponent: React.FC<ParticleProps> = ({ particle }) => {
  // Get performance context to adjust rendering quality
  const { isLowPerformance, isMediumPerformance } = usePerformance();
  
  // Memoize the style to prevent recalculation on every render
  const particleStyle = useMemo(() => {
    // Reduce shadow effects for low/medium performance devices
    const shadowSize = isLowPerformance 
      ? 0 // No shadow for low performance
      : isMediumPerformance 
        ? particle.size // Smaller shadow for medium performance
        : particle.size * 2; // Full shadow for high performance
        
    return {
      width: `${particle.size}px`,
      height: `${particle.size}px`,
      backgroundColor: particle.color,
      boxShadow: shadowSize ? `0 0 ${shadowSize}px ${particle.color}` : 'none',
      // Add will-change for better performance
      willChange: 'transform, opacity',
      // Add visibility when needed to improve performance
      visibility: particle.opacity <= 0.1 ? 'hidden' : 'visible',
    };
  }, [particle.size, particle.color, particle.opacity, isLowPerformance, isMediumPerformance]);

  // Skip rendering nearly invisible particles to reduce DOM nodes
  if (particle.opacity < 0.1) return null;

  // Reduce animation properties for low-performance devices
  const animateProps = isLowPerformance
    ? {
        left: `${particle.x}px`,
        top: `${particle.y}px`,
        // Skip opacity animation for low-performance devices
      }
    : {
        left: `${particle.x}px`,
        top: `${particle.y}px`,
        opacity: particle.opacity,
      };

  return (
    <motion.div
      key={particle.id}
      className="absolute rounded-full pointer-events-none"
      animate={animateProps}
      transition={{
        duration: isLowPerformance ? 0.3 : 0.5,
        ease: "linear",
        // Disable exit animations for better performance
        exit: { duration: 0 }
      }}
      style={particleStyle}
      // Set layout=false to prevent layout animations
      layout={false}
    />
  );
};

// Memoize the component to prevent unnecessary re-renders
export default React.memo(ParticleComponent);
