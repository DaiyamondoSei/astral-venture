
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Settings, X, Activity } from 'lucide-react';
import { usePerfConfig } from '@/hooks/usePerfConfig';

/**
 * Dashboard component for controlling performance monitoring configuration
 */
const PerfConfigDashboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const config = usePerfConfig();

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-2 left-24 z-50">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 p-2 rounded-full hover:bg-blue-700 transition-colors"
        size="sm"
      >
        <Settings size={16} className="text-white" />
      </Button>
      
      {isOpen && (
        <Card className="absolute bottom-12 left-0 w-72 shadow-lg">
          <CardHeader className="p-3 bg-blue-600 text-white flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              Performance Configuration
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-7 w-7 p-0 text-white">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="p-4">
            <ScrollArea className="h-auto max-h-96">
              <div className="space-y-4">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Monitoring Features</h3>
                  
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
                
                <div className="pt-2 space-y-2">
                  <div className="flex flex-col gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => config.setPerformanceConfig({
                        enablePerformanceTracking: true,
                        enableRenderTracking: true,
                        enableValidation: true,
                        enablePropTracking: true
                      })}
                    >
                      Enable All
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => config.setPerformanceConfig({
                        enablePerformanceTracking: false,
                        enableRenderTracking: false,
                        enableValidation: false,
                        enablePropTracking: false
                      })}
                    >
                      Disable All
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => config.setPerformanceConfig({
                        enablePerformanceTracking: true,
                        enableRenderTracking: false,
                        enableValidation: false,
                        enablePropTracking: false,
                        enableDebugLogging: false
                      })}
                    >
                      Minimal Mode
                    </Button>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                    <p>Lower performance impact by disabling features you don't need right now.</p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PerfConfigDashboard;
