
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePerfConfig } from './usePerfConfig';

interface PerformanceMetric {
  componentName: string;
  renderTime: number;
  renderCount: number;
  timestamp: number;
  type: 'render' | 'load' | 'interaction';
}

interface WebVital {
  name: string;
  value: number;
  category: 'loading' | 'interaction' | 'visual_stability';
}

interface PerformanceReport {
  metrics: PerformanceMetric[];
  webVitals: WebVital[];
  deviceInfo: {
    deviceCategory: string;
    viewport: {
      width: number;
      height: number;
    };
    devicePixelRatio: number;
    userAgent: string;
    deviceMemory?: number;
    connection?: {
      effectiveType: string;
      downlink: number;
      rtt: number;
    };
  };
  appVersion: string;
  sessionId: string;
}

/**
 * Hook to collect and report performance metrics to the backend
 */
export function usePerfMetricsReporter() {
  const { config } = usePerfConfig();
  const metricsBuffer = useRef<PerformanceMetric[]>([]);
  const webVitalsBuffer = useRef<WebVital[]>([]);
  const sessionId = useRef<string>('');
  const reportingTimer = useRef<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize the session ID
  useEffect(() => {
    if (!sessionId.current) {
      sessionId.current = generateSessionId();
    }
    setIsInitialized(true);
    
    return () => {
      // Send any remaining metrics on unmount
      if (metricsBuffer.current.length > 0 || webVitalsBuffer.current.length > 0) {
        reportMetrics();
      }
    };
  }, []);

  // Track web vitals
  useEffect(() => {
    if (!config.enablePerformanceTracking || !isInitialized) return;
    
    // Simplified web vitals tracking
    const trackWebVitals = () => {
      try {
        if (typeof window !== 'undefined' && 'performance' in window) {
          // Get basic navigation timing
          const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (navTiming) {
            addWebVital('ttfb', navTiming.responseStart - navTiming.requestStart, 'loading');
            addWebVital('dom-load', navTiming.domContentLoadedEventEnd - navTiming.fetchStart, 'loading');
            addWebVital('full-load', navTiming.loadEventEnd - navTiming.fetchStart, 'loading');
          }
          
          // Get first paint metrics
          const paintEntries = performance.getEntriesByType('paint');
          for (const entry of paintEntries) {
            const paintEntry = entry as PerformanceEntry;
            addWebVital(
              paintEntry.name, 
              paintEntry.startTime, 
              'visual_stability'
            );
          }
        }
      } catch (error) {
        console.error('Error tracking web vitals:', error);
      }
    };
    
    // Track initially and on load
    window.addEventListener('load', trackWebVitals);
    setTimeout(trackWebVitals, 3000); // Initial delayed check
    
    // Set up periodic reporting
    reportingTimer.current = window.setInterval(reportMetrics, 30000); // Report every 30 seconds
    
    return () => {
      window.removeEventListener('load', trackWebVitals);
      if (reportingTimer.current) {
        window.clearInterval(reportingTimer.current);
      }
    };
  }, [config.enablePerformanceTracking, isInitialized]);

  // Generate a unique session ID
  const generateSessionId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  // Add a component render metric
  const addComponentMetric = (
    componentName: string, 
    renderTime: number, 
    type: 'render' | 'load' | 'interaction' = 'render'
  ) => {
    if (!config.enablePerformanceTracking || !isInitialized) return;
    
    metricsBuffer.current.push({
      componentName,
      renderTime,
      renderCount: 1,
      timestamp: Date.now(),
      type
    });
    
    // Report if buffer gets large
    if (metricsBuffer.current.length >= 20) {
      reportMetrics();
    }
  };

  // Add a web vital
  const addWebVital = (
    name: string, 
    value: number, 
    category: 'loading' | 'interaction' | 'visual_stability'
  ) => {
    if (!config.enablePerformanceTracking || !isInitialized) return;
    
    webVitalsBuffer.current.push({
      name,
      value,
      category
    });
  };

  // Report metrics to the backend
  const reportMetrics = async () => {
    if (
      (!metricsBuffer.current.length && !webVitalsBuffer.current.length) || 
      !isInitialized
    ) return;
    
    try {
      // Build the report
      const report: PerformanceReport = {
        metrics: [...metricsBuffer.current],
        webVitals: [...webVitalsBuffer.current],
        deviceInfo: getDeviceInfo(),
        appVersion: '1.0.0', // Replace with actual version
        sessionId: sessionId.current
      };
      
      // Call the edge function
      await supabase.functions.invoke('track-performance', {
        body: report
      });
      
      // Clear the buffers after successful report
      metricsBuffer.current = [];
      webVitalsBuffer.current = [];
    } catch (error) {
      console.error('Failed to report performance metrics:', error);
    }
  };

  // Get device information
  const getDeviceInfo = () => {
    const info = {
      deviceCategory: config.deviceCapability,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      devicePixelRatio: window.devicePixelRatio || 1,
      userAgent: navigator.userAgent,
      deviceMemory: (navigator as any).deviceMemory,
      connection: null as any
    };
    
    // Add connection info if available
    const conn = (navigator as any).connection;
    if (conn) {
      info.connection = {
        effectiveType: conn.effectiveType,
        downlink: conn.downlink,
        rtt: conn.rtt
      };
    }
    
    return info;
  };

  return {
    addComponentMetric,
    addWebVital,
    reportNow: reportMetrics
  };
}

export default usePerfMetricsReporter;
