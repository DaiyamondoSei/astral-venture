
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePerfConfig } from '@/hooks/usePerfConfig';

interface PortalTransitionProps {
  duration?: number;
  onComplete: () => void;
}

/**
 * PortalTransition creates an immersive visual effect when transitioning
 * from the Seed of Life portal to the Consciousness View
 */
const PortalTransition: React.FC<PortalTransitionProps> = ({
  duration = 1.8,
  onComplete
}) => {
  const { config } = usePerfConfig();
  
  // Determine if we should use simpler animation based on device capability
  const isLowPerformance = config.deviceCapability === 'low';
  
  useEffect(() => {
    // Call onComplete callback after the animation duration
    const timer = setTimeout(() => {
      onComplete();
    }, duration * 1000);
    
    return () => clearTimeout(timer);
  }, [duration, onComplete]);
  
  // Simple version for low-performance devices
  if (isLowPerformance) {
    return (
      <motion.div
        className="fixed inset-0 bg-black z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: duration * 0.8, times: [0, 0.3, 0.7, 1] }}
      >
        <div className="text-white text-lg">Entering consciousness...</div>
      </motion.div>
    );
  }
  
  return (
    <motion.div className="fixed inset-0 pointer-events-none z-50">
      {/* Expanding portal circle */}
      <motion.div
        className="fixed inset-0 flex items-center justify-center"
        initial={{ opacity: 1 }}
        animate={{ opacity: [1, 1, 0] }}
        transition={{ duration: duration * 0.8, times: [0, 0.7, 1] }}
      >
        <motion.div
          className="rounded-full bg-gradient-to-r from-purple-600 to-pink-500"
          initial={{ width: 200, height: 200, opacity: 0.8 }}
          animate={{ 
            width: [200, window.innerWidth * 2], 
            height: [200, window.innerHeight * 2],
            opacity: [0.8, 0]
          }}
          transition={{ duration: duration * 0.7, ease: "easeOut" }}
        />
      </motion.div>
      
      {/* Light rays effect */}
      <motion.div
        className="fixed inset-0 flex items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: duration, times: [0, 0.4, 1] }}
      >
        {Array.from({ length: 12 }).map((_, index) => {
          const angle = (index / 12) * 360;
          return (
            <motion.div
              key={`ray-${index}`}
              className="absolute bg-gradient-to-t from-transparent to-purple-300/80"
              style={{
                width: 1,
                height: 100,
                transformOrigin: 'bottom center',
                transform: `rotate(${angle}deg) translateY(-50px)`
              }}
              initial={{ height: 0, opacity: 0 }}
              animate={{ 
                height: [0, 800, 1200], 
                opacity: [0, 0.8, 0],
                filter: [
                  'blur(0px)',
                  'blur(8px)',
                  'blur(4px)'
                ]
              }}
              transition={{ 
                duration: duration * 0.8, 
                delay: (index / 24) * 0.5,
                ease: "easeOut"
              }}
            />
          );
        })}
      </motion.div>
      
      {/* Energy particles */}
      <motion.div
        className="fixed inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: duration, times: [0, 0.5, 1] }}
      >
        {Array.from({ length: 30 }).map((_, index) => {
          const size = Math.random() * 8 + 2;
          const initialX = (Math.random() - 0.5) * 200;
          const initialY = (Math.random() - 0.5) * 200;
          const finalX = (Math.random() - 0.5) * window.innerWidth;
          const finalY = (Math.random() - 0.5) * window.innerHeight;
          
          return (
            <motion.div
              key={`particle-${index}`}
              className="absolute rounded-full bg-white"
              style={{
                width: size,
                height: size,
                boxShadow: `0 0 ${size * 2}px rgba(255, 255, 255, 0.8)`
              }}
              initial={{ x: initialX, y: initialY, opacity: 0 }}
              animate={{ 
                x: [initialX, finalX], 
                y: [initialY, finalY],
                opacity: [0, 0.8, 0]
              }}
              transition={{ 
                duration: duration * 0.9,
                delay: Math.random() * 0.5,
                ease: "easeOut"
              }}
            />
          );
        })}
      </motion.div>
      
      {/* Flash of white at transition point */}
      <motion.div
        className="fixed inset-0 bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.8, 0] }}
        transition={{ duration: 0.5, delay: duration * 0.4 }}
      />
    </motion.div>
  );
};

export default PortalTransition;
