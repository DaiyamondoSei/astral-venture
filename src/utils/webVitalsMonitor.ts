
import { supabase } from '@/lib/supabaseClient';
import { handleError, ErrorCategory, ErrorSeverity, createSafeAsyncFunction } from './errorHandling';
import { 
  validateDefined, 
  validateString, 
  validateOneOf, 
  validateNumber 
} from './validation/runtimeValidation';

// Web vitals metrics
export type WebVitalMetric = {
  name: string;
  value: number;
  category: 'loading' | 'interaction' | 'visual_stability';
  id?: string;
  delta?: number;
  navigationType?: string;
};

// Validation schema for metrics
const validateWebVitalMetric = (metric: unknown, name: string): WebVitalMetric => {
  if (typeof metric !== 'object' || metric === null) {
    throw new Error(`${name} must be an object`);
  }
  
  const result = metric as Record<string, unknown>;
  
  return {
    name: validateString(result.name, `${name}.name`),
    value: validateNumber(result.value, `${name}.value`),
    category: validateOneOf(
      result.category as string, 
      ['loading', 'interaction', 'visual_stability'], 
      `${name}.category`
    ),
    id: result.id as string | undefined,
    delta: typeof result.delta === 'number' ? result.delta : undefined,
    navigationType: typeof result.navigationType === 'string' ? result.navigationType : undefined
  };
};

/**
 * Initialize web vitals monitoring
 * @returns A cleanup function
 */
export function initWebVitals(): () => void {
  if (typeof window === 'undefined') return () => {};
  
  try {
    const handleImport = async () => {
      try {
        const webVitals = await import('web-vitals');
        
        // Core Web Vitals with improved error handling
        const safeAnalytics = createSafeAsyncFunction(
          sendToAnalytics,
          {
            context: 'Web Vitals',
            severity: ErrorSeverity.WARNING,
            category: ErrorCategory.DATA_PROCESSING,
            showToast: false
          }
        );
        
        webVitals.onCLS(safeAnalytics, { reportAllChanges: false });
        webVitals.onFID(safeAnalytics, { reportAllChanges: false });
        webVitals.onLCP(safeAnalytics, { reportAllChanges: false });
        webVitals.onTTFB(safeAnalytics, { reportAllChanges: false });
        webVitals.onINP(safeAnalytics, { reportAllChanges: false });
        
        console.info('Web Vitals monitoring initialized');
      } catch (error) {
        handleError(error, {
          context: 'Web Vitals',
          severity: ErrorSeverity.WARNING,
          category: ErrorCategory.RESOURCE,
          customMessage: 'Failed to load web-vitals library',
          showToast: false
        });
      }
    };
    
    handleImport();
    
    return () => {
      // No specific cleanup needed
      console.info('Web Vitals monitoring stopped');
    };
  } catch (error) {
    handleError(error, {
      context: 'Web Vitals',
      category: ErrorCategory.UNEXPECTED,
      customMessage: 'Failed to initialize web vitals monitoring',
      showToast: false
    });
    return () => {};
  }
}

/**
 * Track component render time
 * @param componentName - Name of the component
 * @param renderTime - Time taken to render in ms
 * @param type - Type of render event
 */
export function trackComponentRender(
  componentName: string, 
  renderTime: number, 
  type: 'initial' | 'update' | 'effect' = 'update'
): void {
  try {
    // Log to console in development
    if (import.meta.env.DEV) {
      console.debug(`[PERF] ${componentName} ${type} render: ${renderTime.toFixed(2)}ms`);
    }
    
    // We could send this to an analytics service in production
  } catch (error) {
    // Silently fail for performance tracking
    console.error('Error tracking component render:', error);
  }
}

/**
 * Track web vital metric
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
    // Log to console in development
    if (import.meta.env.DEV) {
      console.debug(`[VITAL] ${name}: ${value} (${category})`);
    }
    
    // We could send this to an analytics service in production
  } catch (error) {
    // Silently fail for performance tracking
    console.error('Error tracking web vital:', error);
  }
}

/**
 * Mark the start of a performance measure
 * @param label - Measurement label
 */
export function markStart(label: string): void {
  if (typeof performance === 'undefined') return;
  performance.mark(`${label}:start`);
}

/**
 * Mark the end of a performance measure and record the duration
 * @param label - Measurement label
 * @returns Duration in milliseconds
 */
export function markEnd(label: string): number {
  if (typeof performance === 'undefined') return 0;
  
  try {
    performance.mark(`${label}:end`);
    performance.measure(label, `${label}:start`, `${label}:end`);
    
    const entries = performance.getEntriesByName(label);
    const duration = entries.length > 0 ? entries[0].duration : 0;
    
    // Clear marks and measures to avoid memory leaks
    performance.clearMarks(`${label}:start`);
    performance.clearMarks(`${label}:end`);
    performance.clearMeasures(label);
    
    return duration;
  } catch (error) {
    console.error(`Error measuring ${label}:`, error);
    return 0;
  }
}

// Send metrics to analytics with validation and error handling
const sendToAnalytics = async (rawMetric: unknown): Promise<void> => {
  try {
    // Validate metric structure
    const metric = validateWebVitalMetric(rawMetric, 'webVitalMetric');
    
    // Determine metric category
    let category: 'loading' | 'interaction' | 'visual_stability';
    switch (metric.name) {
      case 'CLS':
        category = 'visual_stability';
        break;
      case 'FID':
      case 'INP':
        category = 'interaction';
        break;
      case 'LCP':
      case 'TTFB':
      case 'FCP':
      default:
        category = 'loading';
    }
    
    // Get authenticated user
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      // Silently return if no authenticated user - we only track for authenticated users
      return;
    }
    
    // Get session
    const sessionResponse = await supabase.auth.getSession();
    const accessToken = sessionResponse.data.session?.access_token;
    
    if (!accessToken) {
      console.warn('No access token available for tracking performance metrics');
      return;
    }
    
    // Track performance metric using fetch API directly
    const response = await fetch(`${supabase.supabaseUrl}/functions/v1/track-performance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        componentName: 'WebVitals',
        metricName: metric.name,
        metricValue: metric.value,
        metricCategory: category,
        metadata: {
          delta: metric.delta,
          id: metric.id,
          navigationType: metric.navigationType,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to track performance metric: ${response.statusText}`);
    }
  } catch (error) {
    handleError(error, {
      context: 'Web Vitals Analytics',
      showToast: false,
      severity: ErrorSeverity.WARNING,
      category: ErrorCategory.DATA_PROCESSING
    });
  }
};

/**
 * Report collected metrics to the server
 * @returns Promise indicating success or failure
 */
export async function reportMetricsToServer(): Promise<boolean> {
  // Implementation would send batched metrics to server
  // This is a placeholder for now
  return true;
}

/**
 * Calculate performance score based on Web Vitals with validation
 */
export function calculatePerformanceScore(metrics: Record<string, number>): number {
  try {
    // Validate input
    validateDefined(metrics, 'metrics');
    
    // Weight each metric
    const weights = {
      LCP: 0.25, // Largest Contentful Paint
      FID: 0.25, // First Input Delay
      CLS: 0.15, // Cumulative Layout Shift
      TTFB: 0.15, // Time to First Byte
      INP: 0.2   // Interaction to Next Paint
    };
    
    // Score thresholds (good values)
    const thresholds = {
      LCP: 2500,   // ms (lower is better)
      FID: 100,    // ms (lower is better)
      CLS: 0.1,    // score (lower is better)
      TTFB: 800,   // ms (lower is better)
      INP: 200     // ms (lower is better)
    };
    
    let weightedScore = 0;
    let totalWeight = 0;
    
    // Calculate score for each available metric
    Object.entries(metrics).forEach(([name, value]) => {
      const key = name as keyof typeof weights;
      if (weights[key] && thresholds[key]) {
        // Convert to 0-100 scale (higher is better)
        let score = 100 - Math.min(100, (value / thresholds[key]) * 100);
        weightedScore += score * weights[key];
        totalWeight += weights[key];
      }
    });
    
    // Return normalized score or 0 if no metrics available
    return totalWeight > 0 ? weightedScore / totalWeight : 0;
  } catch (error) {
    handleError(error, {
      context: 'Performance Score Calculation',
      showToast: false,
      severity: ErrorSeverity.WARNING,
      category: ErrorCategory.DATA_PROCESSING
    });
    return 0; // Return 0 as fallback
  }
}

/**
 * Get performance grade based on score
 * @param score The performance score (0-100)
 * @returns A letter grade representing performance
 */
export function getPerformanceGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Format a web vital value for display with appropriate units
 */
export function formatWebVitalValue(name: string, value: number): string {
  switch (name) {
    case 'CLS':
      return value.toFixed(3); // No units for CLS
    case 'FID':
    case 'INP':
    case 'LCP':
    case 'TTFB':
      return `${Math.round(value)}ms`;
    default:
      return value.toString();
  }
}
