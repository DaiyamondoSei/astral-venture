
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Sparkles, AlertTriangle, Info } from 'lucide-react';
import { AIResponse as AIResponseType } from '@/services/ai/aiService';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AIResponseProps {
  response: AIResponseType;
  onReset: () => void;
  loading: boolean;
  modelInfo?: {model: string; tokens: number} | null;
}

const AIResponse: React.FC<AIResponseProps> = ({ 
  response, 
  onReset, 
  loading,
  modelInfo 
}) => {
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
    
  // Check if we're using fallback content
  const isFallback = modelInfo?.model === 'fallback';

  return (
    <div className="space-y-4">
      <div className="bg-black/20 p-4 rounded-lg border border-white/10">
        <div className="flex items-start gap-3">
          {isRepetitive || isFallback ? (
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
            
            {isFallback && (
              <div className="mt-4 text-amber-300 text-sm">
                Note: This is a fallback response. Our AI service is currently unavailable.
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
      
      {modelInfo && !isFallback && (
        <div className="flex items-center justify-end text-xs text-white/40">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 cursor-help">
                  <Info size={10} />
                  Generated with {modelInfo.model}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Model: {modelInfo.model}</p>
                <p>Tokens: {modelInfo.tokens}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
