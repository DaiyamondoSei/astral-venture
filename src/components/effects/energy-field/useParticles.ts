
import { useState, useEffect, useRef, useMemo } from 'react';
import { Particle } from './types';
import { getPerformanceCategory } from '@/utils/performanceUtils';

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
  const lastTimeRef = useRef<number>(0);
  const frameSkipRef = useRef<number>(0);
  const deviceCategory = useMemo(() => getPerformanceCategory(), []);
  
  // Calculate frame skip based on device performance
  const frameSkip = useMemo(() => {
    if (deviceCategory === 'low') return 3; // Update every 4th frame
    if (deviceCategory === 'medium') return 1; // Update every 2nd frame
    return 0; // Update every frame for high-performance devices
  }, [deviceCategory]);
  
  // Initialize particles
  useEffect(() => {
    if (!dimensions || !isMounted) return;
    
    // Calculate number of particles based on energy points, density, and device capability
    const getOptimalCount = () => {
      // Base count from energy points
      const baseCount = Math.min(75, Math.ceil(energyPoints / 30)) * particleDensity;
      
      // Adjust based on device capability
      if (deviceCategory === 'low') {
        return Math.max(5, Math.min(baseCount * 0.3, 30));
      }
      if (deviceCategory === 'medium') {
        return Math.max(10, Math.min(baseCount * 0.6, 75));
      }
      // High performance
      return Math.max(10, Math.min(baseCount, 150));
    };
    
    const count = getOptimalCount();
    
    const newParticles: Particle[] = Array.from({ length: count }).map((_, index) => {
      // Create particles with reduced computation
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
  }, [energyPoints, particleDensity, dimensions, colors, isMounted, deviceCategory]);
  
  // Animate particles with performance optimizations
  useEffect(() => {
    if (!dimensions || !isMounted) return;
    
    const animate = (time: number) => {
      if (!isMounted) {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        return;
      }
      
      // Calculate delta time for smooth animation regardless of framerate
      const delta = lastTimeRef.current ? time - lastTimeRef.current : 16.67;
      lastTimeRef.current = time;
      
      // Skip frames for performance
      frameSkipRef.current = (frameSkipRef.current + 1) % (frameSkip + 1);
      if (frameSkipRef.current !== 0) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      
      setParticles(prevParticles => {
        // Batch all particle updates to reduce state updates
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
              // Only perform complex calculations if mouse is close enough
              const factor = 0.02;
              direction = Math.atan2(dy, dx);
              pulse = Math.min(pulse + 0.1, 3);
            } else {
              // Simplified wandering for distant particles
              direction += (Math.random() - 0.5) * 0.2;
              pulse = Math.max(pulse - 0.05, 1);
            }
          } else {
            // Simple random wandering when no mouse
            direction += (Math.random() - 0.5) * 0.2;
          }
          
          // Update position with delta time for consistent movement regardless of framerate
          const normalizedDelta = delta / 16.67; // Normalize to 60fps
          x += Math.cos(direction) * speed * normalizedDelta;
          y += Math.sin(direction) * speed * normalizedDelta;
          
          // Boundary checking with wrapping
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
    
    // Start animation loop
    animationFrameRef.current = requestAnimationFrame(animate);
    
    // Clear animation frame when component unmounts or dependencies change
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [dimensions, mousePosition, isMounted, frameSkip]);
  
  // Final cleanup
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
