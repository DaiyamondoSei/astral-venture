
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
  // Get the appropriate glow colors based on consciousness state
  const getGlowGradient = () => {
    if (showInfinity) {
      return 'bg-gradient-to-t from-blue-500/45 via-indigo-400/40 to-violet-400/45';
    }
    if (showTranscendence) {
      return 'bg-gradient-to-t from-blue-500/40 via-indigo-400/35 to-violet-400/35';
    }
    if (showIllumination) {
      return 'bg-gradient-to-t from-blue-500/35 via-cyan-400/30 to-indigo-400/30';
    }
    return 'bg-gradient-to-t from-blue-500/25 via-cyan-400/20 to-indigo-400/20';
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {/* Primary central glow with enhanced animation */}
      <motion.div 
        className={`w-1/2 h-1/2 rounded-full blur-xl ${getGlowGradient()}`}
        initial={{ opacity: 0.3 }}
        animate={{ 
          opacity: [0.3, 0.3 + (baseProgressPercentage * 0.6), 0.3],
          scale: [0.9, 1 + (baseProgressPercentage * 0.25), 0.9],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      />
      
      {/* Additional subtle glow layers for depth */}
      <motion.div 
        className={`absolute w-1/3 h-1/3 rounded-full blur-2xl bg-white/10`}
        animate={{ 
          opacity: [0.1, 0.3, 0.1],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      />
      
      {/* Cosmic rays for higher states */}
      {(showTranscendence || showInfinity) && (
        <motion.div
          className="absolute w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: baseProgressPercentage * 0.8 }}
          transition={{ duration: 2 }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={`ray-${i}`}
              className="absolute top-1/2 left-1/2 h-1/2 w-[1px] bg-gradient-to-t from-indigo-500/0 via-indigo-400/30 to-white/70"
              style={{
                transformOrigin: 'bottom center',
                transform: `rotate(${i * 30}deg)`,
              }}
              animate={{
                height: ['30%', '40%', '30%'],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                duration: 4 + (i % 3),
                repeat: Infinity,
                repeatType: "reverse",
                delay: i * 0.3
              }}
            />
          ))}
        </motion.div>
      )}
      
      {/* Special infinity state effect */}
      {showInfinity && (
        <motion.div
          className="absolute w-2/3 h-2/3 rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)`
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: 360
          }}
          transition={{
            scale: {
              duration: 5,
              repeat: Infinity,
              repeatType: "reverse"
            },
            opacity: {
              duration: 5,
              repeat: Infinity,
              repeatType: "reverse"
            },
            rotate: {
              duration: 30,
              repeat: Infinity,
              ease: "linear"
            }
          }}
        />
      )}
    </div>
  );
};

export default CentralGlow;
