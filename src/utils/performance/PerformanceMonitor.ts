
/**
 * Performance Monitor class for tracking render times and performance metrics
 */

interface Metric {
  value: number;
  timestamp: number;
  componentName?: string;
  [key: string]: any;
}

interface MetricCategory {
  [metricName: string]: Metric[];
}

export class PerformanceMonitor {
  private metrics: {
    [category: string]: MetricCategory;
  } = {};
  
  private thresholds = {
    render: 16, // ms (target for 60fps)
    interaction: 100, // ms
    animation: 16, // ms
    load: 2000, // ms
  };
  
  private maxSamples = 100;
  private isEnabled = process.env.NODE_ENV !== 'production';
  
  /**
   * Record a performance metric
   * @param category The category of metric (render, load, etc)
   * @param metric The metric data to record
   */
  recordMetric(category: string, metric: Metric | any): void {
    if (!this.isEnabled) return;
    
    // Ensure the category exists
    if (!this.metrics[category]) {
      this.metrics[category] = {};
    }
    
    // Convert plain object to Metric if needed
    const metricObj: Metric = {
      value: typeof metric === 'number' ? metric : metric.value || 0,
      timestamp: Date.now(),
      ...metric
    };
    
    // Determine metric name (default to 'default' if not specified)
    const metricName = metric.name || 'default';
    
    // Ensure the metric array exists
    if (!this.metrics[category][metricName]) {
      this.metrics[category][metricName] = [];
    }
    
    // Add the metric
    this.metrics[category][metricName].push(metricObj);
    
    // Limit the number of samples
    if (this.metrics[category][metricName].length > this.maxSamples) {
      this.metrics[category][metricName].shift();
    }
    
    // Log slow metrics in development
    if (process.env.NODE_ENV === 'development') {
      this.checkThresholds(category, metricObj);
    }
  }
  
  /**
   * Check if a metric exceeds thresholds and log warnings
   */
  private checkThresholds(category: string, metric: Metric): void {
    const threshold = this.thresholds[category as keyof typeof this.thresholds];
    
    if (threshold && metric.value > threshold) {
      const componentInfo = metric.componentName ? ` in ${metric.componentName}` : '';
      console.warn(
        `[Performance] Slow ${category}${componentInfo}: ${metric.value.toFixed(2)}ms ` +
        `(threshold: ${threshold}ms)`
      );
    }
  }
  
  /**
   * Get metrics for a specific category
   * @param category The category to retrieve
   * @param name Optional specific metric name within the category
   */
  getMetrics(category: string, name?: string): any {
    if (!this.metrics[category]) return null;
    
    if (name) {
      return this.metrics[category][name] || null;
    }
    
    return this.metrics[category];
  }
  
  /**
   * Clear all metrics or specific category
   * @param category Optional category to clear
   */
  clearMetrics(category?: string): void {
    if (category) {
      this.metrics[category] = {};
    } else {
      this.metrics = {};
    }
  }
  
  /**
   * Enable or disable the performance monitor
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }
  
  /**
   * Update performance thresholds
   */
  setThresholds(newThresholds: Partial<typeof this.thresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }
  
  /**
   * Get performance report
   */
  getReport(): any {
    const report: any = {};
    
    Object.keys(this.metrics).forEach(category => {
      report[category] = {};
      
      Object.keys(this.metrics[category]).forEach(metricName => {
        const metrics = this.metrics[category][metricName];
        if (metrics.length === 0) return;
        
        // Calculate statistics
        const values = metrics.map(m => m.value);
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length;
        const max = Math.max(...values);
        const min = Math.min(...values);
        
        report[category][metricName] = {
          avg,
          max,
          min,
          count: values.length,
          lastValue: values[values.length - 1]
        };
      });
    });
    
    return report;
  }
  
  /**
   * Report slow render for a component
   */
  reportSlowRender(componentName: string, duration: number): void {
    if (!componentName || typeof duration !== 'number') return;
    
    // Only report if we're in development or if explicitly configured to report in production
    const shouldReportInProduction = false; // Default to false for production
    if (process.env.NODE_ENV === 'production' && !shouldReportInProduction) {
      return;
    }
    
    // Log the slow render for local debugging
    console.warn(`[Performance] Slow render in ${componentName}: ${duration.toFixed(2)}ms`);
    
    // Store in memory for later analysis
    this.recordMetric('slowRender', {
      componentName,
      duration,
      timestamp: Date.now()
    });
  }
}
