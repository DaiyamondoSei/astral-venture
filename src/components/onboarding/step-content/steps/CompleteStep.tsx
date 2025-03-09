
import React from 'react';
import { StepProps } from '../types';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

const CompleteStep: React.FC<StepProps> = ({ onComplete }) => {
  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <div className="mb-6 flex justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ 
            type: 'spring', 
            stiffness: 260, 
            damping: 20,
            delay: 0.2 
          }}
          className="h-20 w-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center"
        >
          <Sparkles className="h-10 w-10 text-white" />
        </motion.div>
      </div>
      
      <motion.h3
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-xl font-semibold mb-4 text-white"
      >
        You're All Set!
      </motion.h3>
      
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-white/80 mb-8"
      >
        Congratulations on completing the onboarding process. Your journey to higher consciousness begins now. Explore the app to discover practices, track your progress, and deepen your awareness.
      </motion.p>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Button 
          onClick={handleComplete}
          className="bg-gradient-to-r from-purple-500 to-blue-500 w-full py-6 text-lg"
        >
          Begin Your Journey
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default CompleteStep;
