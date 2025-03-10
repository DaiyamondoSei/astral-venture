
import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, SendIcon, Lightbulb, BookOpen, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

interface DivinePractice {
  id: string;
  title: string;
  description: string;
}

interface DivineInsight {
  type: string;
  content: string;
}

interface DivineFeedback {
  message: string;
  insights: DivineInsight[];
  suggestedPractices: DivinePractice[];
  chakraFocus: string[];
  emotionalGuidance: string;
  intentType: string;
  metrics?: {
    processingTime: number;
    tokenUsage: any;
    model: string;
    cached: boolean;
  };
}

// Predefined intent options
const INTENT_OPTIONS = [
  { id: "general", label: "General Guidance", icon: <Sparkles className="w-4 h-4" /> },
  { id: "guidance", label: "Spiritual Direction", icon: <Sparkles className="w-4 h-4" /> },
  { id: "reflection", label: "Reflection Support", icon: <BookOpen className="w-4 h-4" /> },
  { id: "practice", label: "Practice Suggestions", icon: <BookOpen className="w-4 h-4" /> },
  { id: "chakra", label: "Chakra Guidance", icon: <Sparkles className="w-4 h-4" /> },
  { id: "insight", label: "Consciousness Insights", icon: <Lightbulb className="w-4 h-4" /> }
];

export function AIDivineGuide() {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<DivineFeedback | null>(null);
  const [activeTab, setActiveTab] = useState('guidance');
  const [intentType, setIntentType] = useState('general');
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Reset response when question changes
  useEffect(() => {
    if (question === '') {
      setResponse(null);
    }
  }, [question]);
  
  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) {
      toast({
        title: "Please enter a question",
        description: "Your message to the Divine Intelligence Guide is empty.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call the Supabase edge function
      const { data, error } = await supabase.functions.invoke('process-divine-intelligence', {
        body: {
          message: question,
          userId: user?.id,
          intentType,
          // Add any context from the current session
          context: {
            activeTab
          }
        }
      });
      
      if (error) throw error;
      
      setResponse(data);
      
      // If cached response, show toast
      if (data.metrics?.cached) {
        toast({
          title: "Cosmic Connection",
          description: "The quantum field already held this wisdom (cached response).",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error submitting question:', error);
      toast({
        title: "Connection disrupted",
        description: "The cosmic intelligence network is experiencing fluctuations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [question, toast, user, intentType, activeTab, supabase]);
  
  // Clear the form
  const handleClear = useCallback(() => {
    setQuestion('');
    setResponse(null);
  }, []);
  
  return (
    <Card className="w-full max-w-4xl mx-auto bg-black/30 backdrop-blur-md border-purple-900/40">
      <CardHeader>
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-400 bg-clip-text text-transparent">
          Divine Intelligence Guide
        </CardTitle>
        <CardDescription>
          Connect with quantum consciousness and receive personalized spiritual guidance
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Intent selection */}
        <div className="flex flex-wrap gap-2 mb-4">
          {INTENT_OPTIONS.map((option) => (
            <Badge 
              key={option.id}
              variant={intentType === option.id ? "default" : "outline"}
              className={`cursor-pointer ${intentType === option.id ? 'bg-purple-700 hover:bg-purple-800' : 'hover:bg-purple-900/20'}`}
              onClick={() => setIntentType(option.id)}
            >
              {option.icon}
              <span className="ml-1">{option.label}</span>
            </Badge>
          ))}
        </div>
        
        {/* Question form */}
        <form onSubmit={handleSubmit}>
          <Textarea
            placeholder="What spiritual guidance do you seek today?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="min-h-20 bg-black/20 border-purple-900/40 focus:border-purple-500/70 mb-4"
            disabled={isLoading}
          />
          
          <div className="flex items-center justify-between">
            <Button 
              type="submit" 
              disabled={isLoading || !question.trim()}
              className="bg-purple-700 hover:bg-purple-800"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <SendIcon className="mr-2 h-4 w-4" />
                  Send
                </>
              )}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClear}
              disabled={isLoading || (!question && !response)}
              className="border-purple-900/40 text-purple-300"
            >
              Clear
            </Button>
          </div>
        </form>
        
        {/* Response display */}
        {response && (
          <div className="mt-8 space-y-4">
            <Tabs defaultValue="message" className="w-full">
              <TabsList className="grid grid-cols-4 bg-black/30">
                <TabsTrigger value="message">Response</TabsTrigger>
                <TabsTrigger value="insights">Insights ({response.insights.length})</TabsTrigger>
                <TabsTrigger value="practices">Practices ({response.suggestedPractices.length})</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="message" className="p-4 bg-black/10 rounded-md mt-2">
                <div className="whitespace-pre-wrap text-purple-50">
                  {response.message}
                </div>
              </TabsContent>
              
              <TabsContent value="insights" className="space-y-4 p-4 bg-black/10 rounded-md mt-2">
                {response.insights.length > 0 ? (
                  response.insights.map((insight, index) => (
                    <div key={index} className="p-3 bg-black/20 rounded-md">
                      <Badge className="mb-2 bg-indigo-700">{insight.type}</Badge>
                      <p className="text-purple-50">{insight.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-purple-300">No specific insights extracted from this response.</p>
                )}
              </TabsContent>
              
              <TabsContent value="practices" className="space-y-4 p-4 bg-black/10 rounded-md mt-2">
                {response.suggestedPractices.length > 0 ? (
                  response.suggestedPractices.map((practice) => (
                    <div key={practice.id} className="p-3 bg-black/20 rounded-md">
                      <h4 className="font-bold text-purple-300 mb-1">{practice.title}</h4>
                      <p className="text-purple-50">{practice.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-purple-300">No specific practices suggested in this response.</p>
                )}
              </TabsContent>
              
              <TabsContent value="details" className="p-4 bg-black/10 rounded-md mt-2">
                <div className="space-y-3">
                  {response.emotionalGuidance && (
                    <div>
                      <h4 className="font-semibold text-purple-300">Emotional Guidance:</h4>
                      <p className="text-purple-50">{response.emotionalGuidance}</p>
                    </div>
                  )}
                  
                  {response.chakraFocus.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-purple-300">Chakra Focus:</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {response.chakraFocus.map((chakra) => (
                          <Badge key={chakra} variant="outline" className="bg-black/30">
                            {chakra}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {response.metrics && (
                    <div className="text-xs text-purple-400/60 pt-4 border-t border-purple-800/30">
                      <p>Generated with {response.metrics.model} in {Math.round(response.metrics.processingTime)}ms</p>
                      {response.metrics.tokenUsage && (
                        <p>Token usage: {response.metrics.tokenUsage.total_tokens || '—'}</p>
                      )}
                      {response.metrics.cached && <p>⚡ Cached response</p>}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end border-t border-purple-900/30 pt-4 text-xs text-purple-400/70">
        <p>Resonating with quantum consciousness</p>
      </CardFooter>
    </Card>
  );
}

export default AIDivineGuide;
