
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { performanceMonitor } from '@/utils/performance/performanceMonitor';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Trash, RefreshCw, AlertTriangle, Clock, Zap, Cloud, Database } from 'lucide-react';
import { usePerfConfig } from '@/hooks/usePerfConfig';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { ComponentMetrics } from '@/utils/performance/PerformanceMonitor';

// Define the PerformanceMetric type to avoid type errors
interface PerformanceMetric {
  component_name: string;
  average_render_time: number;
  total_renders: number;
  slow_renders: number;
  created_at: string;
  [key: string]: any;
}

// Component for displaying performance insights and metrics
const PerformanceInsights: React.FC = () => {
  const [metrics, setMetrics] = useState<Record<string, ComponentMetrics>>({});
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [backendMetrics, setBackendMetrics] = useState<PerformanceMetric[]>([]);
  const [isLoadingBackend, setIsLoadingBackend] = useState(false);
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
    
    // Auto-refresh every 15 seconds (increased from 10)
    const intervalId = setInterval(() => {
      if (isOpen) {
        refreshMetrics();
        
        // Also fetch backend metrics every 30 seconds
        if (Date.now() % 30000 < 1000) {
          fetchBackendMetrics();
        }
      }
    }, 15000);

    // Initially fetch backend metrics if panel is open
    if (isOpen) {
      fetchBackendMetrics();
    }

    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, [refreshKey, isOpen]);

  // Fetch backend metrics from Supabase
  const fetchBackendMetrics = async () => {
    try {
      setIsLoadingBackend(true);
      
      // Check if the table exists first using our new RPC function
      const { data, error } = await supabase
        .rpc('get_performance_metrics', { limit_count: 5 });
        
      if (error) {
        console.error('Error fetching backend metrics:', error);
        setBackendMetrics([]);
        return;
      }
      
      if (data && Array.isArray(data)) {
        setBackendMetrics(data as PerformanceMetric[]);
        
        if (data.length > 0) {
          toast({
            title: 'Performance data synchronized',
            description: `Retrieved ${data.length} metrics from the server`,
            duration: 2000
          });
        }
      } else {
        setBackendMetrics([]);
      }
    } catch (error) {
      console.error('Error fetching backend metrics:', error);
      setBackendMetrics([]);
    } finally {
      setIsLoadingBackend(false);
    }
  };

  // Filter to only show the most important metrics
  const componentsSortedByRenderTime = Object.values(metrics)
    .filter(m => typeof m.averageRenderTime === 'number' && m.averageRenderTime > 10) // Only show components above 10ms
    .sort((a, b) => (b.averageRenderTime || 0) - (a.averageRenderTime || 0))
    .slice(0, 5); // Show only top 5

  const clearMetrics = () => {
    performanceMonitor.clearMetrics();
    setRefreshKey(prev => prev + 1);
    
    toast({
      title: 'Metrics cleared',
      description: 'Local performance metrics have been reset',
      duration: 2000
    });
  };

  const refreshMetrics = () => {
    setMetrics(performanceMonitor.getAllMetrics());
    setRefreshKey(prev => prev + 1);
  };
  
  const flushToBackend = async () => {
    try {
      // This will trigger the internal flush method
      // Use a direct call to the performance monitoring API
      await supabase.functions.invoke('track-performance', {
        body: {
          metrics: (performanceMonitor.getMetrics() as any).queuedMetrics || [],
          sessionId: 'manual-flush',
          deviceInfo: {
            userAgent: navigator.userAgent,
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight
          }
        }
      });
      
      toast({
        title: 'Metrics flushed to backend',
        description: 'Performance data has been sent to the server',
        duration: 2000
      });
      
      // Refresh backend metrics after a short delay
      setTimeout(() => fetchBackendMetrics(), 1000);
    } catch (error) {
      console.error('Error flushing metrics:', error);
      
      toast({
        title: 'Error flushing metrics',
        description: 'Could not send metrics to backend',
        variant: 'destructive',
        duration: 3000
      });
    }
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

  // Get queued metrics count (with type safety)
  const queuedMetrics = (performanceMonitor.getMetrics() as any).queuedMetrics || [];
  const queuedMetricsCount = Array.isArray(queuedMetrics) ? queuedMetrics.length : 0;

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
            <TabsTrigger value="slow" className="text-xs h-7">Slow</TabsTrigger>
            <TabsTrigger value="backend" className="text-xs h-7">Backend</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="p-0 h-[calc(100%-88px)]">
        <TabsContent value="overview" className="h-full mt-0">
          <ScrollArea className="h-full p-3">
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Local Components Tracked</h3>
              <div className="text-2xl font-bold">{Object.keys(metrics).length}</div>
              
              {queuedMetricsCount > 0 && (
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm flex items-center">
                    <Cloud className="h-3 w-3 mr-1" />
                    Metrics queue
                  </span>
                  <span className="text-sm font-medium">{queuedMetricsCount}</span>
                </div>
              )}

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
              
              <div className="flex space-x-2 mt-4">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={clearMetrics} 
                  className="flex-1"
                >
                  <Trash className="h-3 w-3 mr-1" />
                  Clear
                </Button>
                
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={flushToBackend} 
                  className="flex-1"
                >
                  <Cloud className="h-3 w-3 mr-1" />
                  Flush to Backend
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground mt-2">
                Performance monitoring enabled for development only.
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
        
        <TabsContent value="backend" className="h-full mt-0">
          <ScrollArea className="h-full p-3">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium flex items-center">
                  <Database className="h-3 w-3 mr-1" />
                  Server-side Metrics
                </h3>
                <Button size="sm" variant="ghost" onClick={fetchBackendMetrics} disabled={isLoadingBackend} className="h-6 w-6 p-0">
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
              
              {isLoadingBackend ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-5 w-5 border-2 border-purple-500 rounded-full border-t-transparent mx-auto"></div>
                  <p className="text-xs mt-2 text-muted-foreground">Loading metrics...</p>
                </div>
              ) : backendMetrics.length === 0 ? (
                <div className="text-center text-muted-foreground p-4">
                  <p>No backend metrics available</p>
                  <p className="text-xs mt-2">Flush metrics to server to see data here</p>
                </div>
              ) : (
                <>
                  <div className="text-xs text-muted-foreground mb-2">
                    Showing {backendMetrics.length} most recent metrics
                  </div>
                  
                  <div className="space-y-2">
                    {backendMetrics.map((metric, index) => (
                      <div key={index} className="border rounded p-2 space-y-1 text-xs">
                        <div className="font-medium">{metric.component_name}</div>
                        <div className="grid grid-cols-2 gap-y-1">
                          <span className="text-muted-foreground">Avg time:</span>
                          <span>{metric.average_render_time?.toFixed(2)}ms</span>
                          <span className="text-muted-foreground">Renders:</span>
                          <span>{metric.total_renders}</span>
                          <span className="text-muted-foreground">Slow renders:</span>
                          <span>{metric.slow_renders}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(metric.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={flushToBackend} 
                className="w-full mt-3"
              >
                <Cloud className="h-3 w-3 mr-1" />
                Flush Local Metrics to Server
              </Button>
            </div>
          </ScrollArea>
        </TabsContent>
      </CardContent>
    </Card>
  );
};

export default PerformanceInsights;
