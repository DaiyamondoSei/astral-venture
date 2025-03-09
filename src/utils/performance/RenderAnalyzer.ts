
import { performanceMonitor } from './performanceMonitor';

export interface ComponentRenderMetrics {
  componentName: string;
  renderCount: number;
  averageRenderTime: number;
  lastRenderTime: number;
  slowestRenderTime: number;
  renderFrequency: number; // renders per second
}

export interface RenderInsight {
  type: 'info' | 'warning' | 'critical';
  message: string;
  component: string;
  metrics?: Partial<ComponentRenderMetrics>;
  recommendation?: string;
}

class RenderAnalyzer {
  private startTime: number = Date.now();
  private insights: RenderInsight[] = [];
  private lastAnalysisTime: number = 0;
  private isEnabled: boolean = process.env.NODE_ENV === 'development';
  
  constructor() {
    // Set up interval for periodic analysis
    if (this.isEnabled) {
      setInterval(() => this.analyzeRenderMetrics(), 10000); // Every 10 seconds
    }
  }
  
  /**
   * Analyze component render metrics to generate insights
   */
  public analyzeRenderMetrics(): RenderInsight[] {
    if (!this.isEnabled) return [];
    
    // Check if we need to analyze (throttle to avoid too frequent analysis)
    const now = Date.now();
    if (now - this.lastAnalysisTime < 5000) { // At least 5s between analysis
      return this.insights;
    }
    
    this.lastAnalysisTime = now;
    this.insights = [];
    
    // Get metrics from performance monitor
    const metrics = performanceMonitor.getAllMetrics();
    const totalElapsedSeconds = (now - this.startTime) / 1000;
    
    Object.entries(metrics).forEach(([componentName, metric]) => {
      // Skip if missing key metrics
      if (!metric.renderTimes || !metric.averageRenderTime) return;
      
      const renderCount = metric.renderTimes.length;
      const averageRenderTime = metric.averageRenderTime;
      const lastRenderTime = metric.lastRenderTime || 0;
      
      // Calculate render frequency (renders per second)
      const renderFrequency = renderCount / Math.max(1, totalElapsedSeconds);
      
      // Find slowest render time
      const slowestRenderTime = Math.max(...(metric.renderTimes || [0]));
      
      // Collect component metrics
      const componentMetrics: ComponentRenderMetrics = {
        componentName,
        renderCount,
        averageRenderTime,
        lastRenderTime,
        slowestRenderTime,
        renderFrequency
      };
      
      // Generate insights based on metrics
      this.generateInsightsForComponent(componentMetrics);
    });
    
    return this.insights;
  }
  
  /**
   * Generate insights for a specific component based on its metrics
   */
  private generateInsightsForComponent(metrics: ComponentRenderMetrics): void {
    const { componentName, renderCount, averageRenderTime, slowestRenderTime, renderFrequency } = metrics;
    
    // Check for frequent renders (more than 3 per second is suspicious)
    if (renderFrequency > 3) {
      this.insights.push({
        type: renderFrequency > 10 ? 'critical' : 'warning',
        message: `High render frequency: ${renderFrequency.toFixed(1)} renders/second`,
        component: componentName,
        metrics,
        recommendation: 'Consider using React.memo() or checking for unnecessary state updates'
      });
    }
    
    // Check for slow average render times (more than 16ms is slow - below 60fps)
    if (averageRenderTime > 16) {
      this.insights.push({
        type: averageRenderTime > 50 ? 'critical' : 'warning',
        message: `Slow average render time: ${averageRenderTime.toFixed(2)}ms`,
        component: componentName,
        metrics,
        recommendation: 'Optimize render function or reduce complexity'
      });
    }
    
    // Check for very slow individual renders (more than 100ms)
    if (slowestRenderTime > 100) {
      this.insights.push({
        type: 'warning',
        message: `Extremely slow render detected: ${slowestRenderTime.toFixed(2)}ms`,
        component: componentName,
        metrics,
        recommendation: 'Check for expensive operations in render method'
      });
    }
    
    // Add custom insights if available from performance monitor
    const fullMetrics = performanceMonitor.getComponentMetrics(componentName);
    
    // Note: customInsights is a new field that would be added to PerformanceMetrics
    // We need to handle it safely in case it doesn't exist yet
    const customInsights = (fullMetrics as any).customInsights;
    if (customInsights && Array.isArray(customInsights)) {
      customInsights.forEach(insight => {
        this.insights.push({
          ...insight,
          component: componentName
        });
      });
    }
  }
  
  /**
   * Get insights for a specific component
   */
  public getInsightsForComponent(componentName: string): RenderInsight[] {
    return this.insights.filter(insight => insight.component === componentName);
  }
  
  /**
   * Get critical insights across all components
   */
  public getCriticalInsights(): RenderInsight[] {
    return this.insights.filter(insight => insight.type === 'critical');
  }
  
  /**
   * Get all insights
   */
  public getAllInsights(): RenderInsight[] {
    return [...this.insights];
  }
  
  /**
   * Add a custom insight
   */
  public addCustomInsight(insight: RenderInsight): void {
    this.insights.push(insight);
  }
  
  /**
   * Clear all insights
   */
  public clearInsights(): void {
    this.insights = [];
  }
  
  /**
   * Enable or disable the analyzer
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled && process.env.NODE_ENV === 'development';
  }
}

// Create singleton instance
export const renderAnalyzer = new RenderAnalyzer();

export default renderAnalyzer;
