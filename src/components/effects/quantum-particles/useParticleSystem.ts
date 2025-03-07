
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
  options: Pick<QuantumParticlesProps, 'count' | 'colors' | 'maxSize' | 'speed'>
): ParticleSystemHookResult => {
  const { count = 30, colors = ['#6366f1', '#8b5cf6', '#d946ef', '#64748b', '#0ea5e9'], maxSize = 6, speed = 1 } = options;
  const [particles, setParticles] = useState<QuantumParticle[]>([]);
  const isMounted = useRef(true);

  // Create a single particle
  const createParticle = (
    width: number, 
    height: number, 
    colors: string[], 
    maxSize: number,
    speed: number
  ): QuantumParticle => {
    const size = Math.random() * maxSize + 1;
    
    return {
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.1 * speed,
      vy: (Math.random() - 0.5) * 0.1 * speed,
      size,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.5 + 0.1,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2
    };
  };

  // Initialize particles
  useEffect(() => {
    if (containerWidth <= 0 || containerHeight <= 0) return;
    
    // Create initial particles
    const newParticles = Array.from({ length: typeof count === 'number' ? count : 30 }).map(() => 
      createParticle(containerWidth, containerHeight, colors, maxSize, speed)
    );
    
    setParticles(newParticles);
    
    return () => {
      isMounted.current = false;
    };
  }, [containerWidth, containerHeight, count, colors, maxSize, speed]);

  // Update particle positions
  const updateParticles = () => {
    if (!isMounted.current) return;
    
    setParticles(prevParticles => 
      prevParticles.map(particle => {
        // Update position
        let newX = particle.x + particle.vx;
        let newY = particle.y + particle.vy;
        
        // Boundary check
        if (newX < 0 || newX > 100) {
          particle.vx *= -1;
          newX = particle.x + particle.vx;
        }
        
        if (newY < 0 || newY > 100) {
          particle.vy *= -1;
          newY = particle.y + particle.vy;
        }
        
        return {
          ...particle,
          x: newX,
          y: newY
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
