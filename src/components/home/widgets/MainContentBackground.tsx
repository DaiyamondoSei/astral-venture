
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { usePerformance } from '@/contexts/PerformanceContext';

interface MainContentBackgroundProps {
  energyPoints: number;
}

const MainContentBackground: React.FC<MainContentBackgroundProps> = ({ 
  energyPoints 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isLowPerformance } = usePerformance();
  
  // Geometric particles animation
  useEffect(() => {
    if (!canvasRef.current || isLowPerformance) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const setDimensions = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };
    
    setDimensions();
    window.addEventListener('resize', setDimensions);
    
    // Create particles
    const particleCount = Math.min(100, Math.max(30, Math.floor(energyPoints / 10)));
    
    const particles: {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      connections: number[];
      color: string;
      shape: 'circle' | 'triangle' | 'square' | 'pentagon' | 'hexagon';
    }[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      const shapes = ['circle', 'triangle', 'square', 'pentagon', 'hexagon'] as const;
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        connections: [],
        color: `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1})`,
        shape: shapes[Math.floor(Math.random() * shapes.length)]
      });
    }
    
    // Draw a geometric shape based on type
    const drawShape = (x: number, y: number, size: number, shape: typeof particles[0]['shape'], color: string) => {
      ctx.fillStyle = color;
      
      switch(shape) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'triangle':
          ctx.beginPath();
          ctx.moveTo(x, y - size);
          ctx.lineTo(x + size * 0.866, y + size * 0.5);
          ctx.lineTo(x - size * 0.866, y + size * 0.5);
          ctx.closePath();
          ctx.fill();
          break;
          
        case 'square':
          ctx.fillRect(x - size, y - size, size * 2, size * 2);
          break;
          
        case 'pentagon':
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
            const px = x + size * Math.cos(angle);
            const py = y + size * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
          break;
          
        case 'hexagon':
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (i * 2 * Math.PI / 6);
            const px = x + size * Math.cos(angle);
            const py = y + size * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
          break;
      }
    };
    
    // Find connections between close particles
    const findConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        particles[i].connections = [];
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Connect if close enough
          if (distance < 100) {
            particles[i].connections.push(j);
          }
        }
      }
    };
    
    // Animation loop
    const animate = () => {
      // Clear canvas with a fading effect for trails
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // Move particles
        p.x += p.speedX;
        p.y += p.speedY;
        
        // Bounce off edges
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
        
        // Draw the particle
        drawShape(p.x, p.y, p.size * 2, p.shape, p.color);
        
        // Draw connections
        for (const j of p.connections) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Calculate opacity based on distance
          const opacity = 1 - (distance / 100);
          
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.2})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
      
      // Periodically find new connections
      if (Math.random() < 0.05) {
        findConnections();
      }
      
      requestAnimationFrame(animate);
    };
    
    // Initial connections
    findConnections();
    
    // Start animation
    const animationId = requestAnimationFrame(animate);
    
    return () => {
      window.removeEventListener('resize', setDimensions);
      cancelAnimationFrame(animationId);
    };
  }, [energyPoints, isLowPerformance]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Fallback gradient background for low-performance devices */}
      <div className="absolute inset-0 bg-gradient-radial from-quantum-500/5 via-transparent to-transparent" />
      
      {/* Starfield background - static for low performance, animated for high performance */}
      <div className="absolute inset-0">
        {isLowPerformance ? (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-quantum-900/20 via-black/5 to-transparent" />
        ) : (
          <motion.div 
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
          >
            <canvas 
              ref={canvasRef} 
              className="absolute inset-0 w-full h-full" 
            />
          </motion.div>
        )}
      </div>
      
      {/* Subtle energy waves */}
      <motion.div 
        className="absolute inset-0 bg-gradient-radial from-quantum-500/10 via-transparent to-transparent"
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity,
          repeatType: "reverse", 
          ease: "easeInOut" 
        }}
      />
    </div>
  );
};

export default MainContentBackground;
