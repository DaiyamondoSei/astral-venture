
import React, { useRef, useEffect, memo } from 'react';

interface StarFieldProps {
  intensity: 'low' | 'medium' | 'high';
  animationSpeed: number;
  colorScheme: string;
  primaryColor: string;
  secondaryColor: string;
}

const StarField = memo(({ 
  intensity, 
  animationSpeed, 
  colorScheme,
  primaryColor,
  secondaryColor
}: StarFieldProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Calculate number of stars based on intensity
  const getStarCount = () => {
    const baseCount = 100;
    switch (intensity) {
      case 'low': return baseCount * 0.5;
      case 'high': return baseCount * 2;
      default: return baseCount;
    }
  };

  // Canvas-based star animation
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
        gradient.addColorStop(0, `hsla(${parseInt(primaryColor.slice(1), 16) + star.hue}, 100%, 90%, ${star.opacity})`);
        gradient.addColorStop(1, `hsla(${parseInt(primaryColor.slice(1), 16) + star.hue}, 100%, 90%, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Move stars
        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      window.removeEventListener('resize', setCanvasDimensions);
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity, animationSpeed, primaryColor]);

  return (
    <canvas 
      ref={canvasRef}
      className="absolute inset-0"
      style={{ mixBlendMode: 'screen' }}
    />
  );
});

StarField.displayName = 'StarField';

export default StarField;
