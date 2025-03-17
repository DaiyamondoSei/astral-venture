
import React, { useState, useEffect } from 'react';
import { usePerformanceAdapter } from '../hooks/usePerformanceAdapter';

interface AdaptiveRendererProps {
  children: React.ReactNode;
  lowPerformanceComponent?: React.ReactNode;
  threshold?: 'low' | 'medium';
}

/**
 * Component that conditionally renders content based on device performance capability
 */
export const AdaptiveRenderer: React.FC<AdaptiveRendererProps> = ({
  children,
  lowPerformanceComponent,
  threshold = 'low'
}) => {
  const { getDeviceCapability } = usePerformanceAdapter();
  const [shouldRenderFullVersion, setShouldRenderFullVersion] = useState(true);
  
  // Determine which version to render based on device capability
  useEffect(() => {
    const capability = getDeviceCapability();
    const shouldRenderFull = threshold === 'low' 
      ? capability !== 'low'
      : capability === 'high';
    
    setShouldRenderFullVersion(shouldRenderFull);
  }, [getDeviceCapability, threshold]);
  
  // Render appropriate version
  return (
    <>
      {shouldRenderFullVersion ? (
        children
      ) : (
        lowPerformanceComponent || children
      )}
    </>
  );
};
