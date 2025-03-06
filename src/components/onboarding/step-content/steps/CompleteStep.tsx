
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { StepProps } from '../types';

const CompleteStep: React.FC<StepProps> = ({ onInteraction }) => {
  const [interacted, setInteracted] = useState(false);
  
  const handleInteraction = (type: string) => {
    setInteracted(true);
    if (onInteraction) onInteraction(type, 'complete');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0, transition: { duration: 0.5 } }}
      className="space-y-4 text-center"
    >
      <Sparkles className="mx-auto h-12 w-12 text-quantum-500" />
      <h2 className="text-2xl font-bold font-display tracking-tight text-primary">Your Journey Begins</h2>
      <p className="text-muted-foreground">
        You're now ready to explore Quanex and deepen your spiritual practice. Remember, this is just the beginning.
      </p>
      
      <div className="grid grid-cols-3 gap-4 mt-6">
        {['Meditate', 'Reflect', 'Learn'].map((activity, i) => (
          <motion.div 
            key={i} 
            className="p-3 bg-quantum-500/10 rounded-lg text-sm cursor-pointer"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 + (i * 0.2) }}
            whileHover={{ 
              backgroundColor: 'rgba(136, 85, 255, 0.2)',
              y: -2
            }}
            onClick={() => handleInteraction(`complete_activity_${activity.toLowerCase()}`)}
          >
            {activity}
          </motion.div>
        ))}
      </div>
      
      <motion.p 
        className="text-sm text-muted-foreground mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        You can revisit this guide anytime through the settings menu.
      </motion.p>
      
      <motion.button
        className="mt-6 px-6 py-3 rounded-md bg-gradient-to-r from-quantum-500 to-astral-500 text-white font-medium shadow-md"
        whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(136, 85, 255, 0.5)" }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleInteraction('journey_begin')}
      >
        Begin Your Cosmic Journey
      </motion.button>
    </motion.div>
  );
};

export default CompleteStep;
