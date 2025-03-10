
/**
 * Web Vitals Monitor
 * 
 * Tracks Core Web Vitals metrics for the application.
 */

import { onFCP, onCLS, onLCP, onFID, onTTFB, onINP } from 'web-vitals';
import performanceMonitor from './performance/performanceMonitor';
import { WebVitalMetric } from './performance/types';

// Track custom marks for performance spans
const marks: Record<string, number> = {};

/**
 * Start timing a custom performance mark
 * @param markName Name of the mark to start
 */
export function markStart(markName: string): void {
  marks[markName] = performance.now();
}

/**
 * End timing a custom performance mark and record the duration
 * @param markName Name of the mark to end
 * @param category Optional category for the mark
 */
export function markEnd(markName: string, category: 'navigation' | 'rendering' | 'resource' | 'custom' = 'custom'): void {
  if (marks[markName]) {
    const duration = performance.now() - marks[markName];
    performanceMonitor.addWebVital(
      markName,
      duration,
      category === 'rendering' ? 'visual_stability' : 
        category === 'navigation' ? 'loading' : 'interaction'
    );
    console.log(`[Performance] ${markName}: ${duration.toFixed(2)}ms`);
    delete marks[markName];
  }
}

/**
 * Initialize Web Vitals monitoring
 */
export function initWebVitals(): void {
  // First Contentful Paint (FCP)
  onFCP(({ value }) => {
    const metric: WebVitalMetric = {
      name: 'FCP',
      value,
      timestamp: Date.now(),
      category: 'loading'
    };
    
    performanceMonitor.addWebVital(
      metric.name,
      metric.value,
      metric.category
    );
    
    console.log(`[WebVitals] FCP: ${value}ms`);
  });

  // Largest Contentful Paint (LCP)
  onLCP(({ value }) => {
    const metric: WebVitalMetric = {
      name: 'LCP',
      value,
      timestamp: Date.now(),
      category: 'loading'
    };
    
    performanceMonitor.addWebVital(
      metric.name,
      metric.value,
      metric.category
    );
    
    console.log(`[WebVitals] LCP: ${value}ms`);
  });

  // Cumulative Layout Shift (CLS)
  onCLS(({ value }) => {
    const metric: WebVitalMetric = {
      name: 'CLS',
      value,
      timestamp: Date.now(),
      category: 'visual_stability'
    };
    
    performanceMonitor.addWebVital(
      metric.name,
      metric.value,
      metric.category
    );
    
    console.log(`[WebVitals] CLS: ${value}`);
  });

  // First Input Delay (FID)
  onFID(({ value }) => {
    const metric: WebVitalMetric = {
      name: 'FID',
      value,
      timestamp: Date.now(),
      category: 'interaction'
    };
    
    performanceMonitor.addWebVital(
      metric.name,
      metric.value,
      metric.category
    );
    
    console.log(`[WebVitals] FID: ${value}ms`);
  });

  // Time to First Byte (TTFB)
  onTTFB(({ value }) => {
    const metric: WebVitalMetric = {
      name: 'TTFB',
      value,
      timestamp: Date.now(),
      category: 'loading'
    };
    
    performanceMonitor.addWebVital(
      metric.name,
      metric.value,
      metric.category
    );
    
    console.log(`[WebVitals] TTFB: ${value}ms`);
  });

  // Interaction to Next Paint (INP) - newer metric
  onINP(({ value }) => {
    const metric: WebVitalMetric = {
      name: 'INP',
      value,
      timestamp: Date.now(),
      category: 'interaction'
    };
    
    performanceMonitor.addWebVital(
      metric.name,
      metric.value,
      metric.category
    );
    
    console.log(`[WebVitals] INP: ${value}ms`);
  });
}

/**
 * Get Web Vitals metrics for the current page
 */
export function getWebVitalsMetrics() {
  return performanceMonitor.getWebVitals();
}

export default {
  initWebVitals,
  getWebVitalsMetrics,
  markStart,
  markEnd
};
