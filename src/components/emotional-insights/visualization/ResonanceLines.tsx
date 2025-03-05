
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useEmotionalTransition } from '@/hooks/useEmotionalTransition';

interface ResonanceLinesProps {
  resonanceLines: {start: number, end: number, intensity: number}[];
  chakraYPositions: number[];
  emotionalIntensity?: number; // New prop to receive overall emotional intensity
}

const ResonanceLines: React.FC<ResonanceLinesProps> = ({ 
  resonanceLines, 
  chakraYPositions,
  emotionalIntensity = 0.7 // Default value if not provided
}) => {
  if (resonanceLines.length === 0) return null;

  // Scale emotional intensity for visual effects
  const scaledIntensity = useEmotionalTransition(emotionalIntensity);
  
  // Generate dynamic gradient based on emotional intensity
  const dynamicGradient = useMemo(() => {
    // More vibrant colors for higher intensity
    const purpleIntensity = Math.min(200 + (scaledIntensity * 55), 255);
    const blueIntensity = Math.min(173 + (scaledIntensity * 42), 255);
    
    return {
      id: "resonanceGradient",
      colors: [
        `rgba(${purpleIntensity}, 43, 226, ${0.6 + (scaledIntensity * 0.3)})`,
        `rgba(173, ${blueIntensity}, 230, ${0.6 + (scaledIntensity * 0.3)})`,
        `rgba(${purpleIntensity}, 43, 226, ${0.6 + (scaledIntensity * 0.3)})`
      ]
    };
  }, [scaledIntensity]);

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      <svg className="w-full h-full">
        <defs>
          <linearGradient id={dynamicGradient.id} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={dynamicGradient.colors[0]} />
            <stop offset="50%" stopColor={dynamicGradient.colors[1]} />
            <stop offset="100%" stopColor={dynamicGradient.colors[2]} />
          </linearGradient>
          
          {/* Enhanced glow filter with dynamic intensity */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={3 + (scaledIntensity * 3)} result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {resonanceLines.map((line, index) => {
          // Dynamic chakra positions
          const y1 = chakraYPositions[line.start];
          const y2 = chakraYPositions[line.end];
          const x = 150; // Center x-coordinate
          
          // Enhanced curve calculations for more fluid lines
          const midY = (y1 + y2) / 2;
          const distance = Math.abs(y1 - y2);
          const baseOffset = 20 + (distance * 0.3);
          
          // Create sine wave variation for more organic movement
          const wave = Math.sin(Date.now() / 2000 + index) * 5;
          const curveOffset = baseOffset * (index % 2 === 0 ? 1 : -1) + wave;
          
          // Scale line properties with emotional intensity
          const lineWidth = (line.intensity * 3) * (0.8 + (scaledIntensity * 0.4));
          const lineOpacity = line.intensity * (0.8 + (scaledIntensity * 0.3));
          
          return (
            <g key={`line-${line.start}-${line.end}`}>
              {/* Animated flowing path with enhanced fluidity */}
              <motion.path
                d={`M ${x} ${y1} Q ${x + curveOffset} ${midY}, ${x} ${y2}`}
                stroke={`url(#${dynamicGradient.id})`}
                strokeWidth={lineWidth}
                fill="none"
                strokeLinecap="round"
                filter="url(#glow)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: line.intensity, 
                  opacity: lineOpacity,
                  strokeWidth: [
                    lineWidth, 
                    lineWidth * 1.2, 
                    lineWidth
                  ]
                }}
                transition={{ 
                  duration: 3 + (1 - line.intensity) * 2, 
                  repeat: Infinity, 
                  repeatType: "reverse",
                  ease: "easeInOut" 
                }}
              />
              
              {/* Enhanced energy particles with more dynamic behavior */}
              {[...Array(Math.ceil(line.intensity * (3 + scaledIntensity * 2)))].map((_, i) => (
                <motion.circle
                  key={`particle-${line.start}-${line.end}-${i}`}
                  r={1 + (line.intensity * scaledIntensity * 2)}
                  fill={i % 2 === 0 ? "white" : dynamicGradient.colors[1]}
                  filter="url(#glow)"
                  initial={{ opacity: 0.7 }}
                  animate={{
                    opacity: [0, 0.8 * scaledIntensity, 0],
                    scale: [0.8, 1.2, 0.8]
                  }}
                  transition={{
                    duration: 2 + (i * 0.5),
                    repeat: Infinity,
                    delay: i * (0.8 - (scaledIntensity * 0.3)) // Faster particles at higher intensities
                  }}
                >
                  <animateMotion
                    path={`M ${x} ${y1} Q ${x + curveOffset} ${midY}, ${x} ${y2}`}
                    dur={`${3 + i - (scaledIntensity)}s`}
                    repeatCount="indefinite"
                    keyPoints={i % 2 === 0 ? "0;1" : "1;0"}
                    keyTimes="0;1"
                    calcMode="spline"
                    keySplines="0.42 0 0.58 1"
                  />
                </motion.circle>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default ResonanceLines;
