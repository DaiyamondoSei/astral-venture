
/**
 * Performance Monitor Component
 * 
 * Displays performance metrics for components in development mode
 */
import React, { useEffect, useState, useRef } from 'react';
import { usePerformance } from '../../contexts/PerformanceContext';
import { performanceMonitor } from '../../utils/performance/performanceMonitor';
import { ComponentMetrics } from '../../utils/performance/types';

interface PerformanceMonitorProps {
  showOnlySlowComponents?: boolean;
  slowThreshold?: number;
  position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left';
  maxItems?: number;
}

/**
 * Performance Monitor component for debugging
 */
const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  showOnlySlowComponents = true,
  slowThreshold = 16, // 60fps threshold
  position = 'bottom-right',
  maxItems = 10
}) => {
  const [metrics, setMetrics] = useState<Record<string, ComponentMetrics>>({});
  const [isExpanded, setIsExpanded] = useState(false);
  const { config } = usePerformance();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }
  
  useEffect(() => {
    // Subscribe to metrics updates
    const unsubscribe = performanceMonitor.subscribe((metricsMap) => {
      // Convert Map to Record
      const metricsRecord: Record<string, ComponentMetrics> = {};
      metricsMap.forEach((value, key) => {
        metricsRecord[key] = value;
      });
      setMetrics(metricsRecord);
    });
    
    // Set up interval to refresh metrics
    intervalRef.current = setInterval(() => {
      setMetrics(performanceMonitor.getAllMetrics());
    }, 2000);
    
    return () => {
      unsubscribe();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  // Get position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-2 right-2';
      case 'bottom-left':
        return 'bottom-2 left-2';
      case 'top-left':
        return 'top-2 left-2';
      case 'bottom-right':
      default:
        return 'bottom-2 right-2';
    }
  };
  
  // Filter and sort metrics
  const filteredMetrics = Object.values(metrics)
    .filter(metric => !showOnlySlowComponents || (metric.averageRenderTime > slowThreshold))
    .sort((a, b) => b.averageRenderTime - a.averageRenderTime)
    .slice(0, maxItems);
  
  // No metrics to show
  if (filteredMetrics.length === 0) {
    return null;
  }
  
  return (
    <div 
      className={`fixed ${getPositionClasses()} z-50 text-xs bg-black/80 text-white p-2 rounded-md shadow-lg max-w-xs transition-all duration-300 backdrop-blur-sm border border-gray-700`}
      style={{ width: isExpanded ? '320px' : 'auto' }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold">Performance Monitor</h3>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-white"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
      
      {isExpanded ? (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {filteredMetrics.map((metric) => (
            <div key={metric.componentName} className="border-t border-gray-700 pt-1">
              <div className="flex justify-between items-center">
                <div className="truncate" title={metric.componentName}>
                  {metric.componentName}
                </div>
                <div className={`font-mono ${getColorClass(metric.averageRenderTime, slowThreshold)}`}>
                  {metric.averageRenderTime.toFixed(2)}ms
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-1 mt-1 text-gray-400 text-[0.65rem]">
                <div>
                  <span className="mr-1">Count:</span>
                  <span className="font-mono">{metric.renderCount}</span>
                </div>
                <div>
                  <span className="mr-1">Slow:</span>
                  <span className="font-mono">{metric.slowRenderCount || 0}</span>
                </div>
                <div>
                  <span className="mr-1">Max:</span>
                  <span className="font-mono">{metric.maxRenderTime?.toFixed(1) || 0}ms</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono">{filteredMetrics.length}</span>
            <span>{filteredMetrics.length === 1 ? 'component' : 'components'} monitored</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get the color class based on render time
function getColorClass(time: number, threshold: number): string {
  if (time > threshold * 2) return 'text-red-400';
  if (time > threshold) return 'text-yellow-400';
  return 'text-green-400';
}

export default PerformanceMonitor;
