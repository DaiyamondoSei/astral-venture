
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { AlertCircle, BarChart, X, RefreshCw } from 'lucide-react';
import { renderAnalyzer, RenderAnalysis } from '@/utils/performance/RenderAnalyzer';
import { Progress } from '@/components/ui/progress';
import { usePerfConfig } from '@/hooks/usePerfConfig';

const RenderInsights: React.FC = () => {
  const [insights, setInsights] = useState<RenderAnalysis[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const config = usePerfConfig();

  // Skip in production or when feature is disabled
  if (process.env.NODE_ENV === 'production' || !config.enableRenderTracking) {
    return null;
  }

  useEffect(() => {
    // Get components with performance issues
    const componentsWithIssues = renderAnalyzer.findComponentsWithPerformanceIssues();
    setInsights(componentsWithIssues);
    
    // Set up an interval to refresh the data
    const interval = setInterval(() => {
      setInsights(renderAnalyzer.findComponentsWithPerformanceIssues());
    }, 3000);
    
    return () => clearInterval(interval);
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    setInsights(renderAnalyzer.findComponentsWithPerformanceIssues());
  };

  if (!isOpen) {
    return (
      <Button
        className="fixed bottom-4 left-[6.5rem] z-50 bg-orange-600 hover:bg-orange-700"
        onClick={() => setIsOpen(true)}
        size="sm"
        variant="default"
      >
        <AlertCircle className="w-4 h-4 mr-2" />
        Render
        {insights.length > 0 && (
          <span className="ml-1 w-5 h-5 rounded-full bg-white text-orange-600 text-xs flex items-center justify-center">
            {insights.length}
          </span>
        )}
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 left-[6.5rem] w-96 h-96 z-50 shadow-xl">
      <CardHeader className="p-3 bg-orange-600 text-white flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center">
          <BarChart className="h-4 w-4 mr-2" />
          Render Insights
          {insights.length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 rounded-full bg-white text-orange-600 text-xs">
              {insights.length}
            </span>
          )}
        </CardTitle>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-white" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-white" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-[calc(100%-56px)]">
        <ScrollArea className="h-full p-3">
          {insights.length > 0 ? (
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div 
                  key={index} 
                  className="border rounded p-3 text-sm space-y-2 hover:bg-muted/50 cursor-pointer"
                  onClick={() => setSelectedComponent(selectedComponent === insight.component ? null : insight.component)}
                >
                  <div className="font-medium flex items-center justify-between">
                    <span>{insight.component}</span>
                    <span className={`px-1.5 py-0.5 text-xs rounded-full ${getFrequencyColorClass(insight.renderFrequency)}`}>
                      {insight.renderFrequency}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                    <span className="text-muted-foreground">Render count:</span>
                    <span>{insight.renderCount}</span>
                    
                    <span className="text-muted-foreground">Avg render time:</span>
                    <span>{insight.averageRenderTime.toFixed(2)}ms</span>
                    
                    <span className="text-muted-foreground">Max render time:</span>
                    <span>{insight.maxRenderTime.toFixed(2)}ms</span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Render performance:</span>
                      <span>{getRenderScore(insight)}/100</span>
                    </div>
                    <Progress value={getRenderScore(insight)} className="h-1.5" />
                  </div>
                  
                  {selectedComponent === insight.component && (
                    <div className="mt-3 pt-3 border-t text-xs space-y-2">
                      <span className="font-medium block">Optimization suggestions:</span>
                      <ul className="space-y-1 list-disc pl-4">
                        {insight.possibleOptimizations.map((suggestion, i) => (
                          <li key={i}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              No render performance issues detected
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

// Helper function to get color class based on render frequency
function getFrequencyColorClass(frequency: string): string {
  switch (frequency) {
    case 'excessive':
      return 'bg-red-500 text-white';
    case 'high':
      return 'bg-orange-500 text-white';
    case 'medium':
      return 'bg-yellow-500 text-black';
    default:
      return 'bg-green-500 text-white';
  }
}

// Calculate a performance score from 0-100
function getRenderScore(analysis: RenderAnalysis): number {
  let score = 100;
  
  // Penalize based on render frequency
  if (analysis.renderFrequency === 'excessive') score -= 40;
  else if (analysis.renderFrequency === 'high') score -= 25;
  else if (analysis.renderFrequency === 'medium') score -= 10;
  
  // Penalize for long render times
  if (analysis.averageRenderTime > 50) score -= 30;
  else if (analysis.averageRenderTime > 30) score -= 20;
  else if (analysis.averageRenderTime > 16) score -= 10;
  
  // Penalize for optimization count
  score -= analysis.possibleOptimizations.length * 5;
  
  return Math.max(0, Math.min(100, score));
}

export default RenderInsights;
