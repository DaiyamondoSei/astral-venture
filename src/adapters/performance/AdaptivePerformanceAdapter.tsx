
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toggle } from '@/components/ui/toggle';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { usePerformance } from '@/contexts/PerformanceContext';
import { PerformanceModes, DEFAULT_PERF_CONFIG } from '@/types/core/performance/runtime-constants';
import { PerfConfig } from '@/types/core/performance/constants';

/**
 * AdaptivePerformanceAdapter
 * 
 * This component serves as an adapter for the protected AdaptivePerformanceMonitor component.
 * It provides similar functionality while being compatible with the current
 * performance context interface.
 */
const AdaptivePerformanceAdapter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("modes");
  const [selectedMode, setSelectedMode] = useState<string>("auto");
  const [visualsEnabled, setVisualsEnabled] = useState<boolean>(true);
  const [animationsEnabled, setAnimationsEnabled] = useState<boolean>(true);
  const [effectsEnabled, setEffectsEnabled] = useState<boolean>(true);
  const [qualityLevel, setQualityLevel] = useState<number>(75);
  
  // Get performance context
  const performance = usePerformance();
  
  // Define defaults for missing config properties
  const defaultConfig: PerfConfig = DEFAULT_PERF_CONFIG;
  
  // Create merged config with defaults
  const config = {
    ...defaultConfig,
    ...(performance.config || {})
  };
  
  // Handler for performance mode selection
  const handlePerformanceModeChange = (mode: string) => {
    setSelectedMode(mode);
    
    // Call setManualPerformanceMode if it exists on the context
    // If not, we'll handle this internally in the adapter
    if (typeof (performance as any).setManualPerformanceMode === 'function') {
      (performance as any).setManualPerformanceMode(mode);
    }
  };
  
  // Handler for config updates
  const updateConfig = (updates: Partial<PerfConfig>) => {
    // Call updateConfig if it exists on the context
    if (typeof (performance as any).updateConfig === 'function') {
      (performance as any).updateConfig(updates);
    }
  };
  
  // Status indicators for performance
  const getPerformanceStatus = () => {
    const { deviceCapability } = performance;
    
    if (deviceCapability === 'high') {
      return { status: 'Excellent', color: 'bg-green-500' };
    } else if (deviceCapability === 'medium') {
      return { status: 'Good', color: 'bg-yellow-500' };
    } else {
      return { status: 'Limited', color: 'bg-red-500' };
    }
  };
  
  const { status, color } = getPerformanceStatus();
  
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">
            Adaptive Performance
          </CardTitle>
          <Badge className={color}>{status}</Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="modes">Modes</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          </TabsList>
        
          <TabsContent value="modes" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Performance Mode</h3>
                <Select
                  value={selectedMode}
                  onValueChange={handlePerformanceModeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PerformanceModes.AUTO}>Auto (Device Optimized)</SelectItem>
                    <SelectItem value={PerformanceModes.BATTERY}>Battery Saver</SelectItem>
                    <SelectItem value={PerformanceModes.BALANCED}>Balanced</SelectItem>
                    <SelectItem value={PerformanceModes.PERFORMANCE}>Performance</SelectItem>
                    <SelectItem value={PerformanceModes.QUALITY}>Quality</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <Toggle 
                  pressed={visualsEnabled} 
                  onPressedChange={setVisualsEnabled}
                  className="flex flex-col items-center justify-center h-20"
                >
                  <div className="text-center">
                    <div className="font-medium">Visuals</div>
                    <div className="text-xs text-muted-foreground">{visualsEnabled ? 'Enabled' : 'Disabled'}</div>
                  </div>
                </Toggle>
                
                <Toggle 
                  pressed={animationsEnabled} 
                  onPressedChange={setAnimationsEnabled}
                  className="flex flex-col items-center justify-center h-20"
                >
                  <div className="text-center">
                    <div className="font-medium">Animations</div>
                    <div className="text-xs text-muted-foreground">{animationsEnabled ? 'Enabled' : 'Disabled'}</div>
                  </div>
                </Toggle>
                
                <Toggle 
                  pressed={effectsEnabled} 
                  onPressedChange={setEffectsEnabled}
                  className="flex flex-col items-center justify-center h-20"
                >
                  <div className="text-center">
                    <div className="font-medium">Effects</div>
                    <div className="text-xs text-muted-foreground">{effectsEnabled ? 'Enabled' : 'Disabled'}</div>
                  </div>
                </Toggle>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Quality</span>
                  <span className="text-sm">{qualityLevel}%</span>
                </div>
                <Slider
                  value={[qualityLevel]}
                  min={0}
                  max={100}
                  step={25}
                  onValueChange={values => setQualityLevel(values[0])}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="features" className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Performance Tracking</span>
                <Toggle 
                  pressed={config.enablePerformanceTracking} 
                  onPressedChange={value => updateConfig({ enablePerformanceTracking: value })}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Render Tracking</span>
                <Toggle 
                  pressed={config.enableRenderTracking} 
                  onPressedChange={value => updateConfig({ enableRenderTracking: value })}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Intelligent Profiling</span>
                <Toggle 
                  pressed={config.intelligentProfiling} 
                  onPressedChange={value => updateConfig({ intelligentProfiling: value })}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Batch Updates</span>
                <Toggle 
                  pressed={config.batchUpdates} 
                  onPressedChange={value => updateConfig({ batchUpdates: value })}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Inactive Tab Throttling</span>
                <Toggle 
                  pressed={config.inactiveTabThrottling} 
                  onPressedChange={value => updateConfig({ inactiveTabThrottling: value })}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="metrics" className="space-y-4">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Sampling Rate</span>
                  <span className="text-sm">{Math.round(config.samplingRate * 100)}%</span>
                </div>
                <Slider
                  value={[config.samplingRate * 100]}
                  min={1}
                  max={100}
                  step={1}
                  onValueChange={values => updateConfig({ samplingRate: values[0] / 100 })}
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Throttle Interval</span>
                  <span className="text-sm">{config.throttleInterval}ms</span>
                </div>
                <Slider
                  value={[config.throttleInterval]}
                  min={0}
                  max={500}
                  step={10}
                  onValueChange={values => updateConfig({ throttleInterval: values[0] })}
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Max Tracked Components</span>
                  <span className="text-sm">{config.maxTrackedComponents}</span>
                </div>
                <Slider
                  value={[config.maxTrackedComponents]}
                  min={5}
                  max={100}
                  step={5}
                  onValueChange={values => updateConfig({ maxTrackedComponents: values[0] })}
                />
              </div>
              
              <Button 
                onClick={() => {
                  if (performance.clearMetrics) {
                    performance.clearMetrics();
                  }
                }}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Reset Metrics
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdaptivePerformanceAdapter;
