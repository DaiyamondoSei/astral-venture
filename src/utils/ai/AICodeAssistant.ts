
import { performanceMonitor } from '@/utils/performance/performanceMonitor';
import { renderAnalyzer } from '@/utils/performance/RenderAnalyzer';

// Simple implementation of AICodeAssistant to resolve imports
class AICodeAssistant {
  analyzePerformance() {
    const metrics = performanceMonitor.getAllMetrics();
    return {
      componentCount: Object.keys(metrics).length,
      hasPerformanceIssues: Object.values(metrics).some(m => m.averageRenderTime > 16),
      slowestComponents: Object.values(metrics)
        .sort((a, b) => b.averageRenderTime - a.averageRenderTime)
        .slice(0, 3)
        .map(m => ({
          name: m.componentName,
          renderTime: m.averageRenderTime
        }))
    };
  }
  
  getSuggestions() {
    return renderAnalyzer.findComponentsWithPerformanceIssues()
      .map(component => {
        const analysis = renderAnalyzer.analyzeComponent(component);
        return {
          componentName: component.componentName,
          suggestions: analysis.possibleOptimizations
        };
      });
  }
}

export const aiCodeAssistant = new AICodeAssistant();
