import { performanceMonitor } from '@/utils/performance/performanceMonitor';
import { DeviceCapability } from '@/utils/performanceUtils';

export interface RenderCostReport {
  totalComponents: number;
  totalRenders: number;
  totalRenderTime: number;
  averageRenderTime: number;
  expensiveComponents: ExpensiveComponent[];
  frequentComponents: FrequentComponent[];
  deviceCategory: DeviceCapability;
  recommendations: string[];
}

export interface ExpensiveComponent {
  name: string;
  renderTime: number;
  renderCount: number;
  totalCost: number;
}

export interface FrequentComponent {
  name: string;
  renderCount: number;
  averageRenderTime: number;
  totalCost: number;
}

/**
 * Analyzer for component render cost and performance impact
 */
export class RenderCostAnalyzer {
  private static instance: RenderCostAnalyzer;
  private lastAnalysisTime: number = 0;
  private lastReport: RenderCostReport | null = null;
  private analysisInterval: number = 5000; // 5 seconds

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): RenderCostAnalyzer {
    if (!RenderCostAnalyzer.instance) {
      RenderCostAnalyzer.instance = new RenderCostAnalyzer();
    }
    return RenderCostAnalyzer.instance;
  }

  /**
   * Analyze render cost of all components
   */
  public analyzeRenderCost(): RenderCostReport {
    const now = Date.now();
    
    // Return cached report if it's recent enough
    if (this.lastReport && now - this.lastAnalysisTime < this.analysisInterval) {
      return this.lastReport;
    }
    
    // Get metrics from performance monitor
    const metrics = performanceMonitor.getMetrics();
    
    // Calculate total render time from component metrics
    let totalRenderTime = 0;
    Object.values(metrics.components).forEach(component => {
      totalRenderTime += component.averageRenderTime * component.renderCount;
    });
    
    // Calculate total renders
    const totalRenders = Object.values(metrics.components).reduce(
      (sum, component) => sum + component.renderCount, 
      0
    );
    
    // Calculate average render time
    const averageRenderTime = totalRenders > 0 
      ? totalRenderTime / totalRenders 
      : 0;
    
    // Find expensive components (high render time)
    const expensiveComponents: ExpensiveComponent[] = Object.values(metrics.components)
      .filter(component => component.averageRenderTime > 10)
      .map(component => ({
        name: component.componentName,
        renderTime: component.averageRenderTime,
        renderCount: component.renderCount,
        totalCost: component.averageRenderTime * component.renderCount
      }))
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, 5);
    
    // Find frequently rendering components
    const frequentComponents: FrequentComponent[] = Object.values(metrics.components)
      .filter(component => component.renderCount > 20)
      .map(component => ({
        name: component.componentName,
        renderCount: component.renderCount,
        averageRenderTime: component.averageRenderTime,
        totalCost: component.averageRenderTime * component.renderCount
      }))
      .sort((a, b) => b.renderCount - a.renderCount)
      .slice(0, 5);
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    if (expensiveComponents.length > 0) {
      recommendations.push(
        `Optimize the render performance of ${expensiveComponents[0].name} which takes ${expensiveComponents[0].renderTime.toFixed(2)}ms per render`
      );
    }
    
    if (frequentComponents.length > 0) {
      recommendations.push(
        `Reduce unnecessary renders in ${frequentComponents[0].name} which renders ${frequentComponents[0].renderCount} times`
      );
    }
    
    if (totalRenders > 500) {
      recommendations.push(
        'Consider implementing React.memo for components that render frequently'
      );
    }
    
    if (averageRenderTime > 16) {
      recommendations.push(
        'Overall render performance is poor. Look for expensive operations in render functions'
      );
    }
    
    // Determine device capability
    const deviceCategory = this.getDeviceCapability();
    
    // Create report
    const report: RenderCostReport = {
      totalComponents: Object.keys(metrics.components).length,
      totalRenders,
      totalRenderTime,
      averageRenderTime,
      expensiveComponents,
      frequentComponents,
      deviceCategory,
      recommendations
    };
    
    // Cache report
    this.lastReport = report;
    this.lastAnalysisTime = now;
    
    return report;
  }
  
  /**
   * Get device capability category
   */
  private getDeviceCapability(): DeviceCapability {
    // Simple detection based on user agent and hardware
    if (typeof window === 'undefined') return DeviceCapability.MEDIUM;
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const cpuCores = navigator.hardwareConcurrency || 2;
    
    if (isMobile && cpuCores <= 4) {
      return DeviceCapability.LOW;
    } else if (cpuCores >= 8) {
      return DeviceCapability.HIGH;
    } else {
      return DeviceCapability.MEDIUM;
    }
  }
  
  /**
   * Check if a component is rendering too frequently
   */
  public isRenderingTooFrequently(componentName: string, threshold: number = 20): boolean {
    const metrics = performanceMonitor.getComponentMetrics(componentName);
    if (!metrics) return false;
    
    return metrics.renderCount > threshold;
  }
  
  /**
   * Check if a component is too expensive to render
   */
  public isRenderTooExpensive(componentName: string, threshold: number = 16): boolean {
    const metrics = performanceMonitor.getComponentMetrics(componentName);
    if (!metrics) return false;
    
    return metrics.averageRenderTime > threshold;
  }
  
  /**
   * Get optimization suggestions for a component
   */
  public getOptimizationSuggestions(componentName: string): string[] {
    const metrics = performanceMonitor.getComponentMetrics(componentName);
    if (!metrics) return [];
    
    const suggestions: string[] = [];
    
    if (metrics.renderCount > 30 && !componentName.includes('Memo')) {
      suggestions.push('Use React.memo to prevent unnecessary re-renders');
    }
    
    if (metrics.averageRenderTime > 10) {
      suggestions.push('Look for expensive operations in the render function');
      suggestions.push('Consider using useMemo for expensive calculations');
    }
    
    if (metrics.renderCount > 50) {
      suggestions.push('Check for missing dependency arrays in useEffect or useCallback');
      suggestions.push('Verify that state updates are not happening in render');
    }
    
    return suggestions;
  }
}

// Export singleton instance
export const renderCostAnalyzer = RenderCostAnalyzer.getInstance();
