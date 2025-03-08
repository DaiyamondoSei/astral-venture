
/**
 * Debug logger with different log levels
 * Only logs in development environment
 */
export const devLogger = {
  log: (context: string, message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== 'development') return;
    console.log(`[${context}]`, message, ...args);
  },
  
  info: (context: string, message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== 'development') return;
    console.info(`[${context}]`, message, ...args);
  },
  
  warn: (context: string, message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== 'development') return;
    console.warn(`[${context}]`, message, ...args);
  },
  
  error: (context: string, message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== 'development') return;
    console.error(`[${context}]`, message, ...args);
  },
  
  group: (context: string, title: string) => {
    if (process.env.NODE_ENV !== 'development') return;
    console.group(`[${context}] ${title}`);
  },
  
  groupEnd: () => {
    if (process.env.NODE_ENV !== 'development') return;
    console.groupEnd();
  },
  
  // Log component lifecycle events
  renderStart: (componentName: string) => {
    if (process.env.NODE_ENV !== 'development') return;
    console.debug(`[${componentName}] Render started`);
  },
  
  renderComplete: (componentName: string, duration: number) => {
    if (process.env.NODE_ENV !== 'development') return;
    console.debug(`[${componentName}] Render completed in ${duration.toFixed(2)}ms`);
  }
};

/**
 * Format a value for display in logs or errors
 */
export function formatValue(value: any): string {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  
  if (typeof value === 'function') {
    return 'function() {...}';
  }
  
  if (typeof value === 'object') {
    try {
      const str = JSON.stringify(value);
      if (str.length > 50) {
        return str.substring(0, 47) + '...';
      }
      return str;
    } catch (e) {
      return Object.prototype.toString.call(value);
    }
  }
  
  return String(value);
}

/**
 * Check if running in development environment
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Create a debuggable version of a function that logs inputs/outputs
 */
export function createDebugFunction<T extends (...args: any[]) => any>(
  fn: T,
  functionName: string,
  context: string
): T {
  if (!isDevelopment()) return fn;
  
  return ((...args: any[]) => {
    devLogger.group(context, `${functionName} called`);
    console.debug('Arguments:', args);
    
    try {
      const result = fn(...args);
      
      if (result instanceof Promise) {
        result
          .then(resolvedValue => {
            console.debug('Async Result:', resolvedValue);
            devLogger.groupEnd();
            return resolvedValue;
          })
          .catch(error => {
            console.error('Error:', error);
            devLogger.groupEnd();
            throw error;
          });
        
        return result;
      } else {
        console.debug('Result:', result);
        devLogger.groupEnd();
        return result;
      }
    } catch (error) {
      console.error('Error:', error);
      devLogger.groupEnd();
      throw error;
    }
  }) as T;
}
