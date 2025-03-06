
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
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <GlowEffect 
        className="w-24 h-24 rounded-full flex items-center justify-center bg-black/30 backdrop-blur-md"
        color="rgba(138, 92, 246, 0.7)"
        intensity="high"
        animation="breathe"
        interactive
        onClick={() => onSelectNode?.('cosmic-center')}
      >
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-quantum-400 to-quantum-700 flex items-center justify-center overflow-hidden">
          {/* Energy points display */}
          <span className="text-lg font-bold z-10">{energyPoints}</span>
          
          {/* Background sacred geometry icon */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <SacredGeometryIcon 
              type="metatron" 
              size={40} 
              color="rgba(255,255,255,0.7)" 
              animated={true} 
            />
          </div>
          
          {/* Animated energy glow */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-quantum-500/50 to-quantum-700/50"
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
        </div>
      </GlowEffect>
      
      {/* Decorative rings around the central node */}
      <div className="absolute inset-0 -z-10">
        <motion.div 
          className="absolute inset-0 rounded-full border border-quantum-500/30"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div 
          className="absolute inset-0 rounded-full border border-quantum-400/20"
          animate={{ 
            scale: [1.1, 1.2, 1.1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ 
            duration: 4,
            delay: 0.5,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div 
          className="absolute inset-0 rounded-full border border-quantum-300/10"
          animate={{ 
            scale: [1.2, 1.3, 1.2],
            opacity: [0.1, 0.3, 0.1]
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
