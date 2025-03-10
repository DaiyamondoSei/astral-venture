
/**
 * Web Vitals Monitor
 * 
 * Collects core web vitals and reports them to the performance tracking system.
 */

import { onCLS, onFCP, onFID, onINP, onLCP, onTTFB } from 'web-vitals';
import { invokeEdgeFunction } from '@/utils/edgeFunctionHelper';
import type { WebVitalMetric, PerformanceMetric, WebVitalCategory } from '@/utils/performance/types';

// Mapping of web vital names to categories
const vitalCategories: Record<string, WebVitalCategory> = {
  'CLS': 'visual_stability',
  'FCP': 'loading',
  'LCP': 'loading',
  'TTFB': 'loading',
  'FID': 'interaction',
  'INP': 'responsiveness'
};

// Store collected metrics to batch send
const collectedMetrics: PerformanceMetric[] = [];
let reportTimeout: ReturnType<typeof setTimeout> | null = null;

// Generate a unique session ID for this page view
const sessionId = crypto.randomUUID();

/**
 * Initialize web vitals monitoring
 */
export const initWebVitals = (
  reportCallback?: (metrics: WebVitalMetric[]) => void,
  batchTimeMs = 10000 // 10s default batch window
): void => {
  // Reset metrics on initialization
  collectedMetrics.length = 0;
  
  // Clear any existing timeout
  if (reportTimeout) {
    clearTimeout(reportTimeout);
    reportTimeout = null;
  }
  
  // Setup report batching
  const scheduleBatchReport = () => {
    if (reportTimeout) clearTimeout(reportTimeout);
    reportTimeout = setTimeout(() => sendCollectedMetrics(), batchTimeMs);
  };
  
  // Setup metric handlers
  const handleMetric = (metric: any) => {
    const vitalMetric: WebVitalMetric = {
      name: metric.name,
      value: metric.value,
      timestamp: Date.now(),
      category: vitalCategories[metric.name] || 'loading',
      rating: metric.rating
    };
    
    // Convert to performance metric format
    const perfMetric: PerformanceMetric = {
      metric_name: metric.name,
      value: metric.value,
      category: vitalCategories[metric.name] || 'loading',
      timestamp: new Date().toISOString(),
      type: 'load',
      session_id: sessionId,
      page_url: window.location.href,
      device_info: collectDeviceInfo()
    };
    
    // Add to collected metrics
    collectedMetrics.push(perfMetric);
    
    // Call optional callback
    if (reportCallback) {
      reportCallback([vitalMetric]);
    }
    
    // Schedule batch report
    scheduleBatchReport();
  };
  
  // Register web vital metrics
  onCLS(handleMetric);
  onFCP(handleMetric);
  onFID(handleMetric);
  onLCP(handleMetric);
  onTTFB(handleMetric);
  onINP(handleMetric);
  
  // Report page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      // Send metrics immediately when page is hidden
      sendCollectedMetrics(true);
    }
  });
};

/**
 * Send collected metrics to the server
 */
const sendCollectedMetrics = async (isUrgent = false): Promise<void> => {
  // If no metrics or already processing, skip
  if (collectedMetrics.length === 0) return;
  
  // Clone metrics to avoid race conditions
  const metricsToSend = [...collectedMetrics];
  
  // Clear the array
  collectedMetrics.length = 0;
  
  try {
    // Use the beacon API for urgent reports (when page is unloading)
    if (isUrgent && navigator.sendBeacon) {
      const payload = {
        metrics: metricsToSend,
        sessionId,
        timestamp: new Date().toISOString(),
        source: 'web'
      };
      
      const blob = new Blob([JSON.stringify(payload)], {
        type: 'application/json'
      });
      
      // Try to use sendBeacon for reliability during page unload
      const beaconSuccess = navigator.sendBeacon('/api/track-performance', blob);
      
      if (beaconSuccess) return;
      // Fall through to regular fetch if beacon fails
    }
    
    // Use edge function helper for normal reporting
    await invokeEdgeFunction('track-performance', {
      metrics: metricsToSend,
      sessionId,
      timestamp: new Date().toISOString(),
      source: 'web'
    });
  } catch (error) {
    console.error('Failed to send performance metrics:', error);
    
    // Add back to queue for retry on next batch
    if (!isUrgent) {
      collectedMetrics.push(...metricsToSend);
    }
  }
};

/**
 * Collect device and browser information
 */
const collectDeviceInfo = (): Record<string, any> => {
  const deviceInfo: Record<string, any> = {
    userAgent: navigator.userAgent,
    deviceCategory: getDeviceCategory(),
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
    const conn = (navigator as any).connection;
    if (conn) {
      deviceInfo.connection = {
        effectiveType: conn.effectiveType,
        downlink: conn.downlink,
        rtt: conn.rtt,
        saveData: conn.saveData
      };
    }
  }
  
  // Add memory info if available
  if ('memory' in performance) {
    deviceInfo.memory = {
      jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
      totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
      usedJSHeapSize: (performance as any).memory.usedJSHeapSize
    };
  }
  
  return deviceInfo;
};

/**
 * Determine device category from user agent and screen size
 */
const getDeviceCategory = (): 'mobile' | 'tablet' | 'desktop' | 'unknown' => {
  const ua = navigator.userAgent;
  const width = window.screen.width;
  
  // Check for mobile device patterns
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    return width < 768 ? 'mobile' : 'tablet';
  }
  
  // Consider small screens as tablets
  if (width < 1024) {
    return 'tablet';
  }
  
  // Default to desktop for larger screens
  return 'desktop';
};

/**
 * Manually report a custom performance metric
 */
export const reportPerformanceMetric = (
  name: string,
  value: number,
  type: string,
  category: string,
  componentName?: string
): void => {
  const metric: PerformanceMetric = {
    metric_name: name,
    value,
    type: type as any,
    category,
    timestamp: new Date().toISOString(),
    session_id: sessionId,
    page_url: window.location.href,
    component_name: componentName
  };
  
  collectedMetrics.push(metric);
  
  // Schedule batch report
  if (reportTimeout) clearTimeout(reportTimeout);
  reportTimeout = setTimeout(() => sendCollectedMetrics(), 5000);
};

/**
 * Immediately send all collected metrics
 */
export const flushMetrics = async (): Promise<void> => {
  await sendCollectedMetrics(true);
};

export default {
  initWebVitals,
  reportPerformanceMetric,
  flushMetrics
};
