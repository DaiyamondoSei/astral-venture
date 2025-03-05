
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Sparkles } from 'lucide-react';
import { AIResponse as AIResponseType } from '@/services/ai/aiService';

interface AIResponseProps {
  response: AIResponseType;
  onReset: () => void;
  loading: boolean;
}

const AIResponse: React.FC<AIResponseProps> = ({ response, onReset, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-black/20 p-4 rounded-lg border border-white/10">
        <div className="flex items-start gap-3">
          <MessageCircle className="text-quantum-400 mt-1" size={18} />
          <div className="text-white/90">{response.answer}</div>
        </div>
      </div>
      
      {response.suggestedPractices && response.suggestedPractices.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-white/80">Suggested Practices:</h4>
          <ul className="space-y-1">
            {response.suggestedPractices.map((practice, i) => (
              <li key={i} className="text-sm text-white/70 flex items-center gap-2">
                <Sparkles size={12} className="text-quantum-400" />
                {practice}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <Button 
        variant="outline" 
        className="w-full border-white/10"
        onClick={onReset}
        disabled={loading}
      >
        Ask Another Question
      </Button>
    </div>
  );
};

export default AIResponse;
