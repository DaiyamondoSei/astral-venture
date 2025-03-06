
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, CheckCircle } from 'lucide-react';
import { StepProps } from '../types';

const ReflectionStep: React.FC<StepProps> = ({ onInteraction }) => {
  const [interacted, setInteracted] = useState(false);
  
  const handleInteraction = (type: string) => {
    setInteracted(true);
    if (onInteraction) onInteraction(type, 'reflection');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0, transition: { duration: 0.5 } }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3">
        <Eye className="h-8 w-8 text-emerald-500" />
        <h2 className="text-xl font-bold font-display tracking-tight text-primary">Reflection Practice</h2>
      </div>
      <p className="text-muted-foreground">
        Self-reflection deepens your understanding of your inner world and spiritual journey.
      </p>
      
      <div className="p-4 border border-emerald-500/20 rounded-lg">
        <p className="text-sm italic">
          "What patterns or insights have emerged in your consciousness today?"
        </p>
        <motion.div 
          className="h-16 bg-emerald-950/20 rounded mt-2 border border-emerald-500/10 p-2 text-sm text-white/60 cursor-text"
          whileHover={{ borderColor: 'rgba(52, 211, 153, 0.3)' }}
          onClick={() => handleInteraction('reflection_input_clicked')}
        >
          {interacted ? "I've noticed that I feel more centered when I take time to breathe consciously..." : "Click to add your reflection..."}
        </motion.div>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Regular reflection helps activate chakras and generates personalized insights about your spiritual growth.
      </p>
      
      {interacted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-sm text-emerald-400"
        >
          <CheckCircle className="inline-block mr-2 h-4 w-4" /> 
          Your reflection has activated your Heart and Throat chakras!
        </motion.div>
      )}
    </motion.div>
  );
};

export default ReflectionStep;
