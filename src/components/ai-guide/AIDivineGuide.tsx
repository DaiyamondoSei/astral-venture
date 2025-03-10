
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDivineIntelligenceContext } from '@/contexts/DivineIntelligenceContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, 
  Sparkles, 
  RotateCcw, 
  ChevronUp, 
  ChevronDown,
  MessageSquare,
  Lightbulb
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface AIDivineGuideProps {
  initialPrompt?: string;
  showHeader?: boolean;
  maxHeight?: string;
  className?: string;
}

const AIDivineGuide: React.FC<AIDivineGuideProps> = ({
  initialPrompt,
  showHeader = true,
  maxHeight = '500px',
  className = ''
}) => {
  const {
    processMessage,
    isProcessing,
    lastResponse,
    conversationHistory,
    clearConversation
  } = useDivineIntelligenceContext();
  
  const [message, setMessage] = useState(initialPrompt || '');
  const [isExpanded, setIsExpanded] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom of messages when conversation updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory]);

  // Auto-resize textarea as content grows
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'inherit';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isProcessing) return;
    
    await processMessage(message);
    setMessage('');
    
    // Focus back on input after processing
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(timestamp);
  };

  return (
    <Card className={`overflow-hidden relative ${className}`}>
      {/* Expandable header */}
      {showHeader && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <h3 className="font-semibold">Divine Intelligence Guide</h3>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => clearConversation()}
              className="text-white hover:text-white/80 hover:bg-white/10"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-white hover:text-white/80 hover:bg-white/10"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Conversation display */}
            <Tabs defaultValue="chat" className="w-full">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="chat" className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>Conversation</span>
                </TabsTrigger>
                <TabsTrigger value="insights" className="flex items-center gap-1">
                  <Lightbulb className="h-4 w-4" />
                  <span>Insights</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="chat" className="p-0">
                <ScrollArea className={`p-4 ${maxHeight ? `max-h-[${maxHeight}]` : 'max-h-[300px]'}`}>
                  {conversationHistory.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Sparkles className="mx-auto h-8 w-8 opacity-50 mb-2" />
                      <p>Ask any question about your spiritual journey, consciousness, or energy practices.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {conversationHistory.map((entry, index) => (
                        <div key={index} className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`flex gap-2 max-w-[80%] ${entry.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <Avatar className={`h-8 w-8 ${entry.role === 'user' ? 'bg-blue-500' : 'bg-purple-600'}`}>
                              {entry.role === 'user' ? (
                                <div className="text-xs text-white">You</div>
                              ) : (
                                <Sparkles className="h-4 w-4 text-white" />
                              )}
                            </Avatar>
                            <div>
                              <div className={`rounded-lg p-3 ${
                                entry.role === 'user' 
                                  ? 'bg-blue-100 dark:bg-blue-900/30' 
                                  : 'bg-purple-100 dark:bg-purple-900/30'
                              }`}>
                                <p className="text-sm whitespace-pre-wrap">{entry.content}</p>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {formatTimestamp(entry.timestamp)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="insights" className="p-0">
                <ScrollArea className={`p-4 ${maxHeight ? `max-h-[${maxHeight}]` : 'max-h-[300px]'}`}>
                  {!lastResponse ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Lightbulb className="mx-auto h-8 w-8 opacity-50 mb-2" />
                      <p>Insights from your conversation will appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Insights Section */}
                      {lastResponse.insights && lastResponse.insights.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">Insights</h4>
                          {lastResponse.insights.map((insight, index) => (
                            <div key={index} className="bg-gray-100 dark:bg-gray-800 rounded p-3">
                              <Badge variant="outline" className="mb-1">{insight.type}</Badge>
                              <p className="text-sm">{insight.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Chakra Focus */}
                      {lastResponse.chakraFocus && lastResponse.chakraFocus.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">Chakra Focus</h4>
                          <div className="flex flex-wrap gap-1">
                            {lastResponse.chakraFocus.map((chakra, index) => (
                              <Badge key={index} className="bg-indigo-500">{chakra}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Emotional Guidance */}
                      {lastResponse.emotionalGuidance && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">Emotional Guidance</h4>
                          <div className="bg-gray-100 dark:bg-gray-800 rounded p-3">
                            <p className="text-sm">{lastResponse.emotionalGuidance}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Suggested Practices */}
                      {lastResponse.suggestedPractices && lastResponse.suggestedPractices.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">Suggested Practices</h4>
                          {lastResponse.suggestedPractices.map((practice, index) => (
                            <div key={index} className="bg-gray-100 dark:bg-gray-800 rounded p-3">
                              <h5 className="text-sm font-medium">{practice.title}</h5>
                              <p className="text-sm">{practice.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
            
            <Separator />
            
            {/* Input area */}
            <form onSubmit={handleSubmit} className="p-3 flex gap-2 items-end">
              <Textarea
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your journey, energy, or consciousness..."
                className="min-h-[60px] resize-none"
                rows={1}
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={isProcessing || !message.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default AIDivineGuide;
