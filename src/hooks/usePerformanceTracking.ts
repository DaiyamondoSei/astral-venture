
import { useCallback, useEffect, useRef, useState } from 'react';
import performanceMonitor from '@/utils/performance/performanceMonitor';
import { ValidationError } from '@/utils/validation/ValidationError';
import { handleError, ErrorCategory, ErrorSeverity } from '@/utils/errorHandling';

// Type definitions
export interface PerformanceTrackingOptions {
  /** Automatically start monitoring when component mounts */
  autoStart?: boolean;
  /** Log slow renders to console */
  logSlowRenders?: boolean;
  /** Threshold in ms for what's considered a slow render */
  slowRenderThreshold?: number;
  /** Track component interactions automatically */
  trackInteractions?: boolean;
  /** Categories to track for this component */
  categories?: string[];
  /** Debug mode enables additional logging */
  debug?: boolean;
}

export interface InteractionTiming {
  name: string;
  duration: number;
  timestamp: number;
}

/**
 * Hook for tracking component performance metrics
 * 
 * @param componentName Name of the component to track
 * @param options Performance tracking options
 */
export function usePerformanceTracking(
  componentName: string,
  options: PerformanceTrackingOptions = {}
) {
  if (!componentName) {
    throw new ValidationError('Component name is required for performance tracking', {
      field: 'componentName',
      rule: 'required'
    });
  }
  
  const renderStartTime = useRef<number | null>(null);
  const renderCount = useRef(0);
  const recentInteractions = useRef<InteractionTiming[]>([]);
  const [isMonitoring, setIsMonitoring] = useState<boolean>(!!options.autoStart);
  const debugEnabled = options.debug ?? false;
  
  // Track render metrics
  useEffect(() => {
    if (!isMonitoring) return;
    
    try {
      renderStartTime.current = performance.now();
      renderCount.current++;

      // Use debug logging if enabled
      if (debugEnabled) {
        console.debug(`[Performance] ${componentName}: render #${renderCount.current} started`);
      }

      return () => {
        const endTime = performance.now();
        const renderTime = endTime - (renderStartTime.current || endTime);
        
        if (renderStartTime.current !== null) {
          performanceMonitor.recordRender(componentName, renderTime);
          
          if (options.logSlowRenders && renderTime > (options.slowRenderThreshold || 16)) {
            console.warn(
              `[Performance] Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`
            );
          }
          
          if (debugEnabled) {
            console.debug(`[Performance] ${componentName}: render completed in ${renderTime.toFixed(2)}ms`);
          }
        }
      };
    } catch (error) {
      handleError(error, {
        context: `Performance tracking in ${componentName}`,
        category: ErrorCategory.PERFORMANCE,
        severity: ErrorSeverity.WARNING,
        showToast: false
      });
      return undefined;
    }
  });

  // Setup monitoring based on options
  useEffect(() => {
    if (options.autoStart) {
      try {
        performanceMonitor.startMonitoring();
        setIsMonitoring(true);
        
        if (debugEnabled) {
          console.debug(`[Performance] Monitoring started for ${componentName}`);
        }
      } catch (error) {
        handleError(error, {
          context: `Performance monitoring initialization for ${componentName}`,
          category: ErrorCategory.PERFORMANCE,
          severity: ErrorSeverity.WARNING,
          showToast: false
        });
      }
    }

    // Register component
    performanceMonitor.registerComponent(componentName, options.categories || ['default']);

    // Clean up on component unmount
    return () => {
      try {
        // Only record unmount if we're tracking this component
        if (renderCount.current > 0) {
          performanceMonitor.recordUnmount(componentName);
          
          if (debugEnabled) {
            console.debug(`[Performance] ${componentName} unmounted after ${renderCount.current} renders`);
          }
        }
      } catch (error) {
        // Don't use handleError here as the component is unmounting
        console.error(`[Performance] Error during cleanup for ${componentName}:`, error);
      }
    };
  }, [componentName, options.autoStart, options.categories, debugEnabled]);

  /**
   * Record a user interaction with timing information
   */
  const recordInteraction = useCallback((interactionName: string, duration: number) => {
    if (!isMonitoring) return;
    
    try {
      const interaction = {
        name: interactionName,
        duration,
        timestamp: Date.now()
      };
      
      recentInteractions.current.push(interaction);
      
      // Limit the size of the interactions array
      if (recentInteractions.current.length > 20) {
        recentInteractions.current.shift();
      }
      
      performanceMonitor.recordEvent(
        'interaction', 
        `${componentName}:${interactionName}`, 
        duration
      );
      
      if (debugEnabled) {
        console.debug(`[Performance] ${componentName}: interaction "${interactionName}" took ${duration.toFixed(2)}ms`);
      }
    } catch (error) {
      handleError(error, {
        context: `Recording interaction "${interactionName}" for ${componentName}`,
        category: ErrorCategory.PERFORMANCE,
        severity: ErrorSeverity.WARNING,
        showToast: false
      });
    }
  }, [componentName, isMonitoring, debugEnabled]);

  /**
   * Start timing an interaction
   * @returns A function to stop timing and record the interaction
   */
  const startInteractionTiming = useCallback((interactionName: string) => {
    if (!isMonitoring) return () => {};
    
    const startTime = performance.now();
    
    if (debugEnabled) {
      console.debug(`[Performance] ${componentName}: starting interaction "${interactionName}"`);
    }
    
    return () => {
      try {
        const duration = performance.now() - startTime;
        recordInteraction(interactionName, duration);
        return duration;
      } catch (error) {
        handleError(error, {
          context: `Timing interaction "${interactionName}" for ${componentName}`,
          category: ErrorCategory.PERFORMANCE,
          severity: ErrorSeverity.WARNING,
          showToast: false
        });
        return 0;
      }
    };
  }, [isMonitoring, recordInteraction, componentName, debugEnabled]);

  /**
   * Start performance monitoring 
   */
  const startMonitoring = useCallback(() => {
    try {
      performanceMonitor.startMonitoring();
      setIsMonitoring(true);
      
      if (debugEnabled) {
        console.debug(`[Performance] Monitoring started for ${componentName}`);
      }
    } catch (error) {
      handleError(error, {
        context: `Starting performance monitoring for ${componentName}`,
        category: ErrorCategory.PERFORMANCE,
        severity: ErrorSeverity.WARNING,
        showToast: false
      });
    }
  }, [componentName, debugEnabled]);

  /**
   * Stop performance monitoring
   */
  const stopMonitoring = useCallback(() => {
    try {
      performanceMonitor.stopMonitoring();
      setIsMonitoring(false);
      
      if (debugEnabled) {
        console.debug(`[Performance] Monitoring stopped for ${componentName}`);
      }
    } catch (error) {
      handleError(error, {
        context: `Stopping performance monitoring for ${componentName}`,
        category: ErrorCategory.PERFORMANCE,
        severity: ErrorSeverity.WARNING,
        showToast: false
      });
    }
  }, [componentName, debugEnabled]);

  /**
   * Get metrics for a specific component
   */
  const getMetrics = useCallback(() => {
    try {
      return performanceMonitor.getComponentMetrics(componentName);
    } catch (error) {
      handleError(error, {
        context: `Getting metrics for ${componentName}`,
        category: ErrorCategory.PERFORMANCE,
        severity: ErrorSeverity.WARNING,
        showToast: false
      });
      return null;
    }
  }, [componentName]);

  /**
   * Reset metrics for this component
   */
  const resetComponentMetrics = useCallback(() => {
    try {
      performanceMonitor.resetComponentMetrics(componentName);
      
      if (debugEnabled) {
        console.debug(`[Performance] Metrics reset for ${componentName}`);
      }
    } catch (error) {
      handleError(error, {
        context: `Resetting metrics for ${componentName}`,
        category: ErrorCategory.PERFORMANCE,
        severity: ErrorSeverity.WARNING,
        showToast: false
      });
    }
  }, [componentName, debugEnabled]);

  return {
    // Core functionality
    recordInteraction,
    startInteractionTiming,
    startMonitoring,
    stopMonitoring,
    
    // Metrics and state
    getMetrics,
    resetMetrics: resetComponentMetrics,
    isMonitoring,
    
    // Debugging helpers
    debugMode: debugEnabled,
    recentInteractions: recentInteractions.current,
    renderCount: renderCount.current
  };
}

export default usePerformanceTracking;
