
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { performanceMonitor } from '@/utils/performance/performanceMonitor';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Trash, RefreshCw, AlertTriangle, Clock, Zap } from 'lucide-react';

// Component for displaying performance insights and metrics
const PerformanceInsights: React.FC = () => {
  const [metrics, setMetrics] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Subscribe to performance metrics updates
  useEffect(() => {
    const unsubscribe = performanceMonitor.subscribe((newMetrics) => {
      setMetrics(newMetrics);
    });

    // Get initial metrics
    setMetrics(performanceMonitor.getAllMetrics());

    return () => {
      unsubscribe();
    };
  }, [refreshKey]);

  const componentsSortedByRenderTime = Object.values(metrics)
    .filter(m => m.averageRenderTime !== undefined)
    .sort((a, b) => (b.averageRenderTime || 0) - (a.averageRenderTime || 0));

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
        className="fixed bottom-4 left-4 z-50 bg-purple-700 hover:bg-purple-800"
        size="sm"
      >
        <Zap className="w-4 h-4 mr-2" />
        Performance
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 left-4 w-96 h-96 z-50 shadow-xl overflow-hidden">
      <CardHeader className="p-3 bg-purple-700 text-white">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base flex items-center">
            <Zap className="w-4 h-4 mr-2" />
            Performance Insights
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
            <TabsTrigger value="components" className="text-xs h-7">Components</TabsTrigger>
            <TabsTrigger value="timeline" className="text-xs h-7">Timeline</TabsTrigger>
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
                    {componentsSortedByRenderTime.slice(0, 5).map((metric, index) => (
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
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="components" className="h-full mt-0">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-4">
              {Object.values(metrics).length > 0 ? (
                Object.values(metrics).map((metric, index) => (
                  <div key={index} className="border rounded p-2 space-y-1 text-sm">
                    <div className="font-medium flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {metric.componentName}
                    </div>
                    <div className="grid grid-cols-2 text-xs gap-y-1">
                      <span className="text-muted-foreground">Render count:</span>
                      <span>{metric.renderTimes?.length || 0}</span>
                      <span className="text-muted-foreground">Average time:</span>
                      <span>{metric.averageRenderTime?.toFixed(2) || 0}ms</span>
                      <span className="text-muted-foreground">Last render:</span>
                      <span>{metric.lastRenderTime?.toFixed(2) || 0}ms</span>
                    </div>
                    {metric.insights && metric.insights.length > 0 && (
                      <div className="mt-2 text-xs space-y-1">
                        <span className="font-medium">Insights:</span>
                        <ul className="ml-2 space-y-1">
                          {metric.insights.map((insight, i) => (
                            <li key={i} className="text-amber-600">{insight}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground">
                  No components tracked yet
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="timeline" className="h-full mt-0">
          <ScrollArea className="h-full p-3">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Recent Renders</h3>
              {Object.values(metrics).some(m => m.renderTimeline && m.renderTimeline.length > 0) ? (
                <div className="space-y-1">
                  {Object.values(metrics)
                    .flatMap(m => m.renderTimeline || [])
                    .sort((a, b) => b.endTime - a.endTime)
                    .slice(0, 20)
                    .map((timeline, index) => (
                      <div key={index} className="text-xs border-l-2 border-purple-200 pl-2 py-1">
                        <div className="font-medium">{timeline.component}</div>
                        <div className="text-muted-foreground">
                          {timeline.duration.toFixed(2)}ms at {new Date(timeline.endTime).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  No render timeline data yet
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
