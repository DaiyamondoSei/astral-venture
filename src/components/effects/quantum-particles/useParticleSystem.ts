
import { useState, useEffect, useCallback, useMemo } from 'react';
import { QuantumParticle } from './types';

export const useParticleSystem = (count: number, colors: string[], interactive: boolean) => {
  const [particles, setParticles] = useState<QuantumParticle[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  
  // Initialize particles once with stable reference
  const initializeParticles = useCallback(() => {
    const newParticles: QuantumParticle[] = [];
    
    for (let i = 0; i < count; i++) {
      const id = `particle-${i}`;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const size = Math.random() * 6 + 2; // Between 2px and 8px
      const color = colors[Math.floor(Math.random() * colors.length)];
      const opacity = Math.random() * 0.5 + 0.2; // Between 0.2 and 0.7
      const duration = Math.random() * 8 + 3; // Between 3s and 11s
      const delay = Math.random() * 2; // Between 0s and 2s
      
      newParticles.push({
        id,
        x,
        y,
        size,
        color,
        opacity,
        duration,
        delay
      });
    }
    
    return newParticles;
  }, [count, colors]);
  
  // Create particles once on mount using useMemo
  const memoizedParticles = useMemo(() => initializeParticles(), [initializeParticles]);
  
  // Set particles once on mount
  useEffect(() => {
    setParticles(memoizedParticles);
  }, [memoizedParticles]);
  
  // Track mouse position for interactive mode
  useEffect(() => {
    if (!interactive) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate mouse position as a percentage of the window
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePosition({ x, y });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [interactive]);
  
  return { particles, mousePosition };
};
