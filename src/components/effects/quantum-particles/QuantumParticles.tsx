
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Particle from './Particle';
import { QuantumParticle } from './types';
import { getAnimationQualityLevel } from '@/utils/performanceUtils';

const QuantumParticles: React.FC<{
  count?: number;
  colors?: string[];
  speed?: number;
  maxSize?: number;
  responsive?: boolean;
}> = ({
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
  
  // State for particles and container dimensions
  const [particles, setParticles] = useState<QuantumParticle[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Animation frame reference
  const requestRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(true);
  
  // For performance tracking
  const lastTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const fpsRef = useRef<number>(60);
  
  // Quality level based on device
  const qualityLevel = useMemo(() => getAnimationQualityLevel(), []);
  
  // Initialize particles
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    setDimensions({ width: rect.width, height: rect.height });
    
    // Create initial particles
    const newParticles = Array.from({ length: particleCount }).map((_, i) => createParticle(
      rect.width, 
      rect.height, 
      colors, 
      maxSize, 
      speed, 
      qualityLevel
    ));
    
    setParticles(newParticles);
    
    // Handle resize
    const handleResize = () => {
      if (responsive && containerRef.current) {
        const newRect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: newRect.width, height: newRect.height });
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [particleCount, colors, maxSize, speed, responsive, qualityLevel]);
  
  // Animation loop
  useEffect(() => {
    // Skip if no particles or container
    if (particles.length === 0 || !containerRef.current) return;
    
    let animationFrameId: number;
    
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
      
      // Update particle positions
      setParticles(prevParticles => 
        prevParticles.map(particle => {
          // Update position
          let newX = particle.x + particle.vx;
          let newY = particle.y + particle.vy;
          
          // Boundary check
          if (newX < 0 || newX > 100) {
            particle.vx *= -1;
            newX = particle.x + particle.vx;
          }
          
          if (newY < 0 || newY > 100) {
            particle.vy *= -1;
            newY = particle.y + particle.vy;
          }
          
          return {
            ...particle,
            x: newX,
            y: newY
          };
        })
      );
      
      // Request next frame using ref to avoid infinite loops
      animationFrameId = requestAnimationFrame(animate);
    };
    
    // Start animation
    animationFrameId = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [dimensions, particles.length]); // Only re-run when dimensions or particle count changes
  
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

// Helper function to create a particle
function createParticle(
  width: number, 
  height: number, 
  colors: string[], 
  maxSize: number,
  speed: number,
  qualityLevel: 'low' | 'medium' | 'high'
): QuantumParticle {
  // Adjust particle complexity based on quality level
  const sizeFactor = qualityLevel === 'low' ? 0.6 : 
                    qualityLevel === 'medium' ? 0.8 : 1;
  
  // Adjust animation speed based on quality level
  const speedFactor = qualityLevel === 'low' ? 0.5 : 
                     qualityLevel === 'medium' ? 0.8 : 1;
  
  const size = (Math.random() * maxSize + 1) * sizeFactor;
  
  return {
    x: Math.random() * 100,
    y: Math.random() * 100,
    vx: (Math.random() - 0.5) * 0.1 * speed * speedFactor,
    vy: (Math.random() - 0.5) * 0.1 * speed * speedFactor,
    size,
    color: colors[Math.floor(Math.random() * colors.length)],
    opacity: Math.random() * 0.5 + 0.1,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 2
  };
}

export default React.memo(QuantumParticles);
