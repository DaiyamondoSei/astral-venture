
import { useState, useEffect, useRef } from 'react';
import { QuantumParticle } from './types';

interface UseParticleSystemProps {
  count: number;
  colors: string[];
  speed: number;
  maxSize: number;
  containerRef: React.RefObject<HTMLDivElement>;
  mousePosition: { x: number, y: number } | null;
  responsive: boolean;
}

interface ParticleSystemState {
  particles: QuantumParticle[];
  dimensions: { width: number; height: number } | null;
  dx: number;
  dy: number;
}

/**
 * Custom hook for managing quantum particle system
 * Handles creation, updates, and interactions for particles
 */
export function useParticleSystem({
  count,
  colors,
  speed,
  maxSize,
  containerRef,
  mousePosition,
  responsive
}: UseParticleSystemProps): ParticleSystemState {
  // Track if component is mounted
  const isMounted = useRef(true);

  // Store animation frame for cleanup
  const animationFrameRef = useRef<number | null>(null);
  
  // Track initialization to avoid redundant particle creation
  const initializedRef = useRef(false);
  
  // Store previous dimensions to detect changes
  const prevDimensionsRef = useRef<{ width: number; height: number } | null>(null);
  
  // Track whether particles need to be recreated due to config changes
  const needsRecreationRef = useRef(false);
  
  // Main state for particles and dimensions
  const [state, setState] = useState<ParticleSystemState>({
    particles: [],
    dimensions: null,
    dx: 0,
    dy: 0
  });
  
  // Initialize particles and handle resize
  useEffect(() => {
    // Update dimensions and create initial particles
    const updateDimensions = () => {
      if (!containerRef.current || !isMounted.current) return;
      
      const newDimensions = {
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight
      };
      
      const dimensionsChanged = 
        !prevDimensionsRef.current || 
        prevDimensionsRef.current.width !== newDimensions.width ||
        prevDimensionsRef.current.height !== newDimensions.height;
      
      // Only recreate particles if dimensions changed significantly or not initialized yet
      if ((responsive && dimensionsChanged) || !initializedRef.current || needsRecreationRef.current) {
        const newParticles = createParticles(count, newDimensions, colors, maxSize, speed);
        
        // Calculate movement values based on container size
        const dx = Math.min(5, newDimensions.width * 0.01);
        const dy = Math.min(5, newDimensions.height * 0.01);
        
        setState({
          particles: newParticles,
          dimensions: newDimensions,
          dx,
          dy
        });
        
        prevDimensionsRef.current = newDimensions;
        initializedRef.current = true;
        needsRecreationRef.current = false;
      }
    };
    
    // Initial update
    updateDimensions();
    
    // Set up resize listener if responsive mode is enabled
    if (responsive) {
      const handleResize = () => {
        // Use debounce to prevent excessive updates
        if (animationFrameRef.current) {
          window.cancelAnimationFrame(animationFrameRef.current);
        }
        
        animationFrameRef.current = window.requestAnimationFrame(updateDimensions);
      };
      
      window.addEventListener('resize', handleResize);
      
      // Clean up event listener
      return () => {
        window.removeEventListener('resize', handleResize);
        if (animationFrameRef.current) {
          window.cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [count, colors, maxSize, speed, responsive]);
  
  // Handle mouse interaction with particles
  useEffect(() => {
    if (!mousePosition || !state.particles.length || !state.dimensions) return;
    
    // Skip animation frame for performance in low-end devices
    const skipFrames = 2; // Only process every 3rd frame
    let frameCount = 0;
    
    const updateParticles = () => {
      if (!isMounted.current) return;
      
      frameCount = (frameCount + 1) % skipFrames;
      if (frameCount !== 0) {
        animationFrameRef.current = requestAnimationFrame(updateParticles);
        return;
      }
      
      setState(prevState => {
        // Skip if no particles or dimensions
        if (!prevState.particles.length || !prevState.dimensions) return prevState;
        
        // Avoid updating if mouse position hasn't changed
        if (!mousePosition) return prevState;
        
        const { x: mouseX, y: mouseY } = mousePosition;
        
        // Update particles based on mouse position
        const updatedParticles = prevState.particles.map(particle => {
          // Convert percentage to actual position
          const particleX = (particle.x / 100) * prevState.dimensions!.width;
          const particleY = (particle.y / 100) * prevState.dimensions!.height;
          
          // Calculate distance from mouse
          const dx = mouseX - particleX;
          const dy = mouseY - particleY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Skip particles too far from mouse
          if (distance > 120) return particle;
          
          // Calculate effect strength (stronger for closer particles)
          const strength = 1 - Math.min(1, distance / 120);
          
          // Apply subtle movement away from mouse
          const offsetX = (dx / distance) * strength * -0.5;
          const offsetY = (dy / distance) * strength * -0.5;
          
          return {
            ...particle,
            vx: particle.vx + offsetX,
            vy: particle.vy + offsetY
          };
        });
        
        return {
          ...prevState,
          particles: updatedParticles
        };
      });
      
      animationFrameRef.current = requestAnimationFrame(updateParticles);
    };
    
    animationFrameRef.current = requestAnimationFrame(updateParticles);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mousePosition, state.dimensions]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  
  return state;
}

/**
 * Create a set of particles with random properties
 */
function createParticles(
  count: number, 
  dimensions: { width: number; height: number }, 
  colors: string[],
  maxSize: number,
  speed: number
): QuantumParticle[] {
  const particles: QuantumParticle[] = [];
  
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * 100, // Use percentage for responsive positioning
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.2 * speed,
      vy: (Math.random() - 0.5) * 0.2 * speed,
      size: Math.random() * maxSize + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.5 + 0.2,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2
    });
  }
  
  return particles;
}
