
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PortalTransitionProps {
  isActive: boolean;
  onTransitionComplete?: () => void;
  children: React.ReactNode;
}

/**
 * Provides a visually stunning transition effect when entering the portal
 */
const PortalTransition: React.FC<PortalTransitionProps> = ({
  isActive,
  onTransitionComplete,
  children
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  useEffect(() => {
    if (isActive) {
      setIsTransitioning(true);
      
      // After transition completes, call the provided callback
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        if (onTransitionComplete) {
          onTransitionComplete();
        }
      }, 2000); // Adjust timing to match animation duration
      
      return () => clearTimeout(timer);
    }
  }, [isActive, onTransitionComplete]);
  
  // Portal open animation variants
  const portalVariants = {
    closed: {
      scale: 1,
      opacity: 0,
      rotate: 0
    },
    transitioning: {
      scale: [1, 20, 30],
      opacity: [0, 0.8, 0],
      rotate: [0, 180, 360],
      transition: {
        duration: 2,
        times: [0, 0.5, 1],
        ease: "easeInOut"
      }
    }
  };
  
  // Fade variants for content
  const contentVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.5,
        delay: 0.5
      }
    },
    exit: { 
      opacity: 0,
      transition: {
        duration: 0.3
      }
    }
  };
  
  // Flash effect for transition
  const flashVariants = {
    initial: {
      opacity: 0,
      scale: 0
    },
    animate: {
      opacity: [0, 1, 0],
      scale: [0.5, 1.5, 3],
      transition: {
        duration: 2,
        times: [0, 0.2, 1],
        ease: "easeInOut"
      }
    }
  };

  return (
    <>
      {/* Main content display */}
      <AnimatePresence>
        {!isTransitioning && !isActive && (
          <motion.div
            key="portal-content"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={contentVariants}
            className="w-full h-full"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Portal transition effect */}
      <AnimatePresence>
        {isTransitioning && (
          <>
            <motion.div 
              key="portal-transition"
              className="absolute inset-0 flex items-center justify-center z-50"
              variants={portalVariants}
              initial="closed"
              animate="transitioning"
              exit="closed"
            >
              {/* Portal vortex effect */}
              <div className="w-32 h-32 rounded-full bg-gradient-radial from-purple-500 via-blue-500 to-transparent opacity-80" />
            </motion.div>
            
            {/* Flash effect */}
            <motion.div
              key="portal-flash"
              className="absolute inset-0 bg-white"
              variants={flashVariants}
              initial="initial"
              animate="animate"
              exit="initial"
            />
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default PortalTransition;
