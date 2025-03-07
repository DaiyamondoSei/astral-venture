
import { useState, useEffect, useRef } from 'react';
import { QuantumParticle } from './types';

export const useParticleSystem = (
  count: number,
  colors: string[],
  interactive: boolean
) => {
  const [particles, setParticles] = useState<QuantumParticle[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const initialized = useRef(false);
  
  // Generate random particles only once on mount
  useEffect(() => {
    // Only generate particles if not already initialized
    if (initialized.current) return;
    
    const newParticles: QuantumParticle[] = [];
    
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 5 + 1,
        opacity: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 5
      });
    }
    
    setParticles(newParticles);
    initialized.current = true;
  }, [count, colors]); // These dependencies don't change often
  
  // Track mouse position for interactive mode
  useEffect(() => {
    if (!interactive) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      // Use requestAnimationFrame to throttle updates
      requestAnimationFrame(() => {
        setMousePosition({
          x: (e.clientX / window.innerWidth) * 100,
          y: (e.clientY / window.innerHeight) * 100
        });
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [interactive]); // Only re-run if interactive flag changes
  
  return { particles, mousePosition };
};
