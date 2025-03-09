
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Settings, X, Activity, Zap, Gauge, Flame } from 'lucide-react';
import { usePerfConfig } from '@/hooks/usePerfConfig';

/**
 * Dashboard component for controlling performance monitoring configuration
 * with advanced settings and visualization
 */
const PerfConfigDashboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('features');
  const config = usePerfConfig();

  // Hide completely in production
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-2 left-2 z-50">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
        size="sm"
      >
        <Gauge size={16} className="text-white" />
      </Button>
      
      {isOpen && (
        <Card className="absolute bottom-12 left-0 w-80 shadow-lg bg-white/95 backdrop-blur-sm border border-blue-100">
          <CardHeader className="p-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              Performance Configuration
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-7 w-7 p-0 text-white hover:bg-blue-700/50">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <div className="border-b border-gray-200 px-3 pt-2">
            <div className="flex space-x-2 text-xs font-medium">
              <button
                onClick={() => setActiveTab('features')}
                className={`pb-2 px-2 ${activeTab === 'features' 
                  ? 'border-b-2 border-blue-500 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-900'}`}
              >
                Features
              </button>
              <button
                onClick={() => setActiveTab('advanced')}
                className={`pb-2 px-2 ${activeTab === 'advanced' 
                  ? 'border-b-2 border-blue-500 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-900'}`}
              >
                Advanced
              </button>
              <button
                onClick={() => setActiveTab('presets')}
                className={`pb-2 px-2 ${activeTab === 'presets' 
                  ? 'border-b-2 border-blue-500 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-900'}`}
              >
                Presets
              </button>
            </div>
          </div>
          
          <CardContent className="p-4">
            <ScrollArea className="h-auto max-h-96">
              {activeTab === 'features' && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium flex items-center">
                      <Zap className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                      Monitoring Features
                    </h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Performance Tracking</span>
                        <Switch 
                          checked={config.enablePerformanceTracking} 
                          onCheckedChange={(checked) => config.setPerformanceConfig({ enablePerformanceTracking: checked })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Render Tracking</span>
                        <Switch 
                          checked={config.enableRenderTracking} 
                          onCheckedChange={(checked) => config.setPerformanceConfig({ enableRenderTracking: checked })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Props Validation</span>
                        <Switch 
                          checked={config.enableValidation} 
                          onCheckedChange={(checked) => config.setPerformanceConfig({ enableValidation: checked })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Props Change Tracking</span>
                        <Switch 
                          checked={config.enablePropTracking} 
                          onCheckedChange={(checked) => config.setPerformanceConfig({ enablePropTracking: checked })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Debug Logging</span>
                        <Switch 
                          checked={config.enableDebugLogging} 
                          onCheckedChange={(checked) => config.setPerformanceConfig({ enableDebugLogging: checked })}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium flex items-center">
                      <Flame className="h-3.5 w-3.5 mr-1.5 text-orange-500" />
                      Optimizations
                    </h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Intelligent Profiling</span>
                        <Switch 
                          checked={config.intelligentProfiling} 
                          onCheckedChange={(checked) => config.setPerformanceConfig({ intelligentProfiling: checked })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Inactive Tab Throttling</span>
                        <Switch 
                          checked={config.inactiveTabThrottling} 
                          onCheckedChange={(checked) => config.setPerformanceConfig({ inactiveTabThrottling: checked })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Batch Updates</span>
                        <Switch 
                          checked={config.batchUpdates} 
                          onCheckedChange={(checked) => config.setPerformanceConfig({ batchUpdates: checked })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'advanced' && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Sampling Controls</h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Sampling Rate</span>
                          <span className="text-xs text-gray-500">{config.samplingRate * 100}%</span>
                        </div>
                        <Slider 
                          value={[config.samplingRate * 100]} 
                          min={1} 
                          max={100} 
                          step={1} 
                          onValueChange={(value) => config.setPerformanceConfig({ 
                            samplingRate: value[0] / 100 
                          })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Throttle Interval</span>
                          <span className="text-xs text-gray-500">{config.throttleInterval}ms</span>
                        </div>
                        <Slider 
                          value={[config.throttleInterval]} 
                          min={0} 
                          max={2000} 
                          step={100}
                          onValueChange={(value) => config.setPerformanceConfig({ 
                            throttleInterval: value[0] 
                          })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Max Tracked Components</span>
                          <span className="text-xs text-gray-500">{config.maxTrackedComponents}</span>
                        </div>
                        <Slider 
                          value={[config.maxTrackedComponents]} 
                          min={5} 
                          max={100} 
                          step={5}
                          onValueChange={(value) => config.setPerformanceConfig({ 
                            maxTrackedComponents: value[0] 
                          })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'presets' && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-green-50 text-green-700 hover:bg-green-100"
                      variant="outline" 
                      size="sm"
                      onClick={() => config.applyPreset('comprehensive')}
                    >
                      <Flame className="h-3.5 w-3.5 mr-2" />
                      Comprehensive Monitoring
                      <span className="ml-auto text-xs text-green-600 opacity-70">Full</span>
                    </Button>
                    
                    <Button 
                      className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100"
                      variant="outline" 
                      size="sm"
                      onClick={() => config.applyPreset('balanced')}
                    >
                      <Activity className="h-3.5 w-3.5 mr-2" />
                      Balanced Monitoring
                      <span className="ml-auto text-xs text-blue-600 opacity-70">30%</span>
                    </Button>
                    
                    <Button 
                      className="w-full bg-amber-50 text-amber-700 hover:bg-amber-100"
                      variant="outline" 
                      size="sm"
                      onClick={() => config.applyPreset('minimal')}
                    >
                      <Gauge className="h-3.5 w-3.5 mr-2" />
                      Minimal Impact
                      <span className="ml-auto text-xs text-amber-600 opacity-70">10%</span>
                    </Button>
                    
                    <Button 
                      className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                      variant="outline" 
                      size="sm"
                      onClick={() => config.applyPreset('disabled')}
                    >
                      <X className="h-3.5 w-3.5 mr-2" />
                      Disable All Monitoring
                      <span className="ml-auto text-xs text-gray-500 opacity-70">Off</span>
                    </Button>
                  </div>
                  
                  <div className="pt-3 text-xs text-muted-foreground border-t mt-2">
                    <p>Lower performance impact by selecting an appropriate preset based on your current development needs.</p>
                  </div>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PerfConfigDashboard;
