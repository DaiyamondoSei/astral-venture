
import React, { useState, useEffect, useRef } from 'react';
import { performanceMonitor } from '@/utils/performance/performanceMonitor';
import { usePerformance } from '@/contexts/PerformanceContext';
import { usePerformanceTracking } from '@/hooks/usePerformanceTracking';

interface PerformanceMonitorProps {
  componentName: string;
  showMetrics?: boolean;
  interval?: number;
  warnThreshold?: number;
  errorThreshold?: number;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  componentName,
  showMetrics = true,
  interval = 2000,
  warnThreshold = 16,
  errorThreshold = 30
}) => {
  const { config } = usePerformance();
  const [isExpanded, setIsExpanded] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [renderCount, setRenderCount] = useState(0);
  const { startTiming, endTiming, getPerformanceData } = usePerformanceTracking({
    componentName: `PerformanceMonitor_${componentName}`,
    trackMountTime: true,
    trackUpdateTime: true,
    enableLogging: config.debugMode
  });
  
  // Start timing when component renders
  startTiming();
  
  // Increment render count
  useEffect(() => {
    setRenderCount(prev => prev + 1);
  }, []);
  
  // End timing after render
  useEffect(() => {
    endTiming();
  });
  
  // Update metrics at interval
  useEffect(() => {
    if (!config.enablePerformanceTracking || !showMetrics) return;
    
    const updateMetrics = () => {
      const componentMetrics = performanceMonitor.getComponentMetrics(componentName);
      setMetrics(componentMetrics);
    };
    
    // Initial update
    updateMetrics();
    
    // Set interval for updates
    const intervalId = setInterval(updateMetrics, interval);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [componentName, interval, config.enablePerformanceTracking, showMetrics]);
  
  // Don't render anything if tracking is disabled
  if (!config.enablePerformanceTracking || !showMetrics) {
    return null;
  }
  
  // Get color based on render time
  const getColorForValue = (value: number) => {
    if (value > errorThreshold) return 'text-red-500';
    if (value > warnThreshold) return 'text-amber-500';
    return 'text-green-500';
  };
  
  // Sort metrics from worst to best performance
  const sortMetrics = (a: unknown, b: unknown) => {
    if (!a || !b) return 0;
    // @ts-ignore
    return b.averageRenderTime - a.averageRenderTime;
  };
  
  return (
    <div className="fixed bottom-0 right-0 z-50 mb-4 mr-4 bg-white/80 backdrop-blur p-2 rounded-md shadow-md border border-slate-200 text-xs font-mono">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-slate-700" onClick={() => setIsExpanded(!isExpanded)}>
          {componentName} Monitor {isExpanded ? '▲' : '▼'}
        </h3>
        <div className="ml-2 flex space-x-1">
          <span className="px-1 rounded bg-slate-100">
            Render #{renderCount}
          </span>
        </div>
      </div>
      
      {isExpanded && metrics && (
        <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
          <div className="grid grid-cols-2 gap-x-4">
            <span className="text-slate-500">Render count:</span>
            <span className="font-medium">{metrics.renderCount || 0}</span>
            
            <span className="text-slate-500">Avg render time:</span>
            <span className={getColorForValue(metrics.averageRenderTime)}>
              {metrics.averageRenderTime ? metrics.averageRenderTime.toFixed(2) : '0.00'}ms
            </span>
            
            <span className="text-slate-500">Last render:</span>
            <span className={getColorForValue(metrics.lastRenderTime)}>
              {metrics.lastRenderTime ? metrics.lastRenderTime.toFixed(2) : '0.00'}ms
            </span>
            
            {metrics.mountTime && (
              <>
                <span className="text-slate-500">Mount time:</span>
                <span className={getColorForValue(metrics.mountTime)}>
                  {metrics.mountTime.toFixed(2)}ms
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;
