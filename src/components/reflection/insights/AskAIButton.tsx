
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface AskAIButtonProps {
  onOpenAiAssistant: () => void;
}

const AskAIButton: React.FC<AskAIButtonProps> = ({ onOpenAiAssistant }) => {
  return (
    <div className="pt-2">
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full flex items-center justify-center gap-1 border-quantum-400/30 text-quantum-400 hover:bg-quantum-500/10"
        onClick={onOpenAiAssistant}
      >
        <Sparkles size={14} />
        Ask Quantum Guide for Deeper Insights
      </Button>
    </div>
  );
};

export default AskAIButton;
