
/**
 * RenderCostAnalyzer - A utility for tracking and analyzing component render costs
 * Helps identify and prevent performance issues
 */

// Interface for component render metrics
interface RenderMetrics {
  componentName: string;
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  lastRenderTime: number;
  firstRenderTime: number;
  props: Record<string, unknown>;
  warnings: string[];
}

// Global metrics storage
const renderMetrics: Record<string, RenderMetrics> = {};

// Thresholds for warnings
const RENDER_TIME_WARNING_THRESHOLD = 16; // ms (60fps)
const RENDER_COUNT_WARNING_THRESHOLD = 10; // in 5 seconds
const RENDER_INTERVAL_WARNING_THRESHOLD = 100; // ms

// Last warning time to prevent spam
let lastWarningTime = 0;
const WARNING_THROTTLE = 5000; // ms

/**
 * Track a component render and measure its performance
 * @param componentName The name of the component
 * @param props The props passed to the component
 * @returns A cleanup function to call when the render is complete
 */
export function trackComponentRender(
  componentName: string,
  props: Record<string, unknown> = {}
): () => void {
  // Skip in production
  if (process.env.NODE_ENV === 'production') {
    return () => {};
  }
  
  const startTime = performance.now();
  const now = Date.now();
  
  // Initialize metrics for new component
  if (!renderMetrics[componentName]) {
    renderMetrics[componentName] = {
      componentName,
      renderCount: 0,
      totalRenderTime: 0,
      averageRenderTime: 0,
      lastRenderTime: 0,
      firstRenderTime: startTime,
      props: {},
      warnings: []
    };
  }
  
  const metrics = renderMetrics[componentName];
  
  // Check for rapid re-renders
  if (metrics.lastRenderTime > 0) {
    const timeSinceLastRender = now - metrics.lastRenderTime;
    if (timeSinceLastRender < RENDER_INTERVAL_WARNING_THRESHOLD) {
      addWarning(metrics, `Rapid re-render detected (${timeSinceLastRender}ms since last render)`);
    }
  }
  
  // Update render count
  metrics.renderCount++;
  
  // Store props for debugging
  metrics.props = { ...props };
  
  // Store last render timestamp
  metrics.lastRenderTime = now;
  
  // Return cleanup function that records render time
  return () => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Update metrics
    metrics.totalRenderTime += renderTime;
    metrics.averageRenderTime = metrics.totalRenderTime / metrics.renderCount;
    
    // Check for slow renders
    if (renderTime > RENDER_TIME_WARNING_THRESHOLD) {
      addWarning(metrics, `Slow render detected (${renderTime.toFixed(2)}ms)`);
    }
    
    // Check for excessive renders
    if (metrics.renderCount > RENDER_COUNT_WARNING_THRESHOLD) {
      const timeWindow = now - (metrics.firstRenderTime || 0);
      if (timeWindow < 5000) { // 5 seconds
        addWarning(metrics, `Excessive renders detected (${metrics.renderCount} renders in ${(timeWindow / 1000).toFixed(1)}s)`);
      }
    }
  };
}

/**
 * Add a warning to the component metrics
 * @param metrics The component metrics
 * @param message The warning message
 */
function addWarning(metrics: RenderMetrics, message: string): void {
  // Throttle warnings to prevent console spam
  const now = Date.now();
  if (now - lastWarningTime < WARNING_THROTTLE) {
    return;
  }
  
  lastWarningTime = now;
  
  // Add warning to metrics
  metrics.warnings.push(message);
  
  // Log warning to console
  console.warn(
    `[RenderCostAnalyzer] ${message} in ${metrics.componentName}:`,
    {
      component: metrics.componentName,
      renderCount: metrics.renderCount,
      averageRenderTime: `${metrics.averageRenderTime.toFixed(2)}ms`,
      props: metrics.props
    }
  );
}

/**
 * Get all component render metrics
 * @returns A record of all component render metrics
 */
export function getAllRenderMetrics(): Record<string, RenderMetrics> {
  return { ...renderMetrics };
}

/**
 * Get render metrics for a specific component
 * @param componentName The name of the component
 * @returns The component's render metrics or null if not found
 */
export function getComponentRenderMetrics(componentName: string): RenderMetrics | null {
  return renderMetrics[componentName] || null;
}

/**
 * Reset all render metrics
 */
export function resetRenderMetrics(): void {
  Object.keys(renderMetrics).forEach(key => {
    delete renderMetrics[key];
  });
}

/**
 * Reset render metrics for a specific component
 * @param componentName The name of the component
 */
export function resetComponentRenderMetrics(componentName: string): void {
  if (renderMetrics[componentName]) {
    delete renderMetrics[componentName];
  }
}

/**
 * Create a React HOC that tracks render performance
 * @param Component The component to wrap
 * @param componentName Optional custom name for the component
 * @returns A wrapped component with render tracking
 */
export function withRenderTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
): React.FC<P> {
  const displayName = componentName || Component.displayName || Component.name || 'UnknownComponent';
  
  const WrappedComponent: React.FC<P> = (props) => {
    const endTracking = trackComponentRender(displayName, props as Record<string, unknown>);
    
    React.useEffect(() => {
      return endTracking;
    });
    
    return <Component {...props} />;
  };
  
  WrappedComponent.displayName = `WithRenderTracking(${displayName})`;
  
  return WrappedComponent;
}
