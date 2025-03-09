
import { RenderFrequency } from '@/utils/performanceUtils';
import { performanceMonitor } from './performanceMonitor';

export interface RenderAnalysis {
  lastRenderTime: number;
  renderFrequency: RenderFrequency;
  possibleOptimizations: string[];
  isProblematic: boolean;
  renderScore: number;
}

interface ComponentRenderData {
  componentName: string;
  renderTime: number;
  renderCount: number;
}

export class RenderAnalyzer {
  private static instance: RenderAnalyzer;
  private analysisCache: Map<string, RenderAnalysis> = new Map();
  private renderThresholds = {
    normal: 16, // 60fps
    warning: 33, // 30fps
    critical: 50 // 20fps
  };

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): RenderAnalyzer {
    if (!RenderAnalyzer.instance) {
      RenderAnalyzer.instance = new RenderAnalyzer();
    }
    return RenderAnalyzer.instance;
  }

  public analyzeComponent(data: ComponentRenderData): RenderAnalysis {
    if (!data || typeof data !== 'object') {
      // Return a default analysis if data is invalid
      return this.createDefaultAnalysis();
    }
    
    const componentName = data.componentName || 'unknown';
    const renderTime = typeof data.renderTime === 'number' ? data.renderTime : 0;
    const renderCount = typeof data.renderCount === 'number' ? data.renderCount : 0;
    
    // Get stored metrics for this component if available
    const componentMetrics = performanceMonitor.getComponentMetrics(componentName);
    
    // Determine render frequency classification
    let renderFrequency: RenderFrequency = RenderFrequency.NORMAL;
    
    if (componentMetrics && typeof componentMetrics === 'object') {
      const averageRenderTime = typeof componentMetrics.averageRenderTime === 'number' ? 
        componentMetrics.averageRenderTime : renderTime;
      const totalRenderCount = typeof componentMetrics.renderCount === 'number' ? 
        componentMetrics.renderCount : renderCount;
      
      if (totalRenderCount > 100 || (totalRenderCount > 30 && averageRenderTime > this.renderThresholds.warning)) {
        renderFrequency = RenderFrequency.EXCESSIVE;
      } else if (totalRenderCount > 50 || (totalRenderCount > 15 && averageRenderTime > this.renderThresholds.normal)) {
        renderFrequency = RenderFrequency.FREQUENT;
      }
    }
    
    // Generate optimization suggestions
    const optimizations: string[] = [];
    
    if (renderTime > this.renderThresholds.critical) {
      optimizations.push('Critical: This component's render time is very high. Consider breaking it into smaller components.');
    }
    
    if (renderFrequency === RenderFrequency.EXCESSIVE) {
      optimizations.push('Use React.memo to prevent unnecessary re-renders.');
      optimizations.push('Check for changing object/array references in props or state.');
    }
    
    if (renderFrequency === RenderFrequency.FREQUENT || renderTime > this.renderThresholds.warning) {
      optimizations.push('Consider using useMemo for expensive calculations.');
      optimizations.push('Optimize or debounce event handlers with useCallback.');
    }
    
    if (renderTime > this.renderThresholds.normal) {
      optimizations.push('Review child components for potential optimization.');
    }
    
    // Calculate a render score (lower is better)
    const renderScore = (renderTime / this.renderThresholds.normal) * 
      (renderFrequency === RenderFrequency.EXCESSIVE ? 3 : 
        renderFrequency === RenderFrequency.FREQUENT ? 2 : 1);
    
    const analysis: RenderAnalysis = {
      lastRenderTime: renderTime,
      renderFrequency,
      possibleOptimizations: optimizations,
      isProblematic: renderFrequency !== RenderFrequency.NORMAL || renderTime > this.renderThresholds.warning,
      renderScore
    };
    
    // Cache the analysis
    this.analysisCache.set(componentName, analysis);
    
    return analysis;
  }
  
  private createDefaultAnalysis(): RenderAnalysis {
    return {
      lastRenderTime: 0,
      renderFrequency: RenderFrequency.NORMAL,
      possibleOptimizations: [],
      isProblematic: false,
      renderScore: 0
    };
  }
  
  public clearAnalysisCache(): void {
    this.analysisCache.clear();
  }
  
  public getAllComponentAnalyses(): Map<string, RenderAnalysis> {
    return this.analysisCache;
  }
  
  public getComponentAnalysis(componentName: string): RenderAnalysis | undefined {
    return this.analysisCache.get(componentName);
  }
}
