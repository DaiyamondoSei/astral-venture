
import React, { useEffect, useRef } from 'react';
import { usePerformance } from '@/contexts/PerformanceContext';
import { getPerformanceCategory } from '@/utils/performanceUtils';
import { Card } from '@/components/ui/card';

export interface PerformanceMonitorProps {
  children: React.ReactNode;
  enableMetrics?: boolean;
  componentName?: string;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  children,
  enableMetrics = true,
  componentName
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { deviceCapability, trackMetric } = usePerformance();

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

  return (
    <Card 
      ref={containerRef}
      className={`performance-${getPerformanceCategory(deviceCapability)}`}
    >
      {children}
    </Card>
  );
};

export default PerformanceMonitor;
