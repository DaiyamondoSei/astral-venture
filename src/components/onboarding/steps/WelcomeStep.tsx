
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle } from 'lucide-react';
import { StepProps } from './types';

const WelcomeStep: React.FC<StepProps> = ({ onInteraction }) => {
  const [interacted, setInteracted] = useState(false);
  
  const handleInteraction = (type: string) => {
    setInteracted(true);
    if (onInteraction) onInteraction(type, 'welcome');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0, transition: { duration: 0.5 } }}
      className="space-y-4 text-center"
    >
      <Sparkles className="mx-auto h-12 w-12 text-quantum-500" />
      <h2 className="text-2xl font-bold font-display tracking-tight text-primary">Welcome to Quanex</h2>
      <p className="text-muted-foreground">
        Your journey to higher consciousness begins here. Let's explore the sacred tools and wisdom that will guide your spiritual growth.
      </p>
      <div className="p-4 bg-quantum-500/10 rounded-lg mt-6">
        <p className="text-sm">This guided tour will introduce you to sacred geometry, chakras, and how to use the application to deepen your practice.</p>
      </div>
      
      <motion.button
        className={`mt-4 px-6 py-2.5 rounded-md bg-gradient-to-r from-quantum-500 to-astral-500 text-white font-medium shadow-md ${interacted ? 'opacity-80' : 'animate-pulse'}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleInteraction('welcome_begin')}
      >
        {interacted ? 'Journey Initiated' : 'Begin Your Journey'}
        {interacted && <CheckCircle className="inline-block ml-2 h-4 w-4" />}
      </motion.button>
    </motion.div>
  );
};

export default WelcomeStep;
