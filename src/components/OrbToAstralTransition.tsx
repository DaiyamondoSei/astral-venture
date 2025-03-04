
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
  
  // Get user dream from localStorage
  const userDream = typeof window !== 'undefined' ? localStorage.getItem('userDream') : null;
  const dominantTheme = typeof window !== 'undefined' ? localStorage.getItem('dominantDreamTheme') : null;
  
  // Emotional colors based on detected emotions in the user's dream
  const getEmotionalColors = () => {
    if (!dominantTheme && !userDream) return { primary: 'quantum-400', secondary: 'quantum-700' };
    
    // If we have an analyzed dominant theme, use that
    if (dominantTheme) {
      switch(dominantTheme) {
        case 'love':
          return { primary: 'rose-400', secondary: 'rose-700' };
        case 'peace':
          return { primary: 'sky-400', secondary: 'sky-700' };
        case 'power':
          return { primary: 'amber-400', secondary: 'amber-700' };
        case 'wisdom':
          return { primary: 'violet-400', secondary: 'violet-700' };
        case 'creativity':
          return { primary: 'orange-400', secondary: 'orange-700' };
        case 'spirituality':
          return { primary: 'indigo-400', secondary: 'indigo-700' };
        case 'healing':
          return { primary: 'emerald-400', secondary: 'emerald-700' };
        default:
          break;
      }
    }
    
    // Fallback to keyword detection if no dominant theme or as secondary check
    if (userDream) {
      const dream = userDream.toLowerCase();
      
      if (dream.includes('love') || dream.includes('heart') || dream.includes('connect')) {
        return { primary: 'rose-400', secondary: 'rose-700' };
      } else if (dream.includes('peace') || dream.includes('calm') || dream.includes('harmony')) {
        return { primary: 'sky-400', secondary: 'sky-700' };
      } else if (dream.includes('power') || dream.includes('strength') || dream.includes('success')) {
        return { primary: 'amber-400', secondary: 'amber-700' };
      } else if (dream.includes('wisdom') || dream.includes('knowledge') || dream.includes('understand')) {
        return { primary: 'violet-400', secondary: 'violet-700' };
      } else if (dream.includes('create') || dream.includes('imagine') || dream.includes('express')) {
        return { primary: 'orange-400', secondary: 'orange-700' };
      } else if (dream.includes('spirit') || dream.includes('divine') || dream.includes('consciousness')) {
        return { primary: 'indigo-400', secondary: 'indigo-700' };
      } else if (dream.includes('heal') || dream.includes('health') || dream.includes('transform')) {
        return { primary: 'emerald-400', secondary: 'emerald-700' };
      }
    }
    
    return { primary: 'quantum-400', secondary: 'quantum-700' };
  };
  
  const { primary, secondary } = getEmotionalColors();
  
  useEffect(() => {
    // Start with the orb
    const expandTimer = setTimeout(() => {
      setStage('expanding');
      setMessage(userDream ? "Analyzing your dream energy..." : "Connecting to your future self...");
      
      // After expanding, transform to astral body
      const astralTimer = setTimeout(() => {
        setStage('astral');
        setMessage(userDream ? "Dream energy integration complete" : "Future self connection established");
        
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
  }, [onComplete, userDream]);
  
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
