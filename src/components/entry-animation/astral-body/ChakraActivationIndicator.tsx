
import React from 'react';
import { motion } from 'framer-motion';
import { ChakraActivation } from './ChakraPoints';

interface ChakraActivationIndicatorProps {
  activatedCount: number;
  chakraNames: ChakraActivation;
}

const ChakraActivationIndicator: React.FC<ChakraActivationIndicatorProps> = ({ 
  activatedCount, 
  chakraNames 
}) => {
  if (activatedCount === 0) return null;
  
  // Get the names of activated chakras
  const activatedList = Object.entries(chakraNames)
    .filter(([_, active]) => active)
    .map(([chakra]) => chakra.charAt(0).toUpperCase() + chakra.slice(1));
  
  // For screen readers, provide detailed information about activated chakras
  const ariaDescription = activatedList.join(', ') + ' Chakras Active';
  
  // For visual display, use a simpler format
  const displayText = activatedCount > 3 ? 
    `${activatedCount} Chakras Active` : 
    activatedList.join(', ') + ' Active';

  // Animation for the indicator
  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  };
  
  return (
    <motion.div 
      className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-center"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      aria-live="polite"
      role="status"
      aria-label={ariaDescription}
    >
      <motion.div 
        className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-white/90 text-xs font-medium border border-white/10"
        variants={itemVariants}
      >
        {displayText}
        <span className="sr-only">{ariaDescription}</span>
      </motion.div>
    </motion.div>
  );
};

export default ChakraActivationIndicator;
