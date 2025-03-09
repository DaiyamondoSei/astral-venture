
import React from 'react';
import { motion } from 'framer-motion';
import { usePerfConfig } from '@/hooks/usePerfConfig';
import { cn } from '@/lib/utils';

interface SeedOfLifeGeometryProps {
  size?: number;
  energy?: number;
  resonanceLevel?: number;
  isActive?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 * A geometrically accurate Seed of Life sacred geometry pattern
 * with animated energy levels and resonance visualization
 */
const SeedOfLifeGeometry: React.FC<SeedOfLifeGeometryProps> = ({
  size = 200,
  energy = 0,
  resonanceLevel = 1,
  isActive = false,
  className,
  onClick
}) => {
  const { config } = usePerfConfig();
  const isLowPerfDevice = config.deviceCapability === 'low';
  
  // Calculate radius and center point
  const radius = size / 2;
  const centerX = radius;
  const centerY = radius;
  
  // Generate the 7 circles of the Seed of Life
  const circles = [];
  
  // Center circle
  circles.push({ cx: centerX, cy: centerY, r: radius / 3 });
  
  // Outer 6 circles
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = centerX + (radius / 3) * Math.cos(angle);
    const y = centerY + (radius / 3) * Math.sin(angle);
    circles.push({ cx: x, cy: y, r: radius / 3 });
  }
  
  // Calculate energy fill percentage
  const energyPercentage = energy / 100;
  
  // Generate resonance rings based on resonance level
  const resonanceRings = [];
  for (let i = 0; i < resonanceLevel; i++) {
    const ringRadius = radius + (i + 1) * 5;
    resonanceRings.push(ringRadius);
  }
  
  // Simple version for low performance devices
  if (isLowPerfDevice) {
    return (
      <motion.div
        className={cn(
          "relative cursor-pointer rounded-full flex items-center justify-center bg-black/20 backdrop-blur-sm",
          className
        )}
        style={{
          width: size,
          height: size,
          border: `2px solid rgba(255, 255, 255, ${0.2 + energyPercentage * 0.5})`,
        }}
        animate={{
          boxShadow: isActive
            ? [
                `0 0 ${10 + energyPercentage * 20}px rgba(138, 43, 226, ${0.2 + energyPercentage * 0.6})`,
                `0 0 ${20 + energyPercentage * 30}px rgba(138, 43, 226, ${0.3 + energyPercentage * 0.5})`,
                `0 0 ${10 + energyPercentage * 20}px rgba(138, 43, 226, ${0.2 + energyPercentage * 0.6})`
              ]
            : `0 0 ${5 + energyPercentage * 10}px rgba(138, 43, 226, ${0.1 + energyPercentage * 0.3})`
        }}
        transition={{ 
          duration: 2, 
          repeat: isActive ? Infinity : 0,
          repeatType: "reverse"
        }}
        onClick={onClick}
      >
        <div className="text-white text-lg font-semibold">
          {Math.round(energy)}%
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div 
      className={cn("relative cursor-pointer", className)}
      style={{ width: size, height: size }}
      onClick={onClick}
    >
      {/* Resonance rings */}
      {resonanceRings.map((ringRadius, index) => (
        <motion.div
          key={`ring-${index}`}
          className="absolute rounded-full border-purple-400"
          style={{
            width: ringRadius * 2,
            height: ringRadius * 2,
            top: size / 2 - ringRadius,
            left: size / 2 - ringRadius,
            borderWidth: 1,
            opacity: 0.2 + (index * 0.1),
          }}
          animate={{
            opacity: [0.2 + (index * 0.1), 0.5 + (index * 0.1), 0.2 + (index * 0.1)],
            scale: [1, 1.05, 1],
            borderColor: [
              'rgba(168, 85, 247, 0.4)',
              'rgba(168, 85, 247, 0.7)',
              'rgba(168, 85, 247, 0.4)'
            ]
          }}
          transition={{
            duration: 3 + index,
            repeat: Infinity,
            repeatType: "reverse",
            delay: index * 0.5
          }}
        />
      ))}
      
      {/* SVG for Seed of Life pattern */}
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
        className="absolute top-0 left-0"
      >
        {/* Background circle */}
        <motion.circle
          cx={centerX}
          cy={centerY}
          r={radius - 5}
          fill={`rgba(0, 0, 0, ${0.2 + energyPercentage * 0.3})`}
          stroke={`rgba(255, 255, 255, ${0.3 + energyPercentage * 0.5})`}
          strokeWidth={1.5}
          animate={{
            fill: isActive 
              ? [
                  `rgba(0, 0, 0, ${0.2 + energyPercentage * 0.3})`,
                  `rgba(55, 0, 179, ${0.15 + energyPercentage * 0.2})`,
                  `rgba(0, 0, 0, ${0.2 + energyPercentage * 0.3})`
                ]
              : `rgba(0, 0, 0, ${0.2 + energyPercentage * 0.3})`,
            stroke: isActive
              ? [
                  `rgba(255, 255, 255, ${0.3 + energyPercentage * 0.5})`,
                  `rgba(186, 104, 200, ${0.6 + energyPercentage * 0.4})`,
                  `rgba(255, 255, 255, ${0.3 + energyPercentage * 0.5})`
                ]
              : `rgba(255, 255, 255, ${0.3 + energyPercentage * 0.5})`
          }}
          transition={{ 
            duration: 3, 
            repeat: isActive ? Infinity : 0,
            repeatType: "reverse" 
          }}
        />
        
        {/* Seed of Life circles */}
        <g>
          {circles.map((circle, index) => (
            <motion.circle
              key={`circle-${index}`}
              cx={circle.cx}
              cy={circle.cy}
              r={circle.r}
              fill="none"
              stroke={`rgba(255, 255, 255, ${0.2 + energyPercentage * 0.8})`}
              strokeWidth={1}
              strokeDasharray={circle.r * 2 * Math.PI}
              strokeDashoffset={circle.r * 2 * Math.PI * (1 - Math.min(1, energyPercentage + 0.2))}
              animate={{
                strokeDashoffset: isActive
                  ? [
                      circle.r * 2 * Math.PI * (1 - Math.min(1, energyPercentage + 0.2)),
                      circle.r * 2 * Math.PI * (1 - Math.min(1, energyPercentage + 0.1)),
                      circle.r * 2 * Math.PI * (1 - Math.min(1, energyPercentage + 0.2))
                    ]
                  : circle.r * 2 * Math.PI * (1 - Math.min(1, energyPercentage + 0.2)),
                stroke: isActive
                  ? [
                      `rgba(255, 255, 255, ${0.2 + energyPercentage * 0.8})`,
                      `rgba(186, 104, 200, ${0.3 + energyPercentage * 0.7})`,
                      `rgba(255, 255, 255, ${0.2 + energyPercentage * 0.8})`
                    ]
                  : `rgba(255, 255, 255, ${0.2 + energyPercentage * 0.8})`
              }}
              transition={{ 
                duration: 2 + index * 0.5, 
                repeat: isActive ? Infinity : 0,
                repeatType: "reverse",
                delay: index * 0.1
              }}
            />
          ))}
        </g>
        
        {/* Energy text in the center */}
        <text
          x={centerX}
          y={centerY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={`rgba(255, 255, 255, ${0.7 + energyPercentage * 0.3})`}
          fontSize={radius / 4}
          fontWeight="bold"
        >
          {Math.round(energy)}%
        </text>
      </svg>
    </motion.div>
  );
};

export default SeedOfLifeGeometry;
