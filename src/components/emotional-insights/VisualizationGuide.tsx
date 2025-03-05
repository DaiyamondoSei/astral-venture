
import React from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

interface VisualizationGuideProps {
  emotionalGrowth: number;
}

/**
 * VisualizationGuide component
 * 
 * Provides a visual guide to help users understand the astral body visualization
 */
const VisualizationGuide: React.FC<VisualizationGuideProps> = ({ emotionalGrowth }) => {
  // Define the different consciousness states and what they mean
  const states = [
    { name: 'Beginning', threshold: 0, description: 'Starting to perceive your energy field' },
    { name: 'Aware', threshold: 30, description: 'Growing conscious of emotional patterns' },
    { name: 'Illuminated', threshold: 50, description: 'Inner light and awareness expanding' },
    { name: 'Awakened', threshold: 70, description: 'Consciousness beyond the physical form' },
    { name: 'Transcendent', threshold: 90, description: 'Unity with universal consciousness' }
  ];
  
  // Get the current state based on emotional growth
  const getCurrentState = () => {
    for (let i = states.length - 1; i >= 0; i--) {
      if (emotionalGrowth >= states[i].threshold) {
        return states[i];
      }
    }
    return states[0];
  };
  
  const currentState = getCurrentState();
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
  };
  
  return (
    <motion.div 
      className="absolute top-3 right-3 z-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="bg-black/40 backdrop-blur-md p-2 rounded-lg border border-white/10 flex items-start"
        variants={itemVariants}
      >
        <Info size={16} className="text-white/70 mr-2 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs text-white/90 font-medium">
            {currentState.name} State: {Math.round(emotionalGrowth)}% developed
          </p>
          <p className="text-xs text-white/70">
            {currentState.description}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default VisualizationGuide;
