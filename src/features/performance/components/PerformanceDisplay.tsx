
import React from 'react';
import { usePerformanceAdapter } from '../hooks/usePerformanceAdapter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PerformanceDisplayProps {
  showControls?: boolean;
  className?: string;
}

/**
 * Component that displays current performance information and settings
 */
export const PerformanceDisplay: React.FC<PerformanceDisplayProps> = ({
  showControls = false,
  className = ''
}) => {
  const { 
    getDeviceCapability, 
    isLowPerformanceDevice,
    getQualityLevel,
    performanceConfig
  } = usePerformanceAdapter();
  
  const deviceCapability = getDeviceCapability();
  const qualityLevel = getQualityLevel();
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          Performance Settings
          <Badge 
            variant={isLowPerformanceDevice ? "destructive" : "default"}
            className="ml-2"
          >
            {deviceCapability}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span>Quality Level:</span>
            <Badge variant={qualityLevel === 'low' ? "secondary" : "default"}>
              {qualityLevel}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span>Animations:</span>
            <Badge variant={performanceConfig.disableAnimations ? "secondary" : "default"}>
              {performanceConfig.disableAnimations ? 'Disabled' : 'Enabled'}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span>Effects:</span>
            <Badge variant={performanceConfig.disableEffects ? "secondary" : "default"}>
              {performanceConfig.disableEffects ? 'Disabled' : 'Enabled'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
