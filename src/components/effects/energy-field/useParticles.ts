
import { useState, useEffect, useRef } from 'react';
import { Particle } from './types';

interface UseParticlesProps {
  energyPoints: number;
  colors: string[];
  particleDensity: number;
  dimensions: {
    width: number;
    height: number;
  };
  mousePosition: { x: number, y: number } | null;
  isMounted: React.MutableRefObject<boolean>;
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
  const animationFrameIdRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  
  // Create particles when dimensions change or energy points update
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0 || !isMounted.current) return;
    
    // Calculate number of particles based on energy and density
    const particleCount = Math.min(Math.floor((energyPoints / 100) * particleDensity * 10), 100);
    
    const newParticles = [];
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        size: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.3
      });
    }
    
    particlesRef.current = newParticles;
    setParticles(newParticles);
  }, [dimensions.width, dimensions.height, energyPoints, colors, particleDensity, isMounted]);
  
  // Update particle positions using requestAnimationFrame and refs to avoid infinite loops
  useEffect(() => {
    if (particles.length === 0) return;
    
    const updateParticles = () => {
      if (!isMounted.current) return;
      
      const updatedParticles = particlesRef.current.map(particle => {
        let { x, y, vx, vy } = particle;
        
        // Apply mouse influence if nearby
        if (mousePosition) {
          const dx = mousePosition.x - x;
          const dy = mousePosition.y - y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Apply gentle attraction/repulsion based on distance
          if (distance < 100) {
            const force = 0.2 * (1 - distance / 100);
            vx += dx * force * 0.01;
            vy += dy * force * 0.01;
          }
        }
        
        // Update position
        x += vx;
        y += vy;
        
        // Bounce off walls
        if (x < 0 || x > dimensions.width) vx = -vx * 0.8;
        if (y < 0 || y > dimensions.height) vy = -vy * 0.8;
        
        // Apply friction
        vx *= 0.99;
        vy *= 0.99;
        
        return {
          ...particle,
          x, y, vx, vy
        };
      });
      
      // Only update state if component is still mounted
      if (isMounted.current) {
        particlesRef.current = updatedParticles;
        setParticles(updatedParticles);
        animationFrameIdRef.current = requestAnimationFrame(updateParticles);
      }
    };
    
    animationFrameIdRef.current = requestAnimationFrame(updateParticles);
    return () => {
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
    };
  }, [particles.length, dimensions, mousePosition, isMounted]);
  
  return particles;
};
