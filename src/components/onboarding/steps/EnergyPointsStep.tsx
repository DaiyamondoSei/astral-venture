
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Sparkles, CheckCircle } from 'lucide-react';
import { StepProps } from './types';

const EnergyPointsStep: React.FC<StepProps> = ({ onInteraction }) => {
  const [interacted, setInteracted] = useState(false);
  
  const handleInteraction = (type: string) => {
    setInteracted(true);
    if (onInteraction) onInteraction(type, 'energy-points');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0, transition: { duration: 0.5 } }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3">
        <Zap className="h-8 w-8 text-cyan-500" />
        <h2 className="text-xl font-bold font-display tracking-tight text-primary">Energy Points</h2>
      </div>
      <p className="text-muted-foreground">
        Your spiritual journey is measured through energy points, which reflect your growth and commitment to practice.
      </p>
      
      <div className="p-4 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-lg">
        <div className="flex justify-between mb-2">
          <span className="text-sm">Current Level: 1</span>
          <span className="text-sm">Next Level: 2</span>
        </div>
        <motion.div 
          className="h-2 bg-background/30 rounded-full overflow-hidden cursor-pointer"
          whileHover={{ scale: 1.02 }}
          onClick={() => handleInteraction('energy_bar_clicked')}
        >
          <motion.div 
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" 
            initial={{ width: 0 }}
            animate={{ width: interacted ? '45%' : '30%' }}
            transition={{ duration: 1.5, delay: 0.5 }}
          ></motion.div>
        </motion.div>
        
        <div className="mt-2 text-xs text-center text-muted-foreground">
          {interacted ? '45 / 100 Energy Points' : '30 / 100 Energy Points'}
          {interacted && (
            <span className="ml-2 text-cyan-400">+15 <Sparkles className="inline h-3 w-3" /></span>
          )}
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Complete reflections, meditations, and daily challenges to increase your energy points and ascend to higher levels.
      </p>
      
      {interacted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-sm text-blue-400"
        >
          <CheckCircle className="inline-block mr-2 h-4 w-4" /> 
          You've earned bonus energy for exploring this feature!
        </motion.div>
      )}
    </motion.div>
  );
};

export default EnergyPointsStep;
