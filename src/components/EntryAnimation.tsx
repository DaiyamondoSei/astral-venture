
import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import GlowEffect from '@/components/GlowEffect';
import { motion } from 'framer-motion';

interface EntryAnimationProps {
  onComplete: () => void;
  className?: string;
}

const EntryAnimation = ({ onComplete, className }: EntryAnimationProps) => {
  const [animationStep, setAnimationStep] = useState(0);
  const [breathCount, setBreathCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (animationStep < 3) {
        setAnimationStep(prev => prev + 1);
      } else if (animationStep === 3 && breathCount < 3) {
        // Do nothing, waiting for user to complete breaths
      } else if (animationStep === 3 && breathCount >= 3) {
        setAnimationStep(4);
        setTimeout(() => {
          setAnimationStep(5);
          setTimeout(() => {
            onComplete();
          }, 2000);
        }, 3000);
      }
    }, animationStep === 0 ? 2000 : 3000);

    return () => clearTimeout(timer);
  }, [animationStep, breathCount, onComplete]);

  const handleBreath = () => {
    if (animationStep === 3 && breathCount < 3) {
      setBreathCount(prev => prev + 1);
    }
  };

  return (
    <div className={cn(
      "fixed inset-0 bg-black flex items-center justify-center z-50 overflow-hidden",
      className
    )}>
      {/* Background stars effect */}
      <div className="absolute inset-0">
        <div className="stars-container">
          <div className="stars"></div>
          <div className="stars2"></div>
          <div className="stars3"></div>
        </div>
      </div>
      
      <div className="relative z-10 max-w-sm mx-auto text-center">
        {animationStep >= 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: animationStep === 0 ? 1 : 0, scale: animationStep === 0 ? 1 : 0.5 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <GlowEffect 
              className="w-24 h-24 rounded-full bg-gradient-to-br from-quantum-400 to-quantum-700"
              animation="pulse"
              color="rgba(138, 92, 246, 0.8)"
              intensity="medium"
            />
          </motion.div>
        )}
        
        {animationStep >= 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: animationStep === 1 ? 1 : 0, y: animationStep === 1 ? 0 : -20 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-display text-white mb-4">Welcome, Seeker.</h2>
            <p className="text-white/80">
              Before you begin, take a breath.<br/>Let us activate your Astral Field.
            </p>
          </motion.div>
        )}
        
        {animationStep >= 2 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: animationStep === 2 ? 1 : 0 }}
            transition={{ duration: 1 }}
            className="mb-8"
          >
            <p className="text-white/80 mb-6">
              Focus on your breath. Become aware of the energy flowing through you.
            </p>
          </motion.div>
        )}
        
        {animationStep >= 3 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: animationStep === 3 ? 1 : 0,
              scale: breathCount === 3 ? [1, 1.1, 1] : 1
            }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <GlowEffect 
              className={cn(
                "w-40 h-40 mx-auto rounded-full bg-gradient-to-br transition-all duration-1000",
                "from-quantum-400/80 to-quantum-600/80 cursor-pointer"
              )}
              animation="breathe"
              color="rgba(138, 92, 246, 0.8)"
              intensity="high"
              onClick={handleBreath}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <div className="text-xl font-display mb-2">Breathe</div>
                <div className="text-sm">{breathCount} / 3</div>
              </div>
            </GlowEffect>
            <p className="text-white/80 mt-6">
              Tap the orb as you inhale deeply, then release.
            </p>
          </motion.div>
        )}
        
        {animationStep >= 4 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: animationStep === 4 ? 1 : 0, scale: animationStep === 4 ? 1 : 0.8 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <GlowEffect 
              className="w-60 h-60 rounded-full bg-gradient-to-br from-ethereal-400 to-ethereal-600"
              animation="pulse"
              color="rgba(124, 58, 237, 0.8)"
              intensity="high"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-xl font-display">Astral Field Activated</div>
              </div>
            </GlowEffect>
          </motion.div>
        )}
        
        {animationStep >= 5 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-2xl font-display text-white"
          >
            Now, let's step into Quanex...
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EntryAnimation;
