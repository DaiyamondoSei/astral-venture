
import { useState, useEffect, useRef, useMemo } from 'react';
import { Particle } from './types';
import { usePerformance } from '@/contexts/PerformanceContext';
import { animationScheduler } from '@/utils/animation/AnimationScheduler';

interface UseParticlesProps {
  energyPoints: number;
  colors: string[];
  particleDensity: number;
  dimensions: { width: number; height: number } | null;
  mousePosition: { x: number; y: number } | null;
  isMounted: boolean;
  isVisible?: boolean;
}

export const useParticles = ({
  energyPoints,
  colors,
  particleDensity,
  dimensions,
  mousePosition,
  isMounted,
  isVisible = true
}: UseParticlesProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const instanceIdRef = useRef<string>(`particles-${Math.random().toString(36).substring(2, 9)}`);
  const { isLowPerformance, isMediumPerformance } = usePerformance();
  
  // Calculate frame skip and update interval based on device performance and visibility
  const updateConfig = useMemo(() => {
    // Base update interval in ms (0 means every frame)
    let interval = 0;
    
    if (!isVisible) {
      // When not visible, update very infrequently
      interval = 500;
    } else if (isLowPerformance) {
      interval = 100; // ~10fps
    } else if (isMediumPerformance) {
      interval = 32; // ~30fps
    }
    
    // Animation priority based on visibility and performance
    const priority = !isVisible 
      ? 'low'
      : isLowPerformance 
        ? 'medium' 
        : 'high';
        
    return { interval, priority };
  }, [isLowPerformance, isMediumPerformance, isVisible]);
  
  // Initialize particles
  useEffect(() => {
    if (!dimensions || !isMounted) return;
    
    // Calculate number of particles based on energy points, density, and device capability
    const getOptimalCount = () => {
      // Base count from energy points
      const baseCount = Math.min(75, Math.ceil(energyPoints / 30)) * particleDensity;
      
      // Adjust based on device capability
      if (isLowPerformance) {
        return Math.max(5, Math.min(baseCount * 0.3, 30));
      }
      if (isMediumPerformance) {
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
    particlesRef.current = newParticles;
    
  }, [energyPoints, particleDensity, dimensions, colors, isMounted, isLowPerformance, isMediumPerformance]);
  
  // Animate particles with performance optimizations using our animation scheduler
  useEffect(() => {
    if (!dimensions || !isMounted) return;
    
    const instanceId = instanceIdRef.current;
    let lastTimeRef = 0;
    
    const updateParticles = (time: number) => {
      if (!isMounted || !isVisible) return;
      
      // Calculate delta time for smooth animation regardless of framerate
      const delta = lastTimeRef ? time - lastTimeRef : 16.67;
      lastTimeRef = time;
      
      const updatedParticles = particlesRef.current.map(particle => {
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
      
      // Update local ref immediately
      particlesRef.current = updatedParticles;
      
      // Batch state updates to reduce renders
      setParticles(updatedParticles);
    };
    
    // Register with animation scheduler
    animationScheduler.register(
      instanceId, 
      updateParticles, 
      updateConfig.priority as 'high' | 'medium' | 'low',
      updateConfig.interval
    );
    
    // Cleanup on unmount
    return () => {
      animationScheduler.unregister(instanceId);
    };
  }, [dimensions, mousePosition, isMounted, isVisible, updateConfig.interval, updateConfig.priority]);
  
  return particles;
};
