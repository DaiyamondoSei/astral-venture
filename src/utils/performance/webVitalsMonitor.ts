
/**
 * Web Vitals Monitoring System
 * 
 * Collects all core web vitals with proper attribution, sampling, and 
 * reliable reporting even during page unload.
 */
import { onCLS, onFCP, onFID, onINP, onLCP, onTTFB } from 'web-vitals';
import { perfMetricsCollector } from './perfMetricsCollector';
import type { WebVitalMetric, WebVitalCategory } from './types';

// Mapping of web vital names to categories
const vitalCategories: Record<string, WebVitalCategory> = {
  'CLS': 'visual_stability',
  'FCP': 'loading',
  'LCP': 'loading',
  'TTFB': 'loading',
  'FID': 'interaction',
  'INP': 'interaction'
};

// Configuration options
interface WebVitalsConfig {
  reportCallback?: (metrics: WebVitalMetric[]) => void;
  reportAllCallback?: (metrics: Record<string, number>) => void;
  enableLogging?: boolean;
  samplingRate?: number;
  attributionEnabled?: boolean;
}

// Store collected metrics
const collectedVitals: Record<string, number> = {};

/**
 * Initialize web vitals monitoring
 */
export function initWebVitals(config: WebVitalsConfig = {}): () => void {
  const {
    reportCallback,
    reportAllCallback,
    enableLogging = false,
    samplingRate = 1.0, // 100% by default
    attributionEnabled = true
  } = config;
  
  // Initialize or reset metrics
  Object.keys(collectedVitals).forEach(key => delete collectedVitals[key]);
  
  // Apply sampling
  if (Math.random() > samplingRate) {
    if (enableLogging) {
      console.log('[WebVitals] Monitoring skipped due to sampling rate');
    }
    return () => {}; // No-op cleanup
  }
  
  // Setup metric handlers with attribution
  const handleMetric = (metric: any) => {
    // Store metric value
    collectedVitals[metric.name] = metric.value;
    
    // Create web vital metric record
    const vitalMetric: WebVitalMetric = {
      name: metric.name,
      value: metric.value,
      timestamp: Date.now(),
      category: vitalCategories[metric.name] || 'loading',
      rating: metric.rating
    };
    
    // Attribution data from web-vitals (if available and enabled)
    let attribution = {};
    if (attributionEnabled && metric.attribution) {
      attribution = {
        element: metric.attribution.element || undefined,
        largestShiftTarget: metric.attribution.largestShiftTarget || undefined,
        largestShiftTime: metric.attribution.largestShiftTime || undefined,
        loadState: metric.attribution.loadState || undefined,
        navigationEntry: metric.attribution.navigationEntry?.name || undefined,
        eventEntry: metric.attribution.eventEntry?.name || undefined
      };
    }
    
    // Log if enabled
    if (enableLogging) {
      console.log(`[WebVitals] ${metric.name}: ${metric.value.toFixed(2)}`, {
        rating: metric.rating,
        attribution: Object.keys(attribution).length > 0 ? attribution : undefined
      });
    }
    
    // Track using metrics collector
    perfMetricsCollector.trackWebVital(
      metric.name, 
      metric.value, 
      vitalCategories[metric.name] || 'loading',
      metric.rating
    );
    
    // Call optional callback
    if (reportCallback) {
      reportCallback([vitalMetric]);
    }
    
    // Call all metrics callback after update
    if (reportAllCallback) {
      reportAllCallback({ ...collectedVitals });
    }
  };
  
  // Register all core web vitals
  const stopCLS = onCLS(handleMetric);
  const stopFCP = onFCP(handleMetric);
  const stopFID = onFID(handleMetric);
  const stopLCP = onLCP(handleMetric);
  const stopTTFB = onTTFB(handleMetric);
  const stopINP = onINP(handleMetric);
  
  // Report page visibility changes
  const visibilityHandler = () => {
    if (document.visibilityState === 'hidden') {
      // Force flush metrics when page is hidden
      perfMetricsCollector.flush();
    }
  };
  
  document.addEventListener('visibilitychange', visibilityHandler);
  
  // Return cleanup function
  return () => {
    stopCLS();
    stopFCP();
    stopFID();
    stopLCP();
    stopTTFB();
    stopINP();
    document.removeEventListener('visibilitychange', visibilityHandler);
  };
}

/**
 * Get the current collected vitals
 */
export function getWebVitals(): Record<string, number> {
  return { ...collectedVitals };
}

/**
 * Manually report a custom web vital metric
 */
export function reportCustomVital(
  name: string,
  value: number,
  category: WebVitalCategory = 'loading'
): void {
  perfMetricsCollector.trackWebVital(name, value, category);
  collectedVitals[name] = value;
}

export default {
  initWebVitals,
  getWebVitals,
  reportCustomVital
};
