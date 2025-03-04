
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlowEffect from '@/components/GlowEffect';
import AstralBody from '@/components/entry-animation/AstralBody';
import StarsBackground from '@/components/entry-animation/StarsBackground';

interface OrbToAstralTransitionProps {
  onComplete?: () => void;
  userDream?: string;
}

const OrbToAstralTransition = ({ onComplete, userDream }: OrbToAstralTransitionProps) => {
  const [stage, setStage] = useState<'orb' | 'expanding' | 'astral'>('orb');
  const [message, setMessage] = useState<string | null>(null);
  
  // Emotional colors based on detected emotions in the user's dream
  // This could be enhanced with real emotion detection/AI later
  const getEmotionalColors = () => {
    if (!userDream) return { primary: 'quantum-400', secondary: 'quantum-700' };
    
    const dream = userDream.toLowerCase();
    
    if (dream.includes('love') || dream.includes('joy') || dream.includes('happy')) {
      return { primary: 'rose-400', secondary: 'rose-700' };
    } else if (dream.includes('peace') || dream.includes('calm') || dream.includes('harmony')) {
      return { primary: 'sky-400', secondary: 'sky-700' };
    } else if (dream.includes('power') || dream.includes('strength') || dream.includes('success')) {
      return { primary: 'amber-400', secondary: 'amber-700' };
    } else if (dream.includes('wisdom') || dream.includes('knowledge') || dream.includes('understand')) {
      return { primary: 'violet-400', secondary: 'violet-700' };
    }
    
    return { primary: 'quantum-400', secondary: 'quantum-700' };
  };
  
  const { primary, secondary } = getEmotionalColors();
  
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
              className={`w-24 h-24 rounded-full bg-gradient-to-br from-${primary} to-${secondary}`}
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
              className={`w-32 h-32 rounded-full bg-gradient-to-br from-${primary} to-astral-600`}
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
            <AstralBody emotionColors={{ primary, secondary }} />
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
