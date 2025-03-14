
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useOptimizedAIAssistant } from '@/hooks/useOptimizedAIAssistant';
import { AIResponseDisplay } from './AIResponseDisplay';
import { AIDashboardWidgetProps } from './types';

export function AIDashboardWidget({ 
  initialPrompt = "How can I improve my energy flow?",
  title = "AI Guide",
  description = "Ask your spiritual guide anything",
  maxHeight = "500px"
}: AIDashboardWidgetProps) {
  const [question, setQuestion] = useState('');
  const { isLoading, error, response, submitQuestion } = useOptimizedAIAssistant();
  const [selectedReflectionId, setSelectedReflectionId] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    // Create the final submission parameters with proper type structure
    const aiQuestion = {
      text: question,
      question: question,
      userId: 'user-id', // This should ideally come from auth context
      context: selectedReflectionId ? 'reflection' : '',
      reflectionIds: selectedReflectionId ? [selectedReflectionId] : [],
    };

    // Submit the question
    await submitQuestion(aiQuestion);
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder={initialPrompt}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Thinking...' : 'Ask'}
            </Button>
          </div>
        </form>
        
        {response && (
          <div className="mt-4" style={{ maxHeight, overflowY: 'auto' }}>
            <AIResponseDisplay response={response} />
          </div>
        )}
        
        {error && (
          <div className="text-red-500 mt-2 text-sm">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
