
import { useState, useEffect, useRef } from 'react';
import { Particle } from './types';

interface UseParticlesProps {
  energyPoints: number;
  colors: string[];
  particleDensity: number;
  dimensions: { width: number; height: number } | null;
  mousePosition: { x: number; y: number } | null;
  isMounted: boolean;
}

export function useParticles({
  energyPoints,
  colors,
  particleDensity,
  dimensions,
  mousePosition,
  isMounted
}: UseParticlesProps) {
  // Store particles in state
  const [particles, setParticles] = useState<Particle[]>([]);
  
  // Use ref to track previous dimensions to avoid unnecessary recreations
  const prevDimensionsRef = useRef<{ width: number; height: number } | null>(null);
  
  // Use ref to track dependency changes that should trigger particle recreation
  const particleConfigRef = useRef({
    energyPoints,
    colors,
    particleDensity
  });
  
  // Create particles once dimensions are available or when particle configuration changes significantly
  useEffect(() => {
    // Skip if we don't have dimensions yet or if component is not mounted
    if (!dimensions || !isMounted) return;
    
    // Check if we need to recreate particles by comparing with previous config
    const needsRecreation = 
      particleConfigRef.current.energyPoints !== energyPoints ||
      particleConfigRef.current.particleDensity !== particleDensity ||
      particleConfigRef.current.colors.join() !== colors.join() ||
      !prevDimensionsRef.current ||
      dimensions.width !== prevDimensionsRef.current.width ||
      dimensions.height !== prevDimensionsRef.current.height;
    
    if (!needsRecreation) return;
    
    // Update refs with current values
    particleConfigRef.current = {
      energyPoints,
      colors,
      particleDensity
    };
    prevDimensionsRef.current = dimensions;
    
    // Calculate number of particles based on energy points and density
    const particleCount = Math.max(5, Math.min(50, Math.floor(energyPoints / 100) * particleDensity));
    
    // Create new particles
    const newParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      newParticles.push(createParticle(i, dimensions, colors));
    }
    
    setParticles(newParticles);
    
  }, [dimensions, energyPoints, colors, particleDensity, isMounted]);
  
  // Update particles based on mouse position
  useEffect(() => {
    if (!mousePosition || !dimensions || particles.length === 0) return;
    
    const mouseX = mousePosition.x;
    const mouseY = mousePosition.y;
    
    // Skip updates if mouse is outside container
    if (mouseX < 0 || mouseX > dimensions.width || mouseY < 0 || mouseY > dimensions.height) return;
    
    // Throttle mouse-based updates for performance
    const updateInterval = window.requestAnimationFrame(() => {
      setParticles(prevParticles => {
        return prevParticles.map(particle => {
          // Calculate distance from mouse
          const dx = mouseX - (dimensions.width * (particle.x / 100));
          const dy = mouseY - (dimensions.height * (particle.y / 100));
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Only update particles within interaction range
          if (distance > 150) return particle;
          
          // Calculate repulsion force (stronger for closer particles)
          const force = Math.max(0.1, 1 - distance / 150);
          
          // Update velocity based on force
          const updatedVx = particle.vx - (dx / distance) * force * 0.2;
          const updatedVy = particle.vy - (dy / distance) * force * 0.2;
          
          return {
            ...particle,
            vx: updatedVx,
            vy: updatedVy
          };
        });
      });
    });
    
    // Clean up animation frame on unmount
    return () => window.cancelAnimationFrame(updateInterval);
  }, [mousePosition, dimensions, particles]);
  
  // Create a new particle with random properties
  function createParticle(id: number, dimensions: {width: number, height: number}, colors: string[]): Particle {
    return {
      id,
      x: Math.random() * 100, // percentage position
      y: Math.random() * 100, // percentage position
      size: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 0.1,
      vy: (Math.random() - 0.5) * 0.1,
      opacity: Math.random() * 0.5 + 0.2
    };
  }
  
  return particles;
}
