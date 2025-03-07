
import { useState, useEffect, useRef } from 'react';
import { usePerformance } from '@/contexts/PerformanceContext';

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  speed: number;
  color: string;
  opacity: number;
  direction: number;
  pulse: number;
}

interface UseParticleWorkerProps {
  count: number;
  dimensions: { width: number; height: number } | null;
  colors: string[];
  mousePosition: { x: number; y: number } | null;
  isVisible: boolean;
}

/**
 * Hook that offloads particle calculations to a Web Worker
 */
export function useParticleWorker({
  count,
  dimensions,
  colors,
  mousePosition,
  isVisible
}: UseParticleWorkerProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const workerRef = useRef<Worker | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const { isLowPerformance } = usePerformance();
  
  // Initialize worker
  useEffect(() => {
    // Only create worker if browser supports it
    if (typeof Worker !== 'undefined' && !isLowPerformance) {
      try {
        workerRef.current = new Worker(new URL('../workers/particleWorker.ts', import.meta.url), {
          type: 'module'
        });
        
        // Set up message handler
        workerRef.current.onmessage = (event) => {
          const { type, particles: updatedParticles } = event.data;
          
          if (type === 'particlesUpdated') {
            setParticles(updatedParticles);
          } else if (type === 'particlesGenerated') {
            setParticles(updatedParticles);
          }
        };
      } catch (error) {
        console.error('Failed to initialize worker:', error);
      }
    }
    
    return () => {
      // Clean up worker
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [isLowPerformance]);
  
  // Generate initial particles
  useEffect(() => {
    if (dimensions && workerRef.current) {
      workerRef.current.postMessage({
        type: 'generateParticles',
        data: {
          count,
          width: dimensions.width,
          height: dimensions.height,
          colors
        }
      });
    }
  }, [count, dimensions, colors]);
  
  // Update particles with animation frame
  useEffect(() => {
    if (!dimensions || !workerRef.current || !isVisible) return;
    
    const updateParticles = (time: number) => {
      // Calculate delta time
      const delta = lastUpdateTimeRef.current ? time - lastUpdateTimeRef.current : 16.67;
      lastUpdateTimeRef.current = time;
      
      // Skip updates if not visible
      if (!isVisible) return;
      
      // Send message to worker to update particles
      workerRef.current?.postMessage({
        type: 'updateParticles',
        data: {
          particles,
          dimensions,
          mousePosition,
          delta
        }
      });
    };
    
    // Run update on each animation frame
    let rafId: number;
    const startAnimation = () => {
      rafId = requestAnimationFrame((time) => {
        updateParticles(time);
        startAnimation();
      });
    };
    
    startAnimation();
    
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [dimensions, mousePosition, particles, isVisible]);
  
  return particles;
}

export default useParticleWorker;
