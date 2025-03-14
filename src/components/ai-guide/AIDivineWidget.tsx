
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { useAIAssistant } from '@/components/ai-assistant/hooks/useAIAssistant';
import { AIResponseDisplay } from '@/components/ai-assistant/AIResponseDisplay';

export interface AIDivineWidgetProps {
  initialPrompt?: string;
  maxHeight?: string;
  title?: string;
}

export const AIDivineWidget: React.FC<AIDivineWidgetProps> = ({
  initialPrompt = 'How can I balance my energy today?',
  maxHeight = '350px',
  title = 'Divine Guidance'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    question,
    setQuestion,
    response,
    loading,
    handleSubmitQuestion,
    reset
  } = useAIAssistant({ open: isOpen });

  // Set initial question
  React.useEffect(() => {
    if (initialPrompt) {
      setQuestion(initialPrompt);
    }
  }, [initialPrompt, setQuestion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmitQuestion();
  };

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <CardTitle className="flex items-center text-lg">
          <Sparkles className="mr-2 h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className={`p-4 ${maxHeight ? `max-h-[${maxHeight}] overflow-y-auto` : ''}`}>
        {!response ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask for guidance..."
              className="min-h-[100px]"
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={loading || !question.trim()}>
                {loading ? (
                  <>
                    <span className="animate-pulse mr-2">●</span>
                    Receiving...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Ask for Guidance
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <AIResponseDisplay response={response} />
            <div className="flex justify-end">
              <Button variant="outline" onClick={reset}>
                Ask Another Question
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIDivineWidget;
