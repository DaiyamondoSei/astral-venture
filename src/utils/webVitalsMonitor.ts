
import { onCLS, onFID, onLCP, onFCP, onTTFB, onINP, ReportCallback } from 'web-vitals';
import { supabase } from '@/integrations/supabase/client';

// Define vital categories
export type VitalCategory = 'loading' | 'interaction' | 'visual_stability';

// Store performance marks for custom measurements
const performanceMarks: Record<string, number> = {};

/**
 * Initialize web vitals monitoring
 */
export const initWebVitals = (): void => {
  try {
    if (typeof window !== 'undefined') {
      // Core Web Vitals
      onCLS(sendToAnalytics);
      onFID(sendToAnalytics);
      onLCP(sendToAnalytics);
      
      // Additional Web Vitals
      onFCP(sendToAnalytics);
      onTTFB(sendToAnalytics);
      onINP(sendToAnalytics);
      
      console.log('Web Vitals monitoring initialized');
    }
  } catch (error) {
    console.error('Failed to initialize web vitals:', error);
  }
};

/**
 * Send vital metrics to analytics service
 */
const sendToAnalytics = (metric: any): void => {
  try {
    const { name, value, delta, id } = metric;
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Web Vital: ${name}`, {
        value: Math.round(value),
        delta: Math.round(delta)
      });
    }
    
    // Map vital to category for organization
    let category: VitalCategory = 'loading';
    
    switch (name) {
      case 'CLS':
        category = 'visual_stability';
        break;
      case 'FID':
      case 'INP':
        category = 'interaction';
        break;
      case 'LCP':
      case 'FCP':
      case 'TTFB':
        category = 'loading';
        break;
    }
    
    // Queue for backend reporting (rate-limited)
    queueMetricsReport({
      name,
      value: Math.round(value),
      delta: Math.round(delta),
      category,
      timestamp: Date.now(),
      id
    });
  } catch (error) {
    console.error('Error in sendToAnalytics:', error);
  }
};

// Queue for batched reporting
let metricsQueue: any[] = [];
let reportTimeout: NodeJS.Timeout | null = null;

/**
 * Queue metrics to be reported in batches
 */
const queueMetricsReport = (metric: any): void => {
  metricsQueue.push(metric);
  
  // Debounce reporting to reduce API calls
  if (reportTimeout) {
    clearTimeout(reportTimeout);
  }
  
  reportTimeout = setTimeout(() => {
    if (metricsQueue.length > 0) {
      reportMetricsBatch();
    }
  }, 5000); // Report every 5 seconds if there are metrics
};

/**
 * Report metrics batch to the backend
 */
const reportMetricsBatch = async (): Promise<void> => {
  try {
    const metrics = [...metricsQueue];
    metricsQueue = [];
    
    // Only report if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // Report to Supabase function
    const { error } = await supabase.functions.invoke('track-performance', {
      body: { metrics, type: 'web_vitals' }
    });
    
    if (error) {
      console.error('Failed to report metrics:', error);
    }
  } catch (error) {
    console.error('Error in reportMetricsBatch:', error);
  }
};

/**
 * Create a performance mark for custom timing
 */
export const markStart = (label: string): void => {
  try {
    performanceMarks[`${label}_start`] = performance.now();
  } catch (error) {
    console.error('Error in markStart:', error);
  }
};

/**
 * End a performance mark and get the duration
 */
export const markEnd = (label: string): number => {
  try {
    const endTime = performance.now();
    const startTime = performanceMarks[`${label}_start`] || endTime;
    const duration = endTime - startTime;
    
    // Clean up the mark
    delete performanceMarks[`${label}_start`];
    
    // Report if it's a significant operation (> 100ms)
    if (duration > 100) {
      queueMetricsReport({
        name: `custom_${label}`,
        value: Math.round(duration),
        category: 'interaction',
        timestamp: Date.now()
      });
    }
    
    return duration;
  } catch (error) {
    console.error('Error in markEnd:', error);
    return 0;
  }
};

/**
 * Track component render time
 */
export const trackComponentRender = (
  componentName: string, 
  renderTime: number
): void => {
  try {
    queueMetricsReport({
      name: `render_${componentName}`,
      value: Math.round(renderTime),
      category: 'interaction',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error in trackComponentRender:', error);
  }
};

/**
 * Track a web vital manually
 */
export const trackWebVital = (
  name: string,
  value: number,
  category: VitalCategory = 'interaction'
): void => {
  try {
    queueMetricsReport({
      name,
      value: Math.round(value),
      category,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error in trackWebVital:', error);
  }
};

/**
 * Force report all queued metrics
 */
export const reportMetricsToServer = async (): Promise<void> => {
  if (metricsQueue.length > 0) {
    if (reportTimeout) {
      clearTimeout(reportTimeout);
      reportTimeout = null;
    }
    await reportMetricsBatch();
  }
};
