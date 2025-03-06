
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info, Wifi, WifiOff } from 'lucide-react';
import { AIResponse as AIResponseType } from '@/services/ai/aiService';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AIResponseProps {
  response: AIResponseType;
  onReset: () => void;
  loading?: boolean;
  modelInfo?: {
    model: string;
    tokens: number;
  } | null;
}

const AIResponse: React.FC<AIResponseProps> = ({ 
  response, 
  onReset, 
  loading = false,
  modelInfo
}) => {
  const formatModelName = (name: string) => {
    // Convert model-id format to more readable format
    if (name === 'gpt-4o') return 'GPT-4o';
    if (name === 'gpt-4o-mini') return 'GPT-4o Mini';
    if (name === 'cached') return 'Cached Response';
    if (name === 'offline') return 'Offline Mode';
    if (name === 'fallback') return 'Fallback System';
    return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const isOfflineMode = modelInfo?.model === 'offline' || !navigator.onLine;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-white/80 hover:text-white px-2" 
          onClick={onReset}
          disabled={loading}
        >
          <ArrowLeft size={16} className="mr-1" /> 
          New Question
        </Button>
        
        {modelInfo && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center text-xs text-white/50 hover:text-white/70">
                  {isOfflineMode ? (
                    <WifiOff size={12} className="mr-1 text-amber-400" />
                  ) : (
                    <Info size={12} className="mr-1" />
                  )}
                  {formatModelName(modelInfo.model)}
                </div>
              </TooltipTrigger>
              <TooltipContent side="left">
                <div className="text-xs">
                  <div>Model: {formatModelName(modelInfo.model)}</div>
                  {modelInfo.model !== 'offline' && (
                    <div>Tokens used: {modelInfo.tokens}</div>
                  )}
                  {isOfflineMode && (
                    <div className="text-amber-400">Working in offline mode</div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <div className="prose prose-invert prose-sm max-w-none">
        <div className="whitespace-pre-wrap">
          {response.answer}
          {loading && <span className="inline-block animate-pulse ml-1">▋</span>}
        </div>
      </div>
      
      {response.suggestedPractices && response.suggestedPractices.length > 0 && (
        <>
          <Separator className="bg-white/10 my-4" />
          
          <div>
            <h4 className="text-sm font-medium text-white/80 mb-2">
              Suggested Practices
            </h4>
            <ul className="space-y-1 pl-5 list-disc text-sm text-white/70">
              {response.suggestedPractices.map((practice, idx) => (
                <li key={idx}>{practice}</li>
              ))}
            </ul>
          </div>
        </>
      )}

      {isOfflineMode && (
        <div className="flex items-center text-xs text-amber-400 mt-4 gap-1">
          <WifiOff size={12} />
          <span>You're currently viewing offline content. Reconnect for personalized responses.</span>
        </div>
      )}
    </div>
  );
};

export default AIResponse;
