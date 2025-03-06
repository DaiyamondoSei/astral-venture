
import React from 'react';
import { motion } from 'framer-motion';
import GlowEffect from '@/components/GlowEffect';
import { SacredGeometryIcon } from '../icons/SacredGeometryIcons';

interface CentralNodeProps {
  energyPoints: number;
  onSelectNode?: (nodeId: string) => void;
}

const CentralNode: React.FC<CentralNodeProps> = ({ energyPoints, onSelectNode }) => {
  return (
    <motion.div 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay: 0.5,
        type: "spring",
        stiffness: 200,
        damping: 25 
      }}
    >
      <GlowEffect 
        className="w-28 h-28 rounded-full flex items-center justify-center bg-black/30 backdrop-blur-md"
        color="rgba(138, 92, 246, 0.7)"
        intensity="high"
        animation="breathe"
        interactive
        onClick={() => onSelectNode?.('cosmic-center')}
        ariaLabel={`Central energy node with ${energyPoints} energy points. Click to select.`}
        role="button"
      >
        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-quantum-400 to-quantum-700 flex items-center justify-center overflow-hidden">
          {/* Energy points display with enhanced typography */}
          <span className="text-2xl font-display font-bold z-10 text-white drop-shadow-md">
            {energyPoints}
          </span>
          
          {/* Background sacred geometry icon with improved animation */}
          <motion.div 
            className="absolute inset-0 flex items-center justify-center opacity-30"
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          >
            <SacredGeometryIcon 
              type="metatron" 
              size={48} 
              color="rgba(255,255,255,0.7)" 
              animated={true} 
            />
          </motion.div>
          
          {/* Enhanced animated energy glow with better contrast */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-quantum-500/60 via-quantum-600/50 to-quantum-700/60"
            animate={{
              opacity: [0.5, 0.7, 0.5],
              backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity,
              repeatType: "mirror"
            }}
          />
          
          {/* Add subtle light rays emanating from center with better visibility */}
          <div className="absolute inset-0 flex items-center justify-center">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={`ray-${i}`}
                className="absolute w-1 origin-center bg-gradient-to-t from-transparent to-quantum-300/60"
                style={{ 
                  height: '120%',
                  transform: `rotate(${i * 30}deg)`,
                }}
                animate={{
                  opacity: [0.4, 0.8, 0.4],
                  height: ['80%', '120%', '80%']
                }}
                transition={{
                  duration: 4,
                  delay: i * 0.2,
                  repeat: Infinity,
                  repeatType: "mirror" 
                }}
              />
            ))}
          </div>
        </div>
      </GlowEffect>
      
      {/* Enhanced decorative rings around the central node with better contrast */}
      <div className="absolute inset-[-10%] -z-10">
        <motion.div 
          className="absolute inset-0 rounded-full border-2 border-quantum-500/40"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div 
          className="absolute inset-0 rounded-full border-2 border-quantum-400/30"
          animate={{ 
            scale: [1.1, 1.2, 1.1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 4,
            delay: 0.5,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div 
          className="absolute inset-0 rounded-full border-2 border-quantum-300/20"
          animate={{ 
            scale: [1.2, 1.3, 1.2],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ 
            duration: 4,
            delay: 1,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      </div>
    </motion.div>
  );
};

export default CentralNode;
