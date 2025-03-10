
/**
 * Web Vitals Monitoring Utility
 * 
 * Records and reports Core Web Vitals metrics for performance monitoring
 */

import { validateOneOf } from './validation/runtimeValidation';
import performanceMonitor from './performance/performanceMonitor';

// Web Vitals metrics types
export type WebVitalName = 'FCP' | 'LCP' | 'CLS' | 'FID' | 'TTFB' | 'INP';
export type WebVitalCategory = 'loading' | 'interaction' | 'visual_stability';

interface WebVitalMetric {
  name: WebVitalName;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  category: WebVitalCategory;
  navigationType: string;
}

/**
 * Maps web vital names to their categories
 */
const WEB_VITAL_CATEGORIES: Record<WebVitalName, WebVitalCategory> = {
  FCP: 'loading',
  LCP: 'loading',
  TTFB: 'loading',
  FID: 'interaction',
  INP: 'interaction',
  CLS: 'visual_stability'
};

/**
 * Threshold values for classifying Web Vitals as good, needs-improvement, or poor
 */
const WEB_VITAL_THRESHOLDS: Record<WebVitalName, [number, number]> = {
  FCP: [1800, 3000], // First Contentful Paint (ms)
  LCP: [2500, 4000], // Largest Contentful Paint (ms)
  FID: [100, 300],   // First Input Delay (ms)
  CLS: [0.1, 0.25],  // Cumulative Layout Shift (unitless)
  TTFB: [800, 1800], // Time to First Byte (ms)
  INP: [200, 500]    // Interaction to Next Paint (ms)
};

/**
 * Classify a Web Vital metric based on its value
 */
function getMetricRating(name: WebVitalName, value: number): 'good' | 'needs-improvement' | 'poor' {
  const [good, poor] = WEB_VITAL_THRESHOLDS[name];
  
  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Record a Web Vital metric
 */
export function recordWebVital(name: WebVitalName, value: number, navigationType = 'navigate'): void {
  // Validate inputs
  const validName = validateOneOf(name, Object.keys(WEB_VITAL_CATEGORIES) as WebVitalName[], 'Web Vital name');
  
  // Get category for this metric
  const category = WEB_VITAL_CATEGORIES[validName];
  
  // Determine rating (good, needs-improvement, poor)
  const rating = getMetricRating(validName, value);
  
  // Create metric object
  const metric: WebVitalMetric = {
    name: validName,
    value,
    rating,
    category,
    navigationType
  };
  
  // Log metric to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.log(
      `%cWeb Vital: ${name} = ${value.toFixed(2)} (${rating})`,
      `color: ${rating === 'good' ? 'green' : rating === 'needs-improvement' ? 'orange' : 'red'}`
    );
  }
  
  // Report to performance monitor
  performanceMonitor.addWebVital(name, value, category);
  
  // This might be extended to report to analytics in the future
}

// Performance measuring utilities
export function markStart(markName: string): void {
  if (typeof performance === 'undefined') return;
  performance.mark(`${markName}-start`);
}

export function markEnd(markName: string): void {
  if (typeof performance === 'undefined') return;
  
  try {
    performance.mark(`${markName}-end`);
    performance.measure(
      markName,
      `${markName}-start`,
      `${markName}-end`
    );
    
    const entries = performance.getEntriesByName(markName);
    if (entries.length > 0) {
      const duration = entries[0].duration;
      if (process.env.NODE_ENV !== 'production') {
        console.log(`%c${markName}: ${duration.toFixed(2)}ms`, 'color: blue');
      }
    }
  } catch (error) {
    console.error(`Failed to measure ${markName}:`, error);
  }
}

/**
 * Initialize the Web Vitals monitoring
 */
export function initWebVitals(): void {
  // This will be expanded as needed
  if (typeof window !== 'undefined') {
    try {
      // We could use web-vitals library here in the future
      // For now just minimal implementation
      
      // Measure Time To First Byte (TTFB)
      if (performance && performance.getEntriesByType) {
        const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navEntry) {
          const ttfb = navEntry.responseStart;
          recordWebVital('TTFB', ttfb);
        }
      }
      
      // More implementations can be added as needed
    } catch (error) {
      console.error('Error initializing Web Vitals monitoring:', error);
    }
  }
}

// Export the monitoring utility
export default {
  recordWebVital,
  initWebVitals,
  markStart,
  markEnd
};
