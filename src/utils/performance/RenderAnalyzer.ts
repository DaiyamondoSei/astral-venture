
import { performanceMonitor } from './performanceMonitor';

export enum RenderFrequency {
  NORMAL = 'normal',
  FREQUENT = 'frequent',
  EXCESSIVE = 'excessive'
}

export interface RenderAnalysis {
  componentName: string;
  renderFrequency: RenderFrequency;
  lastRenderTime: number;
  averageRenderTime: number;
  totalRenders: number;
  possibleOptimizations: string[];
}

export interface ComponentRenderData {
  componentName: string;
  renderTime: number;
  renderCount: number;
}

/**
 * Analyzer for component render performance
 */
export class RenderAnalyzer {
  private static instance: RenderAnalyzer;

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): RenderAnalyzer {
    if (!RenderAnalyzer.instance) {
      RenderAnalyzer.instance = new RenderAnalyzer();
    }
    return RenderAnalyzer.instance;
  }

  /**
   * Analyze component rendering performance
   */
  public analyzeComponent(component: ComponentRenderData): RenderAnalysis {
    const { componentName, renderTime, renderCount } = component;
    
    // Get full metrics from performance monitor if available
    const metrics = performanceMonitor.getComponentMetrics();
    const metricData = metrics[componentName] || {
      componentName,
      renderCount: 0,
      averageRenderTime: 0
    };
    
    const lastRenderTime = renderTime;
    const averageRenderTime = metricData.averageRenderTime || renderTime;
    
    // Determine render frequency
    let renderFrequency = RenderFrequency.NORMAL;
    if (renderCount > 100) {
      renderFrequency = RenderFrequency.EXCESSIVE;
    } else if (renderCount > 50) {
      renderFrequency = RenderFrequency.FREQUENT;
    }
    
    // Generate optimization suggestions
    const possibleOptimizations: string[] = [];
    
    // Check for possible React.memo optimization
    if (renderCount > 30 && !componentName.includes('Memo')) {
      possibleOptimizations.push('Consider using React.memo to prevent unnecessary re-renders');
    }
    
    // Check for dependency array optimization
    if (renderCount > 20 && averageRenderTime > 5) {
      possibleOptimizations.push('Review useEffect and useCallback dependency arrays for potential optimization');
    }
    
    // Check for expensive calculations
    if (averageRenderTime > 15) {
      possibleOptimizations.push('Move expensive calculations to useMemo or move outside the component');
    }
    
    // Check for potential virtualization
    if (componentName.includes('List') || componentName.includes('Table')) {
      possibleOptimizations.push('Consider virtualization for large lists (react-window or react-virtualized)');
    }
    
    return {
      componentName,
      renderFrequency,
      lastRenderTime,
      averageRenderTime,
      totalRenders: renderCount,
      possibleOptimizations
    };
  }

  /**
   * Find components with performance issues
   */
  public findComponentsWithPerformanceIssues(): ComponentRenderData[] {
    const metrics = performanceMonitor.getComponentMetrics();
    
    return Object.values(metrics)
      .filter(metric => {
        if (!metric) return false;
        
        // Safe access to properties with type checking
        const renderCount = typeof metric === 'object' && metric.renderCount ? metric.renderCount : 0;
        const averageRenderTime = typeof metric === 'object' && metric.averageRenderTime ? metric.averageRenderTime : 0;
        
        // Components with excessive renders or slow render times
        return (renderCount > 50 || averageRenderTime > 16);
      })
      .map(metric => {
        // Safe mapping with defaults for missing values
        const componentName = typeof metric === 'object' && metric.componentName ? metric.componentName : 'unknown';
        const averageRenderTime = typeof metric === 'object' && metric.averageRenderTime ? metric.averageRenderTime : 0;
        const renderCount = typeof metric === 'object' && metric.renderCount ? metric.renderCount : 0;
        
        return {
          componentName,
          renderTime: averageRenderTime,
          renderCount
        };
      })
      .sort((a, b) => b.renderTime - a.renderTime);
  }
}

// Export the singleton instance
export const renderAnalyzer = RenderAnalyzer.getInstance();
