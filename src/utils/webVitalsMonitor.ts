
/**
 * Web Vitals Monitor
 * 
 * Tracks Core Web Vitals metrics for the application.
 */

import { onFCP, onCLS, onLCP, onFID, onTTFB } from 'web-vitals';
import performanceMonitor from './performance/performanceMonitor';

/**
 * Initialize Web Vitals monitoring
 */
export function initWebVitals() {
  // First Contentful Paint (FCP)
  onFCP(({ value }) => {
    const metric = {
      name: 'FCP',
      value,
      timestamp: Date.now(),
      category: 'loading' as const
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
    const metric = {
      name: 'LCP',
      value,
      timestamp: Date.now(),
      category: 'loading' as const
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
    const metric = {
      name: 'CLS',
      value,
      timestamp: Date.now(),
      category: 'visual_stability' as const
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
    const metric = {
      name: 'FID',
      value,
      timestamp: Date.now(),
      category: 'interaction' as const
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
    const metric = {
      name: 'TTFB',
      value,
      timestamp: Date.now(),
      category: 'loading' as const
    };
    
    performanceMonitor.addWebVital(
      metric.name,
      metric.value,
      metric.category
    );
    
    console.log(`[WebVitals] TTFB: ${value}ms`);
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
  getWebVitalsMetrics
};
