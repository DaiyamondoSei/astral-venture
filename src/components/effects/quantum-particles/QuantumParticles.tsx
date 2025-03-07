
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
  responsive = true,
  interactive = false,
  className = ''
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
  
  // Performance metrics
  const lastTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const fpsRef = useRef<number>(60);
  const throttleFramesRef = useRef<number>(1); // Process every nth frame
  const frameSkipCountRef = useRef<number>(0);
  
  // Quality level based on device
  const qualityLevel = useMemo(() => getAnimationQualityLevel(), []);
  
  // Adjust particle count based on device performance
  const adjustedCount = useMemo(() => {
    if (qualityLevel === 'low') {
      return Math.min(particleCount, 15); // Fewer particles for low-end devices
    } else if (qualityLevel === 'medium') {
      return Math.min(particleCount, 25); // Moderate number for medium devices
    }
    return particleCount; // Full count for high-end devices
  }, [particleCount, qualityLevel]);
  
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
    
    // Initial update
    updateDimensions();
    
    // Add throttled resize listener
    let resizeTimeout: number;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(updateDimensions, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [responsive]);
  
  // Initialize particle system with dependencies
  const { particles, updateParticles } = useParticleSystem(
    dimensions.width,
    dimensions.height,
    { count: adjustedCount, colors, maxSize, speed, interactive }
  );

  // Animation loop with performance optimizations
  useEffect(() => {
    if (particles.length === 0 || !containerRef.current) return;
    
    const animate = (time: number) => {
      if (!isMounted.current) return;
      
      // FPS calculation and monitoring
      frameCountRef.current++;
      if (time - lastTimeRef.current >= 1000) {
        fpsRef.current = frameCountRef.current;
        frameCountRef.current = 0;
        lastTimeRef.current = time;
        
        // Adjust throttling dynamically based on FPS
        if (fpsRef.current < 30 && throttleFramesRef.current < 4) {
          throttleFramesRef.current++;
        } else if (fpsRef.current > 55 && throttleFramesRef.current > 1) {
          throttleFramesRef.current--;
        }
      }
      
      // Apply throttling
      frameSkipCountRef.current = (frameSkipCountRef.current + 1) % throttleFramesRef.current;
      if (frameSkipCountRef.current === 0) {
        updateParticles();
      }
      
      requestRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    requestRef.current = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = undefined;
      }
    };
  }, [particles.length, updateParticles]);
  
  // Component mount/unmount lifecycle
  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = undefined;
      }
    };
  }, []);
  
  // Render particles with accessibility improvements
  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${className}`}
      aria-hidden="true"
      role="presentation"
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
