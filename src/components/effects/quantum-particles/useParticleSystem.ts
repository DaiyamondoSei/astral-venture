
import { useState, useEffect, useRef } from 'react';
import { QuantumParticle, QuantumParticlesProps } from './types';

export interface ParticleSystemHookResult {
  particles: QuantumParticle[];
  updateParticles: () => void;
  createParticle: (width: number, height: number, colors: string[], maxSize: number, speed: number) => QuantumParticle;
}

export const useParticleSystem = (
  containerWidth: number,
  containerHeight: number,
  options: Pick<QuantumParticlesProps, 'count' | 'colors' | 'maxSize' | 'speed' | 'interactive'>
): ParticleSystemHookResult => {
  const { count = 30, colors = ['#6366f1', '#8b5cf6', '#d946ef', '#64748b', '#0ea5e9'], maxSize = 6, speed = 1, interactive = false } = options;
  const [particles, setParticles] = useState<QuantumParticle[]>([]);
  const isMounted = useRef(true);
  const lastUpdateTime = useRef(0);
  const mousePosition = useRef<{x: number, y: number} | null>(null);

  // Track mouse position for interactive mode
  useEffect(() => {
    if (!interactive) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerWidth || !containerHeight) return;
      
      // Convert to percentage coordinates
      mousePosition.current = {
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      };
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [interactive, containerWidth, containerHeight]);

  // Create a single particle with improved randomization
  const createParticle = (
    width: number, 
    height: number, 
    colors: string[], 
    maxSize: number,
    speed: number
  ): QuantumParticle => {
    // Use container dimensions for better positioning
    const size = Math.random() * maxSize + 1;
    const speedMultiplier = speed * (0.5 + Math.random() * 0.5); // More consistent speed range
    
    return {
      x: Math.random() * 100, // Use percentage for responsive positioning
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.1 * speedMultiplier,
      vy: (Math.random() - 0.5) * 0.1 * speedMultiplier,
      size,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.5 + 0.1,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2
    };
  };

  // Initialize particles with debouncing for resize events
  useEffect(() => {
    // Don't initialize if container dimensions aren't available yet
    if (containerWidth <= 0 || containerHeight <= 0) return;
    
    // Avoid frequent particle regeneration on small container size changes
    const now = Date.now();
    if (particles.length > 0 && now - lastUpdateTime.current < 500) return;
    
    lastUpdateTime.current = now;
    
    // Create initial particles with proper count handling
    const particleCount = typeof count === 'number' ? count : parseInt(String(count), 10) || 30;
    const newParticles = Array.from({ length: particleCount }).map(() => 
      createParticle(containerWidth, containerHeight, colors, maxSize, speed)
    );
    
    setParticles(newParticles);
    
    return () => {
      isMounted.current = false;
    };
  }, [containerWidth, containerHeight, count, colors, maxSize, speed, particles.length]);

  // Update particle positions with performance optimizations
  const updateParticles = () => {
    if (!isMounted.current) return;
    
    setParticles(prevParticles => 
      prevParticles.map(particle => {
        // Update position based on velocity
        let newX = particle.x + particle.vx;
        let newY = particle.y + particle.vy;
        let newVx = particle.vx;
        let newVy = particle.vy;
        
        // Boundary check with improved bounce physics
        if (newX < 0 || newX > 100) {
          newVx = particle.vx * -0.95; // Slightly reduce velocity on bounce for realism
          newX = newX < 0 ? 0.1 : 99.9; // Keep just inside boundary
        }
        
        if (newY < 0 || newY > 100) {
          newVy = particle.vy * -0.95;
          newY = newY < 0 ? 0.1 : 99.9;
        }
        
        // Apply interactive effects if mouse position exists and interactive mode is enabled
        if (interactive && mousePosition.current) {
          const dx = mousePosition.current.x - particle.x;
          const dy = mousePosition.current.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Attraction/repulsion based on distance
          if (distance < 15) { // Percentage-based interaction radius
            const force = 0.01 * (1 - distance / 15);
            newVx += dx * force;
            newVy += dy * force;
          }
        }
        
        // Apply slight drag for natural movement
        newVx *= 0.99;
        newVy *= 0.99;
        
        return {
          ...particle,
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy
        };
      })
    );
  };

  return {
    particles,
    updateParticles,
    createParticle
  };
};
