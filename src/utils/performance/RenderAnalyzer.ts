
import { devLogger } from '@/utils/debugUtils';
import { performanceMonitor } from './performanceMonitor';

export interface RenderSuggestion {
  type: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface ComponentRenderInsights {
  component: string;
  renderCount: number;
  averageRenderTime: number;
  lastRenderTime: number;
  renderFrequency: number;
  suggestions: RenderSuggestion[];
}

class RenderAnalyzer {
  private static instance: RenderAnalyzer;
  private componentSuggestions: Record<string, RenderSuggestion[]> = {};
  
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
   * Analyze component render performance
   */
  public analyzeComponent(componentName: string): RenderSuggestion[] {
    const metrics = performanceMonitor.getComponentMetrics(componentName);
    if (!metrics) return [];
    
    const suggestions: RenderSuggestion[] = [];
    
    // Calculate render frequency (renders per second)
    const appRuntime = (Date.now() - performanceMonitor.getMetrics().startTime) / 1000;
    const renderFrequency = metrics.renders / Math.max(appRuntime, 1);
    
    // Check for frequent renders
    if (renderFrequency > 5) {
      suggestions.push({
        type: 'memo',
        description: `Component renders very frequently (${renderFrequency.toFixed(1)} renders/sec). Consider using React.memo() or checking for unnecessary parent re-renders.`,
        priority: renderFrequency > 10 ? 'critical' : 'high'
      });
    }
    
    // Check for slow renders
    if (metrics.averageRenderTime > 16) {
      suggestions.push({
        type: 'complexity',
        description: `Component has slow average render time (${metrics.averageRenderTime.toFixed(1)}ms). Consider optimizing the render function or splitting into smaller components.`,
        priority: metrics.averageRenderTime > 50 ? 'critical' : 'high'
      });
    }
    
    // Many renders with slow average could indicate a bad pattern
    if (metrics.renders > 10 && metrics.averageRenderTime > 10) {
      suggestions.push({
        type: 'state',
        description: 'Component combines frequent rendering with slow render times. Consider reviewing state management and component structure.',
        priority: 'high'
      });
    }
    
    // Store suggestions for this component
    this.componentSuggestions[componentName] = suggestions;
    
    return suggestions;
  }
  
  /**
   * Get insights for a specific component
   */
  public getComponentInsights(componentName: string): ComponentRenderInsights | null {
    const metrics = performanceMonitor.getComponentMetrics(componentName);
    if (!metrics) return null;
    
    // Calculate render frequency (renders per second)
    const appRuntime = (Date.now() - performanceMonitor.getMetrics().startTime) / 1000;
    const renderFrequency = metrics.renders / Math.max(appRuntime, 1);
    
    // Get or generate suggestions
    let suggestions = this.componentSuggestions[componentName];
    if (!suggestions) {
      suggestions = this.analyzeComponent(componentName);
    }
    
    return {
      component: componentName,
      renderCount: metrics.renders,
      averageRenderTime: metrics.averageRenderTime,
      lastRenderTime: metrics.lastRenderTime,
      renderFrequency,
      suggestions
    };
  }
  
  /**
   * Find components with performance issues
   */
  public findComponentsWithPerformanceIssues(): ComponentRenderInsights[] {
    const allMetrics = performanceMonitor.getMetrics();
    const componentNames = Object.keys(allMetrics.componentMetrics);
    
    const insights: ComponentRenderInsights[] = [];
    
    for (const name of componentNames) {
      const componentInsights = this.getComponentInsights(name);
      if (componentInsights && componentInsights.suggestions.length > 0) {
        insights.push(componentInsights);
      }
    }
    
    // Sort by priority
    return insights.sort((a, b) => {
      const aMaxPriority = Math.max(
        ...a.suggestions.map(s => this.getPriorityValue(s.priority))
      );
      const bMaxPriority = Math.max(
        ...b.suggestions.map(s => this.getPriorityValue(s.priority))
      );
      
      return bMaxPriority - aMaxPriority;
    });
  }
  
  /**
   * Convert priority string to numeric value for sorting
   */
  private getPriorityValue(priority: string): number {
    switch (priority) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }
  
  /**
   * Reset all stored insights
   */
  public reset(): void {
    this.componentSuggestions = {};
    devLogger.log('RenderAnalyzer', 'Render analysis data reset');
  }
}

// Export singleton instance
export const renderAnalyzer = RenderAnalyzer.getInstance();
