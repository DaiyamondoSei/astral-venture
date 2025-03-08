import { performanceMonitor } from '../performance/performanceMonitor';

export interface RenderCostMetrics {
  totalRenders: number;
  averageRenderTime: number;
  longestRender: number;
  lastRenderTime: number;
  renderFrequency: number; // Renders per second
  totalRenderTimePercent: number; // % of total app time spent rendering
  inefficientRenderThreshold: number;
  inefficientRenderCount: number;
}

export interface RenderOptimizationSuggestion {
  type: 'memo' | 'callback' | 'state' | 'effect' | 'general';
  priority: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  code?: string;
}

export interface ComponentRenderAnalysis {
  component: string;
  metrics: RenderCostMetrics;
  suggestions: RenderOptimizationSuggestion[];
  recentRenders: {
    timestamp: number;
    duration: number;
    propsChanged?: boolean;
    stateChanged?: boolean;
  }[];
}

class RenderCostAnalyzer {
  private componentMetrics: Map<string, RenderCostMetrics> = new Map();
  private renderHistory: Map<string, {timestamp: number, duration: number}[]> = new Map();
  private startTime: number = Date.now();
  
  constructor() {
    // Initialize with empty metrics
    this.reset();
  }
  
  public recordRender(
    componentName: string, 
    renderTime: number, 
    props?: Record<string, any>,
    prevProps?: Record<string, any>,
    state?: Record<string, any>,
    prevState?: Record<string, any>
  ): void {
    // Get or initialize metrics for this component
    let metrics = this.componentMetrics.get(componentName);
    if (!metrics) {
      metrics = this.getInitialMetrics();
      this.componentMetrics.set(componentName, metrics);
    }
    
    // Update metrics
    metrics.totalRenders++;
    metrics.lastRenderTime = renderTime;
    metrics.averageRenderTime = (metrics.averageRenderTime * (metrics.totalRenders - 1) + renderTime) / metrics.totalRenders;
    metrics.longestRender = Math.max(metrics.longestRender, renderTime);
    
    // Check if this is an inefficient render
    if (renderTime > metrics.inefficientRenderThreshold) {
      metrics.inefficientRenderCount++;
    }
    
    // Update render frequency (renders per second)
    const totalTimeSeconds = (Date.now() - this.startTime) / 1000;
    metrics.renderFrequency = metrics.totalRenders / totalTimeSeconds;
    
    // Add to render history
    let history = this.renderHistory.get(componentName) || [];
    history.push({ timestamp: Date.now(), duration: renderTime });
    
    // Keep only the last 20 renders in history
    if (history.length > 20) {
      history = history.slice(history.length - 20);
    }
    
    this.renderHistory.set(componentName, history);
    
    // Calculate total app render time percentage
    const totalRenderTime = performanceMonitor.getMetrics().totalRenderTime;
    if (totalRenderTime > 0) {
      metrics.totalRenderTimePercent = (metrics.averageRenderTime * metrics.totalRenders) / totalRenderTime * 100;
    }
  }
  
  public getComponentAnalysis(componentName: string): ComponentRenderAnalysis | null {
    const metrics = this.componentMetrics.get(componentName);
    const history = this.renderHistory.get(componentName);
    
    if (!metrics || !history) {
      return null;
    }
    
    // Generate optimization suggestions
    const suggestions: RenderOptimizationSuggestion[] = [];
    
    // Check for frequent renders
    if (metrics.renderFrequency > 5) { // More than 5 renders per second
      suggestions.push({
        type: 'memo',
        priority: metrics.renderFrequency > 10 ? 'critical' : 'high',
        description: `Component renders very frequently (${metrics.renderFrequency.toFixed(1)} renders/sec). Consider using React.memo() or optimizing parent components.`
      });
    }
    
    // Check for long render times
    if (metrics.averageRenderTime > 16) { // More than one frame (16ms) on average
      suggestions.push({
        type: 'general',
        priority: metrics.averageRenderTime > 50 ? 'critical' : 'high',
        description: `Component has high average render time (${metrics.averageRenderTime.toFixed(1)}ms). Consider optimizing render function.`
      });
    }
    
    // Check for component taking up significant app render time
    if (metrics.totalRenderTimePercent > 30) {
      suggestions.push({
        type: 'general',
        priority: 'high',
        description: `Component accounts for ${metrics.totalRenderTimePercent.toFixed(1)}% of all render time. Consider optimizing or splitting into smaller components.`
      });
    }
    
    return {
      component: componentName,
      metrics,
      suggestions,
      recentRenders: history.map(h => ({ timestamp: h.timestamp, duration: h.duration }))
    };
  }
  
  public getAllComponentAnalyses(): ComponentRenderAnalysis[] {
    return Array.from(this.componentMetrics.keys()).map(component => {
      const analysis = this.getComponentAnalysis(component);
      return analysis || {
        component,
        metrics: this.getInitialMetrics(),
        suggestions: [],
        recentRenders: []
      };
    });
  }
  
  public getHighImpactComponents(): ComponentRenderAnalysis[] {
    return this.getAllComponentAnalyses()
      .filter(analysis => 
        analysis.metrics.totalRenderTimePercent > 10 || // Takes up more than 10% of render time
        analysis.metrics.renderFrequency > 3 || // Renders more than 3 times per second
        analysis.metrics.averageRenderTime > 16 // Takes more than one frame to render
      )
      .sort((a, b) => b.metrics.totalRenderTimePercent - a.metrics.totalRenderTimePercent);
  }
  
  public getComponentsWithFrequentRenders(): ComponentRenderAnalysis[] {
    return this.getAllComponentAnalyses()
      .filter(analysis => analysis.metrics.renderFrequency > 2) // More than 2 renders per second
      .sort((a, b) => b.metrics.renderFrequency - a.metrics.renderFrequency);
  }
  
  public getComponentsWithSlowRenders(): ComponentRenderAnalysis[] {
    return this.getAllComponentAnalyses()
      .filter(analysis => analysis.metrics.averageRenderTime > 16) // More than one frame
      .sort((a, b) => b.metrics.averageRenderTime - a.metrics.averageRenderTime);
  }
  
  public reset(): void {
    this.componentMetrics.clear();
    this.renderHistory.clear();
    this.startTime = Date.now();
  }
  
  private getInitialMetrics(): RenderCostMetrics {
    return {
      totalRenders: 0,
      averageRenderTime: 0,
      longestRender: 0,
      lastRenderTime: 0,
      renderFrequency: 0,
      totalRenderTimePercent: 0,
      inefficientRenderThreshold: 16, // One frame at 60fps
      inefficientRenderCount: 0
    };
  }
}

// Create singleton instance
export const renderCostAnalyzer = new RenderCostAnalyzer();
