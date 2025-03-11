
import { supabase } from '@/integrations/supabase/client';
import { Result, success, failure } from '../result/Result';
import { PerformanceMetric } from './types';

interface MetricsBatch {
  metrics: PerformanceMetric[];
  sessionId: string;
  timestamp: string;
  source: 'web';
}

/**
 * Service for sending performance metrics to the backend
 */
export const perfMetricsService = {
  /**
   * Send metrics to the backend
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
      
      const batch: MetricsBatch = {
        metrics,
        sessionId,
        timestamp: new Date().toISOString(),
        source: 'web'
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
      return failure(new Error('Failed to send performance metrics'));
    }
  },
  
  /**
   * Track a component render
   */
  async trackComponentRender(
    componentName: string, 
    renderTime: number
  ): Promise<Result<void, Error>> {
    const metric: PerformanceMetric = {
      component_name: componentName,
      metricName: 'renderTime',
      metric_name: 'renderTime',
      value: renderTime,
      timestamp: Date.now(),
      category: 'component',
      type: 'render'
    };
    
    return this.sendMetrics([metric]);
  },
  
  /**
   * Track a user interaction
   */
  async trackInteraction(
    name: string, 
    duration: number,
    metadata?: Record<string, any>
  ): Promise<Result<void, Error>> {
    const metric: PerformanceMetric = {
      metricName: name,
      metric_name: name,
      value: duration,
      timestamp: Date.now(),
      category: 'interaction',
      type: 'interaction',
      page_url: window.location.pathname,
      ...metadata && { metadata }
    };
    
    return this.sendMetrics([metric]);
  },
  
  /**
   * Track a web vital metric
   */
  async trackWebVital(
    name: string, 
    value: number,
    category: string
  ): Promise<Result<void, Error>> {
    const metric: PerformanceMetric = {
      metricName: name,
      metric_name: name,
      value,
      timestamp: Date.now(),
      category,
      type: 'webVital'
    };
    
    return this.sendMetrics([metric]);
  }
};

export default perfMetricsService;
