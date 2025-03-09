
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { performanceMonitor } from '@/utils/performance/performanceMonitor';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Trash, RefreshCw, AlertTriangle, Clock, Zap } from 'lucide-react';
import { usePerfConfig } from '@/hooks/usePerfConfig';

// Component for displaying performance insights and metrics
const PerformanceInsights: React.FC = () => {
  const [metrics, setMetrics] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const config = usePerfConfig();

  // Skip in production or when feature is disabled
  if (process.env.NODE_ENV === 'production' || !config.enablePerformanceTracking) {
    return null;
  }

  // Subscribe to performance metrics updates
  useEffect(() => {
    const unsubscribe = performanceMonitor.subscribe((newMetrics) => {
      setMetrics(newMetrics);
    });

    // Get initial metrics
    setMetrics(performanceMonitor.getAllMetrics());
    
    // Auto-refresh every 10 seconds
    const intervalId = setInterval(() => {
      if (isOpen) {
        refreshMetrics();
      }
    }, 10000);

    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, [refreshKey, isOpen]);

  // Filter to only show the most important metrics
  const componentsSortedByRenderTime = Object.values(metrics)
    .filter(m => m.averageRenderTime !== undefined && m.averageRenderTime > 10) // Only show components above 10ms
    .sort((a, b) => (b.averageRenderTime || 0) - (a.averageRenderTime || 0))
    .slice(0, 5); // Show only top 5

  const clearMetrics = () => {
    performanceMonitor.clearMetrics();
    setRefreshKey(prev => prev + 1);
  };

  const refreshMetrics = () => {
    setMetrics(performanceMonitor.getAllMetrics());
    setRefreshKey(prev => prev + 1);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 bg-purple-700 hover:bg-purple-800 opacity-70 hover:opacity-100"
        size="sm"
      >
        <Zap className="w-4 h-4 mr-2" />
        Performance
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 left-4 w-80 h-80 z-50 shadow-xl overflow-hidden opacity-90 hover:opacity-100">
      <CardHeader className="p-3 bg-purple-700 text-white">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base flex items-center">
            <Zap className="w-4 h-4 mr-2" />
            Performance Monitor
          </CardTitle>
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm" onClick={refreshMetrics} className="h-7 w-7 p-0 text-white">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={clearMetrics} className="h-7 w-7 p-0 text-white">
              <Trash className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-7 w-7 p-0 text-white">
              ✕
            </Button>
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-1">
          <TabsList className="bg-purple-800/50 h-8">
            <TabsTrigger value="overview" className="text-xs h-7">Overview</TabsTrigger>
            <TabsTrigger value="slow" className="text-xs h-7">Slow Components</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="p-0 h-[calc(100%-88px)]">
        <TabsContent value="overview" className="h-full mt-0">
          <ScrollArea className="h-full p-3">
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Total Components Tracked</h3>
              <div className="text-2xl font-bold">{Object.keys(metrics).length}</div>

              {componentsSortedByRenderTime.length > 0 && (
                <>
                  <h3 className="text-sm font-medium flex items-center mt-4">
                    <AlertTriangle className="h-4 w-4 mr-1 text-amber-500" />
                    Slowest Components
                  </h3>
                  <ul className="space-y-2">
                    {componentsSortedByRenderTime.slice(0, 3).map((metric, index) => (
                      <li key={index} className="text-sm flex justify-between items-center">
                        <span className="font-medium">{metric.componentName}</span>
                        <span className="text-amber-600 font-mono">
                          {metric.averageRenderTime?.toFixed(2)}ms
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={clearMetrics} 
                className="w-full mt-4"
              >
                Clear Metrics
              </Button>
              
              <div className="text-xs text-muted-foreground mt-2">
                Performance monitoring is enabled for development only.
                <br />
                <strong>Tip:</strong> Disable for better performance.
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="slow" className="h-full mt-0">
          <ScrollArea className="h-full p-3">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Slow Rendering Components</h3>
              
              {componentsSortedByRenderTime.length > 0 ? (
                <div className="space-y-2">
                  {componentsSortedByRenderTime.map((metric, index) => (
                    <div key={index} className="border rounded p-2 space-y-1 text-sm">
                      <div className="font-medium flex items-center text-amber-600">
                        <Clock className="h-3 w-3 mr-1" />
                        {metric.componentName}
                      </div>
                      <div className="grid grid-cols-2 text-xs gap-y-1">
                        <span className="text-muted-foreground">Renders:</span>
                        <span>{metric.renderTimes?.length || 0}</span>
                        <span className="text-muted-foreground">Avg time:</span>
                        <span className="font-bold">{metric.averageRenderTime?.toFixed(2) || 0}ms</span>
                      </div>
                      
                      <div className="text-xs text-amber-500 mt-1">
                        Consider optimizing or memoizing this component
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground p-4">
                  No slow components detected yet
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </CardContent>
    </Card>
  );
};

export default PerformanceInsights;
