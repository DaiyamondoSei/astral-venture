
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Triangle, RotateCcw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StepProps } from '../types';

const SacredGeometryStep: React.FC<StepProps> = ({ onInteraction }) => {
  const [interacted, setInteracted] = useState(false);
  const [rotationDegree, setRotationDegree] = useState(0);
  
  const handleInteraction = (type: string) => {
    setInteracted(true);
    if (onInteraction) onInteraction(type, 'sacred-geometry');
  };
  
  const handleRotateGeometry = () => {
    setRotationDegree(prev => prev + 45);
    handleInteraction('geometry_rotated');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0, transition: { duration: 0.5 } }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3">
        <Triangle className="h-8 w-8 text-emerald-500" />
        <h2 className="text-xl font-bold font-display tracking-tight text-primary">Sacred Geometry</h2>
      </div>
      <p className="text-muted-foreground">
        Sacred geometry reveals the mathematical patterns that form the foundation of our universe. Metatron's Cube is a powerful symbol containing all Platonic solids.
      </p>
      
      <div className="relative h-48 w-full bg-gradient-to-br from-black/50 to-quantum-950/50 rounded-lg flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-quantum-500 to-transparent"></div>
        <motion.div 
          animate={{ rotate: rotationDegree }}
          transition={{ type: "spring", damping: 10 }}
        >
          <svg viewBox="0 0 100 100" className="w-32 h-32 stroke-quantum-400">
            <circle cx="50" cy="50" r="40" fill="none" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="30" fill="none" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="20" fill="none" strokeWidth="0.5" />
            <polygon points="50,10 90,50 50,90 10,50" fill="none" strokeWidth="0.5" />
            <polygon points="30,20 70,20 70,80 30,80" fill="none" strokeWidth="0.5" />
          </svg>
        </motion.div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="absolute bottom-2 right-2 bg-black/30 text-white border-white/20"
          onClick={handleRotateGeometry}
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Rotate
        </Button>
      </div>
      
      <p className="text-sm text-muted-foreground">
        In Quanex, you'll interact with Metatron's Cube to access different aspects of your spiritual practice.
      </p>
      
      {rotationDegree >= 180 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-sm text-emerald-400"
        >
          <CheckCircle className="inline-block mr-2 h-4 w-4" /> 
          You've discovered the multidimensional nature of sacred geometry!
        </motion.div>
      )}
    </motion.div>
  );
};

export default SacredGeometryStep;
