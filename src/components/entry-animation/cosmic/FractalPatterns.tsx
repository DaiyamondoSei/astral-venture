
import React from 'react';
import { motion } from 'framer-motion';
import { generateEnergyColor } from './colorUtils';
import { EnergyLevelProps } from './types';

interface FractalPatternsProps extends Pick<EnergyLevelProps, 'showFractal' | 'showInfinity' | 'showTranscendence' | 'showIllumination'> {
  fractalPoints: {x: number, y: number, size: number, rotation: number}[];
}

const FractalPatterns: React.FC<FractalPatternsProps> = ({ 
  fractalPoints, 
  showFractal,
  showInfinity,
  showTranscendence,
  showIllumination
}) => {
  if (!showFractal) return null;
  
  return (
    <div className="absolute inset-0">
      {fractalPoints.map((point, index) => (
        <motion.div
          key={`fractal-${index}`}
          className="absolute"
          style={{
            left: `${point.x}%`,
            top: `${point.y}%`,
            width: `${point.size * 5}px`,
            height: `${point.size * 5}px`,
            borderRadius: showInfinity ? '0' : '50%',
            background: generateEnergyColor(
              'rgba(120, 170, 255, 0.6)', 
              0.6, 
              showInfinity, 
              showTranscendence, 
              showFractal, 
              showIllumination
            ),
            transform: `rotate(${point.rotation}rad)`,
          }}
          animate={{
            opacity: [0.4, 0.8, 0.4],
            scale: [1, 1.2, 1],
            boxShadow: [
              `0 0 3px ${generateEnergyColor('rgba(120, 170, 255, 0.3)', 0.3, showInfinity, showTranscendence, showFractal, showIllumination)}`,
              `0 0 8px ${generateEnergyColor('rgba(120, 170, 255, 0.6)', 0.6, showInfinity, showTranscendence, showFractal, showIllumination)}`,
              `0 0 3px ${generateEnergyColor('rgba(120, 170, 255, 0.3)', 0.3, showInfinity, showTranscendence, showFractal, showIllumination)}`
            ]
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      ))}
    </div>
  );
};

export default FractalPatterns;
