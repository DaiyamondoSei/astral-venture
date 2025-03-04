
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlowEffect from '@/components/GlowEffect';

interface OrbToAstralTransitionProps {
  onComplete: () => void;
  duration?: number;
}

const OrbToAstralTransition: React.FC<OrbToAstralTransitionProps> = ({ 
  onComplete,
  duration = 5000 // total animation duration in ms
}) => {
  const [stage, setStage] = useState<'orb' | 'expanding' | 'transforming' | 'astral' | 'complete'>('orb');
  
  useEffect(() => {
    // Sequence the animation stages
    const orbTimer = setTimeout(() => {
      setStage('expanding');
      
      const expandTimer = setTimeout(() => {
        setStage('transforming');
        
        const transformTimer = setTimeout(() => {
          setStage('astral');
          
          const completeTimer = setTimeout(() => {
            setStage('complete');
            onComplete();
          }, duration * 0.25);
          
          return () => clearTimeout(completeTimer);
        }, duration * 0.25);
        
        return () => clearTimeout(transformTimer);
      }, duration * 0.25);
      
      return () => clearTimeout(expandTimer);
    }, duration * 0.25);
    
    return () => clearTimeout(orbTimer);
  }, [duration, onComplete]);

  return (
    <div className="relative w-full h-[60vh] flex items-center justify-center overflow-hidden">
      <AnimatePresence>
        {/* Initial orb */}
        {(stage === 'orb' || stage === 'expanding') && (
          <motion.div
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ 
              scale: stage === 'orb' ? 1 : 1.5, 
              opacity: 1 
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: stage === 'orb' ? duration * 0.0005 : duration * 0.0005,
              ease: "easeInOut" 
            }}
            className="absolute"
          >
            <GlowEffect
              className="w-32 h-32 rounded-full bg-gradient-to-br from-quantum-400/80 to-quantum-600/80"
              intensity="high"
              animation="pulse"
            />
          </motion.div>
        )}
        
        {/* Transforming stage - energy particles expanding */}
        {stage === 'transforming' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute w-full h-full"
          >
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute w-2 h-2 rounded-full bg-quantum-400"
                initial={{ 
                  x: 0, 
                  y: 0,
                  opacity: 1 
                }}
                animate={{ 
                  x: Math.random() * 300 - 150, 
                  y: Math.random() * 300 - 150,
                  opacity: 0 
                }}
                transition={{ 
                  duration: Math.random() * 2 + 1,
                  ease: "easeOut" 
                }}
              />
            ))}
          </motion.div>
        )}
        
        {/* Astral body formation */}
        {(stage === 'astral' || stage === 'complete') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="relative">
              {/* Astral Body Silhouette - Human-like form */}
              <svg 
                className="w-64 h-80 mx-auto astral-body-silhouette"
                viewBox="0 0 200 320" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Head */}
                <motion.circle 
                  cx="100" cy="60" r="30" 
                  className="astral-body-part" 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0 }}
                />
                
                {/* Neck */}
                <motion.path 
                  d="M90 90 L110 90 L108 105 L92 105 Z" 
                  className="astral-body-part"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                />
                
                {/* Torso */}
                <motion.path 
                  d="M75 105 L125 105 L135 200 L65 200 Z" 
                  className="astral-body-part"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                />
                
                {/* Arms */}
                <motion.path 
                  d="M75 115 L40 160 L48 170 L85 125" 
                  className="astral-body-part"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                />
                <motion.path 
                  d="M125 115 L160 160 L152 170 L115 125" 
                  className="astral-body-part"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                />
                
                {/* Hands */}
                <motion.circle 
                  cx="40" cy="168" r="8" 
                  className="astral-body-part"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                />
                <motion.circle 
                  cx="160" cy="168" r="8" 
                  className="astral-body-part"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                />
                
                {/* Legs */}
                <motion.path 
                  d="M85 200 L65 280 L85 285 L95 205" 
                  className="astral-body-part"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                />
                <motion.path 
                  d="M115 200 L135 280 L115 285 L105 205" 
                  className="astral-body-part"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                />
                
                {/* Feet */}
                <motion.path 
                  d="M65 280 L55 285 L65 295 L85 285" 
                  className="astral-body-part"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.8 }}
                />
                <motion.path 
                  d="M135 280 L145 285 L135 295 L115 285" 
                  className="astral-body-part"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.8 }}
                />
                
                {/* Energy Points (chakras) */}
                <motion.circle 
                  cx="100" cy="60" r="6" 
                  className="energy-point crown-chakra"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 1.0 }}
                />
                <motion.circle 
                  cx="100" cy="90" r="5" 
                  className="energy-point throat-chakra"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 1.1 }}
                />
                <motion.circle 
                  cx="100" cy="120" r="7" 
                  className="energy-point heart-chakra"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 1.2 }}
                />
                <motion.circle 
                  cx="100" cy="150" r="6" 
                  className="energy-point solar-chakra"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 1.3 }}
                />
                <motion.circle 
                  cx="100" cy="180" r="5" 
                  className="energy-point sacral-chakra"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 1.4 }}
                />
                <motion.circle 
                  cx="100" cy="200" r="6" 
                  className="energy-point root-chakra"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 1.5 }}
                />
              </svg>
              
              <GlowEffect 
                className="absolute inset-0 w-full h-full rounded-lg"
                animation="pulse"
                color="rgba(124, 58, 237, 0.6)"
                intensity="high"
              />
            </div>
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.6 }}
            >
              <div className="text-white text-xl font-display mt-40">Astral Field Activated</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrbToAstralTransition;
