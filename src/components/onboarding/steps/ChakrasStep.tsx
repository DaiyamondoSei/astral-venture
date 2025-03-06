
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sun } from 'lucide-react';
import { StepProps } from './types';

// Chakra names for reference
const chakraNames = [
  'Root',
  'Sacral', 
  'Solar',
  'Heart',
  'Throat',
  'Third Eye',
  'Crown'
];

const ChakrasStep: React.FC<StepProps> = ({ onInteraction }) => {
  const [interacted, setInteracted] = useState(false);
  const [selectedChakra, setSelectedChakra] = useState<number | null>(null);
  
  const handleInteraction = (type: string) => {
    setInteracted(true);
    if (onInteraction) onInteraction(type, 'chakras');
  };
  
  const handleChakraClick = (index: number) => {
    setSelectedChakra(index);
    handleInteraction('chakra_selected');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0, transition: { duration: 0.5 } }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3">
        <Sun className="h-8 w-8 text-orange-500" />
        <h2 className="text-xl font-bold font-display tracking-tight text-primary">Chakra System</h2>
      </div>
      <p className="text-muted-foreground">
        Chakras are energy centers in your astral body. There are seven main chakras, each associated with different aspects of consciousness.
      </p>
      
      <div className="grid grid-cols-7 gap-1 mt-4 justify-items-center">
        {['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#8B00FF'].map((color, i) => (
          <motion.div 
            key={i} 
            className="flex flex-col items-center gap-1 cursor-pointer"
            whileHover={{ y: -3, scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleChakraClick(i)}
          >
            <div 
              className={`w-8 h-8 rounded-full ${selectedChakra === i ? 'ring-2 ring-white ring-offset-1 ring-offset-black' : ''}`} 
              style={{ backgroundColor: color }}
            ></div>
            <span className="text-xs text-muted-foreground">{chakraNames[i]}</span>
          </motion.div>
        ))}
      </div>
      
      {selectedChakra !== null && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-2 p-3 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg border border-purple-500/20"
        >
          <h4 className="font-medium text-white">{chakraNames[selectedChakra]} Chakra</h4>
          <p className="text-sm text-white/80 mt-1">
            {selectedChakra === 0 && "Associated with survival, grounding, and stability. When balanced, you feel secure and confident."}
            {selectedChakra === 1 && "Connected to creativity, pleasure, and emotional well-being. When balanced, you feel passionate and expressive."}
            {selectedChakra === 2 && "Governs personal power, confidence, and self-esteem. When balanced, you feel empowered and decisive."}
            {selectedChakra === 3 && "The center of love, compassion, and connection. When balanced, you can give and receive love freely."}
            {selectedChakra === 4 && "Related to communication, self-expression, and truth. When balanced, you communicate honestly and listen effectively."}
            {selectedChakra === 5 && "Linked to intuition, imagination, and inner wisdom. When balanced, you trust your intuition and see clearly."}
            {selectedChakra === 6 && "Connected to spiritual awareness and enlightenment. When balanced, you feel a sense of unity and purpose."}
          </p>
        </motion.div>
      )}
      
      <p className="text-sm text-muted-foreground mt-4">
        As you grow in your practice, you'll activate and balance these energy centers.
      </p>
    </motion.div>
  );
};

export default ChakrasStep;
