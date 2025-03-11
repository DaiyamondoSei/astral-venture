
import { supabase } from '@/integrations/supabase/client';
import { Result, success, failure } from '../result/Result';
import { PerformanceMetric, DeviceInfo, PerformanceReportPayload } from './types';
import { asyncResultify } from '../result/AsyncResult';

interface MetricsBatch {
  metrics: PerformanceMetric[];
  sessionId: string;
  timestamp: string;
  source: 'web';
  deviceInfo?: DeviceInfo;
}

/**
 * Service for collecting and sending performance metrics to the backend
 */
export const perfMetricsService = {
  /**
   * Send metrics to the backend with improved error handling and type safety
   */
  async sendMetrics(metrics: PerformanceMetric[]): Promise<Result<void, Error>> {
    if (!metrics.length) {
      return success(undefined);
    }
    
    try {
      // Generate session ID if not already set
      const sessionId = localStorage.getItem('metrics_session_id') || 
        `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Store session ID for consistent reporting
      localStorage.setItem('metrics_session_id', sessionId);
      
      // Collect device information for better context
      const deviceInfo = this.collectDeviceInfo();
      
      const batch: MetricsBatch = {
        metrics,
        sessionId,
        timestamp: new Date().toISOString(),
        source: 'web',
        deviceInfo
      };
      
      // Send metrics to Supabase Edge Function
      const { error } = await supabase.functions.invoke('track-performance', {
        body: batch
      });
      
      if (error) {
        console.error('Error sending performance metrics:', error);
        return failure(new Error(`Failed to send metrics: ${error.message}`));
      }
      
      return success(undefined);
    } catch (error) {
      console.error('Unexpected error sending metrics:', error);
      return failure(error instanceof Error ? error : new Error('Failed to send performance metrics'));
    }
  },
  
  /**
   * Track a component render with improved type safety
   */
  async trackComponentRender(
    componentName: string, 
    renderTime: number,
    metadata?: Record<string, any>
  ): Promise<Result<void, Error>> {
    const metric: PerformanceMetric = {
      component_name: componentName,
      metric_name: 'renderTime',
      value: renderTime,
      timestamp: Date.now(),
      category: 'component',
      type: 'render',
      ...(metadata && { metadata })
    };
    
    return this.sendMetrics([metric]);
  },
  
  /**
   * Track a user interaction with improved type safety
   */
  async trackInteraction(
    name: string, 
    duration: number,
    metadata?: Record<string, any>
  ): Promise<Result<void, Error>> {
    const metric: PerformanceMetric = {
      metric_name: name,
      value: duration,
      timestamp: Date.now(),
      category: 'interaction',
      type: 'interaction',
      page_url: window.location.pathname,
      ...(metadata && { metadata })
    };
    
    return this.sendMetrics([metric]);
  },
  
  /**
   * Track a web vital metric with improved type safety
   */
  async trackWebVital(
    name: string, 
    value: number,
    category: string,
    rating?: 'good' | 'needs-improvement' | 'poor'
  ): Promise<Result<void, Error>> {
    const metric: PerformanceMetric = {
      metric_name: name,
      value,
      timestamp: Date.now(),
      category,
      type: 'webVital',
      ...(rating && { rating })
    };
    
    return this.sendMetrics([metric]);
  },

  /**
   * Collect and report all metrics at once
   */
  async reportAllMetrics(
    componentMetrics: Record<string, number[]>,
    webVitals: Record<string, number>,
    interactionMetrics: Record<string, number[]>
  ): Promise<Result<void, Error>> {
    try {
      // Format and combine all metrics
      const allMetrics: PerformanceMetric[] = [];

      // Add component metrics
      Object.entries(componentMetrics).forEach(([componentName, times]) => {
        if (times.length > 0) {
          const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
          allMetrics.push({
            component_name: componentName,
            metric_name: 'averageRenderTime',
            value: avgTime,
            timestamp: Date.now(),
            category: 'component',
            type: 'render',
            metadata: { sampleCount: times.length }
          });
        }
      });

      // Add web vitals
      Object.entries(webVitals).forEach(([name, value]) => {
        allMetrics.push({
          metric_name: name,
          value,
          timestamp: Date.now(),
          category: 'webVital',
          type: 'webVital'
        });
      });

      // Add interaction metrics
      Object.entries(interactionMetrics).forEach(([name, times]) => {
        if (times.length > 0) {
          const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
          allMetrics.push({
            metric_name: name,
            value: avgTime,
            timestamp: Date.now(),
            category: 'interaction',
            type: 'interaction',
            metadata: { sampleCount: times.length }
          });
        }
      });

      return this.sendMetrics(allMetrics);
    } catch (error) {
      console.error('Error reporting all metrics:', error);
      return failure(error instanceof Error ? error : new Error('Failed to report metrics'));
    }
  },

  /**
   * Collect device information for better context
   */
  collectDeviceInfo(): DeviceInfo {
    const deviceInfo: DeviceInfo = {
      userAgent: navigator.userAgent,
      deviceCategory: this.detectDeviceCategory(),
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      devicePixelRatio: window.devicePixelRatio,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };

    // Add connection info if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        deviceInfo.connection = {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        };
      }
    }

    // Add memory info if available
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      if (memory) {
        deviceInfo.memory = {
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          totalJSHeapSize: memory.totalJSHeapSize,
          usedJSHeapSize: memory.usedJSHeapSize
        };
      }
    }

    return deviceInfo;
  },

  /**
   * Detect device category based on user agent and screen size
   */
  detectDeviceCategory(): string {
    const ua = navigator.userAgent;
    
    // Check for mobile devices
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
      return window.screen.width < 768 ? 'mobile' : 'tablet';
    }
    
    // Check for desktop devices
    return 'desktop';
  }
};

/**
 * Create AsyncResult versions of the service methods
 */
export const perfMetricsServiceAsync = {
  sendMetrics: asyncResultify(perfMetricsService.sendMetrics.bind(perfMetricsService)),
  trackComponentRender: asyncResultify(perfMetricsService.trackComponentRender.bind(perfMetricsService)),
  trackInteraction: asyncResultify(perfMetricsService.trackInteraction.bind(perfMetricsService)),
  trackWebVital: asyncResultify(perfMetricsService.trackWebVital.bind(perfMetricsService)),
  reportAllMetrics: asyncResultify(perfMetricsService.reportAllMetrics.bind(perfMetricsService))
};

export default perfMetricsService;
