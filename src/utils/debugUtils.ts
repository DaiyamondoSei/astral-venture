
/**
 * Development debugging utilities
 * These utilities are automatically disabled in production builds
 */

/**
 * Enhanced console logging that only works in development mode
 * Automatically adds context information and pretty formatting
 */
export const devLogger = {
  log: (context: string, ...args: any[]): void => {
    if (process.env.NODE_ENV !== 'development') return;
    console.log(`[${context}]`, ...args);
  },
  
  info: (context: string, ...args: any[]): void => {
    if (process.env.NODE_ENV !== 'development') return;
    console.info(`%c[${context}]`, 'color: #2563eb; font-weight: bold;', ...args);
  },
  
  warn: (context: string, ...args: any[]): void => {
    if (process.env.NODE_ENV !== 'development') return;
    console.warn(`%c[${context}]`, 'color: #d97706; font-weight: bold;', ...args);
  },
  
  error: (context: string, ...args: any[]): void => {
    if (process.env.NODE_ENV !== 'development') return;
    console.error(`%c[${context}]`, 'color: #dc2626; font-weight: bold;', ...args);
  },
  
  group: (context: string, ...args: any[]): void => {
    if (process.env.NODE_ENV !== 'development') return;
    console.group(`[${context}]`, ...args);
  },
  
  groupEnd: (): void => {
    if (process.env.NODE_ENV !== 'development') return;
    console.groupEnd();
  },
  
  table: (context: string, tabularData: any): void => {
    if (process.env.NODE_ENV !== 'development') return;
    console.log(`[${context}]`);
    console.table(tabularData);
  },
  
  trace: (context: string, ...args: any[]): void => {
    if (process.env.NODE_ENV !== 'development') return;
    console.log(`[${context} Trace]`, ...args);
    console.trace();
  }
};

/**
 * Component rendering tracker to detect excessive re-renders
 * @param componentName Name of the component to track
 * @param props Component props (optional)
 * @param limit Maximum number of renders before warning
 */
export function trackRenders(
  componentName: string, 
  props?: Record<string, any>,
  limit: number = 5
): (() => void) {
  if (process.env.NODE_ENV !== 'development') {
    return () => {}; // No-op in production
  }
  
  const renderCount = { current: 1 };
  const startTime = performance.now();
  
  devLogger.log(`Render Tracker`, `${componentName} rendered (count: ${renderCount.current})`);
  
  if (props) {
    devLogger.log(`Render Tracker`, `${componentName} props:`, props);
  }
  
  return () => {
    if (process.env.NODE_ENV !== 'development') return;
    
    renderCount.current++;
    
    if (renderCount.current > limit) {
      devLogger.warn(
        `Render Tracker`,
        `${componentName} has rendered ${renderCount.current} times in ${Math.round(performance.now() - startTime)}ms! This may indicate a performance issue.`
      );
    }
  };
}

/**
 * Performance measurement utility
 */
export const measure = {
  /**
   * Start measuring a performance metric
   */
  start: (label: string): void => {
    if (process.env.NODE_ENV !== 'development') return;
    performance.mark(`${label}-start`);
  },
  
  /**
   * End measuring a performance metric and log the result
   */
  end: (label: string, logThreshold: number = 0): void => {
    if (process.env.NODE_ENV !== 'development') return;
    
    performance.mark(`${label}-end`);
    performance.measure(label, `${label}-start`, `${label}-end`);
    
    const measurement = performance.getEntriesByName(label, 'measure')[0];
    const duration = measurement.duration;
    
    // Only log if duration exceeds threshold
    if (duration > logThreshold) {
      devLogger.info(
        'Performance',
        `${label}: ${duration.toFixed(2)}ms ${duration > 100 ? '⚠️' : ''}`
      );
    }
    
    // Clean up
    performance.clearMarks(`${label}-start`);
    performance.clearMarks(`${label}-end`);
    performance.clearMeasures(label);
  }
};

/**
 * Creates a development-only lifecycle hook marker
 * Helps track component lifecycle events during development
 */
export function devLifecycle(componentName: string): {
  mount: () => void;
  update: (props?: Record<string, any>) => void;
  unmount: () => void;
} {
  return {
    mount: () => {
      if (process.env.NODE_ENV !== 'development') return;
      devLogger.info('Lifecycle', `${componentName} mounted`);
    },
    update: (props?: Record<string, any>) => {
      if (process.env.NODE_ENV !== 'development') return;
      devLogger.info('Lifecycle', `${componentName} updated`, props ? { props } : '');
    },
    unmount: () => {
      if (process.env.NODE_ENV !== 'development') return;
      devLogger.info('Lifecycle', `${componentName} unmounted`);
    }
  };
}

/**
 * Logs when a component doesn't have proper type information
 */
export function logTypeIssue(componentName: string, message: string): void {
  if (process.env.NODE_ENV !== 'development') return;
  
  devLogger.warn('Type Safety', `${componentName}: ${message}`);
}
