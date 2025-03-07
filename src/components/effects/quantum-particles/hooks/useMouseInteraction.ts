
import { useState, useEffect, RefObject } from 'react';
import { QuantumParticle } from '../types';

/**
 * Hook to handle mouse interaction with particles
 */
export function useMouseInteraction(
  particles: QuantumParticle[],
  dimensions: { width: number; height: number } | null,
  mousePosition: { x: number, y: number } | null,
  isMounted: React.MutableRefObject<boolean>
): {
  updateParticles: () => QuantumParticle[] | null;
} {
  // Skip animation frame for performance in low-end devices
  const frameCount = { current: 0 };
  const skipFrames = 2; // Only process every 3rd frame
  
  const updateParticles = () => {
    if (!isMounted.current || !particles.length || !dimensions || !mousePosition) {
      return null;
    }
    
    frameCount.current = (frameCount.current + 1) % skipFrames;
    if (frameCount.current !== 0) {
      return null;
    }
    
    const { x: mouseX, y: mouseY } = mousePosition;
    
    // Update particles based on mouse position
    return particles.map(particle => {
      // Convert percentage to actual position
      const particleX = (particle.x / 100) * dimensions.width;
      const particleY = (particle.y / 100) * dimensions.height;
      
      // Calculate distance from mouse
      const dx = mouseX - particleX;
      const dy = mouseY - particleY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Skip particles too far from mouse
      if (distance > 120) return particle;
      
      // Calculate effect strength (stronger for closer particles)
      const strength = 1 - Math.min(1, distance / 120);
      
      // Apply subtle movement away from mouse
      const offsetX = (dx / distance) * strength * -0.5;
      const offsetY = (dy / distance) * strength * -0.5;
      
      return {
        ...particle,
        vx: particle.vx + offsetX,
        vy: particle.vy + offsetY
      };
    });
  };
  
  return { updateParticles };
}
