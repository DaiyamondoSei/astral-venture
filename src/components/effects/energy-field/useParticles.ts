
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

export const useParticles = ({
  energyPoints,
  colors,
  particleDensity,
  dimensions,
  mousePosition,
  isMounted
}: UseParticlesProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  
  // Initialize particles
  useEffect(() => {
    if (!dimensions || !isMounted) return;
    
    // Calculate number of particles based on energy points and density
    const baseCount = Math.min(75, Math.ceil(energyPoints / 30)) * particleDensity;
    const count = Math.max(10, Math.min(baseCount, 150)); // Cap between 10-150 particles
    
    const newParticles: Particle[] = Array.from({ length: count }).map((_, index) => {
      return {
        id: `p-${index}`,
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        size: Math.random() * 5 + 2,
        speed: Math.random() * 1.5 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.5 + 0.3,
        direction: Math.random() * Math.PI * 2,
        pulse: Math.random() * 2 + 1,
        vx: 0,
        vy: 0
      };
    });
    
    setParticles(newParticles);
    
    // Cleanup animation frame on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [energyPoints, particleDensity, dimensions, colors, isMounted]);
  
  // Animate particles
  useEffect(() => {
    if (!dimensions || !isMounted) return;
    
    let lastTime = performance.now();
    
    const animate = (time: number) => {
      if (!isMounted) {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        return;
      }
      
      const delta = time - lastTime;
      lastTime = time;
      
      setParticles(prevParticles => {
        return prevParticles.map(particle => {
          let { x, y, direction, pulse } = particle;
          const { speed } = particle;
          
          // Apply mouse attraction if mouse is within container
          let dx = 0;
          let dy = 0;
          
          if (mousePosition) {
            dx = mousePosition.x - x;
            dy = mousePosition.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 150) {
              const factor = 0.02;
              direction = Math.atan2(dy, dx);
              pulse = Math.min(pulse + 0.1, 3);
            } else {
              // Random wandering
              direction += (Math.random() - 0.5) * 0.2;
              pulse = Math.max(pulse - 0.05, 1);
            }
          } else {
            // Random wandering
            direction += (Math.random() - 0.5) * 0.2;
          }
          
          // Update position
          x += Math.cos(direction) * speed * (delta / 16);
          y += Math.sin(direction) * speed * (delta / 16);
          
          // Boundary checking
          if (x < 0) x = dimensions.width;
          if (x > dimensions.width) x = 0;
          if (y < 0) y = dimensions.height;
          if (y > dimensions.height) y = 0;
          
          // Update vx and vy for type compatibility
          const vx = Math.cos(direction) * speed;
          const vy = Math.sin(direction) * speed;
          
          return { ...particle, x, y, direction, pulse, vx, vy };
        });
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [dimensions, mousePosition, isMounted]);
  
  // Ensure animation frames are cleaned up on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, []);
  
  return particles;
};
