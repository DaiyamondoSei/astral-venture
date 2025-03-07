
import { useState, useEffect, useRef } from 'react';
import { QuantumParticle } from './types';
import { createParticles } from './utils/particleCreator';
import { useDimensions } from './hooks/useDimensions';
import { useMouseInteraction } from './hooks/useMouseInteraction';

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
 * Refactored for better maintainability with dependency separation
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
  
  // Use the dimensions hook
  const { dimensions, updateDimensions } = useDimensions(containerRef, responsive, isMounted);
  
  // Initialize particles when dimensions change or on first load
  useEffect(() => {
    if (!dimensions) return;
    
    const dimensionsChanged = 
      !prevDimensionsRef.current || 
      prevDimensionsRef.current.width !== dimensions.width ||
      prevDimensionsRef.current.height !== dimensions.height;
    
    // Only recreate particles if dimensions changed significantly or not initialized yet
    if ((responsive && dimensionsChanged) || !initializedRef.current || needsRecreationRef.current) {
      const newParticles = createParticles(count, dimensions, colors, maxSize, speed);
      
      // Calculate movement values based on container size
      const dx = Math.min(5, dimensions.width * 0.01);
      const dy = Math.min(5, dimensions.height * 0.01);
      
      setState({
        particles: newParticles,
        dimensions,
        dx,
        dy
      });
      
      prevDimensionsRef.current = dimensions;
      initializedRef.current = true;
      needsRecreationRef.current = false;
    }
  }, [dimensions, count, colors, maxSize, speed, responsive]);
  
  // Use the mouse interaction hook
  const { updateParticles } = useMouseInteraction(state.particles, state.dimensions, mousePosition, isMounted);
  
  // Handle mouse interaction with particles
  useEffect(() => {
    if (!mousePosition || !state.particles.length || !state.dimensions) return;
    
    const handleAnimationFrame = () => {
      if (!isMounted.current) return;
      
      const updatedParticles = updateParticles();
      
      if (updatedParticles) {
        setState(prevState => ({
          ...prevState,
          particles: updatedParticles
        }));
      }
      
      animationFrameRef.current = requestAnimationFrame(handleAnimationFrame);
    };
    
    animationFrameRef.current = requestAnimationFrame(handleAnimationFrame);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [mousePosition, state.dimensions, state.particles.length]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, []);
  
  // Update dimensions when they change
  useEffect(() => {
    if (dimensions && dimensions !== state.dimensions) {
      setState(prevState => ({
        ...prevState,
        dimensions
      }));
    }
  }, [dimensions]);
  
  return state;
}
