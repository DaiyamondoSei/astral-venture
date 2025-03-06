
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface QuantumParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
  duration: number;
  delay: number;
}

interface QuantumParticlesProps {
  count?: number;
  colors?: string[];
  className?: string;
  interactive?: boolean;
}

const QuantumParticles: React.FC<QuantumParticlesProps> = ({
  count = 30,
  colors = ['#8B5CF6', '#6366F1', '#4F46E5', '#A78BFA', '#C4B5FD'],
  className = '',
  interactive = true
}) => {
  const [particles, setParticles] = useState<QuantumParticle[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Generate random particles only once on mount
  useEffect(() => {
    const newParticles: QuantumParticle[] = [];
    
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 5 + 1,
        opacity: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 5
      });
    }
    
    setParticles(newParticles);
  }, [count, colors]);
  
  // Track mouse position for interactive mode
  useEffect(() => {
    if (!interactive) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [interactive]);
  
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map(particle => {
        // Calculate movement based on mouse position if interactive
        const dx = interactive ? (mousePosition.x - particle.x) / 50 : 0;
        const dy = interactive ? (mousePosition.y - particle.y) / 50 : 0;
        
        return (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              opacity: particle.opacity,
            }}
            animate={{
              x: [0, dx * 10, 0],
              y: [0, dy * 10, 0],
              scale: [1, 1.2, 1],
              opacity: [particle.opacity, particle.opacity * 1.5, particle.opacity],
            }}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: particle.duration,
              delay: particle.delay,
              ease: "easeInOut"
            }}
          />
        );
      })}
    </div>
  );
};

export default QuantumParticles;
