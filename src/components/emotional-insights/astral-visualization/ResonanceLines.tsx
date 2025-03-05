
import React from 'react';
import { motion } from 'framer-motion';

interface ResonanceLinesProps {
  resonanceLines: { start: number; end: number; intensity: number }[];
  chakraYPositions: number[];
  emotionalIntensity: number;
}

const ResonanceLines: React.FC<ResonanceLinesProps> = ({ 
  resonanceLines, 
  chakraYPositions, 
  emotionalIntensity 
}) => {
  return (
    <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
      {resonanceLines.map((line, index) => {
        const startY = chakraYPositions[line.start];
        const endY = chakraYPositions[line.end];
        const startX = 100; // Center X position
        const intensity = line.intensity * emotionalIntensity;
        
        return (
          <motion.path
            key={`line-${index}`}
            d={`M ${startX} ${startY} Q ${startX} ${(startY + endY) / 2} ${startX} ${endY}`}
            stroke={`rgba(255, 255, 255, ${intensity * 0.6})`}
            strokeWidth={1 + intensity * 2}
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: 1, 
              opacity: intensity,
              strokeWidth: [1 + intensity * 2, 1 + intensity * 3, 1 + intensity * 2]
            }}
            transition={{ 
              pathLength: { duration: 2, ease: "easeInOut" },
              opacity: { duration: 1 },
              strokeWidth: { 
                duration: 3, 
                repeat: Infinity,
                repeatType: "reverse" 
              }
            }}
          />
        );
      })}
    </svg>
  );
};

export default ResonanceLines;
