
/**
 * Simplified Web Vitals Monitor
 * 
 * Tracks core Web Vitals metrics (LCP, CLS, FID) for performance monitoring.
 */

// Types for web vitals metrics
interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

interface WebVitalsReport {
  lcp: WebVitalsMetric | null;
  cls: WebVitalsMetric | null;
  fid: WebVitalsMetric | null;
  lastUpdated: number;
}

// Store the metrics
const metrics: WebVitalsReport = {
  lcp: null,
  cls: null,
  fid: null,
  lastUpdated: 0
};

// Rating thresholds
const thresholds = {
  LCP: { good: 2500, poor: 4000 }, // ms
  FID: { good: 100, poor: 300 },   // ms
  CLS: { good: 0.1, poor: 0.25 },  // score
};

/**
 * Initialize Web Vitals monitoring
 */
export function initWebVitals(): void {
  if (typeof window === 'undefined') return;
  
  // Lazy-load the web-vitals library for efficiency
  import('web-vitals').then(({ onLCP, onFID, onCLS }) => {
    // Largest Contentful Paint
    onLCP(metric => {
      metrics.lcp = processMetric('LCP', metric.value);
      dispatchUpdateEvent();
    });
    
    // First Input Delay
    onFID(metric => {
      metrics.fid = processMetric('FID', metric.value);
      dispatchUpdateEvent();
    });
    
    // Cumulative Layout Shift
    onCLS(metric => {
      metrics.cls = processMetric('CLS', metric.value);
      dispatchUpdateEvent();
    });
    
    console.log('Web Vitals monitoring initialized');
  }).catch(err => {
    console.error('Failed to load web-vitals library:', err);
  });
}

/**
 * Process a metric and determine its rating
 */
function processMetric(
  name: string, 
  value: number
): WebVitalsMetric {
  let rating: 'good' | 'needs-improvement' | 'poor';
  
  // Get the right thresholds for this metric
  const metricThresholds = thresholds[name as keyof typeof thresholds];
  
  if (metricThresholds) {
    if (value <= metricThresholds.good) {
      rating = 'good';
    } else if (value <= metricThresholds.poor) {
      rating = 'needs-improvement';
    } else {
      rating = 'poor';
    }
  } else {
    rating = 'needs-improvement'; // Default if no thresholds
  }
  
  return {
    name,
    value,
    rating
  };
}

/**
 * Dispatch an event when metrics are updated
 */
function dispatchUpdateEvent(): void {
  metrics.lastUpdated = Date.now();
  
  // Create and dispatch a custom event
  const event = new CustomEvent('webvitals', { 
    detail: { metrics }
  });
  
  window.dispatchEvent(event);
}

/**
 * Get a copy of the current metrics
 */
export function getWebVitalsMetrics(): WebVitalsReport {
  return { ...metrics };
}

/**
 * Mark the start of a custom performance measurement
 */
export function markStart(name: string): void {
  if (typeof performance === 'undefined') return;
  
  performance.mark(`app-${name}-start`);
}

/**
 * Mark the end of a custom performance measurement and record the duration
 */
export function markEnd(name: string): number {
  if (typeof performance === 'undefined') return 0;
  
  try {
    performance.mark(`app-${name}-end`);
    const measure = performance.measure(
      `app-${name}`,
      `app-${name}-start`,
      `app-${name}-end`
    );
    
    return measure.duration;
  } catch (e) {
    console.error(`Error measuring ${name}:`, e);
    return 0;
  }
}
