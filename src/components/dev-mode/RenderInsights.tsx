
import React, { useState, useEffect } from 'react';
import { renderAnalyzer, RenderAnalysis } from '@/utils/performance/RenderAnalyzer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronUp, XCircle, AlertCircle, Clock, RotateCcw } from 'lucide-react';

const RenderInsights = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [issues, setIssues] = useState<RenderAnalysis[]>([]);
  const [activeTab, setActiveTab] = useState('issues');
  
  // Update issues when component opens or refreshes
  useEffect(() => {
    if (!isOpen) return;
    
    const updateIssues = () => {
      const componentIssues = renderAnalyzer.findComponentsWithPerformanceIssues();
      setIssues(componentIssues);
    };
    
    updateIssues();
    
    // Update every 2 seconds while open
    const interval = setInterval(updateIssues, 2000);
    
    return () => clearInterval(interval);
  }, [isOpen]);
  
  // Don't render anything in production
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  const handleReset = () => {
    renderAnalyzer.clearHistory();
    setIssues([]);
  };
  
  // Get total issues by priority
  const highPriorityCount = issues.reduce(
    (count, issue) => count + issue.suggestions.filter(s => s.priority === 'high').length, 
    0
  );
  
  const mediumPriorityCount = issues.reduce(
    (count, issue) => count + issue.suggestions.filter(s => s.priority === 'medium').length, 
    0
  );
  
  return (
    <div className="fixed bottom-0 right-0 z-50 max-w-md">
      {/* Toggle button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="mb-1 ml-auto flex items-center space-x-1 bg-background/80 backdrop-blur-sm"
      >
        <Clock className="h-4 w-4 mr-1" />
        <span>Render Insights</span>
        {highPriorityCount > 0 && (
          <Badge variant="destructive" className="ml-2">
            {highPriorityCount}
          </Badge>
        )}
        {mediumPriorityCount > 0 && (
          <Badge variant="default" className="ml-1">
            {mediumPriorityCount}
          </Badge>
        )}
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
      </Button>
      
      {isOpen && (
        <Card className="w-full shadow-lg border border-border/50 backdrop-blur-sm bg-background/90">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-medium">Render Performance</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
            <CardDescription>
              Analyze component rendering performance
            </CardDescription>
          </CardHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="px-4">
              <TabsList className="w-full">
                <TabsTrigger value="issues" className="flex-1">
                  Issues {issues.length > 0 && `(${issues.length})`}
                </TabsTrigger>
                <TabsTrigger value="suggestions" className="flex-1">
                  Suggestions
                </TabsTrigger>
              </TabsList>
            </div>
            
            <CardContent className="pb-4 pt-2">
              <TabsContent value="issues">
                <ScrollArea className="h-64">
                  {issues.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
                      <AlertCircle className="h-10 w-10 mb-2" />
                      <p>No render performance issues detected yet.</p>
                      <p className="text-xs mt-1">Interact with components to start tracking.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {issues.map((analysis) => (
                        <Alert key={analysis.component} variant="default" className="py-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <AlertTitle>{analysis.component}</AlertTitle>
                              <AlertDescription className="mt-1">
                                <div className="text-xs">
                                  <span className="font-medium">Render count:</span> {analysis.totalRenderCount}
                                </div>
                                <div className="text-xs">
                                  <span className="font-medium">Avg time:</span> {analysis.averageRenderTime.toFixed(2)}ms
                                </div>
                                <div className="text-xs">
                                  <span className="font-medium">Unnecessary:</span> {analysis.unnecessaryRenderCount}
                                </div>
                                
                                {analysis.suggestions.length > 0 && (
                                  <div className="mt-2">
                                    <span className="text-xs font-medium">Suggestions:</span>
                                    <ul className="mt-1 space-y-1">
                                      {analysis.suggestions.map((suggestion, i) => (
                                        <li key={i} className="text-xs flex items-start">
                                          <Badge 
                                            variant={
                                              suggestion.priority === 'high' ? 'destructive' : 
                                              suggestion.priority === 'medium' ? 'default' : 'outline'
                                            }
                                            className="h-4 mr-2 px-1 min-w-8 text-center"
                                          >
                                            {suggestion.type}
                                          </Badge>
                                          <span>{suggestion.description}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </AlertDescription>
                            </div>
                          </div>
                        </Alert>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="suggestions">
                <ScrollArea className="h-64">
                  <div className="space-y-3 p-1">
                    <Alert>
                      <AlertTitle className="text-sm font-medium">Common Render Optimizations</AlertTitle>
                      <AlertDescription className="mt-2">
                        <ul className="space-y-2 text-xs">
                          <li>
                            <Badge variant="outline" className="mr-1">memo</Badge>
                            Use React.memo for components that render often with the same props
                          </li>
                          <li>
                            <Badge variant="outline" className="mr-1">callback</Badge>
                            Use useCallback for functions passed as props to prevent unnecessary re-renders
                          </li>
                          <li>
                            <Badge variant="outline" className="mr-1">useMemo</Badge>
                            Memoize expensive calculations that don't need to be recomputed on every render
                          </li>
                          <li>
                            <Badge variant="outline" className="mr-1">state</Badge>
                            Keep state as local as possible to prevent cascading re-renders
                          </li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                    
                    <Alert>
                      <AlertTitle className="text-sm font-medium">How to Use This Tool</AlertTitle>
                      <AlertDescription className="mt-2 text-xs">
                        <p className="mb-1">1. Add render tracking to your components:</p>
                        <pre className="bg-muted p-2 rounded text-[10px] overflow-x-auto">
                          {`import { useRenderTracking } from '@/hooks/useRenderTracking';
                            
// Inside your component
useRenderTracking('YourComponentName', props);`}
                        </pre>
                        <p className="mt-2 mb-1">2. Review the Issues tab for performance problems</p>
                        <p className="mb-1">3. Apply suggested optimizations to problematic components</p>
                      </AlertDescription>
                    </Alert>
                  </div>
                </ScrollArea>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      )}
    </div>
  );
};

export default RenderInsights;
