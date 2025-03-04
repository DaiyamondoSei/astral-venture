
import React from 'react';
import { motion } from 'framer-motion';

interface CentralGlowProps {
  showInfinity: boolean;
  showTranscendence: boolean;
  showIllumination: boolean;
  baseProgressPercentage: number;
}

const CentralGlow: React.FC<CentralGlowProps> = ({
  showInfinity,
  showTranscendence,
  showIllumination,
  baseProgressPercentage
}) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <motion.div 
        className={`w-1/2 h-1/2 rounded-full blur-xl ${
          showInfinity 
            ? 'bg-gradient-to-t from-blue-500/40 to-violet-400/40'
            : showTranscendence 
              ? 'bg-gradient-to-t from-blue-500/35 to-indigo-400/35'
              : showIllumination 
                ? 'bg-gradient-to-t from-blue-500/30 to-cyan-400/30'
                : 'bg-gradient-to-t from-blue-500/20 to-cyan-400/20'
        }`}
        initial={{ opacity: 0.3 }}
        animate={{ 
          opacity: [0.3, 0.3 + (baseProgressPercentage * 0.5), 0.3],
          scale: [0.9, 1 + (baseProgressPercentage * 0.2), 0.9],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
    </div>
  );
};

export default CentralGlow;
