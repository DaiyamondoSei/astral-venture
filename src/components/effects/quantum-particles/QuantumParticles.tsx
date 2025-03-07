
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Particle from './Particle';
import { QuantumParticle, QuantumParticlesProps } from './types';
import { getAnimationQualityLevel } from '@/utils/performanceUtils';
import { useParticleSystem } from './useParticleSystem';

const QuantumParticles: React.FC<QuantumParticlesProps> = ({
  count = 30,
  colors = ['#6366f1', '#8b5cf6', '#d946ef', '#64748b', '#0ea5e9'],
  speed = 1,
  maxSize = 6,
  responsive = true
}) => {
  // Parse count to number with fallback
  const particleCount = typeof count === 'number' 
    ? count 
    : parseInt(String(count), 10) || 30;
  
  // State for container dimensions
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Animation frame reference
  const requestRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(true);
  
  // For performance tracking
  const lastTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const fpsRef = useRef<number>(60);
  const throttleFramesRef = useRef<number>(1); // Only process every nth frame
  const frameSkipCountRef = useRef<number>(0);
  
  // Quality level based on device
  const qualityLevel = useMemo(() => getAnimationQualityLevel(), []);
  
  // Set throttle rate based on device performance
  useEffect(() => {
    if (qualityLevel === 'low') {
      throttleFramesRef.current = 3; // Process every 3rd frame on low-end devices
    } else if (qualityLevel === 'medium') {
      throttleFramesRef.current = 2; // Process every 2nd frame on medium devices
    } else {
      throttleFramesRef.current = 1; // Process every frame on high-end devices
    }
  }, [qualityLevel]);
  
  // Setup dimensions on mount and handle resize
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateDimensions = () => {
      if (responsive && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [responsive]);
  
  // Initialize particle system with dependencies
  const { particles, updateParticles } = useParticleSystem(
    dimensions.width,
    dimensions.height,
    { count: particleCount, colors, maxSize, speed }
  );

  // Animation loop
  useEffect(() => {
    if (particles.length === 0 || !containerRef.current) return;
    
    const animate = (time: number) => {
      if (!isMounted.current) return;
      
      // Simple FPS calculation
      frameCountRef.current++;
      if (time - lastTimeRef.current >= 1000) {
        fpsRef.current = frameCountRef.current;
        frameCountRef.current = 0;
        lastTimeRef.current = time;
        
        // Log FPS for debugging performance issues
        if (process.env.NODE_ENV === 'development') {
          console.log(`Quantum Particles FPS: ${fpsRef.current}`);
        }
      }
      
      // Apply throttling based on device performance
      frameSkipCountRef.current = (frameSkipCountRef.current + 1) % throttleFramesRef.current;
      if (frameSkipCountRef.current === 0) {
        // Only update particles on throttled frames
        updateParticles();
      }
      
      // Request next frame using ref to avoid infinite loops
      requestRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    requestRef.current = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [particles.length, updateParticles]);
  
  // Component mount/unmount
  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);
  
  // Render particles
  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {particles.map((particle, i) => (
        <Particle 
          key={`quantum-particle-${i}`}
          particle={particle}
          dx={Math.sin(i) * 5}
          dy={Math.cos(i) * 5}
        />
      ))}
    </div>
  );
};

export default React.memo(QuantumParticles);
