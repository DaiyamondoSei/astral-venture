
/**
 * Web Vitals Monitor - Streamlined, efficient performance tracking
 */

// Basic performance marker storage
interface PerformanceMark {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

// Storage for performance marks
const marks: Map<string, PerformanceMark> = new Map();

/**
 * Mark the start of a performance measurement
 */
export function markStart(name: string): void {
  if (typeof performance === 'undefined') return;
  
  try {
    performance.mark(`app-${name}-start`);
    marks.set(name, {
      name,
      startTime: performance.now()
    });
  } catch (e) {
    console.error(`Error starting performance mark ${name}:`, e);
  }
}

/**
 * Mark the end of a performance measurement and record the duration
 * @returns The duration in milliseconds
 */
export function markEnd(name: string): number {
  if (typeof performance === 'undefined') return 0;
  
  try {
    performance.mark(`app-${name}-end`);
    
    const mark = marks.get(name);
    if (!mark) return 0;
    
    try {
      const measure = performance.measure(
        `app-${name}`,
        `app-${name}-start`,
        `app-${name}-end`
      );
      
      mark.endTime = performance.now();
      mark.duration = measure.duration;
      
      return measure.duration;
    } catch (e) {
      // Fallback if the measure fails
      const endTime = performance.now();
      const duration = endTime - mark.startTime;
      
      mark.endTime = endTime;
      mark.duration = duration;
      
      return duration;
    }
  } catch (e) {
    console.error(`Error ending performance mark ${name}:`, e);
    return 0;
  }
}

// LCP observer
let lcpObserver: PerformanceObserver | null = null;

// CLS values and entries
let clsValue = 0;
let clsEntries: PerformanceEntry[] = [];

// FID observer
let fidObserver: PerformanceObserver | null = null;

/**
 * Initialize Web Vitals monitoring
 */
export function initWebVitals(): void {
  if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') {
    console.warn('Web Vitals monitoring not supported in this environment');
    return;
  }

  try {
    // Clean up any existing observers first
    cleanupObservers();
    
    // LCP (Largest Contentful Paint)
    lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry;
      
      if (lastEntry) {
        const lcp = lastEntry.startTime;
        const lcpValue = Math.round(lcp);
        
        // Store in marks for reporting
        marks.set('LCP', {
          name: 'LCP',
          startTime: 0,
          endTime: lcpValue,
          duration: lcpValue
        });
        
        // Log performance classification
        classifyMetric('LCP', lcpValue, [2500, 4000]);
      }
    });
    
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    
    // CLS (Cumulative Layout Shift)
    const clsObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      
      entries.forEach(entry => {
        // Ignore layout shifts when user is interacting
        if (!(entry as any).hadRecentInput) {
          const currentEntry = entry as PerformanceEntry & { value: number };
          clsValue += currentEntry.value;
          clsEntries.push(currentEntry);
          
          // Store in marks for reporting
          marks.set('CLS', {
            name: 'CLS',
            startTime: 0,
            endTime: 0,
            duration: clsValue
          });
          
          // Log performance classification
          classifyMetric('CLS', clsValue, [0.1, 0.25]);
        }
      });
    });
    
    clsObserver.observe({ type: 'layout-shift', buffered: true });
    
    // FID (First Input Delay)
    fidObserver = new PerformanceObserver((entryList) => {
      const firstInput = entryList.getEntries()[0] as PerformanceEventTiming;
      
      if (firstInput) {
        const delay = firstInput.processingStart - firstInput.startTime;
        const fidValue = Math.round(delay);
        
        // Store in marks for reporting
        marks.set('FID', {
          name: 'FID',
          startTime: firstInput.startTime,
          endTime: firstInput.processingStart,
          duration: fidValue
        });
        
        // Log performance classification
        classifyMetric('FID', fidValue, [100, 300]);
      }
    });
    
    fidObserver.observe({ type: 'first-input', buffered: true });
    
    console.info('Web Vitals monitoring initialized');
  } catch (err) {
    console.warn('Performance observer for Web Vitals not fully supported:', err);
  }
}

/**
 * Cleanup observers to prevent memory leaks
 */
function cleanupObservers(): void {
  if (lcpObserver) {
    lcpObserver.disconnect();
    lcpObserver = null;
  }
  
  if (fidObserver) {
    fidObserver.disconnect();
    fidObserver = null;
  }
  
  // Reset CLS tracking
  clsValue = 0;
  clsEntries = [];
}

/**
 * Classify a metric's performance
 */
function classifyMetric(
  name: string, 
  value: number, 
  thresholds: [number, number]
): void {
  const [good, needsImprovement] = thresholds;
  
  if (value < good) {
    console.info(`${name}: ${value} - Good`);
  } else if (value < needsImprovement) {
    console.info(`${name}: ${value} - Needs Improvement`);
  } else {
    console.warn(`${name}: ${value} - Poor`);
  }
}

/**
 * Report all collected performance marks
 */
export function getPerformanceReport(): PerformanceMark[] {
  return Array.from(marks.values());
}

/**
 * Get a specific performance mark
 */
export function getPerformanceMark(name: string): PerformanceMark | undefined {
  return marks.get(name);
}

/**
 * Get core web vitals metrics
 */
export function getWebVitals(): Record<string, number> {
  const vitals: Record<string, number> = {};
  
  const lcp = marks.get('LCP');
  if (lcp?.duration) vitals.LCP = lcp.duration;
  
  const cls = marks.get('CLS');
  if (cls?.duration) vitals.CLS = cls.duration;
  
  const fid = marks.get('FID');
  if (fid?.duration) vitals.FID = fid.duration;
  
  return vitals;
}

/**
 * Clean up monitoring when no longer needed
 */
export function shutdown(): void {
  cleanupObservers();
  marks.clear();
}

export default {
  initWebVitals,
  markStart,
  markEnd,
  getPerformanceReport,
  getPerformanceMark,
  getWebVitals,
  shutdown
};
