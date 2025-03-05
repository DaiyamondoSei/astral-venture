
import React from 'react';
import { motion } from 'framer-motion';

interface ConsciousnessIndicatorProps {
  visualizationVariant: string;
}

const ConsciousnessIndicator: React.FC<ConsciousnessIndicatorProps> = ({ visualizationVariant }) => {
  const getIndicatorConfig = () => {
    switch(visualizationVariant) {
      case "transcendent":
        return {
          text: "Transcendent Consciousness",
          color: "bg-indigo-500/30",
          textColor: "text-indigo-200"
        };
      case "awakened":
        return {
          text: "Awakened Awareness",
          color: "bg-violet-500/30",
          textColor: "text-violet-200"
        };
      case "illuminated":
        return {
          text: "Illuminated Perception",
          color: "bg-blue-500/30",
          textColor: "text-blue-200"
        };
      case "aware":
        return {
          text: "Self-Aware",
          color: "bg-cyan-500/30",
          textColor: "text-cyan-200"
        };
      default:
        return {
          text: "Awakening Consciousness",
          color: "bg-white/10",
          textColor: "text-white/60"
        };
    }
  };
  
  const config = getIndicatorConfig();

  return (
    <motion.div 
      className={`flex justify-center items-center text-xs font-medium rounded-full px-3 py-1 ${config.color} ${config.textColor} mx-auto w-fit`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {config.text}
    </motion.div>
  );
};

export default ConsciousnessIndicator;
