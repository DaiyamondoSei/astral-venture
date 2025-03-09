import PerformanceMonitor from './performanceMonitor';

// Updated RenderAnalysis type to include component property
export interface RenderAnalysis {
  component: string;
  renderCount: number;
  averageRenderTime: number;
  lastRenderTime: number;
  renderFrequency: RenderFrequency;
  suggestion: string;
}

export enum RenderFrequency {
  NORMAL = 'normal',
  FREQUENT = 'frequent',
  EXCESSIVE = 'excessive',
}

export interface RenderAnalyzerConfig {
  thresholdFrequentRenders: number;
  thresholdExcessiveRenders: number;
  thresholdSlowRenderTime: number;
}

export class RenderAnalyzer {
  private config: RenderAnalyzerConfig;

  constructor(config: RenderAnalyzerConfig = {
    thresholdFrequentRenders: 10,
    thresholdExcessiveRenders: 20,
    thresholdSlowRenderTime: 30,
  }) {
    this.config = config;
  }

  analyzeRender(componentName: string): RenderAnalysis | null {
    const performanceMonitor = PerformanceMonitor.getInstance();
    const metrics = performanceMonitor.getComponentMetrics(componentName);

    if (!metrics) {
      return null;
    }

    let renderFrequency = RenderFrequency.NORMAL;
    let suggestion = '';

    if (metrics.renderCount > this.config.thresholdExcessiveRenders) {
      renderFrequency = RenderFrequency.EXCESSIVE;
      suggestion = 'Consider using React.memo or useMemo to prevent unnecessary renders';
    } else if (metrics.renderCount > this.config.thresholdFrequentRenders) {
      renderFrequency = RenderFrequency.FREQUENT;
      suggestion = 'Check if this component can be optimized with useMemo or useCallback';
    }

    if (metrics.averageRenderTime > this.config.thresholdSlowRenderTime) {
      renderFrequency = RenderFrequency.EXCESSIVE;
      suggestion += suggestion ? '. Also, c' : 'C';
      suggestion += 'onsider optimizing the render function or splitting into smaller components';
    }

    if (renderFrequency === RenderFrequency.NORMAL) {
      return null;
    }

    return {
      component: componentName,
      renderCount: metrics.renderCount,
      averageRenderTime: metrics.averageRenderTime,
      lastRenderTime: metrics.lastRenderTime,
      renderFrequency,
      suggestion
    };
  }

  findComponentsWithPerformanceIssues(): RenderAnalysis[] {
    const performanceMonitor = PerformanceMonitor.getInstance();
    const allMetrics = performanceMonitor.getComponentMetrics();
    
    return Object.keys(allMetrics)
      .map(componentName => {
        const metrics = allMetrics[componentName];
        
        // Skip components with very few renders
        if (metrics.renderCount < 3) return null;
        
        let renderFrequency = RenderFrequency.NORMAL;
        let suggestion = '';
        
        // Analyze render frequency
        if (metrics.renderCount > 20) {
          renderFrequency = RenderFrequency.EXCESSIVE;
          suggestion = 'Consider using React.memo or useMemo to prevent unnecessary renders';
        } else if (metrics.renderCount > 10) {
          renderFrequency = RenderFrequency.FREQUENT;
          suggestion = 'Check if this component can be optimized with useMemo or useCallback';
        }
        
        // Add render time analysis
        if (metrics.averageRenderTime > 30) {
          renderFrequency = RenderFrequency.EXCESSIVE;
          suggestion += suggestion ? '. Also, c' : 'C';
          suggestion += 'onsider optimizing the render function or splitting into smaller components';
        }
        
        // Only return components with performance issues
        if (renderFrequency !== RenderFrequency.NORMAL) {
          return {
            component: componentName,
            renderCount: metrics.renderCount,
            averageRenderTime: metrics.averageRenderTime,
            lastRenderTime: metrics.lastRenderTime,
            renderFrequency,
            suggestion
          };
        }
        
        return null;
      })
      .filter(Boolean) as RenderAnalysis[];
  }

  getRenderAnalysis(componentName: string): RenderAnalysis | null {
    const performanceMonitor = PerformanceMonitor.getInstance();
    const metrics = performanceMonitor.getComponentMetrics(componentName);

    if (!metrics) {
      return null;
    }

    let renderFrequency = RenderFrequency.NORMAL;
    let suggestion = '';

    if (metrics.renderCount > this.config.thresholdExcessiveRenders) {
      renderFrequency = RenderFrequency.EXCESSIVE;
      suggestion = 'Consider using React.memo or useMemo to prevent unnecessary renders';
    } else if (metrics.renderCount > this.config.thresholdFrequentRenders) {
      renderFrequency = RenderFrequency.FREQUENT;
      suggestion = 'Check if this component can be optimized with useMemo or useCallback';
    }

    if (metrics.averageRenderTime > this.config.thresholdSlowRenderTime) {
      renderFrequency = RenderFrequency.EXCESSIVE;
      suggestion += suggestion ? '. Also, c' : 'C';
      suggestion += 'onsider optimizing the render function or splitting into smaller components';
    }

    if (renderFrequency === RenderFrequency.NORMAL) {
      return null;
    }

    return {
      component: componentName,
      renderCount: metrics.renderCount,
      averageRenderTime: metrics.averageRenderTime,
      lastRenderTime: metrics.lastRenderTime,
      renderFrequency,
      suggestion
    };
  }
}

// Use proper TypeScript export syntax for types
export type { RenderAnalysis };
