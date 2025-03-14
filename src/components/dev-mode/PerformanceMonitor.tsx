
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePerfConfig } from '@/hooks/usePerfConfig';
import { performanceMonitor } from '@/utils/performance/performanceMonitor';
import { DeviceCapabilities } from '@/utils/performance/core/constants';
import { 
  Activity, 
  Cpu, 
  BarChart, 
  Gauge, 
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Smartphone
} from 'lucide-react';

const PerformanceMonitor: React.FC = () => {
  const [fps, setFps] = useState<number>(0);
  const [memoryUsage, setMemoryUsage] = useState<number>(0);
  const [activePage, setActivePage] = useState<string>('dashboard');
  const [componentMetrics, setComponentMetrics] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  const perfConfig = usePerfConfig();
  
  // Destructuring values from perfConfig
  const { 
    deviceCapability, 
    isLowPerformance,
    setManualPerformanceMode
  } = perfConfig;
  
  // Update metrics on interval
  useEffect(() => {
    const updateMetrics = () => {
      const data = performanceMonitor.getPerformanceData();
      setFps(Math.round(data.fps));
      setMemoryUsage(Math.round(data.memory));
      setComponentMetrics(performanceMonitor.getAllMetrics());
      setLastUpdated(new Date());
    };
    
    // Initial update
    updateMetrics();
    
    // Set up interval
    const intervalId = setInterval(updateMetrics, 1000);
    
    // Clean up interval
    return () => clearInterval(intervalId);
  }, []);
  
  // Optimize for performance
  const handleOptimizeClick = () => {
    perfConfig.updateConfig({ 
      disableAnimations: true,
      disableEffects: true
    });
  };
  
  // Metrics quality rendering
  const renderMetricQuality = (value: number, type: 'fps' | 'memory') => {
    if (type === 'fps') {
      if (value < 30) return <Badge variant="destructive">Poor</Badge>;
      if (value < 45) return <Badge variant="warning">Low</Badge>;
      if (value < 55) return <Badge variant="secondary">Good</Badge>;
      return <Badge variant="success">Excellent</Badge>;
    } else {
      if (value > 200) return <Badge variant="destructive">High</Badge>;
      if (value > 150) return <Badge variant="warning">Elevated</Badge>;
      if (value > 100) return <Badge variant="secondary">Moderate</Badge>;
      return <Badge variant="success">Low</Badge>;
    }
  };
  
  // Format component name for display
  const formatComponentName = (name: string) => {
    return name.replace(/[<>]/g, '').split(' ')[0];
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">Performance Monitor</CardTitle>
          <Badge variant={isLowPerformance ? "destructive" : "success"}>
            {isLowPerformance ? "Low Performance" : "Good Performance"}
          </Badge>
        </div>
        <CardDescription>
          Device Capability: {deviceCapability} | Last Updated: {lastUpdated.toLocaleTimeString()}
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue={activePage} onValueChange={setActivePage}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="px-2 py-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-muted/50 p-4 rounded-lg flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  FPS
                </h3>
                <p className="text-2xl font-bold">{fps}</p>
              </div>
              {renderMetricQuality(fps, 'fps')}
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  Memory
                </h3>
                <p className="text-2xl font-bold">{memoryUsage} MB</p>
              </div>
              {renderMetricQuality(memoryUsage, 'memory')}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-4">
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs"
              onClick={() => setManualPerformanceMode(DeviceCapabilities.HIGH)}
            >
              <ArrowUpCircle className="h-3 w-3 mr-1" />
              High
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs"
              onClick={() => setManualPerformanceMode(DeviceCapabilities.MEDIUM)}
            >
              <Smartphone className="h-3 w-3 mr-1" />
              Medium
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs"
              onClick={() => setManualPerformanceMode(DeviceCapabilities.LOW)}
            >
              <ArrowDownCircle className="h-3 w-3 mr-1" />
              Low
            </Button>
          </div>
          
          {isLowPerformance && (
            <div className="bg-destructive/10 p-3 rounded-md flex items-start mt-2">
              <AlertTriangle className="h-5 w-5 text-destructive mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Performance Issues Detected</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your device is struggling with the current configuration.
                </p>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="mt-2 text-xs h-7"
                  onClick={handleOptimizeClick}
                >
                  Optimize Now
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="components">
          <div className="space-y-2 px-1 py-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-1 px-3">
              <span>Component</span>
              <div className="flex gap-6">
                <span>Renders</span>
                <span>Avg Time</span>
              </div>
            </div>
            
            {componentMetrics.slice(0, 8).map((metric, index) => (
              <div 
                key={index} 
                className="flex justify-between items-center p-2 bg-muted/30 rounded-md text-sm hover:bg-muted transition-colors"
              >
                <span className="font-mono text-xs truncate max-w-[180px]">
                  {formatComponentName(metric.componentName)}
                </span>
                <div className="flex gap-4">
                  <Badge variant="outline" className="font-mono text-xs">
                    {metric.renderCount}
                  </Badge>
                  <span className="font-mono text-xs w-16 text-right">
                    {metric.averageRenderTime.toFixed(2)}ms
                  </span>
                </div>
              </div>
            ))}
            
            {componentMetrics.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                No component metrics available
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <div className="p-2 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-sm">Device Capability</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Current: {deviceCapability}
                </p>
              </div>
              <div className="flex gap-1">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs"
                  onClick={() => perfConfig.detectDeviceCapability()}
                >
                  Auto Detect
                </Button>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-sm">Disable Animations</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Improves performance on low-end devices
                </p>
              </div>
              <div className="flex gap-1">
                <Button 
                  variant={perfConfig.config.disableAnimations ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                  onClick={() => perfConfig.updateConfig({ disableAnimations: true })}
                >
                  On
                </Button>
                <Button 
                  variant={!perfConfig.config.disableAnimations ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                  onClick={() => perfConfig.updateConfig({ disableAnimations: false })}
                >
                  Off
                </Button>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-sm">Disable Effects</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Disables blur, shadows and other effects
                </p>
              </div>
              <div className="flex gap-1">
                <Button 
                  variant={perfConfig.config.disableEffects ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                  onClick={() => perfConfig.updateConfig({ disableEffects: true })}
                >
                  On
                </Button>
                <Button 
                  variant={!perfConfig.config.disableEffects ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                  onClick={() => perfConfig.updateConfig({ disableEffects: false })}
                >
                  Off
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <CardFooter className="border-t pt-3 flex justify-between">
        <span className="text-xs text-muted-foreground">
          {perfConfig.isInSimulationMode ? 'Simulation Mode' : 'Live Monitoring'}
        </span>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs h-7"
          onClick={() => performanceMonitor.clearMetrics()}
        >
          Clear Metrics
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PerformanceMonitor;
