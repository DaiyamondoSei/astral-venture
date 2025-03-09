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
  private isEnabled: boolean = process.env.NODE_ENV === 'development';
  
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
    // Skip if disabled or not in development
    if (!this.isEnabled) return;
    
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
    
    // Add to render history, but keep it smaller (10 entries max)
    let history = this.renderHistory.get(componentName) || [];
    history.push({ timestamp: Date.now(), duration: renderTime });
    
    // Keep only the last 10 renders in history instead of 20
    if (history.length > 10) {
      history = history.slice(history.length - 10);
    }
    
    this.renderHistory.set(componentName, history);
    
    // Calculate total app render time percentage
    const totalRenderTime = performanceMonitor.getMetrics().totalRenderTime;
    if (totalRenderTime > 0) {
      metrics.totalRenderTimePercent = (metrics.averageRenderTime * metrics.totalRenders) / totalRenderTime * 100;
    }
  }
  
  public getComponentAnalysis(componentName: string): ComponentRenderAnalysis | null {
    // Skip if disabled
    if (!this.isEnabled) return null;
    
    const metrics = this.componentMetrics.get(componentName);
    const history = this.renderHistory.get(componentName);
    
    if (!metrics || !history) {
      return null;
    }
    
    // Generate optimization suggestions, but only for significant issues
    const suggestions: RenderOptimizationSuggestion[] = [];
    
    // Only check for very frequent renders (higher threshold)
    if (metrics.renderFrequency > 8) { // More than 8 renders per second
      suggestions.push({
        type: 'memo',
        priority: metrics.renderFrequency > 15 ? 'critical' : 'high',
        description: `Component renders very frequently (${metrics.renderFrequency.toFixed(1)} renders/sec). Consider using React.memo() or optimizing parent components.`
      });
    }
    
    // Only check for very long render times (higher threshold)
    if (metrics.averageRenderTime > 25) { // More than 25ms on average
      suggestions.push({
        type: 'general',
        priority: metrics.averageRenderTime > 50 ? 'critical' : 'high',
        description: `Component has high average render time (${metrics.averageRenderTime.toFixed(1)}ms). Consider optimizing render function.`
      });
    }
    
    // Only check for very significant render time percentage
    if (metrics.totalRenderTimePercent > 40) {
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
    // Skip if disabled
    if (!this.isEnabled) return [];
    
    // Only process the most concerning components
    const topComponents = Array.from(this.componentMetrics.entries())
      .sort((a, b) => b[1].totalRenderTimePercent - a[1].totalRenderTimePercent)
      .slice(0, 10) // Only analyze top 10 components instead of all
      .map(([component]) => component);
    
    return topComponents.map(component => {
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
    // Skip if disabled
    if (!this.isEnabled) return [];
    
    return this.getAllComponentAnalyses()
      .filter(analysis => 
        analysis.metrics.totalRenderTimePercent > 15 || // Takes up more than 15% of render time
        analysis.metrics.renderFrequency > 5 || // Renders more than 5 times per second
        analysis.metrics.averageRenderTime > 25 // Takes more than 25ms to render
      )
      .sort((a, b) => b.metrics.totalRenderTimePercent - a.metrics.totalRenderTimePercent)
      .slice(0, 5); // Limit to 5 components
  }
  
  public getComponentsWithFrequentRenders(): ComponentRenderAnalysis[] {
    // Skip if disabled
    if (!this.isEnabled) return [];
    
    return this.getAllComponentAnalyses()
      .filter(analysis => analysis.metrics.renderFrequency > 5) // More than 5 renders per second
      .sort((a, b) => b.metrics.renderFrequency - a.metrics.renderFrequency)
      .slice(0, 5); // Limit to 5 components
  }
  
  public getComponentsWithSlowRenders(): ComponentRenderAnalysis[] {
    // Skip if disabled
    if (!this.isEnabled) return [];
    
    return this.getAllComponentAnalyses()
      .filter(analysis => analysis.metrics.averageRenderTime > 25) // More than 25ms
      .sort((a, b) => b.metrics.averageRenderTime - a.metrics.averageRenderTime)
      .slice(0, 5); // Limit to 5 components
  }
  
  public reset(): void {
    this.componentMetrics.clear();
    this.renderHistory.clear();
    this.startTime = Date.now();
  }
  
  // Auto-reset every 5 minutes to prevent memory buildup
  public startAutoReset(): void {
    if (!this.isEnabled) return;
    
    // Every 5 minutes, clear old data to prevent memory issues
    setInterval(() => {
      // Only reset if we have more than 20 components tracked
      if (this.componentMetrics.size > 20) {
        // Keep only the components with high impact
        const highImpactComponents = this.getHighImpactComponents().map(a => a.component);
        
        // Create new Maps with only the high impact components
        const newMetrics = new Map<string, RenderCostMetrics>();
        const newHistory = new Map<string, {timestamp: number, duration: number}[]>();
        
        highImpactComponents.forEach(component => {
          const metrics = this.componentMetrics.get(component);
          const history = this.renderHistory.get(component);
          
          if (metrics) newMetrics.set(component, metrics);
          if (history) newHistory.set(component, history);
        });
        
        this.componentMetrics = newMetrics;
        this.renderHistory = newHistory;
      }
    }, 300000); // 5 minutes
  }
  
  private getInitialMetrics(): RenderCostMetrics {
    return {
      totalRenders: 0,
      averageRenderTime: 0,
      longestRender: 0,
      lastRenderTime: 0,
      renderFrequency: 0,
      totalRenderTimePercent: 0,
      inefficientRenderThreshold: 25, // Increased from 16 to 25ms
      inefficientRenderCount: 0
    };
  }
  
  // Method to enable/disable the analyzer
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled && process.env.NODE_ENV === 'development';
  }
}

// Create singleton instance
export const renderCostAnalyzer = new RenderCostAnalyzer();

// Start auto-reset to prevent memory issues
if (process.env.NODE_ENV === 'development') {
  renderCostAnalyzer.startAutoReset();
}
