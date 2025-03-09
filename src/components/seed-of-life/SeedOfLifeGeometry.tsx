
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface SeedOfLifeGeometryProps {
  energy: number;
  resonanceLevel: number;
  size?: number;
  onClick?: () => void;
  className?: string;
}

/**
 * Renders the Sacred Geometry pattern of the Seed of Life
 * with interactive energy visualization
 */
const SeedOfLifeGeometry: React.FC<SeedOfLifeGeometryProps> = ({
  energy,
  resonanceLevel,
  size = 300,
  onClick,
  className
}) => {
  // Calculate dimensions
  const center = size / 2;
  const radius = size / 4;
  
  // Generate the circles for the Seed of Life pattern
  const circles = useMemo(() => {
    // Center circle plus 6 circles arranged in a hexagonal pattern
    const points = [];
    // Center circle
    points.push({ cx: center, cy: center });
    
    // Surrounding circles
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      points.push({ cx: x, cy: y });
    }
    
    return points;
  }, [center, radius]);

  // Calculate energy-based properties
  const energyOpacity = 0.2 + (energy / 100) * 0.8;
  const energyScale = 0.9 + (energy / 100) * 0.3;
  const glowIntensity = (energy / 100) * 15;
  
  // Resonance level affects color and complexity
  const getResonanceColor = (level: number) => {
    switch(level) {
      case 1: return '#A78BFA'; // Purple
      case 2: return '#60A5FA'; // Blue
      case 3: return '#34D399'; // Green
      case 4: return '#F472B6'; // Pink
      case 5: return '#FBBF24'; // Gold
      default: return '#A78BFA';
    }
  };
  
  const baseColor = getResonanceColor(resonanceLevel);
  
  return (
    <motion.div 
      className={`relative cursor-pointer ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ 
          filter: `drop-shadow(0 0 ${glowIntensity}px ${baseColor})`,
          transition: 'filter 0.5s ease'
        }}
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={resonanceLevel * 1.5} result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={baseColor} stopOpacity={energyOpacity} />
            <stop offset="100%" stopColor={baseColor} stopOpacity={energyOpacity * 0.7} />
          </linearGradient>
          
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={baseColor} stopOpacity={0.8} />
            <stop offset="100%" stopColor={baseColor} stopOpacity={0.3} />
          </linearGradient>
        </defs>
        
        {/* Background circles */}
        <g opacity={energyOpacity}>
          {circles.map((circle, index) => (
            <circle
              key={`circle-${index}`}
              cx={circle.cx}
              cy={circle.cy}
              r={radius}
              fill="none"
              stroke="url(#circleGradient)"
              strokeWidth={2}
              opacity={index === 0 ? 1 : 0.8}
            />
          ))}
        </g>
        
        {/* Connection lines */}
        <g opacity={energyOpacity * 0.7}>
          {circles.map((circle, i) => (
            circles.map((target, j) => {
              // Only draw each line once
              if (j <= i) return null;
              
              return (
                <line
                  key={`line-${i}-${j}`}
                  x1={circle.cx}
                  y1={circle.cy}
                  x2={target.cx}
                  y2={target.cy}
                  stroke="url(#lineGradient)"
                  strokeWidth={1}
                  opacity={0.6}
                />
              );
            })
          ))}
        </g>
        
        {/* Energy pulse */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius * 1.5}
          fill="none"
          stroke={baseColor}
          strokeWidth={3}
          strokeOpacity={0.7}
          initial={{ scale: 0.8, opacity: 0.2 }}
          animate={{ 
            scale: energyScale,
            opacity: energyOpacity
          }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        />
        
        {/* Resonance indicators */}
        {Array.from({ length: resonanceLevel }).map((_, index) => (
          <motion.circle
            key={`resonance-${index}`}
            cx={center}
            cy={center}
            r={radius * 0.3 * (index + 1)}
            fill="none"
            stroke={baseColor}
            strokeWidth={1.5}
            strokeOpacity={0.5}
            initial={{ scale: 0.9, opacity: 0.5 }}
            animate={{ 
              scale: [0.9, 1.1, 0.9], 
              opacity: [0.5, 0.8, 0.5],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              repeatType: "reverse",
              delay: index * 0.5
            }}
          />
        ))}
      </svg>
      
      {/* Energy percentage indicator */}
      <div 
        className="absolute inset-0 flex items-center justify-center text-white font-medium"
        style={{ 
          fontSize: size * 0.08,
          textShadow: `0 0 10px ${baseColor}`
        }}
      >
        {Math.round(energy)}%
      </div>
    </motion.div>
  );
};

export default SeedOfLifeGeometry;
