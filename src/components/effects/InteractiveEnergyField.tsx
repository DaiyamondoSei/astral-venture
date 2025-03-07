
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';

interface InteractiveEnergyFieldProps {
  energyPoints?: number;
  colors?: string[];
  className?: string;
  particleDensity?: number;
  reactToClick?: boolean;
}

const InteractiveEnergyField: React.FC<InteractiveEnergyFieldProps> = ({
  energyPoints = 100,
  colors = ['#8B5CF6', '#6366F1', '#4F46E5', '#A78BFA', '#C4B5FD'],
  className = '',
  particleDensity = 1,
  reactToClick = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [particles, setParticles] = useState<Array<{ 
    id: number, 
    x: number, 
    y: number, 
    size: number, 
    color: string, 
    vx: number, 
    vy: number,
    opacity: number
  }>>([]);
  const [mousePosition, setMousePosition] = useState<{ x: number, y: number } | null>(null);
  const [clickWave, setClickWave] = useState<{ x: number, y: number, active: boolean } | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const isMounted = useRef(true);
  
  // Update container dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    
    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => {
      if (containerRef.current) {
        resizeObserver.disconnect();
      }
    };
  }, []);
  
  // Create particles when dimensions change or energy points update
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0 || !isMounted.current) return;
    
    // Calculate number of particles based on energy and density
    const particleCount = Math.min(Math.floor((energyPoints / 100) * particleDensity * 10), 100);
    
    const newParticles = [];
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        size: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.3
      });
    }
    
    setParticles(newParticles);
  }, [dimensions.width, dimensions.height, energyPoints, colors, particleDensity]);
  
  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current && isMounted.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  // Handle click events to create energy waves
  useEffect(() => {
    if (!reactToClick) return;
    
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && isMounted.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setClickWave({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          active: true
        });
        
        // Reset click wave after animation
        setTimeout(() => {
          if (isMounted.current) {
            setClickWave(null);
          }
        }, 1000);
      }
    };
    
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [reactToClick]);
  
  // Setup component lifecycle
  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
      // Clean up animation frame if component unmounts
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []);
  
  // Update particle positions with a more efficient approach
  useEffect(() => {
    if (particles.length === 0) return;
    
    const updateParticles = () => {
      if (!isMounted.current) return;
      
      setParticles(prevParticles => {
        return prevParticles.map(particle => {
          let { x, y, vx, vy } = particle;
          
          // Apply mouse influence if nearby
          if (mousePosition) {
            const dx = mousePosition.x - x;
            const dy = mousePosition.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Apply gentle attraction/repulsion based on distance
            if (distance < 100) {
              const force = 0.2 * (1 - distance / 100);
              vx += dx * force * 0.01;
              vy += dy * force * 0.01;
            }
          }
          
          // Update position
          x += vx;
          y += vy;
          
          // Bounce off walls
          if (x < 0 || x > dimensions.width) vx = -vx * 0.8;
          if (y < 0 || y > dimensions.height) vy = -vy * 0.8;
          
          // Apply friction
          vx *= 0.99;
          vy *= 0.99;
          
          return {
            ...particle,
            x, y, vx, vy
          };
        });
      });
      
      if (isMounted.current) {
        animationFrameIdRef.current = requestAnimationFrame(updateParticles);
      }
    };
    
    animationFrameIdRef.current = requestAnimationFrame(updateParticles);
    return () => {
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
    };
  }, [particles.length, dimensions, mousePosition]);
  
  // Memoize the background glow to prevent re-renders
  const backgroundGlow = useMemo(() => {
    return (
      <div 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          width: Math.min(dimensions.width, dimensions.height) * 0.5,
          height: Math.min(dimensions.width, dimensions.height) * 0.5,
          opacity: 0.15,
          background: `radial-gradient(circle, ${colors[0]} 0%, rgba(0,0,0,0) 70%)`,
        }}
      />
    );
  }, [dimensions, colors]);
  
  return (
    <div 
      ref={containerRef} 
      className={`relative overflow-hidden ${className}`}
      style={{ minHeight: '200px' }}
    >
      {/* Render particles */}
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full pointer-events-none"
          animate={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            opacity: particle.opacity,
          }}
          transition={{
            duration: 0.5,
            ease: "linear"
          }}
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
        />
      ))}
      
      {/* Render click wave effect */}
      {clickWave && clickWave.active && (
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            left: clickWave.x,
            top: clickWave.y,
            backgroundColor: 'transparent',
            border: '2px solid rgba(255, 255, 255, 0.6)',
            transform: 'translate(-50%, -50%)',
          }}
          initial={{ width: 0, height: 0, opacity: 1 }}
          animate={{ 
            width: 200, 
            height: 200, 
            opacity: 0,
            borderColor: ['rgba(255, 255, 255, 0.6)', 'rgba(138, 92, 246, 0)']
          }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      )}
      
      {/* Add subtle glow effect in the center */}
      {backgroundGlow}
    </div>
  );
};

export default React.memo(InteractiveEnergyField);
