
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { AIResponseDisplay } from '@/components/ai-assistant/AIResponseDisplay';
import { useAIAssistant } from '@/components/ai-assistant/hooks/useAIAssistant';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface AIDivineWidgetProps {
  initialPrompt?: string;
  title?: string;
  description?: string;
  maxHeight?: string;
}

export const AIDivineWidget: React.FC<AIDivineWidgetProps> = ({
  initialPrompt = "How can I deepen my spiritual practice?",
  title = "Divine Intelligence",
  description = "An AI guide on your spiritual journey",
  maxHeight = "500px"
}) => {
  const [open, setOpen] = useState(true);
  const {
    question,
    setQuestion,
    response,
    loading,
    error,
    handleSubmitQuestion,
    reset
  } = useAIAssistant({ open });

  useEffect(() => {
    // Pre-populate with initial prompt
    setQuestion(initialPrompt);
  }, [initialPrompt, setQuestion]);

  const handleSendQuestion = async () => {
    await handleSubmitQuestion();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendQuestion();
    }
  };

  return (
    <Card className="w-full shadow-lg border-quantum-700/30 bg-quantum-950/90 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 bg-primary/20">
            <AvatarImage src="/assets/ai-guide-avatar.png" alt="AI Guide" />
            <AvatarFallback>
              <Sparkles className="h-4 w-4 text-primary" />
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base text-quantum-100">{title}</CardTitle>
            <CardDescription className="text-xs text-quantum-400">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0">
        <ScrollArea className={`pr-4 overflow-y-auto`} style={{ maxHeight }}>
          {!response && !loading && (
            <div className="pb-4 text-quantum-300 text-sm">
              <p>Ask me anything about your spiritual practice, meditation techniques, or consciousness expansion.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <SuggestionPill 
                  text="How can I activate my chakras?" 
                  onClick={() => setQuestion("How can I activate my chakras?")}
                />
                <SuggestionPill 
                  text="Explain quantum consciousness" 
                  onClick={() => setQuestion("Explain quantum consciousness")}
                />
                <SuggestionPill 
                  text="Best meditation technique for beginners" 
                  onClick={() => setQuestion("What's the best meditation technique for beginners?")}
                />
              </div>
            </div>
          )}
          
          {loading && (
            <div className="py-8 flex justify-center items-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          )}
          
          {response && (
            <div className="py-2">
              <div className="mb-4 bg-quantum-800/30 p-3 rounded-lg text-quantum-200">
                <p className="text-sm font-medium mb-1">You asked:</p>
                <p className="text-sm italic">{question}</p>
              </div>
              <AIResponseDisplay response={response} />
              
              <div className="mt-6 mb-2 flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    reset();
                    setQuestion("");
                  }}
                >
                  Ask another question
                </Button>
              </div>
            </div>
          )}
          
          {error && (
            <div className="py-4 text-red-500 text-center">
              <p>Sorry, there was an error processing your request.</p>
              <p className="text-sm mt-1">{error}</p>
              <Button 
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => reset()}
              >
                Try again
              </Button>
            </div>
          )}
        </ScrollArea>
      </CardContent>
      
      {!response && !loading && (
        <CardFooter className="pt-0 pb-3">
          <div className="flex w-full gap-2">
            <Input
              placeholder="Ask a question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-quantum-900/50 border-quantum-700 text-quantum-100"
            />
            <Button 
              size="icon"
              disabled={!question.trim() || loading}
              onClick={handleSendQuestion}
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

interface SuggestionPillProps {
  text: string;
  onClick: () => void;
}

const SuggestionPill: React.FC<SuggestionPillProps> = ({ text, onClick }) => {
  return (
    <button
      className="text-xs px-3 py-1.5 bg-quantum-800/30 hover:bg-quantum-800/50 
                text-quantum-300 rounded-full transition-colors"
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default AIDivineWidget;
