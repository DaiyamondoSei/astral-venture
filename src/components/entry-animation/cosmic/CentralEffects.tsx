
import React from 'react';
import { motion } from 'framer-motion';
import GlowEffect from '@/components/GlowEffect';
import { generateEnergyColor } from './colorUtils';
import { EnergyLevelProps } from './types';

interface CentralEffectsProps extends Pick<EnergyLevelProps, 'showInfinity' | 'showTranscendence' | 'showIllumination' | 'baseProgressPercentage'> {}

const CentralEffects: React.FC<CentralEffectsProps> = ({ 
  showInfinity, 
  showTranscendence, 
  showIllumination, 
  baseProgressPercentage 
}) => {
  return (
    <>
      {/* Pulsing light effect - intensity increases with progress */}
      <GlowEffect 
        className="absolute inset-0 w-full h-full rounded-lg"
        animation="pulse"
        color={generateEnergyColor(
          `rgba(56, 189, 248, ${0.1 + (baseProgressPercentage * 0.2)})`,
          1,
          showInfinity,
          showTranscendence,
          false,
          showIllumination
        )}
        intensity={baseProgressPercentage > 0.7 ? "high" : baseProgressPercentage > 0.3 ? "medium" : "low"}
      />
      
      {/* Central bright light at center of body - grows with progress */}
      <motion.div
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl ${
          showInfinity 
            ? 'bg-violet-300/95'
            : showTranscendence 
              ? 'bg-indigo-300/92'
              : showIllumination 
                ? 'bg-cyan-300/90' 
                : 'bg-blue-300/80'
        }`}
        style={{
          width: `${8 + (baseProgressPercentage * 10)}px`,
          height: `${8 + (baseProgressPercentage * 10)}px`
        }}
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.5, 0.5 + (baseProgressPercentage * 0.4), 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      
      {/* Transcendence level essence */}
      {showTranscendence && (
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ duration: 2 }}
        >
          <motion.div
            className="relative"
            animate={{ 
              rotate: 360,
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div 
                key={`ray-${i}`}
                className="absolute w-1 rounded-full"
                style={{
                  height: `${60 + (i % 3) * 10}px`,
                  left: '50%',
                  top: '50%',
                  backgroundColor: showInfinity ? 'rgba(220, 220, 255, 0.4)' : 'rgba(200, 200, 255, 0.3)',
                  transformOrigin: 'center bottom',
                  transform: `translateX(-50%) translateY(-100%) rotate(${i * 30}deg)`,
                }}
                animate={{ 
                  height: [`${60 + (i % 3) * 10}px`, `${80 + (i % 3) * 15}px`, `${60 + (i % 3) * 10}px`] 
                }}
                transition={{
                  duration: 3 + (i % 3),
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: i * 0.2
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default CentralEffects;
