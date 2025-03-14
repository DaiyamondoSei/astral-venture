
import React, { useEffect, useRef, useCallback } from 'react';
import { usePerformance } from '@/contexts/PerformanceContext';
import { getPerformanceCategory, DeviceCapability } from '@/utils/performanceUtils';
import { Card } from '@/components/ui/card';

export interface PerformanceMonitorProps {
  children: React.ReactNode;
  enableMetrics?: boolean;
  componentName?: string;
  measuredOperation?: string;
}

/**
 * PerformanceMonitor: A component that tracks and reports application performance metrics
 * 
 * This component wraps its children and monitors their render performance, 
 * reporting metrics to the performance context.
 */
export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  children,
  enableMetrics = true,
  componentName,
  measuredOperation = 'render'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderStartRef = useRef<number>(0);
  const { deviceCapability, trackMetric } = usePerformance();
  
  // Track component render time
  useEffect(() => {
    if (!enableMetrics || !componentName) return;
    
    // Mark render end and calculate duration
    const renderEnd = performance.now();
    const renderDuration = renderEnd - renderStartRef.current;
    
    // Only track if the component name is provided and the duration is valid
    if (componentName && renderDuration > 0) {
      trackMetric(componentName, `${measuredOperation}Time`, renderDuration);
    }
  }, [enableMetrics, componentName, trackMetric, measuredOperation]);
  
  // Create performance observer for more detailed metrics
  useEffect(() => {
    if (!enableMetrics || !componentName || !containerRef.current) return;
    
    // Create performance observer
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (componentName) {
          trackMetric(componentName, entry.name, entry.duration);
        }
      });
    });
    
    // Start observing
    observer.observe({ entryTypes: ['measure'] });
    
    // Cleanup
    return () => observer.disconnect();
  }, [enableMetrics, componentName, trackMetric]);
  
  // Measure interactions with the component
  const measureInteraction = useCallback((interactionName: string) => {
    if (!enableMetrics || !componentName) return;
    
    const startMark = `${componentName}-${interactionName}-start`;
    const endMark = `${componentName}-${interactionName}-end`;
    
    performance.mark(startMark);
    
    return () => {
      performance.mark(endMark);
      performance.measure(
        `${componentName}-${interactionName}`,
        startMark,
        endMark
      );
    };
  }, [enableMetrics, componentName]);
  
  // Set render start time
  renderStartRef.current = performance.now();
  
  return (
    <Card 
      ref={containerRef}
      className={`performance-${getPerformanceCategory(deviceCapability)}`}
      data-component-name={componentName}
      data-performance-monitor="true"
    >
      {children}
    </Card>
  );
};

export default PerformanceMonitor;
