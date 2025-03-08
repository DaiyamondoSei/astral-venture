
import React, { useState } from 'react';
import { useAICodeAssistant } from '@/hooks/useAICodeAssistant';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Code, 
  BrainCircuit, 
  AlertCircle, 
  CheckCircle, 
  X, 
  RefreshCw,
  Lightbulb,
  Zap,
  ArrowRight
} from 'lucide-react';

/**
 * AI Assistant Dashboard
 * 
 * Interactive dashboard for the AI Code Assistant that provides:
 * - Code quality suggestions with automated fixes
 * - Intent tracking for development goals
 * - Integration with code analysis tools
 */
const AIAssistantDashboard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('suggestions');
  const [intentText, setIntentText] = useState('');
  const [selectedComponent, setSelectedComponent] = useState<string | undefined>(undefined);
  
  // Don't render anything in production
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  const { 
    suggestions, 
    intents, 
    loading, 
    lastUpdated,
    refreshSuggestions,
    registerIntent,
    applyAutoFix,
    markIntentImplemented,
    markIntentAbandoned
  } = useAICodeAssistant(selectedComponent);
  
  const handleIntentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (intentText.trim()) {
      registerIntent(intentText);
      setIntentText('');
    }
  };
  
  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-1 bg-background/80 backdrop-blur-sm"
      >
        <BrainCircuit className="h-4 w-4 mr-1" />
        <span>AI Assistant</span>
        {suggestions.length > 0 && (
          <Badge variant="default" className="ml-2">
            {suggestions.length}
          </Badge>
        )}
      </Button>
    );
  }
  
  return (
    <Card className="fixed bottom-4 left-10 right-10 z-50 h-[600px] max-h-[80vh] border border-border/50 shadow-xl backdrop-blur-sm bg-background/95">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <CardTitle className="text-xl font-medium flex items-center">
              <BrainCircuit className="h-5 w-5 mr-2 text-primary" />
              AI Code Assistant
            </CardTitle>
            <CardDescription>
              Intelligent suggestions and automated improvements for your code
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={refreshSuggestions} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="ml-1">Refresh</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-[calc(100%-76px)]">
        <div className="px-6">
          <TabsList className="w-full">
            <TabsTrigger value="suggestions" className="flex-1">
              Suggestions
              <Badge variant="outline" className="ml-2">{suggestions.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="intents" className="flex-1">
              Development Intents
              <Badge variant="outline" className="ml-2">{intents.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="about" className="flex-1">
              About
            </TabsTrigger>
          </TabsList>
        </div>
        
        <CardContent className="flex-1 overflow-hidden py-2">
          <TabsContent value="suggestions" className="h-full">
            <ScrollArea className="h-full">
              {suggestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
                  <AlertCircle className="h-10 w-10 mb-2" />
                  <p>No suggestions available yet.</p>
                  <p className="text-xs mt-1">
                    This could mean your code is already following best practices,
                    or that there's not enough activity to analyze.
                  </p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={refreshSuggestions}>
                    Scan Codebase
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 pr-2">
                  {suggestions.map((suggestion) => (
                    <Card key={suggestion.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            {suggestion.type === 'performance' ? (
                              <Zap className="h-4 w-4 mr-2 text-amber-500" />
                            ) : suggestion.type === 'quality' ? (
                              <Code className="h-4 w-4 mr-2 text-blue-500" />
                            ) : (
                              <Lightbulb className="h-4 w-4 mr-2 text-purple-500" />
                            )}
                            <div>
                              <CardTitle className="text-base">{suggestion.title}</CardTitle>
                              <CardDescription className="text-xs">
                                {suggestion.context.component}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge 
                            variant={
                              suggestion.priority === 'critical' ? 'destructive' :
                              suggestion.priority === 'high' ? 'default' :
                              suggestion.priority === 'medium' ? 'secondary' :
                              'outline'
                            }
                          >
                            {suggestion.priority}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <p className="text-sm mb-2">{suggestion.description}</p>
                        
                        {suggestion.codeExample && (
                          <pre className="text-xs bg-muted p-2 rounded my-2 overflow-x-auto">
                            {suggestion.codeExample}
                          </pre>
                        )}
                        
                        <div className="flex justify-end mt-4">
                          {suggestion.autoFixAvailable && (
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => applyAutoFix(suggestion.id)}
                            >
                              <Zap className="h-3 w-3 mr-1" />
                              Apply Fix
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="intents" className="h-full">
            <div className="mb-4">
              <form onSubmit={handleIntentSubmit} className="flex gap-2">
                <Input
                  placeholder="What are you trying to accomplish?"
                  value={intentText}
                  onChange={(e) => setIntentText(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={!intentText.trim()}>
                  Add Intent
                </Button>
              </form>
            </div>
            
            <ScrollArea className="h-[calc(100%-60px)]">
              {intents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
                  <AlertCircle className="h-10 w-10 mb-2" />
                  <p>No development intents registered yet.</p>
                  <p className="text-xs mt-1">
                    Add an intent to help the AI understand what you're trying to accomplish.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 pr-2">
                  {intents.map((intent) => (
                    <Card key={intent.id} className="overflow-hidden">
                      <CardHeader className="py-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={
                                intent.status === 'pending' ? 'outline' :
                                intent.status === 'implemented' ? 'default' :
                                'secondary'
                              }
                            >
                              {intent.status}
                            </Badge>
                            <CardTitle className="text-base">
                              {intent.description}
                            </CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="py-2">
                        <p className="text-xs text-muted-foreground">
                          Created: {intent.createdAt.toLocaleString()}
                        </p>
                        
                        {intent.relatedComponents.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium">Related components:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {intent.relatedComponents.map((component) => (
                                <Badge key={component} variant="outline" className="text-xs">
                                  {component}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {intent.status === 'pending' && (
                          <div className="flex justify-end gap-2 mt-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => markIntentAbandoned(intent.id)}
                            >
                              Abandon
                            </Button>
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => markIntentImplemented(intent.id)}
                            >
                              Mark Implemented
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="about" className="h-full">
            <ScrollArea className="h-full">
              <div className="space-y-6 pr-2">
                <div>
                  <h3 className="text-lg font-medium mb-2">About AI Code Assistant</h3>
                  <p className="text-sm">
                    This tool integrates code analysis with AI assistance to help you write better code
                    and catch potential issues before they become problems.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-base font-medium mb-2">Key Features</h4>
                  <ul className="space-y-2">
                    <li className="flex gap-2">
                      <Lightbulb className="h-5 w-5 text-amber-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Smart Suggestions</p>
                        <p className="text-xs text-muted-foreground">
                          Get contextual suggestions based on code analysis and best practices
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-2">
                      <BrainCircuit className="h-5 w-5 text-purple-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Intent Tracking</p>
                        <p className="text-xs text-muted-foreground">
                          Register what you're trying to accomplish so the AI can provide more relevant help
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-2">
                      <Zap className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Automated Fixes</p>
                        <p className="text-xs text-muted-foreground">
                          Apply automated fixes for common issues to improve code quality
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-base font-medium mb-2">How To Use</h4>
                  <ol className="space-y-3">
                    <li className="flex gap-2">
                      <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs">1</span>
                      </div>
                      <p className="text-sm">
                        Register your development intent to help the assistant understand context
                      </p>
                    </li>
                    <li className="flex gap-2">
                      <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs">2</span>
                      </div>
                      <p className="text-sm">
                        Review suggestions provided by the AI based on code analysis
                      </p>
                    </li>
                    <li className="flex gap-2">
                      <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs">3</span>
                      </div>
                      <p className="text-sm">
                        Apply automated fixes or implement suggestions manually
                      </p>
                    </li>
                    <li className="flex gap-2">
                      <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs">4</span>
                      </div>
                      <p className="text-sm">
                        Mark intents as implemented when development goals are achieved
                      </p>
                    </li>
                  </ol>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </CardContent>
      </Tabs>
      
      <div className="px-6 py-2 border-t text-xs text-muted-foreground flex justify-between items-center">
        <div>
          {lastUpdated && <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>}
        </div>
        <div className="flex items-center gap-2">
          {selectedComponent ? (
            <>
              <span>Filtering by: {selectedComponent}</span>
              <Button variant="ghost" size="sm" onClick={() => setSelectedComponent(undefined)}>
                <X className="h-3 w-3" />
              </Button>
            </>
          ) : (
            <span>Showing all suggestions</span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AIAssistantDashboard;
