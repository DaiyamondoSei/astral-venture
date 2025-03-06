
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface MetatronsBackgroundProps {
  energyPoints?: number;
  opacity?: number;
  enableAnimation?: boolean;
}

const MetatronsBackground: React.FC<MetatronsBackgroundProps> = ({
  energyPoints = 0,
  opacity = 0.15,
  enableAnimation = true
}) => {
  // Calculate complexity based on energy points
  const complexity = Math.min(Math.floor(energyPoints / 100) + 2, 6);
  
  // Calculate rotation duration based on energy
  const rotationDuration = Math.max(120 - energyPoints / 20, 60);
  
  // Calculate pulsation intensity
  const pulsationIntensity = Math.min(0.2 + energyPoints / 2000, 0.4);

  // Memoize the generated elements to prevent unnecessary re-renders
  const { circles, lines, sacredShapes } = useMemo(() => {
    // Generate circles for Metatron's Cube
    const generatedCircles = Array.from({ length: complexity }).map((_, index) => {
      const radius = (40 - index * 4);
      return (
        <motion.circle
          key={`circle-${index}`}
          cx="50%"
          cy="50%"
          r={`${radius}%`}
          fill="none"
          stroke="currentColor"
          strokeWidth={0.3 + (index * 0.1)}
          className="text-purple-500/30"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: opacity,
            strokeDashoffset: enableAnimation ? [0, 1000] : 0
          }}
          transition={{ 
            opacity: { duration: 1 },
            strokeDashoffset: { 
              duration: rotationDuration + (index * 10), 
              repeat: Infinity,
              ease: "linear" 
            }
          }}
          strokeDasharray={index % 2 === 0 ? "4 4" : "1 8"}
        />
      );
    });
    
    // Generate lines connecting the nodes in Metatron's Cube
    const generatedLines = [];
    
    // Helper function to create line with specific angle
    const createLine = (angle: number, index: number) => {
      const length = 38; // Percentage of the viewBox
      const x1 = 50;
      const y1 = 50;
      const x2 = x1 + length * Math.cos(angle);
      const y2 = y1 + length * Math.sin(angle);
      
      return (
        <motion.line
          key={`line-${index}`}
          x1={`${x1}%`}
          y1={`${y1}%`}
          x2={`${x2}%`}
          y2={`${y2}%`}
          stroke="currentColor"
          strokeWidth={0.5}
          className="text-purple-400/20"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: opacity,
            rotate: enableAnimation ? [0, 360] : 0
          }}
          transition={{ 
            opacity: { duration: 1 },
            rotate: { 
              duration: rotationDuration * 2,
              repeat: Infinity,
              ease: "linear"
            }
          }}
        />
      );
    };
    
    // Create 6 or 12 lines (depending on energy level)
    const lineCount = energyPoints > 500 ? 12 : 6;
    
    for (let i = 0; i < lineCount; i++) {
      const angle = (Math.PI * 2 * i) / lineCount;
      generatedLines.push(createLine(angle, i));
    }
    
    // Create internal connections if energy level is high enough
    if (energyPoints > 300) {
      for (let i = 0; i < 6; i++) {
        const angle1 = (Math.PI * 2 * i) / 6;
        const angle2 = (Math.PI * 2 * ((i + 2) % 6)) / 6;
        
        const radius = 30;
        const x1 = 50 + radius * Math.cos(angle1);
        const y1 = 50 + radius * Math.sin(angle1);
        const x2 = 50 + radius * Math.cos(angle2);
        const y2 = 50 + radius * Math.sin(angle2);
        
        generatedLines.push(
          <motion.line
            key={`connection-${i}`}
            x1={`${x1}%`}
            y1={`${y1}%`}
            x2={`${x2}%`}
            y2={`${y2}%`}
            stroke="currentColor"
            strokeWidth={0.3}
            className="text-blue-400/20"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [opacity * 0.5, opacity, opacity * 0.5]
            }}
            transition={{ 
              opacity: { 
                duration: 4 + i,
                repeat: Infinity,
                repeatType: "reverse"
              }
            }}
          />
        );
      }
    }
    
    // Add sacred geometry shapes for higher energy levels
    let generatedSacredShapes = null;
    
    if (energyPoints > 600) {
      generatedSacredShapes = (
        <motion.polygon
          points="50,20 80,65 35,90 20,65 65,40"
          fill="none"
          stroke="currentColor"
          strokeWidth={0.4}
          className="text-indigo-400/20"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: opacity,
            rotate: enableAnimation ? [0, 360] : 0,
            scale: [1, 1 + pulsationIntensity, 1]
          }}
          transition={{ 
            opacity: { duration: 1 },
            rotate: { 
              duration: rotationDuration,
              repeat: Infinity,
              ease: "linear"
            },
            scale: {
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }
          }}
        />
      );
    }

    return { circles: generatedCircles, lines: generatedLines, sacredShapes: generatedSacredShapes };
  }, [complexity, rotationDuration, pulsationIntensity, enableAnimation, opacity, energyPoints]);
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {circles}
        {lines}
        {sacredShapes}
      </svg>
    </div>
  );
};

export default MetatronsBackground;
