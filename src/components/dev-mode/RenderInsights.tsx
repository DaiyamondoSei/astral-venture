
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PerformanceMonitor } from '@/utils/performance/performanceMonitor';
import { usePerformance } from '@/contexts/PerformanceContext';
import { RenderFrequencies } from '@/utils/performance/constants';
import { Loader, RefreshCw, Activity, PieChart, LineChart } from 'lucide-react';

interface RenderInsightsProps {
  componentFilter?: string;
  height?: number;
  width?: number;
}

export const RenderInsights: React.FC<RenderInsightsProps> = ({
  componentFilter,
  height = 400,
  width = 600
}) => {
  const [componentMetrics, setComponentMetrics] = useState<Record<string, any>>({});
  const [topComponents, setTopComponents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartType, setChartType] = useState<'renders' | 'duration'>('renders');
  const { config } = usePerformance();
  
  useEffect(() => {
    const metrics = PerformanceMonitor.getInstance().getAllMetrics();
    setComponentMetrics(metrics as Record<string, any>);
    
    // Process metrics to get top components by render count
    const components = Object.entries(metrics || {})
      .filter(([name]) => !componentFilter || name.includes(componentFilter))
      .map(([name, data]) => ({
        name: formatComponentName(name),
        renders: data.renderCount || 0,
        duration: data.totalRenderTime || 0,
        avgDuration: data.renderCount ? (data.totalRenderTime / data.renderCount).toFixed(2) : 0,
        lastRender: data.lastRenderTime || 0,
        rerenders: data.reRenderCount || 0
      }))
      .sort((a, b) => b[chartType] - a[chartType])
      .slice(0, 10);
    
    setTopComponents(components);
    setIsLoading(false);
  }, [chartType, componentFilter]);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      const metrics = PerformanceMonitor.getInstance().getAllMetrics();
      setComponentMetrics(metrics as Record<string, any>);
      
      // Process metrics to get top components
      const components = Object.entries(metrics || {})
        .filter(([name]) => !componentFilter || name.includes(componentFilter))
        .map(([name, data]) => ({
          name: formatComponentName(name),
          renders: data.renderCount || 0,
          duration: data.totalRenderTime || 0,
          avgDuration: data.renderCount ? (data.totalRenderTime / data.renderCount).toFixed(2) : 0,
          lastRender: data.lastRenderTime || 0,
          rerenders: data.reRenderCount || 0
        }))
        .sort((a, b) => b[chartType] - a[chartType])
        .slice(0, 10);
      
      setTopComponents(components);
      setIsLoading(false);
    }, 200);
  };

  const getComponentCategory = (renderCount: number) => {
    if (renderCount > 20) {
      return RenderFrequencies.HIGH;
    } else if (renderCount > 5) {
      return RenderFrequencies.MEDIUM;
    }
    return RenderFrequencies.LOW;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case RenderFrequencies.HIGH:
        return '#ef4444';
      case RenderFrequencies.MEDIUM:
        return '#f97316';
      case RenderFrequencies.LOW:
        return '#22c55e';
      default:
        return '#3b82f6';
    }
  };

  const formatComponentName = (name: string) => {
    return name.length > 20 ? name.substring(0, 17) + '...' : name;
  };

  if (isLoading) {
    return (
      <Card className="w-full h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Component Render Analysis</CardTitle>
          <CardDescription>Loading component render metrics...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center" style={{ height: height - 100 }}>
          <Loader className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">Component Render Analysis</CardTitle>
            <CardDescription>
              Performance metrics for {Object.keys(componentMetrics).length} tracked components
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="chart">
                <BarChart className="w-4 h-4 mr-1" />
                Chart
              </TabsTrigger>
              <TabsTrigger value="table">
                <Activity className="w-4 h-4 mr-1" />
                Table
              </TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              <Button 
                variant={chartType === 'renders' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setChartType('renders')}
              >
                <LineChart className="w-3 h-3 mr-1" />
                Renders
              </Button>
              <Button 
                variant={chartType === 'duration' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setChartType('duration')}
              >
                <PieChart className="w-3 h-3 mr-1" />
                Duration
              </Button>
            </div>
          </div>
          
          <TabsContent value="chart" className="pt-2">
            <div className="flex justify-center">
              <BarChart width={width - 50} height={height - 150} data={topComponents}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip 
                  formatter={(value: any, name: string) => {
                    return [name === 'duration' ? `${value} ms` : value, name === 'duration' ? 'Render Time' : 'Render Count'];
                  }}
                  labelFormatter={(label) => `Component: ${label}`}
                />
                <Legend />
                <Bar 
                  dataKey={chartType} 
                  name={chartType === 'duration' ? 'Render Time (ms)' : 'Render Count'} 
                  fill="#3b82f6"
                  isAnimationActive={!config.disableAnimations}
                />
              </BarChart>
            </div>
          </TabsContent>
          
          <TabsContent value="table">
            <div className="border rounded-md">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-2 text-left">Component</th>
                    <th className="p-2 text-right">Renders</th>
                    <th className="p-2 text-right">Re-renders</th>
                    <th className="p-2 text-right">Total Time (ms)</th>
                    <th className="p-2 text-right">Avg Time (ms)</th>
                    <th className="p-2 text-center">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {topComponents.map((component, index) => {
                    const category = getComponentCategory(component.renders);
                    return (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="p-2">{component.name}</td>
                        <td className="p-2 text-right">{component.renders}</td>
                        <td className="p-2 text-right">{component.rerenders || 0}</td>
                        <td className="p-2 text-right">{component.duration.toFixed(1)}</td>
                        <td className="p-2 text-right">{component.avgDuration}</td>
                        <td className="p-2 text-center">
                          <span 
                            className="px-2 py-1 rounded text-xs text-white"
                            style={{ backgroundColor: getCategoryColor(category) }}
                          >
                            {category}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RenderInsights;
