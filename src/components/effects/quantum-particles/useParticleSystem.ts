
import { useEffect, useRef, useState, useCallback } from 'react';
import { Vector2 } from 'three';
import { Particle } from './types';

export const useParticleSystem = (
  count: number,
  colors: string[],
  interactive: boolean
) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const initialized = useRef(false);

  // Generate a unique ID for each particle
  const generateId = useCallback(() => {
    return Math.random().toString(36).substring(2, 9);
  }, []);

  // Initialize particles only once
  useEffect(() => {
    if (initialized.current) return;
    
    const initialParticles = Array.from({ length: count }).map((_, index) => ({
      id: generateId(),
      position: new Vector2(
        Math.random() * 100,
        Math.random() * 100
      ),
      velocity: new Vector2(
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1
      ),
      size: Math.random() * 3 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.5 + 0.3,
      connections: []
    }));

    setParticles(initialParticles);
    initialized.current = true;
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [count, colors, generateId]);

  // Handle mouse movements
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

  // Animation loop - using useCallback to prevent function recreation
  const updateParticles = useCallback(() => {
    setParticles(prevParticles => 
      prevParticles.map(particle => {
        // Update position
        const newPosition = particle.position.clone().add(particle.velocity);
        
        // Boundary check
        if (newPosition.x <= 0 || newPosition.x >= 100) {
          particle.velocity.setX(-particle.velocity.x);
        }
        
        if (newPosition.y <= 0 || newPosition.y >= 100) {
          particle.velocity.setY(-particle.velocity.y);
        }
        
        particle.position.add(particle.velocity);
        
        return particle;
      })
    );
  }, []);

  // Animation loop
  useEffect(() => {
    if (particles.length === 0) return;
    
    const animate = (timestamp: number) => {
      if (timestamp - lastUpdateTimeRef.current > 16) { // Limit to ~60fps
        lastUpdateTimeRef.current = timestamp;
        updateParticles();
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [particles, updateParticles]);

  return { particles, mousePosition, containerRef };
};

export default useParticleSystem;
