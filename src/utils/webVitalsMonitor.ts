
// Web Vitals monitoring utility

type MetricName = 
  | 'FCP'     // First Contentful Paint
  | 'LCP'     // Largest Contentful Paint
  | 'FID'     // First Input Delay
  | 'CLS'     // Cumulative Layout Shift
  | 'TTFB'    // Time to First Byte
  | 'INP';    // Interaction to Next Paint

interface MetricValue {
  name: MetricName;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  navigationType?: 'navigate' | 'reload' | 'back-forward' | 'prerender';
}

let webVitalsInitialized = false;
const metricsStore: Record<MetricName, MetricValue | null> = {
  FCP: null,
  LCP: null,
  FID: null,
  CLS: null,
  TTFB: null,
  INP: null
};

/**
 * Calculate rating based on metric values
 */
function getMetricRating(name: MetricName, value: number): 'good' | 'needs-improvement' | 'poor' {
  // Thresholds based on web.dev recommendations
  const thresholds = {
    FCP: { good: 1800, poor: 3000 },
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    TTFB: { good: 800, poor: 1800 },
    INP: { good: 200, poor: 500 }
  };
  
  const threshold = thresholds[name];
  if (!threshold) return 'needs-improvement';
  
  if (value <= threshold.good) return 'good';
  if (value >= threshold.poor) return 'poor';
  return 'needs-improvement';
}

/**
 * Report a web vital metric
 */
function reportWebVital(metric: MetricValue) {
  // Store the metric
  metricsStore[metric.name] = metric;
  
  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`);
  }
  
  // Send to analytics in production
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'web_vitals', {
      event_category: 'Web Vitals',
      event_label: metric.name,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
    });
  }
  
  // Trigger custom event for other parts of the app to react
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('webvitals', { detail: metric }));
  }
}

/**
 * Initialize Web Vitals monitoring
 */
export function initWebVitals(): void {
  if (webVitalsInitialized || typeof window === 'undefined') return;
  
  webVitalsInitialized = true;
  
  // Dynamically import web-vitals to avoid adding to the critical bundle
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => {
      import('web-vitals').then(({ onFCP, onLCP, onFID, onCLS, onTTFB, onINP }) => {
        onFCP((metric) => {
          const metricValue: MetricValue = {
            name: 'FCP',
            value: metric.value,
            rating: getMetricRating('FCP', metric.value)
          };
          reportWebVital(metricValue);
        });
        
        onLCP((metric) => {
          const metricValue: MetricValue = {
            name: 'LCP',
            value: metric.value,
            rating: getMetricRating('LCP', metric.value)
          };
          reportWebVital(metricValue);
        });
        
        onFID((metric) => {
          const metricValue: MetricValue = {
            name: 'FID',
            value: metric.value,
            rating: getMetricRating('FID', metric.value)
          };
          reportWebVital(metricValue);
        });
        
        onCLS((metric) => {
          const metricValue: MetricValue = {
            name: 'CLS',
            value: metric.value,
            rating: getMetricRating('CLS', metric.value)
          };
          reportWebVital(metricValue);
        });
        
        onTTFB((metric) => {
          const metricValue: MetricValue = {
            name: 'TTFB',
            value: metric.value,
            rating: getMetricRating('TTFB', metric.value)
          };
          reportWebVital(metricValue);
        });
        
        onINP((metric) => {
          const metricValue: MetricValue = {
            name: 'INP',
            value: metric.value,
            rating: getMetricRating('INP', metric.value)
          };
          reportWebVital(metricValue);
        });
      });
    });
  }
}

/**
 * Get current Web Vitals metrics
 */
export function getWebVitalsMetrics(): typeof metricsStore {
  return { ...metricsStore };
}

/**
 * Get performance optimization recommendations based on metrics
 */
export function getPerformanceRecommendations(): string[] {
  const recommendations: string[] = [];
  
  if (metricsStore.LCP?.rating === 'poor') {
    recommendations.push('Consider further optimizing critical rendering path and reducing initial bundle size');
  }
  
  if (metricsStore.FID?.rating === 'poor' || metricsStore.INP?.rating === 'poor') {
    recommendations.push('Reduce JavaScript execution time and consider moving more logic to web workers');
  }
  
  if (metricsStore.CLS?.rating === 'poor') {
    recommendations.push('Fix layout shifts by using proper image dimensions and placeholders');
  }
  
  if (metricsStore.TTFB?.rating === 'poor') {
    recommendations.push('Optimize server response time or consider using a CDN');
  }
  
  return recommendations;
}

// Automatically initialize web vitals monitoring
if (typeof window !== 'undefined') {
  if (document.readyState === 'complete') {
    initWebVitals();
  } else {
    window.addEventListener('load', () => {
      setTimeout(() => {
        initWebVitals();
      }, 1000);
    });
  }
}
