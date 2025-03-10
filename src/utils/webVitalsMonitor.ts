
import { supabase } from '@/lib/supabaseClient';
import { handleError, ErrorCategory, ErrorSeverity, createSafeAsyncFunction } from './errorHandling';
import { validateDefined, validateString, validateOneOf, validateNumber } from './typeValidation';

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

// Initialize web vitals monitoring with enhanced error handling
export const initWebVitalsMonitoring = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    import('web-vitals').then(({ onCLS, onFID, onLCP, onTTFB, onINP }) => {
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
      
      onCLS(safeAnalytics, { reportAllChanges: false });
      onFID(safeAnalytics, { reportAllChanges: false });
      onLCP(safeAnalytics, { reportAllChanges: false });
      onTTFB(safeAnalytics, { reportAllChanges: false });
      onINP(safeAnalytics, { reportAllChanges: false });
      
      console.info('Web Vitals monitoring initialized');
    }).catch(error => {
      handleError(error, {
        context: 'Web Vitals',
        severity: ErrorSeverity.WARNING,
        category: ErrorCategory.RESOURCE,
        customMessage: 'Failed to load web-vitals library',
        showToast: false
      });
    });
  } catch (error) {
    handleError(error, {
      context: 'Web Vitals',
      category: ErrorCategory.UNEXPECTED,
      customMessage: 'Failed to initialize web vitals monitoring',
      showToast: false
    });
  }
};

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
    
    // Track performance metric
    const response = await fetch(`${supabase.supabaseUrl}/functions/v1/track-performance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
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

// Calculate performance score based on Web Vitals with validation
export const calculatePerformanceScore = (metrics: Record<string, number>): number => {
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
};

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
