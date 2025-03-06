
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, CircleDot } from 'lucide-react';
import { StepProps } from '../types';

const MeditationStep: React.FC<StepProps> = ({ onInteraction }) => {
  const [interacted, setInteracted] = useState(false);
  
  const handleInteraction = (type: string) => {
    setInteracted(true);
    if (onInteraction) onInteraction(type, 'meditation');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0, transition: { duration: 0.5 } }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3">
        <Brain className="h-8 w-8 text-purple-500" />
        <h2 className="text-xl font-bold font-display tracking-tight text-primary">Meditation Practice</h2>
      </div>
      <p className="text-muted-foreground">
        Meditation is a key practice for expanding consciousness and connecting with your higher self.
      </p>
      
      <div className="flex justify-center my-4">
        <motion.div 
          className="relative cursor-pointer"
          whileHover={{ scale: 1.05 }}
          onClick={() => handleInteraction('meditation_pulse_clicked')}
        >
          <CircleDot className={`h-16 w-16 text-purple-500 ${interacted ? 'animate-pulse' : ''}`} />
          {interacted && (
            <motion.div 
              className="absolute inset-0 rounded-full bg-purple-500/20"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "loop"
              }}
            />
          )}
        </motion.div>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Access guided meditations, breathing exercises, and visualization techniques through the Meditation node in Metatron's Cube.
      </p>
      
      {interacted && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="mt-2 p-3 bg-purple-900/20 rounded-md"
        >
          <h4 className="text-sm font-medium text-purple-300">Try this simple breath exercise:</h4>
          <ol className="mt-2 text-sm space-y-2 text-white/80">
            <li>1. Breathe in deeply through your nose for 4 counts</li>
            <li>2. Hold your breath for 4 counts</li>
            <li>3. Exhale slowly through your mouth for 6 counts</li>
            <li>4. Repeat 3 times</li>
          </ol>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MeditationStep;
