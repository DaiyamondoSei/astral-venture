
import { supabase } from '@/lib/supabaseClient';
import { handleError } from './errorHandling';

// Web vitals metrics
export type WebVitalMetric = {
  name: string;
  value: number;
  category: 'loading' | 'interaction' | 'visual_stability';
  id?: string;
  delta?: number;
  navigationType?: string;
};

// Initialize web vitals monitoring
export const initWebVitalsMonitoring = () => {
  if (typeof window === 'undefined') return;
  
  try {
    import('web-vitals').then(({ onCLS, onFID, onLCP, onTTFB, onINP }) => {
      // Core Web Vitals
      onCLS(sendToAnalytics, { reportAllChanges: false });
      onFID(sendToAnalytics, { reportAllChanges: false });
      onLCP(sendToAnalytics, { reportAllChanges: false });
      onTTFB(sendToAnalytics, { reportAllChanges: false });
      onINP(sendToAnalytics, { reportAllChanges: false });
      
      console.log('Web Vitals monitoring initialized');
    }).catch(error => {
      handleError(error, {
        context: 'Web Vitals',
        severity: 'warning',
        customMessage: 'Failed to load web-vitals library'
      });
    });
  } catch (error) {
    handleError(error, {
      context: 'Web Vitals',
      customMessage: 'Failed to initialize web vitals monitoring'
    });
  }
};

// Send metrics to analytics
const sendToAnalytics = async (metric: WebVitalMetric) => {
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
  
  try {
    // Only send if user is authenticated
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    
    // Track performance metric
    await fetch(`${supabase.supabaseUrl}/functions/v1/track-performance`, {
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
          navigationType: metric.navigationType
        }
      })
    });
  } catch (error) {
    handleError(error, {
      context: 'Web Vitals Analytics',
      showToast: false,
      severity: 'warning'
    });
  }
};

// Calculate performance score based on Web Vitals
export const calculatePerformanceScore = (metrics: Record<string, number>): number => {
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
};
