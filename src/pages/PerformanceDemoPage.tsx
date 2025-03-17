
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AdaptiveRenderer, PerformanceDisplay, CustomPerformanceAdapter } from '@/features/performance';
import { usePerformanceAdapter } from '@/features/performance/hooks';

/**
 * Performance demonstration page that showcases how to use the performance features
 */
const PerformanceDemoPage: React.FC = () => {
  const { 
    toggleFeature, 
    performanceConfig,
    isLowPerformanceDevice
  } = usePerformanceAdapter();
  
  const [particleCount, setParticleCount] = useState(30);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Toggle animation state
  const toggleAnimation = () => {
    setIsAnimating((prev) => !prev);
  };
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Performance Adaptation Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CustomPerformanceAdapter componentName="PerformanceDemoPage">
          <Card>
            <CardHeader>
              <CardTitle>Animation Example</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center h-64">
              <AdaptiveRenderer
                lowPerformanceComponent={
                  <div className="bg-secondary p-4 rounded-md text-center">
                    Simple static content for low-performance devices
                  </div>
                }
              >
                <motion.div
                  className="w-32 h-32 bg-primary rounded-2xl"
                  animate={isAnimating ? {
                    scale: [1, 1.5, 1],
                    rotate: [0, 180, 0],
                    borderRadius: ["20%", "50%", "20%"]
                  } : {}}
                  transition={{
                    duration: 2,
                    ease: "easeInOut",
                    repeat: isAnimating ? Infinity : 0
                  }}
                />
              </AdaptiveRenderer>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button onClick={toggleAnimation}>
                {isAnimating ? 'Stop Animation' : 'Start Animation'}
              </Button>
              <span className="text-sm text-muted-foreground">
                Animation optimized for {isLowPerformanceDevice ? 'low' : 'high'} performance
              </span>
            </CardFooter>
          </Card>
        </CustomPerformanceAdapter>
        
        <PerformanceDisplay showControls />
        
        <Card>
          <CardHeader>
            <CardTitle>Performance Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="animations-toggle">Disable Animations</Label>
              <Switch
                id="animations-toggle"
                checked={performanceConfig.disableAnimations}
                onCheckedChange={(checked) => toggleFeature('disableAnimations', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="effects-toggle">Disable Effects</Label>
              <Switch
                id="effects-toggle"
                checked={performanceConfig.disableEffects}
                onCheckedChange={(checked) => toggleFeature('disableEffects', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="manual-capability">Use Manual Capability</Label>
              <Switch
                id="manual-capability"
                checked={performanceConfig.useManualCapability}
                onCheckedChange={(checked) => toggleFeature('useManualCapability', checked)}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              This component is wrapped with CustomPerformanceAdapter to track render performance.
              Check the console for performance metrics.
            </p>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Sampling Rate:</span>
                <span>{(performanceConfig.samplingRate * 100).toFixed(0)}%</span>
              </div>
              
              <div className="flex justify-between">
                <span>Throttle Interval:</span>
                <span>{performanceConfig.throttleInterval}ms</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PerformanceDemoPage;
