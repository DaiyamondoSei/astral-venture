
import React from 'react';
import { motion } from 'framer-motion';
import { generateEnergyColor } from './colorUtils';
import { EnergyLevelProps } from './types';

interface BackgroundStarsProps extends Pick<EnergyLevelProps, 'showTranscendence' | 'showInfinity' | 'showFractal' | 'showIllumination' | 'baseProgressPercentage'> {
  stars: {x: number, y: number, size: number, delay: number, duration: number}[];
}

const BackgroundStars: React.FC<BackgroundStarsProps> = ({ 
  stars, 
  showTranscendence, 
  showInfinity,
  showFractal,
  showIllumination,
  baseProgressPercentage 
}) => {
  return (
    <div className={`absolute inset-0 ${showTranscendence ? 'bg-gradient-to-b from-black to-blue-950/30' : 'bg-black'}`}>
      {stars.map((star, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: generateEnergyColor(
              'rgba(148, 163, 184, 0.8)', 
              0.8, 
              showInfinity, 
              showTranscendence, 
              showFractal, 
              showIllumination
            )
          }}
          initial={{ opacity: 0.2 }}
          animate={{ 
            opacity: [0.2, 0.8, 0.2],
            boxShadow: [
              '0 0 2px rgba(148, 163, 184, 0.5)', 
              `0 0 ${8 + baseProgressPercentage * 5}px ${generateEnergyColor(
                'rgba(148, 163, 184, 0.8)', 
                0.5, 
                showInfinity, 
                showTranscendence, 
                showFractal, 
                showIllumination
              )}`, 
              '0 0 2px rgba(148, 163, 184, 0.5)'
            ]
          }}
          transition={{ 
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            repeatType: "loop"
          }}
        />
      ))}
    </div>
  );
};

export default BackgroundStars;
