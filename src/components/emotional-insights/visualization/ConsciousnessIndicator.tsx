
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmotionalTransition } from '@/hooks/useEmotionalTransition';

interface ConsciousnessIndicatorProps {
  visualizationVariant: string;
}

const ConsciousnessIndicator: React.FC<ConsciousnessIndicatorProps> = ({ 
  visualizationVariant 
}) => {
  const [previousVariant, setPreviousVariant] = useState(visualizationVariant);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Track variant changes to trigger transitions
  useEffect(() => {
    if (visualizationVariant !== previousVariant) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setPreviousVariant(visualizationVariant);
        setIsTransitioning(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [visualizationVariant, previousVariant]);
  
  // Don't render anything for the "beginning" state
  if (visualizationVariant === "beginning" && !isTransitioning) return null;
  
  // Get the current message based on variant
  const getMessage = (variant: string) => {
    switch (variant) {
      case "aware":
        return "Conscious Awareness Awakening";
      case "illuminated":
        return "Energy Field Illuminating";
      case "awakened":
        return "Consciousness Expansion Unfolding";
      case "transcendent":
        return "Transcendent Connection Activating";
      default:
        return "";
    }
  };
  
  // Fluid transition animation variants
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: [0.5, 1, 0.7], 
      transition: { 
        duration: 4, 
        repeat: Infinity,
        ease: "easeInOut" 
      }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.5 }
    }
  };
  
  const textVariants = {
    initial: { 
      opacity: 0, 
      y: 10,
      filter: "blur(8px)"
    },
    animate: { 
      opacity: 1, 
      y: 0,
      filter: "blur(0px)",
      transition: { 
        duration: 0.8,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0,
      y: -10,
      filter: "blur(8px)",
      transition: { 
        duration: 0.5,
        ease: "easeIn"
      }
    }
  };
  
  // Luminous glow based on consciousness level
  const getGlowIntensity = (variant: string) => {
    switch (variant) {
      case "aware": return 2;
      case "illuminated": return 4;
      case "awakened": return 6;
      case "transcendent": return 10;
      default: return 0;
    }
  };
  
  const currentGlow = useEmotionalTransition(getGlowIntensity(visualizationVariant));
  
  return (
    <motion.div 
      className="absolute bottom-4 left-0 right-0 text-center"
      initial="initial"
      animate="animate"
      variants={containerVariants}
      style={{
        textShadow: `0 0 ${currentGlow}px rgba(255, 255, 255, 0.7)`
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={visualizationVariant}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={textVariants}
          className="text-white/80 text-sm font-medium px-4 py-2 rounded-full bg-black/10 backdrop-blur-sm inline-block"
        >
          {getMessage(visualizationVariant)}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default ConsciousnessIndicator;
