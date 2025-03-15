
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';
import { useAssistant } from '@/hooks/useAssistant';

export const AIAssistantPanel: React.FC = () => {
  const { 
    isLoading, 
    tokens, 
    response, 
    question, 
    setQuestion,
    submitQuestion
  } = useAssistant();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() === '') return;
    
    await submitQuestion();
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>AI Assistant</span>
          {tokens > 0 && (
            <span className="text-xs text-muted-foreground">
              Tokens: {tokens}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Ask a question about your code..."
            rows={4}
            className="w-full resize-none"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || question.trim() === ''}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit
              </>
            )}
          </Button>
        </form>

        {response && (
          <div className="mt-6">
            <h3 className="font-medium mb-2">Response:</h3>
            <div className="p-3 bg-muted/50 rounded-md text-sm whitespace-pre-wrap">
              {response.answer || response.response}
            </div>
            
            {response.insights && response.insights.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Insights:</h3>
                <ul className="space-y-2">
                  {response.insights.map((insight, index) => (
                    <li key={index} className="text-sm">
                      • {typeof insight === 'string' 
                          ? insight 
                          : insight.content || insight.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIAssistantPanel;
