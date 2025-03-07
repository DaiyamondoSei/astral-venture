
import React, { useRef, useState, useEffect } from 'react';
import { QuantumParticlesProps } from './types';
import { useParticleSystem } from './useParticleSystem';
import Particle from './Particle';
import { getAnimationQualityLevel } from '@/utils/performanceUtils';

/**
 * QuantumParticles Component
 * 
 * Renders a system of floating particles that move with subtle animations
 * Optimized for performance with lazy initialization and React.memo
 */
const QuantumParticles: React.FC<QuantumParticlesProps> = ({ 
  count = 30,
  colors = ['#8b5cf6', '#6366f1', '#a78bfa', '#ec4899', '#0ea5e9'],
  speed = 1,
  maxSize = 6,
  responsive = true,
  interactive = false,
  className = ''
}) => {
  // Create ref for container to measure dimensions
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Store initial count to prevent endless re-renders
  const initialCountRef = useRef(typeof count === 'number' ? count : parseInt(String(count), 10) || 30);
  
  // Track mouse position for interactive mode
  const [mousePosition, setMousePosition] = useState<{ x: number, y: number } | null>(null);
  
  // Get quality level for performance optimization
  const qualityLevel = getAnimationQualityLevel();
  
  // Calculate actual count based on quality level
  const actualCount = useRef<number>(
    qualityLevel === 'low' ? Math.floor(initialCountRef.current * 0.5) :
    qualityLevel === 'medium' ? Math.floor(initialCountRef.current * 0.8) :
    initialCountRef.current
  );
  
  // Initialize particle system with lazy loading
  const { particles, dimensions, dx, dy } = useParticleSystem({
    count: actualCount.current,
    colors,
    speed,
    maxSize,
    containerRef,
    mousePosition,
    responsive
  });
  
  // Set up mouse tracking for interactive mode
  useEffect(() => {
    if (!interactive || !containerRef.current) return;
    
    const updateMousePosition = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setMousePosition({ x, y });
    };
    
    const resetMousePosition = () => {
      setMousePosition(null);
    };
    
    const container = containerRef.current;
    container.addEventListener('mousemove', updateMousePosition);
    container.addEventListener('mouseleave', resetMousePosition);
    
    return () => {
      container.removeEventListener('mousemove', updateMousePosition);
      container.removeEventListener('mouseleave', resetMousePosition);
    };
  }, [interactive]);
  
  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden w-full h-full ${className}`}
      aria-hidden="true"
    >
      {particles.map(particle => (
        <Particle
          key={`quantum-particle-${particle.x}-${particle.y}-${particle.size}`}
          particle={particle}
          dx={dx}
          dy={dy}
        />
      ))}
    </div>
  );
};

export default React.memo(QuantumParticles);
