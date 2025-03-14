
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { usePerformance } from '@/contexts/PerformanceContext';
import { ChevronDown, ChevronUp, Activity } from 'lucide-react';
import { DeviceCapabilities, PerformanceModes } from '@/utils/performance/constants';

// Add type annotation for the component props
interface AdaptivePerformanceMonitorProps {
  minimized?: boolean;
}

export const AdaptivePerformanceMonitor: React.FC<AdaptivePerformanceMonitorProps> = ({ minimized = false }) => {
  const [isMinimized, setIsMinimized] = useState(minimized);
  const [activeTab, setActiveTab] = useState('general');
  const performanceContext = usePerformance();
  const deviceCapability = performanceContext.deviceCapability;
  const isLowPerformance = performanceContext.isLowPerformance;
  const manualPerformanceMode = PerformanceModes.AUTO;
  const config = performanceContext.config;

  // Use useRef for DOM references
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Destructure performance context properties safely
  const {
    updateConfig,
    // Additional properties not in the original type
    features,
    webVitals,
    setManualPerformanceMode,
  } = performanceContext;

  // Toggle minimized state
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Handle config changes
  const handleConfigChange = (key: string, value: any) => {
    updateConfig({ [key]: value });
  };

  return (
    <Card className="w-full border-orange-500/20 shadow-lg">
      <CardHeader className="py-2 px-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-orange-500" />
          <CardTitle className="text-sm font-medium">Performance Monitor</CardTitle>
          
          <Badge 
            variant={isLowPerformance ? "destructive" : "secondary"}
            className="ml-2 text-xs"
          >
            {deviceCapability}
          </Badge>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0" 
          onClick={toggleMinimize}
        >
          {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CardHeader>
      
      {!isMinimized && (
        <CardContent ref={contentRef} className="p-0">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full">
              <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
              <TabsTrigger value="advanced" className="flex-1">Advanced</TabsTrigger>
              <TabsTrigger value="metrics" className="flex-1">Metrics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="p-4 space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Performance Mode</h3>
                    <p className="text-xs text-muted-foreground">Select how the app should prioritize performance</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant={manualPerformanceMode === PerformanceModes.QUALITY ? "default" : "outline"}
                      onClick={() => setManualPerformanceMode?.(PerformanceModes.QUALITY)}
                      className="h-8"
                    >
                      Quality
                    </Button>
                    <Button 
                      size="sm" 
                      variant={manualPerformanceMode === PerformanceModes.BALANCED ? "default" : "outline"}
                      onClick={() => setManualPerformanceMode?.(PerformanceModes.BALANCED)}
                      className="h-8"
                    >
                      Balanced
                    </Button>
                    <Button 
                      size="sm" 
                      variant={manualPerformanceMode === PerformanceModes.PERFORMANCE ? "default" : "outline"}
                      onClick={() => setManualPerformanceMode?.(PerformanceModes.PERFORMANCE)}
                      className="h-8"
                    >
                      Performance
                    </Button>
                    <Button 
                      size="sm" 
                      variant={manualPerformanceMode === PerformanceModes.AUTO ? "default" : "outline"}
                      onClick={() => setManualPerformanceMode?.(PerformanceModes.AUTO)}
                      className="h-8"
                    >
                      Auto
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Visual Effects</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">Animations</p>
                        <p className="text-xs text-muted-foreground">Enable animations throughout the app</p>
                      </div>
                      <Switch 
                        checked={!config.disableAnimations} 
                        onCheckedChange={(checked) => handleConfigChange("disableAnimations", !checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">Particle Effects</p>
                        <p className="text-xs text-muted-foreground">Show particle effects and visual flourishes</p>
                      </div>
                      <Switch 
                        checked={!config.disableParticles} 
                        onCheckedChange={(checked) => handleConfigChange("disableParticles", !checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">Blur Effects</p>
                        <p className="text-xs text-muted-foreground">Enable backdrop blur and glass effects</p>
                      </div>
                      <Switch 
                        checked={!config.disableBlur} 
                        onCheckedChange={(checked) => handleConfigChange("disableBlur", !checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">Shadows</p>
                        <p className="text-xs text-muted-foreground">Show shadow effects for depth</p>
                      </div>
                      <Switch 
                        checked={!config.disableShadows} 
                        onCheckedChange={(checked) => handleConfigChange("disableShadows", !checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="p-4 space-y-4">
              {/* Advanced performance settings here */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Animation Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <p className="text-sm">Animation Dampening</p>
                        <span className="text-xs">{config.animationDampening}%</span>
                      </div>
                      <Slider 
                        value={[config.animationDampening]} 
                        min={0} 
                        max={100} 
                        step={5}
                        onValueChange={(value) => handleConfigChange("animationDampening", value[0])}
                      />
                      <p className="text-xs text-muted-foreground mt-1">Reduce animation complexity and duration</p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Rendering Options</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">Viewport Culling</p>
                        <p className="text-xs text-muted-foreground">Only render elements in viewport</p>
                      </div>
                      <Switch 
                        checked={config.enableViewportCulling} 
                        onCheckedChange={(checked) => handleConfigChange("enableViewportCulling", checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">Lazy Loading</p>
                        <p className="text-xs text-muted-foreground">Load components and assets on demand</p>
                      </div>
                      <Switch 
                        checked={config.enableLazyLoading} 
                        onCheckedChange={(checked) => handleConfigChange("enableLazyLoading", checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">Simplified DOM</p>
                        <p className="text-xs text-muted-foreground">Use simpler DOM structures when possible</p>
                      </div>
                      <Switch 
                        checked={config.useSimplifiedDOM} 
                        onCheckedChange={(checked) => handleConfigChange("useSimplifiedDOM", checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="metrics" className="p-4 space-y-4">
              {/* Performance metrics display here */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Current Status</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted p-2 rounded">
                      <p className="text-xs text-muted-foreground">Device</p>
                      <p className="text-sm font-medium">{deviceCapability}</p>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <p className="text-xs text-muted-foreground">Mode</p>
                      <p className="text-sm font-medium">{manualPerformanceMode}</p>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <p className="text-xs text-muted-foreground">FPS Target</p>
                      <p className="text-sm font-medium">{config.targetFPS}</p>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="text-sm font-medium">{isLowPerformance ? "Low Performance" : "Normal"}</p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium mb-2">System Info</h3>
                  <div className="text-xs space-y-1">
                    <p><span className="text-muted-foreground">OS: </span>
                       {typeof navigator !== 'undefined' ? navigator.platform : 'Unknown'}</p>
                    <p><span className="text-muted-foreground">Browser: </span>
                       {typeof navigator !== 'undefined' ? navigator.userAgent.split(' ').slice(-1)[0] : 'Unknown'}</p>
                    <p><span className="text-muted-foreground">CPU Cores: </span>
                       {typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 'Unknown' : 'Unknown'}</p>
                    <p><span className="text-muted-foreground">Memory: </span>
                       {(navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB` : 'Unknown'}</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
    </Card>
  );
};

export default AdaptivePerformanceMonitor;
