
import React, { useRef, useEffect, memo } from 'react';

interface ConstellationFieldProps {
  intensity: 'low' | 'medium' | 'high';
  colorScheme: string;
  primaryColor: string;
  secondaryColor: string;
}

const ConstellationField = memo(({ 
  intensity, 
  colorScheme,
  primaryColor,
  secondaryColor
}: ConstellationFieldProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Get constellation count based on intensity
  const getConstellationCount = () => {
    const baseCount = 5;
    switch (intensity) {
      case 'low': return baseCount;
      case 'high': return baseCount * 3;
      default: return baseCount * 2;
    }
  };

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

    // Create constellations (connected stars)
    const constellationCount = getConstellationCount();
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
        color: Math.random() > 0.5 ? primaryColor : secondaryColor,
      };
    });

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
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
  }, [intensity, primaryColor, secondaryColor]);

  return (
    <canvas 
      ref={canvasRef}
      className="absolute inset-0"
      style={{ mixBlendMode: 'screen' }}
    />
  );
});

ConstellationField.displayName = 'ConstellationField';

export default ConstellationField;
