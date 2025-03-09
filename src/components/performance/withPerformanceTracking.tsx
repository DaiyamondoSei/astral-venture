
import React, { useRef } from 'react';
import { usePerfMetricsReporter } from '@/hooks/usePerfMetricsReporter';
import { usePerfConfig } from '@/hooks/usePerfConfig';

// HOC for tracking component render performance
export const withPerformanceTracking = <P extends object>(
  Component: React.ComponentType<P>,
  options: { 
    trackName?: string;
    skipTracking?: boolean; 
  } = {}
) => {
  const WrappedComponent = (props: P) => {
    const { config } = usePerfConfig();
    const { recordRender } = usePerfMetricsReporter();
    
    // Skip tracking if disabled in config or options
    if (!config.enableVirtualization || options.skipTracking) {
      return <Component {...props} />;
    }
    
    // Component name for tracking
    const componentName = options.trackName || 
      Component.displayName || 
      Component.name || 
      'UnknownComponent';
    
    // Refs for tracking render time
    const renderStartTime = useRef(0);
    
    // Record start time before render
    renderStartTime.current = performance.now();
    
    // Use React.useEffect for after-render timing
    React.useEffect(() => {
      const renderTime = performance.now() - renderStartTime.current;
      recordRender(componentName, renderTime);
    });
    
    return <Component {...props} />;
  };
  
  // Set appropriate display name
  WrappedComponent.displayName = `WithPerf(${
    Component.displayName || Component.name || 'Component'
  })`;
  
  return WrappedComponent;
};

export default withPerformanceTracking;
