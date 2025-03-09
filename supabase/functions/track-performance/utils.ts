
interface PerformanceMetric {
  componentName: string;
  averageRenderTime: number;
  renderCount: number;
  slowRenders: number;
  timestamp: string;
}

// Validate and normalize performance metrics
export function validatePerformanceMetrics(metrics: any[]): PerformanceMetric[] {
  if (!Array.isArray(metrics)) {
    throw new Error('Metrics must be an array');
  }
  
  return metrics
    .filter(metric => {
      // Basic validation
      if (!metric || typeof metric !== 'object') return false;
      if (!metric.componentName || typeof metric.componentName !== 'string') return false;
      if (typeof metric.averageRenderTime !== 'number' || isNaN(metric.averageRenderTime)) return false;
      if (typeof metric.renderCount !== 'number' || isNaN(metric.renderCount)) return false;
      
      return true;
    })
    .map(metric => ({
      componentName: metric.componentName,
      averageRenderTime: Number(metric.averageRenderTime.toFixed(2)), // Round to 2 decimal places
      renderCount: metric.renderCount,
      slowRenders: metric.slowRenders || 0,
      timestamp: metric.timestamp || new Date().toISOString()
    }));
}

// Calculate performance insights based on metrics
export function calculatePerformanceInsights(metrics: PerformanceMetric[]) {
  if (metrics.length === 0) {
    return { insights: [] };
  }
  
  // Sort components by average render time (slowest first)
  const sortedByTime = [...metrics].sort((a, b) => b.averageRenderTime - a.averageRenderTime);
  
  // Sort components by render count (most renders first)
  const sortedByCount = [...metrics].sort((a, b) => b.renderCount - a.renderCount);
  
  // Find components with potential issues
  const slowComponents = sortedByTime.filter(m => m.averageRenderTime > 16.67); // Slower than 60fps
  const frequentRenders = sortedByCount.filter(m => m.renderCount > 5 && m.averageRenderTime > 5);
  
  // Generate insights
  const insights = [];
  
  if (slowComponents.length > 0) {
    insights.push({
      type: 'performance',
      severity: 'warning',
      message: `${slowComponents.length} component(s) have slow render times (>16.67ms)`,
      details: slowComponents.slice(0, 3).map(m => 
        `${m.componentName}: ${m.averageRenderTime.toFixed(1)}ms average (${m.renderCount} renders)`
      )
    });
  }
  
  if (frequentRenders.length > 0) {
    insights.push({
      type: 'performance',
      severity: 'info',
      message: `${frequentRenders.length} component(s) re-render frequently`,
      details: frequentRenders.slice(0, 3).map(m => 
        `${m.componentName}: ${m.renderCount} renders (${m.averageRenderTime.toFixed(1)}ms average)`
      )
    });
  }
  
  // Overall performance score (0-100)
  let performanceScore = 100;
  
  // Deduct points for each slow component
  performanceScore -= Math.min(50, slowComponents.length * 5);
  
  // Deduct points for frequent renders
  performanceScore -= Math.min(30, frequentRenders.length * 3);
  
  return {
    insights,
    performanceScore: Math.max(0, Math.min(100, performanceScore)),
    worstPerformers: sortedByTime.slice(0, 5),
    frequentRenders: sortedByCount.slice(0, 5)
  };
}
