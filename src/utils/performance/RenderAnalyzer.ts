
/**
 * Render Analysis and optimization utilities
 */

import { performanceMonitor } from './performanceMonitor';

export interface RenderMetrics {
  componentName: string;
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  renderFrequency: number;
  rerenderCauses: string[];
}

export interface RenderAnalysis {
  problematicComponents: string[];
  overrenderingComponents: RenderMetrics[];
  heavyComponents: RenderMetrics[];
  recommendations: string[];
}

class RenderAnalyzer {
  private renderMetrics: Map<string, RenderMetrics> = new Map();
  
  /**
   * Register a component render
   */
  registerRender(
    componentName: string, 
    renderTime: number, 
    props?: Record<string, any>,
    prevProps?: Record<string, any>
  ) {
    const metrics = this.renderMetrics.get(componentName) || {
      componentName,
      renderCount: 0,
      lastRenderTime: 0,
      averageRenderTime: 0,
      renderFrequency: 0,
      rerenderCauses: []
    };
    
    metrics.renderCount++;
    metrics.lastRenderTime = renderTime;
    metrics.averageRenderTime = 
      (metrics.averageRenderTime * (metrics.renderCount - 1) + renderTime) / metrics.renderCount;
    
    // Analyze props changes if available
    if (props && prevProps) {
      const changeReasons = this.detectPropChanges(props, prevProps);
      if (changeReasons.length > 0) {
        metrics.rerenderCauses = [...new Set([...metrics.rerenderCauses, ...changeReasons])];
      }
    }
    
    this.renderMetrics.set(componentName, metrics);
    
    // Report to performance monitor
    performanceMonitor.reportRender(componentName, renderTime);
  }
  
  /**
   * Find components with performance issues
   */
  findComponentsWithPerformanceIssues(): RenderAnalysis {
    const overrenderingThreshold = 10; // More than 10 renders in a short time
    const heavyRenderThreshold = 16; // More than 16ms average render time (60fps target)
    
    const overrenderingComponents: RenderMetrics[] = [];
    const heavyComponents: RenderMetrics[] = [];
    
    this.renderMetrics.forEach(metrics => {
      if (metrics.renderCount > overrenderingThreshold) {
        overrenderingComponents.push(metrics);
      }
      
      if (metrics.averageRenderTime > heavyRenderThreshold) {
        heavyComponents.push(metrics);
      }
    });
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(overrenderingComponents, heavyComponents);
    
    return {
      problematicComponents: [
        ...overrenderingComponents.map(m => m.componentName),
        ...heavyComponents.map(m => m.componentName)
      ],
      overrenderingComponents,
      heavyComponents,
      recommendations
    };
  }
  
  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(
    overrenderingComponents: RenderMetrics[],
    heavyComponents: RenderMetrics[]
  ): string[] {
    const recommendations: string[] = [];
    
    overrenderingComponents.forEach(component => {
      recommendations.push(
        `Consider memoizing ${component.componentName} with React.memo or useMemo to prevent unnecessary rerenders.`
      );
      
      if (component.rerenderCauses.includes('reference')) {
        recommendations.push(
          `Use useCallback or useMemo in parent component to stabilize prop references passed to ${component.componentName}.`
        );
      }
    });
    
    heavyComponents.forEach(component => {
      recommendations.push(
        `Optimize render performance of ${component.componentName} - consider code splitting or reducing complexity.`
      );
    });
    
    return recommendations;
  }
  
  /**
   * Detect which props changed
   */
  private detectPropChanges(
    newProps: Record<string, any>,
    prevProps: Record<string, any>
  ): string[] {
    const changes: string[] = [];
    
    Object.keys(newProps).forEach(key => {
      if (newProps[key] !== prevProps[key]) {
        if (
          typeof newProps[key] === 'function' || 
          typeof newProps[key] === 'object'
        ) {
          changes.push('reference');
        } else {
          changes.push('value');
        }
      }
    });
    
    return [...new Set(changes)];
  }
  
  /**
   * Clear metrics
   */
  clearMetrics() {
    this.renderMetrics.clear();
  }
  
  /**
   * Get metrics for a specific component
   */
  getComponentMetrics(componentName: string): RenderMetrics | undefined {
    return this.renderMetrics.get(componentName);
  }
  
  /**
   * Get all metrics
   */
  getAllMetrics(): RenderMetrics[] {
    return Array.from(this.renderMetrics.values());
  }
}

// Export a singleton instance
export const renderAnalyzer = new RenderAnalyzer();

// For compatibility with components expecting this interface
export default RenderAnalyzer;

// Also export the RenderAnalysis type
export type { RenderAnalysis };
