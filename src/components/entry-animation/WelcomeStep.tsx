
import React from 'react';
import { motion } from 'framer-motion';

interface WelcomeStepProps {
  step: number;
  currentStep: number;
}

const WelcomeStep = ({ step, currentStep }: WelcomeStepProps) => {
  if (step !== currentStep) return null;
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.5
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 50
      }
    }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="mb-8 text-center"
    >
      <motion.div 
        className="mb-4"
        variants={item}
      >
        <h2 className="text-2xl md:text-3xl font-display text-white inline-block relative">
          Welcome, Seeker.
          <motion.span 
            className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-quantum-500 to-transparent"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 1.5, duration: 0.8 }}
          />
        </h2>
      </motion.div>
      
      <motion.p 
        className="text-white/80 text-base md:text-lg"
        variants={item}
      >
        Before you begin, take a breath.
      </motion.p>
      
      <motion.p 
        className="text-white/80 text-base md:text-lg"
        variants={item}
      >
        Let us activate your <span className="text-quantum-300">Astral Field</span>.
      </motion.p>
      
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.2, 1], opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
        className="mt-6 mx-auto w-2 h-2 bg-quantum-400 rounded-full"
      />
    </motion.div>
  );
};

export default WelcomeStep;
