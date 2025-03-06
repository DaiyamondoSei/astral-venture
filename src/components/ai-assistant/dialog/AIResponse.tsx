
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Sparkles, AlertTriangle } from 'lucide-react';
import { AIResponse as AIResponseType } from '@/services/ai/aiService';

interface AIResponseProps {
  response: AIResponseType;
  onReset: () => void;
  loading: boolean;
}

const AIResponse: React.FC<AIResponseProps> = ({ response, onReset, loading }) => {
  // Safely extract content from response with fallbacks
  const answer = response?.answer || "Sorry, I couldn't generate a response at this time.";
  
  // Ensure suggestedPractices is an array
  const suggestedPractices = Array.isArray(response?.suggestedPractices) 
    ? response.suggestedPractices.filter(practice => practice) // Filter out empty values
    : [];

  // Determine if response looks repetitive/stuck by checking for certain patterns
  const isRepetitive = 
    answer === "Sorry, I couldn't generate a response at this time." || 
    answer.includes("I'm sorry, I couldn't process your question") ||
    answer.includes("That's an interesting question about your energy practice");

  return (
    <div className="space-y-4">
      <div className="bg-black/20 p-4 rounded-lg border border-white/10">
        <div className="flex items-start gap-3">
          {isRepetitive ? (
            <AlertTriangle className="text-amber-400 mt-1" size={18} />
          ) : (
            <MessageCircle className="text-quantum-400 mt-1" size={18} />
          )}
          <div className="text-white/90">
            {answer}
            
            {isRepetitive && (
              <div className="mt-4 text-amber-300 text-sm">
                It seems we're having trouble generating a response. Try asking a different question.
              </div>
            )}
          </div>
        </div>
      </div>
      
      {suggestedPractices.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-white/80">Suggested Practices:</h4>
          <ul className="space-y-1">
            {suggestedPractices.map((practice, i) => (
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
