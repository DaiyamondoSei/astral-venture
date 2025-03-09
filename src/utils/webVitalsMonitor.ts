
/**
 * Web Vitals Monitor
 * 
 * Tracks and reports Web Vitals metrics for performance monitoring.
 * Supports tracking LCP, FID, CLS, TTFB, and other critical metrics.
 */

// Types for web vitals metrics
interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
}

interface WebVitalsReport {
  lcp: WebVitalsMetric | null;
  fid: WebVitalsMetric | null;
  cls: WebVitalsMetric | null;
  ttfb: WebVitalsMetric | null;
  fcp: WebVitalsMetric | null;
  inp: WebVitalsMetric | null;
  lastUpdated: number;
}

// Store the metrics
const metrics: WebVitalsReport = {
  lcp: null,
  fid: null,
  cls: null,
  ttfb: null,
  fcp: null,
  inp: null,
  lastUpdated: 0
};

// Rating thresholds
const thresholds = {
  LCP: { good: 2500, poor: 4000 }, // ms
  FID: { good: 100, poor: 300 },   // ms
  CLS: { good: 0.1, poor: 0.25 },  // score
  TTFB: { good: 800, poor: 1800 }, // ms
  FCP: { good: 1800, poor: 3000 }, // ms
  INP: { good: 200, poor: 500 }    // ms
};

/**
 * Initialize Web Vitals monitoring
 */
export function initWebVitals(): void {
  if (typeof window === 'undefined') return;
  
  // Lazy-load the web-vitals library for efficiency
  import('web-vitals').then(({ onLCP, onFID, onCLS, onTTFB, onFCP, onINP }) => {
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
    
    // Time to First Byte
    onTTFB(metric => {
      metrics.ttfb = processMetric('TTFB', metric.value);
      dispatchUpdateEvent();
    });
    
    // First Contentful Paint
    onFCP(metric => {
      metrics.fcp = processMetric('FCP', metric.value);
      dispatchUpdateEvent();
    });
    
    // Interaction to Next Paint
    onINP(metric => {
      metrics.inp = processMetric('INP', metric.value);
      dispatchUpdateEvent();
    });
    
    console.log('Web Vitals monitoring initialized');
  }).catch(err => {
    console.error('Failed to load web-vitals library:', err);
  });
  
  // Set up Performance Observer for custom metrics
  if ('PerformanceObserver' in window) {
    try {
      // Element Timing API
      const elementObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          console.log('Element Timing:', entry);
          // Custom processing for element timing
        });
      });
      
      elementObserver.observe({ type: 'element', buffered: true });
      
      // Custom measurements
      const measureObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          // Report any custom measures
          if (entry.entryType === 'measure' && entry.name.startsWith('app-')) {
            reportCustomMeasure(entry.name, entry.duration);
          }
        });
      });
      
      measureObserver.observe({ entryTypes: ['measure'] });
      
    } catch (e) {
      console.error('PerformanceObserver error:', e);
    }
  }
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

/**
 * Report a custom performance measure
 */
function reportCustomMeasure(name: string, duration: number): void {
  console.log(`Custom measure: ${name} took ${duration.toFixed(2)}ms`);
  
  // Report to analytics in production
  if (process.env.NODE_ENV === 'production') {
    // Implementation would depend on analytics provider
  }
}

/**
 * Get a performance score based on all metrics
 * Returns a value from 0 to 100
 */
export function getPerformanceScore(): number {
  if (!metrics.lcp || !metrics.cls || !metrics.ttfb) {
    return -1; // Not enough data yet
  }
  
  // Calculate weighted score based on metrics
  let score = 0;
  let weight = 0;
  
  // LCP contributes 40% to the score
  if (metrics.lcp) {
    const lcp = metrics.lcp.value;
    const lcpScore = lcp <= thresholds.LCP.good ? 100 :
      lcp <= thresholds.LCP.poor ? 
        50 - ((lcp - thresholds.LCP.good) / (thresholds.LCP.poor - thresholds.LCP.good) * 50) :
        Math.max(0, 50 - ((lcp - thresholds.LCP.poor) / 1000) * 10);
    
    score += lcpScore * 0.4;
    weight += 0.4;
  }
  
  // CLS contributes 30% to the score
  if (metrics.cls) {
    const cls = metrics.cls.value;
    const clsScore = cls <= thresholds.CLS.good ? 100 :
      cls <= thresholds.CLS.poor ? 
        50 - ((cls - thresholds.CLS.good) / (thresholds.CLS.poor - thresholds.CLS.good) * 50) :
        Math.max(0, 50 - ((cls - thresholds.CLS.poor) / 0.1) * 10);
    
    score += clsScore * 0.3;
    weight += 0.3;
  }
  
  // TTFB contributes 20% to the score
  if (metrics.ttfb) {
    const ttfb = metrics.ttfb.value;
    const ttfbScore = ttfb <= thresholds.TTFB.good ? 100 :
      ttfb <= thresholds.TTFB.poor ? 
        50 - ((ttfb - thresholds.TTFB.good) / (thresholds.TTFB.poor - thresholds.TTFB.good) * 50) :
        Math.max(0, 50 - ((ttfb - thresholds.TTFB.poor) / 500) * 10);
    
    score += ttfbScore * 0.2;
    weight += 0.2;
  }
  
  // FID/INP contributes 10% to the score (use INP if available, otherwise FID)
  if (metrics.inp || metrics.fid) {
    const metricValue = metrics.inp ? metrics.inp.value : metrics.fid!.value;
    const metricThresholds = metrics.inp ? thresholds.INP : thresholds.FID;
    
    const inputScore = metricValue <= metricThresholds.good ? 100 :
      metricValue <= metricThresholds.poor ? 
        50 - ((metricValue - metricThresholds.good) / (metricThresholds.poor - metricThresholds.good) * 50) :
        Math.max(0, 50 - ((metricValue - metricThresholds.poor) / 100) * 10);
    
    score += inputScore * 0.1;
    weight += 0.1;
  }
  
  // Normalize score based on available metrics
  return weight > 0 ? Math.round(score / weight) : -1;
}

/**
 * Get suggestions for performance improvements based on current metrics
 */
export function getPerformanceSuggestions(): string[] {
  const suggestions: string[] = [];
  
  if (metrics.lcp && metrics.lcp.rating !== 'good') {
    suggestions.push(
      'Improve LCP by optimizing image loading, reducing server response time, and minimizing render-blocking resources.'
    );
  }
  
  if (metrics.cls && metrics.cls.rating !== 'good') {
    suggestions.push(
      'Reduce layout shifts by setting explicit dimensions for images and dynamic content, and avoiding inserting content above existing content.'
    );
  }
  
  if (metrics.ttfb && metrics.ttfb.rating !== 'good') {
    suggestions.push(
      'Improve server response time by optimizing backend processing, using CDNs, and implementing proper caching.'
    );
  }
  
  if ((metrics.fid && metrics.fid.rating !== 'good') || 
      (metrics.inp && metrics.inp.rating !== 'good')) {
    suggestions.push(
      'Enhance interactivity by optimizing JavaScript execution, breaking up long tasks, and reducing main thread blocking.'
    );
  }
  
  if (suggestions.length === 0 && metrics.lcp) {
    suggestions.push('Current performance metrics look good. Continue monitoring for any changes.');
  }
  
  return suggestions;
}
