
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface ResonanceLinesProps {
  resonanceLines: { start: number, end: number, intensity: number }[];
  chakraYPositions: number[];
  emotionalIntensity: number;
}

const ResonanceLines: React.FC<ResonanceLinesProps> = ({
  resonanceLines,
  chakraYPositions,
  emotionalIntensity
}) => {
  // Center positioning for the lines
  const centerX = 50;
  
  // Calculate colors based on emotional intensity
  const getLineColor = (intensity: number) => {
    // Create a color gradient based on intensity
    const hue = 260 - (intensity * 80); // Shift from purple to blue
    const saturation = 70 + (intensity * 30); // Increase saturation with intensity
    const lightness = 60 + (intensity * 15); // Brighter for higher intensity
    return `hsla(${hue}, ${saturation}%, ${lightness}%, ${Math.min(0.3 + intensity * 0.3, 0.7)})`;
  };
  
  // Enhanced line variants for animation
  const lineVariants = {
    initial: { 
      opacity: 0,
      pathLength: 0
    },
    animate: (intensity: number) => ({ 
      opacity: 0.1 + (intensity * 0.7),
      pathLength: 0.7 + (intensity * 0.3),
      transition: { 
        pathLength: { 
          duration: 1.5 + (intensity * 2),
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse"
        },
        opacity: {
          duration: 2 + (intensity * 2),
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse"
        }
      }
    })
  };

  // Pre-calculate lines for better performance
  const lineElements = useMemo(() => resonanceLines.map((line, index) => {
    // Get Y positions
    const y1 = chakraYPositions[line.start];
    const y2 = chakraYPositions[line.end];
    
    // Calculate control points for a smooth curve
    // Adjust curve based on distance and intensity
    const distance = Math.abs(y1 - y2);
    const amplitudeFactor = line.intensity * 10 * emotionalIntensity;
    const amplitude = distance * 0.3 * amplitudeFactor;
    
    // Curve points
    const xControl1 = centerX - amplitude;
    const xControl2 = centerX + amplitude;
    
    const pathData = `M ${centerX} ${y1} C ${xControl1} ${(y1 + y2) / 2}, ${xControl2} ${(y1 + y2) / 2}, ${centerX} ${y2}`;
    
    // Determine line width based on intensity and emotional state
    const lineWidth = Math.max(1, 1 + (line.intensity * 3 * emotionalIntensity));
    
    // Calculate color based on intensity
    const lineColor = getLineColor(line.intensity);
    
    // Calculate the "sparkling" effect intensity based on emotional intensity
    const sparkleIntensity = Math.min(1, emotionalIntensity * 1.5);
    
    return (
      <g key={`resonance-line-${index}`} className="resonance-line">
        {/* Base glow for more depth */}
        <motion.path
          d={pathData}
          stroke={lineColor}
          strokeWidth={lineWidth + 4}
          fill="none"
          strokeLinecap="round"
          initial="initial"
          animate="animate"
          custom={line.intensity * 0.5}
          variants={lineVariants}
          style={{ filter: `blur(${3 + lineWidth * 0.5}px)` }}
        />
        
        {/* Main resonance line */}
        <motion.path
          d={pathData}
          stroke={lineColor}
          strokeWidth={lineWidth}
          fill="none"
          strokeLinecap="round"
          initial="initial"
          animate="animate"
          custom={line.intensity}
          variants={lineVariants}
        />
        
        {/* Add sparkle points along the path if high emotional intensity */}
        {emotionalIntensity > 0.5 && line.intensity > 0.5 && (
          <>
            {[0.3, 0.5, 0.7].map((position, i) => (
              <motion.circle
                key={`sparkle-${index}-${i}`}
                cx={centerX + (position - 0.5) * amplitude * 1.5}
                cy={(y1 * (1 - position)) + (y2 * position)}
                r={1 + (line.intensity * 2)}
                fill="white"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, sparkleIntensity, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 1.5 + Math.random() * 1.5,
                  delay: i * 0.5 + Math.random() * 0.5,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 2,
                }}
                style={{ filter: `blur(${line.intensity}px)` }}
              />
            ))}
          </>
        )}
      </g>
    );
  }), [resonanceLines, chakraYPositions, emotionalIntensity]);

  return (
    <svg 
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {lineElements}
    </svg>
  );
};

export default ResonanceLines;
