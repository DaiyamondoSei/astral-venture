
import { ErrorCategory, ErrorSeverity, handleError } from '../errorHandling';

/**
 * Analyzes the render cost of components to prevent performance issues
 * 
 * This utility helps identify components with potentially expensive render costs
 * to prevent performance degradation and improve user experience.
 */
export class RenderCostAnalyzer {
  private costThresholds: {
    warning: number;
    error: number;
  };
  
  private renderTimes: Map<string, number> = new Map();
  
  /**
   * Creates a new RenderCostAnalyzer with configurable thresholds
   * 
   * @param warningThreshold - Time in ms that triggers a warning (default: 16ms - one frame)
   * @param errorThreshold - Time in ms that triggers an error report (default: 50ms)
   */
  constructor(warningThreshold = 16, errorThreshold = 50) {
    this.costThresholds = {
      warning: warningThreshold,
      error: errorThreshold
    };
  }
  
  /**
   * Records the render time for a component
   * 
   * @param componentName - Name of the component being measured
   * @param renderTimeMs - Time in milliseconds the render took
   */
  public recordRenderTime(componentName: string, renderTimeMs: number): void {
    this.renderTimes.set(componentName, renderTimeMs);
    this.evaluateRenderCost(componentName, renderTimeMs);
  }
  
  /**
   * Evaluates the render cost against thresholds and reports issues
   * 
   * @param componentName - Name of the component being evaluated
   * @param renderTimeMs - Render time in milliseconds
   */
  private evaluateRenderCost(componentName: string, renderTimeMs: number): void {
    if (renderTimeMs >= this.costThresholds.error) {
      handleError(
        new Error(`Component ${componentName} has excessive render time: ${renderTimeMs.toFixed(2)}ms`),
        {
          category: ErrorCategory.PERFORMANCE,
          severity: ErrorSeverity.WARNING,
          context: 'RenderCostAnalyzer',
          customMessage: `High render time detected in ${componentName}`,
          showToast: false
        }
      );
    } else if (renderTimeMs >= this.costThresholds.warning) {
      console.warn(
        `Component ${componentName} has high render time: ${renderTimeMs.toFixed(2)}ms. ` +
        `Consider optimizing with useMemo, useCallback or component splitting.`
      );
    }
  }
  
  /**
   * Gets the average render time for a component
   * 
   * @param componentName - Name of the component to check
   * @returns The average render time or null if no data
   */
  public getAverageRenderTime(componentName: string): number | null {
    return this.renderTimes.has(componentName) 
      ? this.renderTimes.get(componentName) || null 
      : null;
  }
  
  /**
   * Creates a performance report for all measured components
   * 
   * @returns A sorted array of components and their render times
   */
  public generateRenderReport(): Array<{component: string; renderTime: number}> {
    const report: Array<{component: string; renderTime: number}> = [];
    
    this.renderTimes.forEach((time, component) => {
      report.push({component, renderTime: time});
    });
    
    // Sort by render time (highest first)
    return report.sort((a, b) => b.renderTime - a.renderTime);
  }
  
  /**
   * Identifies potential optimization targets based on render times
   * 
   * @returns Array of components that could benefit from optimization
   */
  public getOptimizationTargets(): string[] {
    const targets: string[] = [];
    
    this.renderTimes.forEach((time, component) => {
      if (time >= this.costThresholds.warning) {
        targets.push(component);
      }
    });
    
    return targets;
  }
  
  /**
   * Resets all collected render time data
   */
  public reset(): void {
    this.renderTimes.clear();
  }
  
  /**
   * Creates a hook wrapper for measuring render times
   * 
   * @returns A hook that can be used to measure component render times
   */
  public createRenderTimeHook() {
    const analyzer = this;
    
    return function useRenderTime(componentName: string) {
      return {
        measureRender(callback: () => void): void {
          const startTime = performance.now();
          callback();
          const endTime = performance.now();
          analyzer.recordRenderTime(componentName, endTime - startTime);
        }
      };
    };
  }
}

export default RenderCostAnalyzer;
