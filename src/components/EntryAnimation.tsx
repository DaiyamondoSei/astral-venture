
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
            <div className="relative">
              {/* Improved Astral Body Silhouette - Human-like form */}
              <svg 
                className="w-64 h-80 mx-auto astral-body-silhouette"
                viewBox="0 0 200 320" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Head */}
                <circle cx="100" cy="60" r="30" className="astral-body-part" />
                
                {/* Neck */}
                <path d="M90 90 L110 90 L108 105 L92 105 Z" className="astral-body-part" />
                
                {/* Torso */}
                <path d="M75 105 L125 105 L135 200 L65 200 Z" className="astral-body-part" />
                
                {/* Arms */}
                <path d="M75 115 L40 160 L48 170 L85 125" className="astral-body-part" />
                <path d="M125 115 L160 160 L152 170 L115 125" className="astral-body-part" />
                
                {/* Hands */}
                <circle cx="40" cy="168" r="8" className="astral-body-part" />
                <circle cx="160" cy="168" r="8" className="astral-body-part" />
                
                {/* Legs */}
                <path d="M85 200 L65 280 L85 285 L95 205" className="astral-body-part" />
                <path d="M115 200 L135 280 L115 285 L105 205" className="astral-body-part" />
                
                {/* Feet */}
                <path d="M65 280 L55 285 L65 295 L85 285" className="astral-body-part" />
                <path d="M135 280 L145 285 L135 295 L115 285" className="astral-body-part" />
                
                {/* Energy Points (chakras) */}
                <circle cx="100" cy="60" r="6" className="energy-point crown-chakra" />
                <circle cx="100" cy="90" r="5" className="energy-point throat-chakra" />
                <circle cx="100" cy="120" r="7" className="energy-point heart-chakra" />
                <circle cx="100" cy="150" r="6" className="energy-point solar-chakra" />
                <circle cx="100" cy="180" r="5" className="energy-point sacral-chakra" />
                <circle cx="100" cy="200" r="6" className="energy-point root-chakra" />
              </svg>
              
              <GlowEffect 
                className="absolute inset-0 w-full h-full rounded-lg"
                animation="pulse"
                color="rgba(124, 58, 237, 0.8)"
                intensity="high"
              />
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-xl font-display mt-40">Astral Field Activated</div>
              </div>
            </div>
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
