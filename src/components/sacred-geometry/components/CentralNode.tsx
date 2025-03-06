
import React from 'react';
import { motion } from 'framer-motion';
import GlowEffect from '@/components/GlowEffect';

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
        className="w-24 h-24 rounded-full flex items-center justify-center"
        color="rgba(138, 92, 246, 0.6)"
        intensity="high"
        animation="pulse"
        interactive
        onClick={() => onSelectNode?.('cosmic-center')}
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-quantum-400 to-quantum-700 flex items-center justify-center">
          <span className="text-lg font-bold">{energyPoints}</span>
        </div>
      </GlowEffect>
    </motion.div>
  );
};

export default CentralNode;
