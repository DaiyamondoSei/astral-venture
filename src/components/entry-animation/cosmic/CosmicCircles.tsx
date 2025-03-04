
import React from 'react';
import { motion } from 'framer-motion';
import { generateEnergyColor } from './colorUtils';
import { EnergyLevelProps } from './types';

interface CosmicCirclesProps extends Pick<EnergyLevelProps, 'showAura' | 'showFractal' | 'showTranscendence' | 'showDetails' | 'baseProgressPercentage'> {
  showIllumination: boolean;
}

const CosmicCircles: React.FC<CosmicCirclesProps> = ({ 
  showAura,
  showFractal,
  showTranscendence,
  showDetails,
  baseProgressPercentage,
  showIllumination
}) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {[1, 2, 3, 4, 5, 6, 7].map((circle, index) => {
        // Only show additional circles based on progress
        if ((index > 2 && !showAura) || 
            (index > 4 && !showFractal) || 
            (index > 5 && !showTranscendence)) return null;
        
        const intensity = Math.min(0.2 + (baseProgressPercentage * 0.8), 1);
        const circleColor = generateEnergyColor(
          'rgba(56, 189, 248, 0.3)', 
          0.3 * intensity, 
          false, 
          showTranscendence, 
          showFractal, 
          showIllumination
        );
        
        return (
          <motion.div
            key={circle}
            className="absolute rounded-full border"
            style={{
              borderColor: circleColor,
              transform: showTranscendence ? `rotate(${circle * 45}deg)` : ""
            }}
            initial={{ width: '40%', height: '40%', opacity: 0 }}
            animate={{ 
              width: ['40%', '90%'],
              height: ['40%', '90%'],
              opacity: [0, 0.6 * intensity, 0]
            }}
            transition={{
              duration: 4,
              delay: circle * (showDetails ? 1 : 1.5),
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        );
      })}
    </div>
  );
};

export default CosmicCircles;
