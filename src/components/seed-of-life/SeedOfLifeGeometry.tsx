
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePerfConfig } from '@/hooks/usePerfConfig';

interface SeedOfLifeGeometryProps {
  size?: number;
  activated?: boolean;
  energy?: number; // 0-100
  resonanceLevel?: number; // 1-5
  primaryColor?: string;
  secondaryColor?: string;
  className?: string;
}

/**
 * SeedOfLifeGeometry renders the sacred geometric pattern of the Seed of Life
 * with animation and energy effects
 */
const SeedOfLifeGeometry: React.FC<SeedOfLifeGeometryProps> = ({
  size = 240,
  activated = false,
  energy = 0,
  resonanceLevel = 1,
  primaryColor = '#8B5CF6',
  secondaryColor = '#EC4899',
  className
}) => {
  const { config } = usePerfConfig();
  
  // Determine if we should use simpler rendering based on device capability
  const shouldUseSimpleRendering = config.deviceCapability === 'low';
  
  // Calculate colors and styles based on activation state
  const circleColor = useMemo(() => {
    return activated
      ? primaryColor  
      : `rgba(255, 255, 255, ${0.4 + (energy / 100) * 0.4})`;
  }, [activated, energy, primaryColor]);
  
  const glowColor = useMemo(() => {
    return activated
      ? secondaryColor
      : primaryColor;
  }, [activated, primaryColor, secondaryColor]);
  
  // Calculate glow intensity based on activation and resonance
  const glowIntensity = useMemo(() => {
    if (!activated) return Math.min(10, energy / 10);
    return 10 + (resonanceLevel * 5);
  }, [activated, energy, resonanceLevel]);
  
  // Generate the circle positions for the Seed of Life pattern
  const circlePositions = useMemo(() => {
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 4;
    
    // Center circle
    const positions = [{ cx: centerX, cy: centerY }];
    
    // Surrounding 6 circles in hexagonal pattern
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      positions.push({
        cx: centerX + radius * Math.cos(angle),
        cy: centerY + radius * Math.sin(angle)
      });
    }
    
    return positions;
  }, [size]);
  
  // Animation variants based on activation state
  const circleVariants = {
    inactive: {
      opacity: 0.7,
      filter: `drop-shadow(0 0 ${Math.min(5, glowIntensity / 2)}px ${circleColor})`
    },
    active: {
      opacity: 0.9,
      filter: `drop-shadow(0 0 ${glowIntensity}px ${glowColor})`
    }
  };
  
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
        className="transform transition-transform"
      >
        {/* Optional background effect for better visibility */}
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={size / 2.2} 
          fill="rgba(0, 0, 0, 0.3)"
          className="pointer-events-none"
        />
        
        {/* Draw circles for the Seed of Life pattern */}
        {circlePositions.map((pos, index) => (
          <motion.circle
            key={`seed-circle-${index}`}
            cx={pos.cx}
            cy={pos.cy}
            r={size / 6}
            fill="none"
            stroke={circleColor}
            strokeWidth={activated ? 2 : 1.5}
            variants={circleVariants}
            initial="inactive"
            animate={activated ? "active" : "inactive"}
            transition={{ 
              duration: 0.5,
              delay: index * 0.1
            }}
            className="pointer-events-none"
          />
        ))}
        
        {/* Draw connecting lines between circles */}
        {activated && !shouldUseSimpleRendering && (
          <g className="pointer-events-none">
            {circlePositions.map((startPos, i) => (
              circlePositions.slice(i + 1).map((endPos, j) => (
                <motion.line
                  key={`line-${i}-${j}`}
                  x1={startPos.cx}
                  y1={startPos.cy}
                  x2={endPos.cx}
                  y2={endPos.cy}
                  stroke={`${primaryColor}60`}
                  strokeWidth={1}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  transition={{ duration: 1, delay: 0.5 + (i + j) * 0.1 }}
                />
              ))
            ))}
          </g>
        )}
        
        {/* Central point/energy source */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={activated ? size / 16 : size / 20}
          fill={activated ? secondaryColor : primaryColor}
          initial={{ opacity: 0.7, scale: 0.9 }}
          animate={{ 
            opacity: activated ? 0.9 : 0.7 + (energy / 100) * 0.2,
            scale: activated ? [1, 1.1, 1] : 0.9 + (energy / 100) * 0.1
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            repeatType: "reverse" 
          }}
          className="pointer-events-none"
        />
        
        {/* Optional energy ripple effect */}
        {activated && (
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={size / 16}
            fill="none"
            stroke={secondaryColor}
            strokeWidth={2}
            initial={{ opacity: 0, scale: 1 }}
            animate={{ 
              opacity: [0, 0.5, 0], 
              scale: [1, 2.5, 3],
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              repeatDelay: 1
            }}
            className="pointer-events-none"
          />
        )}
      </svg>
    </div>
  );
};

export default SeedOfLifeGeometry;
