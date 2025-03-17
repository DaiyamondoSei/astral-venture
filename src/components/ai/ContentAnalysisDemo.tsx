
/**
 * Content Analysis Demo Component
 * 
 * Demonstrates the AI-powered content analysis capabilities (Phase 3).
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Send, Sparkles, Lightbulb, Flame, RefreshCw, Heart } from 'lucide-react';
import { useAIContentAnalysis } from '@/hooks/useAIContentAnalysis';
import { useToast } from '@/components/ui/use-toast';
import { CHAKRA_COLORS, CHAKRA_NAMES } from '@/utils/emotion/constants';

interface ContentAnalysisDemoProps {
  className?: string;
  initialContent?: string;
  contentType?: 'reflection' | 'dream' | 'journal' | 'general';
}

const ContentAnalysisDemo: React.FC<ContentAnalysisDemoProps> = ({
  className = '',
  initialContent = '',
  contentType = 'reflection'
}) => {
  const { toast } = useToast();
  const [text, setText] = useState<string>(initialContent);
  const [activeTab, setActiveTab] = useState<string>('insights');
  
  const {
    insights,
    themes,
    emotionalTone,
    chakraConnections,
    recommendedPractices,
    isLoading,
    error,
    confidence,
    analyzeContent,
    isAnalyzed
  } = useAIContentAnalysis({
    contentType,
    autoAnalyze: false,
  });
  
  // Handle analyze click
  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast({
        title: 'Text required',
        description: 'Please enter some text to analyze',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      await analyzeContent(text);
    } catch (err) {
      toast({
        title: 'Analysis failed',
        description: 'Failed to analyze content. Please try again.',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center">
          <Brain className="mr-2 h-5 w-5 text-primary" />
          AI Content Analysis
        </CardTitle>
        <CardDescription>
          Analyze reflections, dreams, or journal entries for deeper insights
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Text input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Enter text to analyze:</label>
          <Textarea
            placeholder={`Enter your ${contentType} text here...`}
            className="min-h-[120px]"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        {/* Analysis results */}
        {isAnalyzed && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="chakras">Energy Centers</TabsTrigger>
              <TabsTrigger value="practices">Practices</TabsTrigger>
            </TabsList>
            
            <TabsContent value="insights" className="space-y-4 pt-4">
              {/* Emotional tone */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium flex items-center">
                    <Flame className="mr-1 h-4 w-4 text-orange-500" />
                    Emotional Tone
                  </h4>
                  
                  <Badge variant="outline">
                    {emotionalTone || 'Neutral'}
                  </Badge>
                </div>
                
                {/* Themes */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {themes.map((theme, idx) => (
                    <Badge key={`theme-${idx}`} variant="secondary">
                      {theme}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Insights */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center">
                  <Lightbulb className="mr-1 h-4 w-4 text-yellow-500" />
                  Key Insights
                </h4>
                
                <ul className="space-y-2">
                  {insights.length > 0 ? (
                    insights.map((insight, idx) => (
                      <li key={`insight-${idx}`} className="text-sm flex">
                        <Sparkles className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5 text-primary" />
                        <span>{insight}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-muted-foreground">No insights found</li>
                  )}
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="chakras" className="space-y-4 pt-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Chakra Connections</h4>
                
                {chakraConnections.length > 0 ? (
                  <div className="space-y-3">
                    {chakraConnections.map((connection, idx) => (
                      <div key={`chakra-${idx}`} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span 
                            className="text-sm font-medium" 
                            style={{ color: CHAKRA_COLORS[connection.chakraId] }}
                          >
                            {CHAKRA_NAMES[connection.chakraId as keyof typeof CHAKRA_NAMES]}
                          </span>
                          <Badge 
                            variant="outline" 
                            style={{ 
                              borderColor: CHAKRA_COLORS[connection.chakraId],
                              color: CHAKRA_COLORS[connection.chakraId]
                            }}
                          >
                            {Math.round(connection.relevance * 100)}%
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{connection.insight}</p>
                        
                        {/* Progress bar */}
                        <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="h-full" 
                            style={{ 
                              width: `${connection.relevance * 100}%`,
                              backgroundColor: CHAKRA_COLORS[connection.chakraId] 
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No chakra connections detected</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="practices" className="space-y-4 pt-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center">
                  <Heart className="mr-1 h-4 w-4 text-red-500" />
                  Recommended Practices
                </h4>
                
                {recommendedPractices.length > 0 ? (
                  <ul className="space-y-2">
                    {recommendedPractices.map((practice, idx) => (
                      <li key={`practice-${idx}`} className="bg-card border p-3 rounded-md">
                        <p className="text-sm">{practice}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No practices recommended</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
        
        {/* Analysis confidence */}
        {isAnalyzed && confidence > 0 && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Analysis confidence</span>
            <span>{Math.round(confidence * 100)}%</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end gap-2">
        <Button 
          onClick={handleAnalyze} 
          disabled={isLoading || !text.trim()}
          className="gap-1"
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {isAnalyzed ? 'Reanalyze' : 'Analyze'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ContentAnalysisDemo;
