
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlowEffect from '@/components/GlowEffect';
import AstralBody from '@/components/entry-animation/AstralBody';
import StarsBackground from '@/components/entry-animation/StarsBackground';

interface OrbToAstralTransitionProps {
  onComplete?: () => void;
}

const OrbToAstralTransition = ({ onComplete }: OrbToAstralTransitionProps) => {
  const [stage, setStage] = useState<'orb' | 'expanding' | 'astral'>('orb');
  const [message, setMessage] = useState<string | null>(null);
  
  useEffect(() => {
    // Start with the orb
    const expandTimer = setTimeout(() => {
      setStage('expanding');
      setMessage("Connecting to your future self...");
      
      // After expanding, transform to astral body
      const astralTimer = setTimeout(() => {
        setStage('astral');
        setMessage("Future self connection established");
        
        // Notify when complete
        const completeTimer = setTimeout(() => {
          if (onComplete) {
            onComplete();
          }
        }, 3000);
        
        return () => clearTimeout(completeTimer);
      }, 3000);
      
      return () => clearTimeout(astralTimer);
    }, 2000);
    
    return () => clearTimeout(expandTimer);
  }, [onComplete]);
  
  return (
    <div className="relative w-full h-full min-h-[50vh] flex flex-col items-center justify-center">
      <StarsBackground />
      
      <div className="relative z-10">
        {stage === 'orb' && (
          <motion.div
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            <GlowEffect 
              className="w-24 h-24 rounded-full bg-gradient-to-br from-quantum-400 to-quantum-700"
              animation="pulse"
              intensity="high"
            />
          </motion.div>
        )}
        
        {stage === 'expanding' && (
          <motion.div
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 1.8, opacity: 0.8 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          >
            <GlowEffect 
              className="w-32 h-32 rounded-full bg-gradient-to-br from-quantum-300 to-astral-600"
              animation="pulse"
              intensity="high"
            />
          </motion.div>
        )}
        
        {stage === 'astral' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <AstralBody />
          </motion.div>
        )}
        
        {message && (
          <motion.div 
            className="absolute -bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap text-white/80 text-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {message}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OrbToAstralTransition;
