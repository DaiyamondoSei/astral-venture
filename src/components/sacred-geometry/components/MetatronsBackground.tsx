
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface MetatronsBackgroundProps {
  energyPoints?: number;
  opacity?: number;
  enableAnimation?: boolean;
  interactivity?: 'none' | 'basic' | 'advanced';
  consciousnessLevel?: number;
}

const MetatronsBackground: React.FC<MetatronsBackgroundProps> = ({
  energyPoints = 0,
  opacity = 0.15,
  enableAnimation = true,
  interactivity = 'basic',
  consciousnessLevel = 1
}) => {
  // Calculate complexity based on energy points
  const complexity = Math.min(Math.floor(energyPoints / 100) + 2, 6);
  
  // Calculate rotation duration based on energy and consciousness
  const rotationDuration = Math.max(120 - (energyPoints / 20) - (consciousnessLevel * 5), 30);
  
  // Calculate pulsation intensity
  const pulsationIntensity = Math.min(0.2 + (energyPoints / 2000) + (consciousnessLevel / 20), 0.5);
  
  // Calculate color intensity based on consciousness level
  const colorIntensity = Math.min(0.5 + (consciousnessLevel / 10), 1);
  
  // Generate colors based on consciousness level
  const getColor = (baseColor: string, alpha: number): string => {
    // Higher consciousness levels shift colors toward more violet/indigo tones
    if (consciousnessLevel > 3) {
      switch(baseColor) {
        case 'purple-400': return `rgba(167, 139, 250, ${alpha})`;  // More vibrant purple
        case 'purple-500': return `rgba(139, 92, 246, ${alpha})`;   // Standard purple
        case 'blue-400': return `rgba(129, 140, 248, ${alpha})`;    // Indigo-ish
        case 'quantum-400': return `rgba(124, 58, 237, ${alpha * 1.2})`;  // More vivid
        case 'quantum-500': return `rgba(109, 40, 217, ${alpha * 1.2})`;  // Deeper quantum
        case 'indigo-400': return `rgba(165, 180, 252, ${alpha * 1.1})`;  // Lighter indigo
        default: return `rgba(139, 92, 246, ${alpha})`;             // Default to purple
      }
    }
    // Default colors for regular consciousness levels
    switch(baseColor) {
      case 'purple-400': return `rgba(167, 139, 250, ${alpha})`;
      case 'purple-500': return `rgba(139, 92, 246, ${alpha})`;
      case 'blue-400': return `rgba(96, 165, 250, ${alpha})`;
      case 'quantum-400': return `rgba(124, 58, 237, ${alpha})`;
      case 'quantum-500': return `rgba(109, 40, 217, ${alpha})`;
      case 'indigo-400': return `rgba(129, 140, 248, ${alpha})`;
      default: return `rgba(139, 92, 246, ${alpha})`;
    }
  };

  // Memoize the generated elements to prevent unnecessary re-renders
  const { circles, lines, sacredShapes } = useMemo(() => {
    // Generate circles for Metatron's Cube
    const generatedCircles = Array.from({ length: complexity }).map((_, index) => {
      const radius = (40 - index * 4);
      const circleOpacity = opacity * (0.7 + (index / complexity) * 0.3) * colorIntensity;
      
      return (
        <motion.circle
          key={`circle-${index}`}
          cx="50%"
          cy="50%"
          r={`${radius}%`}
          fill="none"
          stroke={getColor(index % 2 === 0 ? 'purple-500' : 'quantum-400', circleOpacity)}
          strokeWidth={0.3 + (index * 0.1)}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: circleOpacity,
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
      const lineOpacity = opacity * (0.9 - (index % 3) * 0.2) * colorIntensity;
      
      return (
        <motion.line
          key={`line-${index}`}
          x1={`${x1}%`}
          y1={`${y1}%`}
          x2={`${x2}%`}
          y2={`${y2}%`}
          stroke={getColor(index % 3 === 0 ? 'quantum-500' : (index % 3 === 1 ? 'purple-400' : 'indigo-400'), lineOpacity)}
          strokeWidth={0.5}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: lineOpacity,
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
    
    // Create lines based on energy level
    const lineCount = energyPoints > 500 ? 12 : (energyPoints > 300 ? 9 : 6);
    
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
        const connectionOpacity = opacity * 0.8 * colorIntensity;
        
        generatedLines.push(
          <motion.line
            key={`connection-${i}`}
            x1={`${x1}%`}
            y1={`${y1}%`}
            x2={`${x2}%`}
            y2={`${y2}%`}
            stroke={getColor('blue-400', connectionOpacity)}
            strokeWidth={0.3}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [connectionOpacity * 0.5, connectionOpacity, connectionOpacity * 0.5]
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
    
    if (energyPoints > 500) {
      // Higher consciousness levels get more complex sacred geometry
      if (consciousnessLevel >= 3) {
        // Use vesica piscis for higher consciousness
        generatedSacredShapes = (
          <motion.g>
            <motion.circle
              cx="40%"
              cy="50%"
              r="20%"
              fill="none"
              stroke={getColor('quantum-400', opacity * 0.25 * colorIntensity)}
              strokeWidth={0.4}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: opacity * 0.25 * colorIntensity,
                rotate: enableAnimation ? [0, 360] : 0,
                scale: [1, 1 + pulsationIntensity * 0.5, 1]
              }}
              transition={{ 
                opacity: { duration: 1 },
                rotate: { 
                  duration: rotationDuration,
                  repeat: Infinity,
                  ease: "linear"
                },
                scale: {
                  duration: 15,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }
              }}
            />
            <motion.circle
              cx="60%"
              cy="50%"
              r="20%"
              fill="none"
              stroke={getColor('purple-500', opacity * 0.25 * colorIntensity)}
              strokeWidth={0.4}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: opacity * 0.25 * colorIntensity,
                rotate: enableAnimation ? [0, -360] : 0,
                scale: [1, 1 + pulsationIntensity * 0.5, 1]
              }}
              transition={{ 
                opacity: { duration: 1 },
                rotate: { 
                  duration: rotationDuration * 1.1,
                  repeat: Infinity,
                  ease: "linear"
                },
                scale: {
                  duration: 18,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }
              }}
            />
          </motion.g>
        );
      } else {
        // Use simpler sacred geometry for regular consciousness
        generatedSacredShapes = (
          <motion.polygon
            points="50,20 80,65 35,90 20,65 65,40"
            fill="none"
            stroke={getColor('purple-400', opacity * 0.3 * colorIntensity)}
            strokeWidth={0.4}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: opacity * 0.3 * colorIntensity,
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
    }

    // If energy points are very high, add flower of life pattern
    if (energyPoints > 800 && consciousnessLevel > 2) {
      // Create a flower of life pattern
      const flowerRadius = 10;
      const centers = [
        [50, 50],  // Center
        [50 + flowerRadius * Math.cos(0), 50 + flowerRadius * Math.sin(0)],
        [50 + flowerRadius * Math.cos(Math.PI/3), 50 + flowerRadius * Math.sin(Math.PI/3)],
        [50 + flowerRadius * Math.cos(2*Math.PI/3), 50 + flowerRadius * Math.sin(2*Math.PI/3)],
        [50 + flowerRadius * Math.cos(Math.PI), 50 + flowerRadius * Math.sin(Math.PI)],
        [50 + flowerRadius * Math.cos(4*Math.PI/3), 50 + flowerRadius * Math.sin(4*Math.PI/3)],
        [50 + flowerRadius * Math.cos(5*Math.PI/3), 50 + flowerRadius * Math.sin(5*Math.PI/3)]
      ];
      
      const flowerOfLife = (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: opacity * 0.3 * colorIntensity,
            rotate: [0, 360],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            opacity: { duration: 2 },
            rotate: { 
              duration: 120,
              repeat: Infinity,
              ease: "linear"
            },
            scale: {
              duration: 15,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }
          }}
        >
          {centers.map((center, index) => (
            <circle
              key={`flower-${index}`}
              cx={`${center[0]}%`}
              cy={`${center[1]}%`}
              r="8%"
              fill="none"
              stroke={getColor('quantum-500', opacity * 0.2 * colorIntensity)}
              strokeWidth={0.3}
            />
          ))}
        </motion.g>
      );
      
      generatedSacredShapes = (
        <>
          {generatedSacredShapes}
          {flowerOfLife}
        </>
      );
    }

    return { circles: generatedCircles, lines: generatedLines, sacredShapes: generatedSacredShapes };
  }, [complexity, rotationDuration, pulsationIntensity, enableAnimation, opacity, energyPoints, consciousnessLevel, colorIntensity]);
  
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
