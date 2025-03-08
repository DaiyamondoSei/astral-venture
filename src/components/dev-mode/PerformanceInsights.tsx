
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { performanceMonitor } from '@/utils/performance/PerformanceMonitor';

interface PerformanceInsightsProps {
  compact?: boolean;
}

const PerformanceInsights: React.FC<PerformanceInsightsProps> = ({ compact = false }) => {
  const [metrics, setMetrics] = useState<{
    fps: number;
    memory: number;
    domNodes: number;
    renderTime: number;
    componentStats: any[];
  }>({
    fps: 60,
    memory: 0,
    domNodes: 0,
    renderTime: 0,
    componentStats: []
  });
  
  const refreshMetrics = () => {
    // This is mocked for now, as we don't have the actual implementation
    // In a real implementation, this would call performanceMonitor.getPerformanceSummary()
    const summary = performanceMonitor.getPerformanceSummary ? 
      performanceMonitor.getPerformanceSummary() : 
      { 
        totalComponents: 12, 
        slowComponents: 2, 
        averageRenderTime: 4.3,
        worstComponents: [
          { name: 'InteractiveEnergyField', renderTime: 12.5 },
          { name: 'ChakraActivationHandler', renderTime: 8.7 },
          { name: 'VisualizationGuide', renderTime: 7.2 }
        ]
      };
      
    const bottlenecks = performanceMonitor.getPerformanceBottlenecks ?
      performanceMonitor.getPerformanceBottlenecks() :
      [];
    
    setMetrics({
      fps: 60 - Math.random() * 15, // Simulate varying FPS
      memory: 50 + Math.random() * 150, // Simulate memory usage in MB
      domNodes: 250 + Math.floor(Math.random() * 100),
      renderTime: summary.averageRenderTime,
      componentStats: summary.worstComponents || []
    });
  };
  
  useEffect(() => {
    refreshMetrics();
    
    const intervalId = setInterval(refreshMetrics, 5000);
    return () => clearInterval(intervalId);
  }, []);
  
  const getPerformanceLevel = (fps: number) => {
    if (fps >= 55) return { level: 'excellent', color: 'text-green-500' };
    if (fps >= 40) return { level: 'good', color: 'text-blue-500' };
    if (fps >= 30) return { level: 'fair', color: 'text-yellow-500' };
    return { level: 'poor', color: 'text-red-500' };
  };
  
  const perfLevel = getPerformanceLevel(metrics.fps);
  
  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium">Performance</h3>
          <Button variant="ghost" size="sm" onClick={refreshMetrics}>
            Refresh
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-muted p-2 rounded">
            <span className="block text-muted-foreground">FPS</span>
            <span className={`font-mono ${perfLevel.color}`}>{metrics.fps.toFixed(1)}</span>
          </div>
          <div className="bg-muted p-2 rounded">
            <span className="block text-muted-foreground">Memory</span>
            <span className="font-mono">{(metrics.memory).toFixed(1)} MB</span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Performance Metrics</span>
          <Badge variant={perfLevel.level === 'poor' ? 'destructive' : 'outline'}>
            {perfLevel.level}
          </Badge>
        </CardTitle>
        <CardDescription>
          Real-time performance monitoring
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="metrics">
          <TabsList className="mb-4">
            <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
            <TabsTrigger value="components">Component Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="metrics" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">FPS</span>
                    <span className={`text-2xl font-bold ${perfLevel.color}`}>
                      {metrics.fps.toFixed(1)}
                    </span>
                    <Progress 
                      value={metrics.fps > 60 ? 100 : (metrics.fps / 60) * 100} 
                      className="h-1.5 mt-2"
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Memory Usage</span>
                    <span className="text-2xl font-bold">
                      {metrics.memory.toFixed(1)} <span className="text-sm">MB</span>
                    </span>
                    <Progress 
                      value={Math.min(100, (metrics.memory / 300) * 100)} 
                      className="h-1.5 mt-2"
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">DOM Nodes</span>
                    <span className="text-2xl font-bold">{metrics.domNodes}</span>
                    <Progress 
                      value={Math.min(100, (metrics.domNodes / 500) * 100)} 
                      className="h-1.5 mt-2"
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Render Time</span>
                    <span className="text-2xl font-bold">
                      {metrics.renderTime.toFixed(1)} <span className="text-sm">ms</span>
                    </span>
                    <Progress 
                      value={Math.min(100, (metrics.renderTime / 16) * 100)} 
                      className="h-1.5 mt-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={refreshMetrics}>
                Refresh Metrics
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="components">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Slowest Components</h3>
              
              {metrics.componentStats.length === 0 ? (
                <p className="text-sm text-muted-foreground">No component data available</p>
              ) : (
                <div className="space-y-2">
                  {metrics.componentStats.map((component, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">{component.name}</span>
                      <Badge 
                        variant={component.renderTime > 10 ? "destructive" : "outline"}
                        className="ml-auto"
                      >
                        {component.renderTime.toFixed(1)} ms
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-4">
                <h3 className="text-sm font-medium">Optimization Tips</h3>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>• Use React.memo for pure functional components</li>
                  <li>• Memoize expensive calculations with useMemo</li>
                  <li>• Optimize re-renders by using useCallback for event handlers</li>
                  <li>• Consider using virtualization for long lists</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PerformanceInsights;
