
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface ChakraRaysProps {
  cx: number;
  cy: number;
  size: number;
  color: string;
  intensity: number;
  isActivated: boolean;
  showIllumination: boolean;
  index: number;
}

/**
 * Radiating energy rays for highly activated chakras
 */
const ChakraRays: React.FC<ChakraRaysProps> = ({
  cx,
  cy,
  size,
  color,
  intensity,
  isActivated,
  showIllumination,
  index
}) => {
  // Dynamic ray animation based on chakra intensity
  const rayRef = useRef<SVGGElement>(null);
  
  useEffect(() => {
    if (rayRef.current && isActivated && showIllumination && intensity > 0.7) {
      const rotateAnimation = () => {
        let angle = 0;
        const rotate = () => {
          if (rayRef.current) {
            angle += 0.2 * intensity;
            rayRef.current.style.transform = `rotate(${angle}deg)`;
            requestAnimationFrame(rotate);
          }
        };
        
        requestAnimationFrame(rotate);
      };
      
      rotateAnimation();
    }
  }, [isActivated, showIllumination, intensity]);
  
  // Rays variants for illuminated chakras
  const raysVariants = {
    initial: { 
      scale: 0, 
      opacity: 0 
    },
    animate: {
      scale: 1,
      opacity: intensity * 0.7,
      transition: { 
        duration: 1.5,
        delay: 0.5
      }
    }
  };

  if (!(isActivated && showIllumination && intensity > 0.7)) return null;

  return (
    <g ref={rayRef}>
      {/* More rays for a fuller effect */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
        <motion.line
          key={`ray-${index}-${i}`}
          x1={cx}
          y1={cy}
          x2={cx + Math.cos(angle * Math.PI / 180) * (size + 10 + intensity * 5)}
          y2={cy + Math.sin(angle * Math.PI / 180) * (size + 10 + intensity * 5)}
          stroke={color}
          strokeWidth="0.7"
          variants={raysVariants}
          initial="initial"
          animate="animate"
          custom={i * 0.1}
        />
      ))}
    </g>
  );
};

export default ChakraRays;
