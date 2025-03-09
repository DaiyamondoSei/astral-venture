
/**
 * Simplified Web Vitals Monitor
 * 
 * Lightweight performance monitoring for essential metrics.
 */

// Basic performance marker storage
interface PerformanceMark {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

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

/**
 * Initialize Web Vitals monitoring with a minimal footprint
 */
export function initWebVitals(): void {
  if (typeof window === 'undefined') return;
  
  // Register performance observer for Core Web Vitals if supported
  if ('PerformanceObserver' in window) {
    try {
      // LCP (Largest Contentful Paint)
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        if (lastEntry) {
          const lcp = lastEntry.startTime;
          const lcpValue = Math.round(lcp);
          console.log(`LCP: ${lcpValue}ms`);
          
          // Automatically classify performance
          if (lcpValue < 2500) {
            console.log('LCP: Good');
          } else if (lcpValue < 4000) {
            console.log('LCP: Needs Improvement');
          } else {
            console.log('LCP: Poor');
          }
        }
      });
      
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      
      // CLS (Cumulative Layout Shift)
      let clsValue = 0;
      let clsEntries: PerformanceEntry[] = [];
      
      const clsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        
        entries.forEach(entry => {
          // Ignore layout shifts when user is interacting
          if (!(entry as any).hadRecentInput) {
            const currentEntry = entry as PerformanceEntry & { value: number };
            clsValue += currentEntry.value;
            clsEntries.push(currentEntry);
          }
        });
        
        console.log(`Current CLS: ${clsValue.toFixed(3)}`);
        
        // Classify CLS
        if (clsValue < 0.1) {
          console.log('CLS: Good');
        } else if (clsValue < 0.25) {
          console.log('CLS: Needs Improvement');
        } else {
          console.log('CLS: Poor');
        }
      });
      
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      
      // FID (First Input Delay)
      const fidObserver = new PerformanceObserver((entryList) => {
        const firstInput = entryList.getEntries()[0];
        if (firstInput) {
          const delay = (firstInput as PerformanceEventTiming).processingStart - firstInput.startTime;
          const fidValue = Math.round(delay);
          
          console.log(`FID: ${fidValue}ms`);
          
          // Classify FID
          if (fidValue < 100) {
            console.log('FID: Good');
          } else if (fidValue < 300) {
            console.log('FID: Needs Improvement');
          } else {
            console.log('FID: Poor');
          }
        }
      });
      
      fidObserver.observe({ type: 'first-input', buffered: true });
      
      console.log('Web Vitals monitoring initialized');
    } catch (err) {
      console.warn('Performance observer for Web Vitals not fully supported');
    }
  } else {
    console.warn('PerformanceObserver not supported - Web Vitals will not be measured');
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

export default {
  initWebVitals,
  markStart,
  markEnd,
  getPerformanceReport,
  getPerformanceMark
};
