
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAdaptivePerformance } from '@/contexts/AdaptivePerformanceContext';

interface CosmicBackgroundProps {
  intensity?: 'low' | 'medium' | 'high';
  animationSpeed?: number;
  colorScheme?: 'default' | 'ethereal' | 'astral' | 'quantum';
  className?: string;
}

const CosmicBackground: React.FC<CosmicBackgroundProps> = ({
  intensity = 'medium',
  animationSpeed = 1,
  colorScheme = 'default',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const adaptivePerf = useAdaptivePerformance();
  
  // Calculate number of stars based on performance capabilities
  const getStarCount = () => {
    const intensityMultiplier = intensity === 'low' ? 0.5 : intensity === 'medium' ? 1 : 2;
    const baseCount = 100;
    
    if (adaptivePerf) {
      return adaptivePerf.adaptElementCount(baseCount * intensityMultiplier);
    }
    
    return baseCount * intensityMultiplier;
  };
  
  // Map color scheme to color values
  const getColorScheme = () => {
    switch (colorScheme) {
      case 'ethereal':
        return {
          background: 'from-[#030014] via-[#0F0527] to-[#10031c]',
          particlePrimary: '#8B5CF6',
          particleSecondary: '#6D28D9',
          glowColor: 'rgba(139, 92, 246, 0.5)'
        };
      case 'astral':
        return {
          background: 'from-[#040720] via-[#0F1A40] to-[#0A0F33]',
          particlePrimary: '#3B82F6',
          particleSecondary: '#1D4ED8',
          glowColor: 'rgba(59, 130, 246, 0.5)'
        };
      case 'quantum':
        return {
          background: 'from-[#0C0A20] via-[#231748] to-[#190A38]',
          particlePrimary: '#EC4899',
          particleSecondary: '#BE185D',
          glowColor: 'rgba(236, 72, 153, 0.5)'
        };
      default:
        return {
          background: 'from-[#221F26] via-[#2C2B33] to-[#191A23]',
          particlePrimary: '#A78BFA',
          particleSecondary: '#7C3AED',
          glowColor: 'rgba(167, 139, 250, 0.5)'
        };
    }
  };
  
  const colors = getColorScheme();

  // Canvas-based star background animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);

    // Create stars
    const starCount = getStarCount();
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.8 + 0.2,
      speed: (Math.random() * 0.05 + 0.02) * animationSpeed,
      hue: Math.random() * 60 - 30, // Variation in color hue
    }));

    // Create constellations (connected stars)
    const constellationCount = Math.floor(starCount / 20);
    const constellations = Array.from({ length: constellationCount }, () => {
      const centerX = Math.random() * canvas.width;
      const centerY = Math.random() * canvas.height;
      const nodeCount = Math.floor(Math.random() * 4) + 3;
      
      return {
        nodes: Array.from({ length: nodeCount }, () => ({
          x: centerX + (Math.random() * 200 - 100),
          y: centerY + (Math.random() * 200 - 100),
          radius: Math.random() * 1.5 + 0.5,
        })),
        opacity: Math.random() * 0.2 + 0.1,
        color: Math.random() > 0.5 ? colors.particlePrimary : colors.particleSecondary,
      };
    });

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw stars
      stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        
        // Create a gradient for each star
        const gradient = ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, star.radius * 2
        );
        gradient.addColorStop(0, `hsla(${parseInt(colors.particlePrimary.slice(1), 16) + star.hue}, 100%, 90%, ${star.opacity})`);
        gradient.addColorStop(1, `hsla(${parseInt(colors.particlePrimary.slice(1), 16) + star.hue}, 100%, 90%, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Move stars
        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
      });
      
      // Draw constellations
      constellations.forEach(constellation => {
        for (let i = 0; i < constellation.nodes.length; i++) {
          const currentNode = constellation.nodes[i];
          
          // Draw node
          ctx.beginPath();
          ctx.arc(currentNode.x, currentNode.y, currentNode.radius, 0, Math.PI * 2);
          ctx.fillStyle = constellation.color;
          ctx.fill();
          
          // Connect nodes
          if (i < constellation.nodes.length - 1) {
            const nextNode = constellation.nodes[i + 1];
            ctx.beginPath();
            ctx.moveTo(currentNode.x, currentNode.y);
            ctx.lineTo(nextNode.x, nextNode.y);
            ctx.strokeStyle = `${constellation.color.replace(')', `, ${constellation.opacity})`).replace('rgb', 'rgba')}`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      window.removeEventListener('resize', setCanvasDimensions);
      cancelAnimationFrame(animationFrameId);
    };
  }, [colorScheme, intensity, animationSpeed]);

  return (
    <div className={`fixed inset-0 overflow-hidden ${className}`}>
      {/* Base gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.background}`} />
      
      {/* Canvas for star animation */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0"
        style={{ mixBlendMode: 'screen' }}
      />
      
      {/* Optional overlay for nebula effect */}
      <motion.div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, ${colors.glowColor} 0%, transparent 50%)`,
          mixBlendMode: 'screen'
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.35, 0.2]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};

export default CosmicBackground;
