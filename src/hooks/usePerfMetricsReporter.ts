
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePerfConfig } from './usePerfConfig';
import { v4 as uuidv4 } from 'uuid';

interface ComponentMetric {
  componentName: string;
  averageRenderTime: number;
  renderCount: number;
  slowRenders: number;
}

export const usePerfMetricsReporter = () => {
  const { config } = usePerfConfig();
  const [sessionId] = useState(() => uuidv4());
  const [metrics, setMetrics] = useState<Record<string, ComponentMetric>>({});
  const [lastReportTime, setLastReportTime] = useState(0);
  const [isReporting, setIsReporting] = useState(false);
  
  // Device info for context
  const deviceInfo = {
    userAgent: navigator.userAgent,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height
  };
  
  // Record a render for a component
  const recordRender = useCallback((
    componentName: string, 
    renderTime: number
  ) => {
    setMetrics(prev => {
      const existing = prev[componentName] || {
        componentName,
        renderCount: 0,
        averageRenderTime: 0,
        slowRenders: 0
      };
      
      const newRenderCount = existing.renderCount + 1;
      // Calculate the new average using weighted approach
      const newAverage = 
        (existing.averageRenderTime * existing.renderCount + renderTime) / newRenderCount;
      
      return {
        ...prev,
        [componentName]: {
          componentName,
          renderCount: newRenderCount,
          averageRenderTime: newAverage,
          slowRenders: existing.slowRenders + (renderTime > 16.67 ? 1 : 0) // Slower than 60fps
        }
      };
    });
  }, []);
  
  // Reset metrics 
  const resetMetrics = useCallback(() => {
    setMetrics({});
  }, []);
  
  // Report metrics to backend
  const reportMetrics = useCallback(async () => {
    const metricsArray = Object.values(metrics);
    
    if (metricsArray.length === 0) return;
    
    setIsReporting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('track-performance', {
        method: 'POST',
        body: {
          metrics: metricsArray,
          sessionId,
          deviceInfo
        }
      });
      
      if (error) {
        console.error('Error reporting performance metrics:', error);
      } else {
        console.log(`Successfully reported ${metricsArray.length} metrics`, data);
        setLastReportTime(Date.now());
        resetMetrics();
      }
    } catch (err) {
      console.error('Exception reporting performance metrics:', err);
    } finally {
      setIsReporting(false);
    }
  }, [metrics, sessionId, resetMetrics]);
  
  // Periodically report metrics in background
  useEffect(() => {
    // Skip if we should not track performance
    if (!config.enableVirtualization) return;
    
    const now = Date.now();
    const timeSinceLastReport = now - lastReportTime;
    
    // Report metrics after user has been active for a while
    if (timeSinceLastReport > 5 * 60 * 1000 && Object.keys(metrics).length > 0) {
      reportMetrics();
    }
    
    // Schedule periodic reporting
    const intervalId = setInterval(() => {
      if (Object.keys(metrics).length > 0) {
        reportMetrics();
      }
    }, 10 * 60 * 1000); // Report every 10 minutes if we have metrics
    
    return () => {
      clearInterval(intervalId);
    };
  }, [metrics, lastReportTime, reportMetrics, config.enableVirtualization]);
  
  // Report metrics before the user leaves the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (Object.keys(metrics).length > 0) {
        // Use a synchronous approach for beforeunload
        const metricsArray = Object.values(metrics);
        
        navigator.sendBeacon(
          `${supabase.supabaseUrl}/functions/v1/track-performance`,
          JSON.stringify({
            metrics: metricsArray,
            sessionId,
            deviceInfo
          })
        );
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [metrics, sessionId]);
  
  return {
    recordRender,
    reportMetrics,
    resetMetrics,
    metrics: Object.values(metrics),
    isReporting
  };
};

export default usePerfMetricsReporter;
