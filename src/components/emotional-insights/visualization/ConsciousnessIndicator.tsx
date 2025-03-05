
import React from 'react';
import { motion } from 'framer-motion';

interface ConsciousnessIndicatorProps {
  visualizationVariant: string;
}

const ConsciousnessIndicator: React.FC<ConsciousnessIndicatorProps> = ({ 
  visualizationVariant 
}) => {
  if (visualizationVariant === "beginning") return null;
  
  return (
    <motion.div 
      className="absolute bottom-4 left-0 right-0 text-center text-white/70 text-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0.7, 1, 0.7] }}
      transition={{ duration: 4, repeat: Infinity }}
    >
      {visualizationVariant === "aware" && "Conscious Awareness Awakening"}
      {visualizationVariant === "illuminated" && "Energy Field Illuminating"}
      {visualizationVariant === "awakened" && "Consciousness Expansion Unfolding"}
      {visualizationVariant === "transcendent" && "Transcendent Connection Activating"}
    </motion.div>
  );
};

export default ConsciousnessIndicator;
