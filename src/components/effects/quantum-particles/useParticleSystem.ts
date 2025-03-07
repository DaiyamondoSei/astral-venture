
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Vector2 } from 'three';
import { Particle, ParticleSystemHookResult } from './types';

/**
 * Custom hook that manages quantum particle system
 * Optimized to prevent unnecessary re-renders and clean up resources
 */
export const useParticleSystem = (
  count: number,
  colors: string[],
  interactive: boolean,
  speed: number = 1
): ParticleSystemHookResult => {
  // Memoize the initial particles array to avoid recreating on every render
  const initialParticles = useMemo(() => {
    return Array.from({ length: count }).map((_, index) => ({
      id: Math.random().toString(36).substring(2, 9),
      position: new Vector2(
        Math.random() * 100,
        Math.random() * 100
      ),
      velocity: new Vector2(
        (Math.random() - 0.5) * 0.1 * speed,
        (Math.random() - 0.5) * 0.1 * speed
      ),
      size: Math.random() * 3 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.5 + 0.3,
      connections: []
    }));
  }, [count, colors, speed]);
  
  const [particles, setParticles] = useState<Particle[]>(initialParticles);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  
  // Update particles using useCallback to prevent function recreation
  const updateParticles = useCallback(() => {
    setParticles(prevParticles => 
      prevParticles.map(particle => {
        // Create a clone of current position and velocity to avoid mutation
        const newPosition = new Vector2(particle.position.x, particle.position.y);
        const velocity = new Vector2(particle.velocity.x, particle.velocity.y);
        
        // Add velocity to position
        newPosition.add(velocity);
        
        // Boundary check and bounce
        if (newPosition.x <= 0 || newPosition.x >= 100) {
          velocity.setX(-velocity.x);
        }
        
        if (newPosition.y <= 0 || newPosition.y >= 100) {
          velocity.setY(-velocity.y);
        }
        
        // Return updated particle with new position and velocity
        return {
          ...particle,
          position: newPosition,
          velocity: velocity
        };
      })
    );
  }, []);

  // Handle mouse movements only when interactive mode is enabled
  useEffect(() => {
    if (!interactive || !containerRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      setMousePosition({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [interactive]);

  // Animation loop with proper performance optimizations
  useEffect(() => {
    let animationActive = true;
    
    const animate = (timestamp: number) => {
      if (!animationActive) return;
      
      if (timestamp - lastUpdateTimeRef.current > 16) { // Limit to ~60fps
        lastUpdateTimeRef.current = timestamp;
        updateParticles();
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    // Proper cleanup function to prevent memory leaks
    return () => {
      animationActive = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [updateParticles]);

  return { particles, mousePosition, containerRef };
};

export default useParticleSystem;
