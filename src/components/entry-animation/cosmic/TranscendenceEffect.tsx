
import React from 'react';
import { motion } from 'framer-motion';

interface TranscendenceEffectProps {
  showTranscendence: boolean;
  showInfinity: boolean;
}

const TranscendenceEffect: React.FC<TranscendenceEffectProps> = ({ showTranscendence, showInfinity }) => {
  if (!showTranscendence) return null;
  
  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.6 }}
      transition={{ duration: 2 }}
    >
      <svg width="100%" height="100%" viewBox="0 0 100 100" opacity="0.4">
        <defs>
          <radialGradient id="transcendenceGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.8)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
          </radialGradient>
          
          {/* Create dynamic filters for infinity level */}
          {showInfinity && (
            <>
              <filter id="infinityGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feColorMatrix in="blur" type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </>
          )}
        </defs>
        
        {/* Transcendence rings */}
        <motion.circle 
          cx="50" cy="50" r="40" 
          fill="none" 
          stroke="url(#transcendenceGlow)" 
          strokeWidth="0.5"
          animate={{ r: [40, 45, 40] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        
        {/* Infinity level adds more complex transcendence effects */}
        {showInfinity && (
          <>
            <motion.path
              d="M50,20 C70,20 70,80 50,80 C30,80 30,20 50,20 Z"
              fill="none"
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth="0.3"
              filter="url(#infinityGlow)"
              animate={{ 
                d: [
                  "M50,20 C70,20 70,80 50,80 C30,80 30,20 50,20 Z",
                  "M50,20 C80,30 80,70 50,80 C20,70 20,30 50,20 Z",
                  "M50,20 C70,20 70,80 50,80 C30,80 30,20 50,20 Z"
                ]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />
          </>
        )}
      </svg>
    </motion.div>
  );
};

export default TranscendenceEffect;
