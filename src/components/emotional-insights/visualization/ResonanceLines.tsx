
import React from 'react';
import { motion } from 'framer-motion';

interface ResonanceLinesProps {
  resonanceLines: {start: number, end: number, intensity: number}[];
  chakraYPositions: number[];
}

const ResonanceLines: React.FC<ResonanceLinesProps> = ({ 
  resonanceLines, 
  chakraYPositions 
}) => {
  if (resonanceLines.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      <svg className="w-full h-full">
        <defs>
          <linearGradient id="resonanceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(138, 43, 226, 0.7)" />
            <stop offset="50%" stopColor="rgba(173, 216, 230, 0.7)" />
            <stop offset="100%" stopColor="rgba(138, 43, 226, 0.7)" />
          </linearGradient>
          
          {/* Create filters for glow effects */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {resonanceLines.map((line, index) => {
          // Get chakra positions
          const y1 = chakraYPositions[line.start];
          const y2 = chakraYPositions[line.end];
          const x = 150; // Center x-coordinate
          
          // Calculate control points for curved paths
          const midY = (y1 + y2) / 2;
          const distance = Math.abs(y1 - y2);
          const curveOffset = 20 + (distance * 0.3) * (index % 2 === 0 ? 1 : -1);
          
          return (
            <g key={`line-${line.start}-${line.end}`}>
              {/* Animated flowing path */}
              <motion.path
                d={`M ${x} ${y1} Q ${x + curveOffset} ${midY}, ${x} ${y2}`}
                stroke="url(#resonanceGradient)"
                strokeWidth={(line.intensity * 3)}
                fill="none"
                strokeLinecap="round"
                filter="url(#glow)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: line.intensity, 
                  opacity: line.intensity,
                  strokeWidth: [(line.intensity * 3), (line.intensity * 4), (line.intensity * 3)]
                }}
                transition={{ 
                  duration: 3 + (1 - line.intensity) * 2, 
                  repeat: Infinity, 
                  repeatType: "reverse",
                  ease: "easeInOut" 
                }}
              />
              
              {/* Energy particles flowing along the path */}
              {[...Array(Math.ceil(line.intensity * 3))].map((_, i) => (
                <motion.circle
                  key={`particle-${line.start}-${line.end}-${i}`}
                  r={1 + (line.intensity * 2)}
                  fill="white"
                  filter="url(#glow)"
                  initial={{ opacity: 0.7 }}
                  animate={{
                    opacity: [0, 0.8, 0],
                    scale: [0.8, 1.2, 0.8]
                  }}
                  transition={{
                    duration: 2 + (i * 0.5),
                    repeat: Infinity,
                    delay: i * 0.7
                  }}
                >
                  <animateMotion
                    path={`M ${x} ${y1} Q ${x + curveOffset} ${midY}, ${x} ${y2}`}
                    dur={`${3 + i}s`}
                    repeatCount="indefinite"
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
