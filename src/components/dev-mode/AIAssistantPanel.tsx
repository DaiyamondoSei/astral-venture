
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAssistant } from '@/hooks/useAssistant';
import { AISuggestionList } from '@/components/ai-assistant/AISuggestionList';
import { Loader2, Send } from 'lucide-react';

interface AIAssistantPanelProps {
  componentName?: string;
}

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({ componentName }) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [inputValue, setInputValue] = useState('');
  const {
    question,
    setQuestion,
    response,
    submitQuestion,
    isLoading,
    analyzeComponent,
  } = useAssistant({ componentName });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    setQuestion(inputValue);
    await submitQuestion(inputValue);
    setInputValue('');
  };

  const handleAnalyze = () => {
    if (componentName) {
      analyzeComponent(componentName);
    }
  };

  return (
    <Card className="border rounded-lg shadow-sm overflow-hidden">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <div className="p-4 border-b">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="chat" className="p-0">
          <div className="flex flex-col h-[400px]">
            <div className="flex-1 overflow-auto p-4">
              {response ? (
                <div className="prose dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: response }} />
                </div>
              ) : (
                <div className="text-center text-muted-foreground h-full flex items-center justify-center">
                  <p>Ask me anything about this component or how to improve it.</p>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="border-t p-4 flex gap-2">
              <Input
                placeholder="Ask about this component..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
              />
              <Button type="submit" size="sm" disabled={isLoading || !inputValue.trim()}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="suggestions" className="p-0">
          <div className="h-[400px] overflow-auto p-4">
            <AISuggestionList 
              componentId={componentName} 
              limit={5} 
            />
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default AIAssistantPanel;
