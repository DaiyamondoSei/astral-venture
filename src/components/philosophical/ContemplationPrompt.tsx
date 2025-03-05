
import React from 'react';
import { Brain } from 'lucide-react';

interface ContemplationPromptProps {
  prompt: string;
}

const ContemplationPrompt: React.FC<ContemplationPromptProps> = ({ prompt }) => {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 mt-1">
        <Brain size={20} className="text-quantum-400" />
      </div>
      <div>
        <h4 className="text-white/90 font-medium mb-1">Today's Contemplation</h4>
        <p className="text-white/70 text-sm">{prompt}</p>
      </div>
    </div>
  );
};

export default ContemplationPrompt;
