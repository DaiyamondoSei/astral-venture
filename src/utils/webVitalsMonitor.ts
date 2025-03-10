
import { ReportHandler } from 'web-vitals';

// Web Vitals configuration type
interface WebVitalsConfig {
  reportAllChanges?: boolean;
  reportToAnalytics?: boolean;
  debug?: boolean;
}

// Default configuration
const defaultConfig: WebVitalsConfig = {
  reportAllChanges: false,
  reportToAnalytics: true,
  debug: false
};

// Global configuration that can be updated
let currentConfig: WebVitalsConfig = { ...defaultConfig };

/**
 * Initialize web vitals monitoring with configuration
 */
export const initWebVitals = (config?: WebVitalsConfig): void => {
  currentConfig = { ...defaultConfig, ...config };
  
  if (currentConfig.debug) {
    console.log('Web Vitals initialized with config:', currentConfig);
  }
  
  // Only import and run in browser environment
  if (typeof window !== 'undefined') {
    import('web-vitals').then(({ onCLS, onFID, onLCP, onTTFB, onFCP }) => {
      onCLS(createReportCallback('CLS'), { reportAllChanges: currentConfig.reportAllChanges });
      onFID(createReportCallback('FID'), { reportAllChanges: currentConfig.reportAllChanges });
      onLCP(createReportCallback('LCP'), { reportAllChanges: currentConfig.reportAllChanges });
      onTTFB(createReportCallback('TTFB'), { reportAllChanges: currentConfig.reportAllChanges });
      onFCP(createReportCallback('FCP'), { reportAllChanges: currentConfig.reportAllChanges });
    });
  }
};

/**
 * Update web vitals configuration
 */
export const updateWebVitalsConfig = (config: Partial<WebVitalsConfig>): void => {
  currentConfig = { ...currentConfig, ...config };
  
  if (currentConfig.debug) {
    console.log('Web Vitals configuration updated:', currentConfig);
  }
};

/**
 * Create a callback for the web-vitals library
 */
const createReportCallback = (metricName: string): ReportHandler => {
  return (metric) => {
    if (currentConfig.debug) {
      console.log(`Web Vitals - ${metricName}:`, metric);
    }
    
    // Add to metrics queue for batched reporting
    addToMetricsQueue({
      name: metric.name,
      value: metric.value,
      category: getMetricCategory(metric.name),
      timestamp: Date.now()
    });
    
    // Report to analytics if enabled
    if (currentConfig.reportToAnalytics) {
      reportToAnalytics(metric);
    }
  };
};

// Queue to batch metrics for reporting
const metricsQueue: Array<{
  name: string;
  value: number;
  category: 'loading' | 'interaction' | 'visual_stability';
  timestamp: number;
}> = [];

/**
 * Add a metric to the reporting queue
 */
export const addToMetricsQueue = (metric: {
  name: string;
  value: number;
  category: 'loading' | 'interaction' | 'visual_stability';
  timestamp: number;
}): void => {
  metricsQueue.push(metric);
  
  // If we have enough metrics or enough time has passed, report them
  if (metricsQueue.length >= 5) {
    flushMetricsQueue();
  }
};

/**
 * Report all queued metrics
 */
export const flushMetricsQueue = async (): Promise<void> => {
  if (metricsQueue.length === 0) return;
  
  const metricsToReport = [...metricsQueue];
  metricsQueue.length = 0; // Clear the queue
  
  try {
    // In a real implementation, this would send to your analytics endpoint
    if (currentConfig.debug) {
      console.log('Reporting batch of metrics:', metricsToReport);
    }
    
    // Example of sending to an edge function
    // await fetch('/api/track-performance', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     sessionId: getSessionId(),
    //     deviceInfo: getDeviceInfo(),
    //     appVersion: getAppVersion(),
    //     webVitals: metricsToReport,
    //     timestamp: Date.now()
    //   })
    // });
  } catch (error) {
    console.error('Failed to report metrics:', error);
    // Re-add to queue for retry
    metricsQueue.push(...metricsToReport);
  }
};

/**
 * Report a web vital metric to analytics
 */
const reportToAnalytics = (metric: { name: string; value: number }): void => {
  // Example implementation - replace with your actual analytics
  if (typeof window !== 'undefined' && 'gtag' in window) {
    const gtag = (window as any).gtag;
    gtag('event', 'web_vitals', {
      event_category: 'Web Vitals',
      event_label: metric.name,
      value: Math.round(metric.value),
      non_interaction: true,
    });
  }
};

/**
 * Get a category for a web vital metric
 */
const getMetricCategory = (metricName: string): 'loading' | 'interaction' | 'visual_stability' => {
  switch (metricName) {
    case 'CLS':
      return 'visual_stability';
    case 'FID':
      return 'interaction';
    default:
      return 'loading';
  }
};

/**
 * Get a unique session ID
 */
const getSessionId = (): string => {
  if (typeof window === 'undefined') return 'server';
  
  // Try to get existing session ID
  let sessionId = sessionStorage.getItem('performance_session_id');
  
  // If no session ID, create one
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem('performance_session_id', sessionId);
  }
  
  return sessionId;
};

/**
 * Get information about the user's device
 */
const getDeviceInfo = () => {
  if (typeof window === 'undefined') {
    return { userAgent: 'server', deviceCategory: 'server' };
  }
  
  return {
    userAgent: navigator.userAgent,
    deviceCategory: getDeviceCategory(),
    deviceMemory: navigator.deviceMemory || 'unknown',
    hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
    connectionType: getConnectionType(),
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    screenSize: {
      width: window.screen.width,
      height: window.screen.height
    },
    pixelRatio: window.devicePixelRatio
  };
};

/**
 * Get the device category based on screen size
 */
const getDeviceCategory = (): string => {
  if (typeof window === 'undefined') return 'unknown';
  
  const width = window.innerWidth;
  
  if (width < 576) return 'mobile';
  if (width < 992) return 'tablet';
  return 'desktop';
};

/**
 * Get the connection type if available
 */
const getConnectionType = (): string => {
  if (typeof navigator === 'undefined') return 'unknown';
  if (!('connection' in navigator)) return 'unknown';
  
  const conn = (navigator as any).connection;
  if (!conn) return 'unknown';
  
  return conn.effectiveType || 'unknown';
};

/**
 * Get the application version
 */
const getAppVersion = (): string => {
  // Replace with your version tracking mechanism
  return '1.0.0';
};

// Set up an interval to flush metrics periodically
if (typeof window !== 'undefined') {
  setInterval(flushMetricsQueue, 30000); // Every 30 seconds
  
  // Also flush when page is being unloaded
  window.addEventListener('beforeunload', () => {
    flushMetricsQueue();
  });
}
