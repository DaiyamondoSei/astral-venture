
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { performanceMonitor } from '@/utils/performance/performanceMonitor';
import { devLogger } from '@/utils/debugUtils';

/**
 * Performance Insights Dashboard
 * Displays real-time performance metrics and insights for the application
 */
const PerformanceInsights = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [performanceData, setPerformanceData] = useState(performanceMonitor.getMetrics());
  const [activeTab, setActiveTab] = useState('metrics');
  
  // Subscribe to performance updates
  useEffect(() => {
    const updateData = () => {
      setPerformanceData(performanceMonitor.getMetrics());
    };
    
    // Set up subscription
    const unsubscribe = performanceMonitor.subscribe(updateData);
    
    // Clean up subscription
    return () => {
      unsubscribe();
    };
  }, []);
  
  if (!isVisible) {
    return (
      <Button 
        className="fixed bottom-4 right-4 z-50 bg-violet-600 hover:bg-violet-700 text-white"
        onClick={() => setIsVisible(true)}
        size="sm"
      >
        Show Performance
      </Button>
    );
  }
  
  // Calculate average render times
  const avgRenderTime = performanceData.renderTimes.length 
    ? performanceData.renderTimes.reduce((sum, time) => sum + time, 0) / performanceData.renderTimes.length 
    : 0;
  
  const getPerformanceIndicator = (value: number, thresholds: [number, number]) => {
    if (value <= thresholds[0]) return 'good';
    if (value <= thresholds[1]) return 'warning';
    return 'critical';
  };
  
  const renderIndicator = getPerformanceIndicator(avgRenderTime, [20, 50]);
  const memoryIndicator = getPerformanceIndicator(performanceData.memoryUsage || 0, [50, 80]);
  
  return (
    <div className="fixed bottom-0 right-0 z-50 w-[450px] bg-gray-900/95 text-white rounded-tl-lg shadow-lg border border-gray-700 overflow-hidden">
      <div className="flex justify-between items-center p-2 bg-gray-800">
        <h3 className="text-sm font-semibold">Performance Insights</h3>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            className="h-6 px-2 text-xs text-gray-300 hover:text-white"
            onClick={() => performanceMonitor.clearMetrics()}
          >
            Reset
          </Button>
          <Button 
            variant="ghost" 
            className="h-6 px-2 text-xs text-gray-300 hover:text-white"
            onClick={() => setIsVisible(false)}
          >
            ✕
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="metrics" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full bg-gray-800 p-0 h-8">
          <TabsTrigger value="metrics" className="text-xs h-8 data-[state=active]:bg-gray-700">
            Metrics
          </TabsTrigger>
          <TabsTrigger value="components" className="text-xs h-8 data-[state=active]:bg-gray-700">
            Components
          </TabsTrigger>
          <TabsTrigger value="insights" className="text-xs h-8 data-[state=active]:bg-gray-700">
            Insights
          </TabsTrigger>
          <TabsTrigger value="timeline" className="text-xs h-8 data-[state=active]:bg-gray-700">
            Timeline
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="metrics" className="p-3 m-0">
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-gray-800 border-gray-700 p-3">
              <div className="text-xs text-gray-400">Render Performance</div>
              <div className="flex items-end gap-2">
                <div className="text-2xl font-semibold">{avgRenderTime.toFixed(1)}ms</div>
                <Badge className={`
                  ${renderIndicator === 'good' ? 'bg-green-600' : ''}
                  ${renderIndicator === 'warning' ? 'bg-yellow-600' : ''}
                  ${renderIndicator === 'critical' ? 'bg-red-600' : ''}
                `}>
                  {renderIndicator}
                </Badge>
              </div>
              <div className="text-xs text-gray-400 mt-2">Last render: {performanceData.lastRenderTime.toFixed(1)}ms</div>
            </Card>
            
            <Card className="bg-gray-800 border-gray-700 p-3">
              <div className="text-xs text-gray-400">Memory Usage</div>
              <div className="flex items-end gap-2">
                <div className="text-2xl font-semibold">{performanceData.memoryUsage?.toFixed(1)}%</div>
                <Badge className={`
                  ${memoryIndicator === 'good' ? 'bg-green-600' : ''}
                  ${memoryIndicator === 'warning' ? 'bg-yellow-600' : ''}
                  ${memoryIndicator === 'critical' ? 'bg-red-600' : ''}
                `}>
                  {memoryIndicator}
                </Badge>
              </div>
              <div className="text-xs text-gray-400 mt-2">
                {(performanceData.jsHeapSizeLimit / (1024 * 1024)).toFixed(0)}MB limit
              </div>
            </Card>
          </div>
          
          <div className="mt-3">
            <div className="text-xs text-gray-400 mb-1">Recent Events</div>
            <Card className="bg-gray-800 border-gray-700 h-[120px] overflow-hidden">
              <ScrollArea className="h-[120px] w-full">
                <div className="p-2">
                  {performanceData.events.slice(-5).reverse().map((event, i) => (
                    <div key={i} className="text-xs py-1 border-b border-gray-700 last:border-0">
                      <span className="text-gray-400">{new Date(event.timestamp).toLocaleTimeString()}</span>
                      <span className="ml-2">{event.description}</span>
                    </div>
                  ))}
                  {performanceData.events.length === 0 && (
                    <div className="text-xs py-1 text-gray-500">No events recorded</div>
                  )}
                </div>
              </ScrollArea>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="components" className="p-0 pt-2 m-0 h-[280px]">
          <ScrollArea className="h-[280px] w-full">
            <div className="p-3">
              <div className="text-xs text-gray-400 mb-2">Component Render Times (Top 10)</div>
              {performanceData.componentStats
                .sort((a, b) => b.averageRenderTime - a.averageRenderTime)
                .slice(0, 10)
                .map((stat, i) => (
                  <div key={i} className="mb-2">
                    <div className="flex justify-between text-xs">
                      <span>{stat.name}</span>
                      <span>{stat.averageRenderTime.toFixed(1)}ms</span>
                    </div>
                    <div className="w-full bg-gray-700 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          stat.averageRenderTime < 20 ? 'bg-green-500' : 
                          stat.averageRenderTime < 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, (stat.averageRenderTime / 100) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              {performanceData.componentStats.length === 0 && (
                <div className="text-xs text-gray-500">No component data available</div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="insights" className="p-3 m-0 h-[280px]">
          <ScrollArea className="h-[280px] w-full">
            <div>
              <div className="text-xs text-gray-400 mb-2">Performance Insights</div>
              {performanceData.insights.map((insight, i) => (
                <Card key={i} className="bg-gray-800 border-gray-700 p-2 mb-2">
                  <div className="flex items-start gap-2">
                    <Badge className={`
                      ${insight.severity === 'info' ? 'bg-blue-600' : ''}
                      ${insight.severity === 'warning' ? 'bg-yellow-600' : ''}
                      ${insight.severity === 'critical' ? 'bg-red-600' : ''}
                    `}>
                      {insight.severity}
                    </Badge>
                    <div>
                      <div className="text-sm font-medium">{insight.title}</div>
                      <div className="text-xs text-gray-400 mt-1">{insight.description}</div>
                      {insight.recommendation && (
                        <div className="text-xs mt-1 text-violet-400">
                          Recommendation: {insight.recommendation}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              {performanceData.insights.length === 0 && (
                <div className="text-xs text-gray-500">No insights available</div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="timeline" className="p-3 m-0 h-[280px]">
          <ScrollArea className="h-[280px] w-full">
            <div>
              <div className="text-xs text-gray-400 mb-2">Render Timeline</div>
              {performanceData.renderTimeline.length === 0 ? (
                <div className="text-xs text-gray-500">No timeline data available</div>
              ) : (
                performanceData.renderTimeline.slice(-10).reverse().map((item, i) => (
                  <div key={i} className="mb-2 text-xs border-l-2 border-gray-700 pl-2 pb-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{item.componentName}</span>
                      <span className="text-gray-400">
                        {item.renderTime.toFixed(1)}ms
                      </span>
                    </div>
                    <div className="text-gray-400 mt-0.5">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </div>
                    {item.props && (
                      <div className="mt-1 text-violet-400">
                        {Object.keys(item.props).length} props
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
      
      <Separator className="bg-gray-700" />
      
      <div className="p-2 text-xs text-gray-400 flex justify-between items-center bg-gray-800">
        <div>FPS: {performanceData.fps.toFixed(0)}</div>
        <div>Total renders: {performanceData.totalRenders}</div>
        <div>Last updated: {new Date(performanceData.lastUpdated).toLocaleTimeString()}</div>
      </div>
    </div>
  );
};

export default PerformanceInsights;
