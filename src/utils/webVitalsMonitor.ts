
/**
 * Web Vitals monitoring and reporting utility
 */

import { validateDefined, validateOneOf, validateString, validateNumber } from './validation/runtimeValidation';

// Metric categories
type MetricCategory = 'loading' | 'interaction' | 'visual_stability';

// Component render types
type RenderType = 'initial' | 'update' | 'effect';

// Web vital metrics collection
interface WebVitalMetric {
  name: string;
  value: number;
  category: MetricCategory;
  timestamp: number;
}

// Component render metrics collection
interface ComponentRenderMetric {
  componentName: string;
  renderTime: number;
  renderType: RenderType;
  timestamp: number;
}

// Performance marks for tracking specific operations
interface PerformanceMark {
  name: string;
  startTime?: number;
  endTime?: number;
  duration?: number;
}

// Collected metrics storage
const metrics: {
  webVitals: WebVitalMetric[];
  componentRenders: ComponentRenderMetric[];
  performanceMarks: Record<string, PerformanceMark>;
  lastReportTime: number;
} = {
  webVitals: [],
  componentRenders: [],
  performanceMarks: {},
  lastReportTime: 0
};

/**
 * Track a web vital metric
 * 
 * @param name - Metric name
 * @param value - Metric value
 * @param category - Metric category
 */
export function trackWebVital(
  name: string,
  value: number,
  category: 'loading' | 'interaction' | 'visual_stability'
): void {
  try {
    // Validate inputs
    validateString(name, 'name');
    validateNumber(value, 'value');
    validateOneOf(category, ['loading', 'interaction', 'visual_stability'] as const, 'category');
    
    // Add to metrics collection
    metrics.webVitals.push({
      name,
      value,
      category,
      timestamp: Date.now()
    });
    
    // Log for debugging
    if (import.meta.env.DEV) {
      console.debug(`Web Vital: ${name} = ${value} (${category})`);
    }
    
    // Consider auto-reporting if metrics exceed threshold
    if (metrics.webVitals.length > 10 && Date.now() - metrics.lastReportTime > 30000) {
      reportMetricsToServer().catch(err => {
        console.error('Failed to auto-report metrics:', err);
      });
    }
  } catch (error) {
    console.error('Error tracking web vital:', error);
  }
}

/**
 * Track component render performance
 * 
 * @param componentName - Name of the component
 * @param renderTime - Time taken to render in milliseconds
 * @param renderType - Type of render (initial, update, effect)
 */
export function trackComponentRender(
  componentName: string,
  renderTime: number,
  renderType: RenderType = 'update'
): void {
  try {
    // Validate inputs
    validateString(componentName, 'componentName');
    validateNumber(renderTime, 'renderTime');
    validateOneOf(renderType, ['initial', 'update', 'effect'] as const, 'renderType');
    
    // Add to metrics collection
    metrics.componentRenders.push({
      componentName,
      renderTime,
      renderType,
      timestamp: Date.now()
    });
    
    // Log slow renders for debugging
    if (import.meta.env.DEV && renderTime > 16) {
      console.warn(`Slow render: ${componentName} took ${renderTime.toFixed(2)}ms (${renderType})`);
    }
  } catch (error) {
    console.error('Error tracking component render:', error);
  }
}

/**
 * Mark the start of a performance measurement
 * 
 * @param name - Name of the mark
 * @returns Current timestamp
 */
export function markStart(name: string): number {
  try {
    validateString(name, 'name');
    const startTime = performance.now();
    
    metrics.performanceMarks[name] = {
      name,
      startTime
    };
    
    return startTime;
  } catch (error) {
    console.error('Error marking start:', error);
    return performance.now();
  }
}

/**
 * Mark the end of a performance measurement and calculate duration
 * 
 * @param name - Name of the mark (must match a previous markStart call)
 * @returns Duration in milliseconds
 */
export function markEnd(name: string): number {
  try {
    validateString(name, 'name');
    const endTime = performance.now();
    
    if (!metrics.performanceMarks[name] || !metrics.performanceMarks[name].startTime) {
      console.error(`No start mark found for "${name}"`);
      return 0;
    }
    
    const mark = metrics.performanceMarks[name];
    mark.endTime = endTime;
    mark.duration = endTime - (mark.startTime || 0);
    
    if (import.meta.env.DEV) {
      console.debug(`Performance mark: ${name} = ${mark.duration?.toFixed(2)}ms`);
    }
    
    return mark.duration || 0;
  } catch (error) {
    console.error('Error marking end:', error);
    return 0;
  }
}

/**
 * Initialize web vitals monitoring
 * 
 * @returns Cleanup function
 */
export function initWebVitals(): () => void {
  try {
    // Report existing metrics before initializing
    reportMetricsToServer().catch(err => {
      console.error('Failed to report initial metrics:', err);
    });
    
    // Set up monitoring for core web vitals
    setupCoreWebVitalsMonitoring();
    
    // Set up monitoring for user interactions
    setupInteractionMonitoring();
    
    // Set up monitoring for errors
    setupErrorMonitoring();
    
    // Return cleanup function
    return () => {
      // Report metrics before cleanup
      reportMetricsToServer().catch(err => {
        console.error('Failed to report metrics during cleanup:', err);
      });
      
      // Clear collected metrics
      metrics.webVitals = [];
      metrics.componentRenders = [];
      metrics.performanceMarks = {};
    };
  } catch (error) {
    console.error('Error initializing web vitals monitoring:', error);
    return () => {}; // Return empty cleanup function
  }
}

/**
 * Report collected metrics to server
 * 
 * @returns Promise that resolves to true if metrics were reported successfully
 */
export async function reportMetricsToServer(): Promise<boolean> {
  // Avoid reporting if no metrics collected
  if (metrics.webVitals.length === 0 && metrics.componentRenders.length === 0) {
    return true;
  }
  
  // Create a copy of the current metrics
  const metricsToReport = {
    webVitals: [...metrics.webVitals],
    componentRenders: [...metrics.componentRenders],
    performanceMarks: { ...metrics.performanceMarks },
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: Date.now()
  };
  
  try {
    // Here we would send metrics to the server
    // For now, we'll just log them
    if (import.meta.env.DEV) {
      console.log('Reporting metrics:', metricsToReport);
    }
    
    // In a real implementation, we would have something like:
    /*
    const response = await fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metricsToReport)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to report metrics: ${response.status} ${response.statusText}`);
    }
    */
    
    // Clear reported metrics
    metrics.webVitals = [];
    metrics.componentRenders = [];
    metrics.performanceMarks = {};
    metrics.lastReportTime = Date.now();
    
    return true;
  } catch (error) {
    console.error('Failed to report metrics:', error);
    return false;
  }
}

/**
 * Set up monitoring for core web vitals (LCP, FID, CLS)
 */
function setupCoreWebVitalsMonitoring(): void {
  // In a real implementation, we would use web-vitals library
  // For now, we'll just do basic monitoring

  // Largest Contentful Paint
  try {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        trackWebVital(
          'LCP', 
          lastEntry.startTime, 
          'loading'
        );
      }
    });
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (e) {
    console.warn('LCP monitoring not supported', e);
  }

  // First Input Delay
  try {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        if (entry instanceof PerformanceEventTiming) {
          trackWebVital(
            'FID',
            entry.processingStart - entry.startTime,
            'interaction'
          );
        }
      });
    });
    observer.observe({ type: 'first-input', buffered: true });
  } catch (e) {
    console.warn('FID monitoring not supported', e);
  }

  // Cumulative Layout Shift
  try {
    let clsValue = 0;
    const observer = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        // TypeScript doesn't know about the layout shift properties
        // We need to check if the property exists at runtime
        const layoutShift = entry as unknown as { value: number; hadRecentInput: boolean };
        if (layoutShift && typeof layoutShift.hadRecentInput === 'boolean' && !layoutShift.hadRecentInput) {
          clsValue += layoutShift.value || 0;
          trackWebVital('CLS', clsValue, 'visual_stability');
        }
      }
    });
    observer.observe({ type: 'layout-shift', buffered: true });
  } catch (e) {
    console.warn('CLS monitoring not supported', e);
  }
}

/**
 * Set up monitoring for user interactions
 */
function setupInteractionMonitoring(): void {
  // Track page transitions
  const originalPushState = history.pushState;
  history.pushState = function(...args) {
    // Call original function
    const result = originalPushState.apply(this, args);
    
    // Track navigation
    trackWebVital('navigation', performance.now(), 'interaction');
    
    return result;
  };
  
  // Listen for popstate events
  window.addEventListener('popstate', () => {
    trackWebVital('navigation', performance.now(), 'interaction');
  });
  
  // Track page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      trackWebVital('visibility-visible', performance.now(), 'interaction');
    } else {
      trackWebVital('visibility-hidden', performance.now(), 'interaction');
    }
  });
}

/**
 * Set up monitoring for errors
 */
function setupErrorMonitoring(): void {
  // Track unhandled errors
  window.addEventListener('error', (event) => {
    trackWebVital('unhandled-error', performance.now(), 'interaction');
  });
  
  // Track unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    trackWebVital('unhandled-rejection', performance.now(), 'interaction');
  });
}
