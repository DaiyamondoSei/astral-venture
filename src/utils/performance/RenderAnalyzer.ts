
import { performanceMonitor } from './performanceMonitor';
import { RenderFrequency, calculateRenderFrequency } from '@/utils/performanceUtils';

// Define the interface for component render analysis
export interface RenderAnalysis {
  componentName: string;
  renderCount: number;
  averageRenderTime: number;
  lastRenderTime: number;
  maxRenderTime?: number;
  minRenderTime?: number;
  renderFrequency: RenderFrequency;
  possibleOptimizations?: string[];
  isOptimizable: boolean;
}

// Interface for render metrics
export interface RenderMetrics {
  componentName: string;
  renderTime: number;
  renderCount: number;
  props?: Record<string, any>;
  state?: Record<string, any>;
}

export class RenderAnalyzer {
  private static instance: RenderAnalyzer;
  private analyzedComponents: Map<string, RenderAnalysis> = new Map();
  private timeWindow: number = 10000; // 10 seconds window for frequency analysis

  private constructor() {}

  public static getInstance(): RenderAnalyzer {
    if (!RenderAnalyzer.instance) {
      RenderAnalyzer.instance = new RenderAnalyzer();
    }
    return RenderAnalyzer.instance;
  }

  /**
   * Analyze the render metrics for a component
   */
  public analyzeComponent(metrics: RenderMetrics): RenderAnalysis {
    // Get existing component analysis or create new one
    const existingAnalysis = this.analyzedComponents.get(metrics.componentName);
    
    // Get performance metrics from monitor
    const perfMetrics = PerformanceMonitor.getInstance().getComponentMetrics(metrics.componentName);
    
    // Calculate render frequency
    const renderFrequency = calculateRenderFrequency(
      metrics.renderCount, 
      this.timeWindow
    );
    
    // Determine possible optimizations
    const possibleOptimizations = this.determinePossibleOptimizations(
      metrics,
      renderFrequency,
      perfMetrics
    );
    
    // Create updated analysis
    const analysis: RenderAnalysis = {
      componentName: metrics.componentName,
      renderCount: metrics.renderCount,
      averageRenderTime: perfMetrics?.averageRenderTime || metrics.renderTime,
      lastRenderTime: metrics.renderTime,
      maxRenderTime: perfMetrics?.maxRenderTime || metrics.renderTime,
      minRenderTime: perfMetrics?.minRenderTime || metrics.renderTime,
      renderFrequency,
      possibleOptimizations,
      isOptimizable: possibleOptimizations.length > 0
    };
    
    // Update analyzed components map
    this.analyzedComponents.set(metrics.componentName, analysis);
    
    return analysis;
  }
  
  /**
   * Batch analyze multiple components
   */
  public batchAnalyze(metricsArray: RenderMetrics[]): Map<string, RenderAnalysis> {
    metricsArray.forEach(metrics => this.analyzeComponent(metrics));
    return this.analyzedComponents;
  }
  
  /**
   * Get analysis for a specific component
   */
  public getComponentAnalysis(componentName: string): RenderAnalysis | undefined {
    return this.analyzedComponents.get(componentName);
  }
  
  /**
   * Get all components that might need optimization
   */
  public getOptimizableCandidates(): RenderAnalysis[] {
    return Array.from(this.analyzedComponents.values())
      .filter(analysis => analysis.isOptimizable);
  }
  
  /**
   * Determine possible optimizations for a component
   */
  private determinePossibleOptimizations(
    metrics: RenderMetrics,
    frequency: RenderFrequency,
    perfMetrics?: any
  ): string[] {
    const optimizations: string[] = [];
    
    // Check for excessive renders
    if (frequency === RenderFrequency.EXCESSIVE) {
      optimizations.push('Use React.memo or shouldComponentUpdate to prevent unnecessary renders');
    }
    
    // Check for slow render times
    if (perfMetrics?.averageRenderTime > 16) { // 60fps threshold
      optimizations.push('Optimize render method or split into smaller components');
    }
    
    // Check for large props or state
    if (metrics.props && Object.keys(metrics.props).length > 20) {
      optimizations.push('Consider reducing the number of props passed to this component');
    }
    
    return optimizations;
  }
}

// Export singleton instance
export const renderAnalyzer = RenderAnalyzer.getInstance();
