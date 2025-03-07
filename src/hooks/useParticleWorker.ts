
import { useState, useEffect, useRef } from 'react';
import { usePerformance } from '@/contexts/PerformanceContext';

interface ParticleWorkerOptions {
  enabled?: boolean;
  particleCount?: number;
  dimensions: { width: number; height: number } | null;
  colors?: string[];
  initialParticles?: any[];
}

/**
 * Hook to use a Web Worker for particle physics calculations
 * Prevents UI thread blocking during heavy particle simulations
 */
export function useParticleWorker({
  enabled = true,
  particleCount = 30,
  dimensions,
  colors = ['#8b5cf6', '#6366f1', '#a78bfa'],
  initialParticles
}: ParticleWorkerOptions) {
  // Store worker and particles state
  const [particles, setParticles] = useState<any[]>(initialParticles || []);
  const workerRef = useRef<Worker | null>(null);
  const { deviceCapability } = usePerformance();
  
  // Only use worker for medium and high capability devices
  const shouldUseWorker = enabled && deviceCapability !== 'low' && typeof window !== 'undefined';
  
  // Initialize worker
  useEffect(() => {
    if (!shouldUseWorker || !dimensions) return;
    
    // Create worker
    const worker = new Worker(
      new URL('../workers/particleWorker.ts', import.meta.url),
      { type: 'module' }
    );
    
    // Handle messages from worker
    worker.onmessage = (event) => {
      const { type, data } = event.data;
      
      if (type === 'particlesUpdated') {
        setParticles(data.particles);
      }
    };
    
    // Store worker reference
    workerRef.current = worker;
    
    // Initialize worker with particles if not provided
    if (!initialParticles) {
      // Create random particles
      const newParticles = Array.from({ length: particleCount }).map((_, index) => ({
        id: `particle-${index}`,
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        direction: Math.random() * Math.PI * 2,
        speed: Math.random() * 1.5 + 0.5,
        pulse: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)]
      }));
      
      // Initialize worker
      worker.postMessage({
        type: 'initialize',
        data: {
          particles: newParticles,
          dimensions
        }
      });
      
      // Update local state
      setParticles(newParticles);
    } else {
      // Use provided particles
      worker.postMessage({
        type: 'initialize',
        data: {
          particles: initialParticles,
          dimensions
        }
      });
    }
    
    // Cleanup
    return () => {
      if (workerRef.current) {
        workerRef.current.postMessage({ type: 'terminate' });
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [shouldUseWorker, dimensions, particleCount, colors, initialParticles]);
  
  // Update dimensions when they change
  useEffect(() => {
    if (!workerRef.current || !dimensions) return;
    
    workerRef.current.postMessage({
      type: 'updateParticles',
      data: { dimensions }
    });
  }, [dimensions]);
  
  // Function to update mouse position for interactive effects
  const updateMousePosition = (position: { x: number; y: number } | null) => {
    if (!workerRef.current) return;
    
    workerRef.current.postMessage({
      type: 'updateParticles',
      data: { mousePosition: position }
    });
  };
  
  return {
    particles,
    updateMousePosition
  };
}

export default useParticleWorker;
