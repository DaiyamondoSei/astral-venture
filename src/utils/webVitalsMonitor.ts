
/**
 * Web Vitals Monitoring System
 * Enhanced monitoring system for collecting, analyzing and reporting web vitals metrics
 */
import { callEdgeFunction } from './edgeFunctionClient';
import type { 
  ComponentMetric, 
  WebVitalMetric, 
  PerformanceMetricPayload,
  DeviceInfo
} from '@/types/edge-functions';

// Performance marks storage
const performanceMarks: Record<string, { start?: number; end?: number; duration?: number }> = {};

// Web vitals storage
const webVitalsMetrics: WebVitalMetric[] = [];

// Components render time tracking
interface ComponentRenderTiming {
  componentName: string;
  renderTime: number;
  timestamp: number;
  renderType: 'initial' | 'update' | 'effect';
}

// Component metrics storage
const componentMetrics: Record<string, ComponentRenderTiming[]> = {};

// Session identifier
const sessionId = generateSessionId();

// Device information
const deviceInfo = getDeviceInfo();

// Reporting interval reference
let reportingInterval: number | null = null;

/**
 * Initialize web vitals monitoring
 * Sets up reporting intervals and listeners for web vitals
 */
export function initWebVitals(): () => void {
  try {
    // Check if already initialized
    if (reportingInterval) {
      console.warn('Web vitals monitoring already initialized');
      return () => {};
    }

    // Set up regular reporting interval
    reportingInterval = window.setInterval(() => {
      if (webVitalsMetrics.length > 0 || Object.keys(componentMetrics).length > 0) {
        reportMetricsToServer().catch(err => {
          console.error('Failed to report metrics:', err);
        });
      }
    }, 60000); // Report every minute

    // Setup listeners for browser visibility changes
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          // Report metrics when page is being hidden/unloaded
          reportMetricsToServer().catch(err => {
            console.error('Failed to report metrics on page hide:', err);
          });
        }
      });
    }
    
    // Setup core web vitals tracking if available
    if (typeof window !== 'undefined') {
      import('web-vitals').then(webVitals => {
        webVitals.onCLS(metric => {
          trackWebVital('CLS', metric.value, 'visual_stability');
        });
        
        webVitals.onFID(metric => {
          trackWebVital('FID', metric.value, 'interaction');
        });
        
        webVitals.onLCP(metric => {
          trackWebVital('LCP', metric.value, 'loading');
        });
        
        webVitals.onTTFB(metric => {
          trackWebVital('TTFB', metric.value, 'loading');
        });
        
        webVitals.onFCP(metric => {
          trackWebVital('FCP', metric.value, 'loading');
        });
      }).catch(err => {
        console.error('Failed to load web-vitals:', err);
      });
    }
    
    // Return cleanup function
    return () => {
      if (reportingInterval) {
        window.clearInterval(reportingInterval);
        reportingInterval = null;
      }
      document.removeEventListener('visibilitychange', () => {});
    };
  } catch (error) {
    console.error('Error initializing web vitals:', error);
    return () => {};
  }
}

/**
 * Create a performance mark start point
 * @param markName Unique identifier for the performance mark
 */
export function markStart(markName: string): void {
  try {
    const now = performance.now();
    performanceMarks[markName] = performanceMarks[markName] || {};
    performanceMarks[markName].start = now;
    
    // Also use the native Performance API if available
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`${markName}_start`);
    }
  } catch (error) {
    console.error(`Error in markStart(${markName}):`, error);
  }
}

/**
 * End a performance mark and calculate duration
 * @param markName Identifier matching a previous markStart call
 * @returns Duration in milliseconds or undefined if no matching start mark
 */
export function markEnd(markName: string): number | undefined {
  try {
    const now = performance.now();
    const mark = performanceMarks[markName];
    
    if (!mark || typeof mark.start !== 'number') {
      console.warn(`No matching start mark found for "${markName}"`);
      return undefined;
    }
    
    mark.end = now;
    mark.duration = mark.end - mark.start;
    
    // Also use the native Performance API if available
    if (typeof performance !== 'undefined' && performance.mark && performance.measure) {
      performance.mark(`${markName}_end`);
      try {
        performance.measure(markName, `${markName}_start`, `${markName}_end`);
      } catch (e) {
        // Some browsers may throw if the marks have been cleared
      }
    }
    
    return mark.duration;
  } catch (error) {
    console.error(`Error in markEnd(${markName}):`, error);
    return undefined;
  }
}

/**
 * Track component render time
 * @param componentName Name of the component
 * @param renderTime Time taken to render in milliseconds
 * @param renderType Type of render (initial, update, effect)
 */
export function trackComponentRender(
  componentName: string, 
  renderTime: number,
  renderType: 'initial' | 'update' | 'effect' = 'update'
): void {
  try {
    if (!componentMetrics[componentName]) {
      componentMetrics[componentName] = [];
    }
    
    componentMetrics[componentName].push({
      componentName,
      renderTime,
      timestamp: Date.now(),
      renderType
    });
    
    // Limit stored metrics per component to prevent memory issues
    if (componentMetrics[componentName].length > 100) {
      componentMetrics[componentName].shift();
    }
  } catch (error) {
    console.error(`Error tracking render for ${componentName}:`, error);
  }
}

/**
 * Track web vital metrics
 * @param name Metric name
 * @param value Metric value
 * @param category Metric category (loading, interaction, visual_stability)
 */
export function trackWebVital(
  name: string,
  value: number,
  category: 'loading' | 'interaction' | 'visual_stability'
): void {
  try {
    webVitalsMetrics.push({
      name,
      value,
      category,
      timestamp: Date.now()
    });
    
    // Limit stored metrics to prevent memory issues
    if (webVitalsMetrics.length > 200) {
      webVitalsMetrics.shift();
    }
  } catch (error) {
    console.error(`Error tracking web vital ${name}:`, error);
  }
}

/**
 * Get all collected performance metrics
 * @returns Object containing all performance metrics
 */
export function getAllMetrics() {
  return {
    performanceMarks,
    componentMetrics,
    webVitalsMetrics,
    sessionId,
    deviceInfo
  };
}

/**
 * Clear collected metrics
 */
export function clearMetrics(): void {
  Object.keys(performanceMarks).forEach(key => delete performanceMarks[key]);
  Object.keys(componentMetrics).forEach(key => delete componentMetrics[key]);
  webVitalsMetrics.length = 0;
}

/**
 * Send metrics to the server using edge function
 * @returns Promise that resolves when metrics are sent
 */
export async function reportMetricsToServer(): Promise<boolean> {
  try {
    // Extract component metrics for reporting
    const metrics = Object.entries(componentMetrics).flatMap(([_, timings]) => 
      timings.map(timing => ({
        componentName: timing.componentName,
        renderTime: timing.renderTime,
        renderType: timing.renderType,
        timestamp: timing.timestamp
      }))
    );
    
    // Skip if no metrics to report
    if (metrics.length === 0 && webVitalsMetrics.length === 0) {
      return false;
    }
    
    // Prepare payload
    const payload: PerformanceMetricPayload = {
      sessionId,
      deviceInfo,
      appVersion: '1.0.0', // Should be dynamically derived in a real app
      metrics,
      webVitals: webVitalsMetrics,
      timestamp: Date.now()
    };
    
    // Use our generic edge function client
    const response = await callEdgeFunction('track-performance', payload, {
      handleError: true,
      showErrorToast: false,
    });
    
    if (response.success) {
      // Clear reported metrics
      clearMetrics();
      return true;
    } else {
      console.error('Failed to report metrics:', response.error);
      return false;
    }
  } catch (error) {
    console.error('Error reporting metrics:', error);
    return false;
  }
}

// Helper functions

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 12)}`;
}

/**
 * Get device information
 */
function getDeviceInfo(): DeviceInfo {
  try {
    const navigatorInfo = navigator as any;
    const isLowEndDevice = 
      navigatorInfo.deviceMemory < 4 || 
      navigatorInfo.hardwareConcurrency < 4;
    
    return {
      userAgent: navigator.userAgent,
      deviceCategory: isLowEndDevice ? 'low-end' : 'high-end',
      deviceMemory: navigatorInfo.deviceMemory || 'unknown',
      hardwareConcurrency: navigatorInfo.hardwareConcurrency || 'unknown',
      connectionType: navigatorInfo.connection ? navigatorInfo.connection.effectiveType : 'unknown',
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      screenSize: {
        width: window.screen.width,
        height: window.screen.height
      },
      pixelRatio: window.devicePixelRatio || 1
    };
  } catch (error) {
    console.error('Error getting device info:', error);
    return {
      userAgent: 'unknown',
      deviceCategory: 'unknown'
    };
  }
}

// Export additional utility functions
export const webVitalsMonitor = {
  markStart,
  markEnd,
  trackComponentRender,
  trackWebVital,
  getAllMetrics,
  clearMetrics,
  reportMetricsToServer,
  initWebVitals
};

export default webVitalsMonitor;
